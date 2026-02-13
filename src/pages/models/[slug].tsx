import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { Star, MapPin, Clock, Shield, ChevronDown } from 'lucide-react';
import { LocalBusinessSchema } from '@/components/seo/StructuredData';
import { getModelPageSlugs, getModelWithDetails } from '@/lib/data-service';
import InternalLinkingFooter from '@/components/seo/InternalLinkingFooter';
import GoogleReviewBadge from '@/components/common/GoogleReviewBadge';
import WhatsAppButton from '@/components/common/WhatsAppButton';
import { GetStaticProps, GetStaticPaths } from 'next';

interface ModelService {
  name: string;
  displayName: string;
  slug: string;
  minPrice: number;
  maxPrice: number;
  estimatedDuration: number;
  cities: Array<{ name: string; slug: string; routePath: string; price: number }>;
}

interface ModelTestimonial {
  customer_name: string;
  city: string;
  device_model: string;
  rating: number;
  review: string;
}

interface RelatedModel {
  name: string;
  slug: string;
  brandName: string;
}

interface ModelPageProps {
  model: { name: string; displayName: string; slug: string; releaseYear?: number; deviceType: string };
  brand: { name: string; displayName: string; slug: string };
  services: ModelService[];
  testimonials: ModelTestimonial[];
  relatedModels: RelatedModel[];
}

// About content per model — unique content to avoid thin pages
const MODEL_ABOUT_CONTENT: Record<string, { issues: string; details: string }> = {
  'iphone-16-pro-max': {
    issues: 'Common issues include cracked Super Retina XDR displays (6.9-inch), battery degradation after heavy use of the A18 Pro chip, and charging port wear from daily use.',
    details: 'The iPhone 16 Pro Max features a titanium frame and Ceramic Shield front, making screen repairs more specialized. Its large battery (4,685 mAh) and advanced camera system with 5x optical zoom require experienced technicians for quality repairs.'
  },
  'iphone-16-pro': {
    issues: 'Frequent repair needs include cracked 6.3-inch displays, battery health decline, and charging port issues. The titanium frame can also sustain cosmetic damage from drops.',
    details: 'The iPhone 16 Pro shares the same A18 Pro chip and camera system as the Pro Max but in a more compact form factor. Screen replacements require precision calibration for the ProMotion 120Hz display and True Tone functionality.'
  },
  'iphone-15-pro-max': {
    issues: 'Common repairs include screen damage to the 6.7-inch Super Retina XDR display, battery replacement as capacity drops below 80%, and charging port repairs.',
    details: 'As the first iPhone with a titanium frame, the 15 Pro Max requires specialized tools for disassembly. Its USB-C port was a significant design change from Lightning, and its 5x telephoto camera lens is a common point of failure from drop damage.'
  },
  'iphone-15': {
    issues: 'Screen cracks on the 6.1-inch display, battery degradation, and charging port issues are the most common repair needs for the iPhone 15.',
    details: 'The iPhone 15 introduced USB-C to the standard iPhone lineup, Dynamic Island, and a 48MP main camera. Screen repairs involve careful handling of the Ceramic Shield front cover and Face ID components.'
  },
  'iphone-14': {
    issues: 'Cracked screens, aging batteries, and Lightning port issues are the top repair requests. Back glass damage is also common due to the glass-sandwich design.',
    details: 'The iPhone 14 features a redesigned internal layout that makes battery replacement easier than previous models. Its 6.1-inch Super Retina XDR display and A15 Bionic chip remain popular, making it a frequently repaired model.'
  },
  'macbook-pro-16-m4-max-2024': {
    issues: 'Common issues include Liquid Retina XDR display damage from drops or pressure, battery degradation under sustained high-performance workloads, and Thunderbolt 5 port wear from frequent docking and undocking.',
    details: 'The MacBook Pro 16 with M4 Max (2024) is Apple\'s most powerful laptop, featuring up to 128 GB unified memory and a 16.2-inch Liquid Retina XDR display with 3456×2234 resolution. Its advanced thermal system with dual fans handles the M4 Max chip\'s 16-core CPU and up to 40-core GPU. Screen replacements require precision calibration for ProMotion 120Hz and XDR brightness. The larger chassis and high-capacity battery (100 Wh) make battery replacement a multi-step procedure involving careful adhesive removal.'
  },
  'macbook-pro-16-m4-pro-2024': {
    issues: 'Frequent repair needs include cracked or pressure-damaged displays, battery health decline after heavy creative workloads, and USB-C/Thunderbolt port issues from regular peripheral use.',
    details: 'The MacBook Pro 16 with M4 Pro (2024) balances performance and efficiency with a 14-core CPU and 20-core GPU. It shares the same 16.2-inch Liquid Retina XDR display and 100 Wh battery as the M4 Max variant, so repair procedures are nearly identical. The Thunderbolt 5 ports, HDMI 2.1, SDXC slot, and MagSafe 3 connector are all potential service points. Our technicians handle the complete disassembly required for screen and battery replacements on this unibody design.'
  },
  'macbook-pro-14-m4-2024': {
    issues: 'Display damage, battery cycle depletion, and keyboard or trackpad malfunctions are the top repair requests for the 14-inch M4 MacBook Pro.',
    details: 'The MacBook Pro 14 with M4 (2024) is the entry point to Apple\'s pro laptop lineup, featuring the base M4 chip with a 10-core CPU and 10-core GPU. Its 14.2-inch Liquid Retina XDR display delivers the same ProMotion technology as higher-tier models. With 72 Wh battery capacity and Thunderbolt 4 ports (not Thunderbolt 5), it\'s slightly simpler to service than the 16-inch models. Battery replacement still requires careful adhesive work, and screen replacements must preserve True Tone calibration.'
  },
  'macbook-air-13-m4-2025': {
    issues: 'Screen cracks from drops, battery degradation over time, and USB-C port wear are the most common repair needs for the MacBook Air 13-inch M4.',
    details: 'The MacBook Air 13 with M4 (2025) is Apple\'s thinnest laptop at just 11.3 mm, featuring a 13.6-inch Liquid Retina display, 10-core CPU, and 10-core GPU. Its fanless design means there are no moving parts to fail, but the compact form factor requires precision tools for disassembly. The 52.6 Wh battery is adhered in place, and screen replacements must preserve the 500-nit brightness calibration and P3 wide colour gamut. MagSafe 3 charging and two Thunderbolt 4 ports are the main external service points.'
  },
  'macbook-air-15-m4-2025': {
    issues: 'Display damage from everyday use, battery health decline, and port connectivity issues are the most frequent repair requests for the MacBook Air 15-inch M4.',
    details: 'The MacBook Air 15 with M4 (2025) offers a spacious 15.3-inch Liquid Retina display in a fanless, 11.5 mm-thin design weighing just 1.51 kg. The larger display makes screen replacements more involved than the 13-inch model, with careful handling needed to avoid flexing the thin aluminium lid. Its 66.5 Wh battery provides all-day battery life but uses the same adhesive-mounted design as other recent MacBooks. The six-speaker sound system and Thunderbolt 4 ports round out the key components our technicians service.'
  },
  'macbook-pro-14-m3': {
    issues: 'Common issues include Liquid Retina XDR display damage, battery cycle count reaching replacement threshold (around 1,000 cycles), and keyboard or trackpad malfunctions.',
    details: 'The MacBook Pro 14-inch with M3 chip features a 14.2-inch Liquid Retina XDR display with ProMotion. Its unified memory architecture and MagSafe 3 charging port represent key service points. Battery replacement requires careful adhesive removal.'
  },
  'macbook-air-m3': {
    issues: 'Display damage, battery degradation after extensive use, and USB-C port wear are the most common repair needs for the MacBook Air M3.',
    details: 'The MacBook Air M3 (2024) is fanless with a 13.6-inch Liquid Retina display. Its compact design means repairs require precision tools. The M3 chip delivers excellent performance while keeping the device thin and light — making it one of our most-repaired laptops.'
  },
  'galaxy-s25-ultra': {
    issues: 'The most common repairs are cracked 6.9-inch Dynamic AMOLED displays, S Pen replacement, battery degradation, and charging port issues.',
    details: 'The Galaxy S25 Ultra features a titanium frame and Gorilla Armor 2 display protection. Its integrated S Pen and quad-camera system with 200MP sensor require specialized repair expertise. Screen replacements must preserve the under-display fingerprint sensor calibration.'
  },
  'galaxy-s25': {
    issues: 'Screen damage to the 6.2-inch Dynamic AMOLED display, battery replacement, and charging port repairs are the most frequent service requests.',
    details: 'The Galaxy S25 runs on the Snapdragon 8 Elite chip and features a compact design with a flat display. Screen repairs require careful handling of the ultrasonic fingerprint sensor embedded under the display.'
  },
  'galaxy-s24-ultra': {
    issues: 'Cracked displays, S Pen malfunctions, battery health decline, and camera lens damage from drops are common repair needs.',
    details: 'The Galaxy S24 Ultra features a titanium frame and flat 6.8-inch QHD+ display — the first Ultra model without curved edges. This flat design actually simplifies screen replacement compared to older curved-edge models. Its 200MP camera and AI features make it a premium device worth repairing.'
  },
  'galaxy-s24': {
    issues: 'Screen cracks, battery degradation, and charging port wear are the top repair requests for the Galaxy S24.',
    details: 'The Galaxy S24 features a 6.2-inch Dynamic AMOLED 2X display with Vision Booster for outdoor visibility. Its Exynos 2400/Snapdragon 8 Gen 3 chip and AI capabilities make it a popular mid-flagship device. Screen repairs maintain the smooth 120Hz refresh rate.'
  },
  'galaxy-s23-ultra': {
    issues: 'The curved 6.8-inch display is prone to edge cracks, while battery replacement and S Pen issues are also common repair needs.',
    details: 'The Galaxy S23 Ultra was the last Ultra model with a curved-edge display, making screen replacements more complex. Its 200MP camera sensor and built-in S Pen are key components that require careful handling during any repair.'
  },
  'pixel-9-pro': {
    issues: 'Display damage to the 6.3-inch Super Actua display, battery replacement, and camera module issues are the most common repairs.',
    details: 'The Pixel 9 Pro features Google\'s Tensor G4 chip and a triple camera system with advanced AI photography features. Its flat-edge design and matte aluminum frame require careful disassembly during repairs. Screen replacements must preserve the under-display fingerprint reader.'
  },
  'pixel-8-pro': {
    issues: 'Screen cracks, battery health decline, and rear camera glass damage are frequent repair needs for the Pixel 8 Pro.',
    details: 'The Pixel 8 Pro features a 6.7-inch Super Actua display with 120Hz refresh rate and Google\'s Tensor G3 processor. Its temperature sensor and advanced camera bar are unique components. Battery replacement and screen repair are straightforward for experienced technicians.'
  },
  'pixel-8': {
    issues: 'Cracked 6.2-inch Actua displays, battery degradation, and charging port issues are the most common repair requests.',
    details: 'The Pixel 8 offers Google\'s pure Android experience with the Tensor G3 chip and a compact, easy-to-hold design. Its simpler dual-camera setup compared to the Pro model and standard display make it one of the more straightforward repairs in the Pixel lineup.'
  }
};

// All service cities
const ALL_CITIES = [
  { slug: 'abbotsford', name: 'Abbotsford' },
  { slug: 'burnaby', name: 'Burnaby' },
  { slug: 'chilliwack', name: 'Chilliwack' },
  { slug: 'coquitlam', name: 'Coquitlam' },
  { slug: 'delta', name: 'Delta' },
  { slug: 'langley', name: 'Langley' },
  { slug: 'new-westminster', name: 'New Westminster' },
  { slug: 'north-vancouver', name: 'North Vancouver' },
  { slug: 'richmond', name: 'Richmond' },
  { slug: 'squamish', name: 'Squamish' },
  { slug: 'surrey', name: 'Surrey' },
  { slug: 'vancouver', name: 'Vancouver' },
  { slug: 'west-vancouver', name: 'West Vancouver' },
];

function FaqAccordion({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="border border-gray-100 rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-primary-50 transition-colors"
          >
            <span className="font-medium text-primary-900 pr-4">{item.question}</span>
            <ChevronDown className={`h-5 w-5 text-primary-400 flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
          </button>
          {openIndex === index && (
            <div className="px-4 pb-4 text-primary-600">{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ModelPage({ model, brand, services, testimonials, relatedModels }: ModelPageProps) {
  const siteUrl = 'https://www.travelling-technicians.ca';
  const canonicalUrl = `${siteUrl}/models/${model.slug}`;
  const aboutContent = MODEL_ABOUT_CONTENT[model.slug];

  // Price range across all services
  const allPrices = services.flatMap(s => [s.minPrice, s.maxPrice]).filter(p => p > 0);
  const overallMinPrice = allPrices.length > 0 ? Math.min(...allPrices) : 89;
  const overallMaxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 249;

  // Breadcrumb JSON-LD
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: `${brand.displayName} Device Repair`, item: `${siteUrl}/repair/${brand.slug}-devices` },
      { '@type': 'ListItem', position: 3, name: `${model.displayName} Repair`, item: canonicalUrl },
    ]
  };

  // Product JSON-LD with AggregateOffer
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${model.displayName} Repair Service`,
    description: `Independent professional repair services for ${model.displayName}. Screen replacement, battery replacement, and more.`,
    brand: { '@type': 'Brand', name: 'The Travelling Technicians' },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'CAD',
      lowPrice: overallMinPrice,
      highPrice: overallMaxPrice,
      offerCount: services.length,
      availability: 'https://schema.org/InStock'
    }
  };

  // FAQ items
  const faqItems = [
    {
      question: `How much does ${model.displayName} repair cost?`,
      answer: `${model.displayName} repair prices range from $${overallMinPrice} to $${overallMaxPrice} depending on the type of repair. Screen replacements and battery replacements are our most popular services. We offer both standard and premium repair tiers with different warranty lengths.`
    },
    {
      question: `How long does ${model.displayName} repair take?`,
      answer: `Most ${model.displayName} repairs are completed in ${services[0]?.estimatedDuration || 45} minutes or less. Our technician comes directly to your location — home, office, or any convenient spot across the Lower Mainland.`
    },
    {
      question: `Do you offer doorstep repair for ${model.displayName}?`,
      answer: `Yes! All our ${model.displayName} repairs are done at your doorstep. We serve 13 cities across the Lower Mainland including Vancouver, Surrey, Burnaby, Richmond, and Coquitlam. Book before 3 PM for next-day service.`
    },
    {
      question: `What warranty do you provide on ${model.displayName} repairs?`,
      answer: `We offer a 3-month warranty on standard repairs and a 6-month warranty on premium repairs for the ${model.displayName}. The warranty covers both parts and labour. Check your warranty status anytime at travelling-technicians.ca/check-warranty.`
    }
  ];

  // FAQ JSON-LD
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  };

  // Which related models have their own landing pages
  const modelPageSlugs = getModelPageSlugs();

  return (
    <>
      <Head>
        <title>Independent {model.displayName} Repair | The Travelling Technicians</title>
        <meta name="description" content={`Independent ${model.displayName} repair at your doorstep. Screen replacement from $${overallMinPrice}. Expert ${brand.displayName} repair across 13 Lower Mainland cities. 3-6 month warranty.`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`Independent ${model.displayName} Repair | The Travelling Technicians`} />
        <meta property="og:description" content={`Professional ${model.displayName} repair at your doorstep. From $${overallMinPrice}. 13 cities served.`} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <LocalBusinessSchema />
      </Head>
      <Layout title={`Independent ${model.displayName} Repair`} canonical={canonicalUrl}>
        {/* Hero */}
        <section className="pt-16 pb-20 bg-gradient-to-br from-primary-900 to-primary-800 text-white">
          <div className="container-custom">
            <div className="max-w-3xl">
              <p className="text-sm text-primary-300 mb-4 border border-primary-600 rounded-lg px-4 py-2 inline-block">
                Independent third-party repair — not affiliated with or endorsed by {brand.displayName}.
              </p>
              <nav className="text-sm text-primary-300 mb-4">
                <Link href="/" className="hover:text-white">Home</Link>
                <span className="mx-2">/</span>
                <Link href={`/repair/${brand.slug}-devices`} className="hover:text-white">{brand.displayName} Devices</Link>
                <span className="mx-2">/</span>
                <span className="text-white">{model.displayName}</span>
              </nav>
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 leading-tight">
                Independent {model.displayName} Repair at Your Doorstep
              </h1>
              <p className="text-xl mb-8 text-primary-200">
                Professional repair services for your {brand.displayName} {model.displayName}. From ${overallMinPrice} with {services.length > 0 ? '3-6 month' : ''} warranty. Serving 13 cities across the Lower Mainland.
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
                <a
                  href={`https://wa.me/16048495329?text=${encodeURIComponent(`Hi, I need repair for my ${model.displayName}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold px-6 py-3 rounded-lg transition-colors text-center gap-2"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Repair Services */}
        {services.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container-custom">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary-900">
                  {model.displayName} Repair Services
                </h2>
                <p className="text-xl text-primary-500 max-w-3xl mx-auto">
                  Choose from {services.length} repair services available for your {model.displayName} across the Lower Mainland.
                </p>
              </div>

              <div className="space-y-8 max-w-5xl mx-auto">
                {services.map((service) => (
                  <div key={service.slug} className="bg-white rounded-xl p-6 shadow-sm border border-primary-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-primary-900">{service.displayName}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-primary-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            ~{service.estimatedDuration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            3-6 month warranty
                          </span>
                        </div>
                      </div>
                      {service.minPrice > 0 && (
                        <div className="mt-2 md:mt-0">
                          <span className="text-2xl font-bold text-primary-800">
                            {service.minPrice === service.maxPrice
                              ? `$${service.minPrice}`
                              : `$${service.minPrice}-$${service.maxPrice}`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {service.cities.map((city) => (
                        <Link
                          key={city.slug}
                          href={city.routePath}
                          className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all group text-sm"
                        >
                          <MapPin className="h-3.5 w-3.5 text-primary-400 group-hover:text-primary-800 flex-shrink-0" />
                          <span className="text-primary-700 group-hover:text-primary-900">{city.name}</span>
                          {city.price > 0 && (
                            <span className="ml-auto text-xs text-primary-400">${city.price}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* About This Device */}
        {aboutContent && (
          <section className="py-16 bg-primary-50">
            <div className="container-custom">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-primary-900">
                  About {model.displayName} Repairs
                </h2>
                <div className="prose prose-primary max-w-none text-primary-700 space-y-4">
                  <p>{aboutContent.issues}</p>
                  <p>{aboutContent.details}</p>
                  <p>
                    Our certified technicians are experienced with {brand.displayName} {model.deviceType.toLowerCase()} repairs
                    and use quality replacement parts backed by our warranty. Every repair is performed at your doorstep —
                    no need to mail in your device or visit a repair shop.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Where We Repair */}
        <section className={`py-16 ${aboutContent ? 'bg-white' : 'bg-primary-50'}`}>
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary-900">
                Where We Repair {model.displayName}
              </h2>
              <p className="text-xl text-primary-500 max-w-3xl mx-auto">
                We bring {model.displayName} repair directly to your doorstep in 13 cities across the Lower Mainland.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {ALL_CITIES.map((city) => (
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
                  What {model.displayName} Owners Say
                </h2>
                <p className="text-xl text-primary-500 max-w-3xl mx-auto">
                  Real reviews from {model.displayName} repair customers.
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

        {/* Related Models */}
        {relatedModels.length > 0 && (
          <section className="py-16 bg-primary-50">
            <div className="container-custom">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-primary-900">
                  Other {brand.displayName} Models We Repair
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {relatedModels.map((rm) => {
                  const hasPage = modelPageSlugs.includes(rm.slug);
                  return hasPage ? (
                    <Link
                      key={rm.slug}
                      href={`/models/${rm.slug}`}
                      className="bg-white rounded-xl p-4 shadow-sm border border-primary-100 hover:shadow-md hover:border-accent-300 transition-all text-center"
                    >
                      <p className="font-medium text-primary-700 text-sm">{rm.name}</p>
                    </Link>
                  ) : (
                    <div
                      key={rm.slug}
                      className="bg-white rounded-xl p-4 shadow-sm border border-primary-100 text-center"
                    >
                      <p className="font-medium text-primary-500 text-sm">{rm.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-heading font-bold mb-8 text-primary-900">Frequently Asked Questions</h2>
              <FaqAccordion items={faqItems} />
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
                Ready to Repair Your {model.displayName}?
              </h2>
              <p className="text-xl mb-8 max-w-3xl mx-auto text-primary-200">
                Book our doorstep repair service and have your {model.displayName} fixed without the hassle of going to a repair shop.
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
      <WhatsAppButton message={`Hi, I need repair for my ${model.displayName}`} />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getModelPageSlugs();
  return {
    paths: slugs.map(slug => ({ params: { slug } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  if (!slug) {
    return { notFound: true };
  }

  const data = await getModelWithDetails(slug);

  if (!data) {
    return { notFound: true };
  }

  return {
    props: {
      model: data.model,
      brand: data.brand,
      services: data.services,
      testimonials: data.testimonials,
      relatedModels: data.relatedModels,
    },
    revalidate: 3600,
  };
};
