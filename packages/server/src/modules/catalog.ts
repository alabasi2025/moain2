import { CategoryInput, ProductInput, ulid } from '@moain/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { authOf, requirePerm } from '../lib/auth';
import { Fail, notFound, okJson, parseBody } from '../lib/http';

export const catalog = new Hono<AppEnv>();

/** Full tree for the local cache (ETag → 304). */
catalog.get('/catalog', async (c) => {
  const a = authOf(c);
  const [categories, products, uoms, availability] = await Promise.all([
    a.db.all(`SELECT id, parent_id, name_ar, color, sort_order, is_active FROM categories WHERE tenant_id = ? ORDER BY sort_order, name_ar`, a.tenantId),
    a.db.all(`SELECT p.id, p.category_id, p.code, p.name_ar, p.uom_id, p.sort_order, p.is_active, u.name_ar AS uom_name, u.decimals AS uom_decimals
              FROM products p JOIN uoms u ON u.id = p.uom_id WHERE p.tenant_id = ? ORDER BY p.sort_order, p.name_ar`, a.tenantId),
    a.db.all(`SELECT id, code, name_ar, decimals FROM uoms WHERE tenant_id = ? ORDER BY code`, a.tenantId),
    a.db.all(`SELECT pa.product_id, pa.location_id FROM product_availability pa JOIN products p ON p.id = pa.product_id WHERE p.tenant_id = ?`, a.tenantId),
  ]);
  const body = { categories, products, uoms, availability };
  const json = JSON.stringify(body);
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(json));
  const etag = `"${[...new Uint8Array(digest)].slice(0, 10).map((b) => b.toString(16).padStart(2, '0')).join('')}"`;
  if (c.req.header('if-none-match') === etag) return c.body(null, 304);
  c.header('ETag', etag);
  return okJson(c, body);
});

catalog.post('/categories', requirePerm('catalog:write'), async (c) => {
  const a = authOf(c);
  const i = await parseBody(c, CategoryInput);
  const id = ulid();
  const max = await a.db.first<{ m: number | null }>(`SELECT MAX(sort_order) m FROM categories WHERE tenant_id = ?`, a.tenantId);
  await a.db.batch([
    a.db.prep(`INSERT INTO categories (id, tenant_id, parent_id, name_ar, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
      id, a.tenantId, i.parent_id ?? null, i.name_ar, i.color ?? null, i.sort_order ?? (max?.m ?? 0) + 10),
    a.db.audit(a.userId, 'category', id, 'create', null, i, ulid()),
  ]);
  return okJson(c, { id }, 201);
});

catalog.put('/categories/:id', requirePerm('catalog:write'), async (c) => {
  const a = authOf(c);
  const i = await parseBody(c, CategoryInput);
  const id = c.req.param('id');
  if (i.parent_id) {
    // B4: no cycles
    let cur: string | null = i.parent_id;
    for (let depth = 0; cur && depth < 50; depth++) {
      if (cur === id) throw new Fail(422, 'BUSINESS_RULE', 'لا يمكن جعل التصنيف تابعاً لنفسه', { rule: 'B4' });
      const p: { parent_id: string | null } | null = await a.db.first(`SELECT parent_id FROM categories WHERE id = ? AND tenant_id = ?`, cur, a.tenantId);
      cur = p?.parent_id ?? null;
    }
  }
  const before = await a.db.first(`SELECT * FROM categories WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!before) throw notFound('التصنيف');
  await a.db.batch([
    a.db.prep(`UPDATE categories SET name_ar = ?, parent_id = ?, color = ?, sort_order = COALESCE(?, sort_order), is_active = COALESCE(?, is_active) WHERE id = ? AND tenant_id = ?`,
      i.name_ar, i.parent_id ?? null, i.color ?? null, i.sort_order ?? null, i.is_active === undefined ? null : Number(i.is_active), id, a.tenantId),
    a.db.audit(a.userId, 'category', id, 'update', before, i, ulid()),
  ]);
  return okJson(c, { id });
});

catalog.delete('/categories/:id', requirePerm('catalog:write'), async (c) => {
  const a = authOf(c);
  const id = c.req.param('id');
  const used = await a.db.first<{ n: number }>(
    `SELECT (SELECT COUNT(*) FROM products WHERE category_id = ? AND tenant_id = ?) + (SELECT COUNT(*) FROM categories WHERE parent_id = ? AND tenant_id = ?) AS n`, id, a.tenantId, id, a.tenantId);
  if ((used?.n ?? 0) > 0) throw new Fail(409, 'CONFLICT', 'التصنيف يحتوي أصنافاً أو تصنيفات فرعية — عطّله بدلاً من حذفه', { rule: 'B3' });
  const r = await a.db.run(`DELETE FROM categories WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!r.meta.changes) throw notFound('التصنيف');
  return okJson(c, { id });
});

catalog.post('/products', requirePerm('catalog:write'), async (c) => {
  const a = authOf(c);
  const i = await parseBody(c, ProductInput);
  const id = ulid();
  const ok = await a.db.first(`SELECT 1 FROM categories WHERE id = ? AND tenant_id = ?`, i.category_id, a.tenantId);
  if (!ok) throw notFound('التصنيف');
  try {
    await a.db.batch([
      a.db.prep(`INSERT INTO products (id, tenant_id, category_id, code, name_ar, uom_id, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        id, a.tenantId, i.category_id, i.code, i.name_ar, i.uom_id, i.sort_order ?? 0),
      a.db.audit(a.userId, 'product', id, 'create', null, i, ulid()),
    ]);
  } catch (e) {
    if (String(e).includes('UNIQUE')) throw new Fail(409, 'DUPLICATE', 'الكود مستخدم لصنف آخر', { rule: 'B1' });
    throw e;
  }
  return okJson(c, { id }, 201);
});

catalog.put('/products/:id', requirePerm('catalog:write'), async (c) => {
  const a = authOf(c);
  const i = await parseBody(c, ProductInput);
  const id = c.req.param('id');
  const before = await a.db.first(`SELECT * FROM products WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!before) throw notFound('الصنف');
  try {
    await a.db.batch([
      a.db.prep(`UPDATE products SET category_id = ?, code = ?, name_ar = ?, uom_id = ?, sort_order = COALESCE(?, sort_order), is_active = COALESCE(?, is_active), updated_at = ? WHERE id = ? AND tenant_id = ?`,
        i.category_id, i.code, i.name_ar, i.uom_id, i.sort_order ?? null, i.is_active === undefined ? null : Number(i.is_active), new Date().toISOString(), id, a.tenantId),
      a.db.audit(a.userId, 'product', id, 'update', before, i, ulid()),
    ]);
  } catch (e) {
    if (String(e).includes('UNIQUE')) throw new Fail(409, 'DUPLICATE', 'الكود مستخدم لصنف آخر', { rule: 'B1' });
    throw e;
  }
  return okJson(c, { id });
});

/** B6: empty availability = available everywhere. */
catalog.put('/products/:id/availability', requirePerm('catalog:write'), async (c) => {
  const a = authOf(c);
  const id = c.req.param('id');
  const body = (await c.req.json()) as { location_ids?: unknown };
  const ids = Array.isArray(body.location_ids) ? body.location_ids.filter((x): x is string => typeof x === 'string') : [];
  const p = await a.db.first(`SELECT 1 FROM products WHERE id = ? AND tenant_id = ?`, id, a.tenantId);
  if (!p) throw notFound('الصنف');
  await a.db.batch([
    a.db.prep(`DELETE FROM product_availability WHERE product_id = ?`, id),
    ...ids.map((l) => a.db.prep(`INSERT INTO product_availability (product_id, location_id) SELECT ?, id FROM locations WHERE id = ? AND tenant_id = ?`, id, l, a.tenantId)),
  ]);
  return okJson(c, { id, location_ids: ids });
});
