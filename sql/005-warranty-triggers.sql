-- Warranty Triggers and Functions
-- This script adds automated triggers for warranty creation and user association

-- 1. Create Automatic Warranty Generation Trigger
CREATE OR REPLACE FUNCTION create_warranty_on_repair_completion()
RETURNS TRIGGER AS $$
DECLARE
    warranty_duration INTEGER := 90; -- Default 90 days warranty
    warranty_code TEXT;
BEGIN
    -- Generate unique warranty code
    warranty_code := 'TTW-' || 
                    TO_CHAR(NEW.completed_at, 'YYYYMMDD') || '-' || 
                    LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Insert warranty record
    INSERT INTO warranties (
        booking_id,
        repair_completion_id,
        technician_id,
        warranty_code,
        issue_date,
        expiry_date,
        status,
        parts_covered
    ) VALUES (
        NEW.booking_id,
        NEW.id,
        NEW.technician_id,
        warranty_code,
        CURRENT_DATE,
        CURRENT_DATE + warranty_duration,
        'active',
        CASE 
            WHEN NEW.parts_used IS NOT NULL THEN 
                (SELECT array_agg(value->>'name') FROM jsonb_array_elements(NEW.parts_used) AS items(value))
            ELSE 
                ARRAY[]::TEXT[]
        END
    );
    
    -- Update booking status
    UPDATE bookings
    SET 
        status = 'completed',
        repair_status = 'completed'
    WHERE id = NEW.booking_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add the trigger to repair_completions table
DROP TRIGGER IF EXISTS after_repair_completion ON repair_completions;
CREATE TRIGGER after_repair_completion
AFTER INSERT ON repair_completions
FOR EACH ROW
EXECUTE FUNCTION create_warranty_on_repair_completion();

-- 2. Function to associate bookings with user profiles if email matches
CREATE OR REPLACE FUNCTION associate_booking_with_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Try to find a matching user profile by email
    UPDATE bookings 
    SET user_id = (
        SELECT id FROM user_profiles 
        WHERE email = NEW.customer_email
        LIMIT 1
    )
    WHERE id = NEW.id
    AND NEW.customer_email IS NOT NULL;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to associate booking with user when created
DROP TRIGGER IF EXISTS after_booking_insert ON bookings;
CREATE TRIGGER after_booking_insert
AFTER INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION associate_booking_with_user();

-- 3. Function to update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at timestamps
DROP TRIGGER IF EXISTS update_technicians_timestamp ON technicians;
CREATE TRIGGER update_technicians_timestamp
BEFORE UPDATE ON technicians
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_user_profiles_timestamp ON user_profiles;
CREATE TRIGGER update_user_profiles_timestamp
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_warranties_timestamp ON warranties;
CREATE TRIGGER update_warranties_timestamp
BEFORE UPDATE ON warranties
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_warranty_claims_timestamp ON warranty_claims;
CREATE TRIGGER update_warranty_claims_timestamp
BEFORE UPDATE ON warranty_claims
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_technician_schedules_timestamp ON technician_schedules;
CREATE TRIGGER update_technician_schedules_timestamp
BEFORE UPDATE ON technician_schedules
FOR EACH ROW
EXECUTE FUNCTION update_timestamp(); 