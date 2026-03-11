// Vitametra Bio-OS Service Worker
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Vitametra: Alerta Metabólica';
  const options = {
    body: data.body || 'Es momento de revisar tu glucosa.',
    icon: '/logo192.png', // Asegúrate de tener este icono en public
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});