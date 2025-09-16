-- Temporarily disable RLS on bookings table to restore functionality
-- This will completely remove the infinite recursion issue

-- Disable RLS entirely on bookings table
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Add a comment explaining the temporary fix
COMMENT ON TABLE bookings IS 'RLS temporarily disabled to fix infinite recursion. Management panel should now work.';
