# Routing Issue Analysis - Pages Not Rendering Correctly

## Problem Summary

The universal routing system is generating pages but **not rendering the correct content**. Issues observed:

**1. City Pages Showing "Coming Soon"**
```
/repair/richmond → "Repair Services Coming Soon to Richmond"
```
**Expected:** Should show actual repair services for Richmond

**2. City+Service Pages Showing "Coming Soon"**
```
/repair/vancouver/screen-repair → "Screen repair in Vancouver... coming soon"
```
**Expected:** Should show screen repair services in Vancouver

**3. Model-Service Pages Returning 404**
```
/repair/burnaby/battery-replacement-laptop/macbook-pro-2023 → 404
```
**Expected:** Should show MacBook Pro 2023 battery replacement in Burnaby

## Root Cause Analysis

### Database Schema Issue
The `dynamic_routes` table likely doesn't have entries for:
- City-only pages (`/repair/[city]`)
- City+service pages (`/repair/[city]/[service]`)

It only has entries for:
- Model-service pages (`/repair/[city]/[service]/[model]`)

### Route Type Detection Logic
In `[[...slug]].tsx`, the logic checks:

```typescript
// For slug length = 1 (city page)
if (slug.length === 1) {
  return { routeType: 'CITY_PAGE' } // Shows "coming soon"
}

// For slug length = 2 (city+service page)  
if (slug.length === 2) {
  return { routeType: 'CITY_SERVICE_PAGE' } // Shows "coming soon"
}

// For slug length = 3 (model-service page)
// Only this queries the database
```

### Missing Database Entries
The `dynamic_routes` table needs entries for:
1. `route_type: 'city-page'` (for `/repair/[city]`)
2. `route_type: 'city-service-page'` (for `/repair/[city]/[service]`)
3. `route_type: 'model-service-page'` (already exists)

## Solution Options

### Option 1: Restore Legacy ISR Implementation (Recommended)
**Pros:**
- Already worked with proper header/footer integration
- Professional UI matching website theme
- City and city+service pages worked correctly
- Model-service pages worked correctly

**Cons:**
- Would need to restore `[city]/[service]/` folder structure
- Might conflict with universal route

### Option 2: Fix Universal Route Logic
**Pros:**
- Single file solution
- Already generates 3,225 pages

**Cons:**
- Need to add database entries for city/city+service pages
- Need to update route detection logic
- Need to create proper templates for city/city+service pages

### Option 3: Hybrid Approach
- Use universal route for model-service pages (3,224 pages)
- Use restored ISR for city and city+service pages (~50 pages)
- Need careful route priority management

## Recommendation

**Restore the legacy ISR implementation** because:

1. **It already worked** with professional UI
2. **Header/footer integration** was correct
3. **All three URL types worked**:
   - `/repair/[city]` - City landing pages
   - `/repair/[city]/[service]` - Service category pages
   - `/repair/[city]/[service]/[model]` - Model-specific pages

4. **Better user experience** - Not showing "coming soon" placeholders

## Implementation Plan

1. **Restore `[city]/[service]/` folder structure** from `src/archived_routes/`
2. **Update `next.config.js`** to handle both systems
3. **Test all three URL patterns**
4. **Verify header/footer integration**
5. **Ensure no route conflicts**

## Verification URLs to Test

After restoration, test:
- `/repair/richmond` (should show Richmond repair services)
- `/repair/vancouver/screen-repair` (should show screen repair in Vancouver)
- `/repair/burnaby/battery-replacement-laptop/macbook-pro-2023` (should show MacBook Pro battery replacement)

The legacy ISR system provided a complete, professional solution that matched the website theme.
