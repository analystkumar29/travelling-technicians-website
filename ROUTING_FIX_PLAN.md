# Routing Fix Plan - Complete Professional Implementation

## Problem Analysis

**Current Issues:**
1. `/repair/[city]` → Shows "coming soon" (should show city services)
2. `/repair/[city]/[service]` → Shows "coming soon" (should show service in city)
3. `/repair/[city]/[model]` → 404 (missing pattern - e.g., `/repair/west-vancouver/iphone-14`)
4. `/repair/[city]/[service]/[model]` → Works (3 segments)

**Missing Database Entries:**
- `route_type: 'city-page'` (for `/repair/[city]`)
- `route_type: 'city-service-page'` (for `/repair/[city]/[service]`)
- `route_type: 'city-model-page'` (for `/repair/[city]/[model]`)

## Solution: Enhance Universal Route

### Step 1: Update Database Schema

**Add missing route types to `dynamic_routes` table:**
```sql
-- Add city-page entries for all active cities
INSERT INTO dynamic_routes (slug_path, route_type, city_id, payload)
SELECT 
  CONCAT('repair/', sl.slug),
  'city-page',
  sl.id,
  jsonb_build_object(
    'city', jsonb_build_object(
      'id', sl.id,
      'name', sl.city_name,
      'slug', sl.slug,
      'local_content', sl.local_content,
      'local_phone', sl.local_phone,
      'local_email', sl.local_email,
      'operating_hours', sl.operating_hours
    )
  )
FROM service_locations sl
WHERE sl.is_active = true;

-- Add city-service-page entries for all city-service combinations
INSERT INTO dynamic_routes (slug_path, route_type, city_id, service_id, payload)
SELECT 
  CONCAT('repair/', sl.slug, '/', s.slug),
  'city-service-page',
  sl.id,
  s.id,
  jsonb_build_object(
    'city', jsonb_build_object(
      'id', sl.id,
      'name', sl.city_name,
      'slug', sl.slug,
      'local_content', sl.local_content,
      'local_phone', sl.local_phone,
      'local_email', sl.local_email,
      'operating_hours', sl.operating_hours
    ),
    'service', jsonb_build_object(
      'id', s.id,
      'name', s.name,
      'slug', s.slug,
      'display_name', s.display_name,
      'description', s.description,
      'estimated_duration_minutes', s.estimated_duration_minutes,
      'is_doorstep_eligible', s.is_doorstep_eligible
    )
  )
FROM service_locations sl
CROSS JOIN services s
WHERE sl.is_active = true
AND s.is_active = true
AND s.is_doorstep_eligible = true;

-- Add city-model-page entries for popular city-model combinations
INSERT INTO dynamic_routes (slug_path, route_type, city_id, model_id, payload)
SELECT 
  CONCAT('repair/', sl.slug, '/', dm.slug),
  'city-model-page',
  sl.id,
  dm.id,
  jsonb_build_object(
    'city', jsonb_build_object(
      'id', sl.id,
      'name', sl.city_name,
      'slug', sl.slug,
      'local_content', sl.local_content,
      'local_phone', sl.local_phone,
      'local_email', sl.local_email,
      'operating_hours', sl.operating_hours
    ),
    'model', jsonb_build_object(
      'id', dm.id,
      'name', dm.name,
      'slug', dm.slug,
      'display_name', dm.display_name,
      'release_year', dm.release_year,
      'popularity_score', dm.popularity_score
    ),
    'brand', jsonb_build_object(
      'id', b.id,
      'name', b.name,
      'slug', b.slug,
      'display_name', b.display_name
    ),
    'type', jsonb_build_object(
      'id', dt.id,
      'name', dt.name,
      'slug', dt.slug
    )
  )
FROM service_locations sl
CROSS JOIN device_models dm
JOIN brands b ON dm.brand_id = b.id
JOIN device_types dt ON dm.device_type_id = dt.id
WHERE sl.is_active = true
AND dm.is_active = true
AND dm.popularity_score > 50; -- Only popular models
```

### Step 2: Update Universal Route Logic

**Modify `[[...slug]].tsx` to handle all patterns:**

1. **Add new route type:**
```typescript
interface RouteData {
  slug_path: string;
  route_type: 'model-service-page' | 'city-service-page' | 'city-page' | 'city-model-page';
  // ... existing fields
}
```

2. **Update route detection:**
```typescript
// In getStaticProps, handle all route types
switch (route.route_type) {
  case 'model-service-page':
    return { routeType: 'MODEL_SERVICE_PAGE', routeData: route };
  case 'city-page':
    return { routeType: 'CITY_PAGE', routeData: route };
  case 'city-service-page':
    return { routeType: 'CITY_SERVICE_PAGE', routeData: route };
  case 'city-model-page':
    return { routeType: 'CITY_MODEL_PAGE', routeData: route };
}
```

3. **Create new template components:**
- `CityPage` - Shows all services available in a city
- `CityServicePage` - Shows service details in a city (with model links)
- `CityModelPage` - Shows all services available for a model in a city

### Step 3: Create Professional Templates

**Copy UI patterns from legacy files:**

1. **CityPage Template** (from `src/analysis/legacy/model-page.tsx`):
   - Professional header with city name
   - List of available services with pricing
   - "Why Choose Us" section
   - Booking CTAs

2. **CityServicePage Template** (from restored `[city]/[service]/index.tsx`):
   - Service-specific header
   - Model selection grid
   - Pricing information
   - Service details

3. **CityModelPage Template** (new - for `/repair/[city]/[model]`):
   - Model-specific header (e.g., "iPhone 14 Repair in Vancouver")
   - List of available services for that model
   - Model-specific pricing
   - Booking options

### Step 4: Update getStaticPaths

**Include all route types in pre-rendering:**
```typescript
// Fetch ALL route types, not just model-service-page
const { data: allRoutes, error } = await supabase
  .from('dynamic_routes')
  .select('slug_path, route_type')
  .in('route_type', ['model-service-page', 'city-page', 'city-service-page', 'city-model-page'])
  .order('slug_path', { ascending: true });
```

### Step 5: Test All URL Patterns

**Verify these work professionally:**
1. `/repair/vancouver` - City page with services
2. `/repair/vancouver/screen-repair` - Service in city
3. `/repair/vancouver/iphone-14` - Model in city
4. `/repair/vancouver/screen-repair/iphone-14` - Model+service in city

## Benefits

1. **Complete Professional Coverage** - All URL patterns work
2. **Better SEO** - No "coming soon" pages
3. **Improved UX** - Professional UI matching website theme
4. **Database-Driven** - Single source of truth
5. **Scalable** - Automatic updates via triggers

## Implementation Priority

1. **Immediate**: Add database entries for city/service pages
2. **High**: Update universal route to handle new route types
3. **High**: Create professional templates
4. **Medium**: Add city-model-page entries
5. **Low**: Update sitemap generation

This plan keeps the universal routing system while fixing all the issues and adding professional UI from the legacy implementation.
