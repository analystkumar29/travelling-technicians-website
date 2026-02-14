import { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getSiteUrl } from '@/utils/supabaseClient';
import { formatPhoneNumberForDisplay, formatPhoneNumberForHref, DEFAULT_PHONE_NUMBER } from '@/utils/phone-formatter';
import { NeighborhoodProofOfLife } from '@/components/seo/NeighborhoodProofOfLife';
import { NeighborhoodBreadcrumbs } from '@/components/seo/NeighborhoodBreadcrumbs';
import { NeighborhoodPageSchema } from '@/components/seo/NeighborhoodPageSchema';
import InternalLinkingFooter from '@/components/seo/InternalLinkingFooter';

interface NeighborhoodPageProps {
  routeData: {
    slug_path: string;
    payload: {
      city: { id: string; name: string; slug: string };
      neighborhood: {
        id: number;
        name: string;
        slug: string;
        latitude: number;
        longitude: number;
        content: string;
        landmark_name: string;
        landmark_description: string;
        landmark_activity_window: string;
        common_issues: string[];
        postal_codes: string[];
        monthly_iphone_screens: number;
        monthly_samsung_screens: number;
        monthly_pixel_screens: number;
        monthly_macbook_screens: number;
        testimonials: { primary: any[]; fallback: any[] };
      };
      sample_services: Array<{ id: string; name: string; slug: string; display_name: string; description: string }>;
      popular_models: Array<{ id: string; name: string; slug: string; display_name: string; brand: string; device_type: string }>;
      nearby_neighborhoods: Array<{ id: number; neighborhood_name: string; slug: string; landmark_name: string }>;
      testimonials: Array<{ id: string; customer_name: string; review: string; rating: number; city: string; service: string }>;
      local_phone: string;
      local_email: string;
      operating_hours: any;
    };
  };
}

export default function NeighborhoodPage({ routeData }: NeighborhoodPageProps) {
  const siteUrl = getSiteUrl();
  const { city, neighborhood, sample_services, popular_models, nearby_neighborhoods, testimonials } = routeData.payload;

  const phoneRaw = routeData.payload.local_phone || DEFAULT_PHONE_NUMBER;
  const phoneDisplay = formatPhoneNumberForDisplay(phoneRaw);
  const phoneHref = formatPhoneNumberForHref(phoneRaw);

  const pageTitle = `${neighborhood.name} Device Repair | ${city.name} | The Travelling Technicians`;
  const pageDesc = `Professional mobile and laptop repair in ${neighborhood.name}, ${city.name}. Same-day doorstep service near ${neighborhood.landmark_name}. 90-day warranty on all repairs.`;
  const canonicalUrl = `${siteUrl}/${routeData.slug_path}`;

  // FAQ questions for neighborhood page
  const faqItems = useMemo(() => [
    {
      question: `Do you offer doorstep repair in ${neighborhood.name}, ${city.name}?`,
      answer: `Yes! We provide doorstep device repair throughout ${neighborhood.name} in ${city.name}. Our technicians come directly to your location near ${neighborhood.landmark_name} with all necessary tools and parts.`
    },
    {
      question: `How quickly can you come to ${neighborhood.name}?`,
      answer: `We typically offer next-day appointments for ${neighborhood.name} when booked before 3 PM. Most repairs are completed in 30-60 minutes at your location. Same-day service may be available depending on technician schedules.`
    },
    {
      question: `What repair services are available in ${neighborhood.name}?`,
      answer: `We offer screen replacement, battery replacement, charging port repair, and water damage repair for all major phone and laptop brands in ${neighborhood.name}. This includes iPhone, Samsung Galaxy, Google Pixel, MacBook, and more.`
    },
    {
      question: `Is there an extra fee for doorstep service in ${neighborhood.name}?`,
      answer: `No, our prices include the convenience of doorstep service with no additional travel fees for ${neighborhood.name} and surrounding areas in ${city.name}. All repairs come with our standard 90-day warranty.`
    }
  ], [neighborhood.name, neighborhood.landmark_name, city.name]);

  // FAQ JSON-LD schema
  const faqLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }), [faqItems]);

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="keywords" content={`${neighborhood.name} repair, ${city.name} phone repair, doorstep repair ${neighborhood.name}, mobile repair near ${neighborhood.landmark_name}`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />

        {/* FAQPage Schema for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      </Head>

      <NeighborhoodPageSchema
        neighborhoodName={neighborhood.name}
        cityName={city.name}
        latitude={neighborhood.latitude}
        longitude={neighborhood.longitude}
        proofOfLife={{
          monthlyIPhoneScreens: neighborhood.monthly_iphone_screens || 0,
          monthlySamsungScreens: neighborhood.monthly_samsung_screens || 0,
          monthlyPixelScreens: neighborhood.monthly_pixel_screens || 0,
          monthlyMacbookScreens: neighborhood.monthly_macbook_screens || 0,
        }}
        postalCodes={neighborhood.postal_codes || []}
        description={neighborhood.content}
      />

      <Header />

      <NeighborhoodBreadcrumbs
        cityName={city.name}
        citySlug={city.slug}
        neighborhoodName={neighborhood.name}
        neighborhoodSlug={neighborhood.slug}
      />

      {/* Hero Section */}
      <section className="pt-8 pb-12 bg-gradient-to-r from-primary-900 to-primary-900 text-white">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-primary-200">{neighborhood.name}, {city.name}, BC</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Device Repair in<br />
              <span className="text-2xl md:text-3xl">{neighborhood.name}</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Professional doorstep repair near {neighborhood.landmark_name}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href={`/book-online?city=${city.slug}`}
                className="btn-accent text-lg px-8 py-4"
              >
                Book Repair Now
              </Link>
              <a
                href={phoneHref}
                className="btn-outline border-white text-white hover:bg-primary-800 text-lg px-8 py-4 flex items-center justify-center"
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {phoneDisplay}
              </a>
            </div>

            {neighborhood.postal_codes && neighborhood.postal_codes.length > 0 && (
              <div className="text-sm text-primary-200 flex items-center justify-center">
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Serving postal codes: {neighborhood.postal_codes.join(', ')}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Neighborhood Content */}
      {neighborhood.content && (
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">
                About {neighborhood.name}
              </h2>
              <p className="text-lg text-primary-600 leading-relaxed text-center">
                {neighborhood.content}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Proof of Life - Monthly Repair Stats */}
      <section className="py-16 bg-primary-50">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <NeighborhoodProofOfLife
              data={{
                monthlyIPhoneScreens: neighborhood.monthly_iphone_screens || 0,
                monthlySamsungScreens: neighborhood.monthly_samsung_screens || 0,
                monthlyPixelScreens: neighborhood.monthly_pixel_screens || 0,
                monthlyMacbookScreens: neighborhood.monthly_macbook_screens || 0,
                landmarkName: neighborhood.landmark_name || '',
                landmarkDescription: neighborhood.landmark_description || '',
                landmarkActivityWindow: neighborhood.landmark_activity_window || '',
              }}
              neighborhoodName={neighborhood.name}
            />
          </div>
        </div>
      </section>

      {/* Common Issues */}
      {neighborhood.common_issues && neighborhood.common_issues.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">
                Common Repair Needs in {neighborhood.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {neighborhood.common_issues.map((issue: string, index: number) => (
                  <div key={index} className="flex items-start bg-primary-50 p-4 rounded-lg">
                    <svg className="h-5 w-5 text-accent-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-primary-700">{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Available Services */}
      {sample_services && sample_services.length > 0 && (
        <section className="py-16 bg-primary-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Services in {neighborhood.name}</h2>
              <p className="text-lg text-primary-500 max-w-2xl mx-auto">
                All repair services available at your doorstep in {neighborhood.name}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {sample_services.map((service) => (
                <Link
                  key={service.id}
                  href={`/repair/${city.slug}/${service.slug}`}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 group text-center"
                >
                  <h3 className="font-bold text-lg text-primary-900 group-hover:text-primary-800 transition-colors mb-2">
                    {service.display_name}
                  </h3>
                  <p className="text-sm text-primary-500 mb-4">
                    {service.description || `Professional ${service.display_name.toLowerCase()} service`}
                  </p>
                  <span className="text-primary-800 font-medium text-sm">
                    View Pricing →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What {city.name} Customers Say</h2>
              <p className="text-lg text-primary-500 max-w-2xl mx-auto">
                Real reviews from customers near {neighborhood.name}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.slice(0, 3).map((t, index: number) => (
                <div key={t.id || index} className="bg-primary-50 p-6 rounded-xl">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${i < t.rating ? 'text-accent-400' : 'text-primary-200'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-primary-700 mb-4 italic">&ldquo;{t.review}&rdquo;</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-primary-900">{t.customer_name}</div>
                    {t.city && <div className="text-sm text-primary-400">{t.city}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Nearby Neighborhoods */}
      {nearby_neighborhoods && nearby_neighborhoods.length > 0 && (
        <section className="py-16 bg-primary-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Nearby {city.name} Neighborhoods</h2>
              <p className="text-lg text-primary-500 max-w-2xl mx-auto">
                We also serve these neighborhoods in {city.name}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {nearby_neighborhoods.map((n) => (
                <Link
                  key={n.id}
                  href={`/repair/${city.slug}/${n.slug}`}
                  className="bg-white p-4 rounded-lg hover:shadow-md transition-all border border-gray-100 group"
                >
                  <div className="font-bold text-primary-900 group-hover:text-primary-800 transition-colors mb-1">
                    {n.neighborhood_name}
                  </div>
                  {n.landmark_name && (
                    <div className="text-xs text-primary-400 mb-2">
                      Near {n.landmark_name}
                    </div>
                  )}
                  <div className="text-xs text-primary-800">View Services →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div key={index} className="border border-gray-100 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-primary-50 transition-colors"
                  >
                    <span className="font-medium text-primary-900 pr-4">{item.question}</span>
                    <svg
                      className={`h-5 w-5 text-primary-400 flex-shrink-0 transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {openFaqIndex === index && (
                    <div className="px-4 pb-4 text-primary-600">
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-50">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready for Device Repair in {neighborhood.name}?
          </h2>
          <p className="text-xl text-primary-700 mb-8 max-w-2xl mx-auto">
            Book your doorstep repair today and get your device working like new.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/book-online?city=${city.slug}`}
              className="btn-accent text-lg px-8 py-4"
            >
              Book Repair Now
            </Link>
            <a
              href={phoneHref}
              className="btn-outline border-primary-800 text-primary-800 hover:bg-primary-50 text-lg px-8 py-4"
            >
              Call {phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <InternalLinkingFooter currentCity={city.slug} />
      <Footer />
    </>
  );
}
