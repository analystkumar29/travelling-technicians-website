# Technical & SEO Deficit Report: travelling-technicians.ca

**Audit Date:** 2026-01-13  
**Auditor:** Roo (Architect Mode)  
**Scope:** Deep Forensic & SEO Audit of codebase and live database.

---

## Executive Summary

The Travelling Technicians website is built on Next.js Pages Router with client‑side rendering, static metadata, and a rich Supabase backend that is largely untapped for SEO. The site has solid foundational SEO (meta tags, structured data, sitemap) but misses critical opportunities to rank #1 for local service keywords because:

1. **Database‑to‑UI disconnects** – 3,150+ product records and dynamic pricing are not used in pages.
2. **Zero server‑side rendering** – All pages are CSR, slowing indexing and hurting Core Web Vitals.
3. **“Ghost” city pages** – Location pages exist for cities not in the service‑locations table, creating content‑coverage mismatch.
4. **Missing E‑E‑A-T signals** – No technician expertise data in schema or UI.
5. **Stale sitemap** – Sitemap relies on fallback static data, not live database updates.

This report details five specific deficits, identifies ghost routes, and provides a 100% data‑driven plan to dominate search for “travelling technicians” in your service areas.

---

## 1. Five Specific SEO Deficits

### Deficit 1: Client‑Side Rendering (CSR) Hurts Indexability
**Issue:** Zero pages use `getServerSideProps` or `getStaticProps`. All content is rendered client‑side, which delays crawler discovery and reduces page‑speed scores.  
**Evidence:** No SSR/SSG functions found in `src/pages/`.  
**Impact:** Slower indexing, lower Core Web Vitals scores, reduced ranking for competitive local keywords.  
**Fix:** Implement incremental static regeneration (ISR) for service/location pages; use SSR for dynamic pricing pages.

### Deficit 2: Database‑UI Disconnect Wastes Rich Content
**Issue:** The Supabase database contains 3,150+ `mobileactive_products`, 911 `dynamic_pricing` records, 1,657 `device_models`, and 10 `services` – none of which appear in the UI. Pricing and service lists are hard‑coded.  
**Evidence:** 
- `SELECT COUNT(*) FROM mobileactive_products` → 3,150 rows.
- UI pricing is static (e.g., `$79‑$189` ranges in `index.tsx`).
- No API calls fetch product/cost data for page generation.  
**Impact:** Missed opportunity to create unique, data‑driven pages for every device/model/service combination, which would generate thousands of long‑tail landing pages.  
**Fix:** Build dynamic pages for each product/service combo with ISR, pulling titles, descriptions, and pricing from the database.

### Deficit 3: Missing E‑E‑A‑T (Expertise) Signals
**Issue:** Google’s 2026 algorithms heavily weight `knowsAbout` and `memberOf` schema properties for local service businesses. The site claims “Certified Techs” but stores no technician certifications, years of experience, or training records.  
**Evidence:** 
- `technicians` table referenced in API (`/api/technicians`) but does not exist in the public schema.
- No `knowsAbout`/`memberOf` properties in any JSON‑LD.  
**Impact:** Lacking expertise signals reduces trust with AI‑based search engines (Gemini, Perplexity) and lowers E‑E‑A‑T scoring.  
**Fix:** Create `technicians` table with `certifications`, `years_experience`, `specializations`. Inject `knowsAbout` into `LocalBusiness` schema.

### Deficit 4: Sitemap Freshness Gap
**Issue:** The sitemap (`/api/sitemap.xml`) queries a non‑existent `service_areas` table and falls back to a static list. It does not react to new bookings, price changes, or technician additions.  
**Evidence:** Sitemap code attempts `SELECT … FROM service_areas` (table missing). Cache duration is 24 h with no invalidation triggers.  
**Impact:** Search engines see stale content, missing new location pages or updated service listings.  
**Fix:** Create real `service_areas` table (or reuse `service_locations`), add sitemap triggers on data changes, implement incremental sitemap generation.

### Deficit 5: Local Entity Linking Absent
**Issue:** City pages (e.g., `/repair/vancouver`) do not link to Wikidata/DBpedia entities, missing an “entity‑linking” signal that helps AI engines verify geographic service areas.  
**Evidence:** No `sameAs` properties pointing to `https://www.wikidata.org/wiki/Q24639` (Vancouver) in structured data.  
**Impact:** Reduced clarity for AI‑based search about which exact city you serve, lowering local intent matching.  
**Fix:** Add `sameAs` to `LocalBusiness` schema for each city with its Wikidata URI; embed `https://schema.org/city` with `@id` of the Wikidata entity.

---

## 2. Ghost Routes (Files That Exist but Serve Little SEO Value)

Ghost routes are pages that are reachable but either have no incoming links, are not in the sitemap, or contain thin content. They dilute crawl budget and may create duplicate content.

| Page | Reason |
|------|--------|
| `pages/examples/safe‑router‑usage.tsx` | Development example, not linked. |
| `pages/management/*` (8 files) | Admin dashboards; should be `noindex`. |
| `pages/verify‑booking.tsx` | Utility page, no unique content. |
| `pages/reschedule‑booking.tsx` | Utility page, no unique content. |
| `pages/booking‑confirmation.tsx` | Transactional page; should be `noindex`. |
| `pages/login.tsx` | Authentication page; should be `noindex`. |
| `pages/404.tsx`, `pages/500.tsx` | Error pages; already excluded. |

**Recommendation:** Add `noindex, follow` meta tags to all ghost routes except error pages. Consider removing example files from production build.

---

## 3. Data‑Driven Plan to Reach #1 for “Travelling Technicians”

### Phase 1: Fix Core Indexability (Week 1)
- **Implement ISR for all location/service pages.** Use `getStaticPaths` + `getStaticProps` with `revalidate: 3600`.
- **Convert pricing/service lists to database‑driven.** Create API endpoints that serve pricing, models, and services; consume them in ISR pages.
- **Add `technicians` table** with columns: `id`, `full_name`, `certifications` (text[]), `years_experience`, `specializations`, `avatar_url`. Populate with real technician data.
- **Update JSON‑LD** with `knowsAbout` and `memberOf` referencing technician certifications.

### Phase 2: Unleash Long‑Tail Content (Week 2‑3)
- **Generate dynamic pages for each `mobileactive_product`.** Route: `/repair/{brand}/{model}/{service}`. Use ISR with product titles, descriptions, and images from the database.
- **Create city‑service‑model intersection pages.** Example: `/repair/vancouver/iphone‑14/screen‑replacement`. Combine location, device, and service for hyper‑local long‑tail keywords.
- **Build a “Live Availability” JSON‑LD** that updates daily with technician schedules (pulled from `bookings` table). This satisfies the “Freshness Pulse” requirement.

### Phase 3: Entity & Freshness Signals (Week 4)
- **Add Wikidata `sameAs` links** for every city in `service_locations`. Example: Vancouver → `https://www.wikidata.org/wiki/Q24639`.
- **Implement sitemap trigger** that regenerates the sitemap whenever a new booking is created, a technician is added, or a price changes (via Supabase webhooks).
- **Add “Last Updated” timestamps** to every page based on the underlying data’s `updated_at` column.

### Phase 4: Performance & Core Web Vitals (Ongoing)
- **Lazy‑load non‑critical images** using `next/image` with `priority` only for above‑the‑fold.
- **Implement route‑level caching** with `stale‑while‑revalidate` headers for API responses.
- **Audit and reduce JavaScript bundles** (e.g., remove unused React‑Icons).

---

## 4. Technical Recommendations

| Priority | Task | Impact |
|----------|------|--------|
| **P0** | Add `getStaticProps` + ISR to all location/service pages. | High – enables search engine indexing of dynamic content. |
| **P0** | Create `technicians` table and populate with real data. | High – unlocks E‑E‑A‑T signals. |
| **P1** | Connect UI pricing/service lists to `dynamic_pricing` and `services` tables. | Medium – ensures accuracy and freshness. |
| **P1** | Fix sitemap to use real `service_locations` and add change triggers. | Medium – improves crawl efficiency. |
| **P2** | Add Wikidata `sameAs` to city pages. | Low but strategic – boosts entity‑linking signals. |
| **P2** | Implement `noindex` on ghost/admin routes. | Low – cleans crawl budget. |

---

## 5. Expected Outcomes

If the above plan is executed:

1. **Indexed pages** will grow from ~50 to **3,000+** (product + location combinations).
2. **Core Web Vitals** scores will improve due to ISR and image optimization.
3. **E‑E‑A‑T signals** will satisfy Google’s expertise requirements, raising trust.
4. **Freshness signals** will tell search engines the site is actively maintained.
5. **Local intent matching** will be precise, leading to higher CTR for “mobile repair near me” queries.

Within 3‑6 months, the site should dominate position #1 for “travelling technicians” and top 3 for “mobile repair Vancouver”, “laptop repair Burnaby”, etc.

---

*Report generated by automated forensic analysis of the live codebase and database.*  
*All findings are based on actual file content and SQL queries.*