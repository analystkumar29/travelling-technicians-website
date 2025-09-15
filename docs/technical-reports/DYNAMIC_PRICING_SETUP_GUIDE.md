# Dynamic Pricing System Setup Guide

This guide walks you through setting up the complete dynamic pricing system for The Travelling Technicians website.

## 🎯 What This Setup Achieves

✅ **Dynamic Model Selection**: Replace hardcoded device models with database-driven selection  
✅ **Admin-Ready**: Admin can add new brands/models without code changes  
✅ **Real-time Updates**: New models appear immediately in booking form  
✅ **Professional Database Structure**: Normalized tables with proper relationships  
✅ **Backwards Compatible**: Current booking functionality remains unchanged  

## 📋 Prerequisites

- Supabase account with active project
- Environment variables set in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## 🚀 Step-by-Step Setup

### Step 1: Create Database Tables

1. **Open your Supabase SQL Editor**:
   - Go to your Supabase dashboard
   - Navigate to "SQL Editor" in the sidebar
   - Click "New Query"

2. **Copy and paste the entire content** from `database/create-dynamic-pricing-tables.sql`

3. **Run the SQL script** - this will:
   - Create 3 main tables: `device_types`, `brands`, `device_models`
   - Set up proper relationships and indexes
   - Configure Row Level Security (RLS) policies
   - Seed initial data with 100+ device models

4. **Verify success** - you should see:
   ```
   Dynamic Pricing Database Setup Complete! 🎉
   device_types_count: 3
   brands_count: 17
   models_count: 50+
   ```

### Step 2: Test Database Setup

Run the test script to verify everything works:

```bash
node scripts/test-dynamic-apis.js
```

**Expected output:**
```
🧪 Testing Dynamic Pricing APIs...

📋 Test 1: Checking database tables...
   ✅ device_types: 3 records
   ✅ brands: 17 records
   ✅ device_models: 50+ records

🏷️ Test 2: Testing brand fetching...
   ✅ Mobile brands: 6 found
       First brand: Apple
   ✅ Laptop brands: 6 found

📱 Test 3: Testing model fetching...
   ✅ Apple iPhone models: 20 found
       First model: iPhone 15 Pro Max
       Featured models: 8
   ✅ Apple MacBook models: 6 found

🔗 Test 4: Integration test...
   ✅ Device types available: mobile, laptop, tablet
   ✅ Mobile Phone brands: Apple, Samsung, Google
       └─ Apple models: iPhone 15 Pro Max, iPhone 15 Pro, iPhone 15
   ✅ Laptop brands: Apple, Dell, HP
       └─ Apple models: MacBook Pro 16" (M3 Pro/Max), MacBook Pro 14" (M3 Pro/Max), MacBook Air 15" (M3)
   ✅ Tablet brands: Apple, Samsung, Microsoft
       └─ Apple models: iPad Pro 12.9" (M2), iPad Pro 11" (M2), iPad Air (5th Gen)

🎉 All tests passed! Dynamic APIs are working correctly.
```

### Step 3: Test the APIs in Browser

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test the brand API**:
   ```
   http://localhost:3000/api/devices/brands?deviceType=mobile
   ```

3. **Test the model API**:
   ```
   http://localhost:3000/api/devices/models?deviceType=mobile&brand=apple
   ```

### Step 4: Test the Booking Form

1. **Visit the booking page**: `http://localhost:3000/booking`

2. **Test dynamic loading**:
   - Select "Mobile" as device type
   - Select "Apple" as brand
   - Verify models load dynamically from database
   - Try different device types and brands

## 📊 Database Schema Overview

### Tables Created

1. **`device_types`**: Mobile, Laptop, Tablet
2. **`brands`**: Apple, Samsung, Google, Dell, HP, etc. (by device type)
3. **`device_models`**: 50+ models with metadata (year, featured status, etc.)

### Key Features

- **Normalized Structure**: Proper foreign key relationships
- **Performance**: Optimized indexes on frequently queried fields
- **Security**: Row Level Security (RLS) policies
- **Extensible**: Easy to add more tables for pricing, services, etc.

## 🔄 How It Works

### Before (Static)
```javascript
// Hardcoded in DeviceModelSelector.tsx
const iPhoneModels = [
  'iPhone 15 Pro Max',
  'iPhone 15 Pro',
  // ... hardcoded list
];
```

### After (Dynamic)
```javascript
// Fetched from API
const { data: models } = await fetch(
  `/api/devices/models?deviceType=mobile&brand=apple`
);
```

### API Flow
1. **User selects device type** → Calls `/api/devices/brands`
2. **User selects brand** → Calls `/api/devices/models`
3. **Models populate dynamically** → Fresh from database

## 🎯 Next Steps for Admin Panel

The database is now ready for admin panel integration. You can add:

### Immediate Admin Features
1. **Add New Models**: Insert into `device_models` table
2. **Manage Brands**: Update `brands` table 
3. **Toggle Visibility**: Set `is_active` flag

### Future Pricing Features
The schema includes foundations for:
- **Service Categories**: Screen replacement, battery, etc.
- **Dynamic Pricing**: Model-specific pricing
- **Location Pricing**: Postal code adjustments
- **Tier Pricing**: Standard vs Premium service

## 🛠️ Troubleshooting

### Common Issues

**Issue**: "relation does not exist" error
- **Solution**: Make sure you ran the SQL script in Supabase SQL Editor

**Issue**: No models showing in dropdown
- **Solution**: Check browser console for API errors, verify RLS policies

**Issue**: "Missing Supabase credentials"
- **Solution**: Ensure `.env.local` has correct `SUPABASE_SERVICE_ROLE_KEY`

### Testing Commands

```bash
# Test database connection
node scripts/test-dynamic-apis.js

# Check if tables exist
# (Run in Supabase SQL Editor)
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('device_types', 'brands', 'device_models');
```

## 📈 Performance & Scalability

### Current Capacity
- **Device Types**: 3 (expandable)
- **Brands**: 17 (6 per device type + "Other")
- **Models**: 50+ (easily scalable to thousands)

### Optimization Features
- **Indexes**: Fast lookups by device type and brand
- **Caching**: API responses can be cached
- **Pagination**: Ready for large model catalogs

## 🎉 Success Verification

Your setup is complete when:

✅ SQL script runs without errors  
✅ Test script passes all checks  
✅ APIs return data in browser  
✅ Booking form loads models dynamically  
✅ New models can be added via database  

---

## 🔗 Files Created/Modified

- `database/create-dynamic-pricing-tables.sql` - Complete setup script
- `scripts/test-dynamic-apis.js` - Verification script  
- `src/components/booking/DeviceModelSelector.tsx` - Dynamic model fetching
- `src/pages/api/devices/brands.ts` - Brand API endpoint
- `src/pages/api/devices/models.ts` - Model API endpoint

**Your dynamic pricing foundation is now ready! 🚀** 