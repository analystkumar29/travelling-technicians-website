-- SQL to modify the trigger function to handle field mapping correctly
-- This addresses the "record 'new' has no field 'brand'" and "appointmentdate" errors

-- Drop and recreate the map_booking_fields trigger function
CREATE OR REPLACE FUNCTION map_booking_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Debug log
    RAISE NOTICE 'Processing booking for customer: %', NEW.customer_name;
    
    -- Brand and model mapping (bidirectional)
    -- Map between brand and device_brand if both fields exist in the table
    BEGIN
        IF NEW.brand IS NOT NULL AND NEW.device_brand IS NULL THEN
            NEW.device_brand := NEW.brand;
        ELSIF NEW.device_brand IS NOT NULL AND NEW.brand IS NULL THEN
            NEW.brand := NEW.device_brand;
        END IF;
    EXCEPTION WHEN undefined_column THEN
        RAISE NOTICE 'Brand/device_brand field not found, skipping';
    END;

    -- Map between model and device_model if both fields exist
    BEGIN
        IF NEW.model IS NOT NULL AND NEW.device_model IS NULL THEN
            NEW.device_model := NEW.model;
        ELSIF NEW.device_model IS NOT NULL AND NEW.model IS NULL THEN
            NEW.model := NEW.device_model;
        END IF;
    EXCEPTION WHEN undefined_column THEN
        RAISE NOTICE 'Model/device_model field not found, skipping';
    END;

    -- Handle booking_date and booking_time fields
    -- Instead of trying to access appointmentdate directly, check if it exists first
    -- to avoid the "record 'new' has no field 'appointmentdate'" error
    BEGIN
        -- This section uses exception handling to safely check for field existence
        IF NEW.appointmentdate IS NOT NULL AND NEW.booking_date IS NULL THEN
            NEW.booking_date := NEW.appointmentdate;
        END IF;
        
        IF NEW.appointmenttime IS NOT NULL AND NEW.booking_time IS NULL THEN
            NEW.booking_time := NEW.appointmenttime;
        END IF;
    EXCEPTION WHEN undefined_column THEN
        -- Do nothing if the field doesn't exist
        RAISE NOTICE 'Appointment fields not present in this operation';
    END;
    
    -- Add default dates if missing
    IF NEW.booking_date IS NULL THEN
        NEW.booking_date := CURRENT_DATE;
    END IF;
    
    -- Default status if not provided
    IF NEW.status IS NULL THEN
        NEW.status := 'pending';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the necessary columns if they don't exist
DO $$
BEGIN
    -- Check for and add city column if needed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'city'
    ) THEN
        ALTER TABLE bookings ADD COLUMN city TEXT;
        RAISE NOTICE 'Added city column to bookings table';
    END IF;
    
    -- Check for and add province column if needed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'province'
    ) THEN
        ALTER TABLE bookings ADD COLUMN province TEXT;
        RAISE NOTICE 'Added province column to bookings table';
    END IF;
    
    -- Check for and add brand column if needed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'brand'
    ) THEN
        ALTER TABLE bookings ADD COLUMN brand TEXT;
        RAISE NOTICE 'Added brand column to bookings table';
    END IF;
    
    -- Check for and add model column if needed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'model'
    ) THEN
        ALTER TABLE bookings ADD COLUMN model TEXT;
        RAISE NOTICE 'Added model column to bookings table';
    END IF;
END $$;

-- Show the current schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- Recreate the trigger (in case it's missing)
DROP TRIGGER IF EXISTS before_booking_insert ON bookings;
CREATE TRIGGER before_booking_insert
BEFORE INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION map_booking_fields();

-- Verify the trigger was created properly
SELECT 
    tgname AS trigger_name,
    proname AS function_name,
    tgenabled AS enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'bookings'; 