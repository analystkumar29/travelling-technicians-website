import React from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface NeighborhoodBreadcrumbsProps {
  cityName: string;
  citySlug: string;
  neighborhoodName: string;
  neighborhoodSlug: string;
}

/**
 * NeighborhoodBreadcrumbs Component
 * 
 * Renders SEO-friendly breadcrumb navigation with schema markup.
 * Structure: Home → City → Neighborhood
 * 
 * This component serves two purposes:
 * 1. User Navigation: Clear path showing hierarchy
 * 2. SEO: BreadcrumbList schema for rich snippets
 */
export const NeighborhoodBreadcrumbs: React.FC<NeighborhoodBreadcrumbsProps> = ({
  cityName,
  citySlug,
  neighborhoodName,
  neighborhoodSlug
}) => {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Repair', href: '/repair' },
    { label: cityName, href: `/repair/${citySlug}` },
    { label: neighborhoodName }
  ];

  // Schema markup for BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && {
        item: `https://www.travelling-technicians.ca${item.href}`
      })
    }))
  };

  return (
    <>
      {/* Breadcrumb Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Visual Breadcrumb Navigation */}
      <nav className="py-4 px-4 md:px-6 bg-gray-50 border-b border-gray-200">
        <ol className="flex flex-wrap items-center gap-2">
          {breadcrumbItems.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              {/* Breadcrumb Item */}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-primary-800 hover:text-primary-900 hover:underline transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-700 font-medium">{item.label}</span>
              )}

              {/* Separator (except for last item) */}
              {index < breadcrumbItems.length - 1 && (
                <span className="text-gray-400">/</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default NeighborhoodBreadcrumbs;