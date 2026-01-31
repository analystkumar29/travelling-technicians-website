/**
 * Sitemap Pipeline Debug Script
 * 
 * This script traces exactly where records are lost in the sitemap generation pipeline.
 * It replicates the logic from getPopularCityServiceModels() with detailed logging.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to convert to URL slug
function toUrlSlug(input) {
  if (!input || typeof input !== 'string') return '';
  return input.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Service slug mapping
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

function serviceNameToUrlSlug(serviceName) {
  const urlSlug = toUrlSlug(serviceName);
  
  // Check if we have a mapping for this slug
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

async function traceSitemapPipeline() {
  console.log('🔍 Starting sitemap pipeline trace...\n');
  
  // Step 1: Count total active dynamic_pricing records
  console.log('📊 Step 1: Counting total active dynamic_pricing records');
  const { data: totalPricing, error: pricingError } = await supabase
    .from('dynamic_pricing')
    .select('id')
    .eq('is_active', true);
  
  if (pricingError) {
    console.error('Error counting dynamic_pricing:', pricingError);
    return;
  }
  
  console.log(`✅ Total active dynamic_pricing records: ${totalPricing.length}\n`);
  
  // Step 2: Query with joins to see what we get
  console.log('📊 Step 2: Querying dynamic_pricing with joins');
  const { data: combinations, error: comboError } = await supabase
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
  
  if (comboError) {
    console.error('Error querying combinations:', comboError);
    return;
  }
  
  console.log(`✅ Query returned ${combinations.length} combinations\n`);
  
  // Step 3: Analyze service data
  console.log('📊 Step 3: Analyzing service data');
  const services = new Map();
  const serviceCounts = {};
  
  for (const combo of combinations) {
    const serviceData = Array.isArray(combo.services) ? combo.services[0] : combo.services;
    const modelData = Array.isArray(combo.device_models) ? combo.device_models[0] : combo.device_models;
    
    if (!serviceData?.name || !modelData?.name) {
      console.log(`❌ Skipping combination ${combo.id}: missing service or model data`);
      continue;
    }
    
    const serviceName = serviceData.name;
    const serviceSlug = serviceData.slug || serviceName;
    
    if (!services.has(serviceName)) {
      services.set(serviceName, {
        name: serviceName,
        slug: serviceSlug,
        is_active: serviceData.is_active,
        count: 0,
        models: new Set()
      });
    }
    
    const service = services.get(serviceName);
    service.count++;
    service.models.add(modelData.name);
  }
  
  console.log(`📋 Found ${services.size} unique services:`);
  for (const [serviceName, service] of services) {
    console.log(`  • ${serviceName} (${service.count} pricing records, ${service.models.size} unique models)`);
  }
  console.log();
  
  // Step 4: Check service activation status
  console.log('📊 Step 4: Checking service activation in database');
  const { data: allServices, error: servicesError } = await supabase
    .from('services')
    .select('name, slug, is_active')
    .order('name');
  
  if (servicesError) {
    console.error('Error fetching services:', servicesError);
  } else {
    const activeServices = allServices.filter(s => s.is_active);
    const inactiveServices = allServices.filter(s => !s.is_active);
    
    console.log(`📋 Total services in database: ${allServices.length}`);
    console.log(`✅ Active services: ${activeServices.length}`);
    console.log(`❌ Inactive services: ${inactiveServices.length}`);
    
    if (inactiveServices.length > 0) {
      console.log('\nInactive services:');
      inactiveServices.forEach(s => {
        console.log(`  • ${s.name} (slug: ${s.slug})`);
      });
    }
  }
  console.log();
  
  // Step 5: Test slug transformations
  console.log('📊 Step 5: Testing slug transformations');
  const slugIssues = [];
  
  for (const combo of combinations.slice(0, 20)) { // Test first 20
    const serviceData = Array.isArray(combo.services) ? combo.services[0] : combo.services;
    const modelData = Array.isArray(combo.device_models) ? combo.device_models[0] : combo.device_models;
    
    if (!serviceData?.name || !modelData?.name) continue;
    
    const serviceSlug = serviceNameToUrlSlug(serviceData.name);
    const modelSlug = toUrlSlug(modelData.name);
    
    const serviceValid = isValidUrlSlug(serviceSlug);
    const modelValid = isValidUrlSlug(modelSlug);
    
    if (!serviceValid || !modelValid) {
      slugIssues.push({
        service: serviceData.name,
        serviceSlug,
        serviceValid,
        model: modelData.name,
        modelSlug,
        modelValid
      });
    }
  }
  
  if (slugIssues.length > 0) {
    console.log(`⚠️ Found ${slugIssues.length} slug validation issues:`);
    slugIssues.forEach(issue => {
      console.log(`  • Service: "${issue.service}" -> "${issue.serviceSlug}" (valid: ${issue.serviceValid})`);
      console.log(`    Model: "${issue.model}" -> "${issue.modelSlug}" (valid: ${issue.modelValid})`);
    });
  } else {
    console.log('✅ All tested slugs are valid');
  }
  console.log();
  
  // Step 6: Simulate the full pipeline
  console.log('📊 Step 6: Simulating full pipeline with limits');
  
  // Get active service locations
  const { data: locations } = await supabase
    .from('service_locations')
    .select('city, updated_at')
    .eq('is_active', true)
    .order('city')
    .limit(20);
  
  console.log(`📍 Found ${locations?.length || 0} active service locations`);
  
  // Group combinations by service
  const combinationsByService = new Map();
  
  for (const combo of combinations) {
    const serviceData = Array.isArray(combo.services) ? combo.services[0] : combo.services;
    const modelData = Array.isArray(combo.device_models) ? combo.device_models[0] : combo.device_models;
    
    if (!serviceData?.name || !modelData?.name) continue;
    
    const serviceName = serviceData.name;
    if (!combinationsByService.has(serviceName)) {
      combinationsByService.set(serviceName, []);
    }
    combinationsByService.get(serviceName).push(combo);
  }
  
  console.log(`📋 Grouped into ${combinationsByService.size} service groups`);
  
  // Apply limits
  const MAX_COMBINATIONS = 2000;
  const MAX_COMBINATIONS_PER_SERVICE = 100;
  
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
          updated_at: combo.updated_at || 
                     serviceData?.updated_at || 
                     modelData?.updated_at || 
                     new Date().toISOString(),
          popularity: modelData?.popularity_score || 0
        };
      })
      .filter(item => item.serviceName && item.modelName);
    
    console.log(`  • ${serviceName}: ${topModels.length} models after limit`);
    
    // Generate URLs for each city
    for (const location of locations || []) {
      if (totalCombinationCount >= MAX_COMBINATIONS) break;
      
      const citySlug = toUrlSlug(location.city);
      if (!isValidUrlSlug(citySlug)) {
        console.log(`    ⚠️ Skipping city "${location.city}" (invalid slug: ${citySlug})`);
        continue;
      }
      
      for (const model of topModels) {
        if (totalCombinationCount >= MAX_COMBINATIONS) break;
        
        const serviceSlug = serviceNameToUrlSlug(model.serviceName);
        const modelSlug = toUrlSlug(model.modelName);
        
        if (!isValidUrlSlug(serviceSlug) || !isValidUrlSlug(modelSlug)) {
          console.log(`    ⚠️ Skipping combination: service="${serviceSlug}", model="${modelSlug}"`);
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
  
  console.log(`\n🎯 Final result: ${result.length} city-service-model combinations`);
  console.log(`📈 Theoretical maximum: ${totalPricing.length} records × ${locations?.length || 0} cities = ${totalPricing.length * (locations?.length || 0)} URLs`);
  
  // Step 7: Summary
  console.log('\n📋 SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total dynamic_pricing records: ${totalPricing.length}`);
  console.log(`Combinations after join: ${combinations.length}`);
  console.log(`Unique services found: ${services.size}`);
  console.log(`Active service locations: ${locations?.length || 0}`);
  console.log(`Final URL count: ${result.length}`);
  console.log(`Records lost: ${totalPricing.length - combinations.length} in join, ${combinations.length - result.length} in processing`);
  console.log('='.repeat(50));
  
  // Step 8: Sample output
  if (result.length > 0) {
    console.log('\n📄 Sample URLs (first 10):');
    result.slice(0, 10).forEach((item, i) => {
      console.log(`  ${i + 1}. /repair/${item.city}/${item.service}/${item.model}`);
    });
  }
}

// Run the trace
traceSitemapPipeline().catch(console.error);