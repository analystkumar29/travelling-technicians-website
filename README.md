# The Travelling Technicians Website

A professional website for a mobile phone and laptop repair service that specializes in doorstep repair across the Lower Mainland of British Columbia.

## Project Overview

The Travelling Technicians provides mobile phone and laptop repair services directly at customers' locations throughout the Greater Vancouver area and beyond, from Whistler to Chilliwack. This website showcases our services, coverage areas, and facilitates online booking.

### Key Features

- **Doorstep Repair Focus**: Emphasizes the convenience of on-site repair throughout the website
- **Service Details**: Comprehensive information about mobile and laptop repair services
- **Online Booking**: Easy-to-use booking system for scheduling repairs
- **Interactive Coverage Map**: Visual representation of all service areas with interactive markers
- **Postal Code Checker**: Tool to verify service availability by postal code
- **Responsive Design**: Fully mobile-friendly interface

## Project Structure

### Pages

- **Home (`/src/pages/index.tsx`)**: Landing page with hero section, key services, benefits, and CTAs
- **Services**:
  - Mobile Repair (`/src/pages/services/mobile.tsx`): Details of phone repair services
  - Laptop Repair (`/src/pages/services/laptop.tsx`): Details of laptop repair services
- **Doorstep Repair (`/src/pages/doorstep.tsx`)**: Information about our doorstep service model
- **Service Areas (`/src/pages/service-areas.tsx`)**: Coverage map and list of communities served
- **Pricing (`/src/pages/pricing.tsx`)**: Transparent pricing for all services
- **About Us (`/src/pages/about.tsx`)**: Company information, team, and values
- **FAQ (`/src/pages/faq.tsx`)**: Common questions and answers
- **Blog (`/src/pages/blog/`)**: 
  - Blog Index (`/src/pages/blog/index.tsx`): List of all blog posts
  - Category Pages (`/src/pages/blog/category/[category].tsx`): Posts filtered by category
  - Individual Blog Posts (`/src/pages/blog/*.tsx`): Detailed articles
- **Book Online (`/src/pages/book-online.tsx`)**: Scheduling interface
- **Contact (`/src/pages/contact.tsx`)**: Contact form and information

### Components

- **Layout (`/src/components/layout/`)**: 
  - `Layout.tsx`: Main layout wrapper with metadata
  - `Header.tsx`: Navigation header
  - `Footer.tsx`: Site footer
- **Interactive Map (`/src/components/InteractiveMap.tsx`)**: Map showing service areas
- **Postal Code Checker (`/src/components/PostalCodeChecker.tsx`)**: Tool to check service availability
- **Error Handling**:
  - `404.tsx`: Not found page
  - `500.tsx`: Server error page
  - `_error.tsx`: Generic error handler

### Coverage Areas

The website now displays service coverage across an expanded area including:

- **Greater Vancouver**: Vancouver, Burnaby, Richmond, Surrey, Coquitlam, Port Coquitlam, Port Moody, New Westminster
- **North Shore**: North Vancouver, West Vancouver
- **Eastern Regions**: Maple Ridge, Pitt Meadows, Mission, Abbotsford, Chilliwack
- **Southern Areas**: Delta, Langley, White Rock
- **Northern Regions**: Squamish, Whistler

## Technology Stack

- **Framework**: Next.js 13.5.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Interactive Map**: Leaflet.js (with dynamic import for optimal loading)
- **Deployment**: [Your deployment platform]

## Local Development

1. Clone the repository
   ```
   git clone [repository URL]
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Run the development server
   ```
   npm run dev
   ```

4. Build for production
   ```
   npm run build
   ```

## Notes for Developers

- Image URLs from Unsplash may need to be replaced with permanent assets before deployment (current 404 errors in development)
- The service area markers on the map are customizable in `InteractiveMap.tsx` and `MapComponent.tsx`
- Service areas have been expanded to include a broader coverage region from Whistler to Chilliwack
- When adding new blog posts, follow the pattern in the existing blog files and update the posts array in the blog index
- For category pages, ensure new categories are added to the `categories` array in the blog files

## SEO Strategy

The site includes optimizations for local SEO:
- Location-specific keywords throughout content
- Service area details for each community
- Structured data for local business
- Location-optimized meta tags and descriptions

## Future Enhancements

- Integration with real-time booking system
- Customer portal for repair status
- Expanded blog content for repair topics
- Customer review/testimonial system
- Live chat support

## Contributors

- [Your team information]

## License

[Your license information] 