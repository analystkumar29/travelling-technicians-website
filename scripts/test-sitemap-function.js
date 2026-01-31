/**
 * Test the getPopularCityServiceModels() function directly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper functions from slug-utils
function toUrlSlug(input) {
  if (!input || typeof input !== 'string') return '';
  return input.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function serviceNameToUrlSlug(serviceName) {
  const SERVICE_SLUG_MAPPING = {
    'screen-replacement-mobile': 'screen-repair',
    'screen-replacement-laptop': 'laptop-screen-repair',
    'battery-replacement-mobile': 'battery-replacement',
    'battery-replacement-laptop': 'battery-replacement',
    'charging-port-repair': 'charging-port-repair',
    'water-damage-repair': 'water-damage-repair',
    'camera-repair': 'camera-repair',
    'software-repair': 'software-repair',
    'speaker-microphone-repair': 'speaker-microphone-repair',
    'keyboard-repair': 'keyboard-repair',
    'trackpad-repair': 'trackpad-repair',
    'cooling-system-repair': 'cooling-system-repair',
    'power-jack-repair': 'power-jack-repair',
    'data-recovery': 'data-recovery',
    'storage-upgrade': 'storage-upgrade',
    'factory-reset-setup': 'factory-reset-setup',
    'touch-screen-calibration': 'touch-screen-calibration'
  };
  
  const urlSlug = toUrlSlug(serviceName);
  
  const reverseMapping = Object.entries(SERVICE_SLUG_MAPPING).reduce((acc, [dbSlug, urlSlug]) => {
    acc[urlSlug] = dbSlug;
    return acc;
  }, {});
  
  if (reverseMapping[urlSlug]) {
    return urlSlug;
  }
  
  const mappedSlug = SERVICE_SLUG_MAPPING[serviceName];
  if (mappedSlug) {
    return mappedSlug;
  }
  
  return urlSlug;
}

function isValidUrlSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug);
}

async function testGetPopularCityServiceModels() {
  console.log('🧪 Testing getPopularCityServiceModels() function...\n');
  
  const startTime = Date.now();
  const MAX_EXECUTION_TIME = 8000;
  const MAX_COMBINATIONS = 2000;
  const MAX_COMBINATIONS_PER_SERVICE = 100;
  
  try {
    // Get active service locations first (cities)
    console.log('1. Fetching active service locations...');
    const { data: locations, error: locationsError } = await supabase
      .from('service_locations')
      .select('city, updated_at')
      .eq('is_active', true)
      .order('city')
      .limit(20);

    if (locationsError || !locations || locations.length === 0) {
      console.error('Error fetching service locations:', locationsError);
      return [];
    }

    console.log(`✅ Found ${locations.length} active service locations`);
    
    // Query dynamic pricing with joins
    console.log('\n2. Querying dynamic_pricing with joins...');
    const { data: combinations, error } = await supabase
      .from('dynamic_pricing')
      .select(`
        id,
        service_id,
        model_id,
        created_at,
        services!inner (
          name,
          slug,
          is_active,
          updated_at
        ),
        device_models!inner (
          name,
          slug,
          is_active,
          updated_at,
          popularity_score
        )
      `)
      .eq('is_active', true)
      .eq('services.is_active', true)
      .eq('device_models.is_active', true)
      .order('popularity_score', { foreignTable: 'device_models', ascending: false })
      .limit(500);

    if (error || !combinations) {
      console.error('Error fetching combinations:', error);
      return [];
    }

    console.log(`✅ Found ${combinations.length} dynamic pricing combinations`);
    
    // Group combinations by service
    console.log('\n3. Grouping combinations by service...');
    const combinationsByService = new Map();
    
    for (const combo of combinations) {
      const serviceData = Array.isArray(combo.services) ? combo.services[0] : combo.services;
      const modelData = Array.isArray(combo.device_models) ? combo.device_models[0] : combo.device_models;
      
      if (!serviceData?.name || !modelData?.name) {
        console.log(`   Skipping combo ${combo.id}: missing service or model data`);
        continue;
      }
      
      const serviceName = serviceData.name;
      if (!combinationsByService.has(serviceName)) {
        combinationsByService.set(serviceName, []);
      }
      combinationsByService.get(serviceName).push(combo);
    }
    
    console.log(`✅ Grouped into ${combinationsByService.size} service groups`);
    
    // Generate city-service-model combinations
    console.log('\n4. Generating city-service-model combinations...');
    const result = [];
    let totalCombinationCount = 0;
    
    for (const [serviceName, serviceCombinations] of combinationsByService) {
      if (totalCombinationCount >= MAX_COMBINATIONS) break;
      
      const topModels = serviceCombinations
        .slice(0, MAX_COMBINATIONS_PER_SERVICE)
        .map(combo => {
          const serviceData = Array.isArray(combo.services) ? combo.services[0] : combo.services;
          const modelData = Array.isArray(combo.device_models) ? combo.device_models[0] : combo.device_models;
          
          return {
            serviceName: serviceData?.name || '',
            serviceSlug: serviceData?.slug || '',
            modelName: modelData?.name || '',
            modelSlug: modelData?.slug || '',
            updated_at: combo.created_at || 
                       serviceData?.updated_at || 
                       modelData?.updated_at || 
                       new Date().toISOString(),
            popularity: modelData?.popularity_score || 0
          };
        })
        .filter(item => item.serviceName && item.modelName);
      
      console.log(`   • ${serviceName}: ${topModels.length} models`);
      
      // Generate URLs for each city
      for (const location of locations) {
        if (totalCombinationCount >= MAX_COMBINATIONS) break;
        
        const citySlug = toUrlSlug(location.city);
        if (!isValidUrlSlug(citySlug)) {
          console.log(`     Skipping city "${location.city}" (invalid slug: ${citySlug})`);
          continue;
        }
        
        for (const model of topModels) {
          if (totalCombinationCount >= MAX_COMBINATIONS) break;
          
          const serviceSlug = serviceNameToUrlSlug(model.serviceName);
          const modelSlug = toUrlSlug(model.modelName);
          
          if (!isValidUrlSlug(serviceSlug) || !isValidUrlSlug(modelSlug)) {
            console.log(`     Skipping combination: service="${serviceSlug}", model="${modelSlug}"`);
            continue;
          }
          
          result.push({
            city: citySlug,
            service: serviceSlug,
            model: modelSlug,
            updated_at: model.updated_at
          });
          
          totalCombinationCount++;
        }
      }
    }
    
    console.log(`\n🎯 Generated ${result.length} city-service-model combinations`);
    console.log(`⏱️  Execution time: ${Date.now() - startTime}ms`);
    
    // Show sample results
    if (result.length > 0) {
      console.log('\n📄 Sample combinations (first 10):');
      result.slice(0, 10).forEach((item, i) => {
        console.log(`   ${i + 1}. /repair/${item.city}/${item.service}/${item.model}`);
      });
    }
    
    return result;
    
  } catch (error) {
    console.error('Error in test:', error);
    return [];
  }
}

// Run the test
testGetPopularCityServiceModels().then(result => {
  console.log(`\n📋 Final count: ${result.length} combinations`);
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});