/* عامل الخدمة: الشبكة أولًا دائمًا (لتصل التحديثات فورًا)، والنسخة المحفوظة عند انقطاع الإنترنت فقط */
const CACHE = 'mz-v2', ASSETS = 'mz-assets';
const CORE = ['/', '/projects/', '/manifest.webmanifest', '/icon-192.png', '/og.jpg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== ASSETS).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return; // لا نتدخل في طلبات الجدول أو المواقع الأخرى
  // الخطوط والصور في /assets/ أسماؤها تتغير مع كل تعديل، فتُحفظ مرة وتُقرأ من الجهاز بعدها فورًا
  if (u.pathname.startsWith('/assets/')) { e.respondWith(caches.open(ASSETS).then(c => c.match(r).then(m => m || fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; })))); return; }
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; })
    .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || (r.mode === 'navigate' ? caches.match(u.pathname.startsWith('/projects') ? '/projects/' : '/') : undefined))));
});
