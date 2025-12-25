const fs = require('fs');
const path = require('path');

// Load the cleaned MobileActive data
const CLEANED_DATA_PATH = path.join(__dirname, 'tmp/mobileactive-improved-cleaned.json');

function analyzeMobileActiveData() {
  console.log('🔍 Analyzing MobileActive Data...\n');
  
  try {
    const data = JSON.parse(fs.readFileSync(CLEANED_DATA_PATH, 'utf8'));
    console.log(`📊 Total products: ${data.length}\n`);
    
    // Analyze device types
    const deviceTypes = {};
    const brands = {};
    const models = {};
    const brandModelCombos = {};
    
    data.forEach(product => {
      // Device types
      const deviceType = product.device_type || 'unknown';
      deviceTypes[deviceType] = (deviceTypes[deviceType] || 0) + 1;
      
      // Brands
      const brand = product.brand || 'unknown';
      brands[brand] = (brands[brand] || 0) + 1;
      
      // Models (only if not unknown)
      const modelName = product.model_name || 'unknown';
      if (modelName !== 'unknown') {
        models[modelName] = (models[modelName] || 0) + 1;
        
        // Brand-Model combinations
        const combo = `${brand} - ${modelName}`;
        brandModelCombos[combo] = (brandModelCombos[combo] || 0) + 1;
      }
    });
    
    // Display device types
    console.log('📱 Device Types:');
    Object.entries(deviceTypes)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count} products (${((count/data.length)*100).toFixed(1)}%)`);
      });
    
    console.log('\n🏷️  Brands:');
    Object.entries(brands)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .forEach(([brand, count]) => {
        console.log(`  ${brand}: ${count} products (${((count/data.length)*100).toFixed(1)}%)`);
      });
    
    console.log('\n📱 Models (Top 20):');
    Object.entries(models)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .forEach(([model, count]) => {
        console.log(`  ${model}: ${count} products`);
      });
    
    console.log('\n🔗 Brand-Model Combinations (Top 20):');
    Object.entries(brandModelCombos)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .forEach(([combo, count]) => {
        console.log(`  ${combo}: ${count} products`);
      });
    
    // Analyze mobile products specifically
    const mobileProducts = data.filter(p => p.device_type === 'mobile');
    console.log(`\n📱 Mobile Products Analysis:`);
    console.log(`  Total mobile products: ${mobileProducts.length}`);
    
    const mobileBrands = {};
    const mobileModels = {};
    
    mobileProducts.forEach(product => {
      const brand = product.brand || 'unknown';
      mobileBrands[brand] = (mobileBrands[brand] || 0) + 1;
      
      const modelName = product.model_name || 'unknown';
      if (modelName !== 'unknown') {
        mobileModels[modelName] = (mobileModels[modelName] || 0) + 1;
      }
    });
    
    console.log('\n📱 Mobile Brands:');
    Object.entries(mobileBrands)
      .sort(([,a], [,b]) => b - a)
      .forEach(([brand, count]) => {
        console.log(`  ${brand}: ${count} products`);
      });
    
    console.log('\n📱 Mobile Models (Top 15):');
    Object.entries(mobileModels)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .forEach(([model, count]) => {
        console.log(`  ${model}: ${count} products`);
      });
    
    // Show sample products with real model names
    console.log('\n📋 Sample Products with Real Model Names:');
    const productsWithModels = data.filter(p => p.model_name && p.model_name !== 'unknown').slice(0, 10);
    
    productsWithModels.forEach((product, index) => {
      console.log(`\n  ${index + 1}. ${product.product_title}`);
      console.log(`     Brand: ${product.brand}`);
      console.log(`     Model: ${product.model_name}`);
      console.log(`     Device Type: ${product.device_type}`);
      console.log(`     Service: ${product.service_type}`);
      console.log(`     Price: $${product.part_price}`);
    });
    
  } catch (error) {
    console.error('❌ Error analyzing data:', error.message);
  }
}

// Run the analysis
analyzeMobileActiveData(); 