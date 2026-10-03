// App-shell cache: network-first for HTML, cache-first for hashed assets. API never cached.
const C = 'moain-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(C).then((c) => c.addAll(['/', '/icon.svg']))); });
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  if (u.pathname.startsWith('/assets/')) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((res) => { const cp = res.clone(); caches.open(C).then((c) => c.put(e.request, cp)); return res; })));
  } else if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then((res) => { const cp = res.clone(); caches.open(C).then((c) => c.put('/', cp)); return res; }).catch(() => caches.match('/')));
  }
});
