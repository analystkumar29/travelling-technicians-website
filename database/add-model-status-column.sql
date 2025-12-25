-- Migration: Add status column to device_models table
-- Purpose: Enable manual review workflow for models before making them public
-- Date: 2025-01-06

-- Add status column to device_models table
ALTER TABLE public.device_models 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'));

-- Add comment to explain the column
COMMENT ON COLUMN public.device_models.status IS 'Status of the model: draft (not visible to public), published (visible), archived (hidden but preserved)';

-- Update existing records to 'published' if they are currently active
-- This ensures existing models remain visible to customers
UPDATE public.device_models 
SET status = 'published' 
WHERE is_active = true AND status IS NULL;

-- Update existing records to 'archived' if they are inactive
UPDATE public.device_models 
SET status = 'archived' 
WHERE is_active = false AND (status IS NULL OR status = 'draft');

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_models_status ON public.device_models(status);

-- Create a composite index for common queries (status + is_active)
CREATE INDEX IF NOT EXISTS idx_models_status_active ON public.device_models(status, is_active);

-- Update the public read access policy to only show published models
DROP POLICY IF EXISTS "Public read access for device_models" ON public.device_models;
CREATE POLICY "Public read access for device_models" ON public.device_models 
FOR SELECT USING (is_active = true AND status = 'published');

-- Create a view for admin to see all models with their status
CREATE OR REPLACE VIEW public.admin_models_overview AS
SELECT 
    dm.id,
    dm.name as model_name,
    dm.display_name as model_display_name,
    dm.status,
    dm.is_active,
    dm.is_featured,
    dm.model_year,
    dm.screen_size,
    dm.created_at,
    dm.updated_at,
    b.id as brand_id,
    b.name as brand_name,
    b.display_name as brand_display_name,
    dt.id as device_type_id,
    dt.name as device_type,
    dt.display_name as device_type_display_name,
    CASE 
        WHEN dm.status = 'published' AND dm.is_active = true THEN 'Visible to Public'
        WHEN dm.status = 'draft' THEN 'Draft - Needs Review'
        WHEN dm.status = 'archived' THEN 'Archived - Hidden'
        ELSE 'Inactive'
    END as visibility_status,
    -- Count pricing entries for this model
    (SELECT COUNT(*) FROM public.dynamic_pricing WHERE model_id = dm.id AND is_active = true) as active_pricing_count
FROM public.device_models dm
JOIN public.brands b ON dm.brand_id = b.id
JOIN public.device_types dt ON b.device_type_id = dt.id
ORDER BY dm.created_at DESC;

-- Add helpful function to publish models
CREATE OR REPLACE FUNCTION public.publish_model(p_model_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.device_models 
    SET status = 'published', is_active = true, updated_at = NOW()
    WHERE id = p_model_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful function to archive models
CREATE OR REPLACE FUNCTION public.archive_model(p_model_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.device_models 
    SET status = 'archived', is_active = false, updated_at = NOW()
    WHERE id = p_model_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful function to bulk publish models
CREATE OR REPLACE FUNCTION public.bulk_publish_models(p_model_ids INTEGER[])
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.device_models 
    SET status = 'published', is_active = true, updated_at = NOW()
    WHERE id = ANY(p_model_ids);
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
SELECT 'Status column added to device_models table successfully!' as message;
SELECT 'Existing active models have been set to "published" status.' as note;
SELECT 'New models will default to "draft" status and require manual publishing.' as workflow;
