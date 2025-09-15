/**
 * Example API route demonstrating integration of cache and error handler utilities
 * This shows best practices for using the advanced caching and error handling systems
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandler } from '@/utils/apiErrorHandler';
import { pricingCache, deviceCache } from '@/utils/cache';
import { getServiceSupabase } from '@/utils/supabaseClient';

interface DemoResponse {
  success: boolean;
  data: {
    message: string;
    cached_data?: any;
    fresh_data?: any;
    cache_stats?: any;
  };
  timestamp: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse<DemoResponse>) {
  if (req.method !== 'GET') {
    const error = new Error('Only GET method is supported for this demo');
    error.name = 'MethodNotAllowedError';
    throw error;
  }

  const { action = 'demo', invalidate } = req.query;

  // Handle cache invalidation if requested
  if (invalidate === 'true') {
    await pricingCache.clear();
    await deviceCache.clear();
  }

  let cachedData, freshData;

  switch (action) {
    case 'cache-demo':
      // Demonstrate caching functionality
      const cacheKey = 'demo:pricing:basic';
      
      // Try to get from cache first
      cachedData = await pricingCache.get(cacheKey);
      
      if (!cachedData) {
        // Simulate expensive operation
        await new Promise(resolve => setTimeout(resolve, 100));
        freshData = {
          prices: [100, 150, 200],
          timestamp: new Date().toISOString(),
          operation: 'expensive_calculation'
        };
        
        // Cache for 10 minutes
        await pricingCache.set(cacheKey, freshData, 10 * 60 * 1000);
      }
      break;

    case 'database-demo':
      // Demonstrate database operations with caching
      const dbCacheKey = 'demo:devices:brands';
      cachedData = await deviceCache.get(dbCacheKey);
      
      if (!cachedData) {
        const supabase = getServiceSupabase();
        const { data: brands, error } = await supabase
          .from('device_brands')
          .select('name')
          .limit(5);
          
        if (error) {
          throw new Error(`Database operation failed: ${error.message}`);
        }
        
        freshData = brands;
        await deviceCache.set(dbCacheKey, brands, 30 * 60 * 1000); // 30 minutes
      }
      break;

    case 'error-demo':
      // Demonstrate various error types
      const { errorType = 'validation' } = req.query;
      
      switch (errorType) {
        case 'validation':
          throw new Error('Invalid input provided for demonstration');
        case 'timeout':
          const timeoutError = new Error('Operation timed out');
          timeoutError.name = 'TimeoutError';
          throw timeoutError;
        case 'database':
          throw new Error('Database connection failed - this is a demo error');
        case 'external-api':
          throw new Error('sendgrid api connection failed - demo error');
        default:
          throw new Error('Unknown error type for demonstration');
      }

    default:
      // Default demo response
      break;
  }

  // Get cache statistics for monitoring
  const cacheStats = {
    pricing: pricingCache.getStats(),
    device: deviceCache.getStats()
  };

  return res.status(200).json({
    success: true,
    data: {
      message: `Integration demo completed successfully for action: ${action}`,
      cached_data: cachedData,
      fresh_data: freshData,
      cache_stats: cacheStats
    },
    timestamp: new Date().toISOString()
  });
}

// Export with error handling and timeout
export default withErrorHandler(handler, {
  timeout: 10000, // 10 second timeout for demo operations
  includeDebug: process.env.NODE_ENV === 'development'
});
