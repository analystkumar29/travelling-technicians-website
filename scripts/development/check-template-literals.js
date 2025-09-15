/**
 * check-template-literals.js
 * 
 * This script specifically scans for issues with template literals
 * that might cause "Invalid or unexpected token" errors.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Scanning for template literal syntax issues...');

// Directories to scan
const targetDirs = [
  path.join(__dirname, 'src'),
  path.join(__dirname, 'public')
];

// Extensions to check
const fileExts = ['.js', '.jsx', '.ts', '.tsx'];

// Track statistics
let checkedFiles = 0;
let issuesFound = 0;

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
      // Check file for template literal issues
      checkFile(filePath);
    }
  }
}

// Function to check a file for template literal issues
function checkFile(filePath) {
  try {
    checkedFiles++;
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check 1: Look for template literals
    const templatePattern = /\$\{.*?\}/g;
    const matches = content.match(templatePattern);
    
    if (matches) {
      // Check each template expression for issues
      for (const match of matches) {
        // Check for unbalanced braces
        const openBraces = (match.match(/\{/g) || []).length;
        const closeBraces = (match.match(/\}/g) || []).length;
        
        if (openBraces !== closeBraces) {
          console.log(`  ⚠️ Unbalanced braces in template literal in ${filePath}`);
          console.log(`    ${match}`);
          issuesFound++;
        }
        
        // Check for escape sequence issues
        if (match.includes('\\') && !match.includes('\\\\') && !match.includes('\\`') && !match.includes('\\$')) {
          console.log(`  ⚠️ Potential escape sequence issue in template literal in ${filePath}`);
          console.log(`    ${match}`);
          issuesFound++;
        }
      }
    }
    
    // Check 2: Look for backticks
    let insideBacktick = false;
    let lineNum = 1;
    let colNum = 0;
    let openBacktickLine = 0;
    let openBacktickCol = 0;
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      colNum++;
      
      if (char === '\n') {
        lineNum++;
        colNum = 0;
      }
      
      if (char === '`' && (i === 0 || content[i-1] !== '\\')) {
        if (!insideBacktick) {
          insideBacktick = true;
          openBacktickLine = lineNum;
          openBacktickCol = colNum;
        } else {
          insideBacktick = false;
        }
      }
    }
    
    if (insideBacktick) {
      console.log(`  ⚠️ Unclosed backtick (template literal) starting at line ${openBacktickLine}, column ${openBacktickCol} in ${filePath}`);
      issuesFound++;
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

console.log(`\n✅ Scan complete! Checked ${checkedFiles} files, found ${issuesFound} template literal issues.`);

if (issuesFound > 0) {
  console.log('\nYou need to manually fix the template literal issues mentioned above.');
  console.log('After fixing, clean the build and restart:');
  console.log('  rm -rf .next');
  console.log('  npm run dev');
} else {
  console.log('\nNo template literal issues found in the scanned files.');
  console.log('The syntax error might be in a different part of the code.');
  console.log('\nTry the following:');
  console.log('1. Check for syntax errors in your Next.js config files');
  console.log('2. Clear browser cache and local storage');
  console.log('3. Run node fix-syntax-errors.js');
  console.log('4. Restart with npm run dev');
} 