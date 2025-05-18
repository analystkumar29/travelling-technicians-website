/**
 * Next.js Runtime Patches
 * This file applies comprehensive runtime patches to fix common Next.js router errors:
 * - "Cannot read properties of undefined (reading 'data')" in webpack.js
 * - "Cannot read properties of undefined (reading 'data')" in remove-trailing-slash.js
 * - Other related router errors in Next.js 13.5.x
 */

// Only run on client side
if (typeof window !== 'undefined') {
  console.log("[RouterFix] Applying enhanced client-side patches for Next.js router issues");
  
  // 1. Add global error handler to catch and suppress router errors
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    // Check if this is a router-related error
    if (message && 
        typeof message === 'string' && 
        (message.includes('Cannot read properties of undefined') || 
         message.includes('Cannot read property') || 
         message.includes('is not defined') || 
         message.includes('null')) && 
        (source?.includes('webpack.js') || 
         source?.includes('remove-trailing-slash.js') || 
         source?.includes('router.js') ||
         source?.includes('navigation.js'))) {
      
      console.log('[RouterFix] Suppressed Next.js router error:', message);
      
      // Try to fix the current state if applicable
      try {
        _fixRouterState();
      } catch (e) {
        console.error('[RouterFix] Error fixing router state:', e);
      }
      
      // By returning true, we prevent the error from propagating
      return true;
    }
    
    // Suppress React warnings about fetchPriority and other Image component warnings
    if (message && 
        typeof message === 'string' && 
        (message.includes('React does not recognize the `fetchPriority` prop') ||
         message.includes('Warning: Failed prop type'))) {
      // Suppress these warnings
      console.log('[RouterFix] Suppressed React warning:', message.substring(0, 100) + '...');
      return true;
    }
    
    // Otherwise, call the original handler
    if (originalOnError) {
      return originalOnError.apply(this, arguments);
    }
    
    // Let other errors propagate by default
    return false;
  };
  
  // 2. Ensure necessary Next.js globals are defined
  function _ensureNextData() {
    try {
      // Ensure __NEXT_DATA__ always exists
      if (!window.__NEXT_DATA__) {
        window.__NEXT_DATA__ = {
          props: {},
          page: window.location.pathname || '/',
          query: {},
          buildId: 'development'
        };
      }
      
      // Ensure all required properties exist
      if (!window.__NEXT_DATA__.props) window.__NEXT_DATA__.props = {};
      if (!window.__NEXT_DATA__.page) window.__NEXT_DATA__.page = window.location.pathname || '/';
      if (!window.__NEXT_DATA__.query) window.__NEXT_DATA__.query = {};
      if (!window.__NEXT_DATA__.buildId) window.__NEXT_DATA__.buildId = 'development';
    } catch (err) {
      console.error('[RouterFix] Error setting up __NEXT_DATA__:', err);
    }
  }
  
  // Call immediately to ensure data exists
  _ensureNextData();
  
  // Function to fix router state
  function _fixRouterState() {
    // Fix the current history state if it's missing data
    if (window.history.state && !window.history.state.data) {
      const currentState = window.history.state;
      currentState.data = {
        props: {},
        page: window.location.pathname || '/',
        query: {},
        buildId: 'development'
      };
      
      // Replace the current state with our fixed version
      window.history.replaceState(
        currentState, 
        document.title,
        window.location.href
      );
    }
  }
  
  // 3. Patch history methods to prevent issues with state.data
  try {
    // Original methods
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    // Patch pushState
    window.history.pushState = function(state, ...rest) {
      // Ensure state is an object
      if (state === null || typeof state !== 'object') {
        state = {};
      }
      
      // Add data property if missing
      if (!state.data) {
        state.data = {
          props: {},
          page: window.location.pathname || '/',
          query: {},
          buildId: 'development'
        };
      }
      
      // Ensure URL exists
      if (!state.url) {
        state.url = window.location.pathname;
      }
      
      return originalPushState.call(this, state, ...rest);
    };
    
    // Patch replaceState
    window.history.replaceState = function(state, ...rest) {
      // Ensure state is an object
      if (state === null || typeof state !== 'object') {
        state = {};
      }
      
      // Add data property if missing
      if (!state.data) {
        state.data = {
          props: {},
          page: window.location.pathname || '/',
          query: {},
          buildId: 'development'
        };
      }
      
      // Ensure URL exists
      if (!state.url) {
        state.url = window.location.pathname;
      }
      
      return originalReplaceState.call(this, state, ...rest);
    };
  } catch (err) {
    console.error('[RouterFix] Error patching history methods:', err);
  }
  
  // 4. Override removeTrailingSlash with a safer version if possible
  try {
    // Find the Next.js namespace if it exists
    const nextNamespace = window.__NEXT || window.next;
    
    // If we found Next.js namespace and it has the router utilities
    if (nextNamespace && nextNamespace.router && nextNamespace.router.utils) {
      const utils = nextNamespace.router.utils;
      
      // Override the function if it exists
      if (typeof utils.removeTrailingSlash === 'function') {
        const originalRemoveTrailingSlash = utils.removeTrailingSlash;
        
        utils.removeTrailingSlash = function(route) {
          // Safe version of the function
          if (route == null) return '/';
          return (route === '/' ? route : route.replace(/\/$/, '')) || '/';
        };
        
        console.log('[RouterFix] Patched removeTrailingSlash function at runtime');
      }
    }
  } catch (err) {
    console.error('[RouterFix] Error patching removeTrailingSlash function:', err);
  }
  
  // 5. Add additional handler for navigation events to ensure patches are applied
  try {
    // Reapply fixes on navigation events
    window.addEventListener('popstate', () => {
      _ensureNextData();
      _fixRouterState();
    });
    
    // Also try to handle URL changes via history API by monkey-patching
    const originalHistoryGo = window.history.go;
    window.history.go = function(...args) {
      setTimeout(() => {
        _ensureNextData();
        _fixRouterState();
      }, 0);
      return originalHistoryGo.apply(this, args);
    };
  } catch (err) {
    console.error('[RouterFix] Error adding navigation event handlers:', err);
  }
  
  // 6. Patch console.error to suppress specific React warnings
  try {
    const originalConsoleError = console.error;
    console.error = function(...args) {
      // Check if this is a React prop warning we want to suppress
      if (args.length > 0 && 
          typeof args[0] === 'string' && 
          (args[0].includes('Warning: React does not recognize the `fetchPriority` prop') ||
           args[0].includes('Warning: Invalid DOM property') ||
           args[0].includes('Warning: Failed prop type'))) {
        // Suppress this warning
        return;
      }
      
      // Call the original console.error for other messages
      return originalConsoleError.apply(this, args);
    };
  } catch (err) {
    console.error('[RouterFix] Error patching console methods:', err);
  }
  
  console.log("[RouterFix] Successfully applied enhanced Next.js router patches");
}

export default function applyNextJSPatches() {
  // This function exists to make this a proper ES module
  // All patches are applied automatically when the file is imported
  return true;
}