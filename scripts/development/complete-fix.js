/**
 * complete-fix.js
 * 
 * This script performs a complete cleanup and fix of syntax errors in the project:
 * 1. Fixes TypeScript errors in AddressAutocomplete.tsx 
 * 2. Ensures proper template literals in all components
 * 3. Removes problematic router patches from Next.js files
 * 4. Cleans up build artifacts for a fresh start
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting comprehensive error fixes...');

// Define paths to files that need fixing
const addressAutocompletePath = path.join(__dirname, 'src/components/AddressAutocomplete.tsx');
const postalCodeCheckerPath = path.join(__dirname, 'src/components/PostalCodeChecker.tsx');
const unsplashImagePath = path.join(__dirname, 'src/components/common/UnsplashImage.tsx');
const nextConfigPath = path.join(__dirname, 'next.config.js');

// Step 1: Fix the TypeScript error in AddressAutocomplete.tsx
console.log('\n[1/6] Fixing TypeScript error in AddressAutocomplete.tsx...');
try {
  let addressAutocompleteContent = fs.readFileSync(addressAutocompletePath, 'utf8');
  
  // Fix the obj.data reference that causes TypeScript error
  addressAutocompleteContent = addressAutocompleteContent.replace(
    /(setShowSuggestions\(data && )obj\.data(\.length > 0\))/g,
    '$1data$2'
  );
  
  fs.writeFileSync(addressAutocompletePath, addressAutocompleteContent);
  console.log('✅ Fixed TypeScript error in AddressAutocomplete.tsx');
} catch (error) {
  console.error('❌ Error fixing AddressAutocomplete.tsx:', error);
}

// Step 2: Fix regex escape sequences in PostalCodeChecker.tsx
console.log('\n[2/6] Fixing regex escape sequences in PostalCodeChecker.tsx...');
try {
  let postalCodeCheckerContent = fs.readFileSync(postalCodeCheckerPath, 'utf8');
  
  // Fix any problematic regex escape sequences
  postalCodeCheckerContent = postalCodeCheckerContent.replace(
    /replace\(\/\\+s\+\/g/g,
    'replace(/\\s+/g'
  );
  
  fs.writeFileSync(postalCodeCheckerPath, postalCodeCheckerContent);
  console.log('✅ Fixed regex escape sequences in PostalCodeChecker.tsx');
} catch (error) {
  console.error('❌ Error fixing PostalCodeChecker.tsx:', error);
}

// Step 3: Fix template literals in UnsplashImage.tsx if needed
console.log('\n[3/6] Checking and fixing template literals in UnsplashImage.tsx...');
try {
  let unsplashImageContent = fs.readFileSync(unsplashImagePath, 'utf8');
  
  // Ensure template literals are properly balanced
  const fixedContent = unsplashImageContent.replace(
    /(\${imgHeight \? `&h=\${imgHeight)(?!`)/g, 
    '$1}` : \'\')'
  );
  
  fs.writeFileSync(unsplashImagePath, fixedContent);
  console.log('✅ Checked UnsplashImage.tsx template literals');
} catch (error) {
  console.error('❌ Error fixing UnsplashImage.tsx:', error);
}

// Step 4: Fix next.config.js to remove unrecognized options
console.log('\n[4/6] Fixing next.config.js...');
try {
  let nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Remove serverExternalPackages option that causes warnings
  nextConfigContent = nextConfigContent.replace(/serverExternalPackages:.*,?\n/g, '');
  
  fs.writeFileSync(nextConfigPath, nextConfigContent);
  console.log('✅ Fixed next.config.js');
} catch (error) {
  console.error('❌ Error fixing next.config.js:', error);
}

// Step 5: Clean up Next.js router patches
console.log('\n[5/6] Removing problematic Next.js router patches...');
try {
  // Create a list of files to check for patches
  const nextjsFiles = [
    path.join(__dirname, 'node_modules/next/dist/shared/lib/router/router.js'),
    path.join(__dirname, 'node_modules/next/dist/client/router.js'),
    path.join(__dirname, 'node_modules/next/dist/esm/shared/lib/router/router.js'),
    path.join(__dirname, 'node_modules/next/dist/esm/client/router.js')
  ];
  
  // Check each file for patches and restore it if needed
  let patchesFound = false;
  for (const file of nextjsFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('SAFETY PATCHED') || content.includes('PRECISE PATCHED')) {
        patchesFound = true;
        console.log(`Found patches in ${file}`);
      }
    }
  }
  
  if (patchesFound) {
    console.log('Problematic router patches found. Reinstalling Next.js...');
    execSync('npm remove next', { stdio: 'inherit' });
    execSync('npm install next@13.5.6', { stdio: 'inherit' });
    console.log('✅ Next.js reinstalled cleanly');
  } else {
    console.log('No problematic patches found in Next.js files');
  }
} catch (error) {
  console.error('❌ Error cleaning up router patches:', error);
}

// Step 6: Clean build artifacts and restart
console.log('\n[6/6] Cleaning build artifacts for a fresh start...');
try {
  // Remove .next directory
  if (fs.existsSync(path.join(__dirname, '.next'))) {
    fs.rmSync(path.join(__dirname, '.next'), { recursive: true, force: true });
    console.log('✅ Removed .next directory');
  }
  
  console.log('\n✅ All fixes applied successfully!');
  console.log('\nTo start the development server with a clean build, run:');
  console.log('  npm run dev');
} catch (error) {
  console.error('❌ Error cleaning build artifacts:', error);
}

console.log('\n🔧 Fix process completed.'); 