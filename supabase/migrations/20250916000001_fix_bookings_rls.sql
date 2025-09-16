-- Fix infinite recursion in RLS policies for bookings table
-- This migration removes conflicting policies and creates clean ones

-- Drop all existing policies for bookings table
DROP POLICY IF EXISTS "Service role full access bookings" ON bookings;
DROP POLICY IF EXISTS "Public insert access for bookings" ON bookings;
DROP POLICY IF EXISTS "Public update access for bookings" ON bookings;
DROP POLICY IF EXISTS "Public read access for bookings" ON bookings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON bookings;
DROP POLICY IF EXISTS "Enable read access for all users" ON bookings;
DROP POLICY IF EXISTS "Enable update for users based on email" ON bookings;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON bookings;
DROP POLICY IF EXISTS "bookings_select_policy" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_policy" ON bookings;
DROP POLICY IF EXISTS "bookings_update_policy" ON bookings;
DROP POLICY IF EXISTS "bookings_delete_policy" ON bookings;

-- Temporarily disable RLS to fix the infinite recursion
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create clean, non-recursive policies

-- 1. Service role has full access (for admin operations)
CREATE POLICY "service_role_full_access_bookings" ON bookings
USING (auth.role() = 'service_role');

-- 2. Anonymous users can insert bookings (for booking form submissions)
CREATE POLICY "anon_insert_bookings" ON bookings
FOR INSERT 
TO anon
WITH CHECK (true);

-- 3. Anonymous users can read all bookings (for management panel and rescheduling)
-- This is necessary for the public management features
CREATE POLICY "anon_read_bookings" ON bookings
FOR SELECT 
TO anon
USING (true);

-- 4. Anonymous users can update bookings (for rescheduling)
CREATE POLICY "anon_update_bookings" ON bookings
FOR UPDATE 
TO anon
USING (true)
WITH CHECK (true);

-- Add comment
COMMENT ON TABLE bookings IS 'Customer booking records with simplified RLS policies to prevent infinite recursion';
