import { DefaultSeoProps } from 'next-seo';

/**
 * Global SEO configuration for the entire application
 * This provides default metadata that can be overridden by individual pages
 */
export const defaultSeoConfig: DefaultSeoProps = {
  title: 'The Travelling Technicians | Mobile & Laptop Repair Vancouver BC',
  description: 'Expert mobile phone and laptop repair with convenient doorstep service across Vancouver, Burnaby, Surrey, Richmond, and Lower Mainland. Same-day service with 1-year warranty.',
  canonical: 'https://travelling-technicians.ca',
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: 'https://travelling-technicians.ca',
    siteName: 'The Travelling Technicians',
    title: 'The Travelling Technicians | Expert Device Repair At Your Door',
    description: 'Professional mobile and laptop repair services with convenient doorstep service across the Lower Mainland. Same-day repairs with 1-year warranty.',
    images: [
      {
        url: 'https://travelling-technicians.ca/images/logo/logo-orange-optimized.webp',
        width: 1200,
        height: 630,
        alt: 'The Travelling Technicians Logo',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    handle: '@travellingtechs',
    site: '@travellingtechs',
    cardType: 'summary_large_image',
    title: 'The Travelling Technicians | Mobile & Laptop Repair',
    description: 'Expert doorstep device repair across Vancouver and Lower Mainland. Same-day service available.',
    image: 'https://travelling-technicians.ca/images/logo/logo-orange-optimized.webp',
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content: 'mobile repair vancouver, laptop repair burnaby, doorstep phone repair, same day repair service, travelling technicians, mobile screen repair, laptop battery replacement',
    },
    {
      name: 'author',
      content: 'The Travelling Technicians',
    },
    {
      name: 'robots',
      content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    },
    {
      name: 'googlebot',
      content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    },
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicons/favicon-16x16.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicons/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '192x192',
      href: '/favicons/favicon-192x192.png',
    },
    {
      rel: 'apple-touch-icon',
      href: '/favicons/apple-touch-icon.png',
    },
    {
      rel: 'manifest',
      href: '/manifest.json',
    },
    {
      rel: 'manifest',
      href: '/site.webmanifest',
    },
  ],
};

/**
 * Helper function to generate page-specific SEO configuration
 */
export function generatePageSeo(
  title?: string,
  description?: string,
  canonical?: string,
  openGraph?: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
    url?: string;
  },
  twitter?: {
    title?: string;
    description?: string;
    image?: string;
  }
) {
  return {
    title: title || defaultSeoConfig.title,
    description: description || defaultSeoConfig.description,
    canonical: canonical || defaultSeoConfig.canonical,
    openGraph: {
      ...defaultSeoConfig.openGraph,
      ...openGraph,
    },
    twitter: {
      ...defaultSeoConfig.twitter,
      ...twitter,
    },
  };
}

/**
 * SEO configuration for specific page types
 */
export const seoConfigs = {
  homepage: {
    title: 'The Travelling Technicians | Mobile & Laptop Repair Vancouver BC',
    description: 'Expert mobile phone and laptop repair with convenient doorstep service across Vancouver, Burnaby, Surrey, Richmond, and Lower Mainland. Same-day service with 1-year warranty.',
  },
  service: {
    mobile: {
      title: 'Mobile Phone Repair Vancouver | iPhone & Android Screen Repair',
      description: 'Professional mobile phone repair services including iPhone and Android screen replacement, battery replacement, and more. Same-day doorstep service across Vancouver and Lower Mainland.',
    },
    laptop: {
      title: 'Laptop Repair Vancouver | MacBook & PC Screen & Battery Repair',
      description: 'Expert laptop repair services including MacBook and PC screen replacement, battery replacement, keyboard repair, and upgrades. Convenient doorstep service available.',
    },
  },
  location: (city: string) => ({
    title: `Mobile & Laptop Repair ${city} BC | Doorstep Service | The Travelling Technicians`,
    description: `Professional mobile phone and laptop repair services in ${city}, BC. Same-day doorstep service for iPhone, Android, MacBook, and PC repairs. 1-year warranty included.`,
  }),
  booking: {
    title: 'Book Online | Mobile & Laptop Repair Appointment | The Travelling Technicians',
    description: 'Book your mobile phone or laptop repair appointment online. Easy scheduling for doorstep service across Vancouver, Burnaby, Richmond, and Lower Mainland.',
  },
  about: {
    title: 'About The Travelling Technicians | Expert Mobile & Laptop Repair Team',
    description: 'Meet the professional technicians behind Vancouver\'s premier doorstep device repair service. Certified experts with years of experience in mobile and laptop repair.',
  },
  contact: {
    title: 'Contact The Travelling Technicians | Book Mobile & Laptop Repair Service',
    description: 'Contact us for professional mobile phone and laptop repair services. Book your doorstep repair appointment today. Serving Vancouver, Burnaby, Richmond, and Lower Mainland.',
  },
  pricing: {
    title: 'Mobile & Laptop Repair Pricing | Transparent & Competitive Rates',
    description: 'View our transparent pricing for mobile phone and laptop repair services. Competitive rates with no hidden fees. Same-day doorstep service available.',
  },
  faq: {
    title: 'Mobile & Laptop Repair FAQ | Common Questions Answered',
    description: 'Frequently asked questions about our mobile phone and laptop repair services, doorstep service, warranties, and pricing. Get answers from our experts.',
  },
};