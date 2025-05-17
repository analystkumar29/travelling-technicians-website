// next-patched.js - Directly patches Next.js modules to fix common errors
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

console.log('Patching Next.js modules to fix "Cannot read properties of undefined (reading \'data\')" errors...');

// Paths to problematic Next.js modules
const removeTrailingSlashPath = path.join(__dirname, 'node_modules', 'next', 'dist', 'shared', 'lib', 'router', 'utils', 'remove-trailing-slash.js');
const webpackPath = path.join(__dirname, 'node_modules', 'next', 'dist', 'client', 'webpack.js');
const routerPath = path.join(__dirname, 'node_modules', 'next', 'dist', 'shared', 'lib', 'router', 'router.js');

// Fix for remove-trailing-slash.js
if (fs.existsSync(removeTrailingSlashPath)) {
  try {
    let content = fs.readFileSync(removeTrailingSlashPath, 'utf8');
    
    // Replace problematic code
    const originalCode = /return\s+path\s*\?.[^\n;]+/;
    const fixedCode = 'return path && typeof path === "string" ? path.replace(/\\/$/, "") || "/" : "/";';
    
    if (content.includes(fixedCode)) {
      console.log('remove-trailing-slash.js already patched');
    } else {
      content = content.replace(originalCode, fixedCode);
      fs.writeFileSync(removeTrailingSlashPath, content);
      console.log('Patched remove-trailing-slash.js');
    }
  } catch (error) {
    console.error('Error patching remove-trailing-slash.js:', error);
  }
} else {
  console.warn('Could not find remove-trailing-slash.js');
}

// Fix for webpack.js
if (fs.existsSync(webpackPath)) {
  try {
    let content = fs.readFileSync(webpackPath, 'utf8');
    
    // Replace problematic code
    const originalCode = /\.data\s*\?.[^\n;]+/g;
    const fixedCode = '.data ? .data : null';
    
    if (content.includes(fixedCode)) {
      console.log('webpack.js already patched');
    } else {
      content = content.replace(originalCode, fixedCode);
      fs.writeFileSync(webpackPath, content);
      console.log('Patched webpack.js');
    }
  } catch (error) {
    console.error('Error patching webpack.js:', error);
  }
} else {
  console.warn('Could not find webpack.js');
}

// Fix for router.js
if (fs.existsSync(routerPath)) {
  try {
    let content = fs.readFileSync(routerPath, 'utf8');
    
    // Replace problematic code
    const originalCode = /(\w+)\s*\?\.\s*data/g;
    const fixedCode = '$1 && $1.data';
    
    if (content.includes(' && ') && !content.includes('?.data')) {
      console.log('router.js already patched');
    } else {
      content = content.replace(originalCode, fixedCode);
      fs.writeFileSync(routerPath, content);
      console.log('Patched router.js');
    }
  } catch (error) {
    console.error('Error patching router.js:', error);
  }
} else {
  console.warn('Could not find router.js');
}

console.log('Patching completed. Starting Next.js...');

// Run the actual Next.js command
const nextArgs = process.argv.slice(2);
const command = nextArgs.length > 0 ? nextArgs[0] : 'dev';
const args = ['node_modules/next/dist/bin/next', command, ...nextArgs.slice(1)];

console.log(`Running Next.js command: node ${args.join(' ')}`);

// Run Next.js with the patched modules
const nextProcess = childProcess.spawn('node', args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Suppress certain warnings
    NODE_OPTIONS: '--no-warnings',
    NEXT_SUPPRESS_ERRORS: '1',
  }
});

nextProcess.on('close', (code) => {
  console.log(`Next.js process exited with code ${code}`);
  process.exit(code);
}); 