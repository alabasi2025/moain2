# قواعد العمل والثوابت (Business Rules & Invariants)

> كل قاعدة لها: رقم، نص، أين تُفرض (DB / Service / UI)، وماذا يحدث عند الخرق.

## تصنيف مستويات الفرض

| المستوى | الرمز | المعنى |
|---|---|---|
| قاعدة البيانات | **DB** | CHECK / UNIQUE / TRIGGER — لا يمكن تجاوزها حتى من الأدمن |
| الخدمة | **SVC** | في use case — تُفرض على كل مسار API |
| الواجهة | **UI** | تحسين تجربة — تمنع المحاولة أصلاً، لكن ليست خط الدفاع |

---

## A. قواعد المنصة

| # | القاعدة | الفرض | عند الخرق |
|---|---|---|---|
| A1 | كل استعلام يحمل `tenant_id` | SVC (Repository يحقنه تلقائياً) + اختبار يفشل إن غاب | 500 + تنبيه للمطورين |
| A2 | المستخدم يرى فقط بيانات مستأجره | SVC | 403 |
| A3 | `branch_user` يرى/يعدّل فقط طلبيات موقعه (`user_roles.location_id`) | SVC | 403 |
| A4 | `plant_*` يرى فقط أوامر إنتاج معمله وطلبيات الفروع المرتبطة به | SVC | 403 |
| A5 | PIN يعمل فقط من `trusted_device` غير مُلغى | SVC | 401 + طلب كلمة المرور |
| A6 | 5 محاولات PIN خاطئة → قفل الجهاز 15 دقيقة | SVC | 429 |
| A7 | كل تغيير على كيان حساس يُسجَّل في `audit_log` | SVC (Decorator على الخدمات) | — |
| A8 | `audit_log` لا يُعدَّل ولا يُحذف | **DB** Trigger | ABORT |
| A9 | الأرقام التسلسلية (`PO-2026-00123`) فريدة لكل مستأجر/نوع/سنة ولا تعاد | **DB** `sequences` + معاملة | — |
| A10 | المستخدم الأول في المستأجر = `owner` تلقائياً | SVC | — |
| A11 | لا يمكن حذف آخر `owner` | SVC | 409 |

---

## B. قواعد الكتالوج

| # | القاعدة | الفرض | عند الخرق |
|---|---|---|---|
| B1 | `products.code` فريد داخل المستأجر | **DB** UNIQUE | 409 "الكود مستخدم" |
| B2 | المنتج الذي له سطور طلبيات لا يُحذف، يُعطَّل (`is_active=0`) | SVC | 409 + اقتراح التعطيل |
| B3 | التصنيف الذي له منتجات أو أبناء لا يُحذف | SVC | 409 |
| B4 | التصنيف لا يكون أباً لنفسه (مباشرة أو عبر سلسلة) | SVC (فحص الدورة) | 422 |
| B5 | المنتج المعطَّل لا يظهر في شاشة الطلب لكن يظهر في التقارير التاريخية | UI + SVC | — |
| B6 | `product_availability` فارغ = متاح للجميع | SVC (منطق الفلترة) | — |

---

## C. قواعد الطلبيات

| # | القاعدة | الفرض | عند الخرق |
|---|---|---|---|
| C1 | طلبية واحدة لكل `(branch, window, delivery_date)` | **DB** UNIQUE | 409 → UI يفتح الطلبية الموجودة بدل إنشاء جديدة |
| C2 | `order_lines.qty > 0` | **DB** CHECK | سطر بصفر يُحذف في UI قبل الإرسال |
| C3 | لا تكرار منتج في نفس الطلبية | **DB** UNIQUE | 409 |
| C4 | `submit` فقط إذا `now(tz) < window.cutoff_time` في يوم الطلب | SVC | 423 "النافذة مغلقة" + زر "طلب استثناء" |
| C5 | `submit` يتطلب سطراً واحداً على الأقل | SVC + UI | 422 |
| C6 | بعد `locked`، تعديل السطور يتطلب `order_exception.approved` غير مستهلك | SVC | 423 |
| C7 | الاستثناء الموافَق عليه يُستهلك مرة واحدة (تعديل واحد) | SVC | 423 |
| C8 | الاستثناء ينتهي بعد `exception_ttl_minutes` بدون رد | Cron + SVC | status → `expired` |
| C9 | كل `submit`/تعديل بعد الأول → `revision++` + snapshot في `order_revisions` | SVC | — |
| C10 | `delivery_date` = اليوم + `window.delivery_offset_days` (بتوقيت المستأجر) | SVC (يُحسب لا يُدخل) | — |
| C11 | الطلب العاجل (`window.kind='urgent'`) لا cutoff ويولّد `production_order` منفصلاً | SVC | — |
| C12 | `client_uuid` فريد → إعادة الإرسال تُرجع نفس الطلبية (idempotent) | **DB** UNIQUE + SVC | 200 بنفس النتيجة |
| C13 | الطلبية `cancelled` تحتاج `cancel_reason` | SVC | 422 |
| C14 | انتقالات الحالة فقط حسب جدول `03-state-machines.md` | SVC | 409 "انتقال غير مسموح" |
| C15 | الفرع يمكنه "نسخ طلبية سابقة" — تُنسخ السطور كمسودة محلية فقط | UI | — |

---

## D. قواعد الإنتاج

| # | القاعدة | الفرض | عند الخرق |
|---|---|---|---|
| D1 | `production_order` واحد لكل `(plant, window, delivery_date)` | **DB** UNIQUE | — |
| D2 | يُنشأ تلقائياً عند أول `OrderSubmitted` إن لم يكن موجوداً | SVC (داخل معاملة submit) | — |
| D3 | عند `lock` (تلقائي أو يدوي) → snapshot v1 من `v_production_demand` | SVC | — |
| D4 | كل استثناء موافَق عليه يُنفَّذ → snapshot v+1 بـ `reason='exception:<id>'` | SVC | — |
| D5 | الطباعة تستخدم **آخر snapshot** دائماً، لا العرض الحي | SVC | — |
| D6 | `start` يتطلب `locked` | SVC | 409 |
| D7 | `start` يُحوّل كل الطلبيات التابعة إلى `in_production` | SVC | — |
| D8 | `completed` عندما كل `sections` مكتملة (إن وُجدت) أو يدوياً | SVC | — |
| D9 | `delivered` تلقائياً عندما كل الطلبيات التابعة `delivered` | SVC (event) | — |
| D10 | القفل التلقائي: Cron كل دقيقة يبحث عن نوافذ تجاوزت `cutoff` لليوم ولم تُقفل | Cron | — |
| D11 | القفل اليدوي مسموح لـ `plant_manager` فقط وقبل `cutoff` | SVC | 403 |
| D12 | `expected_ready_at` يجب أن يكون في المستقبل عند التعيين | SVC | 422 |

---

## E. قواعد التسليم

| # | القاعدة | الفرض | عند الخرق |
|---|---|---|---|
| E1 | `delivery` فقط لطلبية في `in_production` / `ready` / `partially_delivered` | SVC | 409 |
| E2 | `received_by_name` إلزامي | **DB** NOT NULL | 422 |
| E3 | `qty_delivered >= 0` | **DB** CHECK | — |
| E4 | `qty_delivered > qty_remaining` مسموح لكن يُسجَّل تحذير في `note` ويُنبَّه المدير | SVC | 200 + warning |
| E5 | التسليم غير قابل للتعديل بعد الإنشاء | **DB** Trigger | ABORT |
| E6 | بعد كل تسليم: إن `Σ delivered ≥ Σ ordered` لكل سطر → `order.delivered`، وإلا `partially_delivered` | SVC | — |
| E7 | التوقيع الرقمي اختياري؛ إن وُجد: PNG ≤ 50KB | SVC | 413 |
| E8 | `client_uuid` فريد (idempotent) | **DB** UNIQUE | — |

---

## F. قواعد المخزون (الأهم)

| # | القاعدة | الفرض | عند الخرق |
|---|---|---|---|
| **F1** | **`stock_movements` لا يُعدَّل ولا يُحذف. أبداً.** | **DB** Trigger | ABORT |
| **F2** | **لا عمود كمية في `raw_materials`. الرصيد = آخر `qty_after` في الدفتر** | **DB** (غياب العمود) + Views | — |
| **F3** | **كل حركة لها `actor_id`** | **DB** NOT NULL | — |
| F4 | `qty <> 0` | **DB** CHECK | — |
| F5 | `reason` من القائمة المغلقة | **DB** CHECK | — |
| F6 | السند `draft` قابل للتعديل والحذف بحرية (لم يؤثر على شيء) | SVC | — |
| F7 | السند `posted` غير قابل للتعديل في حقوله الجوهرية وسطوره | **DB** Trigger | ABORT |
| F8 | `post()` ذرّي: كل السطور أو لا شيء | SVC (معاملة) | ROLLBACK + رسالة بالسطر المُخفق |
| F9 | `post()` لسند صرف: إن `allow_negative_stock=0` و`balance + qty < 0` → رفض | SVC | 422 "رصيد غير كافٍ: المتاح X من Y" |
| F10 | `post()` لسند توريد: `unit_cost_minor` إلزامي أو يُؤخذ من `default_unit_cost_minor` أو آخر متوسط | SVC | 422 إن لم يتوفر أي منها |
| F11 | المتوسط المرجّح: `new = ROUND((old_qty×old_rate + in_qty×in_cost) / (old_qty+in_qty), 4)` | SVC | — |
| F12 | إن `old_qty <= 0` عند التوريد → `new_rate = in_cost` (منطق SAP) | SVC | — |
| F13 | الصادر يُقيَّم بالمتوسط الحالي ولا يغيّره | SVC | — |
| F14 | التحويل: زوج حركات بنفس `unit_cost` (التحويل لا يغيّر التكلفة) | SVC | — |
| F15 | `cancel()` لسند مُرحَّل → حركات `reversal` بإشارة معاكسة + `reverses_movement_id` | SVC | — |
| F16 | `cancel()` يتطلب `cancel_reason` | SVC | 422 |
| F17 | بعد `post()`: إن عبر الرصيد حد الأمان نزولاً → حدث `StockBelowSafety` → إشعار | SVC | — |
| F18 | `voucher_date` لا يكون في المستقبل | SVC | 422 |
| F19 | `voucher_date` أقدم من آخر حركة للمادة → تحذير "ترحيل بأثر رجعي قد يؤثر على المتوسط" (يُسمح) | SVC + UI | 200 + warning |
| F20 | `stock_balances` cache يُطابَق مع الدفتر يومياً؛ أي فرق → تنبيه للمطورين وإعادة بناء من الدفتر | Cron | — |
| F21 | المادة التي لها حركات لا تُحذف، تُعطَّل | SVC | 409 |
| F22 | تغيير `uom_id` لمادة لها حركات ممنوع | SVC | 409 |

---

## G. قواعد الجرد

| # | القاعدة | الفرض | عند الخرق |
|---|---|---|---|
| G1 | عند `open`: `expected_qty` = الرصيد الحالي **لحظة الفتح** لكل مادة في النطاق | SVC | — |
| G2 | `expected_qty` لا يتغير بعد الفتح حتى لو حدثت حركات | SVC (لا يوجد كود يُحدّثه) | — |
| G3 | جلسة واحدة `open`/`review` لكل موقع في نفس الوقت | SVC | 409 "يوجد جرد مفتوح" |
| G4 | `commit` يتطلب `counted_qty NOT NULL` لكل سطر (أو تأكيد صريح لتجاهل غير المعدود) | SVC | 422 |
| G5 | `commit` → حركة `count` لكل سطر `counted ≠ expected` بـ `qty = counted - expected` و`unit_cost = current rate` | SVC | — |
| G6 | بعد `committed` الجلسة للقراءة فقط | **DB** Trigger | ABORT |
| G7 | إن حدثت حركات على مادة بين `open` و`commit` → تحذير في UI (لا منع) | SVC + UI | warning |

---

## H. قواعد التقارير والتصدير

| # | القاعدة | الفرض |
|---|---|---|
| H1 | كل تقرير له زر "تصدير Excel" و"طباعة/PDF" | UI |
| H2 | التصدير يحمل: الشعار، اسم الشركة، اسم التقرير، الفترة، تاريخ/وقت التوليد، اسم المُولِّد | SVC |
| H3 | `branch_user` لا يرى أعمدة التكلفة في أي تقرير | SVC (field-level) |
| H4 | التقرير الفتري للمخزون (رصيد أول المدة / وارد / صادر / آخر المدة) يُحسب من الدفتر كالتالي: | SVC |

```sql
-- :from, :to تواريخ الفترة؛ :tenant, :location
WITH
opening AS (
  SELECT raw_material_id, qty_after AS opening_qty, stock_value_minor_after AS opening_value
  FROM stock_movements sm
  WHERE tenant_id = :tenant AND location_id = :location AND occurred_at < :from
    AND (occurred_at || created_at) = (
      SELECT MAX(occurred_at || created_at) FROM stock_movements
      WHERE raw_material_id = sm.raw_material_id AND location_id = sm.location_id AND occurred_at < :from
    )
),
period AS (
  SELECT raw_material_id,
    SUM(CASE WHEN qty > 0 THEN qty ELSE 0 END) AS qty_in,
    SUM(CASE WHEN qty < 0 THEN -qty ELSE 0 END) AS qty_out,
    SUM(CASE WHEN qty > 0 THEN qty * unit_cost_minor ELSE 0 END) AS value_in,
    SUM(CASE WHEN qty < 0 THEN -qty * unit_cost_minor ELSE 0 END) AS value_out
  FROM stock_movements
  WHERE tenant_id = :tenant AND location_id = :location AND occurred_at >= :from AND occurred_at < :to
  GROUP BY raw_material_id
),
closing AS (
  SELECT raw_material_id, qty_after AS closing_qty, valuation_rate_minor_after AS closing_rate, stock_value_minor_after AS closing_value
  FROM stock_movements sm
  WHERE tenant_id = :tenant AND location_id = :location AND occurred_at < :to
    AND (occurred_at || created_at) = (
      SELECT MAX(occurred_at || created_at) FROM stock_movements
      WHERE raw_material_id = sm.raw_material_id AND location_id = sm.location_id AND occurred_at < :to
    )
)
SELECT
  rm.code, rmc.name_ar AS category, rm.name_ar, u.code AS uom, rm.safety_stock,
  COALESCE(o.opening_qty, 0)   AS opening_qty,
  COALESCE(p.qty_in, 0)        AS total_in,
  COALESCE(p.qty_out, 0)       AS total_out,
  COALESCE(c.closing_qty, 0)   AS closing_qty,
  COALESCE(c.closing_rate, rm.default_unit_cost_minor, 0) AS unit_cost_minor,
  COALESCE(c.closing_value, 0) AS closing_value_minor
FROM raw_materials rm
LEFT JOIN raw_material_categories rmc ON rmc.id = rm.category_id
JOIN uoms u ON u.id = rm.uom_id
LEFT JOIN opening o ON o.raw_material_id = rm.id
LEFT JOIN period  p ON p.raw_material_id = rm.id
LEFT JOIN closing c ON c.raw_material_id = rm.id
WHERE rm.tenant_id = :tenant AND rm.is_active = 1
ORDER BY rmc.sort_order, rm.name_ar;
```

> هذا الاستعلام يعطي **بالضبط** الأعمدة الـ 11 التي طلبها العميل: كود، تصنيف، اسم، تكلفة الوحدة، وحدة القياس، حد الأمان، رصيد أول المدة، إجمالي الوارد، إجمالي الصادر، الرصيد المتبقي، قيمة الرصيد.

---

## I. قواعد الوقت والمنطقة الزمنية

| # | القاعدة | الفرض |
|---|---|---|
| I1 | كل التواريخ/الأوقات تُخزَّن UTC ISO-8601 | DB convention |
| I2 | `cutoff_time` و`opens_at` تُفسَّر بـ `tenant_settings.timezone` | SVC |
| I3 | "اليوم" في منطق النوافذ = اليوم بتوقيت المستأجر، لا UTC | SVC |
| I4 | الواجهة تعرض بتوقيت المستأجر وتُرسل UTC | UI |
| I5 | `delivery_date` و`voucher_date` تواريخ محلية بدون وقت (`YYYY-MM-DD`) | DB |

---

## J. قواعد الأرقام والتقريب

| # | القاعدة | الفرض |
|---|---|---|
| J1 | المبالغ: INTEGER وحدات صغرى. 1250 بـ `currency_decimals=2` = 12.50 | DB + SVC |
| J2 | الكميات: تُقرَّب لـ `tenant_settings.qty_decimals` عند الإدخال، وتُحسب بـ 4 منازل داخلياً | SVC |
| J3 | المتوسط المرجّح: `ROUND(..., 4)` ثم يُخزَّن كـ INTEGER وحدات صغرى | SVC |
| J4 | `stock_value = ROUND(qty × rate)` إلى أقرب وحدة صغرى | SVC |
| J5 | لا Float في أي حساب مالي — استخدام `BigInt` أو مكتبة decimal في TS | Code review + lint rule |
| J6 | عرض الأرقام حسب `numerals` (غربية/هندية) في UI والطباعة | UI |

---

## الثوابت العشرة التي لا تُفاوَض (ملخص للمطورين)

1. الدفتر غير قابل للتعديل (DB Trigger).
2. لا عمود كمية في جدول المواد.
3. كل حركة لها فاعل.
4. كل استعلام له `tenant_id`.
5. انتقالات الحالة من الجدول فقط.
6. المال أعداد صحيحة.
7. السند المُرحَّل مجمّد.
8. الجرد snapshot عند الفتح.
9. التسليم غير قابل للتعديل.
10. `client_uuid` على كل ما يُنشأ من الجهاز.
