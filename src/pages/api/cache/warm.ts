/**
 * Cache Warming API
 * Pre-loads popular data into cache to improve response times
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/utils/logger';
import { preloadPopularData, warmCache } from '@/utils/apiCache';

const apiLogger = logger.createModuleLogger('api/cache/warm');

interface CacheWarmResponse {
  success: boolean;
  message: string;
  warmed: {
    endpoints: string[];
    count: number;
  };
  duration: number;
  timestamp: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CacheWarmResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      warmed: { endpoints: [], count: 0 },
      duration: 0,
      timestamp: new Date().toISOString(),
      error: 'Only POST requests are allowed'
    });
  }

  const startTime = Date.now();
  const { endpoints, force = false } = req.body;

  try {
    apiLogger.info('Starting cache warming process', { endpoints, force });

    let warmedEndpoints: string[] = [];
    let warmedCount = 0;

    if (endpoints && Array.isArray(endpoints)) {
      // Warm specific endpoints
      for (const endpoint of endpoints) {
        try {
          if (endpoint in { 'DEVICES_BRANDS': 1, 'DEVICES_MODELS': 1, 'PRICING_CALCULATE': 1, 'SERVICE_AREAS': 1 }) {
            await warmCache(endpoint as any, getDefaultParamsForEndpoint(endpoint));
            warmedEndpoints.push(endpoint);
            warmedCount++;
          }
        } catch (error) {
          apiLogger.warn('Failed to warm endpoint', { endpoint, error });
        }
      }
    } else {
      // Warm popular data
      await preloadPopularData();
      warmedEndpoints = ['popular-data'];
      warmedCount = 1;
    }

    const duration = Date.now() - startTime;

    apiLogger.info('Cache warming completed', {
      warmedEndpoints,
      warmedCount,
      duration
    });

    return res.status(200).json({
      success: true,
      message: `Successfully warmed ${warmedCount} cache endpoint(s)`,
      warmed: {
        endpoints: warmedEndpoints,
        count: warmedCount
      },
      duration,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    apiLogger.error('Cache warming failed', { error, duration });

    return res.status(500).json({
      success: false,
      message: 'Cache warming failed',
      warmed: { endpoints: [], count: 0 },
      duration,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get default parameters for warming specific endpoints
 */
function getDefaultParamsForEndpoint(endpoint: string): any[] {
  switch (endpoint) {
    case 'DEVICES_BRANDS':
      return [
        { deviceType: 'mobile' },
        { deviceType: 'laptop' },
        { deviceType: 'tablet' }
      ];
    
    case 'DEVICES_MODELS':
      return [
        { deviceType: 'mobile', brand: 'Apple' },
        { deviceType: 'mobile', brand: 'Samsung' },
        { deviceType: 'mobile', brand: 'Google' },
        { deviceType: 'laptop', brand: 'Apple' },
        { deviceType: 'laptop', brand: 'Dell' },
        { deviceType: 'laptop', brand: 'HP' }
      ];
    
    case 'PRICING_CALCULATE':
      return [
        { deviceType: 'mobile', brand: 'Apple', model: 'iPhone 15', service: 'screen_replacement', tier: 'standard' },
        { deviceType: 'mobile', brand: 'Apple', model: 'iPhone 14', service: 'screen_replacement', tier: 'standard' },
        { deviceType: 'mobile', brand: 'Samsung', model: 'Galaxy S24', service: 'screen_replacement', tier: 'standard' },
        { deviceType: 'mobile', brand: 'Apple', model: 'iPhone 15', service: 'battery_replacement', tier: 'standard' },
        { deviceType: 'laptop', brand: 'Apple', model: 'MacBook Pro', service: 'screen_replacement', tier: 'standard' },
        { deviceType: 'laptop', brand: 'Apple', model: 'MacBook Air', service: 'battery_replacement', tier: 'standard' }
      ];
    
    case 'SERVICE_AREAS':
      return [{}]; // No parameters needed for service areas
    
    default:
      return [];
  }
}
