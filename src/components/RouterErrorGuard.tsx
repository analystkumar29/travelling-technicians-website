import { useEffect, useRef, ReactNode, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { showError } from './GlobalErrorHandler';
import { AuthContext } from '@/context/AuthContext';

/**
 * RouterErrorGuard component
 * 
 * This component applies additional protection against Next.js router errors by:
 * 1. Monitoring route changes and applying fixes
 * 2. Re-enabling suppressed functionality after errors
 * 3. Catching and properly handling navigation errors
 * 4. Adding timeout mechanism for stalled navigation
 * 5. Detecting corrupted auth states during navigation
 * 6. Providing emergency reset options
 * 
 * FIXED VERSION: Prevents false positives in reload loop detection
 * and improves handling of protected routes
 */
interface RouterErrorGuardProps {
  children: ReactNode;
}

const RouterErrorGuard: React.FC<RouterErrorGuardProps> = ({ children }) => {
  const router = useRouter();
  const [hasError, setHasError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [showResetButton, setShowResetButton] = useState(false);
  
  const auth = useContext(AuthContext);
  const { isAuthenticated, isLoading, isStateCorrupted, forceSignOut, isFetchingProfile } = auth || {};
  const isNavigating = useRef(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  const navigationCountRef = useRef(0);
  const lastNavigationTimeRef = useRef(Date.now());
  const [showEmergencyReset, setShowEmergencyReset] = useState(false);
  const lastValidPageRef = useRef<string | null>(null);
  
  // Handle corrupted auth state - SKIP ON HOMEPAGE
  useEffect(() => {
    // Only show errors and emergency reset on non-homepage routes
    const isHomepage = router.pathname === '/' || router.pathname === '';
    
    // Do not show corruption errors if profile is still fetching
    if (isFetchingProfile) {
      setShowEmergencyReset(false);
      return;
    }
    
    if (isStateCorrupted && !isHomepage) {
      console.error('[RouterErrorGuard] Detected corrupted auth state');
      showError('Authentication state is corrupted. Try signing out and in again, or use the emergency reset.', 'error');
      setShowEmergencyReset(true);
    } else if (!isStateCorrupted) {
      setShowEmergencyReset(false);
    }
  }, [isStateCorrupted, router.pathname, isFetchingProfile]);

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
          console.error('[RouterErrorGuard] Detected rapid navigation pattern, possible router or auth issue');
          setShowEmergencyReset(true);
          showError('Navigation issues detected. Try using the emergency reset button.', 'warning');
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
          
          // Show emergency reset option if in a protected route
          if (url.includes('/account/') || url.includes('/bookings/') || url.includes('/profile/')) {
            setShowEmergencyReset(true);
          }
          
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
      
      // Reset emergency reset option on successful navigation to non-homepage
      if (url !== '/' && url !== '') {
        setShowEmergencyReset(false);
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
      
      // Skip showing reset on homepage
      const isHomepageNavigation = url === '/' || url === '';
      
      // Check for pattern of navigation to protected routes while auth is possibly broken
      if (isAuthenticated && !isHomepageNavigation && (url.includes('/account/') || url.includes('/profile/') || url.includes('/bookings/'))) {
        console.warn('[RouterErrorGuard] Error navigating to protected route while authenticated');
        setShowEmergencyReset(true);
      }
      
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
    
    // Anti-reload loop guard for homepage - IMPROVED VERSION
    const reloadGuard = () => {
      // Only check on homepage
      if (router.pathname === '/') {
        // Get the previous path from sessionStorage
        const previousPath = sessionStorage.getItem('previousPath') || '';
        const currentPath = router.pathname;
        
        // Check if we're coming from a protected path like /account or /profile
        const isComingFromProtectedPath = 
          previousPath.includes('/account') || 
          previousPath.includes('/profile') || 
          previousPath.includes('/bookings');
        
        // If coming from protected path and we're authenticated, this is likely a false positive
        if (isComingFromProtectedPath && isAuthenticated && !isLoading && !isFetchingProfile) {
          console.log('[RouterErrorGuard] Coming from protected path while authenticated (and profile not fetching), not counting as reload loop');
          // Prevent this from being counted as part of a reload loop
          sessionStorage.setItem('homepageReloadCount', '0');
          // Store a flag to indicate we should redirect back to the protected route
          sessionStorage.setItem('shouldReturnToProtectedRoute', 'true');
          return;
        }
        
        // Normal reload loop detection logic
        const reloads = parseInt(sessionStorage.getItem('homepageReloadCount') || '0', 10);
        sessionStorage.setItem('homepageReloadCount', (reloads + 1).toString());
        
        // Only consider it a loop if we have multiple reloads
        if (reloads > 2) {
          console.warn('[RouterErrorGuard] Potential reload loop on homepage, disabling guards');
          
          // Disable classes that might cause issues
          document.body.classList.remove('loading-navigation');
          document.body.classList.remove('navigation-stuck');
          document.body.classList.remove('auth-corrupted');
          
          // Remove all navigation-related event listeners and timeouts
          if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
            navigationTimeoutRef.current = null;
          }

          // Force reset navigation state
          isNavigating.current = false;
          
          // Skip any further state corruption checks on homepage
          sessionStorage.setItem('skipHomepageChecks', 'true');
          
          // Completely prevent any further reloads by setting a flag
          sessionStorage.setItem('homepageLoopPrevented', 'true');
          
          // If authenticated and we have a lastValidPage, try redirecting back
          if (isAuthenticated && lastValidPageRef.current) {
            console.log(`[RouterErrorGuard] Attempting to recover by redirecting to last valid page: ${lastValidPageRef.current}`);
            // Use a timeout to allow state to settle
            setTimeout(() => {
              router.push(lastValidPageRef.current || '/account');
            }, 500);
          }
        }
      } else {
        // Not on homepage, store the current path and reset the counter
        sessionStorage.setItem('previousPath', router.pathname);
        sessionStorage.setItem('homepageReloadCount', '0');
        sessionStorage.removeItem('homepageLoopPrevented');
      }
    };
    
    // Call reload guard immediately
    reloadGuard();
    
    // Check if we should redirect back to protected route
    if (router.pathname === '/' && sessionStorage.getItem('shouldReturnToProtectedRoute') === 'true' && isAuthenticated && !isLoading && !isFetchingProfile) {
      // Clear the flag
      sessionStorage.removeItem('shouldReturnToProtectedRoute');
      
      // Try to return to the last valid protected page or default to account page
      const lastProtectedPage = lastValidPageRef.current || sessionStorage.getItem('previousPath') || '/account';
      console.log(`[RouterErrorGuard] Returning to protected route: ${lastProtectedPage}`);
      
      // Use a timeout to allow state to settle
      setTimeout(() => {
        router.push(lastProtectedPage);
      }, 500);
    }
    
    // Subscribe to router events
    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);
    
    // Apply patches on visibility change
    document.addEventListener('visibilitychange', fixRouterState);
    
    // Add a global emergency reset function
    if (typeof window !== 'undefined') {
      (window as any).__resetAuthState = async () => {
        console.log('[RouterErrorGuard] Emergency reset triggered');
        try {
          if (forceSignOut) {
            await forceSignOut();
            return true;
          } else {
            // Fallback
            window.location.href = '/';
            return false;
          }
        } catch (e) {
          console.error('[RouterErrorGuard] Emergency reset failed:', e);
          // Last resort - hard reload
          window.location.href = '/';
          return false;
        }
      };

      // Add global navigation recovery function
      (window as any).__recoverNavigation = () => {
        console.log('[RouterErrorGuard] Navigation recovery triggered');
        // Clear all status flags
        sessionStorage.removeItem('homepageLoopPrevented');
        sessionStorage.removeItem('homepageReloadCount');
        sessionStorage.removeItem('skipHomepageChecks');
        
        // Fix DOM state
        document.body.classList.remove('loading-navigation');
        document.body.classList.remove('navigation-stuck');
        document.body.classList.remove('auth-corrupted');
        
        // Reset navigation state
        isNavigating.current = false;
        
        // Clear timeouts
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
          navigationTimeoutRef.current = null;
        }
        
        console.log('Navigation recovery complete');
      };
    }
    
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
      
      // Keep global emergency reset and recovery function
    };
  }, [router, isAuthenticated, isLoading, forceSignOut, isFetchingProfile]);
  
  // Return the children with optional emergency reset button
  // Only show emergency reset on non-homepage
  const isHomepage = router.pathname === '/';
  
  return (
    <>
      {children}
      
      {/* Emergency Reset Button (shown only when issues detected and NOT on homepage) */}
      {showEmergencyReset && !isHomepage && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-lg flex items-center"
            onClick={() => forceSignOut ? forceSignOut() : window.location.href = '/'}
            aria-label="Emergency Reset"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Reset Auth
          </button>
        </div>
      )}
    </>
  );
};

export default RouterErrorGuard; 