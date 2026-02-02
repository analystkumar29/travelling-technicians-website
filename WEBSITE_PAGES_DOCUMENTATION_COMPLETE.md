# The Travelling Technicians - Complete Website Documentation

**Generated:** February 1, 2026  
**Last Updated:** February 1, 2026  
**Project:** The Travelling Technicians Website  
**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase PostgreSQL

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Website Architecture Overview](#website-architecture-overview)
3. [Static Pages Inventory](#static-pages-inventory)
4. [Dynamic Pages Analysis](#dynamic-pages-analysis)
5. [API Endpoints Documentation](#api-endpoints-documentation)
6. [Database Schema Analysis](#database-schema-analysis)
7. [SEO & Performance Implementation](#seo--performance-implementation)
8. [Management & Admin Pages](#management--admin-pages)
9. [Complete URL Inventory](#complete-url-inventory)
10. [Maintenance & Monitoring](#maintenance--monitoring)

---

## Executive Summary

The Travelling Technicians website is a sophisticated Next.js application designed to support a mobile phone and laptop repair business with doorstep service across the Lower Mainland, BC. The website features:

- **3,000+ dynamic SEO pages** generated from database content
- **Universal routing system** for city-service-model combinations
- **Database-driven content** with Supabase PostgreSQL backend
- **Incremental Static Regeneration (ISR)** for performance
- **Comprehensive API layer** for booking, pricing, and management
- **SEO-optimized** with structured data and dynamic sitemaps

### Key Statistics
- **Static Pages**: 20+ traditional pages
- **Dynamic Pages**: 3,000+ database-generated pages
- **API Endpoints**: 50+ endpoints
- **Service Areas**: 13+ cities in Lower Mainland
- **Device Models**: 124+ active models
- **Services**: 4+ active doorstep-eligible services

---

## Website Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14 with TypeScript & Tailwind CSS
- **Backend**: Next.js API routes with Supabase integration
- **Database**: Supabase PostgreSQL with Row-Level Security
- **Hosting**: Vercel with serverless functions
- **Email**: SendGrid for notifications
- **Maps**: Leaflet.js for interactive service area maps

### Key Architectural Features
1. **Universal Routing System**: Single `/repair/[[...slug]].tsx` file handles all dynamic routes
2. **Database-Driven Content**: All pages generated from Supabase tables
3. **ISR (Incremental Static Regeneration)**: Pages revalidate automatically
4. **Code Splitting**: Dynamic imports for optimal performance
5. **Structured Data**: JSON-LD schemas for LocalBusiness, Service, Place
6. **Dynamic Sitemap**: Generates 2,000+ URLs with real lastmod dates

### Directory Structure
```
src/
├── pages/                    # Next.js pages
│   ├── index.tsx            # Homepage
│   ├── about.tsx            # About page
│   ├── book-online.tsx      # Booking flow
│   ├── repair/              # Dynamic repair pages (3,000+)
│   ├── services/            # Dynamic service pages
│   ├── locations/           # City and neighborhood pages
│   ├── blog/                # Blog articles
│   ├── management/          # Admin panel
│   └── api/                 # API endpoints
├── components/              # React components
├── lib/                     # Utility libraries
├── utils/                   # Helper functions
└── types/                   # TypeScript definitions
```

---

## Static Pages Inventory

### Core Business Pages

#### 1. Homepage (`/`)
- **File**: `/src/pages/index.tsx`
- **Purpose**: Primary landing page with booking CTAs
- **Features**:
  - Postal code checker for service availability
  - Pricing preview for mobile/laptop/tablet
  - Customer testimonials
  - Service area map
  - Trust metrics and certifications
- **SEO**: LocalBusiness, Organization, Review schemas
- **CTAs**: "Book Repair", "Emergency Call", "See All Services"

#### 2. Book Online (`/book-online`)
- **File**: `/src/pages/book-online.tsx`
- **Purpose**: Multi-step booking form
- **Features**:
  - Device type selection
  - Service selection
  - Model selection
  - Address input with autocomplete
  - Time slot selection
  - Price calculation
- **Integration**: Supabase for booking storage, SendGrid for confirmation emails

#### 3. Doorstep Repair (`/doorstep-repair`)
- **File**: `/src/pages/doorstep-repair.tsx`
- **Purpose**: Highlight doorstep service convenience
- **Features**:
  - Benefits of doorstep service
  - Process explanation
  - Service area coverage
  - Testimonials focused on convenience

#### 4. Mobile Screen Repair (`/mobile-screen-repair`)
- **File**: `/src/pages/mobile-screen-repair.tsx`
- **Purpose**: Service-specific landing page
- **Features**:
  - Mobile repair services list
  - Brands serviced
  - Pricing information
  - Booking CTAs

#### 5. Laptop Screen Repair (`/laptop-screen-repair`)
- **File**: `/src/pages/laptop-screen-repair.tsx`
- **Purpose**: Laptop-specific service page
- **Features**:
  - Laptop repair services
  - Common issues addressed
  - Brand coverage
  - Booking integration

#### 6. Mobile Repair Near Me (`/mobile-repair-near-me`)
- **File**: `/src/pages/mobile-repair-near-me.tsx`
- **Purpose**: Local SEO optimized page
- **Features**:
  - Geo-targeted content
  - Service area map
  - Local testimonials
  - Neighborhood-specific CTAs

### Informational Pages

#### 7. About Us (`/about`)
- **File**: `/src/pages/about.tsx`
- **Purpose**: Company story and team
- **Features**:
  - Company history
  - Technician certifications
  - Mission and values
  - Team photos and bios

#### 8. Contact (`/contact`)
- **File**: `/src/pages/contact.tsx`
- **Purpose**: Contact information and form
- **Features**:
  - Contact form
  - Business hours
  - Phone and email
  - Service area map
  - FAQ links

#### 9. Pricing (`/pricing`)
- **File**: `/src/pages/pricing.tsx`
- **Purpose**: Transparent pricing information
- **Features**:
  - Service price ranges
  - Device-specific pricing
  - Warranty information
  - Price match guarantee
  - Booking CTAs

#### 10. FAQ (`/faq`)
- **File**: `/src/pages/faq.tsx`
- **Purpose**: Frequently asked questions
- **Features**:
  - Categorized questions
  - Search functionality
  - Booking process FAQs
  - Warranty and guarantee FAQs

#### 11. Service Areas (`/service-areas`)
- **File**: `/src/pages/service-areas.tsx`
- **Purpose**: Service coverage information
- **Features**:
  - Interactive map
  - City list with links
  - Postal code checker
  - Neighborhood coverage

### Booking & Customer Pages

#### 12. Booking Confirmation (`/booking-confirmation`)
- **File**: `/src/pages/booking-confirmation.tsx`
- **Purpose**: Post-booking confirmation
- **Features**:
  - Booking details summary
  - Next steps
  - Technician information
  - Contact details
  - Reschedule options

#### 13. Verify Booking (`/verify-booking`)
- **File**: `/src/pages/verify-booking.tsx`
- **Purpose**: Booking verification page
- **Features**:
  - Email verification
  - Booking status check
  - Resend confirmation

#### 14. Reschedule Booking (`/reschedule-booking`)
- **File**: `/src/pages/reschedule-booking.tsx`
- **Purpose**: Booking modification
- **Features**:
  - Time slot rescheduling
  - Service changes
  - Contact information updates

### Legal Pages

#### 15. Privacy Policy (`/privacy-policy`)
- **File**: `/src/pages/privacy-policy.tsx`
- **Purpose**: Privacy compliance
- **Features**:
  - Data collection policies
  - Cookie usage
  - User rights
  - Contact for privacy concerns

#### 16. Terms & Conditions (`/terms-conditions`)
- **File**: `/src/pages/terms-conditions.tsx`
- **Purpose**: Service terms
- **Features**:
  - Service terms
  - Liability limitations
  - User responsibilities
  - Dispute resolution

### Utility Pages

#### 17. Sitemap (`/sitemap`)
- **File**: `/src/pages/sitemap.tsx`
- **Purpose**: Human-readable sitemap
- **Features**:
  - Categorized URL list
  - Last updated dates
  - XML sitemap link

#### 18. Login (`/login`)
- **File**: `/src/pages/login.tsx`
- **Purpose**: Admin authentication
- **Features**:
  - Admin login form
  - Password reset
  - Session management

#### 19. 404 Page (`/404`)
- **File**: `/src/pages/404.tsx`
- **Purpose**: Not found error page
- **Features**:
  - Search suggestions
  - Navigation to popular pages
  - Contact information

#### 20. 500 Page (`/500`)
- **File**: `/src/pages/500.tsx`
- **Purpose**: Server error page
- **Features**:
  - Error message
  - Retry options
  - Contact support

### Static Page Summary
| Page | Purpose | Key Features | SEO Priority |
|------|---------|--------------|--------------|
| Homepage | Primary landing | Booking CTAs, Pricing, Testimonials | 1.0 |
| Book Online | Booking flow | Multi-step form, Price calculation | 0.95 |
| Doorstep Repair | Service highlight | Convenience benefits, Process | 0.9 |
| Mobile Screen Repair | Service page | Mobile services, Brands, Pricing | 0.9 |
| Laptop Screen Repair | Service page | Laptop services, Common issues | 0.9 |
| About Us | Company info | History, Team, Certifications | 0.8 |
| Contact | Contact info | Form, Hours, Map | 0.8 |
| Pricing | Price transparency | Ranges, Warranties, Guarantees | 0.8 |
| FAQ | Customer support | Search, Categories, Answers | 0.7 |
| Service Areas | Coverage info | Map, Cities, Checker | 0.8 |

---

## Dynamic Pages Analysis

### Universal Routing System

#### Core File: `/src/pages/repair/[[...slug]].tsx`
This single file handles all dynamic repair routes using Next.js catch-all routing.

**Route Patterns:**
1. `/repair` - Repair index page
2. `/repair/[city]` - City-specific repair page
3. `/repair/[city]/[service]` - City-service combination
4. `/repair/[city]/[service]/[model]` - City-service-model detail page

**Database Integration:**
- Uses `dynamic_routes` table for pre-computed routes
- Each route has associated city, service, and model data
- Automatic regeneration via database triggers

**Performance Features:**
- **ISR**: Revalidates every 24 hours (86400 seconds)
- **Code Splitting**: Dynamic imports for templates
- **Fallback**: 'blocking' for on-demand generation
- **Popularity-based**: Top 100 routes pre-rendered at build time

### Dynamic Service Pages

#### File: `/src/pages/services/[slug].tsx`
Handles dynamic service pages based on database content.

**Supported Services:**
1. `/services/laptop-repair`
2. `/services/mobile-repair`
3. `/services/tablet-repair`

**Features:**
- Service-specific content from database
- Brand listings
- Pricing information
- Booking integration
- Structured data (ServiceSchema)

**Data Flow:**
1. `getStaticPaths` fetches active service slugs from database
2. `getStaticProps` fetches service details and brands
3. Page renders with service-specific template
4. ISR revalidates every hour (3600 seconds)

### Dynamic Location Pages

#### File: `/src/pages/locations/[city].tsx`
City-specific service pages with local content.

**Supported Cities:** 13+ cities including:
- Vancouver, Burnaby, Richmond, Coquitlam
- North Vancouver, West Vancouver, New Westminster
- Chilliwack, Surrey, Delta, Langley

**Features:**
- City-specific testimonials
- Neighborhood listings
- Local business schema
- Place schema for map pack visibility
- Wikidata integration for sameAs URLs

#### File: `/src/pages/locations/[city]/[neighborhood].tsx`
Neighborhood-specific pages (Phase 8 implementation).

**Features:**
- Hyper-local content
- Neighborhood-specific testimonials
- Local business schema
- Breadcrumb navigation
- Nearby neighborhoods links

### Dynamic Blog Pages

#### File: `/src/pages/blog/[slug].tsx`
Individual blog article pages.

**Current Articles:**
1. `/blog/signs-your-phone-needs-repair`
2. `/blog/how-to-extend-your-laptop-battery-life`
3. `/blog/ultimate-guide-to-screen-protection`
4. `/blog/water-damage-first-aid-for-devices`

**Features:**
- Article content with markdown support
- Related articles
- Author information
- Social sharing
- Comment system (planned)

#### File: `/src/pages/blog/category/[category].tsx`
Blog category pages.

**Categories:**
- Mobile repair tips
- Laptop maintenance
- Device protection

### Dynamic Page Generation Statistics

**Total Dynamic Pages:** ~3,000+
- **City Pages**: 13+ cities
- **Service Pages**: 3 services × 13 cities = 39 pages
- **Model-Service Pages**: 124 models × 4 services × 13 cities = ~6,448 potential pages
- **Neighborhood Pages**: 50+ neighborhoods across 13 cities
- **Blog Pages**: 5+ articles with categories

**Actual Generation:** Limited to active combinations with pricing data
- **Active Models**: 124 models
- **Active Services**: 4 services
- **Active Cities**: 13 cities
- **Total Active**: 124 × 4 × 13 = ~6,448 potential
- **Generated**: Top 100 popular routes pre-rendered, others on-demand

---

## API Endpoints Documentation

### API Structure
```
src/pages/api/
├── bookings/          # Booking management
├── pricing/          # Price calculation
├── management/       # Admin functions
├── devices/          # Device data
├── cache/            # Cache management
├── cron/             # Scheduled tasks
├── debug/            # Debug utilities
└── webhooks/         # External integrations
```

### Booking API Endpoints

#### 1. Create Booking (`POST /api/bookings/create`)
- **Purpose**: Create new booking
- **Parameters**: Customer info, device, service, address, time
- **Response**: Booking reference, confirmation details
- **Integration**: Supabase storage, SendGrid email

#### 2. Get Booking (`GET /api/bookings/[reference]`)
- **Purpose**: Retrieve booking details
- **Parameters**: Booking reference
- **Response**: Booking information, status

#### 3. Update Booking (`PUT /api/bookings/update`)
- **Purpose**: Modify existing booking
- **Parameters**: Booking reference, updates
- **Response**: Updated booking details

#### 4. Find by Email (`GET /api/bookings/by-email`)
- **Purpose**: Find customer bookings
- **Parameters**: Email address
- **Response**: Array of bookings

#### 5. Confirm Redirect (`GET /api/bookings/confirm-redirect`)
- **Purpose**: Booking confirmation redirect
- **Parameters**: Booking reference
- **Response**: Redirect to confirmation page

### Pricing API Endpoints

#### 1. Calculate Price (`GET /api/pricing/calculate`)
- **Purpose**: Dynamic price calculation
- **Parameters**: Service ID, Model ID, Location
- **Response**: Price, compare price, tier

#### 2. Get Services (`GET /api/pricing/services`)
- **Purpose**: List available services
- **Parameters**: Device type filter
- **Response**: Service list with pricing

#### 3. Get Tiers (`GET /api/pricing/tiers`)
- **Purpose**: Pricing tier information
- **Response**: Tier definitions and pricing

### Management API Endpoints

#### 1. Admin Login (`POST /api/management/login`)
- **Purpose**: Admin authentication
- **Parameters**: Username, password
- **Response**: JWT token, user info

#### 2. Get Bookings (`GET /api/management/bookings`)
- **Purpose**: Admin booking view
- **Parameters**: Date range, status filter
- **Response**: Booking list with details

#### 3. Bulk Pricing (`POST /api/management/bulk-pricing`)
- **Purpose**: Bulk price updates
- **Parameters**: Pricing data array
- **Response**: Update results

#### 4. Customer Feedback (`GET /api/management/customer-feedback`)
- **Purpose**: Customer feedback management
- **Response**: Feedback list with ratings

### Device API Endpoints

#### 1. Get Brands (`GET /api/devices/brands`)
- **Purpose**: List device brands
- **Response**: Brand list with counts

#### 2. Get Models (`GET /api/devices/models`)
- **Purpose**: List device models
- **Parameters**: Brand filter, type filter
- **Response**: Model list with details

### Cache API Endpoints

#### 1. Health Check (`GET /api/cache/health`)
- **Purpose**: Cache system status
- **Response**: Cache statistics, hit rates

#### 2. Invalidate Cache (`POST /api/cache/invalidate`)
- **Purpose**: Manual cache invalidation
- **Parameters**: Cache keys or patterns
- **Response**: Invalidation results

#### 3. Warm Cache (`POST /api/cache/warm`)
- **