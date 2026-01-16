/**
 * Cache Invalidation API
 * Allows selective or complete cache clearing for data updates
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/utils/logger';
import { invalidateByPattern, clearAllCaches } from '@/utils/apiCache';
import { invalidatePricingCache, invalidateDeviceCache, invalidateSitemapCache } from '@/utils/cache';

const apiLogger = logger.createModuleLogger('api/cache/invalidate');

interface CacheInvalidateResponse {
  success: boolean;
  message: string;
  invalidated: {
    pattern?: string;
    count: number;
    caches: string[];
  };
  timestamp: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CacheInvalidateResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      invalidated: { count: 0, caches: [] },
      timestamp: new Date().toISOString(),
      error: 'Only POST requests are allowed'
    });
  }

  const { pattern, cacheType, clearAll = false } = req.body;

  try {
    apiLogger.info('Cache invalidation requested', { pattern, cacheType, clearAll });

    let invalidatedCount = 0;
    let invalidatedCaches: string[] = [];

    if (clearAll) {
      // Clear all caches
      await clearAllCaches();
      invalidatePricingCache();
      invalidateDeviceCache();
      invalidateSitemapCache();
      
      invalidatedCaches = ['all'];
      invalidatedCount = 1;
      
      apiLogger.info('All caches cleared');
    } else if (pattern) {
      // Invalidate by pattern
      if (cacheType) {
        // Specific cache type
        switch (cacheType) {
          case 'pricing':
            invalidatePricingCache(pattern);
            invalidatedCaches.push('pricing');
            break;
          case 'device':
            invalidateDeviceCache(pattern);
            invalidatedCaches.push('device');
            break;
          case 'sitemap':
            invalidateSitemapCache(pattern);
            invalidatedCaches.push('sitemap');
            break;
          default:
            invalidatedCount = await invalidateByPattern(pattern, cacheType);
            invalidatedCaches.push(cacheType);
        }
        invalidatedCount = invalidatedCount || 1;
      } else {
        // All cache types
        invalidatedCount = await invalidateByPattern(pattern);
        invalidatePricingCache(pattern);
        invalidateDeviceCache(pattern);
        invalidateSitemapCache(pattern);
        invalidatedCaches = ['all'];
      }
      
      apiLogger.info('Cache invalidated by pattern', { pattern, invalidatedCount });
    } else if (cacheType) {
      // Clear specific cache type completely
      switch (cacheType) {
        case 'pricing':
          invalidatePricingCache();
          invalidatedCaches.push('pricing');
          invalidatedCount = 1;
          break;
        case 'device':
          invalidateDeviceCache();
          invalidatedCaches.push('device');
          invalidatedCount = 1;
          break;
        case 'sitemap':
          invalidateSitemapCache();
          invalidatedCaches.push('sitemap');
          invalidatedCount = 1;
          break;
        default:
          invalidatedCount = await invalidateByPattern('.*', cacheType);
          invalidatedCaches.push(cacheType);
      }
      
      apiLogger.info('Cache type cleared', { cacheType });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Must specify pattern, cacheType, or clearAll',
        invalidated: { count: 0, caches: [] },
        timestamp: new Date().toISOString(),
        error: 'Invalid request parameters'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully invalidated ${invalidatedCount} cache entries`,
      invalidated: {
        pattern,
        count: invalidatedCount,
        caches: invalidatedCaches
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    apiLogger.error('Cache invalidation failed', { error });

    return res.status(500).json({
      success: false,
      message: 'Cache invalidation failed',
      invalidated: { count: 0, caches: [] },
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
