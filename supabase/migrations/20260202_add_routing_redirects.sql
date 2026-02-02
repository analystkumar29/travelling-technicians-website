-- ============================================================
-- ADD 301 REDIRECTS FOR LEGACY URL FORMATS
-- File: 20260202_add_routing_redirects.sql
-- Description: Adds 301 redirects from legacy service slug format to universal format
-- ============================================================

-- Insert redirects from old service slug format to new format
-- Old format: /repair/[city]/[old-service-slug]/[model]
-- New format: /repair/[city]/[new-service-slug]/[model]

INSERT INTO redirects (source_path, target_path, status_code, is_active, created_by, notes) VALUES
-- Screen Replacement Mobile redirects
('repair/vancouver/screen-repair/', 'repair/vancouver/screen-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - screen repair mobile'),
('repair/burnaby/screen-repair/', 'repair/burnaby/screen-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - screen repair mobile'),
('repair/richmond/screen-repair/', 'repair/richmond/screen-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - screen repair mobile'),
('repair/surrey/screen-repair/', 'repair/surrey/screen-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - screen repair mobile'),
('repair/coquitlam/screen-repair/', 'repair/coquitlam/screen-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - screen repair mobile'),
('repair/north-vancouver/screen-repair/', 'repair/north-vancouver/screen-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - screen repair mobile'),
('repair/west-vancouver/screen-repair/', 'repair/west-vancouver/screen-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - screen repair mobile'),
('repair/new-westminster/screen-repair/', 'repair/new-westminster/screen-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - screen repair mobile'),
('repair/delta/screen-repair/', 'repair/delta/screen-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - screen repair mobile'),
('repair/langley/screen-repair/', 'repair/langley/screen-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - screen repair mobile'),

-- Screen Replacement Laptop redirects
('repair/vancouver/laptop-screen-repair/', 'repair/vancouver/screen-replacement-laptop/', 301, true, 'system', 'Legacy to universal routing - screen repair laptop'),
('repair/burnaby/laptop-screen-repair/', 'repair/burnaby/screen-replacement-laptop/', 301, true, 'system', 'Legacy to universal routing - screen repair laptop'),
('repair/richmond/laptop-screen-repair/', 'repair/richmond/screen-replacement-laptop/', 301, true, 'system', 'Legacy to universal routing - screen repair laptop'),
('repair/surrey/laptop-screen-repair/', 'repair/surrey/screen-replacement-laptop/', 301, true, 'system', 'Legacy to universal routing - screen repair laptop'),
('repair/coquitlam/laptop-screen-repair/', 'repair/coquitlam/screen-replacement-laptop/', 301, true, 'system', 'Legacy to universal routing - screen repair laptop'),
('repair/north-vancouver/laptop-screen-repair/', 'repair/north-vancouver/screen-replacement-laptop/', 301, true, 'system', 'Legacy to universal routing - screen repair laptop'),
('repair/west-vancouver/laptop-screen-repair/', 'repair/west-vancouver/screen-replacement-laptop/', 301, true, 'system', 'Legacy to universal routing - screen repair laptop'),
('repair/new-westminster/laptop-screen-repair/', 'repair/new-westminster/screen-replacement-laptop/', 301, true, 'system', 'Legacy to universal routing - screen repair laptop'),
('repair/delta/laptop-screen-repair/', 'repair/delta/screen-replacement-laptop/', 301, true, 'system', 'Legacy to universal routing - screen repair laptop'),
('repair/langley/laptop-screen-repair/', 'repair/langley/screen-replacement-laptop/', 301, true, 'system', 'Legacy to universal routing - screen repair laptop'),

-- Battery Replacement (both mobile and laptop map to same slug)
('repair/vancouver/battery-replacement/', 'repair/vancouver/battery-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - battery replacement (mobile primary)'),
('repair/burnaby/battery-replacement/', 'repair/burnaby/battery-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - battery replacement (mobile primary)'),
('repair/richmond/battery-replacement/', 'repair/richmond/battery-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - battery replacement (mobile primary)'),
('repair/surrey/battery-replacement/', 'repair/surrey/battery-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - battery replacement (mobile primary)'),
('repair/coquitlam/battery-replacement/', 'repair/coquitlam/battery-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - battery replacement (mobile primary)'),
('repair/north-vancouver/battery-replacement/', 'repair/north-vancouver/battery-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - battery replacement (mobile primary)'),
('repair/west-vancouver/battery-replacement/', 'repair/west-vancouver/battery-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - battery replacement (mobile primary)'),
('repair/new-westminster/battery-replacement/', 'repair/new-westminster/battery-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - battery replacement (mobile primary)'),
('repair/delta/battery-replacement/', 'repair/delta/battery-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - battery replacement (mobile primary)'),
('repair/langley/battery-replacement/', 'repair/langley/battery-replacement-mobile/', 301, true, 'system', 'Legacy to universal routing - battery replacement (mobile primary)');

-- Log the redirect setup
SELECT 
  COUNT(*) as redirects_added,
  MAX(updated_at) as created_at
FROM redirects 
WHERE created_by = 'system' 
AND updated_at > NOW() - INTERVAL '1 minute';
