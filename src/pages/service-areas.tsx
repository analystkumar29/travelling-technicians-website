import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import { MapPin, CheckCircle, Clock, Building2, Home, Store, Star, ChevronRight, Wrench, MapPinned } from 'lucide-react';
import PostalCodeChecker from '@/components/PostalCodeChecker';
import InteractiveMap from '@/components/InteractiveMap';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { AnimatedCounter } from '@/components/motion/AnimatedCounter';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer';
import { FadeIn } from '@/components/motion/FadeIn';
import { HoverScale } from '@/components/motion/HoverScale';
import { FAQSchema } from '@/components/seo/StructuredData';
import { getServiceSupabase, getSiteUrl } from '@/utils/supabaseClient';
import { generateBreadcrumbSchema } from '@/utils/seoHelpers';
import { getBusinessSettingsForSSG } from '@/lib/business-settings';
import { useState } from 'react';

// ── Types ───────────────────────────────────────────────────────────
interface CityData {
  slug: string;
  city_name: string;
  latitude: number;
  longitude: number;
  neighborhood_count: number;
  testimonial_count: number;
  route_count: number;
  base_travel_fee: number;
  service_since: string;
  neighborhoods: string[];
}

interface ServiceAreasPageProps {
  cities: CityData[];
  totalRoutes: number;
  totalNeighborhoods: number;
  totalTestimonials: number;
  phone: string;
}

// ── City images map ─────────────────────────────────────────────────
const CITY_IMAGES: Record<string, string> = {
  vancouver: '/images/service-areas/vancouver-optimized.webp',
  burnaby: '/images/service-areas/burnaby-optimized.webp',
  richmond: '/images/service-areas/richmond-optimized.webp',
  'new-westminster': '/images/service-areas/new-westminster-optimized.webp',
  'north-vancouver': '/images/service-areas/north-vancouver-optimized.webp',
  'west-vancouver': '/images/service-areas/west-vancouver-optimized.webp',
  coquitlam: '/images/service-areas/coquitlam-optimized.webp',
  chilliwack: '/images/service-areas/chilliwack-optimized.webp',
};

// Fallback image for cities without dedicated photos
const FALLBACK_IMAGE = '/images/service-areas/vancouver-optimized.webp';

// ── Static fallback data ────────────────────────────────────────────
const FALLBACK_CITIES: CityData[] = [
  { slug: 'abbotsford', city_name: 'Abbotsford', latitude: 49.0504, longitude: -122.3045, neighborhood_count: 6, testimonial_count: 5, route_count: 377, base_travel_fee: 20, service_since: '2024-01-01', neighborhoods: ['Clearbrook', 'Historic Downtown', 'Mill Lake', 'Seven Oaks', 'South Abbotsford', 'Sumas Mountain'] },
  { slug: 'burnaby', city_name: 'Burnaby', latitude: 49.2488, longitude: -122.9805, neighborhood_count: 8, testimonial_count: 5, route_count: 379, base_travel_fee: 0, service_since: '2026-01-01', neighborhoods: ['Brentwood', 'Burnaby Heights', 'Deer Lake', 'Edmonds', 'Lougheed', 'Metrotown'] },
  { slug: 'chilliwack', city_name: 'Chilliwack', latitude: 49.1579, longitude: -121.9514, neighborhood_count: 6, testimonial_count: 5, route_count: 377, base_travel_fee: 25, service_since: '2024-01-01', neighborhoods: ['Cultus Lake', 'Downtown', 'Promontory', 'Rosedale', 'Sardis', 'Vedder Crossing'] },
  { slug: 'coquitlam', city_name: 'Coquitlam', latitude: 49.2838, longitude: -122.7932, neighborhood_count: 7, testimonial_count: 4, route_count: 378, base_travel_fee: 10, service_since: '2026-01-01', neighborhoods: ['Austin Heights', 'Burquitlam', 'Maillardville', 'Town Centre', 'Westwood Plateau'] },
  { slug: 'delta', city_name: 'Delta', latitude: 49.0847, longitude: -123.0586, neighborhood_count: 6, testimonial_count: 5, route_count: 377, base_travel_fee: 10, service_since: '2024-01-01', neighborhoods: ['Ladner', 'North Delta', 'South Delta', 'Tsawwassen'] },
  { slug: 'langley', city_name: 'Langley', latitude: 49.1044, longitude: -122.5828, neighborhood_count: 7, testimonial_count: 5, route_count: 378, base_travel_fee: 15, service_since: '2024-01-01', neighborhoods: ['Aldergrove', 'Brookswood', 'Fort Langley', 'Murrayville', 'Walnut Grove', 'Willoughby'] },
  { slug: 'new-westminster', city_name: 'New Westminster', latitude: 49.206, longitude: -122.911, neighborhood_count: 6, testimonial_count: 5, route_count: 377, base_travel_fee: 10, service_since: '2024-01-01', neighborhoods: ['Downtown', 'Quay District', "Queen's Park", 'Queensborough', 'Sapperton', 'Uptown'] },
  { slug: 'north-vancouver', city_name: 'North Vancouver', latitude: 49.32, longitude: -123.072, neighborhood_count: 9, testimonial_count: 4, route_count: 380, base_travel_fee: 15, service_since: '2026-01-01', neighborhoods: ['Deep Cove', 'Edgemont', 'Lonsdale', 'Lower Lonsdale', 'Lynn Valley', 'Seymour'] },
  { slug: 'richmond', city_name: 'Richmond', latitude: 49.1666, longitude: -123.1336, neighborhood_count: 7, testimonial_count: 5, route_count: 378, base_travel_fee: 10, service_since: '2026-01-01', neighborhoods: ['City Centre', 'Ironwood', 'Sea Island', 'Steveston', 'Terra Nova'] },
  { slug: 'squamish', city_name: 'Squamish', latitude: 49.7016, longitude: -123.1558, neighborhood_count: 6, testimonial_count: 5, route_count: 377, base_travel_fee: 30, service_since: '2024-01-01', neighborhoods: ['Brackendale', 'Britannia Beach', 'Downtown', 'Garibaldi Highlands', 'Valleycliffe'] },
  { slug: 'surrey', city_name: 'Surrey', latitude: 49.1913, longitude: -122.849, neighborhood_count: 11, testimonial_count: 5, route_count: 382, base_travel_fee: 0, service_since: '2026-01-01', neighborhoods: ['Cloverdale', 'Fleetwood', 'Guildford', 'Newton', 'South Surrey', 'Whalley'] },
  { slug: 'vancouver', city_name: 'Vancouver', latitude: 49.2827, longitude: -123.1207, neighborhood_count: 11, testimonial_count: 5, route_count: 382, base_travel_fee: 0, service_since: '2026-01-01', neighborhoods: ['Downtown', 'Kitsilano', 'Mount Pleasant', 'West End', 'Yaletown'] },
  { slug: 'west-vancouver', city_name: 'West Vancouver', latitude: 49.3667, longitude: -123.1667, neighborhood_count: 6, testimonial_count: 5, route_count: 377, base_travel_fee: 20, service_since: '2024-01-01', neighborhoods: ['Ambleside', 'British Properties', 'Caulfield', 'Dundarave', 'Horseshoe Bay'] },
];

// ── FAQ data ────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    question: 'What does "same-day service available" mean?',
    answer: 'In areas marked with same-day availability, we can often schedule a repair technician to visit your location on the same day you book, depending on technician availability. For the best chance of same-day service, we recommend booking before 11 AM.',
  },
  {
    question: "I don't see my location listed. Can you still help me?",
    answer: 'We may still be able to service your area even if it\'s not explicitly listed. Our coverage area extends from Squamish in the north to Chilliwack in the east. Please use our postal code checker or contact us directly to inquire about availability in your specific location.',
  },
  {
    question: 'Are there any extra fees for distant locations?',
    answer: 'For most areas within the Lower Mainland, there are no additional travel fees. However, for some distant locations or areas outside our main service region, a small travel fee may apply. This will be clearly communicated before you confirm your booking.',
  },
  {
    question: 'How do you determine arrival times?',
    answer: "When you book, we provide a 1-2 hour arrival window based on your location, current technician availability, and traffic conditions. You'll receive a notification when your technician is on the way, along with their estimated arrival time.",
  },
];

// ── Service types ───────────────────────────────────────────────────
const SERVICE_TYPES = [
  {
    id: 'residential',
    name: 'Residential',
    icon: Home,
    description: "We come to your home and complete repairs while you wait. Perfect for busy individuals who can't afford to be without their devices.",
  },
  {
    id: 'business',
    name: 'Business',
    icon: Building2,
    description: 'Minimize downtime with on-site repairs for your business devices. We can work with your IT department or handle repairs independently.',
  },
  {
    id: 'retail',
    name: 'Retail',
    icon: Store,
    description: 'Partner with us to offer repair services to your customers. We provide white-label repair services for retail locations.',
  },
];

// ── Page Component ──────────────────────────────────────────────────
export default function ServiceAreasPage({ cities, totalRoutes, totalNeighborhoods, totalTestimonials, phone }: ServiceAreasPageProps) {
  const siteUrl = getSiteUrl();
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Build map-compatible serviceAreas from DB data
  const mapAreas = cities.map((c) => ({
    id: c.slug,
    name: c.city_name,
    description: `Serving ${c.neighborhoods.slice(0, 4).join(', ')}${c.neighborhoods.length > 4 ? ', and more' : ''}.`,
    popular: c.base_travel_fee === 0,
    sameDay: c.base_travel_fee <= 15,
    coordinates: [c.latitude, c.longitude] as [number, number],
  }));

  // Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Service Areas', url: `${siteUrl}/service-areas` },
  ]);

  // Service schema with areaServed
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Mobile Device Repair Service',
    description: 'Professional mobile phone and laptop repair with doorstep service across the Greater Vancouver area and Lower Mainland, BC.',
    provider: {
      '@type': 'LocalBusiness',
      '@id': `${siteUrl}/#localbusiness`,
      name: 'The Travelling Technicians',
      telephone: phone,
    },
    serviceType: 'Electronics Repair',
    areaServed: cities.map((c) => ({
      '@type': 'City',
      name: `${c.city_name}, BC`,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: c.latitude,
        longitude: c.longitude,
      },
    })),
  };

  const cityNames = cities.map((c) => c.city_name).join(', ');

  return (
    <Layout>
      <Head>
        <title>Service Areas | Mobile &amp; Laptop Repair Across the Lower Mainland | The Travelling Technicians</title>
        <meta
          name="description"
          content={`Expert doorstep mobile and laptop repair in ${cities.length} cities across the Lower Mainland, BC: ${cityNames}. Same-day service available with up to 6-month warranty.`}
        />
        <meta
          name="keywords"
          content="mobile repair Vancouver, laptop repair Burnaby, doorstep repair Surrey, phone repair Richmond, device repair Lower Mainland, travelling technicians service areas"
        />
        <link rel="canonical" href={`${siteUrl}/service-areas`} />

        {/* Open Graph */}
        <meta property="og:title" content="Service Areas | The Travelling Technicians" />
        <meta
          property="og:description"
          content={`Doorstep device repair in ${cities.length} cities across the Greater Vancouver area. Same-day service available.`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/service-areas`} />
        <meta property="og:image" content={`${siteUrl}/images/logo/logo-orange-optimized.webp`} />
        <meta property="og:site_name" content="The Travelling Technicians" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Service Areas | The Travelling Technicians" />
        <meta
          name="twitter:description"
          content={`Mobile repair in ${cities.length} cities across the Lower Mainland. Same-day doorstep service.`}
        />

        {/* Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      </Head>

      {/* FAQ Schema rendered as component */}
      <FAQSchema faqs={FAQ_ITEMS} />

      {/* ── Section 1: Hero ────────────────────────────────────────── */}
      <section className="pt-16 pb-20 bg-gradient-to-br from-primary-900 to-primary-800 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                Expert Device Repair Across the Lower Mainland
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                Our mobile repair technicians bring professional service directly to your door — from Squamish in the north to Chilliwack in the east.
              </p>
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-accent-400">
                    <AnimatedCounter to={cities.length} suffix="" />
                  </div>
                  <div className="text-sm text-primary-200 mt-1">Cities Served</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-accent-400">
                    <AnimatedCounter to={totalRoutes} suffix="+" />
                  </div>
                  <div className="text-sm text-primary-200 mt-1">Repair Services</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-accent-400">
                    <AnimatedCounter to={totalNeighborhoods} suffix="+" />
                  </div>
                  <div className="text-sm text-primary-200 mt-1">Neighborhoods</div>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-primary-900 mb-2">Check Your Area</h2>
                <p className="text-gray-600 text-sm mb-4">Enter your postal code to see if we serve your location.</p>
                <PostalCodeChecker variant="compact" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Section 2: Interactive Map ─────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Our Coverage Map</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We serve {cities.length} communities across the Greater Vancouver area and Fraser Valley, from Squamish to Chilliwack.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="bg-primary-50 p-4 rounded-xl shadow-sm">
              <InteractiveMap height="500px" className="rounded-lg" serviceAreas={mapAreas} />
              <p className="mt-3 text-center text-sm text-gray-500">
                Click any marker to see service details for that area.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Section 3: City Cards Grid ─────────────────────────────── */}
      <section className="py-16 bg-primary-50">
        <div className="container-custom">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Communities We Serve</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our technicians provide doorstep repair services throughout {cities.length} communities. Click any location to explore available services.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
            {cities.map((city) => {
              const imageSrc = imgErrors[city.slug] ? FALLBACK_IMAGE : (CITY_IMAGES[city.slug] || FALLBACK_IMAGE);
              const isSameDay = city.base_travel_fee <= 15;

              return (
                <StaggerItem key={city.slug}>
                  <HoverScale>
                    <Link
                      href={`/repair/${city.slug}`}
                      className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
                    >
                      {/* Image with overlay */}
                      <div className="relative h-48 w-full">
                        <Image
                          src={imageSrc}
                          alt={`${city.city_name}, BC — device repair service area`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={() => setImgErrors((prev) => ({ ...prev, [city.slug]: true }))}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                          <div className="p-4 text-white w-full">
                            <h3 className="text-xl font-bold font-heading">{city.city_name}</h3>
                            {city.base_travel_fee === 0 && (
                              <span className="inline-block bg-accent-500 text-primary-900 text-xs font-semibold px-2 py-0.5 rounded-full mt-1">
                                No Travel Fee
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="p-4">
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPinned className="h-4 w-4 text-primary-600" />
                            {city.neighborhood_count} neighborhoods
                          </span>
                          <span className="flex items-center gap-1">
                            <Wrench className="h-4 w-4 text-primary-600" />
                            {city.route_count} services
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-accent-500" />
                            {city.testimonial_count} reviews
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {isSameDay ? (
                              <span className="text-sm text-green-600 font-medium">Same-day service</span>
                            ) : (
                              <span className="text-sm text-gray-500">Scheduled service</span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-primary-700 group-hover:text-primary-900 flex items-center gap-0.5 transition-colors">
                            Explore <ChevronRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </HoverScale>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Section 4: Service Types ───────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">We Come To You</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our technicians provide doorstep repair services to different types of locations across the Lower Mainland.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SERVICE_TYPES.map((type, i) => {
              const Icon = type.icon;
              return (
                <ScrollReveal key={type.id} delay={i * 0.15}>
                  <div className="card hover:shadow-custom-lg transition-shadow text-center h-full">
                    <div className="rounded-full bg-primary-100 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                      <Icon className="h-10 w-10 text-primary-700" />
                    </div>
                    <h3 className="text-xl font-bold font-heading mb-3">{type.name} Service</h3>
                    <p className="text-gray-600">{type.description}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 5: Coverage Promise ────────────────────────────── */}
      <section className="py-16 bg-primary-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">Our Service Area Promise</h2>
              <p className="text-gray-600 mb-6">
                No matter where you are in the Lower Mainland, we&apos;re committed to bringing expert repair services directly to your door with:
              </p>
              <div className="space-y-4">
                {[
                  { title: 'Transparent scheduling', desc: 'clear arrival windows and real-time updates' },
                  { title: 'Well-equipped technicians', desc: 'arriving with all necessary parts and tools' },
                  { title: 'Consistent quality', desc: 'the same exceptional service regardless of your location' },
                  { title: 'Strategic technician placement', desc: 'ensuring efficient response throughout the region' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="h-5 w-5 text-primary-700" />
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-700">
                        <span className="font-semibold">{item.title}</span> — {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2} className="order-1 lg:order-2">
              <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-custom">
                <Image
                  src="/images/services/doorstep-repair-tech-optimized.webp"
                  alt="Technician arriving at customer location for doorstep repair"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Section 6: FAQ ─────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Service Area FAQs</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Common questions about our service areas and availability.
              </p>
            </div>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto space-y-6">
            {FAQ_ITEMS.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-primary-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold font-heading mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 7: CTA ─────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-primary-900 to-primary-800 text-white">
        <div className="container-custom">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">Ready for Doorstep Device Repair?</h2>
              <p className="text-xl mb-8 max-w-3xl mx-auto text-primary-100">
                We bring expert repair service to your location across {cities.length} communities in the Lower Mainland.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/book-online" className="btn-accent text-center">
                  Book Your Repair
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors text-center"
                >
                  Contact Our Team
                </Link>
              </div>
              <p className="text-primary-200 mt-6 flex items-center justify-center gap-1.5">
                <MapPin className="h-4 w-4" /> Serving all major communities in the Greater Vancouver area
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
}

// ── Data Fetching ───────────────────────────────────────────────────
export const getStaticProps: GetStaticProps<ServiceAreasPageProps> = async () => {
  try {
    const serviceSupabase = getServiceSupabase();

    // Fetch cities and business settings in parallel
    const [citiesRes, businessSettings] = await Promise.all([
      serviceSupabase
        .from('service_locations')
        .select('id, slug, city_name, latitude, longitude, neighborhoods, base_travel_fee, service_since, local_phone, operating_hours')
        .eq('is_active', true)
        .order('city_name'),
      getBusinessSettingsForSSG(),
    ]);

    if (citiesRes.error || !citiesRes.data || citiesRes.data.length === 0) {
      console.error('Failed to fetch service_locations:', citiesRes.error);
      throw new Error('No cities found');
    }

    const cityRows = citiesRes.data;
    const cityIds = cityRows.map((c: any) => c.id);

    // Fetch neighborhood and testimonial data (small tables, safe default limit)
    const [nhRes, testRes] = await Promise.all([
      serviceSupabase.from('neighborhood_pages').select('city_id').in('city_id', cityIds),
      serviceSupabase.from('testimonials').select('city'),
    ]);

    // Per-city route counts using head:true count queries (avoids fetching ~5000 rows)
    const routeCountResults = await Promise.all(
      cityIds.map((cityId: string) =>
        serviceSupabase
          .from('dynamic_routes')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .eq('city_id', cityId)
          .then((res) => ({ cityId, count: res.count || 0 }))
      )
    );

    // Build neighborhood count map
    const nhCountMap: Record<string, number> = {};
    if (nhRes.data) {
      for (const row of nhRes.data) {
        nhCountMap[row.city_id] = (nhCountMap[row.city_id] || 0) + 1;
      }
    }

    // Build testimonial count map (testimonials uses city_name, not city_id)
    const testCountMap: Record<string, number> = {};
    if (testRes.data) {
      for (const row of testRes.data) {
        testCountMap[row.city] = (testCountMap[row.city] || 0) + 1;
      }
    }

    // Build route count map
    const routeCountMap: Record<string, number> = {};
    for (const { cityId, count } of routeCountResults) {
      routeCountMap[cityId] = count;
    }

    // Assemble city data
    const cities: CityData[] = cityRows.map((c: any) => ({
      slug: c.slug,
      city_name: c.city_name,
      latitude: parseFloat(c.latitude),
      longitude: parseFloat(c.longitude),
      neighborhood_count: nhCountMap[c.id] || (c.neighborhoods?.length || 0),
      testimonial_count: testCountMap[c.city_name] || 0,
      route_count: routeCountMap[c.id] || 0,
      base_travel_fee: parseFloat(c.base_travel_fee) || 0,
      service_since: c.service_since || '2024-01-01',
      neighborhoods: c.neighborhoods || [],
    }));

    const totalRoutes = Object.values(routeCountMap).reduce((a, b) => a + b, 0);
    const totalNeighborhoods = Object.values(nhCountMap).reduce((a, b) => a + b, 0);
    const totalTestimonials = Object.values(testCountMap).reduce((a, b) => a + b, 0);

    return {
      props: {
        cities,
        totalRoutes,
        totalNeighborhoods,
        totalTestimonials,
        phone: businessSettings.phone.display || '(604) 849-5329',
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error('getStaticProps error for service-areas:', error);

    // Static fallback
    const totalRoutes = FALLBACK_CITIES.reduce((a, c) => a + c.route_count, 0);
    const totalNeighborhoods = FALLBACK_CITIES.reduce((a, c) => a + c.neighborhood_count, 0);
    const totalTestimonials = FALLBACK_CITIES.reduce((a, c) => a + c.testimonial_count, 0);

    return {
      props: {
        cities: FALLBACK_CITIES,
        totalRoutes,
        totalNeighborhoods,
        totalTestimonials,
        phone: '(604) 849-5329',
      },
      revalidate: 3600,
    };
  }
};
