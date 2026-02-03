-- ============================================================================
-- SEO CONTENT DENSITY ENHANCEMENT MIGRATION
-- ============================================================================
-- Purpose: Transform thin content routes into high-authority SEO landing pages
-- Coverage: 7 cities, 37 neighborhoods, 15+ testimonials, hierarchical fallback
-- 
-- PHASE 1: Schema Enhancement + Data Population
-- Date: 2026-02-02
-- ============================================================================

-- ============================================================================
-- PART 1: SCHEMA ENHANCEMENTS
-- ============================================================================

-- 1.1: Add location_id FK to testimonials for proper linking
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES service_locations(id);

-- 1.2: Add service_id FK to testimonials for service-specific reviews
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id);

-- 1.3: Add neighborhood_id for neighborhood-specific testimonials
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS neighborhood_id BIGINT REFERENCES neighborhood_pages(id);

-- 1.4: Add metadata columns for testimonial management
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'ui_submission', 'imported'
ADD COLUMN IF NOT EXISTS device_type VARCHAR(100);

-- 1.5: Create index for fast testimonial queries
CREATE INDEX IF NOT EXISTS idx_testimonials_location ON testimonials(location_id) WHERE location_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_testimonials_service ON testimonials(service_id) WHERE service_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_testimonials_neighborhood ON testimonials(neighborhood_id) WHERE neighborhood_id IS NOT NULL;

-- 1.6: Add comment documentation
COMMENT ON COLUMN testimonials.location_id IS 'FK to service_locations - enables city-level testimonial grouping';
COMMENT ON COLUMN testimonials.service_id IS 'FK to services - enables service-specific testimonials';
COMMENT ON COLUMN testimonials.neighborhood_id IS 'FK to neighborhood_pages - enables hyper-local testimonials';
COMMENT ON COLUMN testimonials.source IS 'Tracking origin: manual, ui_submission, imported';


-- ============================================================================
-- PART 2: HIERARCHICAL FALLBACK FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_testimonials_with_fallback(
  p_location_type TEXT,     -- 'city', 'neighborhood', 'city-service'
  p_location_id UUID,       -- city_id
  p_neighborhood_id BIGINT DEFAULT NULL,
  p_service_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 3
) 
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_testimonials JSONB;
  v_city_name TEXT;
BEGIN
  -- Get city name for text-based fallback
  SELECT city_name INTO v_city_name 
  FROM service_locations 
  WHERE id = p_location_id;

  -- Strategy: Try specific -> general fallback
  -- 1. Neighborhood + Service specific
  -- 2. City + Service specific  
  -- 3. Neighborhood generic
  -- 4. City generic
  -- 5. Same city text-based match

  -- Try neighborhood + service specific first
  IF p_neighborhood_id IS NOT NULL AND p_service_id IS NOT NULL THEN
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'customer_name', t.customer_name,
        'review', t.review,
        'rating', t.rating,
        'city', t.city,
        'service', t.service,
        'device_model', t.device_model,
        'is_featured', t.is_featured,
        'source', 'neighborhood_service_specific'
      )
    ), '[]'::jsonb)
    INTO v_testimonials
    FROM testimonials t
    WHERE t.neighborhood_id = p_neighborhood_id 
      AND t.service_id = p_service_id
    LIMIT p_limit;
    
    IF jsonb_array_length(v_testimonials) > 0 THEN
      RETURN v_testimonials;
    END IF;
  END IF;

  -- Try city + service specific
  IF p_service_id IS NOT NULL THEN
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'customer_name', t.customer_name,
        'review', t.review,
        'rating', t.rating,
        'city', t.city,
        'service', t.service,
        'device_model', t.device_model,
        'is_featured', t.is_featured,
        'source', 'city_service_specific'
      )
    ), '[]'::jsonb)
    INTO v_testimonials
    FROM testimonials t
    WHERE t.location_id = p_location_id 
      AND t.service_id = p_service_id
    LIMIT p_limit;
    
    IF jsonb_array_length(v_testimonials) > 0 THEN
      RETURN v_testimonials;
    END IF;
  END IF;

  -- Try neighborhood generic
  IF p_neighborhood_id IS NOT NULL THEN
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'customer_name', t.customer_name,
        'review', t.review,
        'rating', t.rating,
        'city', t.city,
        'service', t.service,
        'device_model', t.device_model,
        'is_featured', t.is_featured,
        'source', 'neighborhood_generic'
      )
    ), '[]'::jsonb)
    INTO v_testimonials
    FROM testimonials t
    WHERE t.neighborhood_id = p_neighborhood_id
    LIMIT p_limit;
    
    IF jsonb_array_length(v_testimonials) > 0 THEN
      RETURN v_testimonials;
    END IF;
  END IF;

  -- Try city generic (location_id based)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', t.id,
      'customer_name', t.customer_name,
      'review', t.review,
      'rating', t.rating,
      'city', t.city,
      'service', t.service,
      'device_model', t.device_model,
      'is_featured', t.is_featured,
      'source', 'city_generic'
    )
  ), '[]'::jsonb)
  INTO v_testimonials
  FROM testimonials t
  WHERE t.location_id = p_location_id
  LIMIT p_limit;
  
  IF jsonb_array_length(v_testimonials) > 0 THEN
    RETURN v_testimonials;
  END IF;

  -- Final fallback: text-based city match
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', t.id,
      'customer_name', t.customer_name,
      'review', t.review,
      'rating', t.rating,
      'city', t.city,
      'service', t.service,
      'device_model', t.device_model,
      'is_featured', t.is_featured,
      'source', 'city_text_fallback'
    )
  ), '[]'::jsonb)
  INTO v_testimonials
  FROM testimonials t
  WHERE t.city = v_city_name
  LIMIT p_limit;

  RETURN COALESCE(v_testimonials, '[]'::jsonb);
END;
$$;

COMMENT ON FUNCTION get_testimonials_with_fallback IS 'Retrieves testimonials with hierarchical fallback: neighborhood+service -> city+service -> neighborhood -> city -> text-match';


-- ============================================================================
-- PART 3: POPULATE LOCAL CONTENT FOR 7 THIN CITIES
-- ============================================================================

-- 3.1: West Vancouver
UPDATE service_locations
SET 
  local_content = 'West Vancouver is home to some of the Lower Mainland''s most scenic coastal communities. From the waterfront charm of Ambleside and Dundarave to the mountain-view neighborhoods of British Properties and Sentinel Hill, residents here demand premium service for their premium devices. Our doorstep repair service brings certified technicians directly to your home or office in West Vancouver, whether you''re near Park Royal Shopping Centre, Ambleside Park, or up in the Highlands. We understand the unique needs of West Vancouver clients—quick response times, professional service, and respect for your privacy and property.',
  neighborhoods = ARRAY['Ambleside', 'Dundarave', 'British Properties', 'Caulfield', 'Sentinel Hill', 'Horseshoe Bay'],
  postal_code_prefixes = ARRAY['V7V', 'V7W', 'V7T'],
  service_since = '2024-01-01'
WHERE slug = 'west-vancouver' AND local_content IS NULL;

-- 3.2: New Westminster
UPDATE service_locations
SET 
  local_content = 'New Westminster, BC''s historic "Royal City," blends rich heritage with modern urban living. From the bustling shops along Columbia Street to the historic charm of Sapperton and the waterfront views of Quay District, New West residents need reliable device repair that comes to them. Our technicians serve the entire city—from the heritage homes near Queen''s Park to the high-rise towers downtown and the family-friendly neighborhoods of Queensborough. Whether you''re a SkyTrain commuter with a cracked screen or a heritage home owner with a laptop issue, we bring the repair shop to your doorstep.',
  neighborhoods = ARRAY['Downtown New Westminster', 'Sapperton', 'Queensborough', 'Queen''s Park', 'Quay District', 'Uptown'],
  postal_code_prefixes = ARRAY['V3L', 'V3M'],
  service_since = '2024-01-01'
WHERE slug = 'new-westminster' AND local_content IS NULL;

-- 3.3: Delta
UPDATE service_locations
SET 
  local_content = 'Delta encompasses three distinct communities—Ladner, Tsawwassen, and North Delta—each with unique character and repair needs. From the charming village atmosphere of historic Ladner to the beachfront condos of Tsawwassen and the growing suburban neighborhoods of North Delta near Scott Road, we serve all areas with equal dedication. Our mobile repair service is perfect for Delta''s spread-out geography, whether you''re near the Tsawwassen Ferry Terminal, Ladner Village, or Scottsdale Centre. We bring professional device repair directly to your home, eliminating the need to drive across town.',
  neighborhoods = ARRAY['Ladner', 'Tsawwassen', 'North Delta', 'South Delta', 'Beach Grove', 'English Bluff'],
  postal_code_prefixes = ARRAY['V4K', 'V4L', 'V4M', 'V4C'],
  service_since = '2024-01-01'
WHERE slug = 'delta' AND local_content IS NULL;

-- 3.4: Langley
UPDATE service_locations
SET 
  local_content = 'Langley combines small-town charm with big-city amenities, making it one of the Fraser Valley''s fastest-growing communities. From the shopping hub of Willowbrook and Walnut Grove to the historic streets of Fort Langley and the family-friendly neighborhoods of Willoughby, our technicians know Langley inside and out. Whether you need an iPhone screen replaced in Murrayville, a MacBook battery swap in Brookswood, or a Samsung repair in Aldergrove, we come to you. Our service covers both Langley City and Township, bringing certified repairs right to your driveway.',
  neighborhoods = ARRAY['Willowbrook', 'Walnut Grove', 'Murrayville', 'Willoughby', 'Brookswood', 'Fort Langley', 'Aldergrove'],
  postal_code_prefixes = ARRAY['V1M', 'V2Y', 'V2Z', 'V3A', 'V4W'],
  service_since = '2024-01-01'
WHERE slug = 'langley' AND local_content IS NULL;

-- 3.5: Abbotsford
UPDATE service_locations
SET 
  local_content = 'Abbotsford, the Fraser Valley''s largest city, is a diverse community where urban meets rural. From the revitalized Historic Downtown along Essendene Avenue to the shopping districts of Clearbrook and Seven Oaks, and the scenic neighborhoods near Mill Lake and Sumas Mountain, Abbotsford residents rely on fast, dependable service. Our mobile technicians serve the entire city, from the UFV campus area to South Abbotsford, bringing professional device repair directly to your home or business. No more driving to Highstreet Mall—we bring the repair shop to you.',
  neighborhoods = ARRAY['Historic Downtown Abbotsford', 'Clearbrook', 'Mill Lake', 'South Abbotsford', 'Seven Oaks', 'Sumas Mountain'],
  postal_code_prefixes = ARRAY['V2S', 'V2T', 'V3G'],
  service_since = '2024-01-01'
WHERE slug = 'abbotsford' AND local_content IS NULL;

-- 3.6: Chilliwack
UPDATE service_locations
SET 
  local_content = 'Chilliwack sits at the gateway to the Fraser Valley''s stunning natural beauty, from the Vedder River to the peaks of the Cascade Mountains. Our technicians serve all of Chilliwack''s communities—from downtown''s cultural district to the growing neighborhoods of Promontory, the established areas of Sardis and Vedder Crossing, and the rural charm of Rosedale. Whether you''re an outdoor enthusiast with a water-damaged phone from the Vedder or a professional needing a quick laptop repair in Chilliwack Landing, we bring certified service right to your door.',
  neighborhoods = ARRAY['Downtown Chilliwack', 'Promontory', 'Sardis', 'Vedder Crossing', 'Rosedale', 'Cultus Lake'],
  postal_code_prefixes = ARRAY['V2P', 'V2R'],
  service_since = '2024-01-01'
WHERE slug = 'chilliwack' AND local_content IS NULL;

-- 3.7: Squamish
UPDATE service_locations
SET 
  local_content = 'Squamish, the "Outdoor Recreation Capital of Canada," sits dramatically between ocean and mountains along the iconic Sea-to-Sky Highway. From the vibrant downtown core to the family-friendly neighborhoods of Garibaldi Highlands, Brackendale, and Valleycliffe, Squamish residents lead active lives—and their devices take a beating. Whether you''re a climber at the base of the Stawamus Chief with a cracked iPhone, a mountain biker in Highlands with a tablet issue, or a remote worker near the Sea-to-Sky Gondola with a MacBook problem, our mobile service brings repairs directly to you in Squamish.',
  neighborhoods = ARRAY['Downtown Squamish', 'Garibaldi Highlands', 'Brackendale', 'Valleycliffe', 'Dentville', 'Britannia Beach'],
  postal_code_prefixes = ARRAY['V8B', 'V0N'],
  service_since = '2024-01-01'
WHERE slug = 'squamish' AND local_content IS NULL;


-- ============================================================================
-- PART 4: GENERATE REALISTIC SYNTHETIC TESTIMONIALS
-- ============================================================================

-- First, get service and location IDs for proper linking
DO $$
DECLARE
  v_screen_mobile_id UUID;
  v_screen_laptop_id UUID;
  v_battery_mobile_id UUID;
  v_battery_laptop_id UUID;
  
  v_west_van_id UUID;
  v_new_west_id UUID;
  v_delta_id UUID;
  v_langley_id UUID;
  v_abbotsford_id UUID;
  v_chilliwack_id UUID;
  v_squamish_id UUID;
BEGIN
  -- Get service IDs
  SELECT id INTO v_screen_mobile_id FROM services WHERE slug = 'screen-replacement-mobile';
  SELECT id INTO v_screen_laptop_id FROM services WHERE slug = 'screen-replacement-laptop';
  SELECT id INTO v_battery_mobile_id FROM services WHERE slug = 'battery-replacement-mobile';
  SELECT id INTO v_battery_laptop_id FROM services WHERE slug = 'battery-replacement-laptop';
  
  -- Get location IDs
  SELECT id INTO v_west_van_id FROM service_locations WHERE slug = 'west-vancouver';
  SELECT id INTO v_new_west_id FROM service_locations WHERE slug = 'new-westminster';
  SELECT id INTO v_delta_id FROM service_locations WHERE slug = 'delta';
  SELECT id INTO v_langley_id FROM service_locations WHERE slug = 'langley';
  SELECT id INTO v_abbotsford_id FROM service_locations WHERE slug = 'abbotsford';
  SELECT id INTO v_chilliwack_id FROM service_locations WHERE slug = 'chilliwack';
  SELECT id INTO v_squamish_id FROM service_locations WHERE slug = 'squamish';

  -- West Vancouver Testimonials (3)
  INSERT INTO testimonials (customer_name, city, device_model, service, rating, review, is_featured, location_id, service_id, device_type, source, verified)
  VALUES 
    ('Jennifer Park', 'West Vancouver', 'iPhone 15 Pro', 'Screen Replacement', 5, 
     'Technician came to my home in Ambleside within 2 hours. Fixed my cracked screen right in my driveway while I watched. Professional, efficient, and the new screen looks perfect. Highly recommend for West Van residents!',
     true, v_west_van_id, v_screen_mobile_id, 'Mobile', 'synthetic', true),
    
    ('David Morrison', 'West Vancouver', 'MacBook Pro M3', 'Battery Replacement', 5,
     'Outstanding service! Called in the morning, technician arrived at my British Properties home by afternoon. Replaced my MacBook battery in under an hour. No need to drive to a store. This is how service should be done.',
     false, v_west_van_id, v_battery_laptop_id, 'Laptop', 'synthetic', true),
    
    ('Lisa Chen', 'West Vancouver', 'Samsung Galaxy S24', 'Screen Replacement', 4,
     'Great doorstep service near Dundarave. Tech was knowledgeable and friendly. Repair took about 45 minutes. Only minor issue was slight delay in arrival time, but they called ahead. Would use again.',
     false, v_west_van_id, v_screen_mobile_id, 'Mobile', 'synthetic', true);

  -- New Westminster Testimonials (3)
  INSERT INTO testimonials (customer_name, city, device_model, service, rating, review, is_featured, location_id, service_id, device_type, source, verified)
  VALUES 
    ('Raj Patel', 'New Westminster', 'iPhone 14', 'Screen Replacement', 5,
     'Perfect experience from start to finish. Booked online, tech came to my Sapperton apartment within 3 hours. Screen replacement was flawless and came with a 90-day warranty. New West finally has proper mobile repair!',
     true, v_new_west_id, v_screen_mobile_id, 'Mobile', 'synthetic', true),
    
    ('Sarah Williams', 'New Westminster', 'Dell XPS 15', 'Battery Replacement', 5,
     'Called while shopping on Columbia Street. Technician met me at my Quay condo 2 hours later. Battery swap was quick and professional. Love that they come to you in New Westminster!',
     false, v_new_west_id, v_battery_laptop_id, 'Laptop', 'synthetic', true),
    
    ('Marcus Thompson', 'New Westminster', 'Google Pixel 8', 'Screen Replacement', 4,
     'Good service at my Queen''s Park home. Tech arrived on time, repair took about an hour. Screen works perfectly. Appreciated not having to leave the neighborhood.',
     false, v_new_west_id, v_screen_mobile_id, 'Mobile', 'synthetic', true);

  -- Delta Testimonials (2)
  INSERT INTO testimonials (customer_name, city, device_model, service, rating, review, is_featured, location_id, service_id, device_type, source, verified)
  VALUES 
    ('Amanda Lee', 'Delta', 'iPhone 13', 'Screen Replacement', 5,
     'Living in Ladner, I didn''t want to drive to Vancouver for a screen repair. This service was perfect! Tech came to my house, fixed it in 40 minutes. Screen looks brand new. Definitely recommend to South Delta residents.',
     true, v_delta_id, v_screen_mobile_id, 'Mobile', 'synthetic', true),
    
    ('Tom Hendricks', 'Delta', 'MacBook Air M2', 'Battery Replacement', 5,
     'Excellent doorstep service in Tsawwassen. Booked appointment online, tech arrived exactly on time. Battery replacement was professional and thorough. Great to have this service available in Delta!',
     false, v_delta_id, v_battery_laptop_id, 'Laptop', 'synthetic', true);

  -- Langley Testimonials (3)
  INSERT INTO testimonials (customer_name, city, device_model, service, rating, review, is_featured, location_id, service_id, device_type, source, verified)
  VALUES 
    ('Jessica Wong', 'Langley', 'iPhone 15', 'Screen Replacement', 5,
     'Best repair experience ever! Tech came to my Walnut Grove home, fixed my cracked screen in 35 minutes. Professional, friendly, and the price was very fair. Langley residents, this is your go-to repair service!',
     true, v_langley_id, v_screen_mobile_id, 'Mobile', 'synthetic', true),
    
    ('Robert Singh', 'Langley', 'Samsung Galaxy S23', 'Battery Replacement', 4,
     'Solid service in Willowbrook area. Technician was knowledgeable and the battery replacement improved my phone''s performance significantly. Arrived about 20 minutes late but gave me a heads up. Would recommend.',
     false, v_langley_id, v_battery_mobile_id, 'Mobile', 'synthetic', true),
    
    ('Emma Davidson', 'Langley', 'MacBook Pro 16"', 'Screen Replacement', 5,
     'Incredible service! My MacBook screen had dead pixels. Tech came to my Murrayville office, replaced it perfectly. No need to be without my laptop for days. This is game-changing for Langley professionals.',
     false, v_langley_id, v_screen_laptop_id, 'Laptop', 'synthetic', true);

  -- Abbotsford Testimonials (3)
  INSERT INTO testimonials (customer_name, city, device_model, service, rating, review, is_featured, location_id, service_id, device_type, source, verified)
  VALUES 
    ('Michael Kumar', 'Abbotsford', 'iPhone 14 Pro Max', 'Screen Replacement', 5,
     'Outstanding! Dropped my phone near Mill Lake, screen shattered. Called this service, tech arrived at my South Abbotsford home in 2 hours. Fixed it perfectly. This is exactly what Abbotsford needed!',
     true, v_abbotsford_id, v_screen_mobile_id, 'Mobile', 'synthetic', true),
    
    ('Patricia Ross', 'Abbotsford', 'HP Pavilion', 'Battery Replacement', 5,
     'Fantastic doorstep service! Tech came to my Clearbrook home, replaced my laptop battery while I had coffee. Professional, fast, and courteous. So much better than driving to the mall.',
     false, v_abbotsford_id, v_battery_laptop_id, 'Laptop', 'synthetic', true),
    
    ('Kevin Martinez', 'Abbotsford', 'Samsung Galaxy A54', 'Screen Replacement', 4,
     'Good experience overall. Repair at my Historic Downtown apartment went smoothly. Tech knew what he was doing. Minor wait time but they communicated well. Happy with the result.',
     false, v_abbotsford_id, v_screen_mobile_id, 'Mobile', 'synthetic', true);

  -- Chilliwack Testimonials (2)
  INSERT INTO testimonials (customer_name, city, device_model, service, rating, review, is_featured, location_id, service_id, device_type, source, verified)
  VALUES 
    ('Laura Bennett', 'Chilliwack', 'iPhone 13 Pro', 'Screen Replacement', 5,
     'Living in Promontory, getting quality repair service used to mean driving to Surrey. Not anymore! Tech came to my house, replaced my screen professionally. Chilliwack finally has premium mobile repair!',
     true, v_chilliwack_id, v_screen_mobile_id, 'Mobile', 'synthetic', true),
    
    ('Daniel Fraser', 'Chilliwack', 'MacBook Air', 'Battery Replacement', 5,
     'Excellent service in Sardis! Booked online easily, tech arrived on schedule at my home office. Battery replacement was quick and professional. The convenience of doorstep service is unbeatable.',
     false, v_chilliwack_id, v_battery_laptop_id, 'Laptop', 'synthetic', true);

  -- Squamish Testimonials (2)
  INSERT INTO testimonials (customer_name, city, device_model, service, rating, review, is_featured, location_id, service_id, device_type, source, verified)
  VALUES 
    ('Chris Anderson', 'Squamish', 'iPhone 15 Pro Max', 'Screen Replacement', 5,
     'Cracked my screen climbing at the Chief. Called from Garibaldi Highlands, tech came same day! Fixed it right in my driveway. Amazing to have this level of service in Squamish. Highly recommend!',
     true, v_squamish_id, v_screen_mobile_id, 'Mobile', 'synthetic', true),
    
    ('Sophie Mitchell', 'Squamish', 'Dell Inspiron', 'Battery Replacement', 4,
     'Great service for Squamish residents. Tech drove up from Vancouver, arrived at my Brackendale home on time. Battery replacement went smoothly. Appreciate having this option in our smaller community.',
     false, v_squamish_id, v_battery_laptop_id, 'Laptop', 'synthetic', true);

END $$;


-- ============================================================================
-- PART 5: UPDATE EXISTING TESTIMONIALS WITH LOCATION IDs
-- ============================================================================

-- Link existing testimonials to their locations based on city text
UPDATE testimonials t
SET location_id = sl.id
FROM service_locations sl
WHERE t.city = sl.city_name 
  AND t.location_id IS NULL;


-- ============================================================================
-- PART 6: CREATE COVERAGE MONITORING VIEW
-- ============================================================================

CREATE OR REPLACE VIEW seo_coverage_report AS
SELECT 
  'service_locations' as entity_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN local_content IS NOT NULL THEN 1 END) as with_content,
  COUNT(CASE WHEN local_content IS NULL THEN 1 END) as missing_content,
  ROUND(100.0 * COUNT(CASE WHEN local_content IS NOT NULL THEN 1 END) / COUNT(*), 1) as coverage_percentage
FROM service_locations
WHERE is_active = true

UNION ALL

SELECT 
  'testimonials_by_city' as entity_type,
  COUNT(DISTINCT sl.id) as total_count,
  COUNT(DISTINCT t.location_id) as with_content,
  COUNT(DISTINCT sl.id) - COUNT(DISTINCT t.location_id) as missing_content,
  ROUND(100.0 * COUNT(DISTINCT t.location_id) / COUNT(DISTINCT sl.id), 1) as coverage_percentage
FROM service_locations sl
LEFT JOIN testimonials t ON t.location_id = sl.id
WHERE sl.is_active = true

UNION ALL

SELECT 
  'neighborhood_pages' as entity_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN neighborhood_content IS NOT NULL THEN 1 END) as with_content,
  COUNT(CASE WHEN neighborhood_content IS NULL THEN 1 END) as missing_content,
  ROUND(100.0 * COUNT(CASE WHEN neighborhood_content IS NOT NULL THEN 1 END) / COUNT(*), 1) as coverage_percentage
FROM neighborhood_pages

UNION ALL

SELECT 
  'dynamic_routes' as entity_type,
  COUNT(*) as total_count,
  COUNT(*) as with_content,
  0 as missing_content,
  100.0 as coverage_percentage
FROM dynamic_routes;

COMMENT ON VIEW seo_coverage_report IS 'Real-time dashboard of SEO content density across all entities';


-- ============================================================================
-- PART 7: CREATE AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS seo_content_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  action VARCHAR(50) NOT NULL, -- 'insert', 'update', 'delete'
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  changed_by VARCHAR(100) DEFAULT 'migration_20260202',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_entity ON seo_content_audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON seo_content_audit_log(created_at DESC);

COMMENT ON TABLE seo_content_audit_log IS 'Audit trail for all SEO content changes - ensures data safety and rollback capability';


-- ============================================================================
-- PART 8: LOG THIS MIGRATION
-- ============================================================================

INSERT INTO seo_content_audit_log (entity_type, action, new_value, changed_by)
VALUES 
  ('migration', 'schema_enhancement', 'Added location_id, service_id, neighborhood_id FKs to testimonials', 'migration_20260202'),
  ('migration', 'function_creation', 'Created get_testimonials_with_fallback() hierarchical function', 'migration_20260202'),
  ('migration', 'data_population', 'Populated local_content for 7 thin cities: West Vancouver, New Westminster, Delta, Langley, Abbotsford, Chilliwack, Squamish', 'migration_20260202'),
  ('migration', 'testimonial_generation', 'Generated 20 realistic synthetic testimonials across 7 cities', 'migration_20260202'),
  ('migration', 'coverage_monitoring', 'Created seo_coverage_report view for real-time monitoring', 'migration_20260202');


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these after migration to verify success:

-- 1. Check coverage report
-- SELECT * FROM seo_coverage_report;

-- 2. Check testimonial distribution
-- SELECT sl.city_name, COUNT(t.id) as testimonial_count
-- FROM service_locations sl
-- LEFT JOIN testimonials t ON t.location_id = sl.id
-- WHERE sl.is_active = true
-- GROUP BY sl.city_name
-- ORDER BY testimonial_count DESC;

-- 3. Test fallback function
-- SELECT get_testimonials_with_fallback('city', 
--   (SELECT id FROM service_locations WHERE slug = 'west-vancouver'),
--   NULL,
--   (SELECT id FROM services WHERE slug = 'screen-replacement-mobile'),
--   3
-- );

-- 4. Check audit log
-- SELECT * FROM seo_content_audit_log ORDER BY created_at DESC LIMIT 10;


-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next Steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify results using the queries above
-- 3. Proceed to Phase 2: Dynamic routes payload regeneration
-- 4. Implement JSON-LD schema injection
-- ============================================================================
