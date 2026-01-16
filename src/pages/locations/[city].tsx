import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { FaPhone, FaClock, FaShieldAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { LocalBusinessSchema, ReviewSchema } from '@/components/seo/StructuredData';
import { TechnicianSchema } from '@/components/seo/TechnicianSchema';
import { getCityData, getAllActiveCities } from '@/lib/data-service';
import { getSameAsUrls, getCityNameFromSlug } from '@/utils/wikidata';
import { GetStaticPaths, GetStaticProps } from 'next';

// Static fallback testimonials (used if database fails)
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
    latitude?: number;
    longitude?: number;
    sameAsUrls: string[];
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
      // Use database data
      return {
        props: {
          cityData: {
            name: dbCityData.city || citySlug.replace('-', ' '),
            slug: citySlug,
            testimonials: staticTestimonials,
            neighborhoods: staticNeighborhoods,
            commonRepairs: staticCommonRepairs,
            phoneNumber: '(604) 555-1234',
            latitude: 49.2827,
            longitude: -123.1207,
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
          phoneNumber: '(604) 555-1234',
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
          phoneNumber: '(604) 555-1234',
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
    sameAsUrls
  } = cityData;

  return (
    <>
      <Head>
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

        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {name} Neighborhoods We Serve
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Doorstep repair service available throughout {name}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {neighborhoods.map((area, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-3 text-center hover:bg-primary-50 hover:text-primary-700 transition-colors"
                >
                  <FaMapMarkerAlt className="inline-block mr-1 h-4 w-4" />
                  {area}
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">
                Don't see your {name} neighborhood listed? We likely serve it too!
              </p>
              <Link href="/book-online" className="btn-primary">
                Check Service Availability
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
