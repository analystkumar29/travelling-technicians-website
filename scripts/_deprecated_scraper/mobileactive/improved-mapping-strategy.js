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

function normalizeModelName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .replace(/iphone/g, 'iphone')
    .replace(/galaxy/g, 'galaxy')
    .replace(/sgs/g, 'galaxy') // SGS = Samsung Galaxy S
    .replace(/s(\d+)/g, 's$1') // Normalize S series
    .replace(/note(\d+)/g, 'note$1') // Normalize Note series
    .replace(/plus/g, 'plus')
    .replace(/ultra/g, 'ultra')
    .replace(/pro/g, 'pro')
    .replace(/max/g, 'max');
}

function findBestMatch(mobileactiveProduct, existingModels) {
  const brand = mobileactiveProduct.brand.toLowerCase();
  const modelName = mobileactiveProduct.model_name;
  
  if (!modelName || modelName === 'unknown') {
    return null;
  }
  
  // Normalize the MobileActive model name
  const normalizedMobileActive = normalizeModelName(modelName);
  
  // Find models with matching brand
  const brandMatches = existingModels.filter(model => 
    model.brands.name.toLowerCase() === brand
  );
  
  if (brandMatches.length === 0) {
    return null;
  }
  
  // Try exact match first
  const exactMatch = brandMatches.find(model => 
    model.name.toLowerCase() === modelName.toLowerCase() ||
    model.display_name.toLowerCase() === modelName.toLowerCase()
  );
  
  if (exactMatch) {
    return { model: exactMatch, confidence: 'exact', reason: 'Exact name match' };
  }
  
  // Try normalized match
  const normalizedMatches = brandMatches.filter(model => {
    const normalizedExisting = normalizeModelName(model.name);
    return normalizedExisting === normalizedMobileActive;
  });
  
  if (normalizedMatches.length === 1) {
    return { model: normalizedMatches[0], confidence: 'high', reason: 'Normalized name match' };
  }
  
  // Try partial matches
  const partialMatches = brandMatches.filter(model => {
    const existingName = model.name.toLowerCase();
    const mobileActiveName = modelName.toLowerCase();
    
    // Check if one contains the other
    return existingName.includes(mobileActiveName) || 
           mobileActiveName.includes(existingName) ||
           existingName.includes(normalizedMobileActive) ||
           normalizedMobileActive.includes(existingName);
  });
  
  if (partialMatches.length === 1) {
    return { model: partialMatches[0], confidence: 'medium', reason: 'Partial name match' };
  }
  
  // Try number-based matching for S series
  if (modelName.includes('SGS S') || modelName.includes('Galaxy S')) {
    const sNumber = modelName.match(/S(\d+)/)?.[1];
    if (sNumber) {
      const sMatches = brandMatches.filter(model => 
        model.name.toLowerCase().includes(`s${sNumber}`)
      );
      if (sMatches.length === 1) {
        return { model: sMatches[0], confidence: 'medium', reason: `S${sNumber} series match` };
      }
    }
  }
  
  return null;
}

async function analyzeMapping() {
  console.log('🔍 Analyzing MobileActive to System Mapping...\n');
  
  try {
    // Load MobileActive data
    const mobileactiveData = JSON.parse(fs.readFileSync(CLEANED_DATA_PATH, 'utf8'));
    const mobileProducts = mobileactiveData.filter(p => p.device_type === 'mobile' && p.model_name !== 'unknown');
    
    console.log(`📱 Found ${mobileProducts.length} MobileActive products with real model names\n`);
    
    // Get existing models
    const { data: existingModels, error: modelsError } = await supabase
      .from('device_models')
      .select('id, name, display_name, brand_id, brands(name)')
      .eq('is_active', true);
    
    if (modelsError) {
      console.error('❌ Error fetching models:', modelsError.message);
      return;
    }
    
    console.log(`📱 Found ${existingModels.length} existing models in your system\n`);
    
    // Test mapping on sample products
    const sampleProducts = mobileProducts.slice(0, 20);
    let mappedCount = 0;
    let unmappedCount = 0;
    
    console.log('🔗 Testing mapping on sample products:\n');
    
    sampleProducts.forEach((product, index) => {
      const match = findBestMatch(product, existingModels);
      
      console.log(`${index + 1}. ${product.product_title}`);
      console.log(`   MobileActive: ${product.brand} - ${product.model_name}`);
      
      if (match) {
        console.log(`   ✅ Mapped to: ${match.model.brands.name} ${match.model.name} (ID: ${match.model.id})`);
        console.log(`   Confidence: ${match.confidence} - ${match.reason}`);
        mappedCount++;
      } else {
        console.log(`   ❌ No match found`);
        unmappedCount++;
      }
      console.log('');
    });
    
    console.log(`📊 Mapping Results:`);
    console.log(`   ✅ Mapped: ${mappedCount} products`);
    console.log(`   ❌ Unmapped: ${unmappedCount} products`);
    console.log(`   📈 Success rate: ${((mappedCount / (mappedCount + unmappedCount)) * 100).toFixed(1)}%`);
    
    // Show some examples of naming differences
    console.log('\n🔍 Examples of naming differences:');
    console.log('MobileActive -> Your System');
    console.log('iPhone 15 Pro Max -> iPhone 15 Pro Max ✅');
    console.log('Galaxy Note 10 -> galaxy-note-10 ❌');
    console.log('SGS S20 -> galaxy-s20 ❌');
    console.log('iPhone 6 -> iPhone 6 ✅');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the analysis
analyzeMapping(); 