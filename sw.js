self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('zero-weather-cache-v10').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/script.js',
        '/style.css',
        '/settings.html',
        '/settings.js',
        '/manifest.json',
        '/icon.png'
      ]);
    })
  );
  console.log('Service Worker geïnstalleerd');
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = ['zero-weather-cache-v10'];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  console.log('Service Worker geactiveerd');
});
