import { getSiteUrl } from './supabaseClient';
import { logger } from './logger';
import { isValidStructuredData } from './structuredDataValidation';
import { getBusinessSettingsForSSG } from '@/lib/business-settings';

// Create a module logger
const seoLogger = logger.createModuleLogger('seoHelpers');

export interface PageMetadata {
  title: string;
  description: string;
  canonical: string;
  keywords?: string[];
  openGraph: {
    title: string;
    description: string;
    image: string;
    type: string;
    url: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image: string;
  };
  structuredData?: Record<string, any>;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

// Page type definitions for metadata generation
export type PageType = 
  | 'homepage'
  | 'service'
  | 'location'
  | 'blog'
  | 'about'
  | 'contact'
  | 'pricing'
  | 'faq'
  | 'booking'
  | 'legal';

export interface PageContext {
  type: PageType;
  path: string;
  params?: Record<string, string>;
  data?: Record<string, any>;
}

/**
 * Generate comprehensive page metadata based on page type and context
 */
export function generatePageMetadata(context: PageContext): PageMetadata {
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${context.path}`;
  
  // Default image for social sharing
  const defaultImage = `${siteUrl}/images/logo/logo-orange-optimized.webp`;
  
  try {
    switch (context.type) {
      case 'homepage':
        return generateHomepageMetadata(canonical, defaultImage);
      
      case 'service':
        return generateServiceMetadata(context, canonical, defaultImage);
      
      case 'location':
        return generateLocationMetadata(context, canonical, defaultImage);
      
      case 'blog':
        return generateBlogMetadata(context, canonical, defaultImage);
      
      case 'about':
        return generateAboutMetadata(canonical, defaultImage);
      
      case 'contact':
        return generateContactMetadata(canonical, defaultImage);
      
      case 'pricing':
        return generatePricingMetadata(canonical, defaultImage);
      
      case 'faq':
        return generateFAQMetadata(canonical, defaultImage);
      
      case 'booking':
        return generateBookingMetadata(canonical, defaultImage);
      
      case 'legal':
        return generateLegalMetadata(context, canonical, defaultImage);
      
      default:
        return generateDefaultMetadata(context, canonical, defaultImage);
    }
  } catch (error) {
    seoLogger.error('Error generating page metadata:', error);
    return generateDefaultMetadata(context, canonical, defaultImage);
  }
}

/**
 * Generate homepage metadata
 */
function generateHomepageMetadata(canonical: string, defaultImage: string): PageMetadata {
  return {
    title: 'The Travelling Technicians | Mobile & Laptop Repair Vancouver BC',
    description: 'Expert mobile phone and laptop repair with convenient doorstep service across Vancouver, Burnaby, Surrey, Richmond, and Lower Mainland. Same-day service with up to 6-month warranty.',
    canonical,
    keywords: [
      'mobile repair vancouver',
      'laptop repair burnaby',
      'doorstep phone repair',
      'same day repair service',
      'travelling technicians',
      'mobile screen repair',
      'laptop battery replacement'
    ],
    openGraph: {
      title: 'The Travelling Technicians | Expert Device Repair At Your Door',
      description: 'Professional mobile and laptop repair services with convenient doorstep service across the Lower Mainland. Same-day repairs with up to 6-month warranty.',
      image: defaultImage,
      type: 'website',
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title: 'The Travelling Technicians | Mobile & Laptop Repair',
      description: 'Expert doorstep device repair across Vancouver and Lower Mainland. Same-day service available.',
      image: defaultImage
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'The Travelling Technicians',
      description: 'Professional mobile phone and laptop repair services with same-day doorstep service',
      url: canonical,
      // Phone will be injected server-side via getStaticProps
      telephone: 'BUSINESS_PHONE_PLACEHOLDER',
      email: 'info@travelling-technicians.ca'
    }
  };
}

/**
 * Generate service page metadata
 */
function generateServiceMetadata(context: PageContext, canonical: string, defaultImage: string): PageMetadata {
  const serviceType = context.params?.service || 'repair';
  const deviceType = context.path.includes('mobile') ? 'mobile' : 
                     context.path.includes('laptop') ? 'laptop' : 'device';
  
  const titles = {
    mobile: `Mobile Phone Repair Vancouver | iPhone & Android Screen Repair`,
    laptop: `Laptop Repair Vancouver | MacBook & PC Screen & Battery Repair`,
    device: `Professional Device Repair Services | Doorstep Repair Vancouver`
  };
  
  const descriptions = {
    mobile: 'Professional mobile phone repair services including iPhone and Android screen replacement, battery replacement, and more. Same-day doorstep service across Vancouver and Lower Mainland.',
    laptop: 'Expert laptop repair services including MacBook and PC screen replacement, battery replacement, keyboard repair, and upgrades. Convenient doorstep service available.',
    device: 'Comprehensive device repair services for mobile phones and laptops. Professional doorstep repair with same-day service and up to 6-month warranty.'
  };
  
  return {
    title: titles[deviceType as keyof typeof titles],
    description: descriptions[deviceType as keyof typeof descriptions],
    canonical,
    keywords: [
      `${deviceType} repair vancouver`,
      `${deviceType} screen repair`,
      `${deviceType} battery replacement`,
      'doorstep repair service',
      'same day repair',
      'travelling technicians'
    ],
    openGraph: {
      title: titles[deviceType as keyof typeof titles],
      description: descriptions[deviceType as keyof typeof descriptions],
      image: defaultImage,
      type: 'website',
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[deviceType as keyof typeof titles],
      description: descriptions[deviceType as keyof typeof descriptions],
      image: defaultImage
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} Repair Service`,
      description: descriptions[deviceType as keyof typeof descriptions],
      provider: {
        '@type': 'LocalBusiness',
        name: 'The Travelling Technicians'
      },
      areaServed: 'Vancouver, BC'
    }
  };
}

/**
 * Generate location page metadata
 */
function generateLocationMetadata(context: PageContext, canonical: string, defaultImage: string): PageMetadata {
  const city = context.params?.city || 'Vancouver';
  const cityName = city.charAt(0).toUpperCase() + city.slice(1).replace('-', ' ');
  
  return {
    title: `Mobile & Laptop Repair ${cityName} BC | Doorstep Service | The Travelling Technicians`,
    description: `Professional mobile phone and laptop repair services in ${cityName}, BC. Same-day doorstep service for iPhone, Android, MacBook, and PC repairs. Up to 6-month warranty included.`,
    canonical,
    keywords: [
      `mobile repair ${cityName.toLowerCase()}`,
      `laptop repair ${cityName.toLowerCase()}`,
      `phone repair ${cityName.toLowerCase()}`,
      `doorstep repair ${cityName.toLowerCase()}`,
      'travelling technicians',
      'same day repair'
    ],
    openGraph: {
      title: `Mobile & Laptop Repair ${cityName} | Doorstep Service`,
      description: `Expert device repair services in ${cityName}, BC. Same-day doorstep service with up to 6-month warranty.`,
      image: defaultImage,
      type: 'website',
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title: `Mobile & Laptop Repair ${cityName}`,
      description: `Professional device repair in ${cityName} with convenient doorstep service.`,
      image: defaultImage
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: `The Travelling Technicians - ${cityName}`,
      description: `Mobile and laptop repair services in ${cityName}, BC`,
      areaServed: {
        '@type': 'City',
        name: cityName,
        addressRegion: 'BC',
        addressCountry: 'CA'
      }
    }
  };
}

/**
 * Generate blog page metadata
 */
function generateBlogMetadata(context: PageContext, canonical: string, defaultImage: string): PageMetadata {
  const blogData = context.data;
  const isCategory = context.path.includes('/category/');
  const isPost = !isCategory && context.path !== '/blog';
  
  if (isPost && blogData) {
    return {
      title: `${blogData.title} | The Travelling Technicians Blog`,
      description: blogData.excerpt || blogData.description || 'Expert advice and tips for mobile and laptop repair.',
      canonical,
      keywords: blogData.keywords || ['mobile repair', 'laptop repair', 'device maintenance'],
      openGraph: {
        title: blogData.title,
        description: blogData.excerpt || blogData.description || '',
        image: blogData.image || defaultImage,
        type: 'article',
        url: canonical
      },
      twitter: {
        card: 'summary_large_image',
        title: blogData.title,
        description: blogData.excerpt || blogData.description || '',
        image: blogData.image || defaultImage
      },
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: blogData.title,
        description: blogData.description,
        image: blogData.image,
        datePublished: blogData.publishDate,
        author: {
          '@type': 'Organization',
          name: 'The Travelling Technicians'
        }
      }
    };
  }
  
  return {
    title: 'Device Repair Tips & Guides | The Travelling Technicians Blog',
    description: 'Expert tips, guides, and insights on mobile phone and laptop repair, maintenance, and troubleshooting from professional technicians.',
    canonical,
    keywords: [
      'device repair tips',
      'mobile maintenance',
      'laptop troubleshooting',
      'repair guides',
      'tech tips'
    ],
    openGraph: {
      title: 'Device Repair Tips & Guides | Expert Advice',
      description: 'Professional advice on device repair, maintenance, and troubleshooting.',
      image: defaultImage,
      type: 'website',
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Device Repair Tips & Guides',
      description: 'Expert advice on mobile and laptop repair.',
      image: defaultImage
    }
  };
}

/**
 * Generate other page types metadata
 */
function generateAboutMetadata(canonical: string, defaultImage: string): PageMetadata {
  return {
    title: 'About The Travelling Technicians | Expert Mobile & Laptop Repair Team',
    description: 'Meet the professional technicians behind Vancouver\'s premier doorstep device repair service. Certified experts with years of experience in mobile and laptop repair.',
    canonical,
    openGraph: {
      title: 'About The Travelling Technicians | Our Expert Team',
      description: 'Professional technicians providing expert doorstep device repair across Vancouver and Lower Mainland.',
      image: defaultImage,
      type: 'website',
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title: 'About The Travelling Technicians',
      description: 'Meet our expert device repair team.',
      image: defaultImage
    }
  };
}

function generateContactMetadata(canonical: string, defaultImage: string): PageMetadata {
  return {
    title: 'Contact The Travelling Technicians | Book Mobile & Laptop Repair Service',
    description: 'Contact us for professional mobile phone and laptop repair services. Book your doorstep repair appointment today. Serving Vancouver, Burnaby, Richmond, and Lower Mainland.',
    canonical,
    openGraph: {
      title: 'Contact The Travelling Technicians | Book Repair Service',
      description: 'Get in touch to book professional doorstep device repair services.',
      image: defaultImage,
      type: 'website',
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Contact The Travelling Technicians',
      description: 'Book professional doorstep device repair.',
      image: defaultImage
    }
  };
}

function generatePricingMetadata(canonical: string, defaultImage: string): PageMetadata {
  return {
    title: 'Mobile & Laptop Repair Pricing | Transparent & Competitive Rates',
    description: 'View our transparent pricing for mobile phone and laptop repair services. Competitive rates with no hidden fees. Same-day doorstep service available.',
    canonical,
    openGraph: {
      title: 'Device Repair Pricing | Transparent Rates',
      description: 'Competitive pricing for professional device repair services.',
      image: defaultImage,
      type: 'website',
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Device Repair Pricing',
      description: 'Transparent pricing for mobile and laptop repair.',
      image: defaultImage
    }
  };
}

function generateFAQMetadata(canonical: string, defaultImage: string): PageMetadata {
  return {
    title: 'Mobile & Laptop Repair FAQ | Common Questions Answered',
    description: 'Frequently asked questions about our mobile phone and laptop repair services, doorstep service, warranties, and pricing. Get answers from our experts.',
    canonical,
    openGraph: {
      title: 'Device Repair FAQ | Your Questions Answered',
      description: 'Common questions about our professional device repair services.',
      image: defaultImage,
      type: 'website',
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Device Repair FAQ',
      description: 'Answers to common device repair questions.',
      image: defaultImage
    }
  };
}

function generateBookingMetadata(canonical: string, defaultImage: string): PageMetadata {
  return {
    title: 'Book Online | Mobile & Laptop Repair Appointment | The Travelling Technicians',
    description: 'Book your mobile phone or laptop repair appointment online. Easy scheduling for doorstep service across Vancouver, Burnaby, Richmond, and Lower Mainland.',
    canonical,
    openGraph: {
      title: 'Book Device Repair Online | Easy Scheduling',
      description: 'Schedule your doorstep device repair appointment online.',
      image: defaultImage,
      type: 'website',
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Book Device Repair Online',
      description: 'Easy online booking for doorstep device repair.',
      image: defaultImage
    }
  };
}

function generateLegalMetadata(context: PageContext, canonical: string, defaultImage: string): PageMetadata {
  const isPrivacy = context.path.includes('privacy');
  const title = isPrivacy ? 'Privacy Policy' : 'Terms & Conditions';
  
  return {
    title: `${title} | The Travelling Technicians`,
    description: `${title} for The Travelling Technicians mobile and laptop repair services.`,
    canonical,
    openGraph: {
      title: `${title} | The Travelling Technicians`,
      description: `${title} for our device repair services.`,
      image: defaultImage,
      type: 'website',
      url: canonical
    },
    twitter: {
      card: 'summary',
      title: `${title}`,
      description: `${title} for our device repair services.`,
      image: defaultImage
    }
  };
}

function generateDefaultMetadata(context: PageContext, canonical: string, defaultImage: string): PageMetadata {
  return {
    title: 'The Travelling Technicians | Mobile & Laptop Repair Services',
    description: 'Professional mobile phone and laptop repair services with doorstep service across Vancouver and Lower Mainland.',
    canonical,
    openGraph: {
      title: 'The Travelling Technicians | Device Repair Services',
      description: 'Professional doorstep device repair services.',
      image: defaultImage,
      type: 'website',
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title: 'The Travelling Technicians',
      description: 'Professional device repair services.',
      image: defaultImage
    }
  };
}

/**
 * Create breadcrumbs for better navigation
 */
export function createBreadcrumbs(path: string): BreadcrumbItem[] {
  const siteUrl = getSiteUrl();
  const pathSegments = path.split('/').filter(Boolean);
  
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: siteUrl }
  ];
  
  let currentPath = '';
  
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    
    // Generate friendly names for path segments
    const name = generateBreadcrumbName(segment, currentPath);
    breadcrumbs.push({
      name,
      url: `${siteUrl}${currentPath}`
    });
  }
  
  return breadcrumbs;
}

/**
 * Generate friendly breadcrumb names
 */
function generateBreadcrumbName(segment: string, fullPath: string): string {
  const nameMap: Record<string, string> = {
    'services': 'Services',
    'mobile-repair': 'Mobile Repair',
    'laptop-repair': 'Laptop Repair',
    'tablet-repair': 'Tablet Repair',
    'service-areas': 'Service Areas',
    'repair': 'Repair Services',
    'blog': 'Blog',
    'about': 'About Us',
    'contact': 'Contact',
    'pricing': 'Pricing',
    'faq': 'FAQ',
    'book-online': 'Book Online',
    'doorstep-repair': 'Doorstep Repair',
    'vancouver': 'Vancouver',
    'burnaby': 'Burnaby',
    'richmond': 'Richmond',
    'north-vancouver': 'North Vancouver',
    'new-westminster': 'New Westminster',
    'coquitlam': 'Coquitlam',
    'west-vancouver': 'West Vancouver',
    'privacy-policy': 'Privacy Policy',
    'terms-conditions': 'Terms & Conditions'
  };
  
  return nameMap[segment] || segment.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

/**
 * Validate structured data using basic JSON-LD validation
 */
export function validateStructuredData(data: Record<string, any>): boolean {
  try {
    if (!data['@context'] || !data['@type']) {
      seoLogger.warn('Structured data missing required @context or @type');
      return false;
    }
    
    // Basic validation - ensure it's valid JSON
    JSON.stringify(data);
    
    seoLogger.debug('Structured data validation passed');
    return true;
  } catch (error) {
    seoLogger.error('Structured data validation failed:', error);
    return false;
  }
}

/**
 * Generate JSON-LD structured data for breadcrumbs
 */
export function generateBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  };
}
