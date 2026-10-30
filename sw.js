/* عامل الخدمة: الشبكة أولًا دائمًا (لتصل التحديثات فورًا)، والنسخة المحفوظة عند انقطاع الإنترنت فقط */
const CACHE = 'mz-v1';
const CORE = ['/', '/projects/', '/manifest.webmanifest', '/icon-192.png', '/og.jpg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return; // لا نتدخل في طلبات الجدول أو المواقع الأخرى
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; })
    .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || (r.mode === 'navigate' ? caches.match(u.pathname.startsWith('/projects') ? '/projects/' : '/') : undefined))));
});
