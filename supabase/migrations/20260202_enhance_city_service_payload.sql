-- Migration: Enhance city-service-page payload with dynamic local content
-- This migration updates the payload for city-service-page routes to include:
-- 1. local_content - city-specific content from service_locations
-- 2. local_phone - local phone number from service_locations
-- 3. local_email - local email from service_locations
-- 4. neighborhoods - list of neighborhoods from service_locations
-- 5. operating_hours - operating hours from service_locations
-- 6. testimonials - testimonials for the city from testimonials table
-- 7. nearby_cities - nearby cities calculated by distance

-- Function to calculate distance between two points using Haversine formula
CREATE OR REPLACE FUNCTION calculate_distance_km(
    lat1 NUMERIC, lon1 NUMERIC,
    lat2 NUMERIC, lon2 NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
    R NUMERIC := 6371; -- Earth's radius in km
    dlat NUMERIC;
    dlon NUMERIC;
    a NUMERIC;
    c NUMERIC;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get nearby cities for a given city
CREATE OR REPLACE FUNCTION get_nearby_cities(
    p_city_id UUID,
    p_limit INT DEFAULT 4
) RETURNS JSONB AS $$
DECLARE
    v_city_lat NUMERIC;
    v_city_lon NUMERIC;
    v_result JSONB;
BEGIN
    -- Get the coordinates of the current city
    SELECT latitude, longitude INTO v_city_lat, v_city_lon
    FROM service_locations
    WHERE id = p_city_id;
    
    -- If no coordinates, return empty array
    IF v_city_lat IS NULL OR v_city_lon IS NULL THEN
        RETURN '[]'::jsonb;
    END IF;
    
    -- Get nearby cities ordered by distance
    SELECT jsonb_agg(city_data ORDER BY distance_km)
    INTO v_result
    FROM (
        SELECT 
            jsonb_build_object(
                'slug', sl.slug,
                'name', sl.city_name,
                'distance_km', calculate_distance_km(v_city_lat, v_city_lon, sl.latitude, sl.longitude)
            ) as city_data,
            calculate_distance_km(v_city_lat, v_city_lon, sl.latitude, sl.longitude) as distance_km
        FROM service_locations sl
        WHERE sl.id != p_city_id
          AND sl.is_active = true
          AND sl.latitude IS NOT NULL
          AND sl.longitude IS NOT NULL
        ORDER BY distance_km ASC
        LIMIT p_limit
    ) nearby;
    
    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Function to get testimonials for a city
CREATE OR REPLACE FUNCTION get_city_testimonials(
    p_city_name TEXT,
    p_limit INT DEFAULT 3
) RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', t.id,
            'customer_name', t.customer_name,
            'review', t.review,
            'rating', COALESCE(t.rating, 5),
            'city', t.city,
            'service', t.service
        )
    )
    INTO v_result
    FROM (
        SELECT *
        FROM testimonials
        WHERE city ILIKE p_city_name
           OR city IS NULL -- Include general testimonials as fallback
        ORDER BY 
            CASE WHEN city ILIKE p_city_name THEN 0 ELSE 1 END,
            is_featured DESC,
            created_at DESC
        LIMIT p_limit
    ) t;
    
    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Update city-service-page payloads with enhanced data
UPDATE dynamic_routes dr
SET payload = dr.payload || jsonb_build_object(
    'local_content', sl.local_content,
    'local_phone', sl.local_phone,
    'local_email', sl.local_email,
    'neighborhoods', COALESCE(sl.neighborhoods, ARRAY[]::text[]),
    'operating_hours', sl.operating_hours,
    'testimonials', get_city_testimonials(sl.city_name, 3),
    'nearby_cities', get_nearby_cities(sl.id, 4)
)
FROM service_locations sl
WHERE dr.route_type = 'city-service-page'
  AND dr.city_id = sl.id;

-- Log the update
DO $$
DECLARE
    updated_count INT;
BEGIN
    SELECT COUNT(*) INTO updated_count
    FROM dynamic_routes
    WHERE route_type = 'city-service-page'
      AND payload ? 'local_content';
    
    RAISE NOTICE 'Updated % city-service-page routes with enhanced payload', updated_count;
END $$;

-- Verify the update
SELECT 
    route_type,
    COUNT(*) as total_routes,
    COUNT(*) FILTER (WHERE payload ? 'local_content') as with_local_content,
    COUNT(*) FILTER (WHERE payload ? 'neighborhoods') as with_neighborhoods,
    COUNT(*) FILTER (WHERE payload ? 'nearby_cities') as with_nearby_cities,
    COUNT(*) FILTER (WHERE payload ? 'testimonials') as with_testimonials
FROM dynamic_routes
WHERE route_type = 'city-service-page'
GROUP BY route_type;
