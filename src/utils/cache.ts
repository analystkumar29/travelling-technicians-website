/**
 * Advanced Caching Layer
 * Multi-tier caching system with TTL, LRU eviction, and intelligent invalidation
 * 
 * Features:
 * - In-memory LRU cache for immediate access
 * - Browser localStorage for persistence
 * - TTL-based expiration
 * - Cache warming and prefetching
 * - Performance monitoring
 * - Automatic cache invalidation
 */

import { logger } from './logger';

const cacheLogger = logger.createModuleLogger('cache');

// Cache configuration
export interface CacheConfig {
  maxSize: number;           // Maximum number of items in memory
  defaultTTL: number;        // Default TTL in milliseconds
  persistToLocalStorage: boolean;
  compressionThreshold: number; // Compress values above this size
  performanceTracking: boolean;
}

export interface CacheEntry<T> {
  value: T;
  expires: number;
  created: number;
  accessed: number;
  hits: number;
  compressed?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  hitRate: number;
  memoryUsage: number;
  averageResponseTime: number;
}

// LRU Cache implementation with TTL and statistics
class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder = new Map<string, number>();
  private config: CacheConfig;
  private stats: CacheStats;
  private accessCounter = 0;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      persistToLocalStorage: true,
      compressionThreshold: 10000, // 10KB
      performanceTracking: true,
      ...config
    };

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      hitRate: 0,
      memoryUsage: 0,
      averageResponseTime: 0
    };

    // Load persisted cache on initialization
    if (this.config.persistToLocalStorage && typeof window !== 'undefined') {
      this.loadFromLocalStorage();
    }

    cacheLogger.info('Cache initialized', { config: this.config });
  }

  // Get value from cache
  async get(key: string): Promise<T | null> {
    const startTime = this.config.performanceTracking ? Date.now() : 0;

    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        this.stats.misses++;
        this.updateStats();
        return null;
      }

      // Check if expired
      if (Date.now() > entry.expires) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
        this.stats.misses++;
        this.updateStats();
        return null;
      }

      // Update access statistics
      entry.accessed = Date.now();
      entry.hits++;
      this.accessOrder.set(key, ++this.accessCounter);
      this.stats.hits++;

      let value = entry.value;

      // Decompress if needed
      if (entry.compressed && typeof value === 'string') {
        try {
          value = JSON.parse(value) as T;
        } catch (error) {
          cacheLogger.warn('Failed to decompress cache entry', { key, error });
          this.delete(key);
          return null;
        }
      }

      this.updateStats();
      
      if (this.config.performanceTracking) {
        const responseTime = Date.now() - startTime;
        this.updateResponseTime(responseTime);
      }

      cacheLogger.debug('Cache hit', { key, hits: entry.hits });
      return value;

    } catch (error) {
      cacheLogger.error('Cache get error', { key, error });
      return null;
    }
  }

  // Set value in cache
  async set(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const effectiveTTL = ttl || this.config.defaultTTL;
      const now = Date.now();
      
      let processedValue: T | string = value;
      let compressed = false;

      // Compress large values
      if (this.config.compressionThreshold && typeof value === 'object') {
        const serialized = JSON.stringify(value);
        if (serialized.length > this.config.compressionThreshold) {
          processedValue = serialized as T;
          compressed = true;
        }
      }

      const entry: CacheEntry<T> = {
        value: processedValue,
        expires: now + effectiveTTL,
        created: now,
        accessed: now,
        hits: 0,
        compressed
      };

      // Evict if at capacity
      if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
        this.evictLRU();
      }

      this.cache.set(key, entry);
      this.accessOrder.set(key, ++this.accessCounter);
      this.stats.sets++;

      // Persist to localStorage if enabled
      if (this.config.persistToLocalStorage && typeof window !== 'undefined') {
        this.persistToLocalStorage(key, entry);
      }

      this.updateStats();
      cacheLogger.debug('Cache set', { key, compressed, ttl: effectiveTTL });

    } catch (error) {
      cacheLogger.error('Cache set error', { key, error });
    }
  }

  // Delete from cache
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.accessOrder.delete(key);
    
    if (deleted) {
      this.stats.deletes++;
      this.updateStats();

      // Remove from localStorage
      if (this.config.persistToLocalStorage && typeof window !== 'undefined') {
        try {
          localStorage.removeItem(`cache_${key}`);
        } catch (error) {
          cacheLogger.warn('Failed to remove from localStorage', { key, error });
        }
      }

      cacheLogger.debug('Cache delete', { key });
    }

    return deleted;
  }

  // Clear all cache
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.accessOrder.clear();
    this.stats.deletes += size;
    this.updateStats();

    // Clear localStorage
    if (this.config.persistToLocalStorage && typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('cache_'));
        keys.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        cacheLogger.warn('Failed to clear localStorage', { error });
      }
    }

    cacheLogger.info('Cache cleared', { clearedItems: size });
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Prefetch data with cache warming
  async prefetch<K>(keys: string[], fetcher: (key: string) => Promise<K>, ttl?: number): Promise<void> {
    cacheLogger.info('Starting cache prefetch', { keyCount: keys.length });

    const promises = keys.map(async (key) => {
      try {
        // Skip if already cached and not expired
        const existing = await this.get(key);
        if (existing !== null) {
          return;
        }

        const value = await fetcher(key);
        await this.set(key, value as unknown as T, ttl);
      } catch (error) {
        cacheLogger.warn('Prefetch failed for key', { key, error });
      }
    });

    await Promise.all(promises);
    cacheLogger.info('Cache prefetch completed', { keyCount: keys.length });
  }

  // Get cache entries by pattern
  getByPattern(pattern: RegExp): Array<{ key: string; value: T }> {
    const results: Array<{ key: string; value: T }> = [];
    
    for (const [key, entry] of this.cache) {
      if (pattern.test(key) && Date.now() <= entry.expires) {
        results.push({ key, value: entry.value });
      }
    }

    return results;
  }

  // Invalidate cache entries by pattern
  invalidateByPattern(pattern: RegExp): number {
    let invalidated = 0;
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.delete(key);
        invalidated++;
      }
    }

    cacheLogger.info('Cache invalidation by pattern', { pattern: pattern.toString(), invalidated });
    return invalidated;
  }

  // Private methods
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;

    for (const [key, accessTime] of this.accessOrder) {
      if (accessTime < oldestAccess) {
        oldestAccess = accessTime;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
      this.stats.evictions++;
      cacheLogger.debug('LRU eviction', { key: oldestKey });
    }
  }

  private updateStats(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    this.stats.memoryUsage = this.cache.size;
  }

  private updateResponseTime(responseTime: number): void {
    const totalRequests = this.stats.hits + this.stats.misses;
    this.stats.averageResponseTime = 
      (this.stats.averageResponseTime * (totalRequests - 1) + responseTime) / totalRequests;
  }

  private persistToLocalStorage(key: string, entry: CacheEntry<T>): void {
    try {
      const persistData = {
        value: entry.value,
        expires: entry.expires,
        created: entry.created
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(persistData));
    } catch (error) {
      cacheLogger.warn('Failed to persist to localStorage', { key, error });
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('cache_'));
      let loaded = 0;

      for (const storageKey of keys) {
        try {
          const key = storageKey.replace('cache_', '');
          const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
          
          // Check if not expired
          if (data.expires && Date.now() < data.expires) {
            const entry: CacheEntry<T> = {
              value: data.value,
              expires: data.expires,
              created: data.created,
              accessed: Date.now(),
              hits: 0
            };
            
            this.cache.set(key, entry);
            this.accessOrder.set(key, ++this.accessCounter);
            loaded++;
          } else {
            // Remove expired entries
            localStorage.removeItem(storageKey);
          }
        } catch (error) {
          // Remove corrupted entries
          localStorage.removeItem(storageKey);
        }
      }

      cacheLogger.info('Cache loaded from localStorage', { loaded });
    } catch (error) {
      cacheLogger.warn('Failed to load from localStorage', { error });
    }
  }
}

// Cache instances for different data types
export const pricingCache = new AdvancedCache<any>({
  maxSize: 500,
  defaultTTL: 10 * 60 * 1000, // 10 minutes for pricing data
  persistToLocalStorage: true
});

export const deviceCache = new AdvancedCache<any>({
  maxSize: 200,
  defaultTTL: 60 * 60 * 1000, // 1 hour for device data
  persistToLocalStorage: true
});

export const apiCache = new AdvancedCache<any>({
  maxSize: 1000,
  defaultTTL: 5 * 60 * 1000, // 5 minutes for general API responses
  persistToLocalStorage: false // Don't persist API responses
});

// Cache warming utilities
export async function warmPricingCache(): Promise<void> {
  cacheLogger.info('Starting pricing cache warm-up');
  
  try {
    const commonCombinations = [
      { deviceType: 'mobile', brand: 'Apple', model: 'iPhone 15', service: 'screen_replacement' },
      { deviceType: 'mobile', brand: 'Apple', model: 'iPhone 14', service: 'screen_replacement' },
      { deviceType: 'mobile', brand: 'Samsung', model: 'Galaxy S24', service: 'screen_replacement' },
      { deviceType: 'laptop', brand: 'Apple', model: 'MacBook Pro', service: 'screen_replacement' },
      { deviceType: 'laptop', brand: 'Dell', model: 'XPS 13', service: 'battery_replacement' }
    ];

    const keys = commonCombinations.map(combo => 
      `pricing_${combo.deviceType}_${combo.brand}_${combo.model}_${combo.service}_standard`
    );

    await pricingCache.prefetch(keys, async (key) => {
      const [, deviceType, brand, model, service] = key.split('_');
      const response = await fetch(`/api/pricing/calculate-fixed?deviceType=${deviceType}&brand=${brand}&model=${model}&service=${service}&tier=standard`);
      return response.json();
    });

    cacheLogger.info('Pricing cache warm-up completed');
  } catch (error) {
    cacheLogger.error('Pricing cache warm-up failed', { error });
  }
}

// Cache invalidation helpers
export function invalidatePricingCache(pattern?: string): void {
  if (pattern) {
    pricingCache.invalidateByPattern(new RegExp(pattern));
  } else {
    pricingCache.clear();
  }
  cacheLogger.info('Pricing cache invalidated', { pattern });
}

export function invalidateDeviceCache(deviceType?: string): void {
  if (deviceType) {
    deviceCache.invalidateByPattern(new RegExp(`^${deviceType}_`));
  } else {
    deviceCache.clear();
  }
  cacheLogger.info('Device cache invalidated', { deviceType });
}

// Cache monitoring
export function getCacheReport(): {
  pricing: CacheStats;
  device: CacheStats;
  api: CacheStats;
} {
  return {
    pricing: pricingCache.getStats(),
    device: deviceCache.getStats(),
    api: apiCache.getStats()
  };
}

// Export cache instances and utilities
export { AdvancedCache };
export default {
  pricingCache,
  deviceCache,
  apiCache,
  warmPricingCache,
  invalidatePricingCache,
  invalidateDeviceCache,
  getCacheReport
}; 