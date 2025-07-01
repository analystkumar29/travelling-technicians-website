/**
 * Service Worker for The Travelling Technicians Website
 * Provides basic offline capability and caching
 */

const CACHE_NAME = 'tt-repair-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/favicons/favicon-16x16.png',
  '/favicons/favicon-32x32.png',
  '/favicons/favicon-192x192.png',
  '/favicons/apple-touch-icon.png',
  '/favicons/android-chrome-192x192.png',
  '/favicons/android-chrome-512x512.png',
  '/favicons/site.webmanifest',
  '/error-handler.js',
  '/clean-cache.js',
  '/offline.html'
];

// Install event - cache important assets
self.addEventListener('install', event => {
  console.log('Service worker installing...');
  self.skipWaiting(); // Ensure the newest service worker activates immediately
  
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
  console.log('Service worker activating...');
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
  
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
  
  // Special handling for manifest.json
  if (event.request.url.endsWith('/manifest.json')) {
    event.respondWith(
      caches.match('/manifest.json')
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch('/manifest.json');
        })
        .catch(() => {
          console.warn('Failed to fetch manifest.json');
          return new Response(
            JSON.stringify({
              name: 'The Travelling Technicians',
              short_name: 'TT Repair',
              icons: [
                {
                  src: '/favicons/favicon-192x192.png',
                  sizes: '192x192',
                  type: 'image/png'
                }
              ],
              start_url: '/',
              display: 'standalone',
              background_color: '#ffffff',
              theme_color: '#0076be'
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }
  
  // Handle favicon requests
  if (event.request.url.includes('favicon') || event.request.url.includes('/favicons/')) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .catch(() => {
              // If we can't get the specific favicon, try to serve the default
              if (event.request.url.includes('favicon.ico')) {
                return caches.match('/favicon.ico');
              }
              return null;
            });
        })
    );
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
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Clone the response - one to return, one to cache
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                // Only cache same-origin responses
                if (response.type === 'basic') {
                  cache.put(event.request, responseToCache);
                }
              });
              
            return response;
          })
          .catch(err => {
            console.warn('Fetch failed:', err);
            // If network fails and it's a page request, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            return null;
          });
      })
  );
}); 