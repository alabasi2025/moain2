import { DeliveryInput, OrderMachine, parseQty, qtyToDb, ulid, type OrderStatus } from '@moain/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { assertCan, authOf, requirePerm } from '../lib/auth';
import { Fail, invalidTransition, notFound, okJson, parseBody } from '../lib/http';
import { notify } from './notify';
import { settleDelivered } from './production';

export const fulfillment = new Hono<AppEnv>();

/** Orders waiting to be delivered (W6 list). */
fulfillment.get('/deliveries/pending', requirePerm('deliveries:create'), async (c) => {
  const a = authOf(c);
  const rows = await a.db.all(
    `SELECT o.id, o.branch_id, l.name_ar AS branch_name, o.delivery_date, o.status, po.number AS po_number, w.name_ar AS window_name,
            COUNT(ol.id) AS line_count, COALESCE(SUM(ol.qty),0) AS total_qty,
            COALESCE((SELECT SUM(dl.qty_delivered) FROM delivery_lines dl JOIN order_lines x ON x.id = dl.order_line_id WHERE x.order_id = o.id),0) AS total_delivered
     FROM orders o JOIN locations l ON l.id = o.branch_id JOIN order_windows w ON w.id = o.window_id LEFT JOIN production_orders po ON po.id = o.production_order_id
     LEFT JOIN order_lines ol ON ol.order_id = o.id
     WHERE o.tenant_id = ? AND o.status IN ('in_production','ready','partially_delivered')
     GROUP BY o.id ORDER BY o.delivery_date, CASE o.status WHEN 'ready' THEN 0 WHEN 'partially_delivered' THEN 1 ELSE 2 END, l.sort_order`, a.tenantId);
  return okJson(c, rows);
});

fulfillment.get('/deliveries', requirePerm('orders:read'), async (c) => {
  const a = authOf(c);
  const rows = await a.db.all(
    `SELECT d.id, d.number, d.order_id, d.received_by_name, d.delivered_at, u.full_name AS delivered_by_name, l.name_ar AS branch_name, o.delivery_date,
            (SELECT COALESCE(SUM(qty_delivered),0) FROM delivery_lines WHERE delivery_id = d.id) AS qty, (d.signature_blob IS NOT NULL) AS signed
     FROM deliveries d JOIN orders o ON o.id = d.order_id JOIN locations l ON l.id = o.branch_id JOIN users u ON u.id = d.delivered_by
     WHERE d.tenant_id = ? ORDER BY d.delivered_at DESC LIMIT 100`, a.tenantId);
  return okJson(c, rows);
});

fulfillment.get('/deliveries/:id', requirePerm('orders:read'), async (c) => {
  const a = authOf(c);
  const d = await a.db.first<{ id: string; order_id: string; signature_blob: ArrayBuffer | null; signature_mime: string | null } & Record<string, unknown>>(
    `SELECT d.*, u.full_name AS delivered_by_name, l.name_ar AS branch_name, o.delivery_date, po.number AS po_number FROM deliveries d JOIN orders o ON o.id = d.order_id
     JOIN locations l ON l.id = o.branch_id JOIN users u ON u.id = d.delivered_by LEFT JOIN production_orders po ON po.id = o.production_order_id WHERE d.id = ? AND d.tenant_id = ?`, c.req.param('id'), a.tenantId);
  if (!d) throw notFound('التسليم');
  const lines = await a.db.all(
    `SELECT dl.qty_delivered, dl.note, ol.qty AS qty_ordered, p.name_ar AS product_name, u.name_ar AS uom_name FROM delivery_lines dl JOIN order_lines ol ON ol.id = dl.order_line_id
     JOIN products p ON p.id = ol.product_id JOIN uoms u ON u.id = p.uom_id WHERE dl.delivery_id = ? ORDER BY ol.sort_order`, d.id);
  const branding = await a.db.first(`SELECT company_name, logo_url, primary_color, phone, address, footer_text FROM tenant_branding WHERE tenant_id = ?`, a.tenantId);
  let signature: string | null = null;
  if (d.signature_blob) {
    const bytes = new Uint8Array(d.signature_blob);
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    signature = `data:${d.signature_mime ?? 'image/png'};base64,${btoa(bin)}`;
  }
  const { signature_blob: _blob, ...rest } = d;
  return okJson(c, { ...rest, signature, lines, branding });
});

/** POST /deliveries — record a (partial or full) delivery with signature (E1–E8). */
fulfillment.post('/deliveries', requirePerm('deliveries:create'), async (c) => {
  const a = authOf(c);
  const i = await parseBody(c, DeliveryInput);
  const existing = await a.db.first<{ id: string; number: string }>(`SELECT id, number FROM deliveries WHERE tenant_id = ? AND client_uuid = ?`, a.tenantId, i.client_uuid);
  if (existing) return okJson(c, { delivery: existing, idempotent: true });
  const o = await a.db.first<{ id: string; status: OrderStatus; branch_id: string; plant_id: string; production_order_id: string | null }>(
    `SELECT id, status, branch_id, plant_id, production_order_id FROM orders WHERE id = ? AND tenant_id = ?`, i.order_id, a.tenantId);
  if (!o) throw notFound('الطلبية');
  assertCan(c, 'deliveries:create', o.plant_id);
  if (!['in_production', 'ready', 'partially_delivered'].includes(o.status)) throw new Fail(409, 'INVALID_TRANSITION', 'لا يمكن تسليم طلبية في هذه الحالة', { rule: 'E1', status: o.status });

  const lines = await a.db.all<{ id: string; qty: number; delivered: number; name_ar: string }>(
    `SELECT ol.id, ol.qty, COALESCE((SELECT SUM(qty_delivered) FROM delivery_lines WHERE order_line_id = ol.id),0) AS delivered, p.name_ar
     FROM order_lines ol JOIN products p ON p.id = ol.product_id WHERE ol.order_id = ?`, o.id);
  const lmap = new Map(lines.map((l) => [l.id, l]));
  const warnings: string[] = [];
  const parsed = i.lines.map((l) => {
    const ol = lmap.get(l.order_line_id);
    if (!ol) throw new Fail(422, 'BUSINESS_RULE', 'سطر لا ينتمي لهذه الطلبية', { rule: 'E1' });
    const q = parseQty(String(l.qty_delivered), 4) ?? 0;
    const remaining = Math.round((ol.qty - ol.delivered) * 10000);
    if (q > remaining) warnings.push(`${ol.name_ar}: سُلِّم أكثر من المتبقي`); // E4
    return { ...l, qty: qtyToDb(q as never) };
  }).filter((l) => l.qty > 0 || i.lines.length === 1);
  if (!parsed.length) throw new Fail(422, 'BUSINESS_RULE', 'أدخل كمية مُسلَّمة واحدة على الأقل');

  let sig: Uint8Array | null = null;
  if (i.signature_png_base64) {
    const b64 = i.signature_png_base64.replace(/^data:image\/png;base64,/, '');
    const bin = atob(b64);
    if (bin.length > 50_000) throw new Fail(413, 'VALIDATION', 'التوقيع أكبر من المسموح', { rule: 'E7' });
    sig = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    if (sig[0] !== 0x89 || sig[1] !== 0x50) throw new Fail(400, 'VALIDATION', 'صيغة التوقيع غير صالحة', { rule: 'E7' });
  }

  // E6: full when Σ delivered ≥ Σ ordered for every line
  const after = new Map(lines.map((l) => [l.id, l.delivered]));
  for (const p of parsed) after.set(p.order_line_id, (after.get(p.order_line_id) ?? 0) + p.qty);
  const full = lines.every((l) => (after.get(l.id) ?? 0) + 1e-9 >= l.qty);
  const event = full ? 'deliver_full' : 'deliver_partial';
  const t = OrderMachine.transition(o.status, event);
  if (!t.ok) throw invalidTransition(o.status, event);

  const id = ulid();
  const now = new Date().toISOString();
  const number = await a.db.nextNumber('DLV', new Date().getUTCFullYear());
  const note = [i.note, ...warnings].filter(Boolean).join(' · ') || null;
  await a.db.batch([
    a.db.prep(`INSERT INTO deliveries (id, tenant_id, order_id, number, delivered_by, received_by_name, delivered_at, signature_blob, signature_mime, note, client_uuid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, a.tenantId, o.id, number, a.userId, i.received_by_name, now, sig ? (sig.buffer.slice(sig.byteOffset, sig.byteOffset + sig.byteLength) as ArrayBuffer) : null, sig ? 'image/png' : null, note, i.client_uuid),
    ...parsed.map((p) => a.db.prep(`INSERT INTO delivery_lines (id, delivery_id, order_line_id, qty_delivered, note) VALUES (?, ?, ?, ?, ?)`, ulid(), id, p.order_line_id, p.qty, p.note ?? null)),
    a.db.prep(`UPDATE orders SET status = ?, updated_at = ? WHERE id = ? AND tenant_id = ?`, t.value, now, o.id, a.tenantId),
    a.db.audit(a.userId, 'delivery', id, 'create', { order_status: o.status }, { order_status: t.value, lines: parsed.length, signed: Boolean(sig) }, ulid()),
  ]);
  const ordered = lines.reduce((s, l) => s + l.qty, 0);
  const delivered = [...after.values()].reduce((s, v) => s + v, 0);
  const b = await a.db.first<{ name_ar: string }>(`SELECT name_ar FROM locations WHERE id = ?`, o.branch_id);
  const msg = `${Math.round(delivered).toLocaleString('en')} من ${Math.round(ordered).toLocaleString('en')}${full ? '' : ' (جزئي)'}`;
  await notify(a, ['branch_user'], o.branch_id, 'delivered', 'تم تسليم طلبيتك', msg, { order_id: o.id, delivery_id: id });
  await notify(a, ['plant_manager'], o.plant_id, 'delivered', `تم تسليم طلبية ${b?.name_ar ?? ''}`, msg, { order_id: o.id, delivery_id: id });
  if (o.production_order_id) await settleDelivered(a, o.production_order_id);
  return okJson(c, { delivery: { id, number }, order_status: t.value, warnings }, 201);
});
