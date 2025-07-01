/**
 * Cache Cleaner Script for The Travelling Technicians Website
 * 
 * This script ensures that:
 * 1. Service worker is properly registered or updated
 * 2. Critical resources like manifest.json and favicons are pre-loaded
 * 3. Stale caches are cleared when necessary
 */
(function() {
  // Debug mode flag
  const DEBUG = false;
  
  // Simple logging wrapper that only outputs in debug mode
  const log = (message) => {
    if (DEBUG) {
      console.log('[Cache Cleaner] ' + message);
    }
  };
  
  // Always log errors
  const error = (message) => {
    console.error('[Cache Cleaner] ' + message);
  };
  
  // Resources to pre-load
  const CRITICAL_RESOURCES = [
    '/manifest.json',
    '/favicon.ico',
    '/favicons/favicon-32x32.png',
    '/favicons/favicon-192x192.png'
  ];
  
  // Initialize
  log('Initializing cache management');
  
  // Check for service worker support
  if ('serviceWorker' in navigator) {
    // Handle service worker registration
    const registerServiceWorker = async () => {
      try {
        log('Checking for service worker');
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        if (registrations.length === 0) {
          log('No service workers found');
        } else {
          log(`Found ${registrations.length} service worker(s)`);
          
          for (const registration of registrations) {
            if (registration.active) {
              log(`SW active at: ${registration.scope}`);
            } else {
              log(`SW not active at: ${registration.scope}`);
            }
          }
        }
        
        // Register our service worker if needed
        if (registrations.length === 0 || 
            !registrations.some(reg => reg.scope.includes(window.location.origin))) {
          log('Registering new service worker');
          navigator.serviceWorker.register('/sw.js')
            .then((reg) => {
              log('Service worker registered successfully');
            })
            .catch((err) => {
              error('Service worker registration failed: ' + err);
            });
        }
      } catch (err) {
        error('Error checking service workers: ' + err);
      }
    };
    
    // Wait until the page is fully loaded
    window.addEventListener('load', registerServiceWorker);
  } else {
    log('Service workers not supported in this browser');
  }
  
  // Pre-load critical resources
  const preloadResources = async () => {
    log('Pre-loading critical resources');
    
    CRITICAL_RESOURCES.forEach(async (resource) => {
      try {
        const response = await fetch(resource, { cache: 'reload' });
        if (!response.ok) {
          error(`Failed to pre-load ${resource}: ${response.status}`);
        } else {
          log(`Successfully pre-loaded ${resource}`);
        }
      } catch (err) {
        error(`Failed to pre-load ${resource}: ${err}`);
      }
    });
  };
  
  // Clear browser cache for specific resources
  const clearResourceCache = async (resources) => {
    if (!('caches' in window)) {
      log('Cache API not supported');
      return;
    }
    
    try {
      const keys = await caches.keys();
      
      for (const key of keys) {
        const cache = await caches.open(key);
        
        for (const resource of resources) {
          try {
            await cache.delete(resource);
            log(`Deleted ${resource} from cache ${key}`);
          } catch (err) {
            error(`Error deleting ${resource} from cache ${key}: ${err}`);
          }
        }
      }
    } catch (err) {
      error('Error clearing cache: ' + err);
    }
  };
  
  // Launch cache operations
  preloadResources();
  
  // Add a specific action to refresh manifest if needed
  if ('serviceWorker' in navigator && window.location.pathname === '/auth/callback') {
    // For the auth callback page, explicitly try to reload critical resources
    log('Auth callback page detected - refreshing critical resources');
    clearResourceCache(CRITICAL_RESOURCES);
  }
  
  log('All cleanup tasks initiated');
})(); 