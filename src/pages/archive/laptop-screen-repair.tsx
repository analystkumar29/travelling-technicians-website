import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { FaLaptop, FaShieldAlt, FaClock, FaTools, FaStar, FaMapMarkerAlt, FaPhone, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';

export default function LaptopScreenRepairPage() {
  return (
    <>
      <Head>
        <title>Laptop Screen Repair Vancouver | MacBook Screen Replacement | The Travelling Technicians</title>
        <meta name="description" content="Professional laptop screen repair in Vancouver, Burnaby, Richmond. Same-day MacBook, Dell, HP, Lenovo screen replacement. Doorstep service with 90-day warranty." />
        <meta name="keywords" content="laptop screen repair, MacBook screen repair, laptop screen replacement, broken laptop screen, cracked laptop screen, laptop screen fix" />
        <link rel="canonical" href="https://www.travelling-technicians.ca/laptop-screen-repair" />
        <meta property="og:title" content="Laptop Screen Repair Vancouver | MacBook Screen Replacement" />
        <meta property="og:description" content="Professional laptop screen repair with same-day doorstep service. MacBook, Dell, HP, and all major brands. 90-day warranty." />
        <meta property="og:url" content="https://www.travelling-technicians.ca/laptop-screen-repair" />
        <meta property="og:type" content="service" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Laptop Screen Repair Vancouver",
            "description": "Professional laptop screen repair and replacement service including MacBook, Dell, HP, Lenovo, and all major laptop brands with same-day doorstep service.",
            "provider": {
              "@type": "LocalBusiness",
              "name": "The Travelling Technicians",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Vancouver",
                "addressRegion": "BC",
                "addressCountry": "CA"
              },
              "telephone": "+1-778-389-9251"
            },
            "areaServed": ["Vancouver, BC", "Burnaby, BC", "Richmond, BC", "North Vancouver, BC"],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Laptop Screen Repair Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "MacBook Screen Repair",
                    "description": "Professional MacBook screen replacement for all models"
                  },
                  "priceSpecification": {
                    "@type": "PriceSpecification",
                    "priceCurrency": "CAD",
                    "price": "299-449"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Dell Laptop Screen Repair",
                    "description": "Dell laptop screen replacement service"
                  },
                  "priceSpecification": {
                    "@type": "PriceSpecification",
                    "priceCurrency": "CAD",
                    "price": "199-349"
                  }
                }
              ]
            }
          })
        }} />
      </Head>
      
      <Layout>
        {/* Hero Section */}
        <section className="pt-16 pb-12 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Laptop Screen Repair Vancouver
                </h1>
                <p className="text-xl mb-6 text-primary-100">
                  Professional laptop screen repair and replacement service. We repair MacBook, Dell, HP, Lenovo, and all major laptop brands at your doorstep.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center">
                    <FaCheckCircle className="text-green-400 mr-2" />
                    <span>Same-Day Service</span>
                  </div>
                  <div className="flex items-center">
                    <FaShieldAlt className="text-green-400 mr-2" />
                    <span>90-Day Warranty</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="text-green-400 mr-2" />
                    <span>45-90 Minutes</span>
                  </div>
                  <div className="flex items-center">
                    <FaStar className="text-green-400 mr-2" />
                    <span>All Brands</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/book-online?service=laptop-screen-repair" className="btn-accent text-center">
                    Book Screen Repair
                  </Link>
                  <a href="tel:+17783899251" className="btn-outline border-white text-white hover:bg-primary-600 text-center">
                    <FaPhone className="inline mr-2" />
                    Get Quote Now
                  </a>
                </div>
              </div>
              <div className="relative">
                <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-custom-lg">
                  <Image
                    src="/images/services/laptop-hero.svg"
                    alt="Professional laptop screen repair service"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Laptop Brands We Repair */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Laptop Screen Repair for All Major Brands</h2>
              <p className="text-xl text-gray-600">Professional repair service for all laptop manufacturers</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { brand: 'MacBook', models: 'Air, Pro, all models', price: '$299-$449', icon: '🍎' },
                { brand: 'Dell', models: 'Inspiron, XPS, Latitude', price: '$199-$349', icon: '💻' },
                { brand: 'HP', models: 'Pavilion, Envy, EliteBook', price: '$179-$329', icon: '⚡' },
                { brand: 'Lenovo', models: 'ThinkPad, IdeaPad, Yoga', price: '$189-$339', icon: '🔧' }
              ].map((laptop) => (
                <div key={laptop.brand} className="bg-gray-50 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{laptop.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{laptop.brand}</h3>
                  <p className="text-gray-600 mb-3">{laptop.models}</p>
                  <div className="text-2xl font-bold text-primary-600 mb-4">{laptop.price}</div>
                  <Link href={`/book-online?device=${laptop.brand}&service=screen-repair`} className="btn-primary w-full">
                    Book {laptop.brand} Repair
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Common Screen Issues */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Common Laptop Screen Problems We Fix</h2>
              <p className="text-xl text-gray-600">Expert diagnosis and repair for all screen issues</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Cracked Screen',
                  description: 'Physical damage from drops or impacts causing visible cracks',
                  symptoms: ['Visible crack lines', 'Sharp edges', 'Glass fragments']
                },
                {
                  title: 'Black Screen',
                  description: 'Display not showing any image despite laptop being powered on',
                  symptoms: ['No display output', 'Backlight issues', 'LCD failure']
                },
                {
                  title: 'Lines on Screen',
                  description: 'Vertical or horizontal lines across the display',
                  symptoms: ['Colored lines', 'Dead pixels', 'Display artifacts']
                },
                {
                  title: 'Dim Display',
                  description: 'Screen is too dark or backlight not working properly',
                  symptoms: ['Very dim image', 'Backlight failure', 'Inverter issues']
                },
                {
                  title: 'Flickering Screen',
                  description: 'Display intermittently flickers or goes on/off',
                  symptoms: ['Screen flashing', 'Intermittent display', 'Connection issues']
                },
                {
                  title: 'Color Issues',
                  description: 'Incorrect colors, pink/blue tint, or washed out display',
                  symptoms: ['Wrong colors', 'Tinted display', 'Faded screen']
                }
              ].map((issue, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-3 text-primary-600">{issue.title}</h3>
                  <p className="text-gray-600 mb-4">{issue.description}</p>
                  <div className="text-sm">
                    <div className="font-semibold mb-2">Common Symptoms:</div>
                    <ul className="text-gray-500 space-y-1">
                      {issue.symptoms.map((symptom, i) => (
                        <li key={i}>• {symptom}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Repair Process */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Laptop Screen Repair Process</h2>
              <p className="text-xl text-gray-600">Professional service from diagnosis to completion</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-primary-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Diagnosis</h3>
                <p className="text-gray-600">Complete assessment of screen damage and underlying issues</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">Quote</h3>
                <p className="text-gray-600">Transparent pricing with no hidden fees or surprise charges</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Repair</h3>
                <p className="text-gray-600">Professional screen replacement using quality LCD panels</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  4
                </div>
                <h3 className="text-xl font-bold mb-3">Testing</h3>
                <p className="text-gray-600">Thorough testing and quality assurance before handover</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Laptop Screen Repair?</h2>
              <p className="text-xl text-gray-600">The most trusted laptop repair service in Vancouver</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <FaTools className="text-primary-600 mt-1 mr-4 flex-shrink-0 text-xl" />
                    <div>
                      <h3 className="text-lg font-bold mb-2">Professional Equipment</h3>
                      <p className="text-gray-600">We use professional-grade tools and clean room environment for screen replacements.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaLaptop className="text-primary-600 mt-1 mr-4 flex-shrink-0 text-xl" />
                    <div>
                      <h3 className="text-lg font-bold mb-2">Quality LCD Panels</h3>
                      <p className="text-gray-600">Only high-quality LCD screens that match or exceed original manufacturer specifications.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaShieldAlt className="text-primary-600 mt-1 mr-4 flex-shrink-0 text-xl" />
                    <div>
                      <h3 className="text-lg font-bold mb-2">90-Day Warranty</h3>
                      <p className="text-gray-600">Comprehensive warranty covering both parts and labor for complete peace of mind.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaClock className="text-primary-600 mt-1 mr-4 flex-shrink-0 text-xl" />
                    <div>
                      <h3 className="text-lg font-bold mb-2">Same-Day Service</h3>
                      <p className="text-gray-600">Most laptop screen repairs completed on the same day at your convenient location.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="relative h-[350px] w-full rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src="/images/services/laptop-repair-process.jpg"
                    alt="Professional laptop screen repair process"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Laptop Screen Repair Pricing</h2>
              <p className="text-xl text-gray-600">Transparent pricing based on laptop model and screen size</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-xl p-6 text-center shadow-md">
                <h3 className="text-xl font-bold mb-3">Standard Laptops</h3>
                <div className="text-sm text-gray-500 mb-2">13"-15" screens</div>
                <div className="text-3xl font-bold text-primary-600 mb-4">$179-$279</div>
                <ul className="text-gray-600 space-y-2 mb-6 text-left">
                  <li>• HP, Dell, Acer, ASUS</li>
                  <li>• HD and Full HD displays</li>
                  <li>• Same-day service</li>
                  <li>• 90-day warranty</li>
                </ul>
                <Link href="/book-online?device=Laptop&service=screen-repair" className="btn-primary w-full">
                  Book Standard Repair
                </Link>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 text-center shadow-md border-2 border-accent-500">
                <div className="bg-accent-500 text-white text-sm px-3 py-1 rounded-full mb-3 inline-block">
                  Most Popular
                </div>
                <h3 className="text-xl font-bold mb-3">Premium Laptops</h3>
                <div className="text-sm text-gray-500 mb-2">High-end models</div>
                <div className="text-3xl font-bold text-primary-600 mb-4">$249-$349</div>
                <ul className="text-gray-600 space-y-2 mb-6 text-left">
                  <li>• ThinkPad, Surface, XPS</li>
                  <li>• 4K and touchscreen</li>
                  <li>• Same-day service</li>
                  <li>• 90-day warranty</li>
                </ul>
                <Link href="/book-online?device=Premium-Laptop&service=screen-repair" className="btn-accent w-full">
                  Book Premium Repair
                </Link>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 text-center shadow-md">
                <h3 className="text-xl font-bold mb-3">MacBook Repair</h3>
                <div className="text-sm text-gray-500 mb-2">All MacBook models</div>
                <div className="text-3xl font-bold text-primary-600 mb-4">$299-$449</div>
                <ul className="text-gray-600 space-y-2 mb-6 text-left">
                  <li>• MacBook Air & Pro</li>
                  <li>• Retina displays</li>
                  <li>• Genuine Apple parts</li>
                  <li>• 90-day warranty</li>
                </ul>
                <Link href="/book-online?device=MacBook&service=screen-repair" className="btn-primary w-full">
                  Book MacBook Repair
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Laptop Screen Repair FAQ</h2>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-6">
              {[
                {
                  q: "How long does laptop screen repair take?",
                  a: "Most laptop screen repairs take 45-90 minutes depending on the model. We come to your location so you don't have to wait at a repair shop."
                },
                {
                  q: "Do you repair MacBook screens?",
                  a: "Yes, we specialize in MacBook screen repairs for all models including MacBook Air and MacBook Pro with Retina displays."
                },
                {
                  q: "What if my laptop has other damage?",
                  a: "We provide comprehensive diagnosis and can repair multiple issues during the same visit, including keyboard, battery, and other components."
                },
                {
                  q: "Do you use original manufacturer screens?",
                  a: "We use high-quality LCD screens that meet or exceed original manufacturer specifications, ensuring perfect compatibility and performance."
                },
                {
                  q: "Is laptop screen repair worth it?",
                  a: "Yes, professional screen repair typically costs 30-50% less than buying a new laptop and extends your device's life significantly."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-3">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-accent-500 to-accent-600 text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Your Laptop Screen Fixed Today
            </h2>
            <p className="text-xl mb-8 text-accent-100">
              Same-day doorstep service across Vancouver and Lower Mainland
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-online?service=laptop-screen-repair" className="btn-white text-accent-600 hover:bg-gray-100">
                <FaCalendarAlt className="inline mr-2" />
                Book Screen Repair
              </Link>
              <a href="tel:+17783899251" className="btn-outline border-white text-white hover:bg-accent-700">
                <FaPhone className="inline mr-2" />
                Call (778) 389-9251
              </a>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
} 