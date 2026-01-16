import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { getSiteUrl } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

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
      
      // Dynamic service area pages
      ...getServiceAreaPages(siteUrl, dynamicContent.serviceAreas),
      
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
      .select('name, updated_at, device_type_id')
      .eq('is_active', true)
      .order('sort_order');
    
    // Map services to expected format
    const services = servicesData?.map(service => ({
      slug: service.name.toLowerCase().replace(/\s+/g, '-'),
      updated_at: service.updated_at || new Date().toISOString(),
      device_type: service.device_type_id === 1 ? 'mobile' : service.device_type_id === 2 ? 'laptop' : 'tablet'
    })) || [
      { slug: 'mobile-repair', updated_at: '2024-12-01T10:00:00Z', device_type: 'mobile' },
      { slug: 'laptop-repair', updated_at: '2024-12-01T10:00:00Z', device_type: 'laptop' },
      { slug: 'tablet-repair', updated_at: '2024-12-01T10:00:00Z', device_type: 'tablet' }
    ];
    
    // Fetch popular city-service-model combinations (limited to top 50 for sitemap)
    const cityServiceModels = await getPopularCityServiceModels();
    
    return {
      serviceAreas: serviceLocations?.map(loc => ({
        city: loc.city,
        updated_at: loc.updated_at || new Date().toISOString()
      })) || [],
      blogPosts,
      services,
      cityServiceModels
    };
    
  } catch (error) {
    sitemapLogger.error('Error fetching dynamic content:', error);
    return {
      serviceAreas: [],
      blogPosts: [],
      services: [],
      cityServiceModels: []
    };
  }
}

/**
 * Get popular city-service-model combinations for sitemap
 * Queries database to get top 1,000 combinations of cities, services, and models
 * Focuses on combinations with actual price data in dynamic_pricing table
 */
async function getPopularCityServiceModels(): Promise<Array<{
  city: string;
  service: string;
  model: string;
  updated_at: string;
}>> {
  const supabase = getServiceSupabase();
  
  try {
    // Query to get city-service-model combinations with actual price data
    // We join dynamic_pricing with device_models and services, then cross-join with service_locations
    // Since dynamic_pricing is location-agnostic, we generate city-specific URLs for all active locations
    const { data: combinations, error } = await supabase
      .from('dynamic_pricing')
      .select(`
        service_id,
        model_id,
        updated_at,
        services!inner (
          name,
          is_active,
          updated_at
        ),
        device_models!inner (
          name,
          popularity_score,
          is_active,
          updated_at
        )
      `)
      .eq('is_active', true)
      .eq('services.is_active', true)
      .eq('device_models.is_active', true)
      .limit(1000);

    if (error || !combinations) {
      sitemapLogger.error('Error fetching dynamic pricing combinations:', error);
      return getFallbackCombinations();
    }

    // Get active service locations
    const { data: locations, error: locationsError } = await supabase
      .from('service_locations')
      .select('city, updated_at')
      .eq('is_active', true)
      .order('city');

    if (locationsError || !locations) {
      sitemapLogger.error('Error fetching service locations:', locationsError);
      return getFallbackCombinations();
    }

    // If we have no combinations or locations, return fallback
    if (combinations.length === 0 || locations.length === 0) {
      sitemapLogger.warn('No dynamic pricing combinations or service locations found, using fallback');
      return getFallbackCombinations();
    }

    // Debug: Log first combination structure
    if (combinations.length > 0) {
      sitemapLogger.debug('First combination structure:', JSON.stringify({
        service_id: combinations[0].service_id,
        model_id: combinations[0].model_id,
        services: combinations[0].services,
        device_models: combinations[0].device_models,
        services_length: combinations[0].services?.length,
        device_models_length: combinations[0].device_models?.length
      }, null, 2));
    }

    // Sort combinations by popularity_score in descending order for SEO prioritization
    const sortedCombinations = [...combinations].sort((a, b) => {
      // Handle both array and object cases for joined data
      const modelDataA = Array.isArray(a.device_models) ? a.device_models[0] : a.device_models;
      const modelDataB = Array.isArray(b.device_models) ? b.device_models[0] : b.device_models;
      
      const scoreA = modelDataA?.popularity_score || 0;
      const scoreB = modelDataB?.popularity_score || 0;
      return scoreB - scoreA; // Descending order
    });

    sitemapLogger.info(`Sorted ${sortedCombinations.length} combinations by popularity_score`);

    // Generate city-service-model combinations
    const result: Array<{
      city: string;
      service: string;
      model: string;
      updated_at: string;
    }> = [];

    // For each combination, create entries for all active locations
    // Limit to 1000 total combinations to avoid overwhelming the sitemap
    const maxCombinations = 1000;
    let combinationCount = 0;

    for (const combo of sortedCombinations) {
      if (combinationCount >= maxCombinations) break;

      // Handle both array and object cases for joined data
      // Supabase returns objects for single matches, arrays for multiple matches
      const serviceData = Array.isArray(combo.services) ? combo.services[0] : combo.services;
      const modelData = Array.isArray(combo.device_models) ? combo.device_models[0] : combo.device_models;
      
      const serviceName = serviceData?.name;
      const modelName = modelData?.name;
      
      if (!serviceName || !modelName) {
        sitemapLogger.debug(`Skipping combo - missing serviceName: ${serviceName}, modelName: ${modelName}`);
        continue;
      }

      // Generate slugs
      const serviceSlug = serviceName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const modelSlug = modelName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // Use the most recent updated_at from the combination
      const comboUpdatedAt = combo.updated_at ||
                            serviceData?.updated_at ||
                            modelData?.updated_at ||
                            new Date().toISOString();

      // Create entries for each location
      for (const location of locations) {
        if (combinationCount >= maxCombinations) break;

        const citySlug = location.city.toLowerCase().replace(/\s+/g, '-');

        result.push({
          city: citySlug,
          service: serviceSlug,
          model: modelSlug,
          updated_at: comboUpdatedAt
        });

        combinationCount++;
      }
    }

    sitemapLogger.info(`Generated ${result.length} city-service-model combinations from dynamic pricing data`);
    sitemapLogger.debug(`Processed ${combinationCount} total entries from ${sortedCombinations.length} combinations across ${locations.length} locations`);
    return result;
    
  } catch (error) {
    sitemapLogger.error('Error fetching city-service-model combinations:', error);
    
    // Return fallback combinations on error
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
