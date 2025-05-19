import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '@/utils/supabaseClient';

const AuthCallbackPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle the authentication callback
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback triggered');
        setLoading(true);
        
        // Check for code in query parameters (Supabase PKCE flow)
        if (router.query.code) {
          console.log('Detected code parameter:', router.query.code);
          
          try {
            // Exchange the code for a session - this happens automatically in Supabase v2
            // We just wait for the session to be established
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('Auth callback error with code:', error);
              setError(error.message);
              setLoading(false);
              router.push('/auth/login?error=' + encodeURIComponent('Unable to verify your account. Please try logging in.'));
              return;
            }
            
            if (data && data.session) {
              console.log('Session established successfully');
              // Redirect to login with verified flag
              router.push('/auth/login?verified=true');
              return;
            } else {
              console.warn('No session established with code');
              setError('No session was established. Please try logging in.');
              setLoading(false);
            }
          } catch (err) {
            console.error('Error processing auth code:', err);
            setError(err instanceof Error ? err.message : 'Error processing authentication code');
            setLoading(false);
          }
        } 
        // Check for hash fragments (older auth flow)
        else if (window.location.hash && window.location.hash.includes('access_token')) {
          console.log('Detected hash with access_token');
          
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth callback error with hash:', error);
            setError(error.message);
            setLoading(false);
            router.push('/auth/login?error=' + encodeURIComponent('Unable to verify your account. Please try logging in.'));
            return;
          }
          
          if (data && data.session) {
            console.log('Session established successfully with hash');
            // Redirect to login with verified flag
            router.push('/auth/login?verified=true');
            return;
          }
        } 
        // Handle password reset confirmation
        else if (router.query.type === 'recovery') {
          console.log('Detected recovery parameter');
          router.push('/auth/reset-password');
          return;
        }
        // Default fallback - check for a stored redirect
        else {
          console.log('No auth parameters detected, checking for stored redirect');
          let redirectPath = '/auth/login';
          try {
            // Try to get a stored redirect path from session storage
            const storedRedirect = typeof window !== 'undefined' ? sessionStorage.getItem('authRedirectAfterCallback') : null;
            if (storedRedirect) {
              redirectPath = storedRedirect;
              // Clear the stored redirect
              sessionStorage.removeItem('authRedirectAfterCallback');
            }
          } catch (err) {
            console.error('Error accessing sessionStorage:', err);
          }
          
          console.log('Redirecting to:', redirectPath);
          router.push(redirectPath);
          return;
        }
      } catch (err) {
        console.error('Auth callback processing error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
        setTimeout(() => {
          router.push('/auth/login?error=' + encodeURIComponent('An error occurred during verification'));
        }, 2000);
      }
    };

    if (router.isReady) {
      handleAuthCallback();
    }
  }, [router.isReady, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Verifying | The Travelling Technicians</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 mb-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? 'Verification Error' : 'Verifying your account'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {error 
              ? `Error: ${error}` 
              : 'Please wait while we verify your account...'}
          </p>
          
          {loading && !error && (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {error && (
            <div className="mt-6">
              <button
                onClick={() => router.push('/auth/login')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage; 