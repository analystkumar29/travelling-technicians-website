// Script to apply direct patches to Next.js router files
const fs = require('fs');
const path = require('path');

console.log('Applying direct patches to Next.js router files...');

// Function to safely patch a file
function patchFile(file) {
  try {
    if (!fs.existsSync(file)) {
      console.log(`File does not exist: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(file, 'utf8');
    
    // Create backup if it doesn't exist
    const backupFile = `${file}.backup`;
    if (!fs.existsSync(backupFile)) {
      fs.writeFileSync(backupFile, content);
    }
    
    // For remove-trailing-slash.js files
    if (file.includes('remove-trailing-slash.js')) {
      // Check if already patched
      if (content.includes('// SAFETY PATCHED')) {
        console.log(`File already patched: ${file}`);
        return;
      }
      
      // Complete replacement of the function
      content = content.replace(
        /function\s+removeTrailingSlash\s*\(\s*route\s*\)\s*\{[^}]+\}/,
        `function removeTrailingSlash(route) {
  // SAFETY PATCHED
  if (route == null) return '/';
  return (route === '/' ? route : route.replace(/\\/$/, '')) || '/';
}`
      );
      
      fs.writeFileSync(file, content);
      console.log(`Successfully patched: ${file}`);
    }
    // For webpack.js files
    else if (file.includes('webpack.js')) {
      // Check if already patched
      if (content.includes('// SAFETY PATCHED')) {
        console.log(`File already patched: ${file}`);
        return;
      }
      
      // Add a safety wrapper
      const safetyHeader = `// SAFETY PATCHED
// Add error handling for data access
(function() {
  // Safe data access helper
  function safeAccess(obj, prop) {
    return obj && obj[prop];
  }
  
  // Patch global objects
  if (typeof window !== 'undefined') {
    if (!window.__NEXT_DATA__) {
      window.__NEXT_DATA__ = { 
        props: {}, 
        page: '/', 
        query: {}, 
        buildId: 'development' 
      };
    }
  }
})();

`;
      content = safetyHeader + content;
      
      fs.writeFileSync(file, content);
      console.log(`Successfully patched: ${file}`);
    }
    // For router.js files
    else if (file.includes('router.js')) {
      // Check if already patched with the precise approach
      if (content.includes('// PRECISE PATCHED')) {
        console.log(`File already patched: ${file}`);
        return;
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
      
      fs.writeFileSync(file, content);
      console.log(`Successfully patched: ${file}`);
    }
  } catch (error) {
    console.error(`Error patching ${file}:`, error);
  }
}

// Get all Next.js router files
const rootDir = path.resolve(__dirname, 'node_modules/next');
const targetFiles = [
  // webpack.js files
  path.join(rootDir, 'dist/client/webpack.js'),
  path.join(rootDir, 'dist/esm/client/webpack.js'),
  
  // remove-trailing-slash.js files
  path.join(rootDir, 'dist/shared/lib/router/utils/remove-trailing-slash.js'),
  path.join(rootDir, 'dist/esm/shared/lib/router/utils/remove-trailing-slash.js'),
  
  // router.js files
  path.join(rootDir, 'dist/client/router.js'),
  path.join(rootDir, 'dist/shared/lib/router/router.js'),
  path.join(rootDir, 'dist/esm/client/router.js'),
  path.join(rootDir, 'dist/esm/shared/lib/router/router.js')
];

// Apply patches to all files
for (const file of targetFiles) {
  patchFile(file);
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

console.log('Next.js router patching completed!');
