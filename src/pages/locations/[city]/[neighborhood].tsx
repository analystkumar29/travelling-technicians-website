import React from 'react';
import { GetStaticProps, GetStaticPaths, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import NeighborhoodBreadcrumbs from '@/components/seo/NeighborhoodBreadcrumbs';
import NeighborhoodPageSchema from '@/components/seo/NeighborhoodPageSchema';
import NeighborhoodProofOfLife from '@/components/seo/NeighborhoodProofOfLife';
import NeighborhoodTestimonials from '@/components/seo/NeighborhoodTestimonials';

import {
  getNeighborhoodData,
  getAllNeighborhoodPaths,
  getRelatedNeighborhoods,
  getTestimonials
} from '@/lib/data-service';

interface NeighborhoodPageProps {
  neighborhoodData: {
    id: string;
    neighborhoodName: string;
    cityName: string;
    latitude: number;
    longitude: number;
    monthlyIPhoneScreens: number;
    monthlySamsungScreens: number;
    monthlyPixelScreens: number;
    monthlyMacbookScreens: number;
    landmarkName: string;
    landmarkDescription: string;
    landmarkActivityWindow: string;
    neighborhoodContent: string;
    commonIssues: string[];
    postalCodes: string[];
    testimonials: any[];
  } | null;
  relatedNeighborhoods: Array<{
    neighborhood: string;
    neighborhoodSlug: string;
    city: string;
    citySlug: string;
    latitude: number;
    longitude: number;
  }>;
  allTestimonials: any[];
  citySlug: string;
  neighborhoodSlug: string;
}

/**
 * Neighborhood Page Component (Phase 8.4)
 * 
 * Dynamic page for neighborhood-level service pages with:
 * - "Proof-of-Life" signals (monthly repair statistics)
 * - Neighborhood-specific testimonials with city-wide fallback
 * - Related neighborhoods for internal linking
 * - Comprehensive SEO with schema markup
 * - ISR strategy for 1-hour revalidation
 */
const NeighborhoodPage: NextPage<NeighborhoodPageProps> = ({
  neighborhoodData,
  relatedNeighborhoods,
  allTestimonials,
  citySlug,
  neighborhoodSlug
}) => {
  const router = useRouter();

  // Handle loading state
  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
          <p className="text-gray-600">Preparing neighborhood information</p>
        </div>
      </div>
    );
  }

  // Handle case where data couldn't be fetched
  if (!neighborhoodData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Neighborhood Not Found</h1>
          <p className="text-gray-600 mb-4">We couldn't find this neighborhood</p>
          <a href="/locations" className="text-blue-600 hover:underline">
            Back to Locations
          </a>
        </div>
      </div>
    );
  }

  // Extract testimonials for this neighborhood (primary + fallback)
  const neighborhoodTestimonials = (
    typeof neighborhoodData.testimonials === 'object' &&
    neighborhoodData.testimonials !== null &&
    Array.isArray((neighborhoodData.testimonials as any).primary)
  )
    ? (neighborhoodData.testimonials as any).primary.map((t: any) => ({ ...t, isNeighborhoodSpecific: true }))
    : [];
  
  const cityTestimonials = (
    typeof neighborhoodData.testimonials === 'object' &&
    neighborhoodData.testimonials !== null &&
    Array.isArray((neighborhoodData.testimonials as any).fallback)
  )
    ? (neighborhoodData.testimonials as any).fallback.map((t: any) => ({ ...t, isNeighborhoodSpecific: false }))
    : [];

  const displayedTestimonials = [...neighborhoodTestimonials, ...cityTestimonials, ...allTestimonials].slice(0, 8);

  // Generate meta description
  const metaDescription = `Mobile and laptop repair doorstep service in ${neighborhoodData.neighborhoodName}, ${neighborhoodData.cityName}. ${neighborhoodData.monthlyIPhoneScreens + neighborhoodData.monthlySamsungScreens + neighborhoodData.monthlyPixelScreens + neighborhoodData.monthlyMacbookScreens} devices repaired monthly. Same-day service available.`;

  // Generate page title
  const pageTitle = `Device Repair in ${neighborhoodData.neighborhoodName}, ${neighborhoodData.cityName} | The Travelling Technicians`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={`phone repair ${neighborhoodData.neighborhoodName}, laptop repair ${neighborhoodData.cityName}, doorstep repair service`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <link rel="canonical" href={`https://www.travelling-technicians.ca/locations/${citySlug}/${neighborhoodSlug}`} />
      </Head>

      {/* Schema Markup */}
      <NeighborhoodPageSchema
        neighborhoodName={neighborhoodData.neighborhoodName}
        cityName={neighborhoodData.cityName}
        latitude={neighborhoodData.latitude}
        longitude={neighborhoodData.longitude}
        proofOfLife={{
          monthlyIPhoneScreens: neighborhoodData.monthlyIPhoneScreens,
          monthlySamsungScreens: neighborhoodData.monthlySamsungScreens,
          monthlyPixelScreens: neighborhoodData.monthlyPixelScreens,
          monthlyMacbookScreens: neighborhoodData.monthlyMacbookScreens
        }}
        postalCodes={neighborhoodData.postalCodes}
        description={metaDescription}
      />

      {/* Breadcrumbs */}
      <NeighborhoodBreadcrumbs
        cityName={neighborhoodData.cityName}
        citySlug={citySlug}
        neighborhoodName={neighborhoodData.neighborhoodName}
        neighborhoodSlug={neighborhoodSlug}
      />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Device Repair in {neighborhoodData.neighborhoodName}
            </h1>
            <p className="text-xl mb-4 text-blue-100">
              Same-day doorstep phone and laptop repair service in {neighborhoodData.neighborhoodName}, {neighborhoodData.cityName}
            </p>
            <p className="text-lg text-blue-50 mb-6">
              Serving your neighborhood for years with expert technicians and 1-year warranty on all repairs
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
                Book Repair Now
              </button>
              <a
                href={`tel:+1-604-XXX-XXXX`}
                className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Call Us Today
              </a>
            </div>
          </div>
        </section>

        {/* Proof of Life Section */}
        <section className="py-16 px-4 md:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <NeighborhoodProofOfLife
              data={{
                monthlyIPhoneScreens: neighborhoodData.monthlyIPhoneScreens,
                monthlySamsungScreens: neighborhoodData.monthlySamsungScreens,
                monthlyPixelScreens: neighborhoodData.monthlyPixelScreens,
                monthlyMacbookScreens: neighborhoodData.monthlyMacbookScreens,
                landmarkName: neighborhoodData.landmarkName,
                landmarkDescription: neighborhoodData.landmarkDescription,
                landmarkActivityWindow: neighborhoodData.landmarkActivityWindow
              }}
              neighborhoodName={neighborhoodData.neighborhoodName}
            />
          </div>
        </section>

        {/* Neighborhood Content Section */}
        <section className="py-16 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About {neighborhoodData.neighborhoodName}</h2>
            
            {/* Neighborhood Description */}
            {neighborhoodData.neighborhoodContent && (
              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-gray-700 leading-relaxed">
                  {neighborhoodData.neighborhoodContent}
                </p>
              </div>
            )}

            {/* Common Issues */}
            {neighborhoodData.commonIssues && neighborhoodData.commonIssues.length > 0 && (
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Common Issues in {neighborhoodData.neighborhoodName}</h3>
                <ul className="space-y-2">
                  {neighborhoodData.commonIssues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span className="text-gray-700">{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Service Areas */}
            {neighborhoodData.postalCodes && neighborhoodData.postalCodes.length > 0 && (
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Postal Codes</h3>
                <div className="flex flex-wrap gap-2">
                  {neighborhoodData.postalCodes.map((code, index) => (
                    <span
                      key={index}
                      className="bg-green-200 text-green-800 px-3 py-1 rounded-full font-medium"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 px-4 md:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Services in {neighborhoodData.neighborhoodName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'iPhone Screen Repair',
                  description: 'Fast & reliable iPhone screen replacement service',
                  icon: '📱'
                },
                {
                  title: 'Samsung Repair',
                  description: 'Expert Samsung device repair and screen replacement',
                  icon: '📱'
                },
                {
                  title: 'MacBook Service',
                  description: 'Professional MacBook repair and maintenance',
                  icon: '💻'
                },
                {
                  title: 'Battery Replacement',
                  description: 'Battery replacement for phones, laptops & tablets',
                  icon: '🔋'
                }
              ].map((service, index) => (
                <div
                  key={index}
                  className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 transition-colors"
                >
                  <div className="text-4xl mb-3">{service.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-700 mb-4">{service.description}</p>
                  <button className="text-blue-600 hover:text-blue-800 font-semibold">
                    Learn More →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        {displayedTestimonials.length > 0 && (
          <section className="py-16 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              <NeighborhoodTestimonials
                testimonials={displayedTestimonials}
                neighborhoodName={neighborhoodData.neighborhoodName}
                cityName={neighborhoodData.cityName}
              />
            </div>
          </section>
        )}

        {/* Related Neighborhoods Section */}
        {relatedNeighborhoods.length > 0 && (
          <section className="py-16 px-4 md:px-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Nearby Neighborhoods</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedNeighborhoods.map((neighborhood, index) => (
                  <a
                    key={index}
                    href={`/locations/${neighborhood.citySlug}/${neighborhood.neighborhoodSlug}`}
                    className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 hover:shadow-lg transition-all"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {neighborhood.neighborhood}
                    </h3>
                    <p className="text-gray-600 mb-4">{neighborhood.city}</p>
                    <span className="text-blue-600 hover:text-blue-800 font-semibold">
                      View Services →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 px-4 md:px-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready for Same-Day Repair?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Book your doorstep repair in {neighborhoodData.neighborhoodName} today. No trips to the mall. No hassle.
            </p>
            <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-4 px-10 rounded-lg transition-colors text-lg">
              Book Now
            </button>
          </div>
        </section>
      </main>
    </>
  );
};

/**
 * Get static paths for all 31 neighborhoods
 * Used by Next.js for static generation and ISR fallback
 */
export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const allNeighborhoodPaths = await getAllNeighborhoodPaths();
    
    const paths = allNeighborhoodPaths.map((neighborhood) => ({
      params: {
        city: neighborhood.citySlug,
        neighborhood: neighborhood.neighborhoodSlug
      }
    }));

    return {
      paths,
      fallback: 'blocking' // Use ISR with blocking fallback
    };
  } catch (error) {
    console.error('Error generating neighborhood paths:', error);
    // Fallback to empty paths to avoid build failures
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
};

/**
 * Get static props for each neighborhood page
 * Fetches data from Supabase and returns as props
 * 
 * ISR Strategy: revalidate every 3600 seconds (1 hour)
 * This ensures:
 * 1. Fast initial page load (static generation)
 * 2. Fresh data every hour
 * 3. Regeneration happens in background
 */
export const getStaticProps: GetStaticProps<NeighborhoodPageProps> = async ({ params }) => {
  try {
    const citySlug = params?.city as string;
    const neighborhoodSlug = params?.neighborhood as string;

    if (!citySlug || !neighborhoodSlug) {
      return { notFound: true };
    }

    // Fetch neighborhood data
    const neighborhoodData = await getNeighborhoodData(citySlug, neighborhoodSlug);
    
    if (!neighborhoodData) {
      return { notFound: true };
    }

    // Fetch related neighborhoods
    const relatedNeighborhoods = await getRelatedNeighborhoods(citySlug, neighborhoodSlug);

    // Fetch all testimonials for fallback
    const allTestimonials = await getTestimonials();

    return {
      props: {
        neighborhoodData,
        relatedNeighborhoods,
        allTestimonials,
        citySlug,
        neighborhoodSlug
      },
      revalidate: 3600 // ISR: Revalidate every 1 hour
    };
  } catch (error) {
    console.error('Error generating neighborhood page:', error);
    return {
      notFound: true,
      revalidate: 60 // Retry after 1 minute on error
    };
  }
};

export default NeighborhoodPage;