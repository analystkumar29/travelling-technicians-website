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
import { validateEnvironmentSafe, EnvironmentValidationError } from '@/utils/validateEnvironment';

// Analytics loading with fallback
const analytics = (() => {
  try {
    return require('@/utils/analytics').default;
  } catch (e) {
    return { trackPageView: () => {} };
  }
})();

// Environment error display component
function EnvironmentError({ error }: { error: EnvironmentValidationError }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#fef2f2',
      color: '#991b1b'
    }}>
      <div style={{
        maxWidth: '600px',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #fecaca'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: '#dc2626'
        }}>
          ⚠️ Configuration Error
        </h1>
        
        <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
          The application cannot start due to missing or invalid environment configuration.
        </p>
        
        {error.missingVars.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Missing Environment Variables:
            </h3>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
              {error.missingVars.map(varName => (
                <li key={varName} style={{ marginBottom: '0.25rem' }}>
                  <code style={{ 
                    backgroundColor: '#fee2e2', 
                    padding: '0.125rem 0.25rem', 
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem'
                  }}>
                    {varName}
                  </code>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {error.devFallbacksInProduction.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Development Fallbacks in Production:
            </h3>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
              {error.devFallbacksInProduction.map(varName => (
                <li key={varName} style={{ marginBottom: '0.25rem' }}>
                  <code style={{ 
                    backgroundColor: '#fee2e2', 
                    padding: '0.125rem 0.25rem', 
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem'
                  }}>
                    {varName}
                  </code>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          backgroundColor: '#f9fafb', 
          borderRadius: '0.25rem',
          fontSize: '0.875rem',
          lineHeight: '1.5'
        }}>
          <strong>For Developers:</strong><br/>
          1. Check your <code>.env.local</code> file<br/>
          2. Ensure all required environment variables are set<br/>
          3. Restart the development server after making changes<br/>
          4. For production, verify environment variables in your hosting platform
        </div>
      </div>
    </div>
  );
}

// Environment validation wrapper
function EnvironmentGuard({ children }: { children: ReactNode }) {
  const [envValidation, setEnvValidation] = useState<{
    isValid: boolean;
    error?: EnvironmentValidationError;
    isChecked: boolean;
  }>({ isValid: true, isChecked: false });
  
  useEffect(() => {
    // Only validate on client-side to avoid build-time issues
    if (typeof window !== 'undefined') {
      const result = validateEnvironmentSafe();
      setEnvValidation({
        isValid: result.isValid,
        error: result.error,
        isChecked: true
      });
    }
  }, []);
  
  // Show loading during validation
  if (!envValidation.isChecked) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div>Initializing...</div>
      </div>
    );
  }
  
  // Show error if validation failed
  if (!envValidation.isValid && envValidation.error) {
    return <EnvironmentError error={envValidation.error} />;
  }
  
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
        <title>The Travelling Technicians | Mobile & Laptop Repair</title>
        <meta name="description" content="Expert mobile phone and laptop repair with convenient doorstep service across the Lower Mainland, BC. Same-day service available with 1-year warranty." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Favicon Configuration */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#075985" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicons/favicon-192x192.png" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
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