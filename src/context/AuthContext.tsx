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
  const router = useRouter();
  const recoveryAttempts = useRef(0);
  const lastValidationTime = useRef<number>(Date.now());
  const authStateVersion = useRef<number>(0);
  
  // Define fetchUserProfile first as it's used by others
  const fetchUserProfile = useCallback(async (userId: string) => {
    if (!userId) {
      console.error('[PROFILE] Cannot fetch profile: userId is missing');
      setIsFetchingProfile(false); // Ensure this is set early on error
      return null;
    }
    
    console.log(`[PROFILE] Starting profile fetch process for user ${userId.slice(0,6)}...`);
    setIsFetchingProfile(true);
    setIsStateCorrupted(false); // Reset corruption state at the beginning of a fetch

    let profile: UserProfile | null = null; // Explicitly type profile
    let currentAttempt = 0;
    let retryDelay = INITIAL_RETRY_DELAY;

    // Respect sessionStorage attempts but cap with our constant for the loop
    const sessionAttempts = parseInt(sessionStorage.getItem('profileFetchAttempts') || '0', 10);
    
    if (user?.id && router.pathname.includes('/auth/callback')) {
      console.log('[PROFILE] Auth callback detected, resetting fetch attempts in session storage.');
      sessionStorage.removeItem('profileFetchAttempts');
    }

    while (currentAttempt < MAX_PROFILE_FETCH_ATTEMPTS) {
      currentAttempt++;
      // Update session storage for external visibility/consistency if needed, but loop respects MAX_PROFILE_FETCH_ATTEMPTS
      sessionStorage.setItem('profileFetchAttempts', Math.max(sessionAttempts, currentAttempt).toString());
      console.log(`[PROFILE] Fetch attempt ${currentAttempt}/${MAX_PROFILE_FETCH_ATTEMPTS}`);

      // --- Helper: Timeout for promises ---
      const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = 7000, name = 'operation'): Promise<T> => { // Increased default timeout
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
          throw err; // Re-throw to be caught by the main try-catch of the attempt
        } finally {
          if (timeoutId) clearTimeout(timeoutId);
        }
      };

      // --- Helper: Retry with backoff for connection test ---
      const retryConnectionTest = async (fn: () => Promise<any>, retries = 2, delay = 1500) => { // Reduced retries for connection test
        let lastError;
        for (let i = 0; i < retries; i++) {
          try {
            return await fn();
          } catch (err) {
            lastError = err;
            console.warn(`[PROFILE] Connection test attempt ${i + 1} failed:`, err);
            if (i < retries -1) await new Promise(res => setTimeout(res, delay * (i + 1)));
          }
        }
        throw lastError;
      };
      
      try {
        // --- Connection Test (Optional, can be less aggressive) ---
        try {
          console.log('[PROFILE] Testing database connection...');
          await retryConnectionTest(
            () => withTimeout(
              Promise.resolve(supabase.from('user_profiles').select('count', { count: 'exact' }).limit(1)), // Wrapped in Promise.resolve
              3000, // Shorter timeout for connection test
              'Connection test'
            ),
            2, 1000 // Fewer retries, shorter initial delay for connection test
          );
          console.log('[PROFILE] Database connection seems OK.');
        } catch (connErr) {
          console.warn('[PROFILE] Database connection test failed:', connErr);
        }

        // --- Attempt to fetch existing profile ---
        console.log('[PROFILE] Trying direct profile query...');
        const fetchedProfileResponse = await withTimeout<PostgrestSingleResponse<UserProfile>>(
          Promise.resolve(supabase.from('user_profiles').select('*').eq('id', userId).single()), // Wrapped
          7000, // Main operation timeout
          'Direct profile query'
        );
        const { data: fetchedProfile, error: queryError } = fetchedProfileResponse;

        if (queryError) {
          console.error('[PROFILE] Direct query error:', queryError.message, queryError.code);
          if (queryError.code !== 'PGRST116') { // PGRST116: Row not found
            // For other errors, it might be a more significant issue.
            // Consider if setIsStateCorrupted(true) is appropriate here or if retry should handle it.
          }
        } else if (fetchedProfile) {
          console.log('[PROFILE] Successfully fetched profile via direct query');
          profile = fetchedProfile;
          break; // Profile found, exit loop
        } else {
          console.log('[PROFILE] No profile found via direct query, will attempt creation.');
        }

        // --- If not found, attempt to create profile ---
        if (!profile) {
          console.log('[PROFILE] Attempting to create profile...');
          const authUserResponse = await withTimeout<UserResponse>(
            Promise.resolve(supabase.auth.getUser()), // Wrapped
            5000, 'Auth getUser for creation'
          );
          // const { user: authUserData, error: authUserError } = authUserResponse; // Original line
          // Correctly access data and error from UserResponse
          const authUserData = authUserResponse.data.user;
          const authUserError = authUserResponse.error;

          if (authUserError) {
            console.error('[PROFILE] Error getting user data for profile creation:', authUserError.message);
            throw authUserError; 
          } else if (authUserData) { 
            console.log('[PROFILE] User exists in auth, proceeding with profile record creation.');
            const newProfileResponse = await withTimeout<PostgrestSingleResponse<UserProfile>>(
              Promise.resolve(supabase.from('user_profiles') // Wrapped
                .insert([{
                  id: userId,
                  email: authUserData.email!, // Added non-null assertion, as if authUserData exists, email should too
                  full_name: authUserData.user_metadata?.full_name || '',
                }])
                .select('*')
                .single()),
              7000, // Main operation timeout
              'Profile creation'
            );
            const { data: newProfile, error: insertError } = newProfileResponse;

            if (insertError) {
              if (insertError.code === '23505' || (insertError.message && insertError.message.includes('duplicate key value'))) {
                console.warn('[PROFILE] Duplicate key on insert, attempting to re-fetch.');
                const existingProfileAfterDuplicateResponse = await withTimeout<PostgrestSingleResponse<UserProfile>>(
                  Promise.resolve(supabase.from('user_profiles').select('*').eq('id', userId).single()), // Wrapped
                  5000, 'Fetch existing after duplicate key'
                );
                const { data: existingProfileAfterDuplicate, error: fetchExistingError } = existingProfileAfterDuplicateResponse;

                if (fetchExistingError) {
                  console.error('[PROFILE] Failed to fetch existing profile after duplicate key:', fetchExistingError.message);
                  // Propagate error to trigger retry or failure of this attempt
                  throw fetchExistingError;
                } else if (existingProfileAfterDuplicate) {
                  console.log('[PROFILE] Successfully fetched existing profile after duplicate key error.');
                  profile = existingProfileAfterDuplicate;
                  break; // Profile found, exit loop
                } else {
                   console.error('[PROFILE] Profile still not found after duplicate key error and re-fetch.');
                   // Let it fall through to retry logic or attempt failure
                }
              } else {
                console.error('[PROFILE] Error creating profile:', insertError.message);
                // Propagate error to trigger retry or failure of this attempt
                throw insertError;
              }
            } else if (newProfile) {
              console.log('[PROFILE] Successfully created new profile');
              profile = newProfile;
              break; // Profile created, exit loop
            }
          } else {
            console.error('[PROFILE] Cannot create profile: Supabase user data unavailable.');
            // This indicates a problem, fail this attempt.
            throw new Error('Supabase user data unavailable for profile creation');
          }
        }
      } catch (attemptError) {
        console.warn(`[PROFILE] Attempt ${currentAttempt} failed:`, attemptError);
        if (currentAttempt >= MAX_PROFILE_FETCH_ATTEMPTS) {
          console.error('[PROFILE] All profile fetch/create attempts failed.');
          // Optionally set isStateCorrupted(true) here if all attempts fail
          // The existing logic outside the loop for max attempts will handle redirection.
          break; // Exit loop, all attempts used
        }
        // Wait before next retry
        console.log(`[PROFILE] Waiting ${retryDelay}ms before next attempt.`);
        await new Promise(res => setTimeout(res, retryDelay));
        retryDelay *= 2; // Exponential backoff
      }
    } // End of while loop

    setIsFetchingProfile(false); // Set to false after all attempts or success

    if (profile) {
      console.log('[PROFILE] Setting user profile in state:', profile);
      setUserProfile(profile);
      setIsStateCorrupted(false); // Explicitly set to false on success
      sessionStorage.removeItem('profileFetchAttempts'); // Clear session attempts on success
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
    
    // This block executes if profile is still null after all loop attempts
    // The session 'profileFetchAttempts' is updated inside the loop.
    const finalSessionAttempts = parseInt(sessionStorage.getItem('profileFetchAttempts') || '0', 10);
    if (finalSessionAttempts >= MAX_PROFILE_FETCH_ATTEMPTS) { // Check against our defined max
      const isProtectedPage = !['/auth/login', '/auth/register', '/auth/reset-password', '/'].some(p => 
        router.pathname.startsWith(p) || router.pathname === p
      );
      if (isProtectedPage) {
        console.error(`[PROFILE] Maximum profile fetch attempts (${MAX_PROFILE_FETCH_ATTEMPTS}) reached on protected page, initiating sign out.`);
        // Don't remove 'profileFetchAttempts' here, so other parts of app can see it failed max times
        // Consider calling forceSignOut directly if available and appropriate
        // Using existing signOut logic which should redirect.
        signOut(true).then(() => { // silent signout
             if (router.pathname !== '/auth/login') { // Prevent loop if already there
                router.push('/auth/login?error=profile_fetch_failed'); 
             }
        });
      } else {
        console.log(`[PROFILE] Max attempts (${MAX_PROFILE_FETCH_ATTEMPTS}) reached but on non-protected page, not logging out. Current attempts in session: ${finalSessionAttempts}`);
        // Optionally reset session attempts for non-protected pages if desired
        // sessionStorage.setItem('profileFetchAttempts', '0'); 
      }
    }
    
    return null; // Explicitly return null if no profile was fetched or created
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]); // Removed signOut from dependencies, and disabled lint warning for this line

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.warn('Token refresh failed:', error);
        return false;
      }
      if (data.session) {
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

  // Define forceSignOut before recoverAuthState
  const forceSignOut = useCallback(async () => {
    try {
      console.warn('Using force sign out method - clearing all auth state');
      setIsLoading(true);
      clearAuthStorage();
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Error during supabase signout:', e);
      }
      setUser(null);
      setUserProfile(null);
      setIsStateCorrupted(false);
      // Ensure router is available or use window.location.href
      if (router) {
        router.push('/');
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Force sign out error:', error);
      window.location.href = '/'; // Fallback
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const recoverAuthState = useCallback(async (): Promise<boolean> => {
    const isHomePage = typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '');
    if (isHomePage) {
      console.log('Skipping auth recovery on homepage to prevent loops');
      sessionStorage.setItem('skipHomepageChecks', 'true');
      recoveryAttempts.current = 0;
      return false;
    }
    if (recoveryAttempts.current > 5) {
      console.warn('Too many recovery attempts, forcing sign out');
      await forceSignOut();
      return false;
    }
    recoveryAttempts.current += 1;
    console.log(`Attempting auth state recovery (attempt ${recoveryAttempts.current})`);
    try {
      const refreshed = await refreshSession();
      if (refreshed) {
        console.log('Successfully recovered session via refresh');
        recoveryAttempts.current = 0;
        // Session refreshed, user state will be set, now fetch profile
        const { data: refreshedSessionData } = await supabase.auth.getSession();
        if (refreshedSessionData.session?.user) {
            await fetchUserProfile(refreshedSessionData.session.user.id);
        }
        return true;
      }
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('authUser');
        const supabaseToken = localStorage.getItem('supabase.auth.token'); // Ensure this key is correct
        if (storedUser && supabaseToken) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (validateAuthState(parsedUser)) {
              console.log('Recovered user from localStorage, validating with server');
              const { data: { user: serverUser } } = await supabase.auth.getUser(); // Destructure correctly
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
        recoveryAttempts.current = Math.max(0, recoveryAttempts.current - 1);
      }
      return false;
    } catch (error) {
      console.error('Error in recoverAuthState:', error);
      return false;
    }
  }, [refreshSession, router.pathname, fetchUserProfile, forceSignOut]);

  const tryRecoverFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (validateAuthState(parsedUser)) {
            console.log('Recovering minimal user state from localStorage');
            setUser({ id: parsedUser.id, email: parsedUser.email }); // Set minimal user
            fetchUserProfile(parsedUser.id); // Attempt to fetch full profile
            return true;
          }
        } catch (e) {
          console.error('Error parsing stored user:', e);
          setIsStateCorrupted(true); // If parsing fails, state might be corrupted
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
      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
           // Only call recoverAuthState if there's no initial session.
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
        authStateVersion.current += 1;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token'); // Standard key
          localStorage.removeItem('authUser'); // Your custom key
          sessionStorage.removeItem('authRedirectPath');
          clearAuthStorage(); // Clear all known auth keys
        }
      } else if (event === 'USER_UPDATED' && session?.user) {
        setUser(session.user);
        authStateVersion.current += 1;
        lastValidationTime.current = Date.now();
        await fetchUserProfile(session.user.id); // Re-fetch profile on user update
        setIsStateCorrupted(false);
        if (typeof window !== 'undefined') {
          updateAuthState({ id: session.user.id, email: session.user.email || '', version: authStateVersion.current, lastUpdated: Date.now() });
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user); // Update user object with potentially new metadata
        authStateVersion.current += 1;
        lastValidationTime.current = Date.now();
        setIsStateCorrupted(false);
        // Optionally re-fetch profile if critical user data might change with token refresh
        // await fetchUserProfile(session.user.id); 
      }
      setIsLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [recoverAuthState, fetchUserProfile]);

  // ... (testRpcFunctionExists - seems fine as is, not a hook)
  const testRpcFunctionExists = async (): Promise<boolean> => {
    // ... (implementation as before)
    return false; // Ensure all paths return
  };
  
  const createUserProfile = useCallback(async (userId: string, email: string, fullName: string, phone?: string) => {
    try {
      // No need to check user from state here, as we pass required info.
      const newProfileData = { id: userId, email: email, full_name: fullName, phone: phone || null };
      const { data, error } = await supabase.from('user_profiles').insert(newProfileData).select().single();
      if (error) {
        console.error('Failed to create user profile:', error);
        return null;
      }
      console.log('Successfully created user profile');
      setUserProfile(data); // Update profile state
      sessionStorage.setItem('profileFetchAttempts', '0'); // Reset on successful creation
      return data;
    } catch (err) {
      console.error('Error in createUserProfile:', err);
      return null;
    }
  }, [setUserProfile]);
  
  // LOADING TIMEOUT EFFECT
  useEffect(() => {
    if (!isLoading) return;
    const timeout = setTimeout(() => {
      if (isLoading) { // Check isLoading again inside timeout
        console.warn('Auth loading state timed out, forcing reset');
        setIsLoading(false);
        const isHomePage = typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '');
        if (!isHomePage) {
          const recovered = tryRecoverFromStorage();
          if (!recovered) {
            recoverAuthState(); // Call recoverAuthState if tryRecoverFromStorage fails
          }
        } else {
          console.log('Skipping auth recovery on homepage to prevent loops');
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('skipHomepageChecks', 'true');
            setTimeout(() => { sessionStorage.removeItem('skipHomepageChecks'); }, 30000);
          }
        }
      }
    }, 10000); // 10-second timeout
    return () => clearTimeout(timeout);
  }, [isLoading, recoverAuthState, tryRecoverFromStorage]);

  // CORRUPT USER STATE EFFECT
  useEffect(() => {
    const isHomepage = router.pathname === '/';
    const skipHomepageChecks = typeof window !== 'undefined' && sessionStorage.getItem('skipHomepageChecks') === 'true';
    if (isHomepage || skipHomepageChecks) return;
    
    if (user && !validateAuthState(user)) {
      console.error('Detected corrupted user state', user);
      setIsStateCorrupted(true);
      recoverAuthState();
    } else if (user && userProfile === null && !isLoading && !isFetchingProfile) { // Also check isFetchingProfile
      console.warn('User exists but profile fetch failed or incomplete, possible corruption');
      setIsStateCorrupted(true);
      recoverAuthState();
    } else if (user && userProfile) { // If user and profile exist, state is not corrupted
      setIsStateCorrupted(false);
    }
  }, [user, userProfile, isLoading, isFetchingProfile, router.pathname, recoverAuthState]);

  // PERIODIC SESSION VALIDATION EFFECT
  useEffect(() => {
    if (!user || router.pathname === '/') return;
    const validateInterval = 15 * 60 * 1000; // 15 minutes
    const sessionValidator = setInterval(async () => {
      if (Date.now() - lastValidationTime.current < validateInterval / 2 ) return; // Check more frequently if needed, or reduce interval
      try {
        console.log('Performing periodic session validation');
        const { data: { user: serverUser } } = await supabase.auth.getUser();
        if (!serverUser && user) { // If local user exists but server session is gone
          console.warn('Session validation failed - user no longer valid on server');
          await recoverAuthState();
        } else if (serverUser) {
          console.log('Session validation passed');
          lastValidationTime.current = Date.now();
          if (user?.id !== serverUser.id) { // If server user ID doesn't match local, critical issue
            console.error("CRITICAL: Local user ID doesn't match server user ID during validation!");
            await forceSignOut(); // Force sign out and reset
          } else {
            setUser(serverUser); // Refresh local user state with latest from server
          }
        }
      } catch (err) {
        console.error('Error in periodic validation:', err);
        // Consider calling recoverAuthState here too on error
      }
    }, validateInterval);
    return () => clearInterval(sessionValidator);
  }, [user, router.pathname, recoverAuthState, forceSignOut]);
  
  // NETWORK STATUS MONITORING EFFECT
  useEffect(() => {
    const handleOnline = async () => {
      console.log('Network connection restored');
      if (user) { // If there was a user
        await refreshSession(); // Attempt to refresh session
        // Optionally, re-fetch profile if critical
        // await fetchUserProfile(user.id);
      } else {
        // If no user, maybe try to recover initial state
        await recoverAuthState();
      }
    };
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [user, refreshSession, recoverAuthState]);

  // FETCH USER PROFILE ON USER CHANGE EFFECT (ensure this is after fetchUserProfile is defined)
  useEffect(() => {
    const isHomepage = router.pathname === '/';
    const skipHomepageChecks = typeof window !== 'undefined' && sessionStorage.getItem('skipHomepageChecks') === 'true';
    if (!user || isHomepage || skipHomepageChecks || !user.id) { // also check user.id
        // If user object exists but no id, something is wrong, don't fetch.
        if(user && !user.id) console.warn("[PROFILE] User object present but user.id is missing, skipping profile fetch.");
        return;
    }
    fetchUserProfile(user.id);
  }, [user, router.pathname, fetchUserProfile]);

  const refreshProfile = useCallback(async () => {
    if (user && user.id) { // also check user.id
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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // User will be set by onAuthStateChange, which will then trigger fetchUserProfile
      authStateVersion.current += 1;
      lastValidationTime.current = Date.now();
      const pendingBookingRef = sessionStorage.getItem('pendingBookingReference');
      if (pendingBookingRef && data.user) {
        await linkBookingToUserId(pendingBookingRef, data.user.id, email);
        sessionStorage.removeItem('pendingBookingReference');
      }
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Failed to log in' };
    }
  }, [linkBookingToUserId]);

  const signUp = useCallback(async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const { data: existingProfiles } = await supabase.from('user_profiles').select('email').eq('email', email).limit(1);
      if (existingProfiles && existingProfiles.length > 0) {
        throw new Error('Email already exists. Please use a different email or sign in with your existing account.');
      }
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { full_name: fullName, phone }, emailRedirectTo: `${getSiteUrl()}/auth/callback` },
      });
      if (error) throw error;
      
      // Profile creation will be handled by onAuthStateChange via fetchUserProfile if it finds no profile.
      // However, if you want to ensure profile is created immediately with metadata from signUp:
      if (data.user) {
         await createUserProfile(data.user.id, data.user.email!, fullName, phone);
        const pendingBookingRef = sessionStorage.getItem('pendingBookingReference');
        if (pendingBookingRef) {
          await linkBookingToUserId(pendingBookingRef, data.user.id, email);
          sessionStorage.removeItem('pendingBookingReference');
        }
      }
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Failed to create account' };
    }
  }, [createUserProfile, linkBookingToUserId]);

  const signOut = useCallback(async (silent: boolean = false) => {
    try {
      setIsLoading(true);
      // onAuthStateChange will handle setUser(null) and setUserProfile(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('authUser');
        sessionStorage.removeItem('authRedirectPath');
        clearAuthStorage();
      }
      authStateVersion.current += 1; // Increment version before Supabase call
      await supabase.auth.signOut(); // This will trigger onAuthStateChange
      if (!silent) {
        // Add a small delay before redirecting to ensure state is cleared by onAuthStateChange
        setTimeout(() => {
            if(router) router.push('/'); else window.location.href = '/';
        }, 50);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      await forceSignOut(); // Fallback to force sign out
    } finally {
      // setIsLoading(false); // onAuthStateChange will set isLoading to false
    }
  }, [router, forceSignOut]);

  const linkBookingsToAccount = useCallback(async (email: string) => {
    if (!user || !user.id) return 0;
    try {
      const { data, error } = await supabase.from('bookings').update({ user_id: user.id }).match({ customer_email: email, user_id: null }).select();
      if (error) throw error;
      // Optionally, refresh profile or bookings list here
      return data?.length || 0;
    } catch (error) {
      console.error('Error linking bookings to account:', error);
      return 0;
    }
  }, [user]);


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