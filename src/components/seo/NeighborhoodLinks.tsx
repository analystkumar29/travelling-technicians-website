import React from 'react';
import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa';

/**
 * NeighborhoodLinks Component
 * Renders internal links for neighborhood-specific pages with SEO benefits
 * Implements topic clustering strategy for local SEO
 */

interface NeighborhoodLink {
  neighborhood: string;
  description?: string;
  href: string;
}

interface NeighborhoodLinksProps {
  cityName: string;
  citySlug: string;
  neighborhoods: string[];
  title?: string;
  className?: string;
}

/**
 * Mapping of neighborhoods to SEO-optimized descriptions
 * Used for internal link context on city pages
 */
const neighborhoodDescriptions: Record<string, Record<string, string>> = {
  vancouver: {
    'Downtown': 'iPhone and laptop repairs in Downtown Vancouver - near SkyTrain stations',
    'Yaletown': 'Tech repair services in Yaletown - popular with young professionals',
    'Kitsilano': 'Mobile and laptop repair in Kitsilano - serving UBC students and residents',
    'Coal Harbour': 'Premium tech repair service in Coal Harbour - luxury condos',
    'West End': 'Doorstep device repair in West End - convenient for busy professionals',
    'Mount Pleasant': 'Affordable tech repairs in Mount Pleasant neighborhood',
    'Fairview': 'Computer and phone repair in Fairview - family-friendly service',
    'South Granville': 'Luxury tech repair in South Granville - high-end clientele'
  },
  burnaby: {
    'Metrotown': 'Device repair at Metrotown - near major shopping center',
    'Brentwood': 'Tech repair in Brentwood - serving local families and businesses',
    'Lougheed': 'Laptop and phone repair in Lougheed area - convenient location',
    'Deer Lake': 'Doorstep repair service in Deer Lake - peaceful neighborhood',
    'Burnaby Heights': 'Premium tech repair in Burnaby Heights',
    'Edmonds': 'Affordable repair services in Edmonds neighborhood'
  },
  coquitlam: {
    'Coquitlam Centre': 'Central Coquitlam tech repair - near shopping and transit',
    'Burquitlam': 'Mobile and laptop repair in Burquitlam',
    'Maillardville': 'Neighborhood tech services in Maillardville',
    'Westwood Plateau': 'Premium repair service in Westwood Plateau',
    'Austin Heights': 'Family-friendly device repair in Austin Heights'
  },
  richmond: {
    'Richmond Centre': 'Central Richmond repair services - near major mall',
    'Steveston': 'Charming neighborhood tech repair in Steveston',
    'Ironwood': 'Local device repair in Ironwood neighborhood',
    'Terra Nova': 'Tech services in Terra Nova area',
    'Bridgeport': 'Convenient repair location in Bridgeport'
  },
  'north-vancouver': {
    'Lonsdale': 'North Vancouver repair services in Lonsdale - main commercial area',
    'Lower Lonsdale': 'Waterfront neighborhood tech repair',
    'Lynn Valley': 'Family-oriented repair services in Lynn Valley',
    'Deep Cove': 'Premium tech repair in scenic Deep Cove',
    'Edgemont': 'North shore neighborhood repair services'
  },
  surrey: {
    'Guildford': 'Central Surrey tech repair in Guildford - near shopping',
    'Newton': 'Convenient device repair in Newton neighborhood',
    'Fleetwood': 'Community-focused tech services in Fleetwood',
    'Whalley': 'Doorstep repair service in growing Whalley area',
    'Cloverdale': 'Neighborhood repair services in Cloverdale',
    'South Surrey': 'White Rock area tech repair - South Surrey services',
    'Panorama': 'Family-friendly repair in Panorama neighborhood',
    'Bridgeview': 'Local device repair in Bridgeview'
  }
};

export function NeighborhoodLinks({
  cityName,
  citySlug,
  neighborhoods,
  title = 'Service Neighborhoods',
  className = ''
}: NeighborhoodLinksProps) {
  // Get descriptions for this city
  const descriptions = neighborhoodDescriptions[citySlug] || {};

  // Create neighborhood link objects
  const neighborhoodLinks: NeighborhoodLink[] = neighborhoods.map(neighborhood => ({
    neighborhood,
    description: descriptions[neighborhood],
    href: `/locations/${citySlug}/${neighborhood.toLowerCase().replace(/\s+/g, '-')}`
  }));

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title} in {cityName}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert repair services available in every {cityName} neighborhood
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
          {neighborhoodLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100 hover:border-primary-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                    {link.neighborhood}
                  </h3>
                  {link.description && (
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors line-clamp-2">
                      {link.description}
                    </p>
                  )}
                </div>
                <FaChevronRight className="ml-2 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0 mt-1" />
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
              url: `/locations/${citySlug}`,
              hasMap: neighborhoodLinks.map(link => ({
                '@type': 'LocalBusiness',
                name: `The Travelling Technicians - ${link.neighborhood}`,
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: link.neighborhood,
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
