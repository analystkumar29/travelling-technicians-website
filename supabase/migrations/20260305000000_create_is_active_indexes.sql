-- Migration: Create indexes for is_active field optimization
-- Purpose: Improve query performance for active/inactive filtering
-- Date: 2026-05-05

-- Create index on dynamic_pricing.is_active for better query performance
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_is_active 
ON public.dynamic_pricing(is_active);

-- Create composite index for common filter combinations (status + tier)
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_status_tier 
ON public.dynamic_pricing(is_active, pricing_tier);

-- Create index for model and service lookups with status
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_model_service_status 
ON public.dynamic_pricing(model_id, service_id, is_active);

-- Create index on dynamic_routes.is_active for route filtering
CREATE INDEX IF NOT EXISTS idx_dynamic_routes_is_active 
ON public.dynamic_routes(is_active)
WHERE is_active = true;
