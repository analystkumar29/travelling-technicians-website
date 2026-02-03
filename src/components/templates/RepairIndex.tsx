/**
 * REPAIR INDEX PAGE TEMPLATE
 * 
 * Renders the root repair page at /repair
 * 
 * Features:
 * - City/service/model search interface with database-driven data
 * - Service area map
 * - Popular services showcase
 * - JSON-LD structured data for SEO
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { formatPhoneNumberForDisplay, formatPhoneNumberForHref } from '@/utils/phone-formatter';
import { getSiteUrl } from '@/utils/supabaseClient';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import OptimizedImage from '@/components/common/OptimizedImage';
import { FaTools, FaCheck, FaClock, FaMapMarkerAlt, FaShieldAlt, FaStar, FaArrowRight, FaMobile, FaLaptop } from 'react-icons/fa';

interface RepairIndexProps {
  cities: Array<{ slug: string; city_name: string }>;
  services: Array<{ slug: string; name: string; display_name: string }>;
  models: Array<{ id: string; slug?: string; name: string; display_name?: string; type: string; brand: string; device_type_id?: string }>;
  routeCount?: number;
  testimonialCount?: number;
  testimonials?: Array<{ id: string; customer_name: string; city: string; rating: number; review: string; device_model: string; service: string }>;
  pricing?: Record<string, number>;
}

export default function RepairIndex({ cities = [], services = [], models = [], routeCount = 3289, testimonialCount = 25, testimonials = [], pricing = {} }: RepairIndexProps) {
  const siteUrl = getSiteUrl();
  
  // Calculate dynamic statistics
  const cityCount = cities.length || 13;
  const modelCount = models.length || 50;
  const totalTestimonials = testimonialCount || 25;

  // Transform database cities to match component format
  const transformedCities = cities.map(city => ({
    id: city.slug,
    slug: city.slug,
    name: city.city_name
  }));

  // Transform database services to match component format
  const transformedServices = services.map(service => ({
    id: service.slug,
    slug: service.slug,
    name: service.display_name || service.name,
    type: service.slug.includes('mobile') ? 'mobile' : 'laptop'
  }));

  // Fallback data if database is empty
  const fallbackCities = [
    { id: 'vancouver', name: 'Vancouver' },
    { id: 'burnaby', name: 'Burnaby' },
    { id: 'richmond', name: 'Richmond' },
    { id: 'surrey', name: 'Surrey' },
    { id: 'coquitlam', name: 'Coquitlam' },
    { id: 'north-vancouver', name: 'North Vancouver' },
    { id: 'west-vancouver', name: 'West Vancouver' },
    { id: 'new-westminster', name: 'New Westminster' },
    { id: 'delta', name: 'Delta' },
    { id: 'langley', name: 'Langley' },
    { id: 'abbotsford', name: 'Abbotsford' },
    { id: 'chilliwack', name: 'Chilliwack' },
    { id: 'squamish', name: 'Squamish' },
  ];

  const fallbackServices = [
    { id: 'screen-replacement-mobile', name: 'Screen Replacement', type: 'mobile' },
    { id: 'battery-replacement-mobile', name: 'Battery Replacement', type: 'mobile' },
    { id: 'screen-replacement-laptop', name: 'Laptop Screen Replacement', type: 'laptop' },
    { id: 'battery-replacement-laptop', name: 'Laptop Battery Replacement', type: 'laptop' },
  ];

  // Use database data if available, otherwise fallback
  const displayCities = transformedCities.length > 0 ? transformedCities : fallbackCities;
  const displayServices = transformedServices.length > 0 ? transformedServices : fallbackServices;

  // Benefits of doorstep repair (from doorstep-repair page)
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

  // FAQ questions (from doorstep-repair page)
  const faqQuestions = [
    {
      id: 1,
      question: 'How does doorstep repair work?',
      answer: 'After booking online, our certified technician arrives at your location with all the necessary tools and parts. They diagnose the issue, provide a final quote, and complete the repair right there while you watch.'
    },
    {
      id: 2,
      question: 'Is there an extra fee for doorstep service?',
      answer: 'No, our prices include the convenience of doorstep service with no additional travel or convenience fees for locations within our standard service area in the Lower Mainland.'
    },
    {
      id: 3,
      question: 'What if my device can\'t be repaired on-site?',
      answer: 'In rare cases where a repair can\'t be completed on-site, our technician will explain why and provide options including arranging repair at our service center with convenient pickup and delivery.'
    },
    {
      id: 4,
      question: 'Do I need to prepare anything before the technician arrives?',
      answer: 'We recommend backing up your data if possible and ensuring there\'s a clean, well-lit space for the technician to work. You\'ll also need ID to verify device ownership.'
    },
    {
      id: 5,
      question: 'How quickly can you come to my location?',
      answer: 'Depending on technician availability, we often offer same-day service for popular areas like Vancouver, Burnaby, and Richmond. Most locations can be serviced within 24-48 hours of booking.'
    },
    {
      id: 6,
      question: 'Are the parts and repairs the same quality as in-shop repairs?',
      answer: 'Absolutely. We use the same high-quality parts for doorstep repairs as we do for our in-shop services. All repairs come with our standard 90-day warranty regardless of where they\'re performed.'
    }
  ];

  return (
    <>
      <Header />
      <Head>
        <title>Doorstep Mobile & Laptop Repair Services | The Travelling Technicians</title>
        <meta name="description" content="Find doorstep repair services for your mobile phone or laptop across the Lower Mainland. Professional technicians come to you with up to 6 months warranty. Screen replacement, battery replacement, and more." />
        <meta name="keywords" content="doorstep repair, mobile repair, laptop repair, screen replacement, battery replacement, same-day service, Vancouver repair, Burnaby repair, Surrey repair" />
        <link rel="canonical" href={`${siteUrl}/repair`} />
        
        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "The Travelling Technicians",
              "url": siteUrl,
              "description": "Professional doorstep mobile and laptop repair services across the Lower Mainland, BC",
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${siteUrl}/repair?city={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        
        {/* Service Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "serviceType": "Device Repair",
              "provider": {
                "@type": "LocalBusiness",
                "name": "The Travelling Technicians",
                "address": {
                  "@type": "PostalAddress",
                  "addressRegion": "BC",
                  "addressCountry": "CA"
                },
                "areaServed": {
                  "@type": "GeoCircle",
                  "geoMidpoint": {
                    "@type": "GeoCoordinates",
                    "latitude": 49.2827,
                    "longitude": -123.1207
                  },
                  "geoRadius": "50000"
                }
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Repair Services",
                "itemListElement": services.slice(0, 6).map(service => ({
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": service.display_name || service.name,
                    "description": `Professional ${service.display_name || service.name} for mobile phones and laptops`
                  }
                }))
              }
            })
          }}
        />
        
        {/* Breadcrumb Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": siteUrl
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Repair Services",
                  "item": `${siteUrl}/repair`
                }
              ]
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section - Updated with doorstep-repair styling */}
        <section className="pt-16 pb-12 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Doorstep Device Repair Service
                </h1>
                <p className="text-xl mb-8 text-primary-100">
                  Why travel to a repair shop when our certified technicians can come to you? Get your mobile phone or laptop repaired at your home, office, or anywhere in the Lower Mainland.
                </p>
                
                {/* Dynamic Statistics */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{cityCount}+</div>
                    <div className="text-primary-200 text-sm">Locations Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{modelCount}+</div>
                    <div className="text-primary-200 text-sm">Device Models</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/book-online" className="btn-accent text-center">
                    Book Your Doorstep Repair
                  </Link>
                  <Link href="/pricing" className="btn-outline border-white text-white hover:bg-primary-600 text-center">
                    View Pricing
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="relative h-[350px] w-full rounded-lg overflow-hidden shadow-custom-lg">
                  <OptimizedImage
                    src="/images/services/doorstep-repair-tech.jpg"
                    alt="Technician providing professional device repair services at customer location"
                    fill
                    className="object-cover"
                    isCritical={true}
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

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          {/* Benefits Section - Added from doorstep-repair */}
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

          {/* How It Works - Moved to top */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
              How Our Doorstep Repair Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Book Online</h3>
                <p className="text-gray-600">
                  Select your city, service, and device model. Choose a convenient time slot.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Technician Arrives</h3>
                <p className="text-gray-600">
                  Our certified technician comes to your location with all necessary tools and parts.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Repair Complete</h3>
                <p className="text-gray-600">
                  Professional repair completed on-site. Up to 6 months warranty included.
                </p>
              </div>
            </div>
          </div>

          {/* Service Areas */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Service Areas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {displayCities.map(city => (
                <Link
                  key={city.id}
                  href={`/repair/${city.id}`}
                  className="bg-white rounded-lg shadow p-4 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="text-blue-600 font-semibold">{city.name}</div>
                  <div className="text-sm text-gray-500 mt-1">248 repair pages</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Available Services - Enhanced UI */}
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
                      <Link href="/services/mobile-repair" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
                        View All Mobile Services
                        <FaArrowRight className="ml-2 h-4 w-4" />
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
                      <Link href="/services/laptop-repair" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
                        View All Laptop Services
                        <FaArrowRight className="ml-2 h-4 w-4" />
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

          {/* Popular Services with Pricing */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Popular Services with Pricing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayServices.slice(0, 4).map(service => {
                // Get dynamic pricing for this service
                const minPrice = pricing[service.id] ? Math.round(Number(pricing[service.id])) : 129;
                
                return (
                  <div
                    key={service.id}
                    className="card hover:shadow-custom-lg transition-shadow"
                  >
                    <div className="p-6">
                      <div className="text-primary-600 text-2xl mb-4">
                        {service.type === 'mobile' ? '📱' : '💻'}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {service.name}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Professional doorstep {service.name.toLowerCase()} for all major brands.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 font-bold text-lg">From ${minPrice}</span>
                        <Link
                          href={`/repair/vancouver/${service.id}`}
                          className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                        >
                          View details
                          <FaArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Testimonials Section */}
          {testimonials.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                What Our Customers Say
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    {/* Star Rating */}
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    
                    {/* Review Text */}
                    <p className="text-gray-700 mb-4 italic">"{testimonial.review}"</p>
                    
                    {/* Customer Details */}
                    <div className="border-t pt-4">
                      <div className="font-semibold text-gray-900">{testimonial.customer_name}</div>
                      <div className="text-sm text-gray-500">{testimonial.city}</div>
                      {testimonial.device_model && (
                        <div className="text-sm text-gray-500 mt-1">
                          {testimonial.device_model} • {testimonial.service}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* FAQ Section - Added at bottom */}
          <section className="py-16 bg-gray-50">
            <div className="container-custom">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Common Questions About Doorstep Repair</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Everything you need to know about our mobile repair service
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {faqQuestions.map((faq) => (
                  <div key={faq.id} className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-xl font-bold mb-2">{faq.question}</h3>
                    <p className="text-gray-600">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <Link href="/faq" className="text-primary-600 hover:text-primary-700 font-medium">
                  View All FAQs
                </Link>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Repair Your Device?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have used our convenient doorstep repair service.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/book-online"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
              >
                Book Repair Now
              </Link>
              <a
                href={formatPhoneNumberForHref('+16048495329')}
                className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg transition duration-300"
              >
                Call {formatPhoneNumberForDisplay('+16048495329')}
              </a>
            </div>
          </div>
        </main>

        {/* Disclaimer */}
        <div className="bg-gray-100 border-t border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <p className="text-center text-sm text-gray-600">
              The Travelling Technicians is an independent service provider. We are not affiliated with,
              authorized by, or endorsed by Apple Inc., Samsung Electronics Co., Ltd., or Google LLC.
              All trademarks are the property of their respective owners. We provide out-of-warranty
              hardware repairs only.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
