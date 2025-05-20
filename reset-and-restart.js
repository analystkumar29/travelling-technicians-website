/**
 * Script to apply all fixes and restart the Next.js dev server
 */
const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Starting the fix and restart process...');

try {
  // Step 1: Apply Next.js router and webpack patches
  console.log('\n📝 Applying Next.js patches...');
  execSync('node patch-nextjs.js', { stdio: 'inherit' });
  
  // Step 2: Apply specific trailing slash patches 
  console.log('\n📝 Applying trailing slash patches...');
  execSync('node patch-trailing-slash.js', { stdio: 'inherit' });
  
  // Step 3: Clear Next.js cache
  console.log('\n🧹 Clearing Next.js cache...');
  try {
    execSync('rm -rf .next/cache', { stdio: 'inherit' });
    console.log('✅ Next.js cache cleared successfully');
  } catch (error) {
    console.warn('⚠️ Warning: Could not clear Next.js cache, but continuing...');
  }
  
  // Step 4: Restart the dev server
  console.log('\n🚀 Starting Next.js development server...');
  console.log('\n-----------------------------------------------------');
  console.log('🔍 All fixes have been applied!');
  console.log('📋 If you still see a white screen, try accessing:');
  console.log('   http://localhost:3000/minimal');
  console.log('   http://localhost:3000/debug');
  console.log('-----------------------------------------------------\n');
  
  // Use the custom dev script that has stability improvements
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('\n❌ An error occurred during the process:', error.message);
  console.log('\n👉 Try running the scripts one by one:');
  console.log('   1. node patch-nextjs.js');
  console.log('   2. node patch-trailing-slash.js');
  console.log('   3. npm run dev');
  process.exit(1);
} 