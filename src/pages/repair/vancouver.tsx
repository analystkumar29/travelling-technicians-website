import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { FaPhone, FaClock, FaShieldAlt, FaMapMarkerAlt, FaStar, FaCheckCircle, FaMobile, FaLaptop, FaTabletAlt, FaTools } from 'react-icons/fa';
import { LocalBusinessSchema, ReviewSchema } from '@/components/seo/StructuredData';
import { getSameAsUrls } from '@/utils/wikidata';

// Vancouver-specific testimonials
const vancouverTestimonials = [
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
    name: 'Michael C.',
    location: 'Kitsilano, Vancouver',
    rating: 5,
    comment: 'MacBook repair at my home office in Kits. Saved me a trip downtown and got my work laptop running perfectly.',
    device: 'MacBook Air M2',
    neighborhood: 'Kitsilano'
  },
  {
    id: 3,
    name: 'Jennifer W.',
    location: 'West End, Vancouver',
    rating: 5,
    comment: 'Samsung Galaxy screen replacement at my apartment. Technician was punctual and the repair looks perfect!',
    device: 'Samsung Galaxy S23',
    neighborhood: 'West End'
  }
];

// Vancouver neighborhoods
const vancouverAreas = [
  'Downtown Vancouver', 'Yaletown', 'Coal Harbour', 'West End',
  'Kitsilano', 'Point Grey', 'Kerrisdale', 'Marpole',
  'Mount Pleasant', 'Commercial Drive', 'Grandview-Woodland',
  'Strathcona', 'Chinatown', 'Gastown', 'False Creek',
  'Cambie', 'Fairview', 'Sunset', 'Dunbar-Southlands'
];

// Common repairs in Vancouver
const commonRepairs = [
  {
    service: 'iPhone Screen Repair',
    price: 'From $89',
    time: '30-45 mins',
    popular: true
  },
  {
    service: 'MacBook Battery Replacement',
    price: 'From $149',
    time: '45-60 mins',
    popular: true
  },
  {
    service: 'Samsung Screen Repair',
    price: 'From $79',
    time: '30-45 mins',
    popular: false
  },
  {
    service: 'Laptop RAM Upgrade',
    price: 'From $89',
    time: '30-45 mins',
    popular: false
  }
];

export default function VancouverRepairPage() {
  const sameAsUrls = getSameAsUrls('vancouver');
  
  return (
    <>
      <Head>
        {/* Vancouver Location Structured Data */}
        <LocalBusinessSchema
          name="The Travelling Technicians - Vancouver"
          description="Professional mobile phone and laptop repair services with doorstep service in Vancouver, BC. Serving Downtown, Yaletown, Kitsilano, West End, and surrounding areas."
          address={{
            streetAddress: "Vancouver Service Area",
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
            "Downtown Vancouver",
            "Yaletown",
            "Kitsilano",
            "West End Vancouver",
            "Gastown",
            "Coal Harbour"
          ]}
          sameAs={sameAsUrls}
        />
        <ReviewSchema 
          reviews={vancouverTestimonials.map(testimonial => ({
            author: testimonial.name,
            rating: testimonial.rating,
            reviewBody: testimonial.comment,
            location: testimonial.location,
            datePublished: "2024-01-01"
          }))}
          aggregateRating={{
            ratingValue: 5.0,
            reviewCount: vancouverTestimonials.length,
            bestRating: 5,
            worstRating: 1
          }}
        />
      </Head>
      <Layout 
        title="Mobile & Laptop Repair Vancouver | The Travelling Technicians"
        metaDescription="Professional mobile and laptop repair in Vancouver. Doorstep service to Downtown, Yaletown, Kitsilano, West End. Same-day iPhone, MacBook, Samsung repair. Book online!"
      >
      {/* Hero Section */}
      <section className="pt-16 pb-12 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <FaMapMarkerAlt className="h-6 w-6 mr-2" />
              <span className="text-primary-200">Vancouver, BC</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Mobile & Laptop Repair<br />
              <span className="text-accent-400">Vancouver</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Doorstep repair service to Downtown, Yaletown, Kitsilano, West End & all Vancouver neighborhoods
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/book-online" className="btn-accent text-lg px-8 py-4">
                Book Repair in Vancouver
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

      {/* Trust Signals */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
              <p className="text-gray-600">Vancouver Repairs</p>
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

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Device Repair Services in Vancouver
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional repair services delivered directly to your location in Vancouver
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Mobile Repair */}
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="p-6 text-center">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <FaMobile className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">Mobile Phone Repair</h3>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    iPhone Screen Replacement
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    Samsung Galaxy Repair
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    Battery Replacement
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    Charging Port Repair
                  </li>
                </ul>
                <Link href="/services/mobile-repair" className="btn-primary w-full">
                  View Mobile Services
                </Link>
              </div>
            </div>

            {/* Laptop Repair */}
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="p-6 text-center">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <FaLaptop className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">Laptop Repair</h3>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    MacBook Screen Repair
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    Battery Replacement
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    RAM/SSD Upgrades
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    Keyboard Replacement
                  </li>
                </ul>
                <Link href="/services/laptop-repair" className="btn-primary w-full">
                  View Laptop Services
                </Link>
              </div>
            </div>

            {/* Tablet Repair */}
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="p-6 text-center">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <FaTabletAlt className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">Tablet Repair</h3>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    iPad Screen Replacement
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    Battery Replacement
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    Charging Port Repair
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2 h-4 w-4" />
                    Software Issues
                  </li>
                </ul>
                <Link href="/book-online" className="btn-primary w-full">
                  Book Tablet Repair
                </Link>
              </div>
            </div>
          </div>

          {/* Popular Repairs */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">Popular Repairs in Vancouver</h3>
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

      {/* Vancouver Areas Served */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Vancouver Neighborhoods We Serve
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Doorstep repair service available throughout Vancouver
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {vancouverAreas.map((area, index) => (
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
              Don't see your Vancouver neighborhood listed? We likely serve it too!
            </p>
            <Link href="/book-online" className="btn-primary">
              Check Service Availability
            </Link>
          </div>
        </div>
      </section>

      {/* Vancouver Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Vancouver Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real reviews from satisfied customers across Vancouver
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {vancouverTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                  <p className="text-sm text-primary-600">{testimonial.device}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us in Vancouver */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Us for Vancouver Device Repair?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="rounded-full bg-green-100 p-2 mr-4 mt-1">
                    <FaCheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Local Vancouver Service</h3>
                    <p className="text-gray-600">We know Vancouver - from downtown condos to Kitsilano houses, we come to you.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-green-100 p-2 mr-4 mt-1">
                    <FaCheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Same-Day Vancouver Repairs</h3>
                    <p className="text-gray-600">Most Vancouver locations can be serviced the same day you book.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-green-100 p-2 mr-4 mt-1">
                    <FaCheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">No Vancouver Traffic Hassles</h3>
                    <p className="text-gray-600">Skip the downtown traffic and parking fees - we come to your location.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-green-100 p-2 mr-4 mt-1">
                    <FaCheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">90-Day Warranty</h3>
                    <p className="text-gray-600">All repairs backed by our comprehensive warranty with return service if needed.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 text-center">
              <div className="text-primary-600 mb-6">
                <FaTools className="h-20 w-20 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-primary-800 mb-4">Professional Vancouver Repairs</h3>
              <p className="text-primary-700 mb-6">
                Experienced technicians serving Vancouver with professional equipment and high-quality parts.
              </p>
              <Link href="/book-online" className="btn-primary">
                Book Vancouver Repair Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready for Mobile & Laptop Repair in Vancouver?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Book online now and get your device repaired at your Vancouver location today!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/book-online" className="btn-accent text-lg px-8 py-4">
                Book Vancouver Repair
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
            "name": "The Travelling Technicians - Vancouver",
            "image": "https://travellingtechnicians.ca/images/logo/logo-orange-optimized.webp",
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
            "url": "https://travellingtechnicians.ca/repair/vancouver",
            "sameAs": sameAsUrls,
            "openingHours": "Mo-Su 08:00-20:00",
            "priceRange": "$50-$300",
            "acceptsReservations": true,
            "description": "Professional mobile and laptop repair service in Vancouver. Doorstep service to all Vancouver neighborhoods. Same-day iPhone, MacBook, Samsung repair.",
            "areaServed": {
              "@type": "City",
              "name": "Vancouver, BC"
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