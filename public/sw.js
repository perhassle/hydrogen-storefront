// Simple service worker for caching static assets
const CACHE_NAME = 'hydrogen-storefront-v1';
const STATIC_ASSETS = [
  '/',
  '/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip caching for API calls
  if (event.request.url.includes('/api/') || event.request.url.includes('/graphql')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});