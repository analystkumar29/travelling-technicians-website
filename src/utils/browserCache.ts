/**
 * Browser Caching Utilities
 * Implements proper Cache-Control headers, ETags, and conditional requests
 * for optimal browser caching performance
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createHash } from 'crypto';
import { logger } from './logger';

const cacheLogger = logger.createModuleLogger('browserCache');

// Cache configuration interface
interface CacheConfig {
  maxAge?: number;
  staleWhileRevalidate?: number;
  public?: boolean;
  immutable?: boolean;
  noCache?: boolean;
  noStore?: boolean;
  mustRevalidate?: boolean;
}

// Cache control configurations for different content types
export const CACHE_PROFILES: Record<string, CacheConfig> = {
  // Static assets
  STATIC_ASSETS: {
    maxAge: 31536000, // 1 year
    immutable: true,
    public: true
  },
  
  // API responses with frequent updates
  API_DYNAMIC: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 900, // 15 minutes
    public: false
  },
  
  // API responses with moderate updates
  API_MODERATE: {
    maxAge: 1800, // 30 minutes
    staleWhileRevalidate: 3600, // 1 hour
    public: true
  },
  
  // API responses with infrequent updates
  API_STATIC: {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 7200, // 2 hours
    public: true
  },
  
  // Long-term cacheable content
  API_LONG_TERM: {
    maxAge: 86400, // 24 hours
    staleWhileRevalidate: 172800, // 48 hours
    public: true
  },
  
  // No cache for sensitive data
  NO_CACHE: {
    maxAge: 0,
    noCache: true,
    noStore: true,
    mustRevalidate: true
  }
};

export type CacheProfile = keyof typeof CACHE_PROFILES;

export interface CacheHeaders {
  'Cache-Control': string;
  'ETag'?: string;
  'Vary'?: string;
  'Last-Modified'?: string;
}

export interface ConditionalRequestResult {
  notModified: boolean;
  etag?: string;
  lastModified?: string;
}

/**
 * Generate ETag from content
 */
export function generateETag(content: any): string {
  const serialized = typeof content === 'string' ? content : JSON.stringify(content);
  const hash = createHash('md5').update(serialized, 'utf8').digest('hex');
  return `"${hash.substring(0, 16)}"`;
}

/**
 * Generate Last-Modified header
 */
export function generateLastModified(timestamp?: Date | number): string {
  const date = timestamp ? new Date(timestamp) : new Date();
  return date.toUTCString();
}

/**
 * Build Cache-Control header string
 */
export function buildCacheControl(profile: CacheProfile | CacheConfig): string {
  const config = typeof profile === 'string' ? CACHE_PROFILES[profile] : profile;
  const directives: string[] = [];

  if (config?.noCache) {
    directives.push('no-cache');
  }
  
  if (config?.noStore) {
    directives.push('no-store');
  }
  
  if (config?.mustRevalidate) {
    directives.push('must-revalidate');
  }
  
  if (config?.public) {
    directives.push('public');
  } else if (config?.public === false) {
    directives.push('private');
  }
  
  if (config?.maxAge !== undefined) {
    directives.push(`max-age=${config.maxAge}`);
  }
  
  if (config?.staleWhileRevalidate) {
    directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }
  
  if (config?.immutable) {
    directives.push('immutable');
  }

  return directives.join(', ');
}

/**
 * Set cache headers on response
 */
export function setCacheHeaders(
  res: NextApiResponse,
  profile: CacheProfile,
  options: {
    etag?: string;
    lastModified?: string | Date | number;
    vary?: string | string[];
  } = {}
): void {
  const cacheControl = buildCacheControl(profile);
  res.setHeader('Cache-Control', cacheControl);

  if (options.etag) {
    res.setHeader('ETag', options.etag);
  }

  if (options.lastModified) {
    const lastModified = typeof options.lastModified === 'string' 
      ? options.lastModified 
      : generateLastModified(options.lastModified);
    res.setHeader('Last-Modified', lastModified);
  }

  if (options.vary) {
    const varyHeader = Array.isArray(options.vary) ? options.vary.join(', ') : options.vary;
    res.setHeader('Vary', varyHeader);
  }

  cacheLogger.debug('Cache headers set', { profile, cacheControl, options });
}

/**
 * Check conditional request headers
 */
export function checkConditionalRequest(
  req: NextApiRequest,
  etag?: string,
  lastModified?: string | Date
): ConditionalRequestResult {
  const ifNoneMatch = req.headers['if-none-match'];
  const ifModifiedSince = req.headers['if-modified-since'];

  let notModified = false;

  // Check ETag
  if (etag && ifNoneMatch) {
    const clientETags = ifNoneMatch.split(',').map(tag => tag.trim());
    notModified = clientETags.includes(etag) || clientETags.includes('*');
    
    if (notModified) {
      cacheLogger.debug('ETag match - not modified', { etag, ifNoneMatch });
    }
  }

  // Check Last-Modified (only if ETag didn't match)
  if (!notModified && lastModified && ifModifiedSince) {
    const lastModifiedDate = typeof lastModified === 'string' 
      ? new Date(lastModified) 
      : new Date(lastModified);
    const ifModifiedSinceDate = new Date(ifModifiedSince);
    
    notModified = lastModifiedDate <= ifModifiedSinceDate;
    
    if (notModified) {
      cacheLogger.debug('Last-Modified check - not modified', { 
        lastModified: lastModifiedDate.toISOString(), 
        ifModifiedSince: ifModifiedSinceDate.toISOString() 
      });
    }
  }

  return {
    notModified,
    etag,
    lastModified: typeof lastModified === 'string' ? lastModified : lastModified?.toUTCString()
  };
}

/**
 * Respond with 304 Not Modified
 */
export function respondNotModified(
  res: NextApiResponse,
  etag?: string,
  lastModified?: string
): void {
  if (etag) {
    res.setHeader('ETag', etag);
  }
  
  if (lastModified) {
    res.setHeader('Last-Modified', lastModified);
  }
  
  res.status(304).end();
  cacheLogger.debug('Responded with 304 Not Modified');
}

/**
 * Wrapper for API handlers with automatic caching
 */
export function withBrowserCache<T = any>(
  profile: CacheProfile,
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<T>,
  options: {
    generateETagFromResponse?: boolean;
    varyHeaders?: string[];
    lastModifiedField?: string;
  } = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Set basic cache headers
      setCacheHeaders(res, profile, {
        vary: options.varyHeaders
      });

      // For GET requests, check conditional headers
      if (req.method === 'GET') {
        // Execute handler first to get response data for ETag generation
        const result = await handler(req, res);
        
        // Generate ETag from response if requested
        let etag: string | undefined;
        let lastModified: string | undefined;
        
        if (options.generateETagFromResponse && result) {
          etag = generateETag(result);
        }
        
        if (options.lastModifiedField && result && typeof result === 'object') {
          const timestamp = (result as any)[options.lastModifiedField];
          if (timestamp) {
            lastModified = generateLastModified(new Date(timestamp));
          }
        }
        
        // Check if client cache is still valid
        const conditional = checkConditionalRequest(req, etag, lastModified);
        
        if (conditional.notModified) {
          return respondNotModified(res, etag, lastModified);
        }
        
        // Set ETag and Last-Modified headers for fresh responses
        if (etag) {
          res.setHeader('ETag', etag);
        }
        
        if (lastModified) {
          res.setHeader('Last-Modified', lastModified);
        }
        
        return result;
      } else {
        // For non-GET requests, just execute handler
        return await handler(req, res);
      }
    } catch (error) {
      cacheLogger.error('Error in cached handler', { error });
      throw error;
    }
  };
}

/**
 * Cache invalidation utilities
 */
export class BrowserCacheInvalidator {
  private static versionKey = 'cache-version';
  
  /**
   * Generate cache-busting query parameter
   */
  static getCacheBuster(): string {
    return Date.now().toString(36);
  }
  
  /**
   * Invalidate browser cache by updating version
   */
  static invalidateVersion(): string {
    const version = this.getCacheBuster();
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.versionKey, version);
    }
    return version;
  }
  
  /**
   * Get current cache version
   */
  static getCurrentVersion(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.versionKey) || '1';
    }
    return '1';
  }
  
  /**
   * Add cache-busting to URL
   */
  static addCacheBuster(url: string, version?: string): string {
    const cacheBuster = version || this.getCurrentVersion();
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${cacheBuster}`;
  }
}

// Export commonly used functions
export {
  generateETag as etag,
  buildCacheControl as cacheControl,
  setCacheHeaders as setHeaders,
  checkConditionalRequest as checkConditional,
  respondNotModified as notModified,
  withBrowserCache as cached
};

const browserCacheUtils = {
  profiles: CACHE_PROFILES,
  generateETag,
  generateLastModified,
  buildCacheControl,
  setCacheHeaders,
  checkConditionalRequest,
  respondNotModified,
  withBrowserCache,
  BrowserCacheInvalidator
};

export default browserCacheUtils;
