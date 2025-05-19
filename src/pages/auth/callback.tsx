import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '@/utils/supabaseClient';

const AuthCallbackPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle the authentication callback
    const handleAuthCallback = async () => {
      // Get the URL hash (fragment)
      const hash = window.location.hash;
      
      try {
        // Extract the access token and refresh token from hash
        // This is for email confirmation
        if (hash && hash.includes('access_token')) {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth callback error:', error);
            setError(error.message);
            router.push('/auth/login?error=Unable to verify your account. Please try logging in.');
            return;
          }
          
          if (data && data.session) {
            // Redirect to login with verified flag
            router.push('/auth/login?verified=true');
          }
        } 
        // Handle password reset confirmation
        else if (router.query.type === 'recovery') {
          router.push('/auth/reset-password');
        }
        // Default fallback - check for a stored redirect
        else {
          let redirectPath = '/auth/login';
          try {
            // Try to get a stored redirect path from session storage
            const storedRedirect = sessionStorage.getItem('authRedirectAfterCallback');
            if (storedRedirect) {
              redirectPath = storedRedirect;
              // Clear the stored redirect
              sessionStorage.removeItem('authRedirectAfterCallback');
            }
          } catch (err) {
            console.error('Error accessing sessionStorage:', err);
          }
          
          router.push(redirectPath);
        }
      } catch (err) {
        console.error('Auth callback processing error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        router.push('/auth/login?error=An error occurred during verification');
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
      </Head>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verifying your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {error ? `Error: ${error}` : 'Please wait while we verify your account...'}
          </p>
          {!error && (
            <div className="mt-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          {error && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => router.push('/auth/login')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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