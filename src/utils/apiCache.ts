/**
 * API Cache Layer
 * Smart caching for expensive database queries with cache keys based on query parameters
 * 
 * Features:
 * - Automatic cache key generation from query parameters
 * - TTL-based cache expiration optimized for different data types
 * - Cache hit/miss metrics and monitoring
 * - Preloading for popular requests
 * - Smart invalidation strategies
 */

import { logger } from './logger';
import { pricingCache, deviceCache, apiCache } from './cache';

const apiLogger = logger.createModuleLogger('apiCache');

// Cache configuration for different API endpoints
export const CACHE_CONFIG = {
  DEVICES_BRANDS: {
    ttl: 60 * 60 * 1000, // 1 hour
    keyPrefix: 'brands',
    cache: deviceCache
  },
  DEVICES_MODELS: {
    ttl: 60 * 60 * 1000, // 1 hour
    keyPrefix: 'models',
    cache: deviceCache
  },
  PRICING_CALCULATE: {
    ttl: 30 * 60 * 1000, // 30 minutes
    keyPrefix: 'pricing',
    cache: pricingCache
  },
  SERVICE_AREAS: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    keyPrefix: 'service_areas',
    cache: apiCache
  },
  PRICING_SERVICES: {
    ttl: 60 * 60 * 1000, // 1 hour
    keyPrefix: 'services',
    cache: apiCache
  }
} as const;

// Types
export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  averageResponseTime: number;
}

export interface CacheKeyOptions {
  prefix: string;
  normalize?: boolean;
  includeHeaders?: string[];
  excludeParams?: string[];
}

// Cache metrics tracking
const metrics = new Map<string, CacheMetrics>();

/**
 * Generate a smart cache key from query parameters
 */
export function generateCacheKey(
  endpoint: string, 
  params: Record<string, any> = {}, 
  options: CacheKeyOptions = { prefix: endpoint }
): string {
  const { prefix, normalize = true, excludeParams = [] } = options;
  
  // Filter out excluded parameters
  const filteredParams = Object.keys(params)
    .filter(key => !excludeParams.includes(key))
    .reduce((obj, key) => {
      obj[key] = params[key];
      return obj;
    }, {} as Record<string, any>);

  // Sort keys for consistent cache keys
  const sortedKeys = Object.keys(filteredParams).sort();
  
  const keyParts = sortedKeys.map(key => {
    let value = filteredParams[key];
    
    // Normalize common variations if enabled
    if (normalize && typeof value === 'string') {
      value = value.toLowerCase().trim().replace(/\s+/g, '_');
    }
    
    return `${key}:${value}`;
  });

  const cacheKey = `${prefix}_${keyParts.join('_')}`;
  
  // Ensure cache key is not too long (max 250 chars for Redis compatibility)
  if (cacheKey.length > 250) {
    const hash = Buffer.from(cacheKey).toString('base64').slice(0, 40);
    return `${prefix}_${hash}`;
  }

  return cacheKey;
}

/**
 * Wrapper function for caching API responses
 */
export async function withCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  configKey: keyof typeof CACHE_CONFIG,
  options: { 
    forceRefresh?: boolean;
    customTTL?: number;
  } = {}
): Promise<T> {
  const config = CACHE_CONFIG[configKey];
  const cache = config.cache;
  const ttl = options.customTTL || config.ttl;
  const startTime = Date.now();

  // Initialize metrics if not exists
  if (!metrics.has(configKey)) {
    metrics.set(configKey, {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      averageResponseTime: 0
    });
  }

  const metric = metrics.get(configKey)!;
  metric.totalRequests++;

  try {
    // Check cache first (unless force refresh)
    if (!options.forceRefresh) {
      const cached = await cache.get(cacheKey);
      if (cached !== null) {
        metric.hits++;
        updateMetrics(configKey, metric, Date.now() - startTime);
        
        apiLogger.debug('Cache hit', { 
          endpoint: configKey,
          cacheKey: cacheKey.substring(0, 50) + '...',
          hitRate: metric.hitRate 
        });
        
        return cached;
      }
    }

    // Cache miss - fetch from source
    apiLogger.debug('Cache miss - fetching from source', { 
      endpoint: configKey,
      cacheKey: cacheKey.substring(0, 50) + '...'
    });

    const data = await fetcher();
    
    // Store in cache
    await cache.set(cacheKey, data, ttl);
    
    metric.misses++;
    updateMetrics(configKey, metric, Date.now() - startTime);
    
    apiLogger.info('Data fetched and cached', { 
      endpoint: configKey,
      cacheKey: cacheKey.substring(0, 50) + '...',
      hitRate: metric.hitRate
    });

    return data;

  } catch (error) {
    metric.misses++;
    updateMetrics(configKey, metric, Date.now() - startTime);
    
    apiLogger.error('Cache operation failed', { 
      endpoint: configKey,
      cacheKey: cacheKey.substring(0, 50) + '...',
      error 
    });
    
    throw error;
  }
}

/**
 * Update cache metrics
 */
function updateMetrics(configKey: string, metric: CacheMetrics, responseTime: number): void {
  const total = metric.hits + metric.misses;
  metric.hitRate = total > 0 ? (metric.hits / total) * 100 : 0;
  metric.averageResponseTime = ((metric.averageResponseTime * (total - 1)) + responseTime) / total;
  
  metrics.set(configKey, metric);
}

/**
 * Preload popular cache entries
 */
export async function preloadPopularData(): Promise<void> {
  apiLogger.info('Starting cache preload for popular data');

  try {
    // Preload common device brands
    const popularDeviceTypes = ['mobile', 'laptop'];
    const brandPromises = popularDeviceTypes.map(async (deviceType) => {
      const cacheKey = generateCacheKey('brands', { deviceType });
      // This would typically call the actual API function
      // For now, we'll just log the intent
      apiLogger.debug('Would preload brands', { deviceType, cacheKey });
    });

    // Preload common device models for popular brands
    const popularBrands = [
      { deviceType: 'mobile', brand: 'Apple' },
      { deviceType: 'mobile', brand: 'Samsung' },
      { deviceType: 'laptop', brand: 'Apple' },
      { deviceType: 'laptop', brand: 'Dell' }
    ];

    const modelPromises = popularBrands.map(async ({ deviceType, brand }) => {
      const cacheKey = generateCacheKey('models', { deviceType, brand });
      apiLogger.debug('Would preload models', { deviceType, brand, cacheKey });
    });

    // Preload common pricing scenarios
    const popularPricingScenarios = [
      { deviceType: 'mobile', brand: 'Apple', model: 'iPhone 15', service: 'screen_replacement', tier: 'standard' },
      { deviceType: 'mobile', brand: 'Samsung', model: 'Galaxy S24', service: 'screen_replacement', tier: 'standard' },
      { deviceType: 'laptop', brand: 'Apple', model: 'MacBook Pro', service: 'screen_replacement', tier: 'standard' }
    ];

    const pricingPromises = popularPricingScenarios.map(async (scenario) => {
      const cacheKey = generateCacheKey('pricing', scenario);
      apiLogger.debug('Would preload pricing', { scenario, cacheKey });
    });

    await Promise.all([...brandPromises, ...modelPromises, ...pricingPromises]);
    
    apiLogger.info('Cache preload completed successfully');
  } catch (error) {
    apiLogger.error('Cache preload failed', { error });
  }
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateByPattern(pattern: string, configKey?: keyof typeof CACHE_CONFIG): Promise<number> {
  try {
    const regex = new RegExp(pattern);
    let totalInvalidated = 0;

    if (configKey) {
      // Invalidate specific cache
      const cache = CACHE_CONFIG[configKey].cache;
      const invalidated = await cache.invalidateByPattern(regex);
      totalInvalidated += invalidated;
      
      apiLogger.info('Cache invalidated by pattern', { 
        pattern, 
        configKey, 
        invalidated 
      });
    } else {
      // Invalidate all caches
      for (const [key, config] of Object.entries(CACHE_CONFIG)) {
        const invalidated = await config.cache.invalidateByPattern(regex);
        totalInvalidated += invalidated;
      }
      
      apiLogger.info('All caches invalidated by pattern', { 
        pattern, 
        totalInvalidated 
      });
    }

    return totalInvalidated;
  } catch (error) {
    apiLogger.error('Cache invalidation failed', { pattern, configKey, error });
    return 0;
  }
}

/**
 * Get cache metrics for monitoring
 */
export function getCacheMetrics(): Record<string, CacheMetrics> {
  const result: Record<string, CacheMetrics> = {};
  
  for (const [key, metric] of metrics.entries()) {
    result[key] = { ...metric };
  }
  
  return result;
}

/**
 * Cache warming for specific endpoints
 */
export async function warmCache(endpoint: keyof typeof CACHE_CONFIG, params: any[] = []): Promise<void> {
  apiLogger.info('Starting cache warming', { endpoint, paramCount: params.length });

  try {
    const config = CACHE_CONFIG[endpoint];
    
    for (const param of params) {
      const cacheKey = generateCacheKey(endpoint, param, { prefix: config.keyPrefix });
      
      // Check if already cached
      const exists = await config.cache.get(cacheKey);
      if (exists === null) {
        apiLogger.debug('Cache warming - would fetch', { endpoint, cacheKey });
        // In real implementation, this would call the actual fetcher
      }
    }
    
    apiLogger.info('Cache warming completed', { endpoint });
  } catch (error) {
    apiLogger.error('Cache warming failed', { endpoint, error });
  }
}

/**
 * Clear all API caches
 */
export async function clearAllCaches(): Promise<void> {
  apiLogger.info('Clearing all API caches');
  
  try {
    for (const config of Object.values(CACHE_CONFIG)) {
      config.cache.clear();
    }
    
    // Reset metrics
    metrics.clear();
    
    apiLogger.info('All API caches cleared successfully');
  } catch (error) {
    apiLogger.error('Failed to clear caches', { error });
  }
}

// Export commonly used functions
export {
  generateCacheKey as cacheKey,
  withCache as cached,
  getCacheMetrics as metrics,
  invalidateByPattern as invalidate,
  preloadPopularData as preload,
  warmCache as warm,
  clearAllCaches as clear
};

const apiCacheUtils = {
  generateCacheKey,
  withCache,
  preloadPopularData,
  invalidateByPattern,
  getCacheMetrics,
  warmCache,
  clearAllCaches,
  CACHE_CONFIG
};

export default apiCacheUtils;
