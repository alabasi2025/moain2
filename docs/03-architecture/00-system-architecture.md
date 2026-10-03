# المعمارية التقنية

## 1. نظرة عامة

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (PWA)                                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐  │
│  │ Branch App │  │ Plant App  │  │ Store App  │  │ Admin / Reports        │  │
│  │ (phone)    │  │ (tablet/PC)│  │ (phone/PC) │  │ (PC)                   │  │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └──────────┬─────────────┘  │
│        └───────────────┴───────┬───────┴─────────────────────┘                │
│                    ┌───────────▼────────────┐                                 │
│                    │  App Shell (React 19)  │  Router · Auth · i18n · Theme   │
│                    ├────────────────────────┤                                 │
│                    │  TanStack Query (server state, cache, retry)             │
│                    │  Zustand (UI state)                                      │
│                    ├────────────────────────┤                                 │
│                    │  Dexie / IndexedDB     │  catalog · drafts · outbox      │
│                    ├────────────────────────┤                                 │
│                    │  Service Worker        │  app-shell cache · re-cache     │
│                    └───────────┬────────────┘                                 │
└────────────────────────────────┼─────────────────────────────────────────────┘
                                 │ HTTPS / JSON · SSE
┌────────────────────────────────▼─────────────────────────────────────────────┐
│                      EDGE (Cloudflare Workers)                               │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │  Hono Router                                                         │    │
│  │   middleware: requestId · auth(session|pin) · tenant · rbac · audit  │    │
│  ├──────────────────────────────────────────────────────────────────────┤    │
│  │  platform/ catalog/ ordering/ production/ fulfillment/               │    │
│  │  inventory/ reporting/                 (bounded contexts)            │    │
│  │   each: api → application (use cases) → domain → infrastructure      │    │
│  ├──────────────────────────────────────────────────────────────────────┤    │
│  │  Drizzle ORM (tenant-scoped repository base)                         │    │
│  └───────┬──────────────┬──────────────┬──────────────┬──────────────────┘    │
│  ┌───────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐ ┌─────▼───────────────┐      │
│  │ D1 (SQLite)  │ │ KV        │ │ R2          │ │ Cron Triggers       │      │
│  │ primary data │ │ sessions  │ │ logos, sigs │ │ cutoff-lock, push,  │      │
│  │              │ │ rate-limit│ │ exports,PDF │ │ balance-reconcile   │      │
│  └──────────────┘ └───────────┘ └─────────────┘ └─────────────────────┘      │
│  ┌──────────────────────────┐   ┌──────────────────────────────┐             │
│  │ Browser Rendering API    │   │ Web Push (VAPID)             │             │
│  │ HTML → PDF (server-side) │   │ notifications to devices     │             │
│  └──────────────────────────┘   └──────────────────────────────┘             │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 2. المكدس التقني والتبرير

| الطبقة | الاختيار | لماذا | ADR |
|---|---|---|---|
| **اللغة** | TypeScript (strict) | نوع واحد للـ Domain يُشارك بين العميل والخادم | — |
| **الواجهة** | React 19 + Vite | أكبر نظام بيئي، Vite للسرعة | 0001 |
| **التنسيق** | Tailwind CSS 4 + CSS Variables للـ tokens | RTL مدمج، logical properties، حجم صغير | 0004 |
| **المكونات** | Radix Primitives (headless) + مكوناتنا | وصولية جاهزة، بدون شكل مفروض — نبني الفخامة فوقها | 0004 |
| **حالة الخادم** | TanStack Query v5 | كاش، إعادة محاولة، optimistic، offline persistence | — |
| **حالة الواجهة** | Zustand | خفيف | — |
| **التخزين المحلي** | Dexie (IndexedDB) | كتالوج محلي، مسودات، outbox | 0005 |
| **Service Worker** | Workbox عبر vite-plugin-pwa | precache، runtime caching، تحديث تلقائي | 0005 |
| **الخادم** | Hono على Cloudflare Workers | أخف إطار، Edge + Node، TypeScript أصلي | 0002 |
| **قاعدة البيانات** | Cloudflare D1 (SQLite) | تكلفة شبه صفر، Edge، Time Travel 30 يوم | 0003 |
| **ORM** | Drizzle | نوع آمن، SQLite وPostgres بنفس الكود، migrations | 0003 |
| **المصادقة** | Sessions في KV + HttpOnly cookies + PIN للأجهزة الموثوقة | بسيط، آمن، بلا تكلفة طرف ثالث | 0006 |
| **التحقق** | Zod (schemas مشتركة) | نفس schema للـ API والنماذج | — |
| **PDF** | HTML/CSS → `window.print()` (M1) → Browser Rendering (M2) | الجودة العربية الوحيدة المضمونة | 0007 |
| **Excel** | ExcelJS | RTL + تنسيق + صور + صيغ | 0007 |
| **الخطوط** | IBM Plex Sans Arabic + Cairo (self-hosted, subset) | جودة + تحكم بالتحميل | 0004 |
| **الأيقونات** | Lucide | متسقة، خفيفة، RTL-aware | 0004 |
| **الاختبارات** | Vitest + Testing Library + Playwright | وحدة + مكونات + E2E موبايل | — |
| **CI/CD** | GitHub Actions → Wrangler | — | — |

## 3. مبادئ المعمارية

### 3.1 Domain-first
كل سياق مجلد مستقل بطبقات: `domain/` (نقي) → `application/` (use cases) → `infrastructure/` (repos) → `api/` (routes). قواعد العمل في `domain/` فقط.

### 3.2 Shared Kernel
```
packages/
├── shared/   # types, zod schemas, state machines, Money/Qty, i18n keys
├── server/   # Hono (Workers)
└── web/      # React PWA
```
نفس `transition()` و`Money` تُستخدم في الجهتين — الواجهة تعرف مسبقاً إن كان الانتقال مسموحاً.

### 3.3 Tenant-scoped by construction
```ts
abstract class TenantRepo<T> {
  constructor(protected db: DrizzleD1, protected tenantId: string) {}
  protected scope<Q>(q: Q) { return q.where(eq(table.tenant_id, this.tenantId)); }
}
```
لا repo بدون `tenantId`. اختبار يفشل إن وُجد استعلام بدون `tenant_id`.

### 3.4 Idempotency everywhere
كل `POST` يُنشئ كياناً يحمل `client_uuid`. `INSERT ... ON CONFLICT DO NOTHING; SELECT`. إعادة الإرسال = نفس النتيجة.

### 3.5 Events داخلية (الآن)
الأحداث تُنفَّذ داخل نفس المعاملة كاستدعاءات مباشرة. إن احتجنا async → Cloudflare Queues بنفس الواجهة.

## 4. تدفق طلب نموذجي

### "الفرع يرسل طلبية" (online)
```
1. UI: "إرسال" → Zustand status='sending'; Dexie outbox.add({op:'order.submit', payload, client_uuid})
2. POST /api/orders/submit
3. Middleware: requestId → auth → tenant → rbac(branch_user@location) → audit
4. SubmitOrder.execute():
   a. zod validate
   b. load window; assert now(tz) < cutoff               → else 423
   c. transition(order.status, 'submit')                 → else 409
   d. BEGIN
      upsert order (ON CONFLICT client_uuid) ; replace lines ; revision++ ; snapshot
      ensure production_order(open) exists ; link
      emit OrderSubmitted → notifications + push queue
      audit_log
      COMMIT
5. 200 → outbox.markDone ; invalidate queries ; toast + haptic
```

### (offline)
```
fetch fails → outbox stays PENDING → badge "1 بانتظار المزامنة"
'online' | visibilitychange → SyncWorker.drain() FIFO → same client_uuid → 200 COMPLETED
423 → CONFLICT → "تعذّر: النافذة أُغلقت" + زر "طلب استثناء"
```

### "Cron يقفل النافذة" (كل دقيقة)
```
for tenant: now_local = now in tz
  for window where cutoff_time <= now_local AND kind='regular':
    po = production_orders(plant, window, today+offset, status='open')
    if po: LockProductionOrder(po, actor=SYSTEM) → orders locked → snapshot v1 → notify plant_manager
```

## 5. البنية الملفية

```
moain/
├── packages/
│   ├── shared/src/{domain,schemas,i18n,constants}
│   ├── server/src/{index.ts,middleware,platform,catalog,ordering,production,fulfillment,inventory,reporting,jobs,db}
│   └── web/src/{app,features,components/{ui,patterns},lib/{api,db,sync,pwa},styles,locales}
├── docs/
└── .github/workflows/
```

## 6. البيئات

| البيئة | D1 | URL |
|---|---|---|
| local | miniflare sqlite | localhost:5173 |
| preview (كل PR) | D1 preview | `<pr>.moain.pages.dev` |
| staging | D1 staging | staging.moain.app |
| production | D1 prod + Time Travel | app.moain.app / نطاق العميل |

## 7. خطة التوسع

| العتبة | الإجراء |
|---|---|
| D1 > 5GB أو > 50 مستأجر | D1 per tenant أو Postgres (Drizzle يُسهّلها) |
| Realtime حقيقي | Durable Objects WebSocket per production_order |
| تقارير ثقيلة | نسخ ليلي لـ Postgres للتقارير |
| PDF > 1000/يوم | خدمة Puppeteer مستقلة |
