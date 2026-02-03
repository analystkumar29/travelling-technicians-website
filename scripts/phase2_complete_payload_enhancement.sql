-- ============================================================================
-- PHASE 2 COMPLETE: Payload Enhancement + Missing Route Generation
-- ============================================================================
-- Issue Found: Only model-service-page routes exist (3224)
-- Missing: city-page and city-service-page routes
-- 
-- This script:
-- 1. Generates missing city-page routes (13 cities)
-- 2. Generates missing city-service-page routes (52 = 13 cities × 4 services)
-- 3. Enhances ALL routes with testimonials, geo data, neighborhoods, JSON-LD
-- 4. Updates model-service-page routes with enhanced city data
-- ============================================================================

DO $$
DECLARE
  v_cities_generated INT := 0;
  v_city_services_generated INT := 0;
  v_model_services_updated INT := 0;
BEGIN
  RAISE NOTICE '🚀 Starting Phase 2 Complete Enhancement...';
  
  -- ============================================================================
  -- PART 1: GENERATE MISSING CITY-PAGE ROUTES
  -- ============================================================================
  RAISE NOTICE '📍 Generating city-page routes...';
  
  INSERT INTO dynamic_routes (slug_path, route_type, city_id, service_id, model_id, payload, is_featured)
  SELECT 
    'repair/' || sl.slug as slug_path,
    'city-page' as route_type,
    sl.id as city_id,
    NULL as service_id,
    NULL as model_id,
    jsonb_build_object(
      'city', jsonb_build_object(
        'id', sl.id,
        'name', sl.city_name,
        'slug', sl.slug
      ),
      'local_phone', COALESCE(sl.local_phone, '+16048495329'),
      'local_email', COALESCE(sl.local_email, 'info@travellingtechnicians.ca'),
      'local_content', sl.local_content,
      'neighborhoods', COALESCE(to_jsonb(sl.neighborhoods), '[]'::jsonb),
      'postal_codes', COALESCE(to_jsonb(sl.postal_code_prefixes), '[]'::jsonb),
      'geo', jsonb_build_object(
        'latitude', sl.latitude,
        'longitude', sl.longitude
      ),
      'operating_hours', sl.operating_hours,
      'service_since', sl.service_since,
      'popular_models', (
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'id', dm.id,
            'name', dm.name,
            'slug', dm.slug,
            'display_name', dm.display_name,
            'brand', b.display_name
          ) ORDER BY dm.popularity_score DESC
        ), '[]'::jsonb)
        FROM device_models dm
        JOIN brands b ON dm.brand_id = b.id
        WHERE dm.is_active = true
        LIMIT 6
      ),
      'sample_services', (
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'id', s.id,
            'name', s.name,
            'slug', s.slug,
            'display_name', s.display_name,
            'description', s.description,
            'icon', CASE 
              WHEN s.slug LIKE '%screen%' THEN '📱'
              WHEN s.slug LIKE '%battery%' THEN '🔋'
              ELSE '🛠️'
            END
          ) ORDER BY s.sort_order
        ), '[]'::jsonb)
        FROM services s
        WHERE s.is_active = true AND s.is_doorstep_eligible = true
      ),
      'testimonials', get_testimonials_with_fallback('city', sl.id, NULL, NULL, 3),
      'jsonLd', generate_review_jsonld(sl.city_name, NULL)
    ) as payload,
    true as is_featured
  FROM service_locations sl
  WHERE sl.is_active = true
  ON CONFLICT (slug_path) DO UPDATE
  SET payload = EXCLUDED.payload,
      last_updated = NOW();
  
  GET DIAGNOSTICS v_cities_generated = ROW_COUNT;
  RAISE NOTICE '✅ Generated/Updated % city-page routes', v_cities_generated;
  
  -- ============================================================================
  -- PART 2: GENERATE MISSING CITY-SERVICE-PAGE ROUTES
  -- ============================================================================
  RAISE NOTICE '🛠️  Generating city-service-page routes...';
  
  INSERT INTO dynamic_routes (slug_path, route_type, city_id, service_id, model_id, payload, is_featured)
  SELECT 
    'repair/' || sl.slug || '/' || s.slug as slug_path,
    'city-service-page' as route_type,
    sl.id as city_id,
    s.id as service_id,
    NULL as model_id,
    jsonb_build_object(
      'city', jsonb_build_object(
        'id', sl.id,
        'name', sl.city_name,
        'slug', sl.slug
      ),
      'service', jsonb_build_object(
        'id', s.id,
        'name', s.name,
        'slug', s.slug,
        'display_name', s.display_name,
        'description', s.description
      ),
      'type', jsonb_build_object(
        'id', dt.id,
        'name', dt.name,
        'slug', dt.slug
      ),
      'local_phone', COALESCE(sl.local_phone, '+16048495329'),
      'local_email', COALESCE(sl.local_email, 'info@travellingtechnicians.ca'),
      'local_content', sl.local_content,
      'neighborhoods', COALESCE(to_jsonb(sl.neighborhoods), '[]'::jsonb),
      'postal_codes', COALESCE(to_jsonb(sl.postal_code_prefixes), '[]'::jsonb),
      'geo', jsonb_build_object(
        'latitude', sl.latitude,
        'longitude', sl.longitude
      ),
      'operating_hours', sl.operating_hours,
      'sample_models', (
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'id', dm.id,
            'name', dm.name,
            'slug', dm.slug,
            'display_name', dm.display_name
          ) ORDER BY dm.popularity_score DESC
        ), '[]'::jsonb)
        FROM device_models dm
        WHERE dm.is_active = true AND dm.type_id = dt.id
        LIMIT 5
      ),
      'nearby_cities', (
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'name', sl2.city_name,
            'slug', sl2.slug,
            'distance_km', ROUND(
              CAST(
                6371 * acos(
                  cos(radians(CAST(sl.latitude AS FLOAT))) * 
                  cos(radians(CAST(sl2.latitude AS FLOAT))) * 
                  cos(radians(CAST(sl2.longitude AS FLOAT)) - radians(CAST(sl.longitude AS FLOAT))) + 
                  sin(radians(CAST(sl.latitude AS FLOAT))) * 
                  sin(radians(CAST(sl2.latitude AS FLOAT)))
                ) AS NUMERIC
              ), 2
            )
          ) ORDER BY (
            6371 * acos(
              cos(radians(CAST(sl.latitude AS FLOAT))) * 
              cos(radians(CAST(sl2.latitude AS FLOAT))) * 
              cos(radians(CAST(sl2.longitude AS FLOAT)) - radians(CAST(sl.longitude AS FLOAT))) + 
              sin(radians(CAST(sl.latitude AS FLOAT))) * 
              sin(radians(CAST(sl2.latitude AS FLOAT)))
            )
          ) ASC
        ), '[]'::jsonb)
        FROM service_locations sl2
        WHERE sl2.is_active = true 
          AND sl2.id != sl.id
          AND sl2.latitude IS NOT NULL 
          AND sl2.longitude IS NOT NULL
        LIMIT 4
      ),
      'neighborhood_pages', (
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'id', np.id,
            'neighborhood_name', np.neighborhood_name,
            'slug', np.slug,
            'landmark_name', np.landmark_name
          ) ORDER BY np.neighborhood_name
        ), '[]'::jsonb)
        FROM neighborhood_pages np
        WHERE np.city_id = sl.id
      ),
      'testimonials', get_testimonials_with_fallback('city-service', sl.id, NULL, s.id, 3),
      'jsonLd', generate_review_jsonld(sl.city_name, s.name)
    ) as payload,
    CASE WHEN s.is_popular THEN true ELSE false END as is_featured
  FROM service_locations sl
  CROSS JOIN services s
  LEFT JOIN device_types dt ON s.device_type_id = dt.id
  WHERE sl.is_active = true 
    AND s.is_active = true 
    AND s.is_doorstep_eligible = true
  ON CONFLICT (slug_path) DO UPDATE
  SET payload = EXCLUDED.payload,
      last_updated = NOW();
  
  GET DIAGNOSTICS v_city_services_generated = ROW_COUNT;
  RAISE NOTICE '✅ Generated/Updated % city-service-page routes', v_city_services_generated;
  
  -- ============================================================================
  -- PART 3: ENHANCE EXISTING MODEL-SERVICE-PAGE ROUTES
  -- ============================================================================
  RAISE NOTICE '📱 Enhancing model-service-page routes with testimonials and geo data...';
  
  UPDATE dynamic_routes dr
  SET payload = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            dr.payload,
            '{testimonials}',
            get_testimonials_with_fallback('city-service', dr.city_id, NULL, dr.service_id, 3)
          ),
          '{postal_codes}',
          COALESCE(
            (SELECT to_jsonb(postal_code_prefixes) FROM service_locations WHERE id = dr.city_id),
            '[]'::jsonb
          )
        ),
        '{neighborhoods}',
        COALESCE(
          (SELECT to_jsonb(neighborhoods) FROM service_locations WHERE id = dr.city_id),
          '[]'::jsonb
        )
      ),
      '{geo}',
      jsonb_build_object(
        'latitude', (SELECT latitude FROM service_locations WHERE id = dr.city_id),
        'longitude', (SELECT longitude FROM service_locations WHERE id = dr.city_id)
      )
    ),
    '{jsonLd}',
    COALESCE(
      generate_review_jsonld(
        (SELECT city_name FROM service_locations WHERE id = dr.city_id),
        (SELECT name FROM services WHERE id = dr.service_id)
      ),
      '{}'::jsonb
    )
  ),
  last_updated = NOW()
  WHERE dr.route_type = 'model-service-page'
    AND dr.city_id IS NOT NULL
    AND dr.service_id IS NOT NULL;
  
  GET DIAGNOSTICS v_model_services_updated = ROW_COUNT;
  RAISE NOTICE '✅ Enhanced % model-service-page routes', v_model_services_updated;
  
  -- ============================================================================
  -- PART 4: LOG THE UPDATES
  -- ============================================================================
  INSERT INTO seo_content_audit_log (entity_type, action, new_value)
  VALUES 
    ('dynamic_routes', 'city_page_generation', format('Generated/updated %s city-page routes', v_cities_generated)),
    ('dynamic_routes', 'city_service_generation', format('Generated/updated %s city-service-page routes', v_city_services_generated)),
    ('dynamic_routes', 'model_service_enhancement', format('Enhanced %s model-service-page routes with testimonials and geo data', v_model_services_updated));
  
  RAISE NOTICE '📊 SUMMARY:';
  RAISE NOTICE '  - City pages: %', v_cities_generated;
  RAISE NOTICE '  - City-Service pages: %', v_city_services_generated;
  RAISE NOTICE '  - Model-Service pages enhanced: %', v_model_services_updated;
  RAISE NOTICE '✅ Phase 2 Complete Enhancement FINISHED!';
  
END $$;


-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- 1. Check route type distribution
SELECT 
  route_type,
  COUNT(*) as count,
  COUNT(CASE WHEN payload ? 'testimonials' THEN 1 END) as with_testimonials,
  COUNT(CASE WHEN payload ? 'geo' THEN 1 END) as with_geo
FROM dynamic_routes
GROUP BY route_type
ORDER BY count DESC;

-- 2. Sample city-service-page payload
SELECT 
  slug_path,
  jsonb_array_length(payload->'testimonials') as testimonial_count,
  jsonb_array_length(payload->'neighborhoods') as neighborhood_count,
  jsonb_array_length(payload->'postal_codes') as postal_count,
  payload->'geo'->>'latitude' as latitude,
  payload->'jsonLd'->'aggregateRating'->>'ratingValue' as avg_rating
FROM dynamic_routes
WHERE route_type = 'city-service-page'
LIMIT 3;

-- 3. Check testimonials in model-service-page
SELECT 
  slug_path,
  jsonb_array_length(COALESCE(payload->'testimonials', '[]'::jsonb)) as testimonial_count
FROM dynamic_routes
WHERE route_type = 'model-service-page'
  AND payload ? 'testimonials'
LIMIT 5;

-- 4. Verify city-page routes
SELECT 
  slug_path,
  payload->'city'->>'name' as city_name,
  jsonb_array_length(payload->'testimonials') as testimonial_count,
  payload->'jsonLd'->>'@type' as jsonld_type
FROM dynamic_routes
WHERE route_type = 'city-page'
LIMIT 5;

-- ============================================================================
-- SUCCESS CRITERIA
-- ============================================================================
-- ✅ Total routes should be ~3289 (3224 model + 13 city + 52 city-service)
-- ✅ All city-service-page routes should have testimonials
-- ✅ All routes should have geo data (latitude/longitude)
-- ✅ All routes should have JSON-LD schema
-- ✅ All routes should have postal_codes and neighborhoods
-- ============================================================================
