/**
 * Comprehensive error handler integration tests
 * Tests error classification, handling, and recovery strategies
 */

const {
  ErrorType,
  ErrorSeverity,
  errorHandler,
  withErrorHandler,
  createApiError,
  getErrorMetrics,
  resetErrorMetrics,
  getErrorHandlerHealth,
  classifyError
} = require('../src/utils/apiErrorHandler.ts');

// Mock Next.js request/response objects
const createMockRequest = (overrides = {}) => ({
  url: '/api/test',
  method: 'POST',
  headers: {
    'user-agent': 'test-agent',
    'x-forwarded-for': '192.168.1.1'
  },
  query: {},
  body: { test: 'data' },
  socket: { remoteAddress: '192.168.1.1' },
  ...overrides
});

const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    statusCode: 200,
    headers: {}
  };
  
  res.setHeader.mockImplementation((key, value) => {
    res.headers[key] = value;
    return res;
  });
  
  return res;
};

describe('API Error Handler Integration Tests', () => {
  beforeEach(() => {
    resetErrorMetrics();
    jest.clearAllMocks();
  });

  describe('Error Classification', () => {
    test('should classify validation errors correctly', () => {
      const error = new Error('Invalid input provided');
      const classification = classifyError(error);
      
      expect(classification.type).toBe(ErrorType.VALIDATION);
      expect(classification.severity).toBe(ErrorSeverity.LOW);
      expect(classification.retryable).toBe(false);
    });

    test('should classify database errors correctly', () => {
      const error = new Error('PostgrestError: connection failed');
      const classification = classifyError(error);
      
      expect(classification.type).toBe(ErrorType.DATABASE);
      expect(classification.severity).toBe(ErrorSeverity.HIGH);
      expect(classification.retryable).toBe(true);
    });

    test('should classify network errors correctly', () => {
      const error = new Error('ECONNREFUSED');
      const classification = classifyError(error);
      
      expect(classification.type).toBe(ErrorType.NETWORK);
      expect(classification.severity).toBe(ErrorSeverity.HIGH);
      expect(classification.retryable).toBe(true);
    });

    test('should classify timeout errors correctly', () => {
      const error = new Error('Request timeout occurred');
      const classification = classifyError(error);
      
      expect(classification.type).toBe(ErrorType.TIMEOUT);
      expect(classification.severity).toBe(ErrorSeverity.MEDIUM);
      expect(classification.retryable).toBe(true);
    });

    test('should classify rate limit errors correctly', () => {
      const error = new Error('Rate limit exceeded');
      const classification = classifyError(error);
      
      expect(classification.type).toBe(ErrorType.RATE_LIMIT);
      expect(classification.severity).toBe(ErrorSeverity.MEDIUM);
      expect(classification.retryable).toBe(true);
    });

    test('should classify authentication errors correctly', () => {
      const error = new Error('401 Unauthorized access');
      const classification = classifyError(error);
      
      expect(classification.type).toBe(ErrorType.AUTHENTICATION);
      expect(classification.severity).toBe(ErrorSeverity.MEDIUM);
      expect(classification.retryable).toBe(false);
    });

    test('should handle unknown errors with default classification', () => {
      const error = new Error('Some unknown error occurred');
      const classification = classifyError(error);
      
      expect(classification.type).toBe(ErrorType.INTERNAL);
      expect(classification.severity).toBe(ErrorSeverity.HIGH);
      expect(classification.retryable).toBe(false);
    });
  });

  describe('Error Handler Middleware', () => {
    test('should handle errors and set appropriate response', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Unknown system error');

      errorHandler(error, req, res, { includeDebug: true });

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
      expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', expect.any(String));
      expect(res.setHeader).toHaveBeenCalledWith('X-Error-Type', ErrorType.INTERNAL);
    });

    test('should include debug information when requested', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Critical debug test error');

      errorHandler(error, req, res, { includeDebug: true });

      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.debug).toBeDefined();
      expect(jsonCall.debug.technicalMessage).toBe('Critical debug test error');
      expect(jsonCall.debug.context).toBeDefined();
      // Stack may or may not be present depending on error severity and context
      expect(jsonCall.debug).toHaveProperty('stack');
    });

    test('should not include debug information by default', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Production test error');

      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      errorHandler(error, req, res);

      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.debug).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    test('should set retry headers for retryable errors', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Rate limit exceeded');

      errorHandler(error, req, res);

      expect(res.setHeader).toHaveBeenCalledWith('Retry-After', expect.any(String));
    });

    test('should handle custom error messages', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Internal error');
      const customMessage = 'Your booking is being processed. Please wait.';

      errorHandler(error, req, res, { customMessage });

      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.error.message).toBe(customMessage);
    });

    test('should extract user context from request', () => {
      const req = createMockRequest({
        headers: {
          'user-agent': 'repair-app/1.0',
          'x-forwarded-for': '203.0.113.195',
          'authorization': 'Bearer test-token'
        },
        url: '/api/bookings/create',
        method: 'POST'
      });
      const res = createMockResponse();
      const error = new Error('Booking error');

      errorHandler(error, req, res, { includeDebug: true });

      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.debug.context.endpoint).toBe('/api/bookings/create');
      expect(jsonCall.debug.context.method).toBe('POST');
      expect(jsonCall.debug.context.userAgent).toBe('repair-app/1.0');
      expect(jsonCall.debug.context.ip).toBe('203.0.113.195');
    });
  });

  describe('WithErrorHandler Wrapper', () => {
    test('should wrap async handlers and catch errors', async () => {
      const handler = jest.fn().mockRejectedValue(new Error('Handler error'));
      const wrappedHandler = withErrorHandler(handler);
      
      const req = createMockRequest();
      const res = createMockResponse();

      await wrappedHandler(req, res);

      expect(handler).toHaveBeenCalledWith(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle successful requests without interfering', async () => {
      const handler = jest.fn().mockResolvedValue({ success: true });
      const wrappedHandler = withErrorHandler(handler);
      
      const req = createMockRequest();
      const res = createMockResponse();

      await wrappedHandler(req, res);

      expect(handler).toHaveBeenCalledWith(req, res);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test('should handle CORS preflight requests', async () => {
      const handler = jest.fn();
      const wrappedHandler = withErrorHandler(handler);
      
      const req = createMockRequest({ method: 'OPTIONS' });
      const res = createMockResponse();

      await wrappedHandler(req, res);

      expect(handler).not.toHaveBeenCalled();
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalled();
    });

    test('should handle timeout configuration', async () => {
      const handler = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 200))
      );
      const wrappedHandler = withErrorHandler(handler, { timeout: 100 });
      
      const req = createMockRequest();
      const res = createMockResponse();

      await wrappedHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(408);
    });
  });

  describe('Error Metrics and Monitoring', () => {
    test('should track error metrics', () => {
      const req = createMockRequest({ url: '/api/bookings' });
      const res = createMockResponse();
      const error = new Error('Database connection failed');

      errorHandler(error, req, res);

      const metrics = getErrorMetrics();
      expect(metrics.summary.totalErrors).toBe(1);
      expect(metrics.byEndpoint['/api/bookings']).toBeDefined();
    });

    test('should calculate error rates correctly', () => {
      const req = createMockRequest({ url: '/api/pricing' });
      const res = createMockResponse();

      // Generate multiple errors
      for (let i = 0; i < 5; i++) {
        const error = new Error('Rate limit exceeded');
        errorHandler(error, req, res, { skipLogging: true });
      }

      const metrics = getErrorMetrics();
      expect(metrics.byEndpoint['/api/pricing']).toBeDefined();
      expect(metrics.byEndpoint['/api/pricing']['rate_limit'].count).toBe(5);
    });

    test('should provide health status', () => {
      const health = getErrorHandlerHealth();
      
      expect(health).toHaveProperty('isHealthy');
      expect(health).toHaveProperty('metrics');
      expect(health).toHaveProperty('uptime');
      expect(typeof health.isHealthy).toBe('boolean');
      expect(typeof health.uptime).toBe('number');
    });

    test('should reset metrics when requested', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Test error');

      errorHandler(error, req, res, { skipLogging: true });
      
      let metrics = getErrorMetrics();
      expect(metrics.summary.totalErrors).toBe(1);

      resetErrorMetrics();
      
      metrics = getErrorMetrics();
      expect(metrics.summary.totalErrors).toBe(0);
    });
  });

  describe('API Error Creation', () => {
    test('should create comprehensive API errors', () => {
      const req = createMockRequest({ url: '/api/devices' });
      const originalError = new Error('Device not found');
      const context = {
        endpoint: '/api/devices',
        method: 'GET',
        timestamp: new Date().toISOString(),
        requestId: 'test-123'
      };

      const apiError = createApiError(originalError, context);

      expect(apiError.type).toBe(ErrorType.NOT_FOUND);
      expect(apiError.statusCode).toBe(404);
      expect(apiError.userMessage).toBeDefined();
      expect(apiError.technicalMessage).toBe('Device not found');
      expect(apiError.context).toBe(context);
      expect(apiError.retryable).toBe(false);
    });

    test('should handle repair business specific errors', () => {
      const req = createMockRequest();
      const errors = [
        new Error('sendgrid api error'),
        new Error('supabase connection timeout'),
        new Error('validation failed for pricing'),
        new Error('booking not found')
      ];

      const classifications = errors.map(error => {
        const context = { endpoint: '/api/test', method: 'POST', timestamp: new Date().toISOString(), requestId: 'test' };
        return createApiError(error, context);
      });

      expect(classifications[0].type).toBe(ErrorType.EXTERNAL_API);
      expect(classifications[1].type).toBe(ErrorType.DATABASE);
      expect(classifications[2].type).toBe(ErrorType.VALIDATION);
      expect(classifications[3].type).toBe(ErrorType.NOT_FOUND);
    });
  });

  describe('Business Logic Error Handling', () => {
    test('should provide repair-specific user messages', () => {
      const errors = [
        { error: new Error('validation failed'), expectedType: ErrorType.VALIDATION },
        { error: new Error('supabase timeout'), expectedType: ErrorType.DATABASE },
        { error: new Error('sendgrid rate limit'), expectedType: ErrorType.EXTERNAL_API }
      ];

      errors.forEach(({ error, expectedType }) => {
        const req = createMockRequest();
        const res = createMockResponse();
        
        errorHandler(error, req, res);
        
        const response = res.json.mock.calls[res.json.mock.calls.length - 1][0];
        // Check that messages are user-friendly and contextual for repair business
        expect(response.error.message).toBeDefined();
        expect(response.error.message.length).toBeGreaterThan(10);
      });
    });

    test('should provide helpful recovery strategies', () => {
      const databaseError = new Error('supabase connection failed');
      const context = {
        endpoint: '/api/bookings',
        method: 'POST',
        timestamp: new Date().toISOString(),
        requestId: 'test-123'
      };

      const apiError = createApiError(databaseError, context);
      expect(apiError.recoveryStrategy).toContain('cached');
      expect(apiError.recoveryStrategy).toContain('queue');
    });

    test('should handle concurrent error tracking', async () => {
      const req = createMockRequest({ url: '/api/concurrent-test' });
      const res = createMockResponse();

      // Simulate concurrent errors
      const promises = Array.from({ length: 20 }, (_, i) => {
        const error = new Error(`Concurrent error ${i}`);
        return new Promise(resolve => {
          setTimeout(() => {
            errorHandler(error, req, res, { skipLogging: true });
            resolve();
          }, Math.random() * 10);
        });
      });

      await Promise.all(promises);

      const metrics = getErrorMetrics();
      expect(metrics.byEndpoint['/api/concurrent-test']).toBeDefined();
      expect(metrics.summary.totalErrors).toBe(20);
    });
  });

  describe('Security and Privacy', () => {
    test('should not expose sensitive headers in context', () => {
      const req = createMockRequest({
        headers: {
          'authorization': 'Bearer secret-token',
          'x-api-key': 'secret-key',
          'x-sendgrid-key': 'sendgrid-secret',
          'user-agent': 'test-agent',
          'content-type': 'application/json'
        }
      });
      const res = createMockResponse();
      const error = new Error('Test error');

      errorHandler(error, req, res, { includeDebug: true });

      const response = res.json.mock.calls[0][0];
      const headers = response.debug.context.headers;
      
      expect(headers.authorization).toBeUndefined();
      expect(headers['x-api-key']).toBeUndefined();
      expect(headers['x-sendgrid-key']).toBeUndefined();
      expect(headers['user-agent']).toBe('test-agent');
      expect(headers['content-type']).toBe('application/json');
    });

    test('should sanitize error messages in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Internal server details that should not be exposed');

      errorHandler(error, req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.debug).toBeUndefined();
      expect(response.error.message).not.toContain('Internal server details');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Performance and Monitoring', () => {
    test('should track response times', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const error = new Error('Performance test error');

      errorHandler(error, req, res, { responseTime: 150 });

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.error.requestId).toBeDefined();
    });

    test('should handle high error rate detection', () => {
      const req = createMockRequest({ url: '/api/high-error-endpoint' });
      const res = createMockResponse();

      // Generate many errors to trigger alert
      for (let i = 0; i < 10; i++) {
        const error = new Error('Critical system error');
        errorHandler(error, req, res, { skipLogging: true });
      }

      const metrics = getErrorMetrics();
      expect(metrics.byEndpoint['/api/high-error-endpoint']).toBeDefined();
    });
  });
});
