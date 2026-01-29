# Pricing Tiers Constraint Fix

## 🔧 Issue Found

You encountered this error:
```
ERROR: 23505: duplicate key value violates unique constraint 
"dynamic_pricing_model_id_service_id_key"
```

## 🎯 Root Cause

Your database had a **unique constraint** that prevented having multiple pricing records for the same `(model_id, service_id)` combination. Since we want **separate records** for standard vs premium tiers, this constraint was blocking the duplication script.

## ✅ Solution Applied

Updated the migration script to:

1. **Drop old constraint:**
   ```sql
   DROP CONSTRAINT dynamic_pricing_model_id_service_id_key
   ```

2. **Add new constraint with tier:**
   ```sql
   ADD CONSTRAINT dynamic_pricing_model_service_tier_key 
   UNIQUE (model_id, service_id, pricing_tier)
   ```

This allows:
- ✅ `iPhone 15 + Screen Replacement + Standard` 
- ✅ `iPhone 15 + Screen Replacement + Premium`
- ❌ `iPhone 15 + Screen Replacement + Standard` (duplicate - still prevented)

## 🚀 How to Proceed

### Option 1: Start Fresh (Recommended)

If you haven't committed any changes yet:

1. **Run the FIXED migration again:**
   - Open Supabase SQL Editor
   - Copy contents of `supabase/migrations/20260129014000_add_pricing_tiers.sql`
   - Paste and Run
   - This will now properly drop and recreate the constraint

2. **Then run the duplication script:**
   - Copy contents of `supabase/scripts/duplicate_premium_pricing.sql`
   - Paste and Run
   - Review results
   - Type `COMMIT;` if good

### Option 2: Manual Fix (If migration already partially ran)

Run these commands in Supabase SQL Editor:

```sql
-- 1. Drop the problematic constraint
ALTER TABLE dynamic_pricing
DROP CONSTRAINT IF EXISTS dynamic_pricing_model_id_service_id_key;

-- 2. Add new constraint with tier
ALTER TABLE dynamic_pricing
ADD CONSTRAINT dynamic_pricing_model_service_tier_key 
UNIQUE (model_id, service_id, pricing_tier);

-- 3. Verify constraint was added
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'dynamic_pricing'::regclass 
AND conname LIKE '%tier%';
```

Expected output:
```
conname: dynamic_pricing_model_service_tier_key
contype: u
pg_get_constraintdef: UNIQUE (model_id, service_id, pricing_tier)
```

### Option 3: Check Current State First

Before doing anything, check what constraints exist:

```sql
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'dynamic_pricing'::regclass 
AND contype = 'u';  -- u = unique constraint
```

Look for:
- ❌ `dynamic_pricing_model_id_service_id_key` - OLD (blocks tiers)
- ✅ `dynamic_pricing_model_service_tier_key` - NEW (allows tiers)

## 📊 After Fix - Expected Behavior

You should be able to run the duplication script and see:

```
Standard tier records: 270
Premium tier records:  270
Total pricing records: 540
```

## 🔍 Verify Success

Run this query:
```sql
SELECT 
  COUNT(*) FILTER (WHERE pricing_tier = 'standard') as standard_count,
  COUNT(*) FILTER (WHERE pricing_tier = 'premium') as premium_count,
  COUNT(*) as total_count
FROM dynamic_pricing;
```

Expected:
```
standard_count | premium_count | total_count
---------------|---------------|-------------
     270       |      270      |     540
```

## ⚠️ Important Notes

1. **Backwards Compatible**: If you run queries without tier, they'll still work (defaults to 'standard')
2. **No Data Loss**: The constraint fix doesn't delete any records
3. **Safe to Re-run**: Migration uses `IF NOT EXISTS` checks
4. **Transaction Protected**: Duplication script can be rolled back with `ROLLBACK;`

## 📝 Technical Details

### Old Schema
```
UNIQUE CONSTRAINT: (model_id, service_id)
Result: Only ONE price per device/service combo
```

### New Schema  
```
UNIQUE CONSTRAINT: (model_id, service_id, pricing_tier)
Result: Multiple prices per device/service (one per tier)
```

This is exactly what you need for Standard vs Premium pricing!

---

**Next Step:** Re-run the migration with the fixed constraint, then proceed with the duplication script.
