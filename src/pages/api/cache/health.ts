/**
 * Cache Health Monitoring API
 * Provides insights into cache performance, hit rates, and system health
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/utils/logger';
import { getCacheReport } from '@/utils/cache';
import { getCacheMetrics } from '@/utils/apiCache';

const apiLogger = logger.createModuleLogger('api/cache/health');

interface CacheHealthResponse {
  success: boolean;
  timestamp: string;
  system: {
    memory: {
      pricing: any;
      device: any;
      api: any;
    };
    api: Record<string, any>;
    overall: {
      totalHits: number;
      totalMisses: number;
      overallHitRate: number;
      averageResponseTime: number;
    };
  };
  recommendations?: string[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CacheHealthResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      timestamp: new Date().toISOString(),
      system: { memory: { pricing: null, device: null, api: null }, api: {}, overall: { totalHits: 0, totalMisses: 0, overallHitRate: 0, averageResponseTime: 0 } },
      error: 'Method not allowed'
    });
  }

  // Set cache headers - cache health data for 1 minute
  res.setHeader('Cache-Control', 'max-age=60, stale-while-revalidate=120');
  res.setHeader('Vary', 'Accept-Encoding');

  try {
    apiLogger.info('Fetching cache health metrics');

    // Get memory cache statistics
    const memoryCacheReport = getCacheReport();
    
    // Get API cache metrics
    const apiCacheMetrics = getCacheMetrics();

    // Calculate overall statistics
    const overall = calculateOverallStats(memoryCacheReport, apiCacheMetrics);

    // Generate recommendations
    const recommendations = generateRecommendations(memoryCacheReport, apiCacheMetrics, overall);

    const healthData: CacheHealthResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      system: {
        memory: memoryCacheReport,
        api: apiCacheMetrics,
        overall
      },
      recommendations: recommendations.length > 0 ? recommendations : undefined
    };

    apiLogger.info('Cache health check completed', {
      overallHitRate: overall.overallHitRate,
      totalRequests: overall.totalHits + overall.totalMisses,
      recommendationCount: recommendations.length
    });

    return res.status(200).json(healthData);

  } catch (error) {
    apiLogger.error('Cache health check failed', { error });

    return res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      system: { 
        memory: { pricing: null, device: null, api: null }, 
        api: {}, 
        overall: { totalHits: 0, totalMisses: 0, overallHitRate: 0, averageResponseTime: 0 } 
      },
      error: 'Failed to retrieve cache health metrics'
    });
  }
}

/**
 * Calculate overall cache statistics
 */
function calculateOverallStats(memoryCacheReport: any, apiCacheMetrics: any) {
  let totalHits = 0;
  let totalMisses = 0;
  let totalResponseTime = 0;
  let totalRequests = 0;

  // Aggregate memory cache stats
  for (const cache of Object.values(memoryCacheReport)) {
    if (cache && typeof cache === 'object') {
      totalHits += (cache as any).hits || 0;
      totalMisses += (cache as any).misses || 0;
      const requests = ((cache as any).hits || 0) + ((cache as any).misses || 0);
      totalResponseTime += ((cache as any).averageResponseTime || 0) * requests;
      totalRequests += requests;
    }
  }

  // Aggregate API cache stats
  for (const metrics of Object.values(apiCacheMetrics)) {
    if (metrics && typeof metrics === 'object') {
      totalHits += (metrics as any).hits || 0;
      totalMisses += (metrics as any).misses || 0;
      const requests = ((metrics as any).hits || 0) + ((metrics as any).misses || 0);
      totalResponseTime += ((metrics as any).averageResponseTime || 0) * requests;
      totalRequests += requests;
    }
  }

  const overallHitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
  const averageResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;

  return {
    totalHits,
    totalMisses,
    overallHitRate: Math.round(overallHitRate * 100) / 100,
    averageResponseTime: Math.round(averageResponseTime * 100) / 100
  };
}

/**
 * Generate cache optimization recommendations
 */
function generateRecommendations(memoryCacheReport: any, apiCacheMetrics: any, overall: any): string[] {
  const recommendations: string[] = [];

  // Overall hit rate recommendations
  if (overall.overallHitRate < 50) {
    recommendations.push('Low cache hit rate detected. Consider increasing cache TTL or warming cache with popular data.');
  } else if (overall.overallHitRate > 95) {
    recommendations.push('Very high cache hit rate. Consider reducing cache TTL to ensure data freshness.');
  }

  // Response time recommendations
  if (overall.averageResponseTime > 100) {
    recommendations.push('High average response time. Consider optimizing cache storage or implementing cache compression.');
  }

  // Memory usage recommendations
  const memoryUsageIssues = checkMemoryUsage(memoryCacheReport);
  recommendations.push(...memoryUsageIssues);

  // API-specific recommendations
  const apiRecommendations = checkApiCachePerformance(apiCacheMetrics);
  recommendations.push(...apiRecommendations);

  // Health status recommendations
  const healthIssues = checkCacheHealth(memoryCacheReport);
  recommendations.push(...healthIssues);

  return recommendations;
}

/**
 * Check memory cache usage patterns
 */
function checkMemoryUsage(memoryCacheReport: any): string[] {
  const recommendations: string[] = [];

  for (const [cacheType, cache] of Object.entries(memoryCacheReport)) {
    if (cache && typeof cache === 'object') {
      const memoryUsage = (cache as any).memoryUsage || 0;
      const hitRate = (cache as any).hitRate || 0;

      if (memoryUsage > 800) {
        recommendations.push(`${cacheType} cache approaching memory limit (${memoryUsage}/1000). Consider increasing max size or implementing better eviction.`);
      }

      if (hitRate < 30) {
        recommendations.push(`${cacheType} cache has low hit rate (${hitRate}%). Review caching strategy for this cache type.`);
      }
    }
  }

  return recommendations;
}

/**
 * Check API cache performance
 */
function checkApiCachePerformance(apiCacheMetrics: any): string[] {
  const recommendations: string[] = [];

  for (const [endpoint, metrics] of Object.entries(apiCacheMetrics)) {
    if (metrics && typeof metrics === 'object') {
      const hitRate = (metrics as any).hitRate || 0;
      const totalRequests = (metrics as any).totalRequests || 0;

      if (totalRequests > 10 && hitRate < 40) {
        recommendations.push(`${endpoint} API has low cache hit rate (${hitRate}%). Consider longer TTL or cache warming.`);
      }

      if (totalRequests === 0) {
        recommendations.push(`${endpoint} API has no recorded requests. Consider preloading this endpoint.`);
      }
    }
  }

  return recommendations;
}

/**
 * Check cache health status
 */
function checkCacheHealth(memoryCacheReport: any): string[] {
  const recommendations: string[] = [];

  for (const [cacheType, cache] of Object.entries(memoryCacheReport)) {
    if (cache && typeof cache === 'object' && (cache as any).health) {
      const health = (cache as any).health;
      
      if (!health.isHealthy) {
        recommendations.push(`${cacheType} cache health check failing. Last check: ${new Date(health.lastCheck).toLocaleString()}, Failures: ${health.failures}`);
      }
    }
  }

  return recommendations;
}
