import { LoginInput, PinInput, SetPinInput, ulid, can, navFor, type Role, type RoleGrant } from '@moain/shared';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import type { AppEnv } from '../env';
import { SESSION_COOKIE, SESSION_DAYS, requireAuth, authOf } from '../lib/auth';
import { hashSecret, randomHex, verifySecret } from '../lib/crypto';
import { Db } from '../lib/db';
import { Fail, okJson, parseBody } from '../lib/http';

const PIN_MAX = 5;           // A6
const PIN_LOCK_MIN = 15;
const PIN_REVOKE_TOTAL = 15; // after 15 total failures the device is revoked

export const auth = new Hono<AppEnv>();
const pepper = (env: AppEnv['Bindings']) => env.PEPPER ?? 'moain-dev-pepper';

async function createSession(d1: D1Database, userId: string, deviceId: string | null): Promise<string> {
  const sid = randomHex(32);
  const exp = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  await d1.batch([
    d1.prepare(`INSERT INTO sessions (id, user_id, device_id, expires_at) VALUES (?, ?, ?, ?)`).bind(sid, userId, deviceId, exp),
    d1.prepare(`UPDATE users SET last_login_at = ? WHERE id = ?`).bind(new Date().toISOString(), userId),
  ]);
  return sid;
}

function setSid(c: Parameters<typeof setCookie>[0], sid: string) {
  const secure = new URL(c.req.url).protocol === 'https:';
  setCookie(c, SESSION_COOKIE, sid, { httpOnly: true, secure, sameSite: 'Lax', path: '/', maxAge: SESSION_DAYS * 86400 });
}

async function bumpAttempt(d1: D1Database, key: string): Promise<{ fail_count: number; total_fails: number }> {
  const now = new Date();
  const lock = new Date(now.getTime() + PIN_LOCK_MIN * 60000).toISOString();
  const r = await d1.prepare(
    `INSERT INTO auth_attempts (key, fail_count, total_fails, window_start) VALUES (?, 1, 1, ?)
     ON CONFLICT (key) DO UPDATE SET fail_count = fail_count + 1, total_fails = total_fails + 1,
       locked_until = CASE WHEN fail_count + 1 >= ${PIN_MAX} THEN ? ELSE locked_until END
     RETURNING fail_count, total_fails`,
  ).bind(key, now.toISOString(), lock).first<{ fail_count: number; total_fails: number }>();
  return r ?? { fail_count: 1, total_fails: 1 };
}

async function assertNotLocked(d1: D1Database, key: string) {
  const r = await d1.prepare(`SELECT locked_until FROM auth_attempts WHERE key = ?`).bind(key).first<{ locked_until: string | null }>();
  if (r?.locked_until && r.locked_until > new Date().toISOString()) {
    const mins = Math.ceil((Date.parse(r.locked_until) - Date.now()) / 60000);
    throw new Fail(429, 'RATE_LIMITED', `محاولات كثيرة — حاول بعد ${mins} دقيقة`, { retryInMinutes: mins });
  }
}

const clearAttempts = (d1: D1Database, key: string) => d1.prepare(`DELETE FROM auth_attempts WHERE key = ?`).bind(key).run();

/** Public tenant branding for the login screen (G5). */
auth.get('/tenant/:slug', async (c) => {
  const t = await c.env.DB.prepare(
    `SELECT t.slug, b.company_name, b.logo_url, b.primary_color, b.accent_color FROM tenants t JOIN tenant_branding b ON b.tenant_id = t.id WHERE t.slug = ? AND t.status = 'active'`,
  ).bind(c.req.param('slug')).first();
  if (!t) throw new Fail(404, 'NOT_FOUND', 'الشركة غير موجودة');
  return okJson(c, t);
});

auth.post('/login', async (c) => {
  const input = await parseBody(c, LoginInput);
  const d1 = c.env.DB;
  const key = `login:${input.tenant}:${input.identifier.toLowerCase()}`;
  await assertNotLocked(d1, key);
  const u = await d1.prepare(
    `SELECT u.id, u.tenant_id, u.password_hash, u.is_active, u.pin_hash FROM users u JOIN tenants t ON t.id = u.tenant_id
     WHERE t.slug = ? AND (lower(u.email) = lower(?) OR u.phone = ?)`,
  ).bind(input.tenant, input.identifier, input.identifier).first<{ id: string; tenant_id: string; password_hash: string | null; is_active: number; pin_hash: string | null }>();
  if (!u || u.is_active !== 1 || !(await verifySecret(input.password, u.password_hash, pepper(c.env)))) {
    await bumpAttempt(d1, key);
    throw new Fail(401, 'UNAUTHENTICATED', 'بيانات الدخول غير صحيحة');
  }
  await clearAttempts(d1, key);
  let device = await d1.prepare(`SELECT id FROM trusted_devices WHERE user_id = ? AND device_fingerprint = ? AND revoked_at IS NULL`)
    .bind(u.id, input.deviceFingerprint).first<{ id: string }>();
  const now = new Date().toISOString();
  if (!device) {
    device = { id: ulid() };
    await d1.prepare(`INSERT INTO trusted_devices (id, user_id, device_fingerprint, label, user_agent, last_seen_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(device.id, u.id, input.deviceFingerprint, input.deviceLabel ?? null, c.req.header('user-agent')?.slice(0, 200) ?? null, now).run();
  }
  const sid = await createSession(d1, u.id, device.id);
  await new Db(d1, u.tenant_id).audit(u.id, 'user', u.id, 'login', null, { device_id: device.id }, ulid()).run();
  setSid(c, sid);
  return okJson(c, { deviceId: device.id, hasPin: u.pin_hash !== null });
});

/** Quick unlock from a trusted device (A5, A6). */
auth.post('/pin', async (c) => {
  const input = await parseBody(c, PinInput);
  const d1 = c.env.DB;
  const key = `pin:${input.deviceId}`;
  await assertNotLocked(d1, key);
  const d = await d1.prepare(
    `SELECT d.id, d.user_id, d.revoked_at, u.pin_hash, u.is_active FROM trusted_devices d JOIN users u ON u.id = d.user_id WHERE d.id = ?`,
  ).bind(input.deviceId).first<{ id: string; user_id: string; revoked_at: string | null; pin_hash: string | null; is_active: number }>();
  if (!d || d.revoked_at || d.is_active !== 1 || !d.pin_hash) throw new Fail(401, 'UNAUTHENTICATED', 'هذا الجهاز غير موثوق — ادخل بكلمة المرور', { requirePassword: true });
  if (!(await verifySecret(input.pin + d.user_id, d.pin_hash, pepper(c.env)))) {
    const a = await bumpAttempt(d1, key);
    if (a.total_fails >= PIN_REVOKE_TOTAL) {
      await d1.prepare(`UPDATE trusted_devices SET revoked_at = ? WHERE id = ?`).bind(new Date().toISOString(), d.id).run();
      throw new Fail(401, 'UNAUTHENTICATED', 'أُلغي الجهاز لكثرة المحاولات — ادخل بكلمة المرور', { requirePassword: true });
    }
    throw new Fail(401, 'UNAUTHENTICATED', 'الرمز غير صحيح', { remaining: Math.max(0, PIN_MAX - a.fail_count) });
  }
  await clearAttempts(d1, key);
  await d1.prepare(`UPDATE trusted_devices SET last_seen_at = ? WHERE id = ?`).bind(new Date().toISOString(), d.id).run();
  setSid(c, await createSession(d1, d.user_id, d.id));
  return okJson(c, { ok: true });
});

/** Who owns this device — for the PIN screen greeting. */
auth.get('/device/:id', async (c) => {
  const d = await c.env.DB.prepare(
    `SELECT u.full_name, t.slug, (u.pin_hash IS NOT NULL) AS has_pin FROM trusted_devices d JOIN users u ON u.id = d.user_id JOIN tenants t ON t.id = u.tenant_id
     WHERE d.id = ? AND d.revoked_at IS NULL AND u.is_active = 1`,
  ).bind(c.req.param('id')).first<{ full_name: string; slug: string; has_pin: number }>();
  if (!d) throw new Fail(404, 'NOT_FOUND', 'الجهاز غير موثوق');
  return okJson(c, { fullName: d.full_name, tenant: d.slug, hasPin: d.has_pin === 1 });
});

auth.post('/logout', async (c) => {
  const sid = getCookie(c, SESSION_COOKIE);
  if (sid) await c.env.DB.prepare(`DELETE FROM sessions WHERE id = ?`).bind(sid).run();
  deleteCookie(c, SESSION_COOKIE, { path: '/' });
  return okJson(c, { ok: true });
});

auth.use('/me', requireAuth);
auth.get('/me', async (c) => {
  const a = authOf(c);
  const [user, branding, tenant, locations] = await Promise.all([
    a.db.first<{ id: string; full_name: string; email: string | null; phone: string | null; has_pin: number }>(
      `SELECT id, full_name, email, phone, (pin_hash IS NOT NULL) AS has_pin FROM users WHERE id = ? AND tenant_id = ?`, a.userId, a.tenantId),
    a.db.first(`SELECT company_name, company_name_en, logo_url, primary_color, accent_color, footer_text, phone, address FROM tenant_branding WHERE tenant_id = ?`, a.tenantId),
    a.db.first<{ slug: string; name: string }>(`SELECT slug, name FROM tenants WHERE id = ?`, a.tenantId),
    a.db.all<{ id: string; code: string; name_ar: string; kind: string; default_plant_id: string | null }>(
      `SELECT id, code, name_ar, kind, default_plant_id FROM locations WHERE tenant_id = ? AND is_active = 1 ORDER BY kind, sort_order, code`, a.tenantId),
  ]);
  const myLocationIds = a.grants.map((g) => g.location_id).filter((x): x is string => x !== null);
  return okJson(c, {
    user: user && { ...user, has_pin: user.has_pin === 1 },
    tenant,
    branding,
    settings: a.settings,
    grants: a.grants,
    roles: [...new Set(a.grants.map((g: RoleGrant) => g.role))] as Role[],
    nav: navFor(a.grants.map((g) => g.role)),
    canViewCosts: can(a.grants, 'costs:view'),
    locations,
    myLocationIds,
    deviceId: a.deviceId,
  });
});

auth.use('/pin/set', requireAuth);
auth.put('/pin/set', async (c) => {
  const { pin } = await parseBody(c, SetPinInput);
  const a = authOf(c);
  const h = await hashSecret(pin + a.userId, pepper(c.env));
  await a.db.batch([
    a.db.prep(`UPDATE users SET pin_hash = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`, h, new Date().toISOString(), a.userId, a.tenantId),
    a.db.audit(a.userId, 'user', a.userId, 'set_pin', null, null, ulid()),
  ]);
  return okJson(c, { ok: true });
});
