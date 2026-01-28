// Test script to check breadcrumb generation
import { createBreadcrumbs } from './src/utils/seoHelpers';

const path = '/repair/vancouver/screen-repair/iphone-14';
const breadcrumbs = createBreadcrumbs(path);
console.log('Breadcrumbs for path:', path);
console.log('Number of items:', breadcrumbs.length);
console.log('Items:', JSON.stringify(breadcrumbs, null, 2));

// Test with shorter path
const path2 = '/repair/vancouver';
const breadcrumbs2 = createBreadcrumbs(path2);
console.log('\nBreadcrumbs for path:', path2);
console.log('Number of items:', breadcrumbs2.length);
console.log('Items:', JSON.stringify(breadcrumbs2, null, 2));

// Test with home path
const path3 = '/';
const breadcrumbs3 = createBreadcrumbs(path3);
console.log('\nBreadcrumbs for path:', path3);
console.log('Number of items:', breadcrumbs3.length);
console.log('Items:', JSON.stringify(breadcrumbs3, null, 2));