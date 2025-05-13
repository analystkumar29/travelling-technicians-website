-- Drop and recreate the trigger function to handle field naming inconsistencies properly
CREATE OR REPLACE FUNCTION map_booking_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Debug log (you can comment this out in production)
    RAISE NOTICE 'Processing booking for customer: %', NEW.customer_name;
    
    -- Brand and model mapping (bidirectional to handle both camelCase and snake_case)
    -- Map between brand and device_brand
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

    -- Appointment mapping - handle both field naming conventions
    -- Map from appointmentDate to booking_date
    IF NEW.appointmentdate IS NOT NULL AND NEW.booking_date IS NULL THEN
        NEW.booking_date := NEW.appointmentdate;
    END IF;

    -- Map from appointmentTime to booking_time
    IF NEW.appointmenttime IS NOT NULL AND NEW.booking_time IS NULL THEN
        NEW.booking_time := NEW.appointmenttime;
    END IF;
    
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

-- Note: We're keeping the same trigger name, just updating the function
-- If the trigger needs to be recreated, uncomment and run this:
/*
DROP TRIGGER IF EXISTS before_booking_insert ON bookings;
CREATE TRIGGER before_booking_insert
BEFORE INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION map_booking_fields();
*/

-- Add check for missing columns and create them if needed
DO $$
BEGIN
    -- Check for city column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'city'
    ) THEN
        ALTER TABLE bookings ADD COLUMN city TEXT;
        RAISE NOTICE 'Added city column to bookings table';
    END IF;
    
    -- Check for province column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'province'
    ) THEN
        ALTER TABLE bookings ADD COLUMN province TEXT;
        RAISE NOTICE 'Added province column to bookings table';
    END IF;
    
    -- Check for brand column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'brand'
    ) THEN
        ALTER TABLE bookings ADD COLUMN brand TEXT;
        RAISE NOTICE 'Added brand column to bookings table';
    END IF;
    
    -- Check for model column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'model'
    ) THEN
        ALTER TABLE bookings ADD COLUMN model TEXT;
        RAISE NOTICE 'Added model column to bookings table';
    END IF;
END $$;

-- Verify current columns in the bookings table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings'
ORDER BY ordinal_position; 