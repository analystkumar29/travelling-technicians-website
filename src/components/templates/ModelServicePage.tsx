/**
 * MODEL SERVICE PAGE TEMPLATE
 * 
 * Renders dynamic pages for:
 * /repair/[city]/[service]/[model]
 * 
 * Features:
 * - Schema.org BreadcrumbList for Google Rich Results
 * - Local SEO optimization with city-specific content
 * - Dynamic pricing display with enhanced Schema.org
 * - Booking CTA integration
 */

import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getSiteUrl } from '@/utils/supabaseClient';
import Link from 'next/link';
import { formatPhoneNumberForDisplay, formatPhoneNumberForHref } from '@/utils/phone-formatter';

// Types
interface RouteData {
  slug_path: string;
  route_type: 'model-service-page' | 'city-service-page' | 'city-page';
  city_id: string;
  service_id: string;
  model_id: string;
  payload: {
    city: {
      id: string;
      name: string;
      slug: string;
      local_content?: string;
      local_phone?: string;
      local_email?: string;
      operating_hours?: string;
    };
    service: {
      id: string;
      name: string;
      slug: string;
      description?: string;
      display_name: string;
      estimated_duration_minutes?: number;
      is_doorstep_eligible: boolean;
    };
    model: {
      id: string;
      name: string;
      slug: string;
      display_name: string;
      release_year?: number;
      popularity_score?: number;
    };
    type: {
      id: string;
      name: string;
      slug: string;
    };
    brand: {
      id: string;
      name: string;
      slug: string;
      display_name: string;
    };
    pricing?: {
      base_price: number;
      compare_at_price?: number;
      part_quality?: string;
      pricing_tier?: string;
      part_warranty_months?: number;
    };
    standard_pricing?: {
      base_price: number;
      compare_at_price: number;
      pricing_tier: string;
      part_quality: string;
      part_warranty_months: number;
      display_warranty_days?: number;
    };
    premium_pricing?: {
      base_price: number;
      compare_at_price: number;
      pricing_tier: string;
      part_quality: string;
      part_warranty_months: number;
      display_warranty_days?: number;
    };
  };
}

interface ModelServicePageProps {
  routeData: RouteData;
}

export default function ModelServicePage({ routeData }: ModelServicePageProps) {
  const router = useRouter();
  const siteUrl = getSiteUrl();
  const [loading, setLoading] = useState(false);

  // Extract data from route payload
  const { city, service, model, type, brand, pricing: payloadPricing } = routeData.payload;
  const fullUrl = `${siteUrl}/${routeData.slug_path}`;

  // Get formatted phone for schema and display
  const schemaPhone = city.local_phone || '+16048495329';

  // Use pricing from payload - includes standard and premium tier data
  // Standard tier shows as "discounted" with psychological pricing
  // Premium tier shown as upgrade option
  const standardPricing = (routeData.payload.standard_pricing || {}) as any;
  const premiumPricing = (routeData.payload.premium_pricing || {}) as any;
  
  const hasStandardPricing = standardPricing && Object.keys(standardPricing).length > 0;
  
  const pricing = hasStandardPricing ? {
    // Psychological pricing: compare_at_price is the anchor, base_price is the "discounted" price shown to user
    compareAtPrice: standardPricing.compare_at_price || 194,
    basePrice: standardPricing.base_price || 164, // This is the actual price shown prominently
    premiumPrice: premiumPricing.base_price || 205,
    savings: (standardPricing.compare_at_price || 194) - (standardPricing.base_price || 164),
    priceRange: `$${standardPricing.base_price || 164}-$${premiumPricing.base_price || 205}`,
    warrantyDays: standardPricing.display_warranty_days || (standardPricing.part_warranty_months * 30) || 90,
    serviceTime: service.estimated_duration_minutes || 45
  } : {
    compareAtPrice: 194,
    basePrice: 164, // Changed from discountedPrice to basePrice for consistency
    premiumPrice: 205,
    savings: 30,
    priceRange: '$164-$205',
    warrantyDays: 90,
    serviceTime: 45
  };
  
  // Generate Schema.org BreadcrumbList JSON-LD
  const breadcrumbLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Repair Services",
        "item": `${siteUrl}/repair`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": `${city.name} Repair`,
        "item": `${siteUrl}/repair/${city.slug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${model.display_name} ${service.display_name}`,
        "item": fullUrl
      }
    ]
  }), [siteUrl, city.name, city.slug, model.display_name, service.display_name, fullUrl]);

  // Generate enhanced Product/Service JSON-LD with dynamic pricing
  // Uses useMemo to recalculate when pricing changes, ensuring Google sees accurate pricing
  const serviceLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${model.display_name} ${service.display_name} in ${city.name}`,
    "description": `Professional ${service.display_name} for ${model.display_name} devices in ${city.name}. Doorstep repair service available.`,
    "provider": {
      "@type": "LocalBusiness",
      "name": "The Travelling Technicians",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": city.name,
        "addressRegion": "BC",
        "addressCountry": "CA"
      },
      "telephone": schemaPhone,
      "openingHours": city.operating_hours || "Mo-Fr 09:00-18:00, Sa 10:00-16:00"
    },
    "areaServed": {
      "@type": "City",
      "name": city.name
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "CAD",
      "price": pricing?.basePrice || 129,
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": pricing?.basePrice || 129,
        "priceCurrency": "CAD",
        "valueAddedTaxIncluded": true
      },
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString().split('T')[0]
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "serviceType",
        "value": service.display_name
      },
      {
        "@type": "PropertyValue",
        "name": "deviceModel",
        "value": model.display_name
      },
      {
        "@type": "PropertyValue",
        "name": "deviceBrand",
        "value": brand.display_name
      },
      {
        "@type": "PropertyValue",
        "name": "doorstepService",
        "value": service.is_doorstep_eligible ? "Yes" : "No"
      },
      {
        "@type": "PropertyValue",
        "name": "warranty",
        "value": "1 year"
      },
      {
        "@type": "PropertyValue",
        "name": "estimatedDuration",
        "value": `${service.estimated_duration_minutes || 45} minutes`
      },
      {
        "@type": "PropertyValue",
        "name": "serviceArea",
        "value": city.name
      }
    ]
  }), [pricing?.basePrice, city.name, city.operating_hours, service.display_name, model.display_name, brand.display_name, service.is_doorstep_eligible, service.estimated_duration_minutes, schemaPhone]);

  // Pricing is now loaded from payload at build time
  // No client-side API call needed - improves performance and avoids service name mismatches

  // Handle booking CTA
  const handleBookNow = () => {
    router.push({
      pathname: '/book-online',
      query: {
        city: city.slug,
        service: service.slug,
        model: model.slug,
        deviceType: type.slug,
        brand: brand.slug
      }
    });
  };

  // Generate meta description
  const metaDescription = `Get professional ${service.display_name} for your ${model.display_name} in ${city.name}. Doorstep repair service with 1-year warranty. Book online now!`;

  return (
    <>
      <Head>
        {/* Only Schema.org JSON-LD here; parent (UniversalRepairPage) handles title, meta description, OG tags */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb Navigation */}
        <nav className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/repair" className="text-blue-600 hover:text-blue-800">
                Repair
              </Link>
              <span className="text-gray-400">/</span>
              <Link href={`/repair/${city.slug}`} className="text-blue-600 hover:text-blue-800">
                {city.name}
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600 font-medium">
                {model.display_name} {service.display_name}
              </span>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {model.display_name} {service.display_name} in {city.name}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Professional doorstep repair service for your {brand.display_name} {model.display_name}
              </p>
              
              {/* Service Badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  ✓ Doorstep Service Available
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  ⏱️ {service.estimated_duration_minutes || 45} Minute Repair
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  🛡️ 1-Year Warranty
                </span>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Pricing</h2>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-gray-600">Loading pricing...</span>
                    </div>
                  ) : pricing ? (
                    <div className="space-y-2">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">
                          ${pricing.basePrice}
                        </span>
                        {pricing.compareAtPrice && pricing.compareAtPrice > pricing.basePrice && (
                          <>
                            <span className="ml-2 text-xl line-through text-gray-500">
                              ${pricing.compareAtPrice}
                            </span>
                            <span className="ml-2 px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded">
                              SAVE ${pricing.savings}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-gray-600">
                        Price range: {pricing.priceRange}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-600">Starting from $129</p>
                  )}
                </div>
                
                <button
                  onClick={handleBookNow}
                  disabled={loading}
                  className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Book Now'}
                </button>
              </div>
            </div>

            {/* Service Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Service Information */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Service Details</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{service.display_name} for {model.display_name}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Professional technician comes to your location</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">High-quality replacement parts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">1-year warranty on all repairs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Same-day service available in {city.name}</span>
                  </li>
                </ul>
              </div>

              {/* Device Information */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Device Information</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700">Device</h4>
                    <p className="text-gray-900 font-semibold">{model.display_name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Brand</h4>
                    <p className="text-gray-900 font-semibold">{brand.display_name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Type</h4>
                    <p className="text-gray-900 font-semibold capitalize">{type.name}</p>
                  </div>
                  {model.release_year && (
                    <div>
                      <h4 className="font-medium text-gray-700">Release Year</h4>
                      <p className="text-gray-900 font-semibold">{model.release_year}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Local Content */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {service.display_name} Service in {city.name}
              </h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4">
                  Looking for reliable {service.display_name} for your {model.display_name} in {city.name}?
                  Our doorstep repair service brings professional technicians directly to your location,
                  saving you time and hassle.
                </p>
                <p className="text-gray-700 mb-4">
                  We specialize in {brand.display_name} {type.name} repairs and use only high-quality
                  replacement parts backed by our 1-year warranty. Our technicians are trained to handle
                  {model.display_name} devices with care and precision.
                </p>
                <p className="text-gray-700">
                  Serving {city.name} and surrounding areas, we offer convenient appointment times
                  and transparent pricing. Book online today for fast, professional repair service
                  at your doorstep.
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Repair Your {model.display_name}?</h2>
              <p className="text-xl mb-6 opacity-90">
                Book our doorstep service in {city.name} today!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={handleBookNow}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition duration-300"
                >
                  Book Online Now
                </button>
                <a
                  href={formatPhoneNumberForHref(city.local_phone || '+16048495329')}
                  className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                >
                  Call {formatPhoneNumberForDisplay(city.local_phone || '+16048495329')}
                </a>
              </div>
              <p className="mt-4 text-sm opacity-80">
                Same-day appointments available • Free diagnosis • 1-year warranty
              </p>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 text-center textext-sm text-gray-500">
              <p>
                The Travelling Technicians is an independent service provider. We are not affiliated with,
                authorized by, or endorsed by Apple Inc., Samsung Electronics Co., Ltd., or Google LLC.
                All trademarks are the property of their respective owners. We provide out-of-warranty
                hardware repairs only.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
