// Tenant isolation (A1, A2, 03-security §3.3 line 4): tenant B must get 404 for every tenant-A id.
const BASE = process.env.BASE ?? 'http://localhost:8787/api/v1';
const ulid = () => Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 12).toUpperCase();
let fails = 0;
const ok = (n, c, x = '') => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${x ? ' — ' + x : ''}`); if (!c) fails++; };
async function session(tenant, email) {
  let cookie = '';
  const call = async (m, p, b) => { const r = await fetch(BASE + p, { method: m, headers: { 'content-type': 'application/json', cookie }, body: b ? JSON.stringify(b) : undefined }); const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0]; return { status: r.status, ...(await r.json()) }; };
  const r = await call('POST', '/auth/login', { tenant, identifier: email, password: '123456', deviceFingerprint: 'iso-' + tenant });
  ok(`login ${tenant}`, r.ok, r.error?.message_ar);
  return call;
}
const A = await session('alnoor', 'owner@alnoor.ye');
const B = await session('second', 'owner@alnoor.ye'); // same email, different tenant
const orders = (await A('GET', '/orders')).data;
const pos = (await A('GET', '/production-orders')).data;
const mats = (await A('GET', '/raw-materials')).data;
const vouchers = (await A('GET', '/vouchers')).data;
const deliveries = (await A('GET', '/deliveries')).data;
const cat = (await A('GET', '/catalog')).data;
ok('tenant A has data', orders.length && pos.length && mats.length && vouchers.length && deliveries.length);
const probes = [
  ['GET', `/orders/${orders[0].id}`], ['POST', `/orders/${orders[0].id}/cancel`, { reason: 'اختبار' }], ['POST', `/orders/${orders[0].id}/exceptions`, { reason: 'اختبار' }],
  ['GET', `/production-orders/${pos[0].id}`], ['GET', `/production-orders/${pos[0].id}/print`], ['POST', `/production-orders/${pos[0].id}/lock`], ['PATCH', `/production-orders/${pos[0].id}`, { note: 'x' }],
  ['GET', `/raw-materials/${mats[0].id}`], ['GET', `/vouchers/${vouchers[0].id}`], ['POST', `/vouchers/${vouchers[0].id}/cancel`, { reason: 'اختبار' }],
  ['GET', `/deliveries/${deliveries[0].id}`], ['PUT', `/products/${cat.products[0].id}`, { category_id: cat.categories[0].id, code: 'Z', name_ar: 'اختبار', uom_id: cat.uoms[0].id }],
  ['POST', '/deliveries', { client_uuid: ulid(), order_id: orders[0].id, received_by_name: 'اختبار', lines: [{ order_line_id: 'x', qty_delivered: 1 }] }],
];
for (const [m, p, b] of probes) { const r = await B(m, p, b); ok(`B → ${m} ${p.split('/').slice(0, 2).join('/')}…  404`, r.status === 404, `${r.status}`); }
const bOrders = (await B('GET', '/orders')).data;
ok('B lists none of A orders', bOrders.every((o) => !orders.some((x) => x.id === o.id)));
console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED'); process.exit(fails ? 1 : 0);
