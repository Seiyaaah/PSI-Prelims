const CACHE_NAME = 'voilearn-cache-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/router.js',
  './js/lesson.js',
  './js/quiz.js',
  './js/notes.js',
  './js/progress.js',
  './js/storage.js',
  './data/subjects.json',
  './data/lessons.json',
  './data/questions.json',
  './data/notes.json',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// 1. Install event: cache assets and force the waiting service worker to become active
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate event: clean up outdated caches immediately and take control of open clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch event with smart strategies:
// - For .json files: Network-First (always gets the latest updates online, falls back to cache offline)
// - For static assets (CSS, JS, icons): Cache-First
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // If the request is for a JSON data file, use Network-First
  if (url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // Standard Cache-First strategy for scripts, styles, and markup
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      }).catch(() => {
        const acceptHeader = event.request.headers.get('accept');
        if (acceptHeader && acceptHeader.includes('text/html')) {
          return caches.match('./index.html');
        }
      })
    );
  }
});
