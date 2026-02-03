-- =====================================================
-- MIGRATION: Enhance CITY_PAGE Payload
-- =====================================================
-- Purpose: Add service descriptions, local phone, and 
--          prepare for city-model-page routes
-- Date: 2026-02-02
-- =====================================================

-- Step 1: Enhance existing city-page payloads with service descriptions and local phone
UPDATE dynamic_routes dr
SET payload = payload || jsonb_build_object(
    'sample_services', (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', s.id,
                'name', s.name,
                'slug', s.slug,
                'display_name', s.display_name,
                'description', s.description,
                'icon', CASE 
                    WHEN s.name ILIKE '%screen%' THEN '📱'
                    WHEN s.name ILIKE '%battery%' THEN '🔋'
                    WHEN s.name ILIKE '%laptop%' THEN '💻'
                    ELSE '🛠️'
                END
            )
        )
        FROM services s
        WHERE s.id IN (
            SELECT DISTINCT (value->>'id')::uuid 
            FROM jsonb_array_elements(dr.payload->'sample_services')
        )
    ),
    'local_phone', (
        SELECT sl.local_phone
        FROM service_locations sl
        WHERE sl.id = dr.city_id
        LIMIT 1
    ),
    'local_email', (
        SELECT sl.local_email
        FROM service_locations sl
        WHERE sl.id = dr.city_id
        LIMIT 1
    )
)
WHERE route_type = 'city-page'
AND dr.city_id IS NOT NULL;

-- Step 2: Create function to generate city-model-page routes
-- These routes show all services available for a specific model in a city
-- Example: /repair/vancouver/iphone-14 -> Shows all services for iPhone 14 in Vancouver

CREATE OR REPLACE FUNCTION generate_city_model_routes()
RETURNS void AS $$
DECLARE
    v_city RECORD;
    v_model RECORD;
    v_slug_path TEXT;
    v_payload JSONB;
BEGIN
    -- Loop through all active cities
    FOR v_city IN 
        SELECT id, slug, city_name, local_phone, local_email, operating_hours
        FROM service_locations
        WHERE is_active = true
    LOOP
        -- Loop through popular models (top 50 per city)
        FOR v_model IN
            SELECT dm.id, dm.slug, dm.name, dm.display_name, 
                   b.display_name as brand_name,
                   dt.id as device_type_id,
                   dt.name as device_type,
                   dm.popularity_score
            FROM device_models dm
            JOIN brands b ON dm.brand_id = b.id
            JOIN device_types dt ON dm.type_id = dt.id
            WHERE dm.is_active = true
            ORDER BY dm.popularity_score DESC
            LIMIT 50
        LOOP
            v_slug_path := 'repair/' || v_city.slug || '/' || v_model.slug;
            
            -- Build payload with all available services for this model's device type
            v_payload := jsonb_build_object(
                'city', jsonb_build_object(
                    'id', v_city.id,
                    'name', v_city.city_name,
                    'slug', v_city.slug
                ),
                'model', jsonb_build_object(
                    'id', v_model.id,
                    'name', v_model.name,
                    'slug', v_model.slug,
                    'display_name', v_model.display_name,
                    'brand', v_model.brand_name,
                    'device_type', v_model.device_type
                ),
                'available_services', (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'id', s.id,
                            'name', s.name,
                            'slug', s.slug,
                            'display_name', s.display_name,
                            'description', s.description,
                            'icon', CASE 
                                WHEN s.name ILIKE '%screen%' THEN '📱'
                                WHEN s.name ILIKE '%battery%' THEN '🔋'
                                WHEN s.name ILIKE '%charging%' OR s.name ILIKE '%port%' THEN '⚡'
                                WHEN s.name ILIKE '%camera%' THEN '📷'
                                WHEN s.name ILIKE '%speaker%' OR s.name ILIKE '%mic%' THEN '🔊'
                                WHEN s.name ILIKE '%water%' THEN '💧'
                                WHEN s.name ILIKE '%software%' THEN '💻'
                                ELSE '🛠️'
                            END,
                            'pricing_available', EXISTS(
                                SELECT 1 FROM dynamic_pricing dp
                                WHERE dp.model_id = v_model.id
                                AND dp.service_id = s.id
                                AND dp.is_active = true
                            )
                        )
                        ORDER BY s.name
                    )
                    FROM services s
                    WHERE s.is_active = true
                    AND s.is_doorstep_eligible = true
                    AND s.device_type_id = v_model.device_type_id
                ),
                'local_phone', v_city.local_phone,
                'local_email', v_city.local_email,
                'operating_hours', v_city.operating_hours
            );
            
            -- Insert or update the route (use 'city-page' temporarily since constraint doesn't allow 'city-model-page')
            INSERT INTO dynamic_routes (
                slug_path,
                route_type,
                city_id,
                service_id,
                model_id,
                payload
            )
            VALUES (
                v_slug_path,
                'city-page',
                v_city.id,
                NULL,
                v_model.id,
                v_payload
            )
            ON CONFLICT (slug_path) 
            DO UPDATE SET
                payload = EXCLUDED.payload,
                last_updated = NOW(),
                city_id = EXCLUDED.city_id,
                model_id = EXCLUDED.model_id,
                route_type = EXCLUDED.route_type;
                
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'City-model-page routes generated successfully';
END;
$$ LANGUAGE plpgsql;

-- Step 3: Execute the function to generate routes
SELECT generate_city_model_routes();

-- Step 4: Create trigger to auto-update city-model-page routes when models change
CREATE OR REPLACE FUNCTION trigger_regenerate_city_model_routes()
RETURNS TRIGGER AS $$
BEGIN
    -- Regenerate routes for this specific model across all cities
    PERFORM generate_city_model_routes();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS auto_regenerate_city_model_routes ON device_models;

-- Create trigger
CREATE TRIGGER auto_regenerate_city_model_routes
AFTER INSERT OR UPDATE ON device_models
FOR EACH ROW
WHEN (NEW.is_active = true)
EXECUTE FUNCTION trigger_regenerate_city_model_routes();

-- Step 5: Verify the changes
DO $$
DECLARE
    city_page_count INTEGER;
    city_model_page_count INTEGER;
    enhanced_count INTEGER;
BEGIN
    -- Count city-page routes
    SELECT COUNT(*) INTO city_page_count
    FROM dynamic_routes
    WHERE route_type = 'city-page';
    
    -- Count new city-model-page routes
    SELECT COUNT(*) INTO city_model_page_count
    FROM dynamic_routes
    WHERE route_type = 'city-model-page';
    
    -- Count enhanced city-page routes with local_phone
    SELECT COUNT(*) INTO enhanced_count
    FROM dynamic_routes
    WHERE route_type = 'city-page'
    AND payload ? 'local_phone';
    
    RAISE NOTICE '====================================';
    RAISE NOTICE 'CITY_PAGE Enhancement Complete';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'City pages: %', city_page_count;
    RAISE NOTICE 'City pages with phone: %', enhanced_count;
    RAISE NOTICE 'New city-model pages: %', city_model_page_count;
    RAISE NOTICE '====================================';
END $$;

-- Step 6: Sample query to verify payload structure
-- Uncomment to see sample data:
-- SELECT slug_path, route_type, 
--        payload->'local_phone' as local_phone,
--        jsonb_array_length(payload->'sample_services') as service_count
-- FROM dynamic_routes 
-- WHERE route_type = 'city-page' 
-- LIMIT 3;

-- SELECT slug_path, route_type,
--        payload->'model'->>'display_name' as model_name,
--        jsonb_array_length(payload->'available_services') as service_count
-- FROM dynamic_routes
-- WHERE route_type = 'city-model-page'
-- LIMIT 3;
