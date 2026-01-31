/**
 * Centralized slug utility for consistent URL generation
 * Ensures sitemap URLs match frontend page routes exactly
 */

import { logger } from '@/utils/logger';

const slugLogger = logger.createModuleLogger('slug-utils');

/**
 * Service slug mapping - must match frontend's getStaticPaths logic
 * This mapping ensures sitemap URLs match actual page routes
 */
export const SERVICE_SLUG_MAPPING: Record<string, string> = {
  // Database service slugs -> URL slugs used in frontend routes
  'screen-replacement-mobile': 'screen-repair',
  'screen-replacement-laptop': 'laptop-screen-repair',
  'battery-replacement-mobile': 'battery-replacement',
  'battery-replacement-laptop': 'battery-replacement',
  'charging-port-repair': 'charging-port-repair',
  'water-damage-repair': 'water-damage-repair',
  'camera-repair': 'camera-repair',
  'software-repair': 'software-repair',
  'speaker-microphone-repair': 'speaker-microphone-repair',
  'keyboard-repair': 'keyboard-repair',
  'trackpad-repair': 'trackpad-repair',
  'cooling-system-repair': 'cooling-system-repair',
  'power-jack-repair': 'power-jack-repair',
  'data-recovery': 'data-recovery',
  'storage-upgrade': 'storage-upgrade',
  'factory-reset-setup': 'factory-reset-setup',
  'touch-screen-calibration': 'touch-screen-calibration'
};

/**
 * Reverse mapping for looking up database slugs from URL slugs
 */
export const REVERSE_SERVICE_SLUG_MAPPING: Record<string, string> = Object.entries(
  SERVICE_SLUG_MAPPING
).reduce((acc, [dbSlug, urlSlug]) => {
  acc[urlSlug] = dbSlug;
  return acc;
}, {} as Record<string, string>);

/**
 * Convert any string to a URL-safe slug
 * Consistent with frontend's slug generation logic
 */
export function toUrlSlug(input: string): string {
  if (!input || typeof input !== 'string') {
    slugLogger.warn('Invalid input for toUrlSlug:', input);
    return '';
  }

  // Convert to lowercase
  let slug = input.toLowerCase();
  
  // Replace spaces with hyphens
  slug = slug.replace(/\s+/g, '-');
  
  // Remove special characters, keep only letters, numbers, and hyphens
  slug = slug.replace(/[^a-z0-9-]/g, '');
  
  // Remove consecutive hyphens
  slug = slug.replace(/-+/g, '-');
  
  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');
  
  return slug;
}

/**
 * Convert service name to URL slug using mapping
 * Ensures consistency between sitemap and frontend routes
 */
export function serviceNameToUrlSlug(serviceName: string): string {
  const urlSlug = toUrlSlug(serviceName);
  
  // Check if we have a mapping for this slug
  if (REVERSE_SERVICE_SLUG_MAPPING[urlSlug]) {
    // This is already a URL slug, return as-is
    return urlSlug;
  }
  
  // Check if we have a mapping for the service name
  const mappedSlug = SERVICE_SLUG_MAPPING[serviceName];
  if (mappedSlug) {
    return mappedSlug;
  }
  
  // Fallback to URL slug generation
  return urlSlug;
}

/**
 * Convert URL slug back to database service slug
 * Used for database lookups from URL parameters
 */
export function urlSlugToServiceSlug(urlSlug: string): string {
  return REVERSE_SERVICE_SLUG_MAPPING[urlSlug] || urlSlug;
}

/**
 * Convert city name to URL slug
 * Consistent with frontend's city slug generation
 */
export function cityNameToUrlSlug(cityName: string): string {
  return toUrlSlug(cityName);
}

/**
 * Convert model name to URL slug
 * Consistent with frontend's model slug generation
 */
export function modelNameToUrlSlug(modelName: string): string {
  return toUrlSlug(modelName);
}

/**
 * Validate that a URL slug matches the expected pattern
 * Returns true if valid, false otherwise
 */
export function isValidUrlSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  
  // Must match pattern: lowercase letters, numbers, hyphens
  // Cannot start or end with hyphen, no consecutive hyphens
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug);
}

/**
 * Generate repair page URL path
 * Consistent with frontend route structure: /repair/{city}/{service}/{model}
 */
export function generateRepairPagePath(
  citySlug: string,
  serviceSlug: string,
  modelSlug: string
): string {
  // Validate all slugs
  if (!isValidUrlSlug(citySlug) || !isValidUrlSlug(serviceSlug) || !isValidUrlSlug(modelSlug)) {
    slugLogger.warn('Invalid slug in generateRepairPagePath:', { citySlug, serviceSlug, modelSlug });
    return '';
  }
  
  return `/repair/${citySlug}/${serviceSlug}/${modelSlug}`;
}

/**
 * Generate location page URL path (Phase 8)
 * Consistent with frontend route structure: /locations/{city}
 */
export function generateLocationPagePath(citySlug: string): string {
  if (!isValidUrlSlug(citySlug)) {
    slugLogger.warn('Invalid city slug in generateLocationPagePath:', citySlug);
    return '';
  }
  
  return `/locations/${citySlug}`;
}

/**
 * Generate neighborhood page URL path (Phase 8)
 * Consistent with frontend route structure: /locations/{city}/{neighborhood}
 */
export function generateNeighborhoodPagePath(citySlug: string, neighborhoodSlug: string): string {
  if (!isValidUrlSlug(citySlug) || !isValidUrlSlug(neighborhoodSlug)) {
    slugLogger.warn('Invalid slug in generateNeighborhoodPagePath:', { citySlug, neighborhoodSlug });
    return '';
  }
  
  return `/locations/${citySlug}/${neighborhoodSlug}`;
}

/**
 * Generate service page URL path
 * Consistent with frontend route structure: /services/{service}
 */
export function generateServicePagePath(serviceSlug: string): string {
  if (!isValidUrlSlug(serviceSlug)) {
    slugLogger.warn('Invalid service slug in generateServicePagePath:', serviceSlug);
    return '';
  }
  
  return `/services/${serviceSlug}`;
}

/**
 * Extract slugs from a repair page URL
 * Returns { citySlug, serviceSlug, modelSlug } or null if invalid
 */
export function parseRepairPageUrl(url: string): {
  citySlug: string;
  serviceSlug: string;
  modelSlug: string;
} | null {
  const match = url.match(/^\/repair\/([a-z0-9-]+)\/([a-z0-9-]+)\/([a-z0-9-]+)$/);
  
  if (!match) {
    return null;
  }
  
  const [, citySlug, serviceSlug, modelSlug] = match;
  
  // Validate all slugs
  if (!isValidUrlSlug(citySlug) || !isValidUrlSlug(serviceSlug) || !isValidUrlSlug(modelSlug)) {
    return null;
  }
  
  return { citySlug, serviceSlug, modelSlug };
}

/**
 * Test if two slugs are equivalent
 * Accounts for different representations of the same entity
 */
export function areSlugsEquivalent(slug1: string, slug2: string): boolean {
  if (!slug1 || !slug2) return false;
  
  // Normalize both slugs
  const normalized1 = toUrlSlug(slug1);
  const normalized2 = toUrlSlug(slug2);
  
  // Direct comparison
  if (normalized1 === normalized2) return true;
  
  // Check mapping equivalence
  const mapped1 = SERVICE_SLUG_MAPPING[slug1] || slug1;
  const mapped2 = SERVICE_SLUG_MAPPING[slug2] || slug2;
  
  return toUrlSlug(mapped1) === toUrlSlug(mapped2);
}

/**
 * Log slug transformation for debugging
 */
export function logSlugTransformation(
  original: string,
  transformed: string,
  context: string = 'unknown'
): void {
  if (original !== transformed) {
    slugLogger.debug(`Slug transformation [${context}]: "${original}" -> "${transformed}"`);
  }
}