// MobileActive Collection Discovery Script (CommonJS)

const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');

// Configuration
const OUTPUT_DIR = path.join(process.cwd(), 'tmp');
const DISCOVERED_COLLECTIONS_PATH = path.join(OUTPUT_DIR, 'discovered-collections.json');
const COLLECTIONS_ANALYSIS_PATH = path.join(OUTPUT_DIR, 'collections-analysis.json');

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

async function fetchAllCollections() {
  log('🔍 Discovering MobileActive collections...');
  
  const allCollections = [];
  let page = 1;
  const limit = 250;
  
  while (true) {
    try {
      const url = `https://mobileactive.ca/collections.json?limit=${limit}&page=${page}`;
      log(`📄 Fetching collections page ${page}...`);
      
      const { data } = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TravellingTechnicians/1.0)'
        }
      });
      
      if (!data.collections || data.collections.length === 0) {
        log(`📄 No more collections found on page ${page}`);
        break;
      }
      
      allCollections.push(...data.collections);
      log(`📄 Found ${data.collections.length} collections on page ${page}`);
      
      if (data.collections.length < limit) {
        log(`📄 Reached last page (${data.collections.length} < ${limit})`);
        break;
      }
      
      page++;
      
      // Small delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      if (error.response?.status === 404) {
        log(`📄 No more collections found (404 on page ${page})`);
        break;
      }
      log(`❌ Error fetching page ${page}: ${error.message}`, 'error');
      throw error;
    }
  }
  
  return allCollections;
}

function analyzeCollections(collections) {
  log('🔍 Analyzing discovered collections...');
  
  const analysis = {
    total_collections: collections.length,
    collections_by_type: {},
    collections_by_brand: {},
    collections_by_service: {},
    potential_mobile_collections: [],
    potential_laptop_collections: [],
    potential_tablet_collections: [],
    all_collections: collections.map(c => ({
      handle: c.handle,
      title: c.title,
      description: c.description,
      products_count: c.products_count,
      url: `https://mobileactive.ca/collections/${c.handle}`
    }))
  };
  
  // Analyze each collection
  collections.forEach(collection => {
    const title = collection.title.toLowerCase();
    const description = (collection.description || '').toLowerCase();
    const handle = collection.handle.toLowerCase();
    
    // Detect device types
    if (title.includes('iphone') || title.includes('samsung') || title.includes('galaxy') || 
        title.includes('pixel') || title.includes('oneplus') || title.includes('huawei') ||
        title.includes('xiaomi') || title.includes('mobile') || title.includes('phone') ||
        handle.includes('iphone') || handle.includes('samsung') || handle.includes('galaxy')) {
      analysis.potential_mobile_collections.push({
        handle: collection.handle,
        title: collection.title,
        products_count: collection.products_count,
        confidence: 'high'
      });
    }
    
    if (title.includes('macbook') || title.includes('laptop') || title.includes('computer') ||
        title.includes('dell') || title.includes('hp') || title.includes('lenovo') ||
        title.includes('asus') || title.includes('acer') || title.includes('toshiba') ||
        handle.includes('macbook') || handle.includes('laptop')) {
      analysis.potential_laptop_collections.push({
        handle: collection.handle,
        title: collection.title,
        products_count: collection.products_count,
        confidence: 'high'
      });
    }
    
    if (title.includes('ipad') || title.includes('tablet') || title.includes('android tablet') ||
        handle.includes('ipad') || handle.includes('tablet')) {
      analysis.potential_tablet_collections.push({
        handle: collection.handle,
        title: collection.title,
        products_count: collection.products_count,
        confidence: 'high'
      });
    }
    
    // Detect brands
    if (title.includes('apple') || handle.includes('apple')) {
      analysis.collections_by_brand.apple = analysis.collections_by_brand.apple || [];
      analysis.collections_by_brand.apple.push(collection.handle);
    }
    if (title.includes('samsung') || handle.includes('samsung')) {
      analysis.collections_by_brand.samsung = analysis.collections_by_brand.samsung || [];
      analysis.collections_by_brand.samsung.push(collection.handle);
    }
    if (title.includes('google') || handle.includes('google')) {
      analysis.collections_by_brand.google = analysis.collections_by_brand.google || [];
      analysis.collections_by_brand.google.push(collection.handle);
    }
    
    // Detect service types
    if (title.includes('screen') || title.includes('lcd') || title.includes('display') ||
        title.includes('glass') || handle.includes('screen') || handle.includes('lcd')) {
      analysis.collections_by_service.screen_replacement = analysis.collections_by_service.screen_replacement || [];
      analysis.collections_by_service.screen_replacement.push(collection.handle);
    }
    if (title.includes('battery') || handle.includes('battery')) {
      analysis.collections_by_service.battery_replacement = analysis.collections_by_service.battery_replacement || [];
      analysis.collections_by_service.battery_replacement.push(collection.handle);
    }
    if (title.includes('charging') || title.includes('port') || handle.includes('charging')) {
      analysis.collections_by_service.charging_port_repair = analysis.collections_by_service.charging_port_repair || [];
      analysis.collections_by_service.charging_port_repair.push(collection.handle);
    }
  });
  
  return analysis;
}

function generateUpdatedConfig(analysis) {
  log('📝 Generating updated collections configuration...');
  
  const config = {
    collections: [],
    services: [
      {
        name: 'screen_replacement',
        keywords: ['screen', 'lcd', 'display', 'glass', 'assembly']
      },
      {
        name: 'battery_replacement',
        keywords: ['battery', 'batteries']
      },
      {
        name: 'charging_port_repair',
        keywords: ['charging port', 'charging', 'port', 'connector']
      },
      {
        name: 'speaker_repair',
        keywords: ['speaker', 'speakers', 'audio']
      },
      {
        name: 'camera_repair',
        keywords: ['camera', 'cameras', 'lens']
      },
      {
        name: 'microphone_repair',
        keywords: ['microphone', 'mic', 'microphones']
      }
    ],
    pricing: {
      labour_markup: 50,
      tier_multipliers: {
        economy: 0.9,
        standard: 1.0,
        premium: 1.25,
        express: 1.5
      }
    }
  };
  
  // Add mobile collections
  analysis.potential_mobile_collections.forEach(collection => {
    config.collections.push({
      handle: collection.handle,
      brand: 'apple', // Default, will be refined
      device_type: 'mobile',
      category: 'screen_replacement', // Default, will be refined
      products_count: collection.products_count
    });
  });
  
  // Add laptop collections
  analysis.potential_laptop_collections.forEach(collection => {
    config.collections.push({
      handle: collection.handle,
      brand: 'apple', // Default, will be refined
      device_type: 'laptop',
      category: 'screen_replacement', // Default, will be refined
      products_count: collection.products_count
    });
  });
  
  // Add tablet collections
  analysis.potential_tablet_collections.forEach(collection => {
    config.collections.push({
      handle: collection.handle,
      brand: 'apple', // Default, will be refined
      device_type: 'tablet',
      category: 'screen_replacement', // Default, will be refined
      products_count: collection.products_count
    });
  });
  
  return config;
}

async function discoverCollections() {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    // Fetch all collections
    const collections = await fetchAllCollections();
    log(`✅ Discovered ${collections.length} total collections`, 'success');
    
    // Save raw collections data
    await fs.writeFile(DISCOVERED_COLLECTIONS_PATH, JSON.stringify(collections, null, 2));
    log(`💾 Saved raw collections to ${DISCOVERED_COLLECTIONS_PATH}`);
    
    // Analyze collections
    const analysis = analyzeCollections(collections);
    await fs.writeFile(COLLECTIONS_ANALYSIS_PATH, JSON.stringify(analysis, null, 2));
    log(`💾 Saved analysis to ${COLLECTIONS_ANALYSIS_PATH}`);
    
    // Generate updated config
    const updatedConfig = generateUpdatedConfig(analysis);
    const configPath = path.join(process.cwd(), 'scripts/mobileactive/collections-updated.yaml');
    const YAML = require('yaml');
    await fs.writeFile(configPath, YAML.stringify(updatedConfig, null, 2));
    log(`💾 Generated updated config at ${configPath}`);
    
    // Print summary
    printSummary(analysis);
    
    log('🎉 Collection discovery completed successfully!', 'success');
    log(`📁 Raw collections: ${DISCOVERED_COLLECTIONS_PATH}`);
    log(`📁 Analysis: ${COLLECTIONS_ANALYSIS_PATH}`);
    log(`📁 Updated config: ${configPath}`);
    
  } catch (error) {
    log(`❌ Discovery failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

function printSummary(analysis) {
  log('\n📊 COLLECTION DISCOVERY SUMMARY');
  log('===============================');
  log(`Total Collections Found: ${analysis.total_collections}`);
  
  log(`\n📱 Potential Mobile Collections: ${analysis.potential_mobile_collections.length}`);
  analysis.potential_mobile_collections.slice(0, 10).forEach(collection => {
    log(`  ${collection.handle} (${collection.products_count} products) - ${collection.title}`);
  });
  
  log(`\n💻 Potential Laptop Collections: ${analysis.potential_laptop_collections.length}`);
  analysis.potential_laptop_collections.slice(0, 10).forEach(collection => {
    log(`  ${collection.handle} (${collection.products_count} products) - ${collection.title}`);
  });
  
  log(`\n📱 Potential Tablet Collections: ${analysis.potential_tablet_collections.length}`);
  analysis.potential_tablet_collections.slice(0, 10).forEach(collection => {
    log(`  ${collection.handle} (${collection.products_count} products) - ${collection.title}`);
  });
  
  log(`\n🏷️ Collections by Brand:`);
  Object.entries(analysis.collections_by_brand).forEach(([brand, handles]) => {
    log(`  ${brand}: ${handles.length} collections`);
  });
  
  log(`\n🔧 Collections by Service:`);
  Object.entries(analysis.collections_by_service).forEach(([service, handles]) => {
    log(`  ${service}: ${handles.length} collections`);
  });
  
  log(`\n📋 Next Steps:`);
  log(`  1. Review the generated collections-updated.yaml`);
  log(`  2. Refine brand and category mappings`);
  log(`  3. Test with: node scripts/mobileactive/fetch-parts.js`);
}

if (require.main === module) {
  discoverCollections().catch(console.error);
} 