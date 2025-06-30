# Template Literal Syntax Error Fixes

## Overview

Template literals in JavaScript allow for embedded expressions, but they can cause syntax errors if not properly balanced or when using special characters. These "Invalid or unexpected token" errors can be particularly difficult to track down as they may only appear in the compiled JavaScript and cause white screens in Next.js applications.

## Common Template Literal Issues Fixed

This project experienced several template literal issues causing "Invalid or unexpected token" errors:

1. **Unbalanced backticks** - Missing closing backticks in template literals
2. **Improper nested templates** - Issues with template literals inside template literals
3. **Regex escape sequences** - Improper handling of backslashes in regex patterns within template literals
4. **Conditional expressions** - Incomplete ternary expressions within template literals

## Fixes Applied

### 1. Breaking Down Complex Template Literals

Before:
```javascript
onChange={(e) => setPostalCode(e.target.value.toUpperCase().replace(/\\s+/g, ' ').trim())}
```

After:
```javascript
onChange={(e) => {
  const value = e.target.value.toUpperCase();
  const trimmed = value.replace(/\s+/g, ' ').trim();
  setPostalCode(trimmed);
}}
```

### 2. Simplifying Conditional Template Literals

Before:
```javascript
const imageUrl = `https://images.unsplash.com/photo-${imageId}?q=${quality}&w=${imgWidth}${imgHeight ? `&h=${imgHeight}` : ''}`;
```

After:
```javascript
const heightParam = imgHeight ? `&h=${imgHeight}` : '';
const imageUrl = `https://images.unsplash.com/photo-${imageId}?q=${quality}&w=${imgWidth}${heightParam}`;
```

### 3. Proper Escape Sequence Handling

Bad:
```javascript
replace(/\\s+/g, ' ')  // Too many backslashes causes issues
```

Good:
```javascript
replace(/\s+/g, ' ')   // Correct number of backslashes
```

### 4. Breaking Down Complex Expressions

Bad:
```javascript
const address = `Service Area ${postalCode.toUpperCase().replace(/\\s+/g, ' ').trim()}`
```

Good:
```javascript
const formattedPostalCode = postalCode.toUpperCase().trim();
const formattedPostalCodeWithSpace = formattedPostalCode.replace(/\s+/g, ' ');
const address = `Service Area ${formattedPostalCodeWithSpace}`;
```

## Best Practices for Template Literals

1. **Balance Backticks**: Ensure every opening backtick has a corresponding closing backtick.
2. **Split Complex Expressions**: Break down complex template literals into simpler parts with intermediate variables.
3. **Avoid Deep Nesting**: Avoid nesting template literals too deeply. Use intermediate variables.
4. **Watch Escape Sequences**: Be careful with backslashes in regex patterns. Inside template literals, they need proper escaping.
5. **Complete Ternaries**: Always provide both outcomes in ternary expressions.
6. **Test Thoroughly**: Test your code in both development and production builds.
7. **Single Responsibility**: Keep template literals focused on a single purpose.
8. **Line Breaks**: Be cautious about line breaks in template literals as they are preserved.

## The Fix Script

We created `fix-template-literals.js` that automatically scans for and fixes common template literal issues. It handles:

- Escaped backslashes in regex patterns
- Unbalanced template literals with conditional expressions
- Broken template literals across multiple lines

## How to Run the Fix Script

```bash
node fix-template-literals.js
```

## Prevention

To prevent template literal syntax errors in the future:

1. Run the `fix-template-literals.js` script as part of your build process
2. Use ESLint rules to catch template literal issues:
   ```json
   "rules": {
     "no-template-curly-in-string": "error",
     "no-unexpected-multiline": "error"
   }
   ```
3. Add comprehensive testing for components using complex template literals
4. Use the clean-start.js script to reset the environment when needed:
   ```bash
   node clean-start.js
   ```

## References

- [MDN Web Docs: Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
- [Common JavaScript Error: Invalid or unexpected token](https://stackoverflow.com/questions/37881441/javascript-error-invalid-or-unexpected-token) 
- [Next.js Troubleshooting: White Screens](https://nextjs.org/docs/messages/white-screen-error) 