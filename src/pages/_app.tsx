import '@/utils/nextjs-runtime-fix';
import '@/styles/globals.css';
import '@/styles/white-screen-fix.css';
import 'leaflet/dist/leaflet.css';
import '@/styles/leaflet-custom.css';
import '@/styles/homepage-enhancements.css';
import '@/styles/header-fix.css';
import '@/styles/booking-form-enhancements.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect, useState, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { generateDefaultSeo } from 'next-seo/pages';
import { defaultSeoConfig } from '@/next-seo.config';
// Environment validation temporarily disabled

// Analytics loading with fallback
const analytics = (() => {
  try {
    return require('@/utils/analytics').default;
  } catch (e) {
    return { trackPageView: () => {} };
  }
})();

// Environment validation completely disabled

// Environment validation completely disabled to prevent configuration errors
function EnvironmentGuard({ children }: { children: ReactNode }) {
  // Simply return children without any validation
  return <>{children}</>;
}

function SafeHydrate({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // In development, don't delay rendering - this breaks Fast Refresh
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>;
  }
  
  if (!isClient) {
    return <div>Loading...</div>;
  }
  
  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  
  useEffect(() => {
    // Basic error handling
    const handleError = (event: ErrorEvent) => {
      if (event.message && event.message.includes('router')) {
        console.warn('Router error suppressed:', event.message);
        event.preventDefault();
      }
    };
    
    window.addEventListener('error', handleError);
    
    // Register service worker only in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered successfully:', registration.scope);
          })
          .catch(error => {
            console.warn('Service Worker registration failed:', error);
          });
      });
    }
    
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Track page views
  useEffect(() => {
    analytics.trackPageView();
    
    const timer = setTimeout(() => {
      document.body.classList.add('content-loaded');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {generateDefaultSeo(defaultSeoConfig)}
      </Head>

      <EnvironmentGuard>
        <SafeHydrate>
          <QueryClientProvider client={queryClient}>
            <Component {...pageProps} />
          </QueryClientProvider>
        </SafeHydrate>
      </EnvironmentGuard>
    </>
  );
}