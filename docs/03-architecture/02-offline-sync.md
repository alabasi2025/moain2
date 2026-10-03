# العمل بدون اتصال والمزامنة (Offline-first)

> الهدف: الفرع يُكمل طلبيته ويضغط "إرسال" حتى لو كان الإنترنت مقطوعاً، ويطمئن أنها ستصل. أمين المخزن يسجّل حركة في المخزن البعيد عن الواي فاي.

## 1. ما يعمل بدون اتصال وما لا يعمل

| الوظيفة | Offline | الآلية |
|---|---|---|
| فتح التطبيق | ✅ | App shell مُخزَّن بالـ Service Worker |
| تصفح الكتالوج (تصنيفات/أصناف) | ✅ | Dexie `catalog` — يُحدَّث عند كل اتصال عبر ETag |
| كتابة/تعديل مسودة طلبية | ✅ | Dexie `drafts` — حفظ تلقائي كل تغيير |
| إرسال طلبية | ✅ (مؤجَّل) | Outbox → يُرسل عند الاتصال |
| عرض طلبيات آخر 7 أيام | ✅ | TanStack persist في Dexie |
| تسجيل سند مخزني سريع | ✅ (مؤجَّل) | Outbox |
| عرض آخر أرصدة معروفة | ✅ (مع تحذير "آخر تحديث منذ X") | TanStack persist |
| شاشة المعمل الحية (demand matrix) | ⚠️ آخر نسخة فقط | لا SSE بدون نت؛ شارة "غير متصل" |
| الطباعة | ✅ من آخر snapshot محلي | HTML محلي |
| الموافقة على استثناء / قفل / ترحيل سند | ❌ | تحتاج حالة خادم موثوقة — الزر معطّل مع توضيح |
| تقارير فترية | ❌ | تحتاج الخادم |

**المبدأ:** كل ما هو "إدخال من طرف واحد" يعمل offline. كل ما هو "قرار يعتمد على حالة مشتركة" يحتاج اتصالاً.

## 2. التخزين المحلي (Dexie schema)

```ts
// lib/db/local-db.ts
class LocalDB extends Dexie {
  catalog!: Table<CatalogSnapshot, 'singleton'>;   // {etag, categories[], products[], uoms[], fetchedAt}
  drafts!: Table<OrderDraft, string>;              // key: `${branchId}:${windowId}:${deliveryDate}`
  outbox!: Table<OutboxItem, string>;              // key: client_uuid
  meta!: Table<{key: string; value: unknown}, string>;
  // TanStack persister يستخدم جدولاً خاصاً به
}

interface OutboxItem {
  client_uuid: string;          // PK + idempotency key
  op: 'order.submit' | 'order.cancel' | 'voucher.quick' | 'delivery.create' | 'exception.request';
  payload: unknown;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CONFLICT';
  attempts: number;
  nextRetryAt: number;          // epoch ms
  lastError?: { code: string; message_ar: string };
  createdAt: number;
  completedAt?: number;
  seq: number;                  // ترتيب FIFO صارم
}
```

**حدود الحجم (قيد iOS 50MB):** كتالوج (≤ 500KB) + مسودات (≤ 100KB) + outbox (≤ 1MB) + كاش استعلامات (≤ 5MB، TTL 7 أيام). الإجمالي < 10MB. التوقيعات PNG تُضغط ≤ 50KB ولا تبقى بعد `COMPLETED`.

## 3. نمط Outbox — التنفيذ

```ts
// lib/sync/sync-worker.ts
class SyncWorker {
  private draining = false;

  constructor(private db: LocalDB, private api: ApiClient, private bus: EventBus) {
    window.addEventListener('online', () => this.drain());
    document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && this.drain());
    setInterval(() => this.drain(), 30_000);   // أمان
  }

  async enqueue(op: OutboxItem['op'], payload: unknown, client_uuid = ulid()) {
    const seq = (await this.db.meta.get('outbox_seq'))?.value as number ?? 0;
    await this.db.transaction('rw', this.db.outbox, this.db.meta, async () => {
      await this.db.outbox.add({ client_uuid, op, payload, status: 'PENDING', attempts: 0, nextRetryAt: 0, createdAt: Date.now(), seq: seq + 1 });
      await this.db.meta.put({ key: 'outbox_seq', value: seq + 1 });
    });
    this.bus.emit('outbox:changed');
    void this.drain();
    return client_uuid;
  }

  async drain() {
    if (this.draining || !navigator.onLine) return;
    this.draining = true;
    try {
      // Web Locks يمنع تبويبين من المزامنة معاً
      await navigator.locks.request('moain-sync', async () => {
        const items = await this.db.outbox.where('status').anyOf('PENDING', 'FAILED')
          .and(i => i.nextRetryAt <= Date.now()).sortBy('seq');
        for (const item of items) {
          await this.process(item);
          // FIFO صارم: إن فشل عنصر بسبب شبكة نتوقف (لا نتخطاه) — الترتيب مهم (مسودة ثم إرسال)
          const fresh = await this.db.outbox.get(item.client_uuid);
          if (fresh?.status === 'FAILED') break;
        }
      });
    } finally {
      this.draining = false;
      this.bus.emit('outbox:changed');
    }
  }

  private async process(item: OutboxItem) {
    await this.db.outbox.update(item.client_uuid, { status: 'IN_PROGRESS' });
    try {
      await this.api.execute(item.op, item.payload, item.client_uuid);
      await this.db.outbox.update(item.client_uuid, { status: 'COMPLETED', completedAt: Date.now() });
      this.bus.emit('outbox:completed', item);
    } catch (e) {
      if (isNetworkError(e)) {
        const attempts = item.attempts + 1;
        const backoff = Math.min(10_000 * 2 ** attempts, 10 * 60_000);  // 20s → 10min
        await this.db.outbox.update(item.client_uuid, { status: 'FAILED', attempts, nextRetryAt: Date.now() + backoff, lastError: netErr });
      } else {
        // 4xx = قرار الخادم نهائي. لا إعادة محاولة. المستخدم يقرر.
        await this.db.outbox.update(item.client_uuid, { status: 'CONFLICT', lastError: apiErr(e) });
        this.bus.emit('outbox:conflict', item);
      }
    }
  }
}
```

### قرارات مهمة
- **FIFO صارم** مع توقف عند فشل شبكة: لأن `order.submit` قد يعتمد على ترتيب. (البديل — تخطي — يُستخدم فقط إن لم تكن هناك اعتماديات، ونحن لا نضمن ذلك.)
- **4xx لا يُعاد**: النافذة أُغلقت = قرار نهائي. نعرض للمستخدم "تعذّر الإرسال: النافذة مغلقة" مع زر "طلب استثناء" الذي يُنشئ عنصر outbox جديداً.
- **Web Locks API** يمنع المزامنة المزدوجة من تبويبين.
- **`setInterval` 30s** كشبكة أمان لأن `online` event غير موثوق على بعض أجهزة Android.
- **لا Background Sync API**: غير مدعوم على iOS. نعتمد على الفتح/العودة للتطبيق — وهذا يناسب سيناريو "مرة باليوم".

## 4. التحديث المتفائل (Optimistic UI)

| العملية | ما يراه المستخدم فوراً | عند النجاح | عند CONFLICT |
|---|---|---|---|
| إرسال طلبية | بطاقة الطلبية بحالة `pending_sync` (رمادي + أيقونة سحابة) | تتحول لـ `submitted` (أخضر) + toast | تتحول لـ `failed` (أحمر) + شرح + إجراء |
| سند سريع | يظهر في القائمة بشارة "بانتظار" | شارة تختفي، الرصيد يتحدث | يظهر خطأ الرصيد، السند يبقى مسودة محلية للتعديل |
| تسليم | الطلبية تظهر `delivered` محلياً | تأكيد | نادر (الطلبية أُلغيت مثلاً) → تنبيه |

**قاعدة:** الحالة المحلية `pending_sync` **ليست** حالة في آلة الحالة الرسمية — هي طبقة عرض فقط فوق الحالة الحقيقية الأخيرة المعروفة.

## 5. تعارض البيانات (Conflicts) — لماذا هو نادر عندنا

تصميم النطاق يجعل التعارض الحقيقي شبه مستحيل:
- **الطلبية** يملكها فرع واحد. لا يعدّلها اثنان. التعارض الوحيد = الوقت (cutoff) → قرار الخادم.
- **السند** يُنشئه شخص واحد ويُرحَّل مرة. التعارض الوحيد = الرصيد → قرار الخادم.
- **التسليم** حدث لا يُعدَّل.
- **الدفتر** append-only — لا يوجد "آخر كاتب يفوز"؛ كل حركة تُضاف.

لذلك **لا نحتاج CRDT ولا LWW**. الخادم هو الحكم، والعميل يعرض القرار بوضوح.

**الحالة الوحيدة الحساسة:** نفس المستخدم على جهازين يعدّل نفس المسودة. الحل: المسودة محلية لكل جهاز؛ عند `submit` من جهاز، الجهاز الآخر يستقبل الطلبية المُرسَلة عند التحديث ويعرض "أُرسلت من جهاز آخر — تعديلاتك المحلية: [دمج/تجاهل]".

## 6. مزامنة القراءة (Server → Client)

| البيانات | الاستراتيجية |
|---|---|
| الكتالوج | `GET /catalog` مع `If-None-Match` عند كل فتح + كل ساعة. 304 = لا تحميل |
| إعدادات/هوية | مع `/auth/me` عند الفتح |
| طلبيات الفرع | TanStack `staleTime: 60s`, persist 7 أيام, refetch on focus |
| شاشة المعمل أثناء `open` | **SSE** `/production-orders/:id/stream` → `invalidateQueries`. عند قطع SSE → polling 15s |
| الأرصدة | `staleTime: 30s`, refetch on focus. شارة "آخر تحديث منذ X" إن > 5 دقائق |
| الإشعارات | Web Push عند التثبيت؛ وإلا polling 60s عند الفتح |

## 7. Service Worker — الاستراتيجيات

```ts
// vite-plugin-pwa / workbox
precacheAndRoute(self.__WB_MANIFEST);            // app shell, JS, CSS, fonts (subset), icons

registerRoute(({url}) => url.pathname.startsWith('/api/'),
  new NetworkOnly());                              // API: لا كاش في SW — TanStack + Dexie يتكفلان

registerRoute(({request}) => request.destination === 'image' && url.pathname.startsWith('/branding/'),
  new StaleWhileRevalidate({ cacheName: 'branding', plugins: [new ExpirationPlugin({ maxEntries: 10 })] }));

registerRoute(({request}) => request.destination === 'font',
  new CacheFirst({ cacheName: 'fonts', plugins: [new ExpirationPlugin({ maxAgeSeconds: 365*24*3600 })] }));

// تحديث: skipWaiting + clientsClaim + UI "إصدار جديد — تحديث" (لا تحديث قسري أثناء كتابة مسودة)
```

**قيد iOS 7 أيام:** عند كل فتح، `ensureCriticalAssetsCached()` يُعيد تحميل app shell في الكاش. و`navigator.storage.persist()` يُطلب (يعمل على Android، يُتجاهل بأمان على iOS).

## 8. مؤشرات الحالة للمستخدم (إلزامية)

| المؤشر | المكان | الشكل |
|---|---|---|
| غير متصل | شريط رفيع أعلى الشاشة (تحت safe-area) | رمادي داكن: "غير متصل — ستُرسل التغييرات تلقائياً" |
| عناصر بانتظار المزامنة | شارة على أيقونة التبويب + أعلى الشاشة | "2 بانتظار المزامنة" + دوران خفيف أثناء الإرسال |
| تم التحديث | لحظي | ✓ أخضر صغير يتلاشى خلال 2s |
| تعارض | بطاقة العنصر + إشعار داخلي | أحمر: السبب بالعربية + زر الإجراء |
| آخر تحديث للبيانات | أسفل القوائم الحساسة (أرصدة) | "آخر تحديث: قبل 3 دقائق" |

## 9. اختبارات المزامنة (إلزامية قبل M1)

1. إرسال طلبية مع الشبكة مقطوعة → ظهور `pending_sync` → وصل الشبكة → `submitted` خلال 5s.
2. إرسال طلبيتين offline بالترتيب → تصلان بنفس الترتيب.
3. إرسال، قطع الشبكة **بعد** وصول الطلب للخادم وقبل الاستجابة → إعادة الإرسال → **لا تكرار** (client_uuid).
4. إرسال offline، مرّ cutoff، وصل الشبكة → `CONFLICT` 423 → UI يعرض "طلب استثناء".
5. تبويبان مفتوحان → مزامنة واحدة فقط (Web Locks).
6. إغلاق التطبيق أثناء `IN_PROGRESS` → عند الفتح يُعاد لـ `PENDING` ويُرسل (idempotent).
7. iOS: بعد 8 أيام بدون فتح → التطبيق يفتح (قد يُحمّل shell من الشبكة) والمسودات في IndexedDB سليمة.
