-- Add quality control columns to device_models table
-- This migration adds quality scoring, data source tracking, and review flags

-- Add quality_score column (0-100, where 100 is highest quality)
ALTER TABLE public.device_models 
ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 100 
CHECK (quality_score >= 0 AND quality_score <= 100);

-- Add data_source column to track where the model came from
ALTER TABLE public.device_models 
ADD COLUMN IF NOT EXISTS data_source VARCHAR(20) DEFAULT 'manual'
CHECK (data_source IN ('manual', 'scraped', 'imported', 'static'));

-- Add needs_review flag for models requiring human verification
ALTER TABLE public.device_models 
ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT FALSE;

-- Add reviewed_at timestamp to track when model was last reviewed
ALTER TABLE public.device_models 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Add reviewed_by to track who reviewed the model
ALTER TABLE public.device_models 
ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255);

-- Create index for quality control queries
CREATE INDEX IF NOT EXISTS idx_models_quality_control 
ON public.device_models(quality_score, needs_review, data_source);

-- Create staging table for scraped data
CREATE TABLE IF NOT EXISTS public.device_models_staging (
    LIKE public.device_models INCLUDING ALL
);

-- Add import metadata to staging table
ALTER TABLE public.device_models_staging 
ADD COLUMN IF NOT EXISTS import_batch_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS import_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS import_source VARCHAR(255),
ADD COLUMN IF NOT EXISTS auto_quality_score INTEGER,
ADD COLUMN IF NOT EXISTS quality_issues JSONB;

-- Create index for staging table queries
CREATE INDEX IF NOT EXISTS idx_staging_import_batch 
ON public.device_models_staging(import_batch_id, import_date);

-- Update existing models with quality scores based on name patterns
-- Models with technical codes get lower scores
UPDATE public.device_models 
SET quality_score = 50,
    needs_review = true,
    data_source = 'scraped'
WHERE name ~* '(QV\d+|V\d+|CE\d+|T\d+|Premium|Standard|Economy|Compatible|Assembly|LCD|OLED)'
   OR name ~* '^\d+$'
   OR name ~* '35[GH]00\d{3}';

-- Mark clean models as high quality
UPDATE public.device_models 
SET quality_score = 95,
    needs_review = false
WHERE data_source = 'manual'
   AND name !~* '(QV\d+|V\d+|CE\d+|T\d+|Premium|Standard|Economy|Compatible|Assembly|LCD|OLED)'
   AND name !~* '^\d+$'
   AND name !~* '35[GH]00\d{3}';

-- Add comment for documentation
COMMENT ON COLUMN public.device_models.quality_score IS 'Quality score from 0-100, where 100 is highest quality. Used to filter out contaminated model names.';
COMMENT ON COLUMN public.device_models.data_source IS 'Source of the model data: manual (entered by admin), scraped (from MobileActive), imported (bulk import), static (hardcoded)';
COMMENT ON COLUMN public.device_models.needs_review IS 'Flag indicating model needs human review before being shown to customers';
COMMENT ON TABLE public.device_models_staging IS 'Staging table for scraped device models pending review before moving to production';
