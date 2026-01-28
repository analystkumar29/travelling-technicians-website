import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { FaPhone, FaClock, FaShieldAlt, FaMapMarkerAlt, FaTools, FaCheckCircle } from 'react-icons/fa';
import { LocalBusinessSchema, ServiceSchema } from '@/components/seo/StructuredData';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import NearbyCities, { NearbyCity } from '@/components/seo/NearbyCities';
import { GetStaticPaths, GetStaticProps } from 'next';
import { getCityData, getNearbyLocations, getAllActiveServices, getModelsForService } from '@/lib/data-service';
import { createBreadcrumbs } from '@/utils/seoHelpers';
import { getSiteUrl } from '@/utils/supabaseClient';

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
  'abbotsford': 'Q1014062'
};

// Model slugs and display names from repair page
const MODEL_DISPLAY_NAMES: Record<string, { displayName: string; brand: string; deviceType: string }> = {
  'iphone-14': { displayName: 'iPhone 14', brand: 'Apple', deviceType: 'mobile' },
  'iphone-15': { displayName: 'iPhone 15', brand: 'Apple', deviceType: 'mobile' },
  'iphone-13': { displayName: 'iPhone 13', brand: 'Apple', deviceType: 'mobile' },
  'samsung-galaxy-s23': { displayName: 'Samsung Galaxy S23', brand: 'Samsung', deviceType: 'mobile' },
  'samsung-galaxy-s22': { displayName: 'Samsung Galaxy S22', brand: 'Samsung', deviceType: 'mobile' },
  'google-pixel-7': { displayName: 'Google Pixel 7', brand: 'Google', deviceType: 'mobile' },
  'macbook-pro-2023': { displayName: 'MacBook Pro 2023', brand: 'Apple', deviceType: 'laptop' }
};

// Service slugs and display names from repair page
const SERVICE_DISPLAY_NAMES: Record<string, string> = {
  'screen-repair': 'Screen Repair',
  'battery-replacement': 'Battery Replacement',
  'charging-port-repair': 'Charging Port Repair',
  'laptop-screen-repair': 'Laptop Screen Repair',
  'water-damage-repair': 'Water Damage Repair',
  'software-repair': 'Software Repair',
  'camera-repair': 'Camera Repair'
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // Import the data service functions
    const { getAllActiveCities, getAllActiveServices } = await import('@/lib/data-service');
    
    // Get all active cities from database
    const activeCities = await getAllActiveCities();
    
    // Get all active services from database
    const activeServices = await getAllActiveServices();
    
    // Generate all city-service combinations
    const paths = [];
    
    for (const city of activeCities) {
      const citySlug = city.slug;
      
      for (const service of activeServices) {
        paths.push({
          params: {
            city: citySlug,
            service: service.name // service.name is the slug from the database
          }
        });
      }
    }
    
    // Also include the original popular combinations as a fallback
    // in case database query fails or returns no cities/services
    if (paths.length === 0) {
      const popularCombinations = [
        { city: 'vancouver', service: 'screen-repair' },
        { city: 'vancouver', service: 'battery-replacement' },
        { city: 'burnaby', service: 'screen-repair' },
        { city: 'richmond', service: 'charging-port-repair' },
        { city: 'coquitlam', service: 'laptop-screen-repair' },
        { city: 'north-vancouver', service: 'water-damage-repair' },
        { city: 'surrey', service: 'software-repair' },
        { city: 'new-westminster', service: 'camera-repair' }
      ];
      
      for (const { city, service } of popularCombinations) {
        paths.push({
          params: { city, service }
        });
      }
    }
    
    console.log(`Generated ${paths.length} static paths for service pages (${activeCities.length} cities × ${activeServices.length} services)`);
    
    return {
      paths,
      fallback: 'blocking'
    };
  } catch (error) {
    console.error('Error generating static paths:', error);
    
    // Fallback to original popular combinations if there's an error
    const popularCombinations = [
      { city: 'vancouver', service: 'screen-repair' },
      { city: 'vancouver', service: 'battery-replacement' },
      { city: 'burnaby', service: 'screen-repair' },
      { city: 'richmond', service: 'charging-port-repair' },
      { city: 'coquitlam', service: 'laptop-screen-repair' },
      { city: 'north-vancouver', service: 'water-damage-repair' },
      { city: 'surrey', service: 'software-repair' },
      { city: 'new-westminster', service: 'camera-repair' }
    ];
    
    const paths = popularCombinations.map(({ city, service }) => ({
      params: { city, service }
    }));
    
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
    
    // Get all active services to find the service data
    const allServices = await getAllActiveServices();
    
    // Find the service by slug (serviceSlug from URL)
    const service = allServices.find(s => s.name === serviceSlug);
    
    // If service not found, try to map using service mapping logic
    let serviceDisplayName = service?.display_name || serviceSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    // Note: service object from getAllActiveServices() doesn't have a description property
    // We'll use a generic description based on the service name
    let serviceDescription = `Professional ${serviceDisplayName.toLowerCase()} services in ${cityData?.city || citySlug.replace('-', ' ')}.`;
    
    // Use the service mapping logic from data-service.ts to get the correct service name
    // The serviceSlug from URL might need to be mapped to the database service name
    const serviceData = {
      name: serviceSlug,
      displayName: serviceDisplayName,
      description: serviceDescription
    };

    // Get all models for this service from database
    const modelsFromDb = await getModelsForService(serviceSlug);
    
    // Transform database models to the format expected by the page
    const models = modelsFromDb.map(model => ({
      slug: model.slug,
      displayName: model.display_name || model.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      brand: model.brand_name || 'Various',
      deviceType: model.device_type || 'mobile',
      imageUrl: `/images/devices/${model.slug}.webp`
    }));

    const wikidataId = WIKIDATA_MAP[citySlug];

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
          name: cityData?.city || citySlug.replace('-', ' '),
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
        wikidataId: WIKIDATA_MAP[citySlug],
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

  // Generate breadcrumb items for the current page
  const breadcrumbItems = createBreadcrumbs(`/repair/${city}/${service}`);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        
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
                  href="tel:+17783899251" 
                  className="btn-outline border-white text-white hover:bg-primary-600 text-lg px-8 py-4 flex items-center justify-center"
                >
                  <FaPhone className="mr-2" />
                  (778) 389-9251
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