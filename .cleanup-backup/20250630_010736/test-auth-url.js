/**
 * Test script to verify auth URL redirection using environment variables
 * 
 * How to use:
 * 1. Run locally: node test-auth-url.js
 * 2. Deploy to verify production environment variables
 */

// Import directly by creating the function ourselves since we can't use ESM imports in this script
const getSiteUrl = () => {
  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // In production, check for explicit URL or use Vercel URL
  const productionUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 
                         process.env.NEXT_PUBLIC_VERCEL_URL ||
                         'https://travelling-technicians.ca';
  
  // Make sure URL has https:// prefix
  return productionUrl.startsWith('http') ? productionUrl : `https://${productionUrl}`;
};

// Test URL generation
console.log('--------------------------------');
console.log('Auth Redirect URL Tester');
console.log('--------------------------------');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`NEXT_PUBLIC_WEBSITE_URL: ${process.env.NEXT_PUBLIC_WEBSITE_URL || 'undefined'}`);
console.log(`NEXT_PUBLIC_VERCEL_URL: ${process.env.NEXT_PUBLIC_VERCEL_URL || 'undefined'}`);
console.log('--------------------------------');
console.log(`Generated URL: ${getSiteUrl()}`);
console.log('--------------------------------');

// Test callback URL formation
const callbackUrl = `${getSiteUrl()}/auth/callback`;
console.log(`Auth Callback URL: ${callbackUrl}`);
console.log('--------------------------------');

// Recommendations
console.log('Recommendations:');
if (!process.env.NEXT_PUBLIC_WEBSITE_URL) {
  console.log('- Set NEXT_PUBLIC_WEBSITE_URL in your .env.local file for development');
  console.log('  e.g. NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000');
}

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_WEBSITE_URL) {
  console.log('- Set NEXT_PUBLIC_WEBSITE_URL in your Vercel environment variables');
  console.log('  e.g. NEXT_PUBLIC_WEBSITE_URL=https://travellingtechnicians.ca');
}
console.log('--------------------------------'); 