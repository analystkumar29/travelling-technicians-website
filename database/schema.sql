-- Schema for The Travelling Technicians database
-- This file consolidates all schema definitions for Supabase initialization

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main Tables
----------------

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(50) UNIQUE,
    device_type VARCHAR(50) NOT NULL,
    device_brand VARCHAR(100),
    brand VARCHAR(100),
    device_model VARCHAR(100),
    model VARCHAR(100),
    service_type VARCHAR(100) NOT NULL,
    booking_date DATE,
    booking_time VARCHAR(50),
    appointment_date DATE,
    appointment_time VARCHAR(50),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    province VARCHAR(100) DEFAULT 'British Columbia',
    postal_code VARCHAR(20) NOT NULL,
    issue_description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    description TEXT,
    price_range VARCHAR(50),
    doorstep_eligible BOOLEAN DEFAULT TRUE,
    estimated_time VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Areas table
CREATE TABLE IF NOT EXISTS public.service_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL DEFAULT 'British Columbia',
    postal_code_prefix VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255) NOT NULL,
    customer_location VARCHAR(100),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    service_type VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQs table
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    order_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Functions and Triggers
-------------------------

-- Function to update modified timestamp
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Booking field mapping function
CREATE OR REPLACE FUNCTION public.map_booking_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Brand and model mapping (bidirectional)
    IF NEW.brand IS NOT NULL AND NEW.device_brand IS NULL THEN
        NEW.device_brand := NEW.brand;
    ELSIF NEW.device_brand IS NOT NULL AND NEW.brand IS NULL THEN
        NEW.brand := NEW.device_brand;
    END IF;

    -- Map between model and device_model
    IF NEW.model IS NOT NULL AND NEW.device_model IS NULL THEN
        NEW.device_model := NEW.model;
    ELSIF NEW.device_model IS NOT NULL AND NEW.model IS NULL THEN
        NEW.model := NEW.device_model;
    END IF;

    -- Appointment mapping
    IF NEW.appointmentdate IS NOT NULL AND NEW.booking_date IS NULL THEN
        NEW.booking_date := NEW.appointmentdate;
    END IF;

    IF NEW.appointmenttime IS NOT NULL AND NEW.booking_time IS NULL THEN
        NEW.booking_time := NEW.appointmenttime;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Booking reference generator function
CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate a reference number if not provided
  IF NEW.reference_number IS NULL THEN
    NEW.reference_number := CONCAT('TTB-', TO_CHAR(NOW(), 'YYYYMMDD'), '-', LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers on bookings table
DROP TRIGGER IF EXISTS before_booking_insert ON public.bookings;
CREATE TRIGGER before_booking_insert
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.map_booking_fields();

DROP TRIGGER IF EXISTS set_booking_reference ON public.bookings;
CREATE TRIGGER set_booking_reference
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.generate_booking_reference();

DROP TRIGGER IF EXISTS set_timestamp_bookings ON public.bookings;
CREATE TRIGGER set_timestamp_bookings
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_modified_column();

-- Create triggers on services table
DROP TRIGGER IF EXISTS set_timestamp_services ON public.services;
CREATE TRIGGER set_timestamp_services
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_modified_column();

-- Create triggers on service_areas table
DROP TRIGGER IF EXISTS set_timestamp_service_areas ON public.service_areas;
CREATE TRIGGER set_timestamp_service_areas
BEFORE UPDATE ON public.service_areas
FOR EACH ROW
EXECUTE FUNCTION public.update_modified_column();

-- Create triggers on faqs table
DROP TRIGGER IF EXISTS set_timestamp_faqs ON public.faqs;
CREATE TRIGGER set_timestamp_faqs
BEFORE UPDATE ON public.faqs
FOR EACH ROW
EXECUTE FUNCTION public.update_modified_column(); 