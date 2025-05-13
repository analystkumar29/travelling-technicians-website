-- Simplified direct SQL statements to add missing columns
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS province TEXT;

-- First drop the brand column if it exists (since it might be a generated column)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'brand'
    ) THEN
        ALTER TABLE public.bookings DROP COLUMN brand;
    END IF;
END $$;

-- Add the brand column as a regular column
ALTER TABLE public.bookings ADD COLUMN brand TEXT; 