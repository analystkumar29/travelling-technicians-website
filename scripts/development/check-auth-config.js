/**
 * Check authentication configuration for common issues
 * Run this before deploying to Vercel to catch auth-related problems
 */

const fs = require('fs');
const path = require('path');

// Import getSiteUrl function
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

// Check if auth callback page exists
const callbackPagePath = path.join(__dirname, 'src', 'pages', 'auth', 'callback.tsx');
const hasCallbackPage = fs.existsSync(callbackPagePath);

// Check if .env file has required variables
const envPath = path.join(__dirname, '.env');
const envLocalPath = path.join(__dirname, '.env.local');
let hasWebsiteUrl = false;

// Check in .env file
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('NEXT_PUBLIC_WEBSITE_URL=')) {
    hasWebsiteUrl = true;
  }
}

// Check in .env.local file
if (fs.existsSync(envLocalPath)) {
  const envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
  if (envLocalContent.includes('NEXT_PUBLIC_WEBSITE_URL=')) {
    hasWebsiteUrl = true;
  }
}

// Display results
console.log('=================================');
console.log('Authentication Config Check');
console.log('=================================');
console.log(`Auth Callback Page: ${hasCallbackPage ? '✅ Found' : '❌ Missing'}`);
console.log(`NEXT_PUBLIC_WEBSITE_URL: ${hasWebsiteUrl ? '✅ Found in env files' : '❌ Not found in env files'}`);
console.log(`Current Site URL: ${getSiteUrl()}`);
console.log('=================================');

// Display recommendations
console.log('Recommendations:');

if (!hasCallbackPage) {
  console.log('❗ Create an auth callback page at src/pages/auth/callback.tsx');
}

if (!hasWebsiteUrl) {
  console.log('❗ Add NEXT_PUBLIC_WEBSITE_URL to your .env file or Vercel environment variables');
  console.log('   For production: NEXT_PUBLIC_WEBSITE_URL=https://travelling-technicians.ca');
}

console.log('\nFor Vercel deployment:');
console.log('1. Add NEXT_PUBLIC_WEBSITE_URL to your Vercel environment variables');
console.log('2. Make sure you have a callback page at /auth/callback');
console.log('3. Update your Supabase project settings to use the correct site URL');
console.log('=================================');

// Check for potential build errors
console.log('\nChecking for potential build errors...');
try {
  const supabaseClientPath = path.join(__dirname, 'src', 'utils', 'supabaseClient.ts');
  if (fs.existsSync(supabaseClientPath)) {
    const supabaseClientContent = fs.readFileSync(supabaseClientPath, 'utf8');
    
    if (supabaseClientContent.includes('redirectTo:') && !supabaseClientContent.includes('cookieOptions:')) {
      console.log('❌ Error: supabaseClient.ts uses redirectTo without cookieOptions. This will cause a build error.');
      console.log('   Update the auth configuration to use cookieOptions and site_url instead.');
    } else {
      console.log('✅ supabaseClient.ts configuration looks correct');
    }
  }
} catch (error) {
  console.error('Error checking supabaseClient.ts:', error.message);
}

console.log('================================='); 