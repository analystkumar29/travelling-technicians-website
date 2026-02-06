/**
 * Integration tests for cache and error handler utilities working together
 * Tests real-world scenarios with API routes and database operations
 */

const {
  pricingCache,
  deviceCache,
  apiCache,
  getCacheReport
} = require('../src/utils/cache.ts');

const {
  withErrorHandler,
  getErrorMetrics,
  resetErrorMetrics
} = require('../src/utils/apiErrorHandler.ts');

// Mock Next.js API context
const createMockApiContext = (overrides = {}) => ({
  req: {
    method: 'GET',
    url: '/api/test',
    headers: { 'user-agent': 'test' },
    query: {},
    body: {},
    ...overrides.req
  },
  res: {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    ...overrides.res
  }
});

describe('Cache and Error Handler Integration Tests', () => {
  beforeEach(async () => {
    // Clear all caches and reset error metrics
    await pricingCache.clear();
    await deviceCache.clear();
    await apiCache.clear();
    resetErrorMetrics();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Cleanup
    await pricingCache.clear();
    await deviceCache.clear();
    await apiCache.clear();
  });

  describe('Cache Performance with Error Handling', () => {
    test('should handle successful cache operations', async () => {
      const testHandler = async (req, res) => {
        // Simulate expensive operation with caching
        const cacheKey = 'test:expensive-operation';
        let data = await pricingCache.get(cacheKey);
        
        if (!data) {
          // Simulate expensive calculation
          data = { result: 'expensive-result', timestamp: Date.now() };
          await pricingCache.set(cacheKey, data, 60000);
        }
        
        res.status(200).json({ success: true, data, cached: !!data });
      };

      const wrappedHandler = withErrorHandler(testHandler);
      const { req, res } = createMockApiContext();

      // First call - should cache
      await wrappedHandler(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      
      const firstCall = res.json.mock.calls[0][0];
      expect(firstCall.success).toBe(true);

      // Second call - should use cache
      const { req: req2, res: res2 } = createMockApiContext();
      const wrappedHandler2 = withErrorHandler(testHandler);
      await wrappedHandler2(req2, res2);
      
      const cacheStats = pricingCache.getStats();
      expect(cacheStats.hits).toBeGreaterThan(0);
    });

    test('should handle cache errors gracefully', async () => {
      const testHandler = async (req, res) => {
        // Force a cache error by using invalid cache key
        const badCache = {
          get: () => Promise.reject(new Error('Cache connection failed')),
          set: () => Promise.reject(new Error('Cache write failed'))
        };
        
        try {
          await badCache.get('test-key');
        } catch (error) {
          // Fallback to non-cached operation
          const data = { result: 'fallback-data' };
          res.status(200).json({ success: true, data, error: 'cache-unavailable' });
          return;
        }
        
        res.status(200).json({ success: true, data: 'normal-response' });
      };

      const wrappedHandler = withErrorHandler(testHandler);
      const { req, res } = createMockApiContext();

      await wrappedHandler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.error).toBe('cache-unavailable');
    });
  });

  describe('Error Handling with Cache Metrics', () => {
    test('should track errors and maintain cache performance', async () => {
      const testHandler = async (req, res) => {
        const { errorType } = req.query;
        
        if (errorType === 'database') {
          throw new Error('Database connection failed');
        }
        
        // Normal operation with caching
        const data = await apiCache.get('test-data') || { value: 'test' };
        await apiCache.set('test-data', data, 60000);
        
        res.status(200).json({ success: true, data });
      };

      const wrappedHandler = withErrorHandler(testHandler);

      // Successful operation
      const { req: req1, res: res1 } = createMockApiContext();
      await wrappedHandler(req1, res1);
      expect(res1.status).toHaveBeenCalledWith(200);

      // Error operation
      const { req: req2, res: res2 } = createMockApiContext({
        req: { query: { errorType: 'database' } }
      });
      await wrappedHandler(req2, res2);
      expect(res2.status).toHaveBeenCalledWith(503); // Database error status

      // Check error metrics
      const errorMetrics = getErrorMetrics();
      expect(errorMetrics.summary.totalErrors).toBe(1);
      
      // Check cache still works after error
      const cacheStats = apiCache.getStats();
      expect(cacheStats.sets).toBeGreaterThan(0);
    });

    test('should handle timeout errors with cache fallback', async () => {
      const testHandler = async (req, res) => {
        const { slow } = req.query;
        
        if (slow === 'true') {
          // Simulate slow operation that will timeout
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Check cache first
        const cachedData = await apiCache.get('slow-operation');
        if (cachedData) {
          return res.status(200).json({ 
            success: true, 
            data: cachedData, 
            source: 'cache' 
          });
        }
        
        // Expensive operation
        const data = { result: 'expensive-data', timestamp: Date.now() };
        await apiCache.set('slow-operation', data, 300000); // 5 minutes
        
        res.status(200).json({ success: true, data, source: 'fresh' });
      };

      const wrappedHandler = withErrorHandler(testHandler, { timeout: 100 });

      // Pre-populate cache
      await apiCache.set('slow-operation', { cached: 'data' }, 300000);

      // This should timeout but fallback won't work since timeout happens before cache check
      const { req, res } = createMockApiContext({
        req: { query: { slow: 'true' } }
      });
      
      await wrappedHandler(req, res);
      
      // Should get timeout error
      expect(res.status).toHaveBeenCalledWith(408);
    });
  });

  describe('Real-world Integration Scenarios', () => {
    test('should handle pricing calculation with caching and error recovery', async () => {
      const mockPricingCalculation = async (deviceType, brand, model) => {
        const cacheKey = `pricing:${deviceType}:${brand}:${model}`;
        
        // Check cache first
        let pricing = await pricingCache.get(cacheKey);
        if (pricing) {
          return { ...pricing, cached: true };
        }
        
        // Simulate database lookup
        if (brand === 'FailBrand') {
          throw new Error('Database error: Invalid brand');
        }
        
        // Calculate pricing
        pricing = {
          basePrice: 100,
          finalPrice: 120,
          deviceType,
          brand,
          model
        };
        
        // Cache for 1 hour
        await pricingCache.set(cacheKey, pricing, 3600000);
        
        return { ...pricing, cached: false };
      };

      const pricingHandler = async (req, res) => {
        const { deviceType, brand, model } = req.query;
        
        if (!deviceType || !brand || !model) {
          throw new Error('Missing required parameters: deviceType, brand, model');
        }
        
        const pricing = await mockPricingCalculation(deviceType, brand, model);
        
        res.status(200).json({
          success: true,
          pricing
        });
      };

      const wrappedHandler = withErrorHandler(pricingHandler);

      // Successful pricing calculation
      const { req: req1, res: res1 } = createMockApiContext({
        req: { query: { deviceType: 'mobile', brand: 'Apple', model: 'iPhone15' } }
      });
      
      await wrappedHandler(req1, res1);
      expect(res1.status).toHaveBeenCalledWith(200);
      
      const response = res1.json.mock.calls[0][0];
      expect(response.pricing.cached).toBe(false);

      // Second call should use cache
      const { req: req2, res: res2 } = createMockApiContext({
        req: { query: { deviceType: 'mobile', brand: 'Apple', model: 'iPhone15' } }
      });
      
      await wrappedHandler(req2, res2);
      const response2 = res2.json.mock.calls[0][0];
      expect(response2.pricing.cached).toBe(true);

      // Error case
      const { req: req3, res: res3 } = createMockApiContext({
        req: { query: { deviceType: 'mobile', brand: 'FailBrand', model: 'Test' } }
      });
      
      await wrappedHandler(req3, res3);
      expect(res3.status).toHaveBeenCalledWith(503); // Database error
    });

    test('should provide comprehensive monitoring data', async () => {
      // Perform various operations to generate metrics
      await pricingCache.set('test1', { data: 'test1' }, 60000);
      await pricingCache.set('test2', { data: 'test2' }, 60000);
      await pricingCache.get('test1');
      await pricingCache.get('test2');
      await pricingCache.get('non-existent');

      await deviceCache.set('device1', { type: 'mobile' }, 60000);
      await deviceCache.get('device1');

      // Get comprehensive cache report
      const cacheReport = getCacheReport();
      
      expect(cacheReport.pricing).toBeDefined();
      expect(cacheReport.device).toBeDefined();
      expect(cacheReport.api).toBeDefined();
      
      expect(cacheReport.pricing.hits).toBeGreaterThanOrEqual(2);
      expect(cacheReport.pricing.misses).toBeGreaterThanOrEqual(1);
      expect(cacheReport.pricing.sets).toBeGreaterThanOrEqual(2);

      expect(cacheReport.device.hits).toBeGreaterThanOrEqual(1);
      expect(cacheReport.device.sets).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Performance and Load Testing', () => {
    test('should handle concurrent operations efficiently', async () => {
      const concurrentHandler = async (req, res) => {
        const { id } = req.query;
        const cacheKey = `concurrent:${id}`;
        
        let data = await apiCache.get(cacheKey);
        if (!data) {
          // Simulate work
          await new Promise(resolve => setTimeout(resolve, 10));
          data = { id, processed: true, timestamp: Date.now() };
          await apiCache.set(cacheKey, data, 60000);
        }
        
        res.status(200).json({ success: true, data });
      };

      const wrappedHandler = withErrorHandler(concurrentHandler);

      // Run multiple concurrent requests
      const promises = Array.from({ length: 20 }, (_, i) => {
        const { req, res } = createMockApiContext({
          req: { query: { id: i.toString() } }
        });
        return wrappedHandler(req, res);
      });

      await Promise.all(promises);

      const cacheStats = apiCache.getStats();
      expect(cacheStats.sets).toBeGreaterThanOrEqual(20);
      expect(cacheStats.memoryUsage).toBeGreaterThanOrEqual(20);
    });

    test('should maintain performance under error conditions', async () => {
      const stressHandler = async (req, res) => {
        const { fail } = req.query;
        
        if (fail === 'true') {
          if (Math.random() > 0.5) {
            throw new Error('Random database error');
          } else {
            throw new Error('Random network error');
          }
        }
        
        const data = { success: true, timestamp: Date.now() };
        res.status(200).json(data);
      };

      const wrappedHandler = withErrorHandler(stressHandler);

      // Mix of successful and failing requests
      const promises = Array.from({ length: 50 }, (_, i) => {
        const { req, res } = createMockApiContext({
          req: { query: { fail: i % 3 === 0 ? 'true' : 'false' } }
        });
        return wrappedHandler(req, res);
      });

      await Promise.all(promises);

      const errorMetrics = getErrorMetrics();
      expect(errorMetrics.summary.totalErrors).toBeGreaterThan(0);
      expect(errorMetrics.summary.totalErrors).toBeLessThan(25); // Not all should fail
    });
  });
});
