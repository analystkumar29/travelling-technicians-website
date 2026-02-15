import { GetStaticProps, InferGetStaticPropsType } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import {
  Home,
  Wrench,
  MapPin,
  BookOpen,
  FileText,
  Shield,
  LayoutGrid,
  ExternalLink,
  Phone,
  Calendar,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { getServiceSupabase } from '@/utils/supabaseClient';
import { getActiveServiceNavItems } from '@/config/service-nav';

interface RouteCount {
  route_type: string;
  count: number;
}

interface ServiceItem {
  slug: string;
  name: string;
  device_type: string;
}

interface CityItem {
  slug: string;
  city_name: string;
}

interface SitemapProps {
  routeCounts: RouteCount[];
  totalRoutes: number;
  services: ServiceItem[];
  cities: CityItem[];
  neighborhoodCount: number;
}

export const getStaticProps: GetStaticProps<SitemapProps> = async () => {
  const supabase = getServiceSupabase();

  const [routeTypesRes, servicesRes, citiesRes, neighborhoodRes] = await Promise.all([
    supabase
      .from('dynamic_routes')
      .select('route_type')
      .eq('is_active', true),
    supabase
      .from('services')
      .select('slug, name')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('service_locations')
      .select('slug, city_name')
      .eq('is_active', true)
      .order('city_name'),
    supabase
      .from('neighborhood_pages')
      .select('id', { count: 'exact', head: true }),
  ]);

  // Aggregate route counts by type
  const routeCounts: RouteCount[] = [];
  if (routeTypesRes.data) {
    const counts: Record<string, number> = {};
    routeTypesRes.data.forEach((r: { route_type: string }) => {
      counts[r.route_type] = (counts[r.route_type] || 0) + 1;
    });
    Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([route_type, count]) => routeCounts.push({ route_type, count }));
  }

  const services: ServiceItem[] = (servicesRes.data || []).map((s: { slug: string; name: string }) => ({
    slug: s.slug,
    name: s.name,
    device_type: s.slug.includes('-laptop') ? 'Laptop' : 'Mobile',
  }));

  const cities: CityItem[] = citiesRes.data || [];
  const neighborhoodCount = neighborhoodRes.count || 0;
  const totalRoutes = routeCounts.reduce((sum, r) => sum + r.count, 0);

  return {
    props: {
      routeCounts,
      totalRoutes,
      services,
      cities,
      neighborhoodCount,
    },
    revalidate: 3600,
  };
};

const ROUTE_TYPE_LABELS: Record<string, string> = {
  'model-service-page': 'Model-Service Pages',
  'city-model-page': 'City-Model Pages',
  'neighborhood-page': 'Neighborhood Pages',
  'city-service-page': 'City-Service Pages',
  'city-page': 'City Landing Pages',
};

const SitemapPage = ({
  routeCounts,
  totalRoutes,
  services,
  cities,
  neighborhoodCount,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <Layout>
      <Head>
        <title>Website Sitemap | The Travelling Technicians</title>
        <meta
          name="description"
          content="Complete sitemap of The Travelling Technicians website. Find all our mobile and laptop repair services, service areas, booking information, and resources."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.travelling-technicians.ca/sitemap" />
      </Head>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Website Sitemap</h1>
            <p className="text-xl opacity-90">
              Complete navigation guide to all pages on The Travelling Technicians website
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center bg-white/20 px-4 py-2 rounded-lg">
                <LayoutGrid className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  Last Updated:{' '}
                  {new Date().toLocaleDateString('en-CA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <a
                href="/sitemap.xml"
                className="flex items-center bg-white text-primary-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View XML Sitemap (for search engines)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-12">
        <div className="max-w-6xl mx-auto">
          {/* Introduction */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-primary-900 mb-3">About This Sitemap</h2>
            <p className="text-primary-600 mb-4">
              This comprehensive sitemap provides easy access to every page on The Travelling
              Technicians website. Whether you&apos;re looking for specific repair services, booking
              information, or learning about our doorstep service areas across the Lower Mainland,
              you&apos;ll find it here.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-primary-800 font-bold text-lg mb-1">
                  {totalRoutes.toLocaleString()}+ Pages
                </div>
                <div className="text-primary-500 text-sm">Dynamic service pages indexed</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-primary-800 font-bold text-lg mb-1">
                  {cities.length} Cities
                </div>
                <div className="text-primary-500 text-sm">
                  Service areas across Lower Mainland
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-primary-800 font-bold text-lg mb-1">24/7 Updated</div>
                <div className="text-primary-500 text-sm">Automatically refreshed content</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Main Pages */}
            <div>
              {/* Main Navigation */}
              <SectionCard
                title="Main Navigation"
                icon={<Home className="w-6 h-6 text-primary-800" />}
                description="Essential pages for getting started"
              >
                <SitemapLink href="/" label="Home Page" />
                <SitemapLink href="/book-online" label="Book Online" />
                <SitemapLink href="/repair" label="Doorstep Repair" />
                <SitemapLink href="/pricing" label="Pricing & Quotes" />
                <SitemapLink href="/service-areas" label="Service Areas" />
                <SitemapLink href="/about" label="About Us" />
                <SitemapLink href="/contact" label="Contact Us" />
              </SectionCard>

              {/* Repair Services */}
              <SectionCard
                title="Repair Services"
                icon={<Wrench className="w-6 h-6 text-accent-500" />}
                description="Comprehensive repair services for all devices"
              >
                {getActiveServiceNavItems().map((item) => (
                  <SitemapLink key={item.slug} href={item.href} label={item.label} />
                ))}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-primary-700 mb-2">Common Services:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {services.map((service) => (
                      <ServiceTag
                        key={service.slug}
                        href={`/repair/vancouver/${service.slug}`}
                      >
                        {service.name} ({service.device_type})
                      </ServiceTag>
                    ))}
                  </div>
                </div>
              </SectionCard>

              {/* Information & Resources */}
              <SectionCard
                title="Information & Resources"
                icon={<FileText className="w-6 h-6 text-primary-600" />}
                description="Helpful resources and information"
              >
                <SitemapLink href="/faq" label="Frequently Asked Questions" />
                <SitemapLink href="/blog" label="Blog & Articles" />
              </SectionCard>
            </div>

            {/* Right Column - Dynamic Content */}
            <div>
              {/* Service Areas */}
              <SectionCard
                title="Service Areas"
                icon={<MapPin className="w-6 h-6 text-red-500" />}
                description="Cities we serve across Lower Mainland"
              >
                <div className="grid grid-cols-2 gap-3">
                  {cities.map((city) => (
                    <CityLink key={city.slug} href={`/repair/${city.slug}`}>
                      {city.city_name}
                    </CityLink>
                  ))}
                  <CityLink href="/service-areas">All Service Areas</CityLink>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-primary-700 mb-2">
                    Neighborhood Services:
                  </h4>
                  <p className="text-sm text-primary-500 mb-2">
                    We serve {neighborhoodCount} specific neighborhoods within each city. Visit
                    our service areas page for detailed neighborhood coverage.
                  </p>
                  <a
                    href="/service-areas"
                    className="text-accent-500 hover:text-accent-600 text-sm font-medium inline-flex items-center"
                  >
                    Explore Service Areas <ExternalLink className="ml-1 w-3 h-3" />
                  </a>
                </div>
              </SectionCard>

              {/* Blog & Articles */}
              <SectionCard
                title="Blog & Articles"
                icon={<BookOpen className="w-6 h-6 text-green-600" />}
                description="Latest repair tips and technology insights"
              >
                <SitemapLink href="/blog" label="All Blog Posts" />
                <SitemapLink
                  href="/blog/how-to-extend-your-laptop-battery-life"
                  label="Extend Laptop Battery Life"
                />
                <SitemapLink
                  href="/blog/signs-your-phone-needs-repair"
                  label="Signs Your Phone Needs Repair"
                />
                <SitemapLink
                  href="/blog/ultimate-guide-to-screen-protection"
                  label="Screen Protection Guide"
                />
                <SitemapLink
                  href="/blog/water-damage-first-aid-for-devices"
                  label="Water Damage First Aid"
                />
                <SitemapLink
                  href="/blog/category/mobile-repair-tips"
                  label="Mobile Repair Tips"
                />
                <SitemapLink
                  href="/blog/category/laptop-maintenance"
                  label="Laptop Maintenance"
                />
                <SitemapLink
                  href="/blog/category/device-protection"
                  label="Device Protection"
                />
              </SectionCard>

              {/* Legal & Administrative */}
              <SectionCard
                title="Legal & Administrative"
                icon={<Shield className="w-6 h-6 text-purple-500" />}
                description="Important legal documents and policies"
              >
                <SitemapLink href="/privacy-policy" label="Privacy Policy" />
                <SitemapLink href="/terms-conditions" label="Terms & Conditions" />
                <SitemapLink href="/sitemap.xml" label="XML Sitemap" external />
                <SitemapLink href="/robots.txt" label="Robots.txt" external />
              </SectionCard>
            </div>
          </div>

          {/* Dynamic Route Breakdown */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-primary-900 mb-2 flex items-center">
              <LayoutGrid className="w-5 h-5 mr-2" />
              Dynamic Content Pages
            </h3>
            <p className="text-primary-500 text-sm mb-4">
              Our website includes thousands of dynamically generated pages for specific device
              models, services, and locations. These are automatically included in our XML sitemap
              for search engines.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {routeCounts.map((rc) => (
                <div
                  key={rc.route_type}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <div className="text-primary-800 font-bold text-lg">
                    {rc.count.toLocaleString()}
                  </div>
                  <div className="text-primary-500 text-sm">
                    {ROUTE_TYPE_LABELS[rc.route_type] || rc.route_type}
                  </div>
                </div>
              ))}
              <div className="bg-primary-900 text-white p-4 rounded-lg">
                <div className="font-bold text-lg">{totalRoutes.toLocaleString()}</div>
                <div className="text-primary-200 text-sm">Total Dynamic Pages</div>
              </div>
            </div>
          </div>

          {/* SEO Note */}
          <div className="mt-8 bg-primary-900 text-white rounded-xl p-6">
            <h3 className="text-xl font-bold mb-3 flex items-center">
              <LayoutGrid className="w-5 h-5 mr-2" />
              SEO & Search Engine Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-accent-400 mb-2">For Search Engines:</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">&#10003;</span>
                    <span>XML sitemap automatically updated daily</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">&#10003;</span>
                    <span>Proper lastmod, changefreq, and priority tags</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">&#10003;</span>
                    <span>All pages follow SEO best practices</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">&#10003;</span>
                    <span>Structured data markup on all pages</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-accent-400 mb-2">For Website Visitors:</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-accent-400 mr-2">&#8250;</span>
                    <span>Easy navigation to all content</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent-400 mr-2">&#8250;</span>
                    <span>Find local repair services quickly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent-400 mr-2">&#8250;</span>
                    <span>Access device-specific repair information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent-400 mr-2">&#8250;</span>
                    <span>Learn from our repair tips and guides</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <p className="text-primary-500 mb-6">
              Can&apos;t find what you&apos;re looking for? Contact us directly for assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="btn-primary px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center"
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact Support
              </Link>
              <Link
                href="/book-online"
                className="btn-accent px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Repair Online
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Reusable Components
interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, description, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-start mb-4">
        <div className="mr-3">{icon}</div>
        <div>
          <h3 className="text-xl font-bold text-primary-900">{title}</h3>
          <p className="text-primary-500 text-sm mt-1">{description}</p>
        </div>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
};

interface SitemapLinkProps {
  href: string;
  label: string;
  external?: boolean;
}

const SitemapLink: React.FC<SitemapLinkProps> = ({ href, label, external }) => {
  if (external) {
    return (
      <a
        href={href}
        className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group border border-gray-100"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="text-primary-600 group-hover:text-primary-800 transition-colors">
          {label}
        </span>
        <ExternalLink className="ml-auto w-4 h-4 text-primary-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group border border-gray-100"
    >
      <span className="text-primary-600 group-hover:text-primary-800 transition-colors">
        {label}
      </span>
      <ExternalLink className="ml-auto w-4 h-4 text-primary-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
};

interface ServiceTagProps {
  href: string;
  children: React.ReactNode;
}

const ServiceTag: React.FC<ServiceTagProps> = ({ href, children }) => {
  return (
    <Link
      href={href}
      className="text-sm bg-gray-100 hover:bg-gray-200 text-primary-700 px-3 py-1.5 rounded-md transition-colors text-center"
    >
      {children}
    </Link>
  );
};

interface CityLinkProps {
  href: string;
  children: React.ReactNode;
}

const CityLink: React.FC<CityLinkProps> = ({ href, children }) => {
  return (
    <Link
      href={href}
      className="flex items-center justify-center p-3 bg-gray-50 hover:bg-primary-50 border border-gray-200 rounded-lg transition-colors group"
    >
      <MapPin className="w-4 h-4 text-red-400 mr-2" />
      <span className="text-primary-700 group-hover:text-primary-800 font-medium">
        {children}
      </span>
    </Link>
  );
};

export default SitemapPage;
