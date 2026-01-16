// This script is a helper to find and add proper sizes attribute to Next.js Image components
// It's meant to be run manually when needed

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Default sizes value for different contexts
const DEFAULT_SIZES = {
  hero: '100vw',
  card: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  thumbnail: '(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw',
  small: '(max-width: 640px) 100vw, 400px',
}

// Function to recursively find all .tsx files in the src directory
function findTsxFiles() {
  return glob.sync('src/**/*.tsx');
}

// Regular expression to find Image components with fill prop but no sizes prop
const FILL_WITHOUT_SIZES_REGEX = /<Image[^>]*\bfill\b[^>]*(?!\bsizes=)[^>]*>/g;

// Count of fixes applied
let fixedCount = 0;

// Process each file
findTsxFiles().forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Check if file contains Image import from next/image
  if (content.includes('next/image') && FILL_WITHOUT_SIZES_REGEX.test(content)) {
    console.log(`Processing ${filePath}`);
    
    // Replace Image components with fill but no sizes
    content = content.replace(FILL_WITHOUT_SIZES_REGEX, match => {
      // Determine which default sizes to use based on context
      let defaultSizes = DEFAULT_SIZES.card;
      
      if (match.includes('hero') || filePath.includes('hero')) {
        defaultSizes = DEFAULT_SIZES.hero;
      } else if (match.includes('thumbnail') || match.includes('avatar')) {
        defaultSizes = DEFAULT_SIZES.thumbnail;
      } else if (match.includes('small')) {
        defaultSizes = DEFAULT_SIZES.small;
      }
      
      // Insert sizes attribute before the closing >
      const updatedMatch = match.replace(/(?=>)$/, ` sizes="${defaultSizes}"`);
      return updatedMatch;
    });
    
    // If content was modified, write it back to the file
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixedCount++;
      console.log(`Fixed ${filePath}`);
    }
  }
});

console.log(`Done! Fixed ${fixedCount} files.`); 