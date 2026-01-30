/**
 * Authentication utilities for admin panel
 * Handles token storage, retrieval, and API request headers
 */

const TOKEN_STORAGE_KEY = 'authToken';

/**
 * Store authentication token in localStorage
 */
export function storeAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch (error) {
      console.error('Failed to store auth token:', error);
    }
  }
}

/**
 * Retrieve authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to retrieve auth token:', error);
      return null;
    }
  }
  return null;
}

/**
 * Remove authentication token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove auth token:', error);
    }
  }
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return !!token && token.trim() !== '';
}

/**
 * Get authentication headers for API requests
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`
  };
}

/**
 * Make authenticated fetch request
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    'Content-Type': 'application/json'
  };
  
  return fetch(url, {
    ...options,
    headers
  });
}

/**
 * Handle authentication errors
 * Redirects to login page if token is invalid or expired
 */
export function handleAuthError(response: Response): boolean {
  if (response.status === 401 || response.status === 403) {
    // Clear invalid token
    removeAuthToken();
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    
    return true;
  }
  
  return false;
}

/**
 * Validate token format (basic validation)
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Basic JWT format validation (three parts separated by dots)
  const parts = token.split('.');
  return parts.length === 3;
}

/**
 * Check token expiration (basic check)
 * Note: This only checks the expiration claim if we decode it
 * For proper validation, use the verifyToken function from the API
 */
export function isTokenExpired(token: string): boolean {
  if (!isValidTokenFormat(token)) {
    return true;
  }
  
  try {
    // Decode the payload (second part of JWT)
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check expiration time
    if (decodedPayload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedPayload.exp < currentTime;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return true;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): number | null {
  if (!isValidTokenFormat(token)) {
    return null;
  }
  
  try {
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    
    return decodedPayload.exp || null;
  } catch (error) {
    console.error('Failed to decode token expiration:', error);
    return null;
  }
}

/**
 * Refresh token if needed
 * This would typically call a refresh endpoint
 */
export async function refreshTokenIfNeeded(): Promise<string | null> {
  const token = getAuthToken();
  
  if (!token) {
    return null;
  }
  
  // Check if token is expired or about to expire (within 5 minutes)
  const expiration = getTokenExpiration(token);
  if (expiration) {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiration = expiration - currentTime;
    
    // If token expires in less than 5 minutes, try to refresh
    if (timeUntilExpiration < 300) {
      try {
        // In a real implementation, you would call a refresh endpoint
        // For now, we'll just return the current token
        console.warn('Token nearing expiration, refresh implementation needed');
        return token;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        removeAuthToken();
        return null;
      }
    }
  }
  
  return token;
}