/**
 * Next.js Runtime Fixes
 * This file provides runtime patches for common Next.js router issues without modifying node_modules
 */

// Only apply in browser environment
if (typeof window !== 'undefined') {
  console.log('[NextFix] Applying Next.js runtime fixes');
  
  // 1. Ensure __NEXT_DATA__ always exists
  if (!window.__NEXT_DATA__) {
    window.__NEXT_DATA__ = {
      props: {},
      page: window.location.pathname || '/',
      query: {},
      buildId: 'development'
    };
  }
  
  // 2. Create a safe history state wrapper
  function ensureValidHistoryState(state) {
    if (state === null || typeof state !== 'object') {
      return {
        data: {
          props: {},
          page: window.location.pathname || '/',
          query: {},
          buildId: window.__NEXT_DATA__?.buildId || 'development'
        }
      };
    }
    
    if (!state.data) {
      return {
        ...state,
        data: {
          props: {},
          page: window.location.pathname || '/',
          query: {},
          buildId: window.__NEXT_DATA__?.buildId || 'development'
        }
      };
    }
    
    return state;
  }
  
  // 3. Patch history methods to ensure state.data always exists
  const originalPushState = window.history.pushState;
  window.history.pushState = function(state, ...rest) {
    return originalPushState.call(this, ensureValidHistoryState(state), ...rest);
  };
  
  const originalReplaceState = window.history.replaceState;
  window.history.replaceState = function(state, ...rest) {
    return originalReplaceState.call(this, ensureValidHistoryState(state), ...rest);
  };
  
  // 4. Add a safety wrapper to handle state access
  function safeStateAccess() {
    try {
      const state = window.history.state;
      if (!state || !state.data) {
        // Fix the current state
        const fixedState = ensureValidHistoryState(state || {});
        window.history.replaceState(fixedState, document.title, window.location.href);
        return fixedState.data;
      }
      return state.data;
    } catch (e) {
      console.warn('[NextFix] Error accessing history state:', e);
      return {
        props: {},
        page: window.location.pathname || '/',
        query: {},
        buildId: window.__NEXT_DATA__?.buildId || 'development'
      };
    }
  }
  
  // 5. Add getters to window for intercepting router data
  Object.defineProperty(window, '__NEXT_SAFE_STATE__', {
    get: safeStateAccess,
    configurable: true
  });
  
  // 6. Add global error handler to catch and handle router errors
  const originalOnError = window.onerror;
  window.onerror = function(message, source, line, column, error) {
    // Handle router errors
    if (message && 
        typeof message === 'string' && 
        (message.includes('Cannot read properties of undefined') || 
         message.includes('Cannot read property') || 
         message.includes('is not defined') ||
         message.includes('data of undefined'))) {
      
      console.log('[NextFix] Handled error:', message);
      
      // Fix the current state if necessary
      try {
        if (window.history.state && !window.history.state.data) {
          window.history.replaceState(
            ensureValidHistoryState(window.history.state),
            document.title,
            window.location.href
          );
        }
      } catch (e) {
        console.error('[NextFix] Error fixing history state:', e);
      }
      
      // Prevent the white screen issue by checking document body
      if (document.body && document.body.children.length === 0) {
        console.log('[NextFix] Detected white screen, checking state...');
        setTimeout(() => {
          if (document.body.children.length === 0) {
            console.log('[NextFix] Still white screen, refreshing page...');
            window.location.reload();
          }
        }, 1000);
      }
      
      return true; // Prevent default error handling
    }
    
    // Call original handler for other errors
    if (originalOnError) {
      return originalOnError.apply(this, arguments);
    }
    
    return false;
  };
  
  // 7. Add DOMContentLoaded handler to check for white screen
  document.addEventListener('DOMContentLoaded', () => {
    // Set a timeout to check if content has loaded properly
    setTimeout(() => {
      const visibleElements = Array.from(document.body.children).filter(el => {
        const style = window.getComputedStyle(el);
        return el.tagName !== 'SCRIPT' && style.display !== 'none' && style.visibility !== 'hidden';
      });
      
      if (visibleElements.length === 0) {
        console.log('[NextFix] No visible elements detected after load, refreshing...');
        window.location.reload();
      }
    }, 2000);
  });
  
  console.log('[NextFix] All runtime fixes applied');
}

export default function initNextFixes() {
  // This is just to make this a proper module
  return true;
}