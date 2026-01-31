-- Migration: Add required columns for sitemap functionality
-- Description: Adds updated_at and popularity_score columns to support sitemap generation
-- Date: 2026-01-31

-- Add updated_at column to services table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE services ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        
        -- Update existing rows to have updated_at = created_at
        UPDATE services SET updated_at = created_at WHERE updated_at IS NULL;
        
        -- Create trigger to automatically update updated_at on row updates
        CREATE OR REPLACE FUNCTION update_services_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        DROP TRIGGER IF EXISTS update_services_updated_at_trigger ON services;
        CREATE TRIGGER update_services_updated_at_trigger
        BEFORE UPDATE ON services
        FOR EACH ROW
        EXECUTE FUNCTION update_services_updated_at();
        
        RAISE NOTICE 'Added updated_at column to services table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in services table';
    END IF;
END $$;

-- Add updated_at column to device_models table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'device_models' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE device_models ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        
        -- Update existing rows to have updated_at = created_at
        UPDATE device_models SET updated_at = created_at WHERE updated_at IS NULL;
        
        -- Create trigger to automatically update updated_at on row updates
        CREATE OR REPLACE FUNCTION update_device_models_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        DROP TRIGGER IF EXISTS update_device_models_updated_at_trigger ON device_models;
        CREATE TRIGGER update_device_models_updated_at_trigger
        BEFORE UPDATE ON device_models
        FOR EACH ROW
        EXECUTE FUNCTION update_device_models_updated_at();
        
        RAISE NOTICE 'Added updated_at column to device_models table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in device_models table';
    END IF;
END $$;

-- Add popularity_score column to device_models table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'device_models' AND column_name = 'popularity_score'
    ) THEN
        ALTER TABLE device_models ADD COLUMN popularity_score INTEGER DEFAULT 0;
        
        -- Set initial popularity scores based on device type and release year
        -- Newer devices get higher scores, iPhones get higher scores
        UPDATE device_models 
        SET popularity_score = CASE 
            WHEN LOWER(name) LIKE '%iphone%' THEN 100
            WHEN LOWER(name) LIKE '%samsung%' THEN 80
            WHEN LOWER(name) LIKE '%google%' THEN 70
            WHEN LOWER(name) LIKE '%macbook%' THEN 90
            WHEN LOWER(name) LIKE '%ipad%' THEN 75
            ELSE 50
        END;
        
        -- Add bonus for newer devices (2020 and later)
        UPDATE device_models 
        SET popularity_score = popularity_score + 20 
        WHERE release_year >= 2020;
        
        -- Add bonus for very new devices (2023 and later)
        UPDATE device_models 
        SET popularity_score = popularity_score + 30 
        WHERE release_year >= 2023;
        
        -- Ensure scores are within reasonable bounds
        UPDATE device_models 
        SET popularity_score = GREATEST(10, LEAST(200, popularity_score));
        
        RAISE NOTICE 'Added popularity_score column to device_models table with initial values';
    ELSE
        RAISE NOTICE 'popularity_score column already exists in device_models table';
    END IF;
END $$;

-- Create index on popularity_score for better query performance
CREATE INDEX IF NOT EXISTS idx_device_models_popularity_score ON device_models(popularity_score DESC);

-- Create index on updated_at columns for better sitemap query performance
CREATE INDEX IF NOT EXISTS idx_services_updated_at ON services(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_device_models_updated_at ON device_models(updated_at DESC);

-- Verify the changes
DO $$
DECLARE
    services_has_updated_at BOOLEAN;
    device_models_has_updated_at BOOLEAN;
    device_models_has_popularity_score BOOLEAN;
BEGIN
    -- Check services table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'updated_at'
    ) INTO services_has_updated_at;
    
    -- Check device_models table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'device_models' AND column_name = 'updated_at'
    ) INTO device_models_has_updated_at;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'device_models' AND column_name = 'popularity_score'
    ) INTO device_models_has_popularity_score;
    
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE '  - services.updated_at: %', 
        CASE WHEN services_has_updated_at THEN 'ADDED' ELSE 'ALREADY EXISTS' END;
    RAISE NOTICE '  - device_models.updated_at: %', 
        CASE WHEN device_models_has_updated_at THEN 'ADDED' ELSE 'ALREADY EXISTS' END;
    RAISE NOTICE '  - device_models.popularity_score: %', 
        CASE WHEN device_models_has_popularity_score THEN 'ADDED' ELSE 'ALREADY EXISTS' END;
    
    -- Show sample data
    RAISE NOTICE '';
    RAISE NOTICE 'Sample device models with popularity scores:';
    FOR rec IN (
        SELECT name, popularity_score, release_year 
        FROM device_models 
        WHERE popularity_score > 0 
        ORDER BY popularity_score DESC 
        LIMIT 5
    ) LOOP
        RAISE NOTICE '  - %: popularity_score=%, release_year=%', 
            rec.name, rec.popularity_score, rec.release_year;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Migration completed successfully!';
END $$;