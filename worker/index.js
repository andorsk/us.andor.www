// Bundled into the site's service worker by @ducanh2912/next-pwa (custom worker).
// Shows Anton's push notifications and opens the control plane when one is tapped.
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data && event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Anton", {
      body: data.body || "",
      tag: data.tag || "anton",
      icon: "/icons/android-chrome-192x192.png",
      badge: "/icons/android-chrome-192x192.png",
      data: { url: data.url || "/me" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || "/me", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (w.url.startsWith(url) && "focus" in w) return w.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
