import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { FaTools, FaUserCheck, FaAward, FaMapMarkerAlt, FaHandshake, FaLeaf, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import { OrganizationSchema, LocalBusinessSchema } from '@/components/seo/StructuredData';

// Team members data
const teamMembers = [
  {
    id: 1,
    name: 'Manoj Kumar',
    role: 'Founder & Lead Technician',
    bio: 'With over 10 years of experience in mobile and computer repair, Manoj founded The Travelling Technicians to bring convenient repair services directly to customers. Certified in Apple and Samsung repairs.',
    image: '/images/team/founder.svg',
    specialization: 'iPhone Repairs, MacBook Specialist'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    role: 'Senior Mobile Repair Technician',
    bio: 'Sarah joined the team 5 years ago and specializes in Samsung Galaxy repairs and screen replacements. Known for her attention to detail and exceptional customer service.',
    image: '/images/team/mobile-tech.svg',
    specialization: 'Samsung Specialist, Screen Repairs'
  },
  {
    id: 3,
    name: 'Vishal Sharma',
    role: 'Computer & Laptop Specialist',
    bio: 'Vishal brings 8 years of experience in computer hardware and software troubleshooting. His expertise in laptop repairs and upgrades helps customers extend the life of their devices.',
    image: '/images/team/laptop-tech.svg',
    specialization: 'Laptop Repairs, Hardware Upgrades'
  },
  {
    id: 4,
    name: 'Michelle Wong',
    role: 'Operations Manager',
    bio: 'Michelle ensures the smooth operation of our mobile repair service. She coordinates scheduling, parts ordering, and customer support to deliver the best possible experience.',
    image: '/images/team/operations.svg',
    specialization: 'Customer Experience, Scheduling'
  }
];

// Company milestones
const milestones = [
  {
    year: '2016',
    title: 'Company Founded',
    description: 'The Travelling Technicians launched in Vancouver with just two technicians and a vision to revolutionize the repair experience.'
  },
  {
    year: '2017',
    title: 'Service Area Expansion',
    description: 'Expanded services to cover the entire Lower Mainland, including Burnaby, Richmond, and New Westminster.'
  },
  {
    year: '2019',
    title: 'Online Booking Platform',
    description: 'Launched our seamless online booking system allowing customers to schedule repairs with just a few clicks.'
  },
  {
    year: '2021',
    title: 'Certified Partnership Program',
    description: 'Became official certified repair partners with major manufacturers, ensuring the highest quality parts and service.'
  },
  {
    year: '2023',
    title: 'Growing Our Team',
    description: 'Expanded our team of certified technicians to meet increasing demand while maintaining our high-quality service standards.'
  }
];

export default function AboutPage() {
  return (
    <>
      <Head>
        {/* About Page Structured Data */}
        <OrganizationSchema />
        <LocalBusinessSchema
          name="The Travelling Technicians"
          description="Professional mobile phone and laptop repair services with doorstep service across Vancouver and Lower Mainland, BC. Founded to provide convenient, reliable tech repair solutions right at your location."
        />
      </Head>
      <Layout title="About Us | The Travelling Technicians">
      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                About The Travelling Technicians
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                We're a team of certified repair specialists bringing professional mobile and laptop repair services directly to your doorstep across the Lower Mainland.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/services/mobile-repair" className="btn-accent text-center">
                  View Mobile Services
                </Link>
                <Link href="/contact" className="btn-outline border-white text-white hover:bg-primary-600 text-center">
                    Contact Us
                  </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-custom-lg">
                <Image
                  src="/images/services/doorstep-repair-tech.jpg"
                  alt="Technician repairing a device at customer's doorstep"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                The Travelling Technicians was born out of a simple observation: traditional repair shops require customers to disconnect from their devices, travel to a store, and leave their precious technology with strangers - often for days at a time.
              </p>
              <p className="text-gray-600 mb-4">
                We envisioned a better way. What if skilled technicians could bring their expertise and tools directly to the customer? This would eliminate travel time, reduce device downtime, and provide complete transparency throughout the repair process.
              </p>
              <p className="text-gray-600">
                Our commitment to convenience, quality, and transparency makes us the preferred mobile repair service for customers across Vancouver, Burnaby, Richmond, and surrounding areas.
              </p>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="relative h-[450px] w-full rounded-lg overflow-hidden shadow-custom">
                <div className="bg-gradient-to-br from-primary-100 to-primary-200 h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-primary-600 mb-4">
                      <FaTools className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary-800 mb-2">Professional Repair</h3>
                    <p className="text-primary-700">At Your Doorstep</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-custom-lg hidden md:block">
                <div className="text-center">
                  <p className="font-bold text-2xl text-primary-600">150+</p>
                  <p className="text-sm text-gray-600">Satisfied Customers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do, from how we repair devices to how we interact with our customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="card hover:shadow-custom-lg transition-shadow text-center">
              <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <FaUserCheck className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Customer Convenience</h3>
              <p className="text-gray-600">
                We prioritize your time and comfort by bringing our services directly to you, when and where you need them.
              </p>
            </div>

            {/* Value 2 */}
            <div className="card hover:shadow-custom-lg transition-shadow text-center">
              <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <FaTools className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Technical Excellence</h3>
              <p className="text-gray-600">
                Our technicians have years of experience and use only high-quality parts to ensure reliable repairs.
              </p>
            </div>

            {/* Value 3 */}
            <div className="card hover:shadow-custom-lg transition-shadow text-center">
              <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <FaHandshake className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Complete Transparency</h3>
              <p className="text-gray-600">
                We explain every step of the repair process and provide clear, upfront pricing with no hidden fees.
              </p>
            </div>

            {/* Value 4 */}
            <div className="card hover:shadow-custom-lg transition-shadow text-center">
              <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <FaAward className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Quality Guaranteed</h3>
              <p className="text-gray-600">
                We use only premium parts and back every repair with our 90-day warranty for your peace of mind.
              </p>
            </div>

            {/* Value 5 */}
            <div className="card hover:shadow-custom-lg transition-shadow text-center">
              <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <FaMapMarkerAlt className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Local Focus</h3>
              <p className="text-gray-600">
                We focus on serving our local Lower Mainland community with personalized, reliable service.
              </p>
            </div>

            {/* Value 6 */}
            <div className="card hover:shadow-custom-lg transition-shadow text-center">
              <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <FaLeaf className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Environmental Responsibility</h3>
              <p className="text-gray-600">
                We extend the life of devices through repair and responsibly recycle components to reduce electronic waste.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose The Travelling Technicians?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover what makes our doorstep repair service the smart choice for busy people.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="rounded-full bg-green-100 p-2 mr-4 mt-1">
                    <FaCheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">No Travel Required</h3>
                    <p className="text-gray-600">Save time and gas - we come to your home, office, or preferred location.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-green-100 p-2 mr-4 mt-1">
                    <FaCheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Same-Day Service</h3>
                    <p className="text-gray-600">Most repairs completed on the same day, often within 1-2 hours.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-green-100 p-2 mr-4 mt-1">
                    <FaCheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">90-Day Warranty</h3>
                    <p className="text-gray-600">All repairs backed by our comprehensive warranty for peace of mind.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-green-100 p-2 mr-4 mt-1">
                    <FaCheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Transparent Pricing</h3>
                    <p className="text-gray-600">Clear quotes with no hidden fees - you pay what we quote.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 text-center">
              <div className="text-primary-600 mb-6">
                <FaShieldAlt className="h-20 w-20 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-primary-800 mb-4">Professional & Reliable</h3>
              <p className="text-primary-700 mb-6">
                Our experienced technicians bring professional equipment and high-quality parts directly to you.
              </p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-600">150+</div>
                  <div className="text-sm text-primary-700">Repairs Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-600">4.8★</div>
                  <div className="text-sm text-primary-700">Customer Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Doorstep Repair?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Join our satisfied customers across Vancouver, Burnaby, Richmond, and surrounding areas.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/book-online" className="btn-accent text-center">
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
    </>
  );
} 