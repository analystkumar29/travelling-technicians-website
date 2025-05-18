import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { safeRouterAccess } from '@/utils/errorHandling';

/**
 * A safer version of Next.js useRouter that prevents "Cannot read property of undefined" errors
 * by providing default values and handling edge cases
 */
export function useSafeRouter() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(router.isReady);
  
  // Provide defaults for all router properties to avoid undefined errors
  const safeRouter = useMemo(() => {
    return {
      ...router,
      query: router.query || {},
      pathname: router.pathname || '',
      asPath: router.asPath || '',
      basePath: router.basePath || '',
      locale: router.locale || '',
      locales: router.locales || [],
      defaultLocale: router.defaultLocale || '',
      isReady: isReady,
      // Safely wrap functions to prevent undefined errors
      push: (...args: Parameters<typeof router.push>) => {
        try {
          return router.push?.(...args) || Promise.reject(new Error('Router not available'));
        } catch (error) {
          console.error('Error in safeRouter.push:', error);
          return Promise.reject(error);
        }
      },
      replace: (...args: Parameters<typeof router.replace>) => {
        try {
          return router.replace?.(...args) || Promise.reject(new Error('Router not available'));
        } catch (error) {
          console.error('Error in safeRouter.replace:', error);
          return Promise.reject(error);
        }
      },
      back: () => {
        try {
          if (typeof router.back === 'function') {
            router.back();
          }
          return undefined;
        } catch (error) {
          console.error('Error in safeRouter.back:', error);
          return undefined;
        }
      },
      // Add any other methods here with safe wrappers
    };
  }, [router, isReady]);
  
  // Update isReady when router becomes ready
  useEffect(() => {
    if (!isReady && router.isReady) {
      setIsReady(true);
    }
  }, [router.isReady, isReady]);
  
  // Safely get query parameters
  const getQuery = useMemo(() => {
    return safeRouterAccess(() => safeRouter.query, {});
  }, [safeRouter.query]);
  
  // Safely get all query parameters
  const getAllQueryParams = useMemo(() => {
    return safeRouterAccess(() => safeRouter.query, {});
  }, [safeRouter.query]);
  
  // Safely get pathname
  const getPathname = useMemo(() => {
    return safeRouterAccess(() => safeRouter.pathname, '/');
  }, [safeRouter.pathname]);
  
  // Safely check if page is ready
  const isReadySafe = useMemo(() => {
    return safeRouterAccess(() => safeRouter.isReady, false);
  }, [safeRouter.isReady]);
  
  // Safely navigate
  const safePush = useMemo(() => {
    return safeRouterAccess(() => safeRouter.push, (...args: Parameters<typeof safeRouter.push>) => {
      console.error('Router not available');
      return Promise.reject(new Error('Router not available'));
    });
  }, [safeRouter.push]);
  
  // Safely replace current route
  const safeReplace = useMemo(() => {
    return safeRouterAccess(() => safeRouter.replace, (...args: Parameters<typeof safeRouter.replace>) => {
      console.error('Router not available');
      return Promise.reject(new Error('Router not available'));
    });
  }, [safeRouter.replace]);
  
  // Safely go back
  const safeBack = useMemo(() => {
    return safeRouterAccess(() => safeRouter.back, () => {
      console.error('Router not available');
      return undefined;
    });
  }, [safeRouter.back]);
  
  return {
    // Safe accessor methods
    getQuery,
    getAllQueryParams,
    getPathname,
    isReady: isReadySafe,
    
    // Safe navigation methods
    push: safePush,
    replace: safeReplace,
    back: safeBack,
    
    // Original router (use with caution)
    router: safeRouter
  };
}

export default useSafeRouter; 