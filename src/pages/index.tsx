import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { FaCheckCircle, FaMapMarkerAlt, FaStar, FaArrowRight, FaPhone } from 'react-icons/fa';
import PostalCodeChecker from '@/components/PostalCodeChecker';
import { initUIEnhancements } from '@/utils/ui-enhancements';
import { testSupabaseConnection, supabase } from '@/utils/supabaseClient';
import { trackLocationEvent } from '@/utils/analytics';
import StructuredData, { LocalBusinessSchema, OrganizationSchema, ReviewSchema } from '@/components/seo/StructuredData';
import { TechnicianSchema } from '@/components/seo/TechnicianSchema';
import OptimizedImage from '@/components/common/OptimizedImage';
import { HomePagePreloads } from '@/components/common/PreloadHints';
import { getPricingData, getPopularServices, getTestimonials } from '@/lib/data-service';

// Component to render device brand image with proper dimensions
const BrandImage = ({ src, alt }: { src: string, alt: string }) => {
  return (
    <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto">
      <OptimizedImage 
        src={src} 
        alt={alt}
        fill
        className="object-contain"
        sizes="(max-width: 640px) 48px, (max-width: 768px) 64px, 80px"
        loading="lazy"
        quality={90}
      />
    </div>
  );
};

// Device brands
const deviceBrands = [
  { id: 'apple', name: 'Apple', image: '/images/brands/apple.svg' },
  { id: 'samsung', name: 'Samsung', image: '/images/brands/samsung.svg' },
  { id: 'google', name: 'Google', image: '/images/brands/google.svg' },
  { id: 'xiaomi', name: 'Xiaomi', image: '/images/brands/xiaomi.svg' },
  { id: 'oneplus', name: 'OnePlus', image: '/images/brands/oneplus.svg' },
  { id: 'huawei', name: 'Huawei', image: '/images/brands/huawei.svg' },
];



// Testimonials - focusing only on target cities
// Note: These are now fetched via getStaticProps, but we keep static fallbacks
const staticTestimonials = [
  {
    id: 1,
    name: 'Sarah J.',
    location: 'Vancouver',
    rating: 5,
    comment: 'Excellent service! The technician came to my home and fixed my iPhone screen quickly. Very professional and convenient.',
    device: 'iPhone 13 Pro'
  },
  {
    id: 2,
    name: 'Michael C.',
    location: 'Burnaby',
    rating: 5,
    comment: 'Had my MacBook battery replaced at home. Professional service and saved me a trip to the mall. Highly recommend!',
    device: 'MacBook Pro 2019'
  },
  {
    id: 3,
    name: 'Jason T.',
    location: 'Richmond',
    rating: 4,
    comment: 'Great doorstep service for my Samsung. The price was fair and the repair was done perfectly.',
    device: 'Samsung Galaxy S22'
  },
  {
    id: 4,
    name: 'Anna W.',
    location: 'North Vancouver',
    rating: 5,
    comment: 'Amazing convenience! The technician was punctual and fixed my laptop keyboard issue in under an hour.',
    device: 'Dell XPS 13'
  },
];

// Static pricing data as fallback (matches current hardcoded values)
const staticPricingData = {
  mobile: { range: '$79-$189', common: '$129', time: '30-45 min' },
  laptop: { range: '$99-$249', common: '$169', time: '45-90 min' },
  tablet: { range: '$89-$199', common: '$149', time: '30-60 min' }
};

// Static popular services as fallback
const staticPopularServices = [
  { name: 'Screen Repair', price: 'From $89', icon: '📱' },
  { name: 'Battery Replace', price: 'From $79', icon: '🔋' },
  { name: 'Laptop Repair', price: 'From $99', icon: '💻' },
  { name: 'Charging Issues', price: 'From $69', icon: '⚡' }
];

interface HomePageProps {
  pricingData: typeof staticPricingData;
  testimonials: typeof staticTestimonials;
  popularServices: typeof staticPopularServices;
}

export async function getStaticProps() {
  try {
    // Fetch data from our new data service
    const [pricingData, testimonials, popularServices] = await Promise.all([
      getPricingData(),
      getTestimonials(),
      getPopularServices()
    ]);

    return {
      props: {
        pricingData,
        testimonials,
        popularServices
      },
      // Revalidate every hour (ISR)
      revalidate: 3600
    };
  } catch (error) {
    // If anything fails, return static data (zero regression guarantee)
    console.error('Error in getStaticProps, using static fallback:', error);
    return {
      props: {
        pricingData: staticPricingData,
        testimonials: staticTestimonials,
        popularServices: staticPopularServices
      },
      revalidate: 3600
    };
  }
}

export default function Home({
  pricingData = staticPricingData,
  testimonials = staticTestimonials,
  popularServices = staticPopularServices
}: HomePageProps) {
  const [selectedTestimonial, setSelectedTestimonial] = useState(0);
  const [showFAB, setShowFAB] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  // Rotate testimonials automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedTestimonial((prev) => 
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Smart FAB scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show FAB when scrolling up or at top, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setShowFAB(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setShowFAB(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Basic cleanup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.classList.remove('loading-navigation');
      document.body.classList.remove('navigation-stuck');
    }
  }, []);

  // Pricing data is now passed via props (pricingData parameter)
  // No need for local constant - using the prop directly

  return (
    <>
      <Head>
        {/* Critical Resource Preloads */}
        <HomePagePreloads />
        
        {/* Homepage Structured Data */}
        <LocalBusinessSchema />
        <OrganizationSchema />
        <ReviewSchema
          reviews={testimonials.map(testimonial => ({
            author: testimonial.name,
            rating: testimonial.rating,
            reviewBody: testimonial.comment,
            location: testimonial.location,
            datePublished: "2024-01-01" // You can make this dynamic
          }))}
          aggregateRating={{
            ratingValue: 4.8,
            reviewCount: testimonials.length,
            bestRating: 5,
            worstRating: 1
          }}
        />
        
        {/* E-E-A-T Technician Schema for expertise signals */}
        <TechnicianSchema
          includeAggregate={true}
          aggregateData={{
            totalTechnicians: 4,
            averageExperience: 7.25,
            totalCertifications: 11
          }}
        />
      </Head>
      <Layout>
      {/* Smart Mobile Floating Action Button */}
      <div className={`fixed bottom-0 left-0 right-0 md:hidden z-50 transition-transform duration-300 ${
        showFAB ? 'translate-y-0' : 'translate-y-full'
      }`}>
        {/* Safe area spacing for iPhone home indicator */}
        <div className="bg-gradient-to-r from-accent-500 to-accent-600 text-white p-4 shadow-2xl">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            <div className="flex-1">
              <div className="font-bold text-base">📱 Device Broken?</div>
              <div className="text-xs opacity-90">Free quote in 2 minutes</div>
            </div>
            <Link 
              href="/book-online" 
              className="bg-white text-accent-600 px-4 py-3 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors ml-3 flex-shrink-0 min-h-[44px] flex items-center justify-center"
            >
              Fix Now
            </Link>
          </div>
        </div>
        {/* Safe area for iPhone home indicator */}
        <div className="bg-accent-600 h-safe-area-inset-bottom"></div>
      </div>

      {/* Redesigned Hero Section - Mobile-Optimized */}
      <section className="py-6 md:py-12 bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="container-custom px-4 sm:px-6">
          {/* Add bottom padding for mobile FAB */}
          <div className="pb-12 md:pb-0">
            {/* Urgency Banner */}
            <div className="bg-accent-500 text-white text-center py-3 px-4 rounded-lg mb-6 text-sm md:text-base">
              🚨 <strong>Limited Time:</strong> Same-day repair slots available today in your area!
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                {/* Mobile-Optimized Headline */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Get Your Device Fixed Today
                  <span className="block text-accent-600">At Your Doorstep</span>
                </h1>
                
                <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
                  Professional repair technicians come to you. Most fixes completed in 30-90 minutes with 90-day warranty.
                </p>

                {/* Mobile-Optimized Pricing Preview */}
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900">Quick Pricing Preview</h3>
                    <span className="text-green-600 font-bold text-xs sm:text-sm">✓ No Hidden Fees</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl mb-1">📱</div>
                      <div className="font-bold text-xs sm:text-sm text-accent-600">Mobile</div>
                      <div className="text-sm sm:text-base font-semibold text-gray-800">{pricingData.mobile.range}</div>
                      <div className="text-xs text-gray-500">{pricingData.mobile.time}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl mb-1">💻</div>
                      <div className="font-bold text-xs sm:text-sm text-accent-600">Laptop</div>
                      <div className="text-sm sm:text-base font-semibold text-gray-800">{pricingData.laptop.range}</div>
                      <div className="text-xs text-gray-500">{pricingData.laptop.time}</div>
                    </div>
                  </div>
                </div>

                {/* Service Area Checker - Moved Above the Fold */}
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-teal-200">
                  <div className="flex items-center justify-center mb-4">
                    <FaMapMarkerAlt className="text-teal-600 mr-2" />
                    <h3 className="text-base sm:text-lg font-bold text-center text-gray-900">
                      ⚡ Check Same-Day Availability
                    </h3>
                  </div>
                  <PostalCodeChecker 
                    variant="compact"
                    onSuccess={(result, postalCode) => {
                      // Auto-scroll to CTAs after successful validation
                      setTimeout(() => {
                        const ctaSection = document.querySelector('.hero-cta-section');
                        if (ctaSection) {
                          ctaSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                      }, 1000);
                    }}
                  />
                </div>

                {/* Mobile-Optimized CTAs */}
                <div className="space-y-4 hero-cta-section">
                  <Link 
                    href="/book-online" 
                    className="group relative w-full bg-gradient-to-r from-accent-500 to-accent-600 text-white text-center py-4 px-6 rounded-xl font-bold text-base sm:text-lg hover:from-accent-600 hover:to-accent-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center min-h-[48px]"
                  >
                    <span className="mr-2">🚀 Get Fixed Today - Free Quote</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <a 
                      href="tel:+17783899251" 
                      className="bg-green-600 hover:bg-green-700 text-white text-center py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center min-h-[48px] active:scale-95"
                    >
                      <FaPhone className="mr-1 sm:mr-2" />
                      <span className="text-sm sm:text-base">Emergency Call</span>
                    </a>
                    <Link 
                      href="/services" 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-center py-3 px-4 rounded-lg font-semibold transition-colors min-h-[48px] flex items-center justify-center active:scale-95"
                    >
                      <span className="text-sm sm:text-base">See All Services</span>
                    </Link>
                  </div>
                </div>

                {/* Mobile-Optimized Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
                  <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <FaCheckCircle className="mr-1 text-sm" />
                    <span className="text-xs sm:text-sm font-medium">90-Day Warranty</span>
                  </div>
                  <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <FaCheckCircle className="mr-1 text-sm" />
                    <span className="text-xs sm:text-sm font-medium">Same-Day Service</span>
                  </div>
                  <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <FaCheckCircle className="mr-1 text-sm" />
                    <span className="text-xs sm:text-sm font-medium">Certified Techs</span>
                  </div>
                </div>
              </div>
            
              {/* Hero Image with Overlay */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl h-80 md:h-96">
                <OptimizedImage 
                  src="/images/services/doorstep-repair-tech-optimized.webp" 
                  alt="Professional technician providing doorstep device repair services at customer's location" 
                  className="object-cover"
                  fill={true}
                  isCritical={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                  <div className="p-6 w-full">
                    <div className="inline-block bg-accent-500 text-white text-sm px-3 py-1 rounded-full mb-3">
                      ✨ Doorstep Service
                    </div>
                    <h3 className="text-white text-xl md:text-2xl font-bold mb-2">
                      Skip the repair shop chaos
                    </h3>
                    <p className="text-white/90 text-sm md:text-base">
                      Professional repair at your location. Watch your device get fixed!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Customer Success Stories - Moved Higher */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Join 500+ Happy Customers</h2>
            <p className="text-lg text-gray-600">Real reviews from your neighbors across the Lower Mainland</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {testimonials.slice(0, 2).map((testimonial) => (
              <div key={testimonial.id} className="bg-gray-50 rounded-xl p-6 shadow-sm border-l-4 border-accent-500">
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-700">{testimonial.location}</span>
                </div>
                <p className="text-gray-700 mb-3 text-sm leading-relaxed">&ldquo;{testimonial.comment}&rdquo;</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-900">{testimonial.name}</span>
                  <span className="text-gray-500">{testimonial.device}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center bg-gradient-to-r from-green-50 to-green-100 px-6 py-3 rounded-full">
              <FaCheckCircle className="text-green-600 mr-2" />
              <span className="text-green-800 font-medium">98% Customer Satisfaction Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Our Repair Process - Simplified */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">How We Fix Your Device</h2>
            <p className="text-lg text-gray-600">Simple 3-step process</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border-t-4 border-accent-500">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-lg font-bold mb-2">1. Book Online</h3>
              <p className="text-gray-600 text-sm">Quick 2-minute booking with instant confirmation</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border-t-4 border-accent-500">
              <div className="text-3xl mb-3">🚗</div>
              <h3 className="text-lg font-bold mb-2">2. We Come to You</h3>
              <p className="text-gray-600 text-sm">Certified tech arrives with tools & parts</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border-t-4 border-accent-500">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="text-lg font-bold mb-2">3. Fixed & Done</h3>
              <p className="text-gray-600 text-sm">Most repairs completed in 30-90 minutes</p>
            </div>
          </div>
          
          {/* Second Strong CTA */}
          <div className="text-center mt-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg max-w-md mx-auto">
              <h3 className="text-lg font-bold mb-2">Ready to Get Fixed?</h3>
              <p className="text-gray-600 text-sm mb-4">Join hundreds of satisfied customers</p>
              <Link 
                href="/book-online" 
                className="w-full bg-gradient-to-r from-accent-500 to-accent-600 text-white py-3 px-6 rounded-xl font-bold hover:from-accent-600 hover:to-accent-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-block"
              >
                Start My Repair - Free Quote ⚡
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular Services - Simplified */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Most Popular Repairs</h2>
            <p className="text-lg text-gray-600">We fix these issues at your doorstep every day</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {popularServices.map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">{service.icon}</div>
                <h3 className="font-bold text-sm mb-1">{service.name}</h3>
                <p className="text-xs text-gray-600">{service.price}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">Not sure what's wrong? Our technicians will diagnose for free!</p>
            <Link 
              href="/book-online" 
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-8 rounded-xl font-bold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-block"
            >
              Book Free Diagnosis 🔍
            </Link>
          </div>
        </div>
      </section>
      
      {/* Trust Metrics - Simplified */}
      <section className="py-12 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Trusted by 500+ Customers</h2>
            <p className="text-lg text-primary-100">Professional repair service across the Lower Mainland</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-bold mb-1 text-accent-400">500+</div>
              <p className="text-primary-100 text-sm">Happy Customers</p>
            </div>
            <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-bold mb-1 text-accent-400">95%</div>
              <p className="text-primary-100 text-sm">Same Day Fix</p>
            </div>
            <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-bold mb-1 text-accent-400">4.8★</div>
              <p className="text-primary-100 text-sm">Average Rating</p>
            </div>
            <div className="text-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-2xl md:text-3xl font-bold mb-1 text-accent-400">90</div>
              <p className="text-primary-100 text-sm">Day Warranty</p>
            </div>
          </div>
        </div>
      </section>
      

      
      {/* Service Areas - Simplified */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">We Come to You</h2>
            <p className="text-lg text-gray-600">Serving the entire Lower Mainland</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { name: 'Vancouver', slug: 'vancouver' },
                { name: 'Burnaby', slug: 'burnaby' },
                { name: 'Richmond', slug: 'richmond' },
                { name: 'Chilliwack', slug: 'chilliwack' },
                { name: 'North Vancouver', slug: 'north-vancouver' },
                { name: 'West Vancouver', slug: 'west-vancouver' },
                { name: 'Coquitlam', slug: 'coquitlam' },
                { name: 'New Westminster', slug: 'new-westminster' }
              ].map((city, index) => (
                <Link 
                  key={index}
                  href={`/repair/${city.slug}`}
                  className="bg-primary-50 rounded-lg p-3 text-center text-sm hover:bg-primary-100 transition-colors block"
                  onClick={() => trackLocationEvent('area_selected', city.name)}
                >
                  <FaMapMarkerAlt className="inline-block mr-1 text-primary-600" />
                  {city.name}
                </Link>
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-3">+ More cities across the Lower Mainland</p>
              <Link href="/service-areas" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                Check if we serve your area →
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Final Strong CTA */}
      <section className="py-16 bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container-custom relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Device Broken? We'll Fix It Today! 
            </h2>
            <p className="text-xl mb-6 text-accent-100">
              Professional repair at your doorstep. Most repairs done in 30-90 minutes with 90-day warranty.
            </p>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">⚡ Same Day</div>
                  <div className="text-sm text-accent-100">Available today</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">🛡️ 90 Days</div>
                  <div className="text-sm text-accent-100">Warranty included</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Link 
                href="/book-online" 
                className="w-full sm:w-auto bg-white text-accent-600 py-4 px-8 rounded-2xl font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105 inline-block"
              >
                🚀 Book Emergency Repair Now
              </Link>
              
              <div className="flex items-center justify-center space-x-4 text-sm">
                <a 
                  href="tel:+17783899251" 
                  className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FaPhone className="mr-2" />
                  Call Now: (778) 389-9251
                </a>
                <span className="text-accent-100">or</span>
                <span className="text-accent-100">2-minute online booking</span>
              </div>
            </div>
            
            <p className="mt-6 text-accent-100 text-sm">
              ✓ Free quotes ✓ No hidden fees ✓ Certified technicians ✓ All brands welcome
            </p>
          </div>
        </div>
      </section>
    </Layout>
    </>
  );
} 