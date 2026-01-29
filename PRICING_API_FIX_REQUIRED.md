# Pricing API Fix - Critical Issue Found

## Problem Summary

The pricing API cannot find matches because of a **fundamental mismatch** between how services are stored vs. how they're queried.

### The Mismatch

**What the API expects:**
- Service name: `"Screen Replacement (Premium)"` or `"Screen Replacement (Standard)"`
- Tiers built into the service name

**What the database has:**
- Service name: `"Screen Replacement"` (no tier suffix)
- Service slug: `"screen-replacement-mobile"` or `"screen-replacement-laptop"`
- Tier stored separately in `dynamic_pricing.pricing_tier` column

### Example Failure

**Request:** `GET /api/pricing/calculate?deviceType=mobile&brand=apple&model=iPhone 16 Pro Max&service=screen-replacement&tier=premium`

**What happens:**
1. API calls `getServiceNameWithTier('screen-replacement', 'premium')` 
2. Returns: `"Screen Replacement (Premium)"`
3. Tries to find service in DB with name = `"Screen Replacement (Premium)"`
4. **FAILS** because DB only has `"Screen Replacement"` (without tier)
5. Falls back to hardcoded pricing

### Additional Issues

1. **Missing Pricing Data**: iPhone 16 Pro Max only has "Battery Replacement" pricing, not "Screen Replacement"
2. **Service Slug Mismatch**: Form sends `screen-replacement` but DB has `screen-replacement-mobile`/`screen-replacement-laptop`

## The Fix

### Option A: Update Pricing API (Recommended)

Modify `src/pages/api/pricing/calculate.ts` to:
1. Match services by slug pattern, not exact name
2. Use `pricing_tier` column from `dynamic_pricing` table
3. Remove tier suffix from service name matching

**Changes needed:**
```typescript
// BEFORE (wrong approach)
const expectedServiceName = getServiceNameWithTier(service, tier);
const serviceMatch = service_info?.name === expectedServiceName;

// AFTER (correct approach) 
const serviceSlug = service; // e.g., 'screen-replacement'
const serviceMatch = service_info?.slug?.includes(serviceSlug) || 
                     service_info?.name?.toLowerCase().includes(serviceSlug.replace(/-/g, ' '));
const tierMatch = entry.pricing_tier === tier; // Match tier from pricing table
```

### Option B: Populate Database with Tier-Suffixed Services

Create services like:
- `"Screen Replacement (Standard)"` with slug `screen-replacement-standard-mobile`
- `"Screen Replacement (Premium)"` with slug `screen-replacement-premium-mobile`

**Problem:** This duplicates services and makes management harder.

## Missing Pricing Data

iPhone 16 models need pricing for Screen Replacement:

```sql
-- Get service IDs
SELECT id, name, slug FROM services WHERE name LIKE '%Screen%';
-- Result: screen-replacement-mobile id = 'fe2f8ab8-0632-4cfc-9464-cfce16bdf7d5'

-- Get iPhone 16 model IDs
SELECT id, name FROM device_models WHERE name LIKE '%iPhone 16%';
-- Results:
-- iPhone 16: be1021de-0a34-4d8b-ace8-dbc288b2d11e
-- iPhone 16 Plus: bc4419d4-722a-4760-a4de-12d45d614018
-- iPhone 16 Pro: 20f6908a-df93-4413-968f-87a636d6e208
-- iPhone 16 Pro Max: 02eac638-c145-4ab6-8e25-b65a2739623d

-- Add pricing for iPhone 16 Pro Max + Screen Replacement
INSERT INTO dynamic_pricing (model_id, service_id, base_price, compare_at_price, pricing_tier, is_active)
VALUES 
  -- Standard tier
  ('02eac638-c145-4ab6-8e25-b65a2739623d', 'fe2f8ab8-0632-4cfc-9464-cfce16bdf7d5', 299.00, 349.00, 'standard', true),
  -- Premium tier
  ('02eac638-c145-4ab6-8e25-b65a2739623d', 'fe2f8ab8-0632-4cfc-9464-cfce16bdf7d5', 399.00, 449.00, 'premium', true);
```

## Recommended Action Plan

1. **Fix the pricing API** to match services without tier suffixes
2. **Add missing pricing data** for iPhone 16 models + Screen Replacement
3. **Update service slug handling** to handle device-type suffixes

## Quick Fix SQL

Run this in Supabase SQL Editor to add missing iPhone 16 Screen Replacement pricing:

```sql
-- Add Screen Replacement pricing for all iPhone 16 models
WITH iphone_16_models AS (
  SELECT id, name FROM device_models 
  WHERE name LIKE '%iPhone 16%'
),
screen_service AS (
  SELECT id FROM services 
  WHERE slug = 'screen-replacement-mobile'
)
INSERT INTO dynamic_pricing (model_id, service_id, base_price, compare_at_price, pricing_tier, is_active)
SELECT 
  m.id,
  s.id,
  CASE m.name
    WHEN 'iPhone 16' THEN 279.00
    WHEN 'iPhone 16 Plus' THEN 289.00
    WHEN 'iPhone 16 Pro' THEN 299.00
    WHEN 'iPhone 16 Pro Max' THEN 309.00
  END as base_price,
  CASE m.name
    WHEN 'iPhone 16' THEN 329.00
    WHEN 'iPhone 16 Plus' THEN 339.00
    WHEN 'iPhone 16 Pro' THEN 349.00
    WHEN 'iPhone 16 Pro Max' THEN 359.00
  END as compare_at_price,
  tier,
  true
FROM iphone_16_models m
CROSS JOIN screen_service s
CROSS JOIN (VALUES ('standard'), ('premium')) AS t(tier)
WHERE NOT EXISTS (
  SELECT 1 FROM dynamic_pricing dp 
  WHERE dp.model_id = m.id 
    AND dp.service_id = s.id 
    AND dp.pricing_tier = t.tier
);

-- Verify
SELECT 
  dm.name as model,
  s.name as service,
  dp.pricing_tier as tier,
  dp.base_price
FROM dynamic_pricing dp
JOIN device_models dm ON dp.model_id = dm.id
JOIN services s ON dp.service_id = s.id
WHERE dm.name LIKE '%iPhone 16%'
  AND s.name LIKE '%Screen%'
ORDER BY dm.name, dp.pricing_tier;
```

## Testing

After fixes, test with:
```
GET /api/pricing/calculate?deviceType=mobile&brand=apple&model=iPhone%2016%20Pro%20Max&service=screen-replacement&tier=premium
```

Expected: Should return pricing from database, not fallback.

---

**Status**: 🔴 Critical - Pricing API cannot match database services  
**Impact**: All pricing requests fall back to hardcoded values  
**Priority**: High - Needs immediate fix
