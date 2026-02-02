// service-worker.js

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received.');
  const data = event.data ? event.data.json() : { title: 'VitaMetra', body: 'Tienes un nuevo recordatorio.' };
  
  const options = {
    body: data.body,
    icon: '/logo.png', // Main logo
    badge: '/logo.png', // A smaller icon for the notification bar
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});


self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.matchAll({
      type: "window"
    }).then((clientList) => {
      for (const client of clientList) {
        // Check if a client is already open and focus it.
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window.
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});