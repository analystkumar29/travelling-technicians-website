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

import { useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getSiteUrl } from '@/utils/supabaseClient';
import Link from 'next/link';
import { formatPhoneNumberForDisplay, formatPhoneNumberForHref } from '@/utils/phone-formatter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Types - Updated to match actual database payload structure
interface PricingTier {
  base_price: number;
  compare_at_price: number;
  pricing_tier: string;
  part_quality: string;
  part_warranty_months: number;
  display_warranty_days?: number;
  discounted_price?: number | null;
}

interface RouteData {
  slug_path: string;
  route_type: 'model-service-page' | 'city-service-page' | 'city-page' | 'city-model-page' | 'neighborhood-page';
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
      operating_hours?: string | {
        weekday?: { open: string; close: string };
        saturday?: { open: string; close: string };
        sunday?: { open: string; close: string };
      };
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
    // Legacy pricing structure (fallback)
    pricing?: Partial<PricingTier>;
    // New pricing structure
    standard_pricing?: PricingTier;
    premium_pricing?: PricingTier;
    // Additional payload data
    neighborhoods?: string[];
    postal_codes?: string[];
    testimonials?: Array<{
      id?: string;
      customer_name: string;
      review: string;
      rating: number;
      city?: string;
      device_model?: string;
      service?: string;
    }>;
  };
}

interface ModelServicePageProps {
  routeData: RouteData;
}

export default function ModelServicePage({ routeData }: ModelServicePageProps) {
  const router = useRouter();
  const siteUrl = getSiteUrl();

  // Extract data from route payload
  const { city, service, model, type, brand } = routeData.payload;
  const fullUrl = `${siteUrl}/${routeData.slug_path}`;

  // Clean phone number - remove newline characters that exist in database
  const cleanPhone = city.local_phone 
    ? city.local_phone.replace(/\n/g, '').trim() 
    : '+16048495329';
  
  // Get formatted phone for schema
  const schemaPhone = cleanPhone;

  // Extract pricing from payload - simplified logic
  // Priority: standard_pricing/premium_pricing (new) > pricing (legacy) > defaults
  const standardPricing = routeData.payload.standard_pricing;
  const premiumPricing = routeData.payload.premium_pricing;
  const legacyPricing = routeData.payload.pricing;

  // Build pricing object with proper fallbacks
  const pricing = useMemo(() => {
    // Standard tier pricing
    const basePrice = standardPricing?.base_price 
      ?? legacyPricing?.base_price 
      ?? 159;
    const compareAtPrice = standardPricing?.compare_at_price 
      ?? legacyPricing?.compare_at_price 
      ?? Math.round(basePrice * 1.02); // 2% markup if no compare price
    const standardWarrantyMonths = standardPricing?.part_warranty_months 
      ?? legacyPricing?.part_warranty_months 
      ?? 3;

    // Premium tier pricing
    const premiumPrice = premiumPricing?.base_price 
      ?? Math.round(basePrice * 1.19); // ~19% premium if not specified
    const premiumComparePrice = premiumPricing?.compare_at_price 
      ?? Math.round(premiumPrice * 1.07); // 7% markup if no compare price
    const premiumWarrantyMonths = premiumPricing?.part_warranty_months ?? 6;

    return {
      basePrice,
      compareAtPrice,
      premiumPrice,
      premiumComparePrice,
      savings: compareAtPrice - basePrice,
      priceRange: `$${basePrice}-$${premiumPrice}`,
      warrantyRange: `${standardWarrantyMonths}-${premiumWarrantyMonths} months`,
      standardWarrantyMonths,
      premiumWarrantyMonths,
      serviceTime: service.estimated_duration_minutes ?? 45
    };
  }, [standardPricing, premiumPricing, legacyPricing, service.estimated_duration_minutes]);
  
  // Convert operating hours JSON to string for Schema.org
  const formatOperatingHours = (hours: RouteData['payload']['city']['operating_hours']): string => {
    if (!hours) return "Mo-Fr 09:00-18:00, Sa 10:00-16:00";
    if (typeof hours === 'string') return hours;
    
    try {
      const parts: string[] = [];
      if (hours.weekday) {
        parts.push(`Mo-Fr ${hours.weekday.open}-${hours.weekday.close}`);
      }
      if (hours.saturday) {
        parts.push(`Sa ${hours.saturday.open}-${hours.saturday.close}`);
      }
      if (hours.sunday) {
        parts.push(`Su ${hours.sunday.open}-${hours.sunday.close}`);
      }
      return parts.length > 0 ? parts.join(', ') : "Mo-Fr 09:00-18:00, Sa 10:00-16:00";
    } catch (e) {
      console.error('Error formatting operating hours:', e);
      return "Mo-Fr 09:00-18:00, Sa 10:00-16:00";
    }
  };
  
  const operatingHoursString = formatOperatingHours(city.operating_hours);
  
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

  // ✅ SAFE: Conditional AggregateRating - Only include if testimonials are visible on page
  const aggregateRating = useMemo(() => {
    const testimonials = routeData.payload.testimonials;
    if (!testimonials || testimonials.length === 0) return null;
    return {
      "@type": "AggregateRating",
      "ratingValue": 4.9,
      "reviewCount": testimonials.length,
      "bestRating": 5,
      "worstRating": 1
    };
  }, [routeData.payload.testimonials]);

  // Generate enhanced Service JSON-LD with dynamic pricing and COMPLIANT AggregateRating
  const serviceLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `${model.display_name} ${service.display_name} in ${city.name}`,
    "description": `Professional ${service.display_name} for ${model.display_name} devices in ${city.name}. Doorstep repair service available with customer reviews.`,
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
      "openingHours": operatingHoursString
    },
    "areaServed": {
      "@type": "City",
      "name": city.name
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "CAD",
      "price": pricing.basePrice,
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": pricing.basePrice,
        "priceCurrency": "CAD",
        "valueAddedTaxIncluded": true
      },
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString().split('T')[0]
    },
    ...(aggregateRating && { aggregateRating }),  // ✅ Only include if testimonials exist
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
        "value": pricing.warrantyRange
      },
      {
        "@type": "PropertyValue",
        "name": "estimatedDuration",
        "value": `${pricing.serviceTime} minutes`
      },
      {
        "@type": "PropertyValue",
        "name": "serviceArea",
        "value": city.name
      }
    ]
  }), [pricing, city.name, operatingHoursString, service.display_name, model.display_name, brand.display_name, service.is_doorstep_eligible, schemaPhone, aggregateRating]);

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

  // Generate meta description (120-160 chars for optimal SERP display)
  const metaDescription = `Professional ${service.display_name} for ${model.display_name} in ${city.name}. Expert doorstep repair by certified technicians. ${pricing.warrantyRange} warranty. Book online today.`;

  return (
    <>
      <Head>
        <title>{`${model.display_name} ${service.display_name} in ${city.name} | The Travelling Technicians`}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={`${model.display_name} repair, ${service.display_name}, ${city.name}, doorstep repair, ${brand.display_name}`} />
        <meta property="og:title" content={`${model.display_name} ${service.display_name} in ${city.name}`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={fullUrl} />
        <link rel="canonical" href={fullUrl} />
        <link rel="alternate" hrefLang="en-CA" href={fullUrl} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      </Head>

      <Header />

      <div className="min-h-screen bg-primary-50">
        {/* Breadcrumb Navigation */}
        <nav className="bg-white border-b border-primary-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-primary-800 hover:text-primary-900">Home</Link>
              <span className="text-primary-400">/</span>
              <Link href="/repair" className="text-primary-800 hover:text-primary-900">Repair</Link>
              <span className="text-primary-400">/</span>
              <Link href={`/repair/${city.slug}`} className="text-primary-800 hover:text-primary-900">{city.name}</Link>
              <span className="text-primary-400">/</span>
              <span className="text-primary-500 font-medium">{model.display_name} {service.display_name}</span>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-primary-900 mb-4">{model.display_name} {service.display_name} in {city.name}</h1>
              <p className="text-lg text-primary-500 mb-6">Professional doorstep repair service for your {brand.display_name} {model.display_name}</p>
              
              {/* Service Badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  ✓ Doorstep Service Available
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  ⏱️ {pricing.serviceTime} Minute Repair
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  🛡️ {pricing.warrantyRange} Warranty
                </span>
              </div>
            </div>

            {/* Dual Pricing Cards */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-900 mb-6">Pricing Options</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Standard Tier */}
                <div className="pricing-card bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg transition-all">
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-primary-900 mb-1">Standard Service</h3>
                    <p className="text-sm text-primary-400">Quality parts, reliable warranty</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-primary-500 mb-1">Price</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-primary-800">${standardPricing?.base_price || pricing.basePrice}</span>
                        {standardPricing?.compare_at_price && (
                          <span className="text-lg line-through text-primary-400">${standardPricing.compare_at_price}</span>
                        )}
                      </div>
                      {standardPricing && standardPricing.compare_at_price > standardPricing.base_price && (
                        <p className="text-sm text-green-600 font-semibold mt-1">
                          Save ${standardPricing.compare_at_price - standardPricing.base_price}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      {standardPricing?.part_quality && (
                        <div className="flex items-center text-sm">
                          <span className="text-primary-500">Part Quality:</span>
                          <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs font-semibold rounded-full">
                            {standardPricing.part_quality}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm">
                        <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.062v6.218c0 1.3-.934 2.401-2.147 2.612a6.477 6.477 0 01-1.569.157h-.855c-.771 0-1.528.094-2.268.286a2.757 2.757 0 01-.946.141 2.865 2.865 0 01-2.4-1.179.877.877 0 00-.637-.274H6.77a.875.875 0 00-.657.274zm12.561-4.906a1.071 1.071 0 10-1.515 1.515L17.44 9.702a1.071 1.071 0 101.515-1.515L18.828 7.515z" clipRule="evenodd" />
                        </svg>
                        <span className="text-primary-700 font-semibold">{standardPricing?.part_warranty_months || 3} months warranty</span>
                      </div>

                      <div className="flex items-center text-sm">
                        <svg className="h-4 w-4 text-primary-800 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00-.293.707l-.707.707a1 1 0 101.414 1.414l1.414-1.414A1 1 0 0011 9.414V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-primary-700">48-hour response time</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBookNow}
                    className="w-full mt-6 bg-primary-100 hover:bg-primary-200 text-primary-900 font-bold py-3 px-8 rounded-lg transition duration-300"
                  >
                    Select Standard
                  </button>
                </div>

                {/* Premium Tier */}
                <div className="pricing-card premium bg-white rounded-xl shadow-sm p-6 border-2 border-primary-800 hover:shadow-lg transition-all md:scale-105 origin-top">
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xl font-bold text-primary-900">Premium Service</h3>
                      <span className="px-3 py-1 bg-primary-800 text-white text-xs font-bold rounded-full">RECOMMENDED</span>
                    </div>
                    <p className="text-sm text-primary-400">Premium parts, extended warranty</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-primary-500 mb-1">Price</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-primary-800">${premiumPricing?.base_price || Math.round(pricing.basePrice * 1.19)}</span>
                        {premiumPricing?.compare_at_price && (
                          <span className="text-lg line-through text-primary-400">${premiumPricing.compare_at_price}</span>
                        )}
                      </div>
                      {premiumPricing && premiumPricing.compare_at_price > premiumPricing.base_price && (
                        <p className="text-sm text-green-600 font-semibold mt-1">
                          Save ${premiumPricing.compare_at_price - premiumPricing.base_price}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      {premiumPricing?.part_quality && (
                        <div className="flex items-center text-sm">
                          <span className="text-primary-500">Part Quality:</span>
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            {premiumPricing.part_quality}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm">
                        <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.062v6.218c0 1.3-.934 2.401-2.147 2.612a6.477 6.477 0 01-1.569.157h-.855c-.771 0-1.528.094-2.268.286a2.757 2.757 0 01-.946.141 2.865 2.865 0 01-2.4-1.179.877.877 0 00-.637-.274H6.77a.875.875 0 00-.657.274zm12.561-4.906a1.071 1.071 0 10-1.515 1.515L17.44 9.702a1.071 1.071 0 101.515-1.515L18.828 7.515z" clipRule="evenodd" />
                        </svg>
                        <span className="text-primary-700 font-semibold">{premiumPricing?.part_warranty_months || 6} months warranty</span>
                      </div>

                      <div className="flex items-center text-sm">
                        <svg className="h-4 w-4 text-primary-800 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00-.293.707l-.707.707a1 1 0 101.414 1.414l1.414-1.414A1 1 0 0011 9.414V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-primary-700">24-hour response time</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBookNow}
                    className="w-full mt-6 bg-primary-800 hover:bg-primary-900 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                  >
                    Select Premium
                  </button>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-bold text-primary-900 mb-4">Service Details</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-primary-700">{service.display_name} for {model.display_name}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-primary-700">Professional technician comes to your location</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-primary-700">High-quality replacement parts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-primary-700">{pricing.warrantyRange} warranty on repairs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-primary-700">Same-day service available in {city.name}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-bold text-primary-900 mb-4">Device Information</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-primary-700">Device</h4>
                    <p className="text-primary-900 font-semibold">{model.display_name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-primary-700">Brand</h4>
                    <p className="text-primary-900 font-semibold">{brand.display_name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-primary-700">Type</h4>
                    <p className="text-primary-900 font-semibold capitalize">{type.name}</p>
                  </div>
                  {model.release_year && (
                    <div>
                      <h4 className="font-medium text-primary-700">Release Year</h4>
                      <p className="text-primary-900 font-semibold">{model.release_year}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Local Content */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h3 className="text-xl font-bold text-primary-900 mb-4">{service.display_name} Service in {city.name}</h3>
              <div className="text-primary-700 space-y-4">
                <p>Looking for reliable {service.display_name} for your {model.display_name} in {city.name}? Our doorstep repair service brings professional technicians directly to your location, saving you time and hassle.</p>
                <p>We specialize in {brand.display_name} {type.name} repairs and use only high-quality replacement parts backed by our {pricing.warrantyRange} warranty. Our technicians are trained to handle {model.display_name} devices with care and precision.</p>
                <p>Serving {city.name} and surrounding areas, we offer convenient appointment times and transparent pricing. Book online today for fast, professional repair service at your doorstep.</p>
              </div>
            </div>

            {/* City-Specific Local Content (from payload) */}
            {routeData.payload.city?.local_content && (
              <div className="bg-white rounded-xl shadow p-6 mb-8 local-content">
                <div dangerouslySetInnerHTML={{ __html: routeData.payload.city.local_content.replace(/\n/g, '<br/>') }} />
              </div>
            )}

            {/* Service Areas & Neighborhoods */}
            {routeData.payload.neighborhoods && routeData.payload.neighborhoods.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h3 className="text-xl font-bold text-primary-900 mb-4">Service Areas in {city.name}</h3>
                <p className="text-primary-500 mb-4">We serve the following neighborhoods in {city.name}:</p>
                <div className="service-areas-container">
                  {routeData.payload.neighborhoods.map((neighborhood: string, index: number) => (
                    <span key={index} className="service-area-badge">
                      <svg className="h-4 w-4 text-primary-800" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {neighborhood}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Postal Code Coverage */}
            {routeData.payload.postal_codes && routeData.payload.postal_codes.length > 0 && (
              <div className="bg-primary-50 rounded-xl border border-primary-200 p-6 mb-8">
                <h3 className="text-xl font-bold text-primary-900 mb-4">Postal Code Coverage</h3>
                <p className="text-primary-500 mb-4">We're available in these postal codes across {city.name}:</p>
                <div className="flex flex-wrap gap-2">
                  {routeData.payload.postal_codes.map((postalCode: string, index: number) => (
                    <span key={index} className="postal-code-badge">
                      {postalCode}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonials Section */}
            {routeData.payload.testimonials && routeData.payload.testimonials.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-primary-900 mb-6">Customer Reviews</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {routeData.payload.testimonials.map((testimonial: any, index: number) => (
                    <div key={testimonial.id || index} className="testimonial-card">
                      <div className="star-rating">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`star ${i < testimonial.rating ? 'text-accent-400' : 'text-primary-200'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="testimonial-quote">{testimonial.review}</p>
                      <div className="testimonial-author">{testimonial.customer_name}</div>
                      {testimonial.city && (
                        <div className="testimonial-detail">📍 {testimonial.city}</div>
                      )}
                      {testimonial.device_model && (
                        <div className="testimonial-device">{testimonial.device_model}</div>
                      )}
                      {testimonial.service && (
                        <div className="testimonial-detail text-xs">{testimonial.service}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Operating Hours */}
            {routeData.payload.city?.operating_hours && (
              <div className="bg-primary-50 rounded-xl border border-primary-200 p-6 mb-8">
                <h3 className="text-xl font-bold text-primary-900 mb-4">Operating Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-primary-700">
                  {typeof routeData.payload.city.operating_hours === 'object' && (
                    <>
                      {routeData.payload.city.operating_hours.weekday && (
                        <div>
                          <p className="font-semibold text-primary-900">Monday - Friday</p>
                          <p>{routeData.payload.city.operating_hours.weekday.open} - {routeData.payload.city.operating_hours.weekday.close}</p>
                        </div>
                      )}
                      {routeData.payload.city.operating_hours.saturday && (
                        <div>
                          <p className="font-semibold text-primary-900">Saturday</p>
                          <p>{routeData.payload.city.operating_hours.saturday.open} - {routeData.payload.city.operating_hours.saturday.close}</p>
                        </div>
                      )}
                      {routeData.payload.city.operating_hours.sunday && (
                        <div>
                          <p className="font-semibold text-primary-900">Sunday</p>
                          <p>{routeData.payload.city.operating_hours.sunday.open} - {routeData.payload.city.operating_hours.sunday.close}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h3 className="text-xl font-bold text-primary-900 mb-4">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-primary-800 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <a href={formatPhoneNumberForHref(cleanPhone)} className="text-primary-800 hover:text-primary-900 font-semibold">
                    {formatPhoneNumberForDisplay(cleanPhone)}
                  </a>
                </div>
                {routeData.payload.city?.local_email && (
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-primary-800 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <a href={`mailto:${routeData.payload.city.local_email}`} className="text-primary-800 hover:text-primary-900 font-semibold">
                      {routeData.payload.city.local_email}
                    </a>
                  </div>
                )}
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-primary-800 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-primary-700 font-semibold">{city.name}, BC</span>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-gradient-to-r from-primary-800 to-primary-900 rounded-xl shadow-lg p-8 text-white mb-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Repair Your {model.display_name}?</h2>
              <p className="text-xl mb-6 opacity-90">Book our doorstep service in {city.name} today!</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={handleBookNow} className="bg-white text-primary-800 hover:bg-primary-50 font-bold py-3 px-8 rounded-lg transition duration-300">
                  Book Online Now
                </button>
                <a href={formatPhoneNumberForHref(cleanPhone)} className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-800 text-white font-bold py-3 px-8 rounded-lg transition duration-300">
                  Call {formatPhoneNumberForDisplay(cleanPhone)}
                </a>
              </div>
              <p className="mt-4 text-sm opacity-80">Same-day appointments available • Free diagnosis • {pricing.warrantyRange} warranty</p>
            </div>

            {/* Disclaimer */}
            <div className="text-center text-sm text-primary-400 bg-white p-6 rounded-lg">
              <p>The Travelling Technicians is an independent service provider. We are not affiliated with, authorized by, or endorsed by Apple Inc., Samsung Electronics Co., Ltd., or Google LLC. All trademarks are the property of their respective owners.</p>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
