-- BACKUP SCRIPT: Recreate indexes if rollback is needed
-- Run this ONLY if you need to restore the old indexes

-- =============================================
-- ROLLBACK: Recreate indexes that will be dropped
-- =============================================

-- NOTE: These indexes had 0% usage, but keeping script for safety

-- Recreate the unused indexes (only run if rollback needed)
CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_valid 
ON public.dynamic_pricing(valid_from, valid_until) 
WHERE is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS dynamic_pricing_service_id_model_id_pricing_tier_id_key 
ON public.dynamic_pricing(service_id, model_id, pricing_tier_id);

CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_tier 
ON public.dynamic_pricing(pricing_tier_id);

CREATE INDEX IF NOT EXISTS idx_models_name 
ON public.device_models(name);

CREATE INDEX IF NOT EXISTS idx_dynamic_pricing_service 
ON public.dynamic_pricing(service_id);

CREATE INDEX IF NOT EXISTS idx_services_device_type 
ON public.services(device_type_id);

CREATE INDEX IF NOT EXISTS idx_services_category 
ON public.services(category_id);

CREATE INDEX IF NOT EXISTS idx_services_active 
ON public.services(is_active);

CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_email_key 
ON public.user_profiles(email);

CREATE UNIQUE INDEX IF NOT EXISTS technicians_email_key 
ON public.technicians(email);

CREATE UNIQUE INDEX IF NOT EXISTS warranties_warranty_code_key 
ON public.warranties(warranty_code);

-- Success message for rollback
SELECT 'ROLLBACK: Old indexes restored' as status; 