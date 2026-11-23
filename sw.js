// كاش خفيف للموقع: الشبكة أولاً (التحديثات توصل فوراً) والكاش وقت انقطاع النت
const CACHE = 'shamrani-site-v10';
const SHELL = ['./', './index.html', './assets/css/site.css?v=3', './assets/js/site.js?v=3', './assets/js/data.js', './assets/js/data-en.js', './assets/js/i18n.js', './assets/js/bot.js', './config.js', './manifest.json', './assets/img/mark.png', './assets/img/icon-192.png', './assets/video/hero-poster.jpg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x.startsWith('shamrani-site-') && x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;               // Firebase والخطوط تمر مباشرة
  if (url.pathname.includes('/basma/')) return;               // البصمة لها Service Worker خاص
  if (req.headers.get('range') || url.pathname.endsWith('.mp4')) return; // الفيديو يتبث مباشرة
  e.respondWith(fetch(req, { cache: 'no-cache' }).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined))));
});
