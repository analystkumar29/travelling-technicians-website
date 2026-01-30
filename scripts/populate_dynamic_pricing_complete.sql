-- ============================================
-- COMPLETE DYNAMIC PRICING POPULATION SCRIPT
-- For The Travelling Technicians Website
-- ============================================
-- 
-- This script populates the dynamic_pricing table with all missing combinations
-- of active device models, active services, and pricing tiers.
--
-- SAFETY FEATURES:
-- 1. Only creates entries for active models and services
-- 2. Skips combinations that already exist
-- 3. Uses sensible default pricing based on service type and device type
-- 4. Includes detailed logging and verification
-- ============================================

-- Start transaction for safety
BEGIN;

-- Create a temporary table to log what we're doing
CREATE TEMP TABLE IF NOT EXISTS pricing_population_log (
    id SERIAL PRIMARY KEY,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Log start
INSERT INTO pricing_population_log (message) VALUES ('Starting dynamic pricing population script');

-- ============================================
-- STEP 1: Analyze current state
-- ============================================

INSERT INTO pricing_population_log (message) VALUES ('Analyzing current pricing state...');

-- Count current entries
DO $$
DECLARE
    current_count INTEGER;
    active_models INTEGER;
    active_services INTEGER;
    expected_combinations INTEGER;
BEGIN
    -- Get current count
    SELECT COUNT(*) INTO current_count FROM dynamic_pricing WHERE is_active = true;
    
    -- Get active models count
    SELECT COUNT(*) INTO active_models FROM device_models WHERE is_active = true;
    
    -- Get active services count  
    SELECT COUNT(*) INTO active_services FROM services WHERE is_active = true;
    
    -- Calculate expected combinations (models × services × 2 tiers)
    expected_combinations := active_models * active_services * 2;
    
    INSERT INTO pricing_population_log (message) VALUES (
        'Current state: ' || current_count || ' pricing entries, ' || 
        active_models || ' active models, ' || 
        active_services || ' active services, expecting ' || 
        expected_combinations || ' total combinations'
    );
END $$;

-- ============================================
-- STEP 2: Define pricing rules
-- ============================================

INSERT INTO pricing_population_log (message) VALUES ('Defining pricing rules...');

-- Create a temporary table for pricing rules
CREATE TEMP TABLE pricing_rules (
    service_type TEXT,
    device_type_name TEXT,
    standard_price NUMERIC,
    premium_price NUMERIC,
    part_quality_standard TEXT,
    part_quality_premium TEXT
);

-- Insert pricing rules based on service and device type
INSERT INTO pricing_rules (service_type, device_type_name, standard_price, premium_price, part_quality_standard, part_quality_premium) VALUES
    -- Battery Replacement pricing
    ('Battery Replacement', 'Mobile', 80.00, 100.00, 'High-quality aftermarket battery', 'Original OEM battery with 12-month warranty'),
    ('Battery Replacement', 'Laptop', 120.00, 150.00, 'High-quality aftermarket battery', 'Original OEM battery with 12-month warranty'),
    
    -- Screen Replacement pricing  
    ('Screen Replacement', 'Mobile', 150.00, 180.00, 'Premium aftermarket LCD/LED screen', 'Original OEM screen with anti-scratch coating'),
    ('Screen Replacement', 'Laptop', 200.00, 250.00, 'Premium aftermarket LCD/LED screen', 'Original OEM screen with anti-glare coating');

-- ============================================
-- STEP 3: Identify missing combinations
-- ============================================

INSERT INTO pricing_population_log (message) VALUES ('Identifying missing pricing combinations...');

-- Create a temporary table of all possible combinations
CREATE TEMP TABLE all_possible_combinations AS
SELECT 
    dm.id AS model_id,
    s.id AS service_id,
    dt.name AS device_type_name,
    s.name AS service_name,
    tier.pricing_tier,
    CASE 
        WHEN tier.pricing_tier = 'standard' THEN pr.standard_price
        ELSE pr.premium_price
    END AS base_price,
    CASE 
        WHEN tier.pricing_tier = 'standard' THEN pr.part_quality_standard
        ELSE pr.part_quality_premium
    END AS part_quality,
    CASE 
        WHEN tier.pricing_tier = 'standard' THEN 3  -- 3 months warranty for standard
        ELSE 12  -- 12 months warranty for premium
    END AS part_warranty_months
FROM device_models dm
JOIN device_types dt ON dm.type_id = dt.id
CROSS JOIN services s
CROSS JOIN (SELECT 'standard' AS pricing_tier UNION SELECT 'premium') tier
JOIN pricing_rules pr ON s.name = pr.service_type AND dt.name = pr.device_type_name
WHERE dm.is_active = true
  AND s.is_active = true
  AND NOT EXISTS (
    SELECT 1 
    FROM dynamic_pricing dp 
    WHERE dp.model_id = dm.id 
      AND dp.service_id = s.id 
      AND dp.pricing_tier = tier.pricing_tier
      AND dp.is_active = true
  );

-- Log how many combinations are missing
DO $$
DECLARE
    missing_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO missing_count FROM all_possible_combinations;
    INSERT INTO pricing_population_log (message) VALUES ('Found ' || missing_count || ' missing pricing combinations');
END $$;

-- ============================================
-- STEP 4: Insert missing combinations
-- ============================================

INSERT INTO pricing_population_log (message) VALUES ('Inserting missing pricing combinations...');

-- Insert the missing combinations
INSERT INTO dynamic_pricing (
    model_id,
    service_id,
    base_price,
    compare_at_price,
    pricing_tier,
    part_quality,
    part_warranty_months,
    includes_installation,
    is_active,
    created_at
)
SELECT 
    model_id,
    service_id,
    base_price,
    -- Compare at price is 20% higher than base price for perceived value
    ROUND(base_price * 1.2, 2) AS compare_at_price,
    pricing_tier,
    part_quality,
    part_warranty_months,
    true AS includes_installation,  -- All services include installation
    true AS is_active,
    NOW() AS created_at
FROM all_possible_combinations;

-- Log how many were inserted
DO $$
DECLARE
    inserted_count INTEGER;
BEGIN
    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    INSERT INTO pricing_population_log (message) VALUES ('Successfully inserted ' || inserted_count || ' new pricing entries');
END $$;

-- ============================================
-- STEP 5: Verification and reporting
-- ============================================

INSERT INTO pricing_population_log (message) VALUES ('Verifying completion...');

-- Create verification report
DO $$
DECLARE
    final_count INTEGER;
    active_models INTEGER;
    active_services INTEGER;
    expected_combinations INTEGER;
    completion_percentage NUMERIC;
    service_summary TEXT;
    service_record RECORD;
BEGIN
    -- Get final count
    SELECT COUNT(*) INTO final_count FROM dynamic_pricing WHERE is_active = true;
    
    -- Get active models count
    SELECT COUNT(*) INTO active_models FROM device_models WHERE is_active = true;
    
    -- Get active services count  
    SELECT COUNT(*) INTO active_services FROM services WHERE is_active = true;
    
    -- Calculate expected combinations
    expected_combinations := active_models * active_services * 2;
    
    -- Calculate completion percentage
    completion_percentage := ROUND((final_count::NUMERIC / expected_combinations::NUMERIC) * 100, 2);
    
    -- Get service breakdown (fixed to avoid nested aggregates)
    service_summary := '';
    FOR service_record IN (
        SELECT s.name AS service_name, COUNT(*) as entry_count
        FROM dynamic_pricing dp
        JOIN services s ON dp.service_id = s.id
        WHERE dp.is_active = true
        GROUP BY s.name
        ORDER BY s.name
    ) LOOP
        IF service_summary != '' THEN
            service_summary := service_summary || ', ';
        END IF;
        service_summary := service_summary || service_record.service_name || ': ' || service_record.entry_count || ' entries';
    END LOOP;
    
    -- Log summary
    INSERT INTO pricing_population_log (message) VALUES (
        'VERIFICATION COMPLETE: ' || final_count || ' total pricing entries (' || 
        completion_percentage || '% of expected ' || expected_combinations || ')'
    );
    
    INSERT INTO pricing_population_log (message) VALUES ('Service breakdown: ' || service_summary);
    
    -- Check for any still missing
    IF final_count < expected_combinations THEN
        INSERT INTO pricing_population_log (message) VALUES (
            'WARNING: Still missing ' || (expected_combinations - final_count) || ' combinations'
        );
    ELSE
        INSERT INTO pricing_population_log (message) VALUES ('SUCCESS: All expected combinations created!');
    END IF;
END $$;

-- ============================================
-- STEP 6: Generate detailed report
-- ============================================

INSERT INTO pricing_population_log (message) VALUES ('Generating detailed report...');

-- Report by service and device type
DO $$
DECLARE
    report_record RECORD;
BEGIN
    INSERT INTO pricing_population_log (message) VALUES ('=== DETAILED PRICING REPORT ===');
    
    FOR report_record IN (
        SELECT 
            dt.name AS device_type,
            s.name AS service,
            dp.pricing_tier,
            COUNT(*) AS entry_count,
            MIN(dp.base_price) AS min_price,
            MAX(dp.base_price) AS max_price,
            ROUND(AVG(dp.base_price), 2) AS avg_price
        FROM dynamic_pricing dp
        JOIN device_models dm ON dp.model_id = dm.id
        JOIN device_types dt ON dm.type_id = dt.id
        JOIN services s ON dp.service_id = s.id
        WHERE dp.is_active = true
        GROUP BY dt.name, s.name, dp.pricing_tier
        ORDER BY dt.name, s.name, dp.pricing_tier
    ) LOOP
        INSERT INTO pricing_population_log (message) VALUES (
            report_record.device_type || ' - ' || report_record.service || 
            ' (' || report_record.pricing_tier || '): ' || 
            report_record.entry_count || ' entries, $' || report_record.min_price || 
            ' - $' || report_record.max_price || ' (avg: $' || report_record.avg_price || ')'
        );
    END LOOP;
    
    INSERT INTO pricing_population_log (message) VALUES ('=== END REPORT ===');
END $$;

-- ============================================
-- STEP 7: Final summary and cleanup
-- ============================================

-- Display the log
INSERT INTO pricing_population_log (message) VALUES ('Script execution complete. Review log below:');

SELECT message, created_at 
FROM pricing_population_log 
ORDER BY id;

-- Drop temporary tables (optional, they'll be auto-dropped at session end)
-- DROP TABLE IF EXISTS pricing_rules;
-- DROP TABLE IF EXISTS all_possible_combinations;
-- DROP TABLE IF EXISTS pricing_population_log;

-- ============================================
-- IMPORTANT: Review before committing!
-- ============================================
-- 
-- TO ROLLBACK (if needed):
-- DELETE FROM dynamic_pricing WHERE created_at >= (SELECT MIN(created_at) FROM pricing_population_log);
-- 
-- TO COMMIT:
-- COMMIT;
-- 
-- ============================================

-- Uncomment the line below to automatically commit
-- COMMIT;

-- For safety, we leave the transaction open for manual review
-- Remove the ROLLBACK line below and add COMMIT when ready

ROLLBACK; -- REMOVE THIS LINE AND REPLACE WITH 'COMMIT;' WHEN READY TO APPLY CHANGES