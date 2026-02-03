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
  route_type: 'model-service-page' | 'city-service-page' | 'city-page' | 'city-model-page';
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

  // Generate enhanced Product/Service JSON-LD with dynamic pricing
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
  }), [pricing, city.name, operatingHoursString, service.display_name, model.display_name, brand.display_name, service.is_doorstep_eligible, schemaPhone]);

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
  const metaDescription = `Get professional ${service.display_name} for your ${model.display_name} in ${city.name}. Doorstep repair service with ${pricing.warrantyRange} warranty. Book online now!`;

  return (
    <>
      <Head>
        <title>{model.display_name} {service.display_name} in {city.name} | The Travelling Technicians</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={`${model.display_name} repair, ${service.display_name}, ${city.name}, doorstep repair, ${brand.display_name}`} />
        <meta property="og:title" content={`${model.display_name} ${service.display_name} in ${city.name}`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={fullUrl} />
        <link rel="canonical" href={fullUrl} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      </Head>

      <Header />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb Navigation */}
        <nav className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/repair" className="text-blue-600 hover:text-blue-800">Repair</Link>
              <span className="text-gray-400">/</span>
              <Link href={`/repair/${city.slug}`} className="text-blue-600 hover:text-blue-800">{city.name}</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600 font-medium">{model.display_name} {service.display_name}</span>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{model.display_name} {service.display_name} in {city.name}</h1>
              <p className="text-lg text-gray-600 mb-6">Professional doorstep repair service for your {brand.display_name} {model.display_name}</p>
              
              {/* Service Badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  ✓ Doorstep Service Available
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  ⏱️ {pricing.serviceTime} Minute Repair
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  🛡️ {pricing.warrantyRange} Warranty
                </span>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Pricing</h2>
                  <div className="space-y-2">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900">${pricing.basePrice}</span>
                      {pricing.savings > 0 && (
                        <>
                          <span className="ml-2 text-xl line-through text-gray-500">${pricing.compareAtPrice}</span>
                          <span className="ml-2 px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded">SAVE ${pricing.savings}</span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-600">Price range: {pricing.priceRange} • Warranty: {pricing.warrantyRange}</p>
                  </div>
                </div>
                
                <button onClick={handleBookNow} className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300">
                  Book Now
                </button>
              </div>
            </div>

            {/* Service Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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
                    <span className="text-gray-700">{pricing.warrantyRange} warranty on repairs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">Same-day service available in {city.name}</span>
                  </li>
                </ul>
              </div>

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
              <h3 className="text-xl font-bold text-gray-900 mb-4">{service.display_name} Service in {city.name}</h3>
              <div className="text-gray-700 space-y-4">
                <p>Looking for reliable {service.display_name} for your {model.display_name} in {city.name}? Our doorstep repair service brings professional technicians directly to your location, saving you time and hassle.</p>
                <p>We specialize in {brand.display_name} {type.name} repairs and use only high-quality replacement parts backed by our {pricing.warrantyRange} warranty. Our technicians are trained to handle {model.display_name} devices with care and precision.</p>
                <p>Serving {city.name} and surrounding areas, we offer convenient appointment times and transparent pricing. Book online today for fast, professional repair service at your doorstep.</p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white mb-8">
              <h2 className="text-3xl font-bold mb-4">Ready to Repair Your {model.display_name}?</h2>
              <p className="text-xl mb-6 opacity-90">Book our doorstep service in {city.name} today!</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={handleBookNow} className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition duration-300">
                  Book Online Now
                </button>
                <a href={formatPhoneNumberForHref(cleanPhone)} className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300">
                  Call {formatPhoneNumberForDisplay(cleanPhone)}
                </a>
              </div>
              <p className="mt-4 text-sm opacity-80">Same-day appointments available • Free diagnosis • {pricing.warrantyRange} warranty</p>
            </div>

            {/* Disclaimer */}
            <div className="text-center text-sm text-gray-500 bg-white p-6 rounded-lg">
              <p>The Travelling Technicians is an independent service provider. We are not affiliated with, authorized by, or endorsed by Apple Inc., Samsung Electronics Co., Ltd., or Google LLC. All trademarks are the property of their respective owners.</p>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
