import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '@/utils/supabaseClient';

const AuthCallbackPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Handle the authentication callback
    const handleAuthCallback = async () => {
      // Get the URL hash (fragment)
      const hash = window.location.hash;
      
      // Extract the access token and refresh token from hash
      // This is for email confirmation
      if (hash && hash.includes('access_token')) {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
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
      // Default fallback
      else {
        router.push('/auth/login');
      }
    };

    if (router.isReady) {
      handleAuthCallback();
    }
  }, [router.isReady, router]);

  return (
    <>
      <Head>
        <title>Verifying | The Travelling Technicians</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verifying your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please wait while we verify your account...
            </p>
            <div className="mt-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthCallbackPage; 