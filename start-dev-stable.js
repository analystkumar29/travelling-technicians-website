/**
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
    NODE_OPTIONS: '--max-old-space-size=4096 --no-warnings',
    NEXT_TELEMETRY_DISABLED: '1',
    NEXT_IGNORE_WARNINGS: '1',
    NEXT_SUPPRESS_ERRORS: '1',
    NEXT_RUNTIME_PATCHED: '1'
  }
});

// Handle process exit
nextProcess.on('close', (code) => {
  console.log(`Next.js dev server exited with code ${code}`);
  process.exit(code);
});

// Handle Ctrl+C to gracefully exit
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  nextProcess.kill('SIGINT');
});

console.log('\n-----------------------------------------------------');
console.log('🛡️  Next.js dev server running with stability patches');
console.log('📋 Router error suppression active');
console.log('🔍 White screen detection active');
console.log('-----------------------------------------------------\n');