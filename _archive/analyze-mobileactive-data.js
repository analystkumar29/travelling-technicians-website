const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeMobileActiveData() {
  console.log('🔍 MobileActive Data Analysis');
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
    
    console.log(`\n📦 Total MobileActive Products: ${products.length}`);
    
    // Analyze brands
    const brands = [...new Set(products.map(p => p.brand).filter(b => b))];
    console.log(`\n🏷️ Unique Brands: ${brands.length}`);
    brands.forEach(brand => {
      const brandProducts = products.filter(p => p.brand === brand);
      console.log(`  ${brand}: ${brandProducts.length} products`);
    });
    
    // Analyze device types
    const deviceTypes = [...new Set(products.map(p => p.device_type).filter(d => d))];
    console.log(`\n📱 Device Types: ${deviceTypes.length}`);
    deviceTypes.forEach(type => {
      const typeProducts = products.filter(p => p.device_type === type);
      console.log(`  ${type}: ${typeProducts.length} products`);
    });
    
    // Analyze models by brand
    console.log(`\n📱 Models by Brand:`);
    brands.forEach(brand => {
      const brandProducts = products.filter(p => p.brand === brand);
      const models = [...new Set(brandProducts.map(p => p.model_name).filter(m => m && m !== 'unknown'))];
      console.log(`\n  ${brand.toUpperCase()} (${models.length} models):`);
      models.slice(0, 10).forEach(model => {
        const modelProducts = brandProducts.filter(p => p.model_name === model);
        console.log(`    - ${model}: ${modelProducts.length} products`);
      });
      if (models.length > 10) {
        console.log(`    ... and ${models.length - 10} more models`);
      }
    });
    
    // Analyze services/repair types
    const services = [...new Set(products.map(p => p.repair_type).filter(s => s))];
    console.log(`\n🔧 Repair Types: ${services.length}`);
    services.forEach(service => {
      const serviceProducts = products.filter(p => p.repair_type === service);
      console.log(`  ${service}: ${serviceProducts.length} products`);
    });
    
    // Analyze pricing
    const prices = products.map(p => p.part_cost).filter(p => p > 0);
    console.log(`\n💰 Pricing Analysis:`);
    console.log(`  Average Part Cost: $${Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)}`);
    console.log(`  Price Range: $${Math.min(...prices)} - $${Math.max(...prices)}`);
    console.log(`  Products with Pricing: ${prices.length}/${products.length}`);
    
    // Analyze availability
    const availableProducts = products.filter(p => p.availability === 'in_stock');
    console.log(`\n📦 Availability:`);
    console.log(`  In Stock: ${availableProducts.length}`);
    console.log(`  Out of Stock: ${products.length - availableProducts.length}`);
    
    // Generate new schema recommendations
    console.log(`\n💡 NEW DATABASE SCHEMA RECOMMENDATIONS:`);
    console.log('=' .repeat(60));
    
    console.log(`\n1. DEVICE TYPES (${deviceTypes.length}):`);
    deviceTypes.forEach((type, index) => {
      console.log(`   ${index + 1}. ${type}`);
    });
    
    console.log(`\n2. BRANDS (${brands.length}):`);
    brands.forEach((brand, index) => {
      const brandProducts = products.filter(p => p.brand === brand);
      console.log(`   ${index + 1}. ${brand} (${brandProducts.length} products)`);
    });
    
    console.log(`\n3. SERVICES (${services.length}):`);
    services.forEach((service, index) => {
      const serviceProducts = products.filter(p => p.repair_type === service);
      console.log(`   ${index + 1}. ${service} (${serviceProducts.length} products)`);
    });
    
    // Count unique models
    const allModels = [];
    brands.forEach(brand => {
      const brandProducts = products.filter(p => p.brand === brand);
      const models = [...new Set(brandProducts.map(p => p.model_name).filter(m => m && m !== 'unknown'))];
      models.forEach(model => {
        allModels.push({ brand, model });
      });
    });
    
    console.log(`\n4. TOTAL UNIQUE MODELS: ${allModels.length}`);
    
    // Generate SQL for new schema
    console.log(`\n📋 SQL SCHEMA GENERATION:`);
    console.log('=' .repeat(60));
    
    console.log(`\n-- Device Types`);
    deviceTypes.forEach((type, index) => {
      console.log(`INSERT INTO device_types (id, name, display_name, is_active) VALUES (${index + 1}, '${type}', '${type.charAt(0).toUpperCase() + type.slice(1)}', true);`);
    });
    
    console.log(`\n-- Brands`);
    brands.forEach((brand, index) => {
      const brandProducts = products.filter(p => p.brand === brand);
      const deviceType = brandProducts[0]?.device_type || 'mobile';
      const deviceTypeId = deviceTypes.indexOf(deviceType) + 1;
      console.log(`INSERT INTO brands (id, name, display_name, device_type_id, is_active) VALUES (${index + 1}, '${brand}', '${brand.charAt(0).toUpperCase() + brand.slice(1)}', ${deviceTypeId}, true);`);
    });
    
    console.log(`\n-- Services`);
    services.forEach((service, index) => {
      const serviceProducts = products.filter(p => p.repair_type === service);
      const deviceType = serviceProducts[0]?.device_type || 'mobile';
      const deviceTypeId = deviceTypes.indexOf(deviceType) + 1;
      console.log(`INSERT INTO services (id, name, display_name, device_type_id, is_active) VALUES (${index + 1}, '${service}', '${service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}', ${deviceTypeId}, true);`);
    });
    
    console.log(`\n-- Models (Sample - first 5 per brand)`);
    let modelId = 1;
    brands.forEach(brand => {
      const brandProducts = products.filter(p => p.brand === brand);
      const models = [...new Set(brandProducts.map(p => p.model_name).filter(m => m && m !== 'unknown'))];
      const brandId = brands.indexOf(brand) + 1;
      
      models.slice(0, 5).forEach(model => {
        console.log(`INSERT INTO device_models (id, name, display_name, brand_id, is_active) VALUES (${modelId}, '${model}', '${model}', ${brandId}, true);`);
        modelId++;
      });
    });
    
    console.log(`\n🎉 Analysis Complete!`);
    console.log('=' .repeat(60));
    
    // Save analysis results
    const analysisResults = {
      totalProducts: products.length,
      brands: brands,
      deviceTypes: deviceTypes,
      services: services,
      uniqueModels: allModels.length,
      averagePrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      inStockCount: availableProducts.length,
      analysisDate: new Date().toISOString()
    };
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`  Total Products: ${analysisResults.totalProducts}`);
    console.log(`  Unique Brands: ${analysisResults.brands.length}`);
    console.log(`  Device Types: ${analysisResults.deviceTypes.length}`);
    console.log(`  Services: ${analysisResults.services.length}`);
    console.log(`  Unique Models: ${analysisResults.uniqueModels}`);
    console.log(`  Average Price: $${analysisResults.averagePrice}`);
    console.log(`  In Stock: ${analysisResults.inStockCount}`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

// Run the analysis
analyzeMobileActiveData(); 