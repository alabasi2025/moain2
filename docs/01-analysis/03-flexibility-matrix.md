# مصفوفة المرونة — "لا نسأل، نُهيّئ"

> كل سؤال كنا سنسأله للعميل، وكيف يجيب عليه النظام بنفسه عبر التهيئة بدلاً من إعادة البرمجة.

| # | السؤال الذي لن نسأله | الاحتمالات | كيف يتكيّف النظام | أين في المخطط |
|---|---|---|---|---|
| 1 | كم عدد الفروع؟ | 2 الآن، 20 لاحقاً | `locations` بنوع `branch`. الإضافة من شاشة الإعدادات. شاشة المعمل Pivot ديناميكي | `locations.kind = 'branch'` |
| 2 | كم معمل؟ | 1 أو أكثر | `locations.kind = 'plant'`. كل فرع له `default_plant_id`. الطلبية تحمل `to_location_id` | `locations.default_plant_id` |
| 3 | كم صنف وكم تصنيف؟ | 30 أو 3000 | شجرة تصنيفات غير محدودة العمق. بحث وفلترة. تحميل كسول للقوائم الطويلة | `categories.parent_id` |
| 4 | هل نفس الأصناف لكل الفروع؟ | نعم / بعض الفروع لا تبيع كيك | `product_availability (product_id, location_id)` اختياري. فارغ = متاح للجميع | جدول اختياري |
| 5 | طلبية واحدة باليوم أم أكثر؟ | واحدة / صباحية ومسائية / طارئة | `order_windows` لكل معمل: اسم، وقت فتح، وقت إغلاق، نوع (`regular`/`urgent`). الافتراضي: نافذة واحدة تغلق 22:00 | `order_windows` |
| 6 | متى يُغلق باب الطلبات؟ | 20:00 / 22:00 / منتصف الليل | `order_windows.cutoff_time`. بعد الإغلاق: الفرع يرى "مغلق"، ويمكنه طلب استثناء | `order_windows.cutoff_time`, `orders.late_approved_by` |
| 7 | هل الطلبية لليوم التالي أم لنفس اليوم؟ | غالباً التالي | `order_windows.delivery_offset_days` (0 = نفس اليوم، 1 = غداً). الافتراضي 1 | `order_windows.delivery_offset_days` |
| 8 | هل يبغى تتبّع التكلفة؟ | نعم / لا يهمه الآن | حقول التكلفة اختيارية في الوارد (`unit_cost` nullable). إن تُركت فارغة تُستخدم آخر تكلفة معروفة | `voucher_lines.unit_cost` |
| 9 | طريقة التقييم؟ | متوسط متحرك / FIFO | `tenant_settings.valuation_method = 'moving_avg'` افتراضياً. FIFO يحتاج `stock_queue` JSON (مُعدّ في المخطط، غير مُفعَّل) | `tenant_settings`, `stock_movements.stock_queue` |
| 10 | يسمح برصيد سالب؟ | لا (افتراضي) / نعم | `tenant_settings.allow_negative_stock`. عند `false`: الصرف يُرفض. عند `true`: منطق SAP | `tenant_settings.allow_negative_stock` |
| 11 | مين يُدخل حركات المخزن؟ | شخص واحد / عدة | أي عدد مستخدمين بدور `storekeeper`. كل حركة تحمل `actor_id` | `users`, `user_roles`, `stock_movements.actor_id` |
| 12 | الصادر يرتبط بأمر إنتاج؟ | أحياناً | `vouchers.ref_type/ref_id` اختياري. يمكن ربط سند الصرف بأمر إنتاج أو تركه عاماً | `vouchers.ref_type` |
| 13 | مخزن واحد أم أكثر؟ | واحد الآن | `locations.kind = 'warehouse'`. الحركة تحمل `location_id`. التحويل بين مخازن = حركتان | `stock_movements.location_id` |
| 14 | وحدات القياس؟ | كجم، لتر، حبة، كرتون... | `uoms` + `uom_conversions` (كرتون = 12 حبة). كل مادة لها وحدة أساسية | `uoms`, `uom_conversions` |
| 15 | هل يحتاج توقيعاً رقمياً؟ | ورقي / رقمي / الاثنان | `deliveries.signature_blob` nullable. الورقة فيها خانة توقيع يدوي + QR للرقمي | `deliveries.signature_blob` |
| 16 | من يستلم في الفرع؟ | أي موظف / شخص محدد | `deliveries.received_by_name` نص حر + `received_by_user_id` اختياري | `deliveries` |
| 17 | التسليم كامل دائماً؟ | لا، أحياناً جزئي | `delivery_lines.qty_delivered` منفصلة عن `order_lines.qty_ordered`. الفرق يظهر في التقارير | `delivery_lines` |
| 18 | هل يبغى مرتجعات؟ | ربما | `stock_movements.reason = 'return'` موجود. شاشة المرتجعات في M2 | `reason` enum |
| 19 | هل يبغى وصفات (BOM)؟ | لاحقاً | جداول `recipes`, `recipe_lines` في المخطط من اليوم الأول (فارغة). M3 يُفعّلها | `recipes` |
| 20 | اللغة؟ | عربي / عربي+إنجليزي | كل اسم له `name_ar` + `name_en` nullable. الواجهة i18n جاهزة | `*_ar`, `*_en` |
| 21 | الأرقام عربية أم هندية؟ | غربية (الأشيع) / هندية | `tenant_settings.numerals = 'western' / 'eastern'` | `tenant_settings` |
| 22 | العملة؟ | ريال يمني / سعودي / دولار | `tenant_settings.currency_code`, `currency_decimals`. المبالغ بالوحدات الصغرى | `tenant_settings` |
| 23 | المنطقة الزمنية؟ | Asia/Aden | `tenant_settings.timezone`. كل التواريخ UTC في DB، تُعرض بالمنطقة | `tenant_settings.timezone` |
| 24 | أول يوم في الأسبوع؟ | السبت | `tenant_settings.week_start = 6` | `tenant_settings` |
| 25 | الشعار والألوان؟ | شعاره | `tenant_branding`: logo_url, primary_color, company_name, footer_text, phone, address | `tenant_branding` |
| 26 | هل سيُباع النظام لمخابز أخرى؟ | محتمل جداً | `tenant_id` على كل جدول. تسجيل مستأجر جديد = صف واحد في `tenants` | كل الجداول |
| 27 | كيف يدخل الفرع؟ (كلمة مرور طويلة مزعجة) | PIN سريع | `users.pin_hash` + `devices` موثوقة. الدخول الأول بكلمة مرور، بعدها PIN من 4–6 أرقام على الجهاز الموثوق | `users.pin_hash`, `devices` |
| 28 | هل الفرع يرى أسعار/تكاليف؟ | لا (غالباً) | صلاحيات على مستوى الحقل: دور `branch_user` لا يرى `unit_cost` | `permissions` |
| 29 | طباعة مجمّعة أم لكل فرع؟ | الاثنان | ثلاثة قوالب: مجمّع، حسب التصنيف، حسب الفرع. اختيار عند الطباعة | قوالب الطباعة |
| 30 | هل يبغى إشعارات؟ | نعم ضمنياً | `notifications` + `push_subscriptions`. أحداث: طلبية جديدة، إغلاق النافذة، جاهزية، تسليم، حد أمان | `notifications` |
| 31 | الإنترنت متقطع؟ | نعم (اليمن) | Offline-first: الكتالوج مخزّن محلياً، المسودة محفوظة، الإرسال عبر Outbox | IndexedDB + `outbox` |
| 32 | هل يبغى تقارير شهرية؟ | نعم ضمنياً | تقارير بأي فترة + تصدير Excel. "رصيد أول المدة" يُحسب لأي تاريخ من الدفتر | `v_stock_period_summary` |
| 33 | هل يحتاج جرد دوري؟ | نعم (أي مخزن يحتاج) | `count_sessions` + `count_lines` بنمط snapshot. الفروقات تُولّد حركات `count` | `count_sessions` |
| 34 | التواريخ هجرية أم ميلادية؟ | ميلادي (الأشيع في العمل) مع عرض هجري اختياري | `tenant_settings.calendar = 'gregorian'`، عرض ثانوي هجري في الطباعة اختياري | `tenant_settings` |
| 35 | حقول إضافية خاصة بالعميل؟ | ممكن (مثلاً "رقم الرف") | `custom_fields` JSON على الكيانات الرئيسية + تعريف الحقول في `custom_field_defs` | `custom_fields` |

---

## المبدأ الحاكم

> **إذا كان الجواب على سؤال يمكن أن يتغير خلال عمر النظام، فهو تهيئة وليس كوداً.**

النتيجة: نعرض على العميل نظاماً جاهزاً، يُهيّئه هو (أو نحن معه) في جلسة إعداد مدتها 30 دقيقة، بدلاً من أسبوعين من الأسئلة والتعديلات.

---

## حدود المرونة (ما نرفض جعله مرناً)

المرونة المفرطة = تعقيد = بطء = أخطاء. هذه الأشياء **ثابتة بقرار**:

| ثابت | السبب |
|---|---|
| الدفتر غير قابل للتعديل | المرونة هنا = نهاية الدقة |
| الكميات بالأعداد الصحيحة أو عشرية ثابتة (4 منازل) | لا Float أبداً |
| المبالغ بالوحدات الصغرى الصحيحة | لا Float أبداً |
| `tenant_id` إلزامي في كل استعلام | الأمان لا يُفاوَض |
| `actor_id` إلزامي في كل حركة | التدقيق لا يُفاوَض |
| آلة الحالة للطلبية لا تتخطى مراحل | `draft → submitted` لا يمكن القفز لـ `delivered` |
| أنواع الحركة قائمة مغلقة | `reason` ليس نصاً حراً |
