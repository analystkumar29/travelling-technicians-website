/**
 * fix-syntax-errors.js
 * 
 * This script scans the project for common syntax errors that could cause
 * "Invalid or unexpected token" issues in bundled JavaScript
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Scanning for potential syntax errors...');

// Directories to scan
const targetDirs = [
  path.join(__dirname, 'src'),
  path.join(__dirname, 'public')
];

// Patterns that might cause syntax errors
const errorPatterns = [
  { pattern: /const\s+&&/g, replacement: 'const data =' },
  { pattern: /&&\s*.\s*data/g, replacement: '&& obj.data' },
  { pattern: /\.\s*data\s*\/\//g, replacement: '.data // ' },
  { pattern: /\w+\s*&&\s*\w+\.data.*PATCHED/g, replacement: '' },
  { pattern: /\/\/\s*SAFETY\s*PATCHED/g, replacement: '// Fixed' },
  { pattern: /\/\/\s*PRECISE\s*PATCHED/g, replacement: '// Fixed' },
  { pattern: /`[\s\S]*?[^\\]`/g, check: (match) => {
    // Look for unescaped backticks within template literals
    return match.includes('`') && !match.includes('\\`');
  }},
  { pattern: /[^\u0000-\u007F]/g, check: true }, // Check for non-ASCII characters
  { pattern: /\\u[^0-9a-fA-F]/g, check: true }, // Malformed unicode escapes
  { pattern: /\\x[^0-9a-fA-F]/g, check: true }, // Malformed hex escapes
];

// Extensions to check
const fileExts = ['.js', '.jsx', '.ts', '.tsx', '.json'];

// Files fixed
let fixedFiles = 0;
let checkedFiles = 0;

// Function to scan a directory recursively
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('.')) {
      // Recursively scan subdirectories
      scanDirectory(filePath);
    } else if (stat.isFile() && fileExts.includes(path.extname(file))) {
      // Check file for patterns
      checkFile(filePath);
    }
  }
}

// Function to check a file for syntax error patterns
function checkFile(filePath) {
  try {
    checkedFiles++;
    let fileContent = fs.readFileSync(filePath, 'utf8');
    let originalContent = fileContent;
    let hasChanges = false;
    
    // Check for problematic patterns
    for (const { pattern, replacement, check } of errorPatterns) {
      if (replacement) {
        // Replace the pattern
        const newContent = fileContent.replace(pattern, replacement);
        if (newContent !== fileContent) {
          console.log(`  Found problematic pattern in ${filePath}`);
          fileContent = newContent;
          hasChanges = true;
        }
      } else if (check) {
        // Just check for the pattern without replacing
        const matches = fileContent.match(pattern);
        if (matches) {
          if (typeof check === 'function') {
            // Use custom check function
            for (const match of matches) {
              if (check(match)) {
                console.log(`  Warning: Potential syntax issue in ${filePath}`);
                console.log(`    Found: ${match.substring(0, 40)}${match.length > 40 ? '...' : ''}`);
              }
            }
          } else {
            console.log(`  Warning: Potential syntax issue in ${filePath}`);
            console.log(`    Found: ${matches[0].substring(0, 40)}${matches[0].length > 40 ? '...' : ''}`);
          }
        }
      }
    }
    
    // If we made changes, save the file
    if (hasChanges) {
      fs.writeFileSync(filePath, fileContent);
      fixedFiles++;
      console.log(`  ✓ Fixed ${filePath}`);
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
  }
}

// Start scanning
for (const dir of targetDirs) {
  if (fs.existsSync(dir)) {
    scanDirectory(dir);
  }
}

console.log(`\n✅ Scan complete! Checked ${checkedFiles} files, fixed ${fixedFiles} files.`);

// Now clean and restart
if (fixedFiles > 0) {
  console.log('\nCleaning build artifacts to apply fixes...');
  
  try {
    // Remove .next directory
    const nextDir = path.join(__dirname, '.next');
    if (fs.existsSync(nextDir)) {
      fs.rmSync(nextDir, { recursive: true, force: true });
      console.log('- Removed .next directory');
    }
    
    console.log('\nRestart your application with:');
    console.log('  npm run dev');
  } catch (error) {
    console.error('Error cleaning build artifacts:', error);
  }
} else {
  console.log('\nNo syntax issues found in application code.');
  console.log('The error might be in dynamically generated code or a third-party dependency.');
  console.log('\nTry clearing browser cache and running:');
  console.log('  npm run dev');
} 