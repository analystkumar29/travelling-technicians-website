import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  generatePageMetadata, 
  createBreadcrumbs, 
  generateBreadcrumbSchema,
  PageType,
  PageContext,
  PageMetadata
} from '@/utils/seoHelpers';
import { isValidStructuredData } from '@/utils/structuredDataValidation';
import { getSiteUrl } from '@/utils/supabaseClient';
import { logger } from '@/utils/logger';

// Create a module logger
const metaLogger = logger.createModuleLogger('DynamicMeta');

export interface DynamicMetaProps {
  pageType: PageType;
  pageData?: Record<string, any>;
  customMetadata?: Partial<PageMetadata>;
  includeJsonLd?: boolean;
  noIndex?: boolean;
}

export default function DynamicMeta({
  pageType,
  pageData = {},
  customMetadata = {},
  includeJsonLd = true,
  noIndex = false
}: DynamicMetaProps) {
  const router = useRouter();
  const siteUrl = getSiteUrl();
  
  // Generate page context with memoization to prevent re-renders
  const pageContext = React.useMemo((): PageContext => ({
    type: pageType,
    path: router.asPath.split('?')[0], // Remove query parameters
    params: router.query as Record<string, string>,
    data: pageData
  }), [pageType, router.asPath, router.query, pageData]);
  
  // Generate metadata
  const metadata = React.useMemo(() => {
    try {
      const baseMetadata = generatePageMetadata(pageContext);
      
      // Merge with custom metadata
      return {
        ...baseMetadata,
        ...customMetadata,
        openGraph: {
          ...baseMetadata.openGraph,
          ...customMetadata.openGraph
        },
        twitter: {
          ...baseMetadata.twitter,
          ...customMetadata.twitter
        }
      };
    } catch (error) {
      metaLogger.error('Error generating metadata:', error);
      return generateFallbackMetadata(pageContext.path);
    }
  }, [pageContext, customMetadata]);
  
  // Generate breadcrumbs
  const breadcrumbs = React.useMemo(() => {
    try {
      return createBreadcrumbs(pageContext.path);
    } catch (error) {
      metaLogger.error('Error generating breadcrumbs:', error);
      return [{ name: 'Home', url: siteUrl }];
    }
  }, [pageContext.path, siteUrl]);
  
  // Generate dynamic favicon with cache busting
  const faviconVersion = React.useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}.${now.getMonth() + 1}`;
  }, []);
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      
      {/* Keywords */}
      {metadata.keywords && metadata.keywords.length > 0 && (
        <meta name="keywords" content={metadata.keywords.join(', ')} />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={metadata.canonical} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={metadata.openGraph.title} />
      <meta property="og:description" content={metadata.openGraph.description} />
      <meta property="og:image" content={metadata.openGraph.image} />
      <meta property="og:type" content={metadata.openGraph.type} />
      <meta property="og:url" content={metadata.openGraph.url} />
      <meta property="og:site_name" content="The Travelling Technicians" />
      <meta property="og:locale" content="en_CA" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={metadata.twitter.card} />
      <meta name="twitter:title" content={metadata.twitter.title} />
      <meta name="twitter:description" content={metadata.twitter.description} />
      <meta name="twitter:image" content={metadata.twitter.image} />
      <meta name="twitter:site" content="@TravellingTechs" />
      <meta name="twitter:creator" content="@TravellingTechs" />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="The Travelling Technicians" />
      <meta name="publisher" content="The Travelling Technicians" />
      <meta name="copyright" content="© 2024 The Travelling Technicians" />
      <meta name="language" content="en-CA" />
      <meta name="geo.region" content="CA-BC" />
      <meta name="geo.placename" content="Vancouver, British Columbia" />
      <meta name="geo.position" content="49.2827;-123.1207" />
      <meta name="ICBM" content="49.2827, -123.1207" />
      
      {/* Dynamic Favicon with Cache Busting */}
      <link rel="icon" href={`/favicon.ico?v=${faviconVersion}`} />
      <link 
        rel="icon" 
        type="image/png" 
        sizes="16x16" 
        href={`/favicons/favicon-16x16.png?v=${faviconVersion}`} 
      />
      <link 
        rel="icon" 
        type="image/png" 
        sizes="32x32" 
        href={`/favicons/favicon-32x32.png?v=${faviconVersion}`} 
      />
      <link 
        rel="apple-touch-icon" 
        href={`/favicons/apple-touch-icon.png?v=${faviconVersion}`} 
      />
      
      {/* DNS Prefetch for External Resources */}
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//api.mapbox.com" />
      
      {/* Preconnect for Critical Resources */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* JSON-LD Structured Data */}
      {includeJsonLd && (
        <>
          {/* Page-specific structured data */}
          {metadata.structuredData && isValidStructuredData(metadata.structuredData) && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(metadata.structuredData)
              }}
            />
          )}
          
          {/* Breadcrumb structured data */}
          {breadcrumbs.length > 1 && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs))
              }}
            />
          )}
          
          {/* Website schema */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'The Travelling Technicians',
                url: siteUrl,
                description: 'Professional mobile phone and laptop repair services with doorstep service across Vancouver and Lower Mainland',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: `${siteUrl}/search?q={search_term_string}`
                  },
                  'query-input': 'required name=search_term_string'
                }
              })
            }}
          />
          
          {/* Organization schema */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                '@id': `${siteUrl}/#organization`,
                name: 'The Travelling Technicians',
                url: siteUrl,
                description: 'Professional mobile phone and laptop repair services with doorstep service across Vancouver and Lower Mainland, BC',
                logo: {
                  '@type': 'ImageObject',
                  url: `${siteUrl}/images/logo/logo-orange-optimized.webp`,
                  width: 300,
                  height: 60
                },
                contactPoint: {
                  '@type': 'ContactPoint',
                  telephone: '+1-778-389-9251',
                  contactType: 'customer service',
                  areaServed: 'CA-BC',
                  availableLanguage: ['en', 'fr']
                },
                sameAs: [
                  'https://www.facebook.com/travellingtechnicians',
                  'https://www.instagram.com/travellingtechnicians',
                  'https://www.linkedin.com/company/the-travelling-technicians'
                ]
              })
            }}
          />
        </>
      )}
      
      {/* Additional page-specific meta tags based on page type */}
      {generatePageSpecificMeta(pageType, pageData, metadata.canonical)}
    </Head>
  );
}

/**
 * Generate fallback metadata for error cases
 */
function generateFallbackMetadata(path: string): PageMetadata {
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${path}`;
  const defaultImage = `${siteUrl}/images/logo/logo-orange-optimized.webp`;
  
  return {
    title: 'The Travelling Technicians | Mobile & Laptop Repair',
    description: 'Professional mobile phone and laptop repair services with doorstep service.',
    canonical,
    openGraph: {
      title: 'The Travelling Technicians',
      description: 'Professional mobile phone and laptop repair services.',
      image: defaultImage,
      type: 'website',
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title: 'The Travelling Technicians',
      description: 'Professional mobile phone and laptop repair services.',
      image: defaultImage
    }
  };
}

/**
 * Generate page-specific meta tags
 */
function generatePageSpecificMeta(pageType: PageType, pageData: Record<string, any>, canonical: string) {
  const elements: JSX.Element[] = [];
  
  switch (pageType) {
    case 'blog':
      if (pageData.publishDate) {
        elements.push(
          <meta key="article:published_time" property="article:published_time" content={pageData.publishDate} />
        );
      }
      if (pageData.modifiedDate) {
        elements.push(
          <meta key="article:modified_time" property="article:modified_time" content={pageData.modifiedDate} />
        );
      }
      if (pageData.author) {
        elements.push(
          <meta key="article:author" property="article:author" content={pageData.author} />
        );
      }
      if (pageData.tags && Array.isArray(pageData.tags)) {
        pageData.tags.forEach((tag: string, index: number) => {
          elements.push(
            <meta key={`article:tag:${index}`} property="article:tag" content={tag} />
          );
        });
      }
      break;
      
    case 'service':
      elements.push(
        <meta key="business:contact_data:street_address" property="business:contact_data:street_address" content="Vancouver, BC" />,
        <meta key="business:contact_data:locality" property="business:contact_data:locality" content="Vancouver" />,
        <meta key="business:contact_data:region" property="business:contact_data:region" content="BC" />,
        <meta key="business:contact_data:country_name" property="business:contact_data:country_name" content="Canada" />
      );
      break;
      
    case 'location':
      if (pageData.city) {
        elements.push(
          <meta key="geo:placename" name="geo.placename" content={`${pageData.city}, British Columbia`} />
        );
      }
      break;
  }
  
  return elements;
}

/**
 * Hook for getting current page metadata
 */
export function usePageMetadata(pageType: PageType, pageData?: Record<string, any>): PageMetadata {
  const router = useRouter();
  
  return React.useMemo(() => {
    const pageContext: PageContext = {
      type: pageType,
      path: router.asPath.split('?')[0],
      params: router.query as Record<string, string>,
      data: pageData
    };
    
    try {
      return generatePageMetadata(pageContext);
    } catch (error) {
      metaLogger.error('Error in usePageMetadata:', error);
      return generateFallbackMetadata(pageContext.path);
    }
  }, [pageType, pageData, router.asPath, router.query]);
}
