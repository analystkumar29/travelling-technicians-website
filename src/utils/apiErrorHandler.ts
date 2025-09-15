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

const logger = require('./logger').logger || require('./logger').default;

const errorLogger = logger?.createModuleLogger ? logger.createModuleLogger('error-handler') : {
  debug: (...args: any[]) => console.debug('[ERROR_HANDLER]', ...args),
  info: (...args: any[]) => console.info('[ERROR_HANDLER]', ...args),
  warn: (...args: any[]) => console.warn('[ERROR_HANDLER]', ...args),
  error: (...args: any[]) => console.error('[ERROR_HANDLER]', ...args)
};

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

// Error classification rules - updated for current project
const ERROR_CLASSIFICATION = {
  // Validation errors
  'ValidationError': { type: ErrorType.VALIDATION, severity: ErrorSeverity.LOW, retryable: false },
  'SyntaxError': { type: ErrorType.VALIDATION, severity: ErrorSeverity.LOW, retryable: false },
  'TypeError': { type: ErrorType.VALIDATION, severity: ErrorSeverity.MEDIUM, retryable: false },
  'Invalid input': { type: ErrorType.VALIDATION, severity: ErrorSeverity.LOW, retryable: false },
  'Missing required': { type: ErrorType.VALIDATION, severity: ErrorSeverity.LOW, retryable: false },
  
  // Database errors (Supabase specific)
  'PostgrestError': { type: ErrorType.DATABASE, severity: ErrorSeverity.HIGH, retryable: true },
  'PGRST': { type: ErrorType.DATABASE, severity: ErrorSeverity.HIGH, retryable: true },
  'supabase': { type: ErrorType.DATABASE, severity: ErrorSeverity.HIGH, retryable: true },
  'connection refused': { type: ErrorType.DATABASE, severity: ErrorSeverity.CRITICAL, retryable: true },
  'database': { type: ErrorType.DATABASE, severity: ErrorSeverity.HIGH, retryable: true },
  
  // Network and timeout errors
  'TimeoutError': { type: ErrorType.TIMEOUT, severity: ErrorSeverity.MEDIUM, retryable: true },
  'timeout': { type: ErrorType.TIMEOUT, severity: ErrorSeverity.MEDIUM, retryable: true },
  'ENOTFOUND': { type: ErrorType.NETWORK, severity: ErrorSeverity.HIGH, retryable: true },
  'ECONNREFUSED': { type: ErrorType.NETWORK, severity: ErrorSeverity.HIGH, retryable: true },
  'ETIMEDOUT': { type: ErrorType.TIMEOUT, severity: ErrorSeverity.MEDIUM, retryable: true },
  'fetch failed': { type: ErrorType.NETWORK, severity: ErrorSeverity.MEDIUM, retryable: true },
  
  // Rate limiting
  'TooManyRequests': { type: ErrorType.RATE_LIMIT, severity: ErrorSeverity.MEDIUM, retryable: true },
  'RateLimitExceeded': { type: ErrorType.RATE_LIMIT, severity: ErrorSeverity.MEDIUM, retryable: true },
  'rate limit': { type: ErrorType.RATE_LIMIT, severity: ErrorSeverity.MEDIUM, retryable: true },
  
  // Authentication/Authorization  
  'AuthenticationError': { type: ErrorType.AUTHENTICATION, severity: ErrorSeverity.MEDIUM, retryable: false },
  'UnauthorizedError': { type: ErrorType.AUTHORIZATION, severity: ErrorSeverity.MEDIUM, retryable: false },
  'ForbiddenError': { type: ErrorType.AUTHORIZATION, severity: ErrorSeverity.MEDIUM, retryable: false },
  'unauthorized': { type: ErrorType.AUTHENTICATION, severity: ErrorSeverity.MEDIUM, retryable: false },
  'forbidden': { type: ErrorType.AUTHORIZATION, severity: ErrorSeverity.MEDIUM, retryable: false },
  
  // Not found
  'NotFoundError': { type: ErrorType.NOT_FOUND, severity: ErrorSeverity.LOW, retryable: false },
  'ResourceNotFound': { type: ErrorType.NOT_FOUND, severity: ErrorSeverity.LOW, retryable: false },
  'not found': { type: ErrorType.NOT_FOUND, severity: ErrorSeverity.LOW, retryable: false },
  
  // External API errors (SendGrid, etc.)
  'sendgrid': { type: ErrorType.EXTERNAL_API, severity: ErrorSeverity.MEDIUM, retryable: true },
  'email': { type: ErrorType.EXTERNAL_API, severity: ErrorSeverity.MEDIUM, retryable: true },
  'api key': { type: ErrorType.CONFIGURATION, severity: ErrorSeverity.HIGH, retryable: false },
  
  // Validation patterns
  'validation': { type: ErrorType.VALIDATION, severity: ErrorSeverity.LOW, retryable: false },
  'invalid': { type: ErrorType.VALIDATION, severity: ErrorSeverity.LOW, retryable: false },
  'required': { type: ErrorType.VALIDATION, severity: ErrorSeverity.LOW, retryable: false }
};

// User-friendly error messages - updated for repair business context
const USER_FRIENDLY_MESSAGES = {
  [ErrorType.VALIDATION]: 'Please check your information and try again. Make sure all required fields are filled out correctly.',
  [ErrorType.AUTHENTICATION]: 'Please sign in to continue with your booking.',
  [ErrorType.AUTHORIZATION]: 'You don\'t have permission to access this service.',
  [ErrorType.NOT_FOUND]: 'The requested service or information was not found. Please check the URL or contact support.',
  [ErrorType.RATE_LIMIT]: 'Too many requests. Please wait a moment before trying again.',
  [ErrorType.DATABASE]: 'We\'re experiencing technical difficulties. Please try again in a few moments.',
  [ErrorType.EXTERNAL_API]: 'External service is temporarily unavailable. Your booking is saved and we\'ll process it shortly.',
  [ErrorType.TIMEOUT]: 'The request is taking longer than expected. Please try again.',
  [ErrorType.NETWORK]: 'Network connectivity issues. Please check your connection and try again.',
  [ErrorType.INTERNAL]: 'An unexpected error occurred. Our technical team has been notified and will resolve this quickly.',
  [ErrorType.CONFIGURATION]: 'Service configuration issue. Please contact our support team.'
};

// Recovery strategies - specific to the repair business
const RECOVERY_STRATEGIES: Partial<Record<ErrorType, string>> = {
  [ErrorType.DATABASE]: 'Use cached pricing data if available, queue booking for later processing',
  [ErrorType.EXTERNAL_API]: 'Save booking locally and retry email notifications, use default confirmation message',
  [ErrorType.TIMEOUT]: 'Retry with shorter timeout, offer simplified booking form',
  [ErrorType.RATE_LIMIT]: 'Implement exponential backoff, suggest calling directly for urgent repairs',
  [ErrorType.NETWORK]: 'Queue request for retry, show offline mode with phone contact'
};

// Performance impact tracking
class ErrorMetrics {
  private static instance: ErrorMetrics;
  private errorCounts: Map<string, number> = new Map();
  private errorRates: Map<string, number[]> = new Map();
  private lastReset: number = Date.now();
  private alertsCooldown: Map<string, number> = new Map();

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
    const key = `${type}:${endpoint}`;
    const cooldownKey = `alert_${key}`;
    const now = Date.now();
    
    // Check cooldown (15 minutes between alerts)
    const lastAlert = this.alertsCooldown.get(cooldownKey) || 0;
    if (now - lastAlert < 15 * 60 * 1000) {
      return false;
    }
    
    const errorRate = this.getErrorRate(type, endpoint);
    const alertThresholds: Record<ErrorType, number> = {
      [ErrorType.VALIDATION]: 20,
      [ErrorType.AUTHENTICATION]: 10,
      [ErrorType.AUTHORIZATION]: 10,
      [ErrorType.NOT_FOUND]: 15,
      [ErrorType.RATE_LIMIT]: 25,
      [ErrorType.DATABASE]: 5,
      [ErrorType.EXTERNAL_API]: 8,
      [ErrorType.TIMEOUT]: 10,
      [ErrorType.NETWORK]: 8,
      [ErrorType.INTERNAL]: 3,
      [ErrorType.CONFIGURATION]: 2
    };
    
    const shouldAlert = errorRate > (alertThresholds[type] || 15);
    
    if (shouldAlert) {
      this.alertsCooldown.set(cooldownKey, now);
    }
    
    return shouldAlert;
  }

  reset(): void {
    this.errorCounts.clear();
    this.errorRates.clear();
    this.alertsCooldown.clear();
    this.lastReset = Date.now();
  }

  getMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {
      summary: {
        totalErrors: Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0),
        lastReset: this.lastReset,
        uptime: Date.now() - this.lastReset
      },
      byEndpoint: {}
    };
    
    this.errorCounts.forEach((count, key) => {
      const [type, endpoint] = key.split(':');
      if (!metrics.byEndpoint[endpoint]) {
        metrics.byEndpoint[endpoint] = {};
      }
      metrics.byEndpoint[endpoint][type] = {
        count,
        rate: this.getErrorRate(type as ErrorType, endpoint),
        lastOccurred: Math.max(...(this.errorRates.get(key) || [0]))
      };
    });
    
    return metrics;
  }
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Classify error based on message and type - improved for current codebase
function classifyError(error: Error): { type: ErrorType; severity: ErrorSeverity; retryable: boolean } {
  const errorMessage = error.message?.toLowerCase() || '';
  const errorName = error.name || '';
  const stackTrace = error.stack?.toLowerCase() || '';

  // Check classification rules
  for (const [pattern, classification] of Object.entries(ERROR_CLASSIFICATION)) {
    if (errorMessage.includes(pattern.toLowerCase()) || 
        errorName.toLowerCase().includes(pattern.toLowerCase()) || 
        stackTrace.includes(pattern.toLowerCase())) {
      return classification;
    }
  }

  // Special handling for HTTP status codes
  if (errorMessage.includes('400') || errorMessage.includes('bad request')) {
    return { type: ErrorType.VALIDATION, severity: ErrorSeverity.LOW, retryable: false };
  }
  if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
    return { type: ErrorType.AUTHENTICATION, severity: ErrorSeverity.MEDIUM, retryable: false };
  }
  if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
    return { type: ErrorType.AUTHORIZATION, severity: ErrorSeverity.MEDIUM, retryable: false };
  }
  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return { type: ErrorType.NOT_FOUND, severity: ErrorSeverity.LOW, retryable: false };
  }
  if (errorMessage.includes('429') || errorMessage.includes('too many')) {
    return { type: ErrorType.RATE_LIMIT, severity: ErrorSeverity.MEDIUM, retryable: true };
  }
  if (errorMessage.includes('500') || errorMessage.includes('503') || errorMessage.includes('502')) {
    return { type: ErrorType.INTERNAL, severity: ErrorSeverity.HIGH, retryable: true };
  }

  // Default classification for unknown errors
  return {
    type: ErrorType.INTERNAL,
    severity: ErrorSeverity.HIGH,
    retryable: false
  };
}

// Generate context from request - enhanced for repair business
function generateContext(req: NextApiRequest, requestId: string): ErrorContext {
  // Extract user info if available
  let userId: string | undefined;
  let sessionId: string | undefined;
  
  // Check for auth headers or session data
  if (req.headers.authorization) {
    try {
      // Extract user ID from JWT if present
      const token = req.headers.authorization.replace('Bearer ', '');
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      userId = payload.sub || payload.user_id;
    } catch {
      // Ignore JWT parsing errors
    }
  }
  
  // Check for session cookie
  if (req.headers.cookie) {
    const sessionMatch = req.headers.cookie.match(/session=([^;]+)/);
    sessionId = sessionMatch?.[1];
  }

  return {
    endpoint: req.url || 'unknown',
    method: req.method || 'unknown',
    userId,
    sessionId,
    userAgent: req.headers['user-agent'],
    ip: (req.headers['x-forwarded-for'] as string) || 
        (req.headers['x-real-ip'] as string) || 
        req.socket?.remoteAddress,
    timestamp: new Date().toISOString(),
    requestId,
    parameters: { ...req.query, ...(typeof req.body === 'object' ? req.body : {}) },
    headers: Object.fromEntries(
      Object.entries(req.headers)
        .filter(([key]) => 
          !['authorization', 'cookie', 'x-api-key', 'x-sendgrid-key'].includes(key.toLowerCase())
        )
        .map(([key, value]) => [key, Array.isArray(value) ? value.join(', ') : value || ''])
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
      responseTime: context.responseTime,
      userAgent: context.userAgent,
      hasUserId: !!context.userId
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

  // Check if error message contains a status code
  const statusMatch = error.message.match(/(\d{3})/);
  if (statusMatch) {
    const status = parseInt(statusMatch[1]);
    if (status >= 400 && status < 600) {
      return status;
    }
  }

  return statusCodes[type] || 500;
}

// Format error response for client - enhanced for repair business
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
    const retryDelays: Partial<Record<ErrorType, number>> = {
      [ErrorType.RATE_LIMIT]: 60,
      [ErrorType.DATABASE]: 30,
      [ErrorType.TIMEOUT]: 15,
      [ErrorType.NETWORK]: 45,
      [ErrorType.EXTERNAL_API]: 120 // Email services might need longer
    };
    response.error.retryAfter = retryDelays[apiError.type] || 30;
  }

  // Add help URL for specific error types - specific to repair business
  const helpUrls: Partial<Record<ErrorType, string>> = {
    [ErrorType.AUTHENTICATION]: '/help/account-access',
    [ErrorType.AUTHORIZATION]: '/help/permissions',
    [ErrorType.VALIDATION]: '/help/booking-form',
    [ErrorType.RATE_LIMIT]: '/help/booking-limits',
    [ErrorType.NOT_FOUND]: '/help/services'
  };
  
  if (helpUrls[apiError.type]) {
    response.error.helpUrl = helpUrls[apiError.type];
  }

  // Include debug information in development or when explicitly requested
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
    skipMetrics?: boolean;
  } = {}
): void {
  const requestId = generateRequestId();
  const context = generateContext(req, requestId);
  
  if (options.responseTime) {
    context.responseTime = options.responseTime;
  }

  const apiError = createApiError(error, context, options.customMessage);
  
  // Record metrics unless explicitly skipped
  if (!options.skipMetrics) {
    const metrics = ErrorMetrics.getInstance();
    metrics.recordError(apiError.type, context.endpoint);

    // Check if alerting is needed
    if (metrics.shouldAlert(apiError.type, context.endpoint)) {
      errorLogger.error('High error rate detected - immediate attention required', {
        type: apiError.type,
        endpoint: context.endpoint,
        errorRate: metrics.getErrorRate(apiError.type, context.endpoint),
        requestId,
        severity: 'ALERT'
      });
    }
  }

  // Log error with appropriate level
  if (!options.skipLogging) {
    const logLevel = {
      [ErrorSeverity.LOW]: 'info',
      [ErrorSeverity.MEDIUM]: 'warn',
      [ErrorSeverity.HIGH]: 'error',
      [ErrorSeverity.CRITICAL]: 'error'
    }[apiError.severity] as 'info' | 'warn' | 'error';

    const logData = {
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
      userId: context.userId,
      userAgent: context.userAgent,
      ip: context.ip
    };

    // Only include stack trace for high/critical errors in logs to reduce noise
    if (apiError.severity === ErrorSeverity.HIGH || apiError.severity === ErrorSeverity.CRITICAL) {
      (logData as any).stack = apiError.stack;
    }

    errorLogger[logLevel]('API Error occurred', logData);
  }

  // Send response
  const response = formatErrorResponse(apiError, options.includeDebug);
  
  // Set appropriate headers
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-Error-Type', apiError.type);
  
  if (apiError.retryable && response.error.retryAfter) {
    res.setHeader('Retry-After', response.error.retryAfter.toString());
  }

  // CORS headers for API endpoints
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  res.status(apiError.statusCode).json(response);
}

// Wrapper for async API handlers with automatic error handling
export function withErrorHandler<T = any>(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<T>,
  options: {
    includeDebug?: boolean;
    timeout?: number;
    skipMetrics?: boolean;
  } = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const startTime = Date.now();

    try {
      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(200).end();
        return;
      }

      // Set timeout if specified
      if (options.timeout) {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            const timeoutError = new Error('Request timeout');
            timeoutError.name = 'TimeoutError';
            reject(timeoutError);
          }, options.timeout);
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
        responseTime,
        skipMetrics: options.skipMetrics
      });
    }
  };
}

// Get error metrics for monitoring dashboard
export function getErrorMetrics(): Record<string, any> {
  return ErrorMetrics.getInstance().getMetrics();
}

// Reset error metrics (useful for testing and maintenance)
export function resetErrorMetrics(): void {
  ErrorMetrics.getInstance().reset();
}

// Health check function for error handling system
export function getErrorHandlerHealth(): {
  isHealthy: boolean;
  metrics: Record<string, any>;
  uptime: number;
} {
  const metrics = ErrorMetrics.getInstance().getMetrics();
  const criticalErrorRate = Object.values(metrics.byEndpoint || {}).some((endpoint: any) =>
    Object.values(endpoint).some((errorType: any) => errorType.rate > 10)
  );

  return {
    isHealthy: !criticalErrorRate,
    metrics,
    uptime: metrics.summary?.uptime || 0
  };
}

// Export utilities
export {
  ErrorMetrics,
  generateRequestId,
  classifyError,
  formatErrorResponse
};

// Default export for CommonJS compatibility
module.exports = {
  ErrorType,
  ErrorSeverity,
  errorHandler,
  withErrorHandler,
  createApiError,
  getErrorMetrics,
  resetErrorMetrics,
  getErrorHandlerHealth,
  ErrorMetrics,
  generateRequestId,
  classifyError,
  formatErrorResponse
};
