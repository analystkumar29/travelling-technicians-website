-- =============================================================================
-- DATABASE FIXES SCRIPT FOR SUPABASE DASHBOARD
-- =============================================================================
-- Run this SQL in Supabase Dashboard > SQL Editor
-- This script applies:
-- 1. Performance indexes for query optimization
-- 2. Triggers for booking references and warranties
-- 3. Updated security policies
-- =============================================================================

-- SECTION 1: PERFORMANCE INDEXES
-- =============================================================================

-- Bookings table indexes
CREATE INDEX IF NOT EXISTS idx_bookings_customer_phone ON bookings(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_ref ON bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_technician ON bookings(technician_id) WHERE technician_id IS NOT NULL;

-- WhatsApp dispatches indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_dispatches_status ON whatsapp_dispatches(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_dispatches_technician ON whatsapp_dispatches(technician_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_dispatches_booking ON whatsapp_dispatches(booking_id);

-- Dynamic pricing indexes
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_model_service ON dynamic_pricing(model_id, service_id) WHERE is_active = true;

-- SEO/Product indexes
CREATE INDEX IF NOT EXISTS idx_device_models_slug ON device_models(slug) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_service_locations_slug ON service_locations(slug) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON customer_profiles(phone);

-- SECTION 2: TRIGGERS & AUTOMATION
-- =============================================================================

-- 2.1 Auto-Generate Booking Ref (TEC-1001)
CREATE OR REPLACE FUNCTION generate_booking_ref()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(NULLIF(regexp_replace(booking_ref, '\D', '', 'g'), '')::int), 1000) + 1
    INTO next_num FROM bookings;
    
    NEW.booking_ref := 'TEC-' || next_num;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to avoid duplication errors on re-runs
DROP TRIGGER IF EXISTS set_booking_ref ON bookings;
CREATE TRIGGER set_booking_ref
    BEFORE INSERT ON bookings
    FOR EACH ROW
    WHEN (NEW.booking_ref IS NULL)
    EXECUTE FUNCTION generate_booking_ref();

-- 2.2 Auto-Generate Warranty Number
CREATE OR REPLACE FUNCTION generate_warranty_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.warranty_number := 'WT-' || to_char(NOW(), 'YYMMDD') || '-' || substring(NEW.id::text from 1 for 4);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_warranty_number ON warranties;
CREATE TRIGGER set_warranty_number
    BEFORE INSERT ON warranties
    FOR EACH ROW
    EXECUTE FUNCTION generate_warranty_number();

-- 2.3 Auto-Log Status Changes
CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, 'system');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS booking_status_change_trigger ON bookings;
CREATE TRIGGER booking_status_change_trigger
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION log_booking_status_change();

-- SECTION 3: UPDATED SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;

-- Drop the overly permissive booking policy
DROP POLICY IF EXISTS "Public Create Booking" ON bookings;

-- Create a more secure booking policy that requires customer information
CREATE POLICY "Public Create Booking" ON bookings FOR INSERT 
WITH CHECK (
    customer_name IS NOT NULL AND 
    customer_phone IS NOT NULL AND
    length(customer_phone) >= 10
);

-- Create a policy for customers to view their own bookings
CREATE POLICY "Customers View Own Bookings" ON bookings FOR SELECT 
USING (
    customer_phone = current_setting('request.jwt.claims', true)::json->>'phone' OR
    customer_email = current_setting('request.jwt.claims', true)::json->>'email'
);

-- Create a policy for technicians to view assigned bookings
CREATE POLICY "Technicians View Assigned Bookings" ON bookings FOR SELECT 
USING (
    technician_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
);

-- SECTION 4: VERIFICATION QUERIES
-- =============================================================================

-- Check if indexes were created
SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check if triggers are working
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgfoid::regproc as function_name
FROM pg_trigger 
WHERE tgname IN ('set_booking_ref', 'set_warranty_number', 'booking_status_change_trigger');

-- Test the booking trigger by checking recent bookings
SELECT 
    booking_ref,
    created_at,
    CASE 
        WHEN booking_ref LIKE 'TEC-%' THEN 'TRIGGER WORKING'
        WHEN booking_ref LIKE 'TEST-%' THEN 'TRIGGER NOT WORKING'
        ELSE 'NO REFERENCE'
    END as trigger_status
FROM bookings 
ORDER BY created_at DESC 
LIMIT 10;

-- =============================================================================
-- EXECUTION NOTES:
-- 1. Run this entire script in Supabase Dashboard > SQL Editor
-- 2. After execution, verify the results in the "Verification Queries" section
-- 3. Test with /api/test-supabase endpoint to confirm fixes
-- =============================================================================