import '@/utils/nextjs-runtime-fix';
import '@/styles/globals.css';
import '@/styles/white-screen-fix.css';
import 'leaflet/dist/leaflet.css';
import '@/styles/leaflet-custom.css';
import '@/styles/homepage-enhancements.css';
import '@/styles/header-fix.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import ErrorBoundary from '@/components/ErrorBoundary';
import GlobalErrorHandler from '@/components/GlobalErrorHandler';
import RouterErrorGuard from '@/components/RouterErrorGuard';
import FallbackContent from '@/components/FallbackContent';
import { useEffect, useState } from 'react';
import { setupGlobalErrorHandlers } from '@/utils/errorHandling';
import { BookingProvider } from '@/context/BookingContext';
import { AuthProvider } from '@/context/AuthContext';
// Using require to bypass TypeScript errors for these modules
// @ts-ignore
const ErrorProvider = require('@/context/ErrorContext').ErrorProvider;
// @ts-ignore
const analytics = require('@/utils/analytics').default;
// @ts-ignore
const NextjsRouterLoader = require('@/components/NextjsRouterLoader').default;

// routerFixScript has been moved to _document.tsx

function SafeHydrate({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // If we're rendering on the server, return a simpler version
  if (!isClient) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }
  
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : children}
    </div>
  );
}

function CustomErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Caught in error boundary:", error);
      setHasError(true);
      setError(error.error);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return (
      <div style={{ 
        padding: '20px', 
        margin: '20px', 
        border: '1px solid red',
        borderRadius: '5px' 
      }}>
        <h1>Something went wrong.</h1>
        <p>Error: {error?.message || 'Unknown error'}</p>
        <button onClick={() => window.location.reload()}>
          Reload Page
        </button>
        <pre style={{ 
          marginTop: '20px', 
          padding: '10px', 
          background: '#f5f5f5', 
          overflow: 'auto',
          maxHeight: '200px' 
        }}>
          {error?.stack}
        </pre>
      </div>
    );
  }
  
  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  // Set up global error handlers when the app mounts
  useEffect(() => {
    setupGlobalErrorHandlers();

    // Register service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
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
  }, []);

  // Track page views
  useEffect(() => {
    analytics.trackPageView();
    
    // Mark content as loaded after a short delay to ensure components have rendered
    const timer = setTimeout(() => {
      document.body.classList.add('content-loaded');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeHydrate>
      <CustomErrorBoundary>
        <ErrorProvider>
          <AuthProvider>
            <BookingProvider>
              <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
                <meta name="description" content="The Travelling Technicians - Mobile phone and laptop repair with doorstep service in Vancouver, Burnaby & the Lower Mainland. Same-day repairs by certified technicians." />
                <meta name="theme-color" content="#0076be" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="192x192" href="/favicons/favicon-192x192.png" />
                <link rel="apple-touch-icon" href="/favicons/favicon-192x192.png" />
                <link rel="manifest" href="/manifest.json" />
                <title>The Travelling Technicians | Mobile Doorstep Repair Service</title>
              </Head>
              
              {/* Early error prevention scripts moved to _document.tsx */}
              {/* 
              <Script id=\"next-router-fix\" strategy=\"beforeInteractive\">
                {routerFixScript}
              </Script>
              
              <Script id=\"error-handler\" src=\"/error-handler.js\" strategy=\"beforeInteractive\" />
              */}
              
              <RouterErrorGuard>
                <NextjsRouterLoader />
                <GlobalErrorHandler />
                <Component {...pageProps} />
              </RouterErrorGuard>
            </BookingProvider>
          </AuthProvider>
        </ErrorProvider>
      </CustomErrorBoundary>
    </SafeHydrate>
  );
} 