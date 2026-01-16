# Zero-Regression SEO & Performance Implementation Plan

**Project:** Travelling Technicians (travelling-technicians.ca)  
**Goal:** Implement ISR, Database-driven content, and Schema markup with **NO changes** to existing UI design, Booking System logic, or Admin functionality.  
**Audit Date:** 2026-01-13  
**Author:** Roo (Senior Solutions Architect)

---

## Executive Summary

This plan provides a phased, zero-regression approach to addressing the five SEO deficits identified in the SEO Deficit Report. Each phase is designed to be **isolated**, **testable**, and **reversible**, ensuring that the live website remains fully operational with pixel-perfect UI consistency. The core strategy is **data injection** rather than UI redesign: we replace hardcoded strings with dynamic variables fetched via `getStaticProps` while keeping the JSX structure identical.

### Critical Constraints (Do Not Touch)
1. **Visual Design:** Homepage (`pages/index.tsx`) must look pixel-perfectly identical.
2. **Booking Logic:** All `/api/bookings/*` routes must not be modified.
3. **Stability:** If database connection fails, the site must fallback gracefully (no crashes).
4. **Admin Functions:** Management panel (`/management/*`) must remain untouched.

---

## Phase 1: Safe Data Layer & ISR Foundation

**Objective:** Create a robust data-fetching layer with graceful fallbacks and implement Incremental Static Regeneration (ISR) for static pages.

### 1.1 Create `lib/data-service.ts`
- **File:** `src/lib/data-service.ts`
- **Purpose:** Centralized service to fetch pricing, services, and testimonials from Supabase with built‑in caching and fallback to static data.
- **Safety Mechanism:** The service will export a `getPricingData()` function that returns the **exact same shape** as the current hardcoded `pricingData` object. If the database query fails, it returns the existing static pricing ranges.
- **Verification Command:**
  ```bash
  npm run build && npm start
  ```
  Then visit `http://localhost:3000/api/test-data-service` (create a temporary test endpoint) to confirm the service returns data without errors.

### 1.2 Add `getStaticProps` to `pages/index.tsx`
- **File:** `src/pages/index.tsx`
- **Changes:** Add `getStaticProps` that calls `getPricingData()` and passes the result as props.
- **Safety Mechanism:** The component will **still accept** a `pricingData` prop with default values equal to the current hardcoded object. This ensures that if the data layer fails, the UI renders exactly as before.
- **Verification Command:** Run a visual diff test using a tool like `pixelmatch` (or manually inspect the page after build) to confirm no layout shifts.

### 1.3 Implement ISR for City Pages
- **File:** `src/pages/repair/[city].tsx`
- **Changes:** Convert existing static city pages to use `getStaticPaths` and `getStaticProps` with `revalidate: 3600`. Fetch city-specific content from `service_locations` table.
- **Safety Mechanism:** If the database contains no rows for a city, fall back to the existing static content (already present in each city page).
- **Verification Command:**
  ```bash
  curl -I http://localhost:3000/repair/vancouver
  ```
  Check that the response includes `Cache-Control: s-maxage=3600, stale-while-revalidate`.

### 1.4 Create Database Connection Health Check
- **File:** `src/utils/db-health.ts`
- **Purpose:** Expose a `checkDbConnection()` function that is called during build time and logs warnings but never throws.
- **Safety Mechanism:** If the connection fails, the health check returns a `healthy: false` flag, and the data service will automatically use static fallback data.

---

## Phase 2: Database-Driven Pricing & Content Injection

**Objective:** Replace all hardcoded pricing ranges, service lists, and testimonials with live database queries, while preserving UI structure.

### 2.1 Migrate Pricing Data to `dynamic_pricing` Table
- **Task:** Ensure the `dynamic_pricing` table (currently 911 rows) contains accurate price ranges for mobile, laptop, and tablet categories.
- **Safety Mechanism:** Before any UI changes, verify that the aggregated price ranges match the current hardcoded ranges (`$79‑$189`, `$99‑$249`, `$89‑$199`). If they deviate by more than 10%, log an alert and keep using static data until manual review.
- **Verification Command:** Run a SQL query to compute min/max prices per device type and compare with hardcoded values.

### 2.2 Update `index.tsx` to Use Dynamic Pricing
- **File:** `src/pages/index.tsx`
- **Changes:** Replace the `pricingData` constant with `props.pricingData` from `getStaticProps`.
- **Safety Mechanism:** The component will **still have a default** `pricingData` object identical to the current one. If props are missing (e.g., due to a build‑time error), the UI remains unchanged.
- **Verification Command:** Run a visual regression test with `jest-image-snapshot` or manually verify that the pricing preview boxes show the same numbers as before.

### 2.3 Dynamic Service Lists
- **File:** `src/pages/index.tsx` (Popular Services section)
- **Changes:** Fetch the top 4 services from the `services` table (ordered by popularity) and map them to the existing UI grid.
- **Safety Mechanism:** If the query returns fewer than 4 services, pad with the existing static service items.
- **Verification Command:** Check that the “Most Popular Repairs” section still shows four items with icons and price labels.

### 2.4 Dynamic Testimonials
- **File:** `src/pages/index.tsx` (Customer Success Stories)
- **Changes:** Create a `testimonials` table (if not exists) and fetch the latest 4 testimonials. Use the same mapping as the current static array.
- **Safety Mechanism:** If the table is empty, fall back to the existing static testimonials.
- **Verification Command:** Verify that testimonials rotate automatically (as they do today) and that the star ratings are displayed correctly.

---

## Phase 3: Dynamic City Pages & Schema Markup

**Objective:** Create new dynamic routes for city‑service‑device combinations and add standalone schema components.

### 3.1 Create `pages/repair/[city]/[service]/[model].tsx`
- **File:** New dynamic route.
- **Purpose:** Generate long‑tail landing pages for each combination of city, service, and device model (using `mobileactive_products` and `dynamic_pricing`).
- **Safety Mechanism:** This is a **new route**, so it cannot break any existing page. Use `getStaticPaths` with a limit of 100 pages initially to avoid build overload.
- **Verification Command:** Build the site and confirm that the new pages are generated (check `.next/server/pages`). Visit a sample page to ensure it renders without errors.

### 3.2 Create Standalone Schema Component
- **File:** `src/components/seo/TechnicianSchema.tsx`
- **Purpose:** Render `<script type="application/ld+json">` tags with `knowsAbout`, `memberOf`, and `sameAs` properties pointing to Wikidata.
- **Safety Mechanism:** This component is **purely additive**; it does not affect UI rendering. It will be imported into `pages/index.tsx` and city pages but placed inside `<Head>` where it only impacts SEO.
- **Verification Command:** Use Google’s Structured Data Testing Tool on the live homepage to confirm the new schema appears.

### 3.3 Add Wikidata `sameAs` Links
- **Task:** For each city in `service_locations`, add a corresponding Wikidata entity ID (e.g., Vancouver → Q24639) and include it in the `LocalBusiness` schema.
- **Safety Mechanism:** If a city lacks a Wikidata ID, omit the `sameAs` property (no error).
- **Verification Command:** Validate the structured data for `/repair/vancouver` to see the `sameAs` property.

---

## Phase 4: Sitemap Freshness & Fallback

**Objective:** Fix the sitemap to use real data from `service_locations` and implement triggers for freshness.

### 4.1 Update Sitemap to Use `service_locations`
- **File:** `src/pages/api/sitemap.xml.ts`
- **Changes:** Replace the query from `service_areas` (non‑existent) to `service_locations`. Add joins to `dynamic_pricing` and `mobileactive_products` to include product pages.
- **Safety Mechanism:** If the query fails, the sitemap falls back to the existing static list of cities (already implemented).
- **Verification Command:** Visit `/api/sitemap.xml` and verify that all eight service‑area city pages are listed.

### 4.2 Implement Sitemap Trigger
- **Task:** Create a Supabase webhook that regenerates the sitemap whenever a new booking is created or a price changes.
- **Safety Mechanism:** The trigger will call a dedicated API endpoint (`/api/cache/invalidate?sitemap=true`) that updates a cache key; the sitemap endpoint will still serve the cached version until the next build.
- **Verification Command:** Simulate a booking creation (via test API) and check logs to confirm the webhook fires.

### 4.3 Add “Last Updated” Timestamps
- **File:** `src/pages/repair/[city].tsx`
- **Changes:** Include a `lastmod` field in `getStaticProps` based on the `updated_at` column of the relevant database records.
- **Safety Mechanism:** If `updated_at` is null, use the current build timestamp.
- **Verification Command:** Inspect the HTML `<meta>` tags for `article:modified_time` (or structured data) to confirm the timestamp is present.

---

## Safety Mechanisms & Verification Checklist

### Build‑Time Safety
- **Fallback Data:** Every data‑fetching function must have a static fallback that matches the current hardcoded values.
- **Connection Resilience:** Database failures during build should not crash the build; instead, log a warning and continue with static data.
- **Prop Defaults:** All React components must have default props identical to the current hardcoded values.

### Runtime Safety
- **No Breaking Changes:** All existing API routes remain unchanged; new routes are added under new paths.
- **Visual Regression Testing:** Use `jest-image-snapshot` to capture the homepage before and after each phase.
- **Monitoring:** Add logging to track when fallback data is used (alert the team).

### Rollback Plan
1. **Phase Rollback:** If a phase introduces unexpected issues, revert the commit for that phase only.
2. **Database Rollback:** All database changes (new tables) are non‑destructive and can be ignored if necessary.
3. **Feature Flags:** Use environment variables to toggle new features (e.g., `NEXT_PUBLIC_USE_DYNAMIC_PRICING=false`).

---

## Suggested Improvements & Rationale

### 1. Use Incremental Static Regeneration (ISR) Instead of SSR
- **Why:** The site currently uses client‑side rendering for dynamic content. ISR gives us the best of both worlds: fast static pages with periodic updates, without sacrificing Core Web Vitals. Because we are not changing the UI, ISR can be introduced **transparently**.

### 2. Create a “Data Injection” Pattern
- **Why:** Instead of rewriting components, we keep the JSX intact and inject data via props. This eliminates the risk of visual regressions and makes the migration reversible at any time.

### 3. Standalone Schema Component
- **Why:** Adding schema markup as a separate component ensures that SEO improvements are isolated from UI logic. If the schema fails validation, it does not affect page rendering.

### 4. Progressive Enhancement for City Pages
- **Why:** New city‑service‑model pages are created as **new routes**, leaving the existing city pages untouched. This allows us to test the long‑tail content strategy without risking the core location pages.

### 5. Sitemap Trigger via Webhooks
- **Why:** The current sitemap is stale because it relies on a 24‑hour cache. A webhook‑based trigger ensures search engines see new content within minutes, while still falling back to the cached version if the database is unavailable.

---

## Implementation Timeline (Phased)

| Phase | Focus | Estimated Effort | Risk Level |
|-------|-------|------------------|------------|
| 1 | Safe Data Layer & ISR Foundation | 2‑3 days | Low |
| 2 | Database‑Driven Pricing & Content | 3‑4 days | Medium |
| 3 | Dynamic City Pages & Schema | 4‑5 days | Medium |
| 4 | Sitemap Freshness & Fallback | 2‑3 days | Low |

**Total estimated implementation time:** 11‑15 days (assuming single developer).

---

## Next Steps

1. **Review this plan** with the development team and stakeholders.
2. **Approve Phase 1** for immediate execution.
3. **Switch to Code Mode** to begin implementation.

> **Note:** This plan is designed to be executed in sequence; each phase must pass its verification checklist before moving to the next.

---

*Plan generated on 2026‑01‑13 based on forensic analysis of the codebase and database.*