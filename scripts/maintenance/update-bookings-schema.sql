-- Add missing columns to the bookings table
-- This script adds city and province fields that are expected by the booking transformer

-- First, check if the columns already exist before adding them
DO $$
BEGIN
    -- Check if city column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'city'
    ) THEN
        -- Add the city column
        ALTER TABLE bookings ADD COLUMN city TEXT;
        RAISE NOTICE 'Added city column to bookings table';
    ELSE
        RAISE NOTICE 'city column already exists in bookings table';
    END IF;

    -- Check if province column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'province'
    ) THEN
        -- Add the province column
        ALTER TABLE bookings ADD COLUMN province TEXT;
        RAISE NOTICE 'Added province column to bookings table';
    ELSE
        RAISE NOTICE 'province column already exists in bookings table';
    END IF;
    
    -- Check if brand column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'brand'
    ) THEN
        -- Add the brand column as an alias for device_brand
        -- This might be needed if there's a trigger using this field name
        ALTER TABLE bookings ADD COLUMN brand TEXT GENERATED ALWAYS AS (device_brand) STORED;
        RAISE NOTICE 'Added brand column to bookings table as a generated column from device_brand';
    ELSE
        RAISE NOTICE 'brand column already exists in bookings table';
    END IF;
END$$;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position; 