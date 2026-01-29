# Project Brief

## Overview
**Project Name**: The Travelling Technicians  
**Description**: A professional mobile phone and laptop repair service offering doorstep convenience across the Lower Mainland, BC. The platform includes an online booking system, transparent dynamic pricing, and technician dispatch.

**Live Website**: [travelling‑technicians.ca](https://travelling‑technicians.ca)  
**Repository**: Private (proprietary)  
**Current Version**: 4.0.0 (September 2025)

## Business Goals
- Provide convenient doorstep repair for mobile phones, laptops, and tablets.
- Enable customers to book repairs online with real‑time pricing.
- Expand service coverage across the Lower Mainland (Vancouver, Burnaby, Surrey, Richmond, etc.).
- Implement promotional pricing and dynamic pricing strategies to stay competitive.
- Maintain high customer satisfaction through reliable service and clear communication.

## Core Features (Based on Code Analysis)
- **Doorstep Service** – Technicians come to the customer's location.
- **Multi‑step Booking Flow** – Device selection, brand/model, service, tier, customer info, confirmation (implemented with `BookingForm` component and `BookingContext`).
- **Dynamic Pricing System** – 1,526+ pricing entries across 338 device models, 22 services, and 4 tiers. Pricing API (`/api/pricing/calculate`) uses a simple query + JavaScript post‑processing pattern; fallback static pricing when database matches fail.
- **Email Notifications** – Booking confirmations and updates via SendGrid (`/api/send‑confirmation`).
- **Service Area Verification** – Postal‑code checker and interactive map (`PostalCodeChecker` component).
- **Admin Management Panel** – Pricing management, audit logging, review queue, quality control, data lineage tracking (Phase 2 implementation).
- **SEO Optimization** – Structured data, local search optimization, sitemaps, meta tags.
- **Dynamic Service Pages** – Database-driven service pages with ISR (Incremental Static Regeneration) for laptop, mobile, and tablet repair services.
- **Performance & Security** – Lighthouse scores >90, HTTPS, security headers, Row‑Level Security, environment‑variable validation.

## Technology Stack (Verified from package.json)
### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui component library
- **State Management**: React Context, TanStack Query (React Query)
- **Animations**: Framer Motion
- **Maps**: Leaflet (react‑leaflet)

### Backend & Infrastructure
- **API**: Next.js API Routes (serverless functions)
- **Database**: Supabase (PostgreSQL) with real‑time capabilities
- **Email**: SendGrid (transactional)
- **Hosting**: Vercel (serverless with edge CDN)
- **Caching**: Multi‑layer in‑memory cache (Node‑cache) with configurable TTLs (`src/utils/cache.ts`, `src/utils/apiCache.ts`)
- **Monitoring**: Vercel Analytics, custom module‑based logging (`src/utils/logger.ts`)

### Development & Tooling
- **Package Manager**: npm
- **Linting/Formatting**: ESLint, Prettier
- **Testing**: Jest, React Testing Library
- **CI/CD**: Vercel deployments, GitHub Actions (if configured)
- **Documentation**: Extensive Markdown docs in `/docs/` (some may be outdated)

## Architecture Highlights (Based on Source Code)
- **Database Schema**: 8 normalized tables (`device_types`, `brands`, `device_models`, `services`, `dynamic_pricing`, `pricing_tiers`, `service_locations`, `bookings`) with proper indexes and constraints 
- **API Design**: RESTful endpoints with consistent error handling, caching, and fallback static data. Each endpoint validates parameters, sets cache headers, and uses module‑specific logging.
- **Caching Strategy**: Per‑endpoint TTL configuration, cache‑key generation, hit‑rate metrics. Caching is implemented for device brands/models and pricing calculations.
- **Error Handling**: Graceful degradation with static fallback data; user‑friendly error messages; module‑based logging.
- **Security**: Environment variable validation at startup, Supabase RLS policies, input sanitization, security headers.

## Current Status (Based on Code Scan)
- **Production Ready**: Fully deployed and operational since September 2025.
- **Booking System**: 100% functional with email confirmations and booking reference tracking.
- **Pricing Coverage**: 1,526+ entries (14.7% of possible combinations); gaps identified for future expansion.
- **Performance**: Lighthouse scores >90 across all metrics; image optimization (WebP, lazy loading) implemented.
- **SEO**: Comprehensive SEO implementation completed January 2026 with zero-regression approach.
- **Recent Milestones** (from migration files and commit history):
  - **Phase 1 (Immediate Actions)** – Quality control columns, emergency blacklist, bulk operations API, management panel enhancements.
  - **Phase 2 (Management Enhancement)** – Audit logging, review queue, approval workflows, data lineage tracking (completed September 2025).
  - **SEO Implementation (Phases 1-4)** – Zero-regression SEO improvements completed January 2026:
    - **Phase 1**: Data service layer with singleton cache pattern, ISR foundation
    - **Phase 2**: Database-driven pricing & content injection
    - **Phase 3**: Dynamic city pages & schema markup (E-E-A-T signals, Wikidata integration)
    - **Phase 4**: Sitemap freshness & fallback (database-driven sitemap with webhook regeneration)
  - **Dynamic Service Pages Implementation (January 2026)** – Database-driven service pages with ISR (Incremental Static Regeneration) for laptop, mobile, and tablet repair services:
    - **Seed Phase**: Extracted hardcoded data from service pages and upserted into Supabase (26 services, 30+ brands, 24 dynamic pricing records)
    - **Safety Phase**: Updated data-service.ts with DB-first fallback pattern and 10% price deviation safety
    - **Switch Phase**: Created dynamic route `pages/services/[slug].tsx` with ISR (1-hour revalidation)
    - **SEO Phase**: Enhanced StructuredData component with location-specific JSON-LD injection
    - **Validation Phase**: Zero UI regression achieved with full testing and production deployment
  - **Dynamic Pricing Fix** – A fixed version of the customer pricing API (`calculate‑fixed.ts`) exists, but the primary endpoint (`calculate.ts`) already uses the simple query pattern. Caching and logging improvements are pending full deployment.
  - **5-Point SEO Audit Protocol Implementation (January 2026)** – Comprehensive SEO infrastructure overhaul addressing critical deficits:
    - **Metadata & Head Consistency**: Implemented global SEO framework with `next-seo@7.0.1`, centralized OpenGraph/Twitter control, and dynamic meta components
    - **Schema.org JSON-LD Coverage**: Eliminated hardcoded pricing, integrated real-time database pricing into structured data with 5-minute caching
    - **Core Web Vitals & Image Optimization**: Verified all images use `next/image`, maintained Lighthouse scores >90
    - **Internal Linking Logic**: Built Breadcrumbs and NearbyCities components with JSON-LD markup and geographic proximity calculations
    - **Database-to-UI Latency & ISR**: Expanded `getStaticPaths` from 8 hardcoded paths to 238+ dynamic paths with 1-hour ISR revalidation
    - **Production Deployment**: All changes deployed to production with zero UI regression and verified functionality
    - **TypeScript Compilation & Build Pipeline Enhancement (January 2026)** – Resolved critical TypeScript compilation errors that blocked Vercel deployments:
      - **Error Analysis**: Identified `DefaultSeoProps` import mismatch and Twitter configuration interface incompatibility with `next-seo@7.0.1`
      - **Systematic Resolution**: Updated import from `'next-seo'` to `'next-seo/pages'` and removed invalid Twitter properties (`siteId`, `creatorId`, `creator`)
      - **Build Verification**: Local build testing confirmed successful compilation before deployment
      - **Pattern Documentation**: Added "TypeScript Compilation & Build Pipeline Pattern" to system patterns for future reference
  - **Technical Debt / Red Flags**:
    - Duplicate API endpoints (`calculate.ts` and `calculate‑fixed.ts`).
    - Pricing coverage gaps may cause fallback to static prices.
    - Some components may have leftover debugging console logs.
    - Staging pipeline for scraped data not yet integrated.

## Team & Contacts
- **Business Contact**: info@travelling‑technicians.ca
- **Development Support**: ops@travelling‑technicians.ca
- **Security Incidents**: security@travelling‑technicians.ca
- **Documentation**: Comprehensive docs in `/docs/`; run `npm run scripts:help` for development utilities.

## Roadmap & Future Work (from README and Code Comments)
- **Payment Integration** – Stripe/PayPal for online payments.
- **SMS Notifications** – Twilio integration for booking updates.
- **Technician Mobile App** – For dispatch and job management.
- **Advanced Analytics** – Customer behavior and pricing optimization.
- **Multi‑language Support** – French language for Canadian market.
- **Pipeline Redesign** – Staged data import with quality gates (Phase 3 planned).

---

*Last Updated: January 28, 2026 (Updated with TypeScript Compilation & Build Pipeline Enhancement)*
*Based on source‑code analysis; may differ from older documentation.*