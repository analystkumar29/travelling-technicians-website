#!/usr/bin/env node

/**
 * Validation script to verify www URL consistency
 * Checks for remaining non-www URLs that could cause 301 redirects
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');

// Patterns to search for
const patterns = [
  /https?:\/\/travelling-technicians\.ca/g,
  /"travelling-technicians\.ca"/g,
  /'travelling-technicians\.ca'/g,
];

// Directories to search
const searchDirs = [
  'src',
  'public',
];

// File extensions to include
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.xml', '.txt'];

function findFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .git
      if (item === 'node_modules' || item === '.git') continue;
      results = results.concat(findFiles(fullPath));
    } else {
      if (extensions.some(ext => item.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }
  
  return results;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        pattern: pattern.toString(),
        matches: matches.length,
        sample: matches[0]
      });
    }
  }
  
  return issues;
}

function main() {
  console.log('🔍 Validating www URL consistency...\n');
  
  let totalFiles = 0;
  let filesWithIssues = 0;
  let totalIssues = 0;
  const allIssues = [];
  
  for (const dir of searchDirs) {
    const dirPath = path.join(rootDir, dir);
    if (!fs.existsSync(dirPath)) continue;
    
    const files = findFiles(dirPath);
    totalFiles += files.length;
    
    for (const file of files) {
      const issues = checkFile(file);
      if (issues.length > 0) {
        filesWithIssues++;
        totalIssues += issues.reduce((sum, issue) => sum + issue.matches, 0);
        
        const relativePath = path.relative(rootDir, file);
        allIssues.push({
          file: relativePath,
          issues: issues
        });
      }
    }
  }
  
  // Check sitemap.xml
  const sitemapPath = path.join(rootDir, 'public/sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    const nonWwwUrls = (sitemapContent.match(/https?:\/\/travelling-technicians\.ca/g) || []).length;
    const wwwUrls = (sitemapContent.match(/https?:\/\/www\.travelling-technicians\.ca/g) || []).length;
    
    console.log('🗺️  Sitemap Analysis:');
    console.log(`   Non-www URLs: ${nonWwwUrls}`);
    console.log(`   www URLs: ${wwwUrls}`);
    
    if (nonWwwUrls > 0) {
      allIssues.push({
        file: 'public/sitemap.xml',
        issues: [{
          pattern: 'Non-www URL in sitemap',
          matches: nonWwwUrls,
          sample: 'Found non-www URLs in sitemap'
        }]
      });
    }
  }
  
  // Check robots.txt
  const robotsPath = path.join(rootDir, 'public/robots.txt');
  if (fs.existsSync(robotsPath)) {
    const robotsContent = fs.readFileSync(robotsPath, 'utf8');
    const nonWwwUrls = (robotsContent.match(/https?:\/\/travelling-technicians\.ca/g) || []).length;
    
    if (nonWwwUrls > 0) {
      allIssues.push({
        file: 'public/robots.txt',
        issues: [{
          pattern: 'Non-www URL in robots.txt',
          matches: nonWwwUrls,
          sample: 'Found non-www URLs in robots.txt'
        }]
      });
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Files scanned: ${totalFiles}`);
  console.log(`   Files with issues: ${filesWithIssues}`);
  console.log(`   Total issues found: ${totalIssues}`);
  
  if (allIssues.length > 0) {
    console.log('\n❌ Issues found:');
    for (const issue of allIssues) {
      console.log(`\n   File: ${issue.file}`);
      for (const detail of issue.issues) {
        console.log(`     - ${detail.pattern}: ${detail.matches} occurrences`);
        console.log(`       Sample: ${detail.sample}`);
      }
    }
    
    console.log('\n⚠️  Action required:');
    console.log('   Run the fix script: node scripts/fix-www-urls.js');
    console.log('   Or manually fix the issues listed above.');
    
    process.exit(1);
  } else {
    console.log('\n✅ All checks passed!');
    console.log('\n🎉 No non-www URLs found that could cause 301 redirects.');
    console.log('\n📋 Next steps:');
    console.log('   1. Deploy changes to production');
    console.log('   2. Monitor Google Search Console for reduced 301 redirects');
    console.log('   3. Check crawl stats after 7-14 days');
    
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkFile, patterns };