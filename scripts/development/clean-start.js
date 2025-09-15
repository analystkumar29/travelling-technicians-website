/**
 * clean-start.js
 * A comprehensive script to fix project issues and start with a clean environment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Starting clean environment reset...');

// Step 1: Kill any running Next.js processes
try {
  console.log('1️⃣ Stopping any running Next.js processes...');
  execSync('pkill -f "node.*next"', { stdio: 'ignore' });
  console.log('✅ Stopped all Next.js processes');
} catch (error) {
  console.log('ℹ️ No running Next.js processes found');
}

// Step 2: Remove all cache and build files
console.log('2️⃣ Removing Next.js cache and build files...');
const dirsToRemove = [
  '.next',
  'node_modules/.cache',
  '.eslintcache',
  '.vercel/output'
];

dirsToRemove.forEach(dir => {
  try {
    if (fs.existsSync(dir)) {
      console.log(`  🗑️ Removing ${dir}...`);
      execSync(`rm -rf ${dir}`);
    }
  } catch (error) {
    console.error(`❌ Error removing ${dir}:`, error.message);
  }
});

// Step 3: Fix template literal syntax issues
console.log('3️⃣ Checking and fixing template literal syntax issues...');

// Define common template literal issues
const templateLiteralIssues = [
  {
    pattern: /className={\s*`[^`]*`\s*:\s*''}/g,
    replacement: 'className={`$1`}',
    description: 'Incorrect ternary in className prop'
  },
  {
    pattern: /(setShowSuggestions\(data && )obj\.data(\.length > 0\);)/g,
    replacement: '$1data$2',
    description: 'obj.data reference'
  },
  {
    pattern: /replace\(\/\\+s\+\/g/g,
    replacement: 'replace(/\\s+/g',
    description: 'Incorrect regex pattern'
  }
];

// Function to scan and fix template literals in a file
function fixTemplateLiteralsInFile(filePath) {
  try {
    // Read the file content
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let content = originalContent;
    let issues = false;
    
    // Apply each fix pattern
    templateLiteralIssues.forEach(issue => {
      if (issue.pattern.test(content)) {
        issues = true;
        content = content.replace(issue.pattern, issue.replacement);
        console.log(`  🔧 Fixed ${issue.description} in ${filePath}`);
      }
    });
    
    // Fix specific cases in GlobalErrorHandler.tsx
    if (filePath.includes('GlobalErrorHandler.tsx')) {
      // Check for trailing `: ''` in template literals
      if (content.includes('` : \'\'')) {
        content = content.replace(/`\s*:\s*''/g, '`');
        issues = true;
        console.log(`  🔧 Fixed invalid template literals in GlobalErrorHandler.tsx`);
      }
    }
    
    // Write the fixed content back to the file if changed
    if (issues) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ Updated ${filePath}`);
    }
    
    return issues;
  } catch (error) {
    console.error(`  ❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Helper function to recursively scan directories
function scanAndFixDirectory(dir) {
  let fixedFiles = 0;
  
  try {
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      
      // Skip node_modules and .next
      if (entry === 'node_modules' || entry === '.next') {
        continue;
      }
      
      try {
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          // Recursively scan subdirectories
          fixedFiles += scanAndFixDirectory(fullPath);
        } else if (stats.isFile() && 
                  ['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(fullPath))) {
          // Process TypeScript and JavaScript files
          const fixed = fixTemplateLiteralsInFile(fullPath);
          if (fixed) fixedFiles++;
        }
      } catch (err) {
        // Skip files we can't access
        console.error(`  ❌ Error accessing ${fullPath}:`, err.message);
      }
    }
  } catch (error) {
    console.error(`  ❌ Error scanning directory ${dir}:`, error.message);
  }
  
  return fixedFiles;
}

// Start the recursive scan from src directory
const fixedFiles = scanAndFixDirectory(path.join(__dirname, 'src'));
console.log(`🔍 Template literal scan complete! Fixed issues in ${fixedFiles} files.`);

// Step 4: Fix the AddressAutocomplete obj.data issue
console.log('4️⃣ Fixing AddressAutocomplete component...');
try {
  const filePath = path.join('src', 'components', 'AddressAutocomplete.tsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace obj.data with data.length
    content = content.replace(
      /setShowSuggestions\(data && obj\.data\.length > 0\);/g,
      'setShowSuggestions(data && data.length > 0);'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Fixed AddressAutocomplete component');
  } else {
    console.log('ℹ️ AddressAutocomplete component not found, skipping...');
  }
} catch (error) {
  console.error('❌ Error fixing AddressAutocomplete:', error.message);
}

// Step 5: Install dependencies (optional refresh)
console.log('5️⃣ Checking node_modules integrity...');
try {
  if (!fs.existsSync('node_modules') || process.argv.includes('--reinstall')) {
    console.log('  📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
  } else {
    console.log('✅ node_modules already exists, skipping reinstall');
  }
} catch (error) {
  console.error('❌ Error checking/installing dependencies:', error.message);
}

// Step 6: Start the development server
console.log('6️⃣ Starting development server...');
try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error starting development server:', error.message);
}

// Script will never reach here when server starts successfully 