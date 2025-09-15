-- Create a function to safely fetch user profiles by ID
-- This function can be called via Supabase RPC and avoids some permission issues

CREATE OR REPLACE FUNCTION get_user_profile_by_id(user_id UUID)
RETURNS SETOF user_profiles AS $$
BEGIN
  -- Return the user profile for the given ID
  RETURN QUERY
  SELECT *
  FROM user_profiles
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER; -- Uses definer's privileges, bypassing RLS

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_profile_by_id(UUID) TO authenticated;

-- Create a function to check user authentication status
CREATE OR REPLACE FUNCTION check_auth_status()
RETURNS TABLE (
  is_authenticated BOOLEAN,
  user_id UUID,
  email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (auth.uid() IS NOT NULL) as is_authenticated,
    auth.uid() as user_id,
    (SELECT email FROM auth.users WHERE id = auth.uid()) as email;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_auth_status() TO authenticated;
