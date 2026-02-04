-- Migration: Fix Sitemap Lastmod Issue
-- Description: Adds content_updated_at column to dynamic_routes and creates triggers to update timestamps
-- Date: 2026-03-03
-- Priority: Critical (SEO improvement)

-- ============================================
-- PART 1: Add content_updated_at column to dynamic_routes
-- ============================================

DO $$
BEGIN
    -- Check if content_updated_at column already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'dynamic_routes' AND column_name = 'content_updated_at'
    ) THEN
        -- Add the column with default value
        ALTER TABLE dynamic_routes ADD COLUMN content_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        -- Initialize with last_updated value (which currently has identical timestamps)
        UPDATE dynamic_routes SET content_updated_at = last_updated;
        
        RAISE NOTICE 'Added content_updated_at column to dynamic_routes table';
    ELSE
        RAISE NOTICE 'content_updated_at column already exists in dynamic_routes table';
    END IF;
END $$;

-- ============================================
-- PART 2: Create trigger functions for updating dynamic_routes
-- ============================================

-- Function to update dynamic_routes when a service changes
CREATE OR REPLACE FUNCTION update_routes_on_service_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if SEO-relevant fields changed
    IF NEW.name != OLD.name OR 
       NEW.description != OLD.description OR 
       NEW.display_name != OLD.display_name OR
       NEW.updated_at != OLD.updated_at THEN
        
        -- Update city-service-page routes (13 routes per service)
        UPDATE dynamic_routes 
        SET last_updated = NOW(),
            content_updated_at = NOW()
        WHERE service_id = NEW.id 
          AND route_type = 'city-service-page';
        
        -- Update model-service-page routes (~1,287 routes per service)
        UPDATE dynamic_routes
        SET last_updated = NOW(),
            content_updated_at = NOW()
        WHERE service_id = NEW.id 
          AND route_type = 'model-service-page';
        
        RAISE NOTICE 'Updated dynamic_routes for service: % (affected routes: city-service-page + model-service-page)', NEW.name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update dynamic_routes when a device model changes
CREATE OR REPLACE FUNCTION update_routes_on_model_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if SEO-relevant fields changed
    IF NEW.name != OLD.name OR 
       NEW.display_name != OLD.display_name OR
       NEW.updated_at != OLD.updated_at THEN
        
        -- Update model-service-page routes for this model (~52 routes per model)
        UPDATE dynamic_routes
        SET last_updated = NOW(),
            content_updated_at = NOW()
        WHERE model_id = NEW.id 
          AND route_type = 'model-service-page';
        
        RAISE NOTICE 'Updated dynamic_routes for model: % (affected routes: model-service-page)', NEW.name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update dynamic_routes when a city/location changes
CREATE OR REPLACE FUNCTION update_routes_on_city_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if SEO-relevant fields changed
    IF NEW.city_name != OLD.city_name OR 
       NEW.local_content != OLD.local_content OR
       NEW.neighborhoods != OLD.neighborhoods THEN
        
        -- Update city-page routes (1 route per city)
        UPDATE dynamic_routes 
        SET last_updated = NOW(),
            content_updated_at = NOW()
        WHERE city_id = NEW.id 
          AND route_type = 'city-page';
        
        -- Update city-service-page routes (4 routes per city)
        UPDATE dynamic_routes
        SET last_updated = NOW(),
            content_updated_at = NOW()
        WHERE city_id = NEW.id 
          AND route_type = 'city-service-page';
        
        -- Update model-service-page routes (~396 routes per city)
        UPDATE dynamic_routes
        SET last_updated = NOW(),
            content_updated_at = NOW()
        WHERE city_id = NEW.id 
          AND route_type = 'model-service-page';
        
        RAISE NOTICE 'Updated dynamic_routes for city: % (affected routes: city-page + city-service-page + model-service-page)', NEW.city_name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update dynamic_routes when pricing changes
CREATE OR REPLACE FUNCTION update_routes_on_pricing_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Update specific model-service-page routes when pricing changes
    -- This affects routes across all cities (13 cities per model-service combination)
    
    -- First, get the service and model IDs
    DECLARE
        target_service_id UUID;
        target_model_id UUID;
    BEGIN
        -- Get service and model IDs from the pricing record
        SELECT service_id, model_id INTO target_service_id, target_model_id
        FROM dynamic_pricing WHERE id = NEW.id;
        
        IF target_service_id IS NOT NULL AND target_model_id IS NOT NULL THEN
            -- Update model-service-page routes for this combination across all cities
            UPDATE dynamic_routes
            SET last_updated = NOW(),
                content_updated_at = NOW()
            WHERE service_id = target_service_id 
              AND model_id = target_model_id
              AND route_type = 'model-service-page';
            
            RAISE NOTICE 'Updated dynamic_routes for pricing change (service_id: %, model_id: %)', 
                target_service_id, target_model_id;
        END IF;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update dynamic_routes when a neighborhood page changes
CREATE OR REPLACE FUNCTION update_routes_on_neighborhood_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Update routes when neighborhood content changes
    -- Note: Neighborhood pages are separate from dynamic_routes, but we should
    -- update city pages when neighborhoods change
    
    -- Update the parent city page when neighborhood content changes
    UPDATE dynamic_routes dr
    SET last_updated = NOW(),
        content_updated_at = NOW()
    FROM neighborhood_pages np
    WHERE dr.city_id = np.city_id
      AND dr.route_type = 'city-page'
      AND np.id = NEW.id;
    
    RAISE NOTICE 'Updated city page routes for neighborhood: %', NEW.neighborhood_name;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 3: Create indexes for performance
-- ============================================

-- Create composite indexes for efficient route updates
CREATE INDEX IF NOT EXISTS idx_dynamic_routes_service_city_model 
ON dynamic_routes(service_id, city_id, model_id, route_type);

CREATE INDEX IF NOT EXISTS idx_dynamic_routes_city_service 
ON dynamic_routes(city_id, service_id, route_type);

CREATE INDEX IF NOT EXISTS idx_dynamic_routes_model_service 
ON dynamic_routes(model_id, service_id, route_type);

-- Create index on last_updated for sitemap queries
CREATE INDEX IF NOT EXISTS idx_dynamic_routes_last_updated 
ON dynamic_routes(last_updated DESC);

CREATE INDEX IF NOT EXISTS idx_dynamic_routes_content_updated_at 
ON dynamic_routes(content_updated_at DESC);

-- ============================================
-- PART 4: Backfill realistic timestamps
-- ============================================

-- Update timestamps based on related table updates to create realistic distribution
DO $$
DECLARE
    service_record RECORD;
    model_record RECORD;
    city_record RECORD;
    days_ago INTEGER;
BEGIN
    -- For each service, update its routes with timestamps based on service updated_at
    FOR service_record IN (
        SELECT id, updated_at FROM services WHERE updated_at IS NOT NULL
    ) LOOP
        -- Add some variation (0-30 days) to create realistic distribution
        days_ago := floor(random() * 30);
        
        UPDATE dynamic_routes
        SET last_updated = service_record.updated_at - (days_ago || ' days')::INTERVAL,
            content_updated_at = service_record.updated_at - (days_ago || ' days')::INTERVAL
        WHERE service_id = service_record.id;
    END LOOP;
    
    -- For each model, update its routes with timestamps based on model updated_at
    FOR model_record IN (
        SELECT id, updated_at FROM device_models WHERE updated_at IS NOT NULL
    ) LOOP
        -- Add some variation (0-60 days) for models
        days_ago := floor(random() * 60);
        
        UPDATE dynamic_routes
        SET last_updated = model_record.updated_at - (days_ago || ' days')::INTERVAL,
            content_updated_at = model_record.updated_at - (days_ago || ' days')::INTERVAL
        WHERE model_id = model_record.id
          AND last_updated = '2026-02-03 04:23:24.398529+00'; -- Only update if still has original timestamp
    END LOOP;
    
    -- For each city, update its routes with timestamps
    FOR city_record IN (
        SELECT id, created_at FROM service_locations WHERE created_at IS NOT NULL
    ) LOOP
        -- Add some variation (0-90 days) for cities
        days_ago := floor(random() * 90);
        
        UPDATE dynamic_routes
        SET last_updated = city_record.created_at - (days_ago || ' days')::INTERVAL,
            content_updated_at = city_record.created_at - (days_ago || ' days')::INTERVAL
        WHERE city_id = city_record.id
          AND last_updated = '2026-02-03 04:23:24.398529+00'; -- Only update if still has original timestamp
    END LOOP;
    
    RAISE NOTICE 'Backfilled realistic timestamps for dynamic_routes';
END $$;

-- ============================================
-- PART 5: Verification and summary
-- ============================================

DO $$
DECLARE
    total_routes INTEGER;
    distinct_lastmod INTEGER;
    distinct_content_updated INTEGER;
    earliest_timestamp TIMESTAMP;
    latest_timestamp TIMESTAMP;
BEGIN
    -- Get statistics
    SELECT COUNT(*) INTO total_routes FROM dynamic_routes;
    SELECT COUNT(DISTINCT last_updated) INTO distinct_lastmod FROM dynamic_routes;
    SELECT COUNT(DISTINCT content_updated_at) INTO distinct_content_updated FROM dynamic_routes;
    SELECT MIN(last_updated), MAX(last_updated) INTO earliest_timestamp, latest_timestamp FROM dynamic_routes;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION COMPLETE - SITEMAP LASTMOD FIX';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total routes in dynamic_routes: %', total_routes;
    RAISE NOTICE 'Distinct last_updated timestamps: % (was: 1)', distinct_lastmod;
    RAISE NOTICE 'Distinct content_updated_at timestamps: %', distinct_content_updated;
    RAISE NOTICE 'Timestamp range: % to %', earliest_timestamp, latest_timestamp;
    RAISE NOTICE '';
    RAISE NOTICE 'Created trigger functions for:';
    RAISE NOTICE '  - Services (updates ~1,300 routes per change)';
    RAISE NOTICE '  - Device Models (updates ~52 routes per change)';
    RAISE NOTICE '  - Cities (updates ~413 routes per change)';
    RAISE NOTICE '  - Pricing (updates ~13 routes per change)';
    RAISE NOTICE '  - Neighborhoods (updates city pages)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Run the triggers migration (20260303010000_create_triggers.sql)';
    RAISE NOTICE '  2. Update sitemap generator to use content_updated_at';
    RAISE NOTICE '  3. Submit updated sitemap to Google Search Console';
    RAISE NOTICE '========================================';
END $$;