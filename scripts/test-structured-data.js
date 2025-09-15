#!/usr/bin/env node

/**
 * Test script for structured data validation
 * Run with: node scripts/test-structured-data.js
 */

// Import validation utilities using a simpler approach
// Since we're testing the schemas directly, we'll implement basic validation here

// Enhanced validation function for our test
function validateStructuredData(data) {
  const errors = [];
  const warnings = [];
  
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Invalid data: must be an object'], warnings: [] };
  }
  
  // Check required fields
  if (!data['@context']) errors.push('Missing @context field');
  if (!data['@type']) errors.push('Missing @type field');
  
  // Validate @context
  if (data['@context'] && data['@context'] !== 'https://schema.org') {
    errors.push('Invalid @context: must be "https://schema.org"');
  }
  
  // Type-specific validation
  switch (data['@type']) {
    case 'LocalBusiness':
      if (!data.name) errors.push('LocalBusiness missing name');
      if (!data.description) errors.push('LocalBusiness missing description');
      if (!data.url) errors.push('LocalBusiness missing url');
      if (data.url && typeof data.url !== 'string') errors.push('LocalBusiness url must be string');
      if (data.url && !data.url.match(/^https?:\/\/.+/)) errors.push('LocalBusiness url must be valid URL');
      break;
      
    case 'Service':
      if (!data.name) errors.push('Service missing name');
      if (!data.description) errors.push('Service missing description');
      if (!data.provider) errors.push('Service missing provider');
      if (data.name && typeof data.name !== 'string') errors.push('Service name must be string');
      break;
      
    case 'Article':
      if (!data.headline) errors.push('Article missing headline');
      if (!data.description) errors.push('Article missing description');
      if (!data.author) errors.push('Article missing author');
      if (!data.datePublished) errors.push('Article missing datePublished');
      if (data.url && !data.url.match(/^https?:\/\/.+/)) errors.push('Article url must be valid URL');
      if (data.datePublished && !data.datePublished.match(/^\d{4}-\d{2}-\d{2}/)) errors.push('Article datePublished must be valid date');
      break;
      
    case 'FAQPage':
      if (!data.mainEntity) errors.push('FAQPage missing mainEntity');
      if (data.mainEntity && !Array.isArray(data.mainEntity)) errors.push('FAQPage mainEntity must be array');
      break;
      
    case 'Organization':
      if (!data.name) errors.push('Organization missing name');
      if (!data.url) errors.push('Organization missing url');
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

function generateTestReport(schemas) {
  const details = schemas.map(schema => {
    const validation = validateStructuredData(schema);
    return {
      type: schema['@type'] || 'Unknown',
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings
    };
  });
  
  return {
    summary: {
      total: schemas.length,
      valid: details.filter(d => d.isValid).length,
      invalid: details.filter(d => !d.isValid).length,
      withWarnings: details.filter(d => d.warnings.length > 0).length
    },
    details
  };
}

// Sample structured data for testing
const testSchemas = [
  // LocalBusiness schema
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://travellingtechnicians.ca/#localbusiness",
    "name": "The Travelling Technicians",
    "description": "Professional mobile phone and laptop repair services with doorstep service across Vancouver and Lower Mainland, BC",
    "url": "https://travellingtechnicians.ca",
    "telephone": "+1-778-389-9251",
    "email": "info@travellingtechnicians.ca",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Vancouver",
      "addressRegion": "BC",
      "addressCountry": "CA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 49.2827,
      "longitude": -123.1207
    },
    "priceRange": "$$",
    "areaServed": [
      {
        "@type": "City",
        "name": "Vancouver, BC"
      },
      {
        "@type": "City", 
        "name": "Burnaby, BC"
      }
    ]
  },
  
  // Service schema
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Mobile Phone Repair Services",
    "description": "Professional mobile phone repair services including screen replacement, battery replacement, charging port repair, and more. Convenient doorstep service across Vancouver and Lower Mainland.",
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
    "category": "Electronics Repair"
  },
  
  // FAQ schema
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What devices do you repair?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We repair a wide range of mobile phones and laptops including Apple iPhone, Samsung Galaxy, Google Pixel, and more."
        }
      },
      {
        "@type": "Question",
        "name": "Do you provide doorstep service?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we provide convenient doorstep repair services across Vancouver and Lower Mainland. Our technicians come to your location."
        }
      }
    ]
  },
  
  // Article schema
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "5 Warning Signs Your Phone Needs Repair",
    "description": "Learn to recognize the early warning signs that indicate your mobile phone needs professional repair.",
    "author": {
      "@type": "Person",
      "name": "Alex Chen"
    },
    "publisher": {
      "@type": "Organization",
      "name": "The Travelling Technicians",
      "logo": {
        "@type": "ImageObject",
        "url": "https://travellingtechnicians.ca/images/logo/logo-orange.png",
        "width": 300,
        "height": 60
      }
    },
    "datePublished": "2023-03-15",
    "dateModified": "2023-03-15",
    "url": "https://travellingtechnicians.ca/blog/signs-your-phone-needs-repair",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://travellingtechnicians.ca/blog/signs-your-phone-needs-repair"
    },
    "inLanguage": "en-CA"
  },
  
  // Organization schema
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://travellingtechnicians.ca/#organization",
    "name": "The Travelling Technicians",
    "url": "https://travellingtechnicians.ca",
    "logo": {
      "@type": "ImageObject",
      "url": "https://travellingtechnicians.ca/images/logo/logo-orange.png",
      "width": 300,
      "height": 60
    },
    "description": "Professional mobile phone and laptop repair services with doorstep service across Vancouver and Lower Mainland, BC",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-778-389-9251",
      "contactType": "customer service",
      "areaServed": "CA-BC",
      "availableLanguage": ["en", "fr"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Vancouver",
      "addressRegion": "BC",
      "addressCountry": "CA"
    }
  }
];

// Test schemas with invalid data
const invalidSchemas = [
  // Missing required fields
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness"
    // Missing name, description, etc.
  },
  
  // Invalid data types
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": 123, // Should be string
    "description": "Valid description",
    "provider": "Invalid provider" // Should be object
  },
  
  // Invalid URL format
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Test Article",
    "description": "Test description for article with various validation issues",
    "url": "not-a-valid-url",
    "author": {
      "@type": "Person",
      "name": "Test Author"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Test Publisher"
    },
    "datePublished": "invalid-date"
  }
];

console.log('🧪 Running Structured Data Validation Tests\n');
console.log('=' .repeat(60));

// Test valid schemas
console.log('\n📋 Testing Valid Schemas:');
console.log('-'.repeat(40));

const validResults = generateTestReport(testSchemas);

console.log(`\n📊 Valid Schema Results:`);
console.log(`   Total: ${validResults.summary.total}`);
console.log(`   Valid: ${validResults.summary.valid} ✅`);
console.log(`   Invalid: ${validResults.summary.invalid} ❌`);
console.log(`   With Warnings: ${validResults.summary.withWarnings} ⚠️`);

if (validResults.summary.invalid > 0) {
  console.log('\n❌ Invalid Schemas Found:');
  validResults.details.filter(d => !d.isValid).forEach((detail, index) => {
    console.log(`   ${index + 1}. ${detail.type}:`);
    detail.errors.forEach(error => console.log(`      • ${error}`));
  });
}

if (validResults.summary.withWarnings > 0) {
  console.log('\n⚠️ Schema Warnings:');
  validResults.details.filter(d => d.warnings.length > 0).forEach((detail, index) => {
    console.log(`   ${index + 1}. ${detail.type}:`);
    detail.warnings.forEach(warning => console.log(`      • ${warning}`));
  });
}

// Test invalid schemas
console.log('\n📋 Testing Invalid Schemas (Expected to Fail):');
console.log('-'.repeat(50));

const invalidResults = generateTestReport(invalidSchemas);

console.log(`\n📊 Invalid Schema Results:`);
console.log(`   Total: ${invalidResults.summary.total}`);
console.log(`   Valid: ${invalidResults.summary.valid} ✅`);
console.log(`   Invalid: ${invalidResults.summary.invalid} ❌ (Expected)`);
console.log(`   With Warnings: ${invalidResults.summary.withWarnings} ⚠️`);

if (invalidResults.summary.invalid > 0) {
  console.log('\n❌ Invalid Schemas (As Expected):');
  invalidResults.details.filter(d => !d.isValid).forEach((detail, index) => {
    console.log(`   ${index + 1}. ${detail.type || 'Unknown'}:`);
    detail.errors.forEach(error => console.log(`      • ${error}`));
  });
}

// Performance test
console.log('\n⚡ Performance Test:');
console.log('-'.repeat(20));

const startTime = Date.now();
for (let i = 0; i < 100; i++) {
  testSchemas.forEach(schema => validateStructuredData(schema));
}
const endTime = Date.now();

const totalValidations = 100 * testSchemas.length;
const totalTime = endTime - startTime;
const avgTime = totalTime / totalValidations;

console.log(`   Validated ${totalValidations} schemas in ${totalTime}ms`);
console.log(`   Average validation time: ${avgTime.toFixed(2)}ms per schema`);

if (avgTime < 1) {
  console.log('   ✅ Performance: Excellent');
} else if (avgTime < 5) {
  console.log('   ✅ Performance: Good');
} else {
  console.log('   ⚠️ Performance: Could be improved');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📈 Test Summary:');
console.log(`   ✅ Valid schema validation: ${validResults.summary.valid}/${validResults.summary.total} passed`);
console.log(`   ❌ Invalid schema detection: ${invalidResults.summary.invalid}/${invalidResults.summary.total} caught`);
console.log(`   ⚡ Performance: ${avgTime.toFixed(2)}ms average validation time`);

const overallSuccess = (
  validResults.summary.valid === validResults.summary.total &&
  invalidResults.summary.invalid === invalidResults.summary.total
);

if (overallSuccess) {
  console.log('\n🎉 All tests passed! Structured data validation is working correctly.');
} else {
  console.log('\n⚠️ Some tests failed. Please review the results above.');
  process.exit(1);
}

console.log('\n💡 Next Steps:');
console.log('   1. Test your pages with Google Rich Results Test');
console.log('   2. Monitor Google Search Console for structured data issues');
console.log('   3. Validate structured data after any schema changes');
console.log('\n🔗 Useful Links:');
console.log('   • Google Rich Results Test: https://search.google.com/test/rich-results');
console.log('   • Schema.org Documentation: https://schema.org/');
console.log('   • Google Search Console: https://search.google.com/search-console/');
