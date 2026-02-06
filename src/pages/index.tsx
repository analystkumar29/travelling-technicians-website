import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { MapPin, Star, ArrowRight, Phone, Shield, Clock, CheckCircle, Smartphone, Laptop, Wrench, ChevronRight } from 'lucide-react';
import PostalCodeChecker from '@/components/PostalCodeChecker';
import StickyBookingWidget from '@/components/common/StickyBookingWidget';
import { trackLocationEvent } from '@/utils/analytics';
import StructuredData, { LocalBusinessSchema, OrganizationSchema, ReviewSchema } from '@/components/seo/StructuredData';
import { TechnicianSchema } from '@/components/seo/TechnicianSchema';
import OptimizedImage from '@/components/common/OptimizedImage';
import { HomePagePreloads } from '@/components/common/PreloadHints';
import { getPricingData, getPopularServices, getTestimonials } from '@/lib/data-service';
import { getBusinessSettingsForSSG } from '@/lib/business-settings';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { AnimatedCounter } from '@/components/motion/AnimatedCounter';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer';

// Device brands
const deviceBrands = [
  { id: 'apple', name: 'Apple', image: '/images/brands/apple.svg' },
  { id: 'samsung', name: 'Samsung', image: '/images/brands/samsung.svg' },
  { id: 'google', name: 'Google', image: '/images/brands/google.svg' },
  { id: 'xiaomi', name: 'Xiaomi', image: '/images/brands/xiaomi.svg' },
  { id: 'oneplus', name: 'OnePlus', image: '/images/brands/oneplus.svg' },
  { id: 'huawei', name: 'Huawei', image: '/images/brands/huawei.svg' },
];

// Testimonials fallback
const staticTestimonials = [
  { id: 1, name: 'Sarah J.', location: 'Vancouver', rating: 5, comment: 'Excellent service! The technician came to my home and fixed my iPhone screen quickly. Very professional and convenient.', device: 'iPhone 13 Pro' },
  { id: 2, name: 'Michael C.', location: 'Burnaby', rating: 5, comment: 'Had my MacBook battery replaced at home. Professional service and saved me a trip to the mall. Highly recommend!', device: 'MacBook Pro 2019' },
  { id: 3, name: 'Jason T.', location: 'Richmond', rating: 4, comment: 'Great doorstep service for my Samsung. The price was fair and the repair was done perfectly.', device: 'Samsung Galaxy S22' },
  { id: 4, name: 'Anna W.', location: 'North Vancouver', rating: 5, comment: 'Amazing convenience! The technician was punctual and fixed my laptop keyboard issue in under an hour.', device: 'Dell XPS 13' },
];

const staticPricingData = {
  mobile: { range: '$79-$189', common: '$129', time: '30-45 min' },
  laptop: { range: '$99-$249', common: '$169', time: '45-90 min' },
  tablet: { range: '$89-$199', common: '$149', time: '30-60 min' },
};

const staticPopularServices = [
  { name: 'Screen Repair', price: 'From $89', icon: '📱' },
  { name: 'Battery Replace', price: 'From $79', icon: '🔋' },
  { name: 'Laptop Repair', price: 'From $99', icon: '💻' },
  { name: 'Charging Issues', price: 'From $69', icon: '⚡' },
];

interface HomePageProps {
  pricingData: typeof staticPricingData;
  testimonials: typeof staticTestimonials;
  popularServices: typeof staticPopularServices;
  businessPhone: string;
  businessPhoneHref: string;
}

export async function getStaticProps() {
  try {
    const [pricingData, testimonials, popularServices, businessSettings] = await Promise.all([
      getPricingData(),
      getTestimonials(),
      getPopularServices(),
      getBusinessSettingsForSSG(),
    ]);

    return {
      props: {
        pricingData,
        testimonials,
        popularServices,
        businessPhone: businessSettings.phone.display,
        businessPhoneHref: businessSettings.phone.href,
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Error in getStaticProps, using static fallback:', error);
    return {
      props: {
        pricingData: staticPricingData,
        testimonials: staticTestimonials,
        popularServices: staticPopularServices,
        businessPhone: '(604) 849-5329',
        businessPhoneHref: 'tel:+16048495329',
      },
      revalidate: 3600,
    };
  }
}

export default function Home({
  pricingData = staticPricingData,
  testimonials = staticTestimonials,
  popularServices = staticPopularServices,
  businessPhone = '(604) 849-5329',
  businessPhoneHref = 'tel:+16048495329',
}: HomePageProps) {
  const [showFAB, setShowFAB] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Smart FAB scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setShowFAB(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setShowFAB(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.classList.remove('loading-navigation');
      document.body.classList.remove('navigation-stuck');
    }
  }, []);

  return (
    <>
      <Head>
        <title>The Travelling Technicians | Mobile &amp; Laptop Repair Vancouver BC</title>
        <meta name="description" content="Expert mobile phone and laptop repair with convenient doorstep service across Vancouver, Burnaby, Surrey, Richmond, and Lower Mainland. Same-day service with up to 6-month warranty." />
        <link rel="canonical" href="https://www.travelling-technicians.ca/" />
        <HomePagePreloads />
        <LocalBusinessSchema telephone={businessPhoneHref} />
        <OrganizationSchema telephone={businessPhoneHref} />
        <ReviewSchema
          reviews={testimonials.map((t) => ({
            author: t.name,
            rating: t.rating,
            reviewBody: t.comment,
            location: t.location,
            datePublished: '2024-01-01',
          }))}
          aggregateRating={{ ratingValue: 4.8, reviewCount: testimonials.length, bestRating: 5, worstRating: 1 }}
        />
        <TechnicianSchema
          includeAggregate={true}
          aggregateData={{ totalTechnicians: 4, averageExperience: 7.25, totalCertifications: 11 }}
        />
      </Head>
      <Layout>
        {/* Desktop Sticky Booking Widget */}
        <StickyBookingWidget businessPhone={businessPhone} businessPhoneHref={businessPhoneHref} />

        {/* Mobile FAB */}
        <div className={`fixed bottom-0 left-0 right-0 md:hidden z-50 transition-transform duration-300 ${showFAB ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="bg-primary-900 text-white p-4 shadow-2xl">
            <div className="flex items-center justify-between max-w-sm mx-auto">
              <div className="flex-1">
                <div className="font-semibold text-base flex items-center gap-2">
                  <Phone className="h-4 w-4 text-accent-400" />
                  Need a Repair?
                </div>
                <div className="text-xs text-primary-300">Same-day service available</div>
              </div>
              <Link
                href="/book-online"
                className="bg-accent-500 text-primary-900 px-5 py-3 rounded-lg font-bold text-sm hover:bg-accent-600 transition-colors ml-3 flex-shrink-0"
              >
                Book Now
              </Link>
            </div>
          </div>
          <div className="bg-primary-950 h-safe-area-inset-bottom" />
        </div>

        {/* === HERO SECTION === */}
        <section className="pt-8 pb-12 md:pt-16 md:pb-20 bg-gradient-to-b from-primary-50 to-white">
          <div className="container-custom px-4 sm:px-6">
            <div className="pb-12 md:pb-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-heading font-extrabold text-primary-900 leading-[1.15] tracking-tight">
                    Expert Device Repair,
                    <span className="block text-accent-600">Delivered to Your Door.</span>
                  </h1>

                  <p className="text-lg md:text-xl text-primary-600 leading-relaxed max-w-lg">
                    Professional screen, battery, and hardware repair across Vancouver&apos;s Lower Mainland. 90-day warranty on every repair.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/book-online"
                      className="bg-primary-800 hover:bg-primary-900 text-white text-center py-3.5 px-8 rounded-lg font-semibold text-base transition-colors shadow-sm inline-flex items-center justify-center gap-2"
                    >
                      Book a Repair
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="#how-it-works"
                      className="border border-primary-300 text-primary-700 hover:bg-primary-50 text-center py-3.5 px-8 rounded-lg font-medium text-base transition-colors inline-flex items-center justify-center"
                    >
                      See How It Works
                    </Link>
                  </div>

                  {/* Inline trust badges */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-primary-500 pt-2">
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-accent-500" />
                      <span>Certified Techs</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-accent-500" />
                      <span>Same-Day Service</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-accent-500" />
                      <span>90-Day Warranty</span>
                    </div>
                  </div>
                </div>

                {/* Hero Image */}
                <div className="hidden lg:block relative rounded-2xl overflow-hidden shadow-xl h-[440px]">
                  <OptimizedImage
                    src="/images/services/doorstep-repair-tech-optimized.webp"
                    alt="Professional technician providing doorstep device repair services at customer's location"
                    className="object-cover"
                    fill={true}
                    isCritical={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
                      <div className="bg-accent-100 rounded-full p-2">
                        <Star className="h-5 w-5 text-accent-600 fill-accent-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-primary-800 text-sm">4.8/5 Average Rating</div>
                        <div className="text-primary-500 text-xs">from 500+ verified reviews</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === TESTIMONIALS === */}
        <ScrollReveal>
          <section className="py-16 bg-white">
            <div className="container-custom">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-900 mb-3">What Our Customers Say</h2>
                <p className="text-primary-500 text-lg">Real reviews from your neighbors across the Lower Mainland</p>
              </div>

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {testimonials.slice(0, 4).map((testimonial) => (
                  <StaggerItem key={testimonial.id}>
                    <div className="bg-primary-50 rounded-xl p-6 border border-primary-100">
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? 'text-accent-400 fill-accent-400' : 'text-primary-200'}`} />
                        ))}
                        <span className="ml-2 text-sm text-primary-400">{testimonial.location}</span>
                      </div>
                      <p className="text-primary-700 mb-4 text-sm leading-relaxed">&ldquo;{testimonial.comment}&rdquo;</p>
                      <div className="flex justify-between items-center text-sm border-t border-primary-100 pt-3">
                        <span className="font-medium text-primary-800">{testimonial.name}</span>
                        <span className="text-primary-400 text-xs">{testimonial.device}</span>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              <div className="text-center">
                <div className="inline-flex items-center bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-full text-sm font-medium border border-emerald-200">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  98% Customer Satisfaction Rate
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* === HOW IT WORKS === */}
        <ScrollReveal>
          <section id="how-it-works" className="py-16 bg-primary-50">
            <div className="container-custom">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-900 mb-3">How It Works</h2>
                <p className="text-primary-500 text-lg">Three simple steps to a repaired device</p>
              </div>

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: Smartphone, title: 'Book Online', desc: 'Quick 2-minute booking with instant confirmation', step: '1' },
                  { icon: Wrench, title: 'We Come to You', desc: 'Certified tech arrives with tools & parts at your location', step: '2' },
                  { icon: CheckCircle, title: 'Fixed & Done', desc: 'Most repairs completed in 30-90 minutes with warranty', step: '3' },
                ].map((item) => (
                  <StaggerItem key={item.step}>
                    <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-primary-100">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-100 rounded-full mb-4">
                        <item.icon className="h-6 w-6 text-accent-600" />
                      </div>
                      <div className="text-xs font-semibold text-accent-600 uppercase tracking-wider mb-2">Step {item.step}</div>
                      <h3 className="text-lg font-heading font-bold text-primary-800 mb-2">{item.title}</h3>
                      <p className="text-primary-500 text-sm">{item.desc}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              {/* CTA */}
              <div className="text-center mt-10">
                <Link
                  href="/book-online"
                  className="bg-accent-500 hover:bg-accent-600 text-primary-900 py-3 px-8 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                >
                  Start My Repair
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* === SERVICES === */}
        <ScrollReveal>
          <section className="py-16 bg-white">
            <div className="container-custom">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-900 mb-3">Most Popular Repairs</h2>
                <p className="text-primary-500 text-lg">We fix these issues at your doorstep every day</p>
              </div>

              <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Smartphone, name: 'Screen Repair', price: pricingData.mobile.range, time: pricingData.mobile.time },
                  { icon: Smartphone, name: 'Battery Replace', price: '$79-$149', time: '30-45 min' },
                  { icon: Laptop, name: 'Laptop Screen', price: pricingData.laptop.range, time: pricingData.laptop.time },
                  { icon: Laptop, name: 'Laptop Battery', price: '$99-$179', time: '45-60 min' },
                ].map((service, i) => (
                  <StaggerItem key={i}>
                    <Link
                      href="/book-online"
                      className="bg-primary-50 rounded-xl p-5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-primary-100 block"
                    >
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-accent-100 rounded-full mb-3">
                        <service.icon className="h-5 w-5 text-accent-600" />
                      </div>
                      <h3 className="font-semibold text-sm text-primary-800 mb-1">{service.name}</h3>
                      <p className="text-accent-600 font-bold text-sm">{service.price}</p>
                      <p className="text-primary-400 text-xs mt-1">{service.time}</p>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              <div className="text-center">
                <p className="text-primary-500 mb-4 text-sm">Not sure what&apos;s wrong? Our technicians will diagnose for free.</p>
                <Link
                  href="/book-online"
                  className="text-primary-700 hover:text-primary-900 font-medium text-sm inline-flex items-center gap-1"
                >
                  Book Free Diagnosis
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* === STATS === */}
        <ScrollReveal>
          <section className="py-16 bg-primary-900 text-white">
            <div className="container-custom">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">Trusted Across the Lower Mainland</h2>
                <p className="text-primary-300 text-lg">Professional repair service you can count on</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-heading font-bold text-accent-400 mb-1">
                    <AnimatedCounter to={500} suffix="+" />
                  </div>
                  <p className="text-primary-300 text-sm">Happy Customers</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-heading font-bold text-accent-400 mb-1">
                    <AnimatedCounter to={95} suffix="%" />
                  </div>
                  <p className="text-primary-300 text-sm">Same-Day Fix</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-heading font-bold text-accent-400 mb-1">
                    <AnimatedCounter to={4} suffix=".8" />
                  </div>
                  <p className="text-primary-300 text-sm">Average Rating</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-heading font-bold text-accent-400 mb-1">
                    <AnimatedCounter to={90} />
                  </div>
                  <p className="text-primary-300 text-sm">Day Warranty</p>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* === POSTAL CODE CHECKER === */}
        <ScrollReveal>
          <section className="py-16 bg-white">
            <div className="container-custom max-w-xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-900 mb-3">Check Your Area</h2>
              <p className="text-primary-500 mb-6">Enter your postal code to see if we serve your location</p>
              <div className="bg-primary-50 rounded-xl p-6 border border-primary-100">
                <PostalCodeChecker
                  variant="compact"
                  onSuccess={(result, postalCode) => {
                    setTimeout(() => {
                      window.location.href = '/book-online';
                    }, 1500);
                  }}
                />
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* === SERVICE AREAS === */}
        <ScrollReveal>
          <section className="py-16 bg-primary-50">
            <div className="container-custom">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary-900 mb-3">We Come to You</h2>
                <p className="text-primary-500 text-lg">Serving the entire Lower Mainland</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-primary-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[
                    { name: 'Vancouver', slug: 'vancouver' },
                    { name: 'Burnaby', slug: 'burnaby' },
                    { name: 'Richmond', slug: 'richmond' },
                    { name: 'Chilliwack', slug: 'chilliwack' },
                    { name: 'North Vancouver', slug: 'north-vancouver' },
                    { name: 'West Vancouver', slug: 'west-vancouver' },
                    { name: 'Coquitlam', slug: 'coquitlam' },
                    { name: 'New Westminster', slug: 'new-westminster' },
                  ].map((city) => (
                    <Link
                      key={city.slug}
                      href={`/repair/${city.slug}`}
                      className="bg-primary-50 rounded-lg p-3 text-center text-sm text-primary-700 hover:bg-primary-100 transition-colors block font-medium"
                      onClick={() => trackLocationEvent('area_selected', city.name)}
                    >
                      <MapPin className="inline-block mr-1 h-3.5 w-3.5 text-accent-500" />
                      {city.name}
                    </Link>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-primary-400 text-sm mb-2">+ More cities across the Lower Mainland</p>
                  <Link href="/service-areas" className="text-primary-700 hover:text-primary-900 font-medium text-sm inline-flex items-center gap-1">
                    Check if we serve your area <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* === FINAL CTA === */}
        <section className="py-20 bg-primary-900 text-white relative overflow-hidden">
          <div className="container-custom relative z-10">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 leading-tight">
                Ready to Get Your Device Fixed?
              </h2>
              <p className="text-xl mb-8 text-primary-300">
                Professional repair at your doorstep. Most repairs done in 30-90 minutes with 90-day warranty.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/book-online"
                  className="bg-accent-500 hover:bg-accent-600 text-primary-900 py-4 px-8 rounded-lg font-bold text-lg transition-colors inline-flex items-center justify-center gap-2"
                >
                  Book Your Repair
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href={businessPhoneHref}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 py-4 px-8 rounded-lg font-medium text-lg transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Phone className="h-5 w-5" />
                  {businessPhone}
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-primary-300">
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-accent-400" />Free quotes</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-accent-400" />No hidden fees</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-accent-400" />Certified technicians</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-accent-400" />All brands welcome</span>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
