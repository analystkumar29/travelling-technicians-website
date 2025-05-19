import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { supabase, getSiteUrl } from '@/utils/supabaseClient';
import { UserProfile } from '@/types/user';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  userProfile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  forceSignOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  linkBookingsToAccount: (email: string) => Promise<number>;
  isStateCorrupted: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStateCorrupted, setIsStateCorrupted] = useState(false);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        // Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          await supabase.auth.signOut();
          setUser(null);
          setUserProfile(null);
          setIsLoading(false);
          return;
        }
        
        if (sessionData?.session) {
          // Set user from session
          setUser(sessionData.session.user);
          
          // Fetch user profile
          await fetchUserProfile(sessionData.session.user.id);
          
          // Store minimal auth info to improve reliability
          if (typeof window !== 'undefined') {
            localStorage.setItem('authUser', JSON.stringify({
              id: sessionData.session.user.id,
              email: sessionData.session.user.email
            }));
          }
        } else {
          // Try to recover from localStorage as fallback
          tryRecoverFromStorage();
        }
      } catch (error) {
        console.error('Error fetching user session:', error);
        // Attempt recovery from localStorage as fallback
        tryRecoverFromStorage();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
        setIsStateCorrupted(false);
        // Clear any locally stored authentication data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('authUser');
          sessionStorage.removeItem('authRedirectPath');
        }
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
        setIsStateCorrupted(false);
        // Store minimal auth info to improve reliability
        if (typeof window !== 'undefined') {
          localStorage.setItem('authUser', JSON.stringify({
            id: session.user.id,
            email: session.user.email
          }));
        }
      } else if (event === 'USER_UPDATED' && session) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
        setIsStateCorrupted(false);
        // Update minimal auth info 
        if (typeof window !== 'undefined') {
          localStorage.setItem('authUser', JSON.stringify({
            id: session.user.id,
            email: session.user.email
          }));
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setUser(session.user);
        setIsStateCorrupted(false);
      }
      
      setIsLoading(false);
    });

    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

  // Function to attempt recovery from localStorage
  const tryRecoverFromStorage = () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Only use this as minimal fallback
          if (parsedUser && parsedUser.id) {
            console.log('Recovering minimal user state from localStorage');
            setUser({ id: parsedUser.id, email: parsedUser.email });
            fetchUserProfile(parsedUser.id);
          }
        } catch (e) {
          console.error('Error parsing stored user:', e);
          setIsStateCorrupted(true);
        }
      }
    }
  };
  
  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (!isLoading) return;
    
    // Set a timeout to force exit loading state if it takes too long
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Auth loading state timed out, forcing reset');
        setIsLoading(false);
        
        // Try to recover state from localStorage if available
        tryRecoverFromStorage();
      }
    }, 5000); // 5 second timeout for loading state
    
    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Check for corrupt user state
  useEffect(() => {
    // Skip on homepage to prevent reload loops
    const isHomepage = router.pathname === '/';
    const skipHomepageChecks = typeof window !== 'undefined' && sessionStorage.getItem('skipHomepageChecks') === 'true';
    
    if (isHomepage || skipHomepageChecks) return;
    
    // Check if user exists but has incomplete or corrupted data
    if (user && (!user.id || !user.email || user.id === 'undefined')) {
      console.error('Detected corrupted user state', user);
      setIsStateCorrupted(true);
    } else if (user && userProfile === null && !isLoading) {
      // If we have a user but couldn't fetch the profile, may be corrupted
      console.warn('User exists but profile fetch failed, possible corruption');
      setIsStateCorrupted(true);
    } else {
      setIsStateCorrupted(false);
    }
  }, [user, userProfile, isLoading, router.pathname]);

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      setUserProfile(profileData);
      return profileData;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Refresh user profile data
  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Process any pending booking references
      const pendingBookingRef = sessionStorage.getItem('pendingBookingReference');
      if (pendingBookingRef && data.user) {
        // Link the booking to the user account
        await linkBookingToUserId(pendingBookingRef, data.user.id, email);
        // Clear the pending reference
        sessionStorage.removeItem('pendingBookingReference');
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to log in'
      };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      // First check if the email already exists in user_profiles
      const { data: existingProfiles } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', email)
        .limit(1);
        
      if (existingProfiles && existingProfiles.length > 0) {
        throw new Error('Email already exists. Please use a different email or sign in with your existing account.');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
          },
          emailRedirectTo: `${getSiteUrl()}/auth/callback`,
        },
      });

      if (error) throw error;
      
      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            phone: phone || null,
          });

        if (profileError) {
          // If it's a duplicate key error, provide a more user-friendly message
          if (profileError.code === '23505') {
            throw new Error('Email already exists. Please use a different email or sign in with your existing account.');
          }
          throw profileError;
        }
        
        // Process any pending booking references
        const pendingBookingRef = sessionStorage.getItem('pendingBookingReference');
        if (pendingBookingRef) {
          // Link the booking to the user account
          await linkBookingToUserId(pendingBookingRef, data.user.id, email);
          // Clear the pending reference
          sessionStorage.removeItem('pendingBookingReference');
        }
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create account'
      };
    }
  };

  // Sign out with improved error handling and state management
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Clear local storage auth data first
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('authUser');
        sessionStorage.removeItem('authRedirectPath');
      }
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Reset state
      setUser(null);
      setUserProfile(null);
      setIsStateCorrupted(false);
      
      // Add a small delay before redirecting to ensure state is cleared
      setTimeout(() => {
        router.push('/');
      }, 50);
    } catch (error) {
      console.error('Sign out error:', error);
      // If normal signout fails, try the force method
      await forceSignOut();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Force sign out - nuclear option for corrupted states
  const forceSignOut = async () => {
    try {
      console.warn('Using force sign out method - clearing all auth state');
      setIsLoading(true);
      
      // Clear all auth data from browser storage
      if (typeof window !== 'undefined') {
        // Clear localStorage
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('authUser');
        
        // Clear sessionStorage
        sessionStorage.removeItem('authRedirectPath');
        sessionStorage.removeItem('pendingBookingReference');
        
        // Try to clear all potential auth related items
        try {
          // Remove all items containing 'auth', 'user', 'session', 'token' in key
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('auth') || key.includes('user') || 
                key.includes('session') || key.includes('token') || 
                key.includes('supabase'))) {
              localStorage.removeItem(key);
            }
          }
          
          // Do the same for sessionStorage
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (key.includes('auth') || key.includes('user') || 
                key.includes('session') || key.includes('token') || 
                key.includes('supabase'))) {
              sessionStorage.removeItem(key);
            }
          }
        } catch (e) {
          console.error('Error clearing storage:', e);
        }
        
        // Clear cookies related to auth
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.trim().split('=');
          if (name && (name.includes('auth') || name.includes('supabase') || 
              name.includes('session') || name.includes('token'))) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
          }
        });
      }
      
      // Force sign out from Supabase
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Error during supabase signout:', e);
        // Continue anyway
      }
      
      // Reset all auth state
      setUser(null);
      setUserProfile(null);
      setIsStateCorrupted(false);
      
      // Force page reload to completely reset application state
      window.location.href = '/';
    } catch (error) {
      console.error('Force sign out error:', error);
      // Last resort - hard reload to homepage
      window.location.href = '/';
    } finally {
      setIsLoading(false);
    }
  };
  
  // Link a booking to user ID
  const linkBookingToUserId = async (referenceNumber: string, userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ user_id: userId })
        .match({ reference_number: referenceNumber })
        .select();
        
      if (error) throw error;
      
      return data?.length || 0;
    } catch (error) {
      console.error('Error linking booking to user:', error);
      return 0;
    }
  };
  
  // Link anonymous bookings to a user account
  const linkBookingsToAccount = async (email: string) => {
    if (!user) return 0;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ user_id: user.id })
        .match({ customer_email: email, user_id: null })
        .select();
        
      if (error) throw error;
      
      return data?.length || 0;
    } catch (error) {
      console.error('Error linking bookings to account:', error);
      return 0;
    }
  };

  const value = {
    isAuthenticated: !!user,
    isLoading,
    user,
    userProfile,
    signIn,
    signUp,
    signOut,
    forceSignOut,
    refreshProfile,
    linkBookingsToAccount,
    isStateCorrupted
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 