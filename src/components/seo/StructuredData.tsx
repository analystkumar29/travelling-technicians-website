import React from 'react';
import { getSiteUrl } from '@/utils/supabaseClient';
import { validateStructuredData } from '@/utils/structuredDataValidation';
import { PlaceSchema, PlaceSchemaProps } from './PlaceSchema';
import { CityLocalBusinessSchema, CityLocalBusinessSchemaProps } from './CityLocalBusinessSchema';

// Re-export new schema components
export { PlaceSchema, type PlaceSchemaProps };
export { CityLocalBusinessSchema, type CityLocalBusinessSchemaProps };

export interface LocalBusinessSchemaProps {
  name?: string;
  description?: string;
  url?: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion: string;
    postalCode?: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  priceRange?: string;
  areaServed?: string[];
  serviceArea?: string[];
  sameAs?: string[];
}

export interface ServiceSchemaProps {
  name: string;
  description: string;
  provider?: string;
  serviceType: string;
  areaServed?: string[];
  hasOfferCatalog?: {
    name: string;
    description: string;
    offers: Array<{
      name: string;
      description: string;
      priceCurrency: string;
      price?: string;
      priceRange?: string;
    }>;
  };
  doorstepService?: boolean;
  warranty?: string;
}

export interface FAQSchemaProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export interface ReviewSchemaProps {
  reviews: Array<{
    author: string;
    rating: number;
    reviewBody: string;
    datePublished?: string;
    location?: string;
  }>;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}

export interface ArticleSchemaProps {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
  category?: string;
  tags?: string[];
}

/**
 * LocalBusiness Schema Component
 */
export function LocalBusinessSchema({
  name = "The Travelling Technicians",
  description = "Professional mobile phone, laptop, and tablet repair services with doorstep service across Vancouver, Burnaby, Surrey, Richmond, and the Lower Mainland, BC",
  url,
  telephone,
  email = "info@travellingtechnicians.ca",
  address = {
    addressLocality: "Vancouver",
    addressRegion: "BC",
    addressCountry: "CA"
  },
  geo = {
    latitude: 49.2827,
    longitude: -123.1207
  },
  openingHours = [
    "Mo-Fr 08:00-20:00",
    "Sa 09:00-18:00",
    "Su 10:00-17:00"
  ],
  priceRange = "$79-$299",
  areaServed = [
    "Abbotsford, BC",
    "Burnaby, BC",
    "Chilliwack, BC",
    "Delta, BC",
    "Langley, BC",
    "New Westminster, BC",
    "North Vancouver, BC",
    "Richmond, BC",
    "Squamish, BC",
    "Surrey, BC",
    "Vancouver, BC",
    "West Vancouver, BC"
  ],
  sameAs = [
    "https://www.facebook.com/travellingtechnicians",
    "https://www.instagram.com/travellingtechnicians",
    "https://www.linkedin.com/company/travelling-technicians"
  ]
}: LocalBusinessSchemaProps) {
  const siteUrl = getSiteUrl();
  const businessUrl = url || siteUrl;
  
  // If telephone is not provided, it should be passed from server-side props
  if (!telephone) {
    console.warn('LocalBusinessSchema: telephone prop is required');
    return null;
  }
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${businessUrl}/#localbusiness`,
    "name": name,
    "description": description,
    "url": businessUrl,
    "telephone": telephone,
    "email": email,
    "address": {
      "@type": "PostalAddress",
      ...address
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": Number(geo.latitude),
      "longitude": Number(geo.longitude)
    },
    "openingHoursSpecification": openingHours.map(hours => ({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": hours.split(' ')[0].split('-').length > 1 
        ? hours.split(' ')[0].split('-').map(day => {
            const dayMap: { [key: string]: string } = {
              'Mo': 'Monday', 'Tu': 'Tuesday', 'We': 'Wednesday', 
              'Th': 'Thursday', 'Fr': 'Friday', 'Sa': 'Saturday', 'Su': 'Sunday'
            };
            return dayMap[day] || day;
          })
        : hours.split(' ')[0],
      "opens": hours.split(' ')[1]?.split('-')[0],
      "closes": hours.split(' ')[1]?.split('-')[1]
    })),
    "priceRange": priceRange,
    "areaServed": areaServed.map(area => ({
      "@type": "City",
      "name": area
    })),
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Repair Services",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Mobile Phone Repair",
          "description": "Screen replacement, battery replacement, charging port repair, and more"
        },
        {
          "@type": "OfferCatalog", 
          "name": "Laptop Repair",
          "description": "Screen replacement, battery upgrade, keyboard repair, hard drive replacement"
        },
        {
          "@type": "OfferCatalog",
          "name": "Doorstep Service",
          "description": "Convenient repair service at your location"
        }
      ]
    },
    "logo": {
      "@type": "ImageObject",
      "url": `${siteUrl}/images/logo/logo-orange-optimized.webp`,
      "width": 300,
      "height": 60
    },
    "image": [
      `${siteUrl}/images/services/doorstep-repair-tech-optimized.webp`,
      `${siteUrl}/images/logo/logo-orange-optimized.webp`
    ],
    "sameAs": [
      "https://www.facebook.com/travellingtechnicians",
      "https://www.instagram.com/travellingtechnicians", 
      "https://www.linkedin.com/company/travelling-technicians"
    ],
    "paymentAccepted": "Cash, Credit Card, Debit Card, E-transfer",
    "currenciesAccepted": "CAD"
  };

  if (!validateStructuredData(schema)) {
    console.warn('LocalBusiness schema validation failed');
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
}

/**
 * Service Schema Component
 */
export function ServiceSchema({
  name,
  description,
  provider = "The Travelling Technicians",
  serviceType,
  areaServed = [
    "Abbotsford, BC", "Burnaby, BC", "Chilliwack, BC", "Delta, BC",
    "Langley, BC", "New Westminster, BC", "North Vancouver, BC",
    "Richmond, BC", "Squamish, BC", "Surrey, BC",
    "Vancouver, BC", "West Vancouver, BC"
  ],
  hasOfferCatalog,
  doorstepService = true,
  warranty = "90 days"
}: ServiceSchemaProps) {
  const siteUrl = getSiteUrl();
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "description": description,
    "provider": {
      "@type": "LocalBusiness",
      "@id": `${siteUrl}/#localbusiness`,
      "name": provider
    },
    "serviceType": serviceType,
    "areaServed": areaServed.map(area => ({
      "@type": "City",
      "name": area
    })),
    "category": "Electronics Repair",
    "hasOfferCatalog": hasOfferCatalog && {
      "@type": "OfferCatalog",
      "name": hasOfferCatalog.name,
      "description": hasOfferCatalog.description,
      "itemListElement": hasOfferCatalog.offers.map(offer => ({
        "@type": "Offer",
        "name": offer.name,
        "description": offer.description,
        "priceCurrency": offer.priceCurrency,
        "price": offer.price,
        "priceRange": offer.priceRange,
        "availability": "https://schema.org/InStock",
        "validFrom": new Date().toISOString().split('T')[0]
      }))
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Doorstep Service",
        "value": doorstepService ? "Available" : "Not Available"
      },
      {
        "@type": "PropertyValue", 
        "name": "Warranty",
        "value": warranty
      },
      {
        "@type": "PropertyValue",
        "name": "Same Day Service",
        "value": "Available"
      }
    ]
  };

  if (!validateStructuredData(schema)) {
    console.warn('Service schema validation failed');
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
}

/**
 * FAQ Schema Component
 */
export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  if (!validateStructuredData(schema)) {
    console.warn('FAQ schema validation failed');
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
}

/**
 * Review Schema Component
 */
export function ReviewSchema({ reviews, aggregateRating }: ReviewSchemaProps) {
  const siteUrl = getSiteUrl();
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    "name": "The Travelling Technicians",
    "review": reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5,
        "worstRating": 1
      },
      "reviewBody": review.reviewBody,
      "datePublished": review.datePublished || new Date().toISOString().split('T')[0],
      ...(review.location && {
        "locationCreated": {
          "@type": "Place",
          "name": review.location
        }
      })
    })),
    ...(aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": aggregateRating.ratingValue,
        "reviewCount": aggregateRating.reviewCount,
        "bestRating": aggregateRating.bestRating || 5,
        "worstRating": aggregateRating.worstRating || 1
      }
    })
  };

  if (!validateStructuredData(schema)) {
    console.warn('Review schema validation failed');
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
}

/**
 * Article Schema Component (for blog posts)
 */
export function ArticleSchema({
  headline,
  description,
  author,
  datePublished,
  dateModified,
  image,
  url,
  category,
  tags = []
}: ArticleSchemaProps) {
  const siteUrl = getSiteUrl();
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "description": description,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      "name": "The Travelling Technicians",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/images/logo/logo-orange-optimized.webp`,
        "width": 300,
        "height": 60
      }
    },
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "url": url,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    ...(image && {
      "image": {
        "@type": "ImageObject",
        "url": image,
        "width": 1200,
        "height": 630
      }
    }),
    ...(category && { "articleSection": category }),
    ...(tags.length > 0 && { "keywords": tags.join(", ") }),
    "inLanguage": "en-CA"
  };

  if (!validateStructuredData(schema)) {
    console.warn('Article schema validation failed');
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
}

/**
 * Organization Schema Component
 */
export interface OrganizationSchemaProps {
  telephone?: string;
}

export function OrganizationSchema({ telephone }: OrganizationSchemaProps = {}) {
  const siteUrl = getSiteUrl();
  
  // If telephone is not provided, it should be passed from server-side props
  if (!telephone) {
    console.warn('OrganizationSchema: telephone prop is required');
    return null;
  }
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    "name": "The Travelling Technicians",
    "url": siteUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${siteUrl}/images/logo/logo-orange-optimized.webp`,
      "width": 300,
      "height": 60
    },
    "description": "Professional mobile phone, laptop, and tablet repair services with doorstep service across Vancouver, Burnaby, Surrey, Richmond, and the Lower Mainland, BC",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": telephone,
      "contactType": "customer service",
      "areaServed": "CA-BC",
      "availableLanguage": ["en", "fr"],
      "hoursAvailable": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "20:00"
      }
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Vancouver",
      "addressRegion": "BC",
      "addressCountry": "CA"
    },
    "sameAs": [
      "https://www.facebook.com/travellingtechnicians",
      "https://www.instagram.com/travellingtechnicians",
      "https://www.linkedin.com/company/travelling-technicians"
    ],
    "founder": {
      "@type": "Person",
      "name": "The Travelling Technicians Team"
    },
    "foundingDate": "2020",
    "numberOfEmployees": "5-10",
    "slogan": "Expert Repair, Right to Your Door"
  };

  if (!validateStructuredData(schema)) {
    console.warn('Organization schema validation failed');
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
}

/**
 * Main StructuredData component that conditionally renders schemas
 */
export interface StructuredDataProps {
  pageType: 'homepage' | 'service' | 'faq' | 'blog' | 'contact' | 'about' | 'location';
  pageData?: any;
  includeLocalBusiness?: boolean;
  includeOrganization?: boolean;
  telephone?: string;
}

export default function StructuredData({ 
  pageType, 
  pageData = {}, 
  includeLocalBusiness = false,
  includeOrganization = false,
  telephone
}: StructuredDataProps) {
  return (
    <>
      {/* Always include Organization schema */}
      {includeOrganization && <OrganizationSchema telephone={telephone} />}
      
      {/* Conditionally include LocalBusiness schema */}
      {includeLocalBusiness && (
        <LocalBusinessSchema telephone={telephone} {...pageData.localBusiness} />
      )}
      
      {/* Page-specific schemas */}
      {pageType === 'homepage' && (
        <>
          <LocalBusinessSchema telephone={telephone} {...pageData.localBusiness} />
          <OrganizationSchema telephone={telephone} />
        </>
      )}
      
      {pageType === 'service' && pageData.service && (
        <>
          <ServiceSchema {...pageData.service} />
          <LocalBusinessSchema telephone={telephone} {...pageData.localBusiness} />
        </>
      )}
      
      {pageType === 'faq' && pageData.faqs && (
        <FAQSchema faqs={pageData.faqs} />
      )}
      
      {pageType === 'blog' && pageData.article && (
        <ArticleSchema {...pageData.article} />
      )}
      
      {pageData.reviews && (
        <ReviewSchema 
          reviews={pageData.reviews} 
          aggregateRating={pageData.aggregateRating} 
        />
      )}
    </>
  );
}
