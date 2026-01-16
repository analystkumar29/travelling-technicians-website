import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FaCheckCircle, FaLaptop, FaBatteryFull, FaKeyboard, FaMouse, 
  FaMemory, FaHdd, FaBug, FaShieldAlt, FaFan, FaBolt,
  FaMobileAlt, FaMicrophone, FaCamera, FaWater, FaSdCard,
  FaTabletAlt, FaVolumeUp, FaHandPointer, FaSyncAlt,
  FaShieldAlt as FaShield, FaRocket, FaTools, FaCertificate, FaClock, FaHome
} from 'react-icons/fa';
import { ServiceSchema, LocalBusinessSchema } from '@/components/seo/StructuredData';
import { getServicesByDeviceType, getBrandsByDeviceType, getAllActiveServiceSlugs } from '@/lib/data-service';
import OptimizedImage from '@/components/common/OptimizedImage';
import { GetStaticProps, GetStaticPaths } from 'next';
import { serviceConfig, ServiceSlug } from '@/config/service-page-config';

// Map icon names to React components
const iconMap: Record<string, React.ReactNode> = {
  'laptop': <FaLaptop className="h-10 w-10" />,
  'battery-full': <FaBatteryFull className="h-10 w-10" />,
  'keyboard': <FaKeyboard className="h-10 w-10" />,
  'mouse': <FaMouse className="h-10 w-10" />,
  'memory': <FaMemory className="h-10 w-10" />,
  'hard-drive': <FaHdd className="h-10 w-10" />,
  'bug': <FaBug className="h-10 w-10" />,
  'shield-alt': <FaShieldAlt className="h-10 w-10" />,
  'fan': <FaFan className="h-10 w-10" />,
  'bolt': <FaBolt className="h-10 w-10" />,
  'mobile-alt': <FaMobileAlt className="h-10 w-10" />,
  'microphone': <FaMicrophone className="h-10 w-10" />,
  'camera': <FaCamera className="h-10 w-10" />,
  'water': <FaWater className="h-10 w-10" />,
  'sd-card': <FaSdCard className="h-10 w-10" />,
  'tablet-alt': <FaTabletAlt className="h-10 w-10" />,
  'volume-up': <FaVolumeUp className="h-10 w-10" />,
  'hand-pointer': <FaHandPointer className="h-10 w-10" />,
  'sync-alt': <FaSyncAlt className="h-10 w-10" />,
  'microchip': <FaMemory className="h-10 w-10" />,
  'droplet': <FaWater className="h-10 w-10" />,
  'settings': <FaSyncAlt className="h-10 w-10" />,
  'wrench': <FaBolt className="h-10 w-10" />,
};

interface Service {
  id: number;
  name: string;
  description: string;
  icon: string;
  doorstep: boolean;
  limited: boolean;
  price: string;
  popular: boolean;
}

interface ServicePageProps {
  slug: ServiceSlug;
  services: Service[];
  brands: string[];
  config: typeof serviceConfig[ServiceSlug];
}

export default function ServicePage({ slug, services, brands, config }: ServicePageProps) {
  // Map icon strings to React components
  const servicesWithIcons = services.map(service => ({
    ...service,
    icon: iconMap[service.icon] || <FaLaptop className="h-10 w-10" />
  }));

  const popularServices = servicesWithIcons.filter(service => service.popular);

  return (
    <>
      <Head>
        {/* Service Structured Data */}
        <ServiceSchema
          name={config.title}
          description={`${config.serviceDescription} Convenient doorstep service across Vancouver and Lower Mainland.`}
          serviceType={config.title.replace(' Services', '')}
          provider="The Travelling Technicians"
          hasOfferCatalog={{
            name: config.title,
            description: `Comprehensive ${config.deviceType} repair services`,
            offers: services.map(service => ({
              name: service.name,
              description: service.description,
              priceCurrency: "CAD",
              priceRange: service.price
            }))
          }}
          doorstepService={true}
          warranty="1 year"
        />
        <LocalBusinessSchema />
      </Head>
      <Layout title={`${config.title} | The Travelling Technicians`}>
        {/* Hero Section */}
        <section className="pt-16 pb-20 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  {config.heroTitle}
                </h1>
                <p className="text-xl mb-8 text-primary-100">
                  {config.heroDescription}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={`/book-online?deviceType=${config.deviceType}`} className="btn-accent text-center">
                    Book {config.deviceType.charAt(0).toUpperCase() + config.deviceType.slice(1)} Repair
                  </Link>
                  <Link href="/pricing" className="btn-outline border-white text-white hover:bg-primary-600 text-center">
                    View Pricing
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="relative h-[450px] w-full rounded-lg overflow-hidden shadow-custom-lg">
                  <OptimizedImage
                    src={config.image}
                    alt={config.imageAlt}
                    fill
                    className="object-cover object-center"
                    isCritical={true}
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-custom-lg">
                  <div className="text-center">
                    <p className="font-bold text-2xl text-primary-600">{config.repairTime}</p>
                    <p className="text-sm text-gray-600">Most repairs completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our {config.deviceType.charAt(0).toUpperCase() + config.deviceType.slice(1)} Repair Services</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Professional {config.deviceType} repair services brought directly to your doorstep by our certified technicians.
              </p>
              <div className="flex justify-center items-center mt-4">
                <div className="flex items-center mr-6">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span className="text-gray-700">Available for doorstep service</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-yellow-500 mr-2" />
                  <span className="text-gray-700">Limited doorstep availability</span>
                </div>
              </div>
            </div>

            {/* Popular Services */}
            {popularServices.length > 0 && (
              <div className="mb-16">
                <h3 className="text-2xl font-bold mb-8 text-center">Most Popular Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {popularServices.map((service) => (
                    <div key={service.id} className="card hover:shadow-custom-lg transition-shadow border border-gray-100">
                      <div className="flex flex-col md:flex-row md:items-center">
                        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                            {service.icon}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center mb-2">
                            <h3 className="text-xl font-bold mr-3">{service.name}</h3>
                            {service.doorstep && !service.limited && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Doorstep Service
                              </span>
                            )}
                            {service.limited && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                Limited Doorstep
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{service.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg text-primary-600">{service.price}</span>
                            <div className="flex justify-center mt-6">
                              <Link href={`/book-online?deviceType=${config.deviceType}`} className="btn-primary text-sm py-2">
                                Book This Service
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Services */}
            <h3 className="text-2xl font-bold mb-8 text-center">All {config.deviceType.charAt(0).toUpperCase() + config.deviceType.slice(1)} Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {servicesWithIcons.map((service) => (
                <div key={service.id} className="card hover:shadow-custom-lg transition-shadow border border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                        {service.icon}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-bold mr-3">{service.name}</h3>
                        {service.doorstep && !service.limited && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Doorstep Service
                          </span>
                        )}
                        {service.limited && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            Limited Doorstep
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{service.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg text-primary-600">{service.price}</span>
                        <Link href={`/book-online?deviceType=${config.deviceType}`} className="btn-primary text-sm py-2">
                          Book This Service
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brands Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Brands We Service</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {config.brandsDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {brands.map((brand, index) => (
                <div key={index} className="card text-center py-6 hover:shadow-custom-lg transition-shadow">
                  <p className="font-medium text-gray-700">{brand}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{config.whyTitle}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {config.whyDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="card hover:shadow-custom-lg transition-shadow text-center p-6">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Time-Saving Convenience</h3>
                <p className="text-gray-600">No need to leave your home or office. We come to you at a time that works for your schedule.</p>
              </div>

              <div className="card hover:shadow-custom-lg transition-shadow text-center p-6">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Quality Guaranteed</h3>
                <p className="text-gray-600">We use only premium parts and provide a 90-day warranty on all our {config.deviceType} repairs.</p>
              </div>

              <div className="card hover:shadow-custom-lg transition-shadow text-center p-6">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Fast Service</h3>
                <p className="text-gray-600">Most {config.deviceType} repairs are completed within {config.repairTime}, minimizing your device downtime.</p>
              </div>

              <div className="card hover:shadow-custom-lg transition-shadow text-center p-6">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Certified Technicians</h3>
                <p className="text-gray-600">Our repair specialists are fully certified and experienced with all major {config.deviceType} brands.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{config.processTitle}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {config.processDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {config.processSteps.map((step, index) => (
                <div key={index} className="card hover:shadow-custom-lg transition-shadow p-6 text-center">
                  <div className="relative">
                    <div className="rounded-full bg-primary-600 w-12 h-12 flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                      {index + 1}
                    </div>
                    {/* Connecting line between steps on desktop */}
                    {index < config.processSteps.length - 1 && (
                      <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-primary-100"></div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary-600 text-white">
          <div className="container-custom">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Fix Your {config.deviceType.charAt(0).toUpperCase() + config.deviceType.slice(1)}?</h2>
              <p className="text-xl mb-8 max-w-3xl mx-auto">
                Book our doorstep {config.deviceType} repair service and have your {config.deviceType === 'laptop' ? 'computer' : config.deviceType} fixed without the hassle of going to a repair shop.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href={`/book-online?deviceType=${config.deviceType}`} className="btn-accent text-center">
                  Book Your Repair
                </Link>
                <Link href="/contact" className="btn-outline border-white text-white hover:bg-primary-700 text-center">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // Fetch active service slugs from database
    const activeSlugs = await getAllActiveServiceSlugs();
    
    // Map to Next.js paths format
    const paths = activeSlugs.map(({ slug }) => ({
      params: { slug },
    }));

    return {
      paths,
      fallback: 'blocking', // Generate new pages on-demand if not pre-rendered
    };
  } catch (error) {
    console.error('Error fetching active service slugs:', error);
    
    // Fallback to hardcoded paths if database fails
    const fallbackPaths = [
      { params: { slug: 'laptop-repair' } },
      { params: { slug: 'mobile-repair' } },
      { params: { slug: 'tablet-repair' } },
    ];

    return {
      paths: fallbackPaths,
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as ServiceSlug;

  // Validate slug
  if (!slug || !serviceConfig[slug]) {
    return {
      notFound: true,
    };
  }

  const config = serviceConfig[slug];
  
  // Map slug to device type ID for database queries
  const deviceTypeMap: Record<ServiceSlug, number> = {
    'laptop-repair': 2, // laptop
    'mobile-repair': 1, // mobile
    'tablet-repair': 3, // tablet
  };

  const deviceTypeId = deviceTypeMap[slug];
  
  // Map device type ID to string for the API functions
  const deviceTypeStringMap: Record<number, 'laptop' | 'mobile' | 'tablet'> = {
    1: 'mobile',
    2: 'laptop',
    3: 'tablet',
  };
  
  const deviceTypeString = deviceTypeStringMap[deviceTypeId];

  try {
    // Fetch services and brands from database with fallback
    const services = await getServicesByDeviceType(deviceTypeString);
    const brands = await getBrandsByDeviceType(deviceTypeString);

    return {
      props: {
        slug,
        services,
        brands,
        config,
      },
      revalidate: 3600, // Revalidate every hour (ISR)
    };
  } catch (error) {
    console.error(`Error fetching data for ${slug}:`, error);
    
    // Return fallback data if database fails
    // This ensures the page still works even if database is down
    const fallbackServices = config.fallbackServices || [];
    const fallbackBrands = config.fallbackBrands || [];

    return {
      props: {
        slug,
        services: fallbackServices,
        brands: fallbackBrands,
        config,
      },
      revalidate: 60, // Shorter revalidation time for fallback
    };
  }
};
