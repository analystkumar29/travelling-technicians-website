import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { FaTools, FaClock, FaShieldAlt, FaCheckCircle, FaMapMarkerAlt, FaStar, FaArrowRight, FaMobile, FaLaptop, FaTabletAlt } from 'react-icons/fa';
import PostalCodeChecker from '@/components/PostalCodeChecker';
import { initUIEnhancements } from '@/utils/ui-enhancements';

// Component to render device brand image with proper dimensions
const BrandImage = ({ src, alt }: { src: string, alt: string }) => {
  return (
    <Image 
      src={src} 
      alt={alt}
      width={200}
      height={150}
      className="object-contain w-full h-full"
    />
  );
};

// Device brands
const deviceBrands = [
  { id: 'apple', name: 'Apple', image: '/images/brands/apple.png' },
  { id: 'samsung', name: 'Samsung', image: '/images/brands/samsung.png' },
  { id: 'google', name: 'Google', image: '/images/brands/google.png' },
  { id: 'xiaomi', name: 'Xiaomi', image: '/images/brands/xiaomi.png' },
  { id: 'oneplus', name: 'OnePlus', image: '/images/brands/oneplus.png' },
  { id: 'huawei', name: 'Huawei', image: '/images/brands/huawei.png' },
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

  // Initialize UI enhancements and add anti-reload loop protection
  useEffect(() => {
    // Check if loop prevention is active, if so don't do anything else
    if (typeof window !== 'undefined' && sessionStorage.getItem('homepageLoopPrevented') === 'true') {
      console.log('Homepage reload loop prevention active, skipping initializations');
      // Just clean up any problematic classes to be extra safe
      document.body.classList.remove('loading-navigation');
      document.body.classList.remove('navigation-stuck');
      document.body.classList.remove('auth-corrupted');
      return;
    }
    
    // Initialize enhancements
    initUIEnhancements();
    
    // Anti-reload loop protection specifically for homepage
    // This helps prevent issues with the auth state detection
    if (typeof window !== 'undefined') {
      // Clear any problematic classes that might cause reload loops
      document.body.classList.remove('loading-navigation');
      document.body.classList.remove('navigation-stuck');
      document.body.classList.remove('auth-corrupted');
      
      // Reset homepage reload counter on deliberate navigation
      const resetReloadCount = () => {
        sessionStorage.setItem('homepageReloadCount', '0');
      };
      
      // Add event listener to links to reset the counter on deliberate navigation
      const links = document.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('click', resetReloadCount);
      });
      
      return () => {
        // Cleanup
        links.forEach(link => {
          link.removeEventListener('click', resetReloadCount);
        });
      };
    }
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-8 md:py-16 bg-gray-50">
        <div className="container-custom hero-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Doorstep Mobile & Laptop Repair Services
              </h1>
              <p className="text-xl mb-8 text-gray-600">
                Expert technicians come to your location in the Lower Mainland. Most repairs completed in under 60 minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <button 
                    onClick={() => setDeviceType('mobile')}
                    className={`w-full flex items-center justify-center p-3 rounded-lg border-2 ${
                      deviceType === 'mobile' 
                        ? 'bg-primary-600 text-white border-primary-600' 
                        : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <FaMobile className="mr-2" />
                    Mobile
                  </button>
                </div>
                <div className="flex-1">
                  <button 
                    onClick={() => setDeviceType('laptop')}
                    className={`w-full flex items-center justify-center p-3 rounded-lg border-2 ${
                      deviceType === 'laptop' 
                        ? 'bg-primary-600 text-white border-primary-600' 
                        : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <FaLaptop className="mr-2" />
                    Laptop
                  </button>
                </div>
                <div className="flex-1">
                  <button 
                    onClick={() => setDeviceType('tablet')}
                    className={`w-full flex items-center justify-center p-3 rounded-lg border-2 ${
                      deviceType === 'tablet' 
                        ? 'bg-primary-600 text-white border-primary-600' 
                        : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <FaTabletAlt className="mr-2" />
                    Tablet
                  </button>
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="text-lg font-bold mb-4">Check Service Availability</h2>
                <PostalCodeChecker />
              </div>
            </div>
            
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <div className="aspect-w-4 aspect-h-3 hero-image">
                <Image 
                  src="/images/services/doorstep-repair-tech.jpg" 
                  alt="Technician repairing a device at customer's doorstep" 
                  className="object-cover"
                  layout="fill"
                  priority={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-6">
                    <div className="inline-block bg-accent-500 text-white text-sm px-3 py-1 rounded-full mb-3 hero-badge">
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
            <div className="relative card hover:shadow-custom-lg transition-shadow text-center p-8" data-step="1">
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
            <div className="relative card hover:shadow-custom-lg transition-shadow text-center p-8" data-step="2">
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
            <div className="relative card hover:shadow-custom-lg transition-shadow text-center p-8" data-step="3">
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
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8 brand-selection">
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
                    <BrandImage src={brand.image} alt={brand.name} />
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
                <Link href="/book-online/">
                  <a className="btn-primary text-lg inline-block">
                    See Pricing & Book Now
                  </a>
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
            <div className="text-center" data-stat="repairs">
              <div className="text-4xl md:text-5xl font-bold mb-2">5,000+</div>
              <p className="text-primary-100">Devices Repaired</p>
            </div>
            <div className="text-center" data-stat="sameDay">
              <div className="text-4xl md:text-5xl font-bold mb-2">92%</div>
              <p className="text-primary-100">Same Day Repairs</p>
            </div>
            <div className="text-center" data-stat="rating">
              <div className="text-4xl md:text-5xl font-bold mb-2">4.9</div>
              <p className="text-primary-100">Average Rating</p>
            </div>
            <div className="text-center" data-stat="warranty">
              <div className="text-4xl md:text-5xl font-bold mb-2">90</div>
              <p className="text-primary-100">Days Warranty</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Advantages / Benefits */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Benefits of Doorstep Repair</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Why customers across the Lower Mainland choose our mobile repair service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 benefits-container">
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="p-6">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mb-6">
                  <FaClock className="h-8 w-8 text-primary-600 benefit-icon" />
                </div>
                <h3 className="text-xl font-bold mb-4">Save Time</h3>
                <p className="text-gray-600">
                  No need to travel to a repair shop or wait days for your device. Our technicians come to you and complete most repairs within an hour.
                </p>
              </div>
            </div>
            
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="p-6">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mb-6">
                  <FaTools className="h-8 w-8 text-primary-600 benefit-icon" />
                </div>
                <h3 className="text-xl font-bold mb-4">Expert Technicians</h3>
                <p className="text-gray-600">
                  All our technicians are certified professionals with years of experience repairing a wide range of devices.
                </p>
              </div>
            </div>
            
            <div className="card hover:shadow-custom-lg transition-shadow">
              <div className="p-6">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mb-6">
                  <FaShieldAlt className="h-8 w-8 text-primary-600 benefit-icon" />
                </div>
                <h3 className="text-xl font-bold mb-4">Quality Guaranteed</h3>
                <p className="text-gray-600">
                  We use only high-quality replacement parts and back every repair with our 90-day warranty for your peace of mind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Read reviews from satisfied customers across the Lower Mainland
            </p>
          </div>
          
          <div className="relative testimonial-container">
            <div className="flex flex-col md:flex-row gap-6">
              {testimonials.slice(0, 2).map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-lg shadow-sm p-6 flex-1">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 testimonial-text">"{testimonial.comment}"</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.location} • {testimonial.device}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i === selectedTestimonial ? 'bg-primary-600' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    onClick={() => setSelectedTestimonial(i)}
                    aria-label={`View testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Service Areas */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Areas We Serve</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our technicians provide doorstep service throughout the Lower Mainland
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {[
              { name: 'Vancouver', id: 'vancouver' },
              { name: 'Burnaby', id: 'burnaby' },
              { name: 'Richmond', id: 'richmond' },
              { name: 'Surrey', id: 'surrey' },
              { name: 'Coquitlam', id: 'coquitlam' },
              { name: 'New Westminster', id: 'newWestminster' },
              { name: 'North Vancouver', id: 'northVancouver' },
              { name: 'West Vancouver', id: 'westVancouver' },
              { name: 'Delta', id: 'delta' },
              { name: 'Langley', id: 'langley' }
            ].map((area, index) => (
              <div 
                key={index}
                data-area={area.id}
                className="bg-gray-50 rounded-lg p-3 text-center hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                <FaMapMarkerAlt className="inline-block mr-1" />
                {area.name}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
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
            <Link href="/book-online/">
              <a className="btn-accent text-center inline-block text-lg">
                Book Your Repair Now
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