import { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { getSiteUrl } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';
import {
  serviceNameToUrlSlug,
  cityNameToUrlSlug,
  isValidUrlSlug,
  logSlugTransformation
} from '@/utils/slug-utils';
import { getModelPageSlugs } from '@/lib/data-service';

// Create a module logger
const sitemapLogger = logger.createModuleLogger('sitemap');

// Cache sitemap for 24 hours
const CACHE_DURATION = 24 * 60 * 60; // 24 hours in seconds

// Static fallback date for lastmod — avoids "now" which makes Google distrust lastmod
const FALLBACK_DATE = '2026-02-06T00:00:00Z';

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
  brands: Array<{ slug: string; updated_at: string }>;
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
  cityServicePages: Array<{
    citySlug: string;
    serviceSlug: string;
    updated_at: string;
  }>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  
  try {
    // Set cache headers for ISR-like behavior
    res.setHeader('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate`);
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    
    const siteUrl = getSiteUrl();
    const generatedAt = new Date().toISOString();

    sitemapLogger.info('========================================');
    sitemapLogger.info('🚀 SITEMAP GENERATION STARTED');
    sitemapLogger.info(`📅 Timestamp: ${generatedAt}`);
    sitemapLogger.info('========================================');
    
    // Get dynamic content from database
    const fetchStartTime = Date.now();
    const dynamicContent = await fetchDynamicContent();
    const fetchDuration = Date.now() - fetchStartTime;
    sitemapLogger.info(`⏱️ Dynamic content fetch took: ${fetchDuration}ms`);
    
    // Build sitemap entries with detailed logging
    const staticPages = getStaticPages(siteUrl);
    sitemapLogger.info(`📄 Static high-priority pages: ${staticPages.length}`);
    
    const serviceAreaPages = getServiceAreaPages(siteUrl, dynamicContent.serviceAreas);
    sitemapLogger.info(`🏙️ Service area pages (legacy /repair/{city}): ${serviceAreaPages.length}`);
    
    const neighborhoodPages = getNeighborhoodPages(siteUrl, dynamicContent.neighborhoods);
    sitemapLogger.info(`🏘️ Neighborhood pages: ${neighborhoodPages.length}`);
    
    const blogPages = getBlogPages(siteUrl, dynamicContent.blogPosts);
    sitemapLogger.info(`📝 Blog pages: ${blogPages.length}`);
    
    const servicePages = getServicePages(siteUrl, dynamicContent.services);
    sitemapLogger.info(`🔧 Service pages: ${servicePages.length}`);

    const brandPages = getBrandPages(siteUrl, dynamicContent.brands);
    sitemapLogger.info(`🏷️ Brand pages: ${brandPages.length}`);

    const cityServiceModelPages = getCityServiceModelPages(siteUrl, dynamicContent.cityServiceModels);
    sitemapLogger.info(`🎯 City-service-model pages (MAIN DYNAMIC ROUTES): ${cityServiceModelPages.length}`);

    const cityServicePages = getCityServiceSitemapEntries(siteUrl, dynamicContent.cityServicePages);
    sitemapLogger.info(`🔧 City-service pages (/repair/{city}/{service}): ${cityServicePages.length}`);

    const informationalPages = getInformationalPages(siteUrl);
    sitemapLogger.info(`ℹ️ Informational pages: ${informationalPages.length}`);
    
    const legalPages = getLegalPages(siteUrl);
    sitemapLogger.info(`⚖️ Legal pages: ${legalPages.length}`);

    const modelPages = getModelPages(siteUrl);
    sitemapLogger.info(`📱 Model pages: ${modelPages.length}`);

    const entries: SitemapEntry[] = [
      ...staticPages,
      ...serviceAreaPages,
      ...neighborhoodPages,
      ...cityServicePages,
      ...blogPages,
      ...servicePages,
      ...brandPages,
      ...modelPages,
      ...cityServiceModelPages,
      ...informationalPages,
      ...legalPages
    ];
    
    // Summary statistics
    const totalDuration = Date.now() - startTime;
    sitemapLogger.info('========================================');
    sitemapLogger.info('📊 SITEMAP GENERATION SUMMARY');
    sitemapLogger.info('========================================');
    sitemapLogger.info(`✅ TOTAL URLS IN SITEMAP: ${entries.length}`);
    sitemapLogger.info('----------------------------------------');
    sitemapLogger.info('BREAKDOWN:');
    sitemapLogger.info(`  - Static high-priority: ${staticPages.length}`);
    sitemapLogger.info(`  - Service areas (cities): ${serviceAreaPages.length}`);
    sitemapLogger.info(`  - Neighborhoods: ${neighborhoodPages.length}`);
    sitemapLogger.info(`  - Blog: ${blogPages.length}`);
    sitemapLogger.info(`  - Services: ${servicePages.length}`);
    sitemapLogger.info(`  - Brands: ${brandPages.length}`);
    sitemapLogger.info(`  - Models: ${modelPages.length}`);
    sitemapLogger.info(`  - City-Service-Model (dynamic): ${cityServiceModelPages.length}`);
    sitemapLogger.info(`  - City-Service pages: ${cityServicePages.length}`);
    sitemapLogger.info(`  - Informational: ${informationalPages.length}`);
    sitemapLogger.info(`  - Legal: ${legalPages.length}`);
    sitemapLogger.info('----------------------------------------');
    sitemapLogger.info(`⏱️ Total generation time: ${totalDuration}ms`);
    sitemapLogger.info('========================================');
    
    // Check if we need sitemap index (for sites with > 50,000 URLs)
    if (entries.length > 45000) {
      sitemapLogger.info('⚠️ Large sitemap detected - generating sitemap index');
      const sitemapIndex = generateSitemapIndex(siteUrl, entries);
      res.status(200).end(sitemapIndex);
      return;
    }
    
    // Generate regular sitemap
    const sitemap = generateSitemap(entries);
    
    sitemapLogger.info(`🎉 Sitemap generated successfully with ${entries.length} entries`);
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
 * All independent queries run in parallel to stay within Vercel's 10s timeout.
 * All dynamic_routes types are fetched in a single paginated query.
 */
async function fetchDynamicContent(): Promise<DynamicContent> {
  const supabase = getServiceSupabase();
  const startTime = Date.now();
  const GLOBAL_TIMEOUT = 8000; // 8s safety margin for Vercel 10s limit

  try {
    // Run ALL independent queries in parallel
    const [
      serviceLocationsResult,
      blogPostsResult,
      servicesResult,
      brandsResult,
      allRoutesResult,
      neighborhoodsResult
    ] = await Promise.all([
      supabase
        .from('service_locations')
        .select('city_name, created_at')
        .eq('is_active', true)
        .order('city_name'),
      supabase
        .from('blog_posts')
        .select('slug, updated_at, published_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false }),
      supabase
        .from('services')
        .select('name, slug, updated_at, device_type_id')
        .eq('is_active', true)
        .order('sort_order'),
      supabase
        .from('brands')
        .select('slug, created_at')
        .eq('is_active', true)
        .order('name'),
      fetchAllDynamicRoutes(supabase, startTime, GLOBAL_TIMEOUT),
      getNeighborhoodPagesFromDB()
    ]);

    const serviceLocations = serviceLocationsResult.data;
    const blogPostsData = blogPostsResult.data;
    const servicesData = servicesResult.data;

    const blogPosts = (blogPostsData || []).map(post => ({
      slug: post.slug,
      updated_at: post.updated_at || post.published_at || FALLBACK_DATE,
      publishDate: post.published_at
    }));

    // Map services to expected format using centralized slug utilities
    const services = servicesData?.map(service => {
      const serviceSlug = service.slug || serviceNameToUrlSlug(service.name);
      logSlugTransformation(service.name, serviceSlug, 'service-fetch');
      const lastmod = service.updated_at || FALLBACK_DATE;
      let deviceType = 'mobile';
      if (service.device_type_id === 2) deviceType = 'laptop';
      if (service.device_type_id === 3) deviceType = 'tablet';
      return { slug: serviceSlug, updated_at: lastmod, device_type: deviceType };
    }).filter(service => isValidUrlSlug(service.slug)) || [
      { slug: 'mobile-repair', updated_at: FALLBACK_DATE, device_type: 'mobile' },
      { slug: 'laptop-repair', updated_at: FALLBACK_DATE, device_type: 'laptop' },
      { slug: 'tablet-repair', updated_at: FALLBACK_DATE, device_type: 'tablet' }
    ];

    const brands = (brandsResult.data || []).map(b => ({
      slug: b.slug,
      updated_at: b.created_at || FALLBACK_DATE
    })).filter(b => b.slug);

    sitemapLogger.info(`Fetched ${allRoutesResult.modelServiceRoutes.length} model-service, ${allRoutesResult.cityServiceRoutes.length} city-service routes, ${brands.length} brands`);

    const serviceAreas = serviceLocations?.map(loc => ({
      city: loc.city_name,
      updated_at: loc.created_at || FALLBACK_DATE
    })) || [];

    return {
      serviceAreas,
      blogPosts,
      services,
      brands,
      cityServiceModels: allRoutesResult.modelServiceRoutes,
      neighborhoods: neighborhoodsResult,
      cityServicePages: allRoutesResult.cityServiceRoutes
    };

  } catch (error) {
    sitemapLogger.error('Error fetching dynamic content:', error);
    return {
      serviceAreas: [],
      blogPosts: [],
      services: [],
      brands: [],
      cityServiceModels: [],
      neighborhoods: [],
      cityServicePages: []
    };
  }
}

/**
 * Fetch ALL dynamic routes in a single paginated query (all route types at once).
 * This replaces 3 separate sequential fetches with one consolidated pass.
 */
async function fetchAllDynamicRoutes(
  supabase: ReturnType<typeof getServiceSupabase>,
  startTime: number,
  timeout: number
): Promise<{
  modelServiceRoutes: Array<{ city: string; service: string; model: string; updated_at: string }>;
  cityServiceRoutes: Array<{ citySlug: string; serviceSlug: string; updated_at: string }>;
}> {
  const BATCH_SIZE = 1000;
  const modelServiceRoutes: Array<{ city: string; service: string; model: string; updated_at: string }> = [];
  const cityServiceRoutes: Array<{ citySlug: string; serviceSlug: string; updated_at: string }> = [];

  try {
    // Single count query for all route types
    const { count: totalRoutes, error: countError } = await supabase
      .from('dynamic_routes')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .in('route_type', ['model-service-page', 'city-service-page']);

    if (countError) {
      sitemapLogger.error('Error counting routes:', countError);
      return { modelServiceRoutes: getFallbackCombinations(), cityServiceRoutes: [] };
    }

    const numBatches = Math.ceil((totalRoutes || 0) / BATCH_SIZE);
    sitemapLogger.info(`Fetching ${totalRoutes} routes in ${numBatches} batches...`);

    for (let batch = 0; batch < numBatches; batch++) {
      if (Date.now() - startTime > timeout) {
        sitemapLogger.warn(`Timeout at batch ${batch + 1}/${numBatches}, got ${modelServiceRoutes.length + cityServiceRoutes.length} routes so far`);
        break;
      }

      const start = batch * BATCH_SIZE;
      const end = start + BATCH_SIZE - 1;

      const { data: batchRoutes, error } = await supabase
        .from('dynamic_routes')
        .select('slug_path, route_type, last_updated, content_updated_at')
        .eq('is_active', true)
        .in('route_type', ['model-service-page', 'city-service-page'])
        .order('slug_path', { ascending: true })
        .range(start, end);

      if (error || !batchRoutes) {
        sitemapLogger.error(`Error fetching batch ${batch + 1}:`, error);
        continue;
      }

      for (const route of batchRoutes) {
        const parts = route.slug_path.split('/');
        const lastmod = route.content_updated_at || route.last_updated || FALLBACK_DATE;

        if (route.route_type === 'model-service-page' && parts.length === 4 && parts[0] === 'repair') {
          modelServiceRoutes.push({ city: parts[1], service: parts[2], model: parts[3], updated_at: lastmod });
        } else if (route.route_type === 'city-service-page' && parts.length === 3 && parts[0] === 'repair') {
          cityServiceRoutes.push({ citySlug: parts[1], serviceSlug: parts[2], updated_at: lastmod });
        }
      }

      sitemapLogger.info(`Batch ${batch + 1}/${numBatches}: ${batchRoutes.length} routes processed`);
    }

    if (modelServiceRoutes.length === 0) {
      sitemapLogger.warn('No model-service routes parsed, using fallback');
      return { modelServiceRoutes: getFallbackCombinations(), cityServiceRoutes };
    }

    sitemapLogger.info(`Route fetch complete: ${modelServiceRoutes.length} model-service, ${cityServiceRoutes.length} city-service (${Date.now() - startTime}ms)`);
    return { modelServiceRoutes, cityServiceRoutes };

  } catch (error) {
    sitemapLogger.error('Error in fetchAllDynamicRoutes:', error);
    return { modelServiceRoutes: getFallbackCombinations(), cityServiceRoutes: [] };
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
        citySlug: cityNameToUrlSlug(locationData?.city_name || ''),
        neighborhood: item.neighborhood_name,
        neighborhoodSlug: item.slug,
        updated_at: item.updated_at || FALLBACK_DATE
      };
    }).filter(n => n.city); // Filter out items without city data
    
  } catch (error) {
    sitemapLogger.error('Error in getNeighborhoodPagesFromDB:', error);
    return [];
  }
}


/**
 * Generate sitemap entries for city-service pages
 */
function getCityServiceSitemapEntries(siteUrl: string, cityServicePages: Array<{
  citySlug: string;
  serviceSlug: string;
  updated_at: string;
}>): SitemapEntry[] {
  return cityServicePages.map(({ citySlug, serviceSlug, updated_at }) => ({
    loc: `${siteUrl}/repair/${citySlug}/${serviceSlug}`,
    lastmod: updated_at,
    changefreq: 'weekly',
    priority: '0.8'
  }));
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
  const now = FALLBACK_DATE;
  
  // Essential fallback combinations that maintain SEO value
  return [
    { city: 'vancouver', service: 'screen-repair', model: 'iphone-14', updated_at: now },
    { city: 'vancouver', service: 'battery-replacement', model: 'iphone-14', updated_at: now },
    { city: 'vancouver', service: 'screen-repair', model: 'samsung-galaxy-s23', updated_at: now },
    { city: 'burnaby', service: 'screen-repair', model: 'iphone-14', updated_at: now },
    { city: 'burnaby', service: 'battery-replacement', model: 'samsung-galaxy-s23', updated_at: now },
    { city: 'richmond', service: 'screen-repair', model: 'google-pixel-7', updated_at: now },
    { city: 'richmond', service: 'screen-repair', model: 'iphone-13', updated_at: now },
    { city: 'coquitlam', service: 'screen-repair', model: 'macbook-pro-2023', updated_at: now },
    { city: 'coquitlam', service: 'battery-replacement', model: 'macbook-air-2023', updated_at: now },
    { city: 'north-vancouver', service: 'screen-repair', model: 'iphone-15', updated_at: now },
    { city: 'north-vancouver', service: 'battery-replacement-mobile', model: 'iphone-15', updated_at: now },
    { city: 'surrey', service: 'screen-repair', model: 'samsung-galaxy-s22', updated_at: now },
    { city: 'surrey', service: 'battery-replacement', model: 'iphone-13', updated_at: now },
    { city: 'new-westminster', service: 'camera-repair', model: 'iphone-13', updated_at: now },
    { city: 'new-westminster', service: 'screen-repair', model: 'samsung-galaxy-s21', updated_at: now },
    { city: 'west-vancouver', service: 'screen-repair', model: 'iphone-14-pro', updated_at: now },
    { city: 'west-vancouver', service: 'battery-replacement', model: 'macbook-pro-2023', updated_at: now },
    { city: 'vancouver', service: 'battery-replacement-mobile', model: 'samsung-galaxy-s23', updated_at: now },
    { city: 'vancouver', service: 'screen-repair', model: 'google-pixel-8', updated_at: now },
    { city: 'burnaby', service: 'battery-replacement-mobile', model: 'iphone-14', updated_at: now },
    { city: 'richmond', service: 'battery-replacement-mobile', model: 'iphone-14', updated_at: now },
    { city: 'coquitlam', service: 'screen-replacement-laptop', model: 'samsung-galaxy-s23', updated_at: now },
    { city: 'surrey', service: 'camera-repair', model: 'google-pixel-7', updated_at: now },
    { city: 'vancouver', service: 'screen-repair', model: 'ipad-pro-2023', updated_at: now },
    { city: 'burnaby', service: 'screen-repair', model: 'ipad-air-2022', updated_at: now }
  ];
}

/**
 * Generate static high-priority pages
 */
function getStaticPages(siteUrl: string): SitemapEntry[] {
  return [
    {
      loc: `${siteUrl}/`,
      lastmod: FALLBACK_DATE,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      loc: `${siteUrl}/book-online`,
      lastmod: FALLBACK_DATE,
      changefreq: 'weekly',
      priority: '0.95'
    },
    {
      loc: `${siteUrl}/repair`,
      lastmod: FALLBACK_DATE,
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      loc: `${siteUrl}/sitemap`,
      lastmod: FALLBACK_DATE,
      changefreq: 'weekly',
      priority: '0.5'
    },
    {
      loc: `${siteUrl}/check-warranty`,
      lastmod: FALLBACK_DATE,
      changefreq: 'monthly',
      priority: '0.6'
    }
    // Archived pages removed (redirected to dynamic equivalents):
    // - /mobile-screen-repair → /services/mobile-repair
    // - /laptop-screen-repair → /services/laptop-repair
    // - /mobile-repair-near-me → /repair
  ];
}

/**
 * Generate neighborhood pages (/repair/{city}/{neighborhood})
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
      loc: `${siteUrl}/repair/${citySlug}/${neighborhoodSlug}`,
      lastmod: updated_at,
      changefreq: 'monthly',
      priority: '0.75'
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
    lastmod: FALLBACK_DATE,
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
    lastmod: FALLBACK_DATE,
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
 * Generate brand pages (/repair/{slug}-devices)
 */
function getBrandPages(siteUrl: string, brands: Array<{ slug: string; updated_at: string }>): SitemapEntry[] {
  return brands.map(brand => ({
    loc: `${siteUrl}/repair/${brand.slug}-devices`,
    lastmod: brand.updated_at,
    changefreq: 'weekly',
    priority: '0.85'
  }));
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
      priority: '0.7'
    });
  });
  
  return entries;
}

/**
 * Generate informational pages
 */
function getInformationalPages(siteUrl: string): SitemapEntry[] {
  return [
    {
      loc: `${siteUrl}/about`,
      lastmod: FALLBACK_DATE,
      changefreq: 'monthly',
      priority: '0.8'
    },
    {
      loc: `${siteUrl}/contact`,
      lastmod: FALLBACK_DATE,
      changefreq: 'monthly',
      priority: '0.8'
    },
    {
      loc: `${siteUrl}/pricing`,
      lastmod: FALLBACK_DATE,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      loc: `${siteUrl}/faq`,
      lastmod: FALLBACK_DATE,
      changefreq: 'monthly',
      priority: '0.7'
    }
  ];
}

/**
 * Generate legal pages
 */
function getLegalPages(siteUrl: string): SitemapEntry[] {
  return [
    {
      loc: `${siteUrl}/privacy-policy`,
      lastmod: FALLBACK_DATE,
      changefreq: 'yearly',
      priority: '0.3'
    },
    {
      loc: `${siteUrl}/terms-conditions`,
      lastmod: FALLBACK_DATE,
      changefreq: 'yearly',
      priority: '0.3'
    }
  ];
}

/**
 * Generate model landing pages (/models/{slug})
 */
function getModelPages(siteUrl: string): SitemapEntry[] {
  return getModelPageSlugs().map(slug => ({
    loc: `${siteUrl}/models/${slug}`,
    lastmod: FALLBACK_DATE,
    changefreq: 'weekly',
    priority: '0.85'
  }));
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
  // Basic essential URLs for fallback — use FALLBACK_DATE, never current timestamp
  const fallbackUrls = [
    { loc: `${siteUrl}/`, lastmod: FALLBACK_DATE, changefreq: 'daily', priority: '1.0' },
    { loc: `${siteUrl}/book-online`, lastmod: FALLBACK_DATE, changefreq: 'weekly', priority: '0.95' },
    { loc: `${siteUrl}/repair`, lastmod: FALLBACK_DATE, changefreq: 'weekly', priority: '0.9' },
    { loc: `${siteUrl}/about`, lastmod: FALLBACK_DATE, changefreq: 'monthly', priority: '0.8' },
    { loc: `${siteUrl}/contact`, lastmod: FALLBACK_DATE, changefreq: 'monthly', priority: '0.8' },
    { loc: `${siteUrl}/pricing`, lastmod: FALLBACK_DATE, changefreq: 'weekly', priority: '0.8' },
    { loc: `${siteUrl}/faq`, lastmod: FALLBACK_DATE, changefreq: 'monthly', priority: '0.7' },
    { loc: `${siteUrl}/privacy-policy`, lastmod: FALLBACK_DATE, changefreq: 'yearly', priority: '0.3' },
    { loc: `${siteUrl}/terms-conditions`, lastmod: FALLBACK_DATE, changefreq: 'yearly', priority: '0.3' },
    { loc: `${siteUrl}/blog`, lastmod: FALLBACK_DATE, changefreq: 'weekly', priority: '0.8' },
    { loc: `${siteUrl}/service-areas`, lastmod: FALLBACK_DATE, changefreq: 'monthly', priority: '0.8' },
  ];

  // Add essential city pages
  const essentialCities = ['vancouver', 'burnaby', 'richmond', 'north-vancouver', 'coquitlam'];
  essentialCities.forEach(city => {
    fallbackUrls.push({
      loc: `${siteUrl}/repair/${city}`,
      lastmod: FALLBACK_DATE,
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
