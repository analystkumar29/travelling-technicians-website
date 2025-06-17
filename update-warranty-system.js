const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://lzgrpcgfcevmnrxbvpfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6Z3JwY2dmY2V2bW5yeGJ2cGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1Nzk0MzAsImV4cCI6MjA1MTE1NTQzMH0.OVcuvt5eNgYJ2rZvXn-F1S7aGlS9nDqGRqaEqZr1K_U';

console.log(`
📋 MANUAL DATABASE UPDATE INSTRUCTIONS

Since we cannot execute SQL directly via the API, please follow these steps to update your Supabase database:

1. 🔗 Go to your Supabase Dashboard: https://supabase.com/dashboard/project/lzgrpcgfcevmnrxbvpfw

2. 📊 Navigate to: SQL Editor

3. 🛠️  Execute the following SQL commands one by one:

=== STEP 1: Add pricing_tier column to bookings table ===
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS pricing_tier TEXT DEFAULT 'standard';
COMMENT ON COLUMN public.bookings.pricing_tier IS 'Pricing tier selected by customer: standard or premium';

=== STEP 2: Update warranty trigger function ===
CREATE OR REPLACE FUNCTION create_warranty_on_repair_completion()
RETURNS TRIGGER AS $$
DECLARE
    warranty_duration INTEGER := 90; -- Default 90 days warranty (Standard tier)
    warranty_code TEXT;
    booking_tier TEXT;
BEGIN
    -- Get the pricing tier from the booking
    SELECT pricing_tier INTO booking_tier
    FROM bookings 
    WHERE id = NEW.booking_id;
    
    -- Set warranty duration based on tier
    IF booking_tier = 'premium' THEN
        warranty_duration := 180; -- 6 months for Premium
    ELSE
        warranty_duration := 90;  -- 3 months for Standard (default)
    END IF;
    
    -- Generate unique warranty code
    warranty_code := 'WTY-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8));
    
    -- Insert warranty record
    INSERT INTO warranties (
        booking_id,
        warranty_code,
        start_date,
        end_date,
        warranty_period_days,
        warranty_status,
        created_at
    ) VALUES (
        NEW.booking_id,
        warranty_code,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '1 day' * warranty_duration,
        warranty_duration,
        'active',
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

=== STEP 3: Update pricing tiers (if using database-driven pricing) ===
UPDATE pricing_tiers 
SET 
    includes_features = ARRAY[
        '3-Month Warranty',
        'Quality Parts', 
        'Professional Service',
        'Free Pickup & Delivery (Doorstep)',
        'Free Diagnostics'
    ]
WHERE name = 'standard';

UPDATE pricing_tiers 
SET 
    includes_features = ARRAY[
        '6-Month Warranty',
        'Premium Parts',
        'Priority Service', 
        'Free Pickup & Delivery (Doorstep)',
        'Free Diagnostics',
        'Express Handling',
        'Quality Assurance Check'
    ],
    estimated_delivery_hours = 24
WHERE name = 'premium';

=== VERIFICATION ===
-- Check if pricing_tier column was added successfully:
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name = 'pricing_tier';

-- Test warranty trigger with sample data (optional):
-- INSERT INTO repair_completion (booking_id, completion_date) 
-- VALUES (1, NOW()) ON CONFLICT DO NOTHING;

=== COMPLETION ===
✅ After executing these SQL commands, your database will be updated with:
   - pricing_tier column in bookings table
   - Updated warranty system with dynamic warranty periods
   - Standard tier: 3 months warranty
   - Premium tier: 6 months warranty

💡 Remember to test the booking flow after these changes!
`);

// Test connection to ensure database is accessible
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n🔄 Testing database connection...');
    
    const { count, error } = await supabase
      .from('bookings')
      .select('count', { count: 'exact', head: true });
      
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful!');
    console.log(`📊 Current bookings count: ${count || 0}`);
    return true;
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

testConnection(); 