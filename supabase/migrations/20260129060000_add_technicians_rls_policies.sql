-- Migration: Add RLS policies for technicians table
-- Date: 2026-01-29
-- Purpose: Add secure RLS policies that check for admin status in JWT/auth.users

-- ============================================
-- RLS POLICIES FOR TECHNICIANS TABLE
-- ============================================

-- First, ensure RLS is enabled (it should already be)
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Allow public read access to technicians" ON public.technicians;
DROP POLICY IF EXISTS "Allow authenticated users full access to technicians" ON public.technicians;
DROP POLICY IF EXISTS "Allow service role full access to technicians" ON public.technicians;
DROP POLICY IF EXISTS "Allow admin users full access to technicians" ON public.technicians;

-- Policy 1: Allow public read access (for booking system to assign technicians)
-- This allows the frontend to display available technicians
CREATE POLICY "Allow public read access to technicians"
ON public.technicians
FOR SELECT
TO public
USING (true);

-- Policy 2: Allow authenticated users with admin role to perform all operations
-- Checks for admin role in JWT claims or auth.users metadata
CREATE POLICY "Allow admin users full access to technicians"
ON public.technicians
FOR ALL
TO authenticated
USING (
  -- Check JWT claims for admin role
  (
    auth.jwt() ->> 'user_metadata' ->> 'is_admin' = 'true'
    OR 
    auth.jwt() ->> 'app_metadata' ->> 'role' = 'admin'
    OR
    auth.jwt() ->> 'role' = 'admin'
  )
  OR
  -- Check auth.users metadata for admin role
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      auth.users.raw_user_meta_data ->> 'is_admin' = 'true'
      OR
      auth.users.raw_app_meta_data ->> 'role' = 'admin'
      OR
      auth.users.is_super_admin = true
    )
  )
)
WITH CHECK (
  -- Same checks for WITH CHECK clause
  (
    auth.jwt() ->> 'user_metadata' ->> 'is_admin' = 'true'
    OR 
    auth.jwt() ->> 'app_metadata' ->> 'role' = 'admin'
    OR
    auth.jwt() ->> 'role' = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      auth.users.raw_user_meta_data ->> 'is_admin' = 'true'
      OR
      auth.users.raw_app_meta_data ->> 'role' = 'admin'
      OR
      auth.users.is_super_admin = true
    )
  )
);

-- Policy 3: Allow service role full access (for background tasks)
CREATE POLICY "Allow service role full access to technicians"
ON public.technicians
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- RLS POLICIES FOR TECHNICIAN_SERVICE_ZONES TABLE
-- ============================================

-- Ensure RLS is enabled
ALTER TABLE public.technician_service_zones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to technician_service_zones" ON public.technician_service_zones;
DROP POLICY IF EXISTS "Allow admin users full access to technician_service_zones" ON public.technician_service_zones;
DROP POLICY IF EXISTS "Allow service role full access to technician_service_zones" ON public.technician_service_zones;

-- Policy 1: Allow public read access
CREATE POLICY "Allow public read access to technician_service_zones"
ON public.technician_service_zones
FOR SELECT
TO public
USING (true);

-- Policy 2: Allow admin users full access (same admin check as technicians)
CREATE POLICY "Allow admin users full access to technician_service_zones"
ON public.technician_service_zones
FOR ALL
TO authenticated
USING (
  -- Same admin check as technicians table
  (
    auth.jwt() ->> 'user_metadata' ->> 'is_admin' = 'true'
    OR 
    auth.jwt() ->> 'app_metadata' ->> 'role' = 'admin'
    OR
    auth.jwt() ->> 'role' = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      auth.users.raw_user_meta_data ->> 'is_admin' = 'true'
      OR
      auth.users.raw_app_meta_data ->> 'role' = 'admin'
      OR
      auth.users.is_super_admin = true
    )
  )
)
WITH CHECK (
  -- Same admin check
  (
    auth.jwt() ->> 'user_metadata' ->> 'is_admin' = 'true'
    OR 
    auth.jwt() ->> 'app_metadata' ->> 'role' = 'admin'
    OR
    auth.jwt() ->> 'role' = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      auth.users.raw_user_meta_data ->> 'is_admin' = 'true'
      OR
      auth.users.raw_app_meta_data ->> 'role' = 'admin'
      OR
      auth.users.is_super_admin = true
    )
  )
);

-- Policy 3: Allow service role full access
CREATE POLICY "Allow service role full access to technician_service_zones"
ON public.technician_service_zones
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- VERIFICATION AND SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies created successfully!';
  RAISE NOTICE 'Technicians table policies:';
  RAISE NOTICE '  - Public read access enabled';
  RAISE NOTICE '  - Admin users have full access (checks JWT/auth.users)';
  RAISE NOTICE '  - Service role has full access';
  RAISE NOTICE '';
  RAISE NOTICE 'Technician service zones table policies:';
  RAISE NOTICE '  - Public read access enabled';
  RAISE NOTICE '  - Admin users have full access';
  RAISE NOTICE '  - Service role has full access';
  RAISE NOTICE '';
  RAISE NOTICE 'API endpoints should now work correctly:';
  RAISE NOTICE '  - GET /api/technicians → Public read access';
  RAISE NOTICE '  - POST/PUT /api/technicians → Service role client (bypasses RLS)';
END $$;