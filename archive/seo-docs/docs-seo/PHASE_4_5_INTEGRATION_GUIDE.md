# Phase 4-5 Integration Guide: Neighborhood Links & Local Content

**Status**: Ready for implementation  
**Complexity**: Low (copy-paste integration)  
**Estimated Time**: 30 minutes

---

## Overview

This guide walks you through integrating:
1. **Phase 4**: NeighborhoodLinks component (internal linking)
2. **Phase 5**: Local content display (from database)

Both components enhance local SEO and are ready to deploy.

---

## Step 1: Run Phase 5 Migration

### Migration File
**Location**: `supabase/migrations/20260130100000_populate_local_seo_content.sql`

### To Execute
1. Open Supabase Dashboard → SQL Editor
2. Copy entire contents of migration file
3. Paste into SQL Editor
4. Click "Run"
5. Verify query completes successfully

### What It Does
- Populates `local_content` field for all 6 cities (Vancouver, Burnaby, Coquitlam, Richmond, North Vancouver, Surrey)
- Each city gets 400+ words of unique, keyword-optimized content
- Content covers: Local history, common issues, seasonal patterns, partnerships, differentiation

---

## Step 2: Add NeighborhoodLinks to City Page

### Component Already Exists
**File**: `src/components/seo/NeighborhoodLinks.tsx`

### How to Import
```tsx
import { NeighborhoodLinks } from '@/components/seo/NeighborhoodLinks';
```

### How to Use

Open `src/pages/locations/[city].tsx` and add this section (choose one position):

#### Option A: After "Common Repairs" Section (Recommended)
```tsx
// Add after the commonRepairs section, before "Neighborhoods" section

<NeighborhoodLinks
  cityName={name}
  citySlug={citySlug}
  neighborhoods={neighborhoods}
  title="Service Neighborhoods"
/>
```

#### Option B: Replace Existing "Neighborhoods We Serve" Section
Replace the existing neighborhoods grid with:
```tsx
<NeighborhoodLinks
  cityName={name}
  citySlug={citySlug}
  neighborhoods={neighborhoods}
  title={`${name} Neighborhoods We Serve`}
/>
```

### Component Props
```typescript
interface NeighborhoodLinksProps {
  cityName: string;        // "Vancouver"
  citySlug: string;        // "vancouver"
  neighborhoods: string[]; // Array from database
  title?: string;          // Section title
  className?: string;      // Additional CSS classes
}
```

---

## Step 3: Add Local Content Display

### Create LocalContent Component

**File**: `src/components/seo/LocalContent.tsx`

```tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface LocalContentProps {
  content?: string;
  cityName: string;
}

export function LocalContent({ content, cityName }: LocalContentProps) {
  if (!content) {
    return null; // Don't render if no content
  }

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="prose prose-lg max-w-4xl mx-auto">
          <ReactMarkdown
            components={{
              h2: ({ node, ...props }) => (
                <h2 className="text-3xl font-bold mt-8 mb-4 text-gray-900" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-2xl font-bold mt-6 mb-3 text-gray-800" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="text-gray-700 mb-4 leading-relaxed" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside mb-4 text-gray-700" {...props} />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </section>
  );
}

export default LocalContent;
```

### Import and Add to City Page

```tsx
import { LocalContent } from '@/components/seo/LocalContent';

// In component, after NeighborhoodLinks (before testimonials recommended)
<LocalContent content={localContent} cityName={name} />
```

### In getStaticProps

The `localContent` field is already being fetched! It comes from:
```tsx
localContent: dbCityData.local_content || undefined,
```

And it's already available in the component props:
```tsx
const {
  // ... other destructuring ...
  localContent // Already available!
} = cityData;
```

---

## Step 4: Install ReactMarkdown (if needed)

```bash
npm install react-markdown
```

---

## Complete Integration Example

Here's what your updated `[city].tsx` component imports should look like:

```tsx
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { FaPhone, FaClock, FaShieldAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { LocalBusinessSchema, ReviewSchema, PlaceSchema, CityLocalBusinessSchema } from '@/components/seo/StructuredData';
import { TechnicianSchema } from '@/components/seo/TechnicianSchema';
import { NeighborhoodLinks } from '@/components/seo/NeighborhoodLinks'; // Add this
import { LocalContent } from '@/components/seo/LocalContent'; // Add this
import { getCityData, getAllActiveCities } from '@/lib/data-service';
import { getSameAsUrls, getCityNameFromSlug } from '@/utils/wikidata';
import { GetStaticPaths, GetStaticProps } from 'next';
```

And in your render return:

```tsx
<section className="py-16 bg-gray-50">
  {/* ... existing Popular Repairs section ... */}
</section>

{/* Add NeighborhoodLinks here */}
<NeighborhoodLinks
  cityName={name}
  citySlug={citySlug}
  neighborhoods={neighborhoods}
  title="Service Neighborhoods"
/>

{/* Add LocalContent here */}
<LocalContent content={localContent} cityName={name} />

{/* ... rest of page (testimonials, etc.) ... */}
```

---

## Verification Checklist

After implementation, verify:

- [ ] NeighborhoodLinks component displays
- [ ] Neighborhood descriptions appear on hover
- [ ] LocalContent renders without errors
- [ ] LocalContent markdown renders properly (headings, paragraphs)
- [ ] City page loads without console errors
- [ ] Mobile responsive (test on phone)
- [ ] All neighborhoods link to correct URLs (structure ready for `/locations/[city]/[neighborhood]`)

---

## Testing Local Content

### To Test Before Running Migration

View this test file to see what the migration will add:
**File**: `supabase/migrations/20260130100000_populate_local_seo_content.sql`

All content is visible in the migration file.

### To Test After Running Migration

1. Open city page in browser
2. Scroll to LocalContent section
3. Verify markdown renders properly
4. Check headings are readable
5. Check paragraphs have good spacing

---

## SEO Impact

### NeighborhoodLinks Benefits
- ✅ Internal linking for topic clustering
- ✅ Schema markup for CollectionPage
- ✅ Descriptive links (better anchor text)
- ✅ Foundation for neighborhood subpages

### LocalContent Benefits
- ✅ 400+ unique words per city
- ✅ Keyword-rich, city-specific content
- ✅ E-A-T signals (expertise in local area)
- ✅ Longer time-on-page (improves rankings)
- ✅ Target long-tail keywords naturally

---

## Next Steps After Integration

### Short-term (This Week)
1. ✅ Run Phase 5 migration
2. ✅ Add NeighborhoodLinks to city pages
3. ✅ Add LocalContent to city pages
4. ✅ Test on staging/local environment
5. ✅ Deploy to production

### Medium-term (This Month)
1. Create `/locations/[city]/[neighborhood]` dynamic routes
2. Add neighborhood-specific testimonials
3. Add neighborhood-specific pricing
4. Monitor local search rankings

### Long-term (This Quarter)
1. Create blog content for neighborhoods
2. Build location-specific schemas
3. Add user-generated reviews
4. Expand to additional cities

---

## Troubleshooting

### LocalContent Not Showing
**Check**: Is `localContent` being fetched in getStaticProps?
**Solution**: Verify `dbCityData.local_content` is available

### NeighborhoodLinks Not Showing
**Check**: Are neighborhoods being passed correctly?
**Solution**: Verify `neighborhoods` array is populated from database

### Markdown Not Rendering
**Check**: Is react-markdown installed?
**Solution**: Run `npm install react-markdown`

### Styling Issues
**Check**: Are Tailwind classes being applied?
**Solution**: Verify prose plugin is configured in tailwind.config.js

---

## Rollback Plan

If something goes wrong:

### Rollback Phase 5 Migration
```sql
-- Clear local_content for all cities
UPDATE service_locations
SET local_content = NULL
WHERE city_name IN ('Vancouver', 'Burnaby', 'Coquitlam', 'Richmond', 'North Vancouver', 'Surrey');
```

### Remove Components from Page
Simply remove the NeighborhoodLinks and LocalContent imports and component calls.

---

## Support

**Component Documentation**:
- `src/components/seo/NeighborhoodLinks.tsx` - Inline comments
- `src/components/seo/LocalContent.tsx` - Inline comments

**Framework Guide**:
- `docs/seo/PHASE_5_LOCAL_CONTENT_FRAMEWORK.md` - Content creation guide

**Implementation Summary**:
- `docs/seo/IMPLEMENTATION_COMPLETE_SUMMARY.md` - Full overview

---

## Questions?

Refer to:
1. Component source code (has inline documentation)
2. Framework guide (explains content structure)
3. Migration file (shows exact data being added)

