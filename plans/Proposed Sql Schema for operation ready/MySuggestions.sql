-- =============================================================================
-- 1. ENABLE EXTENSION & SETUP
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 2. ENABLE RLS & CREATE POLICIES (Fixed)
-- =============================================================================
-- NOTE: These tables must already exist before running these commands

-- Check if tables exist before enabling RLS
DO $$ 
BEGIN
    -- Site settings
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'site_settings') THEN
        ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
        
        -- Drop policy if exists to avoid error
        DROP POLICY IF EXISTS "Public Read Settings" ON site_settings;
        CREATE POLICY "Public Read Settings" ON site_settings FOR SELECT USING (true);
    END IF;
    
    -- Testimonials
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'testimonials') THEN
        ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Public Read Testimonials" ON testimonials;
        CREATE POLICY "Public Read Testimonials" ON testimonials FOR SELECT USING (true);
    END IF;
    
    -- Payments (should NOT have public read - only authenticated users/admin)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
        ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
        -- Note: You'll need to add specific policies for payments based on your auth requirements
    END IF;
    
    -- FAQs
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'faqs') THEN
        ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Public Read FAQs" ON faqs;
        CREATE POLICY "Public Read FAQs" ON faqs FOR SELECT USING (true);
    END IF;
    
    -- Sitemap status (probably admin only)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sitemap_regeneration_status') THEN
        ALTER TABLE sitemap_regeneration_status ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- =============================================================================
-- 3. FIX PAYMENTS TABLE STRUCTURE (Critical!)
-- =============================================================================
-- Add missing currency column and fix constraints
DO $$ 
BEGIN
    -- Check if payments table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
        -- Add currency column if missing
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'payments' AND column_name = 'currency') THEN
            ALTER TABLE payments 
            ADD COLUMN currency TEXT DEFAULT 'CAD';
            
            -- Add check constraint
            ALTER TABLE payments 
            ADD CONSTRAINT payments_currency_check 
            CHECK (currency IN ('CAD', 'USD'));
        END IF;
        
        -- Remove duplicate foreign key constraint if exists
        ALTER TABLE payments DROP CONSTRAINT IF EXISTS fk_payments_booking;
        
        -- Add UNIQUE constraint for one-to-one relationship
        IF NOT EXISTS (
            SELECT FROM pg_constraint 
            WHERE conname = 'unique_booking_payment'
        ) THEN
            ALTER TABLE payments 
            ADD CONSTRAINT unique_booking_payment UNIQUE (booking_id);
        END IF;
        
        -- Remove payment_id from bookings to avoid circular dependency
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
            ALTER TABLE bookings 
            DROP CONSTRAINT IF EXISTS bookings_payment_id_fkey,
            DROP COLUMN IF EXISTS payment_id;
        END IF;
    END IF;
END $$;

-- =============================================================================
-- 4. FIX TECHNICIANS TABLE - ADD MISSING COLUMN
-- =============================================================================
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'technicians') THEN
        -- Add current_status column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'technicians' AND column_name = 'current_status') THEN
            ALTER TABLE technicians 
            ADD COLUMN current_status TEXT DEFAULT 'available';
        END IF;
    END IF;
END $$;

-- =============================================================================
-- 5. INSERT ESSENTIAL BUSINESS DATA (with ON CONFLICT handling)
-- =============================================================================

-- 1. SITE SETTINGS
INSERT INTO site_settings (key, value, description) VALUES
('business_name', 'Travelling Technicians', 'Your company name'),
('business_phone', '+1604XXXXXXX', 'Main contact number'),
('business_email', 'info@travelling-technicians.ca', 'Contact email'),
('whatsapp_business_number', '+1604XXXXXXX', 'WhatsApp Business API number'),
('business_hours', '{"weekdays": "9am-7pm", "weekends": "10am-5pm", "emergency": true}', 'Operating hours'),
('same_day_cutoff_time', '15:00:00', 'Last time for same-day bookings'),
('tax_rate', '0.12', 'BC GST+PST rate (12%)'),
('currency', 'CAD', 'Currency'),
('sms_enabled', 'true', 'SMS notifications'),
('email_enabled', 'true', 'Email notifications'),
('emergency_surcharge', '25.00', 'Emergency same-day fee'),
('base_travel_fee', '10.00', 'Base travel charge'),
('warranty_days', '90', 'Standard warranty period')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    description = EXCLUDED.description;

-- 2. SERVICE LOCATIONS
INSERT INTO service_locations (city_name, slug, base_travel_fee) VALUES
('Burnaby', 'burnaby', 0),
('Vancouver', 'vancouver', 0),
('Richmond', 'richmond', 10),
('North Vancouver', 'north-vancouver', 15),
('West Vancouver', 'west-vancouver', 20),
('New Westminster', 'new-westminster', 10),
('Surrey', 'surrey', 0),
('Delta', 'delta', 10),
('Langley', 'langley', 15),
('Abbotsford', 'abbotsford', 20),
('Squamish', 'squamish', 30),
('Chilliwack', 'chilliwack', 25)
ON CONFLICT (city_name) DO UPDATE SET 
    base_travel_fee = EXCLUDED.base_travel_fee,
    slug = EXCLUDED.slug;

-- 3. TECHNICIANS (Fixed - uses correct column names)
INSERT INTO technicians (full_name, whatsapp_number, current_status) VALUES
('Manoj Kumar', '+16045550001', 'available'),
('Manmohan Singh', '+16045550002', 'available'),
('Vishal Sharma', '+16045550003', 'available'),
('Kapil Sihag', '+16045550004', 'available'),
('Diwan Potlia', '+16045550005', 'available'),
('Vipin Sihag', '+16045550006', 'available'),
('Mohit Punia', '+16045550007', 'available')
ON CONFLICT (whatsapp_number) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    current_status = EXCLUDED.current_status;

-- 4. BRANDS
INSERT INTO brands (name, slug) VALUES 
('Apple', 'apple'),
('Samsung', 'samsung'),
('Google', 'google')
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name;

-- 5. DEVICE TYPES
INSERT INTO device_types (name, slug) VALUES 
('Smartphone', 'smartphone'),
('Laptop', 'laptop')
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name;

-- 6. SERVICES
INSERT INTO services (name, slug, description) VALUES 
('Screen Repair', 'screen-repair', 'Professional screen replacement with 90-day warranty'),
('Battery Replacement', 'battery-replacement', 'Original quality battery with 90-day warranty')
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 7. TESTIMONIALS
INSERT INTO testimonials (customer_name, city, rating, review, is_featured) VALUES
('Sarah Johnson', 'Vancouver', 5, 'Fast and professional service at my office! My iPhone screen looks brand new.', true),
('Michael Chen', 'Burnaby', 5, 'Technician arrived on time and fixed my Samsung in 30 minutes. Highly recommend!', true),
('Priya Patel', 'Surrey', 4, 'Great service for my Pixel phone. Will definitely use again.', true);

-- =============================================================================
-- 6. CREATE CRITICAL PERFORMANCE INDEXES
-- =============================================================================

-- Booking indexes
CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_ref ON bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
-- Fixed: Removed WHERE clause from partial index (simpler)
CREATE INDEX IF NOT EXISTS idx_bookings_technician ON bookings(technician_id);

-- WhatsApp dispatch indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_dispatches_status ON whatsapp_dispatches(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_dispatches_technician ON whatsapp_dispatches(technician_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_dispatches_booking ON whatsapp_dispatches(booking_id);

-- Dynamic pricing indexes (simplified without WHERE)
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_model_service ON dynamic_pricing(model_id, service_id);

-- SEO/Display indexes
CREATE INDEX IF NOT EXISTS idx_device_models_slug ON device_models(slug);
CREATE INDEX IF NOT EXISTS idx_service_locations_slug ON service_locations(slug);

-- Customer profiles index
CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON customer_profiles(phone);

-- Additional useful indexes
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- =============================================================================
-- 7. VERIFICATION QUERIES
-- =============================================================================

-- Verify tables and counts
SELECT 
    'site_settings' as table_name, 
    COUNT(*) as row_count 
FROM site_settings
UNION ALL
SELECT 'testimonials', COUNT(*) FROM testimonials
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'faqs', COUNT(*) FROM faqs
UNION ALL
SELECT 'sitemap_regeneration_status', COUNT(*) FROM sitemap_regeneration_status
ORDER BY table_name;

-- Verify payments table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;

-- Test payment insertion with a sample booking
DO $$ 
DECLARE 
    test_booking_id uuid;
BEGIN
    -- Get a test booking ID
    SELECT id INTO test_booking_id FROM bookings LIMIT 1;
    
    IF test_booking_id IS NOT NULL THEN
        -- Try to insert a test payment
        INSERT INTO payments (booking_id, amount, currency, payment_method, status)
        VALUES (
            test_booking_id,
            99.99,
            'CAD',
            'credit',
            'completed'
        )
        ON CONFLICT (booking_id) DO NOTHING;
        
        RAISE NOTICE 'Test payment inserted for booking ID: %', test_booking_id;
    ELSE
        RAISE NOTICE 'No bookings found to test payment insertion';
    END IF;
END $$;