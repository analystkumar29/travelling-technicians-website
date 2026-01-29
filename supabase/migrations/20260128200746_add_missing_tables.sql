-- =============================================================================
-- CRITICAL MISSING TABLES - RUN THESE NOW (IMPROVED VERSION)
-- =============================================================================

-- CRITICAL CHANGE 1: Enable UUID extension FIRST
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CRITICAL CHANGE 2: Add IF NOT EXISTS to prevent errors on re-run
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHANGE 3: Added IF NOT EXISTS
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    city TEXT,
    device_model TEXT,
    service TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    is_featured BOOLEAN DEFAULT false,
    featured_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRITICAL CHANGE 4: Remove circular dependency - NO payment_id in bookings
-- First, create payments with booking reference (temporarily without FK constraint)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE NOT NULL,  -- Temporarily without FK constraint
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT CHECK (payment_method IN ('cash', 'debit', 'credit', 'etransfer', 'paypal')),
    transaction_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    processed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHANGE 5: Add FAQS (no dependencies)
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHANGE 6: Add SITEMAP table
CREATE TABLE IF NOT EXISTS sitemap_regeneration_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    last_generated TIMESTAMPTZ,
    status TEXT,
    pages_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRITICAL CHANGE 7: DELAYED FOREIGN KEY SETUP
-- Add foreign key to payments ONLY IF bookings table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
        -- Add foreign key constraint to payments
        ALTER TABLE payments
        ADD CONSTRAINT fk_payments_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(id) ON DELETE CASCADE;
        
        -- CRITICAL: DO NOT add payment_id to bookings table
        -- This avoids the circular dependency problem
        -- All references should be one-way: payments -> bookings
        
        -- Add UNIQUE constraint for one-to-one relationship
        ALTER TABLE payments
        ADD CONSTRAINT one_payment_per_booking UNIQUE (booking_id);
    END IF;
END $$;