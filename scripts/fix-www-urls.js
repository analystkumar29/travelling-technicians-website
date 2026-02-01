#!/usr/bin/env node

/**
 * Script to fix non-www URLs to www URLs across the codebase
 * This eliminates 301 redirects and optimizes crawl budget
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');

// Files to search and replace
const filesToFix = [
  // Global SEO configs
  'src/lib/seo-config.ts',
  'src/next-seo.config.ts',
  
  // Static pages with canonical tags
  'src/pages/about.tsx',
  'src/pages/contact.tsx',
  'src/pages/book-online.tsx',
  'src/pages/doorstep-repair.tsx',
  'src/pages/laptop-screen-repair.tsx',
  'src/pages/mobile-repair-near-me.tsx',
  'src/pages/mobile-screen-repair.tsx',
  
  // Blog posts
  'src/pages/blog/index.tsx',
  'src/pages/blog/how-to-extend-your-laptop-battery-life.tsx',
  'src/pages/blog/ultimate-guide-to-screen-protection.tsx',
  'src/pages/blog/water-damage-first-aid-for-devices.tsx',
  
  // Debug API endpoints
  'src/pages/api/debug/env-check.ts',
  'src/pages/api/debug/url-check.ts',
  
  // Structured data components
  'src/components/seo/StructuredData.tsx',
  'src/components/seo/PlaceSchema.tsx',
  'src/components/seo/CityLocalBusinessSchema.tsx',
  
  // Image helpers
  'src/utils/imageHelpers.ts',
];

// Patterns to replace
const patterns = [
  {
    search: 'https://travelling-technicians.ca',
    replace: 'https://www.travelling-technicians.ca'
  },
  {
    search: 'http://travelling-technicians.ca',
    replace: 'https://www.travelling-technicians.ca'
  }
];

function fixFile(filePath) {
  const fullPath = path.join(rootDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;
  let changesMade = 0;
  
  for (const pattern of patterns) {
    const regex = new RegExp(pattern.search, 'g');
    const matches = content.match(regex);
    
    if (matches) {
      changesMade += matches.length;
      content = content.replace(regex, pattern.replace);
    }
  }
  
  if (changesMade > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed ${changesMade} URLs in ${filePath}`);
    return true;
  } else {
    console.log(`✓ No changes needed in ${filePath}`);
    return false;
  }
}

function main() {
  console.log('🔧 Starting www URL fix script...\n');
  
  let totalFilesFixed = 0;
  let totalChanges = 0;
  
  for (const file of filesToFix) {
    try {
      const fixed = fixFile(file);
      if (fixed) totalFilesFixed++;
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Files processed: ${filesToFix.length}`);
  console.log(`   Files fixed: ${totalFilesFixed}`);
  
  // Check sitemap.xml
  const sitemapPath = path.join(rootDir, 'public/sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    const nonWwwUrls = (sitemapContent.match(/https?:\/\/travelling-technicians\.ca/g) || []).length;
    const wwwUrls = (sitemapContent.match(/https?:\/\/www\.travelling-technicians\.ca/g) || []).length;
    
    console.log('\n🗺️  Sitemap Analysis:');
    console.log(`   Non-www URLs: ${nonWwwUrls}`);
    console.log(`   www URLs: ${wwwUrls}`);
    
    if (nonWwwUrls > 0) {
      console.log('⚠️  Warning: Sitemap still contains non-www URLs!');
    }
  }
  
  console.log('\n✅ Script completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Run the build to test changes: npm run build');
  console.log('   2. Deploy to production');
  console.log('   3. Monitor Google Search Console for reduced 301 redirects');
}

if (require.main === module) {
  main();
}

module.exports = { fixFile, patterns };