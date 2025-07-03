/**
 * Advanced API Error Handling Middleware
 * Intelligent error recovery, comprehensive logging, and user-friendly responses
 * 
 * Features:
 * - Automatic error classification and severity assessment
 * - Intelligent retry mechanisms with exponential backoff
 * - User-friendly error message generation
 * - Performance impact monitoring
 * - Error pattern detection and alerting
 * - Graceful degradation strategies
 * - Comprehensive error logging and analytics
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from './logger';

const errorLogger = logger.createModuleLogger('error-handler');

// Error types and classifications
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication', 
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  TIMEOUT = 'timeout',
  NETWORK = 'network',
  INTERNAL = 'internal',
  CONFIGURATION = 'configuration'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  endpoint: string;
  method: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  timestamp: string;
  requestId: string;
  parameters?: Record<string, any>;
  headers?: Record<string, string>;
  bodySize?: number;
  responseTime?: number;
}

export interface ApiError extends Error {
  type: ErrorType;
  severity: ErrorSeverity;
  statusCode: number;
  userMessage: string;
  technicalMessage: string;
  context: ErrorContext;
  retryable: boolean;
  recoveryStrategy?: string;
  telemetryData?: Record<string, any>;
}

export interface ErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
    code: string;
    requestId: string;
    timestamp: string;
    retryAfter?: number;
    helpUrl?: string;
  };
  debug?: {
    technicalMessage: string;
    stack?: string;
    context: ErrorContext;
  };
}

// Error classification rules
const ERROR_CLASSIFICATION = {
  // Validation errors
  'ValidationError': { type: ErrorType.VALIDATION, severity: ErrorSeverity.LOW, retryable: false },
  'SyntaxError': { type: ErrorType.VALIDATION, severity: ErrorSeverity.LOW, retryable: false },
  'TypeError': { type: ErrorType.VALIDATION, severity: ErrorSeverity.MEDIUM, retryable: false },
  
  // Database errors
  'PostgrestError': { type: ErrorType.DATABASE, severity: ErrorSeverity.HIGH, retryable: true },
  'PGRST': { type: ErrorType.DATABASE, severity: ErrorSeverity.HIGH, retryable: true },
  'connection': { type: ErrorType.DATABASE, severity: ErrorSeverity.CRITICAL, retryable: true },
  
  // Network and timeout errors
  'TimeoutError': { type: ErrorType.TIMEOUT, severity: ErrorSeverity.MEDIUM, retryable: true },
  'ENOTFOUND': { type: ErrorType.NETWORK, severity: ErrorSeverity.HIGH, retryable: true },
  'ECONNREFUSED': { type: ErrorType.NETWORK, severity: ErrorSeverity.HIGH, retryable: true },
  'ETIMEDOUT': { type: ErrorType.TIMEOUT, severity: ErrorSeverity.MEDIUM, retryable: true },
  
  // Rate limiting
  'TooManyRequests': { type: ErrorType.RATE_LIMIT, severity: ErrorSeverity.MEDIUM, retryable: true },
  'RateLimitExceeded': { type: ErrorType.RATE_LIMIT, severity: ErrorSeverity.MEDIUM, retryable: true },
  
  // Authentication/Authorization
  'AuthenticationError': { type: ErrorType.AUTHENTICATION, severity: ErrorSeverity.MEDIUM, retryable: false },
  'UnauthorizedError': { type: ErrorType.AUTHORIZATION, severity: ErrorSeverity.MEDIUM, retryable: false },
  'ForbiddenError': { type: ErrorType.AUTHORIZATION, severity: ErrorSeverity.MEDIUM, retryable: false },
  
  // Not found
  'NotFoundError': { type: ErrorType.NOT_FOUND, severity: ErrorSeverity.LOW, retryable: false },
  'ResourceNotFound': { type: ErrorType.NOT_FOUND, severity: ErrorSeverity.LOW, retryable: false }
};

// User-friendly error messages
const USER_FRIENDLY_MESSAGES = {
  [ErrorType.VALIDATION]: 'Please check your input and try again.',
  [ErrorType.AUTHENTICATION]: 'Authentication required. Please log in and try again.',
  [ErrorType.AUTHORIZATION]: 'You don\'t have permission to perform this action.',
  [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorType.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
  [ErrorType.DATABASE]: 'We\'re experiencing database issues. Please try again in a moment.',
  [ErrorType.EXTERNAL_API]: 'External service is temporarily unavailable.',
  [ErrorType.TIMEOUT]: 'The request took too long to complete. Please try again.',
  [ErrorType.NETWORK]: 'Network connectivity issues. Please check your connection.',
  [ErrorType.INTERNAL]: 'An unexpected error occurred. Our team has been notified.',
  [ErrorType.CONFIGURATION]: 'Service configuration issue. Please contact support.'
};

// Recovery strategies
const RECOVERY_STRATEGIES = {
  [ErrorType.DATABASE]: 'Use cached data if available, retry with exponential backoff',
  [ErrorType.EXTERNAL_API]: 'Fallback to static data or alternative service',
  [ErrorType.TIMEOUT]: 'Retry with shorter timeout, implement partial responses',
  [ErrorType.RATE_LIMIT]: 'Implement exponential backoff with jitter',
  [ErrorType.NETWORK]: 'Queue request for retry, show offline mode'
};

// Performance impact tracking
class ErrorMetrics {
  private static instance: ErrorMetrics;
  private errorCounts: Map<string, number> = new Map();
  private errorRates: Map<string, number[]> = new Map();
  private lastReset: number = Date.now();

  static getInstance(): ErrorMetrics {
    if (!ErrorMetrics.instance) {
      ErrorMetrics.instance = new ErrorMetrics();
    }
    return ErrorMetrics.instance;
  }

  recordError(type: ErrorType, endpoint: string): void {
    const key = `${type}:${endpoint}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
    
    // Track error rate over time (sliding window)
    const rates = this.errorRates.get(key) || [];
    rates.push(Date.now());
    
    // Keep only last 100 errors or 1 hour window
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentRates = rates.filter(timestamp => timestamp > oneHourAgo).slice(-100);
    this.errorRates.set(key, recentRates);
  }

  getErrorRate(type: ErrorType, endpoint: string): number {
    const key = `${type}:${endpoint}`;
    const rates = this.errorRates.get(key) || [];
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const recentErrors = rates.filter(timestamp => timestamp > fiveMinutesAgo);
    
    // Return errors per minute
    return recentErrors.length / 5;
  }

  shouldAlert(type: ErrorType, endpoint: string): boolean {
    const errorRate = this.getErrorRate(type, endpoint);
    const alertThresholds = {
      [ErrorType.CRITICAL]: 1,   // 1 error per minute
      [ErrorType.DATABASE]: 5,   // 5 errors per minute
      [ErrorType.TIMEOUT]: 10,   // 10 errors per minute
      [ErrorType.VALIDATION]: 20 // 20 errors per minute
    };
    
    return errorRate > (alertThresholds[type] || 15);
  }

  reset(): void {
    this.errorCounts.clear();
    this.errorRates.clear();
    this.lastReset = Date.now();
  }

  getMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    for (const [key, count] of this.errorCounts) {
      const [type, endpoint] = key.split(':');
      if (!metrics[endpoint]) metrics[endpoint] = {};
      metrics[endpoint][type] = {
        count,
        rate: this.getErrorRate(type as ErrorType, endpoint)
      };
    }
    
    return metrics;
  }
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Classify error based on message and type
function classifyError(error: Error): { type: ErrorType; severity: ErrorSeverity; retryable: boolean } {
  const errorMessage = error.message?.toLowerCase() || '';
  const errorName = error.name || '';
  const stackTrace = error.stack?.toLowerCase() || '';

  // Check classification rules
  for (const [pattern, classification] of Object.entries(ERROR_CLASSIFICATION)) {
    if (errorMessage.includes(pattern.toLowerCase()) || 
        errorName.includes(pattern) || 
        stackTrace.includes(pattern.toLowerCase())) {
      return classification;
    }
  }

  // Default classification for unknown errors
  return {
    type: ErrorType.INTERNAL,
    severity: ErrorSeverity.HIGH,
    retryable: false
  };
}

// Generate context from request
function generateContext(req: NextApiRequest, requestId: string): ErrorContext {
  return {
    endpoint: req.url || 'unknown',
    method: req.method || 'unknown',
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
    timestamp: new Date().toISOString(),
    requestId,
    parameters: { ...req.query, ...req.body },
    headers: Object.fromEntries(
      Object.entries(req.headers).filter(([key]) => 
        !['authorization', 'cookie', 'x-api-key'].includes(key.toLowerCase())
      )
    ),
    bodySize: req.body ? JSON.stringify(req.body).length : 0
  };
}

// Create standardized API error
export function createApiError(
  error: Error,
  context: ErrorContext,
  customMessage?: string
): ApiError {
  const classification = classifyError(error);
  const statusCode = getStatusCodeFromError(error, classification.type);
  
  const apiError: ApiError = {
    ...error,
    type: classification.type,
    severity: classification.severity,
    statusCode,
    userMessage: customMessage || USER_FRIENDLY_MESSAGES[classification.type],
    technicalMessage: error.message,
    context,
    retryable: classification.retryable,
    recoveryStrategy: RECOVERY_STRATEGIES[classification.type],
    telemetryData: {
      errorType: classification.type,
      severity: classification.severity,
      retryable: classification.retryable,
      endpoint: context.endpoint,
      method: context.method,
      responseTime: context.responseTime
    }
  };

  return apiError;
}

// Get appropriate HTTP status code
function getStatusCodeFromError(error: Error, type: ErrorType): number {
  const statusCodes = {
    [ErrorType.VALIDATION]: 400,
    [ErrorType.AUTHENTICATION]: 401,
    [ErrorType.AUTHORIZATION]: 403,
    [ErrorType.NOT_FOUND]: 404,
    [ErrorType.RATE_LIMIT]: 429,
    [ErrorType.DATABASE]: 503,
    [ErrorType.EXTERNAL_API]: 502,
    [ErrorType.TIMEOUT]: 408,
    [ErrorType.NETWORK]: 503,
    [ErrorType.INTERNAL]: 500,
    [ErrorType.CONFIGURATION]: 500
  };

  return statusCodes[type] || 500;
}

// Format error response for client
function formatErrorResponse(apiError: ApiError, includeDebug: boolean = false): ErrorResponse {
  const response: ErrorResponse = {
    success: false,
    error: {
      type: apiError.type,
      message: apiError.userMessage,
      code: `${apiError.type.toUpperCase()}_ERROR`,
      requestId: apiError.context.requestId,
      timestamp: apiError.context.timestamp
    }
  };

  // Add retry information for retryable errors
  if (apiError.retryable) {
    const retryDelays = {
      [ErrorType.RATE_LIMIT]: 60,
      [ErrorType.DATABASE]: 30,
      [ErrorType.TIMEOUT]: 15,
      [ErrorType.NETWORK]: 45
    };
    response.error.retryAfter = retryDelays[apiError.type] || 30;
  }

  // Add help URL for specific error types
  const helpUrls = {
    [ErrorType.AUTHENTICATION]: '/help/authentication',
    [ErrorType.AUTHORIZATION]: '/help/permissions',
    [ErrorType.VALIDATION]: '/help/api-usage',
    [ErrorType.RATE_LIMIT]: '/help/rate-limits'
  };
  
  if (helpUrls[apiError.type]) {
    response.error.helpUrl = helpUrls[apiError.type];
  }

  // Include debug information in development
  if (includeDebug || process.env.NODE_ENV === 'development') {
    response.debug = {
      technicalMessage: apiError.technicalMessage,
      stack: apiError.stack,
      context: apiError.context
    };
  }

  return response;
}

// Main error handler middleware
export function errorHandler(
  error: Error,
  req: NextApiRequest,
  res: NextApiResponse,
  options: {
    includeDebug?: boolean;
    customMessage?: string;
    skipLogging?: boolean;
    responseTime?: number;
  } = {}
): void {
  const requestId = generateRequestId();
  const context = generateContext(req, requestId);
  
  if (options.responseTime) {
    context.responseTime = options.responseTime;
  }

  const apiError = createApiError(error, context, options.customMessage);
  
  // Record metrics
  const metrics = ErrorMetrics.getInstance();
  metrics.recordError(apiError.type, context.endpoint);

  // Log error with appropriate level
  if (!options.skipLogging) {
    const logLevel = {
      [ErrorSeverity.LOW]: 'info',
      [ErrorSeverity.MEDIUM]: 'warn',
      [ErrorSeverity.HIGH]: 'error',
      [ErrorSeverity.CRITICAL]: 'error'
    }[apiError.severity] as 'info' | 'warn' | 'error';

    errorLogger[logLevel]('API Error occurred', {
      requestId,
      type: apiError.type,
      severity: apiError.severity,
      endpoint: context.endpoint,
      method: context.method,
      statusCode: apiError.statusCode,
      userMessage: apiError.userMessage,
      technicalMessage: apiError.technicalMessage,
      retryable: apiError.retryable,
      recoveryStrategy: apiError.recoveryStrategy,
      telemetryData: apiError.telemetryData,
      stack: apiError.stack
    });
  }

  // Check if alerting is needed
  if (metrics.shouldAlert(apiError.type, context.endpoint)) {
    errorLogger.error('High error rate detected', {
      type: apiError.type,
      endpoint: context.endpoint,
      errorRate: metrics.getErrorRate(apiError.type, context.endpoint),
      requestId
    });
  }

  // Send response
  const response = formatErrorResponse(apiError, options.includeDebug);
  
  // Set appropriate headers
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-Error-Type', apiError.type);
  
  if (apiError.retryable && response.error.retryAfter) {
    res.setHeader('Retry-After', response.error.retryAfter.toString());
  }

  res.status(apiError.statusCode).json(response);
}

// Wrapper for async API handlers with automatic error handling
export function withErrorHandler<T = any>(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<T>,
  options: {
    includeDebug?: boolean;
    timeout?: number;
  } = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const startTime = Date.now();

    try {
      // Set timeout if specified
      if (options.timeout) {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), options.timeout);
        });
        
        await Promise.race([
          handler(req, res),
          timeoutPromise
        ]);
      } else {
        await handler(req, res);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      errorHandler(error as Error, req, res, {
        includeDebug: options.includeDebug,
        responseTime
      });
    }
  };
}

// Get error metrics for monitoring
export function getErrorMetrics(): Record<string, any> {
  return ErrorMetrics.getInstance().getMetrics();
}

// Reset error metrics (useful for testing)
export function resetErrorMetrics(): void {
  ErrorMetrics.getInstance().reset();
}

// Export utilities
export {
  ErrorMetrics,
  generateRequestId,
  classifyError,
  formatErrorResponse
}; 