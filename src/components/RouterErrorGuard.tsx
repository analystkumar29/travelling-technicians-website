import { useEffect, useRef, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { showError } from './GlobalErrorHandler';

/**
 * RouterErrorGuard component
 * 
 * This component applies additional protection against Next.js router errors by:
 * 1. Monitoring route changes and applying fixes
 * 2. Re-enabling suppressed functionality after errors
 * 3. Catching and properly handling navigation errors
 * 4. Adding timeout mechanism for stalled navigation
 */
interface RouterErrorGuardProps {
  children: ReactNode;
}

const RouterErrorGuard: React.FC<RouterErrorGuardProps> = ({ children }) => {
  const router = useRouter();
  const isNavigating = useRef(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    console.log('[RouterErrorGuard] Initializing router error protection');
    
    // Function to ensure required router state
    const fixRouterState = () => {
      try {
        // Make sure the history state has proper data
        if (window.history.state && !window.history.state.data) {
          window.history.replaceState({
            ...window.history.state,
            data: {
              props: {},
              page: router.pathname || window.location.pathname || '/',
              query: router.query || {},
              buildId: window.__NEXT_DATA__?.buildId || 'development'
            }
          }, document.title, window.location.href);
        }
        
        // Ensure next data exists
        if (!window.__NEXT_DATA__) {
          window.__NEXT_DATA__ = {
            props: {},
            page: router.pathname || window.location.pathname || '/',
            query: router.query || {},
            buildId: 'development'
          };
        }
      } catch (err) {
        console.error('[RouterErrorGuard] Error fixing router state:', err);
      }
    };
    
    // Fix any state issues immediately
    fixRouterState();

    // Set up navigation timeout mechanism
    const startNavigationTimeout = (url: string) => {
      // Clear any existing timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      
      // Store current URL for recovery
      currentUrlRef.current = url;
      
      // Set a new timeout
      navigationTimeoutRef.current = setTimeout(() => {
        if (isNavigating.current) {
          console.warn(`[RouterErrorGuard] Navigation to ${url} taking too long, forcing reset`);
          isNavigating.current = false;
          document.body.classList.remove('loading-navigation');
          
          // Force state reset
          fixRouterState();
          
          // Trigger error notification
          showError('Navigation timed out. Try again or refresh the page.', 'warning');
          
          // If needed, refresh the page as last resort
          if (document.body.classList.contains('navigation-stuck')) {
            console.warn('[RouterErrorGuard] Navigation appears stuck, reloading page');
            window.location.href = url;
          }
        }
      }, 8000); // 8 second timeout for navigation
    };
    
    // Handle router events
    const handleRouteChangeStart = (url: string) => {
      isNavigating.current = true;
      document.body.classList.add('loading-navigation');
      console.log('[RouterErrorGuard] Route change starting:', url);
      
      // Start navigation timeout
      startNavigationTimeout(url);
      
      // Add stuck class after a delay (will be removed on success)
      setTimeout(() => {
        if (isNavigating.current) {
          document.body.classList.add('navigation-stuck');
        }
      }, 2000);
    };
    
    const handleRouteChangeComplete = (url: string) => {
      isNavigating.current = false;
      document.body.classList.remove('loading-navigation');
      document.body.classList.remove('navigation-stuck');
      console.log('[RouterErrorGuard] Route change completed:', url);
      
      // Clear navigation timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
      
      // Reset current URL
      currentUrlRef.current = null;
      
      // Fix state after navigation
      fixRouterState();
    };
    
    const handleRouteChangeError = (err: Error, url: string) => {
      isNavigating.current = false;
      document.body.classList.remove('loading-navigation');
      document.body.classList.remove('navigation-stuck');
      console.error('[RouterErrorGuard] Route change error:', err);
      
      // Clear navigation timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
      
      // Only show non-cancelled navigation errors
      if (err.message !== 'Route change aborted. Please ignore this error.') {
        showError(`Navigation error: ${err.message}`, 'warning');
      }
      
      // Try to recover the router state
      fixRouterState();
    };
    
    // Subscribe to router events
    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);
    
    // Apply patches on visibility change
    document.addEventListener('visibilitychange', fixRouterState);
    
    // Cleanup
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
      document.removeEventListener('visibilitychange', fixRouterState);
      
      // Clear any pending timeouts
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
    };
  }, [router]);
  
  // Return the children
  return <>{children}</>;
};

export default RouterErrorGuard; 