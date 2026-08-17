const CACHE_NAME = 'lizwi-v1';
const APP_SHELL = [
  './lizwi.html',
  './manifest.json',
  './icons/lizwi-icon-192.png',
  './icons/lizwi-icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Cache-first for the app shell; network-first for everything else (e.g. the
// optional hand-tracking model files), falling back to cache if offline.
self.addEventListener('fetch', (event) => {
  const isAppShell = APP_SHELL.some((path) => event.request.url.endsWith(path.replace('./', '')));
  if (isAppShell) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  } else {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
