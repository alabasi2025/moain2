import { CancelInput, OrderMachine, SubmitOrderInput, can, isCycleClosed, qtyFromDb, qtyToDb, parseQty, scopeFor, ulid, windowCycle, type OrderStatus, type WindowSpec } from '@moain/shared';
import { Hono, type Context } from 'hono';
import type { AppEnv, AuthCtx } from '../env';
import { assertCan, authOf, requirePerm } from '../lib/auth';
import { Fail, forbidden, invalidTransition, notFound, okJson, parseBody } from '../lib/http';
import { notify } from './notify';

export const ordering = new Hono<AppEnv>();

interface WindowRow extends WindowSpec { id: string; plant_id: string; name_ar: string; opens_at: string | null; is_active: number; sort_order: number }
interface OrderRow {
  id: string; branch_id: string; plant_id: string; window_id: string; delivery_date: string; status: OrderStatus; note: string | null;
  revision: number; production_order_id: string | null; client_uuid: string; submitted_at: string | null; cancel_reason: string | null; updated_at: string;
}

const branchScope = (a: AuthCtx): string[] | null => scopeFor(a.grants, 'orders:read');

/** Which branches can this user see orders for? Plant users see branches linked to their plant (A4). */
async function visibleBranchIds(a: AuthCtx): Promise<string[] | null> {
  const scope = branchScope(a);
  if (scope === null) return null;
  if (scope.length === 0) return [];
  const rows = await a.db.all<{ id: string }>(
    `SELECT id FROM locations WHERE tenant_id = ? AND kind = 'branch' AND (id IN (SELECT value FROM json_each(?)) OR default_plant_id IN (SELECT value FROM json_each(?)))`,
    a.tenantId, JSON.stringify(scope), JSON.stringify(scope));
  return rows.map((r) => r.id);
}

export function windowStatus(w: WindowRow, now: Date, tz: string) {
  const cyc = windowCycle(w, now, tz);
  return { ...w, cycle: cyc };
}

/** GET /windows — windows of the plant serving the user's branch (or all for plant/admin) with live cycle. */
ordering.get('/windows', async (c) => {
  const a = authOf(c);
  const branchId = c.req.query('branch_id');
  let plantId: string | null = null;
  if (branchId) {
    const b = await a.db.first<{ default_plant_id: string | null }>(`SELECT default_plant_id FROM locations WHERE id = ? AND tenant_id = ?`, branchId, a.tenantId);
    plantId = b?.default_plant_id ?? null;
  }
  const rows = await a.db.all<WindowRow>(
    `SELECT id, plant_id, name_ar, kind, opens_at, cutoff_time, delivery_offset_days, sort_order, is_active FROM order_windows
     WHERE tenant_id = ? AND (? IS NULL OR plant_id = ?) ORDER BY sort_order`, a.tenantId, plantId, plantId);
  const now = new Date();
  return okJson(c, rows.map((w) => windowStatus(w, now, a.settings.timezone)));
});

async function loadOrder(a: AuthCtx, id: string): Promise<OrderRow> {
  const o = await a.db.first<OrderRow>(`SELECT * FROM orders WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!o) throw notFound('الطلبية');
  const vis = await visibleBranchIds(a);
  if (vis !== null && !vis.includes(o.branch_id)) throw notFound('الطلبية');
  return o;
}

export async function orderDetail(a: AuthCtx, id: string) {
  const o = await loadOrder(a, id);
  const [lines, revisions, po, branch, deliveries, exceptions] = await Promise.all([
    a.db.all(`SELECT ol.id, ol.product_id, ol.qty, ol.note, p.name_ar AS product_name, p.code AS product_code, u.name_ar AS uom_name, c.name_ar AS category_name, c.id AS category_id, c.sort_order AS category_sort,
                     COALESCE((SELECT SUM(dl.qty_delivered) FROM delivery_lines dl WHERE dl.order_line_id = ol.id), 0) AS qty_delivered
              FROM order_lines ol JOIN products p ON p.id = ol.product_id JOIN uoms u ON u.id = p.uom_id JOIN categories c ON c.id = p.category_id
              WHERE ol.order_id = ? ORDER BY c.sort_order, p.sort_order, p.name_ar`, o.id),
    a.db.all(`SELECT r.revision, r.reason, r.changed_at, u.full_name AS changed_by_name FROM order_revisions r LEFT JOIN users u ON u.id = r.changed_by WHERE r.order_id = ? ORDER BY r.revision DESC`, o.id),
    o.production_order_id ? a.db.first(`SELECT po.id, po.number, po.status, po.expected_ready_at, po.assigned_to_name, u.full_name AS assigned_to_user FROM production_orders po LEFT JOIN users u ON u.id = po.assigned_to WHERE po.id = ? AND po.tenant_id = ?`, o.production_order_id, a.tenantId) : null,
    a.db.first(`SELECT id, code, name_ar FROM locations WHERE id = ? AND tenant_id = ?`, o.branch_id, a.tenantId),
    a.db.all(`SELECT d.id, d.number, d.received_by_name, d.delivered_at, u.full_name AS delivered_by_name, (d.signature_blob IS NOT NULL) AS signed FROM deliveries d JOIN users u ON u.id = d.delivered_by WHERE d.order_id = ? AND d.tenant_id = ? ORDER BY d.delivered_at`, o.id, a.tenantId),
    a.db.all(`SELECT id, reason, status, requested_at, decided_at, decision_note, edit_until, consumed_at FROM order_exceptions WHERE order_id = ? ORDER BY requested_at DESC`, o.id),
  ]);
  const win = await a.db.first<WindowRow>(`SELECT * FROM order_windows WHERE id = ? AND tenant_id = ?`, o.window_id, a.tenantId);
  return { ...o, lines, revisions, production_order: po, branch, deliveries, exceptions, window: win };
}

/** GET /orders — history list. */
ordering.get('/orders', requirePerm('orders:read'), async (c) => {
  const a = authOf(c);
  const vis = await visibleBranchIds(a);
  const from = c.req.query('date_from') ?? '0000-00-00';
  const to = c.req.query('date_to') ?? '9999-99-99';
  const status = c.req.query('status') ?? null;
  const rows = await a.db.all(
    `SELECT o.id, o.branch_id, l.name_ar AS branch_name, o.delivery_date, o.status, o.revision, o.submitted_at, o.window_id, w.name_ar AS window_name, w.kind AS window_kind,
            COUNT(ol.id) AS line_count, COALESCE(SUM(ol.qty), 0) AS total_qty,
            COALESCE((SELECT SUM(dl.qty_delivered) FROM delivery_lines dl JOIN order_lines x ON x.id = dl.order_line_id WHERE x.order_id = o.id), 0) AS total_delivered
     FROM orders o JOIN locations l ON l.id = o.branch_id JOIN order_windows w ON w.id = o.window_id LEFT JOIN order_lines ol ON ol.order_id = o.id
     WHERE o.tenant_id = ? AND o.delivery_date BETWEEN ? AND ? AND (? IS NULL OR o.status = ?)
       AND (? IS NULL OR o.branch_id IN (SELECT value FROM json_each(?)))
     GROUP BY o.id ORDER BY o.delivery_date DESC, l.sort_order LIMIT 200`,
    a.tenantId, from, to, status, status, vis === null ? null : 1, JSON.stringify(vis ?? []));
  return okJson(c, rows);
});

/** GET /orders/current?branch_id&window_id — the order for the active cycle (or null → client creates a local draft). */
ordering.get('/orders/current', requirePerm('orders:read'), async (c) => {
  const a = authOf(c);
  const branchId = c.req.query('branch_id') ?? '';
  const windowId = c.req.query('window_id') ?? '';
  const vis = await visibleBranchIds(a);
  if (vis !== null && !vis.includes(branchId)) throw forbidden();
  const w = await a.db.first<WindowRow>(`SELECT * FROM order_windows WHERE id = ? AND tenant_id = ?`, windowId, a.tenantId);
  if (!w) throw notFound('نافذة الطلب');
  const cyc = windowCycle(w, new Date(), a.settings.timezone);
  const o = await a.db.first<{ id: string }>(`SELECT id FROM orders WHERE tenant_id = ? AND branch_id = ? AND window_id = ? AND delivery_date = ?`, a.tenantId, branchId, windowId, cyc.deliveryDate);
  return okJson(c, { cycle: cyc, window: w, order: o ? await orderDetail(a, o.id) : null });
});

ordering.get('/orders/:id', requirePerm('orders:read'), async (c) => okJson(c, await orderDetail(authOf(c), c.req.param('id'))));

/** Copy source: last order of this branch/window before the given date (C15 — copied into a local draft only). */
ordering.get('/orders-copy-source', requirePerm('orders:submit'), async (c) => {
  const a = authOf(c);
  const branchId = c.req.query('branch_id') ?? '';
  assertCan(c, 'orders:submit', branchId);
  const before = c.req.query('before') ?? '9999-99-99';
  const o = await a.db.first<{ id: string; delivery_date: string }>(
    `SELECT id, delivery_date FROM orders WHERE tenant_id = ? AND branch_id = ? AND window_id = ? AND delivery_date < ? AND status <> 'cancelled' ORDER BY delivery_date DESC LIMIT 1`,
    a.tenantId, branchId, c.req.query('window_id') ?? '', before);
  if (!o) return okJson(c, null);
  const lines = await a.db.all(`SELECT product_id, qty, note FROM order_lines WHERE order_id = ?`, o.id);
  return okJson(c, { delivery_date: o.delivery_date, lines });
});

async function ensureProductionOrder(a: AuthCtx, plantId: string, windowId: string, deliveryDate: string): Promise<{ id: string; status: string }> {
  const ex = await a.db.first<{ id: string; status: string }>(`SELECT id, status FROM production_orders WHERE plant_id = ? AND window_id = ? AND delivery_date = ? AND tenant_id = ?`, plantId, windowId, deliveryDate, a.tenantId);
  if (ex) return ex;
  const id = ulid();
  const number = await a.db.nextNumber('PO', Number(deliveryDate.slice(0, 4)));
  await a.db.run(`INSERT OR IGNORE INTO production_orders (id, tenant_id, plant_id, window_id, delivery_date, number, status) VALUES (?, ?, ?, ?, ?, ?, 'open')`,
    id, a.tenantId, plantId, windowId, deliveryDate, number);
  const po = await a.db.first<{ id: string; status: string }>(`SELECT id, status FROM production_orders WHERE plant_id = ? AND window_id = ? AND delivery_date = ? AND tenant_id = ?`, plantId, windowId, deliveryDate, a.tenantId);
  if (!po) throw new Fail(500, 'INTERNAL', 'تعذّر إنشاء أمر الإنتاج');
  return po;
}

/**
 * POST /orders/submit — create or revise the branch order for the window's active cycle (C1, C4, C9, C10, C12, D2).
 * Idempotent on client_uuid: a retry of the same submission returns the same result.
 */
ordering.post('/orders/submit', requirePerm('orders:submit'), async (c) => {
  const a = authOf(c);
  const input = await parseBody(c, SubmitOrderInput);
  const idem = await a.db.getIdempotent<unknown>(`order.submit:${input.client_uuid}`);
  if (idem) return okJson(c, idem);

  const w = await a.db.first<WindowRow>(`SELECT * FROM order_windows WHERE id = ? AND tenant_id = ? AND is_active = 1`, input.window_id, a.tenantId);
  if (!w) throw notFound('نافذة الطلب');
  const myBranches = scopeFor(a.grants, 'orders:submit');
  const branchId = input.branch_id ?? myBranches?.[0];
  if (!branchId) throw new Fail(422, 'BUSINESS_RULE', 'لم يُحدَّد الفرع', { rule: 'A3' });
  assertCan(c, 'orders:submit', branchId);
  const branch = await a.db.first<{ id: string; default_plant_id: string | null; name_ar: string }>(`SELECT id, default_plant_id, name_ar FROM locations WHERE id = ? AND tenant_id = ? AND kind = 'branch'`, branchId, a.tenantId);
  if (!branch) throw notFound('الفرع');
  if (branch.default_plant_id !== w.plant_id) throw new Fail(422, 'BUSINESS_RULE', 'هذه النافذة لا تخدم فرعك', { rule: 'A4' });

  const now = new Date();
  const tz = a.settings.timezone;
  const cyc = windowCycle(w, now, tz);
  const deliveryDate = input.delivery_date ?? cyc.deliveryDate;
  const existing = await a.db.first<OrderRow>(`SELECT * FROM orders WHERE tenant_id = ? AND branch_id = ? AND window_id = ? AND delivery_date = ?`, a.tenantId, branchId, w.id, deliveryDate);

  // Exception path (C6, C7): an approved, unconsumed, unexpired exception lets a locked order be edited once.
  let exceptionId: string | null = null;
  if (isCycleClosed(w, deliveryDate, now, tz) || (existing && existing.status === 'locked')) {
    const ex = existing && await a.db.first<{ id: string }>(
      `SELECT id FROM order_exceptions WHERE order_id = ? AND status = 'approved' AND consumed_at IS NULL AND (edit_until IS NULL OR edit_until > ?) ORDER BY decided_at DESC LIMIT 1`, existing.id, now.toISOString());
    if (!ex || !existing || existing.status !== 'locked') {
      const cutoff = w.cutoff_time ?? '';
      throw new Fail(423, 'WINDOW_CLOSED', `أُغلقت نافذة الطلب الساعة ${cutoff}. يمكنك طلب استثناء من المعمل.`, { cutoff, can_request_exception: Boolean(existing), order_id: existing?.id ?? null });
    }
    exceptionId = ex.id;
  }
  if (deliveryDate !== cyc.deliveryDate && !exceptionId && cyc.closesAt !== null) {
    throw new Fail(423, 'WINDOW_CLOSED', 'هذه الدورة لم تعد مفتوحة للطلب', { can_request_exception: Boolean(existing), order_id: existing?.id ?? null });
  }

  // validate products (B5, B6)
  const productIds = [...new Set(input.lines.map((l) => l.product_id))];
  const products = await a.db.all<{ id: string; uom_decimals: number; restricted: number; allowed: number }>(
    `SELECT p.id, u.decimals AS uom_decimals,
            EXISTS (SELECT 1 FROM product_availability pa WHERE pa.product_id = p.id) AS restricted,
            EXISTS (SELECT 1 FROM product_availability pa WHERE pa.product_id = p.id AND pa.location_id = ?) AS allowed
     FROM products p JOIN uoms u ON u.id = p.uom_id WHERE p.tenant_id = ? AND p.is_active = 1 AND p.id IN (SELECT value FROM json_each(?))`,
    branchId, a.tenantId, JSON.stringify(productIds));
  const pmap = new Map(products.map((p) => [p.id, p]));
  const lines = input.lines.map((l, i) => {
    const p = pmap.get(l.product_id);
    if (!p || (p.restricted && !p.allowed)) throw new Fail(422, 'BUSINESS_RULE', 'صنف غير متاح لفرعك', { rule: 'B6', line_index: i });
    const q = parseQty(String(l.qty), Math.min(p.uom_decimals, a.settings.qty_decimals));
    if (!q || q <= 0) throw new Fail(422, 'BUSINESS_RULE', 'الكمية يجب أن تكون أكبر من صفر', { rule: 'C2', line_index: i });
    return { product_id: l.product_id, qty: qtyToDb(q), note: l.note?.trim() || null, sort: i };
  });
  if (new Set(lines.map((l) => l.product_id)).size !== lines.length) throw new Fail(409, 'DUPLICATE', 'صنف مكرر في الطلبية', { rule: 'C3' });

  const status: OrderStatus = existing?.status ?? 'draft';
  const event = exceptionId ? 'approve_exception' : existing?.status === 'cancelled' ? 'reopen' : 'submit';
  const t = OrderMachine.transition(status, event);
  if (!t.ok) throw invalidTransition(status, event);

  const po = await ensureProductionOrder(a, w.plant_id, w.id, deliveryDate);
  if (!['open', 'locked'].includes(po.status)) throw new Fail(409, 'CONFLICT', 'بدأ المعمل تنفيذ هذه الطلبية', { po_status: po.status });

  const orderId = existing?.id ?? ulid();
  const revision = existing ? existing.revision + 1 : 1;
  const nowIso = now.toISOString();
  const stmts: D1PreparedStatement[] = [];
  if (!existing) {
    stmts.push(a.db.prep(`INSERT INTO orders (id, tenant_id, branch_id, plant_id, window_id, delivery_date, status, note, submitted_by, submitted_at, production_order_id, client_uuid, revision)
      VALUES (?, ?, ?, ?, ?, ?, 'submitted', ?, ?, ?, ?, ?, 1)`, orderId, a.tenantId, branchId, w.plant_id, w.id, deliveryDate, input.note ?? null, a.userId, nowIso, po.id, input.client_uuid));
  } else {
    stmts.push(a.db.prep(`UPDATE orders SET status = ?, note = ?, submitted_by = ?, submitted_at = ?, revision = ?, cancel_reason = NULL, production_order_id = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`,
      t.value, input.note ?? null, a.userId, nowIso, revision, po.id, nowIso, orderId, a.tenantId));
    stmts.push(a.db.prep(`DELETE FROM order_lines WHERE order_id = ?`, orderId));
  }
  for (const l of lines) stmts.push(a.db.prep(`INSERT INTO order_lines (id, order_id, product_id, qty, note, sort_order) VALUES (?, ?, ?, ?, ?, ?)`, ulid(), orderId, l.product_id, l.qty, l.note, l.sort));
  stmts.push(a.db.prep(`INSERT INTO order_revisions (id, order_id, revision, lines_snapshot, note_snapshot, reason, changed_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ulid(), orderId, revision, JSON.stringify(lines), input.note ?? null, exceptionId ? `exception:${exceptionId}` : existing ? 'revise' : 'submit', a.userId));
  if (exceptionId) stmts.push(a.db.prep(`UPDATE order_exceptions SET consumed_at = ? WHERE id = ?`, nowIso, exceptionId));
  stmts.push(a.db.audit(a.userId, 'order', orderId, existing ? (exceptionId ? 'revise_exception' : 'revise') : 'submit',
    existing ? { status: existing.status, revision: existing.revision } : null, { status: t.value, revision, lines: lines.length }, ulid()));
  const result = { order: { id: orderId, status: t.value, revision, delivery_date: deliveryDate, production_order_id: po.id }, window: { closes_at: cyc.closesAt, closes_in_minutes: cyc.closesInMinutes } };
  stmts.push(a.db.saveIdempotent(`order.submit:${input.client_uuid}`, 'order.submit', result));
  await a.db.batch(stmts);

  if (exceptionId) await snapshotProduction(a, po.id, `exception:${exceptionId}`);
  const totalQty = lines.reduce((s, l) => s + qtyFromDb(l.qty), 0) / 10000;
  await notify(a, ['plant_manager', 'plant_staff'], w.plant_id, 'order_submitted',
    existing ? `عدّل ${branch.name_ar} طلبيته` : `أرسل ${branch.name_ar} طلبيته`, `${lines.length} صنفاً · ${totalQty.toLocaleString('en')} وحدة`, { order_id: orderId });
  return okJson(c, result);
});

ordering.post('/orders/:id/cancel', async (c) => {
  const a = authOf(c);
  const { reason } = await parseBody(c, CancelInput);
  const o = await loadOrder(a, c.req.param('id'));
  const isPlant = can(a.grants, 'production:manage');
  const isBranch = can(a.grants, 'orders:cancel', o.branch_id) && !isPlant;
  if (!isPlant && !isBranch) throw forbidden();
  // D1 clarification: branch may cancel only before cutoff (draft/submitted); plant manager may cancel locked/in_production.
  if (isBranch && !['draft', 'submitted'].includes(o.status)) throw new Fail(423, 'WINDOW_CLOSED', 'لا يمكن إلغاء الطلبية بعد إغلاق النافذة — تواصل مع المعمل');
  const t = OrderMachine.transition(o.status, 'cancel');
  if (!t.ok) throw invalidTransition(o.status, 'cancel');
  await a.db.batch([
    a.db.prep(`UPDATE orders SET status = 'cancelled', cancel_reason = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`, reason, new Date().toISOString(), o.id, a.tenantId),
    a.db.audit(a.userId, 'order', o.id, 'cancel', { status: o.status }, { status: 'cancelled', reason }, ulid()),
  ]);
  return okJson(c, { id: o.id, status: 'cancelled' });
});

/* ─── Exceptions (C6–C8) ─── */
ordering.post('/orders/:id/exceptions', requirePerm('exceptions:request'), async (c) => {
  const a = authOf(c);
  const { reason } = await parseBody(c, CancelInput);
  const o = await loadOrder(a, c.req.param('id'));
  assertCan(c, 'exceptions:request', o.branch_id);
  if (o.status !== 'locked') throw new Fail(409, 'CONFLICT', 'الاستثناء متاح فقط لطلبية مقفلة لم يبدأ إنتاجها');
  const pending = await a.db.first(`SELECT 1 FROM order_exceptions WHERE order_id = ? AND status = 'pending'`, o.id);
  if (pending) throw new Fail(409, 'CONFLICT', 'يوجد طلب استثناء قيد الانتظار');
  const id = ulid();
  const exp = new Date(Date.now() + a.settings.exception_ttl_minutes * 60000).toISOString();
  await a.db.batch([
    a.db.prep(`INSERT INTO order_exceptions (id, order_id, requested_by, reason, expires_at) VALUES (?, ?, ?, ?, ?)`, id, o.id, a.userId, reason, exp),
    a.db.audit(a.userId, 'order_exception', id, 'request', null, { order_id: o.id, reason }, ulid()),
  ]);
  const b = await a.db.first<{ name_ar: string }>(`SELECT name_ar FROM locations WHERE id = ?`, o.branch_id);
  await notify(a, ['plant_manager'], o.plant_id, 'exception_requested', `${b?.name_ar ?? ''} يطلب تعديل طلبيته`, `«${reason}»`, { order_id: o.id, exception_id: id });
  return okJson(c, { id, status: 'pending', expires_at: exp }, 201);
});

ordering.get('/exceptions', requirePerm('exceptions:decide'), async (c) => {
  const a = authOf(c);
  await expireExceptions(a);
  const rows = await a.db.all(
    `SELECT e.id, e.order_id, e.reason, e.status, e.requested_at, e.expires_at, e.decided_at, e.decision_note, l.name_ar AS branch_name, o.delivery_date, u.full_name AS requested_by_name
     FROM order_exceptions e JOIN orders o ON o.id = e.order_id JOIN locations l ON l.id = o.branch_id JOIN users u ON u.id = e.requested_by
     WHERE o.tenant_id = ? ORDER BY CASE e.status WHEN 'pending' THEN 0 ELSE 1 END, e.requested_at DESC LIMIT 100`, a.tenantId);
  return okJson(c, rows);
});

async function expireExceptions(a: AuthCtx) {
  await a.db.run(`UPDATE order_exceptions SET status = 'expired' WHERE status = 'pending' AND expires_at < ? AND order_id IN (SELECT id FROM orders WHERE tenant_id = ?)`, new Date().toISOString(), a.tenantId);
}

async function decide(c: Context<AppEnv>, decision: 'approve' | 'reject') {
  const a = authOf(c);
  const body = (await c.req.json().catch(() => ({}))) as { note?: string };
  await expireExceptions(a);
  const e = await a.db.first<{ id: string; order_id: string; status: string; plant_id: string; branch_id: string }>(
    `SELECT e.id, e.order_id, e.status, o.plant_id, o.branch_id FROM order_exceptions e JOIN orders o ON o.id = e.order_id WHERE e.id = ? AND o.tenant_id = ?`, c.req.param('id') ?? '', a.tenantId);
  if (!e) throw notFound('طلب الاستثناء');
  assertCan(c, 'exceptions:decide', e.plant_id);
  if (e.status !== 'pending') throw new Fail(409, 'INVALID_TRANSITION', e.status === 'expired' ? 'انتهت مهلة طلب الاستثناء' : 'تم البت في الطلب مسبقاً');
  const now = new Date();
  const editUntil = new Date(now.getTime() + 15 * 60000).toISOString();
  await a.db.batch([
    a.db.prep(`UPDATE order_exceptions SET status = ?, decided_by = ?, decided_at = ?, decision_note = ?, edit_until = ? WHERE id = ?`,
      decision === 'approve' ? 'approved' : 'rejected', a.userId, now.toISOString(), body.note ?? null, decision === 'approve' ? editUntil : null, e.id),
    a.db.audit(a.userId, 'order_exception', e.id, decision, { status: 'pending' }, { status: decision }, ulid()),
  ]);
  await notify(a, ['branch_user'], e.branch_id, 'exception_decided',
    decision === 'approve' ? 'وافق المعمل على تعديل طلبيتك — لديك 15 دقيقة' : 'رفض المعمل طلب تعديل الطلبية', body.note ?? null, { order_id: e.order_id });
  return okJson(c, { id: e.id, status: decision === 'approve' ? 'approved' : 'rejected', edit_until: decision === 'approve' ? editUntil : null });
}
ordering.post('/exceptions/:id/approve', requirePerm('exceptions:decide'), (c) => decide(c, 'approve'));
ordering.post('/exceptions/:id/reject', requirePerm('exceptions:decide'), (c) => decide(c, 'reject'));

/** Shared with production module: build & store the demand snapshot (D3, D4). */
export async function snapshotProduction(a: AuthCtx, poId: string, reason: string): Promise<number> {
  const { buildDemand } = await import('./production');
  const matrix = await buildDemand(a, poId);
  const v = await a.db.first<{ v: number | null }>(`SELECT MAX(version) v FROM production_snapshots WHERE production_order_id = ?`, poId);
  const version = (v?.v ?? 0) + 1;
  await a.db.run(`INSERT INTO production_snapshots (id, production_order_id, version, demand_matrix, reason, created_by) VALUES (?, ?, ?, ?, ?, ?)`,
    ulid(), poId, version, JSON.stringify(matrix), reason, a.userId === 'SYSTEM' ? null : a.userId);
  return version;
}
