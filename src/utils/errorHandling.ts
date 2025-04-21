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
 * Safely fetch data with error handling
 */
export const safeFetch = async <T>(
  url: string, 
  options?: RequestInit,
  fallback: T | null = null
): Promise<{ data: T | null; error: Error | null }> => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Fetch Error:', error);
    // You could log this to an error tracking service
    return { 
      data: fallback, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
};

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
 * Global unhandled error handler
 */
export const setupGlobalErrorHandlers = () => {
  if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      // You could log this to an error tracking service
      // reportError('unhandledrejection', event.reason);
      
      // Optionally prevent the default browser behavior
      // event.preventDefault();
    });

    // Handle uncaught exceptions
    window.addEventListener('error', (event) => {
      console.error('Uncaught Error:', event.error);
      // You could log this to an error tracking service
      // reportError('uncaughtError', event.error);
      
      // Optionally prevent the default browser behavior
      // event.preventDefault();
    });
  }
}; 