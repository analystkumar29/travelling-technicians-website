# DATABASE RECONCILIATION REPORT
## The Travelling Technicians - Data Service Audit

**Report Date:** January 30, 2026  
**Auditor:** System Analysis  
**Scope:** Complete audit of `src/lib/data-service.ts` against live Supabase database schema

---

## EXECUTIVE SUMMARY

This report documents a comprehensive audit of the data-service layer following a major database schema overhaul. The audit reveals **critical mismatches** between the code's expectations and actual database structure, resulting in broken dynamic functionality across the website.

### Key Findings:
- ✅ **18 functions indexed** in data-service.ts
- ⚠️ **26+ critical schema mismatches identified**
- 🔴 **8 components/pages currently affected**
- 📊 **Tables affected:** brands, device_models, services, testimonials, service_locations, dynamic_pricing

---

## PART 1: FUNCTION INVENTORY

### All Functions in `src/lib/data-service.ts`:

#### **Core Data Fetching Functions:**
1. `getPricingData()` - Fetches dynamic pricing ranges by device type
2. `getPopularServices()` - Fetches top 4 services for homepage
3. `getTestimonials()` - Fetches featured customer reviews
4. `getServicesByDeviceType()` - Fetches services for device type pages
5. `getBrandsByDeviceType()` - Fetches supported brands by device type

#### **Location & Geography Functions:**
6. `getCityData()` - Fetches service location details
7. `getAllActiveCities()` - Gets all cities for sitemap/ISR
8. `getNearbyLocations()` - Calculates 3 nearest cities using Haversine formula

#### **Pricing & Service Functions:**
9. `getDynamicPricing()` - Gets pricing for specific city/service/model combo
10. `getAllActiveServices()` - Fetches all services for ISR paths
11. `getModelsForService()` - Gets device models with pricing for a service
12. `getAllActiveServiceSlugs()` - Gets service page slugs for routing
13. `getServiceBySlug()` - Fetches service details by URL slug
14. `getModelBySlug()` - Fetches model details by URL slug

#### **Neighborhood Functions (Phase 8):**
15. `getNeighborhoodData()` - Fetches complete neighborhood page data
16. `getAllNeighborhoodPaths()` - Gets all neighborhood paths for ISR
17. `getRelatedNeighborhoods()` - Finds 4 nearby neighborhoods

#### **Utility Functions:**
18. `checkDbConnection()` - Health check for database
19. `clearCache()` - Cache invalidation utility

#### **Helper Functions:**
- `isCacheValid()` - Cache TTL checker
- `getStaticServicesByDeviceType()` - Fallback data provider
- `getStaticBrandsByDeviceType()` - Fallback brand provider
- `checkPriceDeviation()` - 10% safety check
- `getFallbackPricing()` - Fallback pricing logic
- `getSlugForDeviceType()` - Device type to slug mapper
- `getFallbackServiceSlugs()` - Fallback slugs

---

## PART 2: SCHEMA MISMATCH ANALYSIS

### 🔴 CRITICAL: Missing Columns

| Table | Code Expects | Database Has | Impact Level |
|-------|-------------|--------------|--------------|
| **brands** | `display_name` | ❌ MISSING | 🔴 CRITICAL |
| **brands** | `device_type_id` | ❌ MISSING | 🔴 CRITICAL |
| **device_models** | `display_name` | ❌ MISSING | 🔴 CRITICAL |
| **device_models** | `device_type_id` | ❌ MISSING (has `type_id`) | 🔴 CRITICAL |
| **services** | `is_popular` | ❌ MISSING | 🟡 HIGH |
| **services** | `is_limited` | ❌ MISSING | 🟡 HIGH |
| **services** | `base_price` | ❌ MISSING | 🟡 HIGH |
| **services** | `sort_order` | ❌ MISSING | 🟡 HIGH |
| **service_locations** | `price_adjustment_percentage` | ❌ MISSING | 🟡 HIGH |
| **service_locations** | `city` | ❌ MISSING (has `city_name`) | 🟡 MEDIUM |
| **dynamic_pricing** | `discounted_price` | ❌ MISSING (has `compare_at_price`) | 🟡 HIGH |
| **testimonials** | `comment` | ❌ MISSING (has `review`) | 🟡 MEDIUM |
| **testimonials** | `device` | ❌ MISSING (has `device_model`) | 🟡 MEDIUM |
| **testimonials** | `location` | ❌ MISSING (has `city`) | 🟡 MEDIUM |

### 🟡 Column Name Mismatches

| Function | Looks For | Should Use | Table |
|----------|-----------|------------|-------|
| `getBrandsByDeviceType()` | `display_name` | `name` | brands |
| `getTestimonials()` | `comment` | `review` | testimonials |
| `getTestimonials()` | `device` | `device_model` | testimonials |
| `getTestimonials()` | `location` | `city` | testimonials |
| `getCityData()` | `city` column | `city_name` | service_locations |
| `getDynamicPricing()` | `discounted_price` | `compare_at_price` | dynamic_pricing |
| `getDynamicPricing()` | `price_adjustment_percentage` | Column doesn't exist | service_locations |

### 🔵 Relationship Mismatches

| Function | Issue | Current Code | Should Be |
|----------|-------|--------------|-----------|
| `getPricingData()` | Uses wrong FK | `device_models.device_type_id` | `device_models.type_id` |
| `getServicesByDeviceType()` | Wrong column reference | Queries `device_type_id` on services | ✅ Correct (exists) |
| `getBrandsByDeviceType()` | Missing relationship | Queries `brands.device_type_id` | ❌ Column doesn't exist |
| `getModelsForService()` | Join complexity | Multiple nested queries | Could be optimized |
| `getAllActiveServices()` | Array handling | Expects single object | Gets array from join |

### 🟢 Working Correctly

| Function | Status | Notes |
|----------|--------|-------|
| `getNearbyLocations()` | ✅ Working | Uses latitude/longitude correctly |
| `getAllActiveCities()` | ✅ Working | Uses city_name correctly |
| `checkDbConnection()` | ✅ Working | Simple count query |
| `getNeighborhoodData()` | ✅ Mostly Working | Minor field mapping issues |
| `getAllNeighborhoodPaths()` | ✅ Working | Correct relationships |
| `getRelatedNeighborhoods()` | ✅ Working | Haversine calculation correct |

---

## PART 3: IMPACT & DEPENDENCY MAPPING

### Pages/Components Using data-service.ts:

#### 1. **`src/pages/index.tsx` (Homepage)**
- **Functions Used:** `getPricingData()`, `getPopularServices()`, `getTestimonials()`
- **Status:** 🟡 PARTIALLY BROKEN
- **Issues:** 
  - Testimonials mapping broken (comment→review, device→device_model, location→city)
  - Services may lack proper data due to missing `is_popular`, `sort_order`
  - Pricing works due to safety fallbacks
- **User Impact:** Homepage displays static fallback data instead of dynamic

#### 2. **`src/pages/services/[slug].tsx` (Service Pages)**
- **Functions Used:** `getServicesByDeviceType()`, `getBrandsByDeviceType()`, `getAllActiveServiceSlugs()`
- **Status:** 🔴 CRITICAL - BROKEN
- **Issues:**
  - `getBrandsByDeviceType()` queries non-existent `brands.device_type_id`
  - Returns empty brands array, shows "No brands" to users
  - Services missing `is_popular`, `is_limited`, `base_price` fields
- **User Impact:** Service pages show incomplete information, no brand logos

#### 3. **`src/pages/repair/[city]/[service]/[model].tsx` (Dynamic Repair Pages)**
- **Functions Used:** `getCityData()`, `getDynamicPricing()`, `getNearbyLocations()`
- **Status:** 🟡 PARTIALLY BROKEN
- **Issues:**
  - `getDynamicPricing()` looks for `discounted_price` (should be `compare_at_price`)
  - Missing `price_adjustment_percentage` causes city-specific pricing to fail
  - Falls back to hardcoded pricing
- **User Impact:** No city-specific pricing displayed, uses generic rates

#### 4. **`src/pages/repair/[city]/[service]/index.tsx` (Service List Pages)**
- **Functions Used:** `getCityData()`, `getNearbyLocations()`, `getAllActiveServices()`, `getModelsForService()`
- **Status:** 🟡 PARTIALLY BROKEN
- **Issues:**
  - `getAllActiveServices()` has array handling issues in joins
  - `getModelsForService()` complex join logic may fail
  - Services lack display metadata
- **User Impact:** Service lists may show incomplete data

#### 5. **`src/pages/locations/[city].tsx` (City Pages)**
- **Functions Used:** `getCityData()`, `getAllActiveCities()`
- **Status:** ✅ MOSTLY WORKING
- **Issues:** Minor - `city` vs `city_name` mapping
- **User Impact:** Minimal, pages load correctly

#### 6. **`src/pages/locations/[city]/[neighborhood].tsx` (Neighborhood Pages)**
- **Functions Used:** `getNeighborhoodData()`, `getRelatedNeighborhoods()`, `getAllNeighborhoodPaths()`
- **Status:** ✅ MOSTLY WORKING
- **Issues:** Minor field mapping in testimonials JSONB
- **User Impact:** Pages load, minor data inconsistencies

#### 7. **`src/components/seo/NearbyCities.tsx`**
- **Functions Used:** `getNearbyLocations()`
- **Status:** ✅ WORKING
- **Issues:** None
- **User Impact:** None, SEO links display correctly

#### 8. **`src/pages/api/test-data-service.ts` (Internal API)**
- **Functions Used:** All core functions
- **Status:** 🔴 TEST ENDPOINT - Will expose all errors
- **Issues:** Every mismatch will cause test failures
- **User Impact:** Internal only

---

## PART 4: GAP ANALYSIS TABLE

### Side-by-Side Comparison: Code Logic vs Required Schema Logic

#### **Function: getPricingData()**

| Aspect | Current Code Logic | Required Schema Logic | Fix Required |
|--------|-------------------|----------------------|--------------|
| Device Model FK | `device_models.device_type_id` | `device_models.type_id` | ✅ Yes |
| Join Strategy | Multiple queries | Could use single query with proper joins | 🟡 Optimize |
| Safety Check | 10% deviation check ✅ | Keep this | ✅ No |
| Caching | 5min TTL ✅ | Keep this | ✅ No |

#### **Function: getPopularServices()**

| Aspect | Current Code Logic | Required Schema Logic | Fix Required |
|--------|-------------------|----------------------|--------------|
| Popularity Filter | Queries `is_popular` field | Field doesn't exist | ✅ Yes |
| Sorting | Uses `sort_order` | Field doesn't exist | ✅ Yes |
| Price Display | Generates from hardcoded map | No `base_price` in services | ✅ Yes |
| Fallback Logic | ✅ Solid | Keep | ✅ No |

#### **Function: getTestimonials()**

| Aspect | Current Code Logic | Required Schema Logic | Fix Required |
|--------|-------------------|----------------------|--------------|
| Customer Name | Maps `customer_name` ✅ | Correct | ✅ No |
| Comment Field | Maps `comment` | Should map `review` | ✅ Yes |
| Device Field | Maps `device` | Should map `device_model` | ✅ Yes |
| Location Field | Maps `location` | Should map `city` | ✅ Yes |
| Featured Filter | Uses `is_featured` ✅ | Correct | ✅ No |

#### **Function: getServicesByDeviceType()**

| Aspect | Current Code Logic | Required Schema Logic | Fix Required |
|--------|-------------------|----------------------|--------------|
| Device Type Lookup | Queries by `name` ✅ | Correct | ✅ No |
| Service Query | Uses `device_type_id` ✅ | Correct | ✅ No |
| Popular Flag | Reads `is_popular` | Field doesn't exist | ✅ Yes |
| Limited Flag | Reads `is_limited` | Field doesn't exist | ✅ Yes |
| Base Price | Reads `base_price` from services | Field doesn't exist | ✅ Yes |
| Safety Check | 10% deviation ✅ | Keep | ✅ No |

#### **Function: getBrandsByDeviceType()**

| Aspect | Current Code Logic | Required Schema Logic | Fix Required |
|--------|-------------------|----------------------|--------------|
| Device Type FK | Queries `brands.device_type_id` | Column doesn't exist | 🔴 CRITICAL |
| Display Name | Uses `display_name` | Should use `name` | ✅ Yes |
| Sorting | Uses `sort_order` | Field doesn't exist | ✅ Yes |
| **MAJOR ISSUE** | Brands table has no device type relationship | Need to join through device_models | 🔴 CRITICAL |

#### **Function: getDynamicPricing()**

| Aspect | Current Code Logic | Required Schema Logic | Fix Required |
|--------|-------------------|----------------------|--------------|
| City Price Adjustment | Reads `price_adjustment_percentage` | Column doesn't exist | ✅ Yes |
| Discounted Price | Uses `discounted_price` | Should use `compare_at_price` | ✅ Yes |
| Service/Model Joins | Complex nested queries | Working but verbose | 🟡 Optimize |
| Fallback Logic | ✅ Solid | Keep | ✅ No |

---

## PART 5: BROKEN DATA FLOWS

### User-Facing Dynamic Features Currently Non-Functional:

1. **Homepage Popular Services Section**
   - **Expected:** Top 4 services from database with real pricing
   - **Actual:** Hardcoded static services with generic prices
   - **Root Cause:** Missing `is_popular`, `sort_order`, `base_price` columns

2. **Homepage Testimonials Carousel**
   - **Expected:** Featured reviews from database
   - **Actual:** Static testimonials or broken mapping
   - **Root Cause:** Field name mismatches (comment/review, device/device_model, location/city)

3. **Service Page Brand Logos**
   - **Expected:** Dynamic list of supported brands with logos
   - **Actual:** Empty or falls back to hardcoded list
   - **Root Cause:** `brands.device_type_id` column doesn't exist, no brand-device relationship

4. **Service Page Service List**
   - **Expected:** Complete service details with doorstep eligibility, popularity badges
   - **Actual:** Basic service list without metadata
   - **Root Cause:** Missing `is_popular`, `is_limited` columns

5. **City-Specific Pricing**
   - **Expected:** Vancouver prices differ from Surrey based on location
   - **Actual:** All cities show same pricing
   - **Root Cause:** Missing `price_adjustment_percentage` column

6. **Discount/Sale Pricing**
   - **Expected:** Show original and sale price
   - **Actual:** Only base price shown
   - **Root Cause:** `discounted_price` column doesn't exist (should use `compare_at_price`)

---

## PART 6: MIGRATION ROADMAP

### Priority 1: CRITICAL - Immediate Database Schema Fixes (Day 1)

#### Migration 1: Add Missing Service Metadata Columns
```sql
-- File: supabase/migrations/20260130_add_service_metadata.sql

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_limited BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS base_price NUMERIC(10,2);

COMMENT ON COLUMN services.is_popular IS 'Featured on homepage and prominently displayed';
COMMENT ON COLUMN services.is_limited IS 'Limited doorstep availability, needs diagnostic';
COMMENT ON COLUMN services.sort_order IS 'Display order (lower = earlier)';
COMMENT ON COLUMN services.base_price IS 'Starting price for display purposes';

-- Update existing data with sensible defaults
UPDATE services SET sort_order = id::integer WHERE sort_order = 0;
UPDATE services SET is_popular = true WHERE name IN ('screen-replacement', 'battery-replacement') AND is_active = true;
```

#### Migration 2: Add Brands Display Name
```sql
-- File: supabase/migrations/20260130_add_brand_display_name.sql

ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS display_name TEXT;

COMMENT ON COLUMN brands.display_name IS 'Human-friendly display name for UI';

-- Populate display_name from name for existing records
UPDATE brands SET display_name = name WHERE display_name IS NULL;
```

#### Migration 3: Add Models Display Name
```sql
-- File: supabase/migrations/20260130_add_model_display_name.sql

ALTER TABLE device_models
  ADD COLUMN IF NOT EXISTS display_name TEXT;

COMMENT ON COLUMN device_models.display_name IS 'Human-friendly display name for UI';

-- Populate display_name from name
UPDATE device_models SET display_name = name WHERE display_name IS NULL;
```

#### Migration 4: Add Location Price Adjustment
```sql
-- File: supabase/migrations/20260130_add_price_adjustment.sql

ALTER TABLE service_locations
  ADD COLUMN IF NOT EXISTS price_adjustment_percentage NUMERIC(5,2) DEFAULT 0.00;

COMMENT ON COLUMN service_locations.price_adjustment_percentage IS 'Price adjustment for this location (+10 = 10% higher, -5 = 5% discount)';

-- Set initial adjustments based on city
UPDATE service_locations 
SET price_adjustment_percentage = CASE
  WHEN city_name = 'Vancouver' THEN 10.00  -- Premium
  WHEN city_name = 'West Vancouver' THEN 15.00  -- Highest
  WHEN city_name = 'North Vancouver' THEN 10.00
  WHEN city_name = 'Burnaby' THEN 0.00  -- Base rate
  WHEN city_name = 'Surrey' THEN -5.00  -- Slight discount
  ELSE 0.00
END
WHERE is_active = true;
```

#### Migration 5: Rename Dynamic Pricing Column
```sql
-- File: supabase/migrations/20260130_rename_pricing_column.sql

-- Add the expected column name
ALTER TABLE dynamic_pricing
  ADD COLUMN IF NOT EXISTS discounted_price NUMERIC(10,2);

-- Copy data from compare_at_price if it exists
UPDATE dynamic_pricing 
SET discounted_price = compare_at_price 
WHERE compare_at_price IS NOT NULL AND discounted_price IS NULL;

-- Optionally keep both columns for compatibility
COMMENT ON COLUMN dynamic_pricing.discounted_price IS 'Active sale/discounted price (shown to customers)';
COMMENT ON COLUMN dynamic_pricing.compare_at_price IS 'Original price for comparison (shows savings)';
```

### Priority 2: HIGH - Code Refactoring (Days 2-3)

#### Fix 1: Update getTestimonials() Function
```typescript
// In src/lib/data-service.ts line ~695

export async function getTestimonials(): Promise<typeof STATIC_TESTIMONIALS> {
  // ... existing cache check ...
  
  try {
    const supabase = getServiceSupabase();
    
    const { data, error: fetchError } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_featured', true)
      .order('featured_order', { ascending: true })  // Add ordering
      .order('created_at', { ascending: false })
      .limit(4);

    if (fetchError) {
      dataLogger.warn('Database error fetching testimonials, using static fallback', { error: fetchError.message });
      // ... fallback logic ...
    }

    // FIXED: Map database testimonials with correct column names
    const mappedTestimonials = data.map((testimonial, index) => ({
      id: testimonial.id || index + 1,
      name: testimonial.customer_name || 'Anonymous',
      location: testimonial.city || 'Vancouver',  // FIXED: city not location
      rating: testimonial.rating || 5,
      comment: testimonial.review || 'Great service!',  // FIXED: review not comment
      device: testimonial.device_model || 'Device'  // FIXED: device_model not device
    }));
    
    // ... rest of function ...
  }
}
```

#### Fix 2: Rewrite getBrandsByDeviceType() Function
```typescript
// In src/lib/data-service.ts line ~981

export async function getBrandsByDeviceType(deviceType: 'laptop' | 'mobile' | 'tablet'): Promise<string[]> {
  const cacheKey = deviceType as keyof typeof globalCache.deviceBrands;
  if (isCacheValid(globalCache.deviceBrands[cacheKey].timestamp)) {
    dataLogger.debug(`Returning cached ${deviceType} brands data`);
    return globalCache.deviceBrands[cacheKey].data!;
  }

  try {
    const supabase = getServiceSupabase();
    
    // FIXED: Get device type ID first
    const { data: deviceTypeData, error: deviceTypeError } = await supabase
      .from('device_types')
      .select('id')
      .eq('name', deviceType)
      .eq('is_active', true)
      .single();

    if (deviceTypeError || !deviceTypeData) {
      dataLogger.warn(`Device type ${deviceType} not found, using static fallback`);
      const staticData = getStaticBrandsByDeviceType(deviceType);
      globalCache.deviceBrands[cacheKey] = { data: staticData, timestamp: Date.now() };
      return staticData;
    }

    // FIXED: Query brands through device_models relationship
    // Since brands don't have device_type_id, we must join through models
    const { data, error } = await supabase
      .from('brands')
      .select(`
        id,
        name,
        logo_url,
        device_models!inner(type_id)
      `)
      .eq('is_active', true)
      .eq('device_models.type_id', deviceTypeData.id)
      .eq('device_models.is_active', true);

    if (error) {
      dataLogger.warn(`Database error fetching ${deviceType} brands, using static fallback`, { error: error.message });
      const staticData = getStaticBrandsByDeviceType(deviceType);
      globalCache.deviceBrands[cacheKey] = { data: staticData, timestamp: Date.now() };
      return staticData;
    }

    if (!data || data.length === 0) {
      dataLogger.info(`No ${deviceType} brands found in database, using static fallback`);
      const staticData = getStaticBrandsByDeviceType(deviceType);
      globalCache.deviceBrands[cacheKey] = { data: staticData, timestamp: Date.now() };
      return staticData;
    }

    // FIXED: Extract unique brand names (since join may create duplicates)
    const uniqueBrands = Array.from(new Set(data.map(brand => brand.name))).filter(Boolean);

    dataLogger.info(`Found ${uniqueBrands.length} unique ${deviceType} brands`, {
      brands: uniqueBrands.slice(0, 5)
    });
    
    globalCache.deviceBrands[cacheKey] = { data: uniqueBrands, timestamp: Date.now() };
    return uniqueBrands;

  } catch (error) {
    dataLogger.error(`Unexpected error fetching ${deviceType} brands, using static fallback`, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    const staticData = getStaticBrandsByDeviceType(deviceType);
    globalCache.deviceBrands[cacheKey] = { data: staticData, timestamp: Date.now() };
    return staticData;
  }
}
```

#### Fix 3: Update getPricingData() for Correct FK
```typescript
// In src/lib/data-service.ts line ~393

// FIXED: Change from device_models.device_type_id to device_models.type_id
const { data: deviceModels, error: modelsError } = await supabase
  .from('device_models')
  .select('id, type_id')  // FIXED: Changed from device_type_id to type_id
  .in('id', modelIds)
  .eq('is_active', true);

// ... later in the function ...

// FIXED: Update mapping to use type_id
const modelToDeviceTypeId: Record<number, number> = {};
for (const model of deviceModels) {
  modelToDeviceTypeId[model.id] = model.type_id;  // FIXED: Changed from device_type_id
}
```

#### Fix 4: Update getDynamicPricing() for Correct Column Names
```typescript
// In src/lib/data-service.ts line ~1359

// FIXED: Read price_adjustment_percentage (after migration)
try {
  const { data: cityData, error: cityError } = await supabase
    .from('service_locations')
    .select('price_adjustment_percentage')
    .ilike('city_name', citySlug.replace('-', ' '))
    .eq('is_active', true)
    .single();
  
  if (!cityError && cityData) {
    priceAdjustmentPercentage = parseFloat(cityData.price_adjustment_percentage as string) || 0;
  }
} catch (error) {
  // ... error handling ...
}

// ... later ...

// FIXED: Handle both discounted_price and compare_at_price
const pricing = pricingData[0];
let basePrice = parseFloat(pricing.base_price as string);
let discountedPrice = pricing.discounted_price 
  ? parseFloat(pricing.discounted_price as string) 
  : (pricing.compare_at_price ? parseFloat(pricing.compare_at_price as string) : undefined);
```

### Priority 3: MEDIUM - Data Population (Day 4)

#### Task 1: Populate Service Metadata
```sql
-- Set is_popular for top services
UPDATE services 
SET is_popular = true 
WHERE name IN ('screen-replacement', 'battery-replacement', 'charging-port-repair', 'water-damage-repair')
  AND is_active = true;

-- Set is_limited for diagnostic-heavy services
UPDATE services 
SET is_limited = true 
WHERE name LIKE '%water%' OR name LIKE '%motherboard%' OR name LIKE '%data-recovery%';

-- Set base prices (starting from lowest tier)
UPDATE services SET base_price = 79 WHERE name LIKE '%battery%';
UPDATE services SET base_price = 89 WHERE name LIKE '%screen%' AND device_type_id IN (SELECT id FROM device_types WHERE name = 'mobile');
UPDATE services SET base_price = 149 WHERE name LIKE '%screen%' AND device_type_id IN (SELECT id FROM device_types WHERE name = 'laptop');
UPDATE services SET base_price = 69 WHERE name LIKE '%charging%';
UPDATE services SET base_price = 49 WHERE name LIKE '%software%';
```

#### Task 2: Set Sort Orders
```sql
-- Homepage display order
UPDATE services SET sort_order = 1 WHERE name = 'screen-replacement' AND device_type_id IN (SELECT id FROM device_types WHERE name = 'mobile');
UPDATE services SET sort_order = 2 WHERE name = 'battery-replacement' AND device_type_id IN (SELECT id FROM device_types WHERE name = 'mobile');
UPDATE services SET sort_order = 3 WHERE name = 'screen-replacement' AND device_type_id IN (SELECT id FROM device_types WHERE name = 'laptop');
UPDATE services SET sort_order = 4 WHERE name = 'charging-port-repair';
```

### Priority 4: LOW - Optimization (Day 5)

#### Optimization 1: Add Database Indexes
```sql
-- Speed up common queries
CREATE INDEX IF NOT EXISTS idx_services_device_type_active ON services(device_type_id, is_active);
CREATE INDEX IF NOT EXISTS idx_services_popular_active ON services(is_popular, is_active) WHERE is_popular = true;
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_lookup ON dynamic_pricing(service_id, model_id, is_active);
CREATE INDEX IF NOT EXISTS idx_device_models_type ON device_models(type_id, is_active);
CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(is_active) WHERE is_active = true;
```

#### Optimization 2: Create Database View for Common Joins
```sql
-- Create a view for brand-device-type relationships
CREATE OR REPLACE VIEW brand_device_types AS
SELECT DISTINCT
  b.id as brand_id,
  b.name as brand_name,
  b.logo_url,
  dt.id as device_type_id,
  dt.name as device_type_name
FROM brands b
INNER JOIN device_models dm ON dm.brand_id = b.id
INNER JOIN device_types dt ON dt.id = dm.type_id
WHERE b.is_active = true 
  AND dm.is_active = true 
  AND dt.is_active = true;

-- Now getBrandsByDeviceType can query this view instead
```

---

## PART 7: TESTING CHECKLIST

### After Implementing Fixes:

- [ ] **Test 1:** Homepage loads with dynamic pricing data
- [ ] **Test 2:** Homepage shows 4 dynamic testimonials with correct field mapping
- [ ] **Test 3:** Homepage displays 4 popular services from database
- [ ] **Test 4:** Service pages (mobile-repair, laptop-repair, tablet-repair) load
- [ ] **Test 5:** Service pages show dynamic brand lists
- [ ] **Test 6:** Service pages show correct service metadata (popular badges, limited flags)
- [ ] **Test 7:** Repair pages show city-specific pricing (Vancouver 10% higher than Burnaby)
- [ ] **Test 8:** Repair pages show discounted prices where applicable
- [ ] **Test 9:** Sitemap generates with all dynamic services
- [ ] **Test 10:** ISR pages regenerate correctly after schema changes
- [ ] **Test 11:** Cache invalidation works (5min TTL)
- [ ] **Test 12:** Safety fallbacks activate if DB queries fail

### Test Script:
```bash
# Run test endpoint
curl http://localhost:3000/api/test-data-service

# Check logs for errors
tail -f logs/app.log | grep "data-service"

# Test specific functions
node scripts/test-data-service.js
```

---

## PART 8: RISK ASSESSMENT

### High Risk Changes:
1. **Brands Query Rewrite** - Complete logic change, could break service pages
   - **Mitigation:** Keep static fallback, test thoroughly before deploy
   
2. **Dynamic Pricing Column Rename** - Could affect booking system
   - **Mitigation:** Add both columns initially, migrate data, then deprecate old column
   
3. **Service Metadata Addition** - Changes service display logic
   - **Mitigation:** Default values ensure backward compatibility

### Medium Risk Changes:
1. **Testimonials Field Mapping** - Simple rename, low impact
2. **Price Adjustment Addition** - New feature, doesn't break existing
3. **Display Name Additions** - Optional fields with fallbacks

### Low Risk Changes:
1. **type_id FK Fix** - Simple column name correction
2. **Index Additions** - Performance only, no logic change
3. **Sort Order Addition** - Defaults to existing behavior

---

## CONCLUSION

The data-service layer requires **immediate attention** to restore dynamic functionality. The roadmap above provides a systematic approach to:

1. **Fix critical schema mismatches** through database migrations
2. **Update code logic** to match actual database structure  
3. **Populate missing data** to enable features
4. **Optimize performance** through indexes and views

**Estimated Total Implementation Time:** 3-5 days

**Expected Outcome:** Fully dynamic website with zero static fallbacks under normal operation.

---

## APPENDIX A: Quick Reference - Column Mappings

| Code References | Database Column | Table |
|----------------|-----------------|-------|
| `device_type_id` | `type_id` | device_models |
| `comment` | `review` | testimonials |
| `device` | `device_model` | testimonials |
| `location` | `city` | testimonials |
| `city` | `city_name` | service_locations |
| `discounted_price` | `compare_at_price` | dynamic_pricing |
| `display_name` | `name` | brands (after fix) |
| `display_name` | `name` | device_models (after fix) |

---

**Report End**
