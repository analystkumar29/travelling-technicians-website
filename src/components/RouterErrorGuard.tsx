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
 */
interface RouterErrorGuardProps {
  children: ReactNode;
}

const RouterErrorGuard: React.FC<RouterErrorGuardProps> = ({ children }) => {
  const router = useRouter();
  const isNavigating = useRef(false);
  
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
    
    // Handle router events
    const handleRouteChangeStart = (url: string) => {
      isNavigating.current = true;
      console.log('[RouterErrorGuard] Route change starting:', url);
    };
    
    const handleRouteChangeComplete = (url: string) => {
      isNavigating.current = false;
      console.log('[RouterErrorGuard] Route change completed:', url);
      
      // Fix state after navigation
      fixRouterState();
    };
    
    const handleRouteChangeError = (err: Error, url: string) => {
      isNavigating.current = false;
      console.error('[RouterErrorGuard] Route change error:', err);
      
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
    };
  }, [router]);
  
  // Return the children
  return <>{children}</>;
};

export default RouterErrorGuard; 