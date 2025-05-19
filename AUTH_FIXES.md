# Authentication System Fixes

This document outlines the fixes implemented to resolve authentication issues in The Travelling Technicians website.

## Issues Fixed

1. **Cross-Subdomain Authentication**
   - Problem: Authentication cookies weren't shared between www and non-www domains
   - Solution: Set cookies with `.travelling-technicians.ca` domain to work across all subdomains

2. **User Profile Fetch Failures**
   - Problem: User profile fetching was failing with cryptic errors
   - Solution: Implemented a more robust profile fetch strategy with:
     - Multiple fallback mechanisms
     - Automatic profile creation if missing
     - Custom RPC function to bypass permission issues

3. **Auth Recovery System**
   - Problem: Auth recovery wasn't working consistently
   - Solution: Improved recovery flow with better error handling and staged recovery

## Implementation Details

### Cookie Domain Configuration

The auth cookie settings now include:
- Domain set to `.travelling-technicians.ca` (note the leading dot)
- Explicit maxAge of 30 days
- Direct cookieOptions configuration in Supabase client

### Improved Profile Fetch Strategy

The new profile fetch system includes:
1. Standard profile query with better error handling
2. RPC fallback using a custom database function
3. Profile creation if fetch attempts repeatedly fail
4. Session state recovery without page reload

### Database Functions

Added custom PostgreSQL functions for more reliable auth operations:
- `get_user_profile_by_id`: Function to fetch user profiles bypassing RLS
- `check_auth_status`: Function to verify authentication state

## How to Deploy

1. Apply the code changes to the codebase 
2. Run the SQL in `create-profile-functions.sql` on your Supabase database
3. Clear any existing cookies in testing environments
4. Perform a hard refresh after deployment

## Testing Cross-Domain Authentication

To verify the fix is working:
1. Sign in on `www.travelling-technicians.ca`
2. Navigate to `travelling-technicians.ca` (non-www)
3. Confirm you remain signed in
4. Test protected routes on both domains 