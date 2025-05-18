/**
 * Service Worker for The Travelling Technicians Website
 * Provides basic offline capability and caching
 */

const CACHE_NAME = 'tt-repair-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/favicons/favicon-32x32.png',
  '/favicons/favicon-192x192.png',
  '/error-handler.js',
  '/offline.html' // Will create this next
];

// Install event - cache important assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service worker caching assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(err => {
        console.warn('Service worker cache failed:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('tt-repair-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Service worker purging old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Fetch event - serve from cache if available, fall back to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Handle API requests differently - don't cache
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response - one to return, one to cache
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(err => {
            // If network fails and it's a page request, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            return null;
          });
      })
  );
}); 