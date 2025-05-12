import { logger } from '@/utils/logger';

const apiLogger = logger.createModuleLogger('api');

/**
 * Common API response interface for consistent error handling across the application
 */
export interface ApiResponse<T> {
  data: T | null;
  error: null | {
    message: string;
    code: string;
    userMessage: string;
  };
  status: number;
}

/**
 * Error codes for API responses
 */
export enum ApiErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

/**
 * Maps HTTP status codes to ApiErrorCode
 */
export const mapHttpStatusToErrorCode = (status: number): ApiErrorCode => {
  switch (status) {
    case 400:
      return ApiErrorCode.VALIDATION_ERROR;
    case 401:
      return ApiErrorCode.UNAUTHORIZED;
    case 403:
      return ApiErrorCode.FORBIDDEN;
    case 404:
      return ApiErrorCode.NOT_FOUND;
    case 500:
    case 502:
    case 503:
    case 504:
      return ApiErrorCode.SERVER_ERROR;
    default:
      return ApiErrorCode.UNKNOWN_ERROR;
  }
};

/**
 * Safely fetch data from an API endpoint
 */
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
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
        error: {
          message: errorData?.message || `HTTP error ${statusCode}`,
          code: mapHttpStatusToErrorCode(statusCode),
          userMessage: 'An error occurred while communicating with the server.'
        },
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
      error: {
        message: err instanceof Error ? err.message : 'Unknown error',
        code: ApiErrorCode.NETWORK_ERROR,
        userMessage: 'Network error. Please check your connection and try again.'
      },
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
): Promise<ApiResponse<T>> {
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
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
} 