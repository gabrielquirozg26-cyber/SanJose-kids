// public/sw.js
const CACHE_NAME = 'san-josekids-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
// El propio worker debe retirar la versión antigua: main.jsx podría estar cacheado.
const IS_LOCAL_DEVELOPMENT = ['localhost', '127.0.0.1', '[::1]'].includes(self.location.hostname);

// ✅ SOLO ARCHIVOS QUE EXISTEN (NO carpetas)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo.jpg',
  '/fondo-iglesia.jpeg',
];

self.addEventListener('install', (event) => {
  if (IS_LOCAL_DEVELOPMENT) {
    event.waitUntil(self.skipWaiting());
    return;
  }
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('📦 Service Worker: Cacheando assets');
      // ✅ Intentar cachear, pero si falla, continuar
      return Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(err => {
            console.warn(`⚠️ No se pudo cachear: ${url}`, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  if (IS_LOCAL_DEVELOPMENT) {
    event.waitUntil((async () => {
      await Promise.all([STATIC_CACHE, DYNAMIC_CACHE, CACHE_NAME].map(name => caches.delete(name)));
      await self.registration.unregister();
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      await Promise.all(windows
        .filter(client => new URL(client.url).origin === self.location.origin)
        .map(client => client.navigate(client.url)));
    })());
    return;
  }
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (IS_LOCAL_DEVELOPMENT) return;
  const url = new URL(event.request.url);

  // Ignorar peticiones a Firebase
  if (url.hostname.includes('firebase')) {
    return event.respondWith(fetch(event.request));
  }

  // Ignorar peticiones a Google Analytics
  if (url.hostname.includes('google-analytics')) {
    return event.respondWith(fetch(event.request));
  }

  // Ignorar extensiones
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Ignorar peticiones de análisis (evitar errores)
  if (url.pathname.endsWith('.map') || url.pathname.includes('vite')) {
    return event.respondWith(fetch(event.request));
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, clone).catch(() => {});
            });
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'San JoseKids';
  const options = {
    body: data.body || '¡Tienes una nueva notificación!',
    icon: '/logo.jpg',
    badge: '/logo.jpg',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: '📖 Ver ahora' },
      { action: 'close', title: '❌ Cerrar' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});
