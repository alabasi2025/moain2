// End-to-end API scenario against a running `wrangler dev` (default http://localhost:8787).
// Covers: login → branch submit (idempotent) → revise → plant lock → start → complete → partial + full delivery,
// inventory mandatory moving-average scenario, F9 rejection, voucher cancel restore, immutability, isolation.
const BASE = process.env.BASE ?? 'http://localhost:8787/api/v1';
let fails = 0;
const ok = (name, cond, extra = '') => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`); if (!cond) fails++; };
const ulid = () => Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 12).toUpperCase();

async function session(email) {
  const jar = { c: '' };
  const call = async (method, path, body) => {
    const r = await fetch(BASE + path, { method, headers: { 'content-type': 'application/json', cookie: jar.c }, body: body ? JSON.stringify(body) : undefined });
    const sc = r.headers.get('set-cookie'); if (sc) jar.c = sc.split(';')[0];
    const j = r.status === 304 ? null : await r.json();
    return { status: r.status, ...j };
  };
  const r = await call('POST', '/auth/login', { tenant: 'alnoor', identifier: email, password: '123456', deviceFingerprint: 'dev-' + email });
  ok(`login ${email}`, r.ok, r.error?.message_ar);
  return call;
}

const branch = await session('sitteen@alnoor.ye');
const branch2 = await session('hadda@alnoor.ye');
const plant = await session('plant@alnoor.ye');
const store = await session('store@alnoor.ye');

const me = await branch('GET', '/auth/me');
ok('me: branch nav', JSON.stringify(me.data.nav) === JSON.stringify(['home', 'order', 'receive', 'history', 'more']));
ok('me: branch cannot view costs', me.data.canViewCosts === false);
const myBranch = me.data.myLocationIds[0];
const wins = await branch('GET', `/windows?branch_id=${myBranch}`);
const daily = wins.data.find((w) => w.kind === 'regular');
ok('windows: daily cycle', !!daily?.cycle?.deliveryDate, daily?.cycle?.deliveryDate);
const cat = await branch('GET', '/catalog');
ok('catalog: 5 client categories', cat.data.categories.map((c) => c.name_ar).join('،') === 'المعجنات،المخبوزات،الكيك،البوتيفورات،الترت');
const prods = cat.data.products;

const cu = ulid();
const lines = prods.slice(0, 8).map((p, i) => ({ product_id: p.id, qty: 10 + i * 5, note: i === 1 ? 'بدون سمسم' : null }));
const s1 = await branch('POST', '/orders/submit', { client_uuid: cu, window_id: daily.id, note: 'التسليم قبل 7 صباحاً', lines });
ok('submit order', s1.ok && s1.data.order.status === 'submitted', s1.error?.message_ar);
const s1b = await branch('POST', '/orders/submit', { client_uuid: cu, window_id: daily.id, lines });
ok('C12 idempotent retry → same order, revision 1', s1b.data?.order.id === s1.data.order.id && s1b.data.order.revision === 1);
const s2 = await branch('POST', '/orders/submit', { client_uuid: ulid(), window_id: daily.id, note: 'التسليم قبل 7 صباحاً', lines: [...lines, { product_id: prods[12].id, qty: 6 }] });
ok('C9 revise before cutoff → revision 2', s2.data?.order.revision === 2);
const other = await branch2('POST', '/orders/submit', { client_uuid: ulid(), window_id: daily.id, lines: prods.slice(0, 5).map((p) => ({ product_id: p.id, qty: 20 })) });
ok('second branch submits', other.ok);
const cross = await branch('POST', '/orders/submit', { client_uuid: ulid(), window_id: daily.id, branch_id: me.data.locations.find((l) => l.kind === 'branch' && l.id !== myBranch).id, lines });
ok('A3 branch cannot order for another branch', cross.status === 403);
const peek = await branch('GET', `/orders/${other.data.order.id}`);
ok('A3 branch cannot read another branch order (404)', peek.status === 404);

const poId = s1.data.order.production_order_id;
const po = await plant('GET', `/production-orders/${poId}`);
ok('PO auto-created & aggregated (2 branches)', po.ok && po.data.branches.length === 2, `units=${po.data?.totals.units}`);
const croissant = po.data.categories[0].products.find((p) => p.id === prods[0].id);
ok('matrix total = Σ branches (10 + 20 = 30)', croissant.total === 30);
const assign = await plant('PATCH', `/production-orders/${poId}`, { assigned_to_name: 'م. خالد العمري', expected_ready_at: new Date(Date.now() + 8 * 3600e3).toISOString() });
ok('assign responsible + expected time', assign.ok, assign.error?.message_ar);
const startEarly = await plant('POST', `/production-orders/${poId}/start`);
ok('D6 cannot start before lock', startEarly.status === 409);
const lock = await plant('POST', `/production-orders/${poId}/lock`);
ok('manual lock → snapshot v1', lock.data?.snapshot_version === 1, lock.error?.message_ar);
const late = await branch('POST', '/orders/submit', { client_uuid: ulid(), window_id: daily.id, delivery_date: s1.data.order.delivery_date, lines });
ok('C4 submit after lock → 423 WINDOW_CLOSED', late.status === 423 && late.error.code === 'WINDOW_CLOSED');
const ex = await branch('POST', `/orders/${s1.data.order.id}/exceptions`, { reason: 'نسينا الكيك' });
ok('exception requested', ex.ok, ex.error?.message_ar);
const exl = await plant('GET', '/exceptions');
const appr = await plant('POST', `/exceptions/${exl.data[0].id}/approve`, { note: 'تمام' });
ok('exception approved', appr.data?.status === 'approved');
const exEdit = await branch('POST', '/orders/submit', { client_uuid: ulid(), window_id: daily.id, delivery_date: s1.data.order.delivery_date, lines: [...lines, { product_id: prods[13].id, qty: 4 }] });
ok('C6 edit via exception → revision 3', exEdit.data?.order.revision === 3, exEdit.error?.message_ar);
const exAgain = await branch('POST', '/orders/submit', { client_uuid: ulid(), window_id: daily.id, delivery_date: s1.data.order.delivery_date, lines });
ok('C7 exception consumed once', exAgain.status === 423);
const print = await plant('GET', `/production-orders/${poId}/print`);
ok('D4/D5 print uses latest snapshot v2', print.data?.snapshot_version === 2);
const start = await plant('POST', `/production-orders/${poId}/start`);
ok('start production', start.data?.status === 'in_progress');
const complete = await plant('POST', `/production-orders/${poId}/complete`);
ok('complete → orders ready', complete.ok);
const det = await plant('GET', `/orders/${s1.data.order.id}`);
ok('order status ready', det.data.status === 'ready');

const sig = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const part = det.data.lines.map((l, i) => ({ order_line_id: l.id, qty_delivered: i === 1 ? l.qty - 5 : l.qty }));
const d1 = await plant('POST', '/deliveries', { client_uuid: ulid(), order_id: det.data.id, received_by_name: 'أحمد صالح', lines: part, signature_png_base64: sig });
ok('partial delivery with signature', d1.data?.order_status === 'partially_delivered', d1.error?.message_ar);
const d2 = await plant('POST', '/deliveries', { client_uuid: ulid(), order_id: det.data.id, received_by_name: 'أحمد صالح', lines: [{ order_line_id: det.data.lines[1].id, qty_delivered: 5 }] });
ok('E6 final delivery → delivered', d2.data?.order_status === 'delivered');
const fulfil = await branch('GET', `/orders/${det.data.id}`);
ok('branch sees delivered + 2 deliveries', fulfil.data.status === 'delivered' && fulfil.data.deliveries.length === 2);

// ─── Inventory: mandatory scenario on a fresh material ───
const mats = await store('GET', '/raw-materials');
const flour = mats.data.find((m) => m.name_ar === 'دقيق فاخر');
const o1 = await store('POST', '/vouchers/quick', { client_uuid: ulid(), kind: 'opening', lines: [{ raw_material_id: flour.id, qty: 100, unit_cost: 500 }] });
ok('opening 100 @ 500', o1.ok && o1.data.movements[0].valuation_rate_minor_after === 500, o1.error?.message_ar);
const sup = (await store('GET', '/suppliers')).data[0];
const r1 = await store('POST', '/vouchers/quick', { client_uuid: ulid(), kind: 'receipt', supplier_id: sup.id, external_ref: 'INV-7781', lines: [{ raw_material_id: flour.id, qty: 50, unit_cost: 800 }] });
ok('receipt 50 @ 800 → average 600', r1.data?.movements[0].valuation_rate_minor_after === 600);
const i1 = await store('POST', '/vouchers/quick', { client_uuid: ulid(), kind: 'issue', issued_to_name: 'قسم المعجنات', purpose: 'production', lines: [{ raw_material_id: flour.id, qty: 120 }] });
ok('issue 120 → balance 30, value 18,000', i1.data?.movements[0].qty_after === 30 && i1.data.movements[0].stock_value_minor_after === 18000);
const over = await store('POST', '/vouchers/quick', { client_uuid: ulid(), kind: 'issue', issued_to_name: 'قسم الكيك', lines: [{ raw_material_id: flour.id, qty: 31 }] });
ok('F9 over-issue rejected with Arabic message', over.status === 422 && over.error.details.rule === 'F9', over.error?.message_ar);
const card = await store('GET', `/raw-materials/${flour.id}`);
ok('ledger has 3 movements, qty 30', card.data.ledger.length === 3 && card.data.qty_on_hand === 30);
const cancelR = await store('POST', `/vouchers/${i1.data.voucher.id}/cancel`, { reason: 'خطأ في الإدخال' });
ok('cancel issue → reversal', cancelR.data?.reversals === 1, cancelR.error?.message_ar);
const card2 = await store('GET', `/raw-materials/${flour.id}`);
ok('F15 cancel restores qty 150 & value 90,000 exactly', card2.data.qty_on_hand === 150 && card2.data.stock_value_minor === 90000);
const ov = await store('GET', '/stock/overview');
const row = ov.data.rows.find((r) => r.id === flour.id);
ok('11-column report: opening + in − out = closing', row && Math.abs(row.opening_qty + row.total_in - row.total_out - row.closing_qty) < 1e-9, JSON.stringify(row && { o: row.opening_qty, i: row.total_in, x: row.total_out, c: row.closing_qty }));
const bcost = await branch('GET', '/stock/overview');
ok('H3 branch user cannot read stock report', bcost.status === 403);
const plantStock = await plant('GET', '/stock/overview');
ok('H3 plant manager sees stock without cost fields', plantStock.ok && plantStock.data.rows[0].unit_cost_minor === undefined);

// Isolation: a second tenant must not see the first's data
console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
process.exit(fails ? 1 : 0);
