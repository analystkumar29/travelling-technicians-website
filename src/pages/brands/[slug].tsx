import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';
import {
  Star, Shield, Zap, Award, Clock, MapPin, Wrench
} from 'lucide-react';
import { LocalBusinessSchema } from '@/components/seo/StructuredData';
import { getAllActiveBrandSlugs, getBrandWithModels, hasModelPage } from '@/lib/data-service';
import InternalLinkingFooter from '@/components/seo/InternalLinkingFooter';
import GoogleReviewBadge from '@/components/common/GoogleReviewBadge';
import { GetStaticProps, GetStaticPaths } from 'next';

interface BrandService {
  name: string;
  slug: string;
  routePath: string;
}

interface BrandModel {
  name: string;
  slug: string;
  services: BrandService[];
}

interface DeviceTypeGroup {
  deviceType: string;
  models: BrandModel[];
}

interface BrandTestimonial {
  customer_name: string;
  city: string;
  device_model: string;
  rating: number;
  review: string;
}

interface BrandPageProps {
  brand: { name: string; displayName: string; slug: string };
  deviceTypeGroups: DeviceTypeGroup[];
  testimonials: BrandTestimonial[];
}

const TOP_CITIES = [
  { slug: 'vancouver', name: 'Vancouver' },
  { slug: 'surrey', name: 'Surrey' },
  { slug: 'burnaby', name: 'Burnaby' },
  { slug: 'richmond', name: 'Richmond' },
  { slug: 'coquitlam', name: 'Coquitlam' },
  { slug: 'north-vancouver', name: 'North Vancouver' },
];

// Friendly labels for service slugs
function serviceDisplayName(slug: string): string {
  if (slug.includes('screen-replacement')) return 'Screen';
  if (slug.includes('battery-replacement')) return 'Battery';
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function BrandPage({ brand, deviceTypeGroups, testimonials }: BrandPageProps) {
  const totalModels = deviceTypeGroups.reduce((sum, g) => sum + g.models.length, 0);
  const siteUrl = 'https://www.travelling-technicians.ca';

  const canonicalPath = `/repair/${brand.slug}-devices`;

  // BreadcrumbList JSON-LD
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: `${brand.displayName} Device Repair`, item: `${siteUrl}${canonicalPath}` },
    ]
  };

  // ItemList JSON-LD for models
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Independent ${brand.displayName} Device Repair Services`,
    numberOfItems: totalModels,
    itemListElement: deviceTypeGroups.flatMap(g =>
      g.models.map((model, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `${model.name} Repair`,
        url: model.services[0]?.routePath ? `${siteUrl}${model.services[0].routePath}` : undefined
      }))
    )
  };

  return (
    <>
      <Head>
        <title>Independent {brand.displayName} Device Repair | The Travelling Technicians</title>
        <meta name="description" content={`Independent ${brand.displayName} device repair at your doorstep. Screen replacement, battery replacement, and more for ${totalModels}+ ${brand.displayName} models across Vancouver and the Lower Mainland.`} />
        <link rel="canonical" href={`${siteUrl}${canonicalPath}`} />
        <meta property="og:title" content={`Independent ${brand.displayName} Device Repair | The Travelling Technicians`} />
        <meta property="og:description" content={`Independent doorstep ${brand.displayName} device repair for ${totalModels}+ models. Fast, certified service across the Lower Mainland.`} />
        <meta property="og:url" content={`${siteUrl}${canonicalPath}`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
        <LocalBusinessSchema />
      </Head>
      <Layout title={`Independent ${brand.displayName} Device Repair`}>
        {/* Hero */}
        <section className="pt-16 pb-20 bg-gradient-to-br from-primary-900 to-primary-800 text-white">
          <div className="container-custom">
            <div className="max-w-3xl">
              <p className="text-sm text-primary-300 mb-4 border border-primary-600 rounded-lg px-4 py-2 inline-block">
                The Travelling Technicians is an independent, third-party repair service. We are not an authorized service provider for {brand.displayName}. All brand names and trademarks are the property of their respective owners.
              </p>
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight">
                Independent {brand.displayName} Device Repair at Your Doorstep
              </h1>
              <p className="text-xl mb-8 text-primary-200">
                Professional independent repair services for {totalModels}+ {brand.displayName} models. Screen replacements, battery swaps, and more — all done at your location across the Lower Mainland.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/book-online"
                  className="inline-flex items-center justify-center bg-accent-500 hover:bg-accent-600 text-primary-900 font-semibold px-6 py-3 rounded-lg transition-colors text-center"
                >
                  Book Your Repair
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center border border-white/30 text-white hover:bg-white/10 font-medium px-6 py-3 rounded-lg transition-colors text-center"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Models by Device Type */}
        {deviceTypeGroups.map((group) => (
          <section key={group.deviceType} className="py-16 bg-white even:bg-primary-50">
            <div className="container-custom">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary-900">
                  {brand.displayName} {group.deviceType} Repairs
                </h2>
                <p className="text-xl text-primary-500 max-w-3xl mx-auto">
                  {group.models.length} {brand.displayName} {group.deviceType.toLowerCase()} models available for doorstep repair.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {group.models.map((model) => (
                  <div key={model.slug} className="bg-white rounded-xl p-6 shadow-sm border border-primary-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 flex-shrink-0">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold text-primary-900">
                        {hasModelPage(model.slug) ? (
                          <Link href={`/models/${model.slug}`} className="hover:text-primary-700 transition-colors">
                            {model.name}
                          </Link>
                        ) : model.name}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {model.services.map((service) => (
                        <Link
                          key={service.slug}
                          href={service.routePath}
                          className="inline-flex items-center bg-primary-100 text-primary-700 hover:bg-accent-100 hover:text-accent-700 text-sm px-3 py-1.5 rounded-full transition-colors"
                        >
                          {serviceDisplayName(service.slug)}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Service Areas */}
        <section className="py-16 bg-primary-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary-900">
                {brand.displayName} Repair Across the Lower Mainland
              </h2>
              <p className="text-xl text-primary-500 max-w-3xl mx-auto">
                We bring {brand.displayName} repair services directly to your doorstep in these cities and more.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
              {TOP_CITIES.map((city) => (
                <Link
                  key={city.slug}
                  href={`/repair/${city.slug}`}
                  className="flex items-center justify-center gap-2 bg-white rounded-xl p-4 shadow-sm border border-primary-100 hover:shadow-md hover:border-accent-300 transition-all text-center"
                >
                  <MapPin className="h-4 w-4 text-primary-500 flex-shrink-0" />
                  <span className="font-medium text-primary-700 text-sm">{city.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container-custom">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary-900">
                  What {brand.displayName} Owners Say
                </h2>
                <p className="text-xl text-primary-500 max-w-3xl mx-auto">
                  Real reviews from {brand.displayName} repair customers across the Lower Mainland.
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

        {/* Why Choose Us */}
        <section className="py-16 bg-primary-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-primary-900">
                Why Choose Us for {brand.displayName} Device Repair
              </h2>
              <p className="text-xl text-primary-500 max-w-3xl mx-auto">
                We bring convenience, quality, and expertise directly to your doorstep.
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
                <p className="text-primary-500">We use only premium parts and provide a 90-day warranty on all {brand.displayName} repairs.</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-center p-6 border border-primary-100">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary-800" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary-900">Fast Service</h3>
                <p className="text-primary-500">Most {brand.displayName} repairs are completed in under 60 minutes, minimizing your device downtime.</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-center p-6 border border-primary-100">
                <div className="rounded-full bg-primary-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary-800" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-primary-900">Certified Technicians</h3>
                <p className="text-primary-500">Our repair specialists are fully certified and experienced with all {brand.displayName} devices.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal Linking Footer */}
        <InternalLinkingFooter />

        {/* CTA */}
        <section className="py-16 bg-primary-900 text-white">
          <div className="container-custom">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                Ready to Repair Your {brand.displayName}?
              </h2>
              <p className="text-xl mb-8 max-w-3xl mx-auto text-primary-200">
                Book our doorstep repair service and have your {brand.displayName} device fixed without the hassle of going to a repair shop.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/book-online"
                  className="inline-flex items-center justify-center bg-accent-500 hover:bg-accent-600 text-primary-900 font-semibold px-6 py-3 rounded-lg transition-colors text-center"
                >
                  Book Your Repair
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center border border-white/30 text-white hover:bg-white/10 font-medium px-6 py-3 rounded-lg transition-colors text-center"
                >
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
    const slugs = await getAllActiveBrandSlugs();
    return {
      paths: slugs.map(slug => ({ params: { slug } })),
      fallback: 'blocking',
    };
  } catch {
    return {
      paths: [
        { params: { slug: 'apple' } },
        { params: { slug: 'samsung' } },
        { params: { slug: 'google' } },
      ],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  if (!slug) {
    return { notFound: true };
  }

  const data = await getBrandWithModels(slug);

  if (!data || data.deviceTypeGroups.length === 0) {
    return { notFound: true };
  }

  return {
    props: {
      brand: data.brand,
      deviceTypeGroups: data.deviceTypeGroups,
      testimonials: data.testimonials,
    },
    revalidate: 3600,
  };
};
