/**
 * Script to uninstall Next.js and reinstall a more stable version
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔄 Starting Next.js reinstallation process...');

try {
  // Step 1: Backup package.json
  console.log('\n📦 Backing up package.json...');
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJsonBackupPath = path.join(__dirname, 'package.json.backup');
  
  fs.copyFileSync(packageJsonPath, packageJsonBackupPath);
  console.log('✅ package.json backed up successfully');
  
  // Step 2: Remove Next.js dependency
  console.log('\n🗑️ Uninstalling current Next.js version...');
  execSync('npm uninstall next', { stdio: 'inherit' });
  
  // Step 3: Install an older, more stable version of Next.js
  console.log('\n📥 Installing Next.js version 12.3.4 (stable version)...');
  execSync('npm install next@12.3.4 react@17 react-dom@17', { stdio: 'inherit' });
  
  // Step 4: Remove the .next directory
  console.log('\n🧹 Cleaning .next directory...');
  try {
    execSync('rm -rf .next', { stdio: 'inherit' });
    console.log('✅ .next directory cleaned successfully');
  } catch (error) {
    console.warn('⚠️ Warning: Could not fully clean .next directory');
  }
  
  // Step 5: Update tsconfig.json or create it if it doesn't exist
  console.log('\n📝 Updating TypeScript configuration...');
  const tsconfigPath = path.join(__dirname, 'tsconfig.json');
  
  const tsconfig = {
    "compilerOptions": {
      "target": "es5",
      "lib": ["dom", "dom.iterable", "esnext"],
      "allowJs": true,
      "skipLibCheck": true,
      "strict": true,
      "forceConsistentCasingInFileNames": true,
      "noEmit": true,
      "esModuleInterop": true,
      "module": "esnext",
      "moduleResolution": "node",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "preserve",
      "baseUrl": ".",
      "paths": {
        "@/*": ["src/*"]
      },
      "incremental": true
    },
    "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
    "exclude": ["node_modules"]
  };
  
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  console.log('✅ tsconfig.json updated successfully');
  
  // Step 6: Create next.config.js if it doesn't exist
  console.log('\n📝 Updating Next.js configuration...');
  const nextConfigPath = path.join(__dirname, 'next.config.js');
  const nextConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com'],
  },
}

module.exports = nextConfig
`;
  
  fs.writeFileSync(nextConfigPath, nextConfig);
  console.log('✅ next.config.js updated successfully');
  
  // Step 7: Create simple wrapper for development start
  console.log('\n📝 Creating simple development start script...');
  const startDevPath = path.join(__dirname, 'simple-start-dev.js');
  const startDevScript = `
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
    console.log(\`⚠️ Next.js development server exited with code \${code}\`);
  }
});
`;
  
  fs.writeFileSync(startDevPath, startDevScript);
  console.log('✅ simple-start-dev.js created successfully');
  
  // Step 8: Update package.json scripts
  console.log('\n📝 Updating package.json scripts...');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.scripts = {
    ...packageJson.scripts,
    "dev-simple": "node simple-start-dev.js",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json scripts updated successfully');
  
  // Final instructions
  console.log('\n✅ Next.js reinstallation completed successfully!');
  console.log('\n📋 To start the development server, run:');
  console.log('  npm run dev-simple');
  
  console.log('\n⚠️ Note: This is a downgraded version of Next.js for compatibility.');
  console.log('   Some modern features may not be available.');
  console.log('   If you need to restore the original package.json, use:');
  console.log('   cp package.json.backup package.json && npm install');
  
} catch (error) {
  console.error('\n❌ An error occurred during the process:', error.message);
  
  // Try to restore package.json from backup
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJsonBackupPath = path.join(__dirname, 'package.json.backup');
  
  if (fs.existsSync(packageJsonBackupPath)) {
    console.log('\n🔄 Restoring package.json from backup...');
    fs.copyFileSync(packageJsonBackupPath, packageJsonPath);
    console.log('✅ package.json restored successfully');
  }
  
  process.exit(1);
} 