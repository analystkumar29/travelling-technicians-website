import { supabase } from './supabaseClient';

/**
 * Auth State Protection Utilities
 * 
 * These utilities help prevent and recover from auth state corruption
 * by implementing validation, normalization, and recovery mechanisms.
 */

export interface AuthState {
  id: string;
  email: string;
  version?: number;
  lastUpdated?: number;
}

/**
 * Normalize authentication state to ensure consistent structure
 */
export const normalizeAuthState = (user: any): AuthState | null => {
  if (!user) return null;
  
  // Handle potentially corrupted state
  if (!user.id || !user.email || user.id === 'undefined' || user.id === 'null') {
    return null;
  }
  
  // Create normalized state structure
  return {
    id: user.id,
    email: user.email,
    version: user.version || 1,
    lastUpdated: user.lastUpdated || Date.now()
  };
};

/**
 * Validate an auth token against Supabase without exposing sensitive details
 */
export const validateAuthToken = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error validating auth token:', err);
    return false;
  }
};

/**
 * Handle network errors by implementing retry logic
 */
export const withNetworkRetry = async <T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let retries = 0;
  
  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      retries++;
      
      // If we've hit max retries or it's not a network error, rethrow
      if (retries >= maxRetries || 
          !isNetworkError(error)) {
        throw error;
      }
      
      // Exponential backoff
      const delay = delayMs * Math.pow(2, retries - 1);
      console.log(`Network error, retrying in ${delay}ms (attempt ${retries}/${maxRetries})`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Check if an error is network-related
 */
const isNetworkError = (error: any): boolean => {
  return (
    error.message?.includes('Failed to fetch') ||
    error.message?.includes('Network request failed') ||
    error.message?.includes('network') ||
    error.message?.includes('timeout') ||
    error.message?.includes('connection') ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ECONNRESET' ||
    error.code === 'ETIMEDOUT'
  );
};

/**
 * Clear all auth-related browser storage
 */
export const clearAuthStorage = (): void => {
  if (typeof window === 'undefined') return;
  
  // Clear specific auth items
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('authUser');
  sessionStorage.removeItem('authRedirectPath');
  
  // Clear any potential auth-related items
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.includes('auth') || key.includes('user') || 
          key.includes('session') || key.includes('token') || 
          key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
    
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('auth') || key.includes('user') || 
          key.includes('session') || key.includes('token') || 
          key.includes('supabase')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error('Error clearing storage:', e);
  }
};

/**
 * Transaction-based storage update for auth state
 */
export const updateAuthState = (state: AuthState): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Get current state for comparison
    const currentRaw = localStorage.getItem('authUser');
    let current: AuthState | null = null;
    
    if (currentRaw) {
      try {
        current = JSON.parse(currentRaw);
      } catch (e) {
        console.error('Error parsing current auth state:', e);
      }
    }
    
    // Don't update with older version
    if (current && current.version && state.version && current.version > state.version) {
      console.warn('Rejected auth state update: newer version exists');
      return false;
    }
    
    // Update with transaction-like approach
    const normalized = normalizeAuthState(state);
    if (!normalized) return false;
    
    // Add version and timestamp
    normalized.version = (current?.version || 0) + 1;
    normalized.lastUpdated = Date.now();
    
    // Save atomically
    localStorage.setItem('authUser', JSON.stringify(normalized));
    return true;
  } catch (e) {
    console.error('Error updating auth state:', e);
    return false;
  }
}; 