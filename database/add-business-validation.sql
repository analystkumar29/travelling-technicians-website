-- Phase 3: Dynamic Pricing Business Logic Validation
-- Adds comprehensive constraints and validation rules for data integrity
-- Run this in Supabase SQL Editor after verifying the database structure

-- =============================================
-- 1. ENHANCED UNIQUE CONSTRAINTS
-- =============================================

-- Ensure unique pricing per device model + service + tier combination
-- This prevents duplicate pricing entries that could cause confusion
DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_pricing_combination'
    AND table_name = 'dynamic_pricing'
  ) THEN
    ALTER TABLE public.dynamic_pricing 
    ADD CONSTRAINT unique_pricing_combination 
    UNIQUE (service_id, model_id, pricing_tier_id);
    
    RAISE NOTICE 'Added unique_pricing_combination constraint';
  ELSE
    RAISE NOTICE 'unique_pricing_combination constraint already exists';
  END IF;
END $$;

-- =============================================
-- 2. PRICING VALIDATION CONSTRAINTS
-- =============================================

-- Ensure discounted price is not higher than base price
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_discounted_price_logic'
  ) THEN
    ALTER TABLE public.dynamic_pricing 
    ADD CONSTRAINT check_discounted_price_logic 
    CHECK (
      discounted_price IS NULL OR 
      (discounted_price <= base_price AND discounted_price > 0)
    );
    
    RAISE NOTICE 'Added check_discounted_price_logic constraint';
  ELSE
    RAISE NOTICE 'check_discounted_price_logic constraint already exists';
  END IF;
END $$;

-- Ensure base price is always positive
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_base_price_positive'
  ) THEN
    ALTER TABLE public.dynamic_pricing 
    ADD CONSTRAINT check_base_price_positive 
    CHECK (base_price > 0);
    
    RAISE NOTICE 'Added check_base_price_positive constraint';
  ELSE
    RAISE NOTICE 'check_base_price_positive constraint already exists';
  END IF;
END $$;

-- Ensure cost price is not higher than base price (for profit margin validation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_cost_price_logic'
  ) THEN
    ALTER TABLE public.dynamic_pricing 
    ADD CONSTRAINT check_cost_price_logic 
    CHECK (
      cost_price IS NULL OR 
      (cost_price <= base_price AND cost_price > 0)
    );
    
    RAISE NOTICE 'Added check_cost_price_logic constraint';
  ELSE
    RAISE NOTICE 'check_cost_price_logic constraint already exists';
  END IF;
END $$;

-- =============================================
-- 3. TIER VALIDATION RULES
-- =============================================

-- Ensure pricing tier multipliers are reasonable (0.5x to 3.0x)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_tier_multiplier_range'
  ) THEN
    ALTER TABLE public.pricing_tiers 
    ADD CONSTRAINT check_tier_multiplier_range 
    CHECK (price_multiplier >= 0.5 AND price_multiplier <= 3.0);
    
    RAISE NOTICE 'Added check_tier_multiplier_range constraint';
  ELSE
    RAISE NOTICE 'check_tier_multiplier_range constraint already exists';
  END IF;
END $$;

-- Ensure delivery hours are reasonable (1 to 168 hours = 1 week max)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_delivery_hours_range'
  ) THEN
    ALTER TABLE public.pricing_tiers 
    ADD CONSTRAINT check_delivery_hours_range 
    CHECK (
      estimated_delivery_hours IS NULL OR 
      (estimated_delivery_hours >= 1 AND estimated_delivery_hours <= 168)
    );
    
    RAISE NOTICE 'Added check_delivery_hours_range constraint';
  ELSE
    RAISE NOTICE 'check_delivery_hours_range constraint already exists';
  END IF;
END $$;

-- =============================================
-- 4. LOCATION VALIDATION RULES
-- =============================================

-- Ensure location price adjustments are reasonable (-50% to +100%)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_location_adjustment_range'
  ) THEN
    ALTER TABLE public.service_locations 
    ADD CONSTRAINT check_location_adjustment_range 
    CHECK (price_adjustment_percentage >= -50.0 AND price_adjustment_percentage <= 100.0);
    
    RAISE NOTICE 'Added check_location_adjustment_range constraint';
  ELSE
    RAISE NOTICE 'check_location_adjustment_range constraint already exists';
  END IF;
END $$;

-- =============================================
-- 5. SERVICE VALIDATION RULES  
-- =============================================

-- Ensure service duration is reasonable (5 minutes to 8 hours)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_service_duration_range'
  ) THEN
    ALTER TABLE public.services 
    ADD CONSTRAINT check_service_duration_range 
    CHECK (
      estimated_duration_minutes IS NULL OR 
      (estimated_duration_minutes >= 5 AND estimated_duration_minutes <= 480)
    );
    
    RAISE NOTICE 'Added check_service_duration_range constraint';
  ELSE
    RAISE NOTICE 'check_service_duration_range constraint already exists';
  END IF;
END $$;

-- Ensure warranty period is reasonable (1 day to 5 years)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_warranty_period_range'
  ) THEN
    ALTER TABLE public.services 
    ADD CONSTRAINT check_warranty_period_range 
    CHECK (warranty_period_days >= 1 AND warranty_period_days <= 1825);
    
    RAISE NOTICE 'Added check_warranty_period_range constraint';
  ELSE
    RAISE NOTICE 'check_warranty_period_range constraint already exists';
  END IF;
END $$;

-- =============================================
-- 6. ENHANCED FOREIGN KEY CONSTRAINTS  
-- =============================================

-- Ensure proper cascade behavior for data integrity
-- (Most foreign keys should already exist, this adds any missing ones)

-- Device models must belong to valid brands
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'device_models_brand_id_fkey'
    AND table_name = 'device_models'
  ) THEN
    ALTER TABLE public.device_models 
    ADD CONSTRAINT device_models_brand_id_fkey 
    FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added device_models_brand_id_fkey constraint';
  ELSE
    RAISE NOTICE 'device_models_brand_id_fkey constraint already exists';
  END IF;
END $$;

-- Brands must belong to valid device types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'brands_device_type_id_fkey'
    AND table_name = 'brands'
  ) THEN
    ALTER TABLE public.brands 
    ADD CONSTRAINT brands_device_type_id_fkey 
    FOREIGN KEY (device_type_id) REFERENCES public.device_types(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Added brands_device_type_id_fkey constraint';
  ELSE
    RAISE NOTICE 'brands_device_type_id_fkey constraint already exists';
  END IF;
END $$;

-- =============================================
-- 7. DATA VALIDATION FUNCTIONS
-- =============================================

-- Function to validate pricing entry before insert/update
CREATE OR REPLACE FUNCTION validate_pricing_entry()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if service and model belong to the same device type
  IF NOT EXISTS (
    SELECT 1 
    FROM services s
    JOIN device_models dm ON dm.id = NEW.model_id
    JOIN brands b ON b.id = dm.brand_id
    WHERE s.id = NEW.service_id 
    AND s.device_type_id = b.device_type_id
  ) THEN
    RAISE EXCEPTION 'Service and device model must belong to the same device type';
  END IF;
  
  -- Validate pricing tier exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM pricing_tiers 
    WHERE id = NEW.pricing_tier_id AND is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Pricing tier must exist and be active';
  END IF;
  
  -- Log the validation
  RAISE NOTICE 'Pricing entry validated: service_id=%, model_id=%, tier_id=%', 
    NEW.service_id, NEW.model_id, NEW.pricing_tier_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply validation trigger
DROP TRIGGER IF EXISTS validate_pricing_entry_trigger ON public.dynamic_pricing;
CREATE TRIGGER validate_pricing_entry_trigger
  BEFORE INSERT OR UPDATE ON public.dynamic_pricing
  FOR EACH ROW EXECUTE FUNCTION validate_pricing_entry();

-- =============================================
-- 8. PRICING CALCULATION HELPER FUNCTION
-- =============================================

-- Function to calculate final price with all adjustments
CREATE OR REPLACE FUNCTION calculate_final_price(
  p_service_id INTEGER,
  p_model_id INTEGER,
  p_pricing_tier_id INTEGER,
  p_postal_code TEXT DEFAULT NULL
)
RETURNS TABLE (
  base_price DECIMAL(10,2),
  discounted_price DECIMAL(10,2),
  tier_multiplier DECIMAL(3,2),
  location_adjustment DECIMAL(5,2),
  final_price DECIMAL(10,2),
  savings DECIMAL(10,2)
) AS $$
DECLARE
  pricing_record RECORD;
  location_record RECORD;
  working_price DECIMAL(10,2);
  location_adjust DECIMAL(5,2) := 0;
  postal_prefix TEXT;
BEGIN
  -- Get pricing record
  SELECT dp.base_price, dp.discounted_price, pt.price_multiplier
  INTO pricing_record
  FROM dynamic_pricing dp
  JOIN pricing_tiers pt ON pt.id = dp.pricing_tier_id
  WHERE dp.service_id = p_service_id 
    AND dp.model_id = p_model_id 
    AND dp.pricing_tier_id = p_pricing_tier_id
    AND dp.is_active = TRUE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No pricing found for service_id=%, model_id=%, tier_id=%', 
      p_service_id, p_model_id, p_pricing_tier_id;
  END IF;
  
  -- Use discounted price if available, otherwise base price
  working_price := COALESCE(pricing_record.discounted_price, pricing_record.base_price);
  
  -- Apply location adjustment if postal code provided
  IF p_postal_code IS NOT NULL THEN
    postal_prefix := UPPER(SUBSTRING(p_postal_code, 1, 3));
    
    SELECT sl.price_adjustment_percentage
    INTO location_adjust
    FROM service_locations sl
    WHERE postal_prefix = ANY(sl.postal_code_prefixes)
      AND sl.is_active = TRUE
    LIMIT 1;
    
    location_adjust := COALESCE(location_adjust, 0);
  END IF;
  
  -- Calculate final price
  final_price := ROUND(working_price * (1 + location_adjust / 100.0), 2);
  
  -- Calculate savings (only if discounted price is used)
  savings := CASE 
    WHEN pricing_record.discounted_price IS NOT NULL 
    THEN pricing_record.base_price - pricing_record.discounted_price
    ELSE 0
  END;
  
  -- Return results
  RETURN QUERY SELECT 
    pricing_record.base_price,
    pricing_record.discounted_price,
    pricing_record.price_multiplier,
    location_adjust,
    calculate_final_price.final_price,
    calculate_final_price.savings;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 9. VERIFICATION AND TESTING
-- =============================================

-- Verify constraint creation
SELECT 
  'Validation Summary' as section,
  COUNT(*) as total_constraints
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
  AND table_name IN ('dynamic_pricing', 'pricing_tiers', 'service_locations', 'services', 'device_models', 'brands');

-- Test the pricing calculation function (if data exists)
DO $$
DECLARE
  test_result RECORD;
BEGIN
  -- Try to test with first available pricing entry
  SELECT dp.service_id, dp.model_id, dp.pricing_tier_id
  INTO test_result
  FROM dynamic_pricing dp
  WHERE dp.is_active = TRUE
  LIMIT 1;
  
  IF FOUND THEN
    RAISE NOTICE 'Testing pricing calculation with service_id=%, model_id=%, tier_id=%', 
      test_result.service_id, test_result.model_id, test_result.pricing_tier_id;
    
    -- Test the calculation function
    PERFORM calculate_final_price(
      test_result.service_id, 
      test_result.model_id, 
      test_result.pricing_tier_id,
      'V6B'  -- Downtown Vancouver postal code
    );
    
    RAISE NOTICE 'Pricing calculation function test passed';
  ELSE
    RAISE NOTICE 'No pricing data available for testing';
  END IF;
END $$;

-- Success message
SELECT 
  '🎉 Dynamic Pricing Business Validation Complete!' as message,
  'Added comprehensive constraints and validation rules' as details,
  'System now enforces data integrity and business logic' as outcome; 