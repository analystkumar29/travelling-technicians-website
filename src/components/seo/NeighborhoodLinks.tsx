import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * NeighborhoodLinks Component
 * Renders internal links for neighborhood-specific pages with SEO benefits
 * Implements topic clustering strategy for local SEO
 *
 * Accepts either rich neighborhood_pages data (from DB payload) or
 * plain string[] neighborhoods for backwards compatibility.
 */

interface NeighborhoodPageData {
  id: number;
  neighborhood_name: string;
  slug: string;
  landmark_name?: string;
}

interface NeighborhoodLinksProps {
  cityName: string;
  citySlug: string;
  neighborhoods?: string[];
  neighborhoodPages?: NeighborhoodPageData[];
  title?: string;
  className?: string;
}

export function NeighborhoodLinks({
  cityName,
  citySlug,
  neighborhoods,
  neighborhoodPages,
  title = 'Service Neighborhoods',
  className = ''
}: NeighborhoodLinksProps) {
  // Prefer rich DB data; fall back to string array
  const links = neighborhoodPages && neighborhoodPages.length > 0
    ? neighborhoodPages.map(np => ({
        name: np.neighborhood_name,
        href: `/repair/${citySlug}/${np.slug}`,
        landmark: np.landmark_name
      }))
    : (neighborhoods || []).map(name => ({
        name,
        href: `/repair/${citySlug}/${name.toLowerCase().replace(/\s+/g, '-')}`,
        landmark: undefined as string | undefined
      }));

  if (links.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-primary-50 to-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title} in {cityName}
          </h2>
          <p className="text-xl text-primary-500 max-w-3xl mx-auto">
            Expert repair services available in every {cityName} neighborhood
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100 hover:border-primary-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-primary-900 group-hover:text-primary-800 transition-colors mb-1">
                    {link.name}
                  </h3>
                  {link.landmark && (
                    <p className="text-sm text-primary-500 group-hover:text-primary-600 transition-colors line-clamp-2">
                      Near {link.landmark}
                    </p>
                  )}
                </div>
                <ChevronRight className="ml-2 h-5 w-5 text-primary-300 group-hover:text-primary-800 transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Structured Data for AggregateOffer of location services */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: `${cityName} Neighborhood Repair Services`,
              description: `Browse device repair services across all ${cityName} neighborhoods`,
              url: `/repair/${citySlug}`,
              hasPart: links.map(link => ({
                '@type': 'LocalBusiness',
                name: `The Travelling Technicians - ${link.name}`,
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: link.name,
                  addressRegion: 'BC',
                  addressCountry: 'CA'
                }
              }))
            })
          }}
        />
      </div>
    </section>
  );
}

export default NeighborhoodLinks;
