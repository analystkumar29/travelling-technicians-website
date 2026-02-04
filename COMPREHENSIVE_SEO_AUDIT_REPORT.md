# COMPREHENSIVE TECHNICAL SEO AUDIT REPORT
## The Travelling Technicians - Ground-Truth Analysis
### Date: March 2, 2026

---

## EXECUTIVE SUMMARY

This audit analyzes the **actual codebase and database** to identify what's preventing top-tier Google rankings and provides an actionable blueprint to rank #1 for high-intent local repair keywords.

### Current State Snapshot
| Metric | Value | Status |
|--------|-------|--------|
| Total Dynamic Routes | 3,289 | ✅ Good |
| Cities Served | 13 | ✅ Good |
| Device Models | 124 | ✅ Good |
| Services with Pricing | 4 of 17 | ⚠️ Gap |
| Pricing Combinations | 248 (496 with tiers) | ✅ Good |
| Orphaned DB Records | 0 | ✅ Excellent |
| Neighborhood Pages | 37 (6 cities only) | ⚠️ Gap |
| Rendering Method | SSG + ISR | ✅ Optimal |

---

# PHASE 1 — SYSTEM MAPPING

## URL Structure & Routes

### Dynamic Routes Table
| URL Pattern | Render Type | Data Source | Indexability | Notes |
|-------------|-------------|-------------|--------------|-------|
| `/` | SSG + ISR (1hr) | `getStaticProps` | ✅ Index | Homepage with testimonials from DB |
| `/repair` | SSG + ISR (1hr) | `dynamic_routes` | ✅ Index | Repair index page |
| `/repair/[city]` | SSG + ISR (24hr) | `dynamic_routes` + `service_locations` | ✅ Index | 13 city pages |
| `/repair/[city]/[service]` | SSG + ISR (24hr) | `dynamic_routes` | ✅ Index | 52 city-service pages |
| `/repair/[city]/[service]/[model]` | SSG + ISR (24hr) | `dynamic_routes` | ✅ Index | 3,224 model-service pages |
| `/services/[slug]` | SSG | File-based | ✅ Index | Static service pages |
| `/blog/[slug]` | SSG | Hardcoded in sitemap | ✅ Index | 4 blog posts |
| `/book-online` | SSG + ISR | Mixed | ✅ Index | Booking flow |
| `/about`, `/contact`, `/faq`, `/pricing` | SSG | Minimal DB | ✅ Index | Static pages |
| `/management/*` | N/A | Protected | 🚫 noindex | Admin panel |

### Route Type Distribution (from `dynamic_routes` table)
| Route Type | Count | Last Updated |
|------------|-------|--------------|
| model-service-page | 3,224 | 2026-02-03 |
| city-service-page | 52 | 2026-02-03 |
| city-page | 13 | 2026-02-03 |

### Sitemap Generation
- **Method:** API-based at `/api/sitemap.xml`
- **Caching:** 24-hour `s-maxage`
- **Pagination:** Batches of 1,000 routes with timeout protection
- **Coverage:** All 3,289+ dynamic routes included
- **Fallback:** Static sitemap at `/sitemap-simple.xml`

### Robots.txt Analysis
✅ **Well-configured:**
- All public pages allowed
- Management/admin paths blocked
- API endpoints properly segregated (public vs private)
- Both sitemaps declared
- Crawl-delay: 1 second

### Canonical URL Logic
✅ **Properly implemented:**
- Each page sets `<link rel="canonical" href="...">`
- Using `getSiteUrl()` helper for consistent domain
- `hreflang="en-CA"` for Canadian English targeting

---

# PHASE 2 — DATABASE & DATA QUALITY AUDIT

## Schema Overview

### Core Tables & Row Counts
| Table | Rows | Purpose |
|-------|------|---------|
| `dynamic_routes` | 3,289 | Pre-computed URL routes |
| `service_locations` | 13 | Cities served |
| `services` | 17 | Repair service types |
| `device_models` | 124 | Phone/laptop models |
| `brands` | 3 | Apple, Samsung, Google |
| `device_types` | 3 | Mobile, Laptop, Tablet |
| `dynamic_pricing` | 496 | Price per model-service |
| `neighborhood_pages` | 37 | Local SEO pages |
| `testimonials` | 23 | Customer reviews |
| `bookings` | 13 | Active bookings |

## Data Integrity Assessment

### ✅ EXCELLENT - No Orphaned Records
| Check | Result |
|-------|--------|
| Pricing without model | 0 |
| Pricing without service | 0 |
| Bookings without location | 0 |
| Routes without city | 0 |
| Models without brand | 0 |
| Neighborhoods without city | 0 |

### ⚠️ SEO Metadata Completeness Issues
| Issue | Count | Impact |
|-------|-------|--------|
| Services missing description | 1 | Medium |
| Unverified testimonials | 5 | Low |
| Testimonials without location | 0 | N/A |
| Models missing display_name | 0 | N/A |
| Locations missing local_content | 0 | N/A |

## Pricing Coverage Analysis

### CRITICAL GAP: Only 4 Services Have Pricing Data

| Service | Slug | Models with Pricing | Coverage |
|---------|------|---------------------|----------|
| Screen Replacement (Mobile) | screen-replacement-mobile | 98 | 79% |
| Battery Replacement (Mobile) | battery-replacement-mobile | 98 | 79% |
| Screen Replacement (Laptop) | screen-replacement-laptop | 26 | 21% |
| Battery Replacement (Laptop) | battery-replacement-laptop | 26 | 21% |

**13 Services WITHOUT any pricing data:**
- Charging Port Repair
- Speaker/Mic Repair
- Camera Repair
- Water Damage Diagnostics
- Keyboard Repair
- Trackpad Repair
- RAM Upgrade
- SSD Replacement
- Software Troubleshooting
- Virus Removal
- Cooling System Repair
- Power Jack Repair
- Data Recovery

### City Coverage Analysis
| City | Total Routes | Model-Service Pages | City-Service Pages | Neighborhood Pages |
|------|--------------|---------------------|-------------------|-------------------|
| Vancouver | 253 | 248 | 4 | 8 |
| Surrey | 253 | 248 | 4 | 8 |
| Burnaby | 253 | 248 | 4 | 6 |
| Richmond | 253 | 248 | 4 | 5 |
| North Vancouver | 253 | 248 | 4 | 5 |
| Coquitlam | 253 | 248 | 4 | 5 |
| Langley | 253 | 248 | 4 | 0 ⚠️ |
| West Vancouver | 253 | 248 | 4 | 0 ⚠️ |
| Delta | 253 | 248 | 4 | 0 ⚠️ |
| Abbotsford | 253 | 248 | 4 | 0 ⚠️ |
| New Westminster | 253 | 248 | 4 | 0 ⚠️ |
| Chilliwack | 253 | 248 | 4 | 0 ⚠️ |
| Squamish | 253 | 248 | 4 | 0 ⚠️ |

### Recommended Database Improvements

#### 1. NEW TABLE: `seo_meta_overrides`
```sql
CREATE TABLE seo_meta_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type VARCHAR(50) NOT NULL, -- 'city', 'service', 'model-service'
  page_slug TEXT NOT NULL UNIQUE,
  meta_title TEXT,
  meta_description TEXT,
  h1_override TEXT,
  custom_content TEXT,
  focus_keyword TEXT,
  secondary_keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. NEW COLUMNS on `dynamic_routes`
```sql
ALTER TABLE dynamic_routes ADD COLUMN IF NOT EXISTS 
  content_updated_at TIMESTAMPTZ DEFAULT NOW(),
  monthly_searches INT DEFAULT 0,
  keyword_difficulty INT DEFAULT 0,
  current_ranking INT;
```

#### 3. Expand `dynamic_pricing` for ALL Services
- Add pricing for 13 remaining services
- Potential: 13 services × 124 models × 13 cities = 20,956 new pricing combinations

---

# PHASE 3 — TECHNICAL SEO AUDIT

## HTML Output Structure

### ✅ Properly Implemented
- Single `<h1>` per page
- Semantic heading hierarchy (h2-h6)
- ARIA labels on interactive elements
- Alt text on images (OptimizedImage component)

### Meta Tags Implementation

| Tag | Homepage | City Pages | Model-Service Pages |
|-----|----------|------------|---------------------|
| `<title>` | ✅ | ✅ Dynamic | ✅ Dynamic |
| `meta description` | ✅ | ✅ Dynamic | ✅ Dynamic |
| `meta keywords` | ✅ | ✅ | ✅ |
| `canonical` | ✅ | ✅ | ✅ |
| `og:title` | ✅ | ✅ | ✅ |
| `og:description` | ✅ | ✅ | ✅ |
| `twitter:card` | ✅ | ✅ | ✅ |
| `geo.*` meta | ❌ | ✅ | ❌ |

### Structured Data (Schema.org)

| Schema Type | Implementation | Location |
|-------------|----------------|----------|
| LocalBusiness | ✅ Full | `_document.tsx`, `StructuredData.tsx` |
| Organization | ✅ Full | `_document.tsx` |
| Service | ✅ Full | `ModelServicePage.tsx` |
| BreadcrumbList | ✅ Full | All dynamic pages |
| FAQPage | ✅ Full | `/faq` page |
| Review/AggregateRating | ✅ Conditional | Only when testimonials present |
| Place | ✅ | `CityPage.tsx` |
| Article | ✅ | Blog posts |

### ⚠️ Missing Structured Data
- **HowTo schema** for service guides
- **Product schema** for specific repair services
- **Video schema** for embedded how-to videos
- **Event schema** for promotions/offers

## Page Speed Factors

### ✅ Optimizations Present
- Next.js Image optimization (`OptimizedImage.tsx`)
- Code splitting via `dynamic()` imports
- ISR for cache-revalidation
- DNS prefetch for external resources
- Preconnect for fonts/analytics
- Lazy loading for below-fold images

### ⚠️ Potential Bottlenecks
1. **No image-sitemap.xml** declared in robots.txt (file exists but not referenced)
2. **Multiple manifest files** (`manifest.json` + `site.webmanifest`)
3. **Large inline scripts** in `_document.tsx`
4. **Dynamic imports** for page templates add hydration delay

## Internal Linking Structure

### ✅ Good Practices
- Breadcrumb navigation on all pages
- City → Service → Model hierarchy
- Footer has city links
- CTA buttons link to booking

### ⚠️ Internal Linking Gaps
1. **No cross-linking between cities** (e.g., "Also serving nearby: Richmond")
2. **No related models** section (e.g., "Also repair: iPhone 13, iPhone 12")
3. **No service cross-links** (e.g., "Need battery instead? Battery Replacement")
4. **Blog posts don't link to relevant service pages**
5. **No "popular repairs" widget** on city pages with actual booking data

## Issues by Severity

### 🔴 CRITICAL

1. **13 of 17 services have NO pricing data** - Can't generate programmatic pages for charging port, camera, keyboard repairs, etc.

2. **All `lastmod` dates are identical** (2026-02-03) - Google can't determine content freshness; affects crawl priority.

3. **No neighborhood pages for 7 of 13 cities** - Missing hyper-local SEO for Langley, West Vancouver, Delta, Abbotsford, New Westminster, Chilliwack, Squamish.

### 🟠 HIGH

4. **Only 2 tiers (standard/premium)** - No economy tier for price-sensitive customers; missing "From $XX" competitive pricing.

5. **Thin content on city-service pages** - Most content is template-based; lacks unique city+service specific content.

6. **No FAQ schema on service pages** - Missing rich snippet opportunity for common questions.

7. **No image sitemap in robots.txt** - `/image-sitemap.xml` exists but not declared.

### 🟡 MEDIUM

8. **5 unverified testimonials** - Reduces trust signals if displayed.

9. **Missing geo meta tags on model-service pages** - Only city pages have `geo.position`, `ICBM`.

10. **No Core Web Vitals monitoring** - Can't track real-world performance.

11. **Single brand focus** - Only Apple, Samsung, Google; missing Xiaomi, OnePlus, Huawei (listed in deviceBrands but not in DB).

### 🟢 LOW

12. **Blog has only 4 posts** - Insufficient for topical authority.

13. **No author pages** - E-E-A-T signal missing.

14. **Social links may be placeholders** - Facebook/Instagram/LinkedIn profiles need verification.

---

# PHASE 4 — PROGRAMMATIC SEO OPPORTUNITIES

## Current Programmatic Pages

| Page Type | Count | URL Pattern | Data Source |
|-----------|-------|-------------|-------------|
| City Landing | 13 | `/repair/{city}` | `dynamic_routes` |
| City+Service | 52 | `/repair/{city}/{service}` | `dynamic_routes` |
| City+Service+Model | 3,224 | `/repair/{city}/{service}/{model}` | `dynamic_routes` |
| Neighborhood | 37 | `/repair/{city}/{neighborhood}` | `neighborhood_pages` |

## NEW Programmatic Page Opportunities

### 1. Problem-Solution Pages
**Data Used:** Service descriptions + Common issues from `neighborhood_pages.common_issues`

| Page Type | URL Pattern | Example Title | Example H1 |
|-----------|-------------|---------------|------------|
| Problem Pages | `/problems/{problem}` | "Cracked Screen Fix Vancouver" | "Cracked Phone Screen? We Fix It Today" |
| Symptom Pages | `/help/{symptom}` | "Phone Won't Charge Vancouver" | "Phone Not Charging? Common Causes & Fixes" |

**Example URLs:**
- `/problems/cracked-screen`
- `/problems/battery-draining-fast`
- `/problems/phone-overheating`
- `/help/phone-wont-turn-on`
- `/help/touchscreen-not-responding`

### 2. Brand+City Landing Pages
**Data Used:** `brands` × `service_locations`

| Page Type | URL Pattern | Example Title | Example H1 |
|-----------|-------------|---------------|------------|
| Brand+City | `/repair/{city}/{brand}` | "iPhone Repair Vancouver" | "iPhone Repair in Vancouver, BC" |

**Potential Pages:** 3 brands × 13 cities = **39 new pages**

### 3. Year/Generation Pages
**Data Used:** `device_models.release_year`

| Page Type | URL Pattern | Example Title | Example H1 |
|-----------|-------------|---------------|------------|
| Year Pages | `/repair/{city}/{brand}/{year}` | "2024 iPhone Repair Vancouver" | "2024 iPhone Models We Repair" |

### 4. Comparison Pages
**Data Used:** `dynamic_pricing` (standard vs premium)

| Page Type | URL Pattern | Example Title | Example H1 |
|-----------|-------------|---------------|------------|
| Tier Comparison | `/compare/{service}/{model}` | "Standard vs Premium Screen Repair" | "Which Screen Replacement is Right for You?" |

### 5. Service Bundle Pages
**Data Used:** Cross-service combinations

| Page Type | URL Pattern | Example Title | Example H1 |
|-----------|-------------|---------------|------------|
| Bundle Pages | `/bundles/{city}/{bundle}` | "iPhone Screen + Battery Bundle" | "Save 15% with Screen + Battery Repair" |

### 6. Neighborhood+Service Pages
**Data Used:** `neighborhood_pages` × `services`

| Page Type | URL Pattern | Example Title | Example H1 |
|-----------|-------------|---------------|------------|
| Neighborhood Service | `/repair/{city}/{neighborhood}/{service}` | "Screen Repair Downtown Vancouver" | "Screen Repair in Downtown Vancouver" |

**Potential:** 37 neighborhoods × 4 services = **148 new pages**

### 7. "Near Me" Pages
**Data Used:** `service_locations.neighborhoods`

| Page Type | URL Pattern | Example Title | Example H1 |
|-----------|-------------|---------------|------------|
| Near Me | `/{service}-near-{landmark}` | "Phone Repair Near Metrotown" | "Phone Repair Near Metrotown Mall" |

---

# PHASE 5 — KEYWORD & INTENT MODEL

## User Intent Mapping

### Transactional Intent (High Conversion)
| Keyword Pattern | Example | Target Page | Current Status |
|-----------------|---------|-------------|----------------|
| `{device} repair {city}` | "iphone repair vancouver" | `/repair/vancouver/screen-replacement-mobile/iphone-14` | ✅ Exists |
| `{service} near me` | "screen repair near me" | `/repair/{detected-city}` | ⚠️ No near-me pages |
| `{device} screen replacement cost` | "iphone 14 screen replacement cost" | Model-service page | ✅ Exists |
| `fix my {device}` | "fix my macbook" | `/repair` | ⚠️ Generic |
| `same day {service}` | "same day phone repair" | Homepage/City page | ⚠️ Not targeted |

### Informational Intent (Top-of-Funnel)
| Keyword Pattern | Example | Target Page | Current Status |
|-----------------|---------|-------------|----------------|
| `how to fix {problem}` | "how to fix cracked screen" | Blog post | ⚠️ Only 4 posts |
| `{device} battery life tips` | "iphone battery life tips" | Blog post | ✅ 1 post exists |
| `is {problem} repairable` | "is water damage repairable" | FAQ/Blog | ⚠️ Not targeted |
| `{service} vs replacement` | "repair vs new phone" | Blog/Comparison | ❌ Missing |

### Navigational Intent
| Keyword Pattern | Example | Target Page | Current Status |
|-----------------|---------|-------------|----------------|
| `travelling technicians` | Brand search | Homepage | ✅ |
| `phone repair {city}` | "phone repair burnaby" | City page | ✅ Exists |

### Local Intent
| Keyword Pattern | Example | Target Page | Current Status |
|-----------------|---------|-------------|----------------|
| `{service} {neighborhood}` | "phone repair downtown vancouver" | Neighborhood page | ⚠️ 37 pages only |
| `{service} near {landmark}` | "laptop repair near metrotown" | Near-me page | ❌ Missing |

## Keyword Priority Matrix

### Tier 1: High Volume + High Intent (Prioritize)
1. `iphone screen repair vancouver` - Est. 500+ monthly
2. `phone repair near me` - Est. 1,000+ monthly
3. `macbook repair vancouver` - Est. 300+ monthly
4. `samsung screen repair` - Est. 400+ monthly
5. `same day phone repair vancouver` - Est. 200+ monthly

### Tier 2: Medium Volume + High Intent
1. `iphone battery replacement vancouver`
2. `laptop screen repair burnaby`
3. `phone charging port repair`
4. `doorstep phone repair`

### Tier 3: Long-Tail + High Conversion
1. `iphone 14 pro max screen replacement vancouver`
2. `macbook pro 2023 battery replacement burnaby`
3. `samsung galaxy s23 screen repair richmond`

---

# PHASE 6 — AUTHORITY BUILDING STRATEGY

## Internal Linking Architecture

### Current Silo Structure
```
Homepage
├── /repair (Hub)
│   ├── /repair/vancouver (City Hub)
│   │   ├── /repair/vancouver/screen-replacement-mobile (Service)
│   │   │   ├── /repair/vancouver/screen-replacement-mobile/iphone-14
│   │   │   ├── /repair/vancouver/screen-replacement-mobile/iphone-13
│   │   │   └── ... (248 model pages)
│   │   ├── /repair/vancouver/battery-replacement-mobile
│   │   └── ... (4 services)
│   ├── /repair/burnaby
│   └── ... (13 cities)
├── /services (Secondary Hub)
├── /blog (Content Hub)
└── /book-online (Conversion)
```

### Recommended Enhanced Silo
```
Homepage
├── /repair (Primary Hub) ← Add "Related Cities" widget
│   ├── /repair/vancouver ← Add "Popular Repairs This Week" from bookings
│   │   ├── /repair/vancouver/downtown ← NEW: Neighborhood hubs
│   │   │   ├── /repair/vancouver/downtown/iphone-repair ← NEW
│   │   ├── /repair/vancouver/iphone ← NEW: Brand landing
│   │   ├── /repair/vancouver/screen-replacement-mobile
│   │   │   └── Related: battery-replacement, charging-port ← NEW cross-links
│   ├── /problems/{problem} ← NEW: Problem-solution hub
│   │   └── Links to relevant service+model pages
├── /blog (Content Cluster Hub)
│   ├── /blog/screen-repair-guide ← Links to all screen services
│   ├── /blog/battery-health-tips ← Links to battery services
│   └── /blog/category/{topic} ← Cluster pages
└── /compare ← NEW: Comparison hub
    └── /compare/standard-vs-premium-screen
```

## Topical Cluster Model

### Cluster 1: Mobile Screen Repair
**Pillar Page:** `/services/screen-replacement-mobile`
**Supporting Content:**
- Blog: "Complete Guide to Phone Screen Repair"
- Blog: "OEM vs Aftermarket Screens: What's the Difference?"
- FAQ: "How long does screen repair take?"
- Problem: "/problems/cracked-screen"
- City pages: All `/repair/{city}/screen-replacement-mobile`

### Cluster 2: Battery Health
**Pillar Page:** `/services/battery-replacement-mobile`
**Supporting Content:**
- Blog: "How to Extend Your Phone Battery Life" ✅ EXISTS
- Blog: "Signs Your Battery Needs Replacement"
- FAQ: "When should I replace my battery?"
- Problem: "/problems/battery-draining-fast"

### Cluster 3: Laptop Repair
**Pillar Page:** `/services/laptop-repair` (NEW)
**Supporting Content:**
- Blog: "MacBook vs Windows Laptop Repair Guide"
- Blog: "Is My Laptop Worth Repairing?"
- All `/repair/{city}/screen-replacement-laptop` pages

### Cluster 4: Local Service Areas
**Pillar Page:** `/service-areas`
**Supporting Content:**
- All 13 city pages
- All 37+ neighborhood pages
- Blog: "Why Choose Local Repair Services"

---

# PHASE 7 — RANKING BLUEPRINT

## 30-DAY SPRINT

### Engineering Tasks
| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| 🔴 P0 | Add `content_updated_at` to `dynamic_routes` & update per-route | High | 2 days |
| 🔴 P0 | Implement unique `lastmod` in sitemap based on actual content changes | High | 1 day |
| 🔴 P0 | Add image-sitemap.xml to robots.txt | Medium | 30 min |
| 🟠 P1 | Create pricing data for Charging Port Repair (high-demand service) | High | 1 day |
| 🟠 P1 | Add neighborhood pages for 7 missing cities | High | 2 days |
| 🟠 P1 | Implement "Related Services" cross-links on model-service pages | Medium | 1 day |
| 🟠 P1 | Add "Nearby Cities" widget to city pages | Medium | 4 hrs |
| 🟡 P2 | Add geo meta tags to model-service pages | Low | 2 hrs |
| 🟡 P2 | Verify and mark 5 unverified testimonials | Low | 1 hr |

### SEO Tasks
| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| 🔴 P0 | Submit updated sitemap to Google Search Console | High | 30 min |
| 🔴 P0 | Request re-indexing of top 20 model-service pages | High | 1 hr |
| 🟠 P1 | Create unique meta descriptions for top 50 city-service pages | Medium | 2 days |
| 🟠 P1 | Add FAQ schema to all city pages (5 common questions) | Medium | 1 day |
| 🟡 P2 | Set up Core Web Vitals monitoring in GSC | Medium | 1 hr |

### Content Tasks
| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| 🔴 P0 | Write 3 new blog posts targeting "screen repair guide", "battery replacement guide", "laptop repair tips" | High | 3 days |
| 🟠 P1 | Create unique local content for 5 top-traffic cities | Medium | 2 days |
| 🟠 P1 | Add 10 new verified testimonials (target: 3 per top city) | Medium | Ongoing |

---

## 90-DAY PLAN

### Engineering Tasks
| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| 🔴 P0 | Build pricing data for ALL 17 services | Critical | 2 weeks |
| 🔴 P0 | Create programmatic Problem-Solution pages | High | 1 week |
| 🟠 P1 | Build Brand+City landing pages (39 pages) | High | 1 week |
| 🟠 P1 | Implement "Popular Repairs" widget using booking data | Medium | 3 days |
| 🟠 P1 | Add HowTo schema to service pages | Medium | 2 days |
| 🟡 P2 | Build Comparison pages (standard vs premium) | Medium | 1 week |
| 🟡 P2 | Implement A/B testing for CTAs | Medium | 1 week |

### SEO Tasks
| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| 🔴 P0 | Full site audit with Screaming Frog or Ahrefs | High | 1 day |
| 🔴 P0 | Build 10-20 local citations (Yelp, YellowPages, BBB) | High | 2 weeks |
| 🟠 P1 | Google Business Profile optimization for all 13 cities | High | 1 week |
| 🟠 P1 | Implement review schema with real booking-based reviews | Medium | 1 week |
| 🟡 P2 | Create location-specific landing pages for Google Ads | Medium | 1 week |

### Content Tasks
| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| 🔴 P0 | Publish 2 blog posts per week (24 total) | High | Ongoing |
| 🔴 P0 | Create comprehensive FAQ page with 30+ questions | High | 1 week |
| 🟠 P1 | Build "Repair Cost Calculator" interactive tool | High | 2 weeks |
| 🟠 P1 | Create video content for top 5 services | Medium | 2 weeks |
| 🟡 P2 | Launch "Repair Tips" email newsletter | Low | 1 week |

---

## 6-MONTH PLAN

### Engineering Tasks
| Priority | Task | Impact |
|----------|------|--------|
| 🔴 P0 | Full expansion to 20,000+ programmatic pages (all service combinations) |
| 🔴 P0 | Real-time pricing updates from supplier APIs |
| 🟠 P1 | Mobile app for booking (PWA enhancement) |
| 🟠 P1 | Customer portal for booking history, warranties |
| 🟡 P2 | Automated SEO monitoring dashboard |

### SEO Tasks
| Priority | Task | Impact |
|----------|------|--------|
| 🔴 P0 | Achieve top 3 ranking for "phone repair vancouver" |
| 🔴 P0 | Build 50+ high-quality backlinks from local directories, tech blogs |
| 🟠 P1 | Expand to Google Local Services Ads |
| 🟠 P1 | Implement dynamic remarketing with product feed |
| 🟡 P2 | Create partner content with device retailers |

### Content Tasks
| Priority | Task | Impact |
|----------|------|--------|
| 🔴 P0 | Publish 50+ blog posts (authority building) |
| 🔴 P0 | Create "Ultimate Guide to Device Repair" (10,000+ word pillar) |
| 🟠 P1 | Launch YouTube channel with repair tutorials |
| 🟠 P1 | Guest posting on Vancouver tech/lifestyle blogs |
| 🟡 P2 | Create downloadable resources (repair checklists, buying guides) |

---

## KEY METRICS TO TRACK

| Metric | Current | 30-Day Target | 90-Day Target | 6-Month Target |
|--------|---------|---------------|---------------|----------------|
| Indexed Pages | ~3,300 | 3,500 | 5,000 | 20,000 |
| Organic Traffic | Unknown | +20% | +100% | +300% |
| Top 10 Keywords | Unknown | 50 | 200 | 500 |
| Domain Authority | Unknown | +2 | +5 | +15 |
| Avg Position (target KWs) | Unknown | Top 20 | Top 10 | Top 5 |
| Conversion Rate | Unknown | Baseline | +10% | +25% |

---

## IMMEDIATE ACTION ITEMS (This Week)

1. ⬜ Add `content_updated_at` column to `dynamic_routes`
2. ⬜ Update sitemap generation to use per-route lastmod
3. ⬜ Add image-sitemap.xml to robots.txt
4. ⬜ Create pricing data for Charging Port Repair service
5. ⬜ Write 1 blog post: "Complete Guide to iPhone Screen Repair"
6. ⬜ Add FAQ schema to Vancouver city page (pilot)
7. ⬜ Verify 5 unverified testimonials
8. ⬜ Submit sitemap to Google Search Console
9. ⬜ Set up Google Search Console monitoring
10. ⬜ Add "Related Services" links to top 10 model-service pages

---

*Report generated: March 2, 2026*
*Audit performed by: Technical SEO Engineer*
*Data sources: Codebase analysis + Supabase database queries*
