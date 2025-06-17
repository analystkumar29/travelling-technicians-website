import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { FaCheckCircle, FaMobileAlt, FaBatteryFull, FaBolt, FaMicrophone, FaCamera, FaWater, FaMemory, FaSdCard } from 'react-icons/fa';

// Mobile repair services data
const mobileServices = [
  {
    id: 1,
    name: 'Screen Replacement',
    description: 'Don\'t live with a cracked or broken screen. Our technicians come to your location with high-quality replacement screens for all major brands including Apple, Samsung, Google, and more. Most screen replacements can be completed in 30-60 minutes right at your doorstep.',
    icon: <FaMobileAlt className="h-10 w-10" />,
    doorstep: true,
    price: 'From $129',
    popular: true,
    image: '/images/services/mobile-service-1.svg'
  },
  {
    id: 2,
    name: 'Battery Replacement',
    description: 'Is your phone not holding a charge like it used to? Our mobile battery replacement service brings new life to your device. We use premium-quality batteries and can complete most replacements in under an hour at your chosen location.',
    icon: <FaBatteryFull className="h-10 w-10" />,
    doorstep: true,
    price: 'From $79',
    popular: true,
    image: '/images/services/mobile-service-2.svg'
  },
  {
    id: 3,
    name: 'Charging Port Repair',
    description: "Struggling with loose connections or charging issues? Our technicians can repair or replace your device's charging port on-site, restoring reliable power to your phone without you ever leaving home.",
    icon: <FaBolt className="h-10 w-10" />,
    doorstep: true,
    price: 'From $89',
    popular: false,
    image: '/images/services/mobile-service-3.svg'
  },
  {
    id: 4,
    name: 'Speaker/Microphone Repair',
    description: 'Having trouble hearing callers or being heard? Our doorstep service includes expert diagnosis and repair of speaker and microphone issues for all major phone models.',
    icon: <FaMicrophone className="h-10 w-10" />,
    doorstep: true,
    price: 'From $79',
    popular: false,
    image: '/images/services/mobile-service-4.svg'
  },
  {
    id: 5,
    name: 'Camera Repair',
    description: 'Don\'t miss capturing important moments due to camera malfunctions. Our technicians can fix front and rear camera issues at your location, usually completing repairs within an hour.',
    icon: <FaCamera className="h-10 w-10" />,
    doorstep: true,
    price: 'From $89',
    popular: false,
    image: '/images/services/mobile-service-5.svg'
  },
  {
    id: 6,
    name: 'Water Damage Diagnostics',
    description: 'If your phone has been exposed to water, quick action is essential. Our technicians can perform initial diagnostics at your doorstep and provide emergency treatment. Severe cases may require additional service at our specialized facility.',
    icon: <FaWater className="h-10 w-10" />,
    doorstep: true,
    limited: true,
    price: 'From $49',
    popular: false,
    image: '/images/services/mobile-service-6.svg'
  },
  {
    id: 7,
    name: 'Data Recovery',
    description: 'Worried about lost photos, contacts, or messages? We offer data recovery services with an initial assessment at your location. Complex recovery may require additional time and specialized equipment.',
    icon: <FaMemory className="h-10 w-10" />,
    doorstep: true,
    limited: true,
    price: 'From $99',
    popular: false,
    image: '/images/services/mobile-service-7.svg'
  },
  {
    id: 8,
    name: 'Storage Upgrade',
    description: 'Running out of space on your phone? For select Android devices, we can upgrade your storage capacity with larger memory modules or optimize your existing storage right at your location.',
    icon: <FaSdCard className="h-10 w-10" />,
    doorstep: true,
    price: 'From $89',
    popular: false,
    image: '/images/services/mobile-service-8.svg'
  }
];

// Brands we service
const brands = [
  'Apple iPhone (All Models)',
  'Samsung Galaxy Series',
  'Google Pixel',
  'LG',
  'Huawei',
  'OnePlus',
  'Xiaomi',
  'Motorola',
  'Sony Xperia',
  'Nokia'
];

export default function MobileRepairPage() {
  return (
    <Layout title="Mobile Phone Repair Services | The Travelling Technicians">
      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Expert Mobile Phone Repair at Your Doorstep
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                From cracked screens to water damage, we bring professional mobile phone repair services directly to your location across the Lower Mainland.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/book-online?deviceType=mobile" className="btn-accent text-center">
                    Book Mobile Repair
                  </Link>
                <Link href="/pricing" className="btn-outline border-white text-white hover:bg-primary-600 text-center">
                    View Pricing
                  </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-custom-lg">
                <Image
                  src="/images/services/mobile-hero.svg"
                  alt="Mobile phone repair technician"
                  layout="fill"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-custom-lg">
                <div className="text-center">
                  <p className="font-bold text-2xl text-primary-600">60 min</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mobile Phone Repair Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional mobile phone repair services brought directly to your doorstep by our certified technicians.
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
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-8 text-center">Most Popular Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mobileServices.filter(service => service.popular).map((service) => (
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
                                                  <Link href="/book-online?deviceType=mobile" className="btn-primary text-sm py-2">
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

          {/* All Services */}
          <h3 className="text-2xl font-bold mb-8 text-center">All Mobile Phone Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mobileServices.map((service) => (
              <div key={service.id} className="card hover:shadow-custom-lg transition-shadow h-full">
                <div className="relative h-48 w-full mb-4 rounded-md overflow-hidden">
                  <Image 
                    src={service.image} 
                    alt={service.name} 
                    layout="fill"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-bold mr-3">{service.name}</h3>
                    {service.doorstep && !service.limited && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Doorstep
                      </span>
                    )}
                    {service.limited && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Limited
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="mt-auto flex justify-between items-center">
                    <span className="font-bold text-lg text-primary-600">{service.price}</span>
                    <div className="flex justify-center mt-6">
                      <Link href="/book-online?deviceType=mobile" className="btn-primary text-sm py-2">
                          Book Now
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
              Our technicians are trained to repair all major mobile phone brands and models.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose Our Mobile Repair Service</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We bring convenience, quality, and expertise directly to your doorstep.
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
              <p className="text-gray-600">We use only premium parts and provide a 90-day warranty on all our mobile repairs.</p>
            </div>

            <div className="card hover:shadow-custom-lg transition-shadow text-center p-6">
              <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Service</h3>
              <p className="text-gray-600">Most mobile repairs are completed in under an hour, minimizing your device downtime.</p>
            </div>

            <div className="card hover:shadow-custom-lg transition-shadow text-center p-6">
              <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Certified Technicians</h3>
              <p className="text-gray-600">Our repair specialists are fully certified and experienced with all major phone brands.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Process */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mobile Repair Process</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've made getting your mobile phone repaired as simple and convenient as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card hover:shadow-custom-lg transition-shadow p-6 text-center">
              <div className="relative">
                <div className="rounded-full bg-primary-600 w-12 h-12 flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                  1
                </div>
                <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-primary-100"></div>
              </div>
              <h3 className="text-xl font-bold mb-3">Book Your Repair</h3>
              <p className="text-gray-600">Schedule a convenient time online or by phone. We offer same-day appointments across the Lower Mainland.</p>
            </div>

            <div className="card hover:shadow-custom-lg transition-shadow p-6 text-center">
              <div className="relative">
                <div className="rounded-full bg-primary-600 w-12 h-12 flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                  2
                </div>
                <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-primary-100"></div>
              </div>
              <h3 className="text-xl font-bold mb-3">Doorstep Diagnosis</h3>
              <p className="text-gray-600">Our technician arrives at your location, diagnoses the issue, and provides a final quote before proceeding.</p>
            </div>

            <div className="card hover:shadow-custom-lg transition-shadow p-6 text-center">
              <div className="relative">
                <div className="rounded-full bg-primary-600 w-12 h-12 flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">On-Site Repair</h3>
              <p className="text-gray-600">We complete the repair right there at your chosen location, thoroughly test your device, and provide care instructions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Fix Your Mobile Phone?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Book our doorstep mobile repair service and have your phone fixed without the hassle of going to a repair shop.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                          <Link href="/book-online?deviceType=mobile" className="btn-accent text-center">
                Book a Repair
              </Link>
              <Link href="/contact" className="btn-outline border-white text-white hover:bg-primary-700 text-center">
                  Contact Us
                </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
} 