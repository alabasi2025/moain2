import { BrandingInput, LocationInput, SettingsInput, UserInput, WindowInput, ulid } from '@moain/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { authOf, requirePerm } from '../lib/auth';
import { hashSecret } from '../lib/crypto';
import { Fail, notFound, okJson, parseBody } from '../lib/http';

export const admin = new Hono<AppEnv>();
const pepper = (env: AppEnv['Bindings']) => env.PEPPER ?? 'moain-dev-pepper';

/* ─── Locations: branches / plants / warehouses (flexibility #1, #2, #13) ─── */
admin.get('/locations', async (c) => {
  const a = authOf(c);
  const kind = c.req.query('kind') ?? null;
  return okJson(c, await a.db.all(
    `SELECT l.*, p.name_ar AS plant_name, (SELECT COUNT(*) FROM user_roles r WHERE r.location_id = l.id) AS user_count
     FROM locations l LEFT JOIN locations p ON p.id = l.default_plant_id WHERE l.tenant_id = ? AND (? IS NULL OR l.kind = ?) ORDER BY l.kind, l.sort_order, l.code`, a.tenantId, kind, kind));
});
admin.post('/locations', requirePerm('locations:write'), async (c) => {
  const a = authOf(c);
  const i = await parseBody(c, LocationInput);
  if (i.kind === 'branch' && !i.default_plant_id) throw new Fail(422, 'BUSINESS_RULE', 'حدد المعمل الذي يخدم هذا الفرع');
  const id = ulid();
  const max = await a.db.first<{ m: number | null }>(`SELECT MAX(sort_order) m FROM locations WHERE tenant_id = ? AND kind = ?`, a.tenantId, i.kind);
  try {
    await a.db.batch([
      a.db.prep(`INSERT INTO locations (id, tenant_id, code, name_ar, kind, default_plant_id, phone, address, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id, a.tenantId, i.code, i.name_ar, i.kind, i.default_plant_id ?? null, i.phone ?? null, i.address ?? null, (max?.m ?? 0) + 10),
      a.db.audit(a.userId, 'location', id, 'create', null, i, ulid()),
    ]);
  } catch (e) {
    if (String(e).includes('UNIQUE')) throw new Fail(409, 'DUPLICATE', 'الكود مستخدم لموقع آخر');
    throw e;
  }
  return okJson(c, { id }, 201);
});
admin.put('/locations/:id', requirePerm('locations:write'), async (c) => {
  const a = authOf(c);
  const i = await parseBody(c, LocationInput);
  const id = c.req.param('id');
  const before = await a.db.first(`SELECT * FROM locations WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!before) throw notFound('الموقع');
  await a.db.batch([
    a.db.prep(`UPDATE locations SET code = ?, name_ar = ?, default_plant_id = ?, phone = ?, address = ?, is_active = COALESCE(?, is_active) WHERE id = ? AND tenant_id = ?`,
      i.code, i.name_ar, i.default_plant_id ?? null, i.phone ?? null, i.address ?? null, i.is_active === undefined ? null : Number(i.is_active), id, a.tenantId),
    a.db.audit(a.userId, 'location', id, 'update', before, i, ulid()),
  ]);
  return okJson(c, { id });
});

/* ─── Users & roles (A10, A11) ─── */
admin.get('/users', requirePerm('users:write'), async (c) => {
  const a = authOf(c);
  const users = await a.db.all<{ id: string }>(`SELECT id, full_name, email, phone, is_active, last_login_at, (pin_hash IS NOT NULL) AS has_pin FROM users WHERE tenant_id = ? ORDER BY full_name`, a.tenantId);
  const roles = await a.db.all<{ user_id: string; role: string; location_id: string | null; location_name: string | null }>(
    `SELECT r.user_id, r.role, r.location_id, l.name_ar AS location_name FROM user_roles r JOIN users u ON u.id = r.user_id LEFT JOIN locations l ON l.id = r.location_id WHERE u.tenant_id = ?`, a.tenantId);
  return okJson(c, users.map((u) => ({ ...u, roles: roles.filter((r) => r.user_id === u.id) })));
});

async function assertNotLastOwner(a: ReturnType<typeof authOf>, userId: string, keepsOwner: boolean) {
  if (keepsOwner) return;
  const r = await a.db.first<{ n: number; me: number }>(
    `SELECT COUNT(DISTINCT u.id) n, SUM(CASE WHEN u.id = ? THEN 1 ELSE 0 END) me FROM users u JOIN user_roles r ON r.user_id = u.id WHERE u.tenant_id = ? AND r.role = 'owner' AND u.is_active = 1`, userId, a.tenantId);
  if (r && r.me > 0 && r.n <= 1) throw new Fail(409, 'CONFLICT', 'لا يمكن إزالة آخر مالك للنظام', { rule: 'A11' });
}

admin.post('/users', requirePerm('users:write'), async (c) => {
  const a = authOf(c);
  const i = await parseBody(c, UserInput);
  if (!i.email && !i.phone) throw new Fail(422, 'BUSINESS_RULE', 'أدخل البريد أو رقم الجوال للدخول');
  if (!i.password) throw new Fail(422, 'BUSINESS_RULE', 'أدخل كلمة مرور أولية');
  const id = ulid();
  const hash = await hashSecret(i.password, pepper(c.env));
  try {
    await a.db.batch([
      a.db.prep(`INSERT INTO users (id, tenant_id, email, phone, full_name, password_hash) VALUES (?, ?, ?, ?, ?, ?)`, id, a.tenantId, i.email ?? null, i.phone ?? null, i.full_name, hash),
      ...i.roles.map((r) => a.db.prep(`INSERT INTO user_roles (user_id, role, location_id) VALUES (?, ?, ?)`, id, r.role, r.location_id)),
      a.db.audit(a.userId, 'user', id, 'create', null, { full_name: i.full_name, roles: i.roles }, ulid()),
    ]);
  } catch (e) {
    if (String(e).includes('UNIQUE')) throw new Fail(409, 'DUPLICATE', 'البريد أو الجوال مستخدم لمستخدم آخر');
    throw e;
  }
  return okJson(c, { id }, 201);
});

admin.put('/users/:id', requirePerm('users:write'), async (c) => {
  const a = authOf(c);
  const i = await parseBody(c, UserInput);
  const id = c.req.param('id');
  const before = await a.db.first(`SELECT id, full_name, email, phone, is_active FROM users WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!before) throw notFound('المستخدم');
  await assertNotLastOwner(a, id, i.roles.some((r) => r.role === 'owner') && i.is_active !== false);
  const stmts = [
    a.db.prep(`UPDATE users SET full_name = ?, email = ?, phone = ?, is_active = COALESCE(?, is_active), updated_at = ? WHERE id = ? AND tenant_id = ?`,
      i.full_name, i.email ?? null, i.phone ?? null, i.is_active === undefined ? null : Number(i.is_active), new Date().toISOString(), id, a.tenantId),
    a.db.prep(`DELETE FROM user_roles WHERE user_id = ?`, id),
    ...i.roles.map((r) => a.db.prep(`INSERT INTO user_roles (user_id, role, location_id) VALUES (?, ?, ?)`, id, r.role, r.location_id)),
  ];
  if (i.password) stmts.push(a.db.prep(`UPDATE users SET password_hash = ? WHERE id = ? AND tenant_id = ?`, await hashSecret(i.password, pepper(c.env)), id, a.tenantId));
  if (i.is_active === false) stmts.push(a.db.prep(`DELETE FROM sessions WHERE user_id = ?`, id));
  stmts.push(a.db.audit(a.userId, 'user', id, 'update', before, { full_name: i.full_name, roles: i.roles, is_active: i.is_active }, ulid()));
  await a.db.batch(stmts);
  return okJson(c, { id });
});

/* ─── Devices ─── */
admin.get('/devices', async (c) => {
  const a = authOf(c);
  const all = c.req.query('all') === '1';
  return okJson(c, await a.db.all(
    `SELECT d.id, d.label, d.user_agent, d.last_seen_at, d.revoked_at, d.created_at, u.full_name FROM trusted_devices d JOIN users u ON u.id = d.user_id
     WHERE u.tenant_id = ? AND (? = 1 OR d.user_id = ?) ORDER BY d.last_seen_at DESC`, a.tenantId, all ? 1 : 0, a.userId));
});
admin.post('/devices/:id/revoke', async (c) => {
  const a = authOf(c);
  const d = await a.db.first<{ id: string; user_id: string }>(`SELECT d.id, d.user_id FROM trusted_devices d JOIN users u ON u.id = d.user_id WHERE d.id = ? AND u.tenant_id = ?`, c.req.param('id'), a.tenantId);
  if (!d) throw notFound('الجهاز');
  if (d.user_id !== a.userId && !a.grants.some((g) => g.role === 'owner' || g.role === 'admin')) throw new Fail(403, 'FORBIDDEN', 'ليست لديك صلاحية');
  await a.db.batch([
    a.db.prep(`UPDATE trusted_devices SET revoked_at = ? WHERE id = ?`, new Date().toISOString(), d.id),
    a.db.prep(`DELETE FROM sessions WHERE device_id = ?`, d.id),
    a.db.audit(a.userId, 'trusted_device', d.id, 'revoke', null, null, ulid()),
  ]);
  return okJson(c, { id: d.id });
});

/* ─── Order windows (flexibility #5–#7) ─── */
admin.get('/order-windows', async (c) => {
  const a = authOf(c);
  return okJson(c, await a.db.all(`SELECT w.*, l.name_ar AS plant_name FROM order_windows w JOIN locations l ON l.id = w.plant_id WHERE w.tenant_id = ? ORDER BY l.sort_order, w.sort_order`, a.tenantId));
});
admin.post('/order-windows', requirePerm('windows:write'), async (c) => {
  const a = authOf(c);
  const i = await parseBody(c, WindowInput);
  if (i.kind === 'regular' && !i.cutoff_time) throw new Fail(422, 'BUSINESS_RULE', 'حدد وقت الإغلاق للنافذة العادية');
  const id = ulid();
  await a.db.batch([
    a.db.prep(`INSERT INTO order_windows (id, tenant_id, plant_id, name_ar, kind, cutoff_time, delivery_offset_days, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sort_order),0)+10 FROM order_windows WHERE tenant_id = ?))`,
      id, a.tenantId, i.plant_id, i.name_ar, i.kind, i.kind === 'urgent' ? null : i.cutoff_time, i.delivery_offset_days, a.tenantId),
    a.db.audit(a.userId, 'order_window', id, 'create', null, i, ulid()),
  ]);
  return okJson(c, { id }, 201);
});
admin.put('/order-windows/:id', requirePerm('windows:write'), async (c) => {
  const a = authOf(c);
  const i = await parseBody(c, WindowInput);
  const id = c.req.param('id');
  const before = await a.db.first(`SELECT * FROM order_windows WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!before) throw notFound('النافذة');
  await a.db.batch([
    a.db.prep(`UPDATE order_windows SET name_ar = ?, kind = ?, cutoff_time = ?, delivery_offset_days = ?, is_active = COALESCE(?, is_active) WHERE id = ? AND tenant_id = ?`,
      i.name_ar, i.kind, i.kind === 'urgent' ? null : i.cutoff_time, i.delivery_offset_days, i.is_active === undefined ? null : Number(i.is_active), id, a.tenantId),
    a.db.audit(a.userId, 'order_window', id, 'update', before, i, ulid()),
  ]);
  return okJson(c, { id });
});

/* ─── Settings & branding ─── */
admin.put('/tenant/settings', requirePerm('settings:write'), async (c) => {
  const a = authOf(c);
  const i = await parseBody(c, SettingsInput);
  await a.db.batch([
    a.db.prep(`UPDATE tenant_settings SET timezone = ?, currency_code = ?, currency_decimals = ?, numerals = ?, allow_negative_stock = ?, updated_at = ? WHERE tenant_id = ?`,
      i.timezone, i.currency_code, i.currency_decimals, i.numerals, Number(i.allow_negative_stock), new Date().toISOString(), a.tenantId),
    a.db.audit(a.userId, 'tenant_settings', a.tenantId, 'update', a.settings, i, ulid()),
  ]);
  return okJson(c, { ok: true });
});
admin.put('/tenant/branding', requirePerm('settings:write'), async (c) => {
  const a = authOf(c);
  const i = await parseBody(c, BrandingInput);
  if (i.logo_url && !/^data:image\/(png|webp|jpeg);base64,/.test(i.logo_url) && !i.logo_url.startsWith('/')) throw new Fail(400, 'VALIDATION', 'صيغة الشعار غير مدعومة');
  const before = await a.db.first(`SELECT company_name, primary_color, phone, address, footer_text FROM tenant_branding WHERE tenant_id = ?`, a.tenantId);
  await a.db.batch([
    a.db.prep(`UPDATE tenant_branding SET company_name = ?, primary_color = ?, accent_color = COALESCE(?, accent_color), phone = ?, address = ?, footer_text = ?, logo_url = COALESCE(?, logo_url), updated_at = ? WHERE tenant_id = ?`,
      i.company_name, i.primary_color, i.accent_color ?? null, i.phone ?? null, i.address ?? null, i.footer_text ?? null, i.logo_url ?? null, new Date().toISOString(), a.tenantId),
    a.db.prep(`UPDATE tenants SET name = ? WHERE id = ?`, i.company_name, a.tenantId),
    a.db.audit(a.userId, 'tenant_branding', a.tenantId, 'update', before, { ...i, logo_url: i.logo_url ? '[image]' : null }, ulid()),
  ]);
  return okJson(c, { ok: true });
});
admin.get('/uoms', async (c) => {
  const a = authOf(c);
  return okJson(c, await a.db.all(`SELECT id, code, name_ar, decimals FROM uoms WHERE tenant_id = ? ORDER BY code`, a.tenantId));
});

/* ─── Audit (A7, 1.12) ─── */
admin.get('/audit', requirePerm('audit:read'), async (c) => {
  const a = authOf(c);
  const et = c.req.query('entity_type') ?? null;
  const eid = c.req.query('entity_id') ?? null;
  return okJson(c, await a.db.all(
    `SELECT al.id, al.entity_type, al.entity_id, al.action, al.before, al.after, al.at, u.full_name AS actor_name FROM audit_log al LEFT JOIN users u ON u.id = al.actor_id
     WHERE al.tenant_id = ? AND (? IS NULL OR al.entity_type = ?) AND (? IS NULL OR al.entity_id = ?) ORDER BY al.at DESC LIMIT 200`, a.tenantId, et, et, eid, eid));
});
