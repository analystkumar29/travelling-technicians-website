-- Seed data for The Travelling Technicians
-- This script adds initial data to the tables

-- Insert mobile services
INSERT INTO services (name, device_type, description, price_range, doorstep_eligible, estimated_time)
VALUES 
    ('Screen Replacement', 'mobile', 'Replace damaged or cracked screens with high-quality replacement parts.', '$80-$250', TRUE, '30-60 minutes'),
    ('Battery Replacement', 'mobile', 'Replace old or failing batteries to extend device life and improve performance.', '$60-$120', TRUE, '20-40 minutes'),
    ('Charging Port Repair', 'mobile', 'Fix loose or non-functioning charging ports.', '$70-$120', TRUE, '30-60 minutes'),
    ('Speaker/Microphone Repair', 'mobile', 'Resolve audio issues with speakers or microphones.', '$60-$110', TRUE, '30-45 minutes'),
    ('Camera Repair', 'mobile', 'Fix front or rear camera issues.', '$70-$140', TRUE, '30-60 minutes'),
    ('Water Damage Diagnostics', 'mobile', 'Assess and repair water-damaged devices when possible.', '$80-$200', TRUE, '45-90 minutes');

-- Insert laptop services
INSERT INTO services (name, device_type, description, price_range, doorstep_eligible, estimated_time)
VALUES 
    ('Screen Replacement', 'laptop', 'Replace cracked or damaged laptop screens.', '$150-$350', TRUE, '45-90 minutes'),
    ('Battery Replacement', 'laptop', 'Replace old laptop batteries to restore battery life.', '$80-$180', TRUE, '30-60 minutes'),
    ('Keyboard Repair/Replacement', 'laptop', 'Fix or replace damaged laptop keyboards.', '$80-$200', TRUE, '30-60 minutes'),
    ('Trackpad Repair', 'laptop', 'Fix non-responsive or erratic trackpads.', '$90-$170', TRUE, '45-60 minutes'),
    ('RAM Upgrade', 'laptop', 'Increase memory capacity for better performance.', '$60-$200', TRUE, '20-40 minutes'),
    ('HDD/SSD Replacement/Upgrade', 'laptop', 'Replace or upgrade storage drives for better performance or more storage.', '$80-$250', TRUE, '30-60 minutes'),
    ('Software Troubleshooting', 'laptop', 'Resolve software issues, OS problems, and performance optimization.', '$60-$120', TRUE, '45-90 minutes'),
    ('Virus Removal', 'laptop', 'Remove malware and viruses, secure your system.', '$80-$150', TRUE, '60-120 minutes'),
    ('Cooling System Repair', 'laptop', 'Fix overheating issues by cleaning or replacing cooling components.', '$90-$180', TRUE, '45-90 minutes'),
    ('Power Jack Repair', 'laptop', 'Repair or replace damaged power jacks.', '$90-$170', TRUE, '45-90 minutes');

-- Insert service areas
INSERT INTO service_areas (city, province, postal_code_prefix, is_active)
VALUES 
    ('Vancouver', 'British Columbia', 'V5', TRUE),
    ('Vancouver', 'British Columbia', 'V6', TRUE),
    ('Burnaby', 'British Columbia', 'V5', TRUE),
    ('Richmond', 'British Columbia', 'V6V', TRUE),
    ('Richmond', 'British Columbia', 'V6Y', TRUE),
    ('Surrey', 'British Columbia', 'V3', TRUE),
    ('Surrey', 'British Columbia', 'V4', TRUE),
    ('Coquitlam', 'British Columbia', 'V3', TRUE),
    ('North Vancouver', 'British Columbia', 'V7', TRUE),
    ('West Vancouver', 'British Columbia', 'V7', TRUE),
    ('New Westminster', 'British Columbia', 'V3', TRUE),
    ('Delta', 'British Columbia', 'V4', TRUE),
    ('Langley', 'British Columbia', 'V2Y', TRUE),
    ('Langley', 'British Columbia', 'V3A', TRUE);

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category, order_index)
VALUES 
    ('How does the doorstep repair service work?', 'Our technicians come directly to your home or office at a scheduled time. We bring all the necessary tools and parts to complete repairs on-site. Most repairs can be completed within an hour.', 'Doorstep Service', 1),
    ('What areas do you service?', 'We service the entire Lower Mainland including Vancouver, Burnaby, Surrey, Richmond, Coquitlam, North Vancouver, West Vancouver, New Westminster, Delta, and Langley. You can check your service availability during the booking process.', 'Doorstep Service', 2),
    ('How much does doorstep service cost?', 'Our doorstep service is included in the repair price - there are no extra travel fees! We believe in transparent pricing with no hidden charges.', 'Pricing', 3),
    ('Do you offer a warranty on repairs?', 'Yes, all our repairs come with a 1-year warranty covering parts and labor. If any issues arise with the repair work we've done, we'll fix it at no additional cost.', 'Warranty', 4),
    ('What payment methods do you accept?', 'We accept credit cards, debit cards, e-transfers, and cash payments after the service is completed.', 'Pricing', 5),
    ('How quickly can you repair my device?', 'Most repairs are completed on the same day within 30-90 minutes. Complex repairs may take longer, but we'll provide an estimate before beginning work.', 'Repairs', 6),
    ('Do I need to back up my data before repair?', 'Yes, we strongly recommend backing up your data before any repair service. While we take utmost care with your device, there's always a small risk of data loss during repairs.', 'Repairs', 7),
    ('What if my device can't be repaired?', 'If we determine your device cannot be repaired, we'll only charge a diagnostic fee of $30. We can also provide recommendations for replacement options.', 'Pricing', 8),
    ('Do I need to be present during the repair?', 'Yes, someone needs to be present at the location to provide access to our technician and to authorize any additional work if needed.', 'Doorstep Service', 9),
    ('How do I know what's wrong with my device?', 'During booking, you'll provide a description of the issue. Our technician will perform a diagnostic check upon arrival and confirm the problem before proceeding with repairs.', 'Repairs', 10);

-- Insert sample testimonials
INSERT INTO testimonials (customer_name, customer_location, rating, comment, service_type, is_verified, is_featured)
VALUES 
    ('Sarah Johnson', 'Vancouver', 5, 'The technician came to my office and replaced my iPhone screen within 45 minutes. Professional service and very convenient!', 'Screen Replacement', TRUE, TRUE),
    ('Michael Lee', 'Burnaby', 5, 'Great service! My laptop was overheating and they fixed the cooling system right at my kitchen table. Works like new now.', 'Cooling System Repair', TRUE, TRUE),
    ('Emily Wong', 'Richmond', 4, 'Very convenient service. The technician was knowledgeable and fixed my laptop''s keyboard quickly. Saved me a trip to the repair shop!', 'Keyboard Repair/Replacement', TRUE, FALSE),
    ('David Chen', 'Surrey', 5, 'Excellent work replacing my Galaxy phone battery. The technician was on time and very professional. Phone works like new again!', 'Battery Replacement', TRUE, TRUE),
    ('Jennifer Smith', 'North Vancouver', 5, 'Amazing service! The technician came to my home and replaced my MacBook screen the same day I called. Highly recommend!', 'Screen Replacement', TRUE, FALSE); 