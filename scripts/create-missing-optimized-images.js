#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createOptimizedImages() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Create logo-orange-optimized.webp
  const logoPath = path.join(publicDir, 'images', 'logo', 'logo-orange.png');
  const logoOutputPath = path.join(publicDir, 'images', 'logo', 'logo-orange-optimized.webp');
  
  if (fs.existsSync(logoPath)) {
    console.log('Creating logo-orange-optimized.webp...');
    await sharp(logoPath)
      .webp({ quality: 85 })
      .toFile(logoOutputPath);
    console.log('✅ Created logo-orange-optimized.webp');
  } else {
    console.log('❌ logo-orange.png not found');
  }
  
  // Create doorstep-repair-tech-optimized.webp
  const doorstepPath = path.join(publicDir, 'images', 'services', 'doorstep-repair-tech.jpg');
  const doorstepOutputPath = path.join(publicDir, 'images', 'services', 'doorstep-repair-tech-optimized.webp');
  
  if (fs.existsSync(doorstepPath)) {
    console.log('Creating doorstep-repair-tech-optimized.webp...');
    await sharp(doorstepPath)
      .webp({ quality: 85 })
      .toFile(doorstepOutputPath);
    console.log('✅ Created doorstep-repair-tech-optimized.webp');
  } else {
    console.log('❌ doorstep-repair-tech.jpg not found');
  }
  
  // List all files to verify
  console.log('\n📁 Current logo files:');
  const logoDir = path.join(publicDir, 'images', 'logo');
  if (fs.existsSync(logoDir)) {
    fs.readdirSync(logoDir).forEach(file => {
      console.log(`  - ${file}`);
    });
  }
  
  console.log('\n📁 Current services files:');
  const servicesDir = path.join(publicDir, 'images', 'services');
  if (fs.existsSync(servicesDir)) {
    fs.readdirSync(servicesDir).filter(file => file.includes('doorstep')).forEach(file => {
      console.log(`  - ${file}`);
    });
  }
}

createOptimizedImages().catch(console.error);
