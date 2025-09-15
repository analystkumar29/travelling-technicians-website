-- Sample data for testing the technician-warranty system

-- 1. Create a sample technician
INSERT INTO technicians (
  full_name, 
  email, 
  phone, 
  specializations, 
  active_service_areas, 
  is_active,
  hourly_rate,
  max_daily_bookings
) VALUES (
  'John Smith',
  'john@thetravellingtechnicians.com',
  '604-123-4567',
  ARRAY['mobile', 'laptop'],
  ARRAY['V5K', 'V5L', 'V5M'],
  true,
  85.00,
  8
);

-- 2. Create a sample user profile
INSERT INTO user_profiles (
  id,
  full_name,
  email,
  phone,
  address,
  postal_code,
  city,
  province
) VALUES (
  'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1',  -- This would be the auth.users.id
  'Alice Johnson',
  'alice@example.com',
  '604-987-6543',
  '123 Repair Street',
  'V5K 1A1',
  'Vancouver',
  'British Columbia'
);

-- 3. Create a sample booking with customer email matching the user profile
INSERT INTO bookings (
  reference_number,
  customer_name,
  customer_email,
  customer_phone,
  booking_date,
  booking_time,
  address,
  postal_code,
  city,
  province,
  device_type,
  device_brand,
  device_model,
  service_type,
  additional_notes,
  status
) VALUES (
  'TTB-20250518-1234',
  'Alice Johnson',
  'alice@example.com',
  '604-987-6543',
  '2025-05-25',
  '10:00-12:00',
  '123 Repair Street',
  'V5K 1A1',
  'Vancouver',
  'British Columbia',
  'Mobile',
  'iPhone',
  'iPhone 12 Pro',
  'Screen Replacement',
  'Cracked screen, but device still works',
  'confirmed'
);

-- 4. Get the booking ID
DO $$
DECLARE
  booking_id UUID;
  technician_id UUID;
BEGIN
  -- Get booking ID
  SELECT id INTO booking_id FROM bookings WHERE reference_number = 'TTB-20250518-1234';
  
  -- Get technician ID
  SELECT id INTO technician_id FROM technicians WHERE email = 'john@thetravellingtechnicians.com';
  
  -- 5. Create a sample repair completion
  INSERT INTO repair_completions (
    booking_id,
    technician_id,
    completed_at,
    repair_notes,
    parts_used,
    repair_duration
  ) VALUES (
    booking_id,
    technician_id,
    NOW(),
    'Replaced screen and fixed audio issues',
    '[
      {
        "name": "iPhone 12 Pro Screen",
        "description": "OEM replacement screen",
        "cost": 120
      },
      {
        "name": "iPhone 12 Speaker",
        "description": "OEM replacement speaker",
        "cost": 40
      }
    ]'::JSONB,
    45
  );
END $$;

-- The warranty should be automatically created by the trigger when the repair_completion is inserted 