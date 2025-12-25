const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Load MobileActive data
const CLEANED_DATA_PATH = path.join(__dirname, 'tmp/mobileactive-improved-cleaned.json');

async function identifyMissingModels() {
  console.log('🔍 Identifying Missing Samsung Models...\n');
  
  try {
    // Load MobileActive data
    const mobileactiveData = JSON.parse(fs.readFileSync(CLEANED_DATA_PATH, 'utf8'));
    const samsungProducts = mobileactiveData.filter(p => 
      p.brand === 'samsung' && 
      p.device_type === 'mobile' && 
      p.model_name !== 'unknown'
    );
    
    console.log(`📱 Found ${samsungProducts.length} Samsung mobile products with real model names\n`);
    
    // Get existing Samsung models
    const { data: existingModels, error: modelsError } = await supabase
      .from('device_models')
      .select('id, name, display_name, brand_id, brands(name)')
      .eq('is_active', true)
      .eq('brands.name', 'Samsung');
    
    if (modelsError) {
      console.error('❌ Error fetching models:', modelsError.message);
      return;
    }
    
    console.log(`📱 Found ${existingModels.length} existing Samsung models in your system\n`);
    
    // Get unique model names from MobileActive
    const mobileactiveModels = [...new Set(samsungProducts.map(p => p.model_name))];
    console.log(`📱 Found ${mobileactiveModels.length} unique Samsung models in MobileActive data\n`);
    
    // Find missing models
    const missingModels = [];
    const existingModelNames = existingModels.map(m => m.name.toLowerCase());
    
    mobileactiveModels.forEach(modelName => {
      const normalizedName = modelName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const isMissing = !existingModelNames.some(existing => 
        existing.includes(normalizedName) || 
        normalizedName.includes(existing)
      );
      
      if (isMissing) {
        missingModels.push({
          model_name: modelName,
          product_count: samsungProducts.filter(p => p.model_name === modelName).length,
          sample_products: samsungProducts.filter(p => p.model_name === modelName).slice(0, 3)
        });
      }
    });
    
    // Sort by product count (most popular first)
    missingModels.sort((a, b) => b.product_count - a.product_count);
    
    console.log(`❌ Found ${missingModels.length} missing Samsung models:\n`);
    
    missingModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.model_name} (${model.product_count} products)`);
      model.sample_products.forEach(product => {
        console.log(`   - ${product.service_type}: $${product.part_price}`);
      });
      console.log('');
    });
    
    // Show existing Samsung models for comparison
    console.log('📱 Your existing Samsung models:');
    existingModels.slice(0, 15).forEach(model => {
      console.log(`   - ${model.name}`);
    });
    
    // Generate SQL for missing models
    console.log('\n🔧 SQL to add missing models:');
    console.log('-- Add missing Samsung models');
    console.log('INSERT INTO device_models (brand_id, name, display_name, is_active) VALUES');
    
    const samsungBrandId = existingModels[0]?.brand_id || 2; // Default to Samsung brand ID
    
    missingModels.slice(0, 20).forEach((model, index) => {
      const comma = index < Math.min(19, missingModels.length - 1) ? ',' : ';';
      console.log(`  (${samsungBrandId}, '${model.model_name}', '${model.model_name}', true)${comma}`);
    });
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   📱 MobileActive Samsung models: ${mobileactiveModels.length}`);
    console.log(`   📱 Your existing Samsung models: ${existingModels.length}`);
    console.log(`   ❌ Missing models: ${missingModels.length}`);
    console.log(`   📈 Coverage: ${((existingModels.length / (existingModels.length + missingModels.length)) * 100).toFixed(1)}%`);
    
    // Save missing models to file for later use
    const missingModelsData = {
      total_missing: missingModels.length,
      samsung_brand_id: samsungBrandId,
      models: missingModels.map(m => ({
        name: m.model_name,
        display_name: m.model_name,
        product_count: m.product_count
      }))
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'tmp/missing-samsung-models.json'),
      JSON.stringify(missingModelsData, null, 2)
    );
    
    console.log('\n💾 Missing models data saved to tmp/missing-samsung-models.json');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the analysis
identifyMissingModels(); 