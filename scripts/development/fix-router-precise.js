/**
 * Script to directly patch the router.js file with precise replacements
 */
const fs = require('fs');
const path = require('path');

console.log('🔧 Applying precise fixes to Next.js router files...');

// Target files
const targets = [
  path.join(__dirname, 'node_modules/next/dist/shared/lib/router/router.js'),
  path.join(__dirname, 'node_modules/next/dist/esm/shared/lib/router/router.js')
];

// Specific targeted replacements to avoid syntax errors
const replacements = [
  {
    search: /const data = await options\.fetchData\(\);/g,
    replace: 'const data = await options.fetchData(); if (!data) return { dataHref: \'\', json: null, response: null };'
  },
  {
    search: /state\.data/g,
    replace: '(state && state.data)'
  },
  {
    search: /cache\.data/g, 
    replace: '(cache && cache.data)'
  },
  {
    search: /routeInfo\.data/g,
    replace: '(routeInfo && routeInfo.data)'
  },
  {
    search: /data\.data/g,
    replace: '(data && data.data)'
  },
  {
    search: /props\.data/g,
    replace: '(props && props.data)'
  }
];

let success = 0;

for (const target of targets) {
  if (fs.existsSync(target)) {
    console.log(`Found file: ${target}`);
    
    // Read file content
    let content = fs.readFileSync(target, 'utf8');
    
    // Create backup if it doesn't exist
    const backupPath = `${target}.backup.original`;
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, content);
      console.log(`Created original backup: ${backupPath}`);
    }
    
    // Create a working backup
    fs.writeFileSync(`${target}.backup`, content);
    
    // Apply each replacement
    let patched = false;
    for (const { search, replace } of replacements) {
      if (search.test(content)) {
        content = content.replace(search, replace);
        patched = true;
      }
    }
    
    if (patched) {
      // Add header indicating file was patched
      content = `// PATCHED FOR ROUTER DATA SAFETY\n${content}`;
      
      // Write the patched file
      fs.writeFileSync(target, content);
      console.log(`✅ Successfully patched: ${target}`);
      success++;
    } else {
      console.log(`⚠️ No matching patterns found in file: ${target}`);
    }
  } else {
    console.log(`⚠️ File not found: ${target}`);
  }
}

// Also apply the safe remove-trailing-slash.js patch which is known to work
const trailingSlashTargets = [
  path.join(__dirname, 'node_modules/next/dist/shared/lib/router/utils/remove-trailing-slash.js'),
  path.join(__dirname, 'node_modules/next/dist/esm/shared/lib/router/utils/remove-trailing-slash.js')
];

for (const target of trailingSlashTargets) {
  if (fs.existsSync(target)) {
    console.log(`Found file: ${target}`);
    
    // Read file content
    let content = fs.readFileSync(target, 'utf8');
    
    // Create backup if it doesn't exist
    const backupPath = `${target}.backup.original`;
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, content);
      console.log(`Created original backup: ${backupPath}`);
    }
    
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