// Background Service Worker
const CACHE_NAME = 'most-imp-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let browser fetch normally
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
