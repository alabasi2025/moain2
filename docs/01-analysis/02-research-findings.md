# نتائج البحث

> ما بحثنا عنه، ما وجدناه، وما قررناه بناءً عليه. كل نتيجة لها مصدر وقرار.

---

## 1. أنظمة مشابهة (ماذا بنى الآخرون؟)

### 1.1 Craftplan (مفتوح المصدر — Elixir/Phoenix)
**المصدر:** github.com/puemos/craftplan، elixirforum.com

نظام ERP للمصنّعين الحرفيين، بُني أصلاً لمخبز صغير. يغطي: كتالوج بوصفات مُصدَّرة (BOM)، مخزون بتتبع دفعات، طلبات، تخطيط إنتاج مع "make sheets" قابلة للطباعة، مشتريات.

**ما نتعلمه:**
- فصل `Catalog` عن `Inventory` عن `Orders` عن `Production` كسياقات مستقلة — ✅ نتبنّاه.
- "Make sheet" = ورقة الإنتاج المطبوعة — تؤكد أن الطباعة ميزة أساسية لا ثانوية.
- Cost snapshots: تجميد التكلفة لحظة الإنتاج — ✅ نحفظ `unit_cost` في كل حركة.
- أدوار admin/staff فقط — ❌ غير كافٍ لنا؛ نحتاج أدواراً أدق (فرع ≠ معمل ≠ مخزن).

**ما لا نأخذه:** المكدس (Elixir) — لا يناسب النشر الرخيص على Edge ولا فريق التطوير المحتمل.

### 1.2 Apicbase / Supy / Stockifi (تجارية — Central Kitchen)
**المصدر:** get.apicbase.com/internal-ordering، supy.io

كلها تحل نفس المشكلة: فروع تطلب من مطبخ مركزي. النمط المشترك:
1. الفرع يُنشئ "Internal Order" (طلب داخلي).
2. المطبخ المركزي يجمّع ويُنتج.
3. الشحن يُنقص مخزون المركز ويزيد مخزون الفرع تلقائياً.
4. حالات واضحة: Draft → Submitted → In Production → Shipped → Received.
5. Par levels (حدود الطلب التلقائي) لكل فرع.

**القرار:** نتبنّى نفس آلة الحالة مع تعديل للتسمية العربية. Par levels في M3 كميزة "اقتراح الكمية".

### 1.3 Odoo — Inter-warehouse Transfer with Transit Location
**المصدر:** odoo.com/documentation/19.0

نمط "موقع العبور" (Transit): عند الشحن من المعمل، البضاعة تخرج من المعمل وتدخل "العبور"؛ عند الاستلام في الفرع، تخرج من العبور وتدخل الفرع. يحل مشكلة "أين البضاعة وهي في السيارة؟".

**القرار:** في M1 لا نتتبع مخزون المنتجات النهائية في الفروع (العميل لم يطلبه). لكن نصمم `Location` ليشمل نوع `transit` بحيث يُفعَّل في M3+ بدون تغيير.

---

## 2. معمارية المخزون

### 2.1 نمط دفتر الأستاذ (Ledger Pattern)
**المصدر:** plansmith.io/blog/inventory-management-system-database-design، axonops.com/ledger-pattern، codingshuttle.com

> "On-hand stock is derived, never stored. Every change in quantity is an append-only row in a movement ledger, and the current level is the sum of those rows."

النقاط الحاسمة من البحث:
- **لا عمود `quantity` في جدول المواد**. وجوده = "رقم يمكن لأحد أن يكتب فيه" = نهاية الدقة.
- **الدفتر غير قابل للتعديل** عبر Trigger في قاعدة البيانات (لا في التطبيق — لأن شاشة الأدمن ستتجاوز التطبيق).
- **التصحيح = حركة عكسية جديدة**، لا تعديل.
- **كل حركة لها `actor_id`** — حركة بلا فاعل = تغيير مجهول.
- **الكميات مُوقَّعة** (+ وارد، − صادر) مع `CHECK (qty <> 0)`.
- **`reason` مقيّد** بقائمة مغلقة.
- **`ref_type/ref_id`** مؤشر مرن للمصدر (سند، جرد، تحويل).
- **المال بالوحدات الصغرى (قروش/فلوس) كأعداد صحيحة**، لا Float.
- **`is_active` بدل الحذف** للمواد — الحذف يُيتّم التاريخ.
- **الجرد جلسة** (`count_session`) تلتقط `expected_qty` **لحظة الفتح**، لا لحظة الالتزام.
- **Cache الرصيد** (`stock_balances`) فقط عند الحاجة، ومعه استعلام مطابقة دوري. "الدفتر دائماً على حق".

**القرار:** تبنّي كامل. هذا هو الفرق بين "إكسل سحابي" و"نظام دقيق".

### 2.2 نموذج ERPNext — Stock Ledger Entry (SLE)
**المصدر:** github.com/frappe/erpnext/stock/spec/README.md

الحقول التي يحفظها ERPNext في كل سطر دفتر:
- `actual_qty` (التغيير)
- `qty_after_transaction` (الرصيد بعد)
- `incoming_rate` (سعر الوارد)
- `valuation_rate` (المتوسط الحالي بعد الحركة)
- `stock_value` (القيمة الإجمالية بعد)
- `stock_value_difference` (الفرق — يُرحَّل للمحاسبة)
- `voucher_type`, `voucher_no`, `voucher_detail_no` (المصدر)
- `posting_date`, `posting_time` (الترتيب الزمني؛ `creation` يكسر التعادل)
- `is_cancelled` (الإلغاء لا يحذف)

**القرار:** نتبنّى هذا التصميم. حفظ `qty_after` و`valuation_rate_after` و`stock_value_after` في كل حركة يجعل أي تقرير تاريخي استعلاماً بسيطاً بدون إعادة حساب.

### 2.3 المتوسط المرجّح المتحرك والرصيد السالب
**المصدر:** help.sap.com (Negative Stocks at Moving Average Price)، learn.microsoft.com/dynamics365

الصيغة:
```
new_avg = (old_qty × old_avg + in_qty × in_price) / (old_qty + in_qty)
```
الصادر يُقيَّم بـ `old_avg` ولا يغيّره.

**مشكلة الرصيد السالب** (صرفت قبل ما سجّلت التوريد): SAP يحلها بـ:
- عندما الرصيد ≤ 0: **يُثبَّت المتوسط** على آخر قيمة ولا يتغير.
- الوارد الذي يُدخل الرصيد السالب للموجب: الجزء الذي يغطي السالب يُقيَّم بالمتوسط المثبّت، والباقي بسعر الوارد الفعلي.
- الفرق يُرحَّل لحساب "فروقات أسعار".

**القرار:**
- الإعداد الافتراضي: **منع الرصيد السالب** (رفض الصرف إن تجاوز الرصيد) مع رسالة واضحة.
- خيار في الإعدادات: السماح بالسالب (لمن يسجّل بأثر رجعي) مع تطبيق منطق SAP.
- التقريب: `ROUND` إلى 4 منازل عشرية للمتوسط، والقيم بالوحدات الصغرى الصحيحة.

### 2.4 تعدد المستأجرين (Multi-tenancy)
**المصدر:** theroadtoenterprise.com (Postgres RLS)، clerk.com/blog/multitenant-saas

النمط الأشيع: `tenant_id` على كل جدول + فلترة إلزامية في كل استعلام. في Postgres يُفرض بـ RLS؛ في SQLite/D1 يُفرض في طبقة الوصول للبيانات (Repository) مع اختبارات تضمن أن كل استعلام يحمل `tenant_id`.

**القرار:** `tenant_id` من اليوم الأول. Drizzle helper يحقن الشرط تلقائياً. لو هاجرنا لـ Postgres، نضيف RLS كطبقة ثانية.

---

## 3. معايير تطبيقات الموبايل (ليبدو "تطبيقاً حقيقياً")

### 3.1 الأرقام المُلزِمة
**المصدر:** forasoft.com (2026 playbook)، mobileviewer.io (Material 3)، Apple HIG، WCAG 2.2

| المعيار | القيمة | المصدر |
|---|---|---|
| حجم هدف اللمس الأدنى | 48×48dp (Android) / 44×44pt (iOS) | Material 3 / HIG |
| المسافة بين الأهداف | ≥ 8dp | Material 3 |
| ارتفاع عنصر التنقل السفلي | 48–56dp | Material 3 |
| ارتفاع حقل الإدخال | 56dp (outlined) / 48dp (filled) | Material 3 |
| عدد تبويبات التنقل السفلي | 3–5 كحد أقصى | Smashing / Material |
| مدة الانتقالات | 150–300ms (> 500ms = بطيء) | Forasoft |
| تباين النص | 4.5:1 (AA)، 3:1 للكبير | WCAG 2.2 |
| تكبير الخط | حتى 200% بدون كسر التخطيط | WCAG 2.2 |
| استجابة النقر | < 100ms | Forasoft |
| البداية الباردة p90 | < 2.5s | Forasoft / Google |
| أول رسم ذي معنى | < 1s | Forasoft |
| الوصول لأي ميزة رئيسية | ≤ 3 نقرات | Forasoft |

### 3.2 المبادئ العشرة (من Forasoft 2026)
1. صمّم للإبهام — الإجراءات الرئيسية في الثلث السفلي.
2. احترم المنصة — iOS 26 Liquid Glass، Android Material 3 Expressive.
3. شاشة واحدة، وظيفة واحدة.
4. ثلاث نقرات لأي مكان.
5. خمس تبويبات سفلية كحد أقصى.
6. المحتوى أولاً — أخفِ الأشرطة عند التمرير.
7. اطلب الأذونات في سياقها.
8. **اجعل الحالة واضحة: محمّل، يُحمّل، فارغ، خطأ = أربع شاشات مختلفة، لا دوّار واحد.**
9. تعافَ من كل فشل — وضع بدون اتصال، إعادة محاولة.
10. احترم الجسد — 48dp، 8px فجوات، dynamic type، reduced motion.

### 3.3 "هياكل التحميل لا الدوّارات"
> "A skeleton screen that paints structure in 200 ms beats a spinner sitting on a 400 ms fetch, even though the spinner finishes sooner."

**القرار:** لا `<Spinner>` في التطبيق إطلاقاً. كل شاشة لها Skeleton يطابق شكلها النهائي.

### 3.4 Offline-first بنمط Outbox
**المصدر:** sergiiob.dev (Outbox Pattern)، magicbell.com (iOS limitations)

- كل عملية كتابة تُسجَّل أولاً في جدول `outbox` محلي بحالات `PENDING → IN_PROGRESS → COMPLETED/FAILED/CONFLICT`.
- الواجهة تتحدث فوراً (optimistic)، لا تنتظر الخادم.
- Worker يعالج الصف FIFO مع exponential backoff.
- `pendingCount` يُعرض كمؤشر "جارٍ المزامنة / محدَّث".
- **قيد iOS:** لا Background Sync. المزامنة فقط عند `online` و`visibilitychange`. **هذا كافٍ** لسيناريونا.
- **قيد iOS:** 7 أيام بدون فتح = مسح الكاش. **الحل:** إعادة كاش الأصول الحرجة عند كل فتح.
- **قيد iOS:** 50MB تخزين. **الحل:** نحفظ فقط: المسودات، الكتالوج، آخر 7 أيام طلبيات.

### 3.5 PWA على iOS — ما يعمل وما لا يعمل
**المصدر:** magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide

| الميزة | iOS 16.4+ | ملاحظة |
|---|---|---|
| Standalone (بدون شريط Safari) | ✅ | يحتاج `display: standalone` في manifest |
| Push notifications | ✅ | فقط بعد التثبيت على الشاشة الرئيسية |
| Badging (رقم على الأيقونة) | ✅ | |
| Background Sync | ❌ | المزامنة عند الفتح فقط |
| Install prompt تلقائي | ❌ | نعرض تعليمات "شارك → أضف للشاشة الرئيسية" |
| `100vh` صحيح | ❌ | نستخدم `100dvh` + `-webkit-fill-available` |
| Safe area | ✅ | `viewport-fit=cover` + `env(safe-area-inset-*)` |

**القرار:** كل هذه القيود مُعالَجة في `01-mobile-app-standards.md`.

---

## 4. الطباعة والتصدير

### 4.1 PDF عربي
**المصدر:** dev.to (react-pdf Arabic)، github.com/aysnet1/pdfmake-rtl، viprasol.com، nutrient.io

ثلاث طرق:
| الطريقة | مزايا | عيوب |
|---|---|---|
| **HTML → PDF (Puppeteer/Playwright/Browser Rendering)** | المتصفح يتكفّل بتشكيل العربي والـ RTL بشكل مثالي. نفس CSS للشاشة والطباعة. | يحتاج بيئة متصفح (Cloudflare Browser Rendering API أو خادم) |
| pdfmake-rtl | خفيف، يعمل في المتصفح | تشكيل عربي غير مثالي أحياناً، تحكم محدود بالتخطيط |
| @react-pdf/renderer | React-native-like | مشاكل موثقة مع IBM Plex Arabic وCairo (ligatures) |

**القرار:** **HTML → PDF** هو الخيار الوحيد الذي يضمن جودة عربية 100%. نبني القوالب كـ HTML/CSS عادي مع `@page` و`@media print`. التنفيذ:
- **المرحلة الأولى:** `window.print()` من المتصفح (مجاني، فوري، جودة ممتازة من الكمبيوتر).
- **المرحلة الثانية:** Cloudflare Browser Rendering API لتوليد PDF على الخادم (للإرسال بالواتساب/الإيميل، وللجوال).

### 4.2 Excel عربي
**المصدر:** pkgpulse.com (SheetJS vs ExcelJS 2026)، mfyz.com، github.com/SheetJS/sheetjs/issues/322

- **SheetJS Community Edition**: الأكثر تحميلاً، لكن **لا يدعم التنسيق** (ألوان، خطوط، حدود) في النسخة المجانية، ودعم RTL غير موثوق.
- **ExcelJS**: يدعم `worksheet.views = [{ rightToLeft: true }]`، تنسيق كامل، تجميد صفوف، صور (الشعار)، صيغ.

**القرار:** **ExcelJS**. كل تصدير يتضمن: الشعار، اسم التقرير، الفترة، الجدول بتنسيق، صف إجماليات بصيغ حقيقية، `rightToLeft: true`.

---

## 5. الخطوط العربية
**المصدر:** fonts.google.com، github.com/diegomura/react-pdf/issues/2424

| الخط | الاستخدام | السبب |
|---|---|---|
| **IBM Plex Sans Arabic** | واجهة التطبيق | متوازن، 7 أوزان، أرقام واضحة، مصمم للشاشات، مجاني |
| **Cairo** | العناوين والطباعة | هندسي أنيق، يبدو "فخماً" في العناوين الكبيرة |
| Tajawal | بديل | أخف وزناً |
| Noto Kufi Arabic | بديل | تغطية واسعة |

**تحذير من البحث:** react-pdf له مشاكل مع IBM Plex Arabic وCairo (OpenType features). سبب إضافي لاختيار HTML→PDF.

**الأرقام:** نستخدم الأرقام العربية الغربية (0123456789) افتراضياً لأنها الأشيع في الأعمال باليمن والخليج، مع خيار التبديل للأرقام الهندية (٠١٢٣٤٥٦٧٨٩) من الإعدادات.

---

## 6. منصة النشر
**المصدر:** tanstackship.com (D1 vs Supabase 2026)، maheshwaghmare.com

| | Cloudflare D1 + Workers | Supabase |
|---|---|---|
| التكلفة عند 50K MAU | ~80% أقل | أعلى |
| زمن الاستجابة | أقل (Edge) | أعلى (منطقة واحدة) |
| قاعدة البيانات | SQLite (حد 10GB لكل DB) | Postgres كامل |
| Realtime | يدوي (SSE/Polling) | مدمج |
| Auth | يدوي | مدمج |
| RLS | لا (نفرضه في الكود) | نعم |
| Time Travel backup | 30 يوم | حسب الخطة |

**القرار:** **Cloudflare D1 + Workers** للبداية:
- التكلفة شبه صفر لحجم مخبز (حتى 10 فروع × 100 صنف × 365 يوم = بيانات صغيرة جداً).
- Edge = استجابة أسرع للمستخدمين في اليمن.
- الهجرة لـ Postgres ممكنة: المخطط مكتوب بـ SQL قياسي، وDrizzle يدعم الاثنين.
- خطة الهجرة الموثقة في `adr/0003-database.md`.

---

## 7. خلاصة القرارات المستندة للبحث

| # | القرار | المصدر الداعم |
|---|---|---|
| 1 | Ledger pattern مع trigger immutability | plansmith, axonops, ERPNext |
| 2 | حفظ qty_after/valuation_rate_after في كل حركة | ERPNext SLE spec |
| 3 | Moving weighted average + منطق SAP للسالب | SAP S/4HANA docs |
| 4 | tenant_id من اليوم الأول | Clerk, theroadtoenterprise |
| 5 | Outbox pattern للـ offline | sergiiob.dev |
| 6 | المزامنة عند الفتح فقط (قيد iOS) | magicbell.com |
| 7 | 48dp/8dp/3-5 tabs/150-300ms | Material 3, HIG, Forasoft |
| 8 | Skeleton لا Spinner | Forasoft |
| 9 | HTML→PDF لا مكتبات PDF | react-pdf issues, dev.to |
| 10 | ExcelJS لا SheetJS CE | pkgpulse, mfyz |
| 11 | Cloudflare D1/Workers | tanstackship benchmark |
| 12 | IBM Plex Sans Arabic + Cairo | Google Fonts |
| 13 | Internal Order state machine | Apicbase, Supy pattern |
| 14 | Transit location مُعدّ مسبقاً | Odoo 19 docs |
