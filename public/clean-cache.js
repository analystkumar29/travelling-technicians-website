/**
 * Script to clear browser caches that may cause "Invalid or unexpected token" errors
 * Include this in your HTML with <script src="/clean-cache.js"></script>
 */

(function() {
  // Check if we have the cache clearing parameter
  const urlParams = new URLSearchParams(window.location.search);
  const clearCache = urlParams.get('clear_cache');
  
  // If we're instructed to clear cache or if we detect errors
  if (clearCache === '1' || window.hasOwnProperty('__NEXT_CACHE_ERRORS')) {
    console.log('Clearing browser caches...');
    
    // Clear localStorage items that might be causing issues
    try {
      // Local storage
      localStorage.clear();
      console.log('- localStorage cleared');
      
      // Session storage
      sessionStorage.clear();
      console.log('- sessionStorage cleared');
      
      // Clear all cookies
      document.cookie.split(';').forEach(function(c) {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
      console.log('- cookies cleared');
      
      // Clear caches if supported
      if ('caches' in window) {
        caches.keys().then(function(names) {
          for (let name of names) {
            caches.delete(name);
          }
          console.log('- browser caches cleared');
        });
      }
      
      // Set a flag to prevent infinite reloads
      sessionStorage.setItem('cache_cleared', '1');
      
      // Reload the page without the cache parameter
      if (!sessionStorage.getItem('reloaded')) {
        sessionStorage.setItem('reloaded', '1');
        
        // Create a URL without the cache parameter
        const url = new URL(window.location.href);
        url.searchParams.delete('clear_cache');
        
        console.log('Reloading page without cache...');
        window.location.href = url.toString();
      }
    } catch (e) {
      console.error('Error clearing caches:', e);
    }
  }
  
  // Error detection - if we detect any syntax errors, add a cache clear button
  window.addEventListener('error', function(e) {
    if (e && e.message && (
      e.message.includes('Unexpected token') || 
      e.message.includes('Invalid or unexpected token') ||
      e.message.includes('Syntax error')
    )) {
      console.log('Detected syntax error:', e.message);
      
      // Mark that we've had errors
      window.__NEXT_CACHE_ERRORS = true;
      
      // Add a cache clear button if not already reloading
      if (!sessionStorage.getItem('reloaded')) {
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.top = '20px';
        div.style.right = '20px';
        div.style.backgroundColor = '#f8f8f8';
        div.style.padding = '15px';
        div.style.borderRadius = '5px';
        div.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        div.style.zIndex = '9999';
        
        div.innerHTML = `
          <p style="margin: 0 0 10px 0; font-family: sans-serif; font-size: 14px;">
            Detected a JavaScript error that may be caused by cached files.
          </p>
          <button id="clear-cache-btn" style="background: #0070f3; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-family: sans-serif;">
            Clear Cache & Reload
          </button>
        `;
        
        document.body.appendChild(div);
        
        document.getElementById('clear-cache-btn').addEventListener('click', function() {
          window.location.href = window.location.pathname + '?clear_cache=1';
        });
      }
    }
  }, true);

  // This script handles manifest.json caching issues and cleans up problematic service workers
  function logMessage(message) {
    console.log('[Cache Cleaner]', message);
  }

  // Check for and unregister any problematic service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      if (registrations.length > 0) {
        logMessage(`Found ${registrations.length} service worker(s). Attempting to unregister.`);
        
        registrations.forEach(registration => {
          registration.unregister().then(success => {
            if (success) {
              logMessage('Successfully unregistered service worker');
            } else {
              logMessage('Failed to unregister service worker');
            }
          });
        });
      } else {
        logMessage('No service workers found');
      }
    }).catch(err => {
      logMessage('Error checking service workers: ' + err);
    });
  }

  // Detect and fix manifest fetch errors by pre-fetching with proper credentials
  function preloadManifest() {
    try {
      fetch('/manifest.json', { 
        method: 'GET',
        credentials: 'include',
        cache: 'reload'
      })
      .then(response => {
        if (response.ok) {
          logMessage('Successfully pre-loaded manifest.json');
          return response.json();
        } else {
          logMessage('Failed to pre-load manifest.json: ' + response.status);
          // Try to force clear cache for this resource
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              caches.open(cacheName).then(cache => {
                cache.delete('/manifest.json').then(() => {
                  logMessage('Deleted manifest.json from cache: ' + cacheName);
                });
              });
            });
          });
        }
      })
      .catch(error => {
        logMessage('Error pre-loading manifest.json: ' + error);
      });
    } catch (e) {
      logMessage('Exception while handling manifest: ' + e);
    }
  }

  // Clear any potential bad cache entries for critical resources
  function clearBadCacheEntries() {
    if ('caches' in window) {
      const criticalPaths = [
        '/manifest.json',
        '/favicons/favicon-32x32.png',
        '/favicons/favicon-192x192.png',
        '/favicon.ico'
      ];
      
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          logMessage('Processing cache: ' + cacheName);
          caches.open(cacheName).then(cache => {
            criticalPaths.forEach(path => {
              cache.delete(path).then(success => {
                if (success) {
                  logMessage(`Deleted ${path} from cache: ${cacheName}`);
                }
              });
            });
          });
        });
      }).catch(err => {
        logMessage('Error clearing cache entries: ' + err);
      });
    }
  }

  // Handle special cases for iOS/Safari
  function handleSafariSpecialCases() {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isSafari || isIOS) {
      logMessage('Safari or iOS detected, applying special fixes');
      
      // Set a meta tag to help with geolocation permissions
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-capable';
      meta.content = 'yes';
      document.head.appendChild(meta);
      
      // Pre-load geolocation for better permission handling
      if ('geolocation' in navigator) {
        setTimeout(() => {
          try {
            navigator.geolocation.getCurrentPosition(
              () => logMessage('Pre-loaded geolocation successfully'),
              () => logMessage('Pre-loaded geolocation failed, but that\'s expected'),
              { timeout: 1000, enableHighAccuracy: false }
            );
          } catch (e) {
            logMessage('Error pre-loading geolocation: ' + e);
          }
        }, 2000);
      }
    }
  }

  // Run all cleanup functions
  setTimeout(() => {
    preloadManifest();
    clearBadCacheEntries();
    handleSafariSpecialCases();
    logMessage('All cleanup tasks initiated');
  }, 1000);
})(); 