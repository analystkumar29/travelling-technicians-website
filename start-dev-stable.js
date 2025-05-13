#!/usr/bin/env node

/**
 * This is a custom script to start Next.js in development mode with
 * more stable settings to prevent continuous rendering/reloading.
 */

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables to stabilize development
process.env.NEXT_DISABLE_HMR = 'true';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

console.log('🚀 Starting Next.js in stable development mode');
console.log('⚠️  Hot Module Replacement (HMR) is disabled to prevent continuous reloading');
console.log('💡 This may result in slower updates but more stable operation');

// Start Next.js with the modified environment
const nextBin = path.join(process.cwd(), 'node_modules', '.bin', 'next');
const nextProcess = spawn(nextBin, ['dev'], {
  stdio: 'inherit',
  env: { ...process.env }
});

// Handle process exit
nextProcess.on('close', (code) => {
  console.log(`Next.js dev server exited with code ${code}`);
  process.exit(code);
});

// Handle signals to properly shut down
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down Next.js dev server...');
  nextProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down Next.js dev server...');
  nextProcess.kill('SIGTERM');
}); 