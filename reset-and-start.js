/**
 * Complete reset and restart script for The Travelling Technicians website
 * This script cleans the project, rebuilds it from scratch, and starts it
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Starting complete project reset...');

// Step 1: Kill any running processes
console.log('\n[1/5] Stopping any running processes...');
try {
  execSync('pkill -f "node.*next" || true', { stdio: 'inherit' });
  console.log('✅ Stopped all Next.js processes');
} catch (error) {
  // Ignore errors, as this might fail if no processes are running
  console.log('⚠️ No processes found or could not stop them');
}

// Step 2: Clean build artifacts
console.log('\n[2/5] Cleaning build artifacts...');
try {
  // Remove .next directory
  const nextDir = path.join(__dirname, '.next');
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('- Removed .next directory');
  }
  
  // Remove out directory (if it exists)
  const outDir = path.join(__dirname, 'out');
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
    console.log('- Removed out directory');
  }
  
  // Remove node_modules/.cache
  const cacheDir = path.join(__dirname, 'node_modules/.cache');
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('- Removed node_modules/.cache directory');
  }
  
  console.log('✅ Build artifacts cleaned');
} catch (error) {
  console.error('❌ Error cleaning build artifacts:', error);
  process.exit(1);
}

// Step 3: Run syntax check scripts
console.log('\n[3/5] Checking code for syntax issues...');
try {
  execSync('node fix-syntax-errors.js', { stdio: 'inherit' });
  execSync('node check-template-literals.js', { stdio: 'inherit' });
  console.log('✅ Syntax checks completed');
} catch (error) {
  console.error('❌ Error during syntax check:', error);
  process.exit(1);
}

// Step 4: Build the project
console.log('\n[4/5] Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Project built successfully');
} catch (error) {
  console.error('❌ Error building project:', error);
  console.log('\nTry running `node clean-start.js` to do a more thorough cleanup.');
  process.exit(1);
}

// Step 5: Start the project
console.log('\n[5/5] Starting development server...');
try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error starting development server:', error);
  process.exit(1);
} 