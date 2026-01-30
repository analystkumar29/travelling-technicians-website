import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { FaPhone, FaClock, FaShieldAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { LocalBusinessSchema, ReviewSchema, PlaceSchema, CityLocalBusinessSchema } from '@/components/seo/StructuredData';
import { TechnicianSchema } from '@/components/seo/TechnicianSchema';
import { NeighborhoodLinks } from '@/components/seo/NeighborhoodLinks';
import { LocalContent } from '@/components/seo/LocalContent';
import { getCityData, getAllActiveCities } from '@/lib/data-service';
import { getSameAsUrls, getCityNameFromSlug } from '@/utils/wikidata';
import { GetStaticPaths, GetStaticProps } from 'next';

// Static fallback testimonials (used if database fails)
// City-specific testimonial mapping
const cityTestimonialMap: Record<string, typeof staticTestimonials> = {
  vancouver: [
    {
      id: 1,
      name: 'Sarah J.',
      location: 'Downtown Vancouver',
      rating: 5,
      comment: 'Amazing doorstep service! Fixed my iPhone screen right at my Yaletown condo. Professional and fast.',
      device: 'iPhone 14 Pro',
      neighborhood: 'Yaletown'
    },
    {
      id: 2,
      name: 'David M.',
      location: 'Kitsilano, Vancouver',
      rating: 5,
      comment: 'Best tech repair service in Vancouver! Fixed my MacBook battery in under an hour at my home.',
      device: 'MacBook Air 2021',
      neighborhood: 'Kitsilano'
    }
  ],
  burnaby: [
    {
      id: 3,
      name: 'Michael C.',
      location: 'Metrotown, Burnaby',
      rating: 5,
      comment: 'Had my MacBook battery replaced at home. Professional service and saved me a trip to the mall. Highly recommend!',
      device: 'MacBook Pro 2019',
      neighborhood: 'Metrotown'
    },
    {
      id: 4,
      name: 'Jennifer L.',
      location: 'Brentwood, Burnaby',
      rating: 4,
      comment: 'Great doorstep service in Burnaby! Quick, reliable, and fair pricing. Will use again.',
      device: 'iPhone 12',
      neighborhood: 'Brentwood'
    }
  ],
  coquitlam: [
    {
      id: 5,
      name: 'Robert T.',
      location: 'Coquitlam Centre, Coquitlam',
      rating: 5,
      comment: 'Excellent repair service right to my door in Coquitlam. Technician was knowledgeable and fast.',
      device: 'Samsung Galaxy S22',
      neighborhood: 'Coquitlam Centre'
    }
  ],
  richmond: [
    {
      id: 6,
      name: 'Jason T.',
      location: 'Richmond',
      rating: 4,
      comment: 'Great doorstep service for my Samsung. The price was fair and the repair was done perfectly.',
      device: 'Samsung Galaxy S22',
      neighborhood: 'Richmond Centre'
    }
  ],
  'north-vancouver': [
    {
      id: 7,
      name: 'Anna W.',
      location: 'North Vancouver',
      rating: 5,
      comment: 'Amazing convenience! The technician was punctual and fixed my laptop keyboard issue in under an hour.',
      device: 'Dell XPS 13',
      neighborhood: 'Lonsdale'
    }
  ]
};

const staticTestimonials = [
  {
    id: 1,
    name: 'Sarah J.',
    location: 'Downtown Vancouver',
    rating: 5,
    comment: 'Amazing doorstep service! Fixed my iPhone screen right at my Yaletown condo. Professional and fast.',
    device: 'iPhone 14 Pro',
    neighborhood: 'Yaletown'
  }
];

// Static fallback neighborhoods (used if database fails)
const staticNeighborhoods = [
  'Downtown', 'Yaletown', 'Coal Harbour', 'West End'
];

// Static fallback common repairs
const staticCommonRepairs = [
  {
    service: 'iPhone Screen Repair',
    price: 'From $89',
    time: '30-45 mins',
    popular: true
  }
];

interface CityRepairPageProps {
  cityData: {
    name: string;
    slug: string;
    testimonials: typeof staticTestimonials;
    neighborhoods: string[];
    commonRepairs: typeof staticCommonRepairs;
    phoneNumber: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    sameAsUrls: string[];
    operatingHours?: {
      weekday?: { open: string; close: string };
      saturday?: { open: string; close: string };
      sunday?: { open: string; close: string };
    };
    serviceSince?: string;
    localContent?: string;
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // Get all active cities from database
    const cities = await getAllActiveCities();
    
    // If database fails, use static fallback paths
    const paths = cities.length > 0 
      ? cities.map(city => ({ params: { city: city.slug } }))
      : [
          { params: { city: 'vancouver' } },
          { params: { city: 'burnaby' } }
        ];

    return {
      paths,
      fallback: 'blocking' // ISR: generate new cities on demand
    };
  } catch (error) {
    console.error('Error in getStaticPaths, using static fallback:', error);
    return {
      paths: [
        { params: { city: 'vancouver' } },
        { params: { city: 'burnaby' } }
      ],
      fallback: 'blocking'
    };
  }
};

export const getStaticProps: GetStaticProps<CityRepairPageProps> = async ({ params }) => {
  const citySlug = params?.city as string;
  
  try {
    // Try to fetch city data from database
    const dbCityData = await getCityData(citySlug);
    
    // Get Wikidata sameAs URLs for this city
    const sameAsUrls = getSameAsUrls(citySlug);
    
    if (dbCityData) {
      // Use database data with enhanced fields
      // Get city-specific testimonials
      const citySpecificTestimonials = cityTestimonialMap[citySlug] || staticTestimonials;
      
      return {
        props: {
          cityData: {
            name: dbCityData.city || citySlug.replace('-', ' '),
            slug: citySlug,
            testimonials: citySpecificTestimonials,
            neighborhoods: dbCityData.neighborhoods && dbCityData.neighborhoods.length > 0 
              ? dbCityData.neighborhoods 
              : staticNeighborhoods,
            commonRepairs: dbCityData.common_repairs && dbCityData.common_repairs.length > 0
              ? dbCityData.common_repairs
              : staticCommonRepairs,
            phoneNumber: dbCityData.local_phone || '+1-778-389-9251',
            email: dbCityData.local_email || 'info@travellingtechnicians.ca',
            latitude: dbCityData.latitude || 49.2827,
            longitude: dbCityData.longitude || -123.1207,
            operatingHours: dbCityData.operating_hours || {
              weekday: { open: '08:00', close: '20:00' },
              saturday: { open: '09:00', close: '18:00' },
              sunday: { open: '10:00', close: '17:00' }
            },
            serviceSince: dbCityData.service_since || '2020-01-01',
            localContent: dbCityData.local_content || undefined,
            sameAsUrls
          }
        },
        revalidate: 3600 // ISR: Revalidate every hour
      };
    }
    
    // If no database data, use static fallback with city name
    const cityName = getCityNameFromSlug(citySlug);
    
    return {
      props: {
        cityData: {
          name: cityName,
          slug: citySlug,
          testimonials: staticTestimonials,
          neighborhoods: staticNeighborhoods,
          commonRepairs: staticCommonRepairs,
          phoneNumber: '+1-778-389-9251',
          email: 'info@travellingtechnicians.ca',
          latitude: 49.2827,
          longitude: -123.1207,
          sameAsUrls
        }
      },
      revalidate: 3600
    };
  } catch (error) {
    console.error(`Error fetching data for city ${citySlug}, using static fallback:`, error);
    
    const cityName = getCityNameFromSlug(citySlug);
    const sameAsUrls = getSameAsUrls(citySlug);
    
    return {
      props: {
        cityData: {
          name: cityName,
          slug: citySlug,
          testimonials: staticTestimonials,
          neighborhoods: staticNeighborhoods,
          commonRepairs: staticCommonRepairs,
          phoneNumber: '+1-778-389-9251',
          email: 'info@travellingtechnicians.ca',
          latitude: 49.2827,
          longitude: -123.1207,
          sameAsUrls
        }
      },
      revalidate: 3600
    };
  }
};

export default function CityRepairPage({ cityData }: CityRepairPageProps) {
  const {
    name,
    testimonials,
    neighborhoods,
    commonRepairs,
    phoneNumber,
    email,
    latitude,
    longitude,
    sameAsUrls,
    operatingHours,
    serviceSince,
    localContent
  } = cityData;

  return (
    <>
      <Head>
        {/* Place Schema for Map Pack visibility with precise geo-coordinates */}
        {latitude && longitude && (
          <PlaceSchema
            name={`The Travelling Technicians - ${name}`}
            description={`Professional mobile phone and laptop repair services with doorstep service in ${name}, BC. Same-day repairs available.`}
            latitude={latitude}
            longitude={longitude}
            address={{
              streetAddress: `${name} Service Area`,
              addressLocality: name,
              addressRegion: "BC",
              addressCountry: "CA"
            }}
            telephone={phoneNumber}
            url={`/locations/${name.toLowerCase().replace(/\s+/g, '-')}`}
            openingHours={operatingHours}
            areaServed={neighborhoods}
          />
        )}

        {/* City-specific LocalBusiness Schema with Openness Signal */}
        {latitude && longitude && (
          <CityLocalBusinessSchema
            cityName={name}
            description={`Professional mobile phone and laptop repair services with doorstep service in ${name}, BC.`}
            latitude={latitude}
            longitude={longitude}
            telephone={phoneNumber}
            email={email}
            neighborhoods={neighborhoods}
            openingHours={operatingHours}
            serviceSince={serviceSince}
            url={`/locations/${name.toLowerCase().replace(/\s+/g, '-')}`}
          />
        )}

        {/* Fallback LocalBusiness Schema */}
        <LocalBusinessSchema
          name={`The Travelling Technicians - ${name}`}
          description={`Professional mobile phone and laptop repair services with doorstep service in ${name}, BC.`}
          address={{
            streetAddress: `${name} Service Area`,
            addressLocality: name,
            addressRegion: "BC",
            addressCountry: "CA"
          }}
          areaServed={[`${name}, BC`]}
          sameAs={sameAsUrls}
          geo={{
            latitude: latitude || 49.2827,
            longitude: longitude || -123.1207
          }}
        />
        
        {/* E-E-A-T Technician Schema for city-specific expertise */}
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
        title={`Mobile & Laptop Repair ${name} | The Travelling Technicians`}
        metaDescription={`Professional mobile and laptop repair in ${name}. Doorstep service to all neighborhoods.`}
      >
        <section className="pt-16 pb-12 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
          <div className="container-custom">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <FaMapMarkerAlt className="h-6 w-6 mr-2" />
                <span className="text-primary-200">{name}, BC</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Mobile & Laptop Repair<br />
                <span className="text-accent-400">{name}</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-primary-100">
                Doorstep repair service to all {name} neighborhoods
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/book-online" className="btn-accent text-lg px-8 py-4">
                  Book Repair in {name}
                </Link>
                <a href={`tel:${phoneNumber}`} className="btn-outline border-white text-white hover:bg-primary-600 text-lg px-8 py-4 flex items-center justify-center">
                  <FaPhone className="mr-2" />
                  {phoneNumber}
                </a>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center">
                  <FaClock className="mr-2 h-4 w-4" />
                  Same-Day Service
                </div>
                <div className="flex items-center">
                  <FaShieldAlt className="mr-2 h-4 w-4" />
                  90-Day Warranty
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
                <p className="text-gray-600">{name} Repairs</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-2">4.8★</div>
                <p className="text-gray-600">Customer Rating</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-2">95%</div>
                <p className="text-gray-600">Same-Day Service</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-2">90</div>
                <p className="text-gray-600">Day Warranty</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Device Repair Services in {name}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Professional repair services delivered directly to your location in {name}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Popular Repairs in {name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {commonRepairs.map((repair, index) => (
                  <div key={index} className="text-center p-4 rounded-lg bg-gray-50">
                    {repair.popular && (
                      <span className="inline-block bg-accent-500 text-white text-xs px-2 py-1 rounded-full mb-2">
                        Popular
                      </span>
                    )}
                    <h4 className="font-bold mb-2">{repair.service}</h4>
                    <p className="text-primary-600 font-bold mb-1">{repair.price}</p>
                    <p className="text-sm text-gray-600">{repair.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Phase 4: NeighborhoodLinks Component */}
        <NeighborhoodLinks
          cityName={name}
          citySlug={cityData.slug}
          neighborhoods={neighborhoods}
          title="Service Neighborhoods"
        />

        {/* Phase 5: LocalContent Component */}
        <LocalContent content={localContent} cityName={name} />
      </Layout>
    </>
  );
}
