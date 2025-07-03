const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMobileActiveStructure() {
  console.log('🔍 MobileActive Data Structure Analysis');
  console.log('=' .repeat(60));
  
  try {
    // Get a few sample products to understand structure
    const { data: products, error } = await supabase
      .from('mobileactive_products')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('Error fetching MobileActive products:', error);
      return;
    }
    
    console.log(`\n📦 Sample Products Structure:`);
    console.log('=' .repeat(60));
    
    products.forEach((product, index) => {
      console.log(`\nProduct ${index + 1}:`);
      Object.keys(product).forEach(key => {
        console.log(`  ${key}: ${product[key]}`);
      });
    });
    
    // Get all unique field values
    const { data: allProducts, error: allError } = await supabase
      .from('mobileactive_products')
      .select('*');
    
    if (allError) {
      console.error('Error fetching all products:', allError);
      return;
    }
    
    console.log(`\n📊 Field Analysis:`);
    console.log('=' .repeat(60));
    
    // Analyze each field
    const fields = Object.keys(allProducts[0]);
    fields.forEach(field => {
      const values = [...new Set(allProducts.map(p => p[field]).filter(v => v !== null && v !== undefined))];
      console.log(`\n${field.toUpperCase()}:`);
      console.log(`  Total unique values: ${values.length}`);
      console.log(`  Sample values: ${values.slice(0, 5).join(', ')}`);
      if (values.length > 5) {
        console.log(`  ... and ${values.length - 5} more`);
      }
    });
    
    // Look for service-related information in any field
    console.log(`\n🔧 Service Detection:`);
    console.log('=' .repeat(60));
    
    const serviceKeywords = ['screen', 'battery', 'charging', 'speaker', 'camera', 'port', 'lcd', 'display', 'glass'];
    
    fields.forEach(field => {
      const fieldValues = allProducts.map(p => p[field]).filter(v => v && typeof v === 'string');
      const serviceMatches = fieldValues.filter(value => 
        serviceKeywords.some(keyword => value.toLowerCase().includes(keyword))
      );
      
      if (serviceMatches.length > 0) {
        console.log(`\n${field} contains service information:`);
        console.log(`  Found ${serviceMatches.length} matches`);
        console.log(`  Sample matches: ${serviceMatches.slice(0, 3).join(', ')}`);
      }
    });
    
    // Check if there's a category or type field
    console.log(`\n📋 Category Analysis:`);
    console.log('=' .repeat(60));
    
    const categoryFields = fields.filter(field => 
      field.toLowerCase().includes('category') || 
      field.toLowerCase().includes('type') || 
      field.toLowerCase().includes('repair')
    );
    
    if (categoryFields.length > 0) {
      categoryFields.forEach(field => {
        const categories = [...new Set(allProducts.map(p => p[field]).filter(v => v))];
        console.log(`\n${field}:`);
        categories.forEach(category => {
          const count = allProducts.filter(p => p[field] === category).length;
          console.log(`  ${category}: ${count} products`);
        });
      });
    } else {
      console.log('No obvious category/type fields found');
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

// Run the analysis
checkMobileActiveStructure(); 