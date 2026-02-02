-- Add postal_code_prefixes column to service_locations table
ALTER TABLE service_locations 
ADD COLUMN postal_code_prefixes text[] DEFAULT '{}';

-- Add Vancouver postal codes (major prefixes)
UPDATE service_locations 
SET postal_code_prefixes = ARRAY['V5K', 'V6B', 'V6C', 'V6E', 'V6G', 'V6J', 'V6K', 'V6L', 'V6M', 'V6N', 'V6P', 'V6R', 'V6S', 'V6T', 'V6Z']
WHERE city_name = 'Vancouver';

-- Add Burnaby postal codes  
UPDATE service_locations 
SET postal_code_prefixes = ARRAY['V5A', 'V5B', 'V5C', 'V5G', 'V5H', 'V5J']
WHERE city_name = 'Burnaby';

-- Add Surrey postal codes
UPDATE service_locations 
SET postal_code_prefixes = ARRAY['V3R', 'V3S', 'V3T', 'V3V', 'V3W', 'V3X', 'V4A']
WHERE city_name = 'Surrey';

-- Add Richmond postal codes
UPDATE service_locations 
SET postal_code_prefixes = ARRAY['V6V', 'V6W', 'V6X', 'V6Y', 'V7A', 'V7B', 'V7C', 'V7E']
WHERE city_name = 'Richmond';

-- Add Coquitlam postal codes
UPDATE service_locations 
SET postal_code_prefixes = ARRAY['V3B', 'V3C', 'V3K']
WHERE city_name = 'Coquitlam';

-- Add North Vancouver postal codes
UPDATE service_locations 
SET postal_code_prefixes = ARRAY['V7G', 'V7H', 'V7J', 'V7K', 'V7L', 'V7M', 'V7N', 'V7P', 'V7R']
WHERE city_name = 'North Vancouver';

-- Add West Vancouver postal codes
UPDATE service_locations 
SET postal_code_prefixes = ARRAY['V7S', 'V7T', 'V7V', 'V7W']
WHERE city_name = 'West Vancouver';

-- Add New Westminster postal codes
UPDATE service_locations 
SET postal_code_prefixes = ARRAY['V3L', 'V3M']
WHERE city_name = 'New Westminster';

-- Add Delta postal codes
UPDATE service_locations 
SET postal_code_prefixes = ARRAY['V4C', 'V4E', 'V4G', 'V4K', 'V4L', 'V4M']
WHERE city_name = 'Delta';

-- Add Langley postal codes
UPDATE service_locations 
SET postal_code_prefixes = ARRAY['V1M', 'V2Y', 'V2Z', 'V3A']
WHERE city_name = 'Langley';

-- Add Abbotsford postal codes
UPDATE service_locations 
SET postal_code_prefixes = ARRAY['V2S', 'V2T', 'V3G']
WHERE city_name = 'Abbotsford';

-- Add Chilliwack postal codes
UPDATE service_locations 
SET postal_code_prefixes = ARRAY['V2P', 'V2R']
WHERE city_name = 'Chilliwack';

-- Add Squamish postal codes
UPDATE service_locations 
SET postal_code_prefixes = ARRAY['V8B',V0N"]
WHERE city_name = 'Squamish';