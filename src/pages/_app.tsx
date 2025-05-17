import '@/utils/nextjs-runtime-fix';
import '@/styles/globals.css';
import '@/styles/white-screen-fix.css';
import 'leaflet/dist/leaflet.css';
import '@/styles/leaflet-custom.css';
import type { AppProps } from 'next/app';
import { Inter, Poppins } from 'next/font/google';
import Head from 'next/head';
import Script from 'next/script';
import ErrorBoundary from '@/components/ErrorBoundary';
import GlobalErrorHandler from '@/components/GlobalErrorHandler';
import RouterErrorGuard from '@/components/RouterErrorGuard';
import FallbackContent from '@/components/FallbackContent';
import { useEffect } from 'react';
import { setupGlobalErrorHandlers } from '@/utils/errorHandling';
import { BookingProvider } from '@/context/BookingContext';
import { ErrorProvider } from '@/context/ErrorContext';
import analytics from '@/utils/analytics';
import NextjsRouterLoader from '@/components/NextjsRouterLoader';

// Import font configurations with fallbacks
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
  preload: false,
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
  preload: false,
});

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
    <ErrorProvider>
      <BookingProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <meta name="description" content="The Travelling Technicians - Mobile phone and laptop repair with doorstep service in Vancouver, Burnaby & the Lower Mainland. Same-day repairs by certified technicians." />
          <meta name="theme-color" content="#0076be" />
          <link rel="icon" href="/favicon.ico" />
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
  );
} 