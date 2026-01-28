-- =============================================================================
-- ESSENTIAL BUSINESS DATA - RUN THIS TO START OPERATING
-- =============================================================================

-- 1. SITE SETTINGS (Configure your business)
INSERT INTO site_settings (key, value, description) VALUES
('business_name', 'Travelling Technicians', 'Your company name'),
('business_phone', '+1604XXXXXXX', 'Main contact number'),
('business_email', 'info@travelling-technicians.ca', 'Contact email'),
('whatsapp_business_number', '+1604XXXXXXX', 'WhatsApp Business API number'),
('business_hours', '{"weekdays": "9am-7pm", "weekends": "10am-5pm", "emergency": true}', 'Operating hours'),
('same_day_cutoff_time', '15:00:00', 'Last time for same-day bookings'),
('tax_rate', '0.12', 'BC GST+PST rate (12%)'),
('currency', 'CAD', 'Currency'),
('sms_enabled', 'true', 'SMS notifications'),
('email_enabled', 'true', 'Email notifications'),
('emergency_surcharge', '25.00', 'Emergency same-day fee'),
('base_travel_fee', '10.00', 'Base travel charge'),
('warranty_days', '90', 'Standard warranty period');

-- 2. INSERT ALL 12 SERVICE LOCATIONS
INSERT INTO service_locations (city_name, slug, base_travel_fee) VALUES
('Burnaby', 'burnaby', 0),
('Vancouver', 'vancouver', 0),
('Richmond', 'richmond', 10),
('North Vancouver', 'north-vancouver', 15),
('West Vancouver', 'west-vancouver', 20),
('New Westminster', 'new-westminster', 10),
('Surrey', 'surrey', 0),
('Delta', 'delta', 10),
('Langley', 'langley', 15),
('Abbotsford', 'abbotsford', 20),
('Squamish', 'squamish', 30),
('Chilliwack', 'chilliwack', 25);

-- 3. INSERT YOUR 7 TECHNICIANS
INSERT INTO technicians (full_name, whatsapp_number, current_status) VALUES
('Manoj Kumar', '+16045550001', 'available'),
('Manmohan Singh', '+16045550002', 'available'),
('Vishal Sharma', '+16045550003', 'available'),
('Kapil Sihag', '+16045550004', 'available'),
('Diwan Potlia', '+16045550005', 'available'),
('Vipin Sihag', '+16045550006', 'available'),
('Mohit Punia', '+16045550007', 'available');

-- 4. BRANDS
INSERT INTO brands (name, slug) VALUES 
('Apple', 'apple'),
('Samsung', 'samsung'),
('Google', 'google');

-- 5. DEVICE TYPES
INSERT INTO device_types (name, slug) VALUES 
('Smartphone', 'smartphone'),
('Laptop', 'laptop');

-- 6. SERVICES
INSERT INTO services (name, slug, description) VALUES 
('Screen Repair', 'screen-repair', 'Professional screen replacement with 90-day warranty'),
('Battery Replacement', 'battery-replacement', 'Original quality battery with 90-day warranty');

-- 7. SAMPLE TESTIMONIALS (SEO)
INSERT INTO testimonials (customer_name, city, rating, review, is_featured) VALUES
('Sarah Johnson', 'Vancouver', 5, 'Fast and professional service at my office! My iPhone screen looks brand new.', true),
('Michael Chen', 'Burnaby', 5, 'Technician arrived on time and fixed my Samsung in 30 minutes. Highly recommend!', true),
('Priya Patel', 'Surrey', 4, 'Great service for my Pixel phone. Will definitely use again.', true);