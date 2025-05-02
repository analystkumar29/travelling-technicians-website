import '@/styles/globals.css';
import 'leaflet/dist/leaflet.css';
import '@/styles/leaflet-custom.css';
import type { AppProps } from 'next/app';
import { Inter, Poppins } from 'next/font/google';
import Head from 'next/head';
import ErrorBoundary from '@/components/ErrorBoundary';
import GlobalErrorHandler from '@/components/GlobalErrorHandler';
import { useEffect } from 'react';
import { setupGlobalErrorHandlers } from '@/utils/errorHandling';
import { BookingProvider } from '@/context/BookingContext';

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

export default function App({ Component, pageProps }: AppProps) {
  // Set up global error handlers when the app mounts
  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>The Travelling Technicians | Mobile & Laptop Repair at Your Doorstep</title>
        <meta name="description" content="Expert mobile phone and laptop repair services right at your doorstep across the Lower Mainland, BC. Book online for convenient tech repair that comes to you." />
      </Head>
      <BookingProvider>
        <div className={`${inter.variable} ${poppins.variable}`}>
          <ErrorBoundary>
            <Component {...pageProps} />
            <GlobalErrorHandler />
          </ErrorBoundary>
        </div>
      </BookingProvider>
    </>
  );
} 