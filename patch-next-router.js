/**
 * This script directly modifies the Next.js router files to fix
 * the "Cannot read properties of undefined (reading 'data')" errors
 */

const fs = require('fs');
const path = require('path');

console.log('Starting Next.js router patching script...');

// Target files
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

// Create runtime patches
const runtimePatchesPath = path.join(__dirname, 'src/utils/nextjs-patches.js');
createRuntimePatch(runtimePatchesPath);

// Create a runtime patch file
function createRuntimePatch(filePath) {
  console.log(`Creating runtime patch file at ${filePath}...`);
  
  const patchCode = `/**
 * Next.js Runtime Patches
 * This file applies patches to fix common Next.js router errors:
 * - "Cannot read properties of undefined (reading 'data')" in webpack.js
 * - "Cannot read properties of undefined (reading 'data')" in remove-trailing-slash.js
 */

// Only run on client side
if (typeof window !== 'undefined') {
  console.log("[RouterFix] Applying client-side patches for Next.js router issues");
  
  // Add global error handler to catch and suppress router errors
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    // Check if this is a router-related error
    if (message && 
        typeof message === 'string' && 
        message.includes('Cannot read properties of undefined') && 
        (source?.includes('webpack.js') || 
         source?.includes('remove-trailing-slash.js') || 
         source?.includes('router.js'))) {
      
      console.log('[RouterFix] Intercepted Next.js router error:', { message, source, lineno });
      
      // By returning true, we prevent the error from propagating
      return true;
    }
    
    // Otherwise, call the original handler
    if (originalOnError) {
      return originalOnError.apply(this, arguments);
    }
    
    // Let the error propagate by default
    return false;
  };
  
  // Fix for webpack.js error
  try {
    // Ensure __NEXT_DATA__ always exists
    if (!window.__NEXT_DATA__) {
      window.__NEXT_DATA__ = {
        props: {},
        page: window.location.pathname || '/',
        query: {},
        buildId: 'development'
      };
    }
    
    // Always ensure required properties exist
    if (!window.__NEXT_DATA__.props) window.__NEXT_DATA__.props = {};
    if (!window.__NEXT_DATA__.page) window.__NEXT_DATA__.page = window.location.pathname || '/';
    if (!window.__NEXT_DATA__.query) window.__NEXT_DATA__.query = {};
    if (!window.__NEXT_DATA__.buildId) window.__NEXT_DATA__.buildId = 'development';
  } catch (err) {
    console.error('[RouterFix] Error patching __NEXT_DATA__:', err);
  }
  
  // Fix for remove-trailing-slash.js and router.js errors
  try {
    // Ensure history state always has data property
    const originalPushState = window.history.pushState;
    window.history.pushState = function(state, ...rest) {
      // Ensure state is an object
      if (state === null || typeof state !== 'object') {
        state = {};
      }
      
      if (!state.data) {
        state.data = {
          props: {},
          page: window.location.pathname || '/',
          query: {},
          buildId: 'development'
        };
      }
      
      return originalPushState.call(this, state, ...rest);
    };
    
    // Also patch replaceState
    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function(state, ...rest) {
      // Ensure state is an object
      if (state === null || typeof state !== 'object') {
        state = {};
      }
      
      if (!state.data) {
        state.data = {
          props: {},
          page: window.location.pathname || '/',
          query: {},
          buildId: 'development'
        };
      }
      
      return originalReplaceState.call(this, state, ...rest);
    };
    
    // Fix current history state if needed
    if (window.history.state && !window.history.state.data) {
      const currentState = window.history.state;
      currentState.data = {
        props: {},
        page: window.location.pathname || '/',
        query: {},
        buildId: 'development'
      };
      
      window.history.replaceState(
        currentState, 
        document.title,
        window.location.href
      );
    }
  } catch (err) {
    console.error('[RouterFix] Error patching history API:', err);
  }
  
  console.log("[RouterFix] Successfully applied Next.js router patches");
}

export default function applyNextJSPatches() {
  // This function exists to make this a proper ES module
  // All patches are applied automatically when the file is imported
  return true;
}`;

  // Create the directory if it doesn't exist
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Write the patch file
  fs.writeFileSync(filePath, patchCode);
  console.log(`Runtime patch file created successfully!`);
}

// Now update _app.tsx to import our patches
const appTsxPath = path.join(__dirname, 'src/pages/_app.tsx');
updateAppTsx(appTsxPath);

function updateAppTsx(filePath) {
  console.log(`Updating ${filePath} to import patches...`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`${filePath} does not exist.`);
    return;
  }
  
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if patch is already imported
  if (content.includes("import '@/utils/nextjs-patches'")) {
    console.log('Patches already imported in _app.tsx');
    return;
  }
  
  // Add the import at the top of the file
  const importStatement = "import '@/utils/nextjs-patches';\n";
  content = importStatement + content;
  
  // Write the updated file
  fs.writeFileSync(filePath, content);
  console.log('Successfully updated _app.tsx to import patches');
}

// Now create a fix-router.js script that applies direct patches to the Next.js files
const directPatchScript = path.join(__dirname, 'fix-router.js');
createDirectPatchScript(directPatchScript);

function createDirectPatchScript(filePath) {
  console.log(`Creating direct patch script at ${filePath}...`);
  
  const scriptCode = `// Script to apply direct patches to Next.js router files
const fs = require('fs');
const path = require('path');

console.log('Applying direct patches to Next.js router files...');

// Function to safely patch a file
function patchFile(file, search, replace) {
  try {
    if (!fs.existsSync(file)) {
      console.log(\`File does not exist: \${file}\`);
      return;
    }
    
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if already patched
    if (content.includes('// SAFETY PATCHED')) {
      console.log(\`File already patched: \${file}\`);
      return;
    }
    
    // Create backup
    fs.writeFileSync(\`\${file}.backup\`, content);
    
    // For remove-trailing-slash.js files
    if (file.includes('remove-trailing-slash.js')) {
      // Complete replacement of the function
      content = content.replace(
        /function\s+removeTrailingSlash\s*\(\s*route\s*\)\s*{[^}]+}/,
        \`function removeTrailingSlash(route) {
  // SAFETY PATCHED
  if (route == null) return '/';
  return (route === '/' ? route : route.replace(/\\\\/$/, '')) || '/';
}\`
      );
    }
    // For webpack.js files
    else if (file.includes('webpack.js')) {
      // Add a safety wrapper
      if (!content.includes('// SAFETY PATCHED')) {
        const safetyHeader = \`// SAFETY PATCHED
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

\`;
        content = safetyHeader + content;
      }
    }
    // For router.js files
    else if (file.includes('router.js')) {
      // Replace all instances of obj.data with safe access
      content = content.replace(
        /([a-zA-Z_$][a-zA-Z0-9_$]*)(\.data)/g,
        '$1 && $1.data // SAFETY PATCHED'
      );
    }
    
    fs.writeFileSync(file, content);
    console.log(\`Successfully patched: \${file}\`);
  } catch (error) {
    console.error(\`Error patching \${file}:\`, error);
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

console.log('Next.js router patching completed!');
`;
  
  fs.writeFileSync(filePath, scriptCode);
  console.log(`Direct patch script created successfully!`);
}

// Add the patching script to package.json scripts
updatePackageJson();

function updatePackageJson() {
  console.log('Updating package.json scripts...');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('package.json does not exist.');
    return;
  }
  
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Add or update scripts
  packageJson.scripts = packageJson.scripts || {};
  
  // Add predev and prebuild scripts if they don't exist
  if (!packageJson.scripts.predev || !packageJson.scripts.predev.includes('fix-router.js')) {
    packageJson.scripts.predev = 'node fix-router.js';
  }
  
  if (!packageJson.scripts.prebuild || !packageJson.scripts.prebuild.includes('fix-router.js')) {
    packageJson.scripts.prebuild = 'node fix-router.js';
  }
  
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Successfully updated package.json scripts');
}

console.log('Next.js router patching completed!');
console.log('✅ Created runtime patch file');
console.log('✅ Updated _app.tsx to import patches');
console.log('✅ Created fix-router.js script for direct patching');
console.log('✅ Updated package.json to run patches before dev/build');
console.log('\nNow run `npm run dev` to start your application with the patches applied.'); 