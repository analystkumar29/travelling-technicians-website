import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import Image from 'next/image';
import { FaTools, FaCheck, FaClock, FaMapMarkerAlt, FaShieldAlt, FaStar, FaArrowRight, FaMobile, FaLaptop } from 'react-icons/fa';

// Benefits of doorstep repair
const benefits = [
  {
    id: 'convenience',
    title: 'Ultimate Convenience',
    description: 'Skip the trip to a repair shop. Our technicians come to your home or office, saving you valuable time and hassle.',
    icon: <FaClock className="h-8 w-8" />
  },
  {
    id: 'no-wait',
    title: 'No Wait Times',
    description: 'No need to leave your device for days. Most repairs are completed on-site in 30-60 minutes while you watch.',
    icon: <FaClock className="h-8 w-8" />
  },
  {
    id: 'transparency',
    title: 'Complete Transparency',
    description: "Watch the entire repair process. Know exactly what's happening with your device at every step.",
    icon: <FaCheck className="h-8 w-8" />
  },
  {
    id: 'comfort',
    title: 'Comfort & Safety',
    description: 'Remain in the comfort of your own space. Especially valuable for those with busy schedules or limited mobility.',
    icon: <FaMapMarkerAlt className="h-8 w-8" />
  },
  {
    id: 'expertise',
    title: 'Same Expertise',
    description: 'Our mobile technicians are fully certified with the same skills and tools as in-shop technicians.',
    icon: <FaTools className="h-8 w-8" />
  },
  {
    id: 'warranty',
    title: 'Full Warranty Coverage',
    description: 'All doorstep repairs come with our standard 90-day warranty on parts and labor for your peace of mind.',
    icon: <FaShieldAlt className="h-8 w-8" />
  }
];

// Customer stories
const customerStories = [
  {
    id: 1,
    name: 'David Chen',
    location: 'Vancouver',
    quote: "Having my MacBook fixed while working from my home office was a game-changer. The technician was professional, and I didn't lose a day of work!",
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    device: 'MacBook Pro',
    repair: 'Screen Replacement'
  },
  {
    id: 2,
    name: 'Sarah Williams',
    location: 'Burnaby',
    quote: "As a busy mom, taking my phone to a repair shop would have been a hassle. The Travelling Technicians fixed my iPhone screen right at my kitchen table while my kids napped.",
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
    device: 'iPhone 13',
    repair: 'Screen Replacement'
  },
  {
    id: 3,
    name: 'Michael Thompson',
    location: 'Richmond',
    quote: "Our small business relies on our laptops. Having a technician come to our office saved us from disrupting our workflow. Highly recommend!",
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    device: 'Dell XPS',
    repair: 'Battery & RAM Upgrade'
  }
];

// Repair process steps
const repairProcess = [
  {
    id: 1,
    title: 'Book Online',
    description: 'Select your device, issue, and preferred time slot through our easy online booking system.'
  },
  {
    id: 2,
    title: 'Confirmation',
    description: "Receive booking confirmation with your technician's details and estimated arrival window."
  },
  {
    id: 3,
    title: 'Technician Arrival',
    description: 'Our certified technician arrives at your location with all necessary tools and parts.'
  },
  {
    id: 4,
    title: 'Diagnosis',
    description: 'The technician diagnoses the issue and provides a final quote before beginning work.'
  },
  {
    id: 5,
    title: 'Repair',
    description: 'Watch as your device is repaired on-site, with most repairs completed in 30-60 minutes.'
  },
  {
    id: 6,
    title: 'Payment & Warranty',
    description: 'Pay only when the repair is complete and working properly. Receive your 90-day warranty information.'
  }
];

export default function DoorstepRepairPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Doorstep Device Repair Service
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                Why travel to a repair shop when our certified technicians can come to you? Get your mobile phone or laptop repaired at your home, office, or anywhere in the Lower Mainland.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/book-online">
                  <a className="btn-accent text-center">
                    Book Your Doorstep Repair
                  </a>
                </Link>
                <Link href="/pricing">
                  <a className="btn-outline border-white text-white hover:bg-primary-600 text-center">
                    View Pricing
                  </a>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-custom-lg">
                <Image
                  src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f"
                  alt="Technician repairing a device at customer location"
                  layout="fill"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-6">
                    <div className="inline-block bg-accent-500 text-white text-sm px-3 py-1 rounded-full mb-3">
                      Fast & Convenient
                    </div>
                    <p className="text-white text-xl font-bold">
                      Most repairs completed in 30-60 minutes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Benefits of Doorstep Repair</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the convenience and advantages of having your device repaired at your location
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.id} className="card hover:shadow-custom-lg transition-shadow">
                <div className="p-6">
                  <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mb-4">
                    <div className="text-primary-600">
                      {benefit.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Doorstep Repair Process</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A seamless experience from booking to completed repair
            </p>
          </div>

          <div className="relative">
            {/* Process Timeline */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-primary-100 transform -translate-x-1/2"></div>
            
            <div className="space-y-12">
              {repairProcess.map((step, index) => (
                <div key={step.id} className={`flex md:flex-row flex-col md:even:flex-row-reverse relative mb-8 ${
                  index !== repairProcess.length - 1 ? 'pb-12' : ''
                }`}>
                  {/* Circle on timeline */}
                  <div className="hidden md:block absolute left-1/2 top-0 w-10 h-10 bg-primary-600 rounded-full text-white font-bold flex items-center justify-center transform -translate-x-1/2">
                    {step.id}
                  </div>
                  
                  <div className="md:w-1/2 md:pr-12 md:pl-0 pl-12 relative">
                    {/* Mobile circle */}
                    <div className="md:hidden absolute left-0 top-0 w-8 h-8 bg-primary-600 rounded-full text-white font-bold flex items-center justify-center">
                      {step.id}
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  
                  <div className="md:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Available Services */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Services Available at Your Doorstep</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Most repairs can be completed on-site at your location
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mobile Repairs */}
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <span className="rounded-full bg-primary-100 p-2 mr-3">
                    <FaMobile className="h-6 w-6 text-primary-600" />
                  </span>
                  Mobile Phone Repairs
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaCheck className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Screen replacements for all major brands</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Battery replacements and optimization</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Charging port and connector repairs</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Camera, speaker, and microphone fixes</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Software troubleshooting and updates</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Data backup and transfer assistance</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link href="/services/mobile">
                    <a className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
                      View All Mobile Services
                      <FaArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Link>
                </div>
              </div>
            </div>

            {/* Laptop Repairs */}
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <span className="rounded-full bg-primary-100 p-2 mr-3">
                    <FaLaptop className="h-6 w-6 text-primary-600" />
                  </span>
                  Laptop Repairs
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaCheck className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Screen replacements and repairs</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Battery replacements for extended life</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Keyboard and trackpad repairs</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Hard drive/SSD upgrades and replacements</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                    <span>RAM upgrades for improved performance</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheck className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Operating system installation and troubleshooting</span>
                  </li>
                </ul>
                <div className="mt-6">
                  <Link href="/services/laptop">
                    <a className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
                      View All Laptop Services
                      <FaArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 bg-gray-50 rounded-lg p-6 max-w-3xl mx-auto">
            <p className="text-center text-gray-700 mb-0">
              <span className="font-medium">Note:</span> While most repairs can be completed at your doorstep, some complex issues may require additional equipment. Our technician will diagnose on-site and provide options if more extensive work is needed.
            </p>
          </div>
        </div>
      </section>

      {/* Customer Stories */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Customer Stories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See why customers across the Lower Mainland choose our doorstep repair service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {customerStories.map((story) => (
              <div key={story.id} className="card hover:shadow-custom-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="relative w-16 h-16 overflow-hidden rounded-full mr-4">
                      <Image 
                        src={story.image} 
                        alt={story.name} 
                        layout="fill"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold">{story.name}</h3>
                      <p className="text-gray-600 text-sm">{story.location}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex text-yellow-400 mb-2">
                      <FaStar />
                      <FaStar />
                      <FaStar />
                      <FaStar />
                      <FaStar />
                    </div>
                    <p className="italic text-gray-700">"{story.quote}"</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                    <p><span className="font-medium">Device:</span> {story.device}</p>
                    <p><span className="font-medium">Service:</span> {story.repair}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Map */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Doorstep Service Coverage</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We service the entire Lower Mainland area with technicians based throughout the region
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm mb-6">
              <div className="aspect-w-16 aspect-h-9 w-full rounded-lg overflow-hidden">
                {/* This would be replaced with an actual map in production */}
                <div className="relative h-[400px] w-full">
                  <Image 
                    src="https://images.unsplash.com/photo-1520500807606-4ac9ae633574" 
                    alt="Lower Mainland Service Area Map" 
                    layout="fill"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-center text-white p-6">
                      <p className="text-xl mb-4">Service Coverage Map</p>
                      <p>We provide doorstep repair services throughout the Lower Mainland region</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <FaMapMarkerAlt className="inline-block mr-1 text-primary-600" />
                Vancouver
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <FaMapMarkerAlt className="inline-block mr-1 text-primary-600" />
                Burnaby
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <FaMapMarkerAlt className="inline-block mr-1 text-primary-600" />
                Surrey
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <FaMapMarkerAlt className="inline-block mr-1 text-primary-600" />
                Richmond
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <FaMapMarkerAlt className="inline-block mr-1 text-primary-600" />
                Coquitlam
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <FaMapMarkerAlt className="inline-block mr-1 text-primary-600" />
                New Westminster
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <FaMapMarkerAlt className="inline-block mr-1 text-primary-600" />
                North Vancouver
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <FaMapMarkerAlt className="inline-block mr-1 text-primary-600" />
                West Vancouver
              </div>
            </div>

            <div className="text-center">
              <Link href="/service-areas">
                <a className="btn-outline">
                  View All Service Areas
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Common Questions About Doorstep Repair</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about our mobile repair service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">How does doorstep repair work?</h3>
              <p className="text-gray-600">
                After booking online, our certified technician arrives at your location with all the necessary tools and parts. They diagnose the issue, provide a final quote, and complete the repair right there while you watch.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">Is there an extra fee for doorstep service?</h3>
              <p className="text-gray-600">
                No, our prices include the convenience of doorstep service with no additional travel or convenience fees for locations within our standard service area in the Lower Mainland.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">What if my device can\'t be repaired on-site?</h3>
              <p className="text-gray-600">
                In rare cases where a repair can\'t be completed on-site, our technician will explain why and provide options including arranging repair at our service center with convenient pickup and delivery.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">Do I need to prepare anything before the technician arrives?</h3>
              <p className="text-gray-600">
                We recommend backing up your data if possible and ensuring there's a clean, well-lit space for the technician to work. You'll also need ID to verify device ownership.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">How quickly can you come to my location?</h3>
              <p className="text-gray-600">
                Depending on technician availability, we often offer same-day service for popular areas like Vancouver, Burnaby, and Richmond. Most locations can be serviced within 24-48 hours of booking.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-2">Are the parts and repairs the same quality as in-shop repairs?</h3>
              <p className="text-gray-600">
                Absolutely. We use the same high-quality parts for doorstep repairs as we do for our in-shop services. All repairs come with our standard 90-day warranty regardless of where they're performed.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Link href="/faq">
              <a className="text-primary-600 hover:text-primary-700 font-medium">
                View All FAQs
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready for a Repair at Your Doorstep?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Book your device repair today, and our technicians will come to your doorstep.
            </p>
            <Link href="/book-online">
              <a className="btn-accent text-center inline-block">
                Book Your Doorstep Repair
              </a>
            </Link>
            <p className="mt-4 text-primary-100">
              Most repairs completed in 30-60 minutes with 90-day warranty
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
} 