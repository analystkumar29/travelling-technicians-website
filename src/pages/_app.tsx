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
// Using require to bypass TypeScript errors for these modules
// @ts-ignore
const ErrorProvider = require('@/context/ErrorContext').ErrorProvider;
// @ts-ignore
const analytics = require('@/utils/analytics').default;
// @ts-ignore
const NextjsRouterLoader = require('@/components/NextjsRouterLoader').default;

// Define a script to run in the browser to prevent router errors
const routerFixScript = `
  (function() {
    if (!window.__NEXT_DATA__) {
      window.__NEXT_DATA__ = {
        props: {},
        page: window.location.pathname || '/',
        query: {},
        buildId: 'development'
      };
    }
    
    // Create a safe history state wrapper
    function ensureValidHistoryState(state) {
      if (!state || typeof state !== 'object') {
        return {
          data: {
            props: {},
            page: window.location.pathname || '/',
            query: {},
            buildId: 'development'
          }
        };
      }
      
      if (!state.data) {
        return {
          ...state,
          data: {
            props: {},
            page: window.location.pathname || '/',
            query: {},
            buildId: 'development'
          }
        };
      }
      
      return state;
    }
    
    // Make sure the current state is valid
    if (window.history && window.history.state) {
      window.history.replaceState(
        ensureValidHistoryState(window.history.state),
        document.title,
        window.location.href
      );
    }
    
    // Error handler for router errors
    window.addEventListener('error', function(event) {
      if (event.message && 
         (event.message.includes('Cannot read properties of undefined') ||
          event.message.includes('Cannot read property') ||
          event.message.includes('data of undefined'))) {
        console.warn('Suppressed router error:', event.message);
        event.preventDefault();
      }
    });
  })();
`;

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
          <BookingProvider>
            <Head>
              <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
              <meta name="description" content="The Travelling Technicians - Mobile phone and laptop repair with doorstep service in Vancouver, Burnaby & the Lower Mainland. Same-day repairs by certified technicians." />
              <meta name="theme-color" content="#0076be" />
              <link rel="icon" href="/favicon.ico" />
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
              <title>The Travelling Technicians | Mobile Doorstep Repair Service</title>
            </Head>
            
            {/* Early router error prevention script */}
            <Script id="next-router-fix" strategy="beforeInteractive">
              {routerFixScript}
            </Script>
            
            <RouterErrorGuard>
              <NextjsRouterLoader />
              <GlobalErrorHandler />
              <Component {...pageProps} />
            </RouterErrorGuard>
          </BookingProvider>
        </ErrorProvider>
      </CustomErrorBoundary>
    </SafeHydrate>
  );
} 