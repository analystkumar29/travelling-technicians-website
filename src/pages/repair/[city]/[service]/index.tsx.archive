import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { FaPhone, FaClock, FaShieldAlt, FaMapMarkerAlt, FaTools, FaCheckCircle } from 'react-icons/fa';
import { LocalBusinessSchema, ServiceSchema } from '@/components/seo/StructuredData';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import NearbyCities, { NearbyCity } from '@/components/seo/NearbyCities';
import { GetStaticPaths, GetStaticProps } from 'next';
import { getCityData, getNearbyLocations, getAllActiveServices, getModelsForService, getServiceBySlug } from '@/lib/data-service';
import { createBreadcrumbs } from '@/utils/seoHelpers';
import { getSiteUrl } from '@/utils/supabaseClient';
import { useSimplePhoneNumber } from '@/hooks/useBusinessSettings';

interface CityServicePageProps {
  city: string;
  service: string;
  cityData: {
    name: string;
    slug: string;
  };
  serviceData: {
    name: string;
    displayName: string;
    description?: string;
  };
  models: Array<{
    slug: string;
    displayName: string;
    brand: string;
    deviceType: string;
    imageUrl?: string;
  }>;
  wikidataId?: string;
  nearbyCities: NearbyCity[];
}

// Wikidata mapping for BC cities
const WIKIDATA_MAP: Record<string, string> = {
  'vancouver': 'Q24639',
  'burnaby': 'Q1014052',
  'richmond': 'Q1014053',
  'surrey': 'Q1014054',
  'coquitlam': 'Q1014055',
  'north-vancouver': 'Q1014056',
  'west-vancouver': 'Q1014057',
  'new-westminster': 'Q1014058',
  'chilliwack': 'Q1014059',
  'langley': 'Q1014060',
  'delta': 'Q1014061',
  'abbotsford': 'Q1014062',
  'maple-ridge': 'Q1014063' // Added Maple Ridge
};

export const getStaticPaths: GetStaticPaths = async () => {
  console.log('🔄 Starting getStaticPaths for repair/[city]/[service]...');
  
  try {
    // Import the data service functions
    const { getAllActiveCities, getAllActiveServices } = await import('@/lib/data-service');
    console.log('✅ Successfully imported data-service functions');
    
    // Get all active cities from database
    console.log('📊 Fetching active cities from database...');
    const activeCities = await getAllActiveCities();
    console.log(`✅ Found ${activeCities.length} active cities:`, activeCities.map(c => c.slug).slice(0, 5));
    
    // Get all active services from database
    console.log('🔧 Fetching active services from database...');
    const activeServices = await getAllActiveServices();
    console.log(`✅ Found ${activeServices.length} active services:`, activeServices.map(s => s.name));
    
    // Generate all city-service combinations
    const paths = [];
    
    // Map database service names to URL slugs
    const serviceSlugMapping: Record<string, string> = {
      'screen-replacement-mobile': 'screen-repair',
      'screen-replacement-laptop': 'laptop-screen-repair',
      'battery-replacement-mobile': 'battery-replacement',
      'battery-replacement-laptop': 'battery-replacement',
      // Note: Only map currently active services
    };
    
    console.log('🔗 Service slug mapping:', serviceSlugMapping);
    
    for (const city of activeCities) {
      const citySlug = city.slug;
      
      for (const service of activeServices) {
        // Map database service slug to URL slug
        const urlSlug = serviceSlugMapping[service.slug] ?? service.slug;
        
        // Only generate paths for services that have URL slug mapping
        if (serviceSlugMapping[service.slug]) {
          paths.push({
            params: {
              city: citySlug,
              service: urlSlug
            }
          });
        }
      }
    }
    
    console.log(`📈 Generated ${paths.length} static paths for service pages (${activeCities.length} cities × ${activeServices.length} services)`);
    
    // If we have database data, use it
    if (paths.length > 0) {
      console.log(`🎯 Total paths to generate from database: ${paths.length}`);
      return {
        paths,
        fallback: 'blocking'
      };
    }
    
    // If no paths from database, use hardcoded data for all 52 combinations
    console.log('⚠️ No paths generated from database, using hardcoded data for all 52 city-service combinations');
    
    // Hardcoded list of all 13 cities
    const allCities = [
      { city: 'Vancouver', slug: 'vancouver' },
      { city: 'Burnaby', slug: 'burnaby' },
      { city: 'Richmond', slug: 'richmond' },
      { city: 'Surrey', slug: 'surrey' },
      { city: 'Coquitlam', slug: 'coquitlam' },
      { city: 'North Vancouver', slug: 'north-vancouver' },
      { city: 'West Vancouver', slug: 'west-vancouver' },
      { city: 'New Westminster', slug: 'new-westminster' },
      { city: 'Chilliwack', slug: 'chilliwack' },
      { city: 'Langley', slug: 'langley' },
      { city: 'Delta', slug: 'delta' },
      { city: 'Abbotsford', slug: 'abbotsford' },
      { city: 'Maple Ridge', slug: 'maple-ridge' }
    ];
    
    // Hardcoded list of only currently active services (matching serviceSlugMapping)
    const allServices = [
      { name: 'screen-repair', displayName: 'Screen Repair' },
      { name: 'battery-replacement', displayName: 'Battery Replacement' },
      { name: 'laptop-screen-repair', displayName: 'Laptop Screen Repair' }
    ];
    
    // Generate combinations only for active services (13 cities × 3 services = 39 paths)
    for (const city of allCities) {
      for (const service of allServices) {
        paths.push({
          params: {
            city: city.slug,
            service: service.name
          }
        });
      }
    }
    
    console.log(`🎯 Generated ${paths.length} static paths using hardcoded data (${allCities.length} cities × ${allServices.length} active services)`);
    
    return {
      paths,
      fallback: 'blocking'
    };
  } catch (error) {
    console.error('❌ Error generating static paths:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    
    // Fallback to hardcoded data for all 52 combinations
    console.log('🔄 Using hardcoded fallback with all 52 city-service combinations');
    
    const allCities = [
      { city: 'Vancouver', slug: 'vancouver' },
      { city: 'Burnaby', slug: 'burnaby' },
      { city: 'Richmond', slug: 'richmond' },
      { city: 'Surrey', slug: 'surrey' },
      { city: 'Coquitlam', slug: 'coquitlam' },
      { city: 'North Vancouver', slug: 'north-vancouver' },
      { city: 'West Vancouver', slug: 'west-vancouver' },
      { city: 'New Westminster', slug: 'new-westminster' },
      { city: 'Chilliwack', slug: 'chilliwack' },
      { city: 'Langley', slug: 'langley' },
      { city: 'Delta', slug: 'delta' },
      { city: 'Abbotsford', slug: 'abbotsford' },
      { city: 'Maple Ridge', slug: 'maple-ridge' }
    ];
    
    const allServices = [
      { name: 'screen-repair', displayName: 'Screen Repair' },
      { name: 'battery-replacement', displayName: 'Battery Replacement' },
      { name: 'laptop-screen-repair', displayName: 'Laptop Screen Repair' }
    ];
    
    const paths = [];
    for (const city of allCities) {
      for (const service of allServices) {
        paths.push({
          params: {
            city: city.slug,
            service: service.name
          }
        });
      }
    }
    
    console.log(`🔄 Generated ${paths.length} fallback paths (${allCities.length} cities × ${allServices.length} active services)`);
    
    return {
      paths,
      fallback: 'blocking'
    };
  }
};

export const getStaticProps: GetStaticProps<CityServicePageProps> = async ({ params }) => {
  const citySlug = params?.city as string;
  const serviceSlug = params?.service as string;

  try {
    const cityData = await getCityData(citySlug);
    
    const serviceFromDb = await getServiceBySlug(serviceSlug);

    const serviceDisplayName = serviceFromDb?.display_name
      ?? serviceSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    const serviceData = {
      name: serviceSlug,
      displayName: serviceDisplayName,
      description: serviceFromDb?.description
        ?? `Professional ${serviceDisplayName.toLowerCase()} services in ${cityData?.city_name ?? citySlug.replace('-', ' ')}.`
    };

    // Get all models for this service from database
    const modelsFromDb = await getModelsForService(serviceSlug);
    
    // Transform database models to the format expected by the page
    const models = modelsFromDb.map(model => ({
      slug: model.slug,
      displayName: model.display_name
        ?? model.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      brand: model.brand_name ?? 'Various',
      deviceType: model.device_type ?? 'mobile',
      imageUrl: `/images/devices/${model.slug}.webp`
    }));

    const wikidataId = WIKIDATA_MAP[citySlug] ?? null;

    // Fetch nearby cities for internal linking
    let nearbyCities: NearbyCity[] = [];
    try {
      nearbyCities = await getNearbyLocations(citySlug);
      // Filter out the current city and limit to 3
      nearbyCities = nearbyCities
        .filter(city => city.slug !== citySlug)
        .slice(0, 3);
    } catch (nearbyError) {
      console.error(`Error fetching nearby cities for ${citySlug}:`, nearbyError);
      // Continue without nearby cities - empty array is fine
    }

    return {
      props: {
        city: citySlug,
        service: serviceSlug,
        cityData: {
          name: cityData?.city_name ?? citySlug.replace('-', ' '),
          slug: citySlug
        },
        serviceData,
        models,
        wikidataId,
        nearbyCities
      },
      revalidate: 3600
    };
  } catch (error) {
    console.error(`Error fetching data for ${citySlug}/${serviceSlug}:`, error);
    
    // Fallback to hardcoded data if database query fails
    const models = [
      { slug: 'iphone-14', displayName: 'iPhone 14', brand: 'Apple', deviceType: 'mobile', imageUrl: '/images/devices/iphone-14.webp' },
      { slug: 'iphone-15', displayName: 'iPhone 15', brand: 'Apple', deviceType: 'mobile', imageUrl: '/images/devices/iphone-15.webp' },
      { slug: 'samsung-galaxy-s23', displayName: 'Samsung Galaxy S23', brand: 'Samsung', deviceType: 'mobile', imageUrl: '/images/devices/samsung-galaxy-s23.webp' },
      { slug: 'google-pixel-7', displayName: 'Google Pixel 7', brand: 'Google', deviceType: 'mobile', imageUrl: '/images/devices/google-pixel-7.webp' },
      { slug: 'macbook-pro-2023', displayName: 'MacBook Pro 2023', brand: 'Apple', deviceType: 'laptop', imageUrl: '/images/devices/macbook-pro-2023.webp' }
    ];
    
    return {
      props: {
        city: citySlug,
        service: serviceSlug,
        cityData: {
          name: citySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          slug: citySlug
        },
        serviceData: {
          name: serviceSlug,
          displayName: serviceSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          description: `Professional repair service in ${citySlug.replace('-', ' ')}.`
        },
        models,
        wikidataId: WIKIDATA_MAP[citySlug] ?? null,
        nearbyCities: [] // Empty array for fallback
      },
      revalidate: 3600
    };
  }
};

export default function CityServicePage({
  city,
  service,
  cityData,
  serviceData,
  models,
  wikidataId,
  nearbyCities
}: CityServicePageProps) {
  const pageTitle = `${serviceData.displayName} in ${cityData.name} | The Travelling Technicians`;
  const metaDescription = `Professional ${serviceData.displayName.toLowerCase()} services in ${cityData.name}, BC. Doorstep repair for all major device brands with certified technicians. 90-day warranty included.`;
  
  const sameAs = wikidataId ? [`https://www.wikidata.org/wiki/${wikidataId}`] : [];
  const siteUrl = getSiteUrl();
  
  // Use city-specific phone number
  const { display: phoneDisplay, href: phoneHref, loading: phoneLoading } = useSimplePhoneNumber(city);

  // Generate breadcrumb items for the current page
  const breadcrumbItems = createBreadcrumbs(`/repair/${city}/${service}`);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`https://www.travelling-technicians.ca/repair/${city}/${service}`} />
        
        <LocalBusinessSchema
          name={`The Travelling Technicians - ${cityData.name}`}
          description={`Professional ${serviceData.displayName.toLowerCase()} services in ${cityData.name}, BC.`}
          address={{
            streetAddress: `${cityData.name} Service Area`,
            addressLocality: cityData.name,
            addressRegion: "BC",
            addressCountry: "CA"
          }}
          areaServed={[`${cityData.name}, BC`]}
          sameAs={sameAs}
        />
        
        <ServiceSchema
          name={`${serviceData.displayName}`}
          description={`Professional ${serviceData.displayName.toLowerCase()} services in ${cityData.name}, BC. Doorstep service with certified technicians.`}
          serviceType={`${serviceData.displayName}`}
          areaServed={[`${cityData.name}, BC`]}
          hasOfferCatalog={{
            name: `${serviceData.displayName} Services`,
            description: `Complete ${serviceData.displayName.toLowerCase()} services for all major device brands in ${cityData.name}`,
            offers: models.map(model => ({
              name: `${model.displayName} ${serviceData.displayName}`,
              description: `Professional ${serviceData.displayName.toLowerCase()} for ${model.displayName}`,
              priceCurrency: "CAD",
              priceRange: "From $89"
            }))
          }}
          doorstepService={true}
          warranty="90 days"
        />
      </Head>
      
      <Layout
        title={pageTitle}
        metaDescription={metaDescription}
      >
        {/* Breadcrumb navigation */}
        <div className="container-custom pt-6">
          <Breadcrumbs items={breadcrumbItems} showSchema={true} />
        </div>

        <section className="pt-8 pb-12 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
          <div className="container-custom">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <FaMapMarkerAlt className="h-6 w-6 mr-2" />
                <span className="text-primary-200">{cityData.name}, BC</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {serviceData.displayName}<br />
                <span className="text-2xl md:text-3xl">in {cityData.name}</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-primary-100">
                Doorstep repair service for all major device brands
              </p>
              
              <div className="inline-block bg-accent-500 text-white text-lg px-6 py-3 rounded-full mb-8">
                <span className="font-bold">From $89</span>
                <span className="ml-2 text-primary-100">with 90-day warranty</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link 
                  href={`/book-online?city=${city}&service=${service}`} 
                  className="btn-accent text-lg px-8 py-4"
                >
                  Book {serviceData.displayName} in {cityData.name}
                </Link>
                <a 
                  href={phoneLoading ? "#" : phoneHref} 
                  className={`btn-outline border-white text-white hover:bg-primary-600 text-lg px-8 py-4 flex items-center justify-center ${phoneLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FaPhone className="mr-2" />
                  {phoneLoading ? "Loading..." : phoneDisplay}
                </a>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center">
                  <FaClock className="mr-2 h-4 w-4" />
                  30-90 min service
                </div>
                <div className="flex items-center">
                  <FaShieldAlt className="mr-2 h-4 w-4" />
                  90-Day Warranty
                </div>
                <div className="flex items-center">
                  <FaTools className="mr-2 h-4 w-4" />
                  Certified Technicians
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  {serviceData.displayName} Services
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  Our certified technicians specialize in {serviceData.displayName.toLowerCase()} for all major device brands. 
                  We bring all necessary tools and genuine parts directly to your location in {cityData.name}.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900">Same-Day Service Available</h3>
                      <p className="text-gray-600">Most repairs completed within 30-90 minutes at your doorstep.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900">Genuine Parts & 90-Day Warranty</h3>
                      <p className="text-gray-600">We use only high-quality genuine partsand OEM-grade components for all repairs. Every service is backed by our comprehensive 90-day warranty for your peace of mind.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Link 
                    href={`/book-online?city=${city}&service=${service}`} 
                    className="inline-block bg-primary-600 text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
                  >
                    Book Appointment Now
                  </Link>
                </div>
              </div>
              
              {/* Right Column: Service Image/Visual */}
              <div className="relative h-80 lg:h-full min-h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                 {/* ROO_NOTE: Ideally use next/image here with a relevant service image from /images/services/ */}
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                   <FaTools className="h-24 w-24 text-gray-300" />
                   <span className="sr-only">{serviceData.displayName}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CRITICAL SEO SILO: Model Links Section */}
        {/* This section creates the internal links required for the SEO silo structure */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Select Your Device</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select your specific model below to see exact pricing and availability for {serviceData.displayName} in {cityData.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models.map((model) => (
                <Link 
                  key={model.slug}
                  href={`/repair/${city}/${service}/${model.slug}`} 
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 group flex items-center"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors">
                      {model.displayName}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1 flex items-center">
                      <FaCheckCircle className="text-green-500 h-3 w-3 mr-1" />
                      {serviceData.displayName} Available
                    </div>
                  </div>
                  <div className="ml-4 text-primary-500">
                    <span className="sr-only">View Pricing</span>
                    <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Nearby Cities Section */}
        {/* ROO_NOTE: This uses the NearbyCities component imported at the top */}
        {nearbyCities && nearbyCities.length > 0 && (
          <section className="py-12 bg-white border-t border-gray-100">
             <div className="container-custom">
                <NearbyCities
                  nearbyCities={nearbyCities}
                  currentCitySlug={city}
                  currentServiceSlug={service}
                  currentModelSlug={models[0]?.slug || 'iphone-14'} // Default to first model or a fallback
                />
             </div>
          </section>
        )}
      </Layout>
    </>
  );
}