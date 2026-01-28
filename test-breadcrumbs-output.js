// Test script to check what createBreadcrumbs returns for repair page paths
require('dotenv').config({ path: '.env.production' });

// Mock the getSiteUrl function behavior
process.env.NEXT_PUBLIC_SITE_URL = 'https://travelling-technicians.ca';

// We need to import the createBreadcrumbs function
// Since it's in TypeScript, we'll require the compiled version or run it differently
// Let's create a simple test that mimics the function logic

function createBreadcrumbs(path) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://travelling-technicians.ca';
  const pathSegments = path.split('/').filter(Boolean);
  
  const breadcrumbs = [
    { name: 'Home', url: siteUrl }
  ];
  
  let currentPath = '';
  
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    
    // Generate friendly names for path segments
    const name = generateBreadcrumbName(segment, currentPath);
    breadcrumbs.push({
      name,
      url: `${siteUrl}${currentPath}`
    });
  }
  
  return breadcrumbs;
}

function generateBreadcrumbName(segment, currentPath) {
  // Name mapping for URL segments
  const nameMap = {
    // Top-level pages
    'repair': 'Repair Services',
    'services': 'Services',
    'about': 'About Us',
    'contact': 'Contact',
    'book-online': 'Book Online',
    'pricing': 'Pricing',
    'service-areas': 'Service Areas',
    'doorstep-repair': 'Doorstep Repair',
    'faq': 'FAQ',
    'privacy-policy': 'Privacy Policy',
    'terms-conditions': 'Terms & Conditions',
    
    // Cities
    'vancouver': 'Vancouver',
    'burnaby': 'Burnaby',
    'richmond': 'Richmond',
    'surrey': 'Surrey',
    'coquitlam': 'Coquitlam',
    'north-vancouver': 'North Vancouver',
    'west-vancouver': 'West Vancouver',
    'new-westminster': 'New Westminster',
    'chilliwack': 'Chilliwack',
    'langley': 'Langley',
    'delta': 'Delta',
    'abbotsford': 'Abbotsford',
    
    // Services
    'screen-repair': 'Screen Repair',
    'battery-replacement': 'Battery Replacement',
    'charging-port-repair': 'Charging Port Repair',
    'laptop-screen-repair': 'Laptop Screen Repair',
    'water-damage-repair': 'Water Damage Repair',
    'software-repair': 'Software Repair',
    'camera-repair': 'Camera Repair',
    
    // Models
    'iphone-14': 'iPhone 14',
    'iphone-15': 'iPhone 15',
    'iphone-13': 'iPhone 13',
    'samsung-galaxy-s23': 'Samsung Galaxy S23',
    'samsung-galaxy-s22': 'Samsung Galaxy S22',
    'google-pixel-7': 'Google Pixel 7',
    'macbook-pro-2023': 'MacBook Pro 2023'
  };
  
  // Check if we have a mapping for this segment
  if (nameMap[segment]) {
    return nameMap[segment];
  }
  
  // Fallback: capitalize words and replace hyphens with spaces
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Test with a repair page path
const testPath = '/repair/vancouver/screen-repair/iphone-14';
console.log('Testing createBreadcrumbs for path:', testPath);
const result = createBreadcrumbs(testPath);
console.log('Result:', JSON.stringify(result, null, 2));
console.log('Number of items:', result.length);
console.log('Items > 1?', result.length > 1);

// Test with another path
const testPath2 = '/repair/burnaby/battery-replacement/samsung-galaxy-s23';
console.log('\nTesting createBreadcrumbs for path:', testPath2);
const result2 = createBreadcrumbs(testPath2);
console.log('Number of items:', result2.length);
console.log('Items > 1?', result2.length > 1);