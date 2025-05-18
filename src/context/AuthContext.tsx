import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabaseClient';
import { UserProfile } from '@/types/user';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  userProfile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  linkBookingsToAccount: (email: string) => Promise<number>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        }
      } catch (error) {
        console.error('Error fetching user session:', error);
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
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else if (event === 'USER_UPDATED' && session) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setUser(session.user);
      }
      
      setIsLoading(false);
    });

    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, []);

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
          },
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

        if (profileError) throw profileError;
        
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

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
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
    refreshProfile,
    linkBookingsToAccount
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