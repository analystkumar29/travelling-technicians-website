-- Database Update Script for Phone Numbers
-- This script updates all phone numbers to use the correct business phone number
-- Run this script in your Supabase SQL Editor

-- 1. First, verify the current state
SELECT 
    'Current Database State' as section,
    COUNT(*) as total_cities,
    COUNT(CASE WHEN local_phone = '+16048495329' THEN 1 END) as correct_phone_count,
    COUNT(CASE WHEN local_phone = '+1-778-389-9251' THEN 1 END) as old_phone_count,
    COUNT(CASE WHEN local_phone IS NULL THEN 1 END) as null_phone_count
FROM service_locations
WHERE is_active = true;

-- 2. Show current phone numbers by city
SELECT 
    'Current Phone Numbers by City' as section,
    city_name,
    slug,
    local_phone,
    CASE 
        WHEN local_phone = '+16048495329' THEN '✅ Correct'
        WHEN local_phone = '+1-778-389-9251' THEN '⚠️ Needs Update'
        WHEN local_phone IS NULL THEN '❌ Missing'
        ELSE '❓ Unknown Format'
    END as status
FROM service_locations
WHERE is_active = true
ORDER BY city_name;

-- 3. Update all active cities to use the correct phone number
UPDATE service_locations
SET local_phone = '+16048495329'
WHERE is_active = true 
  AND (local_phone != '+16048495329' OR local_phone IS NULL);

-- 4. Verify the update was successful
SELECT 
    'After Update - Verification' as section,
    COUNT(*) as total_cities,
    COUNT(CASE WHEN local_phone = '+16048495329' THEN 1 END) as correct_phone_count,
    COUNT(CASE WHEN local_phone != '+16048495329' THEN 1 END) as incorrect_phone_count,
    COUNT(CASE WHEN local_phone IS NULL THEN 1 END) as null_phone_count
FROM service_locations
WHERE is_active = true;

-- 5. Show updated phone numbers
SELECT 
    'Updated Phone Numbers' as section,
    city_name,
    slug,
    local_phone,
    '✅ Updated' as status
FROM service_locations
WHERE is_active = true
ORDER BY city_name;

-- 6. Also update the site_settings table if needed
-- First check current site_settings
SELECT 
    'Current site_settings' as section,
    key,
    value
FROM site_settings
WHERE key IN ('business_phone', 'whatsapp_business_number');

-- Update business_phone if not already correct
UPDATE site_settings
SET value = '+16048495329'
WHERE key = 'business_phone' 
  AND value != '+16048495329';

-- Update whatsapp_business_number if not already correct
UPDATE site_settings
SET value = '+16048495329'
WHERE key = 'whatsapp_business_number' 
  AND (value != '+16048495329' OR value IS NULL);

-- 7. Verify site_settings update
SELECT 
    'Updated site_settings' as section,
    key,
    value,
    CASE 
        WHEN value = '+16048495329' THEN '✅ Correct'
        ELSE '⚠️ Check'
    END as status
FROM site_settings
WHERE key IN ('business_phone', 'whatsapp_business_number');

-- 8. Summary report
SELECT 
    '📋 SUMMARY REPORT' as section,
    'All phone numbers have been updated to: (604) 849-5329' as message,
    'Format: E.164: +16048495329, Display: (604) 849-5329, Href: tel:+16048495329' as details,
    'Next: Test the website to ensure phone numbers display correctly' as next_steps;

-- Note: If you want to keep different phone numbers for different cities in the future,
-- you can update the local_phone field for specific cities individually.
-- Example for future city-specific numbers:
-- UPDATE service_locations SET local_phone = '+17781234567' WHERE slug = 'vancouver';
-- UPDATE service_locations SET local_phone = '+16049876543' WHERE slug = 'burnaby';