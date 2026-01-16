const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeMobileActiveServices() {
  console.log('🔍 MobileActive Services Analysis');
  console.log('=' .repeat(60));
  
  try {
    // Get all MobileActive products
    const { data: products, error } = await supabase
      .from('mobileactive_products')
      .select('*');
    
    if (error) {
      console.error('Error fetching MobileActive products:', error);
      return;
    }
    
    console.log(`\n📦 Analyzing ${products.length} products for services...`);
    
    // Analyze product names to extract services
    const serviceKeywords = {
      'screen_replacement': ['screen', 'lcd', 'display', 'glass'],
      'battery_replacement': ['battery', 'bat'],
      'charging_port_repair': ['charging', 'port', 'usb', 'lightning'],
      'speaker_repair': ['speaker', 'audio'],
      'camera_repair': ['camera', 'lens'],
      'water_damage_diagnostics': ['water', 'damage', 'diagnostic']
    };
    
    const serviceCounts = {};
    const productServiceMapping = [];
    
    products.forEach(product => {
      const productName = (product.product_name || '').toLowerCase();
      let detectedService = 'general_repair';
      
      // Check for service keywords
      for (const [service, keywords] of Object.entries(serviceKeywords)) {
        if (keywords.some(keyword => productName.includes(keyword))) {
          detectedService = service;
          break;
        }
      }
      
      serviceCounts[detectedService] = (serviceCounts[detectedService] || 0) + 1;
      productServiceMapping.push({
        product_id: product.id,
        product_name: product.product_name,
        detected_service: detectedService
      });
    });
    
    console.log(`\n🔧 Detected Services:`);
    Object.entries(serviceCounts).forEach(([service, count]) => {
      console.log(`  ${service}: ${count} products`);
    });
    
    // Show sample products for each service
    console.log(`\n📋 Sample Products by Service:`);
    Object.keys(serviceCounts).forEach(service => {
      const serviceProducts = productServiceMapping.filter(p => p.detected_service === service);
      console.log(`\n  ${service.toUpperCase()} (${serviceProducts.length} products):`);
      serviceProducts.slice(0, 3).forEach(product => {
        console.log(`    - ${product.product_name}`);
      });
      if (serviceProducts.length > 3) {
        console.log(`    ... and ${serviceProducts.length - 3} more`);
      }
    });
    
    // Generate SQL for services
    console.log(`\n📋 SQL FOR SERVICES:`);
    console.log('=' .repeat(60));
    
    Object.keys(serviceCounts).forEach((service, index) => {
      const displayName = service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      console.log(`INSERT INTO services (id, name, display_name, device_type_id, is_active) VALUES (${index + 1}, '${service}', '${displayName}', 1, true);`);
    });
    
    // Generate complete new schema
    console.log(`\n📋 COMPLETE NEW DATABASE SCHEMA:`);
    console.log('=' .repeat(60));
    
    console.log(`\n-- 1. Device Types`);
    console.log(`INSERT INTO device_types (id, name, display_name, is_active) VALUES (1, 'mobile', 'Mobile', true);`);
    
    console.log(`\n-- 2. Brands`);
    console.log(`INSERT INTO brands (id, name, display_name, device_type_id, is_active) VALUES (1, 'samsung', 'Samsung', 1, true);`);
    console.log(`INSERT INTO brands (id, name, display_name, device_type_id, is_active) VALUES (2, 'apple', 'Apple', 1, true);`);
    
    console.log(`\n-- 3. Services`);
    Object.keys(serviceCounts).forEach((service, index) => {
      const displayName = service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      console.log(`INSERT INTO services (id, name, display_name, device_type_id, is_active) VALUES (${index + 1}, '${service}', '${displayName}', 1, true);`);
    });
    
    // Get unique models
    const samsungProducts = products.filter(p => p.brand === 'samsung');
    const appleProducts = products.filter(p => p.brand === 'apple');
    
    const samsungModels = [...new Set(samsungProducts.map(p => p.model_name).filter(m => m && m !== 'unknown'))];
    const appleModels = [...new Set(appleProducts.map(p => p.model_name).filter(m => m && m !== 'unknown'))];
    
    console.log(`\n-- 4. Samsung Models (${samsungModels.length} total)`);
    samsungModels.forEach((model, index) => {
      console.log(`INSERT INTO device_models (id, name, display_name, brand_id, is_active) VALUES (${index + 1}, '${model}', '${model}', 1, true);`);
    });
    
    console.log(`\n-- 5. Apple Models (${appleModels.length} total)`);
    appleModels.forEach((model, index) => {
      console.log(`INSERT INTO device_models (id, name, display_name, brand_id, is_active) VALUES (${samsungModels.length + index + 1}, '${model}', '${model}', 2, true);`);
    });
    
    // Generate pricing tiers
    console.log(`\n-- 6. Pricing Tiers`);
    console.log(`INSERT INTO pricing_tiers (id, name, display_name, multiplier, is_active) VALUES (1, 'economy', 'Economy', 0.8, true);`);
    console.log(`INSERT INTO pricing_tiers (id, name, display_name, multiplier, is_active) VALUES (2, 'standard', 'Standard', 1.0, true);`);
    console.log(`INSERT INTO pricing_tiers (id, name, display_name, multiplier, is_active) VALUES (3, 'premium', 'Premium', 1.25, true);`);
    console.log(`INSERT INTO pricing_tiers (id, name, display_name, multiplier, is_active) VALUES (4, 'express', 'Express', 1.5, true);`);
    
    // Summary
    console.log(`\n📊 NEW SCHEMA SUMMARY:`);
    console.log(`  Device Types: 1 (mobile)`);
    console.log(`  Brands: 2 (Samsung, Apple)`);
    console.log(`  Services: ${Object.keys(serviceCounts).length}`);
    console.log(`  Samsung Models: ${samsungModels.length}`);
    console.log(`  Apple Models: ${appleModels.length}`);
    console.log(`  Total Models: ${samsungModels.length + appleModels.length}`);
    console.log(`  Total Products: ${products.length}`);
    
    // Calculate potential pricing combinations
    const totalModels = samsungModels.length + appleModels.length;
    const totalServices = Object.keys(serviceCounts).length;
    const totalTiers = 4;
    const totalCombinations = totalModels * totalServices * totalTiers;
    
    console.log(`\n💡 PRICING COMBINATIONS:`);
    console.log(`  Models × Services × Tiers = ${totalModels} × ${totalServices} × ${totalTiers} = ${totalCombinations} possible combinations`);
    console.log(`  This is much more manageable than the current 10,376 combinations!`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

// Run the analysis
analyzeMobileActiveServices(); 