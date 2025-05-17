/**
 * Enhanced error handling utilities for The Travelling Technicians Website
 */

import { isServer } from './environment';

/**
 * Safe JSON parsing with error handling
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('JSON Parse Error:', error);
    // You could log this to an error tracking service
    return fallback;
  }
};

/**
 * Safely access properties that might be undefined
 * @param accessFn Function that accesses potentially undefined properties
 * @param defaultValue Default value to return if an error occurs
 * @returns The result of accessFn or defaultValue if an error occurs
 */
export function safeRouterAccess<T, D>(accessFn: () => T, defaultValue: D): T | D {
  try {
    const result = accessFn();
    return result === undefined || result === null ? defaultValue : result;
  } catch (error) {
    console.warn('Safe access error:', error);
    return defaultValue;
  }
}

/**
 * Safe fetch wrapper with error handling
 */
export async function safeFetch(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

/**
 * Create a error report payload for tracking
 */
export const createErrorReport = (error: Error, context: Record<string, any> = {}) => {
  return {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : '',
    context
  };
};

/**
 * Handle Image loading errors
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>, fallbackSrc: string) => {
  const img = event.currentTarget;
  img.onerror = null; // Prevent infinite loop
  img.src = fallbackSrc;
};

/**
 * Check if an error is Next.js router related
 */
export const isNextJsRouterError = (error: Error | string): boolean => {
  const message = typeof error === 'string' ? error : error.message;
  
  // Common Next.js router error patterns
  const routerErrorPatterns = [
    'Cannot read properties of undefined (reading \'data\')',
    'Cannot read property \'data\' of undefined',
    'router.isFallback is undefined',
    'Cannot read properties of null',
    'router.query is undefined',
    'Expected router.query to be populated',
    'Element type is invalid',
    'Error loading chunks',
    'Failed to load script',
    'Minified React error #423',
    'ChunkLoadError'
  ];
  
  return routerErrorPatterns.some(pattern => message.includes(pattern));
};

/**
 * Set up global error handlers for the application
 */
export function setupGlobalErrorHandlers() {
  if (isServer()) return; // Only run in browser
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Prevent the default browser behavior (console error)
    event.preventDefault();
  });
  
  // Handle global errors
  window.addEventListener('error', (event) => {
    // Filter out router-related errors which are handled separately
    if (event.error && 
        (event.message.includes('Cannot read properties of undefined') ||
         event.message.includes('state is null') || 
         event.message.includes('data of undefined'))) {
      
      console.warn('Suppressed Next.js router error:', event.message);
      // Prevent the default browser behavior for these errors
      event.preventDefault();
      return;
    }
    
    console.error('Global error:', event.message);
  });
  
  // Patch window.onerror for older browsers
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    // Let the event listener handle it first
    
    // Filter out router-related errors
    if (message && typeof message === 'string' && 
        (message.includes('Cannot read properties of undefined') ||
         message.includes('state is null') || 
         message.includes('data of undefined'))) {
      
      console.warn('Suppressed Next.js router error:', message);
      return true; // Prevent default browser behavior
    }
    
    // Call original handler if exists
    if (originalOnError) {
      return originalOnError.call(window, message, source, lineno, colno, error);
    }
    
    return false; // Let browser handle normally
  };
  
  console.log('Global error handlers configured');
} 