// MobileActive URL Diagnosis Script (CommonJS)

const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');

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

async function testUrl(url, description) {
  try {
    log(`🔍 Testing: ${description}`);
    log(`   URL: ${url}`);
    
    const { data, status } = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TravellingTechnicians/1.0)'
      }
    });
    
    log(`   Status: ${status}`, 'success');
    
    if (data.products) {
      log(`   Products found: ${data.products.length}`, 'success');
      if (data.products.length > 0) {
        const sample = data.products[0];
        log(`   Sample product: ${sample.title} - $${sample.variants?.[0]?.price || 'N/A'}`);
      }
    } else if (data.collection) {
      log(`   Collection found: ${data.collection.title}`, 'success');
      if (data.collection.products_count) {
        log(`   Products count: ${data.collection.products_count}`, 'success');
      }
    } else {
      log(`   Response keys: ${Object.keys(data).join(', ')}`);
    }
    
    return { success: true, data, status };
  } catch (error) {
    log(`   Error: ${error.response?.status || error.code} - ${error.message}`, 'error');
    return { success: false, error: error.message, status: error.response?.status };
  }
}

async function diagnoseMobileActive() {
  log('🔍 Diagnosing MobileActive.ca URL structure...');
  
  const testUrls = [
    {
      url: 'https://mobileactive.ca/collections/all-iphone-screens.json',
      description: 'iPhone screens collection (JSON)'
    },
    {
      url: 'https://mobileactive.ca/collections/all-iphone-screens/products.json',
      description: 'iPhone screens products (JSON)'
    },
    {
      url: 'https://mobileactive.ca/collections/all-iphone-screens.json?limit=50',
      description: 'iPhone screens with limit'
    },
    {
      url: 'https://mobileactive.ca/products.json',
      description: 'All products (JSON)'
    },
    {
      url: 'https://mobileactive.ca/products.json?limit=10',
      description: 'All products with limit'
    },
    {
      url: 'https://mobileactive.ca/collections.json',
      description: 'All collections (JSON)'
    },
    {
      url: 'https://mobileactive.ca/collections/all-iphone-screens',
      description: 'iPhone screens (HTML)'
    },
    {
      url: 'https://mobileactive.ca/search.json?q=iphone+screen',
      description: 'Search for iPhone screens'
    },
    {
      url: 'https://mobileactive.ca/search.json?q=screen',
      description: 'Search for screens'
    }
  ];
  
  const results = [];
  
  for (const test of testUrls) {
    const result = await testUrl(test.url, test.description);
    results.push({
      ...test,
      ...result
    });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Save results
  const outputPath = path.join(process.cwd(), 'tmp', 'url-diagnosis.json');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
  
  log(`💾 Saved diagnosis results to ${outputPath}`);
  
  // Print summary
  log('\n📊 URL DIAGNOSIS SUMMARY');
  log('=========================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  log(`✅ Successful requests: ${successful.length}`);
  log(`❌ Failed requests: ${failed.length}`);
  
  successful.forEach(result => {
    log(`  ${result.description}: ${result.status}`);
  });
  
  failed.forEach(result => {
    log(`  ${result.description}: ${result.status} - ${result.error}`);
  });
  
  // Find the best working URL pattern
  const workingPatterns = successful.filter(r => 
    r.data.products && r.data.products.length > 0
  );
  
  if (workingPatterns.length > 0) {
    log('\n🎯 WORKING URL PATTERNS:');
    workingPatterns.forEach(pattern => {
      log(`  ${pattern.url} (${pattern.data.products.length} products)`);
    });
  } else {
    log('\n⚠️ No working product URL patterns found');
  }
}

if (require.main === module) {
  diagnoseMobileActive().catch(console.error);
} 