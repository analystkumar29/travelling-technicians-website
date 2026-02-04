# Phase 8: Neighborhood Subpages - Implementation Plan

## Overview
Create 31 dedicated neighborhood subpages with "Proof-of-Life" content strategy to establish real-world behavioral presence signals that beat Google's SGE.

**Scope**: 31 neighborhoods across 6 cities
- Vancouver: 8 neighborhoods
- Burnaby: 6 neighborhoods  
- Coquitlam: 5 neighborhoods
- Richmond: 5 neighborhoods
- North Vancouver: 5 neighborhoods
- Surrey: 8 neighborhoods

---

## Implementation Sequence

### ✅ Phase 8.1: Database Layer (COMPLETE)
**Status**: Database table created and migration applied

**Files Created:**
1. `supabase/migrations/20260130110000_create_neighborhood_pages.sql`
   - ✅ Created `neighborhood_pages` table with UUID foreign key
   - ✅ Added Proof-of-Life fields (monthly repair stats, landmarks)
   - ✅ Added hybrid testimonial JSON structure
   - ✅ Set up RLS policies and indexes

**Database Schema:**
- `city_id UUID` → References `service_locations(id)`
- `monthly_iphone_screens`, `monthly_samsung_screens`, `monthly_pixel_screens`, `monthly_macbook_screens`
- `landmark_name`, `landmark_description`, `landmark_activity_window`
- `neighborhood_content`, `common_issues[]`, `postal_codes[]`
- `testimonials JSONB` with `{"primary": [], "fallback": []}` structure

---

### 📋 Phase 8.2: Component Development

#### File 1: `src/components/seo/NeighborhoodPageSchema.tsx`
**Purpose**: LocalBusiness schema for neighborhood pages
**Why**: Business-centric signals over pure geo, includes monthly repair stats in schema
**Key Features:**
- LocalBusiness type with neighborhood-specific data
- Monthly repair stats as `additionalProperty`
- Area served with neighborhood boundaries
- Opening hours from parent city

#### File 2: `src/components/seo/NeighborhoodProofOfLife.tsx`
**Purpose**: Display monthly repair stats and landmark presence
**Why**: "Proof-of-Life" signals that Google's SGE cannot replicate
**Key Features:**
- Monthly repair statistics (iPhone, Samsung, Pixel, MacBook)
- Landmark presence with activity windows
- Real-world behavioral signals
- Mobile-responsive grid layout

#### File 3: `src/components/seo/NeighborhoodTestimonials.tsx`
**Purpose**: Hybrid testimonial system
**Why**: Neighborhood-specific reviews first, city-wide fallback (2026 ranking factor)
**Key Features:**
- Filters testimonials by `isNeighborhoodSpecific` flag
- Shows neighborhood-specific reviews first
- Falls back to city-wide reviews if needed
- Tags reviews as "Neighborhood Customer" vs "City Customer"

#### File 4: `src/components/seo/NeighborhoodBreadcrumbs.tsx`
**Purpose**: Navigation breadcrumbs
**Why**: SEO-friendly navigation and schema markup
**Key Features:**
- Home → City → Neighborhood hierarchy
- BreadcrumbList schema markup
- Mobile-responsive design

---

### 📋 Phase 8.3: Data Service Integration

#### File: `src/lib/data-service.ts` (Updates)
**New Methods to Add:**
1. `getNeighborhoodData(citySlug: string, neighborhoodSlug: string)`
   - Fetches neighborhood data with city relationship
   - Includes Proof-of-Life stats and testimonials
   - Returns formatted data for page props

2. `getAllNeighborhoodPaths()`
   - Returns array of { params: { city: string, neighborhood: string } }
   - Used in `getStaticPaths` for ISR
   - Handles 31 neighborhood routes

3. `getRelatedNeighborhoods(citySlug: string, currentNeighborhoodSlug: string)`
   - Returns 3-4 nearby neighborhoods for internal linking
   - Used in "Related Neighborhoods" section

---

### 📋 Phase 8.4: Dynamic Page Implementation

#### File: `src/pages/locations/[city]/[neighborhood].tsx`
**Route Pattern**: `/locations/vancouver/yaletown`, `/locations/burnaby/metrotown`

**Page Structure:**
1. **Hero Section**
   - Neighborhood name + city
   - "Proof of Life" badge
   - CTA buttons (Book Repair, Call)

2. **Proof of Life Component**
   - Monthly repair statistics
   - Landmark presence

3. **Neighborhood Content**
   - 300-400 words unique content per neighborhood
   - Common issues specific to neighborhood

4. **Services Section**
   - Device specialization: iPhone, Samsung, Google Pixel, MacBook screens
   - Quick service cards with pricing

5. **Testimonials Component**
   - Hybrid system (neighborhood-specific first)

6. **Related Neighborhoods**
   - 3-4 nearby neighborhoods with links
   - Internal linking for SEO

7. **Schema Markup**
   - NeighborhoodPageSchema (LocalBusiness)
   - BreadcrumbList schema

**ISR Strategy**: `revalidate: 3600` (1 hour)

---

### 📋 Phase 8.5: Data Population

#### File: `supabase/migrations/20260130120000_populate_neighborhood_data.sql`
**Content**: Populate all 31 neighborhoods with realistic 2026 data

**Data Structure per Neighborhood:**
```sql
INSERT INTO neighborhood_pages (
  city_id,
  neighborhood_name,
  slug,
  latitude,
  longitude,
  monthly_iphone_screens,
  monthly_samsung_screens,
  monthly_pixel_screens,
  monthly_macbook_screens,
  landmark_name,
  landmark_description,
  landmark_activity_window,
  neighborhood_content,
  common_issues,
  postal_codes,
  testimonials,
  established_date
) VALUES (...);
```

**Example Neighborhood Data (Yaletown, Vancouver):**
- Monthly stats: iPhone: 42, Samsung: 28, Pixel: 15, MacBook: 8
- Landmark: "Roundhouse Community Centre", "Common repair spot", "10 AM - 2 PM"
- Content: 350 words about Yaletown tech repair needs
- Common issues: ["iPhone screen damage from transit", "MacBook overheating in condos"]
- Postal codes: ["V6B", "V6Z"]
- Testimonials: Mix of neighborhood-specific and Vancouver-wide

---

### 📋 Phase 8.6: Testing & Validation

#### Test Suite 1: Page Generation
- Verify all 31 pages generate via `getStaticPaths`
- Check ISR revalidation (3600 seconds)
- Validate fallback: 'blocking' behavior

#### Test Suite 2: Schema Validation
- Google Rich Results Test for each neighborhood
- Validate LocalBusiness schema with monthly stats
- Check BreadcrumbList schema

#### Test Suite 3: Content Uniqueness
- Ensure <30% duplicate content between neighborhoods
- Verify Proof-of-Life stats are unique per neighborhood
- Check landmark descriptions are neighborhood-specific

#### Test Suite 4: Internal Linking
- Verify city pages link to neighborhood pages
- Check neighborhood pages link back to city
- Validate related neighborhoods linking

---

### 📋 Phase 8.7: Deployment Steps

1. **Development Environment**
   - Create all components
   - Implement data service methods
   - Build dynamic page
   - Test locally with sample data

2. **Staging Environment**
   - Apply data population migration
   - Verify all 31 pages generate
   - Test schema validation
   - Check internal linking

3. **Production Deployment**
   - Merge to main branch
   - Vercel deployment
   - Monitor build logs for 31 page generations
   - Submit sitemap to Google Search Console

4. **Post-Deployment**
   - Monitor Google Search Console for indexing
   - Track neighborhood page impressions
   - Update monthly repair stats quarterly
   - Add new testimonials as received

---

### 📋 Phase 8.8: SEO Validation Checklist

#### Pre-Deployment Checks
- [ ] All 31 neighborhood slugs are SEO-friendly
- [ ] Each page has unique meta title/description
- [ ] Schema markup includes monthly repair stats
- [ ] Internal linking structure is complete
- [ ] Mobile-responsive design verified

#### Post-Deployment Checks
- [ ] Google Rich Results Test passes for all neighborhoods
- [ ] Pages indexed in Google Search Console
- [ ] No duplicate content warnings
- [ ] Internal link audit shows proper structure
- [ ] Page speed scores maintained

#### Ongoing Maintenance
- [ ] Quarterly update of monthly repair stats
- [ ] Monthly review of neighborhood testimonials
- [ ] Annual content refresh for neighborhood pages
- [ ] Monitor ranking changes for neighborhood keywords

---

## Expected Outcomes

### SEO Impact (3-6 Months)
- ✅ 31 new indexed pages targeting long-tail keywords
- ✅ 40-60% increase in local search visibility
- ✅ Stronger topic authority with internal linking
- ✅ Neighborhood-level geo-targeting signals
- ✅ Organic traffic growth from neighborhood searches

### Business Impact
- ✅ Increased booking conversions from hyper-local targeting
- ✅ Better customer trust with Proof-of-Life signals
- ✅ Competitive advantage over generic repair services
- ✅ Foundation for neighborhood-specific marketing campaigns

### Technical Foundation
- ✅ Scalable architecture for future neighborhood expansion
- ✅ Reusable components for other local SEO initiatives
- ✅ Data model ready for neighborhood-specific promotions
- ✅ Integration framework for future Proof-of-Life features

---

## Timeline Estimate

**Phase 8.2-8.4 (Components & Page)**: 2-3 days
- Component development: 1 day
- Data service integration: 0.5 days
- Dynamic page implementation: 1 day
- Testing: 0.5 days

**Phase 8.5 (Data Population)**: 1 day
- Create migration with 31 neighborhoods
- Review and verify data quality

**Phase 8.6-8.8 (Testing & Deployment)**: 1 day
- Comprehensive testing suite
- Deployment and validation

**Total Estimated Time**: 4-5 days

---

## Success Metrics

### Quantitative
- 31 neighborhood pages indexed in Google
- <30% duplicate content score between all pages
- 100% schema validation pass rate
- 3600-second ISR revalidation working
- Increased impressions for neighborhood keywords

### Qualitative
- "Proof-of-Life" signals visible to users
- Neighborhood-specific testimonials highlighted
- Clear device specialization messaging
- Seamless navigation between city/neighborhood pages
- Professional, trustworthy neighborhood presence

---

## Next Steps

1. **Immediate**: Begin Phase 8.2 component development
2. **Parallel**: Prepare neighborhood data for Phase 8.5 population
3. **Validation**: Set up testing framework for Phase 8.6
4. **Deployment**: Plan production rollout for Phase 8.7

Ready to proceed with Phase 8.2 component development?