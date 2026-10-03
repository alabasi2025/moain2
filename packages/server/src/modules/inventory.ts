import {
  QuickVoucherInput, RawMaterialInput, SupplierInput, CancelInput, applyInbound, applyOutbound, applyOutboundAtCost, minor, parseQty, qtyFromDb, qtyToDb,
  localDate, addDays, startOfLocalDayIso, stripCosts, ulid, can, type MovementResult, type QtyE4, type StockState, type VoucherKind,
} from '@moain/shared';
import { Hono } from 'hono';
import type { AppEnv, AuthCtx } from '../env';
import { authOf, requirePerm } from '../lib/auth';
import { Fail, notFound, okJson, parseBody } from '../lib/http';
import { notify } from './notify';

export const inventory = new Hono<AppEnv>();

const PREFIX: Record<VoucherKind, string> = { opening: 'OPN', receipt: 'RCV', issue: 'ISS', adjustment: 'ADJ', transfer: 'TRF', waste: 'WST', return_in: 'RTN', return_out: 'RTN' };
const REASON: Record<VoucherKind, string> = { opening: 'opening', receipt: 'receipt', issue: 'issue', adjustment: 'adjustment', transfer: 'transfer', waste: 'waste', return_in: 'return', return_out: 'return' };
const INBOUND = new Set<VoucherKind>(['opening', 'receipt', 'return_in']);

const costsOk = (a: AuthCtx) => can(a.grants, 'costs:view');
const toUnitMinor = (amount: number, decimals: number) => minor(Math.round(amount * 10 ** decimals));

async function defaultWarehouse(a: AuthCtx): Promise<string> {
  const w = await a.db.first<{ id: string }>(`SELECT id FROM locations WHERE tenant_id = ? AND kind = 'warehouse' AND is_active = 1 ORDER BY sort_order LIMIT 1`, a.tenantId);
  if (!w) throw new Fail(422, 'BUSINESS_RULE', 'لا يوجد مخزن معرّف — أضف مخزناً من الإعدادات');
  return w.id;
}

async function stockState(a: AuthCtx, materialId: string, locationId: string): Promise<StockState & { lastAt: string | null }> {
  const r = await a.db.first<{ qty: number; valuation_rate_minor: number; stock_value_minor: number; last_at: string | null }>(
    `SELECT b.qty, b.valuation_rate_minor, b.stock_value_minor, m.occurred_at AS last_at FROM stock_balances b LEFT JOIN stock_movements m ON m.id = b.last_movement_id
     WHERE b.raw_material_id = ? AND b.location_id = ?`, materialId, locationId);
  if (!r) return { qty: 0 as QtyE4, value: minor(0), rate: minor(0), lastAt: null };
  return { qty: qtyFromDb(r.qty), value: minor(r.stock_value_minor), rate: minor(r.valuation_rate_minor), lastAt: r.last_at };
}

interface MovementPlan { materialId: string; locationId: string; reason: string; res: MovementResult; lineId: string; reverses?: string; name: string; safety: number; prevQty: QtyE4 }

function movementStmt(a: AuthCtx, p: MovementPlan, voucherId: string, occurredAt: string, note: string | null, createdAt: string) {
  return a.db.prep(
    `INSERT INTO stock_movements (id, tenant_id, raw_material_id, location_id, qty, reason, unit_cost_minor, qty_after, valuation_rate_minor_after, stock_value_minor_after, stock_value_diff_minor,
       ref_type, ref_id, voucher_line_id, reverses_movement_id, actor_id, note, occurred_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'voucher', ?, ?, ?, ?, ?, ?, ?)`,
    ulid(), a.tenantId, p.materialId, p.locationId, qtyToDb(p.res.signedQty), p.reason, p.res.unitCost, qtyToDb(p.res.qtyAfter), p.res.rateAfter, p.res.valueAfter, p.res.valueDiff,
    voucherId, p.lineId, p.reverses ?? null, a.userId, note, occurredAt, createdAt);
}

/**
 * POST /vouchers/quick — create + post in one atomic batch (F8–F17, ADR-0011, ADR-0012 P2).
 * The ledger chain trigger rejects stale reads; we retry once on LEDGER_CHAIN_BROKEN.
 */
inventory.post('/vouchers/quick', requirePerm('vouchers:post'), async (c) => {
  const a = authOf(c);
  const i = await parseBody(c, QuickVoucherInput);
  const done = await a.db.first<{ id: string; number: string }>(`SELECT id, number FROM vouchers WHERE tenant_id = ? AND client_uuid = ?`, a.tenantId, i.client_uuid);
  if (done) return okJson(c, { voucher: { ...done, status: 'posted' }, idempotent: true, movements: [], alerts: [] });
  for (let attempt = 0; ; attempt++) {
    try {
      return okJson(c, await postVoucher(a, i), 201);
    } catch (e) {
      if (attempt === 0 && String(e).includes('LEDGER_CHAIN_BROKEN')) continue;
      if (String(e).includes('LEDGER_BACKDATED')) throw new Fail(422, 'BUSINESS_RULE', 'لا يمكن الترحيل بتاريخ أقدم من آخر حركة للمادة — استخدم تاريخ اليوم', { rule: 'F19' });
      throw e;
    }
  }
});

async function postVoucher(a: AuthCtx, i: ReturnType<typeof QuickVoucherInput.parse>) {
  const tz = a.settings.timezone;
  const today = localDate(new Date(), tz);
  const vDate = i.voucher_date ?? today;
  if (vDate > today) throw new Fail(422, 'BUSINESS_RULE', 'تاريخ السند لا يكون في المستقبل', { rule: 'F18' });
  const locationId = i.location_id ?? (await defaultWarehouse(a));
  const loc = await a.db.first(`SELECT 1 FROM locations WHERE id = ? AND tenant_id = ?`, locationId, a.tenantId);
  if (!loc) throw notFound('المخزن');
  if (i.kind === 'transfer') {
    if (!i.to_location_id || i.to_location_id === locationId) throw new Fail(422, 'BUSINESS_RULE', 'حدد مخزن الوجهة للتحويل');
    if (!(await a.db.first(`SELECT 1 FROM locations WHERE id = ? AND tenant_id = ?`, i.to_location_id, a.tenantId))) throw notFound('مخزن الوجهة');
  }
  if (i.kind === 'issue' && !i.issued_to_name?.trim()) throw new Fail(422, 'BUSINESS_RULE', 'اسم الساحب مطلوب لسند الصرف');
  if (i.supplier_id && !(await a.db.first(`SELECT 1 FROM suppliers WHERE id = ? AND tenant_id = ?`, i.supplier_id, a.tenantId))) throw notFound('المورد');

  const matIds = [...new Set(i.lines.map((l) => l.raw_material_id))];
  if (matIds.length !== i.lines.length) throw new Fail(409, 'DUPLICATE', 'مادة مكررة في السند');
  const mats = await a.db.all<{ id: string; name_ar: string; safety_stock: number; default_unit_cost_minor: number | null; decimals: number; uom_name: string }>(
    `SELECT m.id, m.name_ar, m.safety_stock, m.default_unit_cost_minor, u.decimals, u.name_ar AS uom_name FROM raw_materials m JOIN uoms u ON u.id = m.uom_id
     WHERE m.tenant_id = ? AND m.is_active = 1 AND m.id IN (SELECT value FROM json_each(?))`, a.tenantId, JSON.stringify(matIds));
  const mmap = new Map(mats.map((m) => [m.id, m]));
  const allowNeg = a.settings.allow_negative_stock === 1;
  const cd = a.settings.currency_decimals;

  const occurredAt = vDate === today ? new Date().toISOString() : startOfLocalDayIso(vDate, tz);
  const voucherId = ulid();
  const lineRows: { id: string; materialId: string; qty: number; unitCost: number | null; note: string | null; sort: number }[] = [];
  const plans: MovementPlan[] = [];
  const warnings: string[] = [];

  for (const [idx, l] of i.lines.entries()) {
    const m = mmap.get(l.raw_material_id);
    if (!m) throw new Fail(422, 'BUSINESS_RULE', 'مادة غير موجودة أو معطّلة', { line_index: idx });
    const q = parseQty(String(Math.abs(l.qty)), Math.min(m.decimals, 4));
    if (!q || q <= 0) throw new Fail(422, 'BUSINESS_RULE', 'الكمية يجب أن تكون أكبر من صفر', { rule: 'F4', line_index: idx });
    const st = await stockState(a, m.id, locationId);
    if (st.lastAt && occurredAt < st.lastAt) throw new Fail(422, 'BUSINESS_RULE', `لا يمكن الترحيل بتاريخ أقدم من آخر حركة للمادة «${m.name_ar}» — استخدم تاريخ اليوم`, { rule: 'F19', line_index: idx });
    const lineId = ulid();
    const inbound = INBOUND.has(i.kind) || (i.kind === 'adjustment' && l.qty > 0);
    let res: MovementResult;
    if (inbound) {
      const cost = l.unit_cost != null ? toUnitMinor(l.unit_cost, cd) : i.kind === 'adjustment' ? st.rate : (m.default_unit_cost_minor !== null ? minor(m.default_unit_cost_minor) : st.qty > 0 || st.rate > 0 ? st.rate : null);
      if (cost === null) throw new Fail(422, 'BUSINESS_RULE', `أدخل تكلفة الوحدة للمادة «${m.name_ar}»`, { rule: 'F10', line_index: idx });
      res = applyInbound(st, q, cost);
    } else {
      if (!allowNeg && st.qty - q < 0) {
        const avail = st.qty / 10000;
        throw new Fail(422, 'BUSINESS_RULE', `رصيد غير كافٍ للمادة «${m.name_ar}»: المتاح ${avail.toLocaleString('en')} ${m.uom_name}، المطلوب ${(q / 10000).toLocaleString('en')} ${m.uom_name}`,
          { rule: 'F9', line_index: idx, available: avail, requested: q / 10000 });
      }
      res = applyOutbound(st, q);
    }
    lineRows.push({ id: lineId, materialId: m.id, qty: i.kind === 'adjustment' ? l.qty : qtyToDb(q), unitCost: res.unitCost, note: l.note ?? null, sort: idx });
    plans.push({ materialId: m.id, locationId, reason: REASON[i.kind], res, lineId, name: m.name_ar, safety: m.safety_stock, prevQty: st.qty });
    if (i.kind === 'transfer') {
      const dst = await stockState(a, m.id, i.to_location_id!);
      plans.push({ materialId: m.id, locationId: i.to_location_id!, reason: 'transfer', res: applyInbound(dst, q, res.unitCost), lineId, name: m.name_ar, safety: m.safety_stock, prevQty: dst.qty }); // F14
    }
  }

  const number = await a.db.nextNumber(PREFIX[i.kind], Number(vDate.slice(0, 4)));
  const now = new Date().toISOString();
  const stmts: D1PreparedStatement[] = [
    a.db.prep(`INSERT INTO vouchers (id, tenant_id, kind, number, location_id, to_location_id, supplier_id, external_ref, issued_to_name, purpose, voucher_date, status, note, created_by, posted_by, posted_at, client_uuid)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, NULL, NULL, ?)`,
      voucherId, a.tenantId, i.kind, number, locationId, i.to_location_id ?? null, i.supplier_id ?? null, i.external_ref ?? null, i.issued_to_name ?? null, i.purpose ?? null, vDate, i.note ?? null, a.userId, i.client_uuid),
    ...lineRows.map((l) => a.db.prep(`INSERT INTO voucher_lines (id, voucher_id, raw_material_id, qty, unit_cost_minor, note, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`, l.id, voucherId, l.materialId, l.qty, l.unitCost, l.note, l.sort)),
    a.db.prep(`UPDATE vouchers SET status = 'posted', posted_by = ?, posted_at = ?, updated_at = ? WHERE id = ?`, a.userId, now, now, voucherId),
    ...plans.map((p, k) => movementStmt(a, p, voucherId, occurredAt, null, new Date(Date.now() + k).toISOString())),
    a.db.audit(a.userId, 'voucher', voucherId, 'post', null, { kind: i.kind, number, lines: lineRows.length }, ulid()),
  ];
  await a.db.batch(stmts);

  // F17: crossing safety stock downward
  const alerts = plans.filter((p) => p.res.signedQty < 0 && p.res.qtyAfter / 10000 < p.safety && p.prevQty / 10000 >= p.safety)
    .map((p) => ({ kind: 'low_stock', raw_material_id: p.materialId, name: p.name, qty_after: p.res.qtyAfter / 10000, safety_stock: p.safety }));
  for (const al of alerts) await notify(a, ['storekeeper', 'admin', 'owner'], null, 'low_stock', `${al.name}: ${al.qty_after.toLocaleString('en')} (الحد ${al.safety_stock.toLocaleString('en')})`, 'تحت حد الأمان', { raw_material_id: al.raw_material_id });
  const movements = plans.map((p) => ({ raw_material_id: p.materialId, name: p.name, location_id: p.locationId, qty: p.res.signedQty / 10000, qty_after: p.res.qtyAfter / 10000, valuation_rate_minor_after: p.res.rateAfter, stock_value_minor_after: p.res.valueAfter }));
  return stripCosts({ voucher: { id: voucherId, number, status: 'posted', kind: i.kind }, movements, warnings, alerts }, costsOk(a));
}

/** POST /vouchers/:id/cancel — reversals with opposite sign (F15, F16). */
inventory.post('/vouchers/:id/cancel', requirePerm('vouchers:post'), async (c) => {
  const a = authOf(c);
  const { reason } = await parseBody(c, CancelInput);
  const v = await a.db.first<{ id: string; status: string; number: string }>(`SELECT id, status, number FROM vouchers WHERE id = ? AND tenant_id = ?`, c.req.param('id'), a.tenantId);
  if (!v) throw notFound('السند');
  if (v.status !== 'posted') throw new Fail(409, 'INVALID_TRANSITION', 'يمكن إلغاء السند المُرحَّل فقط');
  for (let attempt = 0; ; attempt++) {
    try {
      const movs = await a.db.all<{ id: string; raw_material_id: string; location_id: string; qty: number; unit_cost_minor: number; voucher_line_id: string }>(
        `SELECT id, raw_material_id, location_id, qty, unit_cost_minor, voucher_line_id FROM stock_movements WHERE tenant_id = ? AND ref_type = 'voucher' AND ref_id = ? AND reason <> 'reversal' ORDER BY created_at DESC`, a.tenantId, v.id);
      const plans: MovementPlan[] = [];
      const states = new Map<string, StockState>();
      for (const m of movs) {
        const key = `${m.raw_material_id}:${m.location_id}`;
        const st = states.get(key) ?? (await stockState(a, m.raw_material_id, m.location_id));
        const q = Math.abs(qtyFromDb(m.qty)) as QtyE4;
        let res: MovementResult;
        if (m.qty > 0) {
          if (a.settings.allow_negative_stock !== 1 && st.qty - q < 0) {
            const mat = await a.db.first<{ name_ar: string }>(`SELECT name_ar FROM raw_materials WHERE id = ?`, m.raw_material_id);
            throw new Fail(422, 'BUSINESS_RULE', `لا يمكن إلغاء السند: رصيد «${mat?.name_ar ?? ''}» الحالي أقل من الكمية الواردة (صُرف جزء منها)`, { rule: 'F9' });
          }
          res = applyOutboundAtCost(st, q, minor(m.unit_cost_minor));
        } else {
          res = applyInbound(st, q, minor(m.unit_cost_minor));
        }
        states.set(key, { qty: res.qtyAfter, value: res.valueAfter, rate: res.rateAfter });
        plans.push({ materialId: m.raw_material_id, locationId: m.location_id, reason: 'reversal', res, lineId: m.voucher_line_id, reverses: m.id, name: '', safety: 0, prevQty: st.qty });
      }
      const now = new Date().toISOString();
      await a.db.batch([
        ...plans.map((p, k) => movementStmt(a, p, v.id, now, reason, new Date(Date.now() + k).toISOString())),
        a.db.prep(`UPDATE vouchers SET status = 'cancelled', cancelled_by = ?, cancelled_at = ?, cancel_reason = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`, a.userId, now, reason, now, v.id, a.tenantId),
        a.db.audit(a.userId, 'voucher', v.id, 'cancel', { status: 'posted' }, { status: 'cancelled', reason }, ulid()),
      ]);
      return okJson(c, { id: v.id, status: 'cancelled', reversals: plans.length });
    } catch (e) {
      if (attempt === 0 && String(e).includes('LEDGER_CHAIN_BROKEN')) continue;
      throw e;
    }
  }
});

inventory.get('/vouchers', requirePerm('inventory:read'), async (c) => {
  const a = authOf(c);
  const kind = c.req.query('kind') ?? null;
  const rows = await a.db.all(
    `SELECT v.id, v.kind, v.number, v.voucher_date, v.status, v.external_ref, v.issued_to_name, s.name AS supplier_name, u.full_name AS created_by_name, v.created_at,
            COUNT(vl.id) AS line_count, COALESCE(SUM(ABS(vl.qty) * COALESCE(vl.unit_cost_minor,0)),0) AS total_minor,
            (SELECT group_concat(name_ar, '، ') FROM (SELECT m.name_ar FROM voucher_lines x JOIN raw_materials m ON m.id = x.raw_material_id WHERE x.voucher_id = v.id LIMIT 3)) AS materials
     FROM vouchers v LEFT JOIN voucher_lines vl ON vl.voucher_id = v.id LEFT JOIN suppliers s ON s.id = v.supplier_id JOIN users u ON u.id = v.created_by
     WHERE v.tenant_id = ? AND (? IS NULL OR v.kind = ?) GROUP BY v.id ORDER BY v.created_at DESC LIMIT 200`, a.tenantId, kind, kind);
  return okJson(c, stripCosts(rows, costsOk(a)));
});

inventory.get('/vouchers/:id', requirePerm('inventory:read'), async (c) => {
  const a = authOf(c);
  const v = await a.db.first<Record<string, unknown> & { id: string }>(
    `SELECT v.*, s.name AS supplier_name, l.name_ar AS location_name, tl.name_ar AS to_location_name, u.full_name AS created_by_name, pu.full_name AS posted_by_name, cu.full_name AS cancelled_by_name
     FROM vouchers v LEFT JOIN suppliers s ON s.id = v.supplier_id JOIN locations l ON l.id = v.location_id LEFT JOIN locations tl ON tl.id = v.to_location_id JOIN users u ON u.id = v.created_by
     LEFT JOIN users pu ON pu.id = v.posted_by LEFT JOIN users cu ON cu.id = v.cancelled_by WHERE v.id = ? AND v.tenant_id = ?`, c.req.param('id'), a.tenantId);
  if (!v) throw notFound('السند');
  const [lines, movements, branding] = await Promise.all([
    a.db.all(`SELECT vl.*, m.code, m.name_ar, u.name_ar AS uom_name FROM voucher_lines vl JOIN raw_materials m ON m.id = vl.raw_material_id JOIN uoms u ON u.id = m.uom_id WHERE vl.voucher_id = ? ORDER BY vl.sort_order`, v.id),
    a.db.all(`SELECT sm.id, sm.reason, sm.qty, sm.qty_after, sm.unit_cost_minor, sm.valuation_rate_minor_after, sm.stock_value_minor_after, sm.occurred_at, m.name_ar, l.name_ar AS location_name
              FROM stock_movements sm JOIN raw_materials m ON m.id = sm.raw_material_id JOIN locations l ON l.id = sm.location_id WHERE sm.tenant_id = ? AND sm.ref_type = 'voucher' AND sm.ref_id = ? ORDER BY sm.created_at`, a.tenantId, v.id),
    a.db.first(`SELECT company_name, logo_url, primary_color, phone, address, footer_text, tax_number FROM tenant_branding WHERE tenant_id = ?`, a.tenantId),
  ]);
  return okJson(c, stripCosts({ ...v, lines, movements, branding }, costsOk(a)));
});

/* ─── Raw materials ─── */
inventory.get('/raw-materials', requirePerm('inventory:read'), async (c) => {
  const a = authOf(c);
  const loc = c.req.query('location_id') ?? (await defaultWarehouse(a));
  const rows = await a.db.all(
    `SELECT m.id, m.code, m.name_ar, m.category_id, rc.name_ar AS category_name, m.uom_id, u.name_ar AS uom_name, u.decimals AS uom_decimals, m.safety_stock, m.default_unit_cost_minor, m.is_active,
            COALESCE(b.qty, 0) AS qty_on_hand, COALESCE(b.valuation_rate_minor, m.default_unit_cost_minor, 0) AS unit_cost_minor, COALESCE(b.stock_value_minor, 0) AS stock_value_minor,
            CASE WHEN COALESCE(b.qty,0) <= 0 THEN 'out' WHEN COALESCE(b.qty,0) < m.safety_stock THEN 'low' ELSE 'ok' END AS stock_status,
            (SELECT MAX(created_at) FROM stock_movements WHERE raw_material_id = m.id) AS last_movement_at
     FROM raw_materials m JOIN uoms u ON u.id = m.uom_id LEFT JOIN raw_material_categories rc ON rc.id = m.category_id
     LEFT JOIN stock_balances b ON b.raw_material_id = m.id AND b.location_id = ?
     WHERE m.tenant_id = ? ORDER BY rc.sort_order, m.name_ar`, loc, a.tenantId);
  return okJson(c, stripCosts(rows, costsOk(a)));
});

inventory.get('/raw-materials/:id', requirePerm('inventory:read'), async (c) => {
  const a = authOf(c);
  const loc = c.req.query('location_id') ?? (await defaultWarehouse(a));
  const m = await a.db.first<{ id: string }>(
    `SELECT m.*, rc.name_ar AS category_name, u.name_ar AS uom_name, u.decimals AS uom_decimals, COALESCE(b.qty,0) AS qty_on_hand, COALESCE(b.valuation_rate_minor, m.default_unit_cost_minor, 0) AS unit_cost_minor,
            COALESCE(b.stock_value_minor,0) AS stock_value_minor, CASE WHEN COALESCE(b.qty,0) <= 0 THEN 'out' WHEN COALESCE(b.qty,0) < m.safety_stock THEN 'low' ELSE 'ok' END AS stock_status
     FROM raw_materials m JOIN uoms u ON u.id = m.uom_id LEFT JOIN raw_material_categories rc ON rc.id = m.category_id LEFT JOIN stock_balances b ON b.raw_material_id = m.id AND b.location_id = ?
     WHERE m.id = ? AND m.tenant_id = ?`, loc, c.req.param('id'), a.tenantId);
  if (!m) throw notFound('المادة');
  const ledger = await a.db.all(
    `SELECT sm.id, sm.reason, sm.qty, sm.qty_after, sm.unit_cost_minor, sm.valuation_rate_minor_after, sm.stock_value_minor_after, sm.occurred_at, sm.created_at, sm.note,
            v.id AS voucher_id, v.number AS voucher_number, v.kind AS voucher_kind, v.issued_to_name, v.external_ref, s.name AS supplier_name, u.full_name AS actor_name
     FROM stock_movements sm LEFT JOIN vouchers v ON v.id = sm.ref_id AND sm.ref_type = 'voucher' LEFT JOIN suppliers s ON s.id = v.supplier_id JOIN users u ON u.id = sm.actor_id
     WHERE sm.tenant_id = ? AND sm.raw_material_id = ? AND sm.location_id = ? ORDER BY sm.occurred_at DESC, sm.created_at DESC LIMIT 200`, a.tenantId, m.id, loc);
  return okJson(c, stripCosts({ ...m, ledger }, costsOk(a)));
});

inventory.post('/raw-materials', requirePerm('inventory:write'), async (c) => {
  const a = authOf(c);
  const i = await parseBody(c, RawMaterialInput);
  const id = ulid();
  try {
    await a.db.batch([
      a.db.prep(`INSERT INTO raw_materials (id, tenant_id, category_id, code, name_ar, uom_id, safety_stock, default_unit_cost_minor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        id, a.tenantId, i.category_id ?? null, i.code, i.name_ar, i.uom_id, i.safety_stock, i.default_unit_cost == null ? null : toUnitMinor(i.default_unit_cost, a.settings.currency_decimals)),
      a.db.audit(a.userId, 'raw_material', id, 'create', null, i, ulid()),
    ]);
  } catch (e) {
    if (String(e).includes('UNIQUE')) throw new Fail(409, 'DUPLICATE', 'كود المادة مستخدم');
    throw e;
  }
  return okJson(c, { id }, 201);
});

inventory.put('/raw-materials/:id', requirePerm('inventory:write'), async (c) => {
  const a = authOf(c);
  const i = await parseBody(c, RawMaterialInput);
  const id = c.req.param('id');
  const before = await a.db.first<{ uom_id: string }>(`SELECT * FROM raw_materials WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!before) throw notFound('المادة');
  if (before.uom_id !== i.uom_id && (await a.db.first(`SELECT 1 FROM stock_movements WHERE raw_material_id = ? LIMIT 1`, id))) throw new Fail(409, 'CONFLICT', 'لا يمكن تغيير وحدة مادة لها حركات', { rule: 'F22' });
  await a.db.batch([
    a.db.prep(`UPDATE raw_materials SET category_id = ?, code = ?, name_ar = ?, uom_id = ?, safety_stock = ?, default_unit_cost_minor = ?, is_active = COALESCE(?, is_active), updated_at = ? WHERE id = ? AND tenant_id = ?`,
      i.category_id ?? null, i.code, i.name_ar, i.uom_id, i.safety_stock, i.default_unit_cost == null ? null : toUnitMinor(i.default_unit_cost, a.settings.currency_decimals),
      i.is_active === undefined ? null : Number(i.is_active), new Date().toISOString(), id, a.tenantId),
    a.db.audit(a.userId, 'raw_material', id, 'update', before, i, ulid()),
  ]);
  return okJson(c, { id });
});

inventory.get('/raw-material-categories', requirePerm('inventory:read'), async (c) => {
  const a = authOf(c);
  return okJson(c, await a.db.all(`SELECT id, name_ar, sort_order FROM raw_material_categories WHERE tenant_id = ? AND is_active = 1 ORDER BY sort_order`, a.tenantId));
});

inventory.get('/suppliers', requirePerm('inventory:read'), async (c) => {
  const a = authOf(c);
  return okJson(c, await a.db.all(`SELECT id, name, phone, address FROM suppliers WHERE tenant_id = ? AND is_active = 1 ORDER BY name`, a.tenantId));
});
inventory.post('/suppliers', requirePerm('inventory:write'), async (c) => {
  const a = authOf(c);
  const i = await parseBody(c, SupplierInput);
  const id = ulid();
  await a.db.run(`INSERT INTO suppliers (id, tenant_id, name, phone, address) VALUES (?, ?, ?, ?, ?)`, id, a.tenantId, i.name, i.phone ?? null, i.address ?? null);
  return okJson(c, { id }, 201);
});

/** Recent suggestions for quick entry (W4): last supplier/cost per material, last requesters. */
inventory.get('/inventory/suggestions', requirePerm('inventory:read'), async (c) => {
  const a = authOf(c);
  const [recent, lastCosts, requesters] = await Promise.all([
    a.db.all<{ raw_material_id: string }>(`SELECT raw_material_id, MAX(created_at) t FROM stock_movements WHERE tenant_id = ? GROUP BY raw_material_id ORDER BY t DESC LIMIT 6`, a.tenantId),
    a.db.all(`SELECT vl.raw_material_id, vl.unit_cost_minor, v.supplier_id FROM voucher_lines vl JOIN vouchers v ON v.id = vl.voucher_id
              WHERE v.tenant_id = ? AND v.kind = 'receipt' AND v.status = 'posted' AND vl.rowid IN (SELECT MAX(x.rowid) FROM voucher_lines x JOIN vouchers y ON y.id = x.voucher_id WHERE y.tenant_id = ? AND y.kind = 'receipt' GROUP BY x.raw_material_id)`, a.tenantId, a.tenantId),
    a.db.all<{ issued_to_name: string }>(`SELECT issued_to_name, MAX(created_at) t FROM vouchers WHERE tenant_id = ? AND issued_to_name IS NOT NULL GROUP BY issued_to_name ORDER BY t DESC LIMIT 6`, a.tenantId),
  ]);
  return okJson(c, stripCosts({ recent: recent.map((r) => r.raw_material_id), last_costs: lastCosts, requesters: requesters.map((r) => r.issued_to_name) }, costsOk(a)));
});

/** GET /stock/overview — the client's 11 columns for a period, computed from the ledger (H4). */
inventory.get('/stock/overview', requirePerm('stock:read'), async (c) => {
  const a = authOf(c);
  const tz = a.settings.timezone;
  const loc = c.req.query('location_id') ?? (await defaultWarehouse(a));
  const today = localDate(new Date(), tz);
  const fromD = c.req.query('from') ?? `${today.slice(0, 8)}01`;
  const toD = c.req.query('to') ?? today;
  const from = startOfLocalDayIso(fromD, tz);
  const [y, mo, d] = toD.split('-').map(Number) as [number, number, number];
  const to = startOfLocalDayIso(new Date(Date.UTC(y, mo - 1, d + 1)).toISOString().slice(0, 10), tz);
  const rows = await a.db.all(
    `WITH
     opening AS (SELECT sm.raw_material_id, sm.qty_after AS opening_qty, sm.stock_value_minor_after AS opening_value FROM stock_movements sm
       WHERE sm.tenant_id = ?1 AND sm.location_id = ?2 AND sm.occurred_at < ?3
         AND (sm.occurred_at || sm.created_at) = (SELECT MAX(occurred_at || created_at) FROM stock_movements WHERE raw_material_id = sm.raw_material_id AND location_id = sm.location_id AND occurred_at < ?3)),
     period AS (SELECT raw_material_id, SUM(CASE WHEN qty > 0 THEN qty ELSE 0 END) AS qty_in, SUM(CASE WHEN qty < 0 THEN -qty ELSE 0 END) AS qty_out
       FROM stock_movements WHERE tenant_id = ?1 AND location_id = ?2 AND occurred_at >= ?3 AND occurred_at < ?4 GROUP BY raw_material_id),
     closing AS (SELECT sm.raw_material_id, sm.qty_after AS closing_qty, sm.valuation_rate_minor_after AS closing_rate, sm.stock_value_minor_after AS closing_value FROM stock_movements sm
       WHERE sm.tenant_id = ?1 AND sm.location_id = ?2 AND sm.occurred_at < ?4
         AND (sm.occurred_at || sm.created_at) = (SELECT MAX(occurred_at || created_at) FROM stock_movements WHERE raw_material_id = sm.raw_material_id AND location_id = sm.location_id AND occurred_at < ?4))
     SELECT rm.id, rm.code, rmc.name_ar AS category, rmc.id AS category_id, rm.name_ar, u.name_ar AS uom, rm.safety_stock,
            COALESCE(o.opening_qty, 0) AS opening_qty, COALESCE(p.qty_in, 0) AS total_in, COALESCE(p.qty_out, 0) AS total_out,
            COALESCE(cl.closing_qty, 0) AS closing_qty, COALESCE(cl.closing_rate, rm.default_unit_cost_minor, 0) AS unit_cost_minor, COALESCE(cl.closing_value, 0) AS closing_value_minor,
            CASE WHEN COALESCE(cl.closing_qty,0) <= 0 THEN 'out' WHEN COALESCE(cl.closing_qty,0) < rm.safety_stock THEN 'low' ELSE 'ok' END AS stock_status
     FROM raw_materials rm LEFT JOIN raw_material_categories rmc ON rmc.id = rm.category_id JOIN uoms u ON u.id = rm.uom_id
     LEFT JOIN opening o ON o.raw_material_id = rm.id LEFT JOIN period p ON p.raw_material_id = rm.id LEFT JOIN closing cl ON cl.raw_material_id = rm.id
     WHERE rm.tenant_id = ?1 AND rm.is_active = 1 ORDER BY rmc.sort_order, rm.name_ar`, a.tenantId, loc, from, to);
  const location = await a.db.first(`SELECT id, name_ar FROM locations WHERE id = ?`, loc);
  return okJson(c, stripCosts({ from: fromD, to: toD, location, rows }, costsOk(a)));
});

/**
 * GET /movements?from&to&location_id&kind — the client's "daily movement log" (one row per stock movement,
 * all materials): date · material · in/out · qty · requester/supplier · voucher number · external ref.
 */
inventory.get('/movements', requirePerm('inventory:read'), async (c) => {
  const a = authOf(c);
  const loc = c.req.query('location_id') ?? (await defaultWarehouse(a));
  const today = localDate(new Date(), a.settings.timezone);
  const from = c.req.query('from') ?? today;
  const to = c.req.query('to') ?? today;
  const dir = c.req.query('dir') ?? null; // in | out
  const rows = await a.db.all(
    `SELECT sm.id, sm.occurred_at, sm.reason, sm.qty, sm.qty_after, sm.unit_cost_minor, ABS(sm.stock_value_diff_minor) AS value_minor, sm.reverses_movement_id,
            m.id AS raw_material_id, m.code, m.name_ar, un.name_ar AS uom_name, rc.name_ar AS category_name,
            v.id AS voucher_id, v.number AS voucher_number, v.kind AS voucher_kind, v.status AS voucher_status, v.issued_to_name, v.external_ref, s.name AS supplier_name, u.full_name AS actor_name
     FROM stock_movements sm JOIN raw_materials m ON m.id = sm.raw_material_id JOIN uoms un ON un.id = m.uom_id LEFT JOIN raw_material_categories rc ON rc.id = m.category_id
     LEFT JOIN vouchers v ON v.id = sm.ref_id AND sm.ref_type = 'voucher' LEFT JOIN suppliers s ON s.id = v.supplier_id JOIN users u ON u.id = sm.actor_id
     WHERE sm.tenant_id = ? AND sm.location_id = ? AND sm.occurred_at >= ? AND sm.occurred_at < ?
       AND (? IS NULL OR (? = 'in' AND sm.qty > 0) OR (? = 'out' AND sm.qty < 0))
     ORDER BY sm.occurred_at DESC, sm.created_at DESC LIMIT 1000`,
    a.tenantId, loc, startOfLocalDayIso(from, a.settings.timezone), startOfLocalDayIso(addDays(to, 1), a.settings.timezone), dir, dir, dir);
  return okJson(c, stripCosts({ from, to, rows }, costsOk(a)));
});
