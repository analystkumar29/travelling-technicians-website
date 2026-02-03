/**
 * UNIVERSAL REPAIR ROUTE COMPONENT
 * 
 * This file handles ALL repair routes dynamically:
 * - /repair (root)
 * - /repair/[city]
 * - /repair/[city]/[service]
 * - /repair/[city]/[service]/[model]
 * 
 * Uses database-driven routing from the dynamic_routes table
 * with automatic regeneration via triggers.
 * 
 * Features:
 * - Schema.org Breadcrumbs for Google Rich Results
 * - Pre-computed JSON payloads for performance
 * - Automatic 404 handling for invalid routes
 * - SEO-optimized meta tags
 * - Database-driven dropdowns for RepairIndex
 */

console.log('🔍 [[...slug]].tsx FILE LOADED - TOP OF FILE');

import { GetStaticPaths, GetStaticProps } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { getSiteUrl } from '@/utils/supabaseClient';
import { formatPhoneNumberForDisplay, formatPhoneNumberForHref, DEFAULT_PHONE_NUMBER } from '@/utils/phone-formatter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Dynamic imports for code splitting (reduces initial bundle size)
const RepairIndex = dynamic(() => import('@/components/templates/RepairIndex'));
const ModelServicePage = dynamic(() => import('@/components/templates/ModelServicePage'));
const CityPage = dynamic(() => import('@/components/templates/CityPage'));

// Types for our route data
interface RouteData {
  slug_path: string;
  route_type: 'model-service-page' | 'city-service-page' | 'city-page' | 'city-model-page';
  city_id: string;
  service_id: string;
  model_id: string;
  payload: any; // Use any for now since payload structure varies by route_type
}

interface PageProps {
  routeType: 'REPAIR_INDEX' | 'MODEL_SERVICE_PAGE' | 'CITY_PAGE' | 'CITY_SERVICE_PAGE' | 'CITY_MODEL_PAGE';
  routeData?: RouteData;
  cities?: Array<{ slug: string; city_name: string }>;
  services?: Array<{ slug: string; name: string; display_name: string }>;
  error?: string;
}

// Simple NotFound component
function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
        <p className="text-gray-600">The requested repair page could not be found.</p>
        <button
          onClick={() => router.push('/repair')}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Repair Home
        </button>
      </div>
    </div>
  );
}

/**
 * Main page component that renders the appropriate template
 * based on route type
 */
export default function UniversalRepairPage({ routeType, routeData, cities, services, error }: PageProps) {
  const router = useRouter();
  const siteUrl = getSiteUrl();

  // Generate SEO meta tags for MODEL_SERVICE_PAGE at parent level
  // This is the "One Source of Truth" for all meta tags
  let metaTags = null;
  if (routeType === 'MODEL_SERVICE_PAGE' && routeData) {
    const { city, service, model, brand } = routeData.payload;
    const pageTitle = `${model.display_name} ${service.display_name} in ${city.name} | The Travelling Technicians`;
    const pageDesc = `Fast, professional ${service.name} for your ${brand.display_name} ${model.display_name} in ${city.name}. Doorstep service by expert technicians.`;
    const canonicalUrl = `${siteUrl}/${routeData.slug_path}`;

    metaTags = (
      <>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="keywords" content={`${model.display_name} repair, ${service.display_name}, ${city.name} mobile repair, doorstep repair, ${brand.display_name} repair`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        
        {/* Canonical URL - CRITICAL for SEO */}
        <link rel="canonical" href={canonicalUrl} />
      </>
    );
  }

  // Handle loading state
  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading repair information...</p>
        </div>
      </div>
    );
  }

  // Handle errors
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Page</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/repair')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Repair Home
          </button>
        </div>
      </div>
    );
  }

  // Render appropriate template based on route type
  switch (routeType) {
    case 'REPAIR_INDEX':
      return <RepairIndex cities={cities || []} services={services || []} models={[]} />;

    case 'MODEL_SERVICE_PAGE':
      if (!routeData) {
        return <NotFound />;
      }
      return <ModelServicePage routeData={routeData} />;

    case 'CITY_PAGE':
      // Render professional city page using database data
      if (!routeData) {
        return <NotFound />;
      }
      return <CityPage routeData={routeData} />;

    case 'CITY_MODEL_PAGE':
      // Render city-model page showing all services for a specific device model in a city
      // Example: /repair/vancouver/iphone-14 -> Shows all services for iPhone 14 in Vancouver
      if (!routeData) {
        return <NotFound />;
      }
      
      const { 
        city: cmpCity, 
        model: cmpModel, 
        available_services: cmpServices,
        local_phone: cmpPhone,
        local_email: cmpEmail
      } = routeData.payload;
      
      const cmpCityName = cmpCity?.name || 'Your City';
      const cmpModelName = cmpModel?.display_name || cmpModel?.name || 'Device';
      const cmpBrandName = cmpModel?.brand || 'Brand';
      const cmpDeviceType = cmpModel?.device_type || 'Device';
      
      // Format phone number
      const cmpPhoneRaw = cmpPhone || DEFAULT_PHONE_NUMBER;
      const cmpPhoneDisplay = formatPhoneNumberForDisplay(cmpPhoneRaw);
      const cmpPhoneHref = formatPhoneNumberForHref(cmpPhoneRaw);
      
      return (
        <>
          <Head>
            <title>{cmpModelName} Repair in {cmpCityName} | The Travelling Technicians</title>
            <meta name="description" content={`Professional ${cmpModelName} repair services in ${cmpCityName}. Screen replacement, battery replacement, and more. Doorstep service with 90-day warranty.`} />
            <meta name="keywords" content={`${cmpModelName} repair, ${cmpBrandName} repair, ${cmpCityName} phone repair, doorstep repair`} />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={`${siteUrl}/${routeData.slug_path}`} />
          </Head>
          
          {/* Navigation Header */}
          <Header />
          
          {/* Hero Section */}
          <section className="pt-8 pb-12 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
            <div className="container-custom">
              <div className="text-center max-w-4xl mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-primary-200">{cmpCityName}, BC</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  {cmpModelName} Repair<br />
                  <span className="text-2xl md:text-3xl">in {cmpCityName}</span>
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-primary-100">
                  Professional {cmpBrandName} {cmpDeviceType} repair at your doorstep
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Link 
                    href={`/book-online?city=${cmpCity?.slug}&model=${cmpModel?.slug}`} 
                    className="btn-accent text-lg px-8 py-4"
                  >
                    Book Repair Now
                  </Link>
                  <a 
                    href={cmpPhoneHref}
                    className="btn-outline border-white text-white hover:bg-primary-600 text-lg px-8 py-4 flex items-center justify-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {cmpPhoneDisplay}
                  </a>
                </div>
                
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    30-90 min service
                  </div>
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    90-Day Warranty
                  </div>
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    Certified Technicians
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Available Services Section */}
          <section className="py-16 bg-white">
            <div className="container-custom">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Available Services for {cmpModelName}</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Select a service to see pricing and book your doorstep repair in {cmpCityName}
                </p>
              </div>

              {cmpServices && cmpServices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cmpServices.map((service: { 
                    id: string; 
                    slug: string; 
                    display_name: string; 
                    description?: string; 
                    icon?: string;
                    pricing_available?: boolean;
                  }) => (
                    <Link 
                      key={service.id}
                      href={`/repair/${cmpCity?.slug}/${service.slug}/${cmpModel?.slug}`} 
                      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-3xl">
                          {service.icon || '🛠️'}
                        </div>
                        {service.pricing_available && (
                          <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Pricing Available
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-xl text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                        {service.display_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {service.description || `Professional ${service.display_name.toLowerCase()} for your ${cmpModelName}`}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary-500 font-bold">
                          {service.pricing_available ? 'View Pricing' : 'Get Quote'}
                        </span>
                        <svg className="h-5 w-5 text-primary-500 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-6">No services currently available for this device.</p>
                  <Link
                    href={`/book-online?city=${cmpCity?.slug}`}
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Contact us for a custom quote →
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Why Choose Us Section */}
          <section className="py-16 bg-gray-50">
            <div className="container-custom">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-center">
                  Why Choose The Travelling Technicians for {cmpModelName} Repair?
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl">
                    <div className="text-3xl mb-3">🏠</div>
                    <h3 className="font-bold text-lg mb-2">Doorstep Convenience</h3>
                    <p className="text-gray-600 text-sm">
                      No need to travel. We come to your location in {cmpCityName} with all necessary tools and parts.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl">
                    <div className="text-3xl mb-3">⚡</div>
                    <h3 className="font-bold text-lg mb-2">Fast Service</h3>
                    <p className="text-gray-600 text-sm">
                      Most {cmpModelName} repairs completed in 30-90 minutes on the same day.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl">
                    <div className="text-3xl mb-3">✅</div>
                    <h3 className="font-bold text-lg mb-2">90-Day Warranty</h3>
                    <p className="text-gray-600 text-sm">
                      All {cmpModelName} repairs come with a comprehensive 90-day warranty on parts and labor.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-xl">
                    <div className="text-3xl mb-3">🔧</div>
                    <h3 className="font-bold text-lg mb-2">Certified Technicians</h3>
                    <p className="text-gray-600 text-sm">
                      Our technicians are certified and experienced in {cmpBrandName} {cmpDeviceType} repairs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 bg-primary-50">
            <div className="container-custom text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Repair Your {cmpModelName}?
              </h2>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                Book your doorstep repair in {cmpCityName} today and get your device working like new.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/book-online?city=${cmpCity?.slug}&model=${cmpModel?.slug}`}
                  className="btn-accent text-lg px-8 py-4"
                >
                  Book Repair Now
                </Link>
                <a
                  href={cmpPhoneHref}
                  className="btn-outline border-primary-600 text-primary-600 hover:bg-primary-50 text-lg px-8 py-4"
                >
                  Call {cmpPhoneDisplay}
                </a>
              </div>
            </div>
          </section>
          
          {/* Footer */}
          <Footer />
        </>
      );

    case 'CITY_SERVICE_PAGE':
      // Render professional city-service page using database data
      if (!routeData) {
        // Fallback if no routeData (should not happen with proper database setup)
        const routerSlugCS = router.query.slug as string[];
        const citySlugCS = routerSlugCS?.[0] || 'your city';
        const serviceSlugCS = routerSlugCS?.[1] || 'service';
        return (
          <>
            <Head>
              <title>Repair Services in {citySlugCS} | The Travelling Technicians</title>
              <meta name="description" content={`Professional doorstep repair services in ${citySlugCS}.`} />
            </Head>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Loading service information...</h1>
                <Link href="/repair" className="mt-4 text-blue-600 hover:underline inline-block">
                  View All Services
                </Link>
              </div>
            </div>
            <Footer />
          </>
        );
      }
      
      // Extract all dynamic data from payload
      const { 
        city: csCity, 
        service: csService, 
        type: csType, 
        sample_models: csSampleModels,
        // New dynamic data
        local_content: csLocalContent,
        local_phone: csLocalPhone,
        local_email: csLocalEmail,
        neighborhoods: csNeighborhoods,
        operating_hours: csOperatingHours,
        testimonials: csTestimonials,
        nearby_cities: csNearbyCities
      } = routeData.payload;
      
      const csServiceName = csService?.name || 'Repair Service';
      const csCityName = csCity?.name || 'Your City';
      const csDeviceType = csType?.name || 'Device';
      
      // Format phone number using utility
      const csPhoneRaw = csLocalPhone || DEFAULT_PHONE_NUMBER;
      const csPhoneDisplay = formatPhoneNumberForDisplay(csPhoneRaw);
      const csPhoneHref = formatPhoneNumberForHref(csPhoneRaw);
      
      return (
        <>
          <Head>
            <title>{csServiceName} in {csCityName} | The Travelling Technicians</title>
            <meta name="description" content={`Professional ${csServiceName.toLowerCase()} for ${csDeviceType.toLowerCase()}s in ${csCityName}. Doorstep service by expert technicians with 90-day warranty.`} />
            <meta name="keywords" content={`${csServiceName}, ${csCityName} repair, ${csDeviceType} repair, doorstep repair, mobile repair ${csCityName}`} />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={`${siteUrl}/${routeData.slug_path}`} />
            
            {/* Open Graph */}
            <meta property="og:title" content={`${csServiceName} in ${csCityName} | The Travelling Technicians`} />
            <meta property="og:description" content={`Professional ${csServiceName.toLowerCase()} for ${csDeviceType.toLowerCase()}s in ${csCityName}. Doorstep service with 90-day warranty.`} />
            <meta property="og:url" content={`${siteUrl}/${routeData.slug_path}`} />
            <meta property="og:type" content="website" />
            
            {/* JSON-LD Structured Data for SEO */}
            {routeData.payload.jsonLd && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(routeData.payload.jsonLd)
                }}
              />
            )}
            
            {/* Breadcrumb Schema */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
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
                      "name": csCityName,
                      "item": `${siteUrl}/repair/${csCity?.slug}`
                    },
                    {
                      "@type": "ListItem",
                      "position": 3,
                      "name": csServiceName,
                      "item": `${siteUrl}/${routeData.slug_path}`
                    }
                  ]
                })
              }}
            />
          </Head>
          
          {/* Navigation Header */}
          <Header />
          
          {/* Hero Section */}
          <section className="pt-8 pb-12 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
            <div className="container-custom">
              <div className="text-center max-w-4xl mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-primary-200">{csCityName}, BC</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  {csServiceName}<br />
                  <span className="text-2xl md:text-3xl">in {csCityName}</span>
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-primary-100">
                  Professional {csDeviceType.toLowerCase()} {csServiceName.toLowerCase()} at your doorstep
                </p>
                
                <div className="inline-block bg-accent-500 text-white text-lg px-6 py-3 rounded-full mb-8">
                  <span className="font-bold">From $89</span>
                  <span className="ml-2 text-primary-100">with 90-day warranty</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Link 
                    href={`/book-online?city=${csCity?.slug}&service=${csService?.slug}`} 
                    className="btn-accent text-lg px-8 py-4"
                  >
                    Book {csServiceName} Now
                  </Link>
                  <a 
                    href={csPhoneHref}
                    className="btn-outline border-white text-white hover:bg-primary-600 text-lg px-8 py-4 flex items-center justify-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {csPhoneDisplay}
                  </a>
                </div>
                
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    30-90 min service
                  </div>
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    90-Day Warranty
                  </div>
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    Certified Technicians
                  </div>
                </div>
                
                {/* Postal Codes Trust Signal */}
                {routeData.payload.postal_codes && routeData.payload.postal_codes.length > 0 && (
                  <div className="mt-6 text-sm text-primary-200 flex items-center justify-center">
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Serving postal codes: {routeData.payload.postal_codes.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Service Description */}
          <section className="py-16 bg-white">
            <div className="container-custom">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-center">
                  Professional {csServiceName} Services
                </h2>
                <p className="text-lg text-gray-600 mb-8 text-center">
                  {csService?.description || `Get professional ${csServiceName.toLowerCase()} for your ${csDeviceType.toLowerCase()} right at your doorstep in ${csCityName}. Our certified technicians bring all the necessary tools and genuine parts to complete your repair quickly and efficiently.`}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  <div className="bg-gray-50 p-6 rounded-xl text-center">
                    <div className="text-4xl mb-4">🏠</div>
                    <h3 className="font-bold text-lg mb-2">Doorstep Service</h3>
                    <p className="text-gray-600 text-sm">
                      We come to your home or office in {csCityName} with all needed equipment
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl text-center">
                    <div className="text-4xl mb-4">⚡</div>
                    <h3 className="font-bold text-lg mb-2">Same-Day Service</h3>
                    <p className="text-gray-600 text-sm">
                      Most repairs completed in 30-90 minutes on the same day
                    </p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl text-center">
                    <div className="text-4xl mb-4">✅</div>
                    <h3 className="font-bold text-lg mb-2">Quality Guarantee</h3>
                    <p className="text-gray-600 text-sm">
                      90-day warranty on all parts and labor
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Select Your Model Section */}
          {csSampleModels && csSampleModels.length > 0 && (
            <section className="py-16 bg-gray-50">
              <div className="container-custom">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Select Your {csDeviceType} Model</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Choose your device model to see pricing and book your {csServiceName.toLowerCase()} in {csCityName}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {csSampleModels.map((model: { id: string; name: string; slug: string; display_name: string }) => (
                    <Link
                      key={model.id}
                      href={`/repair/${csCity?.slug}/${csService?.slug}/${model.slug}`}
                      className="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-lg transition-all border border-gray-100 group"
                    >
                      <div className="text-gray-800 font-medium group-hover:text-primary-600 transition-colors">
                        {model.display_name || model.name}
                      </div>
                      <div className="text-sm text-primary-500 mt-2">
                        View Pricing →
                      </div>
                    </Link>
                  ))}
                </div>
                
                <div className="text-center mt-8">
                  <p className="text-gray-600 mb-4">Don't see your model?</p>
                  <Link
                    href={`/book-online?city=${csCity?.slug}&service=${csService?.slug}`}
                    className="text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Contact us for a custom quote →
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Local Testimonials Section */}
          {csTestimonials && csTestimonials.length > 0 && (
            <section className="py-16 bg-white">
              <div className="container-custom">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">What Our {csCityName} Customers Say</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Real reviews from satisfied customers in {csCityName} and surrounding areas
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {csTestimonials.slice(0, 3).map((testimonial: { id?: string; customer_name: string; review: string; rating: number; city?: string; service?: string }, index: number) => (
                    <div 
                      key={testimonial.id || index} 
                      className="bg-gray-50 p-6 rounded-xl"
                    >
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4 italic">"{testimonial.review}"</p>
                      <div className="border-t pt-4">
                        <div className="font-semibold text-gray-900">{testimonial.customer_name}</div>
                        {testimonial.city && (
                          <div className="text-sm text-gray-500">{testimonial.city}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* City-Specific Local Content Section */}
          {csLocalContent && (
            <section className="py-16 bg-gray-50">
              <div className="container-custom">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold mb-8 text-center">
                    {csServiceName} Experts in {csCityName}
                  </h2>
                  <div 
                    className="prose prose-lg max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: csLocalContent.replace(/\\n/g, '<br/>') }}
                  />
                </div>
              </div>
            </section>
          )}

          {/* Neighborhoods We Serve Section */}
          {csNeighborhoods && csNeighborhoods.length > 0 && (
            <section className="py-16 bg-white">
              <div className="container-custom">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">{csCityName} Neighborhoods We Serve</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    We provide doorstep {csServiceName.toLowerCase()} throughout {csCityName}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {csNeighborhoods.map((neighborhood: string, index: number) => (
                    <div 
                      key={index}
                      className="bg-gray-50 px-4 py-2 rounded-full text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      <span className="flex items-center">
                        <svg className="h-4 w-4 mr-2 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {neighborhood}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Neighborhood Pages - Hyper-Local SEO Linking */}
          {routeData.payload.neighborhood_pages && routeData.payload.neighborhood_pages.length > 0 && (
            <section className="py-16 bg-gray-50">
              <div className="container-custom">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">{csServiceName} by Neighborhood</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Find repair services in your specific {csCityName} neighborhood
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {routeData.payload.neighborhood_pages.map((neighborhood: { id: number; neighborhood_name: string; slug: string; landmark_name?: string }) => (
                    <Link
                      key={neighborhood.id}
                      href={`/repair/${csCity?.slug}/${neighborhood.slug}`}
                      className="bg-white p-4 rounded-lg hover:shadow-md transition-all border border-gray-100 group"
                    >
                      <div className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                        {neighborhood.neighborhood_name}
                      </div>
                      {neighborhood.landmark_name && (
                        <div className="text-xs text-gray-500 mb-2">
                          Near {neighborhood.landmark_name}
                        </div>
                      )}
                      <div className="text-xs text-primary-600 flex items-center">
                        <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        View Services
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Nearby Cities Section (SEO Internal Linking) */}
          {csNearbyCities && csNearbyCities.length > 0 && (
            <section className="py-16 bg-gray-50">
              <div className="container-custom">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Also Serving Nearby Cities</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Need {csServiceName.toLowerCase()} in a nearby city? We've got you covered!
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {csNearbyCities.map((nearbyCity: { slug: string; name: string; distance_km?: number }, index: number) => (
                    <Link
                      key={index}
                      href={`/repair/${nearbyCity.slug}/${csService?.slug}`}
                      className="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-all border border-gray-100 group"
                    >
                      <div className="text-gray-800 font-medium group-hover:text-primary-600 transition-colors">
                        {nearbyCity.name}
                      </div>
                      {nearbyCity.distance_km && (
                        <div className="text-sm text-gray-500 mt-1">
                          {nearbyCity.distance_km.toFixed(1)} km away
                        </div>
                      )}
                      <div className="text-sm text-primary-500 mt-2">
                        {csServiceName} →
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section className="py-16 bg-primary-50">
            <div className="container-custom text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready for {csServiceName} in {csCityName}?
              </h2>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                Book your doorstep {csServiceName.toLowerCase()} today and get back to using your {csDeviceType.toLowerCase()}.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/book-online?city=${csCity?.slug}&service=${csService?.slug}`}
                  className="btn-accent text-lg px-8 py-4"
                >
                  Book Now
                </Link>
                <a
                  href={csPhoneHref}
                  className="btn-outline border-primary-600 text-primary-600 hover:bg-primary-50 text-lg px-8 py-4"
                >
                  Call {csPhoneDisplay}
                </a>
              </div>
            </div>
          </section>

          {/* Footer */}
          <Footer />
        </>
      );

    default:
      return <NotFound />;
  }
}

/**
 * Generate static paths for ALL dynamic routes
 * This is called at build time to pre-generate all pages
 * 
 * Uses pagination with batch processing to fetch all routes from database.
 * This approach prevents timeouts and ensures all pages are pre-rendered.
 */
export const getStaticPaths: GetStaticPaths = async () => {
  console.log('========================================');
  console.log('🔥🔥🔥 getStaticPaths CALLED - ENTRY POINT');
  console.log('========================================');
  
  const startTime = Date.now();
  const BATCH_SIZE = 1000; // Fetch 1000 routes per batch
  const MAX_BUILD_TIME = 45000; // 45 seconds max (safe for Vercel)
  
  try {
    console.log('🔧 Attempting to get Supabase client...');
    const supabase = getServiceSupabase();
    console.log('✅ Supabase client obtained successfully');
    
    console.log('🚀 Starting pagination-based route generation...');
    
    // First, get the total count of ALL routes (not just model-service-page)
    const { count: totalCount, error: countError } = await supabase
      .from('dynamic_routes')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error getting route count:', countError);
      return { paths: [], fallback: 'blocking' };
    }
    
    console.log(`📊 Total routes in database: ${totalCount}`);
    
    const allRoutes: Array<{ slug_path: string }> = [];
    const totalBatches = Math.ceil((totalCount || 0) / BATCH_SIZE);
    
    // Fetch ALL routes in batches with pagination
    for (let batch = 0; batch < totalBatches; batch++) {
      // Check timeout
      if (Date.now() - startTime > MAX_BUILD_TIME) {
        console.warn(`⚠️ Timeout approaching after ${batch} batches. Generated ${allRoutes.length} routes so far.`);
        break;
      }
      
      const start = batch * BATCH_SIZE;
      const end = start + BATCH_SIZE - 1;
      
      console.log(`📦 Fetching batch ${batch + 1}/${totalBatches} (rows ${start}-${end})...`);
      
      const { data: batchRoutes, error: batchError } = await supabase
        .from('dynamic_routes')
        .select('slug_path')
        .order('slug_path', { ascending: true })
        .range(start, end);
      
      if (batchError) {
        console.error(`❌ Error fetching batch ${batch + 1}:`, batchError);
        continue; // Skip this batch but continue with others
      }
      
      if (batchRoutes && batchRoutes.length > 0) {
        allRoutes.push(...batchRoutes);
        console.log(`✓ Batch ${batch + 1}: Added ${batchRoutes.length} routes (total: ${allRoutes.length})`);
      }
      
      // If we got fewer routes than BATCH_SIZE, we've reached the end
      if (!batchRoutes || batchRoutes.length < BATCH_SIZE) {
        console.log(`✓ Reached end of data at batch ${batch + 1}`);
        break;
      }
    }
    
    console.log(`✅ Fetched ${allRoutes.length}/${totalCount} routes in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    
    // Convert slug_path to Next.js params format
    // Example: "repair/vancouver/screen-replacement-mobile/iphone-14" 
    // becomes { params: { slug: ['vancouver', 'screen-replacement-mobile', 'iphone-14'] } }
    const paths = allRoutes.map(route => ({
      params: { 
        slug: route.slug_path.replace('repair/', '').split('/').filter(Boolean)
      }
    }));
    
    // Always include the root repair page
    paths.push({ params: { slug: [] } });
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const coverage = totalCount ? ((allRoutes.length / totalCount) * 100).toFixed(1) : '0';
    
    console.log(`🎉 Generated ${paths.length} pre-rendered paths (${coverage}% coverage) in ${totalTime}s`);
    console.log(`📈 Build performance: ${(allRoutes.length / (Date.now() - startTime) * 1000).toFixed(0)} routes/sec`);

    return {
      paths,
      fallback: 'blocking', // Generate missing pages on-demand with ISR
    };
  } catch (error) {
    console.error('💥 Fatal error in getStaticPaths:', error);
    return {
      paths: [{ params: { slug: [] } }], // At least include root page
      fallback: 'blocking',
    };
  }
};

/**
 * Get static props for each route
 * This fetches the route data from database at build time
 */
export const getStaticProps: GetStaticProps<PageProps> = async ({ params }) => {
  try {
    const slug = params?.slug as string[] || [];
    
    // Handle root repair page - fetch database data for dropdowns
    if (slug.length === 0) {
      const supabase = getServiceSupabase();
      
      // Fetch cities for dropdown
      const { data: cities, error: citiesError } = await supabase
        .from('service_locations')
        .select('slug, city_name')
        .eq('is_active', true)
        .order('city_name');

      // Fetch services for dropdown
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('slug, name, display_name')
        .eq('is_active', true)
        .eq('is_doorstep_eligible', true)
        .order('sort_order');

      // Fetch models for dropdown (with type and brand info)
      const { data: models, error: modelsError } = await supabase
        .from('device_models')
        .select('id, name, device_type_id, brand_id')
        .eq('is_active', true)
        .order('popularity_score', { ascending: false })
        .limit(100);

      // Fetch real statistics for the homepage
      const { count: routeCount, error: routeCountError } = await supabase
        .from('dynamic_routes')
        .select('*', { count: 'exact', head: true });
      
      const { count: testimonialCount, error: testimonialCountError } = await supabase
        .from('testimonials')
        .select('*', { count: 'exact', head: true });

      if (citiesError || servicesError || modelsError || routeCountError || testimonialCountError) {
        console.warn('Error fetching dropdown data:', { citiesError, servicesError, modelsError, routeCountError, testimonialCountError });
        // Continue with empty arrays - component has fallback
      }

      // Fetch types and brands separately for better compatibility
      const { data: types } = await supabase
        .from('device_types')
        .select('id, name');
      
      const { data: brands } = await supabase
        .from('brands')
        .select('id, display_name');

      // Create lookup maps for efficient joins
      const typeMap = new Map(types?.map(t => [t.id, t.name]) || []);
      const brandMap = new Map(brands?.map(b => [b.id, b.display_name]) || []);

      // Transform models to match RepairIndexProps interface
      const transformedModels = models?.map(m => ({
        id: m.id,
        name: m.name,
        type: typeMap.get(m.device_type_id) || 'unknown',
        brand: brandMap.get(m.brand_id) || 'unknown'
      })) || [];

      return {
        props: {
          routeType: 'REPAIR_INDEX',
          cities: cities || [],
          services: services || [],
          models: transformedModels,
          routeCount: routeCount || 3289,
          testimonialCount: testimonialCount || 25
        },
        revalidate: 3600, // Revalidate every hour
      };
    }

    // Construct the full slug path for database lookup
    const slugPath = `repair/${slug.join('/')}`;
    
    // Fetch route data from dynamic_routes table
    const supabase = getServiceSupabase();
    const { data: route, error } = await supabase
      .from('dynamic_routes')
      .select('*')
      .eq('slug_path', slugPath)
      .single();

    // Handle database errors or missing routes
    if (error || !route) {
      console.warn(`Route not found: ${slugPath}`, error?.message);
      
      // Check if this might be a city page or city-service page
      // (we don't have those in dynamic_routes yet, but we could add them)
      if (slug.length === 1) {
        // Could be a city page like /repair/vancouver
        return {
          props: {
            routeType: 'CITY_PAGE',
          },
          revalidate: 86400,
        };
      } else if (slug.length === 2) {
        // Could be a city-service page like /repair/vancouver/screen-repair
        return {
          props: {
            routeType: 'CITY_SERVICE_PAGE',
          },
          revalidate: 86400,
        };
      }
      
      // Return 404 for unknown routes
      return {
        notFound: true,
        revalidate: 3600,
      };
    }

    // Return the appropriate route type with data
    switch (route.route_type) {
      case 'model-service-page':
        return {
          props: {
            routeType: 'MODEL_SERVICE_PAGE',
            routeData: route as RouteData,
          },
          revalidate: 86400, // Revalidate once per day
        };

      case 'city-page':
        return {
          props: {
            routeType: 'CITY_PAGE',
            routeData: route as RouteData,
          },
          revalidate: 86400,
        };

      case 'city-service-page':
        return {
          props: {
            routeType: 'CITY_SERVICE_PAGE',
            routeData: route as RouteData,
          },
          revalidate: 86400,
        };

      case 'city-model-page':
        return {
          props: {
            routeType: 'CITY_MODEL_PAGE',
            routeData: route as RouteData,
          },
          revalidate: 86400,
        };

      default:
        console.warn(`Unknown route type: ${route.route_type} for ${slugPath}`);
        return {
          notFound: true,
          revalidate: 3600,
        };
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        routeType: 'REPAIR_INDEX',
        error: 'An error occurred while loading the page.',
      },
      revalidate: 3600,
    };
  }
};