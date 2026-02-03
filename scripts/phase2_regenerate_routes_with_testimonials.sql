-- ============================================================================
-- PHASE 2: DYNAMIC ROUTES PAYLOAD REGENERATION
-- ============================================================================
-- Purpose: Inject testimonials into existing dynamic_routes payloads
-- Run After: Phase 1 migration (20260202_seo_content_density_enhancement.sql)
-- Date: 2026-02-02
-- ============================================================================

-- ============================================================================
-- PART 1: UPDATE CITY-SERVICE-PAGE ROUTES WITH TESTIMONIALS
-- ============================================================================

-- This updates all city-service-page routes to include testimonials using
-- the hierarchical fallback function

UPDATE dynamic_routes dr
SET 
  payload = jsonb_set(
    payload,
    '{testimonials}',
    get_testimonials_with_fallback(
      'city-service',
      dr.city_id,
      NULL,
      dr.service_id,
      3
    )
  ),
  last_updated = NOW()
WHERE 
  dr.route_type = 'city-service-page'
  AND dr.city_id IS NOT NULL
  AND dr.service_id IS NOT NULL;

-- Log the update
INSERT INTO seo_content_audit_log (entity_type, action, new_value)
VALUES ('dynamic_routes', 'payload_update', 'Injected testimonials into city-service-page routes using fallback function');


-- ============================================================================
-- PART 2: UPDATE CITY-PAGE ROUTES WITH TESTIMONIALS
-- ============================================================================

-- Add testimonials to city pages (general, not service-specific)

UPDATE dynamic_routes dr
SET 
  payload = jsonb_set(
    payload,
    '{testimonials}',
    get_testimonials_with_fallback(
      'city',
      dr.city_id,
      NULL,
      NULL,
      3
    )
  ),
  last_updated = NOW()
WHERE 
  dr.route_type = 'city-page'
  AND dr.city_id IS NOT NULL;

-- Log the update
INSERT INTO seo_content_audit_log (entity_type, action, new_value)
VALUES ('dynamic_routes', 'payload_update', 'Injected testimonials into city-page routes using fallback function');


-- ============================================================================
-- PART 3: ADD JSON-LD SCHEMA FOR AGGREGATE RATINGS
-- ============================================================================

-- Create a function to generate JSON-LD schema based on testimonials

CREATE OR REPLACE FUNCTION generate_review_jsonld(
  p_city_name TEXT,
  p_service_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_avg_rating NUMERIC;
  v_review_count INTEGER;
  v_jsonld JSONB;
  v_business_name TEXT;
BEGIN
  -- Build business name
  IF p_service_name IS NOT NULL THEN
    v_business_name := 'The Travelling Technicians - ' || p_service_name || ' in ' || p_city_name;
  ELSE
    v_business_name := 'The Travelling Technicians - ' || p_city_name;
  END IF;

  -- Calculate aggregate rating from testimonials
  SELECT 
    ROUND(AVG(t.rating)::numeric, 1),
    COUNT(*)
  INTO v_avg_rating, v_review_count
  FROM testimonials t
  JOIN service_locations sl ON t.location_id = sl.id
  WHERE sl.city_name = p_city_name
    AND (p_service_name IS NULL OR t.service = p_service_name);

  -- Return NULL if no testimonials
  IF v_review_count = 0 THEN
    RETURN NULL;
  END IF;

  -- Build JSON-LD schema
  v_jsonld := jsonb_build_object(
    '@context', 'https://schema.org',
    '@type', 'LocalBusiness',
    'name', v_business_name,
    'aggregateRating', jsonb_build_object(
      '@type', 'AggregateRating',
      'ratingValue', v_avg_rating,
      'reviewCount', v_review_count,
      'bestRating', 5,
      'worstRating', 1
    )
  );

  RETURN v_jsonld;
END;
$$;

COMMENT ON FUNCTION generate_review_jsonld IS 'Generates JSON-LD schema for AggregateRating based on testimonials';


-- ============================================================================
-- PART 4: INJECT JSON-LD INTO CITY-SERVICE-PAGE ROUTES
-- ============================================================================

UPDATE dynamic_routes dr
SET 
  payload = jsonb_set(
    payload,
    '{jsonLd}',
    COALESCE(
      generate_review_jsonld(
        (payload->'city'->>'name'),
        (payload->'service'->>'name')
      ),
      '{}'::jsonb
    )
  ),
  last_updated = NOW()
WHERE 
  dr.route_type = 'city-service-page'
  AND dr.city_id IS NOT NULL
  AND dr.service_id IS NOT NULL;

-- Log the update
INSERT INTO seo_content_audit_log (entity_type, action, new_value)
VALUES ('dynamic_routes', 'jsonld_injection', 'Added AggregateRating JSON-LD to city-service-page routes');


-- ============================================================================
-- PART 5: INJECT JSON-LD INTO CITY-PAGE ROUTES
-- ============================================================================

UPDATE dynamic_routes dr
SET 
  payload = jsonb_set(
    payload,
    '{jsonLd}',
    COALESCE(
      generate_review_jsonld(
        (payload->'city'->>'name'),
        NULL
      ),
      '{}'::jsonb
    )
  ),
  last_updated = NOW()
WHERE 
  dr.route_type = 'city-page'
  AND dr.city_id IS NOT NULL;

-- Log the update
INSERT INTO seo_content_audit_log (entity_type, action, new_value)
VALUES ('dynamic_routes', 'jsonld_injection', 'Added AggregateRating JSON-LD to city-page routes');


-- ============================================================================
-- PART 6: CREATE REGENERATION FUNCTION FOR FUTURE USE
-- ============================================================================

CREATE OR REPLACE FUNCTION regenerate_route_testimonials(
  p_route_type TEXT DEFAULT NULL
)
RETURNS TABLE(
  routes_updated INTEGER,
  execution_time_ms INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_start_time TIMESTAMP;
  v_routes_updated INTEGER;
BEGIN
  v_start_time := clock_timestamp();

  -- Update based on route type or all if NULL
  IF p_route_type = 'city-service-page' OR p_route_type IS NULL THEN
    UPDATE dynamic_routes dr
    SET 
      payload = jsonb_set(
        jsonb_set(
          payload,
          '{testimonials}',
          get_testimonials_with_fallback('city-service', dr.city_id, NULL, dr.service_id, 3)
        ),
        '{jsonLd}',
        COALESCE(
          generate_review_jsonld((payload->'city'->>'name'), (payload->'service'->>'name')),
          '{}'::jsonb
        )
      ),
      last_updated = NOW()
    WHERE dr.route_type = 'city-service-page'
      AND dr.city_id IS NOT NULL
      AND dr.service_id IS NOT NULL;
  END IF;

  IF p_route_type = 'city-page' OR p_route_type IS NULL THEN
    UPDATE dynamic_routes dr
    SET 
      payload = jsonb_set(
        jsonb_set(
          payload,
          '{testimonials}',
          get_testimonials_with_fallback('city', dr.city_id, NULL, NULL, 3)
        ),
        '{jsonLd}',
        COALESCE(
          generate_review_jsonld((payload->'city'->>'name'), NULL),
          '{}'::jsonb
        )
      ),
      last_updated = NOW()
    WHERE dr.route_type = 'city-page'
      AND dr.city_id IS NOT NULL;
  END IF;

  GET DIAGNOSTICS v_routes_updated = ROW_COUNT;

  RETURN QUERY SELECT 
    v_routes_updated,
    EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start_time)::INTEGER;
END;
$$;

COMMENT ON FUNCTION regenerate_route_testimonials IS 'Regenerates testimonials and JSON-LD for all or specific route types. Usage: SELECT * FROM regenerate_route_testimonials(); or SELECT * FROM regenerate_route_testimonials(''city-page'');';


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these after Phase 2 to verify success:

-- 1. Check testimonials in city-service-page routes
-- SELECT 
--   slug_path,
--   jsonb_array_length(payload->'testimonials') as testimonial_count,
--   payload->'jsonLd'->>'@type' as jsonld_type
-- FROM dynamic_routes
-- WHERE route_type = 'city-service-page'
-- LIMIT 5;

-- 2. Check testimonials in city-page routes
-- SELECT 
--   slug_path,
--   jsonb_array_length(payload->'testimonials') as testimonial_count,
--   payload->'jsonLd'->'aggregateRating'->>'ratingValue' as avg_rating,
--   payload->'jsonLd'->'aggregateRating'->>'reviewCount' as review_count
-- FROM dynamic_routes
-- WHERE route_type = 'city-page'
-- LIMIT 5;

-- 3. Check which routes have testimonials vs. those that don't
-- SELECT 
--   route_type,
--   COUNT(*) as total_routes,
--   COUNT(CASE WHEN jsonb_array_length(payload->'testimonials') > 0 THEN 1 END) as with_testimonials,
--   COUNT(CASE WHEN jsonb_array_length(payload->'testimonials') = 0 THEN 1 END) as without_testimonials
-- FROM dynamic_routes
-- WHERE route_type IN ('city-page', 'city-service-page')
-- GROUP BY route_type;

-- 4. Sample a specific city's testimonials
-- SELECT 
--   slug_path,
--   route_type,
--   payload->'city'->>'name' as city_name,
--   payload->'testimonials'
-- FROM dynamic_routes
-- WHERE payload->'city'->>'slug' = 'west-vancouver'
-- LIMIT 3;


-- ============================================================================
-- PHASE 2 COMPLETE
-- ============================================================================
-- Summary:
-- - Updated all city-service-page routes with testimonials
-- - Updated all city-page routes with testimonials
-- - Added JSON-LD AggregateRating schema
-- - Created regeneration function for future use
--
-- Next Steps:
-- 1. Run verification queries above
-- 2. Test front-end rendering of testimonials
-- 3. Verify JSON-LD appears in page source
-- 4. Monitor Google Search Console for rich results
-- ============================================================================
