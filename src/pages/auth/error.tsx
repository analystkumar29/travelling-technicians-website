import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { clearAuthStorage } from '@/utils/authStateProtection';

const AuthErrorPage: React.FC = () => {
  const router = useRouter();
  const { forceSignOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [resetInProgress, setResetInProgress] = useState(false);

  useEffect(() => {
    // Get error type from URL
    const errorType = router.query.error as string;
    const action = router.query.action as string;
    
    // Set appropriate error message
    if (errorType === 'invalid_session') {
      setError('Your authentication session is corrupted or invalid.');
    } else if (errorType === 'expired_session') {
      setError('Your session has expired. Please sign in again.');
    } else {
      setError('There was a problem with your authentication.');
    }
    
    // If action is 'reset', automatically initiate recovery
    if (action === 'reset') {
      handleReset();
    }
  }, [router.query]);

  const handleReset = async () => {
    setResetInProgress(true);
    
    try {
      // Clear all auth storage
      clearAuthStorage();
      
      // Force sign out via Auth context
      await forceSignOut();
      
      // Redirect to homepage after reset
      router.push('/');
    } catch (error) {
      console.error('Error during auth reset:', error);
      
      // Last resort - force page reload
      window.location.href = '/';
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800">{error}</p>
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