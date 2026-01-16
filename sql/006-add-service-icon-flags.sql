-- Add icon and flag columns to services table for dynamic service pages
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS icon VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_limited BOOLEAN DEFAULT false;

-- Update existing rows to have default values
UPDATE services SET 
    icon = COALESCE(icon, ''),
    is_popular = COALESCE(is_popular, false),
    is_limited = COALESCE(is_limited, false);

-- Add comment for documentation
COMMENT ON COLUMN services.icon IS 'React Icon component name (e.g., FaLaptop)';
COMMENT ON COLUMN services.is_popular IS 'Indicates if service is highlighted as popular';
