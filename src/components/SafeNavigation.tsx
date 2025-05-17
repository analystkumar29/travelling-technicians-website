import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { logger } from '@/utils/logger';

// Create module logger
const navigationLogger = logger?.createModuleLogger 
  ? logger.createModuleLogger('SafeNavigation') 
  : { debug: console.debug, error: console.error };

/**
 * Component to handle safe navigation and prevent "Cannot read properties of undefined" errors
 * This is a silent component that adds event listeners to the router
 */
export const SafeNavigation: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // When routes change, unregister service workers to prevent caching issues
    const handleRouteChange = (url: string) => {
      navigationLogger.debug(`Route changing to: ${url}`);
      
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach(registration => {
            navigationLogger.debug(`Unregistering service worker for safe navigation`);
            registration.unregister();
          });
        }).catch(err => {
          navigationLogger.error('Error unregistering service workers:', err);
        });
      }
    };

    const handleRouteChangeError = (err: Error, url: string) => {
      navigationLogger.error(`Error navigating to ${url}:`, err);
      
      // Force an MPA (Multi-Page Application) navigation instead of client-side navigation
      // This helps in situations where client-side navigation might be causing issues
      if (err.message.includes('data') || err.message.includes('undefined')) {
        navigationLogger.debug(`Forcing MPA navigation to: ${url}`);
        window.location.href = url;
      }
    };

    // Subscribe to router events
    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeError', handleRouteChangeError);
    
    return () => {
      // Unsubscribe from router events when component unmounts
      router.events.off('routeChangeStart', handleRouteChange);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router]);

  // This component doesn't render anything
  return null;
};

export default SafeNavigation; 