// Fills the demo tenant with a realistic day: opening stock, a receipt, an issue, and orders from both branches.
const BASE = process.env.BASE ?? 'http://localhost:8787/api/v1';
const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
async function s(email) { let c = ''; const call = async (m, p, b) => { const r = await fetch(BASE + p, { method: m, headers: { 'content-type': 'application/json', cookie: c }, body: b ? JSON.stringify(b) : undefined }); const sc = r.headers.get('set-cookie'); if (sc) c = sc.split(';')[0]; const j = await r.json(); if (!j.ok) console.error(p, j.error?.message_ar); return j.data; }; await call('POST', '/auth/login', { tenant: 'alnoor', identifier: email, password: '123456', deviceFingerprint: 'seed-' + email }); return call; }
const store = await s('store@alnoor.ye');
const mats = await store('GET', '/raw-materials');
const sup = (await store('GET', '/suppliers'))[0];
const lowOnes = new Set(['سكر ناعم', 'حليب سائل', 'بيكنج باودر']);
await store('POST', '/vouchers/quick', { client_uuid: id(), kind: 'opening', note: 'رصيد افتتاحي عند تشغيل النظام', lines: mats.map((m) => ({ raw_material_id: m.id, qty: lowOnes.has(m.name_ar) ? Math.max(1, Math.round(m.safety_stock * 0.4)) : Math.round(m.safety_stock * 2.5 + 10), unit_cost: (m.default_unit_cost_minor ?? 500) })) });
const by = (n) => mats.find((m) => m.name_ar === n) ?? mats[0];
await store('POST', '/vouchers/quick', { client_uuid: id(), kind: 'receipt', supplier_id: sup.id, external_ref: 'INV-7781', lines: [{ raw_material_id: by('دقيق فاخر').id, qty: 50, unit_cost: 800 }] });
await store('POST', '/vouchers/quick', { client_uuid: id(), kind: 'issue', issued_to_name: 'قسم المعجنات', purpose: 'production', external_ref: '1042', lines: [{ raw_material_id: by('دقيق فاخر').id, qty: 40 }, { raw_material_id: mats[3].id, qty: 3 }] });
for (const [email, f, note] of [['sitteen@alnoor.ye', 1, 'التسليم قبل 7 صباحاً لو سمحتم'], ['hadda@alnoor.ye', 0.8, null]]) {
  const b = await s(email); const me = await b('GET', '/auth/me'); const br = me.myLocationIds[0];
  const w = (await b('GET', `/windows?branch_id=${br}`)).find((x) => x.kind === 'regular');
  const cat = await b('GET', '/catalog');
  const lines = cat.products.filter((_, i) => i % 3 !== 2).map((p, i) => ({ product_id: p.id, qty: Math.round((10 + (i * 7) % 35) * f), note: i === 1 && f === 0.8 ? 'بدون سمسم' : null }));
  await b('POST', '/orders/submit', { client_uuid: id(), window_id: w.id, note, lines });
}
console.log('demo data ok');
