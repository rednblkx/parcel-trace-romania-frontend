import { precacheAndRoute } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('install', () => {
	self.skipWaiting();
});


self.addEventListener("push", e => {
  const data = e.data.json();
  self.registration.showNotification(
      `${data.carrier} - ${data.tracking_id}`, // title of the notification
      {
        body: data.status + " - " + data.county, //the body of the push notification
        data: data
      }
  );
});

self.addEventListener("notificationclick", (event) => {
  
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(`/shipment/${event.notification.data.tracking_id}`);
      })
  );
  event.notification.close();

});