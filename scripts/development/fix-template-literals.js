/**
 * fix-template-literals.js
 * This script finds and fixes potential syntax errors in template literals
 */

const fs = require('fs');
const path = require('path');

// Main function
async function main() {
  console.log('🔍 Fixing template literal syntax issues...');
  
  // Define directories to scan
  const dirs = [
    path.join(__dirname, 'src'),
    path.join(__dirname, 'public')
  ];
  
  // Extensions to check
  const extensions = ['.js', '.jsx', '.ts', '.tsx'];
  
  // Keep track of fixed files
  let scannedFiles = 0;
  let fixedFiles = 0;
  
  // Process each directory
  for (const dir of dirs) {
    await scanDirectory(dir);
  }
  
  console.log(`✅ Script completed: Scanned ${scannedFiles} files, fixed ${fixedFiles} files.`);
  
  // Recursive function to scan directories
  async function scanDirectory(dir) {
    try {
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory() && !entry.startsWith('node_modules') && !entry.startsWith('.next')) {
          // Recursively scan subdirectories
          await scanDirectory(fullPath);
        } else if (stats.isFile() && extensions.includes(path.extname(fullPath))) {
          // Process file if it has a matching extension
          await fixFile(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error);
    }
  }
  
  // Fix template literals in a file
  async function fixFile(filePath) {
    try {
      scannedFiles++;
      
      // Read file content
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Fix 1: Fix escaped backslashes in regex patterns
      content = content.replace(
        /replace\(\/\\+s\+\/g/g,
        'replace(/\\s+/g'
      );
      
      // Fix 2: Fix unbalanced template literals with conditional expressions
      content = content.replace(
        /(`[^`]*\${[^}]*\?[^`]*`)(?!\s*[:;])/g,
        (match) => {
          if (!match.endsWith('` : \'\'')) {
            return `${match} : ''`;
          }
          return match;
        }
      );
      
      // Fix 3: Fix broken template literals
      content = content.replace(
        /(const .* = `.*\${.*)\n/g,
        (match) => {
          // If it contains an opening backtick but no closing one
          if ((match.match(/`/g) || []).length % 2 !== 0) {
            return `${match}`;
          }
          return match;
        }
      );
      
      // If content was changed, write back to file
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        fixedFiles++;
        console.log(`Fixed template literals in: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }
}

// Run the script
main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
}); 