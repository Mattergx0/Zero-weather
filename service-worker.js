// service-worker.js
self.addEventListener('install', (e) => {
    e.waitUntil(caches.open('zeroweather').then((cache) => 
        cache.addAll(['/', '/index.html', '/icon.png'])
    ));
});
