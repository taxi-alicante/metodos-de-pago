const CACHE_NAME = 'taxi-pagos-v1';

const urlsToCache = [
  '/metodos-de-pago/',
  '/metodos-de-pago/index.html',
  '/metodos-de-pago/legal.html',
  '/metodos-de-pago/manifest.json',
  '/metodos-de-pago/en.html',      // Si tienes versión inglés
  '/metodos-de-pago/legal_en.html', // Si tienes versión inglés

  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

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

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request)
        .then(networkResponse => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
          });
          return networkResponse;
        })
        .catch(() => {
          if (request.mode === 'navigate') {
            return caches.match('/metodos-de-pago/index.html');
          }
          return cachedResponse;
        });
      return cachedResponse || fetchPromise;
    })
  );
});