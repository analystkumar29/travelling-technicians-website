-- SQL Migration: Update unique constraints to support same service names across device types
-- This migration drops the existing unique constraints and adds composite unique constraints
-- that allow the same service name to exist for different device types.

-- Drop existing unique constraints
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_key;
ALTER TABLE brands DROP CONSTRAINT IF EXISTS brands_name_key;

-- Add composite unique constraints
ALTER TABLE services ADD CONSTRAINT services_name_device_type_id_key UNIQUE (name, device_type_id);
ALTER TABLE brands ADD CONSTRAINT brands_name_device_type_id_key UNIQUE (name, device_type_id);

-- Verify the changes
COMMENT ON CONSTRAINT services_name_device_type_id_key ON services IS 'Allows same service name across different device types';
COMMENT ON CONSTRAINT brands_name_device_type_id_key ON brands IS 'Allows same brand name across different device types';