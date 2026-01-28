import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { FaMapMarkerAlt, FaPhone, FaClock, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { LocalBusinessSchema } from '@/components/seo/StructuredData';
import { getSiteUrl } from '@/utils/supabaseClient';

// All cities we serve
const cities = [
  { slug: 'vancouver', name: 'Vancouver', description: 'Downtown, Yaletown, Kitsilano, West End & all Vancouver neighborhoods' },
  { slug: 'burnaby', name: 'Burnaby', description: 'Metrotown, Brentwood, Lougheed, Deer Lake & all Burnaby areas' },
  { slug: 'richmond', name: 'Richmond', description: 'Steveston, City Centre, Ironwood, Terra Nova & all Richmond neighborhoods' },
  { slug: 'surrey', name: 'Surrey', description: 'Guildford, Newton, Fleetwood, Whalley & all Surrey areas' },
  { slug: 'coquitlam', name: 'Coquitlam', description: 'Coquitlam Centre, Burke Mountain, Maillardville & all Coquitlam neighborhoods' },
  { slug: 'new-westminster', name: 'New Westminster', description: 'Downtown New West, Queensborough, Sapperton & all New West areas' },
  { slug: 'north-vancouver', name: 'North Vancouver', description: 'Lonsdale, Deep Cove, Lynn Valley & all North Vancouver neighborhoods' },
  { slug: 'west-vancouver', name: 'West Vancouver', description: 'Ambleside, Dundarave, British Properties & all West Vancouver areas' },
  { slug: 'chilliwack', name: 'Chilliwack', description: 'Downtown Chilliwack, Sardis, Vedder Crossing & all Chilliwack areas' },
];

export default function RepairIndexPage() {
  const siteUrl = getSiteUrl();
  
  return (
    <>
      <Head>
        <LocalBusinessSchema
          name="The Travelling Technicians - Mobile & Laptop Repair Services"
          description="Professional mobile phone and laptop repair services with doorstep service across Metro Vancouver and Fraser Valley. Same-day iPhone, MacBook, Samsung repair."
          address={{
            streetAddress: "Metro Vancouver Service Area",
            addressLocality: "Vancouver",
            addressRegion: "BC",
            addressCountry: "CA"
          }}
          geo={{
            latitude: 49.2827,
            longitude: -123.1207
          }}
          areaServed={[
            "Vancouver, BC",
            "Burnaby, BC",
            "Richmond, BC",
            "Surrey, BC",
            "Coquitlam, BC",
            "New Westminster, BC",
            "North Vancouver, BC",
            "West Vancouver, BC",
            "Chilliwack, BC"
          ]}
          sameAs={[
            "https://www.facebook.com/travellingtechnicians",
            "https://www.instagram.com/travellingtechnicians",
            "https://www.linkedin.com/company/travelling-technicians"
          ]}
        />
      </Head>
      <Layout 
        title="Mobile & Laptop Repair Services | The Travelling Technicians"
        metaDescription="Professional mobile and laptop repair services across Metro Vancouver and Fraser Valley. Doorstep service to Vancouver, Burnaby, Richmond, Surrey, Coquitlam, New Westminster, North Vancouver, West Vancouver, Chilliwack. Book online!"
      >
        {/* Hero Section */}
        <section className="pt-16 pb-12 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
          <div className="container-custom">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <FaMapMarkerAlt className="h-6 w-6 mr-2" />
                <span className="text-primary-200">Metro Vancouver & Fraser Valley</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Mobile & Laptop Repair<br />
                <span className="text-accent-400">Across Metro Vancouver</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-primary-100">
                Doorstep repair service to Vancouver, Burnaby, Richmond, Surrey, Coquitlam, New Westminster, North Vancouver, West Vancouver, Chilliwack & surrounding areas
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/book-online" className="btn-accent text-lg px-8 py-4">
                  Book Repair Service
                </Link>
                <a href="tel:+16045551234" className="btn-outline border-white text-white hover:bg-primary-600 text-lg px-8 py-4 flex items-center justify-center">
                  <FaPhone className="mr-2" />
                  (604) 555-1234
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
                <div className="flex items-center">
                  <FaCheckCircle className="mr-2 h-4 w-4" />
                  Free Diagnosis
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cities Grid */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Device Repair Services by City
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Select your city to view specific repair services, pricing, and availability in your area
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cities.map((city) => (
                <Link 
                  key={city.slug}
                  href={`/repair/${city.slug}`}
                  className="card hover:shadow-custom-lg transition-shadow hover:border-primary-300"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="rounded-full bg-primary-100 p-3 mr-4">
                        <FaMapMarkerAlt className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{city.name}</h3>
                        <p className="text-gray-600 text-sm">{city.description}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-primary-600 font-medium hover:text-primary-800">
                        View {city.name} Repair Services →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose The Travelling Technicians?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <FaClock className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">Same-Day Service</h3>
                <p className="text-gray-600">
                  Most repairs completed the same day you book. No waiting weeks for appointments.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <FaShieldAlt className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">90-Day Warranty</h3>
                <p className="text-gray-600">
                  All repairs backed by our comprehensive warranty with return service if needed.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <FaCheckCircle className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">Doorstep Service</h3>
                <p className="text-gray-600">
                  We come to your home or office. No need to travel or deal with parking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary-600 text-white">
          <div className="container-custom">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready for Mobile & Laptop Repair?
              </h2>
              <p className="text-xl mb-8 max-w-3xl mx-auto">
                Book online now and get your device repaired at your location today!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/book-online" className="btn-accent text-lg px-8 py-4">
                  Book Repair Service
                </Link>
                <a href="tel:+16045551234" className="btn-outline border-white text-white hover:bg-primary-700 text-lg px-8 py-4 flex items-center justify-center">
                  <FaPhone className="mr-2" />
                  Call (604) 555-1234
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "The Travelling Technicians - Mobile & Laptop Repair Services",
              "image": `${siteUrl}/images/logo/logo-orange-optimized.webp`,
              "telephone": "(604) 555-1234",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Vancouver",
                "addressRegion": "BC",
                "addressCountry": "CA"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 49.2827,
                "longitude": -123.1207
              },
              "url": `${siteUrl}/repair`,
              "sameAs": [
                "https://www.facebook.com/travellingtechnicians",
                "https://www.instagram.com/travellingtechnicians",
                "https://www.linkedin.com/company/travelling-technicians"
              ],
              "openingHours": "Mo-Su 08:00-20:00",
              "priceRange": "$50-$300",
              "acceptsReservations": true,
              "description": "Professional mobile and laptop repair service across Metro Vancouver and Fraser Valley. Doorstep service to all neighborhoods. Same-day iPhone, MacBook, Samsung repair.",
              "areaServed": {
                "@type": "City",
                "name": "Metro Vancouver, BC"
              },
              "serviceType": [
                "Mobile Phone Repair",
                "Laptop Repair",
                "iPhone Repair",
                "MacBook Repair",
                "Samsung Repair",
                "iPad Repair"
              ]
            })
          }}
        />
      </Layout>
    </>
  );
}