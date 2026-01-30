# Phase 8: Neighborhood Subpages - Proof-of-Life Implementation Guide

## Overview
Create 31 dedicated neighborhood subpages with "Proof-of-Life" content strategy to beat Google's SGE and establish real-world behavioral presence signals.

**Scope**: 31 neighborhoods across 6 cities (Vancouver: 8, Burnaby: 6, Coquitlam: 5, Richmond: 5, North Vancouver: 5, Surrey: 8)

---

## Table of Contents
1. [Strategy & Concept](#strategy--concept)
2. [Database Schema](#database-schema)
3. [Component Architecture](#component-architecture)
4. [Dynamic Page Implementation](#dynamic-page-implementation)
5. [Data Service Methods](#data-service-methods)
6. [Neighborhood Data Population](#neighborhood-data-population)
7. [Testing & Validation](#testing--validation)
8. [Deployment Steps](#deployment-steps)
9. [SEO Validation](#seo-validation)

---

## Strategy & Concept

### "Proof-of-Life" vs Generic Content
- **Generic**: "Yaletown is a neighborhood in Vancouver with high-rise condos"
- **Proof-of-Life**: "We repaired 42 iPhone screens in Yaletown last month. Our techs are frequently spotted near Roundhouse Community Centre between 10 AM–2 PM"

### Key Ranking Signals (2026)
1. **First-Party Data**: Real repair stats per neighborhood
2. **Behavioral Presence**: Landmark mentions with activity windows
3. **Device Specialization**: Clear focus on iPhone, Samsung, Google Pixel, MacBook screens
4. **Hybrid Testimonials**: Neighborhood-specific reviews first, city-wide fallback
5. **LocalBusiness Schema**: Business-centric signals over pure geo

### Expected SEO Impact
- ✅ 31 new indexed pages (long-tail keyword targeting)
- ✅ 40-60% increase in local search visibility
- ✅ Stronger topic authority with internal linking
- ✅ Neighborhood-level geo-targeting
- ✅ Organic traffic growth

---

## Database Schema

### `neighborhood_pages` Table
```sql
CREATE TABLE neighborhood_pages (
  id BIGSERIAL PRIMARY KEY,
  city_id UUID NOT NULL REFERENCES service_locations(id) ON DELETE CASCADE,
  neighborhood_name TEXT NOT NULL,
  slug TEXT NOT NULL,
  
  -- Geo-location
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Proof of Life: Monthly Repair Stats
  monthly_iphone_screens INT DEFAULT 0,
  monthly_samsung_screens INT DEFAULT 0,
  monthly_pixel_screens INT DEFAULT 0,
  monthly_macbook_screens INT DEFAULT 0,
  
  -- Local Landmark Presence
  landmark_name TEXT,
  landmark_description TEXT,
  landmark_activity_window TEXT, -- e.g., "10 AM - 2 PM"
  
  -- Content
  neighborhood_content TEXT,
  common_issues TEXT[], -- array of common issues specific to neighborhood
  postal_codes TEXT[], -- served postal code prefixes
  
  -- Testimonials: JSON structure for hybrid approach
  testimonials JSONB DEFAULT '{"primary": [], "fallback": []}',
  
  -- Metadata
  established_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(city_id, slug),
  CONSTRAINT neighborhood_name_not_empty CHECK (LENGTH(TRIM(neighborhood_name)) > 0)
);
```

### Migration File
Located at: `supabase/migrations/20260130110000_create_neighborhood_pages.sql`

---

## Component Architecture

### 1. NeighborhoodPageSchema.tsx
**Purpose**: LocalBusiness schema for neighborhood pages
**Location**: `src/components/seo/NeighborhoodPageSchema.tsx`

```tsx
import React from 'react';

interface NeighborhoodPageSchemaProps {
  neighborhoodName: string;
  cityName: string;
  description: string;
  latitude: number;
  longitude: number;
  telephone: string;
  url: string;
  openingHours?: {
    weekday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
  areaServed: string[];
  monthlyRepairStats?: {
    iphoneScreens: number;
    samsungScreens: number;
    pixelScreens: number;
    macbookScreens: number;
  };
}

export const NeighborhoodPageSchema: React.FC<NeighborhoodPageSchemaProps> = ({
  neighborhoodName,
  cityName,
  description,
  latitude,
  longitude,
  telephone,
  url,
  openingHours,
  areaServed,
  monthlyRepairStats
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `The Travelling Technicians - ${neighborhoodName}`,
    description,
    url,
    telephone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: `${neighborhoodName}, ${cityName}`,
      addressRegion: 'BC',
      addressCountry: 'CA'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude,
      longitude
    },
    areaServed: areaServed.map(area => ({
      '@type': 'City',
      name: area
    })),
    openingHoursSpecification: openingHours ? [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: openingHours.weekday?.open || '08:00',
        closes: openingHours.weekday?.close || '20:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: openingHours.saturday?.open || '09:00',
        closes: openingHours.saturday?.close || '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday'],
        opens: openingHours.sunday?.open || '10:00',
        closes: openingHours.sunday?.close || '17:00'
      }
    ] : undefined,
    ...(monthlyRepairStats && {
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'Monthly Repair Statistics',
        value: JSON.stringify(monthlyRepairStats)
      }
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
```

### 2. NeighborhoodProofOfLife.tsx
**Purpose**: Display monthly repair stats and landmark presence
**Location**: `src/components/seo/NeighborhoodProofOfLife.tsx`

```tsx
'use client';

import React from 'react';
import { FaMobileAlt, FaLaptop, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

interface NeighborhoodProofOfLifeProps {
  monthlyStats: {
    iphoneScreens: number;
    samsungScreens: number;
    pixelScreens: number;
    macbookScreens: number;
  };
  landmark?: {
    name: string;
    description: string;
    activityWindow: string;
  };
  cityName: string;
  neighborhoodName: string;
}

export const NeighborhoodProofOfLife: React.FC<NeighborhoodProofOfLifeProps> = ({
  monthlyStats,
  landmark,
  cityName,
  neighborhoodName
}) => {
  const totalRepairs = monthlyStats.iphoneScreens + monthlyStats.samsungScreens + 
                       monthlyStats.pixelScreens + monthlyStats.macbookScreens;

  return (
    <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 mb-8">
      <h3 className="text-2xl font-bold mb-4 text-primary-800">
        Proof of Life in {neighborhoodName}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Repair Stats */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-bold mb-3 text-lg flex items-center">
            <FaMobileAlt className="mr-2 text-accent-500" />
            Monthly Repair Statistics
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">iPhone Screens:</span>
              <span className="font-bold text-primary-700">{monthlyStats.iphoneScreens}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Samsung Screens:</span>
              <span className="font-bold text-primary-700">{monthlyStats.samsungScreens}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Google Pixel Screens:</span>
              <span className="font-bold text-primary-700">{monthlyStats.pixelScreens}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">MacBook Screens:</span>
              <span className="font-bold text-primary-700">{monthlyStats.macbookScreens}</span>
            </div>
            <div className="pt-2 border-t mt-2">
              <div className="flex justify-between font-bold">
                <span>Total Repairs This Month:</span>
                <span className="text-accent-600">{totalRepairs}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Landmark Presence */}
        {landmark && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-bold mb-3 text-lg flex items-center">
              <FaMapMarkerAlt className="mr-2 text-accent-500" />
              Local Presence
            </h4>
            <div className="space-y-3">
              <div>
                <div className="font-medium text-gray-700">{landmark.name}</div>
                <p className="text-sm text-gray-600 mt-1">{landmark.description}</p>
              </div>
              <div className="flex items-center text-sm">
                <FaClock className="mr-2 text-gray-500" />
                <span className="text-gray-700">Frequently spotted: </span>
                <span className="ml-1 font-medium">{landmark.activityWindow}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Real-world behavioral signal for Google ranking
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>These real statistics and local presence markers provide "Proof of Life" signals that 
        Google's SGE (Search Generative Experience) cannot replicate, establishing authentic 
        neighborhood authority.</p>
      </div>
    </div>
  );
};
```

### 3. NeighborhoodTestimonials.tsx
**Purpose**: Hybrid testimonial system (neighborhood-specific first, city-wide fallback)
**Location**: `src/components/seo/NeighborhoodTestimonials.tsx`

```tsx
'use client';

import React from 'react';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  device: string;
  neighborhood: string;
  isNeighborhoodSpecific: boolean;
}

interface NeighborhoodTestimonialsProps {
  testimonials: Testimonial[];
  neighborhoodName: string;
  cityName: string;
}

export const NeighborhoodTestimonials: React.FC<NeighborhoodTestimonialsProps> = ({
  testimonials,
  neighborhoodName,
  cityName
}) => {
  // Separate neighborhood-specific and city-wide testimonials
  const neighborhoodSpecific = testimonials.filter(t => t.isNeighborhoodSpecific);
  const cityWide = testimonials.filter(t => !t.isNeighborhoodSpecific);
  
  // Display logic: neighborhood-specific first, then city-wide
  const displayTestimonials = [
    ...neighborhoodSpecific,
    ...cityWide.slice(0, 3 - neighborhoodSpecific.length) // Max 3 total
  ];

  if (displayTestimonials.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-6">
        Customer Reviews in {neighborhoodName}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayTestimonials.map((testimonial, index) => (
          <div key={testimonial.id} className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center mb-3">
              <FaQuoteLeft className="text-primary-300 mr-2" />
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
            
            <div className="border-t pt-3">
              <div className="font-bold">{testimonial.name}</div>
              <div className="text-sm text-gray-600">
                {testimonial.device} • {testimonial.location}
              </div>
              {testimonial.isNeighborhoodSpecific ? (
                <span className="inline-block mt-1 text-xs bg-accent-100 text-accent-800 px-2 py-1 rounded-full">
                  {neighborhoodName} Customer
                </span>
              ) : (
                <span className="inline-block mt-1 text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                  {cityName} Customer
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {neighborhoodSpecific.length === 0 && cityWide.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>Showing reviews from {cityName} customers. Be the first to leave a 
          {neighborhoodName}-specific review!</p>
        </div>
      )}
    </div>
  );
};
```

---

## Dynamic Page Implementation

### File: `src/pages/locations/[city]/[neighborhood].tsx`
**Route Pattern**: `/locations/vancouver/yaletown`, `/locations/burnaby/metrotown`

```tsx
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { FaPhone, FaClock, FaShieldAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { NeighborhoodPageSchema } from '@/components/seo/NeighborhoodPageSchema';
import { NeighborhoodProofOfLife } from '@/components/seo/NeighborhoodProofOfLife';
import { NeighborhoodTestimonials } from '@/components/seo/NeighborhoodTestimonials';
import { getNeighborhoodData, getAllNeighborhoodPaths } from '@/lib/data-service';
import { GetStaticPaths, GetStaticProps } from 'next';

interface NeighborhoodPageProps {
  neighborhoodData: {
    id: number;
    neighborhoodName: string;
    slug: string;
    cityName: string;
    citySlug: string;
    
    // Geo
    latitude: number;
    longitude: number;
    
    // Proof of Life
    monthlyStats: {
      iphoneScreens: number;
      samsungScreens: number;
      pixelScreens: number;
      macbookScreens: number;
    };
    
    landmark?: {
      name: string;
      description: string;
      activityWindow: string;
    };
    
    // Content
    neighborhoodContent: string;
    commonIssues: string[];
    postalCodes: string[];
    
    // Testimonials
    testimonials: Array<{
      id: number;
      name: string;
      location: string;
      rating: number;
      comment: string;
      device: string;
      neighborhood: string;
      isNeighborhoodSpecific: boolean;
    }>;
    
    // Metadata
    phoneNumber: string;
    establishedDate: string;
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const paths = await getAllNeighborhoodPaths();
    return {
      paths,
      fallback: 'blocking'
    };
  } catch (error) {
    console.error('Error in getStaticPaths for neighborhoods:', error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
};

export const getStaticProps: GetStaticProps<NeighborhoodPageProps> = async ({ params }) => {
  const citySlug = params?.city as string;
  const neighborhoodSlug = params?.neighborhood as string;
  
  try {
    const data = await getNeighborhoodData(citySlug, neighborhoodSlug);
    
    if (!data) {
      return {
        notFound: true
      };
    }
    
    return {
      props: {
        neighborhoodData: data
      },
      revalidate: 3600 // ISR: Revalidate every hour
    };
  } catch (error) {
    console.error(`Error fetching neighborhood ${neighborhoodSlug} in ${citySlug}:`, error);
    return {
      notFound: true
    };
  }
};

export default function NeighborhoodPage({ neighborhoodData }: NeighborhoodPageProps) {
  const {
    neighborhoodName,
    cityName,
    citySlug,
    latitude,
    longitude,
    monthlyStats,
    landmark,
    neighborhoodContent,
    commonIssues,
    testimonials,
    phoneNumber,
    establishedDate
  } = neighborhoodData;

  return (
    <>
      <Head>
        <title>{`${neighborhoodName} Phone & Laptop Repair | The Travelling Technicians`}</title>
        <meta 
          name="description" 
          content={`Professional doorstep repair in ${neighborhoodName}, ${cityName}. 
          iPhone, Samsung, Google Pixel & MacBook screen repairs with same-day service.`} 
        />
        
        {/* Neighborhood Schema */}
        <NeighborhoodPageSchema
