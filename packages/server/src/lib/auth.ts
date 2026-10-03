import type { RoleGrant } from '@moain/shared';
import { can, type Permission } from '@moain/shared';
import type { Context, MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import type { AppEnv, AuthCtx, TenantSettings } from '../env';
import { Db } from './db';
import { Fail, forbidden } from './http';

export const SESSION_COOKIE = 'sid';
export const SESSION_DAYS = 30;

interface SessionRow {
  id: string; user_id: string; device_id: string | null; expires_at: string;
  tenant_id: string; full_name: string; is_active: number; revoked_at: string | null;
}

/** Session lookup is strongly consistent in D1 (ADR-0012 P3): revoking a device cuts access on the next request. */
export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const sid = getCookie(c, SESSION_COOKIE);
  if (!sid) throw new Fail(401, 'UNAUTHENTICATED', 'يرجى تسجيل الدخول');
  const s = await c.env.DB.prepare(
    `SELECT s.id, s.user_id, s.device_id, s.expires_at, u.tenant_id, u.full_name, u.is_active, d.revoked_at
     FROM sessions s JOIN users u ON u.id = s.user_id LEFT JOIN trusted_devices d ON d.id = s.device_id
     WHERE s.id = ?`,
  ).bind(sid).first<SessionRow>();
  if (!s || s.expires_at < new Date().toISOString() || s.is_active !== 1 || s.revoked_at) {
    throw new Fail(401, 'UNAUTHENTICATED', 'انتهت الجلسة — يرجى الدخول مجدداً');
  }
  const db = new Db(c.env.DB, s.tenant_id);
  const [grants, settings] = await Promise.all([
    db.all<RoleGrant>(`SELECT role, location_id FROM user_roles WHERE user_id = ?`, s.user_id),
    db.first<TenantSettings>(`SELECT * FROM tenant_settings WHERE tenant_id = ?`, s.tenant_id),
  ]);
  if (!settings) throw new Fail(500, 'INTERNAL', 'إعدادات المستأجر مفقودة');
  const auth: AuthCtx = { tenantId: s.tenant_id, userId: s.user_id, userName: s.full_name, sessionId: s.id, deviceId: s.device_id, grants, settings, db };
  c.set('auth', auth);
  await next();
};

export const requirePerm = (perm: Permission): MiddlewareHandler<AppEnv> => async (c, next) => {
  if (!can(c.get('auth').grants, perm)) throw forbidden();
  await next();
};

export function assertCan(c: Context<AppEnv>, perm: Permission, locationId?: string | null): void {
  if (!can(c.get('auth').grants, perm, locationId)) throw forbidden();
}

export const authOf = (c: Context<AppEnv>): AuthCtx => c.get('auth');
