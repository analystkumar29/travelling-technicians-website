import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { FaTools, FaClock, FaShieldAlt, FaCheckCircle, FaMapMarkerAlt, FaStar, FaArrowRight, FaMobile, FaLaptop, FaTabletAlt } from 'react-icons/fa';
import PostalCodeChecker from '@/components/PostalCodeChecker';

// Device brands
const deviceBrands = [
  { id: 'apple', name: 'Apple', image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=200' },
  { id: 'samsung', name: 'Samsung', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=200' },
  { id: 'google', name: 'Google', image: 'https://images.unsplash.com/photo-1604037502574-11207107f274?q=80&w=200' },
  { id: 'xiaomi', name: 'Xiaomi', image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?q=80&w=200' },
  { id: 'oneplus', name: 'OnePlus', image: 'https://images.unsplash.com/photo-1584006682522-dc17d6c0272e?q=80&w=200' },
  { id: 'huawei', name: 'Huawei', image: 'https://images.unsplash.com/photo-1612815452771-2c59c5206735?q=80&w=200' },
];

// Common issues
const commonIssues = {
  mobile: [
    { id: 'screen', name: 'Screen Replacement', image: '/images/screen.png', doorstep: true },
    { id: 'battery', name: 'Battery Replacement', image: '/images/battery.png', doorstep: true },
    { id: 'charging', name: 'Charging Port Repair', image: '/images/charging.png', doorstep: true },
    { id: 'camera', name: 'Camera Repair', image: '/images/camera.png', doorstep: true },
    { id: 'water', name: 'Water Damage', image: '/images/water-damage.png', doorstep: false },
    { id: 'audio', name: 'Speaker/Mic Repair', image: '/images/speaker.png', doorstep: true },
  ],
  laptop: [
    { id: 'screen', name: 'Screen Replacement', image: '/images/laptop-screen.png', doorstep: true },
    { id: 'battery', name: 'Battery Replacement', image: '/images/laptop-battery.png', doorstep: true },
    { id: 'keyboard', name: 'Keyboard Repair', image: '/images/laptop-keyboard.png', doorstep: true },
    { id: 'harddrive', name: 'HDD/SSD Upgrade', image: '/images/harddrive.png', doorstep: true },
    { id: 'ram', name: 'RAM Upgrade', image: '/images/ram.png', doorstep: true },
    { id: 'os', name: 'OS Installation', image: '/images/os.png', doorstep: true },
  ],
  tablet: [
    { id: 'screen', name: 'Screen Replacement', image: '/images/tablet-screen.png', doorstep: true },
    { id: 'battery', name: 'Battery Replacement', image: '/images/tablet-battery.png', doorstep: true },
    { id: 'charging', name: 'Charging Port Repair', image: '/images/tablet-charging.png', doorstep: true },
    { id: 'camera', name: 'Camera Repair', image: '/images/tablet-camera.png', doorstep: true },
    { id: 'button', name: 'Button Repair', image: '/images/tablet-button.png', doorstep: true },
    { id: 'software', name: 'Software Issues', image: '/images/tablet-software.png', doorstep: true },
  ]
};

// Testimonials
const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    location: 'Vancouver',
    rating: 5,
    comment: 'Incredible service! The technician arrived within the scheduled window and fixed my iPhone screen in about 40 minutes. Very professional and convenient.',
    device: 'iPhone 13 Pro'
  },
  {
    id: 2,
    name: 'Michael Chen',
    location: 'Burnaby',
    rating: 5,
    comment: 'Had my MacBook battery replaced at home. The technician was knowledgeable, efficient, and even cleaned up afterward. Highly recommend!',
    device: 'MacBook Pro 2019'
  },
  {
    id: 3,
    name: 'Jason Taylor',
    location: 'Richmond',
    rating: 4,
    comment: 'Great experience with their doorstep service. The Samsung screen replacement was perfect and the price was reasonable. Will use again!',
    device: 'Samsung Galaxy S22'
  },
  {
    id: 4,
    name: 'Priya Patel',
    location: 'Surrey',
    rating: 5,
    comment: 'Saved me so much time! No need to go to a repair shop and leave my laptop behind. Technician was punctual and fixed my keyboard issues while I worked on another device.',
    device: 'Dell XPS 13'
  },
];

export default function Home() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'laptop' | 'tablet'>('mobile');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState(0);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  // Rotate testimonials automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedTestimonial((prev) => 
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      {/* Hero Section with Device Selector */}
      <section className="pt-16 pb-16 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Doorstep Mobile & Laptop Repair Services
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                Expert technicians come to your location in the Lower Mainland. Most repairs completed in under 60 minutes.
              </p>
              
              {/* Device Type Selector Tabs */}
              <div className="bg-primary-800 inline-flex rounded-lg p-1 mb-6">
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    deviceType === 'mobile' 
                      ? 'bg-white text-primary-800' 
                      : 'text-white hover:bg-primary-700'
                  }`}
                  onClick={() => {
                    setDeviceType('mobile');
                    setSelectedBrand(null);
                    setSelectedIssue(null);
                  }}
                >
                  <FaMobile className="inline mr-2" />
                  Mobile
                </button>
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    deviceType === 'laptop' 
                      ? 'bg-white text-primary-800' 
                      : 'text-white hover:bg-primary-700'
                  }`}
                  onClick={() => {
                    setDeviceType('laptop');
                    setSelectedBrand(null);
                    setSelectedIssue(null);
                  }}
                >
                  <FaLaptop className="inline mr-2" />
                  Laptop
                </button>
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    deviceType === 'tablet' 
                      ? 'bg-white text-primary-800' 
                      : 'text-white hover:bg-primary-700'
                  }`}
                  onClick={() => {
                    setDeviceType('tablet');
                    setSelectedBrand(null);
                    setSelectedIssue(null);
                  }}
                >
                  <FaTabletAlt className="inline mr-2" />
                  Tablet
                </button>
              </div>
              
              {/* Check Service Availability */}
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <h3 className="text-primary-800 font-bold mb-2">Check Service Availability</h3>
                <PostalCodeChecker variant="compact" className="text-gray-800" />
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-custom-lg">
                <Image
                  src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789"
                  alt="Technician repairing a device"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-6">
                    <div className="inline-block bg-accent-500 text-white text-sm px-3 py-1 rounded-full mb-3">
                      Doorstep Service
                    </div>
                    <p className="text-white text-xl font-bold">
                      Skip the repair shop. We come to you!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Repair Process */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Repair at Your Doorstep</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional device repair in 3 simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative card hover:shadow-custom-lg transition-shadow text-center p-8">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-accent-500 text-white flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div className="rounded-full bg-primary-100 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Book Online</h3>
              <p className="text-gray-600">
                Select your device, tell us what's wrong, and choose a convenient time for our technician to visit.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="relative card hover:shadow-custom-lg transition-shadow text-center p-8">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-accent-500 text-white flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div className="rounded-full bg-primary-100 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">We Come to You</h3>
              <p className="text-gray-600">
                Our certified technician arrives at your location with all the necessary tools and parts.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="relative card hover:shadow-custom-lg transition-shadow text-center p-8">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-accent-500 text-white flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div className="rounded-full bg-primary-100 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Get Repaired & Relax</h3>
              <p className="text-gray-600">
                Watch as we repair your device on-site. Most repairs are completed in 30-60 minutes with warranty.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Common Repair Options */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Select Your Issue</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose your device problem to see pricing and book a repair
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Brands Selection */}
            <h3 className="text-2xl font-bold mb-6 text-center">Choose Your Brand</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
              {deviceBrands.map((brand) => (
                <button
                  key={brand.id}
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors ${
                    selectedBrand === brand.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedBrand(brand.id)}
                >
                  <div className="relative w-12 h-12 mb-2">
                    <Image 
                      src={brand.image} 
                      alt={brand.name} 
                      fill
                      className="object-contain" 
                    />
                  </div>
                  <span className="text-sm font-medium">{brand.name}</span>
                </button>
              ))}
            </div>
            
            {/* Issues Selection */}
            {selectedBrand && (
              <>
                <h3 className="text-2xl font-bold mb-6 text-center">Select Your Issue</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                  {commonIssues[deviceType].map((issue) => (
                    <button
                      key={issue.id}
                      className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors ${
                        selectedIssue === issue.id 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedIssue(issue.id)}
                    >
                      <div className="relative w-12 h-12 mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                        {/* This would ideally be an actual image of the issue */}
                        <FaTools className="text-primary-600 text-2xl" />
                      </div>
                      <span className="text-sm font-medium text-center">{issue.name}</span>
                      {issue.doorstep && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full mt-1">
                          Doorstep Available
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
            
            {/* Book Now Button */}
            {selectedIssue && (
              <div className="text-center">
                <p className="text-lg text-gray-700 mb-4">
                  We can fix your {
                    deviceType === 'mobile' ? 'phone' : 
                    deviceType === 'laptop' ? 'laptop' : 'tablet'
                  } {selectedIssue} issue at your doorstep!
                </p>
                <Link 
                  href="/book-online/" 
                  className="btn-primary text-lg inline-block"
                >
                  See Pricing & Book Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Trust Metrics */}
      <section className="py-16 bg-primary-700 text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose The Travelling Technicians</h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Thousands of satisfied customers across the Lower Mainland
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">5,000+</div>
              <p className="text-primary-100">Devices Repaired</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">92%</div>
              <p className="text-primary-100">Same Day Repairs</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">4.9</div>
              <p className="text-primary-100">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">90 Days</div>
              <p className="text-primary-100">Warranty Period</p>
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
              Why customers across the Lower Mainland choose our mobile repair service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="p-6">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mb-4">
                  <FaClock className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Save Time</h3>
                <p className="text-gray-600">
                  No need to travel to a repair shop or wait days for your device. Our technicians come to you and complete most repairs within an hour.
                </p>
              </div>
            </div>
            
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="p-6">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mb-4">
                  <FaTools className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Expert Technicians</h3>
                <p className="text-gray-600">
                  All our technicians are certified professionals with years of experience repairing a wide range of devices.
                </p>
              </div>
            </div>
            
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="p-6">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mb-4">
                  <FaShieldAlt className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Quality Guaranteed</h3>
                <p className="text-gray-600">
                  We use only high-quality replacement parts and back every repair with our 90-day warranty for your peace of mind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section 
        className="py-16 bg-gray-50"
        ref={testimonialsRef}
      >
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Read reviews from satisfied customers across the Lower Mainland
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-custom p-8 relative">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-yellow-400 flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="w-5 h-5" />
                ))}
              </div>
              
              <div className="pt-8">
                <p className="text-lg text-gray-700 italic mb-6">
                  "{testimonials[selectedTestimonial].comment}"
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{testimonials[selectedTestimonial].name}</p>
                    <p className="text-sm text-gray-500">
                      {testimonials[selectedTestimonial].location} • {testimonials[selectedTestimonial].device}
                    </p>
                  </div>
                  
                  <div className="flex">
                    {testimonials.map((_, idx) => (
                      <button 
                        key={idx}
                        className={`w-3 h-3 mx-1 rounded-full ${
                          selectedTestimonial === idx 
                            ? 'bg-primary-600' 
                            : 'bg-gray-300 hover:bg-primary-400'
                        }`}
                        onClick={() => setSelectedTestimonial(idx)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Areas We Serve */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Areas We Serve</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our technicians provide doorstep service throughout the Lower Mainland
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {['Vancouver', 'Burnaby', 'Richmond', 'Surrey', 'Coquitlam', 'New Westminster', 'North Vancouver', 'West Vancouver', 'Delta', 'Langley'].map((area, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-lg p-3 text-center hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                <FaMapMarkerAlt className="inline-block mr-1" />
                {area}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/service-areas" className="btn-outline inline-block">
              View All Service Areas
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready for Doorstep Repair?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Book now and get your device repaired at your doorstep by certified technicians.
            </p>
            <Link href="/book-online/" className="btn-accent text-center inline-block text-lg">
              Book Your Repair Now
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