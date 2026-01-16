import React from 'react';
import Link from 'next/link';
import { FaChevronRight, FaHome } from 'react-icons/fa';
import { BreadcrumbItem, generateBreadcrumbSchema } from '@/utils/seoHelpers';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showSchema?: boolean;
  className?: string;
}

/**
 * Breadcrumbs component for visible navigation hierarchy
 * Displays breadcrumb trail and optionally outputs JSON-LD structured data
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items, 
  showSchema = true,
  className = ''
}) => {
  // Don't render if we have no items or only home
  if (!items || items.length <= 1) {
    return null;
  }

  // Generate structured data for breadcrumbs
  const breadcrumbSchema = showSchema ? generateBreadcrumbSchema(items) : null;

  return (
    <>
      {/* Breadcrumb navigation UI */}
      <nav 
        className={`breadcrumbs ${className}`}
        aria-label="Breadcrumb navigation"
      >
        <ol className="flex flex-wrap items-center text-sm text-gray-600">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <li key={item.url} className="flex items-center">
                {index === 0 ? (
                  // Home icon for first item
                  <Link 
                    href={item.url}
                    className="flex items-center hover:text-accent-600 transition-colors"
                    aria-label="Go to homepage"
                  >
                    <FaHome className="h-3 w-3 mr-1" />
                    <span className="sr-only">Home</span>
                  </Link>
                ) : (
                  <>
                    {/* Separator */}
                    <FaChevronRight className="h-2 w-2 mx-2 text-gray-400" />
                    
                    {isLast ? (
                      // Current page (non-clickable)
                      <span 
                        className="font-medium text-gray-900"
                        aria-current="page"
                      >
                        {item.name}
                      </span>
                    ) : (
                      // Clickable breadcrumb
                      <Link 
                        href={item.url}
                        className="hover:text-accent-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* JSON-LD structured data for search engines */}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema)
          }}
        />
      )}

      <style jsx>{`
        .breadcrumbs {
          padding: 0.75rem 0;
          margin-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .breadcrumbs ol {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .breadcrumbs li {
          display: flex;
          align-items: center;
        }
        
        @media (max-width: 640px) {
          .breadcrumbs {
            padding: 0.5rem 0;
            margin-bottom: 0.75rem;
          }
          
          .breadcrumbs ol {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </>
  );
};

export default Breadcrumbs;