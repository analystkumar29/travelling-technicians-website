#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to the BookingForm.tsx file
const filePath = path.join(__dirname, 'src', 'components', 'booking', 'BookingForm.tsx');

// Read the file content
let content = fs.readFileSync(filePath, 'utf-8');

// The replacement function with correct syntax
const replacementFunction = `
    // Function to handle address selection and set postal code attention flag if needed
    const handleAddressSelect = (address: string, isValid: boolean, postalCode?: string) => {
      // Update the form field value
      methods.setValue('address', address);
      
      if (postalCode) {
        methods.setValue('postalCode', postalCode);
        setNeedsPostalCodeAttention(!isValid); // If not valid, need attention
        
        // If postal code is not in service area, set an error
        if (!isValid) {
          methods.setError('postalCode', { 
            type: 'validate', 
            message: \`Unfortunately, we don't service \${postalCode} at this time.\` 
          });
        }
      } else {
        setNeedsPostalCodeAttention(true); // No postal code detected, need user input
      }
    };
`;

// Regular expression to match the handleAddressSelect function
const functionRegex = /\s+\/\/ Function to handle address selection[\s\S]*?};/;

// Replace the function in the content
const newContent = content.replace(functionRegex, replacementFunction);

// Write the updated content back to the file
fs.writeFileSync(filePath, newContent, 'utf-8');

console.log('Syntax in BookingForm.tsx has been fixed!'); 