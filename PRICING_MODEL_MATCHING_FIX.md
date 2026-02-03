# Pricing Model Matching Fix

**Date:** February 2, 2026  
**Issue:** Booking form showing incorrect pricing for iPhone 17 Screen Replacement

---

## Problem Summary

The booking form was displaying **$465** (premium) for iPhone 17 Screen Replacement, while the dynamic service page correctly showed **$379**.

### Root Cause

A bug in `/api/pricing/calculate.ts` allowed base models like "iPhone 17" to incorrectly match variant model pricing (e.g., "iPhone 17 Pro").

**The bug location:** The model matching algorithm only checked if the **search term** contained variant keywords (Pro/Pro Max/Plus), but NOT if the **database model** contained them.

### Buggy Code (Before Fix)
```javascript
// ONLY blocked when SEARCH had 'pro' but DB didn't
if ((isProMaxInSearch && !isProMaxInDb) || 
    (isProInSearch && !isProInDb) ||
    (isPlusInSearch && !isPlusInDb)) {
  modelMatch = false;
}
```

**Problem Flow:**
1. User searches for "iPhone 17" (premium tier)
2. `isProInSearch = false` (no "pro" in search)
3. The blocking condition doesn't trigger
4. Falls through to: `modelName.includes(searchModel)`
5. `"iphone 17 pro".includes("iphone 17")` = **TRUE** ❌
6. Returns iPhone 17 Pro's $465 instead of iPhone 17's $379

---

## Solution Applied

Changed the comparison from one-way to **bidirectional matching**:

### Fixed Code (After Fix)
```javascript
// Now checks BOTH directions - blocks cross-category matching in either direction
if ((isProMaxInSearch !== isProMaxInDb) || 
    (isProInSearch !== isProInDb) ||
    (isPlusInSearch !== isPlusInDb)) {
  modelMatch = false;
}
```

**This ensures:**
- "iPhone 17" does NOT match "iPhone 17 Pro" or "iPhone 17 Pro Max"
- "iPhone 17 Pro" does NOT match "iPhone 17" or "iPhone 17 Pro Max"
- "iPhone 17 Pro Max" does NOT match "iPhone 17" or "iPhone 17 Pro"

---

## Files Modified

| File | Change |
|------|--------|
| `src/pages/api/pricing/calculate.ts` | Fixed model matching algorithm for Apple iPhone and Samsung Galaxy models |

---

## Database Verification

The database already had correct pricing:

| Model | Standard | Premium |
|-------|----------|---------|
| iPhone 17 | $239 | $379 |
| iPhone 17 Pro | $278 | $465 |
| iPhone 17 Pro Max | $379 | $569 |

The `dynamic_routes` payload for `/repair/burnaby/screen-replacement-mobile/iphone-17` also has correct pricing:
- `standard_pricing.base_price`: $239
- `premium_pricing.base_price`: $379

---

## Testing

Run the test script to verify the fix:

```bash
# Start dev server first
npm run dev

# In another terminal, run tests
node test-pricing-model-matching.js
```

### Expected Test Results
```
✅ PASS: iPhone 17 Premium should be $379 (not $465 from Pro)
✅ PASS: iPhone 17 Standard should be $239 (not $278 from Pro)
✅ PASS: iPhone 17 Pro Premium should be $465
✅ PASS: iPhone 17 Pro Standard should be $278
✅ PASS: iPhone 17 Pro Max Premium should be $569
✅ PASS: iPhone 17 Pro Max Standard should be $379
```

---

## Impact Assessment

### Before Fix
- Booking form showed wrong prices for base iPhone models
- Users could be quoted $465 when actual price should be $379
- Potential customer confusion and trust issues

### After Fix
- Booking form correctly shows prices from database
- Base models (iPhone 17) return base model pricing
- Pro/Pro Max variants return variant-specific pricing
- Consistent pricing across dynamic pages AND booking form

---

## Additional Fixes Applied

The same bidirectional matching logic was also applied to **Samsung Galaxy models**:

```javascript
// Samsung: S24 won't match S24 Ultra and vice versa
if ((hasUltraInSearch !== hasUltraInDb) ||
    (hasPlusInSearch !== hasPlusInDb) ||
    (hasFeInSearch !== hasFeInDb)) {
  modelMatch = false;
}
```

---

## Prevention

To prevent similar issues in the future:

1. **Always use bidirectional matching** when comparing model variants
2. **Add test cases** for new model families when they're added
3. **Log matched models** in API responses for easier debugging

---

## Related Files

- `src/hooks/useBookingData.ts` - Calls the pricing API
- `src/hooks/usePriceCalculation.ts` - Price calculation hook
- `src/components/templates/ModelServicePage.tsx` - Dynamic service page (was already correct)
- `dynamic_routes.payload` - Pre-computed pricing (was already correct)
