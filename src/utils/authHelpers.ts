import { supabase } from './supabaseClient';

/**
 * Get the configured redirect URL for authentication
 */
export const getAuthRedirectUrl = () => {
  // Use the same logic as in supabaseClient.ts
  const isDev = process.env.NODE_ENV === 'development';
  const baseUrl = isDev 
    ? 'http://localhost:3000' 
    : process.env.NEXT_PUBLIC_WEBSITE_URL || 
      process.env.NEXT_PUBLIC_VERCEL_URL || 
      'https://travelling-technicians.ca';
  
  const url = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
  return `${url}/auth/callback`;
};

/**
 * Helper function to sign in with email and password
 * with proper redirect handling
 */
export const signInWithEmail = async (email: string, password: string, redirectTo?: string) => {
  try {
    // Store any custom redirect in session storage for use after auth callback
    if (redirectTo && typeof window !== 'undefined') {
      sessionStorage.setItem('authRedirectAfterCallback', redirectTo);
    }
    
    // Always use the callback page as the immediate redirect
    const options = {
      redirectTo: getAuthRedirectUrl()
    };
    
    return await supabase.auth.signInWithPassword({
      email,
      password,
      ...options
    });
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

/**
 * Helper function to sign up with email and password
 * with proper redirect handling
 */
export const signUpWithEmail = async (email: string, password: string, redirectTo?: string) => {
  try {
    // Store any custom redirect in session storage for use after auth callback
    if (redirectTo && typeof window !== 'undefined') {
      sessionStorage.setItem('authRedirectAfterCallback', redirectTo);
    }
    
    // Always use the callback page as the immediate redirect
    const options = {
      redirectTo: getAuthRedirectUrl()
    };
    
    return await supabase.auth.signUp({
      email,
      password,
      ...options
    });
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

/**
 * Helper function to send password reset email
 * with proper redirect handling
 */
export const resetPassword = async (email: string) => {
  try {
    const options = {
      redirectTo: getAuthRedirectUrl()
    };
    
    return await supabase.auth.resetPasswordForEmail(email, options);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Helper function to sign out
 */
export const signOut = async () => {
  try {
    return await supabase.auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}; 