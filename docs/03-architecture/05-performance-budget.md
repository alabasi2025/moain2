# ميزانية الأداء

> تُقاس على **Moto G Power (2022) أو ما يعادله** على شبكة 3G سريعة (1.6Mbps، 150ms RTT) — لأن هذا واقع المستخدم في اليمن، لا iPhone 15 على Wi-Fi.

## 1. الأرقام المُلزِمة

| المقياس | الهدف | الحد الأحمر | الأداة |
|---|---|---|---|
| **البداية الباردة (LCP)** p75 | < 2.0s | 2.5s | Lighthouse CI + RUM |
| **الفتح الدافئ (SW cache)** | < 500ms | 800ms | RUM |
| **INP** (استجابة التفاعل) p75 | < 100ms | 200ms | RUM |
| **CLS** | < 0.05 | 0.1 | Lighthouse |
| **JS أولي (gzip)** | < 180KB | 250KB | `vite-bundle-visualizer` في CI |
| **CSS أولي (gzip)** | < 25KB | 40KB | |
| **الخطوط (subset, woff2)** | < 90KB إجمالاً | 120KB | |
| **إجمالي النقل للشاشة الأولى** | < 300KB | 400KB | |
| **تحميل الكتالوج (200 صنف)** | < 400ms | 800ms | API timing |
| **إرسال طلبية** (round trip) | < 600ms | 1.2s | |
| **ترحيل سند 20 سطراً** | < 800ms | 1.5s | |
| **بناء demand matrix (5 فروع × 100 صنف)** | < 300ms | 600ms | |
| **توليد Excel (500 صف) في المتصفح** | < 1.5s | 3s | |
| **فتح معاينة الطباعة** | < 1s | 2s | |
| **PDF على الخادم** | < 3s | 6s | |
| **Lighthouse PWA score** | 100 | 90 | |
| **Lighthouse Accessibility** | ≥ 95 | 90 | |

## 2. كيف نحقّقها

### 2.1 التقسيم (Code splitting)
```
الشاشة الأولى (shell + auth + home):           ~120KB
features/ordering (lazy):                       ~40KB
features/production (lazy):                     ~50KB
features/inventory (lazy):                      ~60KB
features/reports + recharts (lazy):             ~90KB
lib/excel (ExcelJS, lazy عند الضغط على تصدير):  ~300KB
lib/qrcode (lazy في الطباعة):                    ~10KB
print routes (منفصلة تماماً، بدون shell):        ~30KB
```
المستخدم بدور `branch_user` لا يحمّل أبداً كود المخزون.

### 2.2 الخطوط
- IBM Plex Sans Arabic: أوزان 400, 500, 600 فقط. Subset: عربي + لاتيني أساسي + أرقام + علامات. ≈ 3 × 22KB.
- Cairo: 700 فقط للعناوين. ≈ 25KB.
- `font-display: swap` + `<link rel=preload>` للوزن 400.
- Self-hosted (لا Google Fonts — خصوصية + سرعة في اليمن حيث Google قد يكون بطيئاً).

### 2.3 الصور
- الشعار: WebP + PNG fallback، حجمان (64px للشريط، 512px للطباعة/splash).
- صور المنتجات (اختيارية): Cloudflare Images بتحجيم تلقائي، lazy, `aspect-ratio` محجوز (CLS = 0).
- الأيقونات: Lucide SVG inline (tree-shaken).

### 2.4 البيانات
- `GET /catalog` مرة واحدة + ETag. 200 صنف ≈ 40KB JSON ≈ 8KB gzip.
- القوائم الطويلة: virtualization (`@tanstack/virtual`) عند > 50 عنصراً.
- Demand matrix يُحسب على الخادم (View) لا في المتصفح.
- Prefetch: عند فتح الرئيسية، نُحمّل مسبقاً `orders/current` و`windows`.

### 2.5 التصيير
- Skeletons لكل شاشة تطابق التخطيط النهائي (CLS 0).
- `React.memo` على صفوف الجداول. `useDeferredValue` للبحث.
- الحركات بـ `transform`/`opacity` فقط (GPU). لا `height` animations.
- `content-visibility: auto` على الأقسام الطويلة في الطباعة.

### 2.6 الخادم (Workers)
- D1 استعلامات مُفهرسة (كل WHERE له index — راجع المخطط).
- `batch()` لتنفيذ عدة استعلامات في رحلة واحدة.
- Workers KV للجلسات (قراءة < 5ms).
- لا N+1: الـ demand matrix استعلام واحد + تجميع في الذاكرة.
- استجابات مضغوطة (Cloudflare تلقائياً).

## 3. القياس

### CI (كل PR)
```yaml
- Lighthouse CI: mobile preset, 3 runs, assert budgets (lighthouserc.json)
- Bundle size check: size-limit → يفشل إن تجاوز
- Playwright perf: يقيس "فتح شاشة الطلب → إرسال" على Chromium throttled
```

### الإنتاج (RUM)
- `web-vitals` library → `POST /api/v1/rum` (sampled 10%) → Workers Analytics Engine.
- لوحة: LCP/INP/CLS p75 حسب الجهاز/الشبكة/الشاشة.
- تنبيه إن تجاوز p75 الحد الأحمر لـ 3 أيام.

## 4. الأداء المُدرَك (Perceived)

| التقنية | أين |
|---|---|
| Skeleton فوري (0ms) | كل شاشة |
| Optimistic update | إرسال، تسليم، سند سريع |
| Haptic feedback (`navigator.vibrate(10)`) | نجاح الإرسال، الترحيل |
| Prefetch on hover/touchstart | روابط التبويبات |
| Stale-while-revalidate | كل القوائم: اعرض القديم فوراً، حدّث بصمت |
| تحديث SW بدون مقاطعة | شريط "إصدار جديد" يظهر عند الخمول فقط |
| تقدّم واضح للعمليات > 1s | شريط تقدم حقيقي (لا دوّار) للتصدير والـ PDF |
