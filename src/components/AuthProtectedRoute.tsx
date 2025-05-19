import React, { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AuthProtectedRouteProps {
  children: ReactNode;
  fallbackUrl?: string;
}

/**
 * AuthProtectedRoute Component
 * 
 * Wraps routes that require authentication, with:
 * - Authentication check with timeout prevention
 * - Automatic redirect to login if not authenticated
 * - Loading state management
 * 
 * Usage:
 * <AuthProtectedRoute>
 *   <YourProtectedComponent />
 * </AuthProtectedRoute>
 */
const AuthProtectedRoute: React.FC<AuthProtectedRouteProps> = ({ 
  children, 
  fallbackUrl = '/auth/login' 
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    // Only start checking once the router is ready
    if (!router.isReady) return;

    if (!isLoading) {
      if (!isAuthenticated && !redirecting) {
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
      } else {
        // Authenticated or already redirecting
        setLocalLoading(false);
      }
    } else {
      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        console.warn('Auth protection check timed out, forcing state resolution');
        setLocalLoading(false);
        
        // If still no auth after timeout, redirect
        if (!user && !redirecting) {
          setRedirecting(true);
          router.push(fallbackUrl);
        }
      }, 3000); // 3 second timeout
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, isAuthenticated, router, fallbackUrl, user, redirecting]);

  // Show loading spinner while checking authentication
  if (localLoading || redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default AuthProtectedRoute; 