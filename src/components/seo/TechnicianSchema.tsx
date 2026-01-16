import React from 'react';
import { getSiteUrl } from '@/utils/supabaseClient';
import { validateStructuredData } from '@/utils/structuredDataValidation';

export interface TechnicianSchemaProps {
  technician?: {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    bio?: string;
    yearsExperience: number;
    certifications: string[];
    specializations: string[];
    memberOf: string[];
    knowsAbout: string[];
    serviceLocations: string[];
  };
  includeAggregate?: boolean;
  aggregateData?: {
    totalTechnicians: number;
    averageExperience: number;
    totalCertifications: number;
  };
}

/**
 * Technician Schema Component for E-E-A-T signals
 * Renders knowsAbout and memberOf properties for search engine expertise verification
 */
export function TechnicianSchema({ 
  technician,
  includeAggregate = false,
  aggregateData
}: TechnicianSchemaProps) {
  const siteUrl = getSiteUrl();
  
  // If no specific technician provided, render aggregate organization schema
  if (!technician && includeAggregate && aggregateData) {
    const aggregateSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      "name": "The Travelling Technicians",
      "description": "Professional mobile phone and laptop repair services with doorstep service across Vancouver and Lower Mainland, BC",
      "employee": {
        "@type": "Person",
        "name": "Certified Technicians",
        "description": `Team of ${aggregateData.totalTechnicians} certified technicians with average ${aggregateData.averageExperience} years of experience`,
        "knowsAbout": [
          "iPhone screen repair",
          "MacBook logic board repair", 
          "Android device repair",
          "Laptop motherboard repair",
          "Water damage recovery",
          "Charging port replacement",
          "Tablet digitizer replacement",
          "Data recovery"
        ],
        "memberOf": [
          "Apple Professional Services",
          "Samsung Service Partner Network", 
          "Microsoft Partner Network",
          "Mobile Technicians Association of BC",
          "International Society of Certified Electronics Technicians"
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": 4.8,
        "reviewCount": 500,
        "bestRating": 5,
        "worstRating": 1
      }
    };

    if (!validateStructuredData(aggregateSchema)) {
      console.warn('Aggregate technician schema validation failed');
      return null;
    }

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aggregateSchema)
        }}
      />
    );
  }

  // Individual technician schema
  if (technician) {
    const technicianSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${siteUrl}/technicians/${technician.id}`,
      "name": technician.fullName,
      "description": technician.bio || `Certified technician with ${technician.yearsExperience} years of experience`,
      "email": technician.email,
      "telephone": technician.phone,
      "image": technician.avatarUrl,
      "knowsAbout": technician.knowsAbout.length > 0 
        ? technician.knowsAbout 
        : technician.specializations,
      "memberOf": technician.memberOf,
      "hasOccupation": {
        "@type": "Occupation",
        "name": "Mobile Device Repair Technician",
        "description": "Professional repair technician specializing in mobile phones, laptops, and tablets",
        "skills": technician.specializations,
        "qualifications": technician.certifications.map(cert => ({
          "@type": "EducationalOccupationalCredential",
          "credentialCategory": "certification",
          "name": cert
        })),
        "yearsOfExperience": technician.yearsExperience
      },
      "worksFor": {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": "The Travelling Technicians"
      },
      "serviceArea": {
        "@type": "Place",
        "name": technician.serviceLocations.join(', '),
        "containsPlace": technician.serviceLocations.map(location => ({
          "@type": "City",
          "name": location
        }))
      }
    };

    if (!validateStructuredData(technicianSchema)) {
      console.warn('Individual technician schema validation failed');
      return null;
    }

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(technicianSchema)
        }}
      />
    );
  }

  // Default organization schema with knowsAbout/memberOf
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    "name": "The Travelling Technicians",
    "description": "Professional mobile phone and laptop repair services with doorstep service across Vancouver and Lower Mainland, BC",
    "knowsAbout": [
      "iPhone screen repair",
      "MacBook logic board repair",
      "Android device repair", 
      "Laptop motherboard repair",
      "Water damage recovery",
      "Charging port replacement",
      "Tablet digitizer replacement",
      "Data recovery",
      "Gaming console repair",
      "Custom modifications"
    ],
    "memberOf": [
      "Apple Professional Services",
      "Samsung Service Partner Network",
      "Microsoft Partner Network",
      "Dell ProSupport",
      "Mobile Technicians Association of BC",
      "International Society of Certified Electronics Technicians",
      "Android Developers Community"
    ],
    "employee": {
      "@type": "Person",
      "name": "Certified Technicians",
      "description": "Team of certified technicians with Apple, Samsung, Dell, and Microsoft certifications",
      "knowsAbout": [
        "iPhone screen repair",
        "MacBook logic board repair", 
        "Android device repair",
        "Laptop motherboard repair",
        "Water damage recovery"
      ],
      "memberOf": [
        "Apple Professional Services",
        "Samsung Service Partner Network", 
        "Microsoft Partner Network"
      ]
    }
  };

  if (!validateStructuredData(defaultSchema)) {
    console.warn('Default technician schema validation failed');
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(defaultSchema)
      }}
    />
  );
}

/**
 * Helper function to fetch technician data for schema
 */
export async function getTechnicianSchemaData(technicianId?: string) {
  try {
    // This would typically fetch from your API or database
    // For now, return mock data matching our seeded technicians
    const technicians = [
      {
        id: 'tech-1',
        fullName: 'Alex Chen',
        email: 'alex.chen@travellingtechnicians.ca',
        phone: '+1-778-555-0101',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        bio: 'Certified Apple technician with 8+ years of experience specializing in iPhone and MacBook repairs.',
        yearsExperience: 8,
        certifications: ['Apple Certified Mac Technician (ACMT)', 'Apple Certified iOS Technician (ACiT)', 'CompTIA A+'],
        specializations: ['iPhone screen replacement', 'MacBook logic board repair', 'Battery diagnostics'],
        memberOf: ['Apple Professional Services', 'Mobile Technicians Association of BC'],
        knowsAbout: ['iPhone screen repair', 'MacBook logic board', 'iOS diagnostics', 'macOS recovery'],
        serviceLocations: ['Vancouver', 'Burnaby', 'Richmond']
      },
      {
        id: 'tech-2',
        fullName: 'Jamie Patel',
        email: 'jamie.patel@travellingtechnicians.ca',
        phone: '+1-604-555-0202',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop',
        bio: 'Android and Samsung specialist with 6 years of experience. Expert in water damage recovery and charging port repairs.',
        yearsExperience: 6,
        certifications: ['Samsung Certified Repair Technician', 'Google Pixel Repair Certification', 'CompTIA A+'],
        specializations: ['Android device repair', 'Water damage recovery', 'Charging port replacement'],
        memberOf: ['Samsung Service Partner Network', 'Android Developers Community'],
        knowsAbout: ['Samsung Galaxy repair', 'Google Pixel repair', 'Android software', 'Water damage recovery'],
        serviceLocations: ['Surrey', 'Coquitlam', 'New Westminster']
      }
    ];

    if (technicianId) {
      const tech = technicians.find(t => t.id === technicianId);
      return tech || technicians[0];
    }

    // Return aggregate data
    return {
      totalTechnicians: 4,
      averageExperience: 7.25,
      totalCertifications: 11
    };
  } catch (error) {
    console.error('Error fetching technician schema data:', error);
    return null;
  }
}

export default TechnicianSchema;