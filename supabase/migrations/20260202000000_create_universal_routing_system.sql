-- ============================================================
-- UNIVERSAL ROUTING SYSTEM MIGRATION
-- File: 20260202000000_create_universal_routing_system.sql
-- Description: Creates S-Tier universal routing system for pSEO
-- 
-- IMPORTANT: Run this migration in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- SECTION 1: DATABASE ANALYSIS SUMMARY
-- ============================================================

/*
DATABASE ANALYSIS RESULTS:

Key Tables for Universal Routing:
1. service_locations (13 cities) - Active service areas
2. device_types (2 types) - Mobile & Laptop (both active)
3. brands (3 brands) - Apple, Samsung, Google (all active)
4. device_models (124 models) - 98 Mobile, 26 Laptop
5. services (4 services) - Screen Replacement, Battery Replacement (2 each for Mobile/Laptop)
6. dynamic_pricing (496 rows) - Pricing data for model-service combinations

Business Rules Identified:
1. All tables have 'is_active' columns for filtering
2. Services have 'device_type_id' linking to device_types
3. Services have 'is_doorstep_eligible' for doorstep service filtering
4. Models have 'type_id' linking to device_types
5. Models have 'brand_id' linking to brands

Route Generation Logic:
- City + Service + Model combinations only
- Must respect device_type matching (Mobile services for Mobile models, etc.)
- Only include active records (is_active = true)
- Only include doorstep eligible services
*/

-- ============================================================
-- SECTION 2: CREATE MASTER FILTER VIEW
-- ============================================================

-- This view enforces ALL business rules and filters
CREATE OR REPLACE VIEW view_active_repair_routes AS
SELECT 
    -- Construct the URL slug: /repair/city/service/model
    'repair/' || loc.slug || '/' || svc.slug || '/' || mod.slug AS slug_path,
    
    -- Route metadata
    'model-service-page'::text as route_type,
    
    -- Foreign key references
    loc.id as city_id,
    svc.id as service_id,
    mod.id as model_id,
    
    -- Slug components for URL construction
    loc.slug as city_slug,
    svc.slug as service_slug,
    mod.slug as model_slug,
    dt.slug as type_slug,
    b.slug as brand_slug,
    
    -- Pre-computed content payload for performance
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
        'type', jsonb_build_object(
            'id', dt.id,
            'name', dt.name,
            'slug', dt.slug
        ),
        'brand', jsonb_build_object(
            'id', b.id,
            'name', b.name,
            'slug', b.slug,
            'display_name', b.display_name
        )
    ) as payload,
    
    -- Statistics for monitoring
    loc.city_name as city_name,
    svc.name as service_name,
    mod.name as model_name,
    dt.name as device_type_name,
    b.name as brand_name
    
FROM service_locations loc
-- Cross join: Every city with every model
CROSS JOIN device_models mod
-- Join device type for the model
JOIN device_types dt ON mod.type_id = dt.id
-- Join brand for the model
JOIN brands b ON mod.brand_id = b.id
-- Join services that match the device type (CRITICAL BUSINESS RULE)
JOIN services svc ON svc.device_type_id = dt.id

-- BUSINESS RULES FILTERS:
WHERE 
    -- Active locations only
    loc.is_active = true 
    -- Active models only
    AND mod.is_active = true
    -- Active device types only
    AND dt.is_active = true
    -- Active brands only
    AND b.is_active = true
    -- Active services only
    AND svc.is_active = true
    -- Doorstep eligible services only
    AND svc.is_doorstep_eligible = true
    -- Exclude services that require diagnostics (optional business rule)
    AND svc.requires_diagnostics = false;

COMMENT ON VIEW view_active_repair_routes IS 'Master view that filters all inactive combinations and enforces business rules for universal routing';

-- ============================================================
-- SECTION 3: CREATE DYNAMIC ROUTES CACHE TABLE
-- ============================================================

-- This table acts as a high-speed cache for Next.js static generation
CREATE TABLE IF NOT EXISTS dynamic_routes (
    -- Primary identifier: the actual URL path
    slug_path TEXT PRIMARY KEY,
    
    -- Route classification
    route_type TEXT NOT NULL CHECK (route_type IN ('model-service-page', 'city-service-page', 'city-page')),
    
    -- Foreign key references (for data enrichment)
    city_id UUID REFERENCES service_locations(id),
    service_id UUID REFERENCES services(id),
    model_id UUID REFERENCES device_models(id),
    
    -- Pre-computed content (reduces database queries during page generation)
    payload JSONB NOT NULL DEFAULT '{}',
    
    -- Timestamps for cache invalidation
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional metadata
    is_featured BOOLEAN DEFAULT false,
    seo_score INTEGER DEFAULT 0
);

COMMENT ON TABLE dynamic_routes IS 'Cache table for active routes - used by Next.js for static generation and sitemap creation';

-- ============================================================
-- SECTION 4: CREATE PERFORMANCE INDEXES
-- ============================================================

-- Index for route type filtering
CREATE INDEX IF NOT EXISTS idx_dynamic_routes_type ON dynamic_routes(route_type);

-- Index for city-based queries
CREATE INDEX IF NOT EXISTS idx_dynamic_routes_city ON dynamic_routes(city_id);

-- Index for service-based queries
CREATE INDEX IF NOT EXISTS idx_dynamic_routes_service ON dynamic_routes(service_id);

-- Index for model-based queries
CREATE INDEX IF NOT EXISTS idx_dynamic_routes_model ON dynamic_routes(model_id);

-- Index for timestamp-based cache invalidation
CREATE INDEX IF NOT EXISTS idx_dynamic_routes_updated ON dynamic_routes(last_updated);

-- Index for featured content
CREATE INDEX IF NOT EXISTS idx_dynamic_routes_featured ON dynamic_routes(is_featured) WHERE is_featured = true;

-- Index for SEO optimization
CREATE INDEX IF NOT EXISTS idx_dynamic_routes_seo ON dynamic_routes(seo_score DESC);

-- ============================================================
-- SECTION 5: CREATE REDIRECTS TABLE (Database-Driven)
-- ============================================================

-- This table allows redirect management via Supabase dashboard (no code deploys)
CREATE TABLE IF NOT EXISTS redirects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source path (the old URL)
    source_path TEXT NOT NULL,
    
    -- Target path (the new URL)
    target_path TEXT NOT NULL,
    
    -- HTTP status code (301 = permanent, 302 = temporary)
    status_code INTEGER NOT NULL DEFAULT 301 CHECK (status_code IN (301, 302)),
    
    -- Activation control
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT 'system',
    
    -- Notes for administrative purposes
    notes TEXT,
    
    -- Unique constraint to prevent duplicate redirects
    UNIQUE(source_path, target_path)
);

COMMENT ON TABLE redirects IS 'Database-driven redirects - managed via Supabase dashboard without code deployments';

-- Performance indexes for redirects
CREATE INDEX IF NOT EXISTS idx_redirects_source ON redirects(source_path) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_redirects_active ON redirects(is_active);
CREATE INDEX IF NOT EXISTS idx_redirects_updated ON redirects(updated_at DESC);

-- ============================================================
-- SECTION 6: CREATE ROUTE GENERATION LOGS TABLE
-- ============================================================

-- This table monitors route generation performance and issues
CREATE TABLE IF NOT EXISTS route_generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What triggered the generation
    trigger_source TEXT NOT NULL CHECK (trigger_source IN ('manual', 'trigger', 'scheduled', 'api')),
    
    -- Generation statistics
    routes_generated INTEGER NOT NULL,
    routes_skipped INTEGER DEFAULT 0,
    duration_ms INTEGER NOT NULL,
    
    -- Error tracking
    error_message TEXT,
    stack_trace TEXT,
    
    -- Performance metrics
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ DEFAULT NOW(),
    
    -- Additional context
    context JSONB DEFAULT '{}'
);

COMMENT ON TABLE route_generation_logs IS 'Logs for monitoring route generation performance and troubleshooting issues';

-- Indexes for monitoring and analytics
CREATE INDEX IF NOT EXISTS idx_route_logs_time ON route_generation_logs(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_route_logs_source ON route_generation_logs(trigger_source);
CREATE INDEX IF NOT EXISTS idx_route_logs_error ON route_generation_logs(error_message) WHERE error_message IS NOT NULL;

-- ============================================================
-- SECTION 7: CREATE SELF-HEALING TRIGGER FUNCTIONS
-- ============================================================

-- Function to refresh the dynamic_routes cache
CREATE OR REPLACE FUNCTION refresh_dynamic_routes()
RETURNS TRIGGER AS $$
DECLARE
    start_time TIMESTAMPTZ := clock_timestamp();
    generated_count INTEGER;
    skipped_count INTEGER := 0;
BEGIN
    -- Log start of refresh
    INSERT INTO route_generation_logs (trigger_source, routes_generated, duration_ms, context)
    VALUES (
        COALESCE(TG_ARGV[0], 'trigger'),
        0,
        0,
        jsonb_build_object('trigger_table', TG_TABLE_NAME, 'trigger_event', TG_OP)
    );
    
    -- Clear old routes (truncate is faster than delete)
    TRUNCATE TABLE dynamic_routes;
    
    -- Insert fresh routes from the master view
    INSERT INTO dynamic_routes (slug_path, route_type, city_id, service_id, model_id, payload)
    SELECT 
        slug_path,
        route_type,
        city_id,
        service_id,
        model_id,
        payload
    FROM view_active_repair_routes;
    
    -- Get count of generated routes
    GET DIAGNOSTICS generated_count = ROW_COUNT;
    
    -- Calculate duration
    DECLARE
        end_time TIMESTAMPTZ := clock_timestamp();
        duration INTEGER := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    BEGIN
        -- Update the log with actual counts
        UPDATE route_generation_logs 
        SET 
            routes_generated = generated_count,
            routes_skipped = skipped_count,
            duration_ms = duration,
            end_time = end_time
        WHERE id = (SELECT MAX(id) FROM route_generation_logs);
    END;
    
    RETURN NULL;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error
        INSERT INTO route_generation_logs (
            trigger_source, 
            routes_generated, 
            duration_ms, 
            error_message, 
            stack_trace,
            context
        ) VALUES (
            COALESCE(TG_ARGV[0], 'trigger'),
            0,
            EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) * 1000,
            SQLERRM,
            SQLSTATE,
            jsonb_build_object('trigger_table', TG_TABLE_NAME, 'trigger_event', TG_OP, 'error', 'true')
        );
        
        -- Re-raise the error
        RAISE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_dynamic_routes() IS 'Refreshes the dynamic_routes cache table from the master view, with logging and error handling';

-- ============================================================
-- SECTION 8: CREATE TRIGGERS FOR AUTOMATIC REFRESH
-- ============================================================

-- Trigger for service_locations table
CREATE OR REPLACE TRIGGER trigger_refresh_routes_locations
AFTER INSERT OR UPDATE OF is_active, slug, city_name OR DELETE ON service_locations
FOR EACH STATEMENT 
EXECUTE FUNCTION refresh_dynamic_routes('service_locations');

-- Trigger for services table
CREATE OR REPLACE TRIGGER trigger_refresh_routes_services
AFTER INSERT OR UPDATE OF is_active, slug, name, device_type_id, is_doorstep_eligible OR DELETE ON services
FOR EACH STATEMENT 
EXECUTE FUNCTION refresh_dynamic_routes('services');

-- Trigger for device_models table
CREATE OR REPLACE TRIGGER trigger_refresh_routes_models
AFTER INSERT OR UPDATE OF is_active, slug, name, type_id, brand_id OR DELETE ON device_models
FOR EACH STATEMENT 
EXECUTE FUNCTION refresh_dynamic_routes('device_models');

-- Trigger for device_types table
CREATE OR REPLACE TRIGGER trigger_refresh_routes_types
AFTER INSERT OR UPDATE OF is_active, slug, name OR DELETE ON device_types
FOR EACH STATEMENT 
EXECUTE FUNCTION refresh_dynamic_routes('device_types');

-- Trigger for brands table
CREATE OR REPLACE TRIGGER trigger_refresh_routes_brands
AFTER INSERT OR UPDATE OF is_active, slug, name OR DELETE ON brands
FOR EACH STATEMENT 
EXECUTE FUNCTION refresh_dynamic_routes('brands');

-- ============================================================
-- SECTION 9: INITIAL DATA POPULATION
-- ============================================================

-- Populate the dynamic_routes table with initial data
DO $$
DECLARE
    start_time TIMESTAMPTZ := clock_timestamp();
    generated_count INTEGER;
BEGIN
    -- Clear any existing data
    TRUNCATE TABLE dynamic_routes;
    
    -- Insert initial routes from the master view
    INSERT INTO dynamic_routes (slug_path, route_type, city_id, service_id, model_id, payload)
    SELECT 
        slug_path,
        route_type,
        city_id,
        service_id,
        model_id,
        payload
    FROM view_active_repair_routes;
    
    -- Get count of generated routes
    GET DIAGNOSTICS generated_count = ROW_COUNT;
    
    -- Log the initial population
    INSERT INTO route_generation_logs (
        trigger_source, 
        routes_generated, 
        duration_ms,
        context
    ) VALUES (
        'manual',
        generated_count,
        EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) * 1000,
        jsonb_build_object('initial_population', 'true', 'route_count', generated_count)
    );
    
    RAISE NOTICE 'Initial population complete: % routes generated', generated_count;
END $$;

-- ============================================================
-- SECTION 10: CREATE HELPER FUNCTIONS
-- ============================================================

-- Function to manually trigger route refresh
CREATE OR REPLACE FUNCTION manual_refresh_routes()
RETURNS JSONB AS $$
DECLARE
    start_time TIMESTAMPTZ := clock_timestamp();
    generated_count INTEGER;
    duration_ms INTEGER;
BEGIN
    -- Call the refresh function
    PERFORM refresh_dynamic_routes();
    
    -- Get the latest log entry
    SELECT routes_generated, duration_ms 
    INTO generated_count, duration_ms
    FROM route_generation_logs 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Return success response
    RETURN jsonb_build_object(
        'success', true,
        'routes_generated', COALESCE(generated_count, 0),
        'duration_ms', COALESCE(duration_ms, 0),
        'timestamp', NOW()
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'sqlstate', SQLSTATE,
            'timestamp', NOW()
        );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION manual_refresh_routes() IS 'Manually triggers a refresh of the dynamic routes cache';

-- Function to get route statistics
CREATE OR REPLACE FUNCTION get_route_statistics()
RETURNS JSONB AS $$
DECLARE
    total_routes INTEGER;
    active_cities INTEGER;
    active_services INTEGER;
    active_models INTEGER;
    last_refresh TIMESTAMPTZ;
BEGIN
    -- Get counts
    SELECT COUNT(*) INTO total_routes FROM dynamic_routes;
    SELECT COUNT(DISTINCT city_id) INTO active_cities FROM dynamic_routes;
    SELECT COUNT(DISTINCT service_id) INTO active_services FROM dynamic_routes;
    SELECT COUNT(DISTINCT model_id) INTO active_models FROM dynamic_routes;
    SELECT MAX(last_updated) INTO last_refresh FROM dynamic_routes;
    
    -- Return statistics
    RETURN jsonb_build_object(
        'total_routes', total_routes,
        'active_cities', active_cities,
        'active_services', active_services,
        'active_models', active_models,
        'last_refresh', last_refresh,
        'estimated_pages', total_routes,
        'refresh_needed', CASE WHEN last_refresh < NOW() - INTERVAL '24 hours' THEN true ELSE false END
    );
END;
$$ LANGUAGE plpgsql;

-- Finish the COMMENT that was cut off
COMMENT ON FUNCTION get_route_statistics() IS 'Returns a summary of the current state of the dynamic routing system';

-- Final Step: Set permissions so your Next.js app can see these tables
-- Assuming you use the 'anon' or 'authenticated' role for your frontend
ALTER TABLE public.dynamic_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.dynamic_routes FOR SELECT USING (true);

ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.redirects FOR SELECT USING (true);

-- Run an initial count to make sure it worked
SELECT 
    (SELECT count(*) FROM dynamic_routes) as total_generated_routes,
    (SELECT count(*) FROM route_generation_logs) as log_entries;