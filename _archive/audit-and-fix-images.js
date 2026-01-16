#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directories to scan
const srcDir = path.join(__dirname, '..', 'src');
const pagesDir = path.join(srcDir, 'pages');
const componentsDir = path.join(srcDir, 'components');

// Known problematic patterns
const patterns = {
  regularImage: /import.*Image.*from ['"]next\/image['"];?\s*$/gm,
  imageUsage: /<Image\s+/g,
  optimizedImageMissing: /Image.*src=/g,
  logoReferences: /logo-orange(?!-optimized)/g,
  doorstepTechReferences: /doorstep-repair-tech\.jpg/g
};

function scanFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return [];
  
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Check for regular Image imports without OptimizedImage
  if (patterns.regularImage.test(content) && !content.includes('OptimizedImage')) {
    issues.push({
      type: 'missing-optimized-image-import',
      line: content.split('\n').findIndex(line => line.includes('next/image')) + 1,
      suggestion: 'Import OptimizedImage component instead of or alongside regular Image'
    });
  }
  
  // Check for Image component usage
  const imageMatches = content.match(patterns.imageUsage);
  if (imageMatches && !content.includes('OptimizedImage')) {
    issues.push({
      type: 'using-regular-image',
      count: imageMatches.length,
      suggestion: 'Replace Image components with OptimizedImage for better performance'
    });
  }
  
  // Check for logo references that need optimization
  if (patterns.logoReferences.test(content)) {
    issues.push({
      type: 'non-optimized-logo',
      suggestion: 'Update logo references to use logo-orange-optimized.webp'
    });
  }
  
  // Check for doorstep tech image references
  if (patterns.doorstepTechReferences.test(content)) {
    issues.push({
      type: 'non-optimized-doorstep-image',
      suggestion: 'Update to use doorstep-repair-tech-optimized.webp or let OptimizedImage handle it'
    });
  }
  
  return issues;
}

function scanDirectory(dir) {
  const results = {};
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (stat.isFile()) {
        const issues = scanFile(fullPath);
        if (issues.length > 0) {
          const relativePath = path.relative(srcDir, fullPath);
          results[relativePath] = issues;
        }
      }
    }
  }
  
  scan(dir);
  return results;
}

console.log('🔍 Scanning for image optimization issues...\n');

// Scan pages and components
const pageIssues = scanDirectory(pagesDir);
const componentIssues = scanDirectory(componentsDir);

const allIssues = { ...pageIssues, ...componentIssues };

if (Object.keys(allIssues).length === 0) {
  console.log('✅ No image optimization issues found!');
} else {
  console.log('📋 Image Optimization Issues Found:\n');
  
  Object.entries(allIssues).forEach(([file, issues]) => {
    console.log(`📄 ${file}:`);
    issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue.type}: ${issue.suggestion}`);
      if (issue.line) console.log(`     Line: ${issue.line}`);
      if (issue.count) console.log(`     Count: ${issue.count}`);
    });
    console.log('');
  });
  
  // Summary
  const totalIssues = Object.values(allIssues).reduce((sum, issues) => sum + issues.length, 0);
  console.log(`📊 Summary: ${totalIssues} issues found in ${Object.keys(allIssues).length} files`);
  
  // Priority files
  const priorityFiles = Object.keys(allIssues).filter(file => 
    file.includes('index.tsx') || 
    file.includes('doorstep-repair') ||
    file.includes('laptop-repair') ||
    file.includes('mobile-repair')
  );
  
  if (priorityFiles.length > 0) {
    console.log('\n🔥 Priority files to fix:');
    priorityFiles.forEach(file => console.log(`  - ${file}`));
  }
}

// Check for missing optimized images
console.log('\n🖼️ Checking for missing optimized images...');

const publicImagesDir = path.join(__dirname, '..', 'public', 'images');

function checkOptimizedImages(dir) {
  const missing = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (stat.isFile() && /\.(jpg|jpeg|png)$/i.test(item)) {
        // Check if optimized version exists
        const baseName = item.replace(/\.(jpg|jpeg|png)$/i, '');
        const optimizedWebP = path.join(currentDir, `${baseName}-optimized.webp`);
        const optimizedJpg = path.join(currentDir, `${baseName}-optimized.jpg`);
        
        if (!fs.existsSync(optimizedWebP) && !fs.existsSync(optimizedJpg)) {
          const relativePath = path.relative(publicImagesDir, fullPath);
          missing.push(relativePath);
        }
      }
    }
  }
  
  if (fs.existsSync(dir)) {
    scan(dir);
  }
  
  return missing;
}

const missingOptimized = checkOptimizedImages(publicImagesDir);

if (missingOptimized.length > 0) {
  console.log('❌ Missing optimized versions:');
  missingOptimized.forEach(file => console.log(`  - ${file}`));
} else {
  console.log('✅ All images have optimized versions!');
}

console.log('\n🏁 Image audit complete!');
