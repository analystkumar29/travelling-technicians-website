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
    // Fetch service areas
    const { data: serviceAreas } = await supabase
      .from('service_areas')
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
    
    // Fetch services (simulated based on your database schema)
    const services = [
      { slug: 'mobile-repair', updated_at: '2024-12-01T10:00:00Z', device_type: 'mobile' },
      { slug: 'laptop-repair', updated_at: '2024-12-01T10:00:00Z', device_type: 'laptop' },
      { slug: 'tablet-repair', updated_at: '2024-12-01T10:00:00Z', device_type: 'tablet' }
    ];
    
    return {
      serviceAreas: serviceAreas || [],
      blogPosts,
      services
    };
    
  } catch (error) {
    sitemapLogger.error('Error fetching dynamic content:', error);
    return {
      serviceAreas: [],
      blogPosts: [],
      services: []
    };
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
      priority: '0.95'
    },
    {
      loc: `${siteUrl}/laptop-screen-repair`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.95'
    },
    {
      loc: `${siteUrl}/mobile-repair-near-me`,
      lastmod: now,
      changefreq: 'weekly',
      priority: '0.95'
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
    
    // Service area pages
    entries.push({
      loc: `${siteUrl}/service-areas/${citySlug}`,
      lastmod: area.updated_at,
      changefreq: 'weekly',
      priority: '0.85'
    });
    
    // City repair pages
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
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/book-online</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${siteUrl}/services/mobile-repair</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${siteUrl}/services/laptop-repair</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}