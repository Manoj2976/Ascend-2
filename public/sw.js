/* Ascend service worker: shows notifications and (later) handles Web Push from the backend. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// Future: backend Web Push (VAPID) lands here.
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { /* ignore */ }
  const title = data.title || "Ascend";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "You have a pending task.",
      tag: data.tag || "ascend",
      renotify: true,
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: { url: data.url || "/" },
      requireInteraction: true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) return c.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
