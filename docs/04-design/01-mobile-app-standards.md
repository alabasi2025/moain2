# معايير "تطبيق حقيقي" — قائمة التحقق المُلزِمة

> كل بند هنا **يُختبر** قبل أي إصدار. البند الفاشل = لا إصدار. المصادر: Material 3، Apple HIG، web.dev PWA، WCAG 2.2، بحث 2026.

## A. التثبيت والهوية (يبدو تطبيقاً من اللحظة الأولى)

| # | المعيار | التنفيذ | الاختبار |
|---|---|---|---|
| A1 | أيقونة تطبيق بكل الأحجام + maskable | `manifest.json`: 192, 512, maskable 512; `apple-touch-icon` 180 | Lighthouse PWA |
| A2 | شاشة بداية (Splash) بالشعار | Android: من manifest (bg + icon). iOS: `apple-touch-startup-image` لكل حجم شاشة (مُولَّد آلياً بـ `pwa-asset-generator`) | يدوي على جهازين |
| A3 | يفتح بدون شريط متصفح | `"display": "standalone"` + `apple-mobile-web-app-capable` | `display-mode: standalone` media query |
| A4 | لون شريط الحالة متناسق | `theme_color` = `--bg`; iOS `apple-mobile-web-app-status-bar-style: default` (أو `black-translucent` مع safe-area) | بصري |
| A5 | اسم قصير على الشاشة الرئيسية | `"short_name": "مُعين"` (≤ 12 حرفاً) | — |
| A6 | إرشاد التثبيت | Android: `beforeinstallprompt` → بطاقة "ثبّت". iOS: بطاقة بالشرح المصوّر. تظهر بعد أول إرسال ناجح (لحظة قيمة)، تُخفى 30 يوماً عند الرفض | E2E |
| A7 | لا يبدو "موقعاً" | لا footer روابط، لا breadcrumbs، لا hero sections، لا تمرير صفحة كاملة — كل شاشة محتواها فقط | مراجعة تصميم |
| A8 | اختصارات التطبيق | `manifest.shortcuts`: "طلبية اليوم"، "سند جديد" (Android long-press) | — |

## B. التخطيط والمناطق الآمنة

| # | المعيار | التنفيذ |
|---|---|---|
| B1 | `viewport-fit=cover` + safe-area | `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">`; `padding-top: env(safe-area-inset-top)` على Header؛ `padding-bottom: env(safe-area-inset-bottom)` على BottomNav وStickyActionBar |
| B2 | ارتفاع صحيح بدون قفزات | `height: 100dvh` (fallback `100vh` ثم `-webkit-fill-available`). لا `100vh` وحده |
| B3 | لا تمرير مطاطي للصفحة | `html, body { overscroll-behavior: none; height: 100%; overflow: hidden }` والمحتوى في حاوية `overflow-y: auto` |
| B4 | لا zoom بالقرص (pinch) | `user-scalable=no` **مرفوض** (وصولية). بدلاً منه: مدخلات ≥ 16px تمنع auto-zoom iOS، ونسمح بالقرص |
| B5 | لا تحديد نص عرضي على عناصر التحكم | `user-select: none` على الأزرار والـ stepper؛ النص العادي قابل للتحديد |
| B6 | لا تمييز لمس أزرق | `-webkit-tap-highlight-color: transparent` + حالة `:active` خاصة بنا |
| B7 | لوحة المفاتيح لا تغطي المدخل | `interactive-widget=resizes-content` + `scrollIntoView({block:'center'})` عند التركيز |
| B8 | الاتجاه RTL كامل | `dir="rtl"` على html؛ logical properties؛ الأسهم تنقلب؛ التمرير الأفقي يبدأ من اليمين |
| B9 | التدوير | يعمل بالعرضين؛ الجداول تستفيد من الأفقي؛ لا قفل اتجاه |

## C. التنقل

| # | المعيار | التنفيذ |
|---|---|---|
| C1 | شريط تنقل سفلي 3–5 عناصر | حسب الدور (انظر `02-screen-map.md`). 64px + safe-area. أيقونة+نص دائماً |
| C2 | المؤشر النشط واضح | pill brand-100 خلف الأيقونة + لون brand للنص (Material 3 Expressive) |
| C3 | الرجوع يعمل كما يتوقع المستخدم | زر رجوع في Header (سهم يمين في RTL) + زر النظام Android + سحب من الحافة iOS (المتصفح يوفره). التاريخ مُدار بـ router — Sheet المفتوح يُغلق بالرجوع لا الشاشة |
| C4 | ≤ 3 نقرات لأي وظيفة رئيسية | من الرئيسية: طلبية اليوم (1)، سند جديد (1)، أمر إنتاج اليوم (1)، طباعة (2) |
| C5 | الحفاظ على حالة التبويب | التبديل بين التبويبات لا يفقد التمرير أو المسودة (keep-alive للتبويبات الرئيسية) |
| C6 | روابط عميقة | كل شاشة لها URL. فتح `/orders/abc` من إشعار يصل مباشرة (بعد PIN) |
| C7 | انتقالات اتجاهية | دخول من اليسار (RTL forward)، خروج لليمين (back). 300ms ease-out. Shared element للبطاقة→التفاصيل حيث سهل |

## D. اللمس والإدخال

| # | المعيار | التنفيذ |
|---|---|---|
| D1 | أهداف ≥ 48×48dp، فجوة ≥ 8 | lint: كل `button`/`a`/`[role=button]` له `min-h-12 min-w-12` |
| D2 | استجابة < 100ms | `:active` فوري (scale .97)، لا انتظار شبكة للتغذية الراجعة |
| D3 | الإجراء الأساسي في منطقة الإبهام | CTA في StickyActionBar أسفل. Header لعنوان + إجراء ثانوي فقط |
| D4 | الإجراءات المدمرة بعيدة عن الإبهام ومؤكدة | "إلغاء الطلبية" في قائمة ⋯ أعلى + Sheet تأكيد بسبب |
| D5 | لوحة المفاتيح الصحيحة | `inputmode="decimal"` للكميات، `numeric` للـ PIN، `tel` للهاتف، `email`، `search` |
| D6 | بديل لكل إيماءة | السحب للحذف ← زر ⋯ أيضاً. السحب لإغلاق Sheet ← زر X أيضاً |
| D7 | Pull-to-refresh | على القوائم الرئيسية فقط، مؤشر brand، لا على شاشات التحرير |
| D8 | ضغط مطوّل | على −/+ للتسارع؛ على صف الصنف لفتح ملاحظة سريعة |
| D9 | Haptics | 10ms نجاح، [10,30,10] خطأ. ليس على كل نقرة |

## E. الحالة والتغذية الراجعة

| # | المعيار | التنفيذ |
|---|---|---|
| E1 | أربع حالات لكل شاشة بيانات | `loading` (Skeleton)، `empty` (EmptyState)، `error` (ErrorState + retry)، `loaded`. لا دوّار مركزي أبداً |
| E2 | Optimistic UI | الإرسال/الترحيل/التسليم تظهر فوراً مع شارة مزامنة |
| E3 | مؤشر offline دائم | SyncIndicator أعلى. الأزرار التي تحتاج اتصالاً تُعطَّل مع tooltip "يحتاج اتصالاً" |
| E4 | Toast لا Alert | نجاح/فشل عبر Toast أسفل، 4s، إجراء اختياري. `alert()` محظور |
| E5 | حفظ تلقائي مرئي | "محفوظ ✓" صغير يومض بعد كل تعديل في المسودة |
| E6 | تقدّم حقيقي للعمليات الطويلة | شريط تقدم مع نسبة للتصدير/PDF؛ لا دوّار بلا نهاية |
| E7 | تحديث التطبيق غير مُقاطِع | "إصدار جديد متاح — تحديث" كـ banner عند الخمول؛ لا reload أثناء الكتابة |
| E8 | رسائل خطأ إنسانية بالعربية | "رصيد غير كافٍ: المتاح 8 كجم" لا "Error 422" |

## F. الأداء المُدرَك

| # | المعيار | القيمة |
|---|---|---|
| F1 | أول رسم ذو معنى | < 1s (SW cache) |
| F2 | Skeleton خلال | 0ms (جزء من الـ shell) |
| F3 | INP | < 100ms p75 |
| F4 | انتقالات | 60fps، transform/opacity فقط |
| F5 | قوائم طويلة | virtualized > 50 عنصر |
| F6 | صور | lazy + aspect-ratio محجوز |

## G. الوصولية

| # | المعيار |
|---|---|
| G1 | WCAG 2.2 AA — Lighthouse ≥ 95 |
| G2 | Dynamic Type 200% بدون كسر أفقي |
| G3 | `aria-label` عربي على كل أيقونة تفاعلية |
| G4 | ترتيب تركيز منطقي (RTL: يمين→يسار، أعلى→أسفل) |
| G5 | `prefers-reduced-motion` → بدون حركة |
| G6 | التباين 4.5:1 / 3:1 |
| G7 | قارئ شاشة: الحالات والكميات تُقرأ بمعنى ("كرواسون زبدة، 40 حبة، محدد") |

## H. الأمان على الجهاز

| # | المعيار |
|---|---|
| H1 | قفل PIN بعد 5 دقائق خمول (قابل للتهيئة 1–30) |
| H2 | إخفاء المحتوى في App Switcher: عند `visibilitychange: hidden` نعرض طبقة شعار فوق المحتوى (يمنع لقطة حساسة) |
| H3 | لا بيانات حساسة في localStorage (فقط deviceId وتفضيلات العرض)؛ البيانات في IndexedDB |
| H4 | مسح البيانات المحلية عند تسجيل الخروج الصريح |

## I. قائمة الفحص قبل الإصدار (Release Gate)

```
[ ] Lighthouse PWA = 100, A11y ≥ 95, Perf ≥ 90 (mobile, throttled)
[ ] يُثبَّت ويفتح standalone على: Android Chrome, iOS Safari 16.4+, Samsung Internet
[ ] Splash + أيقونة صحيحة على الثلاثة
[ ] Safe areas صحيحة على iPhone 15 Pro (Dynamic Island) و Pixel 8
[ ] لا تمرير مطاطي، لا قفزة 100vh، لوحة المفاتيح لا تغطي
[ ] كل الأزرار ≥ 48dp (سكريبت فحص DOM)
[ ] 4 حالات لكل شاشة بيانات (قائمة شاشات × حالات)
[ ] Offline: الطلبية تُرسل بعد عودة الشبكة (E2E)
[ ] PIN lock + App Switcher mask
[ ] Dynamic Type 200% — 5 شاشات رئيسية
[ ] VoiceOver على شاشة الطلب (يدوي)
[ ] RTL: لا نص مقلوب، لا أيقونة اتجاه خاطئة، التمرير الأفقي يبدأ يميناً
[ ] الطباعة من Chrome Desktop لكل النماذج
[ ] الوضع الداكن — 5 شاشات
```
