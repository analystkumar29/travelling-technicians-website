import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../utils/supabaseClient';

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 15000;

const PasswordChangePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'valid' | 'invalid' | 'checking'>('checking');
  
  // Refs to track timeouts and auth subscription
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const authListenerRef = useRef<{ subscription: any } | null>(null);

  // Listen for auth state changes - especially password updates
  useEffect(() => {
    // Set up auth listener to detect password updates
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      // When user is updated (password change occurs)
      if (event === 'USER_UPDATED') {
        console.log('Detected password update success from auth state');
        
        // Clear any timeout to prevent double-handling
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        // If we were in the process of submitting, confirm success
        if (isSubmitting) {
          setIsSubmitting(false);
          setSuccessMessage('Your password has been updated successfully');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordStrength(null);
          
          // Clear success message after a delay
          setTimeout(() => {
            setSuccessMessage(null);
          }, 5000);
        }
      }
    });
    
    // Save reference to unsubscribe
    authListenerRef.current = { subscription: data.subscription };
    
    // Cleanup auth listener on unmount
    return () => {
      if (authListenerRef.current?.subscription) {
        authListenerRef.current.subscription.unsubscribe();
      }
    };
  }, [isSubmitting]);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setSessionStatus('checking');
        
        // Check network connectivity first
        if (!navigator.onLine) {
          setError('You appear to be offline. Please check your internet connection.');
          setSessionStatus('invalid');
          return;
        }
        
        // Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Error checking your authentication status: ' + sessionError.message);
          setSessionStatus('invalid');
          return;
        }
        
        if (!sessionData.session) {
          // Not logged in, redirect to login
          console.log('No active session, redirecting to login');
          setSessionStatus('invalid');
          router.push('/auth/login/?redirect=/account/password/');
          return;
        }
        
        // Verify session isn't expired
        const expiresAt = sessionData.session.expires_at;
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (expiresAt && expiresAt < currentTime) {
          console.log('Session expired, redirecting to login');
          setSessionStatus('invalid');
          router.push('/auth/login/?redirect=/account/password/');
          return;
        }
        
        console.log('Session valid, user authenticated');
        setSessionStatus('valid');
      } catch (err: any) {
        console.error('Error in auth check:', err);
        setError('An error occurred while loading your account: ' + (err.message || 'Unknown error'));
        setSessionStatus('invalid');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Cleanup any pending timeouts on component unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [router]);

  // Evaluate password strength when password changes
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(null);
      return;
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const isLongEnough = newPassword.length >= 8;
    
    const strength = 
      (hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough) ? 'strong' :
      ((hasUpperCase || hasLowerCase) && hasNumbers && isLongEnough) ? 'medium' : 
      'weak';
    
    setPasswordStrength(strength);
  }, [newPassword]);

  const validateForm = () => {
    // Reset errors
    setError(null);
    
    // Check network connectivity
    if (!navigator.onLine) {
      setError('You appear to be offline. Please check your internet connection.');
      return false;
    }
    
    // Check session status
    if (sessionStatus !== 'valid') {
      setError('Your session appears to be invalid. Please refresh the page and try again.');
      return false;
    }
    
    // Check if all fields are filled
    if (!currentPassword) {
      setError('Current password is required');
      return false;
    }
    
    if (!newPassword) {
      setError('New password is required');
      return false;
    }
    
    if (!confirmPassword) {
      setError('Please confirm your new password');
      return false;
    }
    
    // Check if new password is different from current
    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return false;
    }
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    
    // Check password strength
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    // Additional password strength validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
      setError('Password must contain uppercase letters, lowercase letters, and numbers');
      return false;
    }
    
    if (!hasSpecialChar) {
      setError('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
      return false;
    }
    
    return true;
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Set a timeout to abort the request if it takes too long
    timeoutRef.current = setTimeout(() => {
      if (isSubmitting) {
        setIsSubmitting(false);
        setError('Request timed out. Please try again.');
        console.error('Password update request timed out after', REQUEST_TIMEOUT, 'ms');
      }
    }, REQUEST_TIMEOUT);
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      
      // Check network connectivity again right before submitting
      if (!navigator.onLine) {
        throw new Error('You appear to be offline. Please check your internet connection.');
      }
      
      // Get current user info to verify session and get email
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user?.email) {
        console.error('Error getting user data:', userError);
        throw new Error('Unable to verify your account. Please try signing in again.');
      }
      
      console.log('Verifying current password...');
      
      // First verify the current password by attempting to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: currentPassword,
      });
      
      if (signInError) {
        console.error('Sign-in verification error:', signInError);
        if (signInError.message.includes('rate limit')) {
          throw new Error('Too many attempts. Please try again in a few minutes.');
        } else {
          throw new Error('Current password is incorrect');
        }
      }
      
      if (!signInData.session) {
        console.error('No session returned after sign-in');
        throw new Error('Authentication failed. Please refresh and try again.');
      }
      
      console.log('Current password verified successfully, updating password...');
      
      // Update the password
      // Note: We don't need to handle success here as the auth listener will catch it
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) {
        console.error('Password update error:', updateError);
        throw updateError;
      }
      
      // The success case is now handled by the auth listener
      // This prevents issues with timing and async operations
      
    } catch (error: any) {
      console.error('Error changing password:', error);
      setError(error.message || 'Failed to update password. Please try again.');
      setIsSubmitting(false); // Reset submission state on error
      
      // Clear the timeout in case of error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    // Note: We don't include a finally block here because we want isSubmitting
    // to be controlled by the auth listener on success, or the catch block on error
  };

  // Emergency backup timeout as a last resort
  useEffect(() => {
    let loadingTimeout: NodeJS.Timeout | null = null;
    
    if (isSubmitting) {
      loadingTimeout = setTimeout(() => {
        // If still submitting after 30 seconds, force reset the submitting state
        if (isSubmitting) {
          console.error('Force-resetting submission state after 30 seconds');
          setIsSubmitting(false);
          setError('The request is taking longer than expected. Please try again.');
        }
      }, 30000);
    }
    
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [isSubmitting]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Change Password | The Travelling Technicians</title>
        <meta 
          name="description" 
          content="Update your account password for The Travelling Technicians." 
        />
      </Head>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h1>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleChangePassword}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <div className="mt-1">
                      <input
                        id="current-password"
                        name="current-password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="mt-1">
                      <input
                        id="new-password"
                        name="new-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    {newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="text-sm">Password strength:</div>
                          <div className="flex items-center space-x-1">
                            <div className={`h-2 w-8 rounded ${passwordStrength === 'weak' ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                            <div className={`h-2 w-8 rounded ${passwordStrength === 'medium' ? 'bg-yellow-500' : passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                            <div className={`h-2 w-8 rounded ${passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                          </div>
                          <div className="text-sm">
                            {passwordStrength === 'weak' && <span className="text-red-500">Weak</span>}
                            {passwordStrength === 'medium' && <span className="text-yellow-500">Medium</span>}
                            {passwordStrength === 'strong' && <span className="text-green-500">Strong</span>}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Password requirements:
                      </p>
                      <ul className="text-xs text-gray-500 list-disc ml-4 mt-1">
                        <li className={`${newPassword.length >= 8 ? 'text-green-500' : ''}`}>At least 8 characters long</li>
                        <li className={`${/[A-Z]/.test(newPassword) ? 'text-green-500' : ''}`}>At least one uppercase letter (A-Z)</li>
                        <li className={`${/[a-z]/.test(newPassword) ? 'text-green-500' : ''}`}>At least one lowercase letter (a-z)</li>
                        <li className={`${/\d/.test(newPassword) ? 'text-green-500' : ''}`}>At least one number (0-9)</li>
                        <li className={`${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-500' : ''}`}>At least one special character (!@#$%^&*(),.?":{}|&lt;&gt;)</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <div className="mt-1">
                      <input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="mt-1 text-xs text-red-500">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => router.push('/account/profile/')}
                      className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          <div className="mt-6">
            <a
              href="/account/profile/"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              &larr; Back to Profile
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default PasswordChangePage; 