import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { FaPhone, FaClock, FaShieldAlt, FaMapMarkerAlt, FaStar, FaCheckCircle, FaMobile, FaLaptop, FaTabletAlt, FaTools } from 'react-icons/fa';

// Chilliwack-specific testimonials
const chilliwackTestimonials = [
  {
    id: 1,
    name: 'Robert G.',
    location: 'Downtown Chilliwack',
    rating: 5,
    comment: 'Great to have professional repair service come to Chilliwack. Fixed my MacBook perfectly.',
    device: 'MacBook Pro 2020'
  },
  {
    id: 2,
    name: 'Linda B.',
    location: 'Sardis, Chilliwack',
    rating: 5,
    comment: 'iPhone repair service in Chilliwack was excellent. Worth the scheduled appointment!',
    device: 'iPhone 13'
  }
];

// Chilliwack neighborhoods
const chilliwackAreas = [
  'Downtown Chilliwack',
  'Sardis',
  'Vedder Crossing',
  'Promontory',
  'Fairfield Island',
  'Rosedale',
  'Cultus Lake',
  'Harrison Hot Springs Area',
  'Eastern Hillsides',
  'Yarrow',
  'Greendale'
];

export default function ChilliwackRepairPage() {
  return (
    <Layout 
      title="Mobile & Laptop Repair Chilliwack | The Travelling Technicians"
      metaDescription="Professional mobile and laptop repair in Chilliwack. Scheduled doorstep service for iPhone, MacBook, Samsung repair. Quality service in the Fraser Valley. Book online!"
    >
      {/* Hero Section */}
      <section className="pt-16 pb-12 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <FaMapMarkerAlt className="h-6 w-6 mr-2" />
              <span className="text-primary-200">Chilliwack, BC</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Mobile & Laptop Repair<br />
              <span className="text-accent-400">Chilliwack</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Scheduled doorstep repair service to Downtown Chilliwack, Sardis, Vedder Crossing & all Chilliwack areas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/book-online" className="btn-accent text-lg px-8 py-4">
                Book Repair in Chilliwack
              </Link>
              <a href="tel:+16045551234" className="btn-outline border-white text-white hover:bg-primary-600 text-lg px-8 py-4 flex items-center justify-center">
                <FaPhone className="mr-2" />
                (604) 555-1234
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center">
                <FaClock className="mr-2 h-4 w-4" />
                Scheduled Service
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
              <div className="text-3xl font-bold text-primary-600 mb-2">15+</div>
              <p className="text-gray-600">Chilliwack Repairs</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">4.9★</div>
              <p className="text-gray-600">Customer Rating</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">95%</div>
              <p className="text-gray-600">On-Time Service</p>
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
              Device Repair Services in Chilliwack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional repair services delivered directly to your location in Chilliwack
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        </div>
      </section>

      {/* Chilliwack Areas Served */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Chilliwack Areas We Serve
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Scheduled repair service available throughout Chilliwack
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {chilliwackAreas.map((area, index) => (
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
              Don't see your Chilliwack area listed? We likely serve it too!
            </p>
            <Link href="/book-online" className="btn-primary">
              Check Service Availability
            </Link>
          </div>
        </div>
      </section>

      {/* Chilliwack Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Chilliwack Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real reviews from satisfied customers across Chilliwack
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {chilliwackTestimonials.map((testimonial) => (
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

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready for Mobile & Laptop Repair in Chilliwack?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Book online now and get your device repaired at your Chilliwack location!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/book-online" className="btn-accent text-lg px-8 py-4">
                Book Chilliwack Repair
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
            "name": "The Travelling Technicians - Chilliwack",
            "image": "https://travellingtechnicians.ca/logo.png",
            "telephone": "(604) 555-1234",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Chilliwack",
              "addressRegion": "BC",
              "addressCountry": "CA"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 49.1579,
              "longitude": -121.9514
            },
            "url": "https://travellingtechnicians.ca/repair/chilliwack",
            "sameAs": [
              "https://facebook.com/travellingtechnicians",
              "https://instagram.com/travellingtechnicians"
            ],
            "openingHours": "Mo-Su 08:00-20:00",
            "priceRange": "$50-$300",
            "acceptsReservations": true,
            "description": "Professional mobile and laptop repair in Chilliwack. Scheduled doorstep service for iPhone, MacBook, Samsung repair. Quality service in the Fraser Valley. Book online!",
            "areaServed": {
              "@type": "City",
              "name": "Chilliwack, BC"
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
  );
}