# ADR-0012: مواءمة الوثائق مع قيود المنصة الفعلية

**الحالة:** مقترح — بانتظار موافقة صاحب المشروع · **التاريخ:** 2026-10-03

## السياق
بعض ما في الوثائق غير قابل للتنفيذ حرفياً على المنصة المختارة أو بالأدوات الحالية:

| # | ما تقوله الوثائق | الواقع | المصدر |
|---|---|---|---|
| P1 | "Lighthouse PWA = 100" | فئة PWA **أُزيلت** من Lighthouse 12 (مايو 2024) | Lighthouse changelog، PageSpeed Insights release notes |
| P2 | `BEGIN TRANSACTION … COMMIT` في الترحيل والإرسال | D1 لا يدعمها؛ الذرية عبر `batch()` فقط | Cloudflare D1 docs/blog، drizzle-orm#2463 |
| P3 | جلسات وrate-limit في KV + "إلغاء الجهاز = قطع فوري" | KV متسق في النهاية (≤ 60s)، ولا عمليات ذرية للعدّ | Cloudflare KV docs |
| P4 | Argon2id بذاكرة 64MB | لا Argon2 في WebCrypto؛ وPBKDF2 مسقوف بـ 100k في workerd؛ وذاكرة الـ isolate 128MB | workerd#1346 |
| P5 | SSE للمصفوفة الحية | لا pub/sub بين الطلبات في Worker بلا Durable Objects | — |
| P6 | `print.css` يستورد Google Fonts | البرومبت يمنعه في الإنتاج | AGENT_PROMPT |
| P7 | Motion (framer-motion) في ADR-0004 | غير موجود في "المكدس بالضبط" ويستهلك ميزانية الـ 180KB | AGENT_PROMPT |
| P8 | Images API / resvg-wasm لتوليد الأيقونات | مدفوع أو ثقيل على Worker | — |
| P9 | بطاقة التثبيت على iOS بعد أول إرسال | على iOS لا يشارك تطبيق الشاشة الرئيسية تخزين Safari، فيضطر المستخدم للدخول مرة ثانية | WebKit |

## القرار (مقترح)
1. **P1:** بوابة "قابلية التثبيت" بـ Playwright في CI: manifest صالح (الاسم، `short_name` ≤ 12، `display: standalone`، `start_url`، `theme_color`، `background_color`)، أيقونات 192/512/maskable قابلة للجلب، SW يتحكم بالصفحة، فتح offline يعيد 200، وسوم Apple، `display-mode: standalone` في سياق مُحاكى. Lighthouse يبقى لـ Perf ≥ 90 وA11y ≥ 95 وBest-Practices ≥ 95.
2. **P2:** كل use case بالنمط: قراءة ← حساب نقي في `shared` ← `db.batch([...])` ذري يضم الكتابات وسجل التدقيق، مع Triggers ADR-0011 حارساً ضد القراءة القديمة (إعادة محاولة واحدة عند `LEDGER_CHAIN_BROKEN`).
3. **P3:** جدول `sessions` الموجود في D1 هو المرجع، وKV كاش قراءة اختياري (TTL ≤ 60s) يُحذف عند الإلغاء. عدّادات محاولات PIN/الدخول في جدول D1 صغير إضافي `auth_attempts(key, count, window_start, locked_until)`.
4. **P4:** واجهة `PasswordHasher` واحدة بتنفيذين: Argon2id-WASM (m=19MiB، t=2، p=1 — حد OWASP الأدنى) للإنتاج على Workers Paid، وPBKDF2-SHA256 100k + pepper للمجاني. التجزئة تحمل بادئة الخوارزمية للترقية الشفافة عند الدخول. الـ PIN محمي بربط الجهاز وحد المحاولات، لا بقوة التجزئة.
5. **P5:** M1 يستخدم `GET /production-orders/:id/version` (ETag، و304 إن لم يتغير) كل 10 ثوانٍ أثناء `open` + عند `focus`. واجهة `useLiveDemand()` نفسها تسمح بالترقية إلى Durable Object + WebSocket لاحقاً بلا تغيير في الشاشات.
6. **P6:** خطوط مستضافة ذاتياً (subset woff2) في `print.css` المنقول إلى المكونات.
7. **P7:** CSS transitions + View Transitions API (fallback: بدون حركة). لا Motion.
8. **P8:** التحجيم في المتصفح عند الرفع (Canvas): 64/192/512 + maskable بحشوة 20% + splash iOS، ثم الرفع إلى R2. الـ Worker يخدم فقط.
9. **P9:** على iOS يظهر إرشاد التثبيت في شاشة الدخول **قبل** تسجيل الدخول. Android بلا تغيير.

## البدائل المرفوضة
- **Lighthouse 11 القديم للحصول على "PWA 100":** رقم من أداة مهجورة لا يقيس معايير Chrome الحالية.
- **Durable Objects من M0:** تعقيد وتكلفة قبل الحاجة. الواجهة مُعدّة للترقية.
- **Postgres الآن للحصول على معاملات:** يخالف ADR-0003، والـ `batch` + Triggers تكفي لهذا الحجم.

## العواقب
- (+) كل معيار في الوثائق يصبح قابلاً للقياس فعلاً بأدوات اليوم.
- (−) "اللحظية" في M1 تأخير ≤ 10 ثوانٍ بدل < 1 ثانية — كافٍ لسيناريو "الفروع ترسل خلال المساء".
- (−) Argon2id يحتاج Workers Paid ($5/شهر).
