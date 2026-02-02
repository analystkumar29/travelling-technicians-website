/**
 * UNIVERSAL REPAIR ROUTE COMPONENT
 * 
 * This file handles ALL repair routes dynamically:
 * - /repair (root)
 * - /repair/[city]
 * - /repair/[city]/[service]
 * - /repair/[city]/[service]/[model]
 * 
 * Uses database-driven routing from the dynamic_routes table
 * with automatic regeneration via triggers.
 * 
 * Features:
 * - Schema.org Breadcrumbs for Google Rich Results
 * - Pre-computed JSON payloads for performance
 * - Automatic 404 handling for invalid routes
 * - SEO-optimized meta tags
 * - Database-driven dropdowns for RepairIndex
 */

import { GetStaticPaths, GetStaticProps } from 'next';
import { getServiceSupabase } from '@/utils/supabaseClient';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getSiteUrl } from '@/utils/supabaseClient';

// Dynamic imports for code splitting (reduces initial bundle size)
const RepairIndex = dynamic(() => import('@/components/templates/RepairIndex'));
const ModelServicePage = dynamic(() => import('@/components/templates/ModelServicePage'));

// Types for our route data
interface RouteData {
  slug_path: string;
  route_type: 'model-service-page' | 'city-service-page' | 'city-page';
  city_id: string;
  service_id: string;
  model_id: string;
  payload: {
    city: {
      id: string;
      name: string;
      slug: string;
      local_content?: string;
      local_phone?: string;
      local_email?: string;
      operating_hours?: string;
    };
    service: {
      id: string;
      name: string;
      slug: string;
      description?: string;
      display_name: string;
      estimated_duration_minutes?: number;
      is_doorstep_eligible: boolean;
    };
    model: {
      id: string;
      name: string;
      slug: string;
      display_name: string;
      release_year?: number;
      popularity_score?: number;
    };
    type: {
      id: string;
      name: string;
      slug: string;
    };
    brand: {
      id: string;
      name: string;
      slug: string;
      display_name: string;
    };
  };
}

interface PageProps {
  routeType: 'REPAIR_INDEX' | 'MODEL_SERVICE_PAGE' | 'CITY_PAGE' | 'CITY_SERVICE_PAGE';
  routeData?: RouteData;
  cities?: Array<{ slug: string; city_name: string }>;
  services?: Array<{ slug: string; name: string; display_name: string }>;
  error?: string;
}

// Simple NotFound component
function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
        <p className="text-gray-600">The requested repair page could not be found.</p>
        <button
          onClick={() => router.push('/repair')}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Repair Home
        </button>
      </div>
    </div>
  );
}

/**
 * Main page component that renders the appropriate template
 * based on route type
 */
export default function UniversalRepairPage({ routeType, routeData, cities, services, error }: PageProps) {
  const router = useRouter();
  const siteUrl = getSiteUrl();

  // Generate SEO meta tags for MODEL_SERVICE_PAGE at parent level
  // This is the "One Source of Truth" for all meta tags
  let metaTags = null;
  if (routeType === 'MODEL_SERVICE_PAGE' && routeData) {
    const { city, service, model, brand } = routeData.payload;
    const pageTitle = `${model.display_name} ${service.display_name} in ${city.name} | The Travelling Technicians`;
    const pageDesc = `Fast, professional ${service.name} for your ${brand.display_name} ${model.display_name} in ${city.name}. Doorstep service by expert technicians.`;
    const canonicalUrl = `${siteUrl}/${routeData.slug_path}`;

    metaTags = (
      <>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="keywords" content={`${model.display_name} repair, ${service.display_name}, ${city.name} mobile repair, doorstep repair, ${brand.display_name} repair`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        
        {/* Canonical URL - CRITICAL for SEO */}
        <link rel="canonical" href={canonicalUrl} />
      </>
    );
  }

  // Handle loading state
  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading repair information...</p>
        </div>
      </div>
    );
  }

  // Handle errors
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Page</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/repair')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Repair Home
          </button>
        </div>
      </div>
    );
  }

  // Render appropriate template based on route type
  switch (routeType) {
    case 'REPAIR_INDEX':
      return <RepairIndex cities={cities || []} services={services || []} models={[]} />;

    case 'MODEL_SERVICE_PAGE':
      if (!routeData) {
        return <NotFound />;
      }
      return <ModelServicePage routeData={routeData} />;

    case 'CITY_PAGE':
      // Render a "coming soon" page for city-level repair pages
      // This allows Google to index the URL structure immediately,
      // even before full content is ready
      const routerSlug = router.query.slug as string[];
      const citySlug = routerSlug?.[0] || 'your city';
      return (
        <>
          <Head>
            <title>Repair Services in {citySlug} | The Travelling Technicians</title>
            <meta name="description" content={`Doorstep repair services coming soon to ${citySlug}. Check back soon for mobile and laptop repair options.`} />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={`${siteUrl}/repair/${citySlug}`} />
          </Head>
          <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center px-4">
            <div className="max-w-2xl text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Repair Services Coming Soon to {citySlug.charAt(0).toUpperCase() + citySlug.slice(1)}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                We're preparing our complete repair service pages for this area. Check back soon to see all available mobile and laptop repair options.
              </p>
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose The Travelling Technicians?</h2>
                <ul className="text-left space-y-3 text-gray-700">
                  <li className="flex items-center"><span className="text-blue-600 mr-3">✓</span> Same-day doorstep repair service</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-3">✓</span> 1-year warranty on all repairs</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-3">✓</span> Professional certified technicians</li>
                  <li className="flex items-center"><span className="text-blue-600 mr-3">✓</span> No hidden fees - transparent pricing</li>
                </ul>
              </div>
              <Link
                href="/repair"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 inline-block"
              >
                View All Repair Services
              </Link>
            </div>
          </div>
        </>
      );

    case 'CITY_SERVICE_PAGE':
      // Render a "coming soon" page for city+service-level repair pages
      const routerSlugCS = router.query.slug as string[];
      const citySlugCS = routerSlugCS?.[0] || 'your city';
      const serviceSlug = routerSlugCS?.[1] || 'service';
      return (
        <>
          <Head>
            <title>Repair Services in {citySlugCS} | The Travelling Technicians</title>
            <meta name="description" content={`${serviceSlug} services coming soon to ${citySlugCS}. Professional doorstep repair by certified technicians.`} />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={`${siteUrl}/repair/${citySlugCS}/${serviceSlug}`} />
          </Head>
          <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center px-4">
            <div className="max-w-2xl text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {serviceSlug.replace(/-/g, ' ').charAt(0).toUpperCase() + serviceSlug.replace(/-/g, ' ').slice(1)} in {citySlugCS.charAt(0).toUpperCase() + citySlugCS.slice(1)}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                This service page is coming soon! We're preparing detailed pricing and booking options for this location. In the meantime, explore our available services.
              </p>
              <Link
                href="/repair"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 inline-block"
              >
                View All Services
              </Link>
            </div>
          </div>
        </>
      );

    default:
      return <NotFound />;
  }
}

/**
 * Generate static paths for ALL dynamic routes
 * This is called at build time to pre-generate all pages
 * 
 * Fetches all routes from the dynamic_routes table for complete pre-rendering.
 * This ensures all pages are indexed from day 1 for optimal SEO coverage.
 */
export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const supabase = getServiceSupabase();
    
    // Fetch ALL dynamic routes for pre-rendering
    // Complete coverage ensures all repair pages are available to search engines
    const { data: routes, error } = await supabase
      .from('dynamic_routes')
      .select('slug_path')
      .order('popularity_score', { ascending: false });

    if (error) {
      console.error('Error fetching top dynamic routes:', error);
      // Fallback to empty paths - Next.js will use fallback: 'blocking'
      return {
        paths: [],
        fallback: 'blocking',
      };
    }

    // Convert slug_path to Next.js params format
    // Example: "repair/vancouver/screen-replacement-mobile/iphone-14" 
    // becomes { params: { slug: ['vancouver', 'screen-replacement-mobile', 'iphone-14'] } }
    const paths = routes?.map(route => ({
      params: { 
        slug: route.slug_path.replace('repair/', '').split('/').filter(Boolean)
      }
    })) || [];

    // Always include the root repair page
    paths.push({ params: { slug: [] } });

    console.log(`✅ Generated ${paths.length} pre-rendered paths for complete SEO coverage. All repair pages are now available at build time.`);

    return {
      paths,
      fallback: 'blocking', // Generate missing pages on-demand with ISR
    };
  } catch (error) {
    console.error('Error in getStaticPaths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

/**
 * Get static props for each route
 * This fetches the route data from database at build time
 */
export const getStaticProps: GetStaticProps<PageProps> = async ({ params }) => {
  try {
    const slug = params?.slug as string[] || [];
    
    // Handle root repair page - fetch database data for dropdowns
    if (slug.length === 0) {
      const supabase = getServiceSupabase();
      
      // Fetch cities for dropdown
      const { data: cities, error: citiesError } = await supabase
        .from('service_locations')
        .select('slug, city_name')
        .eq('is_active', true)
        .order('city_name');

      // Fetch services for dropdown
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('slug, name, display_name')
        .eq('is_active', true)
        .eq('is_doorstep_eligible', true)
        .order('sort_order');

      // Fetch models for dropdown (with type and brand info)
      const { data: models, error: modelsError } = await supabase
        .from('device_models')
        .select('id, name, device_type_id, brand_id')
        .eq('is_active', true)
        .order('popularity_score', { ascending: false })
        .limit(100);

      if (citiesError || servicesError || modelsError) {
        console.warn('Error fetching dropdown data:', { citiesError, servicesError, modelsError });
        // Continue with empty arrays - component has fallback
      }

      // Fetch types and brands separately for better compatibility
      const { data: types } = await supabase
        .from('device_types')
        .select('id, name');
      
      const { data: brands } = await supabase
        .from('brands')
        .select('id, display_name');

      // Create lookup maps for efficient joins
      const typeMap = new Map(types?.map(t => [t.id, t.name]) || []);
      const brandMap = new Map(brands?.map(b => [b.id, b.display_name]) || []);

      // Transform models to match RepairIndexProps interface
      const transformedModels = models?.map(m => ({
        id: m.id,
        name: m.name,
        type: typeMap.get(m.device_type_id) || 'unknown',
        brand: brandMap.get(m.brand_id) || 'unknown'
      })) || [];

      return {
        props: {
          routeType: 'REPAIR_INDEX',
          cities: cities || [],
          services: services || [],
          models: transformedModels
        },
        revalidate: 3600, // Revalidate every hour
      };
    }

    // Construct the full slug path for database lookup
    const slugPath = `repair/${slug.join('/')}`;
    
    // Fetch route data from dynamic_routes table
    const supabase = getServiceSupabase();
    const { data: route, error } = await supabase
      .from('dynamic_routes')
      .select('*')
      .eq('slug_path', slugPath)
      .single();

    // Handle database errors or missing routes
    if (error || !route) {
      console.warn(`Route not found: ${slugPath}`, error?.message);
      
      // Check if this might be a city page or city-service page
      // (we don't have those in dynamic_routes yet, but we could add them)
      if (slug.length === 1) {
        // Could be a city page like /repair/vancouver
        return {
          props: {
            routeType: 'CITY_PAGE',
          },
          revalidate: 86400,
        };
      } else if (slug.length === 2) {
        // Could be a city-service page like /repair/vancouver/screen-repair
        return {
          props: {
            routeType: 'CITY_SERVICE_PAGE',
          },
          revalidate: 86400,
        };
      }
      
      // Return 404 for unknown routes
      return {
        notFound: true,
        revalidate: 3600,
      };
    }

    // Return the appropriate route type with data
    switch (route.route_type) {
      case 'model-service-page':
        return {
          props: {
            routeType: 'MODEL_SERVICE_PAGE',
            routeData: route as RouteData,
          },
          revalidate: 86400, // Revalidate once per day
        };

      case 'city-page':
        return {
          props: {
            routeType: 'CITY_PAGE',
            routeData: route as RouteData,
          },
          revalidate: 86400,
        };

      case 'city-service-page':
        return {
          props: {
            routeType: 'CITY_SERVICE_PAGE',
            routeData: route as RouteData,
          },
          revalidate: 86400,
        };

      default:
        console.warn(`Unknown route type: ${route.route_type} for ${slugPath}`);
        return {
          notFound: true,
          revalidate: 3600,
        };
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      props: {
        routeType: 'REPAIR_INDEX',
        error: 'An error occurred while loading the page.',
      },
      revalidate: 3600,
    };
  }
};