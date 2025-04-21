# The Travelling Technicians Website - Project Documentation

## Project Overview

**The Travelling Technicians** is a mobile phone and laptop repair service with a key differentiator of offering doorstep repair services across the Lower Mainland area in British Columbia. The business allows customers to book repair services online, and technicians travel to the customer's location to perform repairs.

### Key Business Features

- **Doorstep repair service** (technicians travel to customer)
- **Online booking system**
- **Service coverage** across Lower Mainland, BC (Vancouver, Burnaby, Surrey, Richmond, etc.)
- **Transparent pricing** and process

## Current Implementation Status

### Completed Pages

1. **Services Pages**
   - ✅ Mobile Repair (`src/pages/services/mobile.tsx`)
     - Includes services list, pricing, popular services highlight
     - Emphasizes doorstep availability for each service
     - Features brands serviced and repair process
   - ✅ Laptop Repair (`src/pages/services/laptop.tsx`)
     - Similar structure to mobile page
     - Features 10 laptop repair services with doorstep availability specified
     - Includes laptop brands serviced section

2. **Core Pages**
   - ✅ Pricing (`src/pages/pricing.tsx`)
     - Comprehensive pricing tables for mobile and laptop services
     - Custom quote section
     - FAQ section about pricing
   - ✅ About Us (`src/pages/about.tsx`)
     - Company story and history
     - Team member profiles
     - Core values
     - Company milestones
   - ✅ Service Areas (`src/pages/service-areas.tsx`)
     - Coverage map
     - List of areas served
     - Service types (residential, business, retail)
     - Postal code checker component
   - ✅ FAQ (`src/pages/faq.tsx`)
     - Categorized FAQ sections
     - Interactive accordion interface
     - Search functionality
   - ✅ Error Pages
     - 404 Page
     - 500 Page
     - Generic Error Page

3. **Components**
   - ✅ Layout Components
     - Header with responsive navigation
     - Footer with sitemap and contact info
   - ✅ Booking Form Component (initial version)
     - Form fields for customer and device information
     - Service selection
     - Date and time picker
   - ✅ Error Handling Components
     - ErrorBoundary for catching UI errors
     - GlobalErrorHandler for toast notifications
     - SafeImage for handling image loading errors

### In Progress

1. **Doorstep Repair Page**
   - Dedicated page highlighting the doorstep service advantage
   - Process explanation and benefits

2. **PostalCodeChecker Component**
   - Component to check if a postal code is within service area
   - To be integrated with service-areas and booking pages

3. **Home Page Refinement**
   - Ensuring messaging clearly communicates USP
   - Highlighting doorstep service and easy online booking

### Planned/Upcoming

1. **Book Online Page**
   - Complete booking flow
   - Calendar integration
   - Confirmation and notification system

2. **Blog Page**
   - Blog post listing
   - Individual blog post pages
   - Categories and filters

3. **Contact Us Page**
   - Contact form
   - Google Maps integration
   - Contact information display

4. **Image Integration**
   - Replace placeholder Unsplash images with appropriate device repair images
   - (Currently encountering 404 errors with placeholder images)

## Technical Implementation

### Technology Stack

- **Frontend**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Components**: Custom React components
- **Routing**: Next.js file-based routing
- **SEO**: Next.js Head component for meta tags
- **Error Handling**: Custom error boundaries and global error handlers

### Key Components

1. **Layout.tsx**
   - Base layout wrapper with consistent header and footer
   - Handles page titles and meta tags

2. **Header.tsx**
   - Responsive navigation with mobile menu
   - Dropdown for Services submenu
   - Active link highlighting

3. **BookingForm.tsx**
   - Multi-step form for booking repair services
   - Service selection
   - Date/time picker
   - Customer information collection

4. **PostalCodeChecker.tsx**
   - Validates if a customer's location is within service area
   - To be integrated with booking flow

5. **ErrorBoundary.tsx**
   - Class component that catches JavaScript errors in child components
   - Prevents entire app from crashing due to component errors
   - Displays user-friendly fallback UI

6. **GlobalErrorHandler.tsx**
   - Toast notification system for displaying non-fatal errors
   - Provides global error event system
   - Customizable error messages with different severity levels

7. **SafeImage.tsx**
   - Wrapper for Next.js Image component
   - Handles loading errors gracefully
   - Provides fallback UI for broken images

## Technical Challenges Addressed

1. **TypeScript Integration**
   - Added proper type definitions for components and props
   - Fixed type errors in various components

2. **Active Link Highlighting**
   - Implemented `useRouter` to detect current path
   - Added conditional classes for active navigation items

3. **Responsive Design**
   - Implemented mobile-friendly navigation with Headless UI
   - Responsive layouts for all pages

4. **Error Handling**
   - Created proper error pages (404, 500, generic)
   - Added error boundaries to prevent app crashes
   - Implemented global error toast notifications
   - Added utilities for safe JSON parsing and API fetching
   - Created component for handling image loading errors

## Error Handling Implementation

1. **Error Boundary**
   - Catches JavaScript errors in component tree
   - Displays user-friendly fallback UI
   - Prevents entire app from crashing

2. **Error Pages**
   - Custom 404 page for not found errors
   - Custom 500 page for server errors
   - Generic error page with proper handling

3. **Global Error Handling**
   - Toast notifications for non-fatal errors
   - Global event system for error communication
   - Different severity levels (error, warning, info)

4. **API Error Handling**
   - Safe fetch utilities with proper error handling
   - JSON parsing error prevention
   - Typed API responses

5. **Image Error Handling**
   - SafeImage component for graceful fallbacks
   - Prevents broken image UI issues

## SEO Optimization

1. **Meta Tags**
   - Added descriptive meta descriptions for all pages
   - Implemented proper page titles

2. **Local SEO**
   - Incorporated location-specific keywords
   - Created dedicated Service Areas page

3. **Content Strategy**
   - Clear service descriptions
   - FAQ content to address common questions

## Next Steps

1. **Complete Remaining Pages**
   - Finish Doorstep Repair page
   - Create Book Online page
   - Develop Contact page
   - Build Blog infrastructure

2. **Enhance Booking System**
   - Complete postal code validation
   - Integrate calendar for time slot selection
   - Add email notification system

3. **Image and Visual Assets**
   - Replace all placeholder images with actual device repair photos
   - Add more visual elements to highlight doorstep service

4. **Testing and Optimization**
   - Cross-browser testing
   - Mobile responsiveness testing
   - Performance optimization
   - Accessibility improvements

5. **Content Enhancement**
   - Add more detailed service descriptions
   - Expand FAQ content
   - Create blog posts focused on device repair topics

6. **Deployment**
   - Prepare for production deployment
   - Set up analytics
   - Configure proper error logging

## Development Notes

- The webpack cache occasionally encounters ENOENT errors, but these don't affect the build process
- Some placeholder Unsplash images return 404 errors and will need to be replaced
- Current focus is on completing core functionality before visual refinement

---

*Last Updated: June 2023* 