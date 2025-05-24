import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase, getSiteUrl } from '@/utils/supabaseClient';
import { UserProfile } from '@/types/user';
import { 
  normalizeAuthState, 
  validateAuthToken, 
  withNetworkRetry, 
  clearAuthStorage,
  updateAuthState,
  AuthState
} from '@/utils/authStateProtection';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  userProfile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: (silent?: boolean) => Promise<void>;
  forceSignOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  linkBookingsToAccount: (email: string) => Promise<number>;
  isStateCorrupted: boolean;
  isFetchingProfile: boolean;
  refreshSession: () => Promise<boolean>;
}

// Auth state validation schema
const validateAuthState = (user: any): boolean => {
  if (!user) return true; // Null user is valid
  return !!(user.id && user.email && user.id !== 'undefined' && user.id !== 'null');
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [isStateCorrupted, setIsStateCorrupted] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const router = useRouter();
  const recoveryAttempts = useRef(0);
  const lastValidationTime = useRef<number>(Date.now());
  const authStateVersion = useRef<number>(0);
  
  // Token refresh interceptor with improved error handling
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.warn('Token refresh failed:', error);
        return false;
      }
      
      if (data.session) {
        // Update internal state with new session data
        setUser(data.session.user);
        authStateVersion.current += 1;
        lastValidationTime.current = Date.now();
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error in refreshSession:', err);
      return false;
    }
  }, []);

  // More robust recovery system
  const recoverAuthState = useCallback(async (): Promise<boolean> => {
    // Skip recovery on homepage to prevent loops
    const isHomePage = typeof window !== 'undefined' && (
      window.location.pathname === '/' || window.location.pathname === ''
    );
    
    if (isHomePage) {
      console.log('Skipping auth recovery on homepage to prevent loops');
      sessionStorage.setItem('skipHomepageChecks', 'true');
      // Reset recovery attempts when on homepage
      recoveryAttempts.current = 0;
      return false;
    }
    
    // Increase attempts threshold before forcing sign out
    if (recoveryAttempts.current > 5) {
      console.warn('Too many recovery attempts, forcing sign out');
      await forceSignOut();
      return false;
    }
    
    recoveryAttempts.current += 1;
    console.log(`Attempting auth state recovery (attempt ${recoveryAttempts.current})`);
    
    try {
      // First try to refresh the session
      const refreshed = await refreshSession();
      if (refreshed) {
        console.log('Successfully recovered session via refresh');
        recoveryAttempts.current = 0;
        return true;
      }
      
      // If refresh fails, check localStorage
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('authUser');
        const supabaseToken = localStorage.getItem('supabase.auth.token');
        
        // If we have both token and stored user, try to validate session
        if (storedUser && supabaseToken) {
          try {
            const parsedUser = JSON.parse(storedUser);
            
            // Validate the parsed user
            if (validateAuthState(parsedUser)) {
              console.log('Recovered user from localStorage, validating with server');
              const { data } = await supabase.auth.getUser();
              
              if (data.user && data.user.id === parsedUser.id) {
                // Valid user, set state and fetch profile
                setUser(data.user);
                await fetchUserProfile(data.user.id);
                recoveryAttempts.current = 0;
                return true;
              }
            }
          } catch (e) {
            console.error('Error parsing stored user during recovery:', e);
          }
        }
      }
      
      // If we get here, recovery failed but don't increase counter if we're on a non-critical page
      const isNonCriticalPage = router.pathname.includes('/auth/') || 
                                router.pathname === '/' || 
                                router.pathname === '';
      
      if (isNonCriticalPage) {
        // Don't count this as a failed attempt on non-critical pages
        recoveryAttempts.current = Math.max(0, recoveryAttempts.current - 1);
      }
      
      return false;
    } catch (error) {
      console.error('Error in recoverAuthState:', error);
      return false;
    }
  }, [refreshSession, router.pathname]);

  // Initialize auth state
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        // Get current session with network retry
        const { data: sessionData, error: sessionError } = await withNetworkRetry(() => 
          supabase.auth.getSession()
        );
        
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
          authStateVersion.current += 1;
          lastValidationTime.current = Date.now();
          
          // Fetch user profile
          await fetchUserProfile(sessionData.session.user.id);
          
          // Store normalized auth info to improve reliability
          if (typeof window !== 'undefined') {
            updateAuthState({
              id: sessionData.session.user.id,
              email: sessionData.session.user.email || '',
              version: authStateVersion.current,
              lastUpdated: Date.now()
            });
          }
        } else {
          // Try to recover from localStorage as fallback
          await recoverAuthState();
        }
      } catch (error) {
        console.error('Error fetching user session:', error);
        // Attempt recovery from localStorage as fallback
        await recoverAuthState();
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
        authStateVersion.current += 1;
        
        // Clear any locally stored authentication data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('authUser');
          sessionStorage.removeItem('authRedirectPath');
        }
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        authStateVersion.current += 1;
        lastValidationTime.current = Date.now();
        await fetchUserProfile(session.user.id);
        setIsStateCorrupted(false);
        
        // Store normalized auth info to improve reliability
        if (typeof window !== 'undefined') {
          updateAuthState({
            id: session.user.id,
            email: session.user.email || '',
            version: authStateVersion.current,
            lastUpdated: Date.now()
          });
        }
      } else if (event === 'USER_UPDATED' && session) {
        setUser(session.user);
        authStateVersion.current += 1;
        lastValidationTime.current = Date.now();
        await fetchUserProfile(session.user.id);
        setIsStateCorrupted(false);
        
        // Update normalized auth info 
        if (typeof window !== 'undefined') {
          updateAuthState({
            id: session.user.id,
            email: session.user.email || '',
            version: authStateVersion.current,
            lastUpdated: Date.now()
          });
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        setUser(session.user);
        authStateVersion.current += 1;
        lastValidationTime.current = Date.now();
        setIsStateCorrupted(false);
      }
      
      setIsLoading(false);
    });

    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, [recoverAuthState]);

  // Function to attempt recovery from localStorage
  const tryRecoverFromStorage = () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Only use this as minimal fallback
          if (validateAuthState(parsedUser)) {
            console.log('Recovering minimal user state from localStorage');
            setUser({ id: parsedUser.id, email: parsedUser.email });
            fetchUserProfile(parsedUser.id);
            return true;
          }
        } catch (e) {
          console.error('Error parsing stored user:', e);
          setIsStateCorrupted(true);
        }
      }
    }
    return false;
  };
  
  // Add back fetchUserProfile function to fix build error
  const fetchUserProfile = async (userId: string) => {
    if (!userId) {
      console.error('[PROFILE] Cannot fetch profile: userId is missing');
      return null;
    }

    setIsFetchingProfile(true);
    setIsStateCorrupted(false);
    console.log(`[PROFILE] Starting profile fetch for user ${userId.slice(0,6)}...`);
    
    // Reset session storage counters when we successfully sign in
    if (user?.id && router.pathname.includes('/auth/callback')) {
      console.log('[PROFILE] Auth callback detected, resetting fetch attempts');
      sessionStorage.removeItem('profileFetchAttempts');
    }
    
    // Track profile fetch attempts for this session
    const profileFetchAttempts = parseInt(sessionStorage.getItem('profileFetchAttempts') || '0', 10);
    sessionStorage.setItem('profileFetchAttempts', (profileFetchAttempts + 1).toString());
    console.log(`[PROFILE] Fetch attempt ${profileFetchAttempts + 1}`);

    // Try more robust strategies earlier
    let profile = null;
    
    // Helper function to wrap Supabase calls with timeout
    const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = 5000, name = 'operation'): Promise<T> => {
      let timeoutId: NodeJS.Timeout;
      
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error(`[PROFILE] ${name} timed out after ${timeoutMs}ms`));
          }, timeoutMs);
        });
        
        // Race the operation against the timeout
        const result = await Promise.race([
          promise,
          timeoutPromise
        ]);
        
        return result;
      } catch (err) {
        console.error(`[PROFILE] ${name} failed:`, err);
        throw err;
      } finally {
        clearTimeout(timeoutId!);
      }
    };
    
    // Helper: Retry with exponential backoff
    const retryWithBackoff = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
      let lastError;
      for (let i = 0; i < retries; i++) {
        try {
          return await fn();
        } catch (err) {
          lastError = err;
          console.warn(`[PROFILE] Connection test attempt ${i + 1} failed:`, err);
          await new Promise(res => setTimeout(res, delay * (i + 1)));
        }
      }
      throw lastError;
    };
    
    // Try a simple query first to test if Supabase is responding (with retry)
    try {
      console.log('[PROFILE] Testing database connection with retry...');
      await retryWithBackoff(
        () => withTimeout(
          Promise.resolve(supabase.from('user_profiles').select('count').limit(1)),
          5000, // increased timeout
          'Connection test'
        ),
        3, // retries
        1500 // backoff delay
      );
      console.log('[PROFILE] Database connection successful');
    } catch (connErr) {
      console.error('[PROFILE] Connection test failed after retries:', connErr);
      // Optionally: show user-friendly error or fallback
    }
    
    // Skip RPC and try direct query first for reliability
    console.log('[PROFILE] Trying direct profile query...');
    try {
      const { data, error } = await withTimeout(
        Promise.resolve(supabase.from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()),
        5000,
        'Direct profile query'
      );
      
      if (error) {
        console.error('[PROFILE] Direct query error:', error.message);
        if (error.code !== 'PGRST116') {
          setIsStateCorrupted(true);
        }
      } else if (data) {
        console.log('[PROFILE] Successfully fetched profile via direct query');
        profile = data;
      } else {
        console.log('[PROFILE] No profile found via direct query');
      }
    } catch (directErr) {
      console.error('[PROFILE] Direct query failed:', directErr);
    }
    
    // If direct query didn't work, try to create the profile
    if (!profile) {
      console.log('[PROFILE] Profile not found, attempting to create one');
      try {
        // First check if user exists in auth.users
        const { data: userData, error: userError } = await withTimeout(
          Promise.resolve(supabase.auth.getUser()),
          5000,
          'Auth getUser'
        );
        if (userError) {
          console.error('[PROFILE] Error getting user data:', userError.message);
        } else if (userData?.user) {
          console.log('[PROFILE] User exists in auth, creating profile');
          const { data: newProfile, error: insertError } = await withTimeout(
            Promise.resolve(supabase.from('user_profiles')
              .insert([
                { 
                  id: userId,
                  email: userData.user.email,
                  full_name: userData.user.user_metadata?.full_name || '',
                  created_at: new Date().toISOString()
                }
              ])
              .select('*')
              .single()),
            5000,
            'Profile creation'
          );
          if (insertError) {
            if (insertError.code === '23505' || (insertError.message && insertError.message.includes('duplicate key value'))) {
              // Duplicate key: profile already exists, fetch it again
              console.warn('[PROFILE] Duplicate key error on profile creation, fetching existing profile');
              try {
                const { data: existingProfile, error: fetchExistingError } = await withTimeout(
                  Promise.resolve(supabase.from('user_profiles')
                    .select('*')
                    .eq('id', userId)
                    .single()),
                  5000,
                  'Fetch existing profile after duplicate key'
                );
                if (fetchExistingError) {
                  console.error('[PROFILE] Failed to fetch existing profile after duplicate key:', fetchExistingError.message);
                  setIsStateCorrupted(true);
                } else if (existingProfile) {
                  console.log('[PROFILE] Successfully fetched existing profile after duplicate key');
                  profile = existingProfile;
                }
              } catch (fetchExistingErr) {
                console.error('[PROFILE] Error fetching existing profile after duplicate key:', fetchExistingErr);
                setIsStateCorrupted(true);
              }
            } else {
              console.error('[PROFILE] Error creating profile:', insertError.message);
              setIsStateCorrupted(true);
            }
          } else if (newProfile) {
            console.log('[PROFILE] Successfully created new profile');
            profile = newProfile;
          }
        } else {
          console.error('[PROFILE] Cannot create profile: user data unavailable');
        }
      } catch (createErr) {
        console.error('[PROFILE] Error in profile creation:', createErr);
      }
    }
    
    // Update state if we have a profile
    if (profile) {
      console.log('[PROFILE] Setting user profile in state');
      setUserProfile(profile);
      setIsStateCorrupted(false);
      sessionStorage.removeItem('profileFetchAttempts'); // Reset counter on success
      
      // Set cross-domain cookies to help with auth
      try {
        document.cookie = 'tt_auth_check=true; path=/; max-age=86400; SameSite=Lax';
        
        // For production environments
        if (window.location.hostname.includes('travelling-technicians.ca')) {
          document.cookie = 'tt_auth_check=true; path=/; domain=.travelling-technicians.ca; max-age=86400; SameSite=Lax; Secure';
          document.cookie = 'tt_cross_domain=true; path=/; domain=.travelling-technicians.ca; max-age=86400; SameSite=Lax; Secure';
        }
      } catch (cookieErr) {
        console.error('[PROFILE] Error setting cookies:', cookieErr);
      }
      
      console.log('[PROFILE] Profile fetch completed successfully');
      return profile;
    }
    
    // Only attempt a forced sign out on protected pages, not on public or auth pages
    if (profileFetchAttempts >= 5) {
      const isProtectedPage = !['/auth/login', '/auth/register', '/auth/reset-password', '/'].some(p => 
        router.pathname.startsWith(p) || router.pathname === p
      );
      
      if (isProtectedPage) {
        console.error('[PROFILE] Maximum profile fetch attempts reached on protected page, logging out');
        sessionStorage.removeItem('profileFetchAttempts');
        supabase.auth.signOut().then(() => {
          router.push('/auth/login');
        });
      } else {
        console.log('[PROFILE] Max attempts reached but on non-protected page, not logging out');
        // Reset counter to avoid building up failed attempts
        sessionStorage.setItem('profileFetchAttempts', '0');
      }
    }
    
    return null;
  }

  // Helper function to test if the RPC function exists
  const testRpcFunctionExists = async (): Promise<boolean> => {
    try {
      // Try to get the function definition from Supabase
      const { data, error } = await supabase
        .rpc('get_user_profile_by_id', { user_id: '00000000-0000-0000-0000-000000000000' })
        .maybeSingle();
      
      // If we get data or a specific error NOT related to function existence, it exists
      if (data || (error && !error.message.includes('does not exist'))) {
        console.log('[PROFILE] RPC function exists');
        return true;
      }
      
      console.error('[PROFILE] RPC function does not exist:', error?.message);
      return false;
    } catch (err) {
      console.error('[PROFILE] Error testing RPC function:', err);
      return false;
    }
  };
  
  // Helper function to create a user profile
  const createUserProfile = async (userId: string) => {
    try {
      if (!user || !user.email) {
        console.error('Cannot create profile: email missing');
        return null;
      }
      
      // Create minimal profile
      const newProfile = {
        id: userId,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select()
        .single();
        
      if (error) {
        console.error('Failed to create user profile:', error);
        return null;
      }
      
      console.log('Successfully created user profile');
      setUserProfile(data);
      sessionStorage.setItem('profileFetchAttempts', '0');
      return data;
    } catch (err) {
      console.error('Error in createUserProfile:', err);
      return null;
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
        
        // Only attempt recovery if not on homepage to prevent loops
        const isHomePage = typeof window !== 'undefined' && (
          window.location.pathname === '/' || window.location.pathname === ''
        );
        
        if (!isHomePage) {
          // Try to recover state from localStorage if available
          const recovered = tryRecoverFromStorage();
          if (!recovered) {
            recoverAuthState();
          }
        } else {
          console.log('Skipping auth recovery on homepage to prevent loops');
          // Set flag to skip homepage checks
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('skipHomepageChecks', 'true');
            // Set a higher timeout to clear this flag
            setTimeout(() => {
              sessionStorage.removeItem('skipHomepageChecks');
            }, 30000); // 30 seconds
          }
        }
      }
    }, 10000); // Increase timeout to 10 seconds to reduce false positives
    
    return () => clearTimeout(timeout);
  }, [isLoading, recoverAuthState]);

  // Check for corrupt user state
  useEffect(() => {
    // Skip on homepage to prevent reload loops
    const isHomepage = router.pathname === '/';
    const skipHomepageChecks = typeof window !== 'undefined' && sessionStorage.getItem('skipHomepageChecks') === 'true';
    
    if (isHomepage || skipHomepageChecks) return;
    
    // Check if user exists but has incomplete or corrupted data
    if (user && !validateAuthState(user)) {
      console.error('Detected corrupted user state', user);
      setIsStateCorrupted(true);
      recoverAuthState();
    } else if (user && userProfile === null && !isLoading) {
      // If we have a user but couldn't fetch the profile, may be corrupted
      console.warn('User exists but profile fetch failed, possible corruption');
      setIsStateCorrupted(true);
      recoverAuthState();
    } else {
      setIsStateCorrupted(false);
    }
  }, [user, userProfile, isLoading, router.pathname, recoverAuthState]);

  // Periodic session validation
  useEffect(() => {
    // Only run validation if there's a user and we're not on the homepage (to prevent loops)
    if (!user || router.pathname === '/') return;

    const validateInterval = 15 * 60 * 1000; // 15 minutes
    
    // Validate session periodically
    const sessionValidator = setInterval(async () => {
      // Skip validation if done recently
      if (Date.now() - lastValidationTime.current < validateInterval) return;
      
      try {
        console.log('Performing periodic session validation');
        const { data } = await supabase.auth.getUser();
        
        if (!data.user && user) {
          console.warn('Session validation failed - user no longer valid');
          await recoverAuthState();
        } else if (data.user) {
          console.log('Session validation passed');
          lastValidationTime.current = Date.now();
        }
      } catch (err) {
        console.error('Error in periodic validation:', err);
      }
    }, validateInterval);
    
    return () => clearInterval(sessionValidator);
  }, [user, router.pathname, recoverAuthState]);
  
  // Network status monitoring
  useEffect(() => {
    const handleOnline = async () => {
      console.log('Network connection restored');
      if (user) {
        // Validate session when reconnecting
        await refreshSession();
      }
    };
    
    // Listen for network status changes
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [user, refreshSession]);

  // Fetch user profile whenever user changes
  useEffect(() => {
    // Skip on homepage to prevent reload loops
    const isHomepage = router.pathname === '/';
    const skipHomepageChecks = typeof window !== 'undefined' && sessionStorage.getItem('skipHomepageChecks') === 'true';
    
    if (!user || isHomepage || skipHomepageChecks) return;
    
    // Call our improved fetchUserProfile function
    fetchUserProfile(user.id);
  }, [user, router.pathname]);

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
      
      authStateVersion.current += 1;
      lastValidationTime.current = Date.now();
      
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
  const signOut = async (silent: boolean = false) => {
    try {
      setIsLoading(true);
      
      // Clear local storage auth data first
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('authUser');
        sessionStorage.removeItem('authRedirectPath');
      }
      
      authStateVersion.current += 1;
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Reset state
      setUser(null);
      setUserProfile(null);
      setIsStateCorrupted(false);
      
      // Add a small delay before redirecting to ensure state is cleared
      if (!silent) {
        setTimeout(() => {
          router.push('/');
        }, 50);
      }
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
      
      // Clear all auth data from browser storage using utility
      clearAuthStorage();
      
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
    isStateCorrupted,
    isFetchingProfile,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export all the necessary items
export { AuthContext, AuthProvider, useAuth };