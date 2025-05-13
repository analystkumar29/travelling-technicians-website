-- Database initialization for Docker setup
-- This file is executed when the database container is first created

-- Create database extension for UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS bookings (
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

-- Create booking field mapping trigger
CREATE OR REPLACE FUNCTION map_booking_fields()
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

-- Create booking reference trigger
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate a reference number if not provided
  IF NEW.reference_number IS NULL THEN
    NEW.reference_number := CONCAT('TTB-', TO_CHAR(NOW(), 'YYYYMMDD'), '-', LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the triggers on the bookings table
DROP TRIGGER IF EXISTS before_booking_insert ON bookings;
CREATE TRIGGER before_booking_insert
BEFORE INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION map_booking_fields();

DROP TRIGGER IF EXISTS set_booking_reference ON bookings;
CREATE TRIGGER set_booking_reference
BEFORE INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION generate_booking_reference();

-- Create a test booking
INSERT INTO bookings (
    device_type, 
    device_brand, 
    device_model, 
    service_type, 
    customer_name, 
    customer_email, 
    customer_phone, 
    address, 
    postal_code,
    issue_description
) VALUES (
    'mobile',
    'Apple',
    'iPhone 13',
    'Screen Replacement',
    'Test User',
    'test@example.com',
    '6045551234',
    '123 Main St, Vancouver',
    'V6B 1A1',
    'Test booking created during initialization'
); 