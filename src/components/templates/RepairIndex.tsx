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

interface RepairIndexProps {
  cities: Array<{ slug: string; city_name: string }>;
  services: Array<{ slug: string; name: string; display_name: string }>;
  models: Array<{ id: string; name: string; type: string; brand: string; device_type_id?: string }>;
  routeCount?: number;
  testimonialCount?: number;
}

export default function RepairIndex({ cities = [], services = [], models = [], routeCount = 3289, testimonialCount = 25 }: RepairIndexProps) {
  const router = useRouter();
  const siteUrl = getSiteUrl();
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  
  // Calculate real statistics
  const cityCount = cities.length || 13;
  const serviceCount = services.length || 4;
  const repairPageCount = routeCount || 3289;
  const totalTestimonials = testimonialCount || 25;

  // Fallback models if not passed from props
  const fallbackModels = [
    { id: 'iphone-14', name: 'iPhone 14', type: 'mobile', brand: 'apple' },
    { id: 'iphone-15', name: 'iPhone 15', type: 'mobile', brand: 'apple' },
    { id: 'samsung-galaxy-s23', name: 'Samsung Galaxy S23', type: 'mobile', brand: 'samsung' },
    { id: 'macbook-pro-2023', name: 'MacBook Pro 2023', type: 'laptop', brand: 'apple' },
  ];

  // Use database models if provided, otherwise use fallback
  const displayModels = models.length > 0 ? models : fallbackModels;

  // Transform database cities to match component format
  const transformedCities = cities.map(city => ({
    id: city.slug,
    name: city.city_name
  }));

  // Transform database services to match component format
  const transformedServices = services.map(service => ({
    id: service.slug,
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

  // Get the selected model's type to validate against service type
  const getSelectedModelType = () => {
    const model = displayModels.find(m => m.id === selectedModel);
    return model?.type;
  };

  // Get the selected service type
  const getSelectedServiceType = () => {
    const service = displayServices.find(s => s.id === selectedService);
    return service?.type;
  };

  // Filter models based on selected service type for better UX
  const getAvailableModels = () => {
    if (!selectedService) return displayModels;
    const serviceType = getSelectedServiceType();
    return displayModels.filter(m => m.type === serviceType);
  };

  // Validate that selected model matches selected service type
  const isModelServiceCompatible = () => {
    if (!selectedModel || !selectedService) return true; // Allow if either not selected
    const modelType = getSelectedModelType();
    const serviceType = getSelectedServiceType();
    return modelType === serviceType;
  };

  // When service changes, reset model selection if it becomes incompatible
  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId);
    // Reset model selection to prevent incompatible pairings
    setSelectedModel('');
  };

  const handleSearch = () => {
    // Validate model-service compatibility
    if (selectedModel && selectedService && !isModelServiceCompatible()) {
      alert('Please select a device model that matches your selected service type.');
      return;
    }

    if (selectedCity && selectedService && selectedModel) {
      router.push(`/repair/${selectedCity}/${selectedService}/${selectedModel}`);
    } else if (selectedCity && selectedService) {
      router.push(`/repair/${selectedCity}/${selectedService}`);
    } else if (selectedCity) {
      router.push(`/repair/${selectedCity}`);
    }
  };

  return (
    <>
      <Head>
        <title>Doorstep Mobile & Laptop Repair Services | The Travelling Technicians</title>
        <meta name="description" content={`Find doorstep repair services for your mobile phone or laptop in ${cityCount} cities across the Lower Mainland. Professional technicians come to you with 90-day warranty. Screen replacement, battery replacement, and more.`} />
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
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Doorstep Repair Services in Your City
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Professional mobile & laptop repair technicians come to you.
                Same-day service with 1-year warranty.
              </p>
              
              {/* Search Form */}
              <div className="bg-white rounded-xl shadow-2xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Your City
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose a city...</option>
                      {displayCities.map(city => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Service
                    </label>
                    <select
                      value={selectedService}
                      onChange={(e) => handleServiceChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose a service...</option>
                      {displayServices.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Device Model
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose a model...</option>
                      {getAvailableModels().map(model => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={handleSearch}
                  disabled={!selectedCity}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Find Repair Service
                </button>
              </div>
              
                <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{cityCount}</div>
                    <div className="opacity-80">Cities Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{repairPageCount.toLocaleString()}</div>
                    <div className="opacity-80">Repair Pages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{totalTestimonials}+</div>
                    <div className="opacity-80">Testimonials</div>
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
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

          {/* Popular Services */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Popular Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayServices.map(service => (
                <div
                  key={service.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="text-blue-600 text-2xl mb-4">
                    {service.type === 'mobile' ? '📱' : '💻'}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Professional doorstep {service.name.toLowerCase()} for all major brands.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 font-bold">From $129</span>
                    <Link
                      href={`/repair/vancouver/${service.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
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
                  Professional repair completed on-site. 1-year warranty included.
                </p>
              </div>
            </div>
          </div>

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
    </>
  );
}