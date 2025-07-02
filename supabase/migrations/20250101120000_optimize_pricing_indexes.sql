-- Migration: Optimize Pricing Database Indexes
-- Created: 2025-01-01 12:00:00
-- Description: Remove unused indexes and add optimized composite indexes for better query performance

-- =============================================
-- 1. REMOVE UNUSED NON-CONSTRAINT INDEXES
-- =============================================

-- Drop unused indexes that have 0% usage (preserve constraint-backed indexes)
DROP INDEX IF EXISTS public.idx_dynamic_pricing_valid;
DROP INDEX IF EXISTS public.idx_dynamic_pricing_tier;
DROP INDEX IF EXISTS public.idx_models_name;
DROP INDEX IF EXISTS public.idx_dynamic_pricing_service;
DROP INDEX IF EXISTS public.idx_services_device_type;
DROP INDEX IF EXISTS public.idx_services_category;
DROP INDEX IF EXISTS public.idx_services_active;

-- =============================================
-- 2. ADD OPTIMIZED COMPOSITE INDEXES
-- =============================================

-- Primary pricing lookup optimization (most critical query)
CREATE INDEX IF NOT EXISTS idx_pricing_lookup_optimized 
ON public.dynamic_pricing(model_id, service_id, pricing_tier_id, is_active) 
WHERE is_active = true;

-- Management panel model lookup optimization  
CREATE INDEX IF NOT EXISTS idx_models_brand_name_active 
ON public.device_models(brand_id, name, is_active) 
WHERE is_active = true;

-- Service selection optimization
CREATE INDEX IF NOT EXISTS idx_services_category_device_active 
ON public.services(category_id, device_type_id, is_active) 
WHERE is_active = true;

-- Brand dropdown optimization
CREATE INDEX IF NOT EXISTS idx_brands_device_name_active 
ON public.brands(device_type_id, name, is_active) 
WHERE is_active = true;

-- Promotional pricing with date validation
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_active_dates 
ON public.dynamic_pricing(is_active, valid_from, valid_until) 
WHERE is_active = true;

-- Pricing tier filtering optimization
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_tier_active 
ON public.dynamic_pricing(pricing_tier_id, is_active) 
WHERE is_active = true;

-- Doorstep service filtering optimization
CREATE INDEX IF NOT EXISTS idx_services_doorstep_device_active 
ON public.services(is_doorstep_eligible, device_type_id, is_active) 
WHERE is_active = true AND is_doorstep_eligible = true;

-- =============================================
-- 3. UPDATE TABLE STATISTICS
-- =============================================

-- Update statistics for better query planning
ANALYZE public.dynamic_pricing;
ANALYZE public.device_models;
ANALYZE public.brands;
ANALYZE public.services;
ANALYZE public.pricing_tiers;
ANALYZE public.service_categories;
ANALYZE public.device_types; 