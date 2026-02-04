/**
 * Test sitemap generation with fixed column names
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

// Helper functions
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

async function testSitemapGeneration() {
  console.log('🧪 Testing sitemap generation with fixed column names...\n');
  
  try {
    // 1. Get active service locations
    console.log('1. Fetching active service locations...');
    const { data: locations, error: locationsError } = await supabase
      .from('service_locations')
      .select('city_name, updated_at')
      .eq('is_active', true)
      .order('city_name')
      .limit(20);

    if (locationsError || !locations || locations.length === 0) {
      console.error('Error fetching service locations:', locationsError);
      return [];
    }

    console.log(`✅ Found ${locations.length} active service locations`);
    console.log('Sample:', locations.slice(0, 3).map(l => l.city_name));
    
    // 2. Get dynamic pricing combinations
    console.log('\n2. Fetching dynamic pricing combinations...');
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
      .limit(100);

    if (error || !combinations) {
      console.error('Error fetching combinations:', error);
      return [];
    }

    console.log(`✅ Found ${combinations.length} dynamic pricing combinations`);
    
    // 3. Group by service
    console.log('\n3. Grouping by service...');
    const serviceMap = new Map();
    
    for (const combo of combinations) {
      const serviceData = Array.isArray(combo.services) ? combo.services[0] : combo.services;
      const modelData = Array.isArray(combo.device_models) ? combo.device_models[0] : combo.device_models;
      
      if (!serviceData?.name || !modelData?.name) {
        continue;
      }
      
      const serviceName = serviceData.name;
      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, []);
      }
      serviceMap.get(serviceName).push({
        serviceName: serviceData.name,
        modelName: modelData.name,
        updated_at: combo.created_at || new Date().toISOString()
      });
    }
    
    console.log(`✅ Grouped into ${serviceMap.size} service groups`);
    
    // 4. Generate URLs
    console.log('\n4. Generating URLs...');
    const urls = [];
    
    for (const [serviceName, models] of serviceMap) {
      const serviceSlug = serviceNameToUrlSlug(serviceName);
      
      for (const location of locations) {
        const citySlug = toUrlSlug(location.city_name);
        
        for (const model of models.slice(0, 10)) { // Limit to 10 models per service
          const modelSlug = toUrlSlug(model.modelName);
          
          if (isValidUrlSlug(citySlug) && isValidUrlSlug(serviceSlug) && isValidUrlSlug(modelSlug)) {
            urls.push(`/repair/${citySlug}/${serviceSlug}/${modelSlug}`);
          }
        }
      }
    }
    
    console.log(`🎯 Generated ${urls.length} URLs`);
    
    if (urls.length > 0) {
      console.log('\n📄 Sample URLs (first 10):');
      urls.slice(0, 10).forEach((url, i) => {
        console.log(`  ${i + 1}. ${url}`);
      });
    }
    
    return urls;
    
  } catch (error) {
    console.error('Error in test:', error);
    return [];
  }
}

// Run the test
testSitemapGeneration().then(urls => {
  console.log(`\n📋 Final URL count: ${urls.length}`);
  
  // Also test the actual sitemap endpoint
  console.log('\n🌐 Testing actual sitemap endpoint...');
  const { exec } = require('child_process');
  exec('curl -s "http://localhost:3000/api/sitemap.xml" | grep -c "<loc>"', (error, stdout, stderr) => {
    if (!error) {
      console.log(`Current sitemap URL count: ${stdout.trim()}`);
    } else {
      console.log('Could not fetch sitemap (server may not be running)');
    }
    
    // Compare
    if (urls.length > 0 && stdout) {
      const currentCount = parseInt(stdout.trim());
      console.log(`\n📊 Comparison:`);
      console.log(`  • Expected (from database): ${urls.length}`);
      console.log(`  • Actual (from sitemap): ${currentCount}`);
      console.log(`  • Difference: ${urls.length - currentCount}`);
    }
    
    process.exit(0);
  });
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});