/**
 * Global error handlers for The Travelling Technicians website
 * Handles common errors gracefully
 */

// Client-side error handler to prevent white screen issues
(function() {
  console.log('[Debug] Error handler script loaded');
  
  // Safety wrapper for webpack/router errors
  window.__NEXT_ROUTER_SAFE_ACCESS = function(obj, path, fallback) {
    try {
      if (!obj) return fallback;
      
      const parts = path.split('.');
      let current = obj;
      
      for (let i = 0; i < parts.length; i++) {
        if (current === undefined || current === null) {
          return fallback;
        }
        current = current[parts[i]];
      }
      
      return (current === undefined || current === null) ? fallback : current;
    } catch (e) {
      console.warn('[Safe Access] Error accessing path', path, e);
      return fallback;
    }
  };
  
  // Error prevention for router-related issues
  window.addEventListener('error', function(event) {
    // Prevent webpack and router related errors from crashing the app
    if (event && event.error && event.error.message && (
        event.error.message.includes('Cannot read properties of undefined') || 
        event.error.message.includes('reading \'data\'') ||
        event.error.message.includes('webpack') ||
        event.error.message.includes('router'))) {
      
      console.warn('[Error Handler] Suppressed error:', event.error.message);
      event.preventDefault();
      
      // Try to recover the router if it's missing
      if (typeof window.__NEXT_DATA__ === 'undefined') {
        console.log('[Error Handler] Recreating __NEXT_DATA__');
        window.__NEXT_DATA__ = {
          props: {},
          page: window.location.pathname || '/',
          query: {},
          buildId: ''
        };
      }
    }
  });
})();

// Handle JSONP callback errors
window.jsonpErrorHandler = function(callbackName) {
  console.warn(`JSONP callback ${callbackName} was called but not defined. This is usually harmless.`);
  // Create a temporary function to prevent uncaught errors
  window[callbackName] = function() {
    console.warn(`Late JSONP callback ${callbackName} received after timeout`);
  };
  
  // Clean up after a delay
  setTimeout(() => {
    if (window[callbackName]) {
      delete window[callbackName];
    }
  }, 30000); // 30 second cleanup
};

// Clean up any existing JSONP callbacks that might be hanging
(function() {
  const possibleCallbacks = Object.keys(window).filter(key => 
    key.startsWith('jsonp_callback_') || 
    key.includes('_callback_')
  );
  
  possibleCallbacks.forEach(callback => {
    if (typeof window[callback] !== 'function') {
      window[callback] = function() {};
      console.warn(`Defined missing JSONP callback: ${callback}`);
    }
  });
})();

// Handle geolocation errors gracefully
const originalGeolocation = navigator.geolocation.getCurrentPosition;
navigator.geolocation.getCurrentPosition = function(success, error, options) {
  const wrappedError = function(err) {
    console.warn('Geolocation error handled gracefully:', err.message);
    // Still call original error handler if provided
    if (error) {
      error(err);
    }
  };
  
  return originalGeolocation.call(navigator.geolocation, success, wrappedError, options);
};

// Suppress location-related browser console errors
window.addEventListener('error', function(event) {
  const errorMessage = event.message || '';
  const isLocationError = 
    errorMessage.includes('CoreLocationProvider') || 
    errorMessage.includes('Position update is unavailable') ||
    errorMessage.includes('kCLErrorLocationUnknown');
    
  if (isLocationError) {
    event.preventDefault();
    console.warn('Location service error suppressed:', errorMessage);
    return false;
  }
});
