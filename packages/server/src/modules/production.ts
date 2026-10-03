import { AssignInput, CancelInput, OrderMachine, ProductionMachine, isCycleClosed, ulid, windowCycle, type OrderStatus, type ProductionStatus } from '@moain/shared';
import { Hono } from 'hono';
import type { AppEnv, AuthCtx } from '../env';
import { assertCan, authOf, requirePerm } from '../lib/auth';
import { Fail, invalidTransition, notFound, okJson, parseBody } from '../lib/http';
import { notify } from './notify';
import { snapshotProduction } from './ordering';

export const production = new Hono<AppEnv>();

interface PoRow {
  id: string; plant_id: string; window_id: string; delivery_date: string; number: string; status: ProductionStatus;
  assigned_to: string | null; assigned_to_name: string | null; expected_ready_at: string | null; locked_at: string | null;
  started_at: string | null; completed_at: string | null; note: string | null; updated_at: string;
}

interface DemandRow {
  category_id: string; category_name: string; category_sort: number; category_color: string | null; product_id: string; product_code: string; product_name: string;
  product_sort: number; uom_name: string; branch_id: string; branch_code: string; branch_name: string; branch_sort: number; qty: number; line_note: string | null; order_note: string | null; order_id: string; order_status: string;
}

/** Demand matrix (product × branch × total) — one query + in-memory grouping (no N+1). Shape = production_snapshots.demand_matrix. */
export async function buildDemand(a: Pick<AuthCtx, 'db' | 'tenantId'>, poId: string) {
  const rows = await a.db.all<DemandRow>(
    `SELECT c.id AS category_id, c.name_ar AS category_name, c.sort_order AS category_sort, c.color AS category_color, p.id AS product_id, p.code AS product_code, p.name_ar AS product_name, p.sort_order AS product_sort,
            u.name_ar AS uom_name, o.branch_id, l.code AS branch_code, l.name_ar AS branch_name, l.sort_order AS branch_sort, ol.qty, ol.note AS line_note, o.note AS order_note, o.id AS order_id, o.status AS order_status
     FROM orders o JOIN order_lines ol ON ol.order_id = o.id JOIN products p ON p.id = ol.product_id JOIN categories c ON c.id = p.category_id
     JOIN uoms u ON u.id = p.uom_id JOIN locations l ON l.id = o.branch_id
     WHERE o.production_order_id = ? AND o.tenant_id = ? AND o.status NOT IN ('draft','cancelled')
     ORDER BY c.sort_order, p.sort_order, p.name_ar`, poId, a.tenantId);
  const branches = new Map<string, { id: string; code: string; name: string; sort: number }>();
  const cats = new Map<string, { id: string; name: string; color: string | null; products: Map<string, { id: string; code: string; name: string; uom: string; total: number; by_branch: Record<string, { qty: number; note: string | null }>; notes: { branch_id: string; branch: string; note: string }[] }> }>();
  const orderNotes = new Map<string, { branch_id: string; branch_name: string; note: string }>();
  for (const r of rows) {
    branches.set(r.branch_id, { id: r.branch_id, code: r.branch_code, name: r.branch_name, sort: r.branch_sort });
    let cat = cats.get(r.category_id);
    if (!cat) cats.set(r.category_id, (cat = { id: r.category_id, name: r.category_name, color: r.category_color, products: new Map() }));
    let p = cat.products.get(r.product_id);
    if (!p) cat.products.set(r.product_id, (p = { id: r.product_id, code: r.product_code, name: r.product_name, uom: r.uom_name, total: 0, by_branch: {}, notes: [] }));
    p.total = Math.round((p.total + r.qty) * 10000) / 10000;
    p.by_branch[r.branch_id] = { qty: r.qty, note: r.line_note };
    if (r.line_note) p.notes.push({ branch_id: r.branch_id, branch: r.branch_name, note: r.line_note });
    if (r.order_note) orderNotes.set(r.branch_id, { branch_id: r.branch_id, branch_name: r.branch_name, note: r.order_note });
  }
  const branchList = [...branches.values()].sort((x, y) => x.sort - y.sort || x.code.localeCompare(y.code));
  const categories = [...cats.values()].map((c) => {
    const products = [...c.products.values()];
    const by_branch: Record<string, number> = {};
    for (const p of products) for (const [b, v] of Object.entries(p.by_branch)) by_branch[b] = Math.round(((by_branch[b] ?? 0) + v.qty) * 10000) / 10000;
    return { id: c.id, name: c.name, color: c.color, products, total: products.reduce((s, p) => s + p.total, 0), by_branch };
  });
  const units = categories.reduce((s, c) => s + c.total, 0);
  const orders = new Set(rows.map((r) => r.order_id)).size;
  return { branches: branchList, categories, order_notes: [...orderNotes.values()], totals: { products: categories.reduce((s, c) => s + c.products.length, 0), units: Math.round(units * 10000) / 10000, orders, notes: orderNotes.size + rows.filter((r) => r.line_note).length } };
}

async function loadPo(a: AuthCtx, id: string): Promise<PoRow> {
  const po = await a.db.first<PoRow>(`SELECT * FROM production_orders WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!po) throw notFound('أمر الإنتاج');
  return po;
}

/** Version token for cheap polling (ADR-0012 P5). */
async function poVersion(a: AuthCtx, id: string): Promise<string> {
  const r = await a.db.first<{ v: string }>(
    `SELECT COALESCE(MAX(o.updated_at), '') || ':' || COUNT(o.id) || ':' || po.updated_at || ':' || po.status AS v FROM production_orders po LEFT JOIN orders o ON o.production_order_id = po.id WHERE po.id = ? AND po.tenant_id = ?`, id, a.tenantId);
  return r?.v ?? '';
}

production.get('/production-orders', requirePerm('production:read'), async (c) => {
  const a = authOf(c);
  const rows = await a.db.all(
    `SELECT po.id, po.number, po.status, po.delivery_date, po.expected_ready_at, po.assigned_to_name, w.name_ar AS window_name, w.kind AS window_kind, l.name_ar AS plant_name,
            (SELECT COUNT(*) FROM orders o WHERE o.production_order_id = po.id AND o.status NOT IN ('draft','cancelled')) AS order_count,
            (SELECT COALESCE(SUM(ol.qty),0) FROM orders o JOIN order_lines ol ON ol.order_id = o.id WHERE o.production_order_id = po.id AND o.status NOT IN ('draft','cancelled')) AS total_units
     FROM production_orders po JOIN order_windows w ON w.id = po.window_id JOIN locations l ON l.id = po.plant_id
     WHERE po.tenant_id = ? ORDER BY po.delivery_date DESC, w.sort_order LIMIT 60`, a.tenantId);
  return okJson(c, rows);
});

production.get('/production-orders/:id', requirePerm('production:read'), async (c) => {
  const a = authOf(c);
  const po = await loadPo(a, c.req.param('id'));
  const [demand, snapshot, win, plant, sections, orders, branchesExpected, users] = await Promise.all([
    buildDemand(a, po.id),
    a.db.first<{ version: number; created_at: string; reason: string }>(`SELECT version, created_at, reason FROM production_snapshots WHERE production_order_id = ? ORDER BY version DESC LIMIT 1`, po.id),
    a.db.first<{ id: string; name_ar: string; kind: 'regular' | 'urgent'; cutoff_time: string | null; delivery_offset_days: number }>(`SELECT * FROM order_windows WHERE id = ?`, po.window_id),
    a.db.first(`SELECT id, name_ar, phone, address FROM locations WHERE id = ?`, po.plant_id),
    a.db.all(`SELECT s.*, c.name_ar AS category_name, u.full_name AS assigned_to_user FROM production_sections s LEFT JOIN categories c ON c.id = s.category_id LEFT JOIN users u ON u.id = s.assigned_to WHERE s.production_order_id = ? ORDER BY s.sort_order`, po.id),
    a.db.all(`SELECT o.id, o.branch_id, o.status, o.revision, o.submitted_at, l.name_ar AS branch_name, COUNT(ol.id) AS line_count, COALESCE(SUM(ol.qty),0) AS total_qty,
                     COALESCE((SELECT SUM(dl.qty_delivered) FROM delivery_lines dl JOIN order_lines x ON x.id = dl.order_line_id WHERE x.order_id = o.id),0) AS total_delivered
              FROM orders o JOIN locations l ON l.id = o.branch_id LEFT JOIN order_lines ol ON ol.order_id = o.id WHERE o.production_order_id = ? AND o.tenant_id = ? GROUP BY o.id ORDER BY l.sort_order`, po.id, a.tenantId),
    a.db.all<{ id: string; name_ar: string }>(`SELECT id, name_ar FROM locations WHERE tenant_id = ? AND kind = 'branch' AND is_active = 1 AND default_plant_id = ? ORDER BY sort_order`, a.tenantId, po.plant_id),
    a.db.all(`SELECT DISTINCT u.id, u.full_name FROM users u JOIN user_roles r ON r.user_id = u.id WHERE u.tenant_id = ? AND u.is_active = 1 AND r.role IN ('plant_manager','plant_staff') ORDER BY u.full_name`, a.tenantId),
  ]);
  const cycleClosed = win ? isCycleClosed(win, po.delivery_date, new Date(), a.settings.timezone) : false;
  const assignedUser = po.assigned_to ? await a.db.first<{ full_name: string }>(`SELECT full_name FROM users WHERE id = ?`, po.assigned_to) : null;
  return okJson(c, {
    header: { ...po, assigned_to_user: assignedUser?.full_name ?? null, window: win, plant, cycle_closed: cycleClosed, closes_at: win && po.status === 'open' ? windowCycle(win, new Date(), a.settings.timezone).closesAt : null },
    ...demand,
    snapshot_version: snapshot?.version ?? null,
    snapshot_at: snapshot?.created_at ?? null,
    sections, orders,
    missing_branches: branchesExpected.filter((b) => !orders.some((o) => (o as { branch_id: string; status: string }).branch_id === b.id && (o as { status: string }).status !== 'cancelled')),
    staff: users,
    version: await poVersion(a, po.id),
  });
});

production.get('/production-orders/:id/version', requirePerm('production:read'), async (c) => {
  const a = authOf(c);
  const v = await poVersion(a, c.req.param('id'));
  const etag = `"${v.replace(/[^\w:.-]/g, '')}"`;
  if (c.req.header('if-none-match') === etag) return c.body(null, 304);
  c.header('ETag', etag);
  return okJson(c, { version: v });
});

/** Print payload = LATEST SNAPSHOT (D5), live matrix only while still open. */
production.get('/production-orders/:id/print', requirePerm('production:print'), async (c) => {
  const a = authOf(c);
  const po = await loadPo(a, c.req.param('id'));
  const snap = await a.db.first<{ version: number; demand_matrix: string; created_at: string }>(`SELECT version, demand_matrix, created_at FROM production_snapshots WHERE production_order_id = ? ORDER BY version DESC LIMIT 1`, po.id);
  const matrix = snap ? JSON.parse(snap.demand_matrix) : await buildDemand(a, po.id);
  const [win, plant, branding, assigned, sections] = await Promise.all([
    a.db.first(`SELECT name_ar, kind, cutoff_time FROM order_windows WHERE id = ?`, po.window_id),
    a.db.first(`SELECT name_ar, phone, address FROM locations WHERE id = ?`, po.plant_id),
    a.db.first(`SELECT company_name, logo_url, primary_color, phone, address, footer_text FROM tenant_branding WHERE tenant_id = ?`, a.tenantId),
    po.assigned_to ? a.db.first<{ full_name: string }>(`SELECT full_name FROM users WHERE id = ?`, po.assigned_to) : null,
    a.db.all(`SELECT s.category_id, s.name_ar, s.expected_ready_at, u.full_name AS assigned FROM production_sections s LEFT JOIN users u ON u.id = s.assigned_to WHERE s.production_order_id = ?`, po.id),
  ]);
  return okJson(c, { po: { ...po, assigned_name: po.assigned_to_name ?? assigned?.full_name ?? null }, matrix, snapshot_version: snap?.version ?? null, snapshot_at: snap?.created_at ?? null, window: win, plant, branding, sections, printed_by: a.userName, printed_at: new Date().toISOString(), timezone: a.settings.timezone });
});

production.patch('/production-orders/:id', requirePerm('production:manage'), async (c) => {
  const a = authOf(c);
  const i = await parseBody(c, AssignInput);
  const po = await loadPo(a, c.req.param('id'));
  assertCan(c, 'production:manage', po.plant_id);
  if (['delivered', 'cancelled'].includes(po.status)) throw invalidTransition(po.status, 'assign');
  if (i.expected_ready_at && Date.parse(i.expected_ready_at) < Date.now() - 60000) throw new Fail(422, 'BUSINESS_RULE', 'الوقت المتوقع يجب أن يكون في المستقبل', { rule: 'D12' });
  const now = new Date().toISOString();
  await a.db.batch([
    a.db.prep(`UPDATE production_orders SET assigned_to = COALESCE(?, assigned_to), assigned_to_name = COALESCE(?, assigned_to_name), expected_ready_at = COALESCE(?, expected_ready_at), note = COALESCE(?, note), updated_at = ? WHERE id = ? AND tenant_id = ?`,
      i.assigned_to ?? null, i.assigned_to_name ?? null, i.expected_ready_at ?? null, i.note ?? null, now, po.id, a.tenantId),
    a.db.audit(a.userId, 'production_order', po.id, 'assign', { assigned_to: po.assigned_to, assigned_to_name: po.assigned_to_name, expected_ready_at: po.expected_ready_at }, i, ulid()),
  ]);
  return okJson(c, { id: po.id });
});

/** Lock (manual D11 or cron D10): PO + all submitted orders → locked, snapshot v1. */
export async function lockProduction(a: AuthCtx, po: PoRow, manual: boolean): Promise<number> {
  const t = ProductionMachine.transition(po.status, 'lock');
  if (!t.ok) throw invalidTransition(po.status, 'lock');
  const now = new Date().toISOString();
  await a.db.batch([
    a.db.prep(`UPDATE production_orders SET status = 'locked', locked_at = ?, locked_by = ?, updated_at = ? WHERE id = ? AND tenant_id = ? AND status = 'open'`, now, manual ? a.userId : null, now, po.id, a.tenantId),
    a.db.prep(`UPDATE orders SET status = 'locked', updated_at = ? WHERE production_order_id = ? AND tenant_id = ? AND status = 'submitted'`, now, po.id, a.tenantId),
    a.db.audit(manual ? a.userId : null, 'production_order', po.id, 'lock', { status: po.status }, { status: 'locked', manual }, ulid()),
  ]);
  const v = await snapshotProduction(a, po.id, manual ? 'manual_lock' : 'cutoff');
  const d = await buildDemand(a, po.id);
  await notify(a, ['plant_manager'], po.plant_id, 'window_closed', `أُغلق ${po.number}`, `${d.branches.length} فروع · ${d.totals.units.toLocaleString('en')} وحدة`, { production_order_id: po.id });
  return v;
}

production.post('/production-orders/:id/lock', requirePerm('production:manage'), async (c) => {
  const a = authOf(c);
  const po = await loadPo(a, c.req.param('id'));
  assertCan(c, 'production:manage', po.plant_id);
  const v = await lockProduction(a, po, true);
  return okJson(c, { id: po.id, status: 'locked', snapshot_version: v });
});

async function cascadeOrders(a: AuthCtx, poId: string, from: OrderStatus[], event: 'start' | 'mark_ready', to: OrderStatus) {
  for (const f of from) if (!OrderMachine.can(f, event)) throw invalidTransition(f, event);
  await a.db.run(`UPDATE orders SET status = ?, updated_at = ? WHERE production_order_id = ? AND tenant_id = ? AND status IN (SELECT value FROM json_each(?))`, to, new Date().toISOString(), poId, a.tenantId, JSON.stringify(from));
}

production.post('/production-orders/:id/start', requirePerm('production:manage'), async (c) => {
  const a = authOf(c);
  const po = await loadPo(a, c.req.param('id'));
  assertCan(c, 'production:manage', po.plant_id);
  const t = ProductionMachine.transition(po.status, 'start');
  if (!t.ok) throw new Fail(409, 'INVALID_TRANSITION', po.status === 'open' ? 'اقفل أمر الإنتاج أولاً' : 'لا يمكن بدء الإنتاج في هذه الحالة', { rule: 'D6' });
  const now = new Date().toISOString();
  await a.db.batch([
    a.db.prep(`UPDATE production_orders SET status = 'in_progress', started_at = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`, now, now, po.id, a.tenantId),
    a.db.audit(a.userId, 'production_order', po.id, 'start', { status: po.status }, { status: 'in_progress' }, ulid()),
  ]);
  await cascadeOrders(a, po.id, ['locked'], 'start', 'in_production'); // D7
  const exp = po.expected_ready_at ? ` · متوقع ${new Intl.DateTimeFormat('ar', { timeZone: a.settings.timezone, hour: 'numeric', minute: '2-digit' }).format(new Date(po.expected_ready_at))}` : '';
  const branches = await a.db.all<{ branch_id: string }>(`SELECT branch_id FROM orders WHERE production_order_id = ? AND status = 'in_production'`, po.id);
  for (const b of branches) await notify(a, ['branch_user'], b.branch_id, 'production_started', `بدأ إنتاج طلبيتك${exp}`, null, { production_order_id: po.id });
  return okJson(c, { id: po.id, status: 'in_progress' });
});

production.post('/production-orders/:id/complete', requirePerm('production:manage'), async (c) => {
  const a = authOf(c);
  const po = await loadPo(a, c.req.param('id'));
  assertCan(c, 'production:manage', po.plant_id);
  const t = ProductionMachine.transition(po.status, 'complete');
  if (!t.ok) throw invalidTransition(po.status, 'complete');
  const now = new Date().toISOString();
  await a.db.batch([
    a.db.prep(`UPDATE production_orders SET status = 'completed', completed_at = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`, now, now, po.id, a.tenantId),
    a.db.audit(a.userId, 'production_order', po.id, 'complete', { status: po.status }, { status: 'completed' }, ulid()),
  ]);
  const branches = await a.db.all<{ branch_id: string }>(`SELECT branch_id FROM orders WHERE production_order_id = ? AND status = 'in_production'`, po.id);
  await cascadeOrders(a, po.id, ['in_production'], 'mark_ready', 'ready'); // G3
  for (const b of branches) await notify(a, ['branch_user'], b.branch_id, 'order_ready', 'طلبيتك جاهزة للتسليم', null, { production_order_id: po.id });
  await settleDelivered(a, po.id);
  return okJson(c, { id: po.id, status: 'completed' });
});

production.post('/production-orders/:id/cancel', requirePerm('production:manage'), async (c) => {
  const a = authOf(c);
  const { reason } = await parseBody(c, CancelInput);
  const po = await loadPo(a, c.req.param('id'));
  const t = ProductionMachine.transition(po.status, 'cancel');
  if (!t.ok) throw invalidTransition(po.status, 'cancel');
  const now = new Date().toISOString();
  await a.db.batch([
    a.db.prep(`UPDATE production_orders SET status = 'cancelled', note = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`, reason, now, po.id, a.tenantId),
    a.db.prep(`UPDATE orders SET status = 'cancelled', cancel_reason = ?, updated_at = ? WHERE production_order_id = ? AND tenant_id = ? AND status IN ('submitted','locked')`, reason, now, po.id, a.tenantId),
    a.db.audit(a.userId, 'production_order', po.id, 'cancel', { status: po.status }, { status: 'cancelled', reason }, ulid()),
  ]);
  return okJson(c, { id: po.id, status: 'cancelled' });
});

/** D9: PO delivered when every non-cancelled order is delivered. */
export async function settleDelivered(a: AuthCtx, poId: string) {
  const r = await a.db.first<{ open: number; total: number; status: string }>(
    `SELECT SUM(CASE WHEN o.status NOT IN ('delivered','cancelled') THEN 1 ELSE 0 END) AS open, COUNT(o.id) AS total, po.status
     FROM production_orders po LEFT JOIN orders o ON o.production_order_id = po.id WHERE po.id = ? AND po.tenant_id = ?`, poId, a.tenantId);
  if (r && r.status === 'completed' && r.total > 0 && r.open === 0) {
    await a.db.batch([
      a.db.prep(`UPDATE production_orders SET status = 'delivered', updated_at = ? WHERE id = ? AND tenant_id = ?`, new Date().toISOString(), poId, a.tenantId),
      a.db.audit(null, 'production_order', poId, 'deliver', { status: 'completed' }, { status: 'delivered' }, ulid()),
    ]);
  }
}

/** Cron (D10): lock every regular window whose cutoff passed. */
export async function cronLock(env: AppEnv['Bindings']) {
  const { Db } = await import('../lib/db');
  const tenants = await env.DB.prepare(`SELECT t.id, s.timezone FROM tenants t JOIN tenant_settings s ON s.tenant_id = t.id WHERE t.status = 'active'`).all<{ id: string; timezone: string }>();
  for (const t of tenants.results) {
    const db = new Db(env.DB, t.id);
    const open = await db.all<PoRow & { kind: 'regular' | 'urgent'; cutoff_time: string | null; delivery_offset_days: number }>(
      `SELECT po.*, w.kind, w.cutoff_time, w.delivery_offset_days FROM production_orders po JOIN order_windows w ON w.id = po.window_id WHERE po.tenant_id = ? AND po.status = 'open' AND w.kind = 'regular'`, t.id);
    for (const po of open) {
      if (!isCycleClosed(po, po.delivery_date, new Date(), t.timezone)) continue;
      const settings = await db.first<AuthCtx['settings']>(`SELECT * FROM tenant_settings WHERE tenant_id = ?`, t.id);
      const a: AuthCtx = { tenantId: t.id, userId: 'SYSTEM', userName: 'النظام', sessionId: '', deviceId: null, grants: [], settings: settings!, db };
      await lockProduction(a, po, false);
    }
  }
}
