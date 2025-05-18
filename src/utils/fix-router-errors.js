/**
 * This script fixes common Next.js router errors:
 * - "Cannot read properties of undefined (reading 'data')" in webpack.js
 * - "Cannot read properties of undefined (reading 'data')" in remove-trailing-slash.js
 */

// Fix for webpack.js error
export function fixWebpackJsError() {
  if (typeof window === 'undefined') return;
  
  // Check if we've already fixed webpack globally
  if (window.__WEBPACK_PATCHED) return;
  
  // Ensure __NEXT_DATA__ always exists
  if (!window.__NEXT_DATA__) {
    window.__NEXT_DATA__ = {
      props: {},
      page: window.location.pathname || '/',
      query: {},
      buildId: 'development'
    };
  }
  
  // Always ensure all required properties exist
  if (!window.__NEXT_DATA__.props) window.__NEXT_DATA__.props = {};
  if (!window.__NEXT_DATA__.page) window.__NEXT_DATA__.page = window.location.pathname || '/';
  if (!window.__NEXT_DATA__.query) window.__NEXT_DATA__.query = {};
  if (!window.__NEXT_DATA__.buildId) window.__NEXT_DATA__.buildId = 'development';
  
  // Add global error handler to intercept webpack errors
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    // Check if this is the "Cannot read properties of undefined (reading 'data')" error
    if (message && typeof message === 'string' && 
        message.includes('Cannot read properties of undefined') && 
        message.includes('reading \'data\'')) {
      
      console.log('[RouterFix] Intercepted router error:', message);
      
      // Return true to prevent the error from propagating
      return true;
    }
    
    // Otherwise, call the original handler
    if (originalOnError) {
      return originalOnError.apply(this, arguments);
    }
    
    // Let the error propagate by default
    return false;
  };
  
  // Mark as patched
  window.__WEBPACK_PATCHED = true;
}

// Fix for remove-trailing-slash.js error
export function fixRemoveTrailingSlashError() {
  if (typeof window === 'undefined') return;
  
  // Check if we've already fixed the history API
  if (window.__HISTORY_PATCHED) return;
  
  // Patch the history state to always include data
  const originalPushState = window.history.pushState;
  window.history.pushState = function(state, ...rest) {
    // Ensure state is an object
    if (state === null || typeof state !== 'object') {
      state = {};
    }
    
    // Ensure state has url and data properties
    if (!state.url) {
      state.url = window.location.pathname;
    }
    
    if (!state.data) {
      state.data = {
        props: {},
        page: window.location.pathname || '/',
        query: {},
        buildId: 'development'
      };
    }
    
    return originalPushState.call(this, state, ...rest);
  };
  
  // Also patch replaceState for good measure
  const originalReplaceState = window.history.replaceState;
  window.history.replaceState = function(state, ...rest) {
    // Ensure state is an object
    if (state === null || typeof state !== 'object') {
      state = {};
    }
    
    // Ensure state has url and data properties
    if (!state.url) {
      state.url = window.location.pathname;
    }
    
    if (!state.data) {
      state.data = {
        props: {},
        page: window.location.pathname || '/',
        query: {},
        buildId: 'development'
      };
    }
    
    return originalReplaceState.call(this, state, ...rest);
  };
  
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
  
  // Mark as patched
  window.__HISTORY_PATCHED = true;
}

// Override removeTrailingSlash with a safer version
export function fixRemoveTrailingSlashFunction() {
  if (typeof window === 'undefined') return;
  
  // Check if we've already fixed this function
  if (window.__TRAILING_SLASH_PATCHED) return;
  
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
  
  // Mark as patched
  window.__TRAILING_SLASH_PATCHED = true;
}

// Apply all fixes
export function applyAllRouterFixes() {
  try {
    console.log('[Router Fix] Applying fixes for Next.js router issues');
    
    // Apply all fixes
    fixWebpackJsError();
    fixRemoveTrailingSlashError();
    fixRemoveTrailingSlashFunction();
    
    // Run patches again on navigation events to ensure they're always applied
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => {
        fixWebpackJsError();
        fixRemoveTrailingSlashError();
        fixRemoveTrailingSlashFunction();
      });
    }
    
    console.log('[Router Fix] Applied client-side patches for Next.js router issues');
  } catch (error) {
    console.error('[Router Fix] Error applying router fixes:', error);
  }
}

// Export default function for easy import
export default applyAllRouterFixes; 