// Simple test script to check breadcrumb generation without loading supabase
// We'll manually test the createBreadcrumbs logic

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://travelling-technicians.ca';
}

function generateBreadcrumbName(segment: string): string {
  // Simplified version from seoHelpers.ts
  const nameMap: Record<string, string> = {
    'repair': 'Repair',
    'vancouver': 'Vancouver',
    'screen-repair': 'Screen Repair',
    'iphone-14': 'iPhone 14',
    'battery-replacement': 'Battery Replacement',
    'coquitlam': 'Coquitlam',
    'richmond': 'Richmond',
    'surrey': 'Surrey',
    'burnaby': 'Burnaby',
    'new-westminster': 'New Westminster',
    'north-vancouver': 'North Vancouver',
    'west-vancouver': 'West Vancouver',
  };
  
  return nameMap[segment] || segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function createBreadcrumbs(path: string): Array<{name: string; url: string}> {
  const siteUrl = getSiteUrl();
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs: Array<{name: string; url: string}> = [];
  
  // Always start with home
  breadcrumbs.push({
    name: 'Home',
    url: siteUrl,
  });
  
  let currentUrl = siteUrl;
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentUrl = `${currentUrl}/${segment}`;
    
    breadcrumbs.push({
      name: generateBreadcrumbName(segment),
      url: currentUrl,
    });
  }
  
  return breadcrumbs;
}

// Run tests
console.log('Testing breadcrumb generation...\n');

const testPaths = [
  '/repair/vancouver/screen-repair/iphone-14',
  '/repair/vancouver',
  '/',
  '/repair/coquitlam/battery-replacement/iphone-13',
];

for (const path of testPaths) {
  const breadcrumbs = createBreadcrumbs(path);
  console.log(`Path: ${path}`);
  console.log(`Number of items: ${breadcrumbs.length}`);
  console.log('Items:');
  breadcrumbs.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.name} -> ${item.url}`);
  });
  console.log('');
}

// Check the specific case from our repair page
const repairPath = '/repair/vancouver/screen-repair/iphone-14';
const repairBreadcrumbs = createBreadcrumbs(repairPath);
console.log(`\nFor repair page path "${repairPath}":`);
console.log(`- Items length: ${repairBreadcrumbs.length}`);
console.log(`- Should render Breadcrumbs component: ${repairBreadcrumbs.length > 1 ? 'YES' : 'NO'}`);