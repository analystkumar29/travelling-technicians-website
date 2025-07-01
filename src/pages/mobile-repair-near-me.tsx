import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { FaMapMarkerAlt, FaClock, FaShieldAlt, FaPhone, FaCalendarAlt, FaStar, FaCheckCircle, FaRoute } from 'react-icons/fa';

export default function MobileRepairNearMePage() {
  return (
    <>
      <Head>
        <title>Mobile Repair Near Me | Doorstep Service Vancouver BC | The Travelling Technicians</title>
        <meta name="description" content="Looking for mobile repair near me? We come to you! Same-day doorstep mobile phone repair service across Vancouver, Burnaby, Richmond, and Lower Mainland BC." />
        <meta name="keywords" content="mobile repair near me, phone repair near me, mobile phone repair near me, cell phone repair near me, doorstep mobile repair, local mobile repair" />
        <link rel="canonical" href="https://www.travelling-technicians.ca/mobile-repair-near-me" />
        <meta property="og:title" content="Mobile Repair Near Me | Doorstep Service Vancouver BC" />
        <meta property="og:description" content="We come to you! Same-day doorstep mobile phone repair service across Vancouver and Lower Mainland. Professional technicians at your location." />
        <meta property="og:url" content="https://www.travelling-technicians.ca/mobile-repair-near-me" />
        <meta property="og:type" content="service" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Mobile Repair Near Me - Doorstep Service",
            "description": "Professional doorstep mobile phone repair service. We come to your location for same-day repairs across Vancouver and Lower Mainland.",
            "provider": {
              "@type": "LocalBusiness",
              "name": "The Travelling Technicians",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Vancouver",
                "addressRegion": "BC",
                "addressCountry": "CA"
              },
              "telephone": "+1-778-389-9251",
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "49.2827",
                "longitude": "-123.1207"
              }
            },
            "serviceType": "Mobile Device Repair",
            "areaServed": {
              "@type": "GeoCircle",
              "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": "49.2827",
                "longitude": "-123.1207"
              },
              "geoRadius": "50000"
            }
          })
        }} />
      </Head>
      
      <Layout>
        {/* Hero Section */}
        <section className="pt-16 pb-12 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Mobile Repair Near Me?<br />
                  <span className="text-accent-400">We Come to You!</span>
                </h1>
                <p className="text-xl mb-6 text-primary-100">
                  Skip the trip to the repair shop. Our certified technicians provide professional mobile phone repair at your doorstep across Vancouver and Lower Mainland.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-green-400 mr-2" />
                    <span>Doorstep Service</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="text-green-400 mr-2" />
                    <span>Same-Day Repair</span>
                  </div>
                  <div className="flex items-center">
                    <FaShieldAlt className="text-green-400 mr-2" />
                    <span>90-Day Warranty</span>
                  </div>
                  <div className="flex items-center">
                    <FaStar className="text-green-400 mr-2" />
                    <span>Local Experts</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/book-online?service=mobile-repair" className="btn-accent text-center">
                    <FaCalendarAlt className="inline mr-2" />
                    Book Mobile Repair
                  </Link>
                  <a href="tel:+17783899251" className="btn-outline border-white text-white hover:bg-primary-600 text-center">
                    <FaPhone className="inline mr-2" />
                    Call for Service
                  </a>
                </div>
              </div>
              <div className="relative">
                <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-custom-lg">
                  <Image
                    src="/images/services/doorstep-repair-tech.jpg"
                    alt="Mobile repair technician providing doorstep service"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Location Coverage */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Mobile Repair Service Areas Near You</h2>
              <p className="text-xl text-gray-600">Professional doorstep mobile repair across the Lower Mainland</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { city: 'Vancouver', distance: '0-15 km', time: '30-45 mins' },
                { city: 'Burnaby', distance: '0-20 km', time: '30-60 mins' },
                { city: 'Richmond', distance: '10-25 km', time: '45-60 mins' },
                { city: 'North Vancouver', distance: '5-20 km', time: '30-45 mins' },
                { city: 'New Westminster', distance: '10-25 km', time: '45-60 mins' },
                { city: 'Coquitlam', distance: '15-30 km', time: '45-75 mins' },
                { city: 'West Vancouver', distance: '10-25 km', time: '45-60 mins' },
                { city: 'Chilliwack', distance: '30-50 km', time: '75-120 mins' }
              ].map((location) => (
                <div key={location.city} className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                  <FaMapMarkerAlt className="text-primary-600 text-2xl mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2">{location.city}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><FaRoute className="inline mr-1" /> {location.distance}</div>
                    <div><FaClock className="inline mr-1" /> {location.time}</div>
                  </div>
                  <Link href={`/repair/${location.city.toLowerCase().replace(' ', '-')}`} className="text-primary-600 text-sm hover:underline mt-2 inline-block">
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How Our Mobile Repair Near Me Service Works</h2>
              <p className="text-xl text-gray-600">Simple, convenient, and professional</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Book Online</h3>
                <p className="text-gray-600">Schedule your mobile repair appointment online or call us. Choose your preferred time slot.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">We Come to You</h3>
                <p className="text-gray-600">Our certified technician travels to your location with all necessary tools and parts.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Professional Repair</h3>
                <p className="text-gray-600">Expert diagnosis and repair using quality parts. Most repairs completed in 30-60 minutes.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h3 className="text-xl font-bold mb-3">90-Day Warranty</h3>
                <p className="text-gray-600">All repairs backed by our comprehensive warranty. Your satisfaction is guaranteed.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Common Repairs */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Common Mobile Repairs We Handle</h2>
              <p className="text-xl text-gray-600">All repairs performed at your location</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { 
                  icon: '📱', 
                  title: 'Screen Replacement', 
                  description: 'Cracked or broken screen repair for all phone models',
                  price: 'From $79'
                },
                { 
                  icon: '🔋', 
                  title: 'Battery Replacement', 
                  description: 'Replace old or faulty batteries to restore battery life',
                  price: 'From $89'
                },
                { 
                  icon: '🔌', 
                  title: 'Charging Port Repair', 
                  description: 'Fix charging issues and replace damaged ports',
                  price: 'From $99'
                },
                { 
                  icon: '📷', 
                  title: 'Camera Repair', 
                  description: 'Front and rear camera replacement and repair',
                  price: 'From $109'
                },
                { 
                  icon: '🔊', 
                  title: 'Speaker/Mic Repair', 
                  description: 'Audio issues, speaker and microphone repairs',
                  price: 'From $89'
                },
                { 
                  icon: '💧', 
                  title: 'Water Damage', 
                  description: 'Water damage assessment and component repair',
                  price: 'From $149'
                }
              ].map((repair, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-4">{repair.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{repair.title}</h3>
                  <p className="text-gray-600 mb-4">{repair.description}</p>
                  <div className="text-primary-600 font-bold text-lg mb-4">{repair.price}</div>
                  <Link href={`/book-online?service=${repair.title.toLowerCase().replace(' ', '-')}`} className="btn-primary">
                    Book This Repair
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Local */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Local Mobile Repair?</h2>
              <p className="text-xl text-gray-600">The benefits of doorstep mobile repair service</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold mb-2">No Travel Required</h3>
                      <p className="text-gray-600">Stay comfortable at home or office while we repair your phone.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold mb-2">Save Time & Money</h3>
                      <p className="text-gray-600">No parking fees, fuel costs, or time wasted in waiting rooms.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold mb-2">Professional Service</h3>
                      <p className="text-gray-600">Certified technicians with years of experience and quality tools.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold mb-2">Transparent Pricing</h3>
                      <p className="text-gray-600">Upfront quotes with no hidden fees or surprise charges.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="relative h-[300px] w-full rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src="/images/services/mobile-repair-doorstep.jpg"
                    alt="Technician repairing mobile phone at customer's location"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Local Customers Say</h2>
              <p className="text-xl text-gray-600">Real reviews from satisfied customers</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah M.",
                  location: "Vancouver",
                  review: "Amazing service! The technician came to my office and fixed my iPhone screen in 30 minutes. So convenient!",
                  rating: 5
                },
                {
                  name: "James K.",
                  location: "Burnaby",
                  review: "Best mobile repair experience ever. Professional, fast, and great pricing. Will definitely use again.",
                  rating: 5
                },
                {
                  name: "Lisa R.",
                  location: "Richmond",
                  review: "They came to my home to replace my Samsung battery. Perfect service and my phone works like new!",
                  rating: 5
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.review}"</p>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.location}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-accent-500 to-accent-600 text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Need Mobile Repair Near You?
            </h2>
            <p className="text-xl mb-8 text-accent-100">
              Book now and we'll come to your location for same-day service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-online" className="btn-white text-accent-600 hover:bg-gray-100">
                <FaCalendarAlt className="inline mr-2" />
                Book Mobile Repair
              </Link>
              <a href="tel:+17783899251" className="btn-outline border-white text-white hover:bg-accent-700">
                <FaPhone className="inline mr-2" />
                Call (778) 389-9251
              </a>
            </div>
            <div className="mt-6 text-accent-100">
              <FaMapMarkerAlt className="inline mr-2" />
              Serving Vancouver, Burnaby, Richmond, and surrounding areas
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
} 