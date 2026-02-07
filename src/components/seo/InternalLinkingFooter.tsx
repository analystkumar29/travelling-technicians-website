/**
 * Internal Linking Footer Component
 * 
 * Purpose: Connect all orphan pages through internal links
 * Problem it solves: Without this, 3,200+ dynamic pages are only reachable via sitemap,
 * which Google treats as low-authority pages
 * 
 * Solution: Show top cities and top services in footer with dynamic links
 * Result: Every page gets internal links back to homepage hierarchy
 * 
 * FIXED: Removed react-query dependency, now using static fallback list
 */

import Link from 'next/link';

interface PopularCity {
  slug: string;
  name: string;
}

interface PopularService {
  slug: string;
  display_name: string;
}

// Static fallback cities - all 13 active service areas
const FALLBACK_CITIES: PopularCity[] = [
  { slug: 'vancouver', name: 'Vancouver' },
  { slug: 'burnaby', name: 'Burnaby' },
  { slug: 'richmond', name: 'Richmond' },
  { slug: 'surrey', name: 'Surrey' },
  { slug: 'coquitlam', name: 'Coquitlam' },
  { slug: 'north-vancouver', name: 'North Vancouver' },
  { slug: 'west-vancouver', name: 'West Vancouver' },
  { slug: 'new-westminster', name: 'New Westminster' },
  { slug: 'delta', name: 'Delta' },
  { slug: 'langley', name: 'Langley' },
  { slug: 'abbotsford', name: 'Abbotsford' },
  { slug: 'chilliwack', name: 'Chilliwack' },
  { slug: 'squamish', name: 'Squamish' }
];

// Static fallback services - most popular repairs
const FALLBACK_SERVICES: PopularService[] = [
  { slug: 'screen-replacement-mobile', display_name: 'Mobile Screen Repair' },
  { slug: 'battery-replacement-mobile', display_name: 'Mobile Battery Replacement' },
  { slug: 'screen-replacement-laptop', display_name: 'Laptop Screen Repair' },
  { slug: 'battery-replacement-laptop', display_name: 'Laptop Battery Replacement' },
  { slug: 'water-damage-repair', display_name: 'Water Damage Repair' },
  { slug: 'charging-port-repair', display_name: 'Charging Port Repair' }
];

export default function InternalLinkingFooter() {
  return (
    <section className="bg-gray-50 border-t border-gray-200 py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Popular Service Areas */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Service Areas
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              We provide doorstep device repair across the Lower Mainland
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FALLBACK_CITIES.map((city: PopularCity) => (
                <Link
                  key={city.slug}
                  href={`/repair/${city.slug}`}
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                >
                  {city.name} Repair
                </Link>
              ))}
            </div>
            <Link
              href="/service-areas"
              className="inline-block mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              View All Service Areas →
            </Link>
          </div>

          {/* Popular Services */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Popular Repairs
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Expert repair services for all devices and brands
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FALLBACK_SERVICES.map((service: PopularService) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                  title={service.display_name}
                >
                  {service.display_name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* SEO Callout - Explains why we have many pages */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Our location-specific and service-specific pages help us provide 
            the most relevant information for your area and device. Every page 
            is optimized for your local area, so you get accurate pricing, 
            availability, and service details.
          </p>
        </div>
      </div>
    </section>
  );
}
