/**
 * Script to directly patch the remove-trailing-slash.js file
 */
const fs = require('fs');
const path = require('path');

console.log('Directly patching remove-trailing-slash.js...');

// Target files
const targets = [
  path.join(__dirname, 'node_modules/next/dist/shared/lib/router/utils/remove-trailing-slash.js'),
  path.join(__dirname, 'node_modules/next/dist/esm/shared/lib/router/utils/remove-trailing-slash.js')
];

let success = 0;

for (const target of targets) {
  if (fs.existsSync(target)) {
    console.log(`Found file: ${target}`);
    
    // Read file content
    let content = fs.readFileSync(target, 'utf8');
    
    // Create backup
    fs.writeFileSync(`${target}.backup`, content);
    console.log(`Created backup: ${target}.backup`);
    
    // Replace the entire function with our safe version
    const safeFunction = `function removeTrailingSlash(route) {
  // SAFETY PATCHED
  if (route == null) return '/';
  return (route === '/' ? route : route.replace(/\\/$/, '')) || '/';
}`;
    
    // Find the function definition
    const functionRegex = /function\s+removeTrailingSlash\s*\(route\)\s*\{[\s\S]*?\}/;
    
    if (functionRegex.test(content)) {
      // Replace the function with our safe version
      content = content.replace(functionRegex, safeFunction);
      
      // Write the patched file
      fs.writeFileSync(target, content);
      console.log(`✅ Successfully patched: ${target}`);
      success++;
    } else {
      console.log(`⚠️ Could not find function in file: ${target}`);
    }
  } else {
    console.log(`⚠️ File not found: ${target}`);
  }
}

if (success > 0) {
  console.log(`\n✅ Successfully patched ${success} files.`);
} else {
  console.log('\n❌ No files were patched.');
} 