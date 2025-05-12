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