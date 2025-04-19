const CACHE_NAME = 'zero-weather-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/icon.png',
  '/manifest.json',
  // Voeg hier alle andere resources toe die je wilt cachen
];

// Installeren van de service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache geopend');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Fout bij het cachen van bestanden:', error);
      })
  );
});

// Het ophalen van gegevens uit de cache wanneer offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request).catch(() => {
          // Als fetch faalt en we zijn offline, geef een fallback bestand terug
          return caches.match('/offline.html');
        });
      })
  );
});

// Verwijderen van oude caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Pushmelding ontvangen
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge-icon.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Klikken op een pushmelding
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://jouwapp.url') // Vervang dit door je werkelijke URL
  );
});
