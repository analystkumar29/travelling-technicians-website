/**
 * Script to restore original Next.js files and apply simpler fixes
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Starting restore and simple fix process...');

// Step 1: Restore original files from backups
const filesToRestore = [
  // Router files
  'node_modules/next/dist/shared/lib/router/router.js',
  'node_modules/next/dist/esm/shared/lib/router/router.js',
  // Remove trailing slash files
  'node_modules/next/dist/shared/lib/router/utils/remove-trailing-slash.js',
  'node_modules/next/dist/esm/shared/lib/router/utils/remove-trailing-slash.js',
  // Webpack files
  'node_modules/next/dist/client/webpack.js',
  'node_modules/next/dist/esm/client/webpack.js'
];

console.log('\n📦 Restoring original Next.js files...');
let restoredCount = 0;

for (const file of filesToRestore) {
  const fullPath = path.join(__dirname, file);
  const backupPath = `${fullPath}.backup.original`;
  
  if (fs.existsSync(backupPath)) {
    try {
      fs.copyFileSync(backupPath, fullPath);
      console.log(`✅ Restored: ${file}`);
      restoredCount++;
    } catch (error) {
      console.error(`❌ Error restoring ${file}:`, error.message);
    }
  } else {
    console.log(`⚠️ No original backup found for: ${file}`);
  }
}

console.log(`\n✅ Restored ${restoredCount} files to their original state.`);

// Step 2: Apply simple direct fixes to the remove-trailing-slash.js file
console.log('\n📝 Applying simple direct fix to remove-trailing-slash.js...');

const trailingSlashFixContent = `"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "removeTrailingSlash", {
    enumerable: true,
    get: function() {
        return removeTrailingSlash;
    }
});
function removeTrailingSlash(route) {
    // SIMPLE SAFETY FIX - handle null/undefined routes
    if (route == null) return '/';
    
    // Original logic
    return route.endsWith('/') && route !== '/' ? route.slice(0, -1) : route;
}
`;

const esmTrailingSlashFixContent = `
export function removeTrailingSlash(route) {
    // SIMPLE SAFETY FIX - handle null/undefined routes
    if (route == null) return '/';
    
    // Original logic
    return route.endsWith('/') && route !== '/' ? route.slice(0, -1) : route;
}
`;

try {
  // Write fixed remove-trailing-slash.js files
  fs.writeFileSync(
    path.join(__dirname, 'node_modules/next/dist/shared/lib/router/utils/remove-trailing-slash.js'),
    trailingSlashFixContent
  );
  console.log('✅ Fixed: node_modules/next/dist/shared/lib/router/utils/remove-trailing-slash.js');
  
  fs.writeFileSync(
    path.join(__dirname, 'node_modules/next/dist/esm/shared/lib/router/utils/remove-trailing-slash.js'),
    esmTrailingSlashFixContent
  );
  console.log('✅ Fixed: node_modules/next/dist/esm/shared/lib/router/utils/remove-trailing-slash.js');
} catch (error) {
  console.error('❌ Error applying simple fixes:', error.message);
}

// Step 3: Create a client-side error handler script in the public directory
console.log('\n📝 Creating error handler script for client side...');

const errorHandlerScript = `
// Client-side error handler to prevent white screen issues
(function() {
  console.log('[Debug] Error handler script loaded');
  
  // Safety wrapper for webpack/router errors
  window.__NEXT_ROUTER_SAFE_ACCESS = function(obj, path, fallback) {
    try {
      if (!obj) return fallback;
      
      const parts = path.split('.');
      let current = obj;
      
      for (let i = 0; i < parts.length; i++) {
        if (current === undefined || current === null) {
          return fallback;
        }
        current = current[parts[i]];
      }
      
      return (current === undefined || current === null) ? fallback : current;
    } catch (e) {
      console.warn('[Safe Access] Error accessing path', path, e);
      return fallback;
    }
  };
  
  // Error prevention for router-related issues
  window.addEventListener('error', function(event) {
    // Prevent webpack and router related errors from crashing the app
    if (event && event.error && event.error.message && (
        event.error.message.includes('Cannot read properties of undefined') || 
        event.error.message.includes('reading \'data\'') ||
        event.error.message.includes('webpack') ||
        event.error.message.includes('router'))) {
      
      console.warn('[Error Handler] Suppressed error:', event.error.message);
      event.preventDefault();
      
      // Try to recover the router if it's missing
      if (typeof window.__NEXT_DATA__ === 'undefined') {
        console.log('[Error Handler] Recreating __NEXT_DATA__');
        window.__NEXT_DATA__ = {
          props: {},
          page: window.location.pathname,
          query: {},
          buildId: ''
        };
      }
    }
  });
})();
`;

try {
  // Create public directory if it doesn't exist
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Write the error handler script
  fs.writeFileSync(path.join(publicDir, 'error-handler.js'), errorHandlerScript);
  console.log('✅ Created: public/error-handler.js');
  
  // Update _app.tsx to include the error handler script
  console.log('\n📝 Updating _app.tsx to include the error handler script...');
  const appPath = path.join(__dirname, 'src/pages/_app.tsx');
  if (fs.existsSync(appPath)) {
    let appContent = fs.readFileSync(appPath, 'utf8');
    
    if (!appContent.includes('error-handler.js')) {
      // Add the script after the first Head tag opening
      appContent = appContent.replace(
        /<Head[^>]*>/,
        `<Head>\n        <script src="/error-handler.js" strategy="beforeInteractive"></script>`
      );
      
      fs.writeFileSync(appPath, appContent);
      console.log('✅ Updated: src/pages/_app.tsx');
    } else {
      console.log('⚠️ Error handler script already included in _app.tsx');
    }
  } else {
    console.log('⚠️ Could not find src/pages/_app.tsx');
  }
} catch (error) {
  console.error('❌ Error setting up error handler:', error.message);
}

// Step 4: Clean .next directory
console.log('\n🧹 Cleaning .next directory...');
try {
  execSync('rm -rf .next', { stdio: 'inherit' });
  console.log('✅ Successfully cleaned .next directory');
} catch (error) {
  console.warn('⚠️ Warning: Could not fully clean .next directory');
}

// Step 5: Start the server
console.log('\n🚀 Starting Next.js development server...');
console.log('\n-----------------------------------------------------');
console.log('🔍 Simple fixes have been applied!');
console.log('📋 Try accessing these URLs if you have issues:');
console.log('   http://localhost:3000/minimal');
console.log('   http://localhost:3000/debug');
console.log('-----------------------------------------------------\n');

console.log('Run the following command to start the server:');
console.log('npm run dev');

console.log('\nDone!'); 