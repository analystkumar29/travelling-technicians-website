import React from 'react';
import { getSiteUrl } from '@/utils/supabaseClient';
import { validateStructuredData } from '@/utils/structuredDataValidation';

export interface PlaceSchemaProps {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion: string;
    postalCode?: string;
    addressCountry: string;
  };
  telephone?: string;
  url?: string;
  openingHours?: {
    weekday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  areaServed?: string[];
  image?: string;
}

/**
 * PlaceSchema Component
 * Implements schema.org/Place with geo-coordinates for Google Maps "near me" searches
 * Critical for Map Pack visibility in 2026 with proper geo-coordinates per city
 */
export function PlaceSchema({
  name,
  description,
  latitude,
  longitude,
  address,
  telephone,
  url,
  openingHours,
  areaServed = [],
  image
}: PlaceSchemaProps) {
  const siteUrl = getSiteUrl();
  const businessUrl = url || siteUrl;

  // Convert opening hours object to openingHoursSpecification format
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
    "@type": "Place",
    "@id": `${businessUrl}/#place`,
    "name": name,
    "description": description,
    "url": businessUrl,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": Number(latitude),
      "longitude": Number(longitude)
    },
    "address": {
      "@type": "PostalAddress",
      ...address
    },
    ...(telephone && { "telephone": telephone }),
    ...(openingHoursSpec.length > 0 && {
      "openingHoursSpecification": openingHoursSpec
    }),
    ...(image && {
      "image": {
        "@type": "ImageObject",
        "url": image
      }
    }),
    ...(areaServed.length > 0 && {
      "areaServed": areaServed.map(area => ({
        "@type": "City",
        "name": area
      }))
    })
  };

  if (!validateStructuredData(schema)) {
    console.warn('PlaceSchema validation failed for:', name);
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
