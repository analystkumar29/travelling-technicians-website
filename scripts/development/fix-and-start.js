/**
 * Script to fix the Next.js router and webpack issues and start the development server
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔄 Starting the fix and restart process...');

// Check if the .next folder exists, and if so, clean it
const nextDir = path.join(__dirname, '.next');
if (fs.existsSync(nextDir)) {
  console.log('\n🧹 Cleaning .next directory for fresh start...');
  try {
    execSync('rm -rf .next', { stdio: 'inherit' });
    console.log('✅ Successfully cleaned .next directory');
  } catch (error) {
    console.warn('⚠️ Warning: Could not fully clean .next directory');
  }
}

try {
  // Step 1: Apply precise router fixes
  console.log('\n📝 Applying precise router fixes...');
  execSync('node fix-router-precise.js', { stdio: 'inherit' });
  
  // Step 2: Run webpack patching
  console.log('\n📝 Patching webpack...');
  execSync('node patch-nextjs.js', { stdio: 'inherit' });
  
  // Step 3: Start the dev server
  console.log('\n🚀 Starting Next.js development server...');
  console.log('\n-----------------------------------------------------');
  console.log('🔍 All fixes have been applied!');
  console.log('📋 Try accessing these URLs if you have issues:');
  console.log('   http://localhost:3000/minimal');
  console.log('   http://localhost:3000/debug');
  console.log('-----------------------------------------------------\n');
  
  // Use the start-dev-stable script 
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('\n❌ An error occurred during the process:', error.message);
  process.exit(1);
} 