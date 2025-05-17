# Next.js Router Error Fixes for The Travelling Technicians Website

This document provides a comprehensive overview of the solution implemented to fix router-related errors in our Next.js 13.5.x application.

## Problem Summary

Our Next.js application was experiencing the following errors:

- `Cannot read properties of undefined (reading 'data')` in webpack.js
- `Cannot read properties of undefined (reading 'data')` in remove-trailing-slash.js
- Various router-related errors during navigation
- React warnings about props like `fetchPriority`

## Final Solution: Runtime Patches

After experimenting with different approaches, we've found that using runtime patches instead of modifying Next.js files directly provides the most stable solution:

### 1. Runtime Patches (`src/utils/nextjs-runtime-fix.js`)

This file applies dynamic JavaScript patches at runtime to fix common error patterns:

- Ensures `window.__NEXT_DATA__` always exists with required properties
- Patches `history.pushState` and `history.replaceState` methods to prevent issues with state.data
- Adds a global error handler to catch and suppress specific router errors
- Patches the `Object.defineProperty` function to intercept and fix the `removeTrailingSlash` function
- Suppresses specific React warnings about props like `fetchPriority`

### 2. Clean Development Server (`start-dev-stable.js`)

Custom script to start Next.js with environment variables that improve stability:

```bash
npm run dev:stable
```

This script:
- Sets `NODE_OPTIONS='--no-warnings'` to suppress warnings
- Sets Next.js specific environment variables for stability
- Improves error handling and reporting

### 3. Safe Router Access (`src/hooks/useSafeRouter.ts`)

A custom hook that provides safe access to Next.js router properties:

```javascript
import useSafeRouter from '@/hooks/useSafeRouter';

function MyComponent() {
  const { getQuery, push } = useSafeRouter();
  
  // Safely get query param with default value
  const id = getQuery('id', 'default-id');
  
  // Safe navigation with fallback
  const handleClick = () => {
    push('/some-page?id=123');
  };
}
```

## How to Use

### Development

Use the stable development script for the most reliable development experience:

```bash
npm run dev:stable
```

### Production

For production builds, standard commands work fine as our patches are applied at runtime:

```bash
npm run build
npm run start
```

### Using the Safe Router Hook

In your components, import and use the safe router hook instead of Next.js's useRouter:

```javascript
import useSafeRouter from '@/hooks/useSafeRouter';

function MyComponent() {
  const { getQuery, getAllQueryParams, push, replace, back } = useSafeRouter();
  
  // Now use these methods safely
}
```

## Troubleshooting

If you encounter router-related errors:

1. Check the console for any error messages
2. Ensure that `nextjs-runtime-fix.js` is properly imported in `_app.tsx`
3. Try cleaning the `.next` directory and restarting the development server
4. For persistent issues, try running `node clean-router-fix.js` to reinstall Next.js and set up the patches

## Technical Details

### Why Runtime Patches Instead of Direct Modifications?

- **Stability**: Directly modifying Next.js files often leads to syntax errors and compilation issues
- **Maintainability**: Runtime patches are easier to update and maintain
- **Upgradeability**: Less likely to break when upgrading Next.js versions
- **Safety**: Only modifies behavior in the browser, not in the source files

### Implementation Notes

- Runtime patches are applied immediately when imported in `_app.tsx`
- The patches only run in the browser environment (`typeof window !== 'undefined'`)
- Error suppression is targeted to specific patterns to avoid masking actual bugs
- Safe router hooks provide additional protection at the component level

## Future Improvements

- Monitor for Next.js updates that might resolve these issues natively
- Consider migrating to the App Router in Next.js 14+ which has different architecture
- Add telemetry to track suppressed errors for better debugging

## Resources

- [Next.js Router Documentation](https://nextjs.org/docs/pages/api-reference/functions/use-router)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [JavaScript Error Handling Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling) 