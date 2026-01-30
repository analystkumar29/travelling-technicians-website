-- Add Surrey neighborhoods for local SEO targeting
-- Date: January 30, 2026
-- Purpose: Complete neighborhood arrays for all Top 5 cities + Surrey for Map Pack visibility

UPDATE service_locations 
SET neighborhoods = ARRAY[
  'Guildford', 
  'Newton', 
  'Fleetwood', 
  'Whalley', 
  'Cloverdale',
  'South Surrey',
  'Panorama',
  'Bridgeview'
]
WHERE city_name = 'Surrey'
AND is_active = true;

-- Verification: Check all cities now have neighborhoods
SELECT 
  city_name,
  array_length(neighborhoods, 1) as neighborhood_count,
  neighborhoods
FROM service_locations
WHERE is_active = true
ORDER BY city_name;
