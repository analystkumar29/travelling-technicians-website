const fs = require('fs');
const path = require('path');

// Files to patch
const webpackJsFile = path.join(__dirname, 'node_modules/next/dist/client/webpack.js');
const webpackJsBackupFile = path.join(__dirname, 'node_modules/next/dist/client/webpack.js.backup');
const removeTrailingSlashJsFile = path.join(__dirname, 'node_modules/next/dist/shared/lib/router/utils/remove-trailing-slash.js');
const esmWebpackJsFile = path.join(__dirname, 'node_modules/next/dist/esm/client/webpack.js');
const esmRemoveTrailingSlashJsFile = path.join(__dirname, 'node_modules/next/dist/esm/shared/lib/router/utils/remove-trailing-slash.js');

// Function to safely patch a file
function patchFile(filePath, searchPattern, replacement) {
  console.log(`Patching ${filePath}...`);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File doesn't exist: ${filePath}`);
      return false;
    }
    
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already patched
    if (content.includes('// PATCHED BY SCRIPT')) {
      console.log(`File already patched: ${filePath}`);
      return true;
    }
    
    // Create backup
    fs.writeFileSync(`${filePath}.backup`, content);
    
    // Apply patch
    const patchedContent = content.replace(searchPattern, replacement);
    
    // Only write if something changed
    if (patchedContent !== content) {
      fs.writeFileSync(filePath, patchedContent);
      console.log(`Successfully patched: ${filePath}`);
      return true;
    } else {
      console.log(`Pattern not found in: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error patching ${filePath}:`, error);
    return false;
  }
}

// Manually patch webpack.js files
function manuallyPatchWebpackJs(filePath) {
  console.log(`Manually patching webpack.js: ${filePath}...`);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File doesn't exist: ${filePath}`);
      return false;
    }
    
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already patched
    if (content.includes('// MANUALLY PATCHED BY SCRIPT')) {
      console.log(`File already manually patched: ${filePath}`);
      return true;
    }
    
    // Create backup
    if (!fs.existsSync(`${filePath}.backup`)) {
      fs.writeFileSync(`${filePath}.backup`, content);
    }
    
    // Add a safety wrapper at the beginning of the file
    const safetyWrapper = `// MANUALLY PATCHED BY SCRIPT
// This is a safety wrapper to prevent "Cannot read properties of undefined (reading 'data')" errors
(function() {
  const originalRequire = __webpack_require__;
  __webpack_require__ = function(...args) {
    try {
      return originalRequire.apply(this, args);
    } catch (error) {
      if (error && error.message && error.message.includes("Cannot read properties of undefined (reading 'data')")) {
        console.warn("[PATCHED] Caught and handled webpack error:", error.message);
        return { data: {} }; // Return safe fallback
      }
      throw error; // Re-throw other errors
    }
  };
  // Copy all properties from the original require
  Object.keys(originalRequire).forEach(key => {
    __webpack_require__[key] = originalRequire[key];
  });
})();

`;
    
    // Prepend the safety wrapper
    fs.writeFileSync(filePath, safetyWrapper + content);
    console.log(`Successfully manually patched: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error manually patching ${filePath}:`, error);
    return false;
  }
}

// Patch router.js files to handle the "data" access
function patchRouterJs(filePath) {
  console.log(`Patching router.js: ${filePath}...`);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File doesn't exist: ${filePath}`);
      return false;
    }
    
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already patched
    if (content.includes('// PATCHED ROUTER BY SCRIPT')) {
      console.log(`Router file already patched: ${filePath}`);
      return true;
    }
    
    // Create backup
    fs.writeFileSync(`${filePath}.backup`, content);
    
    // Replace all instances of "state.data" with "state && state.data"
    const patchedContent = content.replace(/(\w+)\.data/g, '($1 && $1.data) // PATCHED ROUTER BY SCRIPT');
    
    // Only write if something changed
    if (patchedContent !== content) {
      fs.writeFileSync(filePath, patchedContent);
      console.log(`Successfully patched router: ${filePath}`);
      return true;
    } else {
      console.log(`No data references found in: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error patching router ${filePath}:`, error);
    return false;
  }
}

// Patch remove-trailing-slash.js - completely replace the function with a safe version
const removeTrailingSlashPattern = /function removeTrailingSlash\(route\) {[^}]+}/;
const removeTrailingSlashReplacement = `function removeTrailingSlash(route) {
  // PATCHED BY SCRIPT
  if (route == null) return '/';
  return (route === '/' ? route : route.replace(/\\/$/, '')) || '/';
}`;

// Apply patches
console.log('Starting to patch Next.js files...');

// Manually patch webpack.js files
manuallyPatchWebpackJs(webpackJsFile);
manuallyPatchWebpackJs(esmWebpackJsFile);

// Patch router.js files
const routerJsFiles = [
  path.join(__dirname, 'node_modules/next/dist/client/router.js'),
  path.join(__dirname, 'node_modules/next/dist/shared/lib/router/router.js'),
  path.join(__dirname, 'node_modules/next/dist/esm/client/router.js'),
  path.join(__dirname, 'node_modules/next/dist/esm/shared/lib/router/router.js')
];

for (const routerFile of routerJsFiles) {
  patchRouterJs(routerFile);
}

// Patch remove-trailing-slash.js files
patchFile(removeTrailingSlashJsFile, removeTrailingSlashPattern, removeTrailingSlashReplacement);
patchFile(esmRemoveTrailingSlashJsFile, removeTrailingSlashPattern, removeTrailingSlashReplacement);

console.log('Next.js patching completed!'); 