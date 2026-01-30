-- Add missing state columns to bookings table
-- These columns are essential for booking management functionality

-- 1. Add status column with check constraint and default
ALTER TABLE bookings 
ADD COLUMN status text 
CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'in-progress'))
DEFAULT 'pending';

-- 2. Add notes column for admin comments
ALTER TABLE bookings 
ADD COLUMN notes text;

-- 3. Add issue_description column for customer's issue details
ALTER TABLE bookings 
ADD COLUMN issue_description text;

-- 4. Backfill existing bookings with default status
UPDATE bookings SET status = 'pending' WHERE status IS NULL;

-- 5. Create index on status for faster filtering
CREATE INDEX idx_bookings_status ON bookings(status);

-- 6. Add comment explaining the purpose of these columns
COMMENT ON COLUMN bookings.status IS 'Booking workflow status: pending, confirmed, in-progress, completed, cancelled';
COMMENT ON COLUMN bookings.notes IS 'Administrative notes and comments about the booking';
COMMENT ON COLUMN bookings.issue_description IS 'Customer''s description of the device issue';