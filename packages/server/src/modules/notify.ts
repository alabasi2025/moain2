import { ulid, type Role } from '@moain/shared';
import { Hono } from 'hono';
import type { AppEnv, AuthCtx } from '../env';
import { authOf } from '../lib/auth';
import { okJson } from '../lib/http';

/**
 * In-app notifications (02-screen-map §4). Recipients = users holding one of `roles`
 * either tenant-wide or scoped to `locationId`.
 */
export async function notify(a: Pick<AuthCtx, 'db' | 'tenantId'>, roles: Role[], locationId: string | null, kind: string, title: string, body: string | null, payload: Record<string, unknown>) {
  const users = await a.db.all<{ id: string }>(
    `SELECT DISTINCT u.id FROM users u JOIN user_roles r ON r.user_id = u.id
     WHERE u.tenant_id = ? AND u.is_active = 1 AND r.role IN (SELECT value FROM json_each(?)) AND (r.location_id IS NULL OR r.location_id = ?)`,
    a.tenantId, JSON.stringify(roles), locationId);
  if (!users.length) return;
  await a.db.batch(users.map((u) => a.db.prep(
    `INSERT INTO notifications (id, tenant_id, user_id, kind, title_ar, body_ar, payload) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ulid(), a.tenantId, u.id, kind, title, body, JSON.stringify(payload))));
}

export const notifications = new Hono<AppEnv>();
notifications.get('/notifications', async (c) => {
  const a = authOf(c);
  const rows = await a.db.all(`SELECT id, kind, title_ar, body_ar, payload, read_at, created_at FROM notifications WHERE tenant_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 50`, a.tenantId, a.userId);
  const unread = await a.db.first<{ n: number }>(`SELECT COUNT(*) n FROM notifications WHERE tenant_id = ? AND user_id = ? AND read_at IS NULL`, a.tenantId, a.userId);
  return okJson(c, { items: rows, unread: unread?.n ?? 0 });
});
notifications.post('/notifications/read-all', async (c) => {
  const a = authOf(c);
  await a.db.run(`UPDATE notifications SET read_at = ? WHERE tenant_id = ? AND user_id = ? AND read_at IS NULL`, new Date().toISOString(), a.tenantId, a.userId);
  return okJson(c, { ok: true });
});
