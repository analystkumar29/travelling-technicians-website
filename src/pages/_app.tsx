import '@/utils/nextjs-runtime-fix';
import '@/styles/globals.css';
import '@/styles/white-screen-fix.css';
import 'leaflet/dist/leaflet.css';
import '@/styles/leaflet-custom.css';
import '@/styles/homepage-enhancements.css';
import '@/styles/header-fix.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Analytics loading with fallback
const analytics = (() => {
  try {
    return require('@/utils/analytics').default;
  } catch (e) {
    return { trackPageView: () => {} };
  }
})();

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
        <title>The Travelling Technicians | Mobile & Laptop Repair</title>
        <meta name="description" content="Expert mobile phone and laptop repair with convenient doorstep service across the Lower Mainland, BC. Same-day service available with 1-year warranty." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Favicon Configuration */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0d9488" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicons/favicon-192x192.png" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
      </Head>

      <SafeHydrate>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </SafeHydrate>
    </>
  );
} 