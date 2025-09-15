// start-dev-safe.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Set up environment variables needed for the router fix
process.env.NEXT_PUBLIC_DEPLOYMENT_ID = `build_${Date.now()}`;

// If .env.local exists, add NEXT_PUBLIC_DEPLOYMENT_ID to it
try {
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    let content = fs.readFileSync(envLocalPath, 'utf8');
    if (!content.includes('NEXT_PUBLIC_DEPLOYMENT_ID=')) {
      content += `\nNEXT_PUBLIC_DEPLOYMENT_ID=${process.env.NEXT_PUBLIC_DEPLOYMENT_ID}\n`;
      fs.writeFileSync(envLocalPath, content);
      console.log(`Added NEXT_PUBLIC_DEPLOYMENT_ID to .env.local: ${process.env.NEXT_PUBLIC_DEPLOYMENT_ID}`);
    }
  }
} catch (error) {
  console.error('Error adding deployment ID to .env.local:', error);
}

// Create .env.local if it doesn't exist
try {
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envLocalPath)) {
    fs.writeFileSync(
      envLocalPath,
      `NEXT_PUBLIC_DEPLOYMENT_ID=${process.env.NEXT_PUBLIC_DEPLOYMENT_ID}\n`
    );
    console.log(`Created .env.local with NEXT_PUBLIC_DEPLOYMENT_ID: ${process.env.NEXT_PUBLIC_DEPLOYMENT_ID}`);
  }
} catch (error) {
  console.error('Error creating .env.local:', error);
}

console.log('Running router fix...');

// Run the router fix
try {
  require('./fix-router.js');
} catch (error) {
  console.error('Error running router fix:', error);
}

// Clean the Next.js cache
console.log('Cleaning Next.js cache...');
try {
  if (fs.existsSync(path.join(process.cwd(), '.next'))) {
    execSync('rm -rf .next');
    console.log('Cache cleaned successfully');
  }
} catch (error) {
  console.error('Error cleaning Next.js cache:', error);
}

// Start Next.js development server with browser warnings suppressed
console.log('Starting Next.js in safe mode...');
const nextProcess = spawn('node', ['node_modules/next/dist/bin/next', 'dev'], {
  env: {
    ...process.env,
    // Suppress client-side console warnings
    NEXT_SUPPRESS_WARNINGS: '1',
    // Set NODE_OPTIONS to remove warnings
    NODE_OPTIONS: '--no-warnings',
  },
  stdio: 'inherit',
});

nextProcess.on('close', (code) => {
  console.log(`Next.js process exited with code ${code}`);
  process.exit(code);
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Shutting down Next.js server...');
  nextProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Shutting down Next.js server...');
  nextProcess.kill('SIGTERM');
}); 