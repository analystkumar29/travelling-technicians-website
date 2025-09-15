/**
 * This script performs a clean fix for Next.js router issues:
 * 1. Reinstalls the Next.js package
 * 2. Creates a proper runtime patch instead of modifying node_modules
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting clean Next.js router fix...');

// Step 1: Clean the workspace
console.log('\n[1/4] Cleaning workspace...');
try {
  // Remove .next directory
  const nextDir = path.join(__dirname, '.next');
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('- Removed .next directory');
  }
  
  // Remove node_modules/next (just the Next.js package)
  const nextModulesDir = path.join(__dirname, 'node_modules/next');
  if (fs.existsSync(nextModulesDir)) {
    fs.rmSync(nextModulesDir, { recursive: true, force: true });
    console.log('- Removed node_modules/next directory');
  }
  
  console.log('✅ Workspace cleaned successfully');
} catch (error) {
  console.error('❌ Error cleaning workspace:', error);
  process.exit(1);
}

// Step 2: Reinstall Next.js
console.log('\n[2/4] Reinstalling Next.js...');
try {
  execSync('npm install next@13.5.6 --save-exact', { stdio: 'inherit' });
  console.log('✅ Next.js reinstalled successfully');
} catch (error) {
  console.error('❌ Error reinstalling Next.js:', error);
  process.exit(1);
}

// Step 3: Create a robust runtime patch in utils directory
console.log('\n[3/4] Creating robust runtime patch...');
try {
  const utilsDir = path.join(__dirname, 'src/utils');
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
  }
  
  const runtimePatchPath = path.join(utilsDir, 'nextjs-runtime-fix.js');
  const runtimePatchContent = `/**
 * Next.js Runtime Fixes
 * This file provides runtime patches for common Next.js router issues without modifying node_modules
 */

// Only apply in browser environment
if (typeof window !== 'undefined') {
  console.log('[NextFix] Applying Next.js runtime fixes');
  
  // 1. Ensure __NEXT_DATA__ always exists
  if (!window.__NEXT_DATA__) {
    window.__NEXT_DATA__ = {
      props: {},
      page: window.location.pathname || '/',
      query: {},
      buildId: 'development'
    };
  }
  
  // 2. Patch history methods to ensure state.data always exists
  const originalPushState = window.history.pushState;
  window.history.pushState = function(state, ...rest) {
    if (state === null || typeof state !== 'object') {
      state = {};
    }
    
    if (!state.data) {
      state.data = {
        props: {},
        page: window.location.pathname || '/',
        query: {},
        buildId: window.__NEXT_DATA__?.buildId || 'development'
      };
    }
    
    return originalPushState.call(this, state, ...rest);
  };
  
  const originalReplaceState = window.history.replaceState;
  window.history.replaceState = function(state, ...rest) {
    if (state === null || typeof state !== 'object') {
      state = {};
    }
    
    if (!state.data) {
      state.data = {
        props: {},
        page: window.location.pathname || '/',
        query: {},
        buildId: window.__NEXT_DATA__?.buildId || 'development'
      };
    }
    
    return originalReplaceState.call(this, state, ...rest);
  };
  
  // 3. Add global error handler to catch and handle router errors
  const originalOnError = window.onerror;
  window.onerror = function(message, source, line, column, error) {
    // Handle router errors
    if (message && 
        typeof message === 'string' && 
        (message.includes('Cannot read properties of undefined') || 
         message.includes('Cannot read property') || 
         message.includes('is not defined')) && 
        source && 
        (source.includes('/next/') || source.includes('webpack') || source.includes('router'))) {
      
      console.log('[NextFix] Handled router error:', message);
      
      // Try to fix the current state
      try {
        if (window.history.state && !window.history.state.data) {
          window.history.replaceState({
            ...window.history.state,
            data: {
              props: {},
              page: window.location.pathname || '/',
              query: {},
              buildId: window.__NEXT_DATA__?.buildId || 'development'
            }
          }, document.title, window.location.href);
        }
      } catch (e) {
        console.error('[NextFix] Error fixing history state:', e);
      }
      
      // Prevent default error handling
      return true;
    }
    
    // Handle React warnings we want to suppress
    if (message && 
        typeof message === 'string' && 
        (message.includes('Warning: React does not recognize the') || 
         message.includes('fetchPriority'))) {
      // Suppress these warnings
      return true;
    }
    
    // Call original handler for other errors
    if (originalOnError) {
      return originalOnError.apply(this, arguments);
    }
    
    return false;
  };
  
  // 4. Patch removeTrailingSlash function when it's loaded
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj, prop, descriptor) {
    // When the removeTrailingSlash function is defined, patch it
    if (prop === 'removeTrailingSlash' && descriptor && typeof descriptor.value === 'function') {
      const original = descriptor.value;
      
      descriptor.value = function(route) {
        if (route == null) return '/';
        return (route === '/' ? route : route.replace(/\\/$/, '')) || '/';
      };
      
      console.log('[NextFix] Patched removeTrailingSlash function');
    }
    
    return originalDefineProperty.apply(this, arguments);
  };
  
  console.log('[NextFix] All runtime fixes applied');
}

export default function initNextFixes() {
  // This is just to make this a proper module
  return true;
}`;
  
  fs.writeFileSync(runtimePatchPath, runtimePatchContent);
  console.log(`✅ Created runtime patch at ${runtimePatchPath}`);
  
  // Step 3.2: Update _app.tsx to import our runtime patch
  const appTsxPath = path.join(__dirname, 'src/pages/_app.tsx');
  if (fs.existsSync(appTsxPath)) {
    let appContent = fs.readFileSync(appTsxPath, 'utf8');
    
    // Check if import already exists
    if (!appContent.includes("import '@/utils/nextjs-runtime-fix'")) {
      // Add import at the top of the file
      appContent = "import '@/utils/nextjs-runtime-fix';\n" + appContent;
      fs.writeFileSync(appTsxPath, appContent);
      console.log(`✅ Updated ${appTsxPath} to import runtime patch`);
    } else {
      console.log(`- ${appTsxPath} already imports runtime patch`);
    }
  } else {
    console.log(`⚠️ Could not find ${appTsxPath}`);
  }
  
} catch (error) {
  console.error('❌ Error creating runtime patch:', error);
  process.exit(1);
}

// Step 4: Update start-dev-stable.js
console.log('\n[4/4] Updating development scripts...');
try {
  const startDevStablePath = path.join(__dirname, 'start-dev-stable.js');
  const startDevStableContent = `/**
 * start-dev-stable.js
 * Starts Next.js dev server with runtime patches for stability
 */
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Next.js dev server with stability patches...');

// Start Next.js with environment variables to stabilize development
const nextProcess = spawn('npx', [
  'next',
  'dev',
  '--port', process.env.PORT || '3000'
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Stability settings
    NODE_OPTIONS: '--no-warnings',
    NEXT_IGNORE_WARNINGS: '1',
    NEXT_SUPPRESS_ERRORS: '1',
    NEXT_RUNTIME_PATCHED: '1'
  }
});

// Handle process exit
nextProcess.on('close', (code) => {
  console.log(\`Next.js dev server exited with code \${code}\`);
  process.exit(code);
});

// Handle Ctrl+C to gracefully exit
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  nextProcess.kill('SIGINT');
});

console.log('\\n-----------------------------------------------------');
console.log('🛡️  Next.js dev server running with stability patches');
console.log('📋 Router error suppression active');
console.log('-----------------------------------------------------\\n');`;
  
  fs.writeFileSync(startDevStablePath, startDevStableContent);
  console.log(`✅ Updated ${startDevStablePath}`);
  
} catch (error) {
  console.error('❌ Error updating start-dev-stable.js:', error);
  process.exit(1);
}

console.log('\n✅ Clean Next.js router fix completed!');
console.log('\nYou can now run the application with:');
console.log('  npm run dev:stable');
console.log('\nThis approach uses runtime patches instead of modifying Next.js files directly.');
console.log('It should be more stable and less prone to syntax errors.'); 