import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { getSiteUrl } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';
import {
  serviceNameToUrlSlug,
  cityNameToUrlSlug,
  modelNameToUrlSlug,
  generateRepairPagePath,
  generateLocationPagePath,
  generateNeighborhoodPagePath,
  generateServicePagePath,
  isValidUrlSlug,
  logSlugTransformation
} from '@/utils/slug-utils';

// Create a module logger
const sitemapLogger = logger.createModuleLogger('sitemap');

// Cache sitemap for 24 hours
const CACHE_DURATION = 24 * 60 * 60; // 24 hours in seconds

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

interface DynamicContent {
  serviceAreas: Array<{ city: string; updated_at: string }>;
  blogPosts: Array<{ slug: string; updated_at: string; publishDate?: string }>;
  services: Array<{ slug: string; updated_at: string; device_type: string }>;
  cityServiceModels: Array<{
    city: string;
    service: string;
    model: string;
    updated_at: string;
  }>;
  neighborhoods: Array<{
    city: string;
    citySlug: string;
    neighborhood: string;
    neighborhoodSlug: string;
    updated_at: string;
  }>;
  cityLocations: Array<{
    city: string;
    citySlug: string;
    updated_at: string;
  }>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Set cache headers for ISR-like behavior
    res.setHeader('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`);
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    
    const siteUrl = getSiteUrl();
    const now = new Date().toISOString();
    
    sitemapLogger.info('Generating sitemap...');
    
    // Get dynamic content from database
    const dynamicContent = await fetchDynamicContent();
    
    // Build sitemap entries
    const entries: SitemapEntry[] = [
      // Static high-priority pages
      ...getStaticPages(siteUrl, now),
      
      // Dynamic service area pages (legacy /repair/{city})
      ...getServiceAreaPages(siteUrl, dynamicContent.serviceAreas),
      
      // City location pages (Phase 8: /locations/{city})
      ...getCityLocationPages(siteUrl, dynamicContent.cityLocations),
      
      // Neighborhood pages (Phase 8: /locations/{city}/{neighborhood})
      ...getNeighborhoodPages(siteUrl, dynamicContent.neighborhoods),
      
      // Dynamic blog pages
      ...getBlogPages(siteUrl, dynamicContent.blogPosts),
      
      // Dynamic service pages
      ...getServicePages(siteUrl, dynamicContent.services),
      
      // City-service-model dynamic pages
      ...getCityServiceModelPages(siteUrl, dynamicContent.cityServiceModels),
      
      // Static informational pages
      ...getInformationalPages(siteUrl, now),
      
      // Static legal pages
      ...getLegalPages(siteUrl, now)
    ];
    
    // Check if we need sitemap index (for sites with > 50,000 URLs)
    if (entries.length > 45000) {
      const sitemapIndex = generateSitemapIndex(siteUrl, entries);
      res.status(200).end(sitemapIndex);
      return;
    }
    
    // Generate regular sitemap
    const sitemap = generateSitemap(entries);
    
    sitemapLogger.info(`Generated sitemap with ${entries.length} entries`);
    res.status(200).end(sitemap);
    
  } catch (error) {
    sitemapLogger.error('Error generating sitemap:', error);
    
    // Fallback to basic sitemap
    const fallbackSitemap = generateFallbackSitemap(getSiteUrl());
    res.status(200).end(fallbackSitemap);
  }
}

/**
 * Fetch dynamic content from database
 */
async function fetchDynamicContent(): Promise<DynamicContent> {
  const supabase = getServiceSupabase();
  
  try {
    // Fetch service locations (using service_locations table instead of service_areas)
    const { data: serviceLocations } = await supabase
      .from('service_locations')
      .select('city, updated_at')
      .eq('is_active', true)
      .order('city');
    
    // Fetch blog posts (simulated - you can add a blog table later)
    const blogPosts = [
      {
        slug: 'signs-your-phone-needs-repair',
        updated_at: '2024-12-15T10:00:00Z',
        publishDate: '2024-12-01T10:00:00Z'
      },
      {
        slug: 'how-to-extend-your-laptop-battery-life',
        updated_at: '2024-12-10T10:00:00Z',
        publishDate: '2024-11-25T10:00:00Z'
      },
      {
        slug: 'ultimate-guide-to-screen-protection',
        updated_at: '2024-12-05T10:00:00Z',
        publishDate: '2024-11-20T10:00:00Z'
      },
      {
        slug: 'water-damage-first-aid-for-devices',
        updated_at: '2024-12-01T10:00:00Z',
        publishDate: '2024-11-15T10:00:00Z'
      }
    ];
    
    // Fetch services from database
    const { data: servicesData } = await supabase
      .from('services')
      .select('name, slug, updated_at, device_type_id')
      .eq('is_active', true)
      .order('sort_order');
    
    // Map services to expected format using centralized slug utilities
    const services = servicesData?.map(service => {
      // Use stored slug if available, otherwise generate from name
      const serviceSlug = service.slug || serviceNameToUrlSlug(service.name);
      logSlugTransformation(service.name, serviceSlug, 'service-fetch');
      
      // Standardized lastmod fallback
      const lastmod = service.updated_at || new Date().toISOString();
      
      // Map device_type_id to string (1=mobile, 2=laptop, 3=tablet)
      let deviceType = 'mobile';
      if (service.device_type_id === 2) deviceType = 'laptop';
      if (service.device_type_id === 3) deviceType = 'tablet';
      
      return {
        slug: serviceSlug,
        updated_at: lastmod,
        device_type: deviceType
      };
    }).filter(service => isValidUrlSlug(service.slug)) || [
      { slug: 'mobile-repair', updated_at: new Date().toISOString(), device_type: 'mobile' },
      { slug: 'laptop-repair', updated_at: new Date().toISOString(), device_type: 'laptop' },
      { slug: 'tablet-repair', updated_at: new Date().toISOString(), device_type: 'tablet' }
    ];
    
    // Fetch popular city-service-model combinations (limited to top 50 for sitemap)
    const cityServiceModels = await getPopularCityServiceModels();
    
    // Fetch neighborhood pages (Phase 8)
    const neighborhoods = await getNeighborhoodPagesFromDB();
    
    // Fetch city locations for /locations/{city} pages
    const cityLocations = serviceLocations?.map(loc => {
      const citySlug = cityNameToUrlSlug(loc.city);
      logSlugTransformation(loc.city, citySlug, 'city-location');
      
      // Standardized lastmod fallback
      const lastmod = loc.updated_at || new Date().toISOString();
      
      return {
        city: loc.city,
        citySlug: citySlug,
        updated_at: lastmod
      };
    }).filter(loc => isValidUrlSlug(loc.citySlug)) || [];
    
    // Map service areas with standardized lastmod
    const serviceAreas = serviceLocations?.map(loc => ({
      city: loc.city,
      updated_at: loc.updated_at || new Date().toISOString()
    })) || [];
    
    return {
      serviceAreas,
      blogPosts,
      services,
      cityServiceModels,
      neighborhoods,
      cityLocations
    };
    
  } catch (error) {
    sitemapLogger.error('Error fetching dynamic content:', error);
    return {
      serviceAreas: [],
      blogPosts: [],
      services: [],
      cityServiceModels: [],
      neighborhoods: [],
      cityLocations: []
    };
  }
}

/**
 * Fetch neighborhood pages from database (Phase 8)
 */
async function getNeighborhoodPagesFromDB(): Promise<Array<{
  city: string;
  citySlug: string;
  neighborhood: string;
  neighborhoodSlug: string;
  updated_at: string;
}>> {
  const supabase = getServiceSupabase();
  
  try {
    // Query neighborhood_pages table
    const { data: neighborhoods, error } = await supabase
      .from('neighborhood_pages')
      .select(`
        slug,
        neighborhood_name,
        updated_at,
        city_id,
        service_locations!inner (
          city_name
        )
      `)
      .eq('is_active', true)
      .order('neighborhood_name');

    if (error || !neighborhoods) {
      sitemapLogger.error('Error fetching neighborhoods:', error);
      return [];
    }

    // Map to expected format
    return neighborhoods.map(item => {
      const locationData = Array.isArray(item.service_locations) 
        ? item.service_locations[0] 
        : item.service_locations;
      
      return {
        city: locationData?.city_name || '',
        citySlug: (locationData?.city_name || '').toLowerCase().replace(/\s+/g, '-'),
        neighborhood: item.neighborhood_name,
        neighborhoodSlug: item.slug,
        updated_at: item.updated_at || new Date().toISOString()
      };
    }).filter(n => n.city); // Filter out items without city data
    
  } catch (error) {
    sitemapLogger.error('Error in getNeighborhoodPagesFromDB:', error);
    return [];
  }
}

/**
 * Get popular city-service-model combinations for sitemap
 * Queries database with safety limits to prevent Vercel timeout (10s)
 * Focuses on combinations with actual price data in dynamic_pricing table
 */
async function getPopularCityServiceModels(): Promise<Array<{
  city: string;
  service: string;
  model: string;
  updated_at: string;
}>> {
  const supabase = getServiceSupabase();
  const startTime = Date.now();
  const MAX_EXECUTION_TIME = 8000; // 8 seconds (leaving 2s buffer for Vercel 10s timeout)
  const MAX_COMBINATIONS = 2000; // Limit total URL count to prevent sitemap bloat
  const MAX_COMBINATIONS_PER_SERVICE = 100; // Limit per service to ensure diversity
  
  try {
    // Start timeout protection
    const checkTimeout = () => {
      if (Date.now() - startTime > MAX_EXECUTION_TIME) {
        throw new Error('Sitemap generation timeout - exceeded 8 second limit');
      }
    };
    
    checkTimeout();
    
    // Get active service locations first (cities)
    const { data: locations, error: locationsError } = await supabase
      .from('service_locations')
      .select('city, updated_at')
      .eq('is_active', true)
      .order('city')
      .limit(20); // Limit to top 20 cities for safety

    if (locationsError || !locations || locations.length === 0) {
      sitemapLogger.error('Error fetching service locations:', locationsError);
      return getFallbackCombinations();
    }

    sitemapLogger.info(`Found ${locations.length} active service locations`);
    checkTimeout();
    
    // Query dynamic pricing with proper join handling and limits
    // Use a more efficient query with explicit limits
    const { data: combinations, error } = await supabase
      .from('dynamic_pricing')
      .select(`
        service_id,
        model_id,
        updated_at,
        services!inner (
          name,
          slug,
          is_active,
          updated_at
        ),
        device_models!inner (
          name,
          slug,
          popularity_score,
          is_active,
          updated_at
        )
      `)
      .eq('is_active', true)
      .eq('services.is_active', true)
      .eq('device_models.is_active', true)
      .order('device_models.popularity_score', { ascending: false })
      .limit(500); // Limit initial query to prevent overwhelming response

    checkTimeout();

    if (error || !combinations) {
      sitemapLogger.error('Error fetching dynamic pricing combinations:', error);
      return getFallbackCombinations();
    }

    if (combinations.length === 0) {
      sitemapLogger.warn('No dynamic pricing combinations found, using fallback');
      return getFallbackCombinations();
    }

    sitemapLogger.info(`Found ${combinations.length} dynamic pricing combinations`);
    
    // Group combinations by service to ensure diversity
    const combinationsByService = new Map<string, typeof combinations>();
    
    for (const combo of combinations) {
      checkTimeout();
      
      // Robust join handling with null checks
      const serviceData = Array.isArray(combo.services) ? combo.services[0] : combo.services;
      const modelData = Array.isArray(combo.device_models) ? combo.device_models[0] : combo.device_models;
      
      if (!serviceData?.name || !modelData?.name) {
        sitemapLogger.debug('Skipping combination with missing service or model data');
        continue;
      }
      
      const serviceName = serviceData.name;
      if (!combinationsByService.has(serviceName)) {
        combinationsByService.set(serviceName, []);
      }
      combinationsByService.get(serviceName)!.push(combo);
    }
    
    checkTimeout();
    
    // Generate city-service-model combinations with limits
    const result: Array<{
      city: string;
      service: string;
      model: string;
      updated_at: string;
    }> = [];
    
    let totalCombinationCount = 0;
    
    // Process each service type with limits
    for (const [serviceName, serviceCombinations] of combinationsByService) {
      if (totalCombinationCount >= MAX_COMBINATIONS) break;
      
      // Take top N models for this service
      const topModels = serviceCombinations
        .slice(0, MAX_COMBINATIONS_PER_SERVICE)
        .map(combo => {
          const serviceData = Array.isArray(combo.services) ? combo.services[0] : combo.services;
          const modelData = Array.isArray(combo.device_models) ? combo.device_models[0] : combo.device_models;
          
          return {
            serviceName: serviceData?.name || '',
            serviceSlug: serviceData?.slug || '',
            modelName: modelData?.name || '',
            modelSlug: modelData?.slug || '',
            updated_at: combo.updated_at || 
                       serviceData?.updated_at || 
                       modelData?.updated_at || 
                       new Date().toISOString(),
            popularity: modelData?.popularity_score || 0
          };
        })
        .filter(item => item.serviceName && item.modelName);
      
      // Generate URLs for each city
      for (const location of locations) {
        if (totalCombinationCount >= MAX_COMBINATIONS) break;
        
        const citySlug = cityNameToUrlSlug(location.city);
        if (!isValidUrlSlug(citySlug)) {
          sitemapLogger.warn(`Invalid city slug generated: ${citySlug} from ${location.city}`);
          continue;
        }
        
        for (const model of topModels) {
          if (totalCombinationCount >= MAX_COMBINATIONS) break;
          
          // Use centralized slug utilities for consistency
          const serviceSlug = serviceNameToUrlSlug(model.serviceName);
          const modelSlug = modelNameToUrlSlug(model.modelName);
          
          if (!isValidUrlSlug(serviceSlug) || !isValidUrlSlug(modelSlug)) {
            sitemapLogger.warn(`Invalid slug generated: service=${serviceSlug}, model=${modelSlug}`);
            continue;
          }
          
          // Log slug transformations for debugging
          logSlugTransformation(model.serviceName, serviceSlug, 'service');
          logSlugTransformation(model.modelName, modelSlug, 'model');
          
          result.push({
            city: citySlug,
            service: serviceSlug,
            model: modelSlug,
            updated_at: model.updated_at
          });
          
          totalCombinationCount++;
        }
      }
      
      checkTimeout();
    }
    
    sitemapLogger.info(`Generated ${result.length} city-service-model combinations (limited to ${MAX_COMBINATIONS})`);
    sitemapLogger.debug(`Execution time: ${Date.now() - startTime}ms`);
    
    // If we have no results, return fallback
    if (result.length === 0) {
      sitemapLogger.warn('No valid combinations generated, using fallback');
      return getFallbackCombinations();
    }
    
    return result;
    
  } catch (error) {
    sitemapLogger.error('Error fetching city-service-model combinations:', error);
    
    // Return fallback combinations on error or timeout
    return getFallbackCombinations();
  }
}

/**
 * Fallback combinations for when database queries fail
 */
function getFallbackCombinations(): Array<{
  city: string;
  service: string;
  model: string;
  updated_at: string;
}> {
  const now = new Date().toISOString();
  
  // Essential fallback combinations that maintain SEO value
  return [
    { city: 'vancouver', service: 'screen-repair', model: 'iphone-14', updated_at: now },
    { city: 'vancouver', service: 'battery-replacement', model: 'iphone-14', updated_at: now },
    { city: 'vancouver', service: 'screen-repair', model: 'samsung-galaxy-s23', updated_at: now },
    { city: 'burnaby', service: 'screen-repair', model: 'iphone-14', updated_at: now },
    { city: 'burnaby', service: 'battery-replacement', model: 'samsung-galaxy-s23', updated_at: now },
    { city: 'richmond', service: 'charging-port-repair', model: 'google-pixel-7', updated_at: now },
    { city: 'richmond', service: 'screen-repair', model: 'iphone-13', updated_at: now },
    { city: 'coquitlam', service: 'screen-repair', model: 'macbook-pro-2023', updated_at: now },
    { city: 'coquitlam', service: 'battery-replacement', model: 'macbook-air-2023', updated_at: now },
    { city: 'north-vancouver', service: 'water-damage-repair', model: 'iphone-15', updated_at: now },
    { city: 'north-vancouver', service: 'screen-repair', model: 'iphone-15', updated_at: now },
    { city: 'surrey', service: 'screen-repair', model: 'samsung-galaxy-s22', updated_at: now },
    { city: 'surrey', service: 'battery-replacement', model: 'iphone-13', updated_at: now },
    { city: 'new-westminster', service: 'camera-repair', model: 'iphone-13', updated_at: now },
    { city: 'new-westminster', service: 'screen-repair', model: 'samsung-galaxy-s21', updated_at: now },
    { city: 'west-vancouver', service: 'screen-repair', model: 'iphone-14-pro', updated_at: now },
    { city: 'west-vancouver', service: 'battery-replacement', model: 'macbook-pro-2023', updated_at: now },
    { city: 'vancouver', service: 'charging-port-repair', model: 'samsung-galaxy-s23', updated_at: now },
    { city: 'vancouver', service: 'camera-repair', model: 'google-pixel-8', updated_at: now },
    { city: 'burnaby', service: 'water-damage-repair', model: 'iphone-14', updated_at: now },
    { city: 'richmond', service: 'battery-replacement', model: 'iphone-14', updated_at: now },
    { city: 'coquitlam', service: 'charging-port-repair', model: 'samsung-galaxy-s23', updated_at: now },
    { city: 'surrey', service: 'camera-repair', model: 'google-pixel-7', updated_at: now },
    { city: 'vancouver', service: 'screen-repair', model: 'ipad-pro-2023', updated_at: now },
    { city: 'burnaby', service: 'screen-repair', model: 'ipad-air-2022', updated_at: now }
  ];
}

/**
 * Generate static high-priority pages
 */
function getStaticPages(siteUrl: string, now: string): SitemapEntry[] {
  return [
    {
      loc: `${siteUrl}/`,
      lastmod: now,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      loc: `${siteUrl}/book-online`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.95'
    },
    {
      loc: `${siteUrl}/doorstep-repair`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      loc: `${siteUrl}/mobile-screen-repair`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      loc: `${siteUrl}/laptop-screen-repair`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      loc: `${siteUrl}/mobile-repair-near-me`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.9'
    }
  ];
}

/**
 * Generate city location pages (Phase 8: /locations/{city})
 */
function getCityLocationPages(siteUrl: string, cityLocations: Array<{ city: string; citySlug: string; updated_at: string }>): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  
  cityLocations.forEach(({ city, citySlug, updated_at }) => {
    entries.push({
      loc: `${siteUrl}/locations/${citySlug}`,
      lastmod: updated_at,
      changefreq: 'weekly',
      priority: '0.85' // Higher than neighborhoods, lower than main pages
    });
  });
  
  return entries;
}

/**
 * Generate neighborhood pages (Phase 8: /locations/{city}/{neighborhood})
 */
function getNeighborhoodPages(siteUrl: string, neighborhoods: Array<{
  city: string;
  citySlug: string;
  neighborhood: string;
  neighborhoodSlug: string;
  updated_at: string;
}>): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  
  neighborhoods.forEach(({ citySlug, neighborhoodSlug, updated_at }) => {
    entries.push({
      loc: `${siteUrl}/locations/${citySlug}/${neighborhoodSlug}`,
      lastmod: updated_at,
      changefreq: 'monthly',
      priority: '0.75' // Lower than city pages but still important
    });
  });
  
  return entries;
}

/**
 * Generate service area pages
 */
function getServiceAreaPages(siteUrl: string, serviceAreas: Array<{ city: string; updated_at: string }>): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  
  // Default service areas if none in database
  const defaultAreas = [
    { city: 'Vancouver', updated_at: '2024-12-01T10:00:00Z' },
    { city: 'Burnaby', updated_at: '2024-12-01T10:00:00Z' },
    { city: 'Richmond', updated_at: '2024-12-01T10:00:00Z' },
    { city: 'North Vancouver', updated_at: '2024-12-01T10:00:00Z' },
    { city: 'New Westminster', updated_at: '2024-12-01T10:00:00Z' },
    { city: 'Coquitlam', updated_at: '2024-12-01T10:00:00Z' },
    { city: 'West Vancouver', updated_at: '2024-12-01T10:00:00Z' },
    { city: 'Chilliwack', updated_at: '2024-12-01T10:00:00Z' }
  ];
  
  const areas = serviceAreas.length > 0 ? serviceAreas : defaultAreas;
  
  areas.forEach(area => {
    const citySlug = area.city.toLowerCase().replace(/\s+/g, '-');
    
    // City repair pages (primary location pages)
    entries.push({
      loc: `${siteUrl}/repair/${citySlug}`,
      lastmod: area.updated_at,
      changefreq: 'weekly',
      priority: '0.8'
    });
  });
  
  // Service areas main page
  entries.push({
    loc: `${siteUrl}/service-areas`,
    lastmod: new Date().toISOString(),
    changefreq: 'monthly',
    priority: '0.8'
  });
  
  return entries;
}

/**
 * Generate blog pages
 */
function getBlogPages(siteUrl: string, blogPosts: Array<{ slug: string; updated_at: string }>): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  
  // Blog main page
  entries.push({
    loc: `${siteUrl}/blog`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: '0.8'
  });
  
  // Individual blog posts
  blogPosts.forEach(post => {
    entries.push({
      loc: `${siteUrl}/blog/${post.slug}`,
      lastmod: post.updated_at,
      changefreq: 'monthly',
      priority: '0.6'
    });
  });
  
  // Blog categories (if you have them)
  const categories = ['mobile-repair-tips', 'laptop-maintenance', 'device-protection'];
  categories.forEach(category => {
    entries.push({
      loc: `${siteUrl}/blog/category/${category}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.7'
    });
  });
  
  return entries;
}

/**
 * Generate service pages
 */
function getServicePages(siteUrl: string, services: Array<{ slug: string; updated_at: string; device_type: string }>): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  
  services.forEach(service => {
    entries.push({
      loc: `${siteUrl}/services/${service.slug}`,
      lastmod: service.updated_at,
      changefreq: 'weekly',
      priority: service.device_type === 'mobile' || service.device_type === 'laptop' ? '0.9' : '0.8'
    });
  });
  
  return entries;
}

/**
 * Generate city-service-model pages for sitemap
 */
function getCityServiceModelPages(siteUrl: string, cityServiceModels: Array<{
  city: string;
  service: string;
  model: string;
  updated_at: string;
}>): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  
  cityServiceModels.forEach(({ city, service, model, updated_at }) => {
    entries.push({
      loc: `${siteUrl}/repair/${city}/${service}/${model}`,
      lastmod: updated_at,
      changefreq: 'weekly',
      priority: '0.7' // Lower priority than main city pages but higher than blog posts
    });
  });
  
  return entries;
}

/**
 * Generate informational pages
 */
function getInformationalPages(siteUrl: string, now: string): SitemapEntry[] {
  return [
    {
      loc: `${siteUrl}/about`,
      lastmod: now,
      changefreq: 'monthly',
      priority: '0.8'
    },
    {
      loc: `${siteUrl}/contact`,
      lastmod: now,
      changefreq: 'monthly',
      priority: '0.8'
    },
    {
      loc: `${siteUrl}/pricing`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      loc: `${siteUrl}/faq`,
      lastmod: now,
      changefreq: 'monthly',
      priority: '0.7'
    }
  ];
}

/**
 * Generate legal pages
 */
function getLegalPages(siteUrl: string, now: string): SitemapEntry[] {
  return [
    {
      loc: `${siteUrl}/privacy-policy`,
      lastmod: now,
      changefreq: 'yearly',
      priority: '0.3'
    },
    {
      loc: `${siteUrl}/terms-conditions`,
      lastmod: now,
      changefreq: 'yearly',
      priority: '0.3'
    }
  ];
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate regular sitemap XML
 */
function generateSitemap(entries: SitemapEntry[]): string {
  const urlEntries = entries.map(entry => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Generate sitemap index for large sites
 */
function generateSitemapIndex(siteUrl: string, entries: SitemapEntry[]): string {
  const chunkSize = 45000;
  const chunks = Math.ceil(entries.length / chunkSize);
  const now = new Date().toISOString();
  
  const sitemapEntries = Array.from({ length: chunks }, (_, i) => `  <sitemap>
    <loc>${siteUrl}/api/sitemap-${i + 1}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
}

/**
 * Generate fallback sitemap in case of errors
 */
function generateFallbackSitemap(siteUrl: string): string {
  const now = new Date().toISOString();
  
  // Basic essential URLs for fallback
  const fallbackUrls = [
    { loc: `${siteUrl}/`, lastmod: now, changefreq: 'daily', priority: '1.0' },
    { loc: `${siteUrl}/book-online`, lastmod: now, changefreq: 'weekly', priority: '0.95' },
    { loc: `${siteUrl}/doorstep-repair`, lastmod: now, changefreq: 'weekly', priority: '0.9' },
    { loc: `${siteUrl}/mobile-screen-repair`, lastmod: now, changefreq: 'weekly', priority: '0.9' },
    { loc: `${siteUrl}/laptop-screen-repair`, lastmod: now, changefreq: 'weekly', priority: '0.9' },
    { loc: `${siteUrl}/mobile-repair-near-me`, lastmod: now, changefreq: 'weekly', priority: '0.9' },
    { loc: `${siteUrl}/about`, lastmod: now, changefreq: 'monthly', priority: '0.8' },
    { loc: `${siteUrl}/contact`, lastmod: now, changefreq: 'monthly', priority: '0.8' },
    { loc: `${siteUrl}/pricing`, lastmod: now, changefreq: 'weekly', priority: '0.8' },
    { loc: `${siteUrl}/faq`, lastmod: now, changefreq: 'monthly', priority: '0.7' },
    { loc: `${siteUrl}/privacy-policy`, lastmod: now, changefreq: 'yearly', priority: '0.3' },
    { loc: `${siteUrl}/terms-conditions`, lastmod: now, changefreq: 'yearly', priority: '0.3' },
    { loc: `${siteUrl}/blog`, lastmod: now, changefreq: 'weekly', priority: '0.8' },
    { loc: `${siteUrl}/service-areas`, lastmod: now, changefreq: 'monthly', priority: '0.8' },
  ];

  // Add essential city pages
  const essentialCities = ['vancouver', 'burnaby', 'richmond', 'north-vancouver', 'coquitlam'];
  essentialCities.forEach(city => {
    fallbackUrls.push({
      loc: `${siteUrl}/repair/${city}`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.8'
    });
  });

  const urlEntries = fallbackUrls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}
