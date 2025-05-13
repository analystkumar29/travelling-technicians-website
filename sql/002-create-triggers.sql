-- Create triggers for The Travelling Technicians
-- This script creates the necessary triggers for the website

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create booking reference generator
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reference_number := CONCAT('TTB-', TO_CHAR(NOW(), 'YYYYMMDD'), '-', LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger for bookings
DROP TRIGGER IF EXISTS set_timestamp_bookings ON bookings;
CREATE TRIGGER set_timestamp_bookings
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create reference number trigger for bookings
DROP TRIGGER IF EXISTS set_booking_reference ON bookings;
CREATE TRIGGER set_booking_reference
BEFORE INSERT ON bookings
FOR EACH ROW
WHEN (NEW.reference_number IS NULL)
EXECUTE FUNCTION generate_booking_reference();

-- Create updated_at trigger for services
DROP TRIGGER IF EXISTS set_timestamp_services ON services;
CREATE TRIGGER set_timestamp_services
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create updated_at trigger for service_areas
DROP TRIGGER IF EXISTS set_timestamp_service_areas ON service_areas;
CREATE TRIGGER set_timestamp_service_areas
BEFORE UPDATE ON service_areas
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create updated_at trigger for faqs
DROP TRIGGER IF EXISTS set_timestamp_faqs ON faqs;
CREATE TRIGGER set_timestamp_faqs
BEFORE UPDATE ON faqs
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 