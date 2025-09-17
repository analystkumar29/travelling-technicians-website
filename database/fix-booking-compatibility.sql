-- Fix booking schema compatibility issues
-- Add missing fields needed for business logic

-- 1. Add technician_id field for technician assignment
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS technician_id UUID;

-- 2. Add foreign key constraint to technicians table
-- Note: We'll add this constraint only if technicians table exists
DO $$
BEGIN
    -- Check if technicians table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'technicians' AND table_schema = 'public') THEN
        -- Add foreign key constraint if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_bookings_technician_id' 
            AND table_name = 'bookings'
        ) THEN
            ALTER TABLE public.bookings 
            ADD CONSTRAINT fk_bookings_technician_id 
            FOREIGN KEY (technician_id) REFERENCES public.technicians(id);
        END IF;
    END IF;
END $$;

-- 3. Add any other missing fields that might be needed
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS repair_status VARCHAR(20) DEFAULT 'pending';

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS user_id UUID; -- For linking to user profiles

-- 4. Add comments for documentation
COMMENT ON COLUMN public.bookings.technician_id IS 'ID of the assigned technician';
COMMENT ON COLUMN public.bookings.repair_status IS 'Status of the repair work: pending, in_progress, completed, cancelled';
COMMENT ON COLUMN public.bookings.user_id IS 'ID of the customer user profile (if registered)';

-- 5. Add index for technician lookups
CREATE INDEX IF NOT EXISTS idx_bookings_technician_id ON public.bookings(technician_id);
CREATE INDEX IF NOT EXISTS idx_bookings_repair_status ON public.bookings(repair_status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);

-- 6. Update RLS policies to account for new fields
-- The existing policies should still work, but we might need technician access

-- Create policy for technicians to access their assigned bookings
CREATE POLICY "Technicians can view their assigned bookings" ON public.bookings
    FOR SELECT USING (
        technician_id IS NOT NULL AND 
        technician_id IN (
            SELECT id FROM public.technicians 
            WHERE auth_id = auth.uid()
        )
    );

-- Allow technicians to update their assigned bookings
CREATE POLICY "Technicians can update their assigned bookings" ON public.bookings
    FOR UPDATE USING (
        technician_id IS NOT NULL AND 
        technician_id IN (
            SELECT id FROM public.technicians 
            WHERE auth_id = auth.uid()
        )
    );

