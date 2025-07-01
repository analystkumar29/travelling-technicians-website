
/**
 * Simple Next.js development server start script
 */
const { spawn } = require('child_process');

console.log('🚀 Starting Next.js development server...');
const nextDev = spawn('npx', ['next', 'dev'], { stdio: 'inherit' });

nextDev.on('error', (error) => {
  console.error('❌ Error starting Next.js development server:', error.message);
});

nextDev.on('close', (code) => {
  if (code !== 0) {
    console.log(`⚠️ Next.js development server exited with code ${code}`);
  }
});
