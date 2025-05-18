/**
 * Script to set up authentication environment variables
 * This adds the necessary environment variables to .env.local
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env.local file
const envFilePath = path.join(__dirname, '.env.local');

// Check if .env.local exists
const envFileExists = fs.existsSync(envFilePath);

// Environment variables to check for
const envVars = {
  'NEXT_PUBLIC_WEBSITE_URL': 'http://localhost:3000'
};

async function setupEnv() {
  console.log('Setting up authentication environment variables...');
  
  // If .env.local doesn't exist, create it
  if (!envFileExists) {
    console.log('.env.local file not found. Creating it...');
    fs.writeFileSync(envFilePath, '# Authentication Environment Variables\n\n');
  }
  
  // Read the current env file
  const currentEnv = fs.readFileSync(envFilePath, 'utf-8');
  const lines = currentEnv.split('\n');
  const existingVars = {};
  
  // Track which variables already exist
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        existingVars[key.trim()] = value.trim();
      }
    }
  });
  
  // Add missing variables
  let newEnv = currentEnv;
  let changes = false;
  
  for (const [key, defaultValue] of Object.entries(envVars)) {
    if (!existingVars[key]) {
      console.log(`Adding ${key}=${defaultValue} to .env.local`);
      newEnv += `\n${key}=${defaultValue}`;
      changes = true;
    } else {
      console.log(`${key} already exists in .env.local with value: ${existingVars[key]}`);
    }
  }
  
  // Write updated env file if there were changes
  if (changes) {
    fs.writeFileSync(envFilePath, newEnv);
    console.log('.env.local file updated successfully!');
  } else {
    console.log('No changes needed to .env.local');
  }
  
  console.log('\nSetup complete! You can now run your development server.');
  rl.close();
}

// Run the setup
setupEnv().catch(err => {
  console.error('Error setting up environment variables:', err);
  rl.close();
}); 