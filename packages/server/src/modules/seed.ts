import { ulid } from '@moain/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../env';
import { hashSecret } from '../lib/crypto';
import { Db } from '../lib/db';
import { okJson } from '../lib/http';

/**
 * Tenant bootstrap (G4) — units, the client's FIVE categories exactly as he wrote them,
 * raw-material groups, the daily + urgent windows. With demo data: two branches ("عمودين للفرعين"),
 * a realistic product list and raw materials so every flow can be tried immediately.
 */
export async function createTenant(env: AppEnv['Bindings'], slug: string, name: string, demo: boolean): Promise<{ created: boolean }> {
  if (await env.DB.prepare(`SELECT 1 FROM tenants WHERE slug = ?`).bind(slug).first()) return { created: false };
  const t = ulid();
  const db = new Db(env.DB, t);
  const pepper = env.PEPPER ?? 'moain-dev-pepper';
  const s: D1PreparedStatement[] = [
    db.prep(`INSERT INTO tenants (id, name, slug) VALUES (?, ?, ?)`, t, name, slug),
    db.prep(`INSERT INTO tenant_settings (tenant_id) VALUES (?)`, t),
    db.prep(`INSERT INTO tenant_branding (tenant_id, company_name, phone, address, footer_text) VALUES (?, ?, ?, ?, ?)`, t, name, '01-456789', 'صنعاء — شارع الستين', 'شكراً لتعاملكم معنا'),
  ];
  const U: Record<string, string> = {};
  for (const [code, n, dec] of [['kg', 'كجم', 2], ['g', 'جم', 0], ['l', 'لتر', 2], ['pc', 'حبة', 0], ['ctn', 'كرتون', 0], ['tray', 'صينية', 0], ['loaf', 'رغيف', 0], ['slice', 'قطعة', 0]] as const) {
    U[code] = ulid();
    s.push(db.prep(`INSERT INTO uoms (id, tenant_id, code, name_ar, decimals) VALUES (?, ?, ?, ?, ?)`, U[code]!, t, code, n, dec));
  }
  const C: string[] = [];
  for (const [i, [n, color]] of ([['المعجنات', '#B7791F'], ['المخبوزات', '#8B5E3C'], ['الكيك', '#9B4D6A'], ['البوتيفورات', '#5B6B8C'], ['الترت', '#3F7D5A']] as const).entries()) {
    const id = ulid(); C.push(id);
    s.push(db.prep(`INSERT INTO categories (id, tenant_id, name_ar, color, sort_order) VALUES (?, ?, ?, ?, ?)`, id, t, n, color, (i + 1) * 10));
  }
  const RC: string[] = [];
  for (const [i, n] of ['دقيق ونشويات', 'سكريات', 'دهون وزيوت', 'ألبان وبيض', 'خمائر ومحسنات', 'نكهات وإضافات', 'تغليف'].entries()) {
    const id = ulid(); RC.push(id);
    s.push(db.prep(`INSERT INTO raw_material_categories (id, tenant_id, name_ar, sort_order) VALUES (?, ?, ?, ?)`, id, t, n, (i + 1) * 10));
  }
  const plant = ulid(), wh = ulid(), b1 = ulid(), b2 = ulid();
  s.push(
    db.prep(`INSERT INTO locations (id, tenant_id, code, name_ar, kind, sort_order, phone, address) VALUES (?, ?, 'PL-01', 'المعمل المركزي', 'plant', 10, '01-456789', 'صنعاء — شارع الستين')`, plant, t),
    db.prep(`INSERT INTO locations (id, tenant_id, code, name_ar, kind, sort_order) VALUES (?, ?, 'WH-01', 'المخزن المركزي', 'warehouse', 10)`, wh, t),
    db.prep(`INSERT INTO locations (id, tenant_id, code, name_ar, kind, default_plant_id, sort_order) VALUES (?, ?, 'BR-01', 'فرع الستين', 'branch', ?, 10)`, b1, t, plant),
    db.prep(`INSERT INTO locations (id, tenant_id, code, name_ar, kind, default_plant_id, sort_order) VALUES (?, ?, 'BR-02', 'فرع حدة', 'branch', ?, 20)`, b2, t, plant),
    db.prep(`INSERT INTO order_windows (id, tenant_id, plant_id, name_ar, kind, cutoff_time, delivery_offset_days, sort_order) VALUES (?, ?, ?, 'الطلبية اليومية', 'regular', '22:00', 1, 10)`, ulid(), t, plant),
    db.prep(`INSERT INTO order_windows (id, tenant_id, plant_id, name_ar, kind, cutoff_time, delivery_offset_days, sort_order) VALUES (?, ?, ?, 'طلب عاجل', 'urgent', NULL, 0, 20)`, ulid(), t, plant),
  );

  // Users — one per role so the owner can see each experience.
  const users: [string, string, string, [string, string | null][]][] = [
    ['owner@alnoor.ye', 'عبدالله النور', '770000001', [['owner', null]]],
    ['plant@alnoor.ye', 'م. خالد العمري', '770000002', [['plant_manager', plant]]],
    ['staff@alnoor.ye', 'سامي الحداد', '770000003', [['plant_staff', plant]]],
    ['sitteen@alnoor.ye', 'أحمد صالح', '770000004', [['branch_user', b1]]],
    ['hadda@alnoor.ye', 'محمد قاسم', '770000005', [['branch_user', b2]]],
    ['store@alnoor.ye', 'فهد المخلافي', '770000006', [['storekeeper', null]]],
  ];
  const hash = await hashSecret('123456', pepper);
  const ids: string[] = [];
  for (const [email, full, phone, roles] of users) {
    const id = ulid(); ids.push(id);
    s.push(db.prep(`INSERT INTO users (id, tenant_id, email, phone, full_name, password_hash) VALUES (?, ?, ?, ?, ?, ?)`, id, t, email, phone, full, hash));
    for (const [r, loc] of roles) s.push(db.prep(`INSERT INTO user_roles (user_id, role, location_id) VALUES (?, ?, ?)`, id, r, loc));
  }
  await db.batch(s);
  if (!demo) return { created: true };

  const p: D1PreparedStatement[] = [];
  const products: [number, string, string][] = [
    [0, 'كرواسون زبدة', 'pc'], [0, 'فطيرة جبن', 'pc'], [0, 'فطيرة سبانخ', 'pc'], [0, 'بف باستري لحم', 'pc'], [0, 'سمبوسة خضار', 'pc'], [0, 'كرواسون شوكولاتة', 'pc'],
    [1, 'خبز توست أبيض', 'loaf'], [1, 'خبز بر', 'loaf'], [1, 'صمون', 'pc'], [1, 'خبز برجر', 'pc'], [1, 'كعك بالسمسم', 'pc'],
    [2, 'كيك شوكولاتة', 'slice'], [2, 'كيك فانيلا', 'slice'], [2, 'ريد فلفت', 'slice'], [2, 'كيك جزر', 'slice'],
    [3, 'بوتيفور مشكّل', 'kg'], [3, 'بوتيفور بالتمر', 'kg'], [3, 'معمول', 'kg'],
    [4, 'ترت فواكه', 'pc'], [4, 'ترت ليمون', 'pc'], [4, 'ترت شوكولاتة', 'pc'],
  ];
  products.forEach(([ci, n, u], i) => p.push(db.prep(`INSERT INTO products (id, tenant_id, category_id, code, name_ar, uom_id, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ulid(), t, C[ci]!, `PR-${String(i + 1).padStart(3, '0')}`, n, U[u]!, i)));
  const mats: [number, string, string, number, number][] = [
    [0, 'دقيق فاخر', 'kg', 50, 600], [0, 'دقيق أسمر', 'kg', 20, 550], [0, 'نشا ذرة', 'kg', 5, 900],
    [1, 'سكر ناعم', 'kg', 20, 700], [1, 'سكر بودرة', 'kg', 10, 950],
    [2, 'زبدة', 'kg', 15, 4200], [2, 'زيت نباتي', 'l', 10, 1500], [2, 'سمن نباتي', 'kg', 10, 2200],
    [3, 'بيض', 'ctn', 4, 3600], [3, 'حليب سائل', 'l', 15, 650], [3, 'جبن موزاريلا', 'kg', 8, 5200],
    [4, 'خميرة فورية', 'kg', 2, 4800], [4, 'بيكنج باودر', 'kg', 1, 3000],
    [5, 'كاكاو', 'kg', 3, 6500], [5, 'فانيلا', 'kg', 1, 9000],
    [6, 'علب كيك', 'pc', 100, 120], [6, 'أكياس خبز', 'pc', 300, 25],
  ];
  mats.forEach(([ci, n, u, safety, cost], i) => p.push(db.prep(`INSERT INTO raw_materials (id, tenant_id, category_id, code, name_ar, uom_id, safety_stock, default_unit_cost_minor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ulid(), t, RC[ci]!, `RM-${String(i + 1).padStart(3, '0')}`, n, U[u]!, safety, cost)));
  p.push(db.prep(`INSERT INTO suppliers (id, tenant_id, name, phone) VALUES (?, ?, 'شركة الأمل للمواد الغذائية', '777123456')`, ulid(), t));
  p.push(db.prep(`INSERT INTO suppliers (id, tenant_id, name, phone) VALUES (?, ?, 'مؤسسة السعيد التجارية', '777654321')`, ulid(), t));
  await db.batch(p);
  return { created: true };
}

export const seed = new Hono<AppEnv>();
/** Dev/demo bootstrap. Disabled unless DEMO=1. */
seed.post('/seed', async (c) => {
  if (c.env.DEMO !== '1') return c.json({ ok: false }, 404);
  const q = c.req.query('slug');
  const slug = q && /^[a-z0-9-]{2,32}$/.test(q) ? q : (c.env.DEFAULT_TENANT ?? 'alnoor');
  const name = slug === (c.env.DEFAULT_TENANT ?? 'alnoor') ? 'مخابز النور' : `منشأة ${slug}`;
  const r = await createTenant(c.env, slug, name, true);
  return okJson(c, { slug, ...r });
});
