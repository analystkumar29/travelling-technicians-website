-- Add icon and flag columns to services table
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS icon TEXT,
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_limited BOOLEAN DEFAULT FALSE;

-- Update existing rows to set default values (optional)
UPDATE services SET is_popular = FALSE, is_limited = FALSE WHERE is_popular IS NULL OR is_limited IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN services.icon IS 'Icon identifier matching React icon component (e.g., "laptop", "mobile", "tablet")';
COMMENT ON COLUMN services.is_popular IS 'Flag indicating popular service (shown with badge)';
-- Add comment for documentation
COMMENT ON COLUMN services.icon IS 'React Icon component name (e.g., FaLaptop)';
COMMENT ON COLUMN services.is_popular IS 'Indicates if service is highlighted as popular';
