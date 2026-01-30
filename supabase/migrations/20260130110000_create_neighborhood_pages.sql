-- Phase 8: Create neighborhood_pages table for Proof-of-Life subpages

CREATE TABLE IF NOT EXISTS neighborhood_pages (
  id BIGSERIAL PRIMARY KEY,
  city_id BIGINT NOT NULL REFERENCES service_locations(id) ON DELETE CASCADE,
  neighborhood_name TEXT NOT NULL,
  slug TEXT NOT NULL,
  
  -- Geo-location
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Proof of Life: Monthly Repair Stats
  monthly_iphone_screens INT DEFAULT 0,
  monthly_samsung_screens INT DEFAULT 0,
  monthly_pixel_screens INT DEFAULT 0,
  monthly_macbook_screens INT DEFAULT 0,
  
  -- Local Landmark Presence
  landmark_name TEXT,
  landmark_description TEXT,
  landmark_activity_window TEXT, -- e.g., "10 AM - 2 PM"
  
  -- Content
  neighborhood_content TEXT,
  common_issues TEXT[], -- array of common issues specific to neighborhood
  postal_codes TEXT[], -- served postal code prefixes
  
  -- Testimonials: JSON structure for hybrid approach
  testimonials JSONB DEFAULT '{"primary": [], "fallback": []}',
  
  -- Metadata
  established_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(city_id, slug),
  CONSTRAINT neighborhood_name_not_empty CHECK (LENGTH(TRIM(neighborhood_name)) > 0)
);

-- Indexes for performance
CREATE INDEX idx_neighborhood_city_id ON neighborhood_pages(city_id);
CREATE INDEX idx_neighborhood_slug ON neighborhood_pages(slug);
CREATE INDEX idx_neighborhood_city_slug ON neighborhood_pages(city_id, slug);

-- RLS Policies
ALTER TABLE neighborhood_pages ENABLE ROW LEVEL SECURITY;

-- Anyone can read published neighborhood pages
CREATE POLICY "anyone_can_read_neighborhood_pages" ON neighborhood_pages
  FOR SELECT USING (TRUE);

-- Only authenticated admin users can insert/update/delete
CREATE POLICY "admin_can_write_neighborhood_pages" ON neighborhood_pages
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE email IN ('admin@travellingtechnicians.ca')
    )
  );

CREATE POLICY "admin_can_update_neighborhood_pages" ON neighborhood_pages
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM users WHERE email IN ('admin@travellingtechnicians.ca')
    )
  );

CREATE POLICY "admin_can_delete_neighborhood_pages" ON neighborhood_pages
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM users WHERE email IN ('admin@travellingtechnicians.ca')
    )
  );

-- Trigger to update updated_at
CREATE TRIGGER update_neighborhood_pages_timestamp
  BEFORE UPDATE ON neighborhood_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();
