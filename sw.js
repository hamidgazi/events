// sw.js — Events Countdown Service Worker (v1.1.1)
// High-performance offline caching & instant startup on mobile

const CACHE_NAME = 'events-countdown-v1.1.1';
const SHELL_ASSETS = [
  './',
  'index.html',
  'events.html',
  'manifest.json',
  'icon-app-192.png',
  'icon-app-512.png',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
  'icon.svg'
];

// Install: Pre-cache core app shell assets for instant cold start
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up older cache versions immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch:
// 1. version.json -> Network-First (so update notifications fire immediately)
// 2. Navigation requests -> Instant Cache-First (0ms startup latency on mobile)
// 3. Static assets -> Cache-First with Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Always check remote version.json with fresh network request
  if (url.pathname.endsWith('version.json')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // 2. Navigation requests: Instant Cache-First for lightning fast 0ms startup
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('index.html').then((cached) => {
        if (cached) return cached;
        return caches.match('./').then((c) => {
          return c || caches.match('events.html').then((e) => e || fetch(event.request));
        });
      }).catch(() => fetch(event.request))
    );
    return;
  }

  // 3. Static assets & shell: Cache-First with Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
