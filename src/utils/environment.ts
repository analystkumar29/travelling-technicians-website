/**
 * Environment detection utilities
 */

/**
 * Check if code is running on the server
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Check if code is running in the browser
 */
export function isBrowser(): boolean {
  return !isServer();
}

/**
 * Check if the app is running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if the app is running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Get the base URL for the application
 */
export function getBaseUrl(): string {
  if (isServer()) {
    // Server-side: use environment variable or default
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }
  
  // Client-side: use window.location
  const protocol = window.location.protocol;
  const host = window.location.host;
  return `${protocol}//${host}`;
} 