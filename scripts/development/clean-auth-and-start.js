
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
