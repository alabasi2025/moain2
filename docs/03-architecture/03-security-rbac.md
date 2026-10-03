# الأمان والصلاحيات والتدقيق

## 1. نموذج التهديد (ما نحمي منه)

| التهديد | الاحتمال | الأثر | الدفاع |
|---|---|---|---|
| موظف فرع يعدّل طلبية فرع آخر | عالٍ (خطأ أو قصد) | تشويش الإنتاج | RBAC بموقع (`user_roles.location_id`) |
| أمين مخزن "يصلّح" رقماً بأثر رجعي ليخفي عجزاً | متوسط | خسارة مالية غير مكتشفة | دفتر append-only (DB trigger) + audit |
| موظف سابق يدخل من جواله القديم | متوسط | تسريب/تخريب | إلغاء الجهاز الموثوق + انتهاء الجلسات |
| جهاز فرع مشترك يُترك مفتوحاً | عالٍ | إدخال من غير المخوَّل | PIN بعد خمول 5 دقائق |
| تخمين PIN | متوسط | دخول غير مصرح | 5 محاولات → قفل 15 دقيقة، PIN مرتبط بجهاز واحد |
| حقن SQL / XSS | منخفض (أدوات حديثة) | اختراق كامل | Drizzle parameterized، React escaping، CSP |
| تسرب بيانات مستأجر لآخر | منخفض لكن كارثي | فقدان الثقة بالمنتج | `tenant_id` إجباري + اختبارات عزل |
| فقدان البيانات | منخفض | توقف العمل | D1 Time Travel 30 يوم + تصدير ليلي R2 |

## 2. المصادقة

### 2.1 الدخول الأول (كلمة مرور)
```
POST /auth/login { identifier (email|phone), password, deviceFingerprint, deviceLabel }
→ verify Argon2id hash
→ create trusted_device (if new) ; create session (KV, TTL 30d sliding)
→ Set-Cookie: sid=<opaque 256-bit>; HttpOnly; Secure; SameSite=Lax; Path=/
→ response includes deviceId (localStorage) للـ PIN لاحقاً
```

### 2.2 الدخول السريع (PIN)
- بعد الدخول الأول، المستخدم يُعيّن PIN (4–6 أرقام). `pin_hash = Argon2id(pin + user_id)`.
- عند الفتح التالي من نفس الجهاز (`deviceId` موجود وغير مُلغى): شاشة PIN فقط.
- `POST /auth/pin { deviceId, pin }` → session جديدة.
- **Rate limit** في KV: `pin_fail:{deviceId}` → 5 محاولات / 15 دقيقة.
- بعد 15 محاولة فاشلة إجمالاً → الجهاز يُلغى ويُطلب كلمة المرور.
- **قفل الخمول**: بعد 5 دقائق بدون تفاعل (قابل للتهيئة) → شاشة PIN فوق التطبيق (المسودة محفوظة).

### 2.3 الجلسات
- مخزّنة في Workers KV: `session:{sid}` → `{user_id, tenant_id, device_id, roles[], created, lastSeen}`.
- TTL 30 يوم منزلق. `lastSeen` يُحدَّث كل 5 دقائق كحد أقصى (توفير كتابات).
- تسجيل الخروج = حذف المفتاح. إلغاء جهاز = حذف كل جلساته.
- `GET /auth/me` يُرجع الجلسة + الأدوار + المواقع → العميل يبني القوائم.

### 2.4 ما لا نفعله (عمداً)
- لا JWT طويلة العمر (لا يمكن إلغاؤها).
- لا OAuth اجتماعي في M1 (الموظفون لا يحتاجونه؛ يُضاف لاحقاً إن طُلب).
- لا SMS OTP في M1 (تكلفة + تعقيد؛ البريد/الهاتف كمعرّف فقط).

## 3. الصلاحيات (RBAC)

### 3.1 مصفوفة الأدوار × الموارد

| المورد / الفعل | owner | admin | plant_manager | plant_staff | branch_user | storekeeper | viewer |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Tenant settings/branding** | ✅ | ✅ | — | — | — | — | — |
| **Users & roles** | ✅ | ✅ | — | — | — | — | — |
| **Locations, UoMs** | ✅ | ✅ | — | — | — | — | — |
| **Catalog (categories/products)** CRUD | ✅ | ✅ | ✏️ | — | — | — | — |
| **Catalog** read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Order windows** CRUD | ✅ | ✅ | ✅ (معمله) | — | — | — | — |
| **Orders** create/submit/cancel | ✅ | ✅ | — | — | ✅ (فرعه) | — | — |
| **Orders** read | ✅ | ✅ | ✅ (فروع معمله) | ✅ (فروع معمله) | ✅ (فرعه) | — | ✅ |
| **Exceptions** request | — | — | — | — | ✅ | — | — |
| **Exceptions** approve/reject | ✅ | ✅ | ✅ | — | — | — | — |
| **Production orders** read | ✅ | ✅ | ✅ | ✅ | 👁️ (حالة طلبيته فقط) | — | ✅ |
| **Production** lock/start/complete/assign | ✅ | ✅ | ✅ | — | — | — | — |
| **Production** section complete | ✅ | ✅ | ✅ | ✅ | — | — | — |
| **Production** print/export | ✅ | ✅ | ✅ | ✅ | — | — | ✅ |
| **Deliveries** create | ✅ | ✅ | ✅ | ✅ | — | — | — |
| **Deliveries** receive (QR/digital sign) | — | — | — | — | ✅ | — | — |
| **Raw materials, suppliers** CRUD | ✅ | ✅ | — | — | — | ✅ | — |
| **Vouchers** create/post/cancel | ✅ | ✅ | — | — | — | ✅ | — |
| **Counts** | ✅ | ✅ | — | — | — | ✅ | — |
| **Stock reports** | ✅ | ✅ | 👁️ | — | — | ✅ | ✅ |
| **Cost fields** (unit_cost, valuation, value) | ✅ | ✅ | — | — | — | ✅ | ✅* |
| **Audit log** | ✅ | ✅ | — | — | — | — | — |

✅ كامل · ✏️ تعديل بدون حذف · 👁️ قراءة محدودة · — ممنوع · *viewer يرى التكلفة فقط إن مُنح `can_view_costs`

### 3.2 التنفيذ

```ts
// middleware/rbac.ts
type Permission = 'orders:submit' | 'orders:read' | 'production:lock' | 'vouchers:post' | 'costs:view' | ...;

const ROLE_PERMS: Record<Role, Permission[]> = {
  owner: ['*'],
  admin: ['*', '!billing:*'],
  plant_manager: ['catalog:write', 'windows:*', 'orders:read', 'exceptions:decide', 'production:*', 'deliveries:create', 'stock:read'],
  plant_staff: ['catalog:read', 'orders:read', 'production:read', 'production:section_complete', 'production:print', 'deliveries:create'],
  branch_user: ['catalog:read', 'orders:*', 'exceptions:request', 'production:read_own', 'deliveries:receive'],
  storekeeper: ['inventory:*', 'costs:view'],
  viewer: ['*:read'],
};

// استخدام
app.post('/orders/submit', requirePerm('orders:submit'), scopeToLocation('branch'), handler);
```

- `requirePerm` يفحص الدور.
- `scopeToLocation` يضمن أن `location_id` في الطلب ∈ مواقع المستخدم لهذا الدور (أو الدور عام `location_id IS NULL`).
- **صلاحيات مستوى الحقل**: `serializeForRole(entity, role)` يحذف `*_cost_minor`, `valuation_*`, `stock_value_*` لمن ليس لديه `costs:view`. تُطبَّق في طبقة الـ API قبل الإرسال — ليس في الواجهة فقط.

### 3.3 عزل المستأجر — خطوط الدفاع
1. **Middleware**: `tenant_id` يُستخرج من الجلسة، لا من الطلب أبداً.
2. **Repository**: كل استعلام يمر عبر `TenantRepo` الذي يحقن `WHERE tenant_id = ?`.
3. **اختبار آلي**: يفحص كل ملف في `infrastructure/` بحثاً عن `db.select/insert/update/delete` خارج `TenantRepo` → فشل CI.
4. **اختبار تكامل**: مستأجران، كل مسار API يُستدعى بجلسة A ومعرّف كيان من B → يجب 404 (لا 403 — لا نكشف الوجود).
5. **عند الهجرة لـ Postgres**: RLS كطبقة خامسة.

## 4. التدقيق (Audit)

### 4.1 ما يُسجَّل
كل تغيير على: `orders` (submit/revise/cancel/lock)، `production_orders` (كل الأفعال)، `deliveries`، `vouchers` (post/cancel)، `count_sessions` (commit)، `raw_materials`/`products` (update/deactivate)، `users`/`user_roles`، `tenant_settings`/`branding`، `trusted_devices` (revoke)، محاولات الدخول الفاشلة.

### 4.2 كيف
```ts
// decorator على use cases
@Audited('order', 'submit')
class SubmitOrder { ... }

// يُنتج داخل نفس المعاملة:
audit_log { actor_id, entity_type:'order', entity_id, action:'submit', before: {status:'draft', revision:0}, after: {status:'submitted', revision:1}, ip, device_id, at }
```
- `before/after` = الحقول المتغيرة فقط (diff)، لا الكيان كاملاً.
- `audit_log` append-only (trigger).
- الاحتفاظ: دائم. (الحجم صغير — آلاف الصفوف شهرياً.)

### 4.3 الواجهة
- شاشة "سجل النشاط" للأدمن: فلترة بالكيان/الشخص/الفترة.
- على كل كيان حساس: تبويب "السجل" يعرض خطاً زمنياً بالعربية: "أحمد عدّل الكمية من 40 إلى 55 — قبل ساعتين".

## 5. حماية التطبيق

| الطبقة | الإجراء |
|---|---|
| **Transport** | HTTPS فقط (Cloudflare يفرضها). HSTS. |
| **CSP** | `default-src 'self'; img-src 'self' data: blob: https://<r2>; font-src 'self'; connect-src 'self'; frame-ancestors 'none'` |
| **Cookies** | HttpOnly, Secure, SameSite=Lax |
| **CSRF** | SameSite=Lax + فحص `Origin` على كل طلب مُغيِّر |
| **Input** | Zod على كل مدخل. أحجام: body ≤ 256KB، signature ≤ 50KB، logo ≤ 2MB |
| **Rate limiting** | KV counters: login 10/دقيقة/IP، PIN 5/15د/جهاز، API 300/دقيقة/جلسة |
| **Secrets** | Wrangler secrets (VAPID keys, pepper). لا شيء في الكود |
| **Passwords** | Argon2id (memory 64MB, iterations 3) + pepper |
| **Uploads** | الشعار: فحص MIME حقيقي + إعادة ترميز لـ WebP/PNG عبر Images API. التوقيع: PNG فقط، يُخزَّن BLOB في D1 (صغير) أو R2 |
| **Logs** | لا PII في السجلات. `requestId` للتتبع |
| **Dependencies** | Renovate + `pnpm audit` في CI |

## 6. النسخ الاحتياطي والاستعادة

| الآلية | التفاصيل |
|---|---|
| D1 Time Travel | استعادة لأي لحظة خلال 30 يوماً — مدمج |
| تصدير ليلي | Cron 03:00 بتوقيت المستأجر → `wrangler d1 export` → R2 `backups/{tenant}/{date}.sql.gz` → احتفاظ 90 يوماً |
| تصدير للعميل | زر "تنزيل نسخة احتياطية" للـ owner → Excel شامل + SQL |
| اختبار الاستعادة | ربع سنوي: استعادة إلى staging والتحقق من `v_stock_on_hand` = `stock_balances` |

## 7. الخصوصية
- البيانات الشخصية المخزّنة: اسم، بريد/هاتف، IP في audit. لا أكثر.
- التوقيعات الرقمية: صور صغيرة، لا تُشارك خارج المستأجر.
- حذف مستخدم = تعطيل (`is_active=0`) + إخفاء الاسم في الواجهة؛ السجل التاريخي يبقى (مطلوب للتدقيق).
- حذف مستأجر = تصدير كامل ثم حذف فعلي بعد 30 يوماً (soft → hard).
