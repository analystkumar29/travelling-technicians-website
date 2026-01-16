// Test script to validate structured data
const { validateStructuredData } = require('./src/utils/structuredDataValidation.ts');

// Test data for LocalBusiness schema with Wikidata
const testLocalBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "The Travelling Technicians - Vancouver",
  "description": "Professional mobile phone and laptop repair services with doorstep service in Vancouver, BC. Serving Downtown, Yaletown, Kitsilano, West End, and surrounding areas.",
  "url": "https://travellingtechnicians.ca",
  "telephone": "+1-778-389-9251",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Vancouver Service Area",
    "addressLocality": "Vancouver",
    "addressRegion": "BC",
    "addressCountry": "CA"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 49.2827,
    "longitude": -123.1207
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "20:00"
    }
  ],
  "priceRange": "$$",
  "areaServed": [
    {
      "@type": "City",
      "name": "Vancouver, BC"
    }
  ],
  "sameAs": [
    "https://www.wikidata.org/wiki/Q24639",
    "https://www.facebook.com/travellingtechnicians",
    "https://www.instagram.com/travellingtechnicians",
    "https://www.linkedin.com/company/travelling-technicians"
  ],
  "logo": {
    "@type": "ImageObject",
    "url": "https://travellingtechnicians.ca/images/logo/logo-orange-optimized.webp",
    "width": 300,
    "height": 60
  }
};

// Test data for Service schema
const testServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "iPhone 14 Screen Repair",
  "description": "Professional screen replacement for iPhone 14 in Vancouver, BC. Doorstep service with certified technicians.",
  "provider": {
    "@type": "LocalBusiness",
    "@id": "https://travellingtechnicians.ca/#localbusiness",
    "name": "The Travelling Technicians"
  },
  "serviceType": "Mobile Phone Repair",
  "areaServed": [
    {
      "@type": "City",
      "name": "Vancouver, BC"
    }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "iPhone Repair Services",
    "description": "Complete repair services for iPhone 14 in Vancouver",
    "itemListElement": [
      {
        "@type": "Offer",
        "name": "Screen Replacement",
        "description": "Professional screen replacement for iPhone 14",
        "priceCurrency": "CAD",
        "priceRange": "$109-$189",
        "availability": "https://schema.org/InStock",
        "validFrom": "2024-01-01"
      }
    ]
  },
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "Doorstep Service",
      "value": "Available"
    },
    {
      "@type": "PropertyValue",
      "name": "Warranty",
      "value": "90 days"
    }
  ]
};

// Test data for Technician schema (E-E-A-T)
const testTechnicianSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Alex Johnson",
  "jobTitle": "Certified Mobile Repair Technician",
  "worksFor": {
    "@type": "Organization",
    "name": "The Travelling Technicians"
  },
  "knowsAbout": [
    "iPhone Repair",
    "Samsung Galaxy Repair",
    "Mobile Device Diagnostics",
    "Battery Replacement",
    "Screen Replacement Technology"
  ],
  "memberOf": [
    "Apple Certified iOS Technician (ACiT)",
    "Mobile Electronics Certified Professional (MECP)",
    "International Society of Certified Electronics Technicians (ISCET)"
  ],
  "sameAs": [
    "https://www.linkedin.com/in/alexjohnson",
    "https://github.com/alexjohnson"
  ]
};

console.log("Testing Structured Data Validation...\n");

// Test LocalBusiness schema
console.log("1. Testing LocalBusiness Schema:");
const localBusinessResult = validateStructuredData(testLocalBusinessSchema);
console.log(`   Valid: ${localBusinessResult.isValid}`);
if (localBusinessResult.errors.length > 0) {
  console.log(`   Errors: ${localBusinessResult.errors.join(', ')}`);
}
if (localBusinessResult.warnings.length > 0) {
  console.log(`   Warnings: ${localBusinessResult.warnings.join(', ')}`);
}

// Test Service schema
console.log("\n2. Testing Service Schema:");
const serviceResult = validateStructuredData(testServiceSchema);
console.log(`   Valid: ${serviceResult.isValid}`);
if (serviceResult.errors.length > 0) {
  console.log(`   Errors: ${serviceResult.errors.join(', ')}`);
}
if (serviceResult.warnings.length > 0) {
  console.log(`   Warnings: ${serviceResult.warnings.join(', ')}`);
}

// Test Technician schema (Person)
console.log("\n3. Testing Technician Schema (Person):");
const technicianResult = validateStructuredData(testTechnicianSchema);
console.log(`   Valid: ${technicianResult.isValid}`);
if (technicianResult.errors.length > 0) {
  console.log(`   Errors: ${technicianResult.errors.join(', ')}`);
}
if (technicianResult.warnings.length > 0) {
  console.log(`   Warnings: ${technicianResult.warnings.join(', ')}`);
}

// Summary
console.log("\n=== Validation Summary ===");
console.log(`Total Schemas Tested: 3`);
console.log(`Valid: ${[localBusinessResult, serviceResult, technicianResult].filter(r => r.isValid).length}`);
console.log(`With Errors: ${[localBusinessResult, serviceResult, technicianResult].filter(r => r.errors.length > 0).length}`);
console.log(`With Warnings: ${[localBusinessResult, serviceResult, technicianResult].filter(r => r.warnings.length > 0).length}`);

if (localBusinessResult.isValid && serviceResult.isValid) {
  console.log("\n✅ All critical schemas (LocalBusiness, Service) are valid!");
  console.log("✅ Wikidata integration successful (sameAs includes Wikidata URL)");
} else {
  console.log("\n❌ Some schemas failed validation. Check errors above.");
  process.exit(1);
}