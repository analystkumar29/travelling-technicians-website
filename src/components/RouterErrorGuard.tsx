import { useEffect, useRef, ReactNode, useState } from 'react';
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
  const [hasError, setHasError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [showResetButton, setShowResetButton] = useState(false);
  
  const isNavigating = useRef(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  const navigationCountRef = useRef(0);
  const lastNavigationTimeRef = useRef(Date.now());
  const lastValidPageRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Function to fix router state issues
    const fixRouterState = () => {
      // Fix issue with undefined history state
      if (typeof window.history.state === 'undefined' || window.history.state === null) {
        const newState = {
          url: window.location.href,
          as: window.location.href,
          options: {}
        };
        
        // Replace the current history state with a valid one
        window.history.replaceState(newState, '', window.location.href);
        console.log('[RouterErrorGuard] Fixed undefined history state');
      }
      
      // Fix issue with missing __NEXT_DATA__
      if (typeof window.__NEXT_DATA__ === 'undefined') {
        window.__NEXT_DATA__ = { 
          props: {}, 
          page: window.location.pathname || '/',
          query: {},
          buildId: 'development' 
        };
        console.log('[RouterErrorGuard] Fixed missing __NEXT_DATA__');
      }
      
      // Reset navigating state if stuck
      if (isNavigating.current && document.body.classList.contains('navigation-stuck')) {
        isNavigating.current = false;
        document.body.classList.remove('loading-navigation');
        document.body.classList.remove('navigation-stuck');
        console.log('[RouterErrorGuard] Reset stuck navigation state');
      }
    };

    // Detect rapid navigation attempts
    const detectRapidNavigation = () => {
      const now = Date.now();
      const timeSinceLastNav = now - lastNavigationTimeRef.current;
      
      // If navigation happens too quickly in succession
      if (timeSinceLastNav < 1000) {
        navigationCountRef.current += 1;
        
        // If we detect too many rapid navigations, something's wrong
        if (navigationCountRef.current > 5) {
          console.error('[RouterErrorGuard] Detected rapid navigation pattern');
          showError('Navigation issues detected. Try refreshing the page.', 'warning');
        }
      } else {
        // Reset counter if navigations are not rapid
        navigationCountRef.current = 0;
      }
      
      lastNavigationTimeRef.current = now;
    };

    // Set up navigation timeout mechanism
    const startNavigationTimeout = (url: string) => {
      // Skip for homepage to avoid reload loop
      if (url === '/' || url === '') {
        return;
      }
      
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
          document.body.classList.remove('navigation-stuck');
          
          // Force state reset
          fixRouterState();
          
          // Trigger error notification
          showError('Navigation timed out. Try again or refresh the page if issues persist.', 'warning');
          
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
      // Skip adding navigation classes on homepage - to avoid reload issues
      const isHomepageNavigation = url === '/' || url === '';
      
      detectRapidNavigation();
      isNavigating.current = true;
      
      if (!isHomepageNavigation) {
        document.body.classList.add('loading-navigation');
        console.log('[RouterErrorGuard] Route change starting:', url);
        
        // Start navigation timeout
        startNavigationTimeout(url);
        
        // Add stuck class after a delay (will be removed on success)
        setTimeout(() => {
          if (isNavigating.current && !isHomepageNavigation) {
            document.body.classList.add('navigation-stuck');
          }
        }, 2000);
      }
    };
    
    const handleRouteChangeComplete = (url: string) => {
      isNavigating.current = false;
      document.body.classList.remove('loading-navigation');
      document.body.classList.remove('navigation-stuck');
      console.log('[RouterErrorGuard] Route change completed:', url);
      
      // Store last successful non-homepage route for recovery
      if (url !== '/' && url !== '') {
        lastValidPageRef.current = url;
      }
      
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
    
    // Anti-reload loop guard for homepage
    const reloadGuard = () => {
      // Only check on homepage
      if (router.pathname === '/') {
        // Logic to prevent reload loops on homepage
        const reloadCount = parseInt(sessionStorage.getItem('homepageReloadCount') || '0', 10);
        
        if (reloadCount > 5) {
          console.warn('[RouterErrorGuard] Detected potential reload loop on homepage');
          sessionStorage.setItem('homepageLoopPrevented', 'true');
          showError('Detected potential reload loop. Protection enabled.', 'warning');
        }
      }
    };
    
    // Call reload guard on mount
    reloadGuard();
    
    // Register router event handlers
    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);
    
    // Clean up router event handlers on unmount
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
      
      // Clear any pending timeouts
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [router]);
  
  // Reset the page if needed
  const handleResetPage = () => {
    window.location.reload();
  };
  
  // Provide the router error guard UI
  return (
    <>
      {children}
      
      {/* Reset button for navigation issues */}
      {showResetButton && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50">
          <p className="mb-2">Navigation issue detected.</p>
          <button 
            onClick={handleResetPage}
            className="px-4 py-2 bg-white text-red-600 rounded-md font-medium"
          >
            Reset Page
          </button>
        </div>
      )}
    </>
  );
};

export default RouterErrorGuard; 