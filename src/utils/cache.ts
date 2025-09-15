/**
 * Advanced Caching Layer
 * Multi-tier caching system with TTL, LRU eviction, and intelligent invalidation
 * 
 * Features:
 * - Redis-based caching with memory fallback
 * - In-memory LRU cache for immediate access
 * - Browser localStorage for persistence
 * - TTL-based expiration
 * - Cache warming and prefetching
 * - Performance monitoring
 * - Automatic cache invalidation
 * - Cache health monitoring
 */

import { logger } from './logger';

// Redis client interface for potential future Redis integration
interface RedisLikeClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number }): Promise<void>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  ping(): Promise<string>;
}

// Memory-based Redis fallback implementation
class MemoryRedisClient implements RedisLikeClient {
  private store = new Map<string, { value: string; expires?: number }>();
  private isConnected = true;

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    if (entry.expires && Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    
    return entry.value;
  }

  async set(key: string, value: string, options?: { EX?: number }): Promise<void> {
    const entry: { value: string; expires?: number } = { value };
    if (options?.EX) {
      entry.expires = Date.now() + (options.EX * 1000);
    }
    this.store.set(key, entry);
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return 0;
    
    if (entry.expires && Date.now() > entry.expires) {
      this.store.delete(key);
      return 0;
    }
    
    return 1;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.store.keys()).filter(key => regex.test(key));
  }

  async ping(): Promise<string> {
    return this.isConnected ? 'PONG' : 'DISCONNECTED';
  }

  // Method to simulate connection issues for testing
  setConnectionStatus(connected: boolean): void {
    this.isConnected = connected;
  }

  // Get current size for monitoring
  size(): number {
    return this.store.size;
  }

  // Clear expired entries
  cleanup(): number {
    let cleared = 0;
    const now = Date.now();
    
    for (const [key, entry] of this.store.entries()) {
      if (entry.expires && now > entry.expires) {
        this.store.delete(key);
        cleared++;
      }
    }
    
    return cleared;
  }
}

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

// LRU Cache implementation with TTL, Redis support, and statistics
class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder = new Map<string, number>();
  private config: CacheConfig;
  private stats: CacheStats;
  private accessCounter = 0;
  private redis: RedisLikeClient;
  private healthCheck: { isHealthy: boolean; lastCheck: number; failures: number } = {
    isHealthy: true,
    lastCheck: Date.now(),
    failures: 0
  };

  constructor(config: Partial<CacheConfig> = {}, redisClient?: RedisLikeClient) {
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

    // Initialize Redis client (fallback to memory-based implementation)
    this.redis = redisClient || new MemoryRedisClient();

    // Load persisted cache on initialization
    if (this.config.persistToLocalStorage && typeof window !== 'undefined') {
      this.loadFromLocalStorage();
    }

    // Start health monitoring
    this.startHealthMonitoring();

    cacheLogger.info('Cache initialized', { config: this.config, redisType: redisClient ? 'Redis' : 'Memory' });
  }

  // Get value from cache
  async get(key: string): Promise<T | null> {
    const startTime = this.config.performanceTracking ? Date.now() : 0;

    try {
      // Try Redis first if healthy
      if (this.healthCheck.isHealthy) {
        try {
          const redisValue = await this.redis.get(key);
          if (redisValue) {
            const entry = JSON.parse(redisValue) as CacheEntry<T>;
            
            // Check if expired
            if (Date.now() <= entry.expires) {
              this.stats.hits++;
              this.updateStats();
              
              if (this.config.performanceTracking) {
                const responseTime = Date.now() - startTime;
                this.updateResponseTime(responseTime);
              }

              cacheLogger.debug('Redis cache hit', { key });
              return entry.compressed && typeof entry.value === 'string' 
                ? JSON.parse(entry.value) as T 
                : entry.value;
            } else {
              // Expired in Redis, remove it
              await this.redis.del(key);
            }
          }
        } catch (redisError) {
          cacheLogger.warn('Redis get failed, falling back to memory', { key, error: redisError });
          this.recordHealthFailure();
        }
      }

      // Fallback to memory cache
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

      cacheLogger.debug('Memory cache hit', { key, hits: entry.hits });
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

      // Store in Redis first if healthy
      if (this.healthCheck.isHealthy) {
        try {
          await this.redis.set(key, JSON.stringify(entry), { 
            EX: Math.floor(effectiveTTL / 1000) 
          });
          cacheLogger.debug('Redis cache set', { key, compressed, ttl: effectiveTTL });
        } catch (redisError) {
          cacheLogger.warn('Redis set failed, using memory cache only', { key, error: redisError });
          this.recordHealthFailure();
        }
      }

      // Evict if at capacity
      if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
        this.evictLRU();
      }

      // Store in memory cache
      this.cache.set(key, entry);
      this.accessOrder.set(key, ++this.accessCounter);
      this.stats.sets++;

      // Persist to localStorage if enabled
      if (this.config.persistToLocalStorage && typeof window !== 'undefined') {
        this.persistToLocalStorage(key, entry);
      }

      this.updateStats();
      cacheLogger.debug('Memory cache set', { key, compressed, ttl: effectiveTTL });

    } catch (error) {
      cacheLogger.error('Cache set error', { key, error });
    }
  }

  // Delete from cache
  async delete(key: string): Promise<boolean> {
    // Delete from Redis if healthy
    if (this.healthCheck.isHealthy) {
      try {
        await this.redis.del(key);
      } catch (redisError) {
        cacheLogger.warn('Redis delete failed', { key, error: redisError });
        this.recordHealthFailure();
      }
    }

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
    
    this.cache.forEach((entry, key) => {
      if (pattern.test(key) && Date.now() <= entry.expires) {
        results.push({ key, value: entry.value });
      }
    });

    return results;
  }

  // Invalidate cache entries by pattern
  async invalidateByPattern(pattern: RegExp): Promise<number> {
    let invalidated = 0;
    
    // Invalidate from Redis if healthy
    if (this.healthCheck.isHealthy) {
      try {
        const keys = await this.redis.keys(pattern.source);
        for (const key of keys) {
          await this.redis.del(key);
          invalidated++;
        }
      } catch (redisError) {
        cacheLogger.warn('Redis pattern invalidation failed', { pattern: pattern.toString(), error: redisError });
        this.recordHealthFailure();
      }
    }

    // Invalidate from memory cache
    this.cache.forEach(async (entry, key) => {
      if (pattern.test(key)) {
        await this.delete(key);
        invalidated++;
      }
    });

    cacheLogger.info('Cache invalidation by pattern', { pattern: pattern.toString(), invalidated });
    return invalidated;
  }

  // Health monitoring methods
  private async startHealthMonitoring(): Promise<void> {
    // Check health every 30 seconds
    setInterval(async () => {
      await this.checkHealth();
    }, 30000);
  }

  private async checkHealth(): Promise<void> {
    try {
      const pingResult = await this.redis.ping();
      if (pingResult === 'PONG') {
        if (!this.healthCheck.isHealthy) {
          cacheLogger.info('Redis connection restored');
        }
        this.healthCheck.isHealthy = true;
        this.healthCheck.failures = 0;
      } else {
        this.recordHealthFailure();
      }
    } catch (error) {
      this.recordHealthFailure();
    }
    
    this.healthCheck.lastCheck = Date.now();
  }

  private recordHealthFailure(): void {
    this.healthCheck.failures++;
    
    // Mark as unhealthy after 3 consecutive failures
    if (this.healthCheck.failures >= 3) {
      if (this.healthCheck.isHealthy) {
        cacheLogger.warn('Redis connection marked as unhealthy', { failures: this.healthCheck.failures });
      }
      this.healthCheck.isHealthy = false;
    }
  }

  // Get health status
  getHealthStatus(): { isHealthy: boolean; lastCheck: number; failures: number } {
    return { ...this.healthCheck };
  }

  // Private methods
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;

    this.accessOrder.forEach((accessTime, key) => {
      if (accessTime < oldestAccess) {
        oldestAccess = accessTime;
        oldestKey = key;
      }
    });

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
  pricing: CacheStats & { health: any };
  device: CacheStats & { health: any };
  api: CacheStats & { health: any };
} {
  return {
    pricing: { ...pricingCache.getStats(), health: pricingCache.getHealthStatus() },
    device: { ...deviceCache.getStats(), health: deviceCache.getHealthStatus() },
    api: { ...apiCache.getStats(), health: apiCache.getHealthStatus() }
  };
}

// Export cache instances and utilities
export { AdvancedCache };

const cacheUtils = {
  pricingCache,
  deviceCache,
  apiCache,
  warmPricingCache,
  invalidatePricingCache,
  invalidateDeviceCache,
  getCacheReport
};

export default cacheUtils; 