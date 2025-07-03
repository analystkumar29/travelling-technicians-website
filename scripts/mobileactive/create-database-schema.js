// Database Schema Generator for Master Dataset
// Creates tables for supplier data, parts inventory, and pricing

const fs = require('fs/promises');
const path = require('path');

// Configuration
const MASTER_DATASET_PATH = path.join(process.cwd(), 'tmp/master-dataset.json');
const SCHEMA_OUTPUT_PATH = path.join(process.cwd(), 'tmp/database-schema.sql');
const SCHEMA_DOCS_PATH = path.join(process.cwd(), 'tmp/schema-documentation.md');

const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }[level];
  console.log(`${timestamp} ${emoji} ${message}`);
};

// Generate SQL schema
function generateSchema() {
  return `
-- Master Dataset Database Schema for The Travelling Technicians
-- Generated: ${new Date().toISOString()}

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    website_url VARCHAR(255),
    api_endpoint VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'testing')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device types table
CREATE TABLE IF NOT EXISTS device_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    logo_url VARCHAR(255),
    device_type_id INTEGER REFERENCES device_types(id),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device models table
CREATE TABLE IF NOT EXISTS device_models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    brand_id INTEGER REFERENCES brands(id),
    model_variant VARCHAR(50), -- Pro, Max, Plus, etc.
    model_year INTEGER,
    device_type_id INTEGER REFERENCES device_types(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(brand_id, name, model_variant)
);

-- Service types table
CREATE TABLE IF NOT EXISTS service_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    device_type_id INTEGER REFERENCES device_types(id),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quality tiers table
CREATE TABLE IF NOT EXISTS quality_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    warranty_months INTEGER DEFAULT 0,
    turnaround_hours INTEGER DEFAULT 48,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assembly types table
CREATE TABLE IF NOT EXISTS assembly_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INVENTORY TABLES
-- =====================================================

-- Parts inventory table (master parts catalog)
CREATE TABLE IF NOT EXISTS parts_inventory (
    id SERIAL PRIMARY KEY,
    master_id VARCHAR(100) NOT NULL UNIQUE, -- supplier_product_id format
    supplier_id INTEGER REFERENCES suppliers(id),
    supplier_product_id VARCHAR(100) NOT NULL,
    supplier_sku VARCHAR(100),
    
    -- Device information
    device_type_id INTEGER REFERENCES device_types(id),
    brand_id INTEGER REFERENCES brands(id),
    model_id INTEGER REFERENCES device_models(id),
    service_type_id INTEGER REFERENCES service_types(id),
    
    -- Part information
    part_title VARCHAR(255) NOT NULL,
    part_description TEXT,
    quality_tier_id INTEGER REFERENCES quality_tiers(id),
    assembly_type_id INTEGER REFERENCES assembly_types(id),
    
    -- Pricing information
    cost_price DECIMAL(10,2) NOT NULL,
    suggested_retail_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'CAD',
    
    -- Availability information
    availability_status VARCHAR(20) DEFAULT 'unknown' CHECK (availability_status IN ('in_stock', 'limited_stock', 'out_of_stock', 'discontinued', 'unknown')),
    stock_quantity VARCHAR(50) DEFAULT 'check_supplier',
    lead_time_days INTEGER DEFAULT 7,
    
    -- Supplier information
    supplier_url VARCHAR(255),
    supplier_image_url VARCHAR(255),
    
    -- Metadata
    data_source VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRICING TABLES
-- =====================================================

-- Pricing tiers table (for customer-facing pricing)
CREATE TABLE IF NOT EXISTS pricing_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    multiplier DECIMAL(4,2) NOT NULL, -- 0.80 for economy, 1.00 for standard, etc.
    warranty_months INTEGER DEFAULT 6,
    turnaround_hours INTEGER DEFAULT 48,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dynamic pricing table (customer-facing pricing)
CREATE TABLE IF NOT EXISTS dynamic_pricing (
    id SERIAL PRIMARY KEY,
    service_type_id INTEGER REFERENCES service_types(id),
    model_id INTEGER REFERENCES device_models(id),
    pricing_tier_id INTEGER REFERENCES pricing_tiers(id),
    base_price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(service_type_id, model_id, pricing_tier_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_parts_inventory_supplier ON parts_inventory(supplier_id);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_device_type ON parts_inventory(device_type_id);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_brand ON parts_inventory(brand_id);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_model ON parts_inventory(model_id);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_service ON parts_inventory(service_type_id);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_availability ON parts_inventory(availability_status);
CREATE INDEX IF NOT EXISTS idx_parts_inventory_active ON parts_inventory(is_active);

CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_service_model ON dynamic_pricing(service_type_id, model_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_tier ON dynamic_pricing(pricing_tier_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_active ON dynamic_pricing(is_active);

CREATE INDEX IF NOT EXISTS idx_device_models_brand ON device_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_device_models_featured ON device_models(is_featured, is_active);
CREATE INDEX IF NOT EXISTS idx_brands_device_type ON brands(device_type_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all tables
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_device_types_updated_at BEFORE UPDATE ON device_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_device_models_updated_at BEFORE UPDATE ON device_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_types_updated_at BEFORE UPDATE ON service_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_tiers_updated_at BEFORE UPDATE ON quality_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assembly_types_updated_at BEFORE UPDATE ON assembly_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parts_inventory_updated_at BEFORE UPDATE ON parts_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_tiers_updated_at BEFORE UPDATE ON pricing_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dynamic_pricing_updated_at BEFORE UPDATE ON dynamic_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default device types
INSERT INTO device_types (name, display_name, description, sort_order) VALUES
('mobile', 'Mobile Phones', 'Smartphones and mobile devices', 1),
('tablet', 'Tablets', 'Tablet devices and iPads', 2),
('laptop', 'Laptops', 'Laptop and notebook computers', 3)
ON CONFLICT (name) DO NOTHING;

-- Insert default service types
INSERT INTO service_types (name, display_name, description, device_type_id, sort_order) VALUES
('screen_replacement', 'Screen Replacement', 'LCD/OLED screen replacement', 1, 1),
('battery_replacement', 'Battery Replacement', 'Battery replacement service', 1, 2),
('charging_port_repair', 'Charging Port Repair', 'USB/lightning port repair', 1, 3),
('camera_repair', 'Camera Repair', 'Camera module replacement', 1, 4),
('speaker_repair', 'Speaker Repair', 'Speaker replacement', 1, 5),
('microphone_repair', 'Microphone Repair', 'Microphone replacement', 1, 6),
('back_cover_replacement', 'Back Cover Replacement', 'Housing/back cover replacement', 1, 7)
ON CONFLICT (name) DO NOTHING;

-- Insert default quality tiers
INSERT INTO quality_tiers (name, display_name, description, warranty_months, turnaround_hours, sort_order) VALUES
('economy', 'Economy', 'Budget-friendly aftermarket parts', 3, 72, 1),
('aftermarket', 'Aftermarket', 'Quality aftermarket parts', 6, 48, 2),
('premium', 'Premium', 'High-quality aftermarket parts', 12, 24, 3),
('oem', 'OEM', 'Original equipment manufacturer parts', 12, 24, 4),
('refurbished', 'Refurbished', 'Refurbished original parts', 6, 48, 5)
ON CONFLICT (name) DO NOTHING;

-- Insert default assembly types
INSERT INTO assembly_types (name, display_name, description, sort_order) VALUES
('screen_only', 'Screen Only', 'Screen component only', 1),
('with_frame', 'With Frame', 'Complete assembly with frame', 2),
('digitizer_only', 'Digitizer Only', 'Touch digitizer only', 3),
('unknown', 'Unknown', 'Assembly type not specified', 4)
ON CONFLICT (name) DO NOTHING;

-- Insert default pricing tiers
INSERT INTO pricing_tiers (name, display_name, description, multiplier, warranty_months, turnaround_hours, sort_order) VALUES
('economy', 'Economy', 'Budget-friendly service with economy parts', 0.80, 3, 72, 1),
('standard', 'Standard', 'Standard service with quality parts', 1.00, 6, 48, 2),
('premium', 'Premium', 'Premium service with high-quality parts', 1.25, 12, 24, 3),
('express', 'Express', 'Fast service with premium parts', 1.50, 6, 12, 4)
ON CONFLICT (name) DO NOTHING;

-- Insert default suppliers
INSERT INTO suppliers (name, website_url, status) VALUES
('mobileactive', 'https://mobileactive.ca', 'active'),
('mobilesentrix', 'https://mobilesentrix.ca', 'active')
ON CONFLICT (name) DO NOTHING;
`;
}

// Generate documentation
function generateDocumentation() {
  return `# Master Dataset Database Schema Documentation

## Overview
This schema is designed to support a multi-supplier parts inventory system for The Travelling Technicians. It separates supplier data from customer-facing pricing and provides flexibility for adding new suppliers.

## Table Structure

### Core Tables

#### suppliers
- Stores supplier information (MobileActive, MobileSentrix, etc.)
- Each supplier has a unique ID and status

#### device_types
- Standardized device categories (mobile, tablet, laptop)
- Maps to your existing device_types table

#### brands
- Device brands (Apple, Samsung, etc.)
- Links to device_types for filtering

#### device_models
- Specific device models (iPhone 15, Galaxy S24, etc.)
- Includes variants (Pro, Max, Plus) and years
- Links to brands and device_types

#### service_types
- Repair services (screen replacement, battery replacement, etc.)
- Links to device_types for service availability

#### quality_tiers
- Part quality levels (economy, aftermarket, premium, OEM, refurbished)
- Includes warranty and turnaround time information

#### assembly_types
- How parts are assembled (screen only, with frame, digitizer only)
- Affects installation complexity and pricing

### Inventory Tables

#### parts_inventory
- **Master parts catalog** from all suppliers
- Contains supplier-specific information
- Links to all reference tables
- Includes availability and pricing information
- This is your "source of truth" for what parts you can actually offer

### Pricing Tables

#### pricing_tiers
- Customer-facing pricing tiers (economy, standard, premium, express)
- Includes multipliers, warranty, and turnaround times
- Maps to your existing pricing_tiers table

#### dynamic_pricing
- Customer-facing pricing matrix
- Links service + model + pricing tier to final price
- Maps to your existing dynamic_pricing table

## Data Flow

1. **Supplier Data Import**: Raw supplier data → parts_inventory
2. **Brand/Model Mapping**: parts_inventory → brands, device_models
3. **Pricing Generation**: parts_inventory + pricing_tiers → dynamic_pricing
4. **Customer Interface**: dynamic_pricing → website pricing display

## Key Benefits

- **Supplier Independence**: Add new suppliers without changing core structure
- **Availability Tracking**: Only offer services for parts you actually have
- **Quality Differentiation**: Support multiple quality tiers per service
- **Flexible Pricing**: Dynamic pricing based on parts cost + markup
- **Scalable**: Easy to add new device types, brands, services

## Migration Strategy

1. Create new tables alongside existing ones
2. Import MobileActive data to parts_inventory
3. Import MobileSentrix data to parts_inventory
4. Generate dynamic_pricing from parts_inventory
5. Switch website to use new pricing system
6. Deprecate old pricing tables

## Next Steps

1. Review and customize the schema
2. Create the tables in your database
3. Import MobileActive master dataset
4. Add MobileSentrix data
5. Generate customer-facing pricing
6. Update website to use new system
`;
}

// Main function
async function generateDatabaseSchema() {
  try {
    log('🔍 Loading master dataset for analysis...');
    const masterData = JSON.parse(await fs.readFile(MASTER_DATASET_PATH, 'utf8'));
    log(`📊 Loaded ${masterData.length} records for schema analysis`);
    
    log('📝 Generating database schema...');
    const schema = generateSchema();
    await fs.writeFile(SCHEMA_OUTPUT_PATH, schema);
    
    log('📚 Generating documentation...');
    const docs = generateDocumentation();
    await fs.writeFile(SCHEMA_DOCS_PATH, docs);
    
    log('✅ DATABASE SCHEMA GENERATION COMPLETE');
    log('=====================================');
    log(`📊 Master Dataset Records: ${masterData.length}`);
    log(`📊 Unique Brands: ${new Set(masterData.map(r => r.brand)).size}`);
    log(`📊 Unique Services: ${new Set(masterData.map(r => r.service_type)).size}`);
    log(`📊 Quality Tiers: ${new Set(masterData.map(r => r.quality_tier)).size}`);
    log('');
    log('📁 Files Generated:');
    log(`   SQL Schema: ${SCHEMA_OUTPUT_PATH}`);
    log(`   Documentation: ${SCHEMA_DOCS_PATH}`);
    log('');
    log('🎯 Next Steps:');
    log('   1. Review the generated schema');
    log('   2. Customize tables as needed');
    log('   3. Create tables in your database');
    log('   4. Import master dataset to parts_inventory');
    log('   5. Add MobileSentrix data');
    log('   6. Generate dynamic pricing');
    
  } catch (error) {
    log(`❌ Schema generation failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the generator
generateDatabaseSchema(); 