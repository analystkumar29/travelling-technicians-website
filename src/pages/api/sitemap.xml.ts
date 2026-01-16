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
 * Queries database to get top 30 combinations of cities, services, and models
 */
async function getPopularCityServiceModels(): Promise<Array<{
  city: string;
  service: string;
  model: string;
  updated_at: string;
}>> {
  const supabase = getServiceSupabase();
  
  try {
    // Fetch active service locations
    const { data: cities } = await supabase
      .from('service_locations')
      .select('city, updated_at')
      .eq('is_active', true)
      .order('city')
      .limit(8);

    // Fetch popular device models with pricing data
    const { data: products } = await supabase
      .from('mobileactive_products')
      .select('model_name, brand_name, updated_at')
      .not('model_name', 'is', null)
      .order('model_name')
      .limit(15);

    // Define common repair services
    const services = [
      { name: 'screen-repair', label: 'Screen Repair' },
      { name: 'battery-replacement', label: 'Battery Replacement' },
      { name: 'charging-port-repair', label: 'Charging Port Repair' },
      { name: 'water-damage-repair', label: 'Water Damage Repair' },
      { name: 'camera-repair', label: 'Camera Repair' }
    ];

    const combinations: Array<{
      city: string;
      service: string;
      model: string;
      updated_at: string;
    }> = [];

    // Generate combinations if we have database data
    if (cities && cities.length > 0 && products && products.length > 0) {
      // Create combinations for popular cities and models
      const popularCities = cities.slice(0, 5); // Top 5 cities
      const popularProducts = products.slice(0, 6); // Top 6 products

      popularCities.forEach(city => {
        const citySlug = city.city.toLowerCase().replace(/\s+/g, '-');
        
        // Add 2 services per city for top products
        popularProducts.slice(0, 3).forEach((product, idx) => {
          const modelSlug = `${product.brand_name}-${product.model_name}`
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
          
          const service = services[idx % services.length];
          
          combinations.push({
            city: citySlug,
            service: service.name,
            model: modelSlug,
            updated_at: product.updated_at || city.updated_at || new Date().toISOString()
          });
        });
      });

      sitemapLogger.info(`Generated ${combinations.length} city-service-model combinations from database`);
    }

    // If we don't have enough from database, add fallback popular combinations
    if (combinations.length < 30) {
      const fallbackCombinations = [
        { city: 'vancouver', service: 'screen-repair', model: 'iphone-14', updated_at: new Date().toISOString() },
        { city: 'vancouver', service: 'battery-replacement', model: 'iphone-14', updated_at: new Date().toISOString() },
        { city: 'vancouver', service: 'screen-repair', model: 'samsung-galaxy-s23', updated_at: new Date().toISOString() },
        { city: 'burnaby', service: 'screen-repair', model: 'iphone-14', updated_at: new Date().toISOString() },
        { city: 'burnaby', service: 'battery-replacement', model: 'samsung-galaxy-s23', updated_at: new Date().toISOString() },
        { city: 'richmond', service: 'charging-port-repair', model: 'google-pixel-7', updated_at: new Date().toISOString() },
        { city: 'richmond', service: 'screen-repair', model: 'iphone-13', updated_at: new Date().toISOString() },
        { city: 'coquitlam', service: 'screen-repair', model: 'macbook-pro-2023', updated_at: new Date().toISOString() },
        { city: 'coquitlam', service: 'battery-replacement', model: 'macbook-air-2023', updated_at: new Date().toISOString() },
        { city: 'north-vancouver', service: 'water-damage-repair', model: 'iphone-15', updated_at: new Date().toISOString() },
        { city: 'north-vancouver', service: 'screen-repair', model: 'iphone-15', updated_at: new Date().toISOString() },
        { city: 'surrey', service: 'screen-repair', model: 'samsung-galaxy-s22', updated_at: new Date().toISOString() },
        { city: 'surrey', service: 'battery-replacement', model: 'iphone-13', updated_at: new Date().toISOString() },
        { city: 'new-westminster', service: 'camera-repair', model: 'iphone-13', updated_at: new Date().toISOString() },
        { city: 'new-westminster', service: 'screen-repair', model: 'samsung-galaxy-s21', updated_at: new Date().toISOString() },
        { city: 'west-vancouver', service: 'screen-repair', model: 'iphone-14-pro', updated_at: new Date().toISOString() },
        { city: 'west-vancouver', service: 'battery-replacement', model: 'macbook-pro-2023', updated_at: new Date().toISOString() },
        { city: 'vancouver', service: 'charging-port-repair', model: 'samsung-galaxy-s23', updated_at: new Date().toISOString() },
        { city: 'vancouver', service: 'camera-repair', model: 'google-pixel-8', updated_at: new Date().toISOString() },
        { city: 'burnaby', service: 'water-damage-repair', model: 'iphone-14', updated_at: new Date().toISOString() },
        { city: 'richmond', service: 'battery-replacement', model: 'iphone-14', updated_at: new Date().toISOString() },
        { city: 'coquitlam', service: 'charging-port-repair', model: 'samsung-galaxy-s23', updated_at: new Date().toISOString() },
        { city: 'surrey', service: 'camera-repair', model: 'google-pixel-7', updated_at: new Date().toISOString() },
        { city: 'vancouver', service: 'screen-repair', model: 'ipad-pro-2023', updated_at: new Date().toISOString() },
        { city: 'burnaby', service: 'screen-repair', model: 'ipad-air-2022', updated_at: new Date().toISOString() }
      ];

      // Add fallback combinations not already in list
      fallbackCombinations.forEach(combo => {
        const exists = combinations.some(
          c => c.city === combo.city && c.service === combo.service && c.model === combo.model
        );
        if (!exists && combinations.length < 30) {
          combinations.push(combo);
        }
      });
    }

    // Limit to 30 combinations for sitemap optimization
    return combinations.slice(0, 30);
    
  } catch (error) {
    sitemapLogger.error('Error fetching city-service-model combinations:', error);
    
    // Return essential fallback combinations
    return [
      { city: 'vancouver', service: 'screen-repair', model: 'iphone-14', updated_at: new Date().toISOString() },
      { city: 'vancouver', service: 'battery-replacement', model: 'iphone-14', updated_at: new Date().toISOString() },
      { city: 'burnaby', service: 'screen-repair', model: 'samsung-galaxy-s23', updated_at: new Date().toISOString() },
      { city: 'richmond', service: 'charging-port-repair', model: 'google-pixel-7', updated_at: new Date().toISOString() },
      { city: 'coquitlam', service: 'screen-repair', model: 'macbook-pro-2023', updated_at: new Date().toISOString() }
    ];
  }
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
