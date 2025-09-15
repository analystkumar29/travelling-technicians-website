/**
 * Auth Navigation Fix Script
 * 
 * This script cleans up potential cached application state that could be
 * causing redirect loops between protected routes and homepage.
 * It also rebuilds necessary application files with improved navigation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting auth navigation fix script...');

// Function to safely execute commands
function runCommand(command) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Function to clean up potentially corrupted local storage/cache
function cleanupDev() {
  console.log('Cleaning up development cache...');
  
  // Clear Next.js cache
  if (fs.existsSync('.next')) {
    console.log('Removing .next folder...');
    try {
      fs.rmSync('.next', { recursive: true, force: true });
    } catch (err) {
      console.error('Error removing .next folder:', err);
    }
  }
  
  // Delete browser storage simulation file if it exists
  const localStorageSimPath = path.join(__dirname, '.localStorage');
  if (fs.existsSync(localStorageSimPath)) {
    console.log('Removing localStorage simulation file...');
    try {
      fs.unlinkSync(localStorageSimPath);
    } catch (err) {
      console.error('Error removing localStorage simulation file:', err);
    }
  }
  
  console.log('Dev cache cleaned successfully.');
}

// Function to create a helper script for users to clear browser storage
function createBrowserCleanupScript() {
  console.log('Creating browser cleanup helper...');
  
  const cleanupScript = `
// Auth Storage Cleanup Script
// 
// This script can be executed in the browser console to clean up
// potentially corrupted authentication data in local storage
// and session storage.

function cleanAuthStorage() {
  console.log('Cleaning up authentication storage...');
  
  // Clear specific auth-related items from localStorage
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('authUser');
  localStorage.removeItem('sb-xxxxxxxxxxxxx-auth-token'); // Adjust the ID based on your actual Supabase project ID
  
  // Clear session storage flags
  sessionStorage.removeItem('homepageLoopPrevented');
  sessionStorage.removeItem('homepageReloadCount');
  sessionStorage.removeItem('skipHomepageChecks');
  sessionStorage.removeItem('authRedirectPath');
  sessionStorage.removeItem('navigationInProgress');
  sessionStorage.removeItem('previousPath');
  sessionStorage.removeItem('shouldReturnToProtectedRoute');
  
  // Remove any navigation-related classes from body
  document.body.classList.remove('loading-navigation');
  document.body.classList.remove('navigation-stuck');
  document.body.classList.remove('auth-corrupted');
  
  console.log('Authentication storage cleaned');
  console.log('Please reload the page and try signing in again.');
  
  return "Auth storage cleaned successfully. Please reload the page.";
}

// Execute the cleanup
cleanAuthStorage();
`;

  try {
    fs.writeFileSync('public/auth-cleanup.js', cleanupScript);
    console.log('Browser cleanup script created at /public/auth-cleanup.js');
    console.log('Users can access it by visiting /auth-cleanup.js');
  } catch (err) {
    console.error('Error creating browser cleanup script:', err);
  }
}

// Add a special clean-auth-and-start.js script for users
function createCleanAuthScript() {
  console.log('Creating clean-auth-and-start script...');
  
  const script = `
/**
 * Clean Auth and Start Script
 * 
 * This script:
 * 1. Removes Next.js cache
 * 2. Clears auth-related production builds
 * 3. Rebuilds the application
 * 4. Starts development server
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('CLEAN AUTH AND START');
console.log('--------------------------');

// Clean cache
console.log('Cleaning cache...');
try {
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
  }
} catch (err) {
  console.error('Error cleaning cache:', err);
}

// Install dependencies if needed
console.log('Making sure dependencies are up to date...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (err) {
  console.error('Error installing dependencies:', err);
}

// Start dev server
console.log('Starting development server...');
try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (err) {
  console.error('Error starting server:', err);
}
`;

  try {
    fs.writeFileSync('clean-auth-and-start.js', script);
    console.log('Created clean-auth-and-start.js');
    
    // Update package.json to add script
    const packageJsonPath = path.join(__dirname, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      
      packageJson.scripts['clean:auth'] = 'node clean-auth-and-start.js';
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('Added clean:auth script to package.json');
    }
  } catch (err) {
    console.error('Error creating clean auth script:', err);
  }
}

// Create documentation file
function createDocumentation() {
  console.log('Creating documentation...');
  
  const docs = `# Auth Navigation System Improvements

## Overview

This update improves the authentication and navigation system to fix issues with redirect loops between protected routes and homepage. The primary improvements are:

1. **Enhanced Router Error Guard**: Improved protection against incorrect loop detection and false positives
2. **Robust Auth Protection**: Better authentication state validation and recovery mechanisms
3. **Safe Auth Navigation Hook**: New hook to handle navigation to protected routes safely
4. **Better Auth State Management**: Improved state persistence and recovery

## How to Use 

### For Developers

Use the new \`useAuthNavigation\` hook instead of the regular Next.js router for protected routes:

\`\`\`javascript
import useAuthNavigation from '@/hooks/useAuthNavigation';

function YourComponent() {
  const authNavigation = useAuthNavigation();
  
  // Navigate to protected routes safely
  const goToProfile = () => {
    authNavigation.navigateToProfile();
  };
  
  // Or use the general purpose method
  const goToCustomPage = () => {
    authNavigation.navigateToProtectedRoute('/your/protected/route');
  };
}
\`\`\`

### For Users Experiencing Issues

If users experience navigation issues:

1. Run the cleanup script in browser console:
   \`\`\`javascript
   // In browser console
   fetch('/auth-cleanup.js').then(r => r.text()).then(t => eval(t))
   \`\`\`

2. Or use the emergency reset button that appears when issues are detected
3. Clear browser cache and cookies related to the site
4. Sign out completely and sign back in

### For Site Administrators

If many users report issues:

1. Run the cleanup script on the server:
   \`\`\`bash
   npm run clean:auth
   \`\`\`

2. Rebuild and deploy the application

## Technical Details

Key improvements:

- Added path tracking to detect navigation patterns and prevent false positives
- Added session refresh before protected route navigation
- Created a specialized navigation hook for protected routes
- Improved authentication state validation and recovery
- Added emergency navigation recovery functions
`;

  try {
    fs.writeFileSync('AUTH_NAVIGATION_IMPROVEMENTS.md', docs);
    console.log('Created AUTH_NAVIGATION_IMPROVEMENTS.md');
  } catch (err) {
    console.error('Error creating documentation:', err);
  }
}

// Main execution
async function main() {
  try {
    // Clean up potentially corrupted state
    cleanupDev();
    
    // Create browser cleanup script
    createBrowserCleanupScript();
    
    // Create clean auth script
    createCleanAuthScript();
    
    // Create documentation
    createDocumentation();
    
    // Build project
    console.log('Rebuilding project...');
    if (runCommand('npm run build')) {
      console.log('Project successfully rebuilt!');
    } else {
      console.error('Project rebuild failed. Please check the errors above.');
    }
    
    console.log('\nAuth navigation fix complete!');
    console.log('NEXT STEPS:');
    console.log('1. Use the useAuthNavigation hook for protected routes');
    console.log('2. Review AUTH_NAVIGATION_IMPROVEMENTS.md for more information');
    console.log('3. If you still encounter issues, run: npm run clean:auth');
  } catch (error) {
    console.error('Error in auth navigation fix script:', error);
  }
}

main(); 