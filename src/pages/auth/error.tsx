import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { AuthContext } from '@/context/AuthContext';
import { clearAuthStorage } from '@/utils/authStateProtection';
import { supabase } from '@/utils/supabaseClient';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const AuthErrorPage: React.FC = () => {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const { forceSignOut } = auth || {};
  const [error, setError] = useState<string | null>(null);
  const [resetInProgress, setResetInProgress] = useState(false);
  const [resetStatus, setResetStatus] = useState<'success' | 'error' | null>(null);

  // Define handleReset with useCallback before it's used in the first useEffect
  const handleReset = useCallback(async () => {
    setResetInProgress(true);
    setResetStatus(null);
    const email = sessionStorage.getItem('auth_recovery_email');

    if (!email) {
      setResetStatus('error');
      console.error('No email found in session storage for password reset.');
      setResetInProgress(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (resetError) throw resetError;
      setResetStatus('success');
    } catch (err: any) {
      console.error('Password reset error:', err.message);
      setResetStatus('error');
    } finally {
      setResetInProgress(false);
    }
  }, []); // Empty dependency array as it doesn't depend on props/state from this component scope

  useEffect(() => {
    const errorType = router.query.error as string;
    const action = router.query.action as string;
    
    if (errorType === 'invalid_session') {
      setError('Your authentication session is corrupted or invalid.');
    } else if (errorType === 'expired_session') {
      setError('Your session has expired. Please sign in again.');
    } else {
      setError('There was a problem with your authentication.');
    }
    
    if (action === 'reset') {
      handleReset();
    }
  }, [router.query, handleReset]); // Added handleReset to dependency array

  // This useEffect seems redundant or its purpose is unclear with the above one.
  // If it was intended for something else, its logic and dependencies should be reviewed.
  // For now, commenting out as the warning might be a false positive if this isn't the target useEffect.
  /*
  useEffect(() => {
    // ... existing code ...
  }, [handleReset]); 
  */

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  let displayMessage = 'An unexpected error occurred.';
  if (typeof error === 'string') {
    displayMessage = error;
  } else if (error === 'OAuthAccountNotLinked') {
    displayMessage = 'This email is already linked to another account. Please sign in with the original method.';
  }

  const showResetLink = error === 'AuthApiError' && (error as string)?.toLowerCase().includes('invalid login credentials');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          
          <Alert variant="destructive" className="bg-red-900/30 border-red-700 text-red-300">
            <AlertTitle className="font-semibold">Error Details:</AlertTitle>
            <AlertDescription>{displayMessage}</AlertDescription>
          </Alert>
          
          {showResetLink && (
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">
                Forgot your password? You can request a password reset.
              </p>
              <Button 
                onClick={handleReset} 
                disabled={resetInProgress}
                variant="outline"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white border-sky-500 hover:border-sky-400"
              >
                {resetInProgress ? 'Sending...' : 'Request Password Reset'}
              </Button>
              {resetStatus === 'success' && (
                <p className="mt-2 text-sm text-green-400">Password reset email sent. Please check your inbox.</p>
              )}
              {resetStatus === 'error' && (
                <p className="mt-2 text-sm text-red-400">Failed to send reset email. Please try again or contact support.</p>
              )}
            </div>
          )}
          
          <p className="mb-6 text-gray-700">
            There seems to be a problem with your authentication state. This can happen due to:
          </p>
          
          <ul className="list-disc pl-5 mb-6 text-gray-700">
            <li>Session expiration</li>
            <li>Signing in on another device</li>
            <li>Browser storage issues</li>
            <li>Network interruptions</li>
          </ul>
          
          <div className="space-y-4">
            <button
              onClick={handleReset}
              disabled={resetInProgress}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {resetInProgress ? 'Resetting Authentication...' : 'Reset Authentication State'}
            </button>
            
            <button
              onClick={handleGoBack}
              disabled={resetInProgress}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Go Back
            </button>
            
            <button
              onClick={handleGoHome}
              disabled={resetInProgress}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuthErrorPage; 