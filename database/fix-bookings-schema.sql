-- Fix bookings table schema to match application expectations
-- Since there are no existing bookings, we can safely recreate the table

-- Drop existing bookings table
DROP TABLE IF EXISTS public.bookings CASCADE;

-- Create new bookings table with proper schema
CREATE TABLE public.bookings (
    id SERIAL PRIMARY KEY,
    reference_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    
    -- Customer information
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    
    -- Device information
    device_type VARCHAR(20) NOT NULL,
    device_brand VARCHAR(50),
    device_model VARCHAR(100),
    
    -- Service information
    service_type VARCHAR(50),
    pricing_tier VARCHAR(20) DEFAULT 'standard',
    issue_description TEXT,
    
    -- Appointment information
    booking_date DATE,
    booking_time VARCHAR(20), -- morning, afternoon, evening
    appointment_date DATE,
    appointment_time VARCHAR(20),
    
    -- Location information
    address TEXT,
    city VARCHAR(50),
    province VARCHAR(20),
    postal_code VARCHAR(10),
    
    -- Pricing
    estimated_price DECIMAL(10,2),
    final_price DECIMAL(10,2),
    
    -- Additional fields
    technician_notes TEXT,
    customer_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_bookings_reference ON public.bookings(reference_number);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_customer_email ON public.bookings(customer_email);
CREATE INDEX idx_bookings_booking_date ON public.bookings(booking_date);
CREATE INDEX idx_bookings_created_at ON public.bookings(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE
ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Public can insert bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view own bookings by email" ON public.bookings
    FOR SELECT USING (true); -- For now, allow all reads (can be restricted later)

CREATE POLICY "Service role can do everything" ON public.bookings
    FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON public.bookings TO service_role;
GRANT SELECT, INSERT ON public.bookings TO anon;
GRANT USAGE ON SEQUENCE public.bookings_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.bookings_id_seq TO service_role;

-- Add some comments for documentation
COMMENT ON TABLE public.bookings IS 'Main bookings table for device repair appointments';
COMMENT ON COLUMN public.bookings.reference_number IS 'Unique booking reference like TTR-123456-789';
COMMENT ON COLUMN public.bookings.booking_time IS 'Time slot: morning, afternoon, evening';
COMMENT ON COLUMN public.bookings.appointment_time IS 'Specific appointment time if scheduled';
