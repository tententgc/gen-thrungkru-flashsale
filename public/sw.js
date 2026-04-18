/* ThungKhru61 Service Worker — Web Push handler */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "ThungKhru61", body: event.data.text() };
  }
  const {
    title = "ตลาดทุ่งครุ 61",
    body = "",
    icon = "/icon.svg",
    badge = "/icon.svg",
    image,
    url = "/",
    tag,
    renotify,
  } = payload;
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      image,
      tag,
      renotify: Boolean(renotify),
      data: { url },
      vibrate: [100, 30, 100],
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of all) {
        if (client.url.endsWith(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })(),
  );
});
