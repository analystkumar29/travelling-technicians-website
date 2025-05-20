import { useCallback, useContext, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '@/context/AuthContext';
import useSafeRouter from './useSafeRouter';

/**
 * Custom hook for safe authenticated navigation
 * 
 * This hook provides navigation utilities specifically designed for authenticated routes,
 * with built-in protection against common issues like:
 * - Redirect loops
 * - Navigation to protected routes when not authenticated
 * - Incorrect redirects when authentication state is uncertain
 * 
 * It builds on top of useSafeRouter to provide additional auth-specific protections.
 */
export function useAuthNavigation() {
  const safeRouter = useSafeRouter();
  const auth = useContext(AuthContext);
  const { isAuthenticated, isLoading, refreshSession } = auth || {};
  const navigationAttemptsRef = useRef<Record<string, number>>({});
  const router = useRouter();
  
  // Reset navigation attempts when path changes
  useEffect(() => {
    const currentPath = router.asPath;
    // When we successfully navigate to a new path, reset the attempt counter for that path
    if (currentPath && Object.keys(navigationAttemptsRef.current).includes(currentPath)) {
      navigationAttemptsRef.current[currentPath] = 0;
    }
  }, [router.asPath]);
  
  /**
   * Safely navigate to an authenticated route with protection against redirect loops
   */
  const navigateToProtectedRoute = useCallback(async (
    path: string, 
    options?: { 
      shallow?: boolean; 
      refreshAuthFirst?: boolean;
      fallbackUrl?: string;
    }
  ) => {
    // Keep track of navigation attempts to this path
    if (!navigationAttemptsRef.current[path]) {
      navigationAttemptsRef.current[path] = 0;
    }
    
    // Increment attempt counter
    navigationAttemptsRef.current[path]++;
    
    // Check for potential loop or issues
    if (navigationAttemptsRef.current[path] > 3) {
      console.warn(`Multiple navigation attempts detected to ${path}, possible redirect loop`);
      
      // Try to force auth refresh
      if (typeof refreshSession === 'function') {
        try {
          console.log('Attempting session refresh before navigation');
          const refreshed = await refreshSession();
          if (refreshed) {
            console.log('Successfully refreshed session before navigation');
            // Reset counter after successful refresh
            navigationAttemptsRef.current[path] = 0;
          } else {
            console.warn('Session refresh failed, redirecting to fallback');
            // If refresh fails, redirect to fallback
            if (options?.fallbackUrl) {
              return safeRouter.push(options.fallbackUrl);
            }
            return false;
          }
        } catch (err) {
          console.error('Error refreshing session:', err);
          return false;
        }
      }
    }
    
    // Optional auth refresh before navigation
    if (options?.refreshAuthFirst && typeof refreshSession === 'function') {
      try {
        await refreshSession();
      } catch (err) {
        console.error('Error refreshing session before navigation:', err);
      }
    }
    
    // Only navigate to protected routes if authenticated
    const protectedPaths = [
      '/account',
      '/my-bookings',
      '/my-warranties',
      '/profile',
      '/bookings'
    ];
    
    const isProtectedPath = protectedPaths.some(protectedPath => 
      path.startsWith(protectedPath) || path === protectedPath
    );
    
    if (isProtectedPath) {
      // Skip navigation check if we're already loading auth state
      if (isLoading) {
        console.log('Auth state is loading, deferring navigation');
        
        // Store intended destination for later
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('authRedirectPath', path);
        }
        
        return false;
      }
      
      // Check authentication before navigating
      if (!isAuthenticated) {
        console.log(`Not authenticated, cannot navigate to protected route: ${path}`);
        
        // Store intended destination for after login
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('authRedirectPath', path);
        }
        
        // Redirect to login or fallback
        if (options?.fallbackUrl) {
          return safeRouter.push(options.fallbackUrl);
        }
        
        return safeRouter.push(`/auth/login?redirect=${encodeURIComponent(path)}`);
      }
    }
    
    // Safe navigation with the protected router
    try {
      // Mark navigation in progress to prevent loops
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('navigationInProgress', 'true');
      }
      
      // Perform the navigation
      const result = await safeRouter.push(path, undefined, { 
        shallow: options?.shallow 
      });
      
      // Navigation successful
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('navigationInProgress');
      }
      
      // Reset navigation counter on success
      navigationAttemptsRef.current[path] = 0;
      
      return result;
    } catch (error) {
      console.error(`Error navigating to ${path}:`, error);
      
      // Clear navigation in progress
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('navigationInProgress');
      }
      
      return false;
    }
  }, [isAuthenticated, isLoading, refreshSession, safeRouter]);
  
  /**
   * Safely navigate to account page
   */
  const navigateToAccount = useCallback(() => {
    return navigateToProtectedRoute('/account', { 
      refreshAuthFirst: true,
      fallbackUrl: '/auth/login?redirect=%2Faccount'
    });
  }, [navigateToProtectedRoute]);
  
  /**
   * Safely navigate to bookings page
   */
  const navigateToBookings = useCallback(() => {
    return navigateToProtectedRoute('/my-bookings', { 
      refreshAuthFirst: true,
      fallbackUrl: '/auth/login?redirect=%2Fmy-bookings'
    });
  }, [navigateToProtectedRoute]);
  
  /**
   * Safely navigate to warranties page
   */
  const navigateToWarranties = useCallback(() => {
    return navigateToProtectedRoute('/my-warranties', { 
      refreshAuthFirst: true,
      fallbackUrl: '/auth/login?redirect=%2Fmy-warranties'
    });
  }, [navigateToProtectedRoute]);
  
  /**
   * Safely navigate to profile page
   */
  const navigateToProfile = useCallback(() => {
    return navigateToProtectedRoute('/profile', { 
      refreshAuthFirst: true,
      fallbackUrl: '/auth/login?redirect=%2Fprofile'
    });
  }, [navigateToProtectedRoute]);
  
  /**
   * Force recover navigation state and try to navigate
   */
  const forceNavigate = useCallback((path: string) => {
    // Clear any navigation blockers
    if (typeof window !== 'undefined') {
      // Clear all navigation flags
      sessionStorage.removeItem('navigationInProgress');
      sessionStorage.removeItem('homepageReloadCount');
      sessionStorage.removeItem('homepageLoopPrevented');
      sessionStorage.removeItem('skipHomepageChecks');
      
      // Reset navigation counters
      navigationAttemptsRef.current = {};
      
      // Attempt direct navigation
      window.location.href = path;
    }
  }, []);
  
  return {
    navigateToProtectedRoute,
    navigateToAccount,
    navigateToBookings,
    navigateToWarranties,
    navigateToProfile,
    forceNavigate,
    ...safeRouter
  };
}

export default useAuthNavigation; 