-- Phase 3: Pipeline Redesign and Staging Process (Simplified)
-- This migration creates the basic staging infrastructure for scraped data review

-- Note: This is a simplified version that doesn't depend on existing schema
-- Advanced features will be added once the base schema is established

-- =============================================
-- 1. BASIC STAGING TABLES
-- =============================================

-- Import batch tracking (standalone table)
CREATE TABLE IF NOT EXISTS public.import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_name VARCHAR(255) NOT NULL,
    source_system VARCHAR(100) NOT NULL, -- 'mobileactive', 'manual_upload', 'api_import'
    import_type VARCHAR(50) NOT NULL, -- 'models', 'pricing', 'combined'
    
    -- Import statistics
    total_records INTEGER NOT NULL DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    approved_records INTEGER DEFAULT 0,
    rejected_records INTEGER DEFAULT 0,
    error_records INTEGER DEFAULT 0,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Quality metrics
    average_quality_score DECIMAL(5,2),
    contamination_rate DECIMAL(5,2), -- Percentage of contaminated records
    auto_approved_count INTEGER DEFAULT 0,
    manual_review_count INTEGER DEFAULT 0,
    
    -- Metadata
    import_settings JSONB, -- Store import configuration
    error_summary JSONB, -- Store error details
    created_by VARCHAR(255),
    processing_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quality rules configuration (standalone table)
CREATE TABLE IF NOT EXISTS public.quality_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL UNIQUE,
    rule_type VARCHAR(50) NOT NULL, -- 'contamination', 'validation', 'enhancement'
    description TEXT,
    
    -- Rule definition
    pattern_regex VARCHAR(500),
    pattern_flags VARCHAR(10), -- 'i' for case insensitive, 'g' for global
    field_targets TEXT[], -- Which fields to apply this rule to
    
    -- Scoring
    score_impact INTEGER NOT NULL, -- Positive or negative impact on quality score
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    is_blocking BOOLEAN DEFAULT false, -- If true, automatically reject
    
    -- Configuration
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Higher priority rules run first
    category VARCHAR(50), -- Group related rules
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anomaly detection results (standalone table)
CREATE TABLE IF NOT EXISTS public.anomaly_detections (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER,
    staging_record_id INTEGER,
    import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE CASCADE,
    
    -- Anomaly details
    anomaly_type VARCHAR(100) NOT NULL, -- 'contaminated_name', 'suspicious_price', 'duplicate_model', etc.
    confidence_level DECIMAL(5,2) NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 1),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Detection details
    detected_pattern VARCHAR(500),
    context_data JSONB, -- Additional context about the anomaly
    suggestion TEXT, -- Suggested fix or action
    
    -- Resolution
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'false_positive', 'resolved', 'ignored')),
    resolved_by VARCHAR(255),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer feedback integration (standalone table)
CREATE TABLE IF NOT EXISTS public.customer_feedback (
    id SERIAL PRIMARY KEY,
    
    -- Feedback source
    source_type VARCHAR(50) NOT NULL, -- 'booking_form', 'support_ticket', 'survey', 'api'
    source_reference VARCHAR(255), -- Booking ID, ticket ID, etc.
    customer_email VARCHAR(255),
    
    -- Feedback content
    feedback_type VARCHAR(50) NOT NULL, -- 'model_incorrect', 'pricing_issue', 'service_unavailable'
    subject_table VARCHAR(100), -- 'device_models', 'dynamic_pricing', 'services'
    subject_record_id INTEGER,
    
    -- Feedback details
    reported_issue TEXT NOT NULL,
    suggested_correction TEXT,
    severity_reported VARCHAR(20) DEFAULT 'medium' CHECK (severity_reported IN ('low', 'medium', 'high', 'critical')),
    
    -- Processing
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'confirmed', 'rejected', 'resolved')),
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    
    -- Actions taken
    action_taken TEXT,
    related_review_queue_id INTEGER, -- Will be linked later when review_queue exists
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. INDEXES FOR PERFORMANCE
-- =============================================

-- Import batches indexes
CREATE INDEX IF NOT EXISTS idx_import_batches_status ON public.import_batches(status);
CREATE INDEX IF NOT EXISTS idx_import_batches_started ON public.import_batches(started_at);
CREATE INDEX IF NOT EXISTS idx_import_batches_source ON public.import_batches(source_system);

-- Quality rules indexes
CREATE INDEX IF NOT EXISTS idx_quality_rules_active ON public.quality_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_quality_rules_priority ON public.quality_rules(priority);
CREATE INDEX IF NOT EXISTS idx_quality_rules_type ON public.quality_rules(rule_type);

-- Anomaly detection indexes
CREATE INDEX IF NOT EXISTS idx_anomaly_detections_batch ON public.anomaly_detections(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_detections_status ON public.anomaly_detections(status);
CREATE INDEX IF NOT EXISTS idx_anomaly_detections_severity ON public.anomaly_detections(severity);
CREATE INDEX IF NOT EXISTS idx_anomaly_detections_type ON public.anomaly_detections(anomaly_type);

-- Customer feedback indexes
CREATE INDEX IF NOT EXISTS idx_customer_feedback_status ON public.customer_feedback(status);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_type ON public.customer_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_subject ON public.customer_feedback(subject_table, subject_record_id);

-- =============================================
-- 3. SEED DATA FOR QUALITY RULES
-- =============================================

-- Insert default quality rules for contamination detection
INSERT INTO public.quality_rules (rule_name, rule_type, description, pattern_regex, pattern_flags, field_targets, score_impact, severity, is_blocking, priority, category) VALUES
-- Technical codes detection
('technical_codes_qv', 'contamination', 'Detects QV technical codes in model names', 'QV\\d+', 'gi', ARRAY['name', 'display_name'], -30, 'high', false, 100, 'contamination'),
('technical_codes_v', 'contamination', 'Detects version codes (V1, V2, etc.) in model names', '\\bV\\d+\\b', 'gi', ARRAY['name', 'display_name'], -25, 'medium', false, 90, 'contamination'),
('technical_codes_ce', 'contamination', 'Detects CE codes in model names', 'CE\\d+', 'gi', ARRAY['name', 'display_name'], -30, 'high', false, 95, 'contamination'),
('technical_codes_t', 'contamination', 'Detects T codes in model names', '\\bT\\d+\\b', 'gi', ARRAY['name', 'display_name'], -20, 'medium', false, 85, 'contamination'),

-- Quality indicators that shouldn't be in model names
('quality_indicators', 'contamination', 'Detects quality descriptors in model names', '\\b(Premium|Standard|Economy|Compatible|Assembly|Aftermarket|OEM|Original)\\b', 'gi', ARRAY['name', 'display_name'], -35, 'high', false, 110, 'contamination'),

-- Part descriptors
('part_descriptors', 'contamination', 'Detects part descriptors in model names', '\\b(LCD|OLED|Screen|Display|Battery|Assembly|Replacement)\\b', 'gi', ARRAY['name', 'display_name'], -40, 'critical', true, 120, 'contamination'),

-- Google part numbers
('google_part_numbers', 'contamination', 'Detects Google part numbers', '35[GH]00\\d{3}', 'g', ARRAY['name', 'display_name'], -50, 'critical', true, 130, 'contamination'),

-- Just numbers or single letters
('just_numbers', 'contamination', 'Detects model names that are just numbers', '^\\d+$', 'g', ARRAY['name', 'display_name'], -45, 'critical', true, 125, 'contamination'),
('single_letters', 'contamination', 'Detects model names that are single letters', '^[A-Z]$', 'gi', ARRAY['name', 'display_name'], -45, 'critical', true, 125, 'contamination'),

-- Year in parentheses
('year_parentheses', 'contamination', 'Detects years in parentheses', '\\(\\d{4}\\)', 'g', ARRAY['name', 'display_name'], -15, 'low', false, 50, 'contamination'),

-- Version indicators
('version_indicators', 'contamination', 'Detects version indicators in parentheses', '\\(Version\\s*\\d+\\)', 'gi', ARRAY['name', 'display_name'], -20, 'medium', false, 75, 'contamination'),

-- Frame indicators
('frame_indicators', 'contamination', 'Detects frame indicators', '\\((With|Without)\\s+(Frame|Housing)\\)', 'gi', ARRAY['name', 'display_name'], -25, 'medium', false, 80, 'contamination'),

-- Positive validation rules
('proper_brand_model', 'validation', 'Rewards proper brand + model format', '^(iPhone|Galaxy|Pixel|OnePlus)\\s+\\w+', 'gi', ARRAY['name', 'display_name'], 20, 'low', false, 10, 'validation'),
('has_brand_prefix', 'validation', 'Rewards models with recognizable brand prefix', '^(Samsung|Apple|Google|OnePlus|Huawei|Xiaomi)', 'gi', ARRAY['name', 'display_name'], 15, 'low', false, 15, 'validation'),
('reasonable_length', 'validation', 'Rewards reasonably sized model names', '^.{5,50}$', 'g', ARRAY['name', 'display_name'], 10, 'low', false, 5, 'validation')

ON CONFLICT (rule_name) DO NOTHING;

-- =============================================
-- 4. BASIC VIEWS
-- =============================================

-- Simple view for import batches dashboard
CREATE OR REPLACE VIEW public.staging_dashboard AS
SELECT 
    ib.id,
    ib.batch_name,
    ib.source_system,
    ib.import_type,
    ib.status,
    ib.total_records,
    ib.processed_records,
    ib.approved_records,
    ib.rejected_records,
    ib.error_records,
    ib.average_quality_score,
    ib.contamination_rate,
    ib.started_at,
    ib.completed_at,
    CASE 
        WHEN ib.total_records > 0 THEN 
            ROUND((ib.processed_records::DECIMAL / ib.total_records) * 100, 2)
        ELSE 0 
    END as progress_percentage
FROM public.import_batches ib
ORDER BY ib.started_at DESC;

-- View for anomaly summary
CREATE OR REPLACE VIEW public.anomaly_summary AS
SELECT 
    ad.anomaly_type,
    ad.severity,
    COUNT(*) as count,
    AVG(ad.confidence_level) as avg_confidence,
    COUNT(CASE WHEN ad.status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN ad.status = 'confirmed' THEN 1 END) as confirmed_count
FROM public.anomaly_detections ad
WHERE ad.created_at >= NOW() - INTERVAL '30 days'
GROUP BY ad.anomaly_type, ad.severity
ORDER BY COUNT(*) DESC;

-- Add comments for documentation
COMMENT ON TABLE public.import_batches IS 'Tracks import batches with statistics and status';
COMMENT ON TABLE public.quality_rules IS 'Configurable rules for quality scoring and contamination detection';
COMMENT ON TABLE public.anomaly_detections IS 'Results from automated anomaly detection on imported data';
COMMENT ON TABLE public.customer_feedback IS 'Customer-reported issues and feedback for quality improvement';

SELECT 'Phase 3 basic staging pipeline infrastructure created successfully!' as message;