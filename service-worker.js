const CACHE_NAME = 'zeroweather-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/icon.png',
  'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request)
      .then(response => response || fetch(e.request))
});
