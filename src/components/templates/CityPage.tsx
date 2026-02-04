import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { formatPhoneNumberForDisplay, formatPhoneNumberForHref, DEFAULT_PHONE_NUMBER } from '@/utils/phone-formatter';
import { getSiteUrl } from '@/utils/supabaseClient';
import { getSameAsUrls } from '@/utils/wikidata';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { PlaceSchema } from '@/components/seo/PlaceSchema';
import { CityLocalBusinessSchema } from '@/components/seo/CityLocalBusinessSchema';
import { TechnicianSchema } from '@/components/seo/TechnicianSchema';
import { LocalContent } from '@/components/seo/LocalContent';
import { NeighborhoodLinks } from '@/components/seo/NeighborhoodLinks';

/**
 * CityPage Template - "Best of Both Worlds" Consolidation
 * 
 * This component combines the best features from:
 * - /locations/[city].tsx (SEO components, structured data, local content)
 * - /repair/[city] CityPage template (database-driven, universal routing)
 * 
 * Features:
 * - PlaceSchema for Google Maps "near me" visibility
 * - CityLocalBusinessSchema with city-specific openness signals
 * - TechnicianSchema for E-E-A-T expertise signals
 * - AggregateRating schema for trust signals
 * - NeighborhoodLinks for local SEO internal linking
 * - LocalContent markdown rendering
 * - Links to neighborhood pages for local SEO silo
 */

interface CityPageProps {
  routeData: {
    slug_path: string;
    route_type: string;
    payload: {
      city: {
        id: string;
        name: string;
        slug: string;
      };
      popular_models?: Array<{
        id: string;
        name: string;
        slug: string;
        brand?: string;
      }>;
      sample_services?: Array<{
        id: string;
        name: string;
        display_name: string;
        slug: string;
        icon?: string;
        description?: string;
      }>;
      local_phone?: string;
      local_email?: string;
      testimonials?: Array<{
        id?: string;
        customer_name: string;
        review: string;
        rating: number;
        city?: string;
        device_model?: string;
      }>;
      neighborhoods?: string[];
      postal_codes?: string[];
      latitude?: number;
      longitude?: number;
      operating_hours?: {
        weekday?: { open: string; close: string };
        saturday?: { open: string; close: string };
        sunday?: { open: string; close: string };
      };
      service_since?: string;
      local_content?: string;
      neighborhood_pages?: Array<{
        id: number;
        neighborhood_name: string;
        slug: string;
        landmark_name?: string;
      }>;
      jsonLd?: any;
    };
  };
}

export default function CityPage({ routeData }: CityPageProps) {
  const siteUrl = getSiteUrl();
  const { 
    city, 
    popular_models, 
    sample_services, 
    local_phone, 
    local_email, 
    testimonials, 
    neighborhoods,
    postal_codes,
    latitude,
    longitude,
    operating_hours,
    service_since,
    local_content,
    neighborhood_pages
  } = routeData.payload;
  
  const cityName = city.name;
  const citySlug = city.slug;
  
  // State for "Show More" functionality
  const [showAllModels, setShowAllModels] = useState(false);
  
  // Format phone number
  const cityPhoneRaw = local_phone || DEFAULT_PHONE_NUMBER;
  const cityPhoneDisplay = formatPhoneNumberForDisplay(cityPhoneRaw);
  const cityPhoneHref = formatPhoneNumberForHref(cityPhoneRaw);
  
  // Show first 12 devices or all based on state
  const displayedModels = showAllModels ? popular_models : popular_models?.slice(0, 12) || [];
  
  // Get Wikidata sameAs URLs
  const sameAsUrls = getSameAsUrls(citySlug);
  
  // Default coordinates if not provided (Vancouver downtown)
  const cityLatitude = latitude || 49.2827;
  const cityLongitude = longitude || -123.1207;
  
  // Default operating hours
  const defaultHours = {
    weekday: { open: '08:00', close: '20:00' },
    saturday: { open: '09:00', close: '18:00' },
    sunday: { open: '10:00', close: '17:00' }
  };
  const hours = operating_hours || defaultHours;
  
  // Static stats with AggregateRating (as requested)
  const stats = {
    repairsCompleted: 50,
    rating: 4.8,
    reviewCount: 25,
    sameDayRate: 95,
    warrantyDays: 90
  };

  return (
    <>
      <Head>
        <title>{`Device Repair Services in ${cityName}, BC | The Travelling Technicians`}</title>
        <meta name="description" content={`Professional doorstep phone and laptop repair in ${cityName}, BC. Screen replacement, battery replacement, and more. Same-day service with warranty.`} />
        <meta name="keywords" content={`${cityName} phone repair, ${cityName} laptop repair, mobile repair ${cityName} BC, doorstep repair ${cityName}, screen replacement ${cityName}`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${siteUrl}/repair/${citySlug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`Device Repair in ${cityName} | The Travelling Technicians`} />
        <meta property="og:description" content={`Professional doorstep repair services in ${cityName}. Screen replacement, battery replacement, and more for all major device brands.`} />
        <meta property="og:url" content={`${siteUrl}/repair/${citySlug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_CA" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Device Repair in ${cityName} | The Travelling Technicians`} />
        <meta name="twitter:description" content={`Professional doorstep repair in ${cityName}. Same-day service, 90-day warranty.`} />
        
        {/* Geo Meta Tags for Local SEO */}
        <meta name="geo.region" content="CA-BC" />
        <meta name="geo.placename" content={cityName} />
        <meta name="geo.position" content={`${cityLatitude};${cityLongitude}`} />
        <meta name="ICBM" content={`${cityLatitude}, ${cityLongitude}`} />
      </Head>
      
      {/* ========== SEO STRUCTURED DATA ========== */}
      
      {/* PlaceSchema for Google Maps "near me" visibility */}
      <PlaceSchema
        name={`The Travelling Technicians - ${cityName}`}
        description={`Professional mobile phone and laptop repair services with doorstep service in ${cityName}, BC. Same-day repairs available.`}
        latitude={cityLatitude}
        longitude={cityLongitude}
        address={{
          streetAddress: `${cityName} Service Area`,
          addressLocality: cityName,
          addressRegion: "BC",
          addressCountry: "CA"
        }}
        telephone={cityPhoneRaw}
        url={`/repair/${citySlug}`}
        openingHours={hours}
        areaServed={neighborhoods || []}
      />
      
      {/* CityLocalBusinessSchema with Openness Signals */}
      <CityLocalBusinessSchema
        cityName={cityName}
        description={`Professional mobile phone and laptop repair services with doorstep service in ${cityName}, BC.`}
        latitude={cityLatitude}
        longitude={cityLongitude}
        telephone={cityPhoneRaw}
        email={local_email || 'info@travellingtechnicians.ca'}
        neighborhoods={neighborhoods || []}
        openingHours={hours}
        serviceSince={service_since}
        url={`${siteUrl}/repair/${citySlug}`}
      />
      
      {/* TechnicianSchema for E-E-A-T signals */}
      <TechnicianSchema
        includeAggregate={true}
        aggregateData={{
          totalTechnicians: 4,
          averageExperience: 7.25,
          totalCertifications: 11
        }}
      />
      
      {/* AggregateRating Schema for Trust Signals */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": `${siteUrl}/repair/${citySlug}#aggregaterating`,
            "name": `The Travelling Technicians - ${cityName}`,
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": stats.rating,
              "reviewCount": stats.reviewCount,
              "bestRating": 5,
              "worstRating": 1
            }
          })
        }}
      />
      
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
                "name": cityName,
                "item": `${siteUrl}/repair/${citySlug}`
              }
            ]
          })
        }}
      />
      
      {/* SameAs Schema for Entity Linking */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": `${siteUrl}/#organization`,
            "name": "The Travelling Technicians",
            "sameAs": sameAsUrls
          })
        }}
      />
      
      <Header />
      
      {/* ========== HERO SECTION ========== */}
      <section className="pt-8 pb-12 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-primary-200">{cityName}, BC</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Mobile & Laptop Repair<br />
              <span className="text-accent-400">{cityName}</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Doorstep repair service to all {cityName} neighborhoods
            </p>
            
            <div className="inline-block bg-accent-500 text-white text-lg px-6 py-3 rounded-full mb-8">
              <span className="font-bold">From $89</span>
              <span className="ml-2 text-primary-100">with 90-day warranty</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link 
                href={`/book-online?city=${citySlug}`} 
                className="btn-accent text-lg px-8 py-4"
              >
                Book Repair in {cityName}
              </Link>
              <a 
                href={cityPhoneHref}
                className="btn-outline border-white text-white hover:bg-primary-600 text-lg px-8 py-4 flex items-center justify-center"
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {cityPhoneDisplay}
              </a>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Same-Day Service
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
            {postal_codes && postal_codes.length > 0 && (
              <div className="mt-6 text-sm text-primary-200 flex items-center justify-center flex-wrap gap-1">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>Serving postal codes: {postal_codes.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========== STATS SECTION with AggregateRating ========== */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">{stats.repairsCompleted}+</div>
              <p className="text-gray-600">{cityName} Repairs</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">{stats.rating}★</div>
              <p className="text-gray-600">Customer Rating</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">{stats.sameDayRate}%</div>
              <p className="text-gray-600">Same-Day Service</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">{stats.warrantyDays}</div>
              <p className="text-gray-600">Day Warranty</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SERVICES SECTION (Side-by-Side Layout) ========== */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Device Repair Services in {cityName}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional repair services delivered directly to your location in {cityName}
            </p>
          </div>

          {/* Side-by-side layout: Mobile on left, Laptop on right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Mobile Phone Repairs Column */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <span className="text-4xl">📱</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Mobile Phone Repairs</h3>
                  <p className="text-sm text-gray-500">iPhone, Samsung, Pixel & more</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {sample_services?.filter(s => s.slug?.includes('mobile')).map((service) => {
                  // Get minimum price based on service slug
                  const minPrice = service.slug === 'screen-replacement-mobile' ? 84 : 
                                   service.slug === 'battery-replacement-mobile' ? 57 : 79;
                  return (
                    <Link 
                      key={service.id}
                      href={`/repair/${citySlug}/${service.slug}`} 
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-primary-50 transition-all group border border-transparent hover:border-primary-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-xl">
                          {service.slug?.includes('screen') ? '📱' : '🔋'}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {service.display_name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {service.description?.substring(0, 50) || 'Professional repair service'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-600">From ${minPrice}</div>
                        <div className="text-xs text-gray-400">View details →</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Laptop Repairs Column */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <span className="text-4xl">💻</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Laptop Repairs</h3>
                  <p className="text-sm text-gray-500">MacBook, Windows laptops & more</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {sample_services?.filter(s => s.slug?.includes('laptop')).map((service) => {
                  // Get minimum price based on service slug
                  const minPrice = service.slug === 'screen-replacement-laptop' ? 287 : 
                                   service.slug === 'battery-replacement-laptop' ? 129 : 149;
                  return (
                    <Link 
                      key={service.id}
                      href={`/repair/${citySlug}/${service.slug}`} 
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-primary-50 transition-all group border border-transparent hover:border-primary-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center text-xl">
                          {service.slug?.includes('screen') ? '🖥️' : '🔋'}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {service.display_name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {service.description?.substring(0, 50) || 'Professional repair service'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-600">From ${minPrice}</div>
                        <div className="text-xs text-gray-400">View details →</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== POPULAR MODELS SECTION (SEO-OPTIMIZED: All models in DOM) ========== */}
      {popular_models && popular_models.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Popular Devices We Repair in {cityName}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We specialize in repairing the most popular devices. Click to see screen replacement options.
              </p>
            </div>

            {/* ALL models rendered in DOM for SEO indexing, CSS hides overflow */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {(popular_models || []).map((model, index) => {
                // Determine service slug based on device type (iphone/samsung = mobile, macbook = laptop)
                const modelSlug = model.slug || model.name.toLowerCase().replace(/\s+/g, '-');
                const isLaptop = model.brand?.toLowerCase().includes('mac') || 
                                 model.name.toLowerCase().includes('macbook') ||
                                 model.name.toLowerCase().includes('laptop');
                const defaultService = isLaptop ? 'screen-replacement-laptop' : 'screen-replacement-mobile';
                
                return (
                  <Link
                    key={model.id}
                    href={`/repair/${citySlug}/${defaultService}/${modelSlug}`}
                    className={`bg-gray-50 p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-all border border-gray-100 group cursor-pointer
                      ${index >= 12 && !showAllModels ? 'hidden md:hidden lg:hidden' : ''}`}
                    // CSS hides models 13+ when collapsed, but they remain in DOM for Google indexing
                  >
                    <div className="text-gray-800 font-medium text-sm group-hover:text-primary-600 transition-colors">
                      {model.name}
                    </div>
                    {model.brand && (
                      <div className="text-gray-500 text-xs mt-1">
                        {model.brand}
                      </div>
                    )}
                    <div className="text-xs text-primary-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Screen Repair →
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {/* Show More / Show Less Button */}
            {popular_models.length > 12 && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setShowAllModels(!showAllModels)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
                  aria-expanded={showAllModels}
                  aria-controls="device-models-grid"
                >
                  {showAllModels ? (
                    <>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      Show Less
                    </>
                  ) : (
                    <>
                      Show All {popular_models.length} Devices
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========== LOCAL TESTIMONIALS SECTION ========== */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What Our {cityName} Customers Say</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real reviews from satisfied customers in {cityName}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <div 
                  key={testimonial.id || index} 
                  className="bg-white p-6 rounded-xl shadow-sm"
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
                  <p className="text-gray-700 mb-4 italic line-clamp-4">"{testimonial.review}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-gray-900">{testimonial.customer_name}</div>
                    {testimonial.city && (
                      <div className="text-sm text-gray-500">{testimonial.city}</div>
                    )}
                    {testimonial.device_model && (
                      <div className="text-xs text-primary-600">{testimonial.device_model}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== NEIGHBORHOOD PAGES SECTION (Local SEO Silo) ========== */}
      {neighborhood_pages && neighborhood_pages.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{cityName} Neighborhood Repair Services</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find repair services in your specific {cityName} neighborhood
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {neighborhood_pages.map((neighborhood) => (
                <Link
                  key={neighborhood.id}
                  href={`/repair/${citySlug}/${neighborhood.slug}`}
                  className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-all border border-gray-100 group"
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

      {/* ========== NEIGHBORHOOD LINKS COMPONENT (SEO Internal Linking) ========== */}
      {neighborhoods && neighborhoods.length > 0 && (
        <NeighborhoodLinks
          cityName={cityName}
          citySlug={citySlug}
          neighborhoods={neighborhoods}
          title="Service Areas"
        />
      )}

      {/* ========== LOCAL CONTENT SECTION (City-Specific SEO Content) ========== */}
      {local_content && (
        <LocalContent content={local_content} cityName={cityName} />
      )}

      {/* ========== CTA SECTION ========== */}
      <section className="py-16 bg-primary-50">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Repair Your Device in {cityName}?
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Book your doorstep repair service today and get back to using your device.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/book-online?city=${citySlug}`}
              className="btn-accent text-lg px-8 py-4"
            >
              Book Repair Now
            </Link>
            <a
              href={cityPhoneHref}
              className="btn-outline border-primary-600 text-primary-600 hover:bg-primary-50 text-lg px-8 py-4"
            >
              Call {cityPhoneDisplay}
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
}
