// sw.js — Events Countdown Service Worker (v1.0.1)
// High-performance offline caching & instant startup on mobile

const CACHE_NAME = 'events-countdown-v1.0.1';
const SHELL_ASSETS = [
  './',
  'index.html',
  'events.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
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
// 2. Shell assets -> Stale-While-Revalidate (instant offline load + background update)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Always check remote version.json with fresh network request
  if (url.pathname.endsWith('version.json')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Core shell assets: Stale-While-Revalidate strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
