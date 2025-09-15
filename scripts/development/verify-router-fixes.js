#!/usr/bin/env node

/**
 * This script verifies that our Next.js router fixes are working correctly
 * by checking for the existence of patched files and runtime protections.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🔍 Verifying Next.js router fixes...\n');

// Verify that all required files exist
const requiredFiles = [
  'src/utils/nextjs-patches.js',
  'src/components/RouterErrorGuard.tsx', 
  'src/hooks/useSafeRouter.ts',
  'src/utils/errorHandling.ts',
  'src/pages/_document.tsx',
  'fix-router.js',
  'start-dev-stable.js'
];

console.log('Checking required files:');
let missingFiles = false;

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} (MISSING)`);
    missingFiles = true;
  }
}

if (missingFiles) {
  console.error('\n⚠️  Some required files are missing! The router fixes may not work correctly.');
} else {
  console.log('\n✅ All required files are present.');
}

// Check for correct imports in _app.tsx
console.log('\nChecking for correct imports in _app.tsx:');
const appTsxPath = path.join(__dirname, 'src/pages/_app.tsx');
let appMissingImports = false;

if (fs.existsSync(appTsxPath)) {
  const appTsxContent = fs.readFileSync(appTsxPath, 'utf8');
  
  const checks = [
    { name: 'nextjs-patches import', pattern: /import ['"]@\/utils\/nextjs-patches['"]/ },
    { name: 'RouterErrorGuard component', pattern: /import RouterErrorGuard from ['"]@\/components\/RouterErrorGuard['"]/ },
    { name: 'RouterErrorGuard usage', pattern: /<RouterErrorGuard\s*\/?>/ }
  ];
  
  for (const check of checks) {
    if (check.pattern.test(appTsxContent)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} (MISSING)`);
      appMissingImports = true;
    }
  }
  
  if (appMissingImports) {
    console.error('\n⚠️  _app.tsx is missing some required imports or components!');
  } else {
    console.log('\n✅ _app.tsx has all required imports and components.');
  }
} else {
  console.error(`❌ _app.tsx file not found!`);
  appMissingImports = true;
}

// Check package.json scripts
console.log('\nChecking package.json scripts:');
const packageJsonPath = path.join(__dirname, 'package.json');
let missingScripts = false;

if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredScripts = [
    { name: 'predev', expected: 'node fix-router.js' },
    { name: 'prebuild', expected: 'node fix-router.js' },
    { name: 'dev:stable', expected: 'node start-dev-stable.js' }
  ];
  
  for (const script of requiredScripts) {
    if (packageJson.scripts && packageJson.scripts[script.name] === script.expected) {
      console.log(`✅ ${script.name}`);
    } else {
      console.log(`❌ ${script.name} (INCORRECT OR MISSING)`);
      missingScripts = true;
    }
  }
  
  if (missingScripts) {
    console.error('\n⚠️  Some required scripts are missing or incorrect in package.json!');
  } else {
    console.log('\n✅ All required scripts are correctly configured in package.json.');
  }
} else {
  console.error(`❌ package.json file not found!`);
  missingScripts = true;
}

// Check for Next.js patched files
console.log('\nChecking for patched Next.js files:');
const patchedFiles = [
  'node_modules/next/dist/shared/lib/router/utils/remove-trailing-slash.js',
  'node_modules/next/dist/client/webpack.js'
];

let unpatchedFiles = false;

for (const file of patchedFiles) {
  const filePath = path.join(__dirname, file);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('SAFETY PATCHED') || 
        content.includes('// Patched') || 
        content.includes('if (route == null) return') ||
        content.includes('route == null')) {
      console.log(`✅ ${file} (PATCHED)`);
    } else {
      console.log(`❌ ${file} (NOT PATCHED)`);
      unpatchedFiles = true;
    }
  } else {
    console.log(`⚠️ ${file} (NOT FOUND)`);
    unpatchedFiles = true;
  }
}

if (unpatchedFiles) {
  console.log('\n⚠️ Some Next.js files are not patched. Try running:');
  console.log('    node fix-router.js');
} else {
  console.log('\n✅ Next.js files are correctly patched.');
}

// Final summary
console.log('\n-----------------------------------------');
if (missingFiles || appMissingImports || missingScripts || unpatchedFiles) {
  console.log('⚠️  Some issues were found with the router fixes.');
  console.log('   Please address the issues above to ensure stability.');
} else {
  console.log('✅ All router fixes are correctly implemented and applied!');
  console.log('   Your Next.js application should be protected against common router errors.');
}
console.log('-----------------------------------------\n');

// Provide recommended next steps
console.log('Recommended next steps:');
console.log('1. Run `node fix-router.js` to apply direct patches');
console.log('2. Use `npm run dev:stable` for development');
console.log('3. Test navigation between pages to verify stability');
console.log('4. Visit /examples/safe-router-usage to see the safe router hook in action\n'); 