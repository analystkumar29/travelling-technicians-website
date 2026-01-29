# Pricing Tiers Setup Guide

## 🎯 Overview

This guide will help you set up **Standard** and **Premium** pricing tiers in your database. After completing this, customers will be able to choose between:

- **Standard Quality** - Aftermarket parts, 3-month warranty
- **Premium Quality** - OEM (Original Equipment Manufacturer) parts, 6-month warranty

## 📋 What This Does

1. Adds a `pricing_tier` column to your `dynamic_pricing` table
2. Sets all existing 270 records to "standard" tier
3. Creates 270 duplicate "premium" records at 30% higher prices
4. Updates your pricing API to match on tier selection

## 🚀 Step-by-Step Instructions

### Step 1: Run the Migration Script

1. Open your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of:
   ```
   supabase/migrations/20260129014000_add_pricing_tiers.sql
   ```
6. Paste into the SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)
8. You should see:
   ```
   ✅ Migration completed successfully!
   Added columns: pricing_tier, part_quality, part_warranty_months, includes_installation
   All existing records set to "standard" tier
   ```

### Step 2: Run the Duplication Script

1. Still in **SQL Editor**, click **New Query** again
2. Copy the entire contents of:
   ```
   supabase/scripts/duplicate_premium_pricing.sql
   ```
3. Paste into the SQL Editor
4. Click **Run**
5. **IMPORTANT:** The script runs in a transaction and shows you:
   - How many records will be created
   - Sample premium pricing
   - Price comparisons

6. **Review the results** carefully:
   - Check if the prices look reasonable
   - Premium should be ~30% higher than standard
   
7. **If everything looks good:**
   ```sql
   COMMIT;
   ```
   
8. **If you want to undo:**
   ```sql
   ROLLBACK;
   ```

### Step 3: Verify the Results

Run this query to see your pricing tiers:

```sql
SELECT 
  b.name || ' ' || dm.name as device,
  s.name as service,
  dp.pricing_tier,
  dp.base_price,
  dp.part_quality,
  dp.part_warranty_months
FROM dynamic_pricing dp
JOIN device_models dm ON dp.model_id = dm.id
JOIN brands b ON dm.brand_id = b.id
JOIN services s ON dp.service_id = s.id
WHERE b.name = 'Apple' AND dm.name LIKE '%iPhone 15%'
ORDER BY device, service, pricing_tier;
```

Expected output:
```
device              | service              | pricing_tier | base_price | part_quality
--------------------|---------------------|--------------|------------|------------------
Apple iPhone 15     | screen-replacement  | standard     | 149.00     | Standard Quality
Apple iPhone 15     | screen-replacement  | premium      | 193.70     | Premium OEM Quality
```

## 📊 What Changed in Your Database

### Before
```
dynamic_pricing (270 rows):
- model_id
- service_id
- base_price
- compare_at_price
- is_active
```

### After
```
dynamic_pricing (540 rows):
- model_id
- service_id
- base_price
- compare_at_price
- is_active
- pricing_tier ← NEW (standard/premium)
- part_quality ← NEW (description)
- part_warranty_months ← NEW (3 or 6)
- includes_installation ← NEW (true)
```

## 💰 Pricing Strategy

The premium tier is set at **30% higher** than standard. You can adjust this by:

### Option 1: Bulk Update (All Premium Prices)
```sql
UPDATE dynamic_pricing
SET base_price = ROUND(base_price * 1.4, 2)  -- Change to 40% markup
WHERE pricing_tier = 'premium';
```

### Option 2: By Service Type
```sql
-- Screen replacements: 35% markup
UPDATE dynamic_pricing dp
SET base_price = ROUND(
  (SELECT base_price FROM dynamic_pricing std 
   WHERE std.model_id = dp.model_id 
   AND std.service_id = dp.service_id 
   AND std.pricing_tier = 'standard') * 1.35, 
  2
)
WHERE dp.pricing_tier = 'premium'
AND dp.service_id IN (
  SELECT id FROM services WHERE name LIKE '%screen%'
);
```

### Option 3: Individual Device
```sql
-- Premium iPhone 15 Pro Max screen: custom price
UPDATE dynamic_pricing dp
SET base_price = 249.99
WHERE dp.pricing_tier = 'premium'
AND dp.model_id = (
  SELECT id FROM device_models WHERE name = 'iPhone 15 Pro Max'
)
AND dp.service_id = (
  SELECT id FROM services WHERE name = 'screen-replacement'
);
```

## 🔍 Testing Your Setup

### Test 1: API Request (Standard Tier)
```
GET /api/pricing/calculate?deviceType=mobile&brand=apple&model=iPhone+15&service=screen-replacement&tier=standard
```

Expected: Standard price (~$149)

### Test 2: API Request (Premium Tier)
```
GET /api/pricing/calculate?deviceType=mobile&brand=apple&model=iPhone+15&service=screen-replacement&tier=premium
```

Expected: Premium price (~$194, which is 30% higher)

### Test 3: Check Logs
Look for in your dev server:
```
[DEBUG] Checking entry xyz:
  tierMatch: standard === standard = true ✅
```

## 🎨 UI Updates Needed

The booking form already supports tier selection, but you may want to enhance it:

### Show Part Quality Info
```tsx
{selectedTier === 'premium' && (
  <div className="text-sm text-green-600">
    ✅ Premium OEM Quality Parts
    ✅ 6-Month Warranty
    ✅ Faster Turnaround
  </div>
)}
```

### Price Comparison
```tsx
<div className="flex gap-4">
  <div className="tier-option">
    <h3>Standard</h3>
    <p>${standardPrice}</p>
    <p className="text-xs">Aftermarket parts, 3-mo warranty</p>
  </div>
  <div className="tier-option">
    <h3>Premium</h3>
    <p>${premiumPrice}</p>
    <p className="text-xs">OEM parts, 6-mo warranty</p>
  </div>
</div>
```

## 📈 Analytics Queries

### Most Popular Tier
```sql
SELECT 
  pricing_tier,
  COUNT(*) as bookings,
  AVG(quoted_price) as avg_price
FROM bookings
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY pricing_tier;
```

### Premium Tier Adoption Rate
```sql
SELECT 
  ROUND(
    COUNT(*) FILTER (WHERE pricing_tier = 'premium')::numeric / 
    COUNT(*)::numeric * 100, 
    2
  ) as premium_percentage
FROM bookings
WHERE created_at > NOW() - INTERVAL '30 days';
```

## ⚠️ Important Notes

1. **Backwards Compatible**: If `pricing_tier` is null, API defaults to 'standard'
2. **Safe to Run Multiple Times**: Scripts use `IF NOT EXISTS` checks
3. **Transaction Protected**: Duplication script can be rolled back
4. **Index Created**: Fast lookups on `pricing_tier` column
5. **View Created**: `pricing_tier_comparison` for easy comparison

## 🆘 Troubleshooting

### Issue: "Column already exists"
**Solution:** Migration was already run. Safe to skip Step 1.

### Issue: "Duplicate key violation"
**Solution:** Premium records already exist. Safe to skip Step 2.

### Issue: Prices not matching
**Solution:** Clear your browser cache and check which tier is being requested.

### Issue: API returning fallback pricing
**Solution:** Check that `pricing_tier` column exists and tier matching logic in logs.

## ✅ Success Checklist

- [ ] Migration completed without errors
- [ ] 540 total records in `dynamic_pricing` (270 standard + 270 premium)
- [ ] View `pricing_tier_comparison` exists
- [ ] API returns different prices for standard vs premium
- [ ] Tier matching works in logs (`tierMatch: standard === standard = true`)
- [ ] Booking form can select between tiers
- [ ] Customers see part quality information

---

**Need Help?** Check your server logs for detailed debugging information showing tier matching logic.
