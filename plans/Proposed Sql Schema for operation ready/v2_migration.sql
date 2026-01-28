/*
  =============================================================================
  MASTER DATABASE SCHEMA v2.0 - TRAVELLING TECHNICIANS
  =============================================================================
  Supabase/PostgreSQL Verified
  =============================================================================
*/

-- [SECTION 1: FOUNDATION] ----------------------------------------------------

-- 1.1 Enable UUIDs (Standard for Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1.2 Custom Status Types (Enums)
-- We use separate DROP/CREATE to ensure clean updates if re-running
DROP TYPE IF EXISTS booking_status CASCADE;
CREATE TYPE booking_status AS ENUM (
    'pending', 'confirmed', 'assigned', 'technician_en_route', 
    'in_progress', 'completed', 'cancelled', 'refunded'
);

DROP TYPE IF EXISTS technician_status CASCADE;
CREATE TYPE technician_status AS ENUM (
    'available', 'busy', 'off_duty', 'on_call'
);

DROP TYPE IF EXISTS warranty_status CASCADE;
CREATE TYPE warranty_status AS ENUM (
    'active', 'expired', 'void', 'claimed'
);

-- [SECTION 2: CORE ASSETS (SEO & Products)] ----------------------------------

-- 2.1 BRANDS
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 DEVICE TYPES
CREATE TABLE IF NOT EXISTS device_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 SERVICE LOCATIONS
CREATE TABLE IF NOT EXISTS service_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city_name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    base_travel_fee DECIMAL(10,2) DEFAULT 0.00,
    
    -- Travel logic for n8n
    travel_fee_rules JSONB DEFAULT '{
        "peak_hours_surcharge": 10,
        "weekend_surcharge": 15,
        "emergency_surcharge": 25,
        "free_areas": ["downtown", "city_center"]
    }',
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 CITY DISTANCE MATRIX
CREATE TABLE IF NOT EXISTS city_distance_matrix (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_location_id UUID REFERENCES service_locations(id),
    to_location_id UUID REFERENCES service_locations(id),
    driving_minutes INTEGER,
    distance_km DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(from_location_id, to_location_id)
);

-- 2.5 SERVICES
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    avg_time_minutes INTEGER DEFAULT 45,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 DEVICE MODELS
CREATE TABLE IF NOT EXISTS device_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    type_id UUID REFERENCES device_types(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    release_year INTEGER,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 REPAIR PARTS INVENTORY
CREATE TABLE IF NOT EXISTS repair_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_number TEXT UNIQUE,
    description TEXT,
    supplier TEXT,
    cost_price DECIMAL(10,2),
    retail_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 DYNAMIC PRICING
CREATE TABLE IF NOT EXISTS dynamic_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES device_models(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    
    base_price DECIMAL(10,2) NOT NULL,
    compare_at_price DECIMAL(10,2),
    
    required_parts UUID[] DEFAULT '{}', 
    
    is_active BOOLEAN DEFAULT true,
    UNIQUE(model_id, service_id) 
);

-- [SECTION 3: PEOPLE & OPERATIONS] -------------------------------------------

-- 3.1 TECHNICIANS
CREATE TABLE IF NOT EXISTS technicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    
    current_status technician_status DEFAULT 'available',
    whatsapp_capable BOOLEAN DEFAULT true,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 TECHNICIAN ZONES
CREATE TABLE IF NOT EXISTS technician_service_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    technician_id UUID REFERENCES technicians(id) ON DELETE CASCADE,
    location_id UUID REFERENCES service_locations(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 1, 
    UNIQUE(technician_id, location_id)
);

-- 3.3 CUSTOMER PROFILES
CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    full_name TEXT,
    total_bookings INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    first_booking_date DATE,
    last_booking_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_ref TEXT UNIQUE, -- Trigger will fill this (TEC-1001)
    
    customer_profile_id UUID REFERENCES customer_profiles(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_address TEXT,
    
    model_id UUID REFERENCES device_models(id),
    service_id UUID REFERENCES services(id),
    location_id UUID REFERENCES service_locations(id),
    
    status booking_status DEFAULT 'pending',
    technician_id UUID REFERENCES technicians(id),
    
    quoted_price DECIMAL(10,2),
    final_price DECIMAL(10,2),
    travel_fee DECIMAL(10,2) DEFAULT 0.00,
    
    scheduled_at TIMESTAMPTZ,
    
    is_repeat_customer BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- [SECTION 4: ADVANCED FEATURES] ---------------------------------------------

-- 4.1 WHATSAPP DISPATCH LOGS
CREATE TABLE IF NOT EXISTS whatsapp_dispatches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES technicians(id) ON DELETE CASCADE,
    
    message_sid TEXT,
    response TEXT,
    response_message TEXT,
    status TEXT DEFAULT 'pending',
    
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 WARRANTIES
CREATE TABLE IF NOT EXISTS warranties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    warranty_number TEXT UNIQUE, -- Trigger will fill this
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INTEGER DEFAULT 90,
    terms TEXT DEFAULT 'Standard 90-day warranty on parts and labor.',
    
    status warranty_status DEFAULT 'active',
    claim_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.3 BOOKING COMMUNICATIONS
CREATE TABLE IF NOT EXISTS booking_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    sender_type TEXT CHECK (sender_type IN ('customer', 'technician', 'system')),
    message TEXT NOT NULL,
    media_url TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.4 AUDIT LOGS
CREATE TABLE IF NOT EXISTS booking_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    old_status booking_status,
    new_status booking_status,
    changed_by TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.5 WEBHOOK LOGS
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT,
    payload JSONB,
    processed BOOLEAN DEFAULT false,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [SECTION 5: TRIGGERS & AUTOMATION] -----------------------------------------

-- 5.1 Auto-Generate Booking Ref (TEC-1001)
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

-- 5.2 Auto-Generate Warranty Number
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

-- 5.3 Auto-Log Status Changes
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

-- [SECTION 6: SECURITY (RLS)] ------------------------------------------------

-- Enable RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_communications ENABLE ROW LEVEL SECURITY;

-- Note: We drop policies first to ensure clean updates/no "policy already exists" errors.

-- PUBLIC READ POLICIES
DROP POLICY IF EXISTS "Public Read Brands" ON brands;
CREATE POLICY "Public Read Brands" ON brands FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public Read Types" ON device_types;
CREATE POLICY "Public Read Types" ON device_types FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Locations" ON service_locations;
CREATE POLICY "Public Read Locations" ON service_locations FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public Read Services" ON services;
CREATE POLICY "Public Read Services" ON services FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public Read Models" ON device_models;
CREATE POLICY "Public Read Models" ON device_models FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public Read Pricing" ON dynamic_pricing;
CREATE POLICY "Public Read Pricing" ON dynamic_pricing FOR SELECT USING (is_active = true);

-- BOOKING POLICIES
DROP POLICY IF EXISTS "Public Create Booking" ON bookings;
CREATE POLICY "Public Create Booking" ON bookings FOR INSERT WITH CHECK (true);

/* SUCCESS: Schema loaded.
   Tables, Triggers, and RLS policies are active.
*/