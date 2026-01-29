# Pricing Display During Booking - Complete Documentation

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Component Hierarchy](#component-hierarchy)
3. [Step-by-Step Process Flow](#step-by-step-process-flow)
4. [Technical Implementation Details](#technical-implementation-details)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [User Experience Flow](#user-experience-flow)
8. [Code Examples](#code-examples)

---

## System Architecture Overview

The pricing display system is a real-time, dynamic pricing engine that calculates and displays repair costs during the booking process. It uses:

- **React Query** for data fetching and caching
- **Supabase** for database queries
- **Next.js API Routes** for server-side calculations
- **TypeScript** for type safety
- **Custom hooks** for reusable pricing logic

### High-Level Data Flow

```
User Selection → React Components → Custom Hooks → API Endpoint → Database Lookup → Price Calculation → UI Display
```

---

## Component Hierarchy

```
BookingForm (Main Container)
├── Step 0: Device Type Selection
│   └── Brand & Model Selection
│
├── Step 1: Service & Pricing (MERGED STEP)
│   ├── Service Selection (Dynamic from DB)
│   ├── Tier Selection (Standard/Premium)
│   └── TierPriceComparison Component
│       ├── usePriceCalculation (standard)
│       └── usePriceCalculation (premium)
│
├── Step 2-4: Contact, Location, Appointment
│
└── Step 5: Confirmation
    └── PriceDisplay Component (Final Summary)
        └── usePriceCalculation (selected tier)
```

---

## Step-by-Step Process Flow

### Step 1: Service Details & Tier Selection (Merged Step)

This is where pricing is first calculated and displayed to the user.

#### 1.1 User Selects Services

**Location:** `src/components/booking/BookingForm.tsx` - `renderServiceDetailsAndTierStep()`

```typescript
// Services are dynamically loaded from database
const { data: servicesData, isLoading: servicesLoading } = useServices(deviceType || 'mobile');

// User can select multiple services
<Controller
  name="serviceType"
  control={methods.control}
  rules={{ required: "Please select at least one service" }}
  render={({ field }) => (
    // Multiple service selection checkboxes
  )}
/>
```

**Data Source:** `services` table in Supabase (filtered by `device_type_id`)

#### 1.2 User Selects Pricing Tier

**Options:**
- **Standard Repair**: 3-month warranty, 24-48 hour turnaround, quality parts
- **Premium Service**: 6-month warranty, 12-24 hour turnaround, premium parts

```typescript
<Controller
  name="pricingTier"
  control={methods.control}
  rules={{ required: "Please select a service tier" }}
  render={({ field }) => (
    <input
      type="radio"
      value="standard" // or "premium"
      checked={field.value === 'standard'}
      onChange={() => field.onChange('standard')}
    />
  )}
/>
```

#### 1.3 Real-Time Price Comparison Displayed

**Component:** `TierPriceComparison.tsx`

This component:
1. Makes TWO simultaneous price calculations (standard + premium)
2. Displays side-by-side comparison
3. Shows savings and feature differences

```typescript
// src/components/booking/TierPriceComparison.tsx

const standardPricing = usePriceCalculation({
  deviceType,
  brand,
  model,
  services,
  tier: 'standard',
  postalCode,
  enabled
});

const premiumPricing = usePriceCalculation({
  deviceType,
  brand,
  model,
  services,
  tier: 'premium',
  postalCode,
  enabled
});

// Display both prices with comparison
```

**Visual Display:**
```
┌─────────────────────────────────────────────────┐
│  Tier Pricing Comparison                        │
├─────────────────────┬───────────────────────────┤
│ Standard Repair     │ Premium Service           │
│ $149.00             │ $189.00                   │
│ • 3-Month Warranty  │ • 6-Month Warranty        │
│ • 24-48 Hours       │ • 12-24 Hours             │
│ • Quality Parts     │ • Premium Parts           │
└─────────────────────┴───────────────────────────┘
  Premium costs $40.00 extra for 2x warranty
```

---

### Step 2: Price Calculation Logic

#### 2.1 Custom Hook: `usePriceCalculation`

**Location:** `src/hooks/usePriceCalculation.ts`

This hook uses `useCalculatePrice` from `useBookingData.ts`:

```typescript
// src/hooks/useBookingData.ts

export function useCalculatePrice(
  modelId: string,
  serviceIds: string[],
  locationId: string,
  tier: 'standard' | 'premium' = 'standard',
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['pricing', 'calculate', modelId, serviceIds, locationId, tier],
    queryFn: async () => {
      const response = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: modelId,
          service_ids: serviceIds,
          location_id: locationId,
          tier: tier
        })
      });
      
      if (!response.ok) throw new Error('Failed to calculate price');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: options?.enabled !== false
  });
}
```

#### 2.2 API Endpoint: `/api/pricing/calculate`

**Location:** `src/pages/api/pricing/calculate.ts`

**Process:**
1. Receives: `model_id`, `service_ids[]`, `location_id`, `tier`
2. Looks up device model in `device_models` table
3. For each service:
   - Finds pricing in `dynamic_pricing` table
   - Matches by: `model_id` + `service_id` + `pricing_tier`
   - Applies location adjustments if applicable
4. Calculates totals and returns structured response

**Database Query Example:**
```sql
SELECT 
  dp.*,
  s.name as service_name,
  s.display_name as service_display_name,
  pt.name as tier_name,
  pt.display_name as tier_display_name
FROM dynamic_pricing dp
JOIN services s ON dp.service_id = s.id
JOIN pricing_tiers pt ON dp.pricing_tier = pt.name
WHERE 
  dp.model_id = $1 
  AND dp.service_id = ANY($2)
  AND dp.pricing_tier = $3
  AND dp.is_active = true
```

**Response Structure:**
```json
{
  "success": true,
  "calculations": [
    {
      "service": {
        "id": "uuid",
        "name": "screen-replacement-standard",
        "display_name": "Screen Replacement (Standard)",
        "warranty_period_days": 90
      },
      "device": {
        "model_id": "uuid",
        "model": "iPhone 13 Pro",
        "brand": "Apple"
      },
      "tier": {
        "name": "standard",
        "display_name": "Standard Repair",
        "estimated_delivery_hours": 48
      },
      "pricing": {
        "base_price": 149.00,
        "discounted_price": null,
        "final_price": 149.00,
        "savings": 0
      },
      "location": {
        "name": "Vancouver",
        "adjustment_percentage": 0
      }
    }
  ],
  "total_price": 149.00,
  "currency": "CAD"
}
```

---

### Step 3: Price Display in UI

#### 3.1 TierPriceComparison Component

**Features:**
- Side-by-side tier comparison
- Real-time calculations
- Loading states
- Error handling
- Savings calculations
- Feature comparison matrix

**Visual Elements:**
- Price badges
- Warranty duration
- Turnaround time
- Parts quality indicators
- Savings/difference display

#### 3.2 PriceDisplay Component

**Location:** `src/components/booking/PriceDisplay.tsx`

**Used in:**
- Service selection step (preview)
- Confirmation step (final summary)

**Features:**
- Detailed breakdown per service
- Multiple service support
- Discount display (if applicable)
- Location adjustments shown
- Warranty information
- What's included section

**Visual Structure:**
```
┌──────────────────────────────────────────┐
│ 💰 Service Pricing                       │
├──────────────────────────────────────────┤
│ Screen Replacement (Standard)            │
│ Apple iPhone 13 Pro • Standard Repair    │
│                               $149.00     │
│                                          │
│ ⏱ 48h turnaround  🛡️ 90 day warranty    │
│                                          │
│ 🎁 You save $0.00!                       │
├──────────────────────────────────────────┤
│ ℹ️ Price includes:                       │
│  • Free diagnostics and assessment       │
│  • Quality parts and professional service│
│  • Free doorstep pickup and delivery     │
│  • 3-month warranty                      │
└──────────────────────────────────────────┘
```

---

### Step 4: Price Storage on Booking Submission

When user submits the booking, the quoted price is captured and saved.

#### 4.1 Form Submission

**Location:** `src/components/booking/BookingForm.tsx`

```typescript
// Watch form values
const deviceType = methods.watch('deviceType');
const deviceBrand = methods.watch('deviceBrand');
const deviceModel = methods.watch('deviceModel');
const serviceType = methods.watch('serviceType');
const pricingTier = methods.watch('pricingTier');

// Get real-time pricing data
const { data: pricingData } = useCalculatePrice(
  selectedModelId,
  Array.isArray(serviceType) ? serviceType : [serviceType],
  selectedLocationId || '00000000-0000-0000-0000-000000000001',
  pricingTier || 'standard',
  { enabled: !!(selectedModelId && serviceType) }
);

// On submission, include quoted_price
const handleFinalSubmit = async () => {
  const data = methods.getValues();
  
  const processedData: CreateBookingRequest = {
    ...data,
    brand: data.deviceBrand === 'other' ? data.customBrand : data.deviceBrand,
    model: data.deviceModel,
    quoted_price: pricingData?.final_price ?? undefined // ✅ Add quoted price
  };
  
  await handleSubmit(processedData);
};
```

#### 4.2 API Saves to Database

**Location:** `src/pages/api/bookings/create.ts`

```typescript
// Map to bookings table schema
const dbFieldsOnly = {
  booking_ref: referenceNumber,
  customer_name: finalBookingData.customer_name,
  customer_email: finalBookingData.customer_email,
  customer_phone: finalBookingData.customer_phone,
  customer_address: finalBookingData.address,
  model_id: modelId,
  service_id: serviceId,
  scheduled_at: appointmentTimestamp,
  quoted_price: bookingData.quoted_price ?? null, // ✅ Save quoted price
};

// Insert into database
const { data: booking, error } = await supabase
  .from('bookings')
  .insert(dbFieldsOnly)
  .select()
  .single();
```

**Database Column:**
```sql
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS quoted_price DECIMAL(10,2);
```

---

## Technical Implementation Details

### React Query Caching Strategy

```typescript
// Cache Configuration
{
  staleTime: 5 * 60 * 1000,  // 5 minutes - data stays fresh
  cacheTime: 10 * 60 * 1000, // 10 minutes - cache persists
  enabled: true,              // Auto-fetch when params ready
  refetchOnWindowFocus: false // Don't refetch on focus
}
```

**Benefits:**
- Reduces API calls
- Instant price updates when switching tiers
- Better performance
- Reduced server load

### UUID Tracking

The system tracks UUIDs throughout the flow:

```typescript
// State management
const [selectedModelId, setSelectedModelId] = useState<string>('');
const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
const [selectedLocationId, setSelectedLocationId] = useState<string>('');

// On model selection
const selectedModel = modelsData?.find(m => m.name === e.target.value);
if (selectedModel) {
  setSelectedModelId(selectedModel.id);
}
```

### Error Handling

```typescript
if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return (
    <ErrorDisplay message="Unable to calculate pricing at this time" />
  );
}

if (calculations.length === 0) {
  return null; // Gracefully hide if no data
}
```

### Loading States

```typescript
// Skeleton loader during price calculation
<div className="animate-pulse flex space-x-4">
  <div className="flex-1 space-y-2">
    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
  </div>
</div>
```

---

## Database Schema

### Key Tables Involved

#### 1. `device_models`
```sql
CREATE TABLE device_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand_id UUID REFERENCES brands(id),
  type_id UUID REFERENCES device_types(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. `services`
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT,
  device_type_id UUID REFERENCES device_types(id),
  category_id UUID REFERENCES service_categories(id),
  is_doorstep_eligible BOOLEAN DEFAULT true,
  warranty_period_days INTEGER DEFAULT 90,
  is_active BOOLEAN DEFAULT true
);
```

#### 3. `dynamic_pricing`
```sql
CREATE TABLE dynamic_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID REFERENCES device_models(id),
  service_id UUID REFERENCES services(id),
  pricing_tier TEXT DEFAULT 'standard',
  base_price DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  effective_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(model_id, service_id, pricing_tier)
);
```

#### 4. `pricing_tiers`
```sql
CREATE TABLE pricing_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL, -- 'standard' or 'premium'
  display_name TEXT NOT NULL,
  warranty_months INTEGER NOT NULL,
  estimated_delivery_hours INTEGER,
  is_active BOOLEAN DEFAULT true
);
```

#### 5. `bookings`
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_ref TEXT UNIQUE NOT NULL,
  model_id UUID REFERENCES device_models(id),
  service_id UUID REFERENCES services(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  quoted_price DECIMAL(10,2), -- ✅ Stores the price shown to customer
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints

### POST `/api/pricing/calculate`

**Request:**
```json
{
  "model_id": "uuid-of-device-model",
  "service_ids": ["uuid1", "uuid2"],
  "location_id": "uuid-of-location",
  "tier": "standard"
}
```

**Response:**
```json
{
  "success": true,
  "calculations": [...],
  "total_price": 149.00,
  "currency": "CAD"
}
```

### POST `/api/bookings/create`

**Request:**
```json
{
  "deviceType": "mobile",
  "deviceBrand": "apple",
  "deviceModel": "iPhone 13 Pro",
  "serviceType": ["screen-replacement"],
  "pricingTier": "standard",
  "quoted_price": 149.00, // ✅ Included from pricing calculation
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  // ... other booking fields
}
```

---

## User Experience Flow

### Visual Timeline

```
User Journey Through Pricing:

1. Select Device (Step 0)
   ↓
2. Select Services (Step 1)
   ↓ [Pricing loads automatically]
3. View Tier Comparison
   - Standard: $149
   - Premium: $189
   ↓ [User selects tier]
4. See Price Breakdown
   - Service: $149
   - Warranty: 3 months
   - Time: 24-48h
   ↓
5. Continue to Contact Info
   ↓
6. Confirm Booking (Step 5)
   - Final price shown: $149
   - "You'll be charged $149 at service time"
   ↓
7. Submit → Price stored in database
```

### Key UX Features

1. **Instant Feedback**: Price updates immediately on selection
2. **Transparency**: Full breakdown shown before commitment
3. **Comparison**: Side-by-side tier comparison helps decision
4. **No Surprises**: Price locked at time of booking
5. **Clear Communication**: What's included listed explicitly

---

## Code Examples

### Example 1: Using usePriceCalculation Hook

```typescript
import { usePriceCalculation } from '@/hooks/usePriceCalculation';

function MyComponent() {
  const { 
    calculations, 
    totalPrice, 
    loading, 
    error 
  } = usePriceCalculation({
    deviceType: 'mobile',
    brand: 'apple',
    model: 'iPhone 13 Pro',
    services: ['screen-replacement'],
    tier: 'standard',
    postalCode: 'V6B1A1',
    enabled: true
  });

  if (loading) return <div>Calculating price...</div>;
  if (error) return <div>Error loading price</div>;

  return (
    <div>
      <h3>Total: ${totalPrice.toFixed(2)}</h3>
      {calculations.map(calc => (
        <div key={calc.service.id}>
          <p>{calc.service.display_name}</p>
          <p>${calc.pricing.final_price}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Manual API Call

```typescript
async function calculatePrice() {
  const response = await fetch('/api/pricing/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model_id: 'uuid-here',
      service_ids: ['uuid1', 'uuid2'],
      location_id: 'location-uuid',
      tier: 'premium'
    })
  });

  const data = await response.json();
  console.log('Total:', data.total_price);
  console.log('Breakdown:', data.calculations);
}
```

---

## Summary

The pricing display system provides:

✅ **Real-time calculation** based on device, service, and tier
✅ **Dynamic loading** from database (270+ pricing records)
✅ **Tier comparison** (Standard vs Premium side-by-side)
✅ **Multiple services** support with total calculation
✅ **Location adjustments** (if applicable)
✅ **Caching** via React Query (5-minute cache)
✅ **Error handling** with graceful fallbacks
✅ **Price storage** in bookings table for reference
✅ **Transparent pricing** with full breakdown
✅ **UUID tracking** throughout the flow

The system ensures customers know exactly what they'll pay before committing to a booking, with all pricing stored for future reference and transparency.

---

**Last Updated:** January 29, 2026  
**Version:** 2.0 (Dynamic Pricing with Tier Support)
