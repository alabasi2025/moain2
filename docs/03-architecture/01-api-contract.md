# عقد الـ API

> REST + JSON. المسار الأساسي `/api/v1`. كل الاستجابات بالشكل الموحد أدناه. المصادقة عبر cookie `sid` (HttpOnly, Secure, SameSite=Lax).

## الشكل الموحد

```jsonc
// نجاح
{ "ok": true, "data": { ... }, "meta": { "requestId": "...", "serverTime": "..." } }

// فشل
{ "ok": false, "error": { "code": "WINDOW_CLOSED", "message_ar": "نافذة الطلب مغلقة", "details": {...} }, "meta": {...} }
```

| HTTP | code | متى |
|---|---|---|
| 400 | `VALIDATION` | zod فشل — `details.issues[]` |
| 401 | `UNAUTHENTICATED` | لا جلسة |
| 403 | `FORBIDDEN` | دور/موقع غير مسموح |
| 404 | `NOT_FOUND` | |
| 409 | `CONFLICT` / `INVALID_TRANSITION` / `DUPLICATE` | |
| 422 | `BUSINESS_RULE` | قاعدة عمل (رصيد غير كافٍ...) — `details.rule: "F9"` |
| 423 | `WINDOW_CLOSED` | بعد cutoff |
| 429 | `RATE_LIMITED` | |
| 500 | `INTERNAL` | |

## Headers
- `X-Client-UUID` اختياري على POST (بديل عن الحقل في body).
- `X-Request-Id` يُعاد في الاستجابة.
- `Accept-Language: ar` (افتراضي).

---

## Platform

| Method | Path | الدور | الوصف |
|---|---|---|---|
| POST | `/auth/login` | — | `{identifier, password, deviceFingerprint, deviceLabel}` → session + trusted device |
| POST | `/auth/pin` | — | `{deviceId, pin}` → session (A5, A6) |
| POST | `/auth/logout` | أي | |
| GET | `/auth/me` | أي | المستخدم + أدواره + مواقعه + settings + branding |
| PUT | `/auth/pin` | أي | تعيين/تغيير PIN |
| GET/PUT | `/tenant/settings` | admin | |
| GET/PUT | `/tenant/branding` | admin | `logo` عبر `POST /tenant/branding/logo` (multipart → R2) |
| CRUD | `/users` | admin | + `/users/:id/roles` |
| CRUD | `/locations` | admin | `?kind=branch` |
| CRUD | `/uoms` | admin | |
| GET | `/notifications` | أي | `?unread=1` |
| POST | `/notifications/:id/read` | أي | |
| POST | `/push/subscribe` | أي | |
| GET | `/audit` | admin | `?entity_type&entity_id&actor&from&to` |

## Catalog

| Method | Path | الدور | الوصف |
|---|---|---|---|
| GET | `/catalog` | أي | **شجرة كاملة** تصنيفات+منتجات (للكاش المحلي). `ETag` + `If-None-Match` → 304 |
| CRUD | `/categories` | admin | + `POST /categories/reorder` |
| CRUD | `/products` | admin | + `/products/:id/availability` |

## Ordering

| Method | Path | الدور | الوصف |
|---|---|---|---|
| GET | `/windows` | أي | نوافذ المعمل مع حالة كل واحدة الآن (`open`/`closed`, `closesInMinutes`, `deliveryDate`) |
| GET | `/orders` | branch/plant | `?branch&date_from&date_to&status` |
| GET | `/orders/:id` | | مع lines و revisions |
| GET | `/orders/current` | branch | طلبية اليوم للنافذة الافتراضية (أو 404 → UI يُنشئ مسودة) |
| POST | `/orders/submit` | branch | `{client_uuid, window_id, lines:[{product_id, qty, note}], note}` → إنشاء أو تحديث (C1, C4, C12) |
| POST | `/orders/:id/cancel` | branch/plant | `{reason}` |
| GET | `/orders/:id/copy-source` | branch | آخر طلبية سابقة للنسخ (أمس / نفس اليوم الأسبوع الماضي) |
| POST | `/orders/:id/exceptions` | branch | `{reason}` → pending |
| GET | `/exceptions` | plant_manager | `?status=pending` |
| POST | `/exceptions/:id/approve` \| `/reject` | plant_manager | `{note}` |

## Production

| Method | Path | الدور | الوصف |
|---|---|---|---|
| GET | `/production-orders` | plant | `?date&status` |
| GET | `/production-orders/:id` | plant | header + **live demand matrix** (من View) + آخر snapshot + sections |
| GET | `/production-orders/:id/stream` | plant | **SSE**: أحداث `order_submitted`, `order_revised`, `locked` للتحديث اللحظي أثناء `open` |
| POST | `/production-orders/:id/lock` | plant_manager | قفل يدوي (D11) |
| POST | `/production-orders/:id/start` | plant_manager | |
| POST | `/production-orders/:id/complete` | plant_manager | |
| PATCH | `/production-orders/:id` | plant_manager | `{assigned_to, expected_ready_at, note}` |
| PUT | `/production-orders/:id/sections` | plant_manager | مصفوفة أقسام |
| POST | `/production-orders/:id/sections/:sid/complete` | plant_staff | |
| GET | `/production-orders/:id/print` | plant | `?layout=consolidated\|by_category\|by_branch&font=normal\|large` → HTML للطباعة |
| GET | `/production-orders/:id/pdf` | plant | نفس المعاملات → PDF (M2) |
| GET | `/production-orders/:id/export.xlsx` | plant | |

## Fulfillment

| Method | Path | الدور | الوصف |
|---|---|---|---|
| GET | `/orders/:id/fulfillment` | plant/branch | مطلوب/مُسلَّم/متبقٍ لكل سطر |
| POST | `/deliveries` | plant_staff | `{client_uuid, order_id, received_by_name, received_by_user_id?, delivered_at, lines:[{order_line_id, qty_delivered, note}], signature_png_base64?, note}` |
| GET | `/deliveries/:id` | | |
| GET | `/deliveries/:id/print` | | إيصال تسليم |
| GET | `/receive/:token` | **public** (QR) | شاشة استلام للفرع بتوقيع رقمي؛ token موقّع بصلاحية 24 ساعة |

## Inventory

| Method | Path | الدور | الوصف |
|---|---|---|---|
| CRUD | `/raw-material-categories` | storekeeper | |
| CRUD | `/raw-materials` | storekeeper | `GET` يُرجع مع `on_hand`, `valuation_rate`, `status` من View |
| GET | `/raw-materials/:id/ledger` | storekeeper | الحركات `?from&to&reason` مع `qty_after` |
| CRUD | `/suppliers` | storekeeper | |
| GET | `/vouchers` | storekeeper | `?kind&status&from&to&supplier` |
| POST | `/vouchers` | storekeeper | إنشاء مسودة `{client_uuid, kind, location_id, voucher_date, lines[], ...}` |
| PUT | `/vouchers/:id` | storekeeper | تعديل مسودة فقط (F6) |
| DELETE | `/vouchers/:id` | storekeeper | مسودة فقط |
| POST | `/vouchers/:id/post` | storekeeper | **الترحيل** (F8–F17). الاستجابة تتضمن `warnings[]` (F19) و`movements[]` |
| POST | `/vouchers/:id/cancel` | storekeeper | `{reason}` → reversals (F15) |
| POST | `/vouchers/quick` | storekeeper | **إنشاء + ترحيل في طلب واحد** — لشاشة الإدخال السريع |
| GET | `/vouchers/:id/print` | | سند توريد/صرف |
| GET | `/stock/overview` | storekeeper | `?from&to&location&category&status` → الأعمدة الـ 11 (H4) |
| GET | `/stock/overview/export.xlsx` | | |
| GET | `/stock/low` | storekeeper/admin | تحت حد الأمان |
| POST | `/counts` | storekeeper | فتح جلسة `{location_id, scope, material_ids?}` → snapshot |
| GET | `/counts/:id` | | |
| PUT | `/counts/:id/lines/:lid` | | `{counted_qty, note}` |
| POST | `/counts/:id/review` \| `/commit` \| `/cancel` | storekeeper | |
| GET | `/counts/:id/print` | | ورقة جرد (فارغة للعدّ أو بالفروقات) |

## Reporting

| Path | الوصف |
|---|---|
| GET `/reports/demand` | `?from&to&group_by=product\|branch\|category` |
| GET `/reports/fulfillment` | نسبة التسليم الكامل/الجزئي |
| GET `/reports/stock-movements` | |
| GET `/reports/stock-valuation` | قيمة المخزون بتاريخ |
| كل تقرير | `+ /export.xlsx` و `+ /print` |

---

## أمثلة

### POST /orders/submit
```jsonc
// request
{
  "client_uuid": "01J9Q...",
  "window_id": "win_daily",
  "note": "التسليم قبل 7 صباحاً لو سمحتم",
  "lines": [
    { "product_id": "p_croissant", "qty": 40, "note": "" },
    { "product_id": "p_cheese_pie", "qty": 25, "note": "بدون سمسم" }
  ]
}
// 200
{
  "ok": true,
  "data": {
    "order": { "id": "...", "status": "submitted", "revision": 1, "delivery_date": "2026-10-04", "production_order_id": "..." },
    "window": { "closes_at": "2026-10-03T19:00:00Z", "closes_in_minutes": 142 }
  }
}
// 423
{ "ok": false, "error": { "code": "WINDOW_CLOSED", "message_ar": "أُغلقت نافذة الطلب الساعة 10:00 م. يمكنك طلب استثناء من المعمل.", "details": { "cutoff": "22:00", "can_request_exception": true } } }
```

### POST /vouchers/:id/post
```jsonc
// 200
{
  "ok": true,
  "data": {
    "voucher": { "id": "...", "number": "RCV-2026-00017", "status": "posted" },
    "movements": [
      { "raw_material_id": "rm_flour", "qty": 50, "qty_after": 150, "valuation_rate_minor_after": 600 }
    ],
    "warnings": [],
    "alerts": [ { "kind": "low_stock", "raw_material_id": "rm_sugar", "qty_after": 8, "safety_stock": 20 } ]
  }
}
// 422
{ "ok": false, "error": { "code": "BUSINESS_RULE", "message_ar": "رصيد غير كافٍ للمادة «سكر ناعم»: المتاح 8 كجم، المطلوب 12 كجم", "details": { "rule": "F9", "line_index": 2, "available": 8, "requested": 12 } } }
```

### GET /production-orders/:id (demand matrix)
```jsonc
{
  "ok": true,
  "data": {
    "header": { "number": "PO-2026-00123", "status": "locked", "delivery_date": "2026-10-04", "assigned_to": {...}, "expected_ready_at": "..." },
    "branches": [ { "id": "b1", "code": "BR-01", "name": "فرع الستين" }, { "id": "b2", "code": "BR-02", "name": "فرع حدة" } ],
    "categories": [
      { "id": "c1", "name": "المعجنات", "products": [
        { "id": "p1", "code": "PR-001", "name": "كرواسون زبدة", "uom": "حبة", "total": 90,
          "by_branch": { "b1": { "qty": 40, "note": "" }, "b2": { "qty": 50, "note": "" } } }
      ]}
    ],
    "order_notes": [ { "branch_id": "b1", "note": "التسليم قبل 7 صباحاً" } ],
    "totals": { "products": 23, "units": 1240, "orders": 2 },
    "snapshot_version": 1
  }
}
```

---

## قواعد التصميم
- **لا PATCH على الكيانات المجمّدة** (posted voucher, delivered order, delivery) — فقط أفعال (`/cancel`, `/post`).
- **الأفعال كـ POST على مسار فرعي** — تطابق آلة الحالة مباشرة.
- **الكاش**: `GET /catalog` و `GET /auth/me` مع ETag. البقية `Cache-Control: no-store`.
- **الترقيم**: `?cursor=&limit=50` على القوائم الطويلة (ledger, audit).
- **كل استجابة قائمة تحمل `meta.total`** إن كان رخيصاً.
- **الأخطاء بالعربية جاهزة للعرض** + `code` ثابت للمنطق.
