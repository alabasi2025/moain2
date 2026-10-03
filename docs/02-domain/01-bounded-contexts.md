# السياقات المحدودة (Bounded Contexts)

> تقسيم النظام إلى مناطق مستقلة لكل منها نموذجها ولغتها وقواعدها. الحدود الواضحة = تطوير متوازٍ + تغييرات معزولة + فهم أسهل.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PLATFORM (المنصة)                            │
│   Tenants · Users · Roles · Devices · Branding · Settings · Audit    │
│   Notifications · Locations · UoMs                                   │
└───────────────┬─────────────────────────┬───────────────────────────┘
                │                         │
    ┌───────────▼───────────┐   ┌─────────▼──────────────┐
    │   CATALOG (الكتالوج)   │   │  INVENTORY (المخزون)    │
    │  Categories · Products │   │  RawMaterials           │
    │  Availability · Recipes│   │  Suppliers · Vouchers   │
    └───────────┬───────────┘   │  StockMovements (Ledger)│
                │               │  CountSessions          │
    ┌───────────▼───────────┐   │  Valuation              │
    │  ORDERING (الطلبيات)   │   └─────────▲──────────────┘
    │  OrderWindows · Orders │             │
    │  OrderLines            │             │ M3: consume
    └───────────┬───────────┘             │ materials
                │ aggregates              │ via Recipe
    ┌───────────▼───────────┐             │
    │ PRODUCTION (الإنتاج)   │─────────────┘
    │  ProductionOrders      │
    │  Sections · Assignments│
    └───────────┬───────────┘
                │ fulfills
    ┌───────────▼───────────┐
    │ FULFILLMENT (التسليم)  │
    │  Deliveries · Lines    │
    │  Signatures · Returns  │
    └───────────────────────┘
                │
    ┌───────────▼───────────┐
    │  REPORTING (التقارير)  │  ← read-only views over everything
    │  Views · Exports · PDF │
    └───────────────────────┘
```

---

## 1. Platform (المنصة) — السياق الداعم

**المسؤولية:** كل ما يحتاجه أي سياق آخر ليعمل: من أنت، لأي شركة تنتمي، ما صلاحياتك، كيف يبدو النظام.

**الكيانات:** `Tenant`, `TenantSettings`, `TenantBranding`, `User`, `Role`, `UserRole`, `TrustedDevice`, `Session`, `Location`, `UoM`, `UomConversion`, `AuditLog`, `Notification`, `PushSubscription`, `CustomFieldDef`

**القواعد:**
- كل كيان في أي سياق آخر يحمل `tenant_id`.
- `Location` هنا لأنه مشترك بين Ordering (فرع/معمل) وInventory (مخزن).
- `AuditLog` يستقبل أحداثاً من كل السياقات.

**لا يعرف شيئاً عن:** الطلبيات، المنتجات، المخزون.

---

## 2. Catalog (الكتالوج) — السياق الأساسي المشترك

**المسؤولية:** ماذا نُنتج وكيف نصنّفه.

**الكيانات:** `Category`, `Product`, `ProductAvailability`, `Recipe`, `RecipeLine` (M3)

**القواعد:**
- المنتج له تصنيف واحد (ورقة في الشجرة أو أي مستوى).
- `is_active = false` بدل الحذف إن كان له تاريخ طلبيات.
- `ProductAvailability` فارغ = متاح لكل الفروع.
- `Recipe` يربط Product بـ RawMaterials (من Inventory) — **الاعتماد الوحيد عبر الحدود**، ويُقبل لأنه مرجع فقط (ID).

**يستهلكه:** Ordering (قائمة الأصناف)، Production (أسماء الأصناف في الطباعة)، Reporting.

---

## 3. Ordering (الطلبيات) — السياق الأساسي #1

**المسؤولية:** الفرع يقول للمعمل ماذا يريد ومتى.

**الكيانات:** `OrderWindow`, `Order`, `OrderLine`, `OrderException` (طلب تعديل بعد الإغلاق)

**القواعد (Invariants):**
- طلبية واحدة فقط لكل `(branch_id, delivery_date, window_id)`.
- لا يمكن `submit` بعد `cutoff_time` إلا بـ `OrderException` موافَق عليه.
- `OrderLine.qty > 0` — سطر بكمية صفر يُحذف لا يُحفظ.
- بعد `locked`، أي تغيير يُسجَّل كـ `OrderRevision` (نسخة جديدة مع سبب).
- الفرع لا يرى إلا طلبياته. المعمل يرى طلبيات الفروع المرتبطة به.

**الأحداث التي يُصدرها:**
- `OrderSubmitted`, `OrderRevised`, `OrderCancelled`, `WindowClosed`

**لا يعرف شيئاً عن:** كيف يُنتج المعمل، المواد الخام.

---

## 4. Production (الإنتاج) — السياق الأساسي #2

**المسؤولية:** المعمل يجمّع الطلبيات ويحوّلها لخطة عمل.

**الكيانات:** `ProductionOrder`, `ProductionLine` (مشتق)، `ProductionSection`, `ProductionAssignment`

**القواعد:**
- `ProductionOrder` واحد لكل `(plant_id, window_id, delivery_date)`.
- يُنشأ تلقائياً عند أول `OrderSubmitted` في النافذة، ويبقى `open` حتى `WindowClosed`.
- `ProductionLine` ليست جدولاً — هي **عرض** يجمّع `OrderLines` حسب المنتج. (نُخزّن snapshot عند `locked` للطباعة الثابتة.)
- `assigned_to` و`expected_ready_at` يمكن تعيينها على مستوى الأمر كاملاً أو كل `Section`.
- بعد `locked`، إن أُضيفت طلبية باستثناء → snapshot يُحدَّث ويُسجَّل في التدقيق.

**الأحداث:**
- `ProductionOrderLocked`, `ProductionStarted`, `ProductionCompleted`

**يستمع لـ:** `OrderSubmitted`, `OrderRevised`, `WindowClosed` (من Ordering)

**M3:** عند `ProductionStarted`، يحسب احتياج المواد الخام من `Recipes` ويقترح سند صرف.

---

## 5. Fulfillment (التسليم) — السياق الأساسي #3

**المسؤولية:** ما خرج من المعمل ووصل للفرع فعلياً، ومن وقّع.

**الكيانات:** `Delivery`, `DeliveryLine`, `Return` (M2)

**القواعد:**
- `Delivery` تخص `Order` واحدة (طلبية فرع واحد).
- `DeliveryLine.qty_delivered` قد تكون < أو = أو > `OrderLine.qty_ordered` (الزيادة تُسجَّل بتحذير).
- التسليم الجزئي مسموح → `Order.status = partially_delivered`.
- `signature_blob` اختياري. `delivered_by` و`received_by_name` إلزاميان.
- بعد التوقيع، `Delivery` غير قابلة للتعديل.

**الأحداث:**
- `DeliveryRecorded`, `OrderFullyDelivered`

**يستمع لـ:** `ProductionCompleted`

---

## 6. Inventory (المخزون) — السياق الأساسي #4 (مستقل)

**المسؤولية:** المواد الخام: ماذا دخل، ماذا خرج، كم بقي، بكم.

**الكيانات:** `RawMaterial`, `RawMaterialCategory`, `Supplier`, `Voucher`, `VoucherLine`, `StockMovement`, `StockBalance` (cache اختياري)، `CountSession`, `CountLine`

**القواعد (الأهم في النظام كله):**
1. **`StockMovement` غير قابل للتعديل أو الحذف.** Trigger في DB.
2. **الرصيد = `SUM(qty)` من الدفتر.** لا عمود كمية في `RawMaterial`.
3. **كل حركة تحمل `actor_id` و`occurred_at` و`reason`.**
4. **`Voucher.post()` ذرّي:** إما كل الأسطر تولّد حركات أو لا شيء.
5. **`Voucher.cancel()` يولّد حركات `reversal` بإشارة معاكسة.** لا يحذف.
6. **المتوسط المتحرك يُحسب في `post()`** ويُحفظ في الحركة (`valuation_rate_after`).
7. **منع الرصيد السالب افتراضياً** — `post()` يرفض إن كان `balance + qty < 0` لأي سطر.
8. **الجرد snapshot:** `CountLine.expected_qty` يُلتقط عند `open`.

**الأحداث:**
- `VoucherPosted`, `VoucherCancelled`, `StockBelowSafety`, `CountCommitted`

**لا يعرف شيئاً عن:** الطلبيات، المنتجات النهائية (حتى M3 حيث يستقبل `MaterialsConsumptionSuggested`).

---

## 7. Reporting (التقارير) — السياق الداعم

**المسؤولية:** قراءة فقط. تجميع، فلترة، تصدير.

**لا كيانات خاصة** — فقط Views وخدمات تصدير:
- `v_production_demand` (صنف × فرع × كمية)
- `v_stock_balance` (رصيد حالي لكل مادة/موقع)
- `v_stock_period_summary` (أول المدة، وارد، صادر، آخر المدة لفترة)
- `v_order_fulfillment` (مطلوب vs مُسلَّم)
- `v_low_stock` (تحت حد الأمان)

**خدمات:** `ExcelExporter`, `PdfRenderer`, `PrintTemplateEngine`

---

## خريطة الاعتماديات (Context Map)

| من | إلى | نوع العلاقة | الآلية |
|---|---|---|---|
| كل السياقات | Platform | Conformist | يستخدمون `tenant_id`, `user_id`, `location_id` كما هي |
| Ordering | Catalog | Customer/Supplier | يقرأ `products` و`categories` |
| Production | Ordering | Event-driven | يستمع لـ `OrderSubmitted` |
| Production | Catalog | Customer/Supplier | يقرأ أسماء المنتجات |
| Fulfillment | Production | Event-driven | يستمع لـ `ProductionCompleted` |
| Fulfillment | Ordering | Shared Kernel | `order_id`, `order_lines` |
| Inventory | Platform | Conformist | `location_id` للمخازن |
| Catalog (Recipe) | Inventory | Reference only | `raw_material_id` |
| Production → Inventory (M3) | Event-driven | `MaterialsConsumptionSuggested` |
| Reporting | الكل | Read-only | Views |

---

## لماذا هذا التقسيم تحديداً؟

1. **Inventory مستقل تماماً** → يمكن تطويره وتسليمه في M2 بدون أن يلمس M1، ويمكن بيعه منفرداً لمن يريد مخزوناً فقط.
2. **Ordering ≠ Production** → الفرع والمعمل لهما نماذج ذهنية مختلفة. "طلبيتي" vs "خطة اليوم".
3. **Fulfillment منفصل** → التسليم حدث قانوني (توقيع)، يستحق حدوده الخاصة.
4. **Platform في الأسفل** → تعدد المستأجرين والأمان لا يتسرّبان لمنطق العمل.
5. **Reporting قراءة فقط** → لا يمكن أن يُفسد تقرير بيانات.

## التنفيذ في الكود (هيكل المجلدات المستقبلي)

```
src/
├── platform/        # tenants, auth, users, locations, audit, notifications
├── catalog/         # categories, products, recipes
├── ordering/        # windows, orders, exceptions
├── production/      # production orders, sections, assignments
├── fulfillment/     # deliveries, signatures, returns
├── inventory/       # materials, suppliers, vouchers, ledger, counts, valuation
├── reporting/       # views, excel, pdf, templates
└── shared/          # money, quantity, dates, ids, result types
```

كل مجلد سياق يحتوي: `domain/` (كيانات + قواعد)، `application/` (use cases)، `infrastructure/` (repositories)، `api/` (routes).
