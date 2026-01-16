#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to update
const filesToUpdate = [
  'src/pages/_document.tsx',
  'src/components/seo/DynamicMeta.tsx',
  'src/components/seo/StructuredData.tsx',
  'src/pages/repair/burnaby.tsx',
  'src/pages/repair/coquitlam.tsx',
  'src/pages/repair/new-westminster.tsx',
  'src/pages/repair/richmond.tsx',
  'src/pages/repair/vancouver.tsx'
];

function updateFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let updated = false;
  
  // Replace logo-orange.png with logo-orange-optimized.webp
  const oldPattern = /\/images\/logo\/logo-orange\.png/g;
  if (oldPattern.test(content)) {
    content = content.replace(oldPattern, '/images/logo/logo-orange-optimized.webp');
    updated = true;
  }
  
  // Replace doorstep-repair-tech.jpg with optimized version
  const doorstepPattern = /\/images\/services\/doorstep-repair-tech\.jpg/g;
  if (doorstepPattern.test(content)) {
    content = content.replace(doorstepPattern, '/images/services/doorstep-repair-tech-optimized.webp');
    updated = true;
  }
  
  if (updated) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  } else {
    console.log(`ℹ️  No changes needed: ${filePath}`);
    return false;
  }
}

console.log('🔧 Fixing remaining logo and image references...\n');

let totalUpdated = 0;

filesToUpdate.forEach(file => {
  if (updateFile(file)) {
    totalUpdated++;
  }
});

console.log(`\n📊 Updated ${totalUpdated} files`);

// Also check if there are any remaining issues
console.log('\n🔍 Checking for remaining issues...');

const { execSync } = require('child_process');

try {
  const result = execSync('grep -r "logo-orange\\.png" src/ || echo "No remaining logo-orange.png references"', { encoding: 'utf8' });
  console.log('Logo check:', result.trim());
} catch (e) {
  console.log('✅ No remaining logo-orange.png references');
}

try {
  const result = execSync('grep -r "doorstep-repair-tech\\.jpg" src/ || echo "No remaining doorstep-repair-tech.jpg references"', { encoding: 'utf8' });
  console.log('Doorstep image check:', result.trim());
} catch (e) {
  console.log('✅ No remaining doorstep-repair-tech.jpg references');
}

console.log('\n🏁 Logo reference fixes complete!');
