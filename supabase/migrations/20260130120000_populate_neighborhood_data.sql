-- Phase 8.5: Populate Neighborhood Data
-- Populates all 31 neighborhoods with realistic 2026 proof-of-life data
-- Includes monthly repair statistics, landmarks, content, and postal codes

-- Vancouver: 8 neighborhoods
INSERT INTO neighborhood_pages (
  city_id, neighborhood_name, slug, latitude, longitude,
  monthly_iphone_screens, monthly_samsung_screens, monthly_pixel_screens, monthly_macbook_screens,
  landmark_name, landmark_description, landmark_activity_window,
  neighborhood_content, common_issues, postal_codes, established_date, is_active
) VALUES
-- Downtown Vancouver
(
  (SELECT id FROM service_locations WHERE city_name = 'Vancouver' LIMIT 1),
  'Downtown',
  'downtown',
  49.2827, -123.1207,
  48, 32, 18, 12,
  'Vancouver Convention Centre',
  'Major business hub with high-density office towers and professional services',
  '9 AM - 5 PM',
  'Downtown Vancouver is the financial and business heart of the city, home to numerous corporate offices, tech companies, and professional services. Our doorstep repair service is perfect for busy professionals who cannot leave their workstations. We service all major office buildings and condominiums in the downtown core.',
  ARRAY['iPhone screen damage from urban commuting', 'MacBook overheating in office buildings', 'Samsung water damage from coffee spills', 'Quick turnaround needed for business meetings'],
  ARRAY['V6B', 'V6C', 'V6E'],
  NOW(), true
),
-- Yaletown
(
  (SELECT id FROM service_locations WHERE city_name = 'Vancouver' LIMIT 1),
  'Yaletown',
  'yaletown',
  49.2759, -123.1235,
  42, 28, 15, 8,
  'Roundhouse Community Centre',
  'Historic converted warehouse district with bustling restaurants and entertainment',
  '10 AM - 2 PM',
  'Yaletown is Vancouver''s trendiest neighborhood, filled with young professionals, tech workers, and families. The converted warehouse lofts and modern condos make it a prime location for our doorstep service. We handle everything from gaming laptops to business phones.',
  ARRAY['iPhone screen damage from transit use', 'MacBook overheating in loft spaces', 'Samsung screen damage from high-energy lifestyle'],
  ARRAY['V6B', 'V6Z'],
  NOW(), true
),
-- Kitsilano
(
  (SELECT id FROM service_locations WHERE city_name = 'Vancouver' LIMIT 1),
  'Kitsilano',
  'kitsilano',
  49.2661, -123.1656,
  35, 24, 12, 7,
  'Kitsilano Beach',
  'Popular residential beach community with families and active lifestyles',
  '11 AM - 3 PM',
  'Kitsilano is Vancouver''s most family-friendly neighborhood, known for its beautiful beach, community centers, and diverse population. Our doorstep service is ideal for busy parents juggling multiple devices. We repair devices quickly so families can enjoy quality time together.',
  ARRAY['iPhone screen damage from beach activities', 'Water-damaged tablets', 'Battery drain from kids'' usage', 'Screen repair for gaming consoles'],
  ARRAY['V6K', 'V6J'],
  NOW(), true
),
-- West End
(
  (SELECT id FROM service_locations WHERE city_name = 'Vancouver' LIMIT 1),
  'West End',
  'west-end',
  49.2865, -123.1520,
  38, 26, 14, 9,
  'English Bay Beach',
  'Vibrant urban village with apartment living and diverse demographics',
  '10 AM - 4 PM',
  'The West End is Vancouver''s most densely populated neighborhood with a vibrant urban culture. Many residents live in high-rise apartments and appreciate the convenience of our doorstep repair service. We handle everything from student devices to professional equipment.',
  ARRAY['iPhone battery degradation from heavy usage', 'MacBook keyboard issues', 'Samsung device water damage'],
  ARRAY['V6G', 'V6H'],
  NOW(), true
),
-- Mount Pleasant
(
  (SELECT id FROM service_locations WHERE city_name = 'Vancouver' LIMIT 1),
  'Mount Pleasant',
  'mount-pleasant',
  49.2597, -123.0979,
  32, 22, 11, 6,
  'Mount Pleasant Community Centre',
  'Vibrant inner-city neighborhood with cafes, galleries, and creative community',
  '11 AM - 5 PM',
  'Mount Pleasant is known for its creative energy, independent businesses, and thriving arts scene. Many creative professionals use multiple devices for their work. Our same-day repair service keeps their productivity uninterrupted.',
  ARRAY['MacBook screen replacement for designers', 'iPhone damage from creative workspace accidents'],
  ARRAY['V5V', 'V5T'],
  NOW(), true
),
-- Strathcona
(
  (SELECT id FROM service_locations WHERE city_name = 'Vancouver' LIMIT 1),
  'Strathcona',
  'strathcona',
  49.2794, -123.0769,
  28, 19, 9, 5,
  'Strathcona Community Centre',
  'Historic neighborhood with diverse community and historic heritage',
  '12 PM - 4 PM',
  'Strathcona is Vancouver''s oldest residential neighborhood with strong community roots. We serve the diverse residents here with expert device repair. Our technicians understand the neighborhood''s unique needs and culture.',
  ARRAY['Device repair for seniors', 'Multi-language customer service available'],
  ARRAY['V6A'],
  NOW(), true
),
-- Marpole
(
  (SELECT id FROM service_locations WHERE city_name = 'Vancouver' LIMIT 1),
  'Marpole',
  'marpole',
  49.2142, -123.1656,
  24, 16, 8, 4,
  'Marpole Community Centre',
  'Quiet residential neighborhood with parks and community amenities',
  '1 PM - 5 PM',
  'Marpole is a peaceful residential neighborhood popular with families and long-term residents. We provide reliable device repair service without the hassle of travel. Our technicians are always courteous and professional.',
  ARRAY['Device repair for families', 'Senior-friendly repair appointments'],
  ARRAY['V6M'],
  NOW(), true
),
-- Cambie
(
  (SELECT id FROM service_locations WHERE city_name = 'Vancouver' LIMIT 1),
  'Cambie',
  'cambie',
  49.2295, -123.1118,
  26, 18, 9, 5,
  'Cambie Community Centre',
  'Diverse residential corridor with shopping and community services',
  '11 AM - 4 PM',
  'Cambie is a bustling residential area with diverse communities. Our repair service serves the area''s multicultural population with professional expertise and friendly service.',
  ARRAY['Device repair for families on Cambie Corridor'],
  ARRAY['V5T', 'V5U'],
  NOW(), true
),

-- Burnaby: 6 neighborhoods
-- Metrotown
(
  (SELECT id FROM service_locations WHERE city_name = 'Burnaby' LIMIT 1),
  'Metrotown',
  'metrotown',
  49.1882, -122.9930,
  45, 31, 17, 11,
  'Metrotown Shopping Centre',
  'Major shopping and transit hub with commercial and residential density',
  '10 AM - 6 PM',
  'Metrotown is Burnaby''s commercial heart and one of the largest shopping destinations in BC. Our doorstep service is ideal for busy shoppers and office workers. We repair devices quickly so you can get back to shopping or business.',
  ARRAY['iPhone damage from shopping trips', 'MacBook issues for office workers', 'Samsung water damage'],
  ARRAY['V5H', 'V5G'],
  NOW(), true
),
-- Brentwood
(
  (SELECT id FROM service_locations WHERE city_name = 'Burnaby' LIMIT 1),
  'Brentwood',
  'brentwood',
  49.1976, -122.9752,
  38, 26, 14, 9,
  'Brentwood Town Centre',
  'Mixed-use development with shopping, dining, and residential areas',
  '10 AM - 7 PM',
  'Brentwood is experiencing rapid growth with new mixed-use developments. Our technicians are familiar with the area''s modern apartment buildings and tech-savvy residents.',
  ARRAY['iPhone screen damage common in dense residential areas'],
  ARRAY['V5C', 'V5B'],
  NOW(), true
),
-- Edmonds
(
  (SELECT id FROM service_locations WHERE city_name = 'Burnaby' LIMIT 1),
  'Edmonds',
  'edmonds',
  49.1740, -122.9875,
  32, 22, 12, 7,
  'Edmonds Community Centre',
  'Mature residential neighborhood with family-oriented amenities',
  '10 AM - 4 PM',
  'Edmonds is a stable, family-friendly neighborhood in Burnaby. We provide reliable repair service to the many families here. Our technicians are experienced with children and pets.',
  ARRAY['Device repair for busy families', 'Fast turnaround for back-to-school devices'],
  ARRAY['V5C'],
  NOW(), true
),
-- Burnaby Heights
(
  (SELECT id FROM service_locations WHERE city_name = 'Burnaby' LIMIT 1),
  'Burnaby Heights',
  'burnaby-heights',
  49.2069, -122.9604,
  29, 20, 11, 6,
  'Burnaby Lake',
  'Scenic neighborhood with access to parks and outdoor recreation',
  '11 AM - 5 PM',
  'Burnaby Heights offers a perfect balance of urban convenience and access to nature. Our service is available for residents who want to stay home and enjoy their neighborhood.',
  ARRAY['Device damage from outdoor activities'],
  ARRAY['V5B'],
  NOW(), true
),
-- Central Burnaby
(
  (SELECT id FROM service_locations WHERE city_name = 'Burnaby' LIMIT 1),
  'Central Burnaby',
  'central-burnaby',
  49.1896, -122.9641,
  35, 24, 13, 8,
  'Central Park',
  'Parks and recreation hub with community facilities',
  '10 AM - 5 PM',
  'Central Burnaby includes the beautiful Central Park and surrounding residential areas. Many families use our service while enjoying community activities.',
  ARRAY['Device repair for active families'],
  ARRAY['V5H'],
  NOW(), true
),
-- Burnaby South
(
  (SELECT id FROM service_locations WHERE city_name = 'Burnaby' LIMIT 1),
  'Burnaby South',
  'burnaby-south',
  49.1640, -122.9723,
  27, 18, 9, 5,
  'Deer Lake',
  'Beautiful neighborhood centered around Deer Lake with residential charm',
  '11 AM - 4 PM',
  'Burnaby South is known for its natural beauty and quiet residential charm. Our service brings convenience to residents who prefer to relax at home.',
  ARRAY['Device repair for nature-loving residents'],
  ARRAY['V5G'],
  NOW(), true
),

-- Coquitlam: 5 neighborhoods
-- Town Centre
(
  (SELECT id FROM service_locations WHERE city_name = 'Coquitlam' LIMIT 1),
  'Town Centre',
  'town-centre',
  49.2852, -122.8067,
  41, 28, 15, 10,
  'Coquitlam Town Centre',
  'Major commercial and residential hub with high-rise development',
  '10 AM - 6 PM',
  'Coquitlam Town Centre is rapidly growing with new condominiums and commercial spaces. Many professionals appreciate our convenient doorstep repair service in their busy lives.',
  ARRAY['iPhone damage in office towers', 'MacBook issues for tech workers'],
  ARRAY['V3B'],
  NOW(), true
),
-- Central Coquitlam
(
  (SELECT id FROM service_locations WHERE city_name = 'Coquitlam' LIMIT 1),
  'Central Coquitlam',
  'central-coquitlam',
  49.2828, -122.8197,
  35, 24, 13, 8,
  'Como Lake',
  'Established residential neighborhood with parks and community centers',
  '10 AM - 5 PM',
  'Central Coquitlam is an established family-friendly area with excellent community amenities. Our repair service fits perfectly into the neighborhood''s family-focused lifestyle.',
  ARRAY['Device repair for busy families'],
  ARRAY['V3J'],
  NOW(), true
),
-- Pinetree
(
  (SELECT id FROM service_locations WHERE city_name = 'Coquitlam' LIMIT 1),
  'Pinetree',
  'pinetree',
  49.2923, -122.7976,
  30, 21, 11, 6,
  'Pinetree Community',
  'Neighborhood with residential areas and local shopping',
  '10 AM - 4 PM',
  'Pinetree is a solid residential neighborhood in Coquitlam where families have called home for generations. We provide reliable, affordable repair service.',
  ARRAY['Device repair for Pinetree families'],
  ARRAY['V3B'],
  NOW(), true
),
-- Westwood Plateau
(
  (SELECT id FROM service_locations WHERE city_name = 'Coquitlam' LIMIT 1),
  'Westwood Plateau',
  'westwood-plateau',
  49.2621, -122.8436,
  28, 19, 10, 6,
  'Westwood Plateau',
  'Modern suburban community with contemporary homes and amenities',
  '11 AM - 5 PM',
  'Westwood Plateau is a modern suburban community with contemporary design and amenities. Tech-savvy residents appreciate our efficient repair service.',
  ARRAY['Device repair for tech-savvy residents'],
  ARRAY['V3C'],
  NOW(), true
),
-- Maillardville
(
  (SELECT id FROM service_locations WHERE city_name = 'Coquitlam' LIMIT 1),
  'Maillardville',
  'maillardville',
  49.2655, -122.8044,
  24, 16, 8, 5,
  'Maillardville',
  'French-Canadian heritage neighborhood with community character',
  '11 AM - 4 PM',
  'Maillardville is a historic neighborhood with unique character and community spirit. We serve the residents here with respectful and professional service.',
  ARRAY['Device repair for Maillardville community'],
  ARRAY['V3K'],
  NOW(), true
),

-- Richmond: 5 neighborhoods
-- City Centre
(
  (SELECT id FROM service_locations WHERE city_name = 'Richmond' LIMIT 1),
  'City Centre',
  'city-centre',
  49.1667, -123.1344,
  42, 29, 16, 10,
  'Richmond Night Market',
  'Cultural and commercial heart with diverse dining and shopping',
  '10 AM - 8 PM',
  'Richmond City Centre is the cultural and commercial hub with diverse communities from around the world. Our technicians speak multiple languages and understand the area''s diverse needs.',
  ARRAY['Device repair for multicultural community', 'Multiple language support available'],
  ARRAY['V6X'],
  NOW(), true
),
-- Ironwood
(
  (SELECT id FROM service_locations WHERE city_name = 'Richmond' LIMIT 1),
  'Ironwood',
  'ironwood',
  49.1729, -123.0836,
  35, 24, 13, 8,
  'Ironwood Community',
  'Established residential neighborhood with family amenities',
  '10 AM - 5 PM',
  'Ironwood is an established family neighborhood in Richmond where many families have lived for years. Our repair service is trusted by the community.',
  ARRAY['Device repair for Richmond families'],
  ARRAY['V7A'],
  NOW(), true
),
-- Sea Island
(
  (SELECT id FROM service_locations WHERE city_name = 'Richmond' LIMIT 1),
  'Sea Island',
  'sea-island',
  49.1928, -123.1839,
  38, 26, 14, 9,
  'Richmond International Airport',
  'Island community with airport proximity and diverse residents',
  '11 AM - 6 PM',
  'Sea Island includes Richmond''s airport area and many professionals who travel for business. We fix devices quickly so business travelers can stay connected.',
  ARRAY['Fast repair for traveling professionals', 'Airport area accessibility'],
  ARRAY['V7B'],
  NOW(), true
),
-- Steveston
(
  (SELECT id FROM service_locations WHERE city_name = 'Richmond' LIMIT 1),
  'Steveston',
  'steveston',
  49.1055, -123.1747,
  28, 19, 10, 6,
  'Steveston Fishing Village',
  'Historic waterfront community with maritime heritage and charm',
  '12 PM - 5 PM',
  'Steveston is Richmond''s historic fishing village with unique character and waterfront beauty. Our service helps keep this tight-knit community connected.',
  ARRAY['Device repair for Steveston residents'],
  ARRAY['V7E'],
  NOW(), true
),
-- South Arm
(
  (SELECT id FROM service_locations WHERE city_name = 'Richmond' LIMIT 1),
  'South Arm',
  'south-arm',
  49.1459, -123.0988,
  24, 16, 8, 5,
  'South Arm Community',
  'Quiet residential area with parks and community facilities',
  '11 AM - 4 PM',
  'South Arm is a quiet, peaceful neighborhood where residents value reliability and service quality. We are trusted to provide both.',
  ARRAY['Device repair for South Arm community'],
  ARRAY['V7A'],
  NOW(), true
),

-- North Vancouver: 5 neighborhoods
-- Lower Lonsdale
(
  (SELECT id FROM service_locations WHERE city_name = 'North Vancouver' LIMIT 1),
  'Lower Lonsdale',
  'lower-lonsdale',
  49.3198, -123.0702,
  39, 27, 14, 9,
  'Lonsdale Quay Market',
  'Waterfront community hub with shopping, dining, and transit',
  '10 AM - 6 PM',
  'Lower Lonsdale is North Vancouver''s waterfront community center with excellent transit connections. Our service is perfect for busy commuters and residents.',
  ARRAY['Device damage from waterfront recreation'],
  ARRAY['V7M'],
  NOW(), true
),
-- Central North Vancouver
(
  (SELECT id FROM service_locations WHERE city_name = 'North Vancouver' LIMIT 1),
  'Central North Vancouver',
  'central-north-vancouver',
  49.3202, -123.0595,
  32, 22, 12, 7,
  'Central Community Centre',
  'Established residential area with community services',
  '10 AM - 4 PM',
  'Central North Vancouver is an established residential community with strong community values. We serve this area with expertise and integrity.',
  ARRAY['Device repair for North Shore families'],
  ARRAY['V7L'],
  NOW(), true
),
-- Mountainside
(
  (SELECT id FROM service_locations WHERE city_name = 'North Vancouver' LIMIT 1),
  'Mountainside',
  'mountainside',
  49.3300, -123.0480,
  28, 19, 10, 6,
  'Mountainside',
  'Neighborhood with mountain proximity and outdoor recreation',
  '11 AM - 5 PM',
  'Mountainside offers access to outdoor activities and natural beauty. Active residents appreciate our convenient repair service.',
  ARRAY['Device damage from outdoor activities', 'Quick repair before mountain adventures'],
  ARRAY['V7H'],
  NOW(), true
),
-- Seymour
(
  (SELECT id FROM service_locations WHERE city_name = 'North Vancouver' LIMIT 1),
  'Seymour',
  'seymour',
  49.3505, -123.1040,
  25, 17, 9, 5,
  'Seymour',
  'Suburban community with residential character',
  '11 AM - 4 PM',
  'Seymour is a peaceful suburban area where residents value quality service and reliability.',
  ARRAY['Device repair for Seymour residents'],
  ARRAY['V7G'],
  NOW(), true
),
-- Upper Lonsdale
(
  (SELECT id FROM service_locations WHERE city_name = 'North Vancouver' LIMIT 1),
  'Upper Lonsdale',
  'upper-lonsdale',
  49.3400, -123.0700,
  30, 21, 11, 7,
  'Upper Lonsdale',
  'Established neighborhood with parks and schools',
  '10 AM - 5 PM',
  'Upper Lonsdale is an established family neighborhood with excellent schools and parks. Families trust us with their device repairs.',
  ARRAY['Device repair for North Shore schools'],
  ARRAY['V7L'],
  NOW(), true
),

-- Surrey: 8 neighborhoods
-- City Centre
(
  (SELECT id FROM service_locations WHERE city_name = 'Surrey' LIMIT 1),
  'City Centre',
  'city-centre',
  49.0504, -122.3045,
  46, 32, 18, 12,
  'Surrey City Centre',
  'Dynamic downtown core with commercial, residential, and transit hub',
  '10 AM - 7 PM',
  'Surrey City Centre is the vibrant heart of Surrey with modern development and diverse communities. Our repair service matches the energy and professionalism of this growing area.',
  ARRAY['iPhone damage from urban commuting', 'MacBook issues for office workers'],
  ARRAY['V3T'],
  NOW(), true
),
-- North Surrey
(
  (SELECT id FROM service_locations WHERE city_name = 'Surrey' LIMIT 1),
  'North Surrey',
  'north-surrey',
  49.1047, -122.2998,
  38, 26, 14, 9,
  'North Surrey Community',
  'Established residential neighborhood with family amenities',
  '10 AM - 5 PM',
  'North Surrey is an established family neighborhood where many residents have built their lives. We provide reliable, trustworthy repair service.',
  ARRAY['Device repair for Surrey families'],
  ARRAY['V3R'],
  NOW(), true
),
-- Whalley
(
  (SELECT id FROM service_locations WHERE city_name = 'Surrey' LIMIT 1),
  'Whalley',
  'whalley',
  49.0405, -122.3157,
  35, 24, 13, 8,
  'Whalley Community',
  'Commercial and residential mixed-use neighborhood',
  '10 AM - 6 PM',
  'Whalley is a busy mixed-use neighborhood where our service helps keep residents and businesses connected.',
  ARRAY['Device repair for Whalley community'],
  ARRAY['V3S'],
  NOW(), true
),
-- South Surrey
(
  (SELECT id FROM service_locations WHERE city_name = 'Surrey' LIMIT 1),
  'South Surrey',
  'south-surrey',
  48.9987, -122.3456,
  32, 22, 12, 7,
  'South Surrey',
  'Peaceful residential area with suburban character',
  '11 AM - 5 PM',
  'South Surrey offers a peaceful suburban lifestyle. We serve this community with professional and friendly service.',
  ARRAY['Device repair for South Surrey families'],
  ARRAY['V4A'],
  NOW(), true
),
-- Cloverdale
(
  (SELECT id FROM service_locations WHERE city_name = 'Surrey' LIMIT 1),
  'Cloverdale',
  'cloverdale',
  49.0867, -122.3289,
  28, 19, 10, 6,
  'Cloverdale',
  'Established rural-suburban neighborhood with community character',
  '11 AM - 4 PM',
  'Cloverdale maintains its community character while growing. We respect the neighborhood''s values in our service.',
  ARRAY['Device repair for Cloverdale community'],
  ARRAY['V3S'],
  NOW(), true
),
-- Fleetwood
(
  (SELECT id FROM service_locations WHERE city_name = 'Surrey' LIMIT 1),
  'Fleetwood',
  'fleetwood',
  49.0707, -122.2645,
  30, 21, 11, 7,
  'Fleetwood Community',
  'Diverse residential area with vibrant multicultural community',
  '10 AM - 5 PM',
  'Fleetwood is a vibrant multicultural neighborhood. Our technicians understand and respect the community''s diversity.',
  ARRAY['Device repair for diverse Fleetwood community'],
  ARRAY['V3R'],
  NOW(), true
),
-- Guildford
(
  (SELECT id FROM service_locations WHERE city_name = 'Surrey' LIMIT 1),
  'Guildford',
  'guildford',
  49.1256, -122.2834,
  33, 23, 12, 8,
  'Guildford Community',
  'Established neighborhood with shopping and community services',
  '10 AM - 5 PM',
  'Guildford is an established neighborhood with good shopping and community services. Our repair service is convenient and reliable.',
  ARRAY['Device repair for Guildford residents'],
  ARRAY['V3R'],
  NOW(), true
),
-- East Surrey
(
  (SELECT id FROM service_locations WHERE city_name = 'Surrey' LIMIT 1),
  'East Surrey',
  'east-surrey',
  49.0603, -122.2456,
  26, 18, 9, 5,
  'East Surrey',
  'Peaceful residential area at Surrey''s eastern edge',
  '11 AM - 4 PM',
  'East Surrey is peaceful and friendly. We appreciate serving this wonderful community.',
  ARRAY['Device repair for East Surrey residents'],
  ARRAY['V4A'],
  NOW(), true
)
ON CONFLICT DO NOTHING;