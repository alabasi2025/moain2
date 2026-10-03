# مخطط الكيانات والعلاقات (ERD)

> يُعرض بـ Mermaid. يُفتح في GitHub مباشرة أو أي عارض Mermaid.

## 1. المنصة والكتالوج

```mermaid
erDiagram
    tenants ||--o{ tenant_settings : has
    tenants ||--o| tenant_branding : has
    tenants ||--o{ users : has
    tenants ||--o{ locations : has
    tenants ||--o{ uoms : has
    tenants ||--o{ categories : has
    tenants ||--o{ products : has

    users ||--o{ user_roles : has
    users ||--o{ trusted_devices : has
    users ||--o{ sessions : has
    user_roles }o--o| locations : "scoped to (optional)"

    locations ||--o{ locations : "default_plant_id (branch → plant)"

    categories ||--o{ categories : parent
    categories ||--o{ products : contains
    products }o--|| uoms : measured_in
    products ||--o{ product_availability : "visible at"
    product_availability }o--|| locations : branch

    uoms ||--o{ uom_conversions : from
    uoms ||--o{ uom_conversions : to

    tenants {
        text id PK
        text name
        text slug UK
        text status
        datetime created_at
    }
    tenant_settings {
        text tenant_id PK_FK
        text timezone
        text currency_code
        int currency_decimals
        text numerals
        text valuation_method
        bool allow_negative_stock
        int week_start
        text calendar
    }
    tenant_branding {
        text tenant_id PK_FK
        text company_name
        text logo_url
        text primary_color
        text footer_text
        text phone
        text address
    }
    users {
        text id PK
        text tenant_id FK
        text email UK
        text phone
        text full_name
        text password_hash
        text pin_hash
        bool is_active
        datetime last_login_at
    }
    user_roles {
        text user_id FK
        text role
        text location_id FK "nullable"
    }
    trusted_devices {
        text id PK
        text user_id FK
        text device_fingerprint
        text label
        datetime last_seen_at
        datetime revoked_at
    }
    locations {
        text id PK
        text tenant_id FK
        text code UK
        text name_ar
        text name_en
        text kind "plant|branch|warehouse|transit"
        text default_plant_id FK
        text phone
        text address
        int sort_order
        bool is_active
    }
    uoms {
        text id PK
        text tenant_id FK
        text code
        text name_ar
        text name_en
        int decimals
    }
    uom_conversions {
        text from_uom_id FK
        text to_uom_id FK
        decimal factor
    }
    categories {
        text id PK
        text tenant_id FK
        text parent_id FK
        text name_ar
        text name_en
        text color
        text icon
        int sort_order
        bool is_active
    }
    products {
        text id PK
        text tenant_id FK
        text category_id FK
        text code UK
        text name_ar
        text name_en
        text uom_id FK
        text image_url
        int sort_order
        bool is_active
        json custom_fields
    }
    product_availability {
        text product_id FK
        text location_id FK
    }
```

## 2. الطلبيات والإنتاج والتسليم

```mermaid
erDiagram
    locations ||--o{ order_windows : "plant has"
    order_windows ||--o{ orders : within
    locations ||--o{ orders : "branch places"
    users ||--o{ orders : submitted_by
    orders ||--o{ order_lines : contains
    order_lines }o--|| products : for
    orders ||--o{ order_revisions : history
    orders ||--o{ order_exceptions : "late edit requests"

    order_windows ||--o{ production_orders : generates
    locations ||--o{ production_orders : "plant owns"
    production_orders ||--o{ production_sections : "split by"
    production_sections }o--o| categories : "for category"
    production_sections }o--o| users : assigned_to
    production_orders ||--o{ production_snapshots : "frozen at lock"
    orders }o--o| production_orders : aggregated_into

    orders ||--o{ deliveries : fulfilled_by
    deliveries ||--o{ delivery_lines : contains
    delivery_lines }o--|| order_lines : against
    users ||--o{ deliveries : delivered_by

    order_windows {
        text id PK
        text tenant_id FK
        text plant_id FK
        text name_ar
        text kind "regular|urgent"
        time opens_at
        time cutoff_time
        int delivery_offset_days
        bool is_active
    }
    orders {
        text id PK
        text tenant_id FK
        text branch_id FK
        text plant_id FK
        text window_id FK
        date delivery_date
        text status
        text note
        text submitted_by FK
        datetime submitted_at
        text production_order_id FK
        text client_uuid UK "idempotency"
        int revision
        datetime created_at
        datetime updated_at
    }
    order_lines {
        text id PK
        text order_id FK
        text product_id FK
        decimal qty
        text note
        int sort_order
    }
    order_revisions {
        text id PK
        text order_id FK
        int revision
        json lines_snapshot
        text reason
        text changed_by FK
        datetime changed_at
    }
    order_exceptions {
        text id PK
        text order_id FK
        text requested_by FK
        text reason
        text status "pending|approved|rejected"
        text decided_by FK
        datetime decided_at
    }
    production_orders {
        text id PK
        text tenant_id FK
        text plant_id FK
        text window_id FK
        date delivery_date
        text number UK "PO-2026-00123"
        text status
        text assigned_to FK
        datetime expected_ready_at
        datetime locked_at
        datetime started_at
        datetime completed_at
        text note
    }
    production_sections {
        text id PK
        text production_order_id FK
        text category_id FK
        text assigned_to FK
        datetime expected_ready_at
        text status
    }
    production_snapshots {
        text id PK
        text production_order_id FK
        int version
        json demand_matrix "product × branch × qty"
        datetime created_at
        text created_by FK
    }
    deliveries {
        text id PK
        text tenant_id FK
        text order_id FK
        text number UK "DLV-2026-00456"
        text delivered_by FK
        text received_by_name
        text received_by_user_id FK
        datetime delivered_at
        blob signature_blob
        text note
        text client_uuid UK
    }
    delivery_lines {
        text id PK
        text delivery_id FK
        text order_line_id FK
        decimal qty_delivered
        text note
    }
```

## 3. المخزون (الدفتر)

```mermaid
erDiagram
    tenants ||--o{ raw_material_categories : has
    raw_material_categories ||--o{ raw_materials : contains
    raw_materials }o--|| uoms : measured_in
    tenants ||--o{ suppliers : has

    tenants ||--o{ vouchers : has
    vouchers }o--|| locations : "warehouse"
    vouchers }o--o| suppliers : "from (receipt)"
    vouchers ||--o{ voucher_lines : contains
    voucher_lines }o--|| raw_materials : for
    users ||--o{ vouchers : created_by
    users ||--o{ vouchers : posted_by

    voucher_lines ||--o{ stock_movements : "generates on post"
    raw_materials ||--o{ stock_movements : ledger
    locations ||--o{ stock_movements : at
    users ||--o{ stock_movements : actor

    raw_materials ||--o{ stock_balances : "cache (optional)"
    locations ||--o{ stock_balances : at

    locations ||--o{ count_sessions : for
    count_sessions ||--o{ count_lines : contains
    count_lines }o--|| raw_materials : counts
    count_sessions ||--o{ stock_movements : "commit generates"

    products ||--o{ recipes : "has (M3)"
    recipes ||--o{ recipe_lines : contains
    recipe_lines }o--|| raw_materials : uses

    raw_material_categories {
        text id PK
        text tenant_id FK
        text parent_id FK
        text name_ar
        int sort_order
    }
    raw_materials {
        text id PK
        text tenant_id FK
        text category_id FK
        text code UK
        text name_ar
        text name_en
        text uom_id FK
        decimal safety_stock
        int default_unit_cost_minor
        bool is_active
        json custom_fields
    }
    suppliers {
        text id PK
        text tenant_id FK
        text name
        text phone
        text note
        bool is_active
    }
    vouchers {
        text id PK
        text tenant_id FK
        text kind "receipt|issue|adjustment|transfer|waste|return"
        text number UK "RCV-2026-00001"
        text location_id FK
        text to_location_id FK "transfer only"
        text supplier_id FK
        text external_ref "supplier invoice no"
        text issued_to_name
        text issued_to_user_id FK
        text purpose
        text ref_type "production_order|null"
        text ref_id
        date voucher_date
        text status "draft|posted|cancelled"
        text note
        text created_by FK
        text posted_by FK
        datetime posted_at
        text cancelled_by FK
        datetime cancelled_at
        text cancel_reason
        text client_uuid UK
    }
    voucher_lines {
        text id PK
        text voucher_id FK
        text raw_material_id FK
        decimal qty
        int unit_cost_minor "nullable; receipt"
        date expiry_date
        text note
        int sort_order
    }
    stock_movements {
        text id PK
        text tenant_id FK
        text raw_material_id FK
        text location_id FK
        decimal qty "signed, != 0"
        text reason
        int unit_cost_minor
        decimal qty_after
        int valuation_rate_minor_after
        int stock_value_minor_after
        int stock_value_diff_minor
        text ref_type
        text ref_id
        text voucher_line_id FK
        text actor_id FK
        datetime occurred_at
        datetime created_at
        text reverses_movement_id FK
    }
    stock_balances {
        text raw_material_id FK
        text location_id FK
        decimal qty
        int valuation_rate_minor
        datetime updated_at
    }
    count_sessions {
        text id PK
        text tenant_id FK
        text location_id FK
        text number UK
        text status
        text scope "full|cycle"
        datetime opened_at
        text opened_by FK
        datetime committed_at
        text committed_by FK
    }
    count_lines {
        text id PK
        text session_id FK
        text raw_material_id FK
        decimal expected_qty "snapshot at open"
        decimal counted_qty
        text note
    }
    recipes {
        text id PK
        text product_id FK
        int version
        decimal yield_qty
        bool is_active
    }
    recipe_lines {
        text recipe_id FK
        text raw_material_id FK
        decimal qty_per_yield
    }
```

## 4. الدعم: التدقيق، الإشعارات، المزامنة

```mermaid
erDiagram
    tenants ||--o{ audit_log : has
    users ||--o{ audit_log : actor
    tenants ||--o{ notifications : has
    users ||--o{ notifications : for
    users ||--o{ push_subscriptions : has
    tenants ||--o{ sequences : has
    tenants ||--o{ custom_field_defs : has

    audit_log {
        text id PK
        text tenant_id FK
        text actor_id FK
        text entity_type
        text entity_id
        text action "create|update|delete|post|cancel|lock|..."
        json before
        json after
        text ip
        text device_id
        datetime at
    }
    notifications {
        text id PK
        text tenant_id FK
        text user_id FK
        text kind
        text title_ar
        text body_ar
        json payload
        datetime read_at
        datetime created_at
    }
    push_subscriptions {
        text id PK
        text user_id FK
        text endpoint UK
        text p256dh
        text auth
        datetime created_at
    }
    sequences {
        text tenant_id FK
        text key "PO|DLV|RCV|ISS|CNT"
        int year
        int next_value
    }
    custom_field_defs {
        text id PK
        text tenant_id FK
        text entity_type
        text key
        text label_ar
        text type "text|number|date|select"
        json options
        bool required
    }
```

---

## قرارات التصميم المهمة في المخطط

| القرار | السبب |
|---|---|
| **المعرّفات نصية (ULID)** لا أرقام تسلسلية | تُولَّد على الجهاز بدون اتصال، قابلة للفرز زمنياً، لا تعارض عند المزامنة |
| **`client_uuid` على كل كيان يُنشأ من الجهاز** | مفتاح Idempotency — إعادة الإرسال لا تُكرّر |
| **`number` منفصل عن `id`** | المستخدم يرى `PO-2026-00123`، النظام يستخدم ULID |
| **`sequences` جدول** | ترقيم تسلسلي لكل مستأجر/نوع/سنة بدون تعارض |
| **المبالغ `*_minor` أعداد صحيحة** | 1250 = 12.50 ريال. لا Float |
| **الكميات `decimal(18,4)`** | 4 منازل تكفي للجرام والمليلتر |
| **`qty_after`, `valuation_rate_minor_after`, `stock_value_minor_after` في كل حركة** | أي تقرير تاريخي = قراءة سطر، لا إعادة حساب |
| **`production_snapshots`** | الطباعة تعرض ما كان وقت القفل، حتى لو أُضيفت استثناءات لاحقاً |
| **`order_revisions` JSON snapshot** | تاريخ كامل للطلبية بدون تعقيد جداول |
| **`stock_balances` اختياري** | يُفعَّل فقط إن تجاوز الدفتر ملايين الصفوف. الدفتر دائماً هو الحق |
| **`reverses_movement_id`** | ربط الحركة العكسية بأصلها للتتبع |
| **`user_roles.location_id` nullable** | دور عام (admin) أو مقيّد بموقع (branch_user للفرع X) |
| **`locations.default_plant_id`** | الفرع يعرف معمله. يمكن تجاوزه عند الطلب |
| **`custom_fields` JSON + `custom_field_defs`** | حقول إضافية بدون migration |
