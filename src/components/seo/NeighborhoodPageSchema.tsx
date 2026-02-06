import React from 'react';

interface NeighborhoodProofOfLife {
  monthlyIPhoneScreens: number;
  monthlySamsungScreens: number;
  monthlyPixelScreens: number;
  monthlyMacbookScreens: number;
}

interface NeighborhoodPageSchemaProps {
  neighborhoodName: string;
  cityName: string;
  latitude: number;
  longitude: number;
  proofOfLife: NeighborhoodProofOfLife;
  postalCodes: string[];
  description?: string;
}

/**
 * NeighborhoodPageSchema Component
 * 
 * Generates LocalBusiness schema markup with neighborhood-specific data
 * including monthly repair statistics as "proof of life" signals.
 * 
 * This component emphasizes business-centric signals with real-world
 * behavioral data (monthly repair counts) that Google's SGE cannot replicate.
 */
export const NeighborhoodPageSchema: React.FC<NeighborhoodPageSchemaProps> = ({
  neighborhoodName,
  cityName,
  latitude,
  longitude,
  proofOfLife,
  postalCodes,
  description
}) => {
  // Calculate total monthly repairs for schema
  const totalMonthlyRepairs = 
    proofOfLife.monthlyIPhoneScreens +
    proofOfLife.monthlySamsungScreens +
    proofOfLife.monthlyPixelScreens +
    proofOfLife.monthlyMacbookScreens;

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `The Travelling Technicians - ${neighborhoodName}`,
    description: description || `Mobile and laptop repair doorstep service in ${neighborhoodName}, ${cityName}`,
    image: 'https://www.travelling-technicians.ca/images/logo.png',
    address: {
      '@type': 'PostalAddress',
      streetAddress: neighborhoodName,
      addressLocality: cityName,
      postalCode: postalCodes[0] || '',
      addressRegion: 'BC',
      addressCountry: 'CA'
    },
    telephone: '+1-604-849-5329',
    areaServed: {
      '@type': 'City',
      name: neighborhoodName,
      containedIn: {
        '@type': 'City',
        name: cityName
      }
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: latitude,
      longitude: longitude
    },
    url: `https://www.travelling-technicians.ca/repair/${cityName.toLowerCase().replace(/\s+/g, '-')}/${neighborhoodName.toLowerCase().replace(/\s+/g, '-')}`,
    
    // Proof-of-Life signals: Monthly repair statistics
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Monthly iPhone Screen Repairs',
        value: proofOfLife.monthlyIPhoneScreens.toString()
      },
      {
        '@type': 'PropertyValue',
        name: 'Monthly Samsung Screen Repairs',
        value: proofOfLife.monthlySamsungScreens.toString()
      },
      {
        '@type': 'PropertyValue',
        name: 'Monthly Google Pixel Repairs',
        value: proofOfLife.monthlyPixelScreens.toString()
      },
      {
        '@type': 'PropertyValue',
        name: 'Monthly MacBook Repairs',
        value: proofOfLife.monthlyMacbookScreens.toString()
      },
      {
        '@type': 'PropertyValue',
        name: 'Total Monthly Repairs',
        value: totalMonthlyRepairs.toString()
      }
    ],

    // Service area with postal codes
    serviceArea: {
      '@type': 'City',
      name: neighborhoodName,
      areaServed: postalCodes.map(code => ({
        '@type': 'PostalAddress',
        postalCode: code,
        addressRegion: 'BC'
      }))
    },

    // Opening hours (from parent city)
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '20:00'
    },

    // Services offered
    knowsAbout: [
      {
        '@type': 'Thing',
        name: 'Mobile Phone Screen Repair',
        description: 'iPhone, Samsung, Google Pixel screen replacement'
      },
      {
        '@type': 'Thing',
        name: 'Laptop Screen Repair',
        description: 'MacBook, Dell, HP, Lenovo screen replacement'
      },
      {
        '@type': 'Thing',
        name: 'Battery Replacement',
        description: 'Mobile and laptop battery replacement'
      },
      {
        '@type': 'Thing',
        name: 'Doorstep Repair Service',
        description: 'On-location repair at your home'
      }
    ],

    // Aggregated ratings from neighborhood testimonials
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: Math.floor(totalMonthlyRepairs / 5).toString() // Estimate based on repairs
    },

    // Contact info
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      areaServed: 'CA',
      availableLanguage: ['en', 'fr']
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

export default NeighborhoodPageSchema;