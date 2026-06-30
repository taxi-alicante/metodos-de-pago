const CACHE_NAME = 'taxi-pagos-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/en.html',           // ← Versión en inglés
  '/legal.html',
  '/legal_en.html',     // ← Versión en inglés del legal
  '/site.webmanifest',

  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',

  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png'
];

// INSTALACIÓN
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ACTIVACIÓN
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH (cache first + actualización en segundo plano)
self.addEventListener('fetch', event => {
  const request = event.request;

  // Solo GET (importante)
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(cachedResponse => {

      const fetchPromise = fetch(request)
        .then(networkResponse => {
          // Guardar en caché
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
          });
          return networkResponse;
        })
        .catch(() => {
          // Si falla y es navegación → fallback
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return cachedResponse;
        });

      // Respuesta inmediata si existe caché
      return cachedResponse || fetchPromise;
    })
  );
});