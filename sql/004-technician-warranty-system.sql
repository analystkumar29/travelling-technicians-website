-- Technician-Warranty System Migration
-- This script adds tables and relationships for the technician-driven warranty system

-- 1. Enhanced Technicians Table
-- Connect technicians to Supabase Auth
CREATE TABLE IF NOT EXISTS public.technicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID REFERENCES auth.users(id), -- Link to Supabase Auth
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    profile_image_url TEXT,
    specializations TEXT[], -- Array of specializations (e.g. 'mobile', 'laptop')
    active_service_areas TEXT[], -- Array of postal code prefixes
    is_active BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(10, 2),
    max_daily_bookings INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Profiles Table for Customers
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    postal_code TEXT,
    city TEXT,
    province TEXT DEFAULT 'British Columbia',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Modify Bookings Table to link to user profiles
DO $$ 
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.bookings 
        ADD COLUMN user_id UUID REFERENCES user_profiles(id) NULL;
    END IF;

    -- Add repair_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'repair_status'
    ) THEN
        ALTER TABLE public.bookings 
        ADD COLUMN repair_status TEXT DEFAULT 'pending';
    END IF;

    -- Add columns for rescheduling tracking
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'original_booking_date'
    ) THEN
        ALTER TABLE public.bookings 
        ADD COLUMN original_booking_date DATE,
        ADD COLUMN original_booking_time TEXT,
        ADD COLUMN reschedule_count INTEGER DEFAULT 0,
        ADD COLUMN rescheduled_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 4. Create Repair Completions Table
CREATE TABLE IF NOT EXISTS public.repair_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) NOT NULL,
    technician_id UUID REFERENCES technicians(id) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    repair_notes TEXT,
    parts_used JSONB, -- JSON array of parts used with their costs
    repair_duration INTEGER, -- Minutes the repair took
    customer_signature_url TEXT, -- Optional signature image URL
    additional_services JSONB, -- Any additional services performed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(booking_id) -- Each booking can have only one completion record
);

-- 5. Create Warranties Table
CREATE TABLE IF NOT EXISTS public.warranties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) NOT NULL,
    repair_completion_id UUID REFERENCES repair_completions(id) NOT NULL,
    technician_id UUID REFERENCES technicians(id) NOT NULL,
    warranty_code TEXT UNIQUE NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    parts_covered TEXT[], -- Array of parts covered under warranty
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(booking_id) -- Each booking can have only one warranty
);

-- 6. Create Warranty Claims Table
CREATE TABLE IF NOT EXISTS public.warranty_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warranty_id UUID REFERENCES warranties(id) NOT NULL,
    claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
    issue_description TEXT NOT NULL,
    resolution TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    assigned_technician_id UUID REFERENCES technicians(id),
    follow_up_date DATE,
    technician_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create Technician Schedule Table
CREATE TABLE IF NOT EXISTS public.technician_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    technician_id UUID REFERENCES technicians(id) NOT NULL,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL, -- Format: 'HH-HH' (e.g., '09-11')
    is_available BOOLEAN DEFAULT TRUE,
    booking_id UUID REFERENCES bookings(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(technician_id, date, time_slot) -- Each technician can only have one status per time slot
);

-- Add Row Level Security Policies
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_schedules ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Technicians can view their own profile" 
ON technicians FOR SELECT 
USING (auth.uid() = auth_id);

CREATE POLICY "Customers can view their own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Public repair completions are viewable"
ON repair_completions FOR SELECT
USING (true);

CREATE POLICY "Technicians can insert repair completions"
ON repair_completions FOR INSERT
WITH CHECK (auth.uid() IN (
  SELECT auth_id FROM technicians WHERE id = technician_id
));

CREATE POLICY "Warranty information is viewable by all"
ON warranties FOR SELECT
USING (true);

CREATE POLICY "Customers can view their own warranty claims"
ON warranty_claims FOR SELECT
USING (warranty_id IN (
  SELECT w.id FROM warranties w
  JOIN bookings b ON w.booking_id = b.id
  JOIN user_profiles u ON b.user_id = u.id
  WHERE u.id = auth.uid()
));

CREATE POLICY "Technicians can view assigned schedules"
ON technician_schedules FOR SELECT
USING (technician_id IN (
  SELECT id FROM technicians WHERE auth_id = auth.uid()
)); 