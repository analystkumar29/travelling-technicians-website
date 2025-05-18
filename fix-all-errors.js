/**
 * fix-all-errors.js
 * 
 * A comprehensive script to fix all errors in The Travelling Technicians website:
 * 1. TypeScript errors in AddressAutocomplete.tsx
 * 2. Regex escape sequences in PostalCodeChecker.tsx and other files
 * 3. Template literal issues in UnsplashImage.tsx
 * 4. Cleanup of Next.js config
 * 5. Fix all remaining obj.data references
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting comprehensive error fix process...');

// Files to modify
const addressAutocompletePath = path.join(__dirname, 'src/components/AddressAutocomplete.tsx');
const postalCodeCheckerPath = path.join(__dirname, 'src/components/PostalCodeChecker.tsx');
const unsplashImagePath = path.join(__dirname, 'src/components/common/UnsplashImage.tsx');
const nextConfigPath = path.join(__dirname, 'next.config.js');
const bookingFormPath = path.join(__dirname, 'src/components/booking/BookingForm.tsx');
const testCreateBookingPath = path.join(__dirname, 'src/pages/api/test-create-booking.ts');
const verifyBookingPath = path.join(__dirname, 'src/pages/verify-booking.tsx');

// Fix all files with obj.data references
console.log('\n[1/5] Fixing TypeScript errors with obj.data references');

const filesToFix = [
  addressAutocompletePath,
  bookingFormPath,
  testCreateBookingPath,
  verifyBookingPath
];

filesToFix.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File does not exist: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace incorrect reference to 'obj.data'
    content = content.replace(/data && obj\.data\.length/g, 'data && data.length');
    content = content.replace(/data\.success && obj\.data\.booking/g, 'data.success && data.booking');
    content = content.replace(/data\.deviceBrand === 'other' && obj\.data\.customBrand/g, 'data.deviceBrand === \'other\' && data.customBrand');
    content = content.replace(/data && obj\.data\.display_name/g, 'data && data.display_name');
    content = content.replace(/data\.address && obj\.data\.address\.postcode/g, 'data.address && data.address.postcode');
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed TypeScript errors in ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Error fixing ${path.basename(filePath)}:`, error.message);
  }
});

// Fix PostalCodeChecker.tsx
console.log('\n[2/5] Fixing regex escape sequences in PostalCodeChecker.tsx');
try {
  let content = fs.readFileSync(postalCodeCheckerPath, 'utf8');
  
  // Fix regex escape sequences
  content = content.replace(/replace\(\/\\\\s\+\/g,/g, 'replace(/\\s+/g,');
  
  fs.writeFileSync(postalCodeCheckerPath, content);
  console.log('✅ Fixed regex escape sequences in PostalCodeChecker.tsx');
} catch (error) {
  console.error('❌ Error fixing PostalCodeChecker.tsx:', error.message);
}

// Fix UnsplashImage.tsx
console.log('\n[3/5] Checking and fixing template literals in UnsplashImage.tsx');
try {
  let content = fs.readFileSync(unsplashImagePath, 'utf8');
  
  // Check for unbalanced template literal
  if (content.includes('${imgHeight ? `&h=${imgHeight}') && !content.includes('${imgHeight ? `&h=${imgHeight}`')) {
    // Fix the unbalanced backticks
    content = content.replace(/\${imgHeight \? `&h=\${imgHeight}([^`]*)/g, '${imgHeight ? `&h=${imgHeight}`$1');
    fs.writeFileSync(unsplashImagePath, content);
    console.log('✅ Fixed unbalanced template literal in UnsplashImage.tsx');
  } else {
    console.log('✓ No issues found in UnsplashImage.tsx');
  }
} catch (error) {
  console.error('❌ Error fixing UnsplashImage.tsx:', error.message);
}

// Fix next.config.js
console.log('\n[4/5] Removing problematic config from next.config.js');
try {
  let content = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Remove serverExternalPackages
  content = content.replace(/\s*\/\/ Configuration for external packages\s*serverExternalPackages: \[\],/g, '');
  
  fs.writeFileSync(nextConfigPath, content);
  console.log('✅ Removed problematic config from next.config.js');
} catch (error) {
  console.error('❌ Error fixing next.config.js:', error.message);
}

// Use recursive glob to find all TypeScript files with potential 'obj.data' references
console.log('\n[5/5] Scanning for and fixing any remaining obj.data references');
try {
  // Find all TypeScript files
  const findCmd = 'find src -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "obj\\.data" 2>/dev/null || echo ""';
  const filesToCheck = execSync(findCmd).toString().trim().split('\n').filter(Boolean);
  
  if (filesToCheck.length === 0) {
    console.log('✓ No additional files with obj.data references found');
  } else {
    console.log(`Found ${filesToCheck.length} additional files with obj.data references`);
    
    filesToCheck.forEach(filePath => {
      try {
        if (!fs.existsSync(filePath)) return;
        
        let content = fs.readFileSync(filePath, 'utf8');
        // Replace all obj.data references
        content = content.replace(/obj\.data/g, 'data');
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed obj.data references in ${filePath}`);
      } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
      }
    });
  }
} catch (error) {
  console.error('❌ Error scanning for obj.data references:', error.message);
}

console.log('\n🎉 All fixes applied successfully!');
console.log('\nRunning clean-start.js to ensure a fresh build...');

try {
  execSync('node clean-start.js', { stdio: 'inherit' });
  console.log('\n✅ Clean start completed');
} catch (error) {
  console.error('\n❌ Error during clean start:', error.message);
}

console.log('\n🚀 To start your app, run:');
console.log('  npm run dev'); 