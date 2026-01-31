import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { FaPhone, FaClock, FaShieldAlt, FaMapMarkerAlt, FaTools, FaCheckCircle } from 'react-icons/fa';
import { LocalBusinessSchema, ServiceSchema } from '@/components/seo/StructuredData';
import { TechnicianSchema } from '@/components/seo/TechnicianSchema';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import NearbyCities, { NearbyCity } from '@/components/seo/NearbyCities';
import { GetStaticPaths, GetStaticProps } from 'next';
import { getCityData, getDynamicPricing, getNearbyLocations } from '@/lib/data-service';
import { createBreadcrumbs } from '@/utils/seoHelpers';

interface CityServiceModelPageProps {
  city: string;
  service: string;
  model: string;
  cityData: {
    name: string;
    slug: string;
  };
  serviceData: {
    name: string;
    displayName: string;
    description?: string;
    estimatedDurationMinutes: number;
  };
  modelData: {
    name: string;
    displayName: string;
    brand: string;
    deviceType: string;
    imageUrl?: string;
  };
  pricingData: {
    basePrice: number;
    discountedPrice: number | null;
    priceRange: string;
  };
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

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // Import the data service functions
    const { getAllActiveCities, getAllActiveServices, getModelsForService } = await import('@/lib/data-service');
    
    // Get all active cities from database
    const activeCities = await getAllActiveCities();
    
    // Get all active services from database
    const activeServices = await getAllActiveServices();
    
    // Generate all combinations
    const paths = [];

    const serviceSlugMapping: Record<string, string> = {
      'screen-replacement-mobile': 'screen-repair',
      'screen-replacement-laptop': 'laptop-screen-repair',
      'battery-replacement-mobile': 'battery-replacement',
      'battery-replacement-laptop': 'battery-replacement'
    };
    
    for (const city of activeCities) {
      const citySlug = city.slug;
      
      for (const service of activeServices) {
        const serviceSlug = serviceSlugMapping[service.slug] || service.slug;
        
        // Get models for this specific service
        const models = await getModelsForService(serviceSlug);
        
        for (const model of models) {
          const modelSlug = model.slug;
          
          paths.push({
            params: {
              city: citySlug,
              service: serviceSlug,
              model: modelSlug
            }
          });
        }
      }
    }
    
    // Also include the popular combinations for active services only as a fallback
    // in case database query fails or returns no combinations
    if (paths.length === 0) {
      const popularCombinations = [
        { city: 'vancouver', service: 'screen-repair', model: 'iphone-14' },
        { city: 'vancouver', service: 'battery-replacement', model: 'iphone-14' },
        { city: 'burnaby', service: 'screen-repair', model: 'samsung-galaxy-s23' },
        { city: 'coquitlam', service: 'laptop-screen-repair', model: 'macbook-pro-2023' }
      ];
      
      for (const { city, service, model } of popularCombinations) {
        paths.push({
          params: { city, service, model }
        });
      }
    }
    
    console.log(`Generated ${paths.length} static paths for repair pages`);
    
    return {
      paths,
      fallback: 'blocking'
    };
  } catch (error) {
    console.error('Error generating static paths:', error);
    
    // Fallback to popular combinations for active services only if there's an error
    const popularCombinations = [
      { city: 'vancouver', service: 'screen-repair', model: 'iphone-14' },
      { city: 'vancouver', service: 'battery-replacement', model: 'iphone-14' },
      { city: 'burnaby', service: 'screen-repair', model: 'samsung-galaxy-s23' },
      { city: 'coquitlam', service: 'laptop-screen-repair', model: 'macbook-pro-2023' }
    ];
    
    const paths = popularCombinations.map(({ city, service, model }) => ({
      params: { city, service, model }
    }));
    
    return {
      paths,
      fallback: 'blocking'
    };
  }
};

export const getStaticProps: GetStaticProps<CityServiceModelPageProps> = async ({ params }) => {
  const citySlug = params?.city as string;
  const serviceSlug = params?.service as string;
  const modelSlug = params?.model as string;

  try {
    const cityData = await getCityData(citySlug);
    
    const { getServiceBySlug, getModelBySlug } = await import('@/lib/data-service');

    const [serviceFromDb, modelFromDb] = await Promise.all([
      getServiceBySlug(serviceSlug),
      getModelBySlug(modelSlug)
    ]);

    const serviceDisplayName = serviceFromDb?.display_name
      || serviceSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    const serviceData = {
      name: serviceSlug,
      displayName: serviceDisplayName,
      description: serviceFromDb?.description
        ?? `Professional ${serviceDisplayName.toLowerCase()} service in ${cityData?.city_name ?? citySlug.replace('-', ' ')}.`,
      estimatedDurationMinutes: serviceFromDb?.estimated_duration_minutes
        ?? (serviceSlug.includes('screen') ? 45 : serviceSlug.includes('battery') ? 60 : 90)
    };

    const modelData = {
      name: modelSlug,
      displayName: modelFromDb?.display_name
        ?? modelSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      brand: modelFromDb?.brand_name ?? 'Various',
      deviceType: modelFromDb?.device_type ?? 'mobile',
      imageUrl: `/images/devices/${modelSlug}.webp`
    };

    // Fetch dynamic pricing from database
    const dynamicPricing = await getDynamicPricing(citySlug, serviceSlug, modelSlug);
    
    const pricingData = {
      basePrice: dynamicPricing.basePrice,
      discountedPrice: dynamicPricing.discountedPrice ?? null,
      priceRange: dynamicPricing.priceRange
    };

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
        model: modelSlug,
        cityData: {
          name: cityData?.city_name ?? citySlug.replace('-', ' '),
          slug: citySlug
        },
        serviceData,
        modelData,
        pricingData,
        wikidataId,
        nearbyCities
      },
      revalidate: 3600
    };
  } catch (error) {
    console.error(`Error fetching data for ${citySlug}/${serviceSlug}/${modelSlug}:`, error);
    
    // Fallback to hardcoded pricing if database fetch fails
    const fallbackBasePrice = serviceSlug.includes('screen') ? 129 : serviceSlug.includes('battery') ? 99 : 149;
    const fallbackDiscountedPrice = serviceSlug.includes('screen') ? 109 : serviceSlug.includes('battery') ? 89 : 129;
    const fallbackPriceRange = serviceSlug.includes('screen') ? '$109-$189' : serviceSlug.includes('battery') ? '$89-$149' : '$129-$249';
    
    return {
      props: {
        city: citySlug,
        service: serviceSlug,
        model: modelSlug,
        cityData: {
          name: citySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          slug: citySlug
        },
        serviceData: {
          name: serviceSlug,
          displayName: serviceSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          description: `Professional repair service in ${citySlug.replace('-', ' ')}.`,
          estimatedDurationMinutes: serviceSlug.includes('screen') ? 45 : serviceSlug.includes('battery') ? 60 : 90
        },
        modelData: {
          name: modelSlug,
          displayName: modelSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          brand: 'Various',
          deviceType: 'mobile',
          imageUrl: '/images/devices/default.webp'
        },
        pricingData: {
          basePrice: fallbackBasePrice,
          discountedPrice: fallbackDiscountedPrice,
          priceRange: fallbackPriceRange
        },
        wikidataId: WIKIDATA_MAP[citySlug] ?? null,
        nearbyCities: [] // Empty array for fallback
      },
      revalidate: 3600
    };
  }
};

export default function CityServiceModelPage({
  city,
  service,
  model,
  cityData,
  serviceData,
  modelData,
  pricingData,
  wikidataId,
  nearbyCities
}: CityServiceModelPageProps) {
  const pageTitle = `${modelData.displayName} ${serviceData.displayName} in ${cityData.name} | The Travelling Technicians`;
  const metaDescription = `Professional ${modelData.displayName} ${serviceData.displayName.toLowerCase()} service in ${cityData.name}, BC. Doorstep repair with certified technicians. ${pricingData.priceRange} with 90-day warranty.`;
  
  const sameAs = wikidataId ? [`https://www.wikidata.org/wiki/${wikidataId}`] : [];

  // Generate breadcrumb items for the current page
  const breadcrumbItems = createBreadcrumbs(`/repair/${city}/${service}/${model}`);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`https://www.travelling-technicians.ca/repair/${city}/${service}/${model}`} />
        
        <LocalBusinessSchema
          name={`The Travelling Technicians - ${cityData.name}`}
          description={`Professional ${modelData.brand} ${modelData.displayName} repair services in ${cityData.name}, BC.`}
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
          name={`${modelData.displayName} ${serviceData.displayName}`}
          description={`Professional ${serviceData.displayName.toLowerCase()} for ${modelData.displayName} in ${cityData.name}, BC. Doorstep service with certified technicians.`}
          serviceType={`${modelData.deviceType} Repair`}
          areaServed={[`${cityData.name}, BC`]}
          hasOfferCatalog={{
            name: `${modelData.displayName} Repair Services`,
            description: `Complete repair services for ${modelData.displayName} in ${cityData.name}`,
            offers: [{
              name: `${serviceData.displayName}`,
              description: `Professional ${serviceData.displayName.toLowerCase()} for ${modelData.displayName}`,
              priceCurrency: "CAD",
              priceRange: pricingData.priceRange
            }]
          }}
          doorstepService={true}
          warranty="90 days"
        />
        
        <TechnicianSchema
          includeAggregate={true}
          aggregateData={{
            totalTechnicians: 4,
            averageExperience: 7.25,
            totalCertifications: 11
          }}
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
                {modelData.displayName}<br />
                <span className="text-accent-400">{serviceData.displayName}</span><br />
                <span className="text-2xl md:text-3xl">in {cityData.name}</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-primary-100">
                Doorstep repair service for your {modelData.brand} device
              </p>
              
              <div className="inline-block bg-accent-500 text-white text-lg px-6 py-3 rounded-full mb-8">
                <span className="font-bold">{pricingData.priceRange}</span>
                <span className="ml-2 text-primary-100">with 90-day warranty</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link 
                  href={`/book-online?city=${city}&service=${service}&model=${model}`} 
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
                  {serviceData.estimatedDurationMinutes} min service
                </div>
                <div className="flex items-center">
                  <FaShieldAlt className="mr-2 h-4 w-4" />
                  90-Day Warranty
                </div>
                <div className="flex items-center">
                  <FaTools className="mr-2 h-4 w-4" />
                  Certified {modelData.brand} Technicians
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
                  {modelData.displayName} {serviceData.displayName}
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  Our certified {modelData.brand} technicians specialize in {serviceData.displayName.toLowerCase()} for the {modelData.displayName}. 
                  We bring all necessary tools and genuine parts directly to your location in {cityData.name}.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900">Same-Day Service Available</h3>
                      <p className="text-gray-600">Most repairs completed within {serviceData.estimatedDurationMinutes} minutes at your doorstep.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900">Genuine Parts</h3>
                      <p className="text-gray-600">We use high-quality, tested parts with 90-day warranty on all repairs.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900">Certified Technicians</h3>
                      <p className="text-gray-600">Our technicians are {modelData.brand}-certified with years of experience.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-3">Service Includes:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-accent-500 rounded-full mr-3"></div>
                      Complete diagnosis and assessment
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-accent-500 rounded-full mr-3"></div>
                      Professional {serviceData.displayName.toLowerCase()} with genuine parts
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-accent-500 rounded-full mr-3"></div>
                      Quality testing and verification
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-accent-500 rounded-full mr-3"></div>
                      90-day warranty on parts and labor
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-accent-500 rounded-full mr-3"></div>
                      Free follow-up support
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Pricing for {cityData.name}</h3>
                  <div className="text-4xl font-bold text-accent-600 mb-4">
                    {pricingData.priceRange}
                  </div>
                  <p className="text-gray-600 mb-6">
                    Includes parts, labor, and 90-day warranty
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Base Price</span>
                      <span className="font-bold">${pricingData.basePrice}</span>
                    </div>
                    {pricingData.discountedPrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Discounted Price</span>
                        <span className="font-bold text-accent-600">${pricingData.discountedPrice}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Warranty</span>
                      <span className="font-bold">90 Days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Service Time</span>
                      <span className="font-bold">{serviceData.estimatedDurationMinutes} minutes</span>
                    </div>
                  </div>
                  
                  <Link
                    href={`/book-online?city=${city}&service=${service}&model=${model}`}
                    className="btn-accent w-full text-center py-4 mt-8 text-lg"
                  >
                    Book Now - {pricingData.discountedPrice ? `$${pricingData.discountedPrice}` : `$${pricingData.basePrice}`}
                  </Link>
                  
                  <div className="text-center mt-4 text-sm text-gray-500">
                    No hidden fees • Free diagnosis • Same-day service
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why Choose Us for {modelData.displayName} Repair in {cityData.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-accent-600 text-3xl mb-4">🏠</div>
                <h3 className="text-xl font-bold mb-3">Doorstep Service</h3>
                <p className="text-gray-600">
                  We come to you in {cityData.name}. No need to travel or wait in line.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-accent-600 text-3xl mb-4">🛡️</div>
                <h3 className="text-xl font-bold mb-3">90-Day Warranty</h3>
                <p className="text-gray-600">
                  All repairs come with a 90-day warranty on both parts and labor.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-accent-600 text-3xl mb-4">🔧</div>
                <h3 className="text-xl font-bold mb-3">Certified Technicians</h3>
                <p className="text-gray-600">
                  Our technicians are {modelData.brand}-certified with years of experience.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-accent-600 text-3xl mb-4">⚡</div>
                <h3 className="text-xl font-bold mb-3">Same-Day Service</h3>
                <p className="text-gray-600">
                  Most repairs completed within {serviceData.estimatedDurationMinutes} minutes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">
                  How long does {serviceData.displayName.toLowerCase()} take for {modelData.displayName}?
                </h3>
                <p className="text-gray-700">
                  Most {serviceData.displayName.toLowerCase()} services for {modelData.displayName} are completed within {serviceData.estimatedDurationMinutes} minutes at your location in {cityData.name}.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">
                  Do you use genuine parts for {modelData.brand} devices?
                </h3>
                <p className="text-gray-700">
                  Yes, we use high-quality, tested parts that meet or exceed {modelData.brand} specifications. All parts come with a 90-day warranty.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">
                  What areas of {cityData.name} do you serve?
                </h3>
                <p className="text-gray-700">
                  We serve all of {cityData.name} and surrounding areas. Our technicians travel directly to your home or office.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3">
                  What if my device has additional issues?
                </h3>
                <p className="text-gray-700">
                  We provide a free diagnosis before starting any repair. If additional issues are found, we'll provide a transparent quote before proceeding.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Nearby Cities linking widget */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <NearbyCities
              currentCitySlug={city}
              currentServiceSlug={service}
              currentModelSlug={model}
              nearbyCities={nearbyCities}
            />
          </div>
        </section>

        <section className="py-16 bg-primary-50">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Repair Your {modelData.displayName}?
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Book your {serviceData.displayName.toLowerCase()} in {cityData.name} today and get back to using your device.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/book-online?city=${city}&service=${service}&model=${model}`}
                className="btn-accent text-lg px-8 py-4"
              >
                Book {serviceData.displayName} Now
              </Link>
              <a
                href="tel:+17783899251"
                className="btn-outline border-primary-600 text-primary-600 hover:bg-primary-50 text-lg px-8 py-4"
              >
                Call (778) 389-9251
              </a>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}