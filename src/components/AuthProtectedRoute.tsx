import React, { useState, useEffect, ReactNode, useContext, useRef } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AuthProtectedRouteProps {
  children: ReactNode;
  fallbackUrl?: string;
  allowCorruptedState?: boolean;
}

/**
 * AuthProtectedRoute Component
 * 
 * Wraps routes that require authentication, with:
 * - Authentication check with timeout prevention
 * - Automatic redirect to login if not authenticated
 * - Loading state management
 * - Recovery from corrupted auth states
 * - Emergency reset options
 * 
 * IMPROVED VERSION: Prevents false redirects and provides more robust
 * authentication state verification
 * 
 * Usage:
 * <AuthProtectedRoute>
 *   <YourProtectedComponent />
 * </AuthProtectedRoute>
 */
const AuthProtectedRoute: React.FC<AuthProtectedRouteProps> = ({ 
  children, 
  fallbackUrl = '/auth/login',
  allowCorruptedState = false
}) => {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const { isAuthenticated, isLoading, user, userProfile, isStateCorrupted, forceSignOut, refreshSession } = auth || {};
  const [localLoading, setLocalLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  const [showEmergencyReset, setShowEmergencyReset] = useState(false);
  const redirectAttemptsRef = useRef(0);
  const previousPathRef = useRef<string | null>(null);

  // Check for potential redirect loop
  const isInRedirectLoop = () => {
    return redirectAttemptsRef.current > 2;
  };

  // Try to recover authentication state
  const attemptAuthRecovery = async () => {
    console.log('Attempting auth recovery for protected route');
    
    if (typeof refreshSession === 'function') {
      try {
        const refreshed = await refreshSession();
        if (refreshed) {
          console.log('Successfully refreshed auth session');
          return true;
        }
      } catch (err) {
        console.error('Error refreshing session during recovery:', err);
      }
    }
    
    return false;
  };

  useEffect(() => {
    // Store current path to detect navigation patterns
    if (router.asPath && router.asPath !== previousPathRef.current) {
      previousPathRef.current = router.asPath;
    }
    
    let timeoutId: NodeJS.Timeout | null = null;
    
    // Only start checking once the router is ready
    if (!router.isReady) return;

    // Handle corrupted state
    if (isStateCorrupted && !allowCorruptedState) {
      console.error('AuthProtectedRoute: Detected corrupted auth state, redirecting to login');
      setShowEmergencyReset(true);
      // If we haven't attempted recovery yet, try it
      if (!recoveryAttempted) {
        setRecoveryAttempted(true);
        const currentPath = router.asPath;
        // Store the current URL to redirect back after login
        if (currentPath !== fallbackUrl && !currentPath.includes('/auth/')) {
          sessionStorage.setItem('authRedirectPath', currentPath);
        }
        
        // Redirect to login
        if (!redirecting) {
          setRedirecting(true);
          redirectAttemptsRef.current += 1;
          router.push({
            pathname: fallbackUrl,
            query: { redirect: currentPath, state: 'corrupted' }
          });
        }
      }
      return;
    }

    if (!isLoading) {
      if (!isAuthenticated && !redirecting) {
        // Increment redirect attempts counter
        redirectAttemptsRef.current += 1;
        
        // Check if we're in a potential redirect loop
        if (isInRedirectLoop()) {
          console.warn('Potential redirect loop detected in AuthProtectedRoute');
          setShowEmergencyReset(true);
          
          // Attempt auth recovery as last resort
          attemptAuthRecovery().then(recovered => {
            if (!recovered) {
              // Force sign out to reset all state
              if (typeof forceSignOut === 'function') {
                console.log('Forcing sign out to break redirect loop');
                forceSignOut();
              }
            }
          });
          
          // Show loading temporarily 
          setLocalLoading(false);
          return;
        }
        
        console.log('User not authenticated, redirecting to', fallbackUrl);
        setRedirecting(true);
        
        const currentPath = router.asPath;
        // Store the current URL to redirect back after login
        if (currentPath !== fallbackUrl && !currentPath.includes('/auth/')) {
          sessionStorage.setItem('authRedirectPath', currentPath);
        }
        
        router.push({
          pathname: fallbackUrl,
          query: { redirect: currentPath }
        });
      } else if (isAuthenticated && (!user?.id || !userProfile) && !recoveryAttempted) {
        // If authenticated but missing data, try to recover once
        console.warn('Auth state inconsistent, attempting recovery');
        setRecoveryAttempted(true);
        setShowEmergencyReset(true);
        // Keep showing loading while we see if recovery works
        setLocalLoading(true);
        
        // Try to recover auth state
        attemptAuthRecovery().then(recovered => {
          // Set a timeout to prevent hanging if recovery fails
          timeoutId = setTimeout(() => {
            setLocalLoading(false);
            if (!recovered) {
              // If recovery failed and we're still in a broken state, show reset option
              setShowEmergencyReset(true);
            }
          }, 2000);
        });
      } else {
        // Authenticated or already redirecting
        // Reset redirect attempts counter on successful auth
        redirectAttemptsRef.current = 0;
        setLocalLoading(false);
      }
    } else {
      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        console.warn('Auth protection check timed out, forcing state resolution');
        setLocalLoading(false);
        setShowEmergencyReset(true);
        
        // If still no auth after timeout, check if we're in a loop
        if (!user && !redirecting) {
          redirectAttemptsRef.current += 1;
          
          // If potential loop, try recovery first
          if (isInRedirectLoop()) {
            attemptAuthRecovery().then(recovered => {
              if (!recovered) {
                // Only redirect if recovery failed
                setRedirecting(true);
                router.push(fallbackUrl);
              }
            });
          } else {
            // Otherwise just redirect
            setRedirecting(true);
            router.push(fallbackUrl);
          }
        }
      }, 3000); // 3 second timeout
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, isAuthenticated, router, fallbackUrl, user, userProfile, redirecting, recoveryAttempted, isStateCorrupted, allowCorruptedState, forceSignOut, refreshSession]);

  // Force recovery function for emergency use
  const forceRecovery = async () => {
    try {
      // First try session refresh
      if (typeof refreshSession === 'function') {
        const refreshed = await refreshSession();
        if (refreshed) {
          console.log('Emergency refresh successful');
          window.location.reload();
          return;
        }
      }
      
      // If refresh fails, force sign out
      if (typeof forceSignOut === 'function') {
        await forceSignOut();
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error in forceRecovery:', error);
      window.location.href = '/';
    }
  };

  // Show loading spinner while checking authentication
  if (localLoading || redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <LoadingSpinner size="lg" />
          {redirecting && <p className="mt-4 text-gray-600">Redirecting...</p>}
          
          {(showEmergencyReset && !redirecting) && (
            <button
              onClick={forceRecovery}
              className="mt-8 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Emergency Reset
            </button>
          )}
          
          {/* Add option to force continue if we detect a loop */}
          {isInRedirectLoop() && (
            <button
              onClick={() => {
                // Reset counters and flags
                redirectAttemptsRef.current = 0;
                setShowEmergencyReset(false);
                setLocalLoading(false);
                sessionStorage.removeItem('shouldReturnToProtectedRoute');
                sessionStorage.removeItem('homepageReloadCount');
              }}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Continue Anyway
            </button>
          )}
        </div>
      </div>
    );
  }

  // If authenticated, render the protected content with optional emergency reset button
  return (
    <>
      {children}
      
      {/* Only show emergency reset button if we have corruption but are allowing it */}
      {(showEmergencyReset && allowCorruptedState && isStateCorrupted) && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-lg flex items-center"
            onClick={forceRecovery}
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

export default AuthProtectedRoute; 