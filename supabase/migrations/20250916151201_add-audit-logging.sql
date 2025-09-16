-- Add comprehensive audit logging system
-- This migration creates audit tables and triggers for tracking all changes

-- =============================================
-- 1. AUDIT LOG TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id VARCHAR(255),
    user_email VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    api_endpoint VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id VARCHAR(255),
    reason TEXT,
    metadata JSONB
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operation ON public.audit_logs(operation);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_email);

-- =============================================
-- 2. APPROVAL WORKFLOW TABLES
-- =============================================

-- Approval workflow states
CREATE TABLE IF NOT EXISTS public.approval_workflows (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    table_name VARCHAR(100) NOT NULL,
    required_approvers INTEGER DEFAULT 1,
    auto_approve_threshold INTEGER, -- Auto-approve if quality score above this
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pending approvals
CREATE TABLE IF NOT EXISTS public.pending_approvals (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER REFERENCES public.approval_workflows(id) ON DELETE CASCADE,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    proposed_changes JSONB NOT NULL,
    current_values JSONB,
    requested_by VARCHAR(255) NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    metadata JSONB
);

-- Approval history
CREATE TABLE IF NOT EXISTS public.approval_history (
    id SERIAL PRIMARY KEY,
    pending_approval_id INTEGER REFERENCES public.pending_approvals(id) ON DELETE CASCADE,
    approver_email VARCHAR(255) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected', 'requested_changes')),
    comment TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pending_approvals_status ON public.pending_approvals(status);
CREATE INDEX IF NOT EXISTS idx_pending_approvals_requested ON public.pending_approvals(requested_by);
CREATE INDEX IF NOT EXISTS idx_pending_approvals_table ON public.pending_approvals(table_name, record_id);

-- =============================================
-- 3. DATA LINEAGE TRACKING
-- =============================================

-- Data lineage for tracking data sources and transformations
CREATE TABLE IF NOT EXISTS public.data_lineage (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    source_system VARCHAR(100) NOT NULL, -- 'manual', 'mobileactive', 'import', 'api'
    source_reference VARCHAR(255), -- Original ID from source system
    import_batch_id UUID,
    transformation_applied TEXT[], -- List of transformations applied
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
    confidence_score DECIMAL(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    validation_status VARCHAR(20) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'rejected', 'needs_review')),
    validated_by VARCHAR(255),
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_data_lineage_table_record ON public.data_lineage(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_data_lineage_source ON public.data_lineage(source_system);
CREATE INDEX IF NOT EXISTS idx_data_lineage_batch ON public.data_lineage(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_data_lineage_quality ON public.data_lineage(quality_score);

-- =============================================
-- 4. REVIEW QUEUE SYSTEM
-- =============================================

-- Review queue for models needing human review
CREATE TABLE IF NOT EXISTS public.review_queue (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    review_type VARCHAR(50) NOT NULL, -- 'quality_check', 'pricing_review', 'content_validation'
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'escalated')),
    assigned_to VARCHAR(255),
    assigned_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    review_notes TEXT,
    review_data JSONB, -- Flexible data for review context
    deadline TIMESTAMP WITH TIME ZONE,
    escalation_level INTEGER DEFAULT 0,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(255),
    resolution_notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_review_queue_status ON public.review_queue(status);
CREATE INDEX IF NOT EXISTS idx_review_queue_assigned ON public.review_queue(assigned_to);
CREATE INDEX IF NOT EXISTS idx_review_queue_type ON public.review_queue(review_type);
CREATE INDEX IF NOT EXISTS idx_review_queue_priority ON public.review_queue(priority);

-- =============================================
-- 5. AUDIT TRIGGERS
-- =============================================

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_values JSONB;
    new_values JSONB;
    changed_fields TEXT[] DEFAULT '{}';
    field_name TEXT;
BEGIN
    -- Convert OLD and NEW records to JSONB
    IF TG_OP = 'DELETE' THEN
        old_values := to_jsonb(OLD);
        new_values := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        old_values := NULL;
        new_values := to_jsonb(NEW);
    ELSE -- UPDATE
        old_values := to_jsonb(OLD);
        new_values := to_jsonb(NEW);
        
        -- Find changed fields
        FOR field_name IN SELECT jsonb_object_keys(new_values) LOOP
            IF old_values->field_name IS DISTINCT FROM new_values->field_name THEN
                changed_fields := array_append(changed_fields, field_name);
            END IF;
        END LOOP;
    END IF;

    -- Insert audit record
    INSERT INTO public.audit_logs (
        table_name,
        record_id,
        operation,
        old_values,
        new_values,
        changed_fields,
        user_email,
        timestamp
    ) VALUES (
        TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        TG_OP,
        old_values,
        new_values,
        changed_fields,
        current_setting('app.current_user_email', true), -- Set by application
        NOW()
    );

    -- Return appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to key tables
DROP TRIGGER IF EXISTS audit_device_models ON public.device_models;
CREATE TRIGGER audit_device_models
    AFTER INSERT OR UPDATE OR DELETE ON public.device_models
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_brands ON public.brands;
CREATE TRIGGER audit_brands
    AFTER INSERT OR UPDATE OR DELETE ON public.brands
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_dynamic_pricing ON public.dynamic_pricing;
CREATE TRIGGER audit_dynamic_pricing
    AFTER INSERT OR UPDATE OR DELETE ON public.dynamic_pricing
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =============================================
-- 6. SEED DATA FOR WORKFLOWS
-- =============================================

-- Insert default approval workflows
INSERT INTO public.approval_workflows (name, description, table_name, required_approvers, auto_approve_threshold) VALUES
('model_quality_review', 'Review queue for device models with quality issues', 'device_models', 1, 80),
('pricing_changes', 'Approval workflow for significant pricing changes', 'dynamic_pricing', 1, NULL),
('bulk_operations', 'Approval required for bulk operations affecting multiple records', 'device_models', 1, NULL)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 7. HELPFUL VIEWS
-- =============================================

-- View for recent audit activity
CREATE OR REPLACE VIEW public.recent_audit_activity AS
SELECT 
    al.id,
    al.table_name,
    al.record_id,
    al.operation,
    al.user_email,
    al.timestamp,
    al.changed_fields,
    CASE 
        WHEN al.table_name = 'device_models' THEN dm.name
        WHEN al.table_name = 'brands' THEN b.name
        ELSE 'Unknown'
    END as record_name
FROM public.audit_logs al
LEFT JOIN public.device_models dm ON al.table_name = 'device_models' AND al.record_id = dm.id
LEFT JOIN public.brands b ON al.table_name = 'brands' AND al.record_id = b.id
ORDER BY al.timestamp DESC
LIMIT 100;

-- View for pending review items
CREATE OR REPLACE VIEW public.pending_review_items AS
SELECT 
    rq.id,
    rq.table_name,
    rq.record_id,
    rq.review_type,
    rq.priority,
    rq.status,
    rq.assigned_to,
    rq.created_at,
    rq.deadline,
    CASE 
        WHEN rq.table_name = 'device_models' THEN dm.name
        WHEN rq.table_name = 'brands' THEN b.name
        ELSE 'Unknown'
    END as record_name,
    CASE 
        WHEN rq.table_name = 'device_models' THEN dm.quality_score
        ELSE NULL
    END as quality_score
FROM public.review_queue rq
LEFT JOIN public.device_models dm ON rq.table_name = 'device_models' AND rq.record_id = dm.id
LEFT JOIN public.brands b ON rq.table_name = 'brands' AND rq.record_id = b.id
WHERE rq.status IN ('pending', 'in_review')
ORDER BY 
    CASE rq.priority 
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'normal' THEN 3
        WHEN 'low' THEN 4
    END,
    rq.created_at ASC;

-- Add comments for documentation
COMMENT ON TABLE public.audit_logs IS 'Comprehensive audit trail for all data changes';
COMMENT ON TABLE public.approval_workflows IS 'Configurable approval workflows for different operations';
COMMENT ON TABLE public.pending_approvals IS 'Queue of changes awaiting approval';
COMMENT ON TABLE public.data_lineage IS 'Tracks data sources and transformations for each record';
COMMENT ON TABLE public.review_queue IS 'Manual review queue for quality control';

SELECT 'Audit logging system created successfully!' as message;
