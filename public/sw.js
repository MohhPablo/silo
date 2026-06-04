const CACHE_NAME = 'silo-v1';
const MAX_CACHE_SIZE = 50 * 1024 * 1024;

const PRE_CACHE = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRE_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cached) => {
        const fetched = fetch(event.request)
          .then((res) => {
            if (res.ok && res.status === 200) {
              const clone = res.clone();
              cache.put(event.request, clone);
            }
            return res;
          })
          .catch(() => cached);

        return cached ?? fetched;
      })
    )
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'TRIM_CACHE') {
    caches.open(CACHE_NAME).then(async (cache) => {
      const keys = await cache.keys();
      let total = 0;
      for (const req of keys) {
        const res = await cache.match(req);
        if (res) {
          const blob = await res.blob();
          total += blob.size;
        }
      }
      if (total > MAX_CACHE_SIZE) {
        const toDelete = Math.ceil(keys.length * 0.3);
        for (let i = 0; i < toDelete; i++) {
          await cache.delete(keys[i]);
        }
      }
    });
  }

  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'silo-pacing-alert',
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
