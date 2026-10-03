-- =============================================================================
-- مُعين (Moain) — مخطط قاعدة البيانات
-- SQLite (Cloudflare D1) — مكتوب بـ SQL قياسي قابل للنقل إلى PostgreSQL
-- =============================================================================
-- الاصطلاحات:
--   * المعرّفات: TEXT (ULID، 26 حرفاً، قابلة للفرز زمنياً، تُولَّد على الجهاز)
--   * التواريخ/الأوقات: TEXT بصيغة ISO-8601 UTC ('2026-10-03T14:22:00Z')
--   * التواريخ فقط: TEXT 'YYYY-MM-DD'
--   * الأوقات فقط: TEXT 'HH:MM'
--   * المبالغ: INTEGER بالوحدات الصغرى (*_minor) — 1250 = 12.50
--   * الكميات: REAL مع تقريب 4 منازل في طبقة التطبيق (SQLite لا يملك DECIMAL حقيقي)
--     → عند النقل لـ Postgres: NUMERIC(18,4)
--   * المنطقية: INTEGER 0/1 مع CHECK
--   * JSON: TEXT مع CHECK(json_valid(...))
--   * كل جدول عملي يحمل tenant_id — بلا استثناء
-- =============================================================================

PRAGMA foreign_keys = ON;

-- =============================================================================
-- 0. PLATFORM — المنصة
-- =============================================================================

CREATE TABLE tenants (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','archived')),
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE tenant_settings (
  tenant_id             TEXT PRIMARY KEY REFERENCES tenants(id),
  timezone              TEXT NOT NULL DEFAULT 'Asia/Aden',
  currency_code         TEXT NOT NULL DEFAULT 'YER',
  currency_decimals     INTEGER NOT NULL DEFAULT 0 CHECK (currency_decimals BETWEEN 0 AND 4),
  numerals              TEXT NOT NULL DEFAULT 'western' CHECK (numerals IN ('western','eastern')),
  calendar              TEXT NOT NULL DEFAULT 'gregorian' CHECK (calendar IN ('gregorian','hijri_secondary')),
  week_start            INTEGER NOT NULL DEFAULT 6 CHECK (week_start BETWEEN 0 AND 6), -- 6 = السبت
  valuation_method      TEXT NOT NULL DEFAULT 'moving_avg' CHECK (valuation_method IN ('moving_avg','fifo')),
  allow_negative_stock  INTEGER NOT NULL DEFAULT 0 CHECK (allow_negative_stock IN (0,1)),
  exception_ttl_minutes INTEGER NOT NULL DEFAULT 60,
  qty_decimals          INTEGER NOT NULL DEFAULT 2 CHECK (qty_decimals BETWEEN 0 AND 4),
  updated_at            TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE tenant_branding (
  tenant_id       TEXT PRIMARY KEY REFERENCES tenants(id),
  company_name    TEXT NOT NULL,
  company_name_en TEXT,
  logo_url        TEXT,
  logo_print_url  TEXT,            -- نسخة عالية الدقة / أحادية للطباعة
  primary_color   TEXT NOT NULL DEFAULT '#8B5E3C',  -- بني مخبز افتراضي
  accent_color    TEXT NOT NULL DEFAULT '#D4A056',
  footer_text     TEXT,
  phone           TEXT,
  address         TEXT,
  tax_number      TEXT,
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE users (
  id             TEXT PRIMARY KEY,
  tenant_id      TEXT NOT NULL REFERENCES tenants(id),
  email          TEXT,
  phone          TEXT,
  full_name      TEXT NOT NULL,
  password_hash  TEXT,             -- Argon2id / scrypt
  pin_hash       TEXT,             -- للدخول السريع من جهاز موثوق
  is_active      INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  last_login_at  TEXT,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (tenant_id, email),
  UNIQUE (tenant_id, phone)
);
CREATE INDEX idx_users_tenant ON users(tenant_id);

CREATE TABLE user_roles (
  user_id      TEXT NOT NULL REFERENCES users(id),
  role         TEXT NOT NULL CHECK (role IN ('owner','admin','plant_manager','plant_staff','branch_user','storekeeper','viewer')),
  location_id  TEXT REFERENCES locations(id),   -- NULL = دور عام على كل المستأجر
  PRIMARY KEY (user_id, role, location_id)
);

CREATE TABLE trusted_devices (
  id                  TEXT PRIMARY KEY,
  user_id             TEXT NOT NULL REFERENCES users(id),
  device_fingerprint  TEXT NOT NULL,
  label               TEXT,
  user_agent          TEXT,
  last_seen_at        TEXT NOT NULL,
  revoked_at          TEXT,
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_devices_user ON trusted_devices(user_id);

CREATE TABLE sessions (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id),
  device_id    TEXT REFERENCES trusted_devices(id),
  expires_at   TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

CREATE TABLE locations (
  id                TEXT PRIMARY KEY,
  tenant_id         TEXT NOT NULL REFERENCES tenants(id),
  code              TEXT NOT NULL,
  name_ar           TEXT NOT NULL,
  name_en           TEXT,
  kind              TEXT NOT NULL CHECK (kind IN ('plant','branch','warehouse','transit')),
  default_plant_id  TEXT REFERENCES locations(id),  -- للفروع: المعمل الافتراضي
  phone             TEXT,
  address           TEXT,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  is_active         INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  custom_fields     TEXT CHECK (custom_fields IS NULL OR json_valid(custom_fields)),
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (tenant_id, code)
);
CREATE INDEX idx_locations_tenant_kind ON locations(tenant_id, kind);

CREATE TABLE uoms (
  id         TEXT PRIMARY KEY,
  tenant_id  TEXT NOT NULL REFERENCES tenants(id),
  code       TEXT NOT NULL,          -- kg, g, l, ml, pc, ctn
  name_ar    TEXT NOT NULL,
  name_en    TEXT,
  decimals   INTEGER NOT NULL DEFAULT 2 CHECK (decimals BETWEEN 0 AND 4),
  UNIQUE (tenant_id, code)
);

CREATE TABLE uom_conversions (
  from_uom_id  TEXT NOT NULL REFERENCES uoms(id),
  to_uom_id    TEXT NOT NULL REFERENCES uoms(id),
  factor       REAL NOT NULL CHECK (factor > 0),   -- 1 from = factor to
  PRIMARY KEY (from_uom_id, to_uom_id)
);

CREATE TABLE sequences (
  tenant_id   TEXT NOT NULL REFERENCES tenants(id),
  key         TEXT NOT NULL,     -- 'PO','DLV','RCV','ISS','ADJ','TRF','WST','RTN','CNT'
  year        INTEGER NOT NULL,
  next_value  INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (tenant_id, key, year)
);

CREATE TABLE custom_field_defs (
  id           TEXT PRIMARY KEY,
  tenant_id    TEXT NOT NULL REFERENCES tenants(id),
  entity_type  TEXT NOT NULL,   -- 'product','raw_material','location','order','voucher'
  key          TEXT NOT NULL,
  label_ar     TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('text','number','date','select','bool')),
  options      TEXT CHECK (options IS NULL OR json_valid(options)),
  required     INTEGER NOT NULL DEFAULT 0 CHECK (required IN (0,1)),
  sort_order   INTEGER NOT NULL DEFAULT 0,
  UNIQUE (tenant_id, entity_type, key)
);

CREATE TABLE audit_log (
  id           TEXT PRIMARY KEY,
  tenant_id    TEXT NOT NULL REFERENCES tenants(id),
  actor_id     TEXT REFERENCES users(id),      -- NULL = النظام (cron)
  entity_type  TEXT NOT NULL,
  entity_id    TEXT NOT NULL,
  action       TEXT NOT NULL,                  -- create|update|delete|submit|lock|post|cancel|approve|...
  before       TEXT CHECK (before IS NULL OR json_valid(before)),
  after        TEXT CHECK (after IS NULL OR json_valid(after)),
  ip           TEXT,
  device_id    TEXT,
  at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_audit_entity ON audit_log(tenant_id, entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_log(tenant_id, actor_id, at);
CREATE INDEX idx_audit_at ON audit_log(tenant_id, at);

-- سجل التدقيق غير قابل للتعديل أو الحذف
CREATE TRIGGER trg_audit_log_immutable_upd BEFORE UPDATE ON audit_log
BEGIN SELECT RAISE(ABORT, 'audit_log is append-only'); END;
CREATE TRIGGER trg_audit_log_immutable_del BEFORE DELETE ON audit_log
BEGIN SELECT RAISE(ABORT, 'audit_log is append-only'); END;

CREATE TABLE notifications (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL REFERENCES tenants(id),
  user_id     TEXT NOT NULL REFERENCES users(id),
  kind        TEXT NOT NULL,   -- order_submitted|window_closed|order_ready|delivered|low_stock|exception_requested|...
  title_ar    TEXT NOT NULL,
  body_ar     TEXT,
  payload     TEXT CHECK (payload IS NULL OR json_valid(payload)),
  read_at     TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_notif_user_unread ON notifications(user_id, read_at, created_at);

CREATE TABLE push_subscriptions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- =============================================================================
-- 1. CATALOG — الكتالوج
-- =============================================================================

CREATE TABLE categories (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL REFERENCES tenants(id),
  parent_id   TEXT REFERENCES categories(id),
  name_ar     TEXT NOT NULL,
  name_en     TEXT,
  color       TEXT,             -- #hex لتمييز بصري
  icon        TEXT,             -- اسم أيقونة
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_categories_tenant_parent ON categories(tenant_id, parent_id, sort_order);

CREATE TABLE products (
  id             TEXT PRIMARY KEY,
  tenant_id      TEXT NOT NULL REFERENCES tenants(id),
  category_id    TEXT NOT NULL REFERENCES categories(id),
  code           TEXT NOT NULL,
  name_ar        TEXT NOT NULL,
  name_en        TEXT,
  uom_id         TEXT NOT NULL REFERENCES uoms(id),
  image_url      TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_active      INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  custom_fields  TEXT CHECK (custom_fields IS NULL OR json_valid(custom_fields)),
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (tenant_id, code)
);
CREATE INDEX idx_products_tenant_cat ON products(tenant_id, category_id, sort_order);
CREATE INDEX idx_products_active ON products(tenant_id, is_active);

-- فارغ = المنتج متاح لكل الفروع. وجود صفوف = متاح فقط للفروع المذكورة.
CREATE TABLE product_availability (
  product_id   TEXT NOT NULL REFERENCES products(id),
  location_id  TEXT NOT NULL REFERENCES locations(id),
  PRIMARY KEY (product_id, location_id)
);

-- =============================================================================
-- 2. ORDERING — الطلبيات
-- =============================================================================

CREATE TABLE order_windows (
  id                    TEXT PRIMARY KEY,
  tenant_id             TEXT NOT NULL REFERENCES tenants(id),
  plant_id              TEXT NOT NULL REFERENCES locations(id),
  name_ar               TEXT NOT NULL,            -- 'الطلبية اليومية', 'طلبية مسائية', 'طارئ'
  kind                  TEXT NOT NULL DEFAULT 'regular' CHECK (kind IN ('regular','urgent')),
  opens_at              TEXT,                     -- 'HH:MM' أو NULL = مفتوح دائماً
  cutoff_time           TEXT,                     -- 'HH:MM' أو NULL = لا إغلاق (طارئ)
  delivery_offset_days  INTEGER NOT NULL DEFAULT 1 CHECK (delivery_offset_days BETWEEN 0 AND 7),
  sort_order            INTEGER NOT NULL DEFAULT 0,
  is_active             INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1))
);
CREATE INDEX idx_windows_plant ON order_windows(tenant_id, plant_id, is_active);

CREATE TABLE orders (
  id                   TEXT PRIMARY KEY,
  tenant_id            TEXT NOT NULL REFERENCES tenants(id),
  branch_id            TEXT NOT NULL REFERENCES locations(id),
  plant_id             TEXT NOT NULL REFERENCES locations(id),
  window_id            TEXT NOT NULL REFERENCES order_windows(id),
  delivery_date        TEXT NOT NULL,             -- 'YYYY-MM-DD'
  status               TEXT NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft','submitted','locked','in_production','ready','partially_delivered','delivered','cancelled')),
  note                 TEXT,
  submitted_by         TEXT REFERENCES users(id),
  submitted_at         TEXT,
  production_order_id  TEXT REFERENCES production_orders(id),
  client_uuid          TEXT NOT NULL,             -- idempotency من الجهاز
  revision             INTEGER NOT NULL DEFAULT 1,
  cancel_reason        TEXT,
  created_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (tenant_id, client_uuid),
  UNIQUE (branch_id, window_id, delivery_date)    -- طلبية واحدة لكل فرع/نافذة/يوم
);
CREATE INDEX idx_orders_branch_date ON orders(tenant_id, branch_id, delivery_date DESC);
CREATE INDEX idx_orders_plant_date_status ON orders(tenant_id, plant_id, delivery_date, status);
CREATE INDEX idx_orders_po ON orders(production_order_id);

CREATE TABLE order_lines (
  id          TEXT PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  TEXT NOT NULL REFERENCES products(id),
  qty         REAL NOT NULL CHECK (qty > 0),
  note        TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  UNIQUE (order_id, product_id)
);
CREATE INDEX idx_order_lines_product ON order_lines(product_id);

CREATE TABLE order_revisions (
  id              TEXT PRIMARY KEY,
  order_id        TEXT NOT NULL REFERENCES orders(id),
  revision        INTEGER NOT NULL,
  lines_snapshot  TEXT NOT NULL CHECK (json_valid(lines_snapshot)),
  note_snapshot   TEXT,
  reason          TEXT,
  changed_by      TEXT REFERENCES users(id),
  changed_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (order_id, revision)
);

CREATE TABLE order_exceptions (
  id            TEXT PRIMARY KEY,
  order_id      TEXT NOT NULL REFERENCES orders(id),
  requested_by  TEXT NOT NULL REFERENCES users(id),
  reason        TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired')),
  decided_by    TEXT REFERENCES users(id),
  decided_at    TEXT,
  decision_note TEXT,
  requested_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  expires_at    TEXT NOT NULL
);
CREATE INDEX idx_exceptions_pending ON order_exceptions(status, expires_at);

-- =============================================================================
-- 3. PRODUCTION — الإنتاج
-- =============================================================================

CREATE TABLE production_orders (
  id                 TEXT PRIMARY KEY,
  tenant_id          TEXT NOT NULL REFERENCES tenants(id),
  plant_id           TEXT NOT NULL REFERENCES locations(id),
  window_id          TEXT NOT NULL REFERENCES order_windows(id),
  delivery_date      TEXT NOT NULL,
  number             TEXT NOT NULL,                -- 'PO-2026-00123'
  status             TEXT NOT NULL DEFAULT 'open'
                     CHECK (status IN ('open','locked','in_progress','completed','delivered','cancelled')),
  assigned_to        TEXT REFERENCES users(id),
  expected_ready_at  TEXT,
  locked_at          TEXT,
  locked_by          TEXT REFERENCES users(id),    -- NULL = تلقائي
  started_at         TEXT,
  completed_at       TEXT,
  note               TEXT,
  created_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (tenant_id, number),
  UNIQUE (plant_id, window_id, delivery_date)
);
CREATE INDEX idx_po_plant_date ON production_orders(tenant_id, plant_id, delivery_date DESC);
CREATE INDEX idx_po_status ON production_orders(tenant_id, status);

CREATE TABLE production_sections (
  id                   TEXT PRIMARY KEY,
  production_order_id  TEXT NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
  category_id          TEXT REFERENCES categories(id),   -- NULL = قسم عام
  name_ar              TEXT,
  assigned_to          TEXT REFERENCES users(id),
  expected_ready_at    TEXT,
  status               TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  completed_at         TEXT,
  sort_order           INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE production_snapshots (
  id                   TEXT PRIMARY KEY,
  production_order_id  TEXT NOT NULL REFERENCES production_orders(id),
  version              INTEGER NOT NULL,
  demand_matrix        TEXT NOT NULL CHECK (json_valid(demand_matrix)),
  -- شكل JSON:
  -- { "branches":[{"id","code","name"}],
  --   "categories":[{"id","name","products":[{"id","code","name","uom","total",
  --                   "by_branch":{"<branch_id>":{"qty","note"}}, "notes":[...]}]}],
  --   "order_notes":[{"branch_id","note"}], "totals":{...} }
  reason               TEXT,                       -- 'cutoff' | 'manual_lock' | 'exception:<id>'
  created_by           TEXT REFERENCES users(id),
  created_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (production_order_id, version)
);

-- =============================================================================
-- 4. FULFILLMENT — التسليم
-- =============================================================================

CREATE TABLE deliveries (
  id                   TEXT PRIMARY KEY,
  tenant_id            TEXT NOT NULL REFERENCES tenants(id),
  order_id             TEXT NOT NULL REFERENCES orders(id),
  number               TEXT NOT NULL,               -- 'DLV-2026-00456'
  delivered_by         TEXT NOT NULL REFERENCES users(id),
  received_by_name     TEXT NOT NULL,
  received_by_user_id  TEXT REFERENCES users(id),
  delivered_at         TEXT NOT NULL,
  signature_blob       BLOB,                        -- PNG صغير أو NULL
  signature_mime       TEXT,
  note                 TEXT,
  client_uuid          TEXT NOT NULL,
  created_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (tenant_id, number),
  UNIQUE (tenant_id, client_uuid)
);
CREATE INDEX idx_deliveries_order ON deliveries(order_id);

CREATE TABLE delivery_lines (
  id             TEXT PRIMARY KEY,
  delivery_id    TEXT NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  order_line_id  TEXT NOT NULL REFERENCES order_lines(id),
  qty_delivered  REAL NOT NULL CHECK (qty_delivered >= 0),
  note           TEXT
);
CREATE INDEX idx_delivery_lines_ol ON delivery_lines(order_line_id);

-- التسليم غير قابل للتعديل بعد الإنشاء
CREATE TRIGGER trg_deliveries_immutable BEFORE UPDATE ON deliveries
BEGIN SELECT RAISE(ABORT, 'deliveries are immutable; record a new delivery or a return'); END;

-- =============================================================================
-- 5. INVENTORY — المخزون
-- =============================================================================

CREATE TABLE raw_material_categories (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL REFERENCES tenants(id),
  parent_id   TEXT REFERENCES raw_material_categories(id),
  name_ar     TEXT NOT NULL,
  name_en     TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1))
);

CREATE TABLE raw_materials (
  id                       TEXT PRIMARY KEY,
  tenant_id                TEXT NOT NULL REFERENCES tenants(id),
  category_id              TEXT REFERENCES raw_material_categories(id),
  code                     TEXT NOT NULL,
  name_ar                  TEXT NOT NULL,
  name_en                  TEXT,
  uom_id                   TEXT NOT NULL REFERENCES uoms(id),
  safety_stock             REAL NOT NULL DEFAULT 0 CHECK (safety_stock >= 0),
  default_unit_cost_minor  INTEGER,                 -- يُستخدم إن لم يُدخل سعر في التوريد
  shelf_life_days          INTEGER,
  is_active                INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  custom_fields            TEXT CHECK (custom_fields IS NULL OR json_valid(custom_fields)),
  created_at               TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at               TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (tenant_id, code)
  -- ⚠️ لا يوجد عمود quantity هنا. عمداً. الرصيد مشتق من stock_movements.
);
CREATE INDEX idx_rm_tenant_cat ON raw_materials(tenant_id, category_id);

CREATE TABLE suppliers (
  id         TEXT PRIMARY KEY,
  tenant_id  TEXT NOT NULL REFERENCES tenants(id),
  name       TEXT NOT NULL,
  phone      TEXT,
  address    TEXT,
  note       TEXT,
  is_active  INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE vouchers (
  id                  TEXT PRIMARY KEY,
  tenant_id           TEXT NOT NULL REFERENCES tenants(id),
  kind                TEXT NOT NULL CHECK (kind IN ('opening','receipt','issue','adjustment','transfer','waste','return_in','return_out')),
  number              TEXT NOT NULL,              -- 'RCV-2026-00001'
  location_id         TEXT NOT NULL REFERENCES locations(id),
  to_location_id      TEXT REFERENCES locations(id),       -- transfer فقط
  supplier_id         TEXT REFERENCES suppliers(id),       -- receipt / return_out
  external_ref        TEXT,                                -- رقم فاتورة المورد
  issued_to_name      TEXT,                                -- issue: اسم الساحب
  issued_to_user_id   TEXT REFERENCES users(id),
  purpose             TEXT,                                -- issue: 'production'|'cleaning'|'other'
  ref_type            TEXT,                                -- 'production_order' | NULL
  ref_id              TEXT,
  voucher_date        TEXT NOT NULL,                       -- 'YYYY-MM-DD'
  status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','posted','cancelled')),
  note                TEXT,
  created_by          TEXT NOT NULL REFERENCES users(id),
  posted_by           TEXT REFERENCES users(id),
  posted_at           TEXT,
  cancelled_by        TEXT REFERENCES users(id),
  cancelled_at        TEXT,
  cancel_reason       TEXT,
  client_uuid         TEXT NOT NULL,
  custom_fields       TEXT CHECK (custom_fields IS NULL OR json_valid(custom_fields)),
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (tenant_id, number),
  UNIQUE (tenant_id, client_uuid),
  CHECK (kind <> 'transfer' OR to_location_id IS NOT NULL)
);
CREATE INDEX idx_vouchers_tenant_date ON vouchers(tenant_id, voucher_date DESC);
CREATE INDEX idx_vouchers_kind_status ON vouchers(tenant_id, kind, status);
CREATE INDEX idx_vouchers_ref ON vouchers(ref_type, ref_id);

CREATE TABLE voucher_lines (
  id               TEXT PRIMARY KEY,
  voucher_id       TEXT NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  raw_material_id  TEXT NOT NULL REFERENCES raw_materials(id),
  qty              REAL NOT NULL CHECK (qty <> 0),   -- موجبة دائماً ما عدا adjustment (مُوقَّعة)
  unit_cost_minor  INTEGER,                           -- receipt: إلزامي منطقياً؛ غيره: يُملأ عند الترحيل
  expiry_date      TEXT,
  note             TEXT,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  UNIQUE (voucher_id, raw_material_id)
);

-- السند المُرحَّل غير قابل للتعديل (الإلغاء يمر عبر خدمة تُنشئ حركات عكسية ثم تُحدّث status فقط)
CREATE TRIGGER trg_vouchers_posted_immutable BEFORE UPDATE ON vouchers
WHEN OLD.status = 'posted' AND (
  NEW.kind <> OLD.kind OR NEW.location_id <> OLD.location_id OR NEW.voucher_date <> OLD.voucher_date
  OR NEW.supplier_id IS NOT OLD.supplier_id OR NEW.to_location_id IS NOT OLD.to_location_id
)
BEGIN SELECT RAISE(ABORT, 'posted voucher core fields are immutable'); END;

CREATE TRIGGER trg_voucher_lines_posted_immutable_upd BEFORE UPDATE ON voucher_lines
WHEN (SELECT status FROM vouchers WHERE id = OLD.voucher_id) <> 'draft'
BEGIN SELECT RAISE(ABORT, 'lines of a non-draft voucher are immutable'); END;

CREATE TRIGGER trg_voucher_lines_posted_immutable_del BEFORE DELETE ON voucher_lines
WHEN (SELECT status FROM vouchers WHERE id = OLD.voucher_id) <> 'draft'
BEGIN SELECT RAISE(ABORT, 'lines of a non-draft voucher cannot be deleted'); END;

-- -----------------------------------------------------------------------------
-- الدفتر — مصدر الحقيقة الوحيد للمخزون
-- -----------------------------------------------------------------------------
CREATE TABLE stock_movements (
  id                           TEXT PRIMARY KEY,
  tenant_id                    TEXT NOT NULL REFERENCES tenants(id),
  raw_material_id              TEXT NOT NULL REFERENCES raw_materials(id),
  location_id                  TEXT NOT NULL REFERENCES locations(id),
  qty                          REAL NOT NULL CHECK (qty <> 0),       -- مُوقَّعة: + دخول، − خروج
  reason                       TEXT NOT NULL CHECK (reason IN ('opening','receipt','issue','adjustment','count','transfer','return','waste','reversal')),
  unit_cost_minor              INTEGER NOT NULL,                     -- تكلفة الوحدة لهذه الحركة
  qty_after                    REAL NOT NULL,                        -- الرصيد بعد الحركة
  valuation_rate_minor_after   INTEGER NOT NULL,                     -- المتوسط المرجّح بعد الحركة
  stock_value_minor_after      INTEGER NOT NULL,                     -- qty_after × rate
  stock_value_diff_minor       INTEGER NOT NULL,                     -- الفرق عن الحركة السابقة
  ref_type                     TEXT,                                 -- 'voucher' | 'count_session' | 'migration'
  ref_id                       TEXT,
  voucher_line_id              TEXT REFERENCES voucher_lines(id),
  reverses_movement_id         TEXT REFERENCES stock_movements(id),
  actor_id                     TEXT NOT NULL REFERENCES users(id),   -- إلزامي. حركة بلا فاعل = مجهولة
  note                         TEXT,
  occurred_at                  TEXT NOT NULL,                        -- تاريخ العملية الفعلي (من السند)
  created_at                   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))  -- وقت التسجيل (يكسر التعادل)
);
CREATE INDEX idx_sm_material_location_time ON stock_movements(raw_material_id, location_id, occurred_at, created_at);
CREATE INDEX idx_sm_tenant_time ON stock_movements(tenant_id, occurred_at);
CREATE INDEX idx_sm_ref ON stock_movements(ref_type, ref_id);
CREATE INDEX idx_sm_reason ON stock_movements(tenant_id, reason, occurred_at);

-- ⚠️ القاعدة الذهبية: الدفتر لا يُعدَّل ولا يُحذف. أبداً. التصحيح = حركة عكسية.
CREATE TRIGGER trg_stock_movements_no_update BEFORE UPDATE ON stock_movements
BEGIN SELECT RAISE(ABORT, 'stock_movements is append-only: corrections are new reversal rows'); END;
CREATE TRIGGER trg_stock_movements_no_delete BEFORE DELETE ON stock_movements
BEGIN SELECT RAISE(ABORT, 'stock_movements is append-only: corrections are new reversal rows'); END;

-- Cache اختياري للرصيد — يُفعَّل فقط عند الحاجة. الدفتر دائماً هو الحق.
CREATE TABLE stock_balances (
  raw_material_id       TEXT NOT NULL REFERENCES raw_materials(id),
  location_id           TEXT NOT NULL REFERENCES locations(id),
  qty                   REAL NOT NULL,
  valuation_rate_minor  INTEGER NOT NULL,
  stock_value_minor     INTEGER NOT NULL,
  last_movement_id      TEXT REFERENCES stock_movements(id),
  updated_at            TEXT NOT NULL,
  PRIMARY KEY (raw_material_id, location_id)
);

-- يُحدّث الـ cache تلقائياً مع كل حركة
CREATE TRIGGER trg_stock_balances_upsert AFTER INSERT ON stock_movements
BEGIN
  INSERT INTO stock_balances (raw_material_id, location_id, qty, valuation_rate_minor, stock_value_minor, last_movement_id, updated_at)
  VALUES (NEW.raw_material_id, NEW.location_id, NEW.qty_after, NEW.valuation_rate_minor_after, NEW.stock_value_minor_after, NEW.id, NEW.created_at)
  ON CONFLICT (raw_material_id, location_id) DO UPDATE SET
    qty = excluded.qty,
    valuation_rate_minor = excluded.valuation_rate_minor,
    stock_value_minor = excluded.stock_value_minor,
    last_movement_id = excluded.last_movement_id,
    updated_at = excluded.updated_at;
END;

-- -----------------------------------------------------------------------------
-- الجرد
-- -----------------------------------------------------------------------------
CREATE TABLE count_sessions (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT NOT NULL REFERENCES tenants(id),
  location_id   TEXT NOT NULL REFERENCES locations(id),
  number        TEXT NOT NULL,                     -- 'CNT-2026-00007'
  status        TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','review','committed','cancelled')),
  scope         TEXT NOT NULL DEFAULT 'full' CHECK (scope IN ('full','cycle')),
  opened_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  opened_by     TEXT NOT NULL REFERENCES users(id),
  committed_at  TEXT,
  committed_by  TEXT REFERENCES users(id),
  note          TEXT,
  UNIQUE (tenant_id, number)
);
CREATE INDEX idx_count_sessions_loc ON count_sessions(tenant_id, location_id, status);

CREATE TABLE count_lines (
  id               TEXT PRIMARY KEY,
  session_id       TEXT NOT NULL REFERENCES count_sessions(id) ON DELETE CASCADE,
  raw_material_id  TEXT NOT NULL REFERENCES raw_materials(id),
  expected_qty     REAL NOT NULL,                  -- snapshot لحظة الفتح — لا يتغير
  counted_qty      REAL,                           -- NULL = لم يُعدّ بعد
  counted_by       TEXT REFERENCES users(id),
  counted_at       TEXT,
  note             TEXT,
  UNIQUE (session_id, raw_material_id)
);

CREATE TRIGGER trg_count_lines_committed_immutable BEFORE UPDATE ON count_lines
WHEN (SELECT status FROM count_sessions WHERE id = OLD.session_id) = 'committed'
BEGIN SELECT RAISE(ABORT, 'committed count session is read-only'); END;

-- -----------------------------------------------------------------------------
-- الوصفات (M3) — موجودة في المخطط، تُفعَّل لاحقاً
-- -----------------------------------------------------------------------------
CREATE TABLE recipes (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL REFERENCES tenants(id),
  product_id  TEXT NOT NULL REFERENCES products(id),
  version     INTEGER NOT NULL DEFAULT 1,
  yield_qty   REAL NOT NULL CHECK (yield_qty > 0),   -- الوصفة تنتج كم وحدة منتج
  is_active   INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  note        TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (product_id, version)
);

CREATE TABLE recipe_lines (
  recipe_id        TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  raw_material_id  TEXT NOT NULL REFERENCES raw_materials(id),
  qty_per_yield    REAL NOT NULL CHECK (qty_per_yield > 0),
  PRIMARY KEY (recipe_id, raw_material_id)
);

-- =============================================================================
-- 6. REPORTING VIEWS — عروض التقارير (قراءة فقط)
-- =============================================================================

-- الرصيد الحالي لكل مادة/موقع (من الدفتر مباشرة — المرجع)
CREATE VIEW v_stock_on_hand AS
SELECT
  sm.tenant_id,
  sm.raw_material_id,
  sm.location_id,
  sm.qty_after                   AS qty,
  sm.valuation_rate_minor_after  AS valuation_rate_minor,
  sm.stock_value_minor_after     AS stock_value_minor,
  sm.occurred_at                 AS last_movement_at
FROM stock_movements sm
JOIN (
  SELECT raw_material_id, location_id, MAX(occurred_at || created_at) AS k
  FROM stock_movements
  GROUP BY raw_material_id, location_id
) last ON last.raw_material_id = sm.raw_material_id
      AND last.location_id = sm.location_id
      AND (sm.occurred_at || sm.created_at) = last.k;

-- بطاقة المادة الكاملة (الأعمدة الـ 11 التي طلبها العميل + الحالة)
-- ملاحظة: "أول المدة" و"الوارد/الصادر في الفترة" تُحسب في الاستعلام بمعاملات :from, :to
-- هذا العرض يعطي الوضع الحالي؛ التقرير الفتري في 05-business-rules.md
CREATE VIEW v_raw_material_card AS
SELECT
  rm.tenant_id,
  rm.id                                   AS raw_material_id,
  rm.code,
  rmc.name_ar                             AS category_name,
  rm.name_ar,
  u.code                                  AS uom_code,
  u.name_ar                               AS uom_name,
  rm.safety_stock,
  COALESCE(oh.qty, 0)                     AS qty_on_hand,
  COALESCE(oh.valuation_rate_minor, rm.default_unit_cost_minor, 0) AS unit_cost_minor,
  COALESCE(oh.stock_value_minor, 0)       AS stock_value_minor,
  CASE
    WHEN COALESCE(oh.qty,0) <= 0 THEN 'out'
    WHEN COALESCE(oh.qty,0) < rm.safety_stock THEN 'low'
    ELSE 'ok'
  END                                     AS stock_status,
  oh.location_id,
  rm.is_active
FROM raw_materials rm
LEFT JOIN raw_material_categories rmc ON rmc.id = rm.category_id
JOIN uoms u ON u.id = rm.uom_id
LEFT JOIN v_stock_on_hand oh ON oh.raw_material_id = rm.id;

-- المواد تحت حد الأمان
CREATE VIEW v_low_stock AS
SELECT * FROM v_raw_material_card WHERE stock_status IN ('low','out') AND is_active = 1;

-- طلب الإنتاج المجمّع (صنف × فرع) لأمر إنتاج — يُستخدم لبناء snapshot وللعرض الحي
CREATE VIEW v_production_demand AS
SELECT
  po.id                 AS production_order_id,
  po.tenant_id,
  p.category_id,
  c.name_ar             AS category_name,
  c.sort_order          AS category_sort,
  p.id                  AS product_id,
  p.code                AS product_code,
  p.name_ar             AS product_name,
  p.sort_order          AS product_sort,
  u.code                AS uom_code,
  o.branch_id,
  l.code                AS branch_code,
  l.name_ar             AS branch_name,
  ol.qty,
  ol.note               AS line_note,
  o.note                AS order_note,
  o.status              AS order_status
FROM production_orders po
JOIN orders o        ON o.production_order_id = po.id AND o.status NOT IN ('draft','cancelled')
JOIN order_lines ol  ON ol.order_id = o.id
JOIN products p      ON p.id = ol.product_id
JOIN categories c    ON c.id = p.category_id
JOIN uoms u          ON u.id = p.uom_id
JOIN locations l     ON l.id = o.branch_id;

-- إجمالي كل صنف في أمر إنتاج
CREATE VIEW v_production_totals AS
SELECT production_order_id, tenant_id, category_id, category_name, category_sort,
       product_id, product_code, product_name, product_sort, uom_code,
       SUM(qty) AS total_qty, COUNT(DISTINCT branch_id) AS branch_count
FROM v_production_demand
GROUP BY production_order_id, product_id;

-- المطلوب مقابل المُسلَّم لكل سطر طلبية
CREATE VIEW v_order_fulfillment AS
SELECT
  o.tenant_id, o.id AS order_id, o.branch_id, o.delivery_date, o.status,
  ol.id AS order_line_id, ol.product_id, ol.qty AS qty_ordered,
  COALESCE(SUM(dl.qty_delivered), 0) AS qty_delivered,
  ol.qty - COALESCE(SUM(dl.qty_delivered), 0) AS qty_remaining
FROM orders o
JOIN order_lines ol ON ol.order_id = o.id
LEFT JOIN delivery_lines dl ON dl.order_line_id = ol.id
GROUP BY ol.id;

-- =============================================================================
-- 7. SEED — بيانات افتراضية عند إنشاء مستأجر جديد (تُنفَّذ من الكود)
-- =============================================================================
-- uoms: kg, g, l, ml, pc(حبة), ctn(كرتون), tray(صينية), dz(دزينة)
-- categories: المعجنات, المخبوزات, الكيك, البوتيفور, الترت  (كما ذكر العميل)
-- raw_material_categories: دقيق ونشويات, سكريات, دهون وزيوت, ألبان وبيض, خمائر ومحسنات, نكهات وإضافات, تغليف
-- order_windows: 'الطلبية اليومية' cutoff 22:00 offset 1 | 'طارئ' kind=urgent no cutoff offset 0
-- roles seeded by first user = owner

-- =============================================================================
-- ملاحظات النقل إلى PostgreSQL
-- =============================================================================
-- TEXT ids → TEXT (أو UUID إن أردنا)
-- REAL qty → NUMERIC(18,4)
-- INTEGER bool → BOOLEAN
-- TEXT datetime → TIMESTAMPTZ
-- TEXT json → JSONB
-- strftime default → now()
-- RAISE(ABORT) triggers → plpgsql functions RAISE EXCEPTION
-- ON CONFLICT upsert → متطابق
-- (occurred_at || created_at) ordering → ORDER BY occurred_at, created_at with DISTINCT ON
-- إضافة RLS: ALTER TABLE ... ENABLE ROW LEVEL SECURITY; POLICY USING (tenant_id = current_setting('app.tenant_id'))
