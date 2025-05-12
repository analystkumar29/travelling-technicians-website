# Release Notes: The Travelling Technicians Website v2.0.0

## Overview
This release introduces a significantly improved booking system with more robust error handling, email functionality, and fixes to critical frontend and backend components.

## Key Improvements

### Booking System
- Fixed type errors in the booking form that were preventing successful builds
- Made `city` and `province` fields required for proper database storage
- Corrected field naming consistency between frontend and backend
- Added proper validation for required fields during submission
- Fixed missing data transformations between camelCase and snake_case formats

### Email Functionality
- Fixed URL parsing issue in email service to ensure proper sending of confirmation emails
- Added absolute URL support for both server-side and client-side requests
- Improved error logging for email sending failures
- Now correctly sends booking confirmation emails to customers

### Component Fixes
- Fixed `SafeImage` component to properly handle loading states
- Added missing API utility functions for fetch operations
- Corrected context handling in `BookingContext` to prevent "undefined is not an object" errors
- Added proper error boundaries and fallbacks for critical components

### Developer Experience
- Added better error messages and error handling throughout the codebase
- Improved logging for easier debugging of booking and email issues
- Fixed build errors that were preventing deployment on Vercel

## Technical Details
- Created proper API utilities for consistent error handling
- Fixed missing imports and dependencies
- Added proper type definitions for booking-related data
- Ensured proper environment variable handling for API endpoints

## Known Issues
- Some Unsplash images may still show 404 errors in development environment
- Hot-reloading issues may require manual refresh in some cases

## Migration Notes
- This version requires rebuilding the Next.js application after deployment
- No database schema changes were required for this update 