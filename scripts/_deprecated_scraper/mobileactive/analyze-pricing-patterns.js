// MobileActive Pricing Pattern Analysis Script (CommonJS)

const fs = require('fs/promises');
const path = require('path');

// Configuration
const CLEANED_DATA_PATH = path.join(process.cwd(), 'tmp/mobileactive-improved-cleaned.json');
const PRICING_ANALYSIS_PATH = path.join(process.cwd(), 'tmp/pricing-pattern-analysis.json');
const PRICING_CATEGORIES_PATH = path.join(process.cwd(), 'tmp/pricing-categories.csv');

const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }[level];
  console.log(`${timestamp} ${emoji} ${message}`);
};

// Quality indicators based on product titles
const QUALITY_INDICATORS = {
  'premium': ['premium', 'oem', 'original', 'genuine', 'authentic', 'high quality'],
  'standard': ['standard', 'quality', 'good', 'reliable', 'tested'],
  'economy': ['economy', 'budget', 'cheap', 'affordable', 'value'],
  'refurbished': ['refurbished', 'refurb', 'reconditioned', 'used'],
  'aftermarket': ['aftermarket', 'compatible', 'replacement', 'generic'],
  'with_frame': ['with frame', 'assembly', 'complete', 'full'],
  'without_frame': ['without frame', 'screen only', 'lcd only', 'digitizer only']
};

function detectQualityTier(product) {
  const title = (product.product_title || '').toLowerCase();
  const tags = (product.tags || []).map(tag => tag.toLowerCase());
  
  const allText = `${title} ${tags.join(' ')}`;
  
  // Check for quality indicators
  for (const [tier, keywords] of Object.entries(QUALITY_INDICATORS)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      return tier;
    }
  }
  
  // Default based on price if no indicators found
  const price = product.part_price;
  if (price < 50) return 'economy';
  if (price < 100) return 'standard';
  if (price < 200) return 'premium';
  return 'premium';
}

function detectAssemblyType(product) {
  const title = (product.product_title || '').toLowerCase();
  
  if (title.includes('with frame') || title.includes('assembly') || title.includes('complete')) {
    return 'with_frame';
  }
  
  if (title.includes('without frame') || title.includes('screen only') || title.includes('lcd only')) {
    return 'without_frame';
  }
  
  return 'unknown';
}

async function analyzePricingPatterns() {
  try {
    log('🔍 Loading cleaned data...');
    const cleanedData = JSON.parse(await fs.readFile(CLEANED_DATA_PATH, 'utf8'));
    log(`📊 Loaded ${cleanedData.length} products for analysis`);
    
    // Group products by model and service
    const productGroups = {};
    
    cleanedData.forEach(product => {
      const key = `${product.brand}-${product.model_name}-${product.service_type}`;
      
      if (!productGroups[key]) {
        productGroups[key] = [];
      }
      
      productGroups[key].push({
        ...product,
        quality_tier: detectQualityTier(product),
        assembly_type: detectAssemblyType(product)
      });
    });
    
    // Filter groups with multiple price points
    const multiPriceGroups = Object.entries(productGroups)
      .filter(([key, products]) => {
        const uniquePrices = new Set(products.map(p => p.part_price));
        return uniquePrices.size > 1;
      })
      .map(([key, products]) => ({
        key,
        products,
        priceCount: new Set(products.map(p => p.part_price)).size,
        priceRange: {
          min: Math.min(...products.map(p => p.part_price)),
          max: Math.max(...products.map(p => p.part_price)),
          avg: products.reduce((sum, p) => sum + p.part_price, 0) / products.length
        }
      }))
      .sort((a, b) => b.priceCount - a.priceCount);
    
    log(`📊 Found ${multiPriceGroups.length} product groups with multiple price points`);
    
    // Analyze pricing patterns
    const analysis = {
      total_groups: Object.keys(productGroups).length,
      multi_price_groups: multiPriceGroups.length,
      single_price_groups: Object.keys(productGroups).length - multiPriceGroups.length,
      
      price_distribution: {
        '2_prices': 0,
        '3_prices': 0,
        '4_prices': 0,
        '5+_prices': 0
      },
      
      quality_tier_distribution: {},
      assembly_type_distribution: {},
      
      top_models_by_price_variation: [],
      pricing_patterns: []
    };
    
    // Count price distributions
    multiPriceGroups.forEach(group => {
      if (group.priceCount === 2) analysis.price_distribution['2_prices']++;
      else if (group.priceCount === 3) analysis.price_distribution['3_prices']++;
      else if (group.priceCount === 4) analysis.price_distribution['4_prices']++;
      else analysis.price_distribution['5+_prices']++;
    });
    
    // Analyze quality tiers and assembly types
    cleanedData.forEach(product => {
      const qualityTier = detectQualityTier(product);
      const assemblyType = detectAssemblyType(product);
      
      analysis.quality_tier_distribution[qualityTier] = 
        (analysis.quality_tier_distribution[qualityTier] || 0) + 1;
      
      analysis.assembly_type_distribution[assemblyType] = 
        (analysis.assembly_type_distribution[assemblyType] || 0) + 1;
    });
    
    // Get top models by price variation
    analysis.top_models_by_price_variation = multiPriceGroups
      .slice(0, 20)
      .map(group => ({
        model: group.key,
        price_count: group.priceCount,
        price_range: group.priceRange,
        products: group.products.map(p => ({
          title: p.product_title,
          price: p.part_price,
          quality_tier: p.quality_tier,
          assembly_type: p.assembly_type
        }))
      }));
    
    // Analyze pricing patterns for common models
    const commonModels = ['iPhone 15', 'iPhone 14', 'Galaxy S23', 'Galaxy S22', 'Pixel 7'];
    
    commonModels.forEach(model => {
      const modelGroups = multiPriceGroups.filter(g => g.key.includes(model.toLowerCase()));
      
      if (modelGroups.length > 0) {
        analysis.pricing_patterns.push({
          model,
          groups: modelGroups.map(g => ({
            service: g.key.split('-').pop(),
            price_count: g.priceCount,
            price_range: g.priceRange,
            products: g.products.map(p => ({
              title: p.product_title,
              price: p.part_price,
              quality_tier: p.quality_tier,
              assembly_type: p.assembly_type
            }))
          }))
        });
      }
    });
    
    // Save analysis
    log('💾 Saving pricing pattern analysis...');
    await fs.writeFile(PRICING_ANALYSIS_PATH, JSON.stringify(analysis, null, 2));
    
    // Generate CSV for pricing categories
    log('📝 Generating pricing categories CSV...');
    const csvRows = [
      'Model,Service,Quality Tier,Assembly Type,Price,Product Title,SKU'
    ];
    
    multiPriceGroups.forEach(group => {
      group.products.forEach(product => {
        csvRows.push([
          `"${product.model_name}"`,
          `"${product.service_type}"`,
          `"${product.quality_tier}"`,
          `"${product.assembly_type}"`,
          product.part_price,
          `"${product.product_title}"`,
          `"${product.sku || ''}"`
        ].join(','));
      });
    });
    
    await fs.writeFile(PRICING_CATEGORIES_PATH, csvRows.join('\n'));
    
    // Display summary
    log('📊 PRICING PATTERN ANALYSIS SUMMARY', 'success');
    log('====================================');
    log(`Total Product Groups: ${analysis.total_groups}`);
    log(`Groups with Multiple Prices: ${analysis.multi_price_groups}`);
    log(`Groups with Single Price: ${analysis.single_price_groups}`);
    log('');
    log('Price Distribution:');
    Object.entries(analysis.price_distribution).forEach(([range, count]) => {
      log(`  ${range}: ${count} groups`);
    });
    log('');
    log('Quality Tier Distribution:');
    Object.entries(analysis.quality_tier_distribution).forEach(([tier, count]) => {
      log(`  ${tier}: ${count} products`);
    });
    log('');
    log('Assembly Type Distribution:');
    Object.entries(analysis.assembly_type_distribution).forEach(([type, count]) => {
      log(`  ${type}: ${count} products`);
    });
    log('');
    log('Top Models by Price Variation:');
    analysis.top_models_by_price_variation.slice(0, 5).forEach((model, index) => {
      log(`  ${index + 1}. ${model.model} (${model.price_count} prices, $${model.price_range.min}-$${model.price_range.max})`);
    });
    
    log('✅ Pricing pattern analysis completed!', 'success');
    log(`📁 Analysis file: ${PRICING_ANALYSIS_PATH}`);
    log(`📁 Categories CSV: ${PRICING_CATEGORIES_PATH}`);
    
    return analysis;
    
  } catch (error) {
    log(`❌ Error during pricing pattern analysis: ${error.message}`, 'error');
    throw error;
  }
}

// Run the analysis
if (require.main === module) {
  analyzePricingPatterns()
    .then(() => {
      log('🎉 Pricing pattern analysis completed successfully!', 'success');
      process.exit(0);
    })
    .catch((error) => {
      log(`💥 Pricing pattern analysis failed: ${error.message}`, 'error');
      process.exit(1);
    });
}

module.exports = { analyzePricingPatterns }; 