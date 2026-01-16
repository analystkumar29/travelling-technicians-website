require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function executeSQLSetup() {
  console.log('🚀 Executing SQL Setup...\n');

  try {
    // 1. Execute schema creation
    console.log('📋 1. Creating schema...');
    const schemaSQL = `
-- Create service_categories table
CREATE TABLE IF NOT EXISTS service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    icon_name VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pricing_tiers table
CREATE TABLE IF NOT EXISTS pricing_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    price_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    estimated_delivery_hours INTEGER,
    includes_features TEXT[],
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_locations table
CREATE TABLE IF NOT EXISTS service_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    postal_code_prefixes TEXT[] NOT NULL,
    price_adjustment_percentage DECIMAL(5,2) DEFAULT 0.00,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES service_categories(id) ON DELETE SET NULL,
    device_type_id INTEGER REFERENCES device_types(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    estimated_duration_minutes INTEGER DEFAULT 60,
    warranty_period_days INTEGER DEFAULT 365,
    is_doorstep_eligible BOOLEAN DEFAULT true,
    requires_diagnostics BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, device_type_id, name)
);

-- Create dynamic_pricing table
CREATE TABLE IF NOT EXISTS dynamic_pricing (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    model_id INTEGER REFERENCES device_models(id) ON DELETE CASCADE,
    pricing_tier_id INTEGER REFERENCES pricing_tiers(id) ON DELETE CASCADE,
    base_price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 year',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(service_id, model_id, pricing_tier_id)
);
`;

    const { error: schemaError } = await supabase.rpc('exec_sql', { sql: schemaSQL });
    if (schemaError) {
      console.log(`   ⚠️  Schema error: ${schemaError.message}`);
    } else {
      console.log('   ✅ Schema created successfully');
    }

    // 2. Insert data
    console.log('📋 2. Inserting data...');
    const dataSQL = `
-- Insert service categories
INSERT INTO service_categories (name, display_name, description, icon_name, sort_order) VALUES
('screen_repair', 'Screen Repair', 'Screen replacement and display repairs', 'screen', 1),
('battery_repair', 'Battery Repair', 'Battery replacement and power-related repairs', 'battery', 2),
('charging_repair', 'Charging Repair', 'Charging port and power jack repairs', 'charging', 3),
('audio_repair', 'Audio Repair', 'Speaker and microphone repairs', 'audio', 4),
('camera_repair', 'Camera Repair', 'Camera module and lens repairs', 'camera', 5),
('input_repair', 'Input Device Repair', 'Keyboard, trackpad, and button repairs', 'keyboard', 6),
('hardware_upgrade', 'Hardware Upgrade', 'Memory, storage, and component upgrades', 'memory', 7),
('software_repair', 'Software Repair', 'Software troubleshooting and optimization', 'software', 8),
('diagnostics', 'Diagnostics', 'Device diagnostics and assessments', 'diagnostics', 9)
ON CONFLICT (name) DO NOTHING;

-- Insert pricing tiers
INSERT INTO pricing_tiers (name, display_name, description, price_multiplier, estimated_delivery_hours, includes_features, sort_order) VALUES
('economy', 'Economy Repair', 'Budget-friendly repair with quality parts and standard warranty', 0.85, 48, ARRAY['6-Month Warranty', 'Quality Parts', 'Professional Service', 'Free Pickup & Delivery (Doorstep)', 'Free Diagnostics'], 1),
('standard', 'Standard Repair', 'Quality repair with standard timeframe and full warranty', 1.00, 24, ARRAY['1-Year Warranty', 'Quality Parts', 'Professional Service', 'Free Pickup & Delivery (Doorstep)', 'Free Diagnostics'], 2),
('premium', 'Premium Service', 'Priority service with premium parts and expedited handling', 1.25, 12, ARRAY['1-Year Warranty', 'Premium Parts', 'Priority Service', 'Free Pickup & Delivery (Doorstep)', 'Free Diagnostics', 'Express Handling', 'Quality Assurance Check'], 3),
('same_day', 'Same Day Service', 'Urgent repair completed within hours with premium service', 1.50, 4, ARRAY['1-Year Warranty', 'Premium Parts', 'Same Day Completion', 'Free Pickup & Delivery (Doorstep)', 'Free Diagnostics', 'Priority Technician Assignment', 'Rush Service Fee Included', 'Quality Assurance Check'], 4)
ON CONFLICT (name) DO NOTHING;

-- Insert service locations
INSERT INTO service_locations (name, postal_code_prefixes, price_adjustment_percentage, sort_order) VALUES
('Vancouver Downtown', ARRAY['V6B', 'V6C', 'V6E', 'V6G', 'V6Z'], 5.0, 1),
('Vancouver West Side', ARRAY['V6H', 'V6J', 'V6K', 'V6L', 'V6M', 'V6N', 'V6P', 'V6R', 'V6S', 'V6T'], 2.0, 2),
('Vancouver East Side', ARRAY['V5K', 'V5L', 'V5M', 'V5N', 'V5P', 'V5R', 'V5S', 'V5T', 'V5V', 'V5W', 'V5X', 'V5Y', 'V5Z', 'V6A'], 0.0, 3),
('Richmond', ARRAY['V6X', 'V6Y', 'V7A', 'V7B', 'V7C', 'V7E'], 3.0, 4),
('Burnaby', ARRAY['V3J', 'V3N', 'V5A', 'V5B', 'V5C', 'V5E', 'V5G', 'V5H', 'V5J'], 0.0, 5),
('Surrey', ARRAY['V3R', 'V3S', 'V3T', 'V3V', 'V3W', 'V3X', 'V3Y', 'V3Z', 'V4A', 'V4B', 'V4C', 'V4N', 'V4P'], -2.0, 6),
('Coquitlam', ARRAY['V3B', 'V3C', 'V3E', 'V3H', 'V3K'], 0.0, 7),
('North Vancouver', ARRAY['V7G', 'V7H', 'V7J', 'V7K', 'V7L', 'V7M', 'V7N', 'V7P', 'V7R'], 1.0, 8),
('West Vancouver', ARRAY['V7S', 'V7T', 'V7V', 'V7W'], 4.0, 9),
('New Westminster', ARRAY['V3L', 'V3M'], 0.0, 10),
('Delta', ARRAY['V4C', 'V4E', 'V4G', 'V4K', 'V4L', 'V4M'], -1.0, 11),
('Langley', ARRAY['V1M', 'V2Y', 'V2Z', 'V3A'], -1.0, 12)
ON CONFLICT (name) DO NOTHING;
`;

    const { error: dataError } = await supabase.rpc('exec_sql', { sql: dataSQL });
    if (dataError) {
      console.log(`   ⚠️  Data error: ${dataError.message}`);
    } else {
      console.log('   ✅ Data inserted successfully');
    }

    // 3. Insert services
    console.log('📋 3. Inserting services...');
    const servicesSQL = `
-- Insert mobile services
INSERT INTO services (category_id, device_type_id, name, display_name, description, estimated_duration_minutes, warranty_period_days, is_doorstep_eligible, requires_diagnostics, sort_order) VALUES
((SELECT id FROM service_categories WHERE name = 'screen_repair'), (SELECT id FROM device_types WHERE name = 'mobile'), 'screen_replacement', 'Screen Replacement', 'Replace damaged or cracked screens with high-quality parts', 45, 365, true, false, 1),
((SELECT id FROM service_categories WHERE name = 'battery_repair'), (SELECT id FROM device_types WHERE name = 'mobile'), 'battery_replacement', 'Battery Replacement', 'Replace old or failing batteries to extend device life', 30, 365, true, false, 2),
((SELECT id FROM service_categories WHERE name = 'charging_repair'), (SELECT id FROM device_types WHERE name = 'mobile'), 'charging_port_repair', 'Charging Port Repair', 'Fix loose or non-functioning charging ports', 45, 365, true, false, 3),
((SELECT id FROM service_categories WHERE name = 'audio_repair'), (SELECT id FROM device_types WHERE name = 'mobile'), 'speaker_microphone_repair', 'Speaker/Microphone Repair', 'Resolve audio issues with speakers or microphones', 40, 365, true, false, 4),
((SELECT id FROM service_categories WHERE name = 'camera_repair'), (SELECT id FROM device_types WHERE name = 'mobile'), 'camera_repair', 'Camera Repair', 'Fix front or rear camera issues', 50, 365, true, false, 5),
((SELECT id FROM service_categories WHERE name = 'diagnostics'), (SELECT id FROM device_types WHERE name = 'mobile'), 'water_damage_diagnostics', 'Water Damage Diagnostics', 'Assess and repair water-damaged devices when possible', 90, 180, true, true, 13),

-- Insert laptop services
((SELECT id FROM service_categories WHERE name = 'screen_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'screen_replacement', 'Screen Replacement', 'Replace cracked or damaged laptop screens', 60, 365, true, false, 1),
((SELECT id FROM service_categories WHERE name = 'battery_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'battery_replacement', 'Battery Replacement', 'Replace old laptop batteries to restore battery life', 45, 365, true, false, 2),
((SELECT id FROM service_categories WHERE name = 'charging_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'power_jack_repair', 'Power Jack Repair', 'Fix laptop power jack and charging issues', 50, 365, true, false, 3),
((SELECT id FROM service_categories WHERE name = 'audio_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'speaker_repair', 'Speaker Repair', 'Fix laptop speaker and audio issues', 45, 365, true, false, 4),
((SELECT id FROM service_categories WHERE name = 'camera_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'webcam_repair', 'Webcam Repair', 'Fix laptop webcam and video issues', 40, 365, true, false, 5),
((SELECT id FROM service_categories WHERE name = 'input_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'keyboard_repair', 'Keyboard Repair/Replacement', 'Fix or replace damaged laptop keyboards', 50, 365, true, false, 6),
((SELECT id FROM service_categories WHERE name = 'input_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'trackpad_repair', 'Trackpad Repair', 'Fix non-responsive or erratic trackpads', 45, 365, true, false, 7),
((SELECT id FROM service_categories WHERE name = 'hardware_upgrade'), (SELECT id FROM device_types WHERE name = 'laptop'), 'ram_upgrade', 'RAM Upgrade', 'Increase memory capacity for better performance', 30, 365, true, false, 8),
((SELECT id FROM service_categories WHERE name = 'hardware_upgrade'), (SELECT id FROM device_types WHERE name = 'laptop'), 'storage_upgrade', 'HDD/SSD Replacement/Upgrade', 'Replace or upgrade storage drives for better performance', 45, 365, true, false, 9),
((SELECT id FROM service_categories WHERE name = 'software_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'software_troubleshooting', 'Software Troubleshooting', 'Resolve software issues and performance problems', 90, 90, true, true, 10),
((SELECT id FROM service_categories WHERE name = 'software_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'virus_removal', 'Virus Removal', 'Remove malware and implement security measures', 120, 90, true, true, 11),
((SELECT id FROM service_categories WHERE name = 'software_repair'), (SELECT id FROM device_types WHERE name = 'laptop'), 'os_installation', 'OS Installation/Repair', 'Install or repair operating system', 180, 90, true, true, 12),
((SELECT id FROM service_categories WHERE name = 'diagnostics'), (SELECT id FROM device_types WHERE name = 'laptop'), 'hardware_diagnostics', 'Hardware Diagnostics', 'Comprehensive hardware testing and diagnosis', 60, 90, true, true, 13),

-- Insert tablet services
((SELECT id FROM service_categories WHERE name = 'screen_repair'), (SELECT id FROM device_types WHERE name = 'tablet'), 'screen_replacement', 'Screen Replacement', 'Replace damaged or cracked tablet screens', 50, 365, true, false, 1),
((SELECT id FROM service_categories WHERE name = 'battery_repair'), (SELECT id FROM device_types WHERE name = 'tablet'), 'battery_replacement', 'Battery Replacement', 'Replace old tablet batteries to extend device life', 40, 365, true, false, 2),
((SELECT id FROM service_categories WHERE name = 'diagnostics'), (SELECT id FROM device_types WHERE name = 'tablet'), 'general_diagnostics', 'General Diagnostics', 'Complete device assessment and diagnostics', 60, 90, true, true, 13)

ON CONFLICT (category_id, device_type_id, name) DO NOTHING;
`;

    const { error: servicesError } = await supabase.rpc('exec_sql', { sql: servicesSQL });
    if (servicesError) {
      console.log(`   ⚠️  Services error: ${servicesError.message}`);
    } else {
      console.log('   ✅ Services inserted successfully');
    }

    // 4. Verify results
    console.log('\n📋 4. Verifying results...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const tables = ['service_categories', 'pricing_tiers', 'service_locations', 'services'];
    for (const table of tables) {
      try {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: ${count || 0} records`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`);
      }
    }

    console.log('\n🎉 SQL Setup Completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

executeSQLSetup().catch(console.error); 