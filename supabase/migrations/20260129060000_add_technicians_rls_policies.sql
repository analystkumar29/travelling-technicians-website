-- Migration: Add RLS policies for technicians table (Syntax Fix with #>>)
-- Date: 2026-01-29

-- ============================================
-- RLS POLICIES FOR TECHNICIANS TABLE
-- ============================================

ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to technicians" ON public.technicians;
DROP POLICY IF EXISTS "Allow admin users full access to technicians" ON public.technicians;
DROP POLICY IF EXISTS "Allow service role full access to technicians" ON public.technicians;

-- Policy 1: Public Read
CREATE POLICY "Allow public read access to technicians"
ON public.technicians FOR SELECT TO public USING (true);

-- Policy 2: Admin Full Access (Using #>> path operator)
CREATE POLICY "Allow admin users full access to technicians"
ON public.technicians
FOR ALL
TO authenticated
USING (
  (
    -- Check 1: JWT user_metadata.is_admin
    (auth.jwt() #>> '{user_metadata,is_admin}')::text = 'true'
    OR 
    -- Check 2: JWT app_metadata.role
    (auth.jwt() #>> '{app_metadata,role}')::text = 'admin'
    OR
    -- Check 3: JWT top-level role
    (auth.jwt() #>> '{role}')::text = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      -- Check 4: DB raw_user_meta_data.is_admin (Direct key)
      (auth.users.raw_user_meta_data ->> 'is_admin')::text = 'true'
      OR
      -- Check 5: DB raw_app_meta_data.role (Direct key)
      (auth.users.raw_app_meta_data ->> 'role')::text = 'admin'
      OR
      -- Check 6: Super admin boolean
      auth.users.is_super_admin = true
    )
  )
)
WITH CHECK (
  (
    (auth.jwt() #>> '{user_metadata,is_admin}')::text = 'true'
    OR 
    (auth.jwt() #>> '{app_metadata,role}')::text = 'admin'
    OR
    (auth.jwt() #>> '{role}')::text = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      (auth.users.raw_user_meta_data ->> 'is_admin')::text = 'true'
      OR
      (auth.users.raw_app_meta_data ->> 'role')::text = 'admin'
      OR
      auth.users.is_super_admin = true
    )
  )
);

-- Policy 3: Service Role
CREATE POLICY "Allow service role full access to technicians"
ON public.technicians FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- RLS POLICIES FOR TECHNICIAN_SERVICE_ZONES TABLE
-- ============================================

ALTER TABLE public.technician_service_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to technician_service_zones" ON public.technician_service_zones;
DROP POLICY IF EXISTS "Allow admin users full access to technician_service_zones" ON public.technician_service_zones;
DROP POLICY IF EXISTS "Allow service role full access to technician_service_zones" ON public.technician_service_zones;

CREATE POLICY "Allow public read access to technician_service_zones"
ON public.technician_service_zones FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin users full access to technician_service_zones"
ON public.technician_service_zones
FOR ALL
TO authenticated
USING (
  (
    (auth.jwt() #>> '{user_metadata,is_admin}')::text = 'true'
    OR 
    (auth.jwt() #>> '{app_metadata,role}')::text = 'admin'
    OR
    (auth.jwt() #>> '{role}')::text = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      (auth.users.raw_user_meta_data ->> 'is_admin')::text = 'true'
      OR
      (auth.users.raw_app_meta_data ->> 'role')::text = 'admin'
      OR
      auth.users.is_super_admin = true
    )
  )
)
WITH CHECK (
  (
    (auth.jwt() #>> '{user_metadata,is_admin}')::text = 'true'
    OR 
    (auth.jwt() #>> '{app_metadata,role}')::text = 'admin'
    OR
    (auth.jwt() #>> '{role}')::text = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (
      (auth.users.raw_user_meta_data ->> 'is_admin')::text = 'true'
      OR
      (auth.users.raw_app_meta_data ->> 'role')::text = 'admin'
      OR
      auth.users.is_super_admin = true
    )
  )
);

CREATE POLICY "Allow service role full access to technician_service_zones"
ON public.technician_service_zones FOR ALL TO service_role USING (true) WITH CHECK (true);