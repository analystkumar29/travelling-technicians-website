import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';
import {
  CheckCircle, Laptop, BatteryFull,
  Smartphone, Star,
  Shield, Zap, Award, Clock,
  MapPin
} from 'lucide-react';
import { ServiceSchema, LocalBusinessSchema } from '@/components/seo/StructuredData';
import { getServicesByDeviceType, getBrandsByDeviceType, getAllActiveServiceSlugs, hasModelPage } from '@/lib/data-service';
import InternalLinkingFooter from '@/components/seo/InternalLinkingFooter';
import GoogleReviewBadge from '@/components/common/GoogleReviewBadge';
import OptimizedImage from '@/components/common/OptimizedImage';
import { GetStaticProps, GetStaticPaths } from 'next';
import { serviceConfig, ServiceSlug } from '@/config/service-page-config';
import { getServiceSupabase } from '@/utils/supabaseClient';

interface Service {
  id: number;
  name: string;
  description: string;
  icon: string;
  doorstep: boolean;
  limited: boolean;
  price: string;
  popular: boolean;
}

interface Testimonial {
  customer_name: string;
  city: string;
  device_model: string;
  rating: number;
  review: string;
  service: string;
}

interface ModelWithServices {
  name: string;
  slug: string;
  brand: string;
  services: { name: string; slug: string }[];
}

interface CityRepairs {
  cityName: string;
  citySlug: string;
  models: ModelWithServices[];
}

interface BrandModelWithServices {
  name: string;
  slug: string;
  hasLandingPage: boolean;
  services: { name: string; slug: string }[];
}

interface BrandWithModels {
  name: string;
  slug: string;
  models: BrandModelWithServices[];
}

interface ServicePageProps {
  slug: ServiceSlug;
  services: Service[];
  brands: string[];
  config: typeof serviceConfig[ServiceSlug];
  testimonials: Testimonial[];
  popularRepairsByCity: CityRepairs[];
  brandsWithModels: BrandWithModels[];
}

// "What's included" bullets per service name
const SERVICE_INCLUDES: Record<string, string[]> = {
  'Screen Replacement': [
    'Certified replacement parts',
    'Same-day doorstep service',
    'Up to 6 months warranty',
    'Free diagnostic assessment',
  ],
  'Battery Replacement': [
    'Genuine-quality batteries',
    'Same-day doorstep service',
    'Up to 6 months warranty',
    'Battery health check included',
  ],
};

export default function ServicePage({
  slug,
  services,
  brands,
  config,
  testimonials,
  popularRepairsByCity,
  brandsWithModels,
}: ServicePageProps) {
  const deviceLabel = config.deviceType.charAt(0).toUpperCase() + config.deviceType.slice(1);

  return (
    <>
      <Head>
        <ServiceSchema
          name={config.title}
          description={`${config.serviceDescription} Convenient doorstep service across Vancouver and Lower Mainland.`}
          serviceType={config.title.replace(' Services', '')}
          provider="The Travelling Technicians"
          hasOfferCatalog={{
            name: config.title,
            description: `Comprehensive ${config.deviceType} repair services`,
            offers: services.map(service => ({
              name: service.name,
              description: service.description,
              priceCurrency: "CAD",
              priceRange: service.price
            }))
          }}
          doorstepService={true}
          warranty="up to 6 months"
        />
        <LocalBusinessSchema />
        <link rel="canonical" href={`https://www.travelling-technicians.ca/services/${slug}`} />
      </Head>
      <Layout title={`${config.title} | The Travelling Technicians`}>
        {/* Hero Section */}
        <section className="pt-16 pb-20 bg-gradient-to-br from-primary-900 to-primary-800 text-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight">
                  {config.heroTitle}
                </h1>
                <p className="text-xl mb-8 text-primary-200">
                  {config.heroDescription}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={`/book-online?deviceType=${config.deviceType}`} className="inline-flex items-center justify-center bg-accent-500 hover:bg-accent-600 text-primary-900 font-semibold px-6 py-3 rounded-lg transition-colors text-center">
                    Book {deviceLabel} Repair
                  </Link>
                  <Link href="/pricing" className="inline-flex items-center justify-center border border-white/30 text-white hover:bg-white/10 font-medium px-6 py-3 rounded-lg transition-colors text-center">
                    View Pricing
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="relative h-[450px] w-full rounded-lg overflow-hidden shadow-custom-lg">
                  <OptimizedImage
                    src={config.image}
                    alt={config.imageAlt}
                    fill
                    className="object-cover object-center"
                    isCritical={true}
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-custom-lg">
                  <div className="text-center">
                    <p className="font-bold text-2xl text-primary-800">{config.repairTime}</p>
                    <p className="text-sm text-primary-500">Most repairs completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Services — Detailed Cards */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary-900">
                Our {deviceLabel} Repair Services
              </h2>
              <p className="text-xl text-primary-500 max-w-3xl mx-auto">
                Professional {config.deviceType} repair services brought directly to your doorstep by our certified technicians.
              </p>
            </div>

            <div className="space-y-8 max-w-4xl mx-auto">
              {services.map((service) => {
                const includes = SERVICE_INCLUDES[service.name] || [];

                return (
                  <div key={service.id} className="bg-white rounded-xl p-8 shadow-sm border border-primary-100 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-800">
                          {service.name.toLowerCase().includes('screen')
                            ? (config.deviceType === 'laptop' ? <Laptop className="h-10 w-10" /> : <Smartphone className="h-10 w-10" />)
                            : <BatteryFull className="h-10 w-10" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-2xl font-bold text-primary-900">{service.name}</h3>
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                            Doorstep Service
                          </span>
                        </div>
                        <p className="text-primary-600 mb-4 text-lg">{service.description}</p>

                        {includes.length > 0 && (
                          <div className="mb-5">
                            <p className="font-semibold text-primary-800 mb-2">What&apos;s included:</p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {includes.map((item, i) => (
                                <li key={i} className="flex items-center text-primary-600">
                                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="font-bold text-2xl text-primary-800">{service.price}</span>
                          <Link
                            href={`/book-online?deviceType=${config.deviceType}`}
                            className="bg-accent-500 hover:bg-accent-600 text-primary-900 font-semibold py-2.5 px-6 rounded-lg transition-colors"
                          >
                            Book This Service
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Customer Testimonials */}
        {testimonials.length > 0 && (
          <section className="py-16 bg-primary-50">
            <div className="container-custom">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary-900">
                  What Our Customers Say
                </h2>
                <p className="text-xl text-primary-500 max-w-3xl mx-auto">
                  Real reviews from {config.deviceType} repair customers across the Lower Mainland.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-primary-100">
                    <div className="flex items-center mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < testimonial.rating ? 'text-accent-500 fill-accent-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <p className="text-primary-600 mb-4 text-sm leading-relaxed line-clamp-4">
                      &ldquo;{testimonial.review}&rdquo;
                    </p>
                    <div className="border-t border-primary-100 pt-3">
                      <p className="font-semibold text-primary-900">{testimonial.customer_name}</p>
                      <p className="text-sm text-primary-500">
                        {testimonial.device_model} &middot; {testimonial.city}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-8">
                <GoogleReviewBadge />
              </div>
            </div>
          </section>
        )}

        {/* Popular Repairs by City */}
        {popularRepairsByCity.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container-custom">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary-900">
                  Popular {deviceLabel} Repairs by City
                </h2>
                <p className="text-xl text-primary-500 max-w-3xl mx-auto">
                  Find {config.deviceType} repair services near you. We serve the entire Lower Mainland.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {popularRepairsByCity.map((city) => (
                  <div key={city.citySlug} className="bg-primary-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-5 w-5 text-primary-700" />
                      <Link
                        href={`/repair/${city.citySlug}`}
                        className="text-xl font-bold text-primary-900 hover:text-primary-700 transition-colors"
                      >
                        {city.cityName}
                      </Link>
                    </div>
                    <ul className="space-y-3">
                      {city.models.map((model, i) => (
                        <li key={i}>
                          <span className="text-sm font-medium text-primary-800">
                            {model.name}
                          </span>
                          <span className="text-primary-400 text-xs ml-1">({model.brand})</span>
                          <div className="flex flex-wrap gap-x-2 mt-0.5">
                            {model.services.map((svc, j) => (
                              <span key={svc.slug}>
                                <Link
                                  href={`/repair/${city.citySlug}/${svc.slug}/${model.slug}`}
                                  className="text-primary-500 hover:text-primary-800 hover:underline transition-colors text-xs"
                                >
                                  {svc.name}
                                </Link>
                                {j < model.services.length - 1 && <span className="text-primary-300 ml-2">&middot;</span>}
                              </span>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/repair/${city.citySlug}`}
                      className="inline-block mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700"
                    >
                      All {city.cityName} repairs →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Brands We Service */}
        <section className="py-16 bg-primary-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary-900">Brands We Service</h2>
              <p className="text-xl text-primary-500 max-w-3xl mx-auto">
                {config.brandsDescription}
              </p>
            </div>

            {brandsWithModels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {brandsWithModels.map((brand) => (
                  <div key={brand.name} className="bg-white rounded-xl p-6 shadow-sm border border-primary-100">
                    <h3 className="text-xl font-bold text-primary-900 mb-4">
                      <Link href={`/repair/${brand.slug}-devices`} className="hover:text-primary-700 transition-colors">
                        {brand.name} →
                      </Link>
                    </h3>
                    <ul className="space-y-3">
                      {brand.models.map((model, i) => (
                        <li key={i}>
                          {model.hasLandingPage ? (
                            <Link
                              href={`/models/${model.slug}`}
                              className="text-sm font-medium text-primary-800 hover:text-primary-600 hover:underline transition-colors"
                            >
                              {model.name} →
                            </Link>
                          ) : (
                            <>
                              <span className="text-sm font-medium text-primary-800">{model.name}</span>
                              <div className="flex flex-wrap gap-x-2 mt-0.5">
                                {model.services.map((svc, j) => (
                                  <span key={svc.slug}>
                                    <Link
                                      href={`/repair/vancouver/${svc.slug}/${model.slug}`}
                                      className="text-primary-500 hover:text-primary-800 hover:underline transition-colors text-xs"
                                    >
                                      {svc.name}
                                    </Link>
                                    {j < model.services.length - 1 && <span className="text-primary-300 ml-2">&middot;</span>}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {brands.map((brand, index) => {
                  const brandSlug = brand.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <Link key={index} href={`/repair/${brandSlug}-devices`} className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow block">
                      <p className="font-medium text-primary-700">{brand}</p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-primary-900">{config.whyTitle}</h2>
              <p className="text-xl text-primary-500 max-w-3xl mx-auto">
                {config.whyDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-center p-6 border border-primary-100">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-primary-800" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary-900">Time-Saving Convenience</h3>
                <p className="text-primary-500">No need to leave your home or office. We come to you at a time that works for your schedule.</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-center p-6 border border-primary-100">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary-800" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary-900">Quality Guaranteed</h3>
                <p className="text-primary-500">We use only premium parts and provide a 90-day warranty on all our {config.deviceType} repairs.</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-center p-6 border border-primary-100">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary-800" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary-900">Fast Service</h3>
                <p className="text-primary-500">Most {config.deviceType} repairs are completed within {config.repairTime}, minimizing your device downtime.</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-center p-6 border border-primary-100">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary-800" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary-900">Certified Technicians</h3>
                <p className="text-primary-500">Our repair specialists are fully certified and experienced with all major {config.deviceType} brands.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 bg-primary-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-primary-900">{config.processTitle}</h2>
              <p className="text-xl text-primary-500 max-w-3xl mx-auto">
                {config.processDescription}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {config.processSteps.map((step, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 text-center border border-primary-100">
                  <div className="relative">
                    <div className="rounded-full bg-primary-800 w-12 h-12 flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                      {index + 1}
                    </div>
                    {index < config.processSteps.length - 1 && (
                      <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-primary-100"></div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-primary-900">{step.title}</h3>
                  <p className="text-primary-500">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Internal Linking Footer */}
        <InternalLinkingFooter currentService={slug} />

        {/* CTA Section */}
        <section className="py-16 bg-primary-900 text-white">
          <div className="container-custom">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Ready to Fix Your {deviceLabel}?</h2>
              <p className="text-xl mb-8 max-w-3xl mx-auto text-primary-200">
                Book our doorstep {config.deviceType} repair service and have your {config.deviceType === 'laptop' ? 'computer' : config.deviceType} fixed without the hassle of going to a repair shop.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href={`/book-online?deviceType=${config.deviceType}`} className="inline-flex items-center justify-center bg-accent-500 hover:bg-accent-600 text-primary-900 font-semibold px-6 py-3 rounded-lg transition-colors text-center">
                  Book Your Repair
                </Link>
                <Link href="/contact" className="inline-flex items-center justify-center border border-white/30 text-white hover:bg-white/10 font-medium px-6 py-3 rounded-lg transition-colors text-center">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const activeSlugs = await getAllActiveServiceSlugs();
    const paths = activeSlugs.map(({ slug }) => ({
      params: { slug },
    }));

    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error fetching active service slugs:', error);

    const fallbackPaths = [
      { params: { slug: 'laptop-repair' } },
      { params: { slug: 'mobile-repair' } },
      { params: { slug: 'tablet-repair' } },
    ];

    return {
      paths: fallbackPaths,
      fallback: 'blocking',
    };
  }
};

// Top 6 cities for the popular repairs section
const TOP_CITIES = [
  { slug: 'vancouver', name: 'Vancouver' },
  { slug: 'surrey', name: 'Surrey' },
  { slug: 'burnaby', name: 'Burnaby' },
  { slug: 'richmond', name: 'Richmond' },
  { slug: 'coquitlam', name: 'Coquitlam' },
  { slug: 'north-vancouver', name: 'North Vancouver' },
];

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as ServiceSlug;

  if (!slug || !serviceConfig[slug]) {
    return { notFound: true };
  }

  const config = serviceConfig[slug];

  const deviceTypeStringMap: Record<string, 'laptop' | 'mobile' | 'tablet'> = {
    'laptop-repair': 'laptop',
    'mobile-repair': 'mobile',
    'tablet-repair': 'tablet',
  };

  const deviceTypeString = deviceTypeStringMap[slug];

  // Map device type to testimonial device_type (capitalized in DB)
  const testimonialDeviceType = deviceTypeString === 'mobile' ? 'Mobile' : deviceTypeString === 'laptop' ? 'Laptop' : 'Tablet';

  // Service slugs for this device type
  const serviceSlugPatterns = deviceTypeString === 'mobile'
    ? ['screen-replacement-mobile', 'battery-replacement-mobile']
    : deviceTypeString === 'laptop'
    ? ['screen-replacement-laptop', 'battery-replacement-laptop']
    : ['screen-replacement-tablet', 'battery-replacement-tablet'];

  try {
    const supabase = getServiceSupabase();

    // Fetch services, brands, testimonials, and popular routes in parallel
    const [services, brands, testimonialsResult, routesResult] = await Promise.all([
      getServicesByDeviceType(deviceTypeString),
      getBrandsByDeviceType(deviceTypeString),

      // Service-specific testimonials
      supabase
        .from('testimonials')
        .select('customer_name, city, device_model, rating, review, service, device_type')
        .eq('status', 'approved')
        .eq('device_type', testimonialDeviceType)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false })
        .limit(6),

      // Popular model-service routes for internal linking (for top 6 cities)
      supabase
        .from('dynamic_routes')
        .select('slug_path, payload')
        .eq('route_type', 'model-service-page')
        .eq('is_active', true)
        .or(TOP_CITIES.map(c => `slug_path.like.repair/${c.slug}/%`).join(','))
        .limit(2000),
    ]);

    const testimonials: Testimonial[] = (testimonialsResult.data || []).map((t: Record<string, unknown>) => ({
      customer_name: t.customer_name as string,
      city: t.city as string,
      device_model: t.device_model as string,
      rating: t.rating as number,
      review: t.review as string,
      service: t.service as string,
    }));

    // Build service slug → display name map
    const serviceSlugToName: Record<string, string> = {};
    for (const s of services) {
      // Map service slugs to display names (e.g., 'screen-replacement-laptop' → 'Screen Replacement')
      for (const pattern of serviceSlugPatterns) {
        if (pattern.startsWith(s.name.toLowerCase().replace(/\s+/g, '-').split('-').slice(0, 2).join('-'))) {
          serviceSlugToName[pattern] = s.name;
        }
      }
    }
    // Fallback: build from slug patterns directly if map is incomplete
    for (const pattern of serviceSlugPatterns) {
      if (!serviceSlugToName[pattern]) {
        serviceSlugToName[pattern] = pattern
          .replace(/-(?:mobile|laptop|tablet)$/, '')
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }
    }

    // Process routes into popular repairs by city
    // Filter to only routes matching this device type's service slugs
    const serviceSlugSet = new Set(serviceSlugPatterns);
    // Intermediate: collect all routes per city, keyed by model slug
    const routesByCity = new Map<string, Map<string, { name: string; slug: string; brand: string; brandSlug: string; services: { name: string; slug: string }[] }>>();

    for (const route of (routesResult.data || [])) {
      const payload = route.payload as Record<string, Record<string, string>> | null;
      if (!payload) continue;

      const serviceSlug = payload.service?.slug;
      if (!serviceSlug || !serviceSlugSet.has(serviceSlug)) continue;

      const citySlug = payload.city?.slug;
      const cityInfo = TOP_CITIES.find(c => c.slug === citySlug);
      if (!cityInfo) continue;

      const modelName = payload.model?.name;
      const modelSlug = payload.model?.slug;
      const brandName = payload.brand?.name;
      const brandSlug = payload.brand?.slug || brandName?.toLowerCase().replace(/\s+/g, '-') || '';

      if (!modelName || !modelSlug || !brandName) continue;

      if (!routesByCity.has(citySlug)) {
        routesByCity.set(citySlug, new Map());
      }
      const cityModels = routesByCity.get(citySlug)!;
      if (!cityModels.has(modelSlug)) {
        cityModels.set(modelSlug, { name: modelName, slug: modelSlug, brand: brandName, brandSlug, services: [] });
      }
      const existing = cityModels.get(modelSlug)!;
      // Avoid duplicate services for the same model
      if (!existing.services.some(s => s.slug === serviceSlug)) {
        existing.services.push({ name: serviceSlugToName[serviceSlug] || 'Repair', slug: serviceSlug });
      }
    }

    // Priority keywords — specific model identifiers first, then generic
    // findIndex returns the first match, so more-specific keywords must come before
    // generic ones (e.g. 'm4 max' before 'm4', '16 pro max' before '16')
    const priorityKeywords = [
      // Phone models (iPhone, Galaxy, Pixel) — specific first
      '16 pro max', '25 ultra', '16 pro', '9 pro xl',
      '15 pro max', 's25', '15 pro', 's24 ultra', '9 pro',
      // Laptop models (MacBook chip generations, newest first)
      // Must come before generic '16'/'15' which also match MacBook Pro 16/15
      'm4 max', 'm4 pro', 'm4', 'm3 max', 'm3 pro', 'm3', 'm2', 'm1',
      // Generic model numbers (phones + laptops share these)
      '16', '15', 's24', '14 pro max', '8 pro',
      '14 pro', 's23 ultra', '14', '8',
      'pro max', 'ultra', 'pro', 'plus',
    ];

    // Pick top 3 brand-diverse models per city
    const popularRepairsByCity: CityRepairs[] = TOP_CITIES
      .filter(city => routesByCity.has(city.slug))
      .map(city => {
        const cityModels = routesByCity.get(city.slug)!;
        const allModels = Array.from(cityModels.values());

        const picked: typeof allModels = [];
        const usedBrands = new Set<string>();

        const sorted = [...allModels].sort((a, b) => {
          const aScore = priorityKeywords.findIndex(kw => a.name.toLowerCase().includes(kw));
          const bScore = priorityKeywords.findIndex(kw => b.name.toLowerCase().includes(kw));
          return (aScore === -1 ? 999 : aScore) - (bScore === -1 ? 999 : bScore);
        });

        // Pick brand-diverse: one from each brand first
        for (const model of sorted) {
          if (picked.length >= 3) break;
          if (!usedBrands.has(model.brand)) {
            usedBrands.add(model.brand);
            picked.push(model);
          }
        }

        // Fill remaining slots
        for (const model of sorted) {
          if (picked.length >= 3) break;
          if (!picked.includes(model)) {
            picked.push(model);
          }
        }

        return {
          cityName: city.name,
          citySlug: city.slug,
          models: picked.map(m => ({
            name: m.name,
            slug: m.slug,
            brand: m.brand,
            services: m.services,
          })),
        };
      });

    // Build brands with popular models (for Vancouver, the biggest city)
    const vancouverCityModels = routesByCity.get('vancouver');
    const vancouverModels = vancouverCityModels ? Array.from(vancouverCityModels.values()) : [];

    const brandModelMap = new Map<string, typeof vancouverModels>();
    for (const model of vancouverModels) {
      if (!brandModelMap.has(model.brand)) {
        brandModelMap.set(model.brand, []);
      }
      brandModelMap.get(model.brand)!.push(model);
    }

    const brandsWithModels: BrandWithModels[] = brands.slice(0, 3).map(brandName => {
      const models = brandModelMap.get(brandName) || [];
      const sorted = [...models].sort((a, b) => {
        const aScore = priorityKeywords.findIndex(kw => a.name.toLowerCase().includes(kw));
        const bScore = priorityKeywords.findIndex(kw => b.name.toLowerCase().includes(kw));
        return (aScore === -1 ? 999 : aScore) - (bScore === -1 ? 999 : bScore);
      });
      // Get brand slug from first model's data, or derive from name
      const brandSlug = sorted[0]?.brandSlug || brandName.toLowerCase().replace(/\s+/g, '-');
      return {
        name: brandName,
        slug: brandSlug,
        models: sorted.slice(0, 4).map(m => ({
          name: m.name,
          slug: m.slug,
          hasLandingPage: hasModelPage(m.slug),
          services: m.services,
        })),
      };
    }).filter(b => b.models.length > 0);

    return {
      props: {
        slug,
        services,
        brands,
        config,
        testimonials,
        popularRepairsByCity,
        brandsWithModels,
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error(`Error fetching data for ${slug}:`, error);

    const fallbackServices = config.fallbackServices || [];
    const fallbackBrands = config.fallbackBrands || [];

    return {
      props: {
        slug,
        services: fallbackServices,
        brands: fallbackBrands,
        config,
        testimonials: [],
        popularRepairsByCity: [],
        brandsWithModels: [],
      },
      revalidate: 60,
    };
  }
};
