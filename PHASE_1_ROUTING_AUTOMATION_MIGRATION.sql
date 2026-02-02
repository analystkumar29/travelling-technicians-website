BEGIN;

-- ============================================
-- 1. CLEANUP
-- ============================================
DROP VIEW IF EXISTS view_active_repair_routes CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_sitemap_routes CASCADE;
DROP FUNCTION IF EXISTS refresh_dynamic_routes CASCADE; 
DROP FUNCTION IF EXISTS refresh_dynamic_routes_logic CASCADE;
DROP FUNCTION IF EXISTS trigger_handler_refresh_routes CASCADE;

-- ============================================
-- 2. CREATE THE MASTER VIEW (Fixed Aggregation Logic)
-- ============================================
CREATE OR REPLACE VIEW view_active_repair_routes AS
-- A. Model-Service-Page routes
SELECT 
    'repair/' || loc.slug || '/' || svc.slug || '/' || mod.slug AS slug_path,
    'model-service-page'::text AS route_type,
    loc.id AS city_id,
    svc.id AS service_id,
    mod.id AS model_id,
    jsonb_build_object(
        'city', jsonb_build_object(
            'id', loc.id,
            'name', loc.city_name,
            'slug', loc.slug,
            'local_content', loc.local_content,
            'local_phone', loc.local_phone,
            'local_email', loc.local_email,
            'operating_hours', loc.operating_hours
        ),
        'service', jsonb_build_object(
            'id', svc.id,
            'name', svc.name,
            'slug', svc.slug,
            'description', svc.description,
            'display_name', svc.display_name,
            'estimated_duration_minutes', svc.estimated_duration_minutes,
            'is_doorstep_eligible', svc.is_doorstep_eligible
        ),
        'model', jsonb_build_object(
            'id', mod.id,
            'name', mod.name,
            'slug', mod.slug,
            'display_name', mod.display_name,
            'release_year', mod.release_year,
            'popularity_score', mod.popularity_score
        ),
        'brand', jsonb_build_object(
            'id', b.id,
            'name', b.name,
            'slug', b.slug,
            'display_name', b.display_name
        ),
        'pricing', COALESCE(
            (SELECT jsonb_build_object(
                'base_price', dp.base_price,
                'compare_at_price', dp.compare_at_price,
                'discounted_price', dp.discounted_price,
                'pricing_tier', dp.pricing_tier,
                'part_quality', dp.part_quality,
                'part_warranty_months', dp.part_warranty_months
            ) FROM dynamic_pricing dp 
            WHERE dp.model_id = mod.id AND dp.service_id = svc.id AND dp.is_active = true LIMIT 1), 
            '{}'::jsonb
        )
    ) AS payload
FROM service_locations loc
CROSS JOIN device_models mod
JOIN device_types dt ON mod.type_id = dt.id
JOIN brands b ON mod.brand_id = b.id
JOIN services svc ON svc.device_type_id = dt.id
WHERE loc.is_active = true 
    AND mod.is_active = true 
    AND dt.is_active = true 
    AND b.is_active = true 
    AND svc.is_active = true 
    AND svc.is_doorstep_eligible = true
    AND svc.requires_diagnostics = false

UNION ALL

-- B. City-Service-Page routes
SELECT 
    'repair/' || loc.slug || '/' || svc.slug AS slug_path,
    'city-service-page'::text AS route_type,
    loc.id AS city_id,
    svc.id AS service_id,
    NULL::uuid AS model_id,
    jsonb_build_object(
        'city', jsonb_build_object(
            'id', loc.id,
            'name', loc.city_name,
            'slug', loc.slug,
            'local_content', loc.local_content,
            'local_phone', loc.local_phone,
            'local_email', loc.local_email,
            'operating_hours', loc.operating_hours
        ),
        'service', jsonb_build_object(
            'id', svc.id,
            'name', svc.name,
            'slug', svc.slug,
            'description', svc.description,
            'display_name', svc.display_name,
            'estimated_duration_minutes', svc.estimated_duration_minutes
        ),
        'sample_models', (
            SELECT jsonb_agg(sub.data)
            FROM (
                SELECT jsonb_build_object(
                    'id', dm.id,
                    'name', dm.name,
                    'slug', dm.slug,
                    'display_name', dm.display_name
                ) as data
                FROM device_models dm
                WHERE dm.type_id = svc.device_type_id AND dm.is_active = true
                ORDER BY dm.popularity_score DESC
                LIMIT 5
            ) sub
        )
    ) AS payload
FROM service_locations loc
CROSS JOIN services svc
WHERE loc.is_active = true AND svc.is_active = true AND svc.is_doorstep_eligible = true

UNION ALL

-- C. City-Page routes
SELECT 
    'repair/' || loc.slug AS slug_path,
    'city-page'::text AS route_type,
    loc.id AS city_id,
    NULL::uuid AS service_id,
    NULL::uuid AS model_id,
    jsonb_build_object(
        'city', jsonb_build_object(
            'id', loc.id,
            'name', loc.city_name,
            'slug', loc.slug,
            'local_content', loc.local_content,
            'local_phone', loc.local_phone,
            'local_email', loc.local_email,
            'operating_hours', loc.operating_hours
        ),
        'sample_services', (
            SELECT jsonb_agg(sub.data)
            FROM (
                SELECT jsonb_build_object(
                    'id', s.id,
                    'name', s.name,
                    'slug', s.slug,
                    'display_name', s.display_name
                ) as data
                FROM services s 
                WHERE s.is_active = true AND s.is_doorstep_eligible = true 
                ORDER BY s.sort_order ASC
                LIMIT 8
            ) sub
        )
    ) AS payload
FROM service_locations loc
WHERE loc.is_active = true;

-- ============================================
-- 3. THE LOGIC FUNCTION (Manual & Internal Use)
-- ============================================
CREATE OR REPLACE FUNCTION refresh_dynamic_routes_logic(source_table text DEFAULT 'manual')
RETURNS void AS $$
DECLARE
    start_ts timestamptz := clock_timestamp();
    v_rows_gen integer;
    v_rows_del integer;
BEGIN
    -- 1. Upsert new/changed routes
    INSERT INTO dynamic_routes (slug_path, route_type, city_id, service_id, model_id, payload, last_updated)
    SELECT 
        slug_path, route_type, city_id, service_id, model_id, payload, NOW()
    FROM view_active_repair_routes
    ON CONFLICT (slug_path) DO UPDATE 
    SET 
        payload = EXCLUDED.payload,
        last_updated = NOW(),
        city_id = EXCLUDED.city_id,
        service_id = EXCLUDED.service_id,
        model_id = EXCLUDED.model_id;
        
    GET DIAGNOSTICS v_rows_gen = ROW_COUNT;

    -- 2. Delete stale routes
    WITH deleted_rows AS (
        DELETE FROM dynamic_routes 
        WHERE slug_path NOT IN (SELECT slug_path FROM view_active_repair_routes)
        RETURNING 1
    )
    SELECT count(*) INTO v_rows_del FROM deleted_rows;

    -- 3. Log
    INSERT INTO route_generation_logs (
        trigger_source, routes_generated, routes_skipped, duration_ms
    ) VALUES (
        source_table, 
        v_rows_gen, 
        v_rows_del,
        EXTRACT(MILLISECOND FROM clock_timestamp() - start_ts)
    );

EXCEPTION WHEN OTHERS THEN
    INSERT INTO route_generation_logs (
        trigger_source, routes_generated, error_message, stack_trace, duration_ms
    ) VALUES (
        source_table, 0, SQLERRM, SQLSTATE, EXTRACT(MILLISECOND FROM clock_timestamp() - start_ts)
    );
    RAISE WARNING 'Route generation failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. THE TRIGGER WRAPPER
-- ============================================
CREATE OR REPLACE FUNCTION trigger_handler_refresh_routes()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM refresh_dynamic_routes_logic(TG_TABLE_NAME);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. APPLY TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS trigger_refresh_routes_brands ON brands;
DROP TRIGGER IF EXISTS trigger_refresh_routes_locations ON service_locations;
DROP TRIGGER IF EXISTS trigger_refresh_routes_models ON device_models;
DROP TRIGGER IF EXISTS trigger_refresh_routes_services ON services;
DROP TRIGGER IF EXISTS trigger_refresh_routes_types ON device_types;
DROP TRIGGER IF EXISTS trigger_refresh_routes_pricing ON dynamic_pricing;

CREATE TRIGGER trigger_refresh_routes_brands AFTER INSERT OR DELETE OR UPDATE OF slug, name, is_active ON brands FOR EACH STATEMENT EXECUTE FUNCTION trigger_handler_refresh_routes();
CREATE TRIGGER trigger_refresh_routes_locations AFTER INSERT OR DELETE OR UPDATE OF slug, city_name, is_active ON service_locations FOR EACH STATEMENT EXECUTE FUNCTION trigger_handler_refresh_routes();
CREATE TRIGGER trigger_refresh_routes_models AFTER INSERT OR DELETE OR UPDATE OF slug, name, is_active, popularity_score ON device_models FOR EACH STATEMENT EXECUTE FUNCTION trigger_handler_refresh_routes();
CREATE TRIGGER trigger_refresh_routes_services AFTER INSERT OR DELETE OR UPDATE OF slug, name, is_active, is_doorstep_eligible ON services FOR EACH STATEMENT EXECUTE FUNCTION trigger_handler_refresh_routes();
CREATE TRIGGER trigger_refresh_routes_types AFTER INSERT OR DELETE OR UPDATE OF slug, name, is_active ON device_types FOR EACH STATEMENT EXECUTE FUNCTION trigger_handler_refresh_routes();
CREATE TRIGGER trigger_refresh_routes_pricing AFTER INSERT OR DELETE OR UPDATE OF base_price, is_active ON dynamic_pricing FOR EACH STATEMENT EXECUTE FUNCTION trigger_handler_refresh_routes();

-- ============================================
-- 6. MATERIALIZED VIEW & HELPERS
-- ============================================
CREATE MATERIALIZED VIEW mv_sitemap_routes AS
SELECT slug_path, route_type, last_updated FROM dynamic_routes;

CREATE UNIQUE INDEX idx_mv_sitemap_slug_unique ON mv_sitemap_routes(slug_path);

CREATE OR REPLACE FUNCTION refresh_sitemap_cache()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sitemap_routes;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION manual_refresh_routes_enhanced()
RETURNS jsonb AS $$
BEGIN
    PERFORM refresh_dynamic_routes_logic('manual_api');
    PERFORM refresh_sitemap_cache();
    RETURN (SELECT jsonb_build_object(
        'success', true, 
        'timestamp', NOW(),
        'counts', (SELECT jsonb_object_agg(route_type, c) FROM (SELECT route_type, count(*) as c FROM dynamic_routes GROUP BY 1) s)
    ));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. INITIALIZE
-- ============================================
SELECT refresh_dynamic_routes_logic('migration_init');
SELECT refresh_sitemap_cache();

COMMIT;