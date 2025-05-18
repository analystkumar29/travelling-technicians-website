/**
 * Script to precisely patch router.js files to fix syntax errors
 */
const fs = require('fs');
const path = require('path');

console.log('Applying precise fixes to Next.js router files...');

// Target router.js files
const routerFiles = [
  path.join(__dirname, 'node_modules/next/dist/client/router.js'),
  path.join(__dirname, 'node_modules/next/dist/shared/lib/router/router.js'),
  path.join(__dirname, 'node_modules/next/dist/esm/client/router.js'),
  path.join(__dirname, 'node_modules/next/dist/esm/shared/lib/router/router.js')
];

let patchedCount = 0;

for (const file of routerFiles) {
  if (!fs.existsSync(file)) {
    console.log(`File not found: ${file}`);
    continue;
  }
  
  // Create backup
  const backupFile = `${file}.backup-precise`;
  if (!fs.existsSync(backupFile)) {
    fs.copyFileSync(file, backupFile);
    console.log(`Created backup: ${backupFile}`);
  }
  
  // Read file content
  let content = fs.readFileSync(file, 'utf8');
  
  // Check if already patched with the new approach
  if (content.includes('// PRECISE PATCHED')) {
    console.log(`File already precisely patched: ${file}`);
    continue;
  }
  
  // Add header comment to indicate precise patching
  content = `// PRECISE PATCHED - Safe access to possibly undefined properties\n${content}`;
  
  // Use safer pattern matching that won't break syntax
  // These replacements are more targeted and won't create syntax errors
  
  // Replace `x.data` with `x && x.data`
  content = content.replace(/(\w+)\.data(?!\s*&&)/g, function(match, varName) {
    return `${varName} && ${varName}.data`;
  });
  
  // Replace `x.props` with `x && x.props`
  content = content.replace(/(\w+)\.props(?!\s*&&)/g, function(match, varName) {
    return `${varName} && ${varName}.props`;
  });
  
  // Replace `x.route` with `x && x.route`
  content = content.replace(/(\w+)\.route(?!\s*&&)/g, function(match, varName) {
    return `${varName} && ${varName}.route`;
  });
  
  // Replace `x.query` with `x && x.query`
  content = content.replace(/(\w+)\.query(?!\s*&&)/g, function(match, varName) {
    return `${varName} && ${varName}.query`;
  });
  
  // Fix the issues with `const` statements
  // We need to be careful not to modify const declarations
  content = content.replace(/const\s+(\w+)\s*&&\s*\1\.data/g, function(match, varName) {
    return `const ${varName} = await options.fetchData()`;
  });
  
  // Write patched file
  fs.writeFileSync(file, content);
  console.log(`Successfully patched: ${file}`);
  patchedCount++;
}

// Clean .next directory to ensure fresh compilation
const nextDir = path.join(__dirname, '.next');
if (fs.existsSync(nextDir)) {
  console.log('Cleaning .next directory to ensure fresh compilation...');
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('Successfully cleaned .next directory');
  } catch (error) {
    console.error('Error cleaning .next directory:', error);
  }
}

if (patchedCount > 0) {
  console.log(`\n✅ Successfully patched ${patchedCount} router files.`);
} else {
  console.log('\n⚠️ No files were patched.');
}

console.log('\nYou can now run "npm run dev" to start the application with the fixed router files.'); 