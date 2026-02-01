import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { FaCheckCircle, FaShieldAlt, FaClock, FaMobile, FaStar, FaMapMarkerAlt, FaPhone, FaCalendarAlt } from 'react-icons/fa';

export default function MobileScreenRepairPage() {
  return (
    <>
      <Head>
        <title>Mobile Screen Repair Vancouver | Same-Day Service | The Travelling Technicians</title>
        <meta name="description" content="Professional mobile screen repair in Vancouver, Burnaby, Richmond. Same-day doorstep service for iPhone, Samsung, and all smartphones. 90-day warranty. Book online!" />
        <meta name="keywords" content="mobile screen repair, phone screen repair Vancouver, iPhone screen repair, Samsung screen repair, mobile screen replacement, broken phone screen" />
        <link rel="canonical" href="https://www.travelling-technicians.ca/mobile-screen-repair" />
        <meta property="og:title" content="Mobile Screen Repair Vancouver | Same-Day Service" />
        <meta property="og:description" content="Professional mobile screen repair with same-day doorstep service across Vancouver and Lower Mainland. 90-day warranty on all repairs." />
        <meta property="og:url" content="https://www.travelling-technicians.ca/mobile-screen-repair" />
        <meta property="og:type" content="service" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Mobile Screen Repair Vancouver",
            "description": "Professional mobile phone screen repair and replacement service with same-day doorstep service across Vancouver and Lower Mainland.",
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
              "name": "Mobile Screen Repair Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "iPhone Screen Repair",
                    "description": "Professional iPhone screen replacement for all models"
                  },
                  "priceSpecification": {
                    "@type": "PriceSpecification",
                    "priceCurrency": "CAD",
                    "price": "129-189"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Samsung Screen Repair",
                    "description": "Samsung Galaxy screen replacement service"
                  },
                  "priceSpecification": {
                    "@type": "PriceSpecification",
                    "priceCurrency": "CAD",
                    "price": "99-169"
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
                  Mobile Screen Repair Vancouver
                </h1>
                <p className="text-xl mb-6 text-primary-100">
                  Professional mobile screen repair and replacement service. We come to you with same-day service across Vancouver and Lower Mainland.
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
                    <span>30-45 Minutes</span>
                  </div>
                  <div className="flex items-center">
                    <FaStar className="text-green-400 mr-2" />
                    <span>4.8/5 Rating</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/book-online?service=mobile-screen-repair" className="btn-accent text-center">
                    Book Screen Repair Now
                  </Link>
                  <a href="tel:+17783899251" className="btn-outline border-white text-white hover:bg-primary-600 text-center">
                    <FaPhone className="inline mr-2" />
                    Emergency Call
                  </a>
                </div>
              </div>
              <div className="relative">
                <div className="relative h-[400px] w-full rounded-lg overflow-hidden shadow-custom-lg">
                  <Image
                    src="/images/services/mobile-hero.svg"
                    alt="Professional mobile screen repair service"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Mobile Screen Repair Pricing</h2>
              <p className="text-xl text-gray-600">Transparent pricing with no hidden fees</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* iPhone Repairs */}
              <div className="bg-gray-50 rounded-xl p-6 text-center shadow-md">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-bold mb-3">iPhone Screen Repair</h3>
                <div className="text-3xl font-bold text-primary-600 mb-4">$129-$189</div>
                <ul className="text-gray-600 space-y-2 mb-6">
                  <li>• All iPhone models</li>
                  <li>• OEM quality screens</li>
                  <li>• 30-45 minute repair</li>
                  <li>• 90-day warranty</li>
                </ul>
                <Link href="/book-online?device=iPhone&service=screen-repair" className="btn-primary w-full">
                  Book iPhone Repair
                </Link>
              </div>

              {/* Samsung Repairs */}
              <div className="bg-gray-50 rounded-xl p-6 text-center shadow-md border-2 border-accent-500">
                <div className="bg-accent-500 text-white text-sm px-3 py-1 rounded-full mb-3 inline-block">
                  Most Popular
                </div>
                <div className="text-4xl mb-4">📲</div>
                <h3 className="text-xl font-bold mb-3">Samsung Screen Repair</h3>
                <div className="text-3xl font-bold text-primary-600 mb-4">$99-$169</div>
                <ul className="text-gray-600 space-y-2 mb-6">
                  <li>• Galaxy S & Note series</li>
                  <li>• AMOLED displays</li>
                  <li>• 30-45 minute repair</li>
                  <li>• 90-day warranty</li>
                </ul>
                <Link href="/book-online?device=Samsung&service=screen-repair" className="btn-accent w-full">
                  Book Samsung Repair
                </Link>
              </div>

              {/* Other Android */}
              <div className="bg-gray-50 rounded-xl p-6 text-center shadow-md">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold mb-3">Android Screen Repair</h3>
                <div className="text-3xl font-bold text-primary-600 mb-4">$79-$149</div>
                <ul className="text-gray-600 space-y-2 mb-6">
                  <li>• Google, Huawei, OnePlus</li>
                  <li>• Quality replacement screens</li>
                  <li>• 30-45 minute repair</li>
                  <li>• 90-day warranty</li>
                </ul>
                <Link href="/book-online?device=Android&service=screen-repair" className="btn-primary w-full">
                  Book Android Repair
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Mobile Screen Repair Service Areas</h2>
              <p className="text-xl text-gray-600">We provide doorstep mobile screen repair across the Lower Mainland</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                'Vancouver', 'Burnaby', 'Richmond', 'North Vancouver',
                'New Westminster', 'Coquitlam', 'West Vancouver', 'Chilliwack'
              ].map((city) => (
                <div key={city} className="bg-white rounded-lg p-4 shadow-sm">
                  <FaMapMarkerAlt className="text-primary-600 mx-auto mb-2" />
                  <div className="font-semibold">{city}</div>
                  <div className="text-sm text-gray-500">Same-day service</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Mobile Screen Repair?</h2>
              <p className="text-xl text-gray-600">The fastest and most reliable mobile screen repair service in Vancouver</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FaClock className="text-primary-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-3">Same-Day Service</h3>
                <p className="text-gray-600">Most mobile screen repairs completed within 30-45 minutes at your location.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FaShieldAlt className="text-primary-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-3">90-Day Warranty</h3>
                <p className="text-gray-600">All mobile screen repairs backed by our comprehensive 90-day warranty.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FaMobile className="text-primary-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-3">Quality Screens</h3>
                <p className="text-gray-600">We use only OEM quality screens and certified replacement parts.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FaStar className="text-primary-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-3">Expert Technicians</h3>
                <p className="text-gray-600">Certified mobile repair specialists with years of experience.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Mobile Screen Repair FAQ</h2>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-6">
              {[
                {
                  q: "How long does mobile screen repair take?",
                  a: "Most mobile screen repairs are completed within 30-45 minutes. We come to your location so you can continue with your day while we fix your phone."
                },
                {
                  q: "What brands do you repair?",
                  a: "We repair all major mobile phone brands including iPhone, Samsung Galaxy, Google Pixel, Huawei, OnePlus, Xiaomi, and more."
                },
                {
                  q: "Do you use original screens?",
                  a: "We use OEM quality screens that match the original specifications. All screens are thoroughly tested before installation."
                },
                {
                  q: "Is there a warranty on screen repairs?",
                  a: "Yes, all mobile screen repairs come with a comprehensive 90-day warranty covering both parts and labor."
                },
                {
                  q: "How much does mobile screen repair cost?",
                  a: "Screen repair costs vary by device: iPhone ($129-$189), Samsung ($99-$169), Other Android ($79-$149). We provide upfront pricing with no hidden fees."
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
              Get Your Mobile Screen Fixed Today
            </h2>
            <p className="text-xl mb-8 text-accent-100">
              Same-day doorstep service across Vancouver and Lower Mainland
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-online?service=mobile-screen-repair" className="btn-white text-accent-600 hover:bg-gray-100">
                <FaCalendarAlt className="inline mr-2" />
                Book Online Now
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