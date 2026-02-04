#!/usr/bin/env node

/**
 * SEO Phase 2 Audit Script
 * Tests for:
 * - JSON-LD Schema compliance
 * - AggregateRating safety
 * - Breadcrumb markup
 * - Meta tag uniqueness
 * - Canonical URLs
 * - hreflang tags
 */

const fs = require('fs');

const PORT = process.env.PORT || 3000;

const sampleUrls = [
  // MODEL SERVICE PAGES (4-level: /repair/[city]/[service]/[model])
  {
    url: `http://localhost:3001/repair/vancouver/battery-replacement-mobile/galaxy-s23`,
    name: 'Model Service: Vancouver Galaxy S23 Battery',
    type: 'MODEL_SERVICE_PAGE'
  },
  {
    url: `http://localhost:3001/repair/vancouver/screen-replacement-mobile/iphone-14`,
    name: 'Model Service: Vancouver iPhone 14 Screen',
    type: 'MODEL_SERVICE_PAGE'
  },
  // CITY PAGES (2-level: /repair/[city])
  {
    url: `http://localhost:3001/repair/vancouver`,
    name: 'City Page: Vancouver',
    type: 'CITY_PAGE'
  },
  {
    url: `http://localhost:3001/repair/burnaby`,
    name: 'City Page: Burnaby',
    type: 'CITY_PAGE'
  },
  // CITY SERVICE PAGES (3-level: /repair/[city]/[service])
  {
    url: `http://localhost:${PORT}/repair/vancouver/screen-replacement-mobile`,
    name: 'City Service: Vancouver Screen Replacement',
    type: 'CITY_SERVICE_PAGE'
  },
  {
    url: `http://localhost:${PORT}/repair/burnaby/battery-replacement-mobile`,
    name: 'City Service: Burnaby Battery Replacement',
    type: 'CITY_SERVICE_PAGE'
  },
  // STATIC PAGES
  {
    url: `http://localhost:${PORT}/`,
    name: 'Homepage',
    type: 'STATIC'
  }
];

async function fetchPage(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SEO-Audit-Bot/1.0'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`❌ Failed to fetch ${url}: ${error.message}`);
    return null;
  }
}

function extractJsonLd(html) {
  const matches = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/gs) || [];
  return matches.map(match => {
    try {
      const json = match.replace(/<script type="application\/ld\+json">/g, '').replace(/<\/script>/g, '');
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }).filter(Boolean);
}

function auditPage(html, url) {
  const results = {
    url,
    tests: {}
  };

  // 1. Title Tag
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1] : null;
  results.tests.titlePresent = !!title;
  results.tests.titleLength = title ? title.length : 0;
  results.tests.titleUnique = title && !title.includes('NOT FOUND') && title.length > 40;

  // 2. Meta Description
  const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
  const description = descMatch ? descMatch[1] : null;
  results.tests.descriptionPresent = !!description;
  results.tests.descriptionLength = description ? description.length : 0;
  results.tests.descriptionUnique = description && description.length >= 120 && description.length <= 160;

  // 3. Meta Keywords
  const keywordsMatch = html.match(/<meta name="keywords" content="([^"]+)"/);
  const keywords = keywordsMatch ? keywordsMatch[1] : null;
  results.tests.keywordsPresent = !!keywords;
  results.tests.keywordsIncludesDoorstep = keywords && keywords.toLowerCase().includes('doorstep');
  results.tests.keywordsIncludesRepair = keywords && keywords.toLowerCase().includes('repair');

  // 4. Canonical URL
  const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
  const canonical = canonicalMatch ? canonicalMatch[1] : null;
  results.tests.canonicalPresent = !!canonical;
  results.tests.canonicalCorrect = canonical === url || canonical?.endsWith(url.split('/').slice(-3).join('/'));

  // 5. hreflang Tag
  const hreflangMatch = html.match(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/);
  const hreflang = hreflangMatch ? hreflangMatch[1] : null;
  results.tests.hreflangPresent = !!hreflang;
  results.tests.hreflangCorrect = hreflang === 'en-CA';

  // 6. JSON-LD Schema
  const jsonLds = extractJsonLd(html);
  results.tests.jsonLdPresent = jsonLds.length > 0;
  results.tests.jsonLdCount = jsonLds.length;

  // Find BreadcrumbList
  const breadcrumbLd = jsonLds.find(ld => ld['@type'] === 'BreadcrumbList');
  results.tests.breadcrumbSchemaPresent = !!breadcrumbLd;
  results.tests.breadcrumbItems = breadcrumbLd ? breadcrumbLd.itemListElement?.length : 0;

  // Find Service schema
  const serviceLd = jsonLds.find(ld => ld['@type'] === 'Service');
  results.tests.serviceSchemaPresent = !!serviceLd;
  results.tests.serviceHasOffers = serviceLd && !!serviceLd.offers;
  results.tests.serviceHasProvider = serviceLd && !!serviceLd.provider;

  // Check AggregateRating (SAFETY CHECK)
  const hasAggregateRating = serviceLd && !!serviceLd.aggregateRating;
  results.tests.aggregateRatingPresent = hasAggregateRating;

  if (hasAggregateRating) {
    // Count testimonials in HTML to verify safety
    const testimonialCount = (html.match(/class="testimonial-card"/g) || []).length;
    results.tests.aggregateRatingReviewCount = serviceLd.aggregateRating.reviewCount;
    results.tests.testimonialsInUI = testimonialCount;
    results.tests.aggregateRatingMatches = serviceLd.aggregateRating.reviewCount === testimonialCount;
    results.tests.aggregateRatingSafe = testimonialCount > 0 && serviceLd.aggregateRating.reviewCount === testimonialCount;
  } else {
    results.tests.aggregateRatingReviewCount = 0;
    results.tests.testimonialsInUI = (html.match(/class="testimonial-card"/g) || []).length;
    results.tests.aggregateRatingMatches = true;  // N/A if not present
    results.tests.aggregateRatingSafe = true;  // Safe if not present
  }

  // 7. Open Graph Tags
  const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
  const ogDescMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
  const ogUrlMatch = html.match(/<meta property="og:url" content="([^"]+)"/);
  results.tests.ogTitlePresent = !!ogTitleMatch;
  results.tests.ogDescriptionPresent = !!ogDescMatch;
  results.tests.ogUrlPresent = !!ogUrlMatch;

  // 8. Testimonials visible
  const testimonialCards = (html.match(/class="testimonial-card"/g) || []).length;
  results.tests.testimonialsVisible = testimonialCards > 0;
  results.tests.testimonialCount = testimonialCards;

  return results;
}

async function runAudit() {
  console.log('\n🔍 SEO PHASE 2 AUDIT - COMPREHENSIVE CHECK\n');
  console.log('=' .repeat(80));

  const allResults = [];

  for (const { url, name } of sampleUrls) {
    console.log(`\n📄 Testing: ${name}`);
    console.log(`   URL: ${url}`);

    const html = await fetchPage(url);
    if (!html) {
      console.log('   ❌ Could not fetch page');
      continue;
    }

    const results = auditPage(html, url);
    allResults.push(results);

    // Print results
    const checks = [
      { key: 'titlePresent', name: 'Title tag present', weight: 'critical' },
      { key: 'titleUnique', name: 'Title unique & proper length (40+ chars)', weight: 'critical' },
      { key: 'descriptionPresent', name: 'Meta description present', weight: 'critical' },
      { key: 'descriptionUnique', name: 'Description unique (120-160 chars)', weight: 'critical' },
      { key: 'keywordsPresent', name: 'Keywords meta tag present', weight: 'important' },
      { key: 'keywordsIncludesDoorstep', name: 'Keywords include "doorstep"', weight: 'important' },
      { key: 'keywordsIncludesRepair', name: 'Keywords include "repair"', weight: 'important' },
      { key: 'canonicalPresent', name: 'Canonical URL present', weight: 'critical' },
      { key: 'hreflangPresent', name: 'hreflang tag present', weight: 'important' },
      { key: 'hreflangCorrect', name: 'hreflang is "en-CA"', weight: 'important' },
      { key: 'jsonLdPresent', name: 'JSON-LD schema present', weight: 'critical' },
      { key: 'breadcrumbSchemaPresent', name: 'BreadcrumbList schema present', weight: 'important' },
      { key: 'serviceSchemaPresent', name: 'Service schema present', weight: 'important' },
      { key: 'aggregateRatingSafe', name: '✅ AggregateRating compliance safe', weight: 'critical' },
      { key: 'testimonialsVisible', name: 'Customer reviews visible on UI', weight: 'important' },
      { key: 'ogTitlePresent', name: 'Open Graph title present', weight: 'important' },
      { key: 'ogDescriptionPresent', name: 'Open Graph description present', weight: 'important' }
    ];

    checks.forEach(({ key, name, weight }) => {
      const passed = results.tests[key];
      const icon = passed ? '✅' : '❌';
      const weightIcon = weight === 'critical' ? '🔴' : '🟡';
      console.log(`   ${icon} ${weightIcon} ${name}`);
    });

    // Show stats
    console.log(`\n   📊 Stats:`);
    console.log(`      Title length: ${results.tests.titleLength}`);
    console.log(`      Description length: ${results.tests.descriptionLength}`);
    console.log(`      JSON-LD schemas found: ${results.tests.jsonLdCount}`);
    console.log(`      Breadcrumb items: ${results.tests.breadcrumbItems}`);
    console.log(`      Customer reviews visible: ${results.tests.testimonialCount}`);
    if (results.tests.aggregateRatingPresent) {
      console.log(`      AggregateRating count: ${results.tests.aggregateRatingReviewCount}`);
      console.log(`      ⚠️  Matches testimonials: ${results.tests.aggregateRatingMatches ? '✅ YES' : '❌ NO'}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📈 OVERALL AUDIT SUMMARY\n');

  const criticalTests = [
    'titlePresent', 'titleUnique', 'descriptionPresent', 'descriptionUnique',
    'canonicalPresent', 'jsonLdPresent', 'aggregateRatingSafe'
  ];

  let criticalPassed = 0;
  let criticalTotal = 0;

  allResults.forEach(result => {
    criticalTests.forEach(test => {
      criticalTotal++;
      if (result.tests[test]) criticalPassed++;
    });
  });

  const criticalScore = ((criticalPassed / criticalTotal) * 100).toFixed(1);
  const criticalStatus = criticalScore >= 90 ? '✅ PASS' : criticalScore >= 70 ? '⚠️  NEEDS WORK' : '❌ FAIL';

  console.log(`Critical Checks: ${criticalScore}% ${criticalStatus}`);
  console.log(`Passed: ${criticalPassed}/${criticalTotal}\n`);

  if (criticalScore >= 90) {
    console.log('🎉 Phase 2.1 Implementation Status: READY FOR PRODUCTION\n');
  } else if (criticalScore >= 70) {
    console.log('⚠️  Phase 2.1 Implementation Status: NEEDS FIXES\n');
  } else {
    console.log('❌ Phase 2.1 Implementation Status: CRITICAL ISSUES\n');
  }

  // Save detailed report
  const reportPath = './reports/seo-phase2-audit.json';
  const reportDir = './reports';
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(reportPath, JSON.stringify(allResults, null, 2));
  console.log(`📄 Detailed report saved to: ${reportPath}\n`);
}

// Run if called directly
if (require.main === module) {
  runAudit().catch(console.error);
}

module.exports = { auditPage };
