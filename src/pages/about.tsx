import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { FaTools, FaUserCheck, FaAward, FaMapMarkerAlt, FaHandshake, FaLeaf } from 'react-icons/fa';

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
    description: 'Expanded services to cover the entire Lower Mainland, including Burnaby, Surrey, and Richmond.'
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
                <Link href="/services/mobile" className="btn-accent text-center">
                  Our Services
                </Link>
                <Link href="/contact" className="btn-outline border-white text-white hover:bg-primary-600 text-center">
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-custom-lg">
                <Image
                  src="/images/about/team-meeting.svg"
                  alt="The Travelling Technicians team"
                  fill
                  className="object-contain"
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
                Our founder, Manoj Kumar, with over a decade of experience in device repair, envisioned a better way. What if skilled technicians could bring their expertise and tools directly to the customer? This would eliminate travel time, reduce device downtime, and provide complete transparency throughout the repair process.
              </p>
              <p className="text-gray-600">
                Since our launch in 2016, we've grown from a small operation in Vancouver to a team of certified technicians serving the entire Lower Mainland. Our commitment to convenience, quality, and transparency has made us the preferred mobile repair service for thousands of satisfied customers.
              </p>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="relative h-[450px] w-full rounded-lg overflow-hidden shadow-custom">
                <Image
                  src="/images/about/repair-process.svg"
                  alt="Our team working together"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-custom-lg hidden md:block">
                <div className="text-center">
                  <p className="font-bold text-2xl text-primary-600">7+ Years</p>
                  <p className="text-sm text-gray-600">Serving the Lower Mainland</p>
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
                Our technicians undergo rigorous training and certification to ensure the highest quality repairs for all devices.
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
                We use only premium parts and back every repair with our service warranty for your peace of mind.
              </p>
            </div>

            {/* Value 5 */}
            <div className="card hover:shadow-custom-lg transition-shadow text-center">
              <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <FaMapMarkerAlt className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Community Focus</h3>
              <p className="text-gray-600">
                As a local business, we're committed to serving and supporting our Lower Mainland community.
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

      {/* Our Team Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Meet Our Expert Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our certified technicians bring years of experience and a passion for technology repair right to your doorstep.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="card hover:shadow-custom-lg transition-shadow">
                <div className="relative h-64 w-full mb-4 rounded-md overflow-hidden">
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    width={300}
                    height={300}
                    className="object-contain w-full h-full"
                    priority
                  />
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-primary-600 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-500 mb-3">{member.specialization}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From our humble beginnings to becoming the Lower Mainland's premier doorstep repair service.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex">
                  <div className="flex-shrink-0 w-24 text-center">
                    <div className="bg-primary-600 text-white rounded-full px-3 py-1 font-bold mb-2">
                      {milestone.year}
                    </div>
                    <div className="h-full w-0.5 bg-primary-100 mx-auto"></div>
                  </div>
                  <div className="flex-grow pb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications & Credentials */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Credentials</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our technicians are fully certified and trained to provide professional repairs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card hover:shadow-custom-lg transition-shadow text-center">
              <div className="mb-4">
                <Image 
                  src="/images/certifications/apple.svg" 
                  alt="Apple Certified Repair Provider" 
                  width={120}
                  height={120}
                  className="mx-auto"
                  priority
                />
              </div>
              <h3 className="text-xl font-bold mb-2">Apple Certified Repair</h3>
              <p className="text-gray-600">
                Our technicians have completed Apple's rigorous certification program for iPhone and MacBook repairs.
              </p>
            </div>
            
            <div className="card hover:shadow-custom-lg transition-shadow text-center">
              <div className="mb-4">
                <Image 
                  src="/images/certifications/samsung.svg" 
                  alt="Samsung Authorized Service" 
                  width={120}
                  height={120}
                  className="mx-auto"
                  priority
                />
              </div>
              <h3 className="text-xl font-bold mb-2">Samsung Authorized Service</h3>
              <p className="text-gray-600">
                Certified to repair Samsung Galaxy devices with manufacturer-approved parts and techniques.
              </p>
            </div>
            
            <div className="card hover:shadow-custom-lg transition-shadow text-center">
              <div className="mb-4">
                <Image 
                  src="/images/certifications/comptia.svg" 
                  alt="Computer Hardware Certification" 
                  width={120}
                  height={120}
                  className="mx-auto"
                  priority
                />
              </div>
              <h3 className="text-xl font-bold mb-2">CompTIA A+ Certified</h3>
              <p className="text-gray-600">
                Our computer technicians hold CompTIA A+ certification, the industry standard for computer hardware troubleshooting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Experience Our Doorstep Repair Service</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Join thousands of satisfied customers who've discovered the convenience of professional device repair that comes to you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/book-online" className="btn-accent text-center">
                Book a Repair
              </Link>
              <Link href="/contact" className="btn-outline border-white text-white hover:bg-primary-700 text-center">
                Contact Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
} 