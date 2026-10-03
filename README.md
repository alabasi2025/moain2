# مُعين (Moain) — نظام إدارة الإنتاج والمخزون لمعامل المخابز

> **الحالة:** الدراسة المعمارية مكتملة — جاهزة لبدء M0
> **التحقق:** مخطط SQL مُنفَّذ ومُختبَر على SQLite (39 جدول، 6 views، 10 triggers، سيناريو المتوسط المتحرك والـ immutability نجحا) · نماذج الطباعة مُصيَّرة إلى PDF فعلياً
> **النوع:** تطبيق ويب تقدّمي (PWA) بمعايير التطبيقات الأصلية — Mobile-first، عربي RTL
> **النطاق:** طلبيات الفروع اليومية → خطة إنتاج المعمل → توزيع وتسليم → مخزون المواد الخام بدفتر حركات غير قابل للتعديل

---

## لماذا هذه الوثائق؟

العميل طلب "شيت إكسل". ما يصفه فعلياً هو **نظام تشغيلي متعدد المستخدمين** بثلاث طبقات مترابطة:

| الطبقة | ما طلبه العميل حرفياً | ما يعنيه فعلياً |
|---|---|---|
| **الطلب** | "كل فرع يدخل القائمة ويضغط صح ويعدل العدد" | إدخال متزامن من عدة مواقع بصلاحيات منفصلة |
| **الإنتاج** | "أطبعها وأوزعها على المشرفين مع اسم المسؤول والوقت والتوقيع" | أمر إنتاج يومي بحالات (جديد → قيد التنفيذ → جاهز → مُسلَّم) ونموذج طباعة رسمي |
| **المخزون** | "قالبين إكسل مربوطين: بطاقة المادة + سجل الحركة" | دفتر أستاذ مخزني (Stock Ledger) مع تكلفة متوسطة متحركة وحد أمان |

هذه الدراسة تُثبت المعمارية **قبل** كتابة سطر كود واحد، بحيث يكون النظام مرناً بما يكفي ليعمل مع أي عدد فروع، أي عدد أصناف، أي عدد معامل، وأي طريقة تشغيل — بدون الحاجة لسؤال العميل مسبقاً.

---

## فهرس الوثائق

### 00 — نقطة البداية
- [`docs/00-client-requests.md`](docs/00-client-requests.md) — **طلبات العميل وصاحب المشروع بنصها الحرفي** + المبادئ الثمانية الحاكمة
- [`AGENT_PROMPT.md`](AGENT_PROMPT.md) — **برومبت جاهز لوكيل/مطور جديد** يقرأ الدراسة ويبني النظام
- [`docs/07-implementation/`](docs/07-implementation/) — يُملأ من الوكيل المنفّذ (فهمه، خطته، تقدمه)

### 01 — التحليل
- [`docs/01-analysis/00-executive-summary.md`](docs/01-analysis/00-executive-summary.md) — الملخص التنفيذي والقرارات الكبرى
- [`docs/01-analysis/01-requirements-analysis.md`](docs/01-analysis/01-requirements-analysis.md) — تفكيك طلب العميل سطراً بسطر + المتطلبات الضمنية
- [`docs/01-analysis/02-research-findings.md`](docs/01-analysis/02-research-findings.md) — نتائج البحث: أنظمة مشابهة، أنماط معمارية، معايير UX، قيود المنصات
- [`docs/01-analysis/03-flexibility-matrix.md`](docs/01-analysis/03-flexibility-matrix.md) — كيف يتكيّف النظام مع كل سيناريو محتمل بدون إعادة برمجة

### 02 — نموذج النطاق (Domain)
- [`docs/02-domain/00-ubiquitous-language.md`](docs/02-domain/00-ubiquitous-language.md) — القاموس الموحد (عربي/إنجليزي/كود)
- [`docs/02-domain/01-bounded-contexts.md`](docs/02-domain/01-bounded-contexts.md) — السياقات المحدودة وحدودها
- [`docs/02-domain/02-erd.md`](docs/02-domain/02-erd.md) — مخطط الكيانات والعلاقات
- [`docs/02-domain/03-state-machines.md`](docs/02-domain/03-state-machines.md) — آلات الحالة للطلبية وأمر الإنتاج والجرد
- [`docs/02-domain/04-schema.sql`](docs/02-domain/04-schema.sql) — مخطط قاعدة البيانات الكامل (SQLite/D1 متوافق مع Postgres)
- [`docs/02-domain/05-business-rules.md`](docs/02-domain/05-business-rules.md) — قواعد العمل والثوابت (Invariants)

### 03 — المعمارية التقنية
- [`docs/03-architecture/00-system-architecture.md`](docs/03-architecture/00-system-architecture.md) — المعمارية العامة والمكدس التقني
- [`docs/03-architecture/01-api-contract.md`](docs/03-architecture/01-api-contract.md) — عقد الـ API
- [`docs/03-architecture/02-offline-sync.md`](docs/03-architecture/02-offline-sync.md) — استراتيجية العمل بدون اتصال والمزامنة
- [`docs/03-architecture/03-security-rbac.md`](docs/03-architecture/03-security-rbac.md) — الأمان والصلاحيات والتدقيق
- [`docs/03-architecture/04-print-export.md`](docs/03-architecture/04-print-export.md) — محرك الطباعة (PDF) والتصدير (Excel)
- [`docs/03-architecture/05-performance-budget.md`](docs/03-architecture/05-performance-budget.md) — ميزانية الأداء والقياس
- [`docs/adr/`](docs/adr/) — سجلات القرارات المعمارية (ADRs)

### 04 — التصميم
- [`docs/04-design/00-design-system.md`](docs/04-design/00-design-system.md) — نظام التصميم: الرموز (Tokens)، الألوان، الخطوط، الحركة
- [`docs/04-design/01-mobile-app-standards.md`](docs/04-design/01-mobile-app-standards.md) — معايير "يبدو كتطبيق حقيقي" المُلزِمة
- [`docs/04-design/02-screen-map.md`](docs/04-design/02-screen-map.md) — خريطة الشاشات وتدفقات المستخدم
- [`docs/04-design/03-wireframes.md`](docs/04-design/03-wireframes.md) — الهياكل الشبكية للشاشات الرئيسية
- [`docs/04-design/04-branding-whitelabel.md`](docs/04-design/04-branding-whitelabel.md) — الشعار والهوية القابلة للتخصيص

### 05 — نماذج الطباعة (HTML حقيقية، مُصيَّرة ومُختبَرة)
- [`docs/05-print-templates/`](docs/05-print-templates/) — افتح `index.html` ثم Ctrl+P. عينات PDF مرفقة (`sample-T*.pdf`).

| T1 — أمر إنتاج مجمّع (A4) | T3 — ورقة تجهيز لكل فرع (A5) |
|---|---|
| ![T1](docs/05-print-templates/preview-t1.png) | ![T3](docs/05-print-templates/preview-t3.png) |

| T5 — سند توريد (A5) | T7 — تقرير حالة المخزون — الأعمدة الـ 11 (A4 أفقي) |
|---|---|
| ![T5](docs/05-print-templates/preview-t5.png) | ![T7](docs/05-print-templates/preview-t7.png) |

### 06 — خارطة الطريق
- [`docs/06-roadmap/00-phases.md`](docs/06-roadmap/00-phases.md) — المراحل والتسليمات ومعايير القبول

---

## القرارات الكبرى في سطر واحد

1. **PWA وليس تطبيق أصلي** — جهاز واحد لكل مستخدم، لا متاجر، تحديث فوري، طباعة سهلة من الكمبيوتر.
2. **الدفتر هو مصدر الحقيقة** — لا يوجد عمود "الكمية" يُكتب فيه؛ الرصيد مشتق من مجموع الحركات غير القابلة للتعديل.
3. **كل شيء قابل للتهيئة من الواجهة** — الفروع، المعامل، التصنيفات، الأصناف، الوحدات، أوقات الإغلاق، الأدوار، الشعار.
4. **Offline-first بنمط Outbox** — الفرع يرسل طلبيته حتى لو انقطع النت، وتُزامَن عند العودة.
5. **التصدير إلى Excel من أي جدول** — نعطي العميل ما طلبه حرفياً كميزة ثانوية وليس كأساس.
6. **معايير تطبيق حقيقي مُلزِمة** — شريط تنقل سفلي، أهداف لمس 48dp، حركة 150–300ms، مناطق آمنة، هياكل تحميل بدل الدوّارات.

---

## المكدس التقني المختار (ملخص)

| الطبقة | الاختيار | البديل المدروس |
|---|---|---|
| الواجهة | React 19 + TypeScript + Vite + Tailwind 4 | SvelteKit (أخف، لكن نظام بيئي أصغر للمكونات العربية) |
| الحالة/البيانات | TanStack Query + Zustand + Dexie (IndexedDB) | — |
| الخادم | Hono على Cloudflare Workers | Fastify على Node (إن احتجنا Puppeteer داخلياً) |
| قاعدة البيانات | Cloudflare D1 (SQLite) مع مخطط متوافق Postgres | Supabase Postgres (الهجرة ممكنة بدون تغيير الكود المنطقي) |
| ORM | Drizzle | — |
| المصادقة | Lucia-style sessions + PIN للفروع | Clerk/Auth0 (تكلفة) |
| PDF | HTML→PDF عبر Browser Rendering API | Puppeteer على خادم مستقل |
| Excel | ExcelJS (يدعم `rightToLeft` وتنسيق كامل) | SheetJS CE (لا يدعم التنسيق) |
| الخطوط | IBM Plex Sans Arabic (واجهة) + Cairo (طباعة/عناوين) | Tajawal, Noto Kufi |

> التفاصيل والتبريرات في [`docs/adr/`](docs/adr/).

---

## Local run (M0)

```bash
pnpm install
pnpm --filter @moain/web build          # builds the web app into packages/web/dist
cd packages/server && ./scripts-restart.sh   # resets local D1 + migrations + wrangler dev on 8787 + seed
node scripts/demo-data.mjs               # sample data: opening balance + receipt + issue + two branch orders
```
Open `http://localhost:8787`. Demo accounts (password `123456`):
owner@alnoor.ye (owner) · sitteen@alnoor.ye / hadda@alnoor.ye (branches) · plant@alnoor.ye (plant manager) · staff@alnoor.ye (plant staff) · store@alnoor.ye (storekeeper).

Tests: `pnpm --filter @moain/shared test` · `node packages/server/test/e2e-api.mjs` · `packages/server/test/db-invariants.sh` · `node packages/server/test/isolation.mjs`
