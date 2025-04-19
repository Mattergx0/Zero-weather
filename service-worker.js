self.addEventListener('push', function(event) {
  let options = {
    body: event.data.text(),
    icon: 'icon.png',
    badge: 'icon.png'
  };

  event.waitUntil(
    self.registration.showNotification('Weermelding', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('index.html')
  );
});
