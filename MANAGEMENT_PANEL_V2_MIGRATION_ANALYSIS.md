# Management Panel V2 Schema Migration Analysis

**Date:** January 29, 2026  
**Status:** IDENTIFIED & READY FOR FIX

---

## 🔴 CRITICAL ISSUES FOUND

### **Issue 1: Brands API Using Old Schema**

**File:** `src/pages/api/management/brands.ts`

**Problem:**
- ❌ Trying to select `device_types!device_type_id` relationship that doesn't exist
- ❌ Accepting `device_type_id` in POST/PUT requests
- ❌ V2 brands table has NO `device_type_id` field

**V2 Brands Schema (ACTUAL):**
```
id (UUID)
name (text)
slug (text) 
logo_url (text, nullable)
is_active (boolean, default: true)
created_at (timestamp)
```

**Current API Trying To Use (WRONG):**
```javascript
// Line 78 - WRONG!
.select(`
  *,
  device_types!device_type_id(id, name, display_name)
`)

// Line 122 - WRONG!
const { name, display_name, device_type_id, is_active = true } = req.body;
```

**Why This Breaks:**
- Device relationships are through `device_models`, not brands
- `device_models` has: brand_id → brands.id AND type_id → device_types.id
- Brands are generic across all device types

---

### **Issue 2: Device-Models API is CORRECT ✅**

**File:** `src/pages/api/management/device-models.ts`

✅ Correctly uses V2 schema
✅ Properly links brands and device_types
✅ Uses correct relationships

---

## ✅ FIX PLAN

### **Step 1: Fix Brands API**

Remove all `device_type_id` references and simplify to match V2 schema:

**Changes needed:**
1. Remove `device_type_id` from GET select statement
2. Remove `device_type_id` validation from POST/PUT
3. Remove `device_type_id` from update data
4. Keep only: name, slug, logo_url, is_active

**Before (WRONG):**
```typescript
.select(`
  *,
  device_types!device_type_id(id, name, display_name)
`)
```

**After (CORRECT):**
```typescript
.select('*')
```

### **Step 2: Update Management Pages**

Ensure pages don't try to use non-existent fields

---

## 📊 V2 Schema Relationships

```
brands (generic)
  ↓
device_models (links brands to device_types)
  ├→ brand_id → brands.id ✅
  ├→ type_id → device_types.id ✅
  └→ linked to services via dynamic_pricing

services (linked to device_types)
  └→ device_type_id → device_types.id ✅

dynamic_pricing (the core of V2)
  ├→ model_id → device_models.id ✅
  ├→ service_id → services.id ✅
  └→ pricing_tier: 'standard'|'premium'|'economy'|'express' ✅
```

---

## 🎯 Root Cause

The brands API was written before the V2 schema migration completed. It assumes brands have device type relationships, but in V2:
- Brands are **independent** (no device type)
- Device models are the **junction table** between brands and device types
- This separation allows one brand to have models across multiple device types

---

## ✨ After Fix

Management panel will:
✅ Properly query V2 brands table
✅ Show brands without type filters
✅ Link brands to models correctly
✅ Display device information through models
✅ Use correct pricing tier structure

