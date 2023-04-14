import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

cleanupOutdatedCaches()

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
  console.log("On notification click");

  // Data can be attached to the notification so that you
  // can process it in the notificationclick handler.
  // console.log(`Notification Data: ${JSON.stringify(event.notification.data)}`);
    // This looks to see if the current is already open and
  // focuses if it is
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