// setup-env.js - Simple version
const fs = require('fs');
const path = require('path');

// Generate a unique deployment ID based on timestamp
const deploymentId = `build_${Date.now()}`;

console.log(`Setting NEXT_PUBLIC_DEPLOYMENT_ID to ${deploymentId}`);

// Set it as an environment variable to be used in the current process
process.env.NEXT_PUBLIC_DEPLOYMENT_ID = deploymentId;

// Try to write it to .env.local if possible
try {
  const envPath = path.join(process.cwd(), '.env.local');
  fs.appendFileSync(envPath, `\nNEXT_PUBLIC_DEPLOYMENT_ID=${deploymentId}\n`);
  console.log(`Added deployment ID to .env.local`);
} catch (err) {
  console.log(`Note: Could not write to .env.local, but the variable is set for this process`);
} 