import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { FaMapMarkerAlt, FaCheckCircle, FaRegClock, FaBuilding, FaHome, FaStore } from 'react-icons/fa';
import PostalCodeChecker from '@/components/PostalCodeChecker';
import InteractiveMap from '@/components/InteractiveMap';

// Location data for service areas - focused on target cities
const serviceAreas = [
  {
    id: 'vancouver',
    name: 'Vancouver',
    description: 'Serving all Vancouver neighborhoods including Downtown, Kitsilano, Point Grey, West End, Yaletown, Mount Pleasant, and Commercial Drive.',
    popular: true,
    sameDay: true,
    image: '/images/service-areas/vancouver.jpg'
  },
  {
    id: 'burnaby',
    name: 'Burnaby',
    description: 'Full service coverage across Burnaby including Metrotown, Brentwood, Lougheed, and SFU areas with fast response times.',
    popular: true,
    sameDay: true,
    image: '/images/service-areas/burnaby.jpg'
  },
  {
    id: 'richmond',
    name: 'Richmond',
    description: 'Serving all Richmond areas including City Centre, Steveston, East Richmond, and around YVR Airport.',
    popular: true,
    sameDay: true,
    image: '/images/service-areas/richmond.jpg'
  },
  {
    id: 'new-westminster',
    name: 'New Westminster',
    description: 'Complete coverage of New Westminster including Uptown, Downtown, Sapperton, and Queensborough.',
    popular: true,
    sameDay: true,
    image: '/images/service-areas/new-westminster.jpg'
  },
  {
    id: 'north-vancouver',
    name: 'North Vancouver',
    description: 'Serving both the City and District of North Vancouver, including Lynn Valley, Lonsdale, and Deep Cove areas.',
    popular: true,
    sameDay: true,
    image: '/images/service-areas/north-vancouver.jpg'
  },
  {
    id: 'west-vancouver',
    name: 'West Vancouver',
    description: 'Service available throughout West Vancouver including Ambleside, Dundarave, and British Properties.',
    popular: true,
    sameDay: true,
    image: '/images/service-areas/west-vancouver.jpg'
  },
  {
    id: 'coquitlam',
    name: 'Coquitlam',
    description: 'Service throughout Coquitlam including Maillardville, Town Centre, Westwood Plateau, and Burke Mountain.',
    popular: true,
    sameDay: true,
    image: '/images/service-areas/coquitlam.jpg'
  },
  {
    id: 'chilliwack',
    name: 'Chilliwack',
    description: 'Extending our services to Chilliwack and surrounding areas with scheduled visits for your device repair needs.',
    popular: false,
    sameDay: false,
    image: '/images/service-areas/chilliwack.jpg'
  }
];

// Service types
const serviceTypes = [
  {
    id: 'residential',
    name: 'Residential',
    icon: <FaHome className="h-10 w-10" />,
    description: 'We come to your home and complete repairs while you wait. Perfect for busy individuals who can\'t afford to be without their devices.'
  },
  {
    id: 'business',
    name: 'Business',
    icon: <FaBuilding className="h-10 w-10" />,
    description: 'Minimize downtime with on-site repairs for your business devices. We can work with your IT department or handle repairs independently.'
  },
  {
    id: 'retail',
    name: 'Retail',
    icon: <FaStore className="h-10 w-10" />,
    description: 'Partner with us to offer repair services to your customers. We provide white-label repair services for retail locations.'
  }
];

export default function ServiceAreasPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Service Areas from Whistler to Chilliwack
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Our mobile repair technicians bring expert device repair services directly to your location throughout the Greater Vancouver area and beyond, from Whistler in the north to Chilliwack in the east.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/book-online" className="btn-accent text-center">
                  Book a Repair
                </Link>
              <Link href="/contact" className="btn-outline border-white text-white hover:bg-primary-600 text-center">
                  Contact Us
                </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Coverage Map</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The Travelling Technicians serve the entire Lower Mainland region, spanning from Whistler and Squamish in the north to Chilliwack and Abbotsford in the east.
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
            <div className="aspect-w-16 aspect-h-9 w-full rounded-lg overflow-hidden">
              <InteractiveMap height="500px" className="rounded-lg" />
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>
                Search your postal code below to check service availability and get estimated response times.
              </p>
            </div>
          </div>

          {/* Postal Code Checker */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4 text-center">Check Your Location</h3>
              <PostalCodeChecker />
            </div>
          </div>
        </div>
      </section>

      {/* Areas We Serve */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Communities We Serve</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our technicians provide doorstep repair services throughout these communities across the Lower Mainland, from Whistler to Chilliwack. Click any location to learn more about services in that area.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceAreas.map((area) => (
              <Link 
                key={area.id} 
                href={`/repair/${area.id}`}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
              >
                <div className="relative h-48 w-full">
                  <Image 
                    src={area.image} 
                    alt={`${area.name}, BC`} 
                    layout="fill"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <h3 className="text-xl font-bold">{area.name}</h3>
                      {area.popular && (
                        <span className="inline-block bg-accent-500 text-white text-xs px-2 py-1 rounded-full mt-1">
                          Popular Area
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 mb-4 text-sm">{area.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaRegClock className="text-gray-400 mr-2" />
                      <span className="text-sm">
                        {area.sameDay ? (
                          <span className="text-green-600 font-medium">Same-day service available</span>
                        ) : (
                          <span className="text-gray-600">Scheduled service available</span>
                        )}
                      </span>
                    </div>
                    <div className="text-primary-600 text-sm font-medium group-hover:text-primary-700 transition-colors">
                      Learn More →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Service Types */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">We Come To You</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our technicians provide doorstep repair services to different types of locations across the Lower Mainland.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {serviceTypes.map((type) => (
              <div key={type.id} className="card hover:shadow-custom-lg transition-shadow text-center">
                <div className="rounded-full bg-primary-100 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <div className="text-primary-600">
                    {type.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{type.name} Service</h3>
                <p className="text-gray-600">
                  {type.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Service Area FAQs</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Common questions about our service areas and availability.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold mb-2">What does "same-day service available" mean?</h3>
                <p className="text-gray-600">
                  In areas marked with same-day availability, we can often schedule a repair technician to visit your location 
                  on the same day you book, depending on technician availability. For the best chance of same-day service, 
                  we recommend booking before 11 AM.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold mb-2">I don't see my location listed. Can you still help me?</h3>
                <p className="text-gray-600">
                  We may still be able to service your area even if it's not explicitly listed. Our coverage area extends from Whistler in the north to Chilliwack in the east. Please use our postal code 
                  checker or contact us directly to inquire about availability in your specific location.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold mb-2">Are there any extra fees for distant locations?</h3>
                <p className="text-gray-600">
                  For most areas within the Lower Mainland, there are no additional travel fees. However, for some distant 
                  locations or areas outside our main service region, a small travel fee may apply. This will be clearly 
                  communicated before you confirm your booking.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold mb-2">How do you determine arrival times?</h3>
                <p className="text-gray-600">
                  When you book, we provide a 1-2 hour arrival window based on your location, current technician availability, 
                  and traffic conditions. You'll receive a notification when your technician is on the way, along with their 
                  estimated arrival time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area Promise */}
      <section className="py-16 bg-primary-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Service Area Promise</h2>
              <p className="text-gray-600 mb-6">
                No matter where you are in the Lower Mainland, we're committed to bringing expert repair services directly to your door with:
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FaCheckCircle className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700">
                      <span className="font-semibold">Transparent scheduling</span> - clear arrival windows and real-time updates
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FaCheckCircle className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700">
                      <span className="font-semibold">Well-equipped technicians</span> - arriving with all necessary parts and tools
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FaCheckCircle className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700">
                      <span className="font-semibold">Consistent quality</span> - the same exceptional service regardless of your location
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FaCheckCircle className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-700">
                      <span className="font-semibold">Strategic technician placement</span> - ensuring efficient response throughout the region
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-custom">
                <Image
                  src="https://images.unsplash.com/photo-1581094794329-c8112a89af12"
                  alt="Technician arriving at customer location"
                  layout="fill"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready for Doorstep Device Repair?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              We bring expert repair service to your location across the Lower Mainland. Book your appointment now.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/book-online" className="btn-accent text-center">
                  Book Your Repair
                </Link>
              <Link href="/contact" className="btn-outline border-white text-white hover:bg-primary-700 text-center">
                  Contact Our Team
                </Link>
            </div>
            <p className="text-primary-100 mt-6">
              <FaMapMarkerAlt className="inline-block mr-1" /> Serving all major communities in the Greater Vancouver area
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
} 