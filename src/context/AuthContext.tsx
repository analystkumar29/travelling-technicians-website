import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase, getSiteUrl } from '@/utils/supabaseClient';
import { UserProfile } from '@/types/user';
import { PostgrestSingleResponse, PostgrestError, UserResponse } from '@supabase/supabase-js';
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
  profileError: string | null;
  refreshSession: () => Promise<boolean>;
}

// Auth state validation schema
const validateAuthState = (user: any): boolean => {
  if (!user) return true; // Null user is valid
  return !!(user.id && user.email && user.id !== 'undefined' && user.id !== 'null');
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Constants for retry logic
const MAX_PROFILE_FETCH_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [isStateCorrupted, setIsStateCorrupted] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const router = useRouter();
  const recoveryAttempts = useRef(0);
  const lastValidationTime = useRef<number>(Date.now());
  const authStateVersion = useRef<number>(0);
  
  const fetchUserProfile = useCallback(async (userId: string) => {
    if (!userId) {
      console.error('[PROFILE] Cannot fetch profile: userId is missing');
      setIsFetchingProfile(false);
      setProfileError('User ID is missing, cannot fetch profile.');
      return null;
    }
    
    console.log(`[PROFILE] Starting profile fetch process for user ${userId.slice(0,6)}...`);
    setIsFetchingProfile(true);
    setIsStateCorrupted(false);
    setProfileError(null);

    let profile: UserProfile | null = null;
    let currentAttempt = 0;
    let retryDelay = INITIAL_RETRY_DELAY;

    const sessionAttempts = parseInt(sessionStorage.getItem('profileFetchAttempts') || '0', 10);
    
    if (user?.id && router.pathname.includes('/auth/callback')) {
      console.log('[PROFILE] Auth callback detected, resetting session storage attempts.');
      sessionStorage.removeItem('profileFetchAttempts');
    }

    while (currentAttempt < MAX_PROFILE_FETCH_ATTEMPTS) {
      currentAttempt++;
      sessionStorage.setItem('profileFetchAttempts', Math.max(sessionAttempts, currentAttempt).toString());
      console.log(`[PROFILE] Fetch attempt ${currentAttempt}/${MAX_PROFILE_FETCH_ATTEMPTS}`);

      const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = 10000, name = 'operation'): Promise<T> => {
        let timeoutId: NodeJS.Timeout | undefined = undefined;
        try {
          const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
              reject(new Error(`[PROFILE] ${name} timed out after ${timeoutMs}ms`));
            }, timeoutMs);
          });
          const result = await Promise.race([promise, timeoutPromise]);
          return result;
        } catch (err) {
          console.error(`[PROFILE] ${name} failed within withTimeout:`, err);
          throw err;
        } finally {
          if (timeoutId) clearTimeout(timeoutId);
        }
      };
      
      try {
        console.log('[PROFILE] Trying direct profile query...');
        const fetchedProfileResponse = await withTimeout<PostgrestSingleResponse<UserProfile>>(
          Promise.resolve(supabase.from('user_profiles').select('*').eq('id', userId).single()),
          10000, 
          'Direct profile query'
        );
        const { data: fetchedProfileData, error: queryError } = fetchedProfileResponse;

        if (queryError && queryError.code !== 'PGRST116') { // PGRST116 means no rows found, which is not an error for this step
          console.error('[PROFILE] Direct query error (not PGRST116):', queryError.message);
          throw queryError; // Throw to trigger retry for other errors
        } else if (fetchedProfileData) {
          console.log('[PROFILE] Successfully fetched profile via direct query');
          profile = fetchedProfileData;
          break; 
        }
        // If profile is null (either not found or PGRST116), proceed to upsert
        console.log('[PROFILE] Profile not found or PGRST116, attempting upsert.');

        const authUserResp = await withTimeout<UserResponse>(
          Promise.resolve(supabase.auth.getUser()),
          10000, 
          'Auth getUser for upsert'
        );
        const authUserData = authUserResp.data.user;
        const authUserError = authUserResp.error;

        if (authUserError) {
          console.error('[PROFILE] Error getting user data for profile upsert:', authUserError.message);
          throw authUserError;
        } else if (authUserData) {
          console.log('[PROFILE] User exists in auth, proceeding with profile upsert.');
          const upsertData: Partial<UserProfile> = {
            id: userId, // This is the conflict target
            email: authUserData.email!,
            full_name: authUserData.user_metadata?.full_name || '',
            phone: authUserData.user_metadata?.phone === null ? undefined : (authUserData.user_metadata?.phone || undefined),
            updated_at: new Date().toISOString(),
          };
          const { data: upsertedProfile, error: upsertError } = await withTimeout<PostgrestSingleResponse<UserProfile>>(
            Promise.resolve(supabase.from('user_profiles')
              .upsert(upsertData, { onConflict: 'id' })
              .select()
              .single()),
            10000, 
            'Profile upsert'
          );

          if (upsertError) {
            console.error('[PROFILE] Error upserting profile:', upsertError.message);
            throw upsertError;
          } else if (upsertedProfile) {
            console.log('[PROFILE] Successfully upserted profile');
            profile = upsertedProfile;
            break; 
          }
        } else {
          console.error('[PROFILE] Cannot upsert profile: Supabase user data unavailable.');
          throw new Error('Supabase user data unavailable for profile upsert');
        }
      } catch (attemptError) {
        console.warn(`[PROFILE] Attempt ${currentAttempt} failed:`, attemptError);
        if (currentAttempt >= MAX_PROFILE_FETCH_ATTEMPTS) {
          console.error('[PROFILE] All profile fetch/upsert attempts failed.');
          setProfileError('Unable to load your profile after multiple attempts. Please refresh the page or try again later.');
          setIsStateCorrupted(true); 
          break; 
        }
        console.log(`[PROFILE] Waiting ${retryDelay}ms before next attempt.`);
        await new Promise(res => setTimeout(res, retryDelay));
        retryDelay *= 2; 
      }
    } 

    setIsFetchingProfile(false); 

    if (profile) {
      console.log('[PROFILE] Setting user profile in state:', profile);
      setUserProfile(profile);
      setIsStateCorrupted(false); 
      setProfileError(null); 
      sessionStorage.removeItem('profileFetchAttempts'); 
      try {
        document.cookie = 'tt_auth_check=true; path=/; max-age=86400; SameSite=Lax';
        if (window.location.hostname.includes('travelling-technicians.ca')) {
          document.cookie = 'tt_auth_check=true; path=/; domain=.travelling-technicians.ca; max-age=86400; SameSite=Lax; Secure';
          document.cookie = 'tt_cross_domain=true; path=/; domain=.travelling-technicians.ca; max-age=86400; SameSite=Lax; Secure';
        }
      } catch (cookieErr) {
        console.error('[PROFILE] Error setting cookies:', cookieErr);
      }
      console.log('[PROFILE] Profile fetch process completed successfully.');
      return profile;
    }
    
    const finalSessionAttempts = parseInt(sessionStorage.getItem('profileFetchAttempts') || '0', 10);
    if (finalSessionAttempts >= MAX_PROFILE_FETCH_ATTEMPTS) { 
      const isProtectedPage = !['/auth/login', '/auth/register', '/auth/reset-password', '/'].some(p => 
        router.pathname.startsWith(p) || router.pathname === p
      );
      if (isProtectedPage) {
        console.error(`[PROFILE] Maximum profile fetch attempts (${MAX_PROFILE_FETCH_ATTEMPTS}) reached on protected page. User will be signed out.`);
        try {
          clearAuthStorage(); 
          await supabase.auth.signOut();
          if (router.pathname !== '/auth/login') { 
            router.push('/auth/login?error=profile_fetch_failed&reason=max_attempts'); 
          }
        } catch (signOutError) {
          console.error('[PROFILE] Error during auto-sign out after max attempts:', signOutError);
           if (typeof window !== 'undefined') window.location.href = '/auth/login?error=profile_fetch_critical&reason=signout_failure';
        }
      } else {
        console.log(`[PROFILE] Max attempts (${MAX_PROFILE_FETCH_ATTEMPTS}) reached but on non-protected page, not logging out. User can try refreshing.`);
      }
    }
    
    return null; 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setProfileError(null);
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.warn('Token refresh failed:', error);
        if (error.message.includes('NetworkError')) {
          setProfileError('Network error during token refresh. Please check your connection.');
        }
        return false;
      }
      if (data.session) {
        setUser(data.session.user);
        authStateVersion.current += 1;
        lastValidationTime.current = Date.now();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error in refreshSession:', err);
      setProfileError('An unexpected error occurred during session refresh.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forceSignOut = useCallback(async () => {
    console.warn('Using force sign out method - clearing all auth state');
    setIsLoading(true);
    setProfileError(null);
    clearAuthStorage();
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error during supabase signout in forceSignOut:', e);
    }
    setUser(null);
    setUserProfile(null);
    setIsStateCorrupted(false);
    if (router) {
      router.push('/');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    setIsLoading(false); // Ensure loading is set to false
  }, [router]);

  const recoverAuthState = useCallback(async (): Promise<boolean> => {
    const isHomePage = typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '');
    if (isHomePage) {
      console.log('Skipping auth recovery on homepage to prevent loops');
      sessionStorage.setItem('skipHomepageChecks', 'true');
      recoveryAttempts.current = 0;
      return false;
    }
    if (recoveryAttempts.current >= MAX_PROFILE_FETCH_ATTEMPTS) { // Use constant here too
      console.warn('Too many auth recovery attempts, forcing sign out');
      await forceSignOut();
      return false;
    }
    recoveryAttempts.current += 1;
    console.log(`Attempting auth state recovery (attempt ${recoveryAttempts.current})`);
    setProfileError(null); // Clear errors before attempting recovery

    try {
      const refreshed = await refreshSession();
      if (refreshed) {
        console.log('Successfully recovered session via refresh');
        recoveryAttempts.current = 0;
        const { data: refreshedSessionData } = await supabase.auth.getSession();
        if (refreshedSessionData.session?.user) {
            await fetchUserProfile(refreshedSessionData.session.user.id);
        }
        return true;
      }
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('authUser');
        const supabaseToken = localStorage.getItem('supabase.auth.token');
        if (storedUser && supabaseToken) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (validateAuthState(parsedUser)) {
              console.log('Recovered user from localStorage, validating with server');
              const { data: { user: serverUser } } = await supabase.auth.getUser(); 
              if (serverUser && serverUser.id === parsedUser.id) {
                setUser(serverUser);
                await fetchUserProfile(serverUser.id);
                recoveryAttempts.current = 0;
                return true;
              }
            }
          } catch (e) {
            console.error('Error parsing stored user during recovery:', e);
          }
        }
      }
      const isNonCriticalPage = router.pathname.includes('/auth/') || router.pathname === '/' || router.pathname === '';
      if (isNonCriticalPage) {
        recoveryAttempts.current = Math.max(0, recoveryAttempts.current - 1); // Decrement for non-critical pages to give more chances
      }
      return false;
    } catch (error) {
      console.error('Error in recoverAuthState:', error);
      setProfileError('Failed to recover authentication state.');
      return false;
    }
  }, [refreshSession, router.pathname, fetchUserProfile, forceSignOut]); // Added forceSignOut here

  const tryRecoverFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (validateAuthState(parsedUser)) {
            console.log('Recovering minimal user state from localStorage');
            setUser({ id: parsedUser.id, email: parsedUser.email }); 
            fetchUserProfile(parsedUser.id); 
            return true;
          }
        } catch (e) {
          console.error('Error parsing stored user:', e);
          setIsStateCorrupted(true); 
          setProfileError('Error reading authentication data from storage.');
        }
      }
    }
    return false;
  }, [fetchUserProfile]);

  // INITIAL AUTH STATE EFFECT (KEEP NEAR TOP IF POSSIBLE, AFTER ITS DEPENDENCIES ARE DEFINED)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      setIsLoading(true);
      setProfileError(null); // Clear errors on auth state change initially

      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          await recoverAuthState();
        }
      } else if (event === 'SIGNED_IN') {
        if (session?.user) {
          setUser(session.user);
          authStateVersion.current += 1;
          lastValidationTime.current = Date.now();
          await fetchUserProfile(session.user.id);
          setIsStateCorrupted(false);
          if (typeof window !== 'undefined') {
            updateAuthState({ id: session.user.id, email: session.user.email || '', version: authStateVersion.current, lastUpdated: Date.now() });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
        setIsStateCorrupted(false);
        setProfileError(null); // Clear profile error on sign out
        authStateVersion.current += 1;
        if (typeof window !== 'undefined') {
          clearAuthStorage();
        }
      } else if (event === 'USER_UPDATED' && session?.user) {
        setUser(session.user);
        authStateVersion.current += 1;
        lastValidationTime.current = Date.now();
        await fetchUserProfile(session.user.id); 
        setIsStateCorrupted(false);
        if (typeof window !== 'undefined') {
          updateAuthState({ id: session.user.id, email: session.user.email || '', version: authStateVersion.current, lastUpdated: Date.now() });
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user); 
        authStateVersion.current += 1;
        lastValidationTime.current = Date.now();
        setIsStateCorrupted(false);
      }
      setIsLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserProfile, recoverAuthState]); // Removed direct signOut dependency, forceSignOut is via recoverAuthState

  // ... (testRpcFunctionExists - seems fine as is, not a hook)
  const testRpcFunctionExists = async (): Promise<boolean> => {
    // ... (implementation as before)
    return false; // Ensure all paths return
  };
  
  const createUserProfile = useCallback(async (userId: string, email: string, fullName: string, phone?: string) => {
    setProfileError(null);
    try {
      const newProfileData: Partial<UserProfile> = { 
        id: userId, 
        email, 
        full_name: fullName || '', 
        phone: phone === null ? undefined : (phone || undefined), 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      };
      // Use upsert to handle potential race conditions or pre-existing profiles more gracefully.
      const { data, error } = await supabase.from('user_profiles').upsert(newProfileData, { onConflict: 'id' }).select().single();
      if (error) {
        console.error('Failed to create/upsert user profile:', error);
        setProfileError(`Failed to create profile: ${error.message}`);
        return null;
      }
      console.log('Successfully created/upserted user profile');
      setUserProfile(data as UserProfile); 
      sessionStorage.setItem('profileFetchAttempts', '0'); 
      return data as UserProfile;
    } catch (err: any) {
      console.error('Error in createUserProfile:', err);
      setProfileError(`An unexpected error occurred while creating profile: ${err.message}`);
      return null;
    }
  }, [setUserProfile]);
  
  // LOADING TIMEOUT EFFECT
  useEffect(() => {
    if (!isLoading) return;
    const timeout = setTimeout(() => {
      if (isLoading) { 
        console.warn('Auth loading state timed out, forcing reset');
        setIsLoading(false);
        const isHomePage = typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '');
        if (!isHomePage) {
          const recovered = tryRecoverFromStorage();
          if (!recovered) {
            recoverAuthState(); 
          }
        } else {
          console.log('Skipping auth recovery on homepage to prevent loops for timeout');
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('skipHomepageChecks', 'true');
            setTimeout(() => { sessionStorage.removeItem('skipHomepageChecks'); }, 30000);
          }
        }
      }
    }, 10000); 
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, recoverAuthState, tryRecoverFromStorage]);

  // CORRUPT USER STATE EFFECT
  useEffect(() => {
    const isHomepage = router.pathname === '/';
    const skipHomepageChecks = typeof window !== 'undefined' && sessionStorage.getItem('skipHomepageChecks') === 'true';
    if (isHomepage || skipHomepageChecks) return;
    
    if (user && !validateAuthState(user)) {
      console.error('Detected corrupted user state', user);
      setIsStateCorrupted(true);
      setProfileError('Authentication data is corrupted. Attempting to recover...');
      recoverAuthState();
    } else if (user && userProfile === null && !isLoading && !isFetchingProfile && !profileError) { // Only recover if no specific profile error is already set
      console.warn('User exists but profile fetch failed or incomplete, attempting recovery.');
      setIsStateCorrupted(true);
      setProfileError('Profile data is missing or incomplete. Attempting to recover...');
      recoverAuthState();
    } else if (user && userProfile) { 
      setIsStateCorrupted(false);
      // setProfileError(null); // Don't clear profile error here, might be set by other processes
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userProfile, isLoading, isFetchingProfile, router.pathname, recoverAuthState, profileError]);

  // PERIODIC SESSION VALIDATION EFFECT
  useEffect(() => {
    if (!user || router.pathname === '/') return;
    const validateInterval = 15 * 60 * 1000; // 15 minutes
    const sessionValidator = setInterval(async () => {
      if (Date.now() - lastValidationTime.current < validateInterval / 2 ) return;
      try {
        console.log('Performing periodic session validation');
        const { data: { user: serverUser } } = await supabase.auth.getUser();
        if (!serverUser && user) { 
          console.warn('Session validation failed - user no longer valid on server');
          setProfileError('Your session is no longer valid on the server. Attempting to recover...');
          await recoverAuthState();
        } else if (serverUser) {
          console.log('Session validation passed');
          lastValidationTime.current = Date.now();
          if (user?.id !== serverUser.id) { 
            console.error("CRITICAL: Local user ID doesn't match server user ID during validation!");
            setProfileError('Critical authentication mismatch. Forcing sign out.');
            await forceSignOut(); 
          } else {
            setUser(serverUser); 
          }
        }
      } catch (err) {
        console.error('Error in periodic validation:', err);
        setProfileError('Error during periodic session validation.');
      }
    }, validateInterval);
    return () => clearInterval(sessionValidator);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router.pathname, recoverAuthState, forceSignOut]);
  
  // NETWORK STATUS MONITORING EFFECT
  useEffect(() => {
    const handleOnline = async () => {
      console.log('Network connection restored');
      if (user) { 
        await refreshSession(); 
      } else {
        await recoverAuthState();
      }
    };
    if (typeof window !== 'undefined') window.addEventListener('online', handleOnline);
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('online', handleOnline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refreshSession, recoverAuthState]);

  // FETCH USER PROFILE ON USER CHANGE EFFECT (ensure this is after fetchUserProfile is defined)
  useEffect(() => {
    const isHomepage = router.pathname === '/';
    const skipHomepageChecks = typeof window !== 'undefined' && sessionStorage.getItem('skipHomepageChecks') === 'true';
    if (!user || isHomepage || skipHomepageChecks || !user.id) { 
        if(user && !user.id) console.warn("[PROFILE] User object present but user.id is missing, skipping profile fetch.");
        return;
    }
    if (!userProfile && !isFetchingProfile && !profileError) { // Only fetch if no profile, not already fetching, and no existing error
        fetchUserProfile(user.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userProfile, isFetchingProfile, profileError, router.pathname, fetchUserProfile]);

  const refreshProfile = useCallback(async () => {
    if (user && user.id) { 
      console.log('[PROFILE] Manual profile refresh requested.');
      setProfileError(null); // Clear previous errors before manual refresh
      await fetchUserProfile(user.id);
    }
  }, [user, fetchUserProfile]);

  // linkBookingToUserId must be defined before signIn and signUp if it's a dependency
  const linkBookingToUserId = useCallback(async (referenceNumber: string, userId: string, email: string) => {
    try {
      const { data, error } = await supabase.from('bookings').update({ user_id: userId }).match({ reference_number: referenceNumber }).select();
      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error linking booking to user:', error);
      return 0;
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setProfileError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      authStateVersion.current += 1;
      lastValidationTime.current = Date.now();
      const pendingBookingRef = sessionStorage.getItem('pendingBookingReference');
      if (pendingBookingRef && data.user) {
        await linkBookingToUserId(pendingBookingRef, data.user.id, email);
        sessionStorage.removeItem('pendingBookingReference');
      }
      // User & profile will be set by onAuthStateChange
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      setProfileError(error.message || 'Failed to log in');
      return { success: false, error: error.message || 'Failed to log in' };
    } finally {
      setIsLoading(false);
    }
  }, [linkBookingToUserId]);

  const signUp = useCallback(async (email: string, password: string, fullName: string, phone?: string) => {
    setIsLoading(true);
    setProfileError(null);
    try {
      const { data: existingUser } = await supabase.from('user_profiles').select('email').eq('email', email).maybeSingle();
      if (existingUser) {
        return { success: false, error: 'An account with this email already exists. Please try logging in.' };
      }

      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: fullName, phone }, emailRedirectTo: `${getSiteUrl()}/auth/callback` },
      });
      if (error) throw error;
      
      if (data.user) {
         // createUserProfile will be called by onAuthStateChange logic via fetchUserProfile if it finds no profile or upserts.
         // Forcing it here could be redundant but ensures immediate profile availability if desired.
         // await createUserProfile(data.user.id, data.user.email!, fullName, phone); 
        const pendingBookingRef = sessionStorage.getItem('pendingBookingReference');
        if (pendingBookingRef) {
          await linkBookingToUserId(pendingBookingRef, data.user.id, email);
          sessionStorage.removeItem('pendingBookingReference');
        }
      }
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      setProfileError(error.message || 'Failed to create account');
      return { success: false, error: error.message || 'Failed to create account' };
    } finally {
      setIsLoading(false);
    }
  }, [linkBookingToUserId]); // Removed createUserProfile from dependencies

  const signOut = useCallback(async (silent: boolean = false) => {
    setIsLoading(true);
    setProfileError(null); 
    try {
      clearAuthStorage();
      await supabase.auth.signOut();
      if (!silent) {
        setTimeout(() => {
            if(router) router.push('/'); else if (typeof window !== 'undefined') window.location.href = '/';
        }, 50);
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      setProfileError(error.message || 'Error during sign out.');
      await forceSignOut(); // Fallback to force sign out on error
    } finally {
      // setIsLoading(false); // onAuthStateChange should handle this for consistency
    }
  }, [router, forceSignOut]); // Added forceSignOut to dependencies

  const linkBookingsToAccount = useCallback(async (email: string) => {
    if (!user || !user.id) return 0;
    setProfileError(null);
    try {
      const { data, error } = await supabase.from('bookings').update({ user_id: user.id }).match({ customer_email: email, user_id: null }).select();
      if (error) {
        setProfileError(error.message || 'Error linking bookings.');
        throw error;
      }
      return data?.length || 0;
    } catch (error: any) {
      console.error('Error linking bookings to account:', error);
      if (!profileError) setProfileError(error.message || 'Error linking bookings to account.');
      return 0;
    }
  }, [user, profileError]);

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
    profileError, 
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