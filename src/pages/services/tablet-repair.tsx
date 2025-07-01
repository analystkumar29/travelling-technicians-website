import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { FaCheckCircle, FaTabletAlt, FaBatteryFull, FaBolt, FaCamera, FaVolumeUp, FaBug, FaHandPointer, FaSyncAlt } from 'react-icons/fa';

// Tablet repair services data
const tabletServices = [
  {
    id: 1,
    name: 'Screen Replacement',
    description: 'Fix cracked, damaged, or non-responsive tablet screens with our convenient doorstep service. We replace screens for all major tablet brands including iPad, Samsung Galaxy Tab, and more.',
    icon: <FaTabletAlt className="h-10 w-10" />,
    doorstep: true,
    limited: false,
    price: 'From $149',
    popular: true
  },
  {
    id: 2,
    name: 'Battery Replacement',
    description: 'Extend your tablet\'s battery life with a fresh replacement. Our technicians replace batteries for all major tablet brands right at your location.',
    icon: <FaBatteryFull className="h-10 w-10" />,
    doorstep: true,
    limited: false,
    price: 'From $99',
    popular: true
  },
  {
    id: 3,
    name: 'Charging Port Repair',
    description: 'Struggling with loose connections or charging issues? Our technicians can repair or replace your tablet\'s charging port on-site, restoring reliable power to your device.',
    icon: <FaBolt className="h-10 w-10" />,
    doorstep: true,
    limited: false,
    price: 'From $89',
    popular: false
  },
  {
    id: 4,
    name: 'Camera Repair',
    description: 'Don\'t miss capturing important moments due to camera malfunctions. Our technicians can fix front and rear camera issues on your tablet at your location.',
    icon: <FaCamera className="h-10 w-10" />,
    doorstep: true,
    limited: false,
    price: 'From $109',
    popular: false
  },
  {
    id: 5,
    name: 'Button Repair',
    description: 'Having issues with power buttons, volume controls, or home buttons? Our doorstep service includes expert repair of physical buttons for all major tablet models.',
    icon: <FaVolumeUp className="h-10 w-10" />,
    doorstep: true,
    limited: false,
    price: 'From $79',
    popular: false
  },
  {
    id: 6,
    name: 'Software Issues',
    description: 'Experiencing software problems, slow performance, or app crashes? Our technicians can diagnose and resolve software-related issues at your doorstep.',
    icon: <FaBug className="h-10 w-10" />,
    doorstep: true,
    limited: false,
    price: 'From $89',
    popular: false
  },
  {
    id: 7,
    name: 'Touch Screen Calibration',
    description: 'If your tablet\'s touch response is inaccurate or unresponsive in certain areas, our technicians can recalibrate or repair touch functionality on-site.',
    icon: <FaHandPointer className="h-10 w-10" />,
    doorstep: true,
    limited: false,
    price: 'From $69',
    popular: false
  },
  {
    id: 8,
    name: 'Factory Reset & Setup',
    description: 'Need a fresh start? Our technicians can perform a factory reset and help set up your tablet with all your essential apps and settings at your location.',
    icon: <FaSyncAlt className="h-10 w-10" />,
    doorstep: true,
    limited: false,
    price: 'From $59',
    popular: false
  }
];

// Brands we service
const brands = [
  'Apple iPad (All Models)',
  'Samsung Galaxy Tab',
  'Microsoft Surface',
  'Lenovo Tab',
  'Huawei MediaPad',
  'Amazon Fire Tablet',
  'Google Pixel Tablet',
  'ASUS ZenPad',
  'Sony Xperia Tablet',
  'LG G Pad'
];

export default function TabletRepairPage() {
  return (
    <Layout title="Tablet Repair Services | The Travelling Technicians">
      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Expert Tablet Repair at Your Doorstep
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                From iPad screen replacements to Android tablet battery issues, we bring professional tablet repair services directly to your location across the Lower Mainland.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/book-online?deviceType=tablet" className="btn-accent text-center">
                    Book Tablet Repair
                  </Link>
                <Link href="/pricing" className="btn-outline border-white text-white hover:bg-primary-600 text-center">
                    View Pricing
                  </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-custom-lg">
                <Image
                  src="/images/services/tabletRepair.png"
                  alt="Tablet repair technician"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-custom-lg">
                <div className="text-center">
                  <p className="font-bold text-2xl text-primary-600">45 min</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Tablet Repair Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional tablet repair services brought directly to your doorstep by our certified technicians.
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
              {tabletServices.filter(service => service.popular).map((service) => (
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
                        <Link href="/book-online?deviceType=tablet" className="btn-primary text-sm py-2">
                            Book Now
                          </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Services */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-8 text-center">All Tablet Repair Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tabletServices.map((service) => (
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
                        <Link href="/book-online?deviceType=tablet" className="btn-primary text-sm py-2">
                          Book This Service
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Tablet Brands We Service</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We repair tablets from all major manufacturers with the same level of expertise and attention to detail.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {brands.map((brand, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
                <p className="font-medium text-gray-800">{brand}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose Our Tablet Repair Service?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mx-auto mb-4">
                <FaCheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Expert Technicians</h3>
              <p className="text-gray-600">
                Our certified technicians have years of experience repairing tablets from all major brands.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mx-auto mb-4">
                <FaTabletAlt className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Doorstep Convenience</h3>
              <p className="text-gray-600">
                We come to your home or office, saving you time and the hassle of visiting a repair shop.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mx-auto mb-4">
                <FaBatteryFull className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Quality Parts & Warranty</h3>
              <p className="text-gray-600">
                We use high-quality replacement parts and offer a comprehensive warranty on all repairs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-700 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Your Tablet Fixed?</h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Don't let a broken tablet slow you down. Book our convenient doorstep repair service today and get back to productivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-online?deviceType=tablet" className="btn-accent">
                Book Tablet Repair Now
              </Link>
            <Link href="/contact" className="btn-outline border-white text-white hover:bg-primary-600">
                Have Questions? Contact Us
              </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
