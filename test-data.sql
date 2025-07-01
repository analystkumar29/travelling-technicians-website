-- Insert test data for warranty system testing

-- 1. Insert a test technician
INSERT INTO technicians (full_name, email, phone, specializations, active_service_areas, is_active, hourly_rate, max_daily_bookings)
VALUES (
  'Test Technician', 
  'tech@thetravellingtechnicians.com', 
  '604-123-4567', 
  ARRAY['mobile', 'laptop']::TEXT[], 
  ARRAY['V5K', 'V5L', 'V5M']::TEXT[], 
  TRUE, 
  85.00, 
  8
) ON CONFLICT (email) DO NOTHING
RETURNING id;

-- 2. Insert a test booking if not exists
DO $$
DECLARE
  booking_id UUID;
  tech_id UUID;
BEGIN
  -- Get technician ID
  SELECT id INTO tech_id FROM technicians WHERE email = 'tech@thetravellingtechnicians.com' LIMIT 1;

  -- Check if we already have a test booking
  SELECT id INTO booking_id FROM bookings WHERE reference_number LIKE '%TEST%' LIMIT 1;
  
  IF booking_id IS NULL THEN
    -- Insert a test booking
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
      status,
      repair_status
    )
    VALUES (
      'TTB-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-TEST',
      'Test Customer',
      'test@example.com',
      '604-555-1234',
      CURRENT_DATE,
      '10:00-12:00',
      '123 Test Street',
      'V5K 1A1',
      'Vancouver',
      'British Columbia',
      'Mobile',
      'iPhone',
      'iPhone 12',
      'Screen Replacement',
      'Test booking for warranty system',
      'confirmed',
      'pending'
    )
    RETURNING id INTO booking_id;
  END IF;

  -- 3. Check if we have a repair completion
  IF booking_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM repair_completions WHERE booking_id = booking_id) THEN
    -- Insert a repair completion
    INSERT INTO repair_completions (
      booking_id,
      technician_id,
      completed_at,
      repair_notes,
      parts_used,
      repair_duration
    )
    VALUES (
      booking_id,
      tech_id,
      NOW(),
      'Test repair for warranty system',
      '[{"name":"iPhone iPhone 12 Screen", "description":"OEM replacement screen", "cost":120}, {"name":"iPhone Battery", "description":"OEM replacement battery", "cost":60}]'::JSONB,
      45
    );
  END IF;

  -- 4. Check if warranty was created automatically (via trigger) or insert manually
  IF booking_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM warranties WHERE booking_id = booking_id) THEN
    -- Manually create a warranty
    INSERT INTO warranties (
      booking_id,
      repair_completion_id,
      technician_id,
      warranty_code,
      issue_date,
      expiry_date,
      status,
      parts_covered,
      notes
    )
    VALUES (
      booking_id,
      (SELECT id FROM repair_completions WHERE booking_id = booking_id),
      tech_id,
      'TTW-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-TEST',
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '90 days',
      'active',
      ARRAY['Screen', 'Battery']::TEXT[],
      'Test warranty created manually'
    );
  END IF;
END $$; 