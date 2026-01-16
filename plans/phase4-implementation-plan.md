# Phase 4: Sitemap Freshness & Fallback Implementation Plan

**Project:** travelling-technicians.ca  
**Phase:** 4 (Sitemap Freshness & Fallback)  
**Status:** Planning  
**Author:** Roo (Architect Mode)  
**Date:** 2026-01-13  

---

## Executive Summary

Phase 4 completes the "Zero-Regression SEO Improvement Plan" by fixing the sitemap's remaining technical issues, adding freshness signals, and implementing automatic regeneration triggers. This ensures search engines always have an up‑to‑date view of the site's content while maintaining the **zero‑regression guarantees** (no UI changes, booking system untouched, admin functionality intact).

### Key Objectives
1. **Fix XML generation bugs** that currently block sitemap functionality.
2. **Include all dynamic routes** (city‑service‑model pages) in the sitemap.
3. **Add database‑driven "last updated" timestamps** for accurate freshness signals.
4. **Implement a webhook‑based regeneration trigger** so the sitemap updates within minutes of content changes.
5. **Validate the sitemap** with Google Search Console and ensure zero‑regression compliance.

---

## Current Status & Issues

### ✅ Completed (Phase 1‑3)
- Data service layer with caching & fallback (`src/lib/data-service.ts`)
- ISR for homepage, city pages, and city‑service‑model pages
- Technician schema for E‑E‑A‑T signals (`TechnicianSchema.tsx`)
- Wikidata integration for entity linking (`wikidata.ts`)
- Sitemap now uses the correct `service_locations` table (instead of non‑existent `service_areas`)

### 🚨 Current Blockers (Phase 4)

| Issue | Location | Impact |
|-------|----------|--------|
| **1. Broken XML escaping** | `src/pages/api/sitemap.xml.ts` line 421‑428 | Invalid XML causes parsing errors; search engines may ignore the sitemap. |
| **2. Incomplete fallback sitemap** | `src/pages/api/sitemap.xml.ts` line 469‑? | Unterminated template literal; TypeScript compilation fails, fallback not generated. |
| **3. Static city‑service‑model list** | `getPopularCityServiceModels()` (line 174‑198) | Only 8 hard‑coded combinations appear; misses many potential long‑tail pages. |
| **4. Missing freshness timestamps** | `service_locations`, `services`, `mobileactive_products` tables | `lastmod` fields use generic timestamps instead of actual `updated_at` values. |
| **5. No regeneration trigger** | No webhook or cache‑invalidation mechanism | Sitemap stays cached for 24 h even when new bookings, prices, or technicians are added. |

---

## Proposed Solutions

### 1. Fix XML Escaping Function
**Current code:**
```ts
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, ''');
}
```
**Problem:** Uses literal characters instead of HTML entities.  
**Fix:** Replace with proper entities:
```ts
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, ''');
}
```

### 2. Complete `generateFallbackSitemap`
**Current code:** Ends abruptly with an unfinished template literal.  
**Fix:** Provide a valid XML structure that includes the essential static pages (home, booking, service areas, etc.) and a subset of city pages. Use the same `<urlset>` format as the regular sitemap.

### 3. Enhance City‑Service‑Model Inclusion
**Approach:** Keep the static list for now (performance) but expand it to **20‑30 most popular combinations** derived from the `mobileactive_products` and `dynamic_pricing` tables.  
**Implementation:** Modify `getPopularCityServiceModels()` to query the database for combinations that have actual pricing data, limited to 30 entries for sitemap size control.

### 4. Add Database‑Driven Freshness Timestamps
**Goal:** Use the `updated_at` column of the underlying tables to set accurate `lastmod` values.  
**Changes required:**
- Update `fetchDynamicContent()` to join `updated_at` from `service_locations`, `services`, `mobileactive_products`.
- Pass those timestamps through to `getServiceAreaPages`, `getServicePages`, `getCityServiceModelPages`.
- Fallback to `now` if `updated_at` is null.

### 5. Implement Sitemap Regeneration Trigger
**Architecture:** Use Supabase webhooks to call a cache‑invalidation endpoint whenever relevant tables change (`bookings`, `dynamic_pricing`, `technicians`, `service_locations`).  

**Workflow:**
1. **Database trigger** → **Supabase webhook** → **Next.js API endpoint** (`/api/cache/invalidate?sitemap=true`)
2. Endpoint invalidates the sitemap cache by clearing the relevant Cache‑Control headers (or by purging a CDN cache if used).
3. Next request to `/api/sitemap.xml` regenerates the sitemap with fresh data.

**Components:**
- **Supabase Webhook:** Configured via Dashboard → Database → Webhooks.
- **Cache‑invalidation endpoint:** Already exists at `/api/cache/invalidate`. Need to extend it to accept a `sitemap` parameter that forces sitemap regeneration.
- **Security:** Validate webhook signature (Supabase‑JWT) to prevent unauthorized invalidation.

---

## Implementation Steps

### Step 1: Fix XML Escaping & Complete Fallback Sitemap
1. Edit `src/pages/api/sitemap.xml.ts`:
   - Replace `escapeXml` with correct HTML entities.
   - Complete `generateFallbackSitemap` to return a valid XML document with 10‑15 essential URLs.
2. Verify by building the project (`npm run build`) and checking for TypeScript errors.
3. Test the sitemap endpoint manually (`curl http://localhost:3000/api/sitemap.xml`).

### Step 2: Expand City‑Service‑Model List
1. Create a SQL view or query that joins `mobileactive_products`, `dynamic_pricing`, `service_locations` to get popular combinations.
2. Update `getPopularCityServiceModels()` to run this query (limit 30).
3. Ensure the function returns the required `{ city, service, model, updated_at }` shape.
4. Update `fetchDynamicContent()` to pass the result to `getCityServiceModelPages`.

### Step 3: Add Freshness Timestamps
1. Modify `fetchDynamicContent()` to select `updated_at` from each table.
2. Propagate timestamps through the helper functions (`getServiceAreaPages`, etc.).
3. Use the timestamp in the `<lastmod>` field (ISO 8601 format).
4. Add fallback to current date if timestamp is missing.

### Step 4: Set Up Webhook Trigger
1. **Create a new API endpoint** `src/pages/api/webhooks/sitemap‑regenerate.ts` that:
   - Validates the Supabase webhook signature.
   - Calls the existing cache invalidation endpoint with `{ cacheType: 'sitemap' }`.
   - Logs the invalidation event.
2. **Configure Supabase webhook:**
   - Go to Supabase Dashboard → Database → Webhooks.
   - Create a new webhook for INSERT/UPDATE on `bookings`, `dynamic_pricing`, `technicians`, `service_locations`.
   - Target URL: `https://travelling‑technicians.ca/api/webhooks/sitemap‑regenerate` (or localhost for testing).
3. **Extend cache invalidation** (`src/pages/api/cache/invalidate.ts`) to recognize `cacheType: 'sitemap'` and clear the sitemap cache (e.g., by deleting a cache key or sending a purge request to Vercel’s edge cache).

### Step 5: Testing & Validation
1. **Local testing:**
   - Simulate a database change (insert a test booking) and verify the webhook fires.
   - Check that the sitemap’s `lastmod` updates accordingly.
   - Validate XML structure with an online sitemap validator.
2. **Production validation:**
   - Deploy changes to staging environment.
   - Submit sitemap to Google Search Console and monitor for errors.
   - Verify that the sitemap is re‑crawled after a trigger.

### Step 6: Zero‑Regression Verification
- **Visual regression:** Compare homepage before/after changes (pixel‑perfect).
- **Booking flow:** Test the `/book‑online` path end‑to‑end.
- **Admin panel:** Ensure `/management/*` routes still work.
- **Performance:** Confirm build times and runtime performance unchanged.

---

## Technical Architecture (Mermaid Diagram)

```mermaid
graph TB
    subgraph Database[Supabase PostgreSQL]
        A[bookings]
        B[dynamic_pricing]
        C[technicians]
        D[service_locations]
    end

    subgraph Webhooks[Supabase Webhooks]
        H[Database Trigger] --> I[HTTP POST to Next.js]
    end

    subgraph NextJS[Next.js Application]
        I --> J[/api/webhooks/sitemap‑regenerate]
        J --> K[Validate JWT]
        K --> L[Call /api/cache/invalidate]
        L --> M[Clear sitemap cache]
        
        N[/api/sitemap.xml]
        M --> N
        N --> O[fetchDynamicContent]
        O --> P[Generate XML]
        P --> Q[Return sitemap with Cache‑Control]
    end

    subgraph SearchEngines[Search Engine Crawlers]
        R[Googlebot] --> N
        S[Bingbot] --> N
    end

    A -.-> H
    B -.-> H
    C -.-> H
    D -.-> H
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| **Webhook security** | Validate JWT signature using Supabase’s secret. |
| **Cache invalidation overhead** | Limit regeneration frequency (debounce 5 min). |
| **Database query performance** | Add indexes on `updated_at` columns; limit result sets. |
| **Breaking existing sitemap** | Keep fallback sitemap; test thoroughly before deploy. |
| **Zero‑regression violation** | Isolate changes to sitemap API only; no UI modifications. |

---

## Success Metrics

- **Sitemap validation:** No XML errors in Google Search Console.
- **Freshness:** `lastmod` timestamps reflect actual data changes.
- **Regeneration latency:** Sitemap updates within 5 minutes of a database change.
- **Index coverage:** All city‑service‑model pages appear in search engine indexes.
- **Zero regressions:** No UI changes, booking system fully functional.

---

## Estimated Effort

| Task | Complexity | Time |
|------|------------|------|
| Fix XML escaping & fallback | Low | 1‑2 hours |
| Expand city‑service‑model list | Medium | 2‑3 hours |
| Add freshness timestamps | Medium | 2‑3 hours |
| Webhook implementation | High | 4‑5 hours |
| Testing & validation | Medium | 2‑3 hours |
| **Total** | **Medium‑High** | **11‑16 hours** |

---

## Next Steps

1. **Review this plan** with the development team.
2. **Approve** the proposed changes.
3. **Switch to Code Mode** to begin implementation.
4. **Execute steps sequentially**, verifying each before moving to the next.

---

*This plan is based on the forensic analysis documented in `seo‑implementation‑context‑summary.md` and `zero‑regression‑implementation‑plan.md`. All changes adhere to the zero‑regression principles established in Phase 1‑3.*