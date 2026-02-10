import React from 'react';
import { getSiteUrl } from '@/utils/supabaseClient';
import { validateStructuredData } from '@/utils/structuredDataValidation';

export interface CityLocalBusinessSchemaProps {
  cityName: string;
  description: string;
  latitude: number;
  longitude: number;
  telephone?: string;
  email?: string;
  neighborhoods?: string[];
  openingHours?: {
    weekday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  serviceSince?: string;
  url?: string;
  priceRange?: string;
}

/**
 * CityLocalBusinessSchema Component
 * Enhanced version of LocalBusinessSchema with city-specific data
 * Implements 2026 Openness Signal with different hours per city
 * Critical for Local Pack ranking and Map Pack visibility
 */
export function CityLocalBusinessSchema({
  cityName,
  description,
  latitude,
  longitude,
  telephone = "+1-778-389-9251",
  email = "info@travellingtechnicians.ca",
  neighborhoods = [],
  openingHours,
  serviceSince,
  url,
  priceRange = "$79-$299"
}: CityLocalBusinessSchemaProps) {
  const siteUrl = getSiteUrl();
  // Use /repair path for consolidated routing (Best of Both Worlds migration)
  const businessUrl = url || `${siteUrl}/repair/${cityName.toLowerCase().replace(/\s+/g, '-')}`;

  // Convert opening hours to specification format
  const openingHoursSpec = [];

  if (openingHours?.weekday) {
    openingHoursSpec.push({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": openingHours.weekday.open,
      "closes": openingHours.weekday.close
    });
  }

  if (openingHours?.saturday) {
    openingHoursSpec.push({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": openingHours.saturday.open,
      "closes": openingHours.saturday.close
    });
  }

  if (openingHours?.sunday) {
    openingHoursSpec.push({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Sunday",
      "opens": openingHours.sunday.open,
      "closes": openingHours.sunday.close
    });
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${businessUrl}/#localbusiness`,
    "name": `The Travelling Technicians - ${cityName}`,
    "description": description,
    "url": businessUrl,
    "telephone": telephone,
    "email": email,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": cityName,
      "addressRegion": "BC",
      "addressCountry": "CA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": Number(latitude),
      "longitude": Number(longitude)
    },
    ...(openingHoursSpec.length > 0 && {
      "openingHoursSpecification": openingHoursSpec
    }),
    "areaServed": [
      {
        "@type": "City",
        "name": cityName
      },
      ...(neighborhoods.length > 0 ? neighborhoods.map(neighborhood => ({
        "@type": "Place",
        "name": neighborhood
      })) : [])
    ],
    "priceRange": priceRange,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `Repair Services in ${cityName}`,
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Mobile Phone Repair",
          "description": "iPhone, Samsung, and Android repair services with doorstep delivery"
        },
        {
          "@type": "OfferCatalog",
          "name": "Laptop Repair",
          "description": "MacBook, Windows laptop, and computer repair services"
        },
        {
          "@type": "OfferCatalog",
          "name": "Tablet Repair",
          "description": "iPad and Android tablet repair services"
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
      "https://www.linkedin.com/company/the-travelling-technicians"
    ],
    "paymentAccepted": "Cash, Credit Card, Debit Card, E-transfer",
    "currenciesAccepted": "CAD",
    ...(serviceSince && { "foundingDate": serviceSince }),
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Doorstep Service",
        "value": "Available"
      },
      {
        "@type": "PropertyValue",
        "name": "Warranty",
        "value": "90 days"
      },
      {
        "@type": "PropertyValue",
        "name": "Same Day Service",
        "value": "Available"
      }
    ]
  };

  if (!validateStructuredData(schema)) {
    console.warn('CityLocalBusinessSchema validation failed for:', cityName);
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
