#!/usr/bin/env node

/**
 * Update robots.txt with image sitemap
 */

const fs = require('fs');
const path = require('path');

const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');

// Current robots.txt content
const currentRobots = fs.readFileSync(robotsPath, 'utf8');

// Check if image sitemap is already added
if (currentRobots.includes('image-sitemap.xml')) {
  console.log('✅ Image sitemap already exists in robots.txt');
  process.exit(0);
}

// Add image sitemap to robots.txt
const updatedRobots = currentRobots + '\n# Image Sitemap\nSitemap: https://travelling-technicians.ca/image-sitemap.xml\n';

fs.writeFileSync(robotsPath, updatedRobots);

console.log('✅ Updated robots.txt with image sitemap');
console.log('📁 Location: /public/robots.txt');
console.log('🔗 Image sitemap: https://travelling-technicians.ca/image-sitemap.xml');
