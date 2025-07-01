-- SQL file to remove all authentication and user-related tables, functions, and policies

-- First, remove foreign key references to user_profiles
ALTER TABLE IF EXISTS public.bookings
DROP COLUMN IF EXISTS user_id;

-- Drop any policies related to user_profiles
DROP POLICY IF EXISTS "Customers can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public access to profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- Drop warranty claims policies related to users
DROP POLICY IF EXISTS "Customers can view their own warranty claims" ON warranty_claims;

-- Drop any functions related to user_profiles
DROP FUNCTION IF EXISTS public.get_user_profile(user_id uuid);
DROP FUNCTION IF EXISTS public.get_user_profile_by_email(user_email text);
DROP FUNCTION IF EXISTS public.update_user_profile_timestamps();

-- Drop triggers related to user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_timestamp ON user_profiles;

-- Drop the user_profiles table
DROP TABLE IF EXISTS public.user_profiles;

-- Remove auth-related columns from technicians table
ALTER TABLE IF EXISTS public.technicians
DROP COLUMN IF EXISTS auth_id;

-- Remove policies from technicians table related to auth
DROP POLICY IF EXISTS "Technicians can view their own profile" ON technicians;

-- Remove any references to auth.users from other tables if they exist
-- (This is a safe operation since we've already dropped foreign keys)

-- Commit the transaction
COMMIT; 