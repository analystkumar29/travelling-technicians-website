import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('apiUtils');

/**
 * Standard response type for API calls
 */
export interface ApiCallResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Safely fetch data from an API endpoint
 */
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiCallResponse<T>> {
  try {
    apiLogger.debug(`Fetching ${options?.method || 'GET'} ${endpoint}`);

    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    // Handle HTTP errors
    if (!response.ok) {
      const statusCode = response.status;
      let errorData: any = null;
      
      try {
        errorData = await response.json();
      } catch (e) {
        // Ignore parsing errors
      }
      
      apiLogger.error(`API error: ${statusCode}`, { 
        endpoint, 
        statusCode,
        errorData 
      });
      
      return {
        data: null,
        error: errorData?.message || `HTTP error ${statusCode}`,
        status: response.status,
      };
    }

    // Parse the response
    const data = await response.json();
    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (err) {
    apiLogger.error('Fetch error', { 
      endpoint,
      error: err instanceof Error ? err.message : 'Unknown error' 
    });
    
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error',
      status: 0,
    };
  }
}

/**
 * Safely put data to an API endpoint
 */
export async function putApi<T>(
  endpoint: string,
  data: any,
  options?: RequestInit
): Promise<ApiCallResponse<T>> {
  return fetchApi<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * Safely post data to an API endpoint
 */
export async function postApi<T>(
  endpoint: string,
  data: any,
  options?: RequestInit
): Promise<ApiCallResponse<T>> {
  return fetchApi<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
} 