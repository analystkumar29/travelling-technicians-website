// Test script to check breadcrumb generation
import { createBreadcrumbs } from './src/utils/seoHelpers.js';

const path = '/repair/vancouver/screen-repair/iphone-14';
const breadcrumbs = createBreadcrumbs(path);
console.log('Breadcrumbs for path:', path);
console.log('Number of items:', breadcrumbs.length);
console.log('Items:', JSON.stringify(breadcrumbs, null, 2));