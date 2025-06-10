import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { FaPhone, FaClock, FaShieldAlt, FaMapMarkerAlt, FaStar, FaCheckCircle, FaMobile, FaLaptop, FaTabletAlt, FaTools } from 'react-icons/fa';

// New Westminster-specific testimonials
const newwestminsterTestimonials = [
  {
    id: 1,
    name: 'Sarah M.',
    location: 'Uptown New Westminster',
    rating: 5,
    comment: 'Amazing doorstep service! Fixed my Samsung right at my New West apartment. Highly recommend.',
    device: 'Samsung Galaxy S23'
  },
  {
    id: 2,
    name: 'Tom L.',
    location: 'Queens Park, New Westminster',
    rating: 5,
    comment: 'Laptop repair service was excellent. Saved me time and got my work computer running perfectly.',
    device: 'Dell Inspiron'
  }
];

// New Westminster neighborhoods
const newwestminsterAreas = [
  'Uptown New Westminster',
  'Downtown New Westminster',
  'Queens Park',
  'Sapperton',
  'Queensborough',
  'West End',
  'Moody Park',
  'Connaught Heights',
  'Brow of the Hill',
  'Victory Heights'
];

export default function NewWestminsterRepairPage() {
  return (
    <Layout 
      title="Mobile & Laptop Repair New Westminster | The Travelling Technicians"
      description="Professional mobile and laptop repair in New Westminster. Doorstep service to Uptown, Downtown, Queens Park. Same-day iPhone, MacBook repair. Book online!"
    >
      {/* Hero Section */}
      <section className="pt-16 pb-12 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <FaMapMarkerAlt className="h-6 w-6 mr-2" />
              <span className="text-primary-200">New Westminster, BC</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Mobile & Laptop Repair<br />
              <span className="text-accent-400">New Westminster</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Doorstep repair service to Uptown New Westminster, Downtown New Westminster, Queens Park & all New Westminster areas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/book-online" className="btn-accent text-lg px-8 py-4">
                Book Repair in New Westminster
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
              <div className="text-3xl font-bold text-primary-600 mb-2">25+</div>
              <p className="text-gray-600">New Westminster Repairs</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">4.9★</div>
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
              Device Repair Services in New Westminster
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional repair services delivered directly to your location in New Westminster
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

      {/* New Westminster Areas Served */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              New Westminster Areas We Serve
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Doorstep repair service available throughout New Westminster
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newwestminsterAreas.map((area, index) => (
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
              Don't see your New Westminster area listed? We likely serve it too!
            </p>
            <Link href="/book-online" className="btn-primary">
              Check Service Availability
            </Link>
          </div>
        </div>
      </section>

      {/* New Westminster Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What New Westminster Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real reviews from satisfied customers across New Westminster
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {newwestminsterTestimonials.map((testimonial) => (
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
              Ready for Mobile & Laptop Repair in New Westminster?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Book online now and get your device repaired at your New Westminster location!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/book-online" className="btn-accent text-lg px-8 py-4">
                Book New Westminster Repair
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
            "name": "The Travelling Technicians - New Westminster",
            "image": "https://travellingtechnicians.ca/logo.png",
            "telephone": "(604) 555-1234",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "New Westminster",
              "addressRegion": "BC",
              "addressCountry": "CA"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 49.2057,
              "longitude": -122.911
            },
            "url": "https://travellingtechnicians.ca/repair/new-westminster",
            "sameAs": [
              "https://facebook.com/travellingtechnicians",
              "https://instagram.com/travellingtechnicians"
            ],
            "openingHours": "Mo-Su 08:00-20:00",
            "priceRange": "$50-$300",
            "acceptsReservations": true,
            "description": "Professional mobile and laptop repair in New Westminster. Doorstep service to Uptown, Downtown, Queens Park. Same-day iPhone, MacBook repair. Book online!",
            "areaServed": {
              "@type": "City",
              "name": "New Westminster, BC"
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