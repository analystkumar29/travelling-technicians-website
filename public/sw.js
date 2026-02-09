// Service Worker for Offline Caching
// Implements caching strategies for different types of content

const CACHE_NAME = 'travelling-technicians-v1.1.0';
const OFFLINE_CACHE = 'offline-v1.1.0';

// URLs to cache on install
const STATIC_CACHE_URLS = [
  '/',
  '/services/mobile-repair',
  '/services/laptop-repair',
  '/about',
  '/contact',
  '/offline.html'
];

// API routes to cache with different strategies
const API_CACHE_PATTERNS = [
  { pattern: /\/api\/devices\/brands/, strategy: 'cacheFirst', maxAge: 3600000 }, // 1 hour
  { pattern: /\/api\/devices\/models/, strategy: 'cacheFirst', maxAge: 3600000 }, // 1 hour
  { pattern: /\/api\/pricing\/calculate/, strategy: 'networkFirst', maxAge: 1800000 }, // 30 minutes
  { pattern: /\/api\/service-areas/, strategy: 'cacheFirst', maxAge: 86400000 } // 24 hours
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      }),
      
      // Cache offline fallback
      caches.open(OFFLINE_CACHE).then((cache) => {
        return cache.add('/offline.html');
      })
    ]).then(() => {
      console.log('Service Worker installed successfully');
      // Force activation of new service worker
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated successfully');
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests with specific strategies
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Default: network first
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Handle API requests with appropriate caching strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Find matching cache pattern
  const cachePattern = API_CACHE_PATTERNS.find(pattern => 
    pattern.pattern.test(pathname)
  );

  if (!cachePattern) {
    // No specific strategy - try network first
    return networkFirst(request, CACHE_NAME);
  }

  switch (cachePattern.strategy) {
    case 'cacheFirst':
      return cacheFirst(request, CACHE_NAME, cachePattern.maxAge);
    case 'networkFirst':
      return networkFirst(request, CACHE_NAME, cachePattern.maxAge);
    default:
      return networkFirst(request, CACHE_NAME);
  }
}

// Handle static assets (images, CSS, JS)
async function handleStaticAsset(request) {
  return cacheFirst(request, CACHE_NAME);
}

// Handle navigation requests
async function handleNavigation(request) {
  try {
    // Try network first for navigation
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Network failed - try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Show offline page
    return caches.match('/offline.html');
  }
}

// Cache First strategy
async function cacheFirst(request, cacheName, maxAge = null) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Check if cache is expired (if maxAge is specified)
    if (maxAge) {
      const cacheDate = new Date(cachedResponse.headers.get('date') || 0);
      const now = new Date();
      const age = now.getTime() - cacheDate.getTime();
      
      if (age > maxAge) {
        console.log('Cache expired, fetching fresh data');
        return networkFirst(request, cacheName);
      }
    }
    
    // Background update for API calls
    if (request.url.includes('/api/')) {
      fetch(request).then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      }).catch(() => {
        // Silent fail for background updates
      });
    }
    
    return cachedResponse;
  }

  return networkFirst(request, cacheName);
}

// Network First strategy
async function networkFirst(request, cacheName, maxAge = null) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(cacheName);
      
      // Add timestamp header for expiration tracking
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-date', new Date().toISOString());
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers
      });
      
      cache.put(request, cachedResponse);
    }
    
    return response;
  } catch (error) {
    // Network failed - try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Check if URL is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      clearCache(payload?.cacheName).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ size });
      });
      break;
      
    case 'WARM_CACHE':
      warmCache(payload?.urls || []).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
  }
});

// Cache management utilities
async function clearCache(cacheName = null) {
  if (cacheName) {
    return caches.delete(cacheName);
  }
  
  const cacheNames = await caches.keys();
  return Promise.all(cacheNames.map(name => caches.delete(name)));
}

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    totalSize += keys.length;
  }
  
  return totalSize;
}

async function warmCache(urls) {
  const cache = await caches.open(CACHE_NAME);
  
  const fetchPromises = urls.map(async url => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
        console.log('Warmed cache for:', url);
      }
    } catch (error) {
      console.warn('Failed to warm cache for:', url, error);
    }
  });
  
  await Promise.all(fetchPromises);
  console.log('Cache warming completed');
}

// Periodic cache cleanup
setInterval(async () => {
  console.log('Running periodic cache cleanup...');
  
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  
  for (const request of keys) {
    const response = await cache.match(request);
    const cachedDate = response.headers.get('sw-cached-date');
    
    if (cachedDate) {
      const age = Date.now() - new Date(cachedDate).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (age > maxAge) {
        console.log('Removing expired cache entry:', request.url);
        await cache.delete(request);
      }
    }
  }
}, 60 * 60 * 1000); // Run every hour

// Push notification handler
self.addEventListener('push', (event) => {
  let data = { title: 'New Job Available', body: 'A new repair job is available.', tag: 'new-job' };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/favicons/android-chrome-192x192.png',
    badge: '/favicons/favicon-32x32.png',
    tag: data.tag || 'new-job',
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: { url: data.url || '/technician/available-jobs' },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/technician/available-jobs';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing technician tab if found
      for (const client of clientList) {
        if (client.url.includes('/technician') && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new tab
      return clients.openWindow(targetUrl);
    })
  );
});