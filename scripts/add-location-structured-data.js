#!/usr/bin/env node

/**
 * Script to add structured data to all location pages
 * Run with: node scripts/add-location-structured-data.js
 */

const fs = require('fs');
const path = require('path');

// Location data with coordinates and service areas
const locationData = {
  'burnaby': {
    name: 'The Travelling Technicians - Burnaby',
    description: 'Professional mobile phone and laptop repair services with doorstep service in Burnaby, BC. Serving Metrotown, Brentwood, Lougheed, and surrounding areas.',
    coordinates: { latitude: 49.2488, longitude: -122.9805 },
    areas: ['Burnaby, BC', 'Metrotown', 'Brentwood', 'Lougheed', 'Capitol Hill', 'Heights']
  },
  'richmond': {
    name: 'The Travelling Technicians - Richmond',
    description: 'Professional mobile phone and laptop repair services with doorstep service in Richmond, BC. Serving Richmond Centre, Steveston, Terra Nova, and surrounding areas.',
    coordinates: { latitude: 49.1666, longitude: -123.1336 },
    areas: ['Richmond, BC', 'Richmond Centre', 'Steveston', 'Terra Nova', 'Hamilton', 'Brighouse']
  },
  'coquitlam': {
    name: 'The Travelling Technicians - Coquitlam',
    description: 'Professional mobile phone and laptop repair services with doorstep service in Coquitlam, BC. Serving Port Coquitlam, Port Moody, and surrounding areas.',
    coordinates: { latitude: 49.2838, longitude: -122.7932 },
    areas: ['Coquitlam, BC', 'Port Coquitlam', 'Port Moody', 'Burke Mountain', 'Austin Heights']
  },
  'north-vancouver': {
    name: 'The Travelling Technicians - North Vancouver',
    description: 'Professional mobile phone and laptop repair services with doorstep service in North Vancouver, BC. Serving Lower Lonsdale, Lynn Valley, Deep Cove, and surrounding areas.',
    coordinates: { latitude: 49.3163, longitude: -123.0755 },
    areas: ['North Vancouver, BC', 'Lower Lonsdale', 'Lynn Valley', 'Deep Cove', 'Capilano', 'Seymour']
  },
  'west-vancouver': {
    name: 'The Travelling Technicians - West Vancouver',
    description: 'Professional mobile phone and laptop repair services with doorstep service in West Vancouver, BC. Serving Dundarave, Ambleside, British Properties, and surrounding areas.',
    coordinates: { latitude: 49.3282, longitude: -123.1624 },
    areas: ['West Vancouver, BC', 'Dundarave', 'Ambleside', 'British Properties', 'Hollyburn', 'Caulfeild']
  },
  'new-westminster': {
    name: 'The Travelling Technicians - New Westminster',
    description: 'Professional mobile phone and laptop repair services with doorstep service in New Westminster, BC. Serving Uptown, Downtown, Queens Park, and surrounding areas.',
    coordinates: { latitude: 49.2057, longitude: -122.9110 },
    areas: ['New Westminster, BC', 'Uptown New Westminster', 'Downtown New Westminster', 'Queens Park', 'Sapperton']
  },
  'chilliwack': {
    name: 'The Travelling Technicians - Chilliwack',
    description: 'Professional mobile phone and laptop repair services with doorstep service in Chilliwack, BC. Serving downtown Chilliwack, Sardis, and surrounding areas.',
    coordinates: { latitude: 49.1579, longitude: -121.9514 },
    areas: ['Chilliwack, BC', 'Downtown Chilliwack', 'Sardis', 'Promontory', 'Vedder Crossing']
  }
};

// Template for adding structured data
const generateStructuredDataImport = () => `import { LocalBusinessSchema } from '@/components/seo/StructuredData';`;

const generateStructuredDataHead = (cityKey, cityData) => `      <Head>
        {/* ${cityData.name} Location Structured Data */}
        <LocalBusinessSchema
          name="${cityData.name}"
          description="${cityData.description}"
          address={{
            streetAddress: "${cityKey.charAt(0).toUpperCase() + cityKey.slice(1).replace('-', ' ')} Service Area",
            addressLocality: "${cityKey.charAt(0).toUpperCase() + cityKey.slice(1).replace('-', ' ')}",
            addressRegion: "BC",
            addressCountry: "CA"
          }}
          geo={{
            latitude: ${Number(cityData.coordinates.latitude)},
            longitude: ${Number(cityData.coordinates.longitude)}
          }}
          areaServed={${JSON.stringify(cityData.areas, null, 12).replace(/\n/g, '\n            ')}}
        />
      </Head>`;

// Process each location page
async function addStructuredDataToLocationPages() {
  const repairDir = path.join(__dirname, '../src/pages/repair');
  const files = fs.readdirSync(repairDir).filter(file => file.endsWith('.tsx'));
  
  console.log('🚀 Adding structured data to location pages...\n');
  
  for (const file of files) {
    const cityKey = file.replace('.tsx', '');
    const cityData = locationData[cityKey];
    
    if (!cityData) {
      console.log(`⚠️  No location data found for ${cityKey}, skipping...`);
      continue;
    }
    
    const filePath = path.join(repairDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if structured data already exists
    if (content.includes('LocalBusinessSchema')) {
      console.log(`✅ ${cityKey} already has structured data`);
      continue;
    }
    
    // Add import if not exists
    if (!content.includes('LocalBusinessSchema')) {
      // Find import section and add our import
      const importRegex = /(import.*from 'react-icons\/fa';)/;
      const match = content.match(importRegex);
      if (match) {
        content = content.replace(match[1], match[1] + '\n' + generateStructuredDataImport());
      }
      
      // Also add Head import if not exists
      if (!content.includes('import Head from \'next/head\';')) {
        content = content.replace(
          /import Layout from '@\/components\/layout\/Layout';/,
          `import Layout from '@/components/layout/Layout';\nimport Head from 'next/head';`
        );
      }
    }
    
    // Find the component function and add structured data
    const functionRegex = /export default function \w+\(\) \{\s*return \(\s*(<Layout|<>)/;
    const functionMatch = content.match(functionRegex);
    
    if (functionMatch) {
      if (functionMatch[1] === '<Layout') {
        // Replace with fragment and add Head
        content = content.replace(
          /export default function (\w+)\(\) \{\s*return \(\s*<Layout/,
          `export default function $1() {\n  return (\n    <>\n${generateStructuredDataHead(cityKey, cityData)}\n      <Layout`
        );
        
        // Add closing fragment
        content = content.replace(/    <\/Layout>\s*\);\s*\}/, '    </Layout>\n    </>\n  );\n}');
      } else {
        // Already has fragment, just add Head after <>
        content = content.replace(
          /export default function (\w+)\(\) \{\s*return \(\s*<>/,
          `export default function $1() {\n  return (\n    <>\n${generateStructuredDataHead(cityKey, cityData)}`
        );
      }
      
      console.log(`✅ Added structured data to ${cityKey}`);
    } else {
      console.log(`⚠️  Could not find component function in ${cityKey}`);
      continue;
    }
    
    // Write the updated content back
    fs.writeFileSync(filePath, content);
  }
  
  console.log('\n🎉 Completed adding structured data to location pages!');
}

// Run the script
addStructuredDataToLocationPages().catch(console.error);
