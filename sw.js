self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e) {}
  const title = data.title || "Nova notificação";
  const body = data.message || "";
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "gerador-push",
      data: { url: "/" }
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({type:"window", includeUncontrolled:true}).then(list => {
    for (const client of list) if ("focus" in client) return client.focus();
    if (clients.openWindow) return clients.openWindow("/");
  }));
});
