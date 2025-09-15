import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { FaPhone, FaClock, FaShieldAlt, FaMapMarkerAlt, FaStar, FaCheckCircle, FaMobile, FaLaptop, FaTabletAlt, FaTools } from 'react-icons/fa';
import { LocalBusinessSchema } from '@/components/seo/StructuredData';

// Burnaby-specific testimonials
const burnabyTestimonials = [
  {
    id: 1,
    name: 'Michael C.',
    location: 'Metrotown, Burnaby',
    rating: 5,
    comment: 'Had my MacBook battery replaced at home. Professional service and saved me a trip to the mall. Highly recommend!',
    device: 'MacBook Pro 2019',
    neighborhood: 'Metrotown'
  },
  {
    id: 2,
    name: 'Lisa K.',
    location: 'Brentwood, Burnaby',
    rating: 5,
    comment: 'iPhone screen repair at my Brentwood condo. Quick, professional service right at my door. Perfect results!',
    device: 'iPhone 13',
    neighborhood: 'Brentwood'
  },
  {
    id: 3,
    name: 'David L.',
    location: 'SFU, Burnaby',
    rating: 5,
    comment: 'Laptop repair service on campus was amazing. Fixed my Dell right in my dorm room during study break.',
    device: 'Dell XPS 15',
    neighborhood: 'SFU'
  }
];

// Burnaby neighborhoods
const burnabyAreas = [
  'Metrotown', 'Brentwood', 'Lougheed', 'SFU Burnaby Mountain',
  'Edmonds', 'New Westminster Border', 'Deer Lake',
  'Capitol Hill', 'Sperling', 'Gilmore', 'Holdom',
  'Brentwood Park', 'Heights', 'Government Road'
];

// Common repairs in Burnaby
const commonRepairs = [
  {
    service: 'MacBook Screen Repair',
    price: 'From $199',
    time: '45-60 mins',
    popular: true
  },
  {
    service: 'iPhone Battery Replacement',
    price: 'From $79',
    time: '30-45 mins',
    popular: true
  },
  {
    service: 'Samsung Galaxy Repair',
    price: 'From $89',
    time: '30-45 mins',
    popular: false
  },
  {
    service: 'Laptop SSD Upgrade',
    price: 'From $149',
    time: '45-60 mins',
    popular: false
  }
];

export default function BurnabyRepairPage() {
  return (
    <>
      <Head>
        {/* The Travelling Technicians - Burnaby Location Structured Data */}
        <LocalBusinessSchema
          name="The Travelling Technicians - Burnaby"
          description="Professional mobile phone and laptop repair services with doorstep service in Burnaby, BC. Serving Metrotown, Brentwood, Lougheed, and surrounding areas."
          address={{
            streetAddress: "Burnaby Service Area",
            addressLocality: "Burnaby",
            addressRegion: "BC",
            addressCountry: "CA"
          }}
          geo={{
            latitude: 49.2488,
            longitude: -122.9805
          }}
          areaServed={[
                      "Burnaby, BC",
                      "Metrotown",
                      "Brentwood",
                      "Lougheed",
                      "Capitol Hill",
                      "Heights"
            ]}
        />
      </Head>
      <Layout 
      title="Mobile & Laptop Repair Burnaby | The Travelling Technicians"
      metaDescription="Professional mobile and laptop repair in Burnaby. Doorstep service to Metrotown, Brentwood, SFU, Lougheed. Same-day iPhone, MacBook, Samsung repair. Book online!"
    >
      {/* Hero Section */}
      <section className="pt-16 pb-12 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <FaMapMarkerAlt className="h-6 w-6 mr-2" />
              <span className="text-primary-200">Burnaby, BC</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Mobile & Laptop Repair<br />
              <span className="text-accent-400">Burnaby</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Doorstep repair service to Metrotown, Brentwood, SFU, Lougheed & all Burnaby areas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/book-online" className="btn-accent text-lg px-8 py-4">
                Book Repair in Burnaby
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
              <div className="text-3xl font-bold text-primary-600 mb-2">40+</div>
              <p className="text-gray-600">Burnaby Repairs</p>
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
              Device Repair Services in Burnaby
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional repair services delivered directly to your location in Burnaby
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
            <h3 className="text-2xl font-bold mb-6 text-center">Popular Repairs in Burnaby</h3>
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

      {/* Burnaby Areas Served */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Burnaby Areas We Serve
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Doorstep repair service available throughout Burnaby
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {burnabyAreas.map((area, index) => (
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
              Don't see your Burnaby area listed? We likely serve it too!
            </p>
            <Link href="/book-online" className="btn-primary">
              Check Service Availability
            </Link>
          </div>
        </div>
      </section>

      {/* Burnaby Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Burnaby Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real reviews from satisfied customers across Burnaby
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {burnabyTestimonials.map((testimonial) => (
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

      {/* Why Choose Us in Burnaby */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Us for Burnaby Device Repair?
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
                    <h3 className="font-bold text-lg mb-2">Local Burnaby Service</h3>
                    <p className="text-gray-600">We know Burnaby well - from Metrotown condos to SFU campus, we come to you.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-green-100 p-2 mr-4 mt-1">
                    <FaCheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Fast Burnaby Response</h3>
                    <p className="text-gray-600">Quick service to all Burnaby areas including Metrotown, Brentwood, and SFU.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-green-100 p-2 mr-4 mt-1">
                    <FaCheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Skip the Metrotown Mall</h3>
                    <p className="text-gray-600">No need to deal with mall crowds or parking - we bring the repair shop to you.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-green-100 p-2 mr-4 mt-1">
                    <FaCheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Student-Friendly Service</h3>
                    <p className="text-gray-600">Special consideration for SFU students - we understand your tech needs and budget.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 text-center">
              <div className="text-primary-600 mb-6">
                <FaTools className="h-20 w-20 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-primary-800 mb-4">Professional Burnaby Repairs</h3>
              <p className="text-primary-700 mb-6">
                Experienced technicians serving Burnaby with professional equipment and high-quality parts.
              </p>
              <Link href="/book-online" className="btn-primary">
                Book Burnaby Repair Now
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
              Ready for Mobile & Laptop Repair in Burnaby?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Book online now and get your device repaired at your Burnaby location today!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/book-online" className="btn-accent text-lg px-8 py-4">
                Book Burnaby Repair
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
            "name": "The Travelling Technicians - Burnaby",
            "image": "https://travellingtechnicians.ca/images/logo/logo-orange-optimized.webp",
            "telephone": "(604) 555-1234",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Burnaby",
              "addressRegion": "BC",
              "addressCountry": "CA"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 49.2488,
              "longitude": -122.9805
            },
            "url": "https://travellingtechnicians.ca/repair/burnaby",
            "sameAs": [
              "https://facebook.com/travellingtechnicians",
              "https://instagram.com/travellingtechnicians"
            ],
            "openingHours": "Mo-Su 08:00-20:00",
            "priceRange": "$50-$300",
            "acceptsReservations": true,
            "description": "Professional mobile and laptop repair service in Burnaby. Doorstep service to Metrotown, Brentwood, SFU, Lougheed. Same-day iPhone, MacBook, Samsung repair.",
            "areaServed": {
              "@type": "City",
              "name": "Burnaby, BC"
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