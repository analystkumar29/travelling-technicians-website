import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { formatPhoneNumberForDisplay, formatPhoneNumberForHref, DEFAULT_PHONE_NUMBER } from '@/utils/phone-formatter';
import { getSiteUrl } from '@/utils/supabaseClient';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface CityPageProps {
  routeData: any;
}

export default function CityPage({ routeData }: CityPageProps) {
  const siteUrl = getSiteUrl();
  const { city, popular_models, sample_services, local_phone, local_email, testimonials, neighborhoods, postal_codes } = routeData.payload;
  const cityName = city.name;
  
  // State for "Show More" functionality
  const [showAllModels, setShowAllModels] = useState(false);
  
  // Format phone number
  const cityPhoneRaw = local_phone || DEFAULT_PHONE_NUMBER;
  const cityPhoneDisplay = formatPhoneNumberForDisplay(cityPhoneRaw);
  const cityPhoneHref = formatPhoneNumberForHref(cityPhoneRaw);
  
  // Show first 12 devices or all based on state
  const displayedModels = showAllModels ? popular_models : popular_models?.slice(0, 12) || [];
  
  return (
    <>
      <Head>
        <title>Repair Services in {cityName} | The Travelling Technicians</title>
        <meta name="description" content={`Professional doorstep repair services in ${cityName}. Screen replacement, battery replacement, and more for all major device brands.`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${siteUrl}/repair/${city.slug}`} />
        
        {/* JSON-LD for LocalBusiness */}
        {routeData.payload.jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(routeData.payload.jsonLd)
            }}
          />
        )}
        
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
                  "name": "Repair Services",
                  "item": `${siteUrl}/repair`
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": cityName,
                  "item": `${siteUrl}/repair/${city.slug}`
                }
              ]
            })
          }}
        />
      </Head>
      
      <Header />
      
      {/* Hero Section */}
      <section className="pt-8 pb-12 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-primary-200">{cityName}, BC</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Device Repair Services<br />
              <span className="text-2xl md:text-3xl">in {cityName}</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Doorstep repair service for all major device brands
            </p>
            
            <div className="inline-block bg-accent-500 text-white text-lg px-6 py-3 rounded-full mb-8">
              <span className="font-bold">From $89</span>
              <span className="ml-2 text-primary-100">with 90-day warranty</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link 
                href={`/book-online?city=${city.slug}`} 
                className="btn-accent text-lg px-8 py-4"
              >
                Book Repair in {cityName}
              </Link>
              <a 
                href={cityPhoneHref}
                className="btn-outline border-white text-white hover:bg-primary-600 text-lg px-8 py-4 flex items-center justify-center"
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {cityPhoneDisplay}
              </a>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                30-90 min service
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                90-Day Warranty
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                Certified Technicians
              </div>
            </div>
            
            {/* Postal Codes Trust Signal */}
            {postal_codes && postal_codes.length > 0 && (
              <div className="mt-6 text-sm text-primary-200 flex items-center justify-center flex-wrap gap-1">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>Serving postal codes: {postal_codes.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Repair Services in {cityName}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional doorstep repair for all your devices. We come to you in {cityName} with all necessary tools and genuine parts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sample_services?.map((service: any) => (
              <Link 
                key={service.id}
                href={`/repair/${city.slug}/${service.slug}`} 
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 group"
              >
                <div className="text-accent-600 text-2xl mb-4">
                  {service.icon || '🛠️'}
                </div>
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors">
                  {service.display_name}
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  {service.description || `Professional ${service.display_name.toLowerCase()} for all major brands`}
                </p>
                <div className="mt-4 text-primary-500 font-bold">
                  From $89
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Models Section with Show More */}
      {popular_models && popular_models.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Popular Devices We Repair</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We specialize in repairing the most popular devices in {cityName}. Click to see all available services.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {displayedModels.map((model: any) => (
                <Link
                  key={model.id}
                  href={`/repair/${city.slug}/${model.slug || model.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-all border border-gray-100 group cursor-pointer"
                >
                  <div className="text-gray-800 font-medium text-sm group-hover:text-primary-600 transition-colors">
                    {model.name}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    {model.brand}
                  </div>
                  <div className="text-xs text-primary-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Services →
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Show More / Show Less Button */}
            {popular_models.length > 12 && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setShowAllModels(!showAllModels)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
                >
                  {showAllModels ? (
                    <>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      Show Less
                    </>
                  ) : (
                    <>
                      Show All {popular_models.length} Devices
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Local Testimonials Section */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What Our {cityName} Customers Say</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real reviews from satisfied customers in {cityName}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {testimonials.slice(0, 3).map((testimonial: any, index: number) => (
                <div 
                  key={testimonial.id || index} 
                  className="bg-gray-50 p-6 rounded-xl"
                >
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
                  <p className="text-gray-700 mb-4 italic line-clamp-4">"{testimonial.review}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-gray-900">{testimonial.customer_name}</div>
                    {testimonial.city && (
                      <div className="text-sm text-gray-500">{testimonial.city}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Neighborhoods We Serve Section */}
      {neighborhoods && neighborhoods.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{cityName} Neighborhoods We Serve</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We provide doorstep repair services throughout {cityName}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {neighborhoods.map((neighborhood: string, index: number) => (
                <div 
                  key={index}
                  className="bg-white px-4 py-2 rounded-full text-gray-700 shadow-sm hover:shadow-md hover:bg-primary-50 hover:text-primary-700 transition-all"
                >
                  <span className="flex items-center text-sm">
                    <svg className="h-4 w-4 mr-2 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {neighborhood}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-primary-50">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Repair Your Device in {cityName}?
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Book your doorstep repair service today and get back to using your device.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/book-online?city=${city.slug}`}
              className="btn-accent text-lg px-8 py-4"
            >
              Book Repair Now
            </Link>
            <a
              href={cityPhoneHref}
              className="btn-outline border-primary-600 text-primary-600 hover:bg-primary-50 text-lg px-8 py-4"
            >
              Call {cityPhoneDisplay}
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
}
