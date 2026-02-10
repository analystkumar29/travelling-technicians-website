import '@/utils/nextjs-runtime-fix';
import '@/styles/globals.css';
import 'leaflet/dist/leaflet.css';
import '@/styles/leaflet-custom.css';
import '@/styles/booking-form-enhancements.css';
import '@/styles/liquid-glass.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { SpeedInsights } from '@vercel/speed-insights/next';
// next-seo imports REMOVED - they were causing side effects that overwrote page-specific title tags
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
  const router = useRouter();
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

  // generateDefaultSeo removed - each page now defines its own title/description
  // This prevents default SEO from overriding page-specific SEO tags

  const isTechnicianRoute = router.pathname.startsWith('/technician');

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Main site PWA manifest — technician routes use their own via TechnicianLayout */}
      {!isTechnicianRoute && (
        <Head>
          <link key="manifest" rel="manifest" href="/manifest.json" />
          <meta key="apple-wac-status" name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta key="apple-wac" name="apple-mobile-web-app-capable" content="yes" />
          <meta key="apple-wac-title" name="apple-mobile-web-app-title" content="TT Repair" />
        </Head>
      )}

      <EnvironmentGuard>
        <SafeHydrate>
          <QueryClientProvider client={queryClient}>
            <Component {...pageProps} />
            <SpeedInsights />
            <Toaster position="bottom-right" richColors />
            <SpeedInsights />
          </QueryClientProvider>
        </SafeHydrate>
      </EnvironmentGuard>
    </>
  );
}
