# Admin Panel Error Analysis & Fix Guide

## 🔴 ROOT CAUSE IDENTIFIED

### Primary Issue: Supabase Connection Failure
```
Error: TypeError: fetch failed
```

**Why:** The Next.js API route `/api/bookings` cannot connect to Supabase via the JavaScript client, even though:
- ✅ MCP direct SQL queries work perfectly
- ✅ Database has 26 bookings
- ✅ Database schema is correct

**Root Cause:** Supabase JavaScript client configuration issue in server-side API routes.

---

## 📊 DATABASE vs FRONTEND MISMATCH

### What Database Actually Has (Source of Truth)

**Bookings Table Columns:**
```sql
- id (uuid)
- booking_ref (text)
- customer_profile_id (uuid) - nullable
- customer_name (text)
- customer_phone (text)
- customer_email (text)
- customer_address (text)
- model_id (uuid) - FK to device_models
- service_id (uuid) - FK to services
- location_id (uuid) - FK to service_locations
- technician_id (uuid) - nullable
- quoted_price (numeric) - nullable
- final_price (numeric) - nullable
- travel_fee (numeric)
- scheduled_at (timestamptz) - appointment date/time
- is_repeat_customer (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)
- notified_at (timestamptz) - nullable
```

**Sample Data:**
```json
{
  "id": "bb69a6a1-bfcd-4a0d-8cee-cd1be39507b9",
  "booking_ref": "TEST-1769592436487",
  "customer_name": "Test Customer",
  "customer_phone": "123-456-7890",
  "customer_email": "test@example.com",
  "customer_address": "Test Address, T3ST",
  "model_id": "66d42f8b-8e2a-4b4d-bf1f-2f0b9498a382",
  "service_id": "0f08c64b-60aa-4ebf-b3ff-3c01c612815e",
  "location_id": "41568cf1-76ef-41a5-bffa-5e86a97642db",
  "scheduled_at": "2026-01-28 09:27:16.487+00",
  "travel_fee": "0.00",
  "is_repeat_customer": false
}
```

###  What Frontend Expects (Currently)

**Management Dashboard UI (`src/pages/management/bookings.tsx`):**
```typescript
booking.status              // ❌ NOT in database
booking.booking_date        // ❌ NOT in database (should use scheduled_at)
booking.booking_time        // ❌ NOT in database (should use scheduled_at)
booking.device_type         // ❌ NOT in database (denormalized)
booking.device_brand        // ❌ NOT in database (denormalized)
booking.device_model        // ❌ NOT in database (denormalized)
booking.service_type        // ❌ NOT in database (denormalized)
```

---

## 🛠️ FIXES REQUIRED

### Fix #1: Resolve Supabase Connection Error (CRITICAL)

**Problem:** `TypeError: fetch failed` when using Supabase JS client

**Solutions to Try:**

#### Option A: Check Environment Variables
```bash
# Verify these are set correctly in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

#### Option B: Fix Supabase Client Initialization
The issue might be in `/src/utils/supabaseClient.ts` - the service role client might not be properly configured for server-side API routes.

**Current Code Pattern:**
```typescript
const supabase = getServiceSupabase();
const { data, error } = await supabase.from('bookings').select('*');
```

**Test if this works:**
```typescript
// Try with explicit fetch
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

### Fix #2: Update Frontend to Match Database Schema

**Two Approaches:**

#### Approach A: Fetch Related Data with JOINs (Recommended)
Update `/api/bookings/index.ts` to fetch related data:

```typescript
const { data: bookings, error } = await supabase
  .from('bookings')
  .select(`
    *,
    device_model:device_models!model_id (
      name,
      brand:brands!brand_id (name),
      device_type:device_types!device_type_id (name)
    ),
    service:services!service_id (display_name),
    location:service_locations!location_id (*)
  `)
  .order('created_at', { ascending: false });

// Transform data
const transformedBookings = bookings?.map(b => ({
  ...b,
  device_type: b.device_model?.device_type?.name,
  device_brand: b.device_model?.brand?.name,
  device_model: b.device_model?.name,
  service_type: b.service?.display_name,
  booking_date: b.scheduled_at?.split('T')[0],
  booking_time: new Date(b.scheduled_at).toLocaleTimeString(),
  status: 'pending' // Default status (needs status field in DB)
}));
```

#### Approach B: Update Frontend to Use Database Fields
Update `src/pages/management/bookings.tsx` and `src/pages/management/index.tsx`:

```typescript
// Instead of:
booking.booking_date
booking.booking_time

// Use:
new Date(booking.scheduled_at).toLocaleDateString()
new Date(booking.scheduled_at).toLocaleTimeString()

// Instead of:
booking.device_brand
booking.device_model

// Use:
"Device ID: {booking.model_id}" (temporary)
// Then make separate API call to fetch device details
```

---

## 📝 IMMEDIATE ACTION PLAN

### Step 1: Fix Connection Error (5 min)
1. Check `.env.local` has valid Supabase credentials
2. Test Supabase client initialization
3. Add error logging to see exact fetch error

### Step 2: Choose Schema Approach (10 min)
**Option A:** Add missing columns to database (status, device_type, etc.)
- Pro: Faster queries (denormalized)
- Con: Data duplication

**Option B:** Fetch with JOINs and transform
- Pro: Normalized data
- Con: More complex queries

**Option C:** Update frontend to use existing schema
- Pro: No migration needed
- Con: Multiple API calls for related data

### Step 3: Implement Fix (30 min)
Based on chosen approach, update either:
- Database schema (migration)
- API route (JOINs + transformation)
- Frontend (use existing fields)

---

## 🎯 RECOMMENDED SOLUTION

**For Quick Fix (Production Ready):**

1. **Fix Connection Error** - Update `/src/utils/supabaseClient.ts`
2. **Use JOIN Approach** - Update `/api/bookings/index.ts` to fetch related data
3. **Add Status Field** - Small migration to add `status` column only

**Why:**
- ✅ Respects database as source of truth
- ✅ No major schema changes
- ✅ Production-ready in 30 minutes
- ✅ Proper data relationships maintained

---

## 📚 RELATED TABLES

**For Reference (via MCP):**

```sql
-- Device Models
SELECT * FROM device_models WHERE id = '66d42f8b-8e2a-4b4d-bf1f-2f0b9498a382';

-- Services  
SELECT * FROM services WHERE id = '0f08c64b-60aa-4ebf-b3ff-3c01c612815e';

-- Service Locations
SELECT * FROM service_locations WHERE id = '41568cf1-76ef-41a5-bffa-5e86a97642db';
```

---

## 🔧 TESTING CHECKLIST

- [ ] Environment variables are correct
- [ ] Supabase client connects successfully
- [ ] `/api/bookings` returns 200 status
- [ ] Management dashboard loads without errors
- [ ] Booking details show correct information
- [ ] No console errors in browser

---

## 📞 SUPPORT

If issues persist:
1. Check Supabase dashboard for API logs
2. Verify RLS policies allow service role access
3. Test direct SQL via MCP continues to work
4. Check network connectivity to Supabase

---

*Generated: 2026-01-29*
*Status: Ready for implementation*
