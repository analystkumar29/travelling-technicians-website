#!/usr/bin/env node

/**
 * Detailed Schema Analysis - Find Invalid Schemas
 * Identifies which specific schemas are failing validation and why
 */

const https = require('https');

// Enhanced validation with detailed error reporting
function validateStructuredData(data, context = '') {
  const errors = [];
  const warnings = [];
  const suggestions = [];
  
  if (!data || typeof data !== 'object') {
    return { 
      isValid: false, 
      errors: ['Invalid data: must be an object'], 
      warnings: [], 
      suggestions: [],
      context 
    };
  }
  
  // Check required fields
  if (!data['@context']) errors.push('Missing @context field');
  if (!data['@type']) errors.push('Missing @type field');
  
  // Validate @context
  if (data['@context'] && data['@context'] !== 'https://schema.org') {
    errors.push(`Invalid @context: "${data['@context']}" should be "https://schema.org"`);
  }
  
  // Type-specific validation
  switch (data['@type']) {
    case 'LocalBusiness':
      validateLocalBusiness(data, errors, warnings, suggestions);
      break;
    case 'Service':
      validateService(data, errors, warnings, suggestions);
      break;
    case 'Article':
      validateArticle(data, errors, warnings, suggestions);
      break;
    case 'FAQPage':
      validateFAQPage(data, errors, warnings, suggestions);
      break;
    case 'Organization':
      validateOrganization(data, errors, warnings, suggestions);
      break;
    case 'Review':
      validateReview(data, errors, warnings, suggestions);
      break;
    case 'WebSite':
    case 'ImageObject':
    case 'PostalAddress':
    case 'GeoCoordinates':
    case 'ContactPoint':
    case 'Question':
    case 'Answer':
    case 'Offer':
    case 'OfferCatalog':
    case 'Rating':
    case 'AggregateRating':
    case 'City':
    case 'SearchAction':
    case 'EntryPoint':
    case 'Person':
      // These are valid schema types, minimal validation
      break;
    default:
      warnings.push(`Unknown schema type: ${data['@type']}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions,
    context,
    schemaType: data['@type']
  };
}

function validateLocalBusiness(data, errors, warnings, suggestions) {
  // Required fields for LocalBusiness
  if (!data.name) errors.push('LocalBusiness missing required field: name');
  if (!data.description) errors.push('LocalBusiness missing required field: description');
  if (!data.url) errors.push('LocalBusiness missing required field: url');
  
  // Validate data types and formats
  if (data.url && typeof data.url !== 'string') errors.push('LocalBusiness url must be string');
  if (data.url && !data.url.match(/^https?:\/\/.+/)) errors.push(`LocalBusiness url invalid format: "${data.url}"`);
  if (data.telephone && !data.telephone.match(/^\+?[\d\s\-\(\)]+$/)) warnings.push(`Telephone format could be improved: "${data.telephone}"`);
  
  // Validate address structure
  if (data.address) {
    if (typeof data.address !== 'object') errors.push('LocalBusiness address must be object');
    else {
      if (!data.address.addressLocality) warnings.push('Address missing locality (city)');
      if (!data.address.addressRegion) warnings.push('Address missing region (state/province)');
      if (!data.address.addressCountry) warnings.push('Address missing country');
    }
  }
  
  // Validate geo coordinates
  if (data.geo) {
    if (typeof data.geo !== 'object') errors.push('LocalBusiness geo must be object');
    else {
      if (typeof data.geo.latitude !== 'number') errors.push(`Geo latitude must be number, got: ${typeof data.geo.latitude}`);
      if (typeof data.geo.longitude !== 'number') errors.push(`Geo longitude must be number, got: ${typeof data.geo.longitude}`);
      if (data.geo.latitude < -90 || data.geo.latitude > 90) errors.push(`Latitude out of range: ${data.geo.latitude}`);
      if (data.geo.longitude < -180 || data.geo.longitude > 180) errors.push(`Longitude out of range: ${data.geo.longitude}`);
    }
  }
}

function validateService(data, errors, warnings, suggestions) {
  if (!data.name) errors.push('Service missing required field: name');
  if (!data.description) errors.push('Service missing required field: description');
  if (!data.provider) errors.push('Service missing required field: provider');
  
  if (data.name && typeof data.name !== 'string') errors.push(`Service name must be string, got: ${typeof data.name}`);
  if (data.description && typeof data.description !== 'string') errors.push(`Service description must be string, got: ${typeof data.description}`);
  
  if (data.provider) {
    if (typeof data.provider === 'string') {
      warnings.push('Provider should be object with @type and name, not string');
    } else if (typeof data.provider === 'object' && !data.provider['@type']) {
      warnings.push('Provider object missing @type field');
    }
  }
}

function validateArticle(data, errors, warnings, suggestions) {
  if (!data.headline) errors.push('Article missing required field: headline');
  if (!data.description) errors.push('Article missing required field: description');
  if (!data.author) errors.push('Article missing required field: author');
  if (!data.datePublished) errors.push('Article missing required field: datePublished');
  
  if (data.url && !data.url.match(/^https?:\/\/.+/)) errors.push(`Article url invalid format: "${data.url}"`);
  if (data.datePublished && !data.datePublished.match(/^\d{4}-\d{2}-\d{2}/)) {
    errors.push(`Article datePublished invalid format: "${data.datePublished}" (should be YYYY-MM-DD)`);
  }
  
  if (data.headline && data.headline.length > 110) warnings.push(`Headline too long: ${data.headline.length} chars (>110)`);
}

function validateFAQPage(data, errors, warnings, suggestions) {
  if (!data.mainEntity) errors.push('FAQPage missing required field: mainEntity');
  if (data.mainEntity && !Array.isArray(data.mainEntity)) errors.push('FAQPage mainEntity must be array');
  
  if (data.mainEntity && Array.isArray(data.mainEntity)) {
    data.mainEntity.forEach((question, index) => {
      if (!question['@type'] || question['@type'] !== 'Question') {
        errors.push(`FAQ question ${index + 1} missing @type: Question`);
      }
      if (!question.name) errors.push(`FAQ question ${index + 1} missing name (question text)`);
      if (!question.acceptedAnswer) errors.push(`FAQ question ${index + 1} missing acceptedAnswer`);
      if (question.acceptedAnswer && !question.acceptedAnswer.text) {
        errors.push(`FAQ question ${index + 1} acceptedAnswer missing text`);
      }
    });
  }
}

function validateOrganization(data, errors, warnings, suggestions) {
  if (!data.name) errors.push('Organization missing required field: name');
  if (!data.url) errors.push('Organization missing required field: url');
  
  if (data.url && !data.url.match(/^https?:\/\/.+/)) errors.push(`Organization url invalid format: "${data.url}"`);
}

function validateReview(data, errors, warnings, suggestions) {
  if (!data.author) errors.push('Review missing required field: author');
  if (!data.reviewRating) errors.push('Review missing required field: reviewRating');
  if (!data.reviewBody) errors.push('Review missing required field: reviewBody');
  
  if (data.reviewRating) {
    if (!data.reviewRating.ratingValue) errors.push('Review rating missing ratingValue');
    if (typeof data.reviewRating.ratingValue !== 'number') {
      errors.push(`Review ratingValue must be number, got: ${typeof data.reviewRating.ratingValue}`);
    }
    if (data.reviewRating.ratingValue < 1 || data.reviewRating.ratingValue > 5) {
      warnings.push(`Review rating out of typical range: ${data.reviewRating.ratingValue} (expected 1-5)`);
    }
  }
}

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractSchemas(html) {
  const schemas = [];
  const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gis;
  let match;
  let schemaIndex = 0;
  
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const schema = JSON.parse(match[1]);
      schemas.push({ data: schema, index: schemaIndex++ });
    } catch (e) {
      console.log(`⚠️  Failed to parse JSON-LD schema ${schemaIndex}: ${e.message}`);
    }
  }
  
  return schemas;
}

async function analyzePageDetailed(url, pageName) {
  console.log(`\n🔍 Analyzing ${pageName.toUpperCase()}:`);
  console.log(`   URL: ${url}`);
  
  try {
    const html = await fetchHtml(url);
    const schemas = extractSchemas(html);
    
    console.log(`   Found: ${schemas.length} schemas`);
    
    if (schemas.length === 0) {
      console.log('   ❌ No schemas found');
      return;
    }
    
    let validCount = 0;
    let invalidSchemas = [];
    
    schemas.forEach(({ data, index }) => {
      const validation = validateStructuredData(data, `Schema ${index + 1}`);
      
      if (validation.isValid) {
        validCount++;
        console.log(`   ✅ Schema ${index + 1} (${validation.schemaType}): Valid`);
      } else {
        invalidSchemas.push({ index: index + 1, validation });
        console.log(`   ❌ Schema ${index + 1} (${validation.schemaType}): INVALID`);
        validation.errors.forEach(error => {
          console.log(`      • ${error}`);
        });
      }
      
      if (validation.warnings.length > 0) {
        console.log(`   ⚠️  Schema ${index + 1} warnings:`);
        validation.warnings.forEach(warning => {
          console.log(`      • ${warning}`);
        });
      }
    });
    
    console.log(`   Summary: ${validCount}/${schemas.length} valid schemas`);
    
    if (invalidSchemas.length > 0) {
      console.log(`\n   🔍 INVALID SCHEMA DETAILS:`);
      invalidSchemas.forEach(({ index, validation }) => {
        console.log(`      Schema ${index} (${validation.schemaType}):`);
        validation.errors.forEach(error => {
          console.log(`        ❌ ${error}`);
        });
      });
    }
    
  } catch (error) {
    console.log(`   ❌ Error fetching ${url}: ${error.message}`);
  }
}

async function main() {
  console.log('🔍 DETAILED SCHEMA VALIDATION ANALYSIS');
  console.log('=====================================');
  console.log('Identifying which specific schemas are invalid and why...\n');
  
  const pages = [
    { 
      url: 'https://travelling-technicians-website-n8mr7vez7.vercel.app/', 
      name: 'Homepage' 
    },
    { 
      url: 'https://travelling-technicians-website-n8mr7vez7.vercel.app/faq', 
      name: 'FAQ Page' 
    },
    { 
      url: 'https://travelling-technicians-website-n8mr7vez7.vercel.app/services/mobile-repair', 
      name: 'Mobile Repair Service' 
    },
    { 
      url: 'https://travelling-technicians-website-n8mr7vez7.vercel.app/repair/vancouver', 
      name: 'Vancouver Location' 
    }
  ];
  
  for (const page of pages) {
    await analyzePageDetailed(page.url, page.name);
  }
  
  console.log('\n💡 SUMMARY:');
  console.log('   This analysis shows exactly which schemas are invalid and why.');
  console.log('   Most "invalid" results are likely due to strict validation rules');
  console.log('   that can be easily fixed with minor adjustments.');
}

if (require.main === module) {
  main().catch(console.error);
}
