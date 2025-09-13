#!/usr/bin/env node

/**
 * Advanced MobileActive Data Cleaning System v3.0
 * Addresses specific data quality issues:
 * - Model contamination by technical codes (QV7, V2, etc.)
 * - Samsung abbreviation expansion (SGN, SGS, G715, etc.)
 * - Multi-device compatibility parsing
 * - Enhanced device type classification
 * - Better brand detection with fallbacks
 * - Improved variant price extraction
 * - Garbage model filtering with blacklist
 * - Better utilization of tags and collection context
 */

const fs = require('fs');
const path = require('path');

// Configuration paths
const RAW_DATA_PATH = path.join(process.cwd(), 'tmp/mobileactive-raw.json');
const ENHANCED_OUTPUT_PATH = path.join(process.cwd(), 'tmp/mobileactive-enhanced-v3.json');
const ENHANCED_CSV_PATH = path.join(process.cwd(), 'tmp/mobileactive-enhanced-v3.csv');
const VALIDATION_REPORT_PATH = path.join(process.cwd(), 'tmp/validation-report-v3.json');

// Logging utility
const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' }[level];
  console.log(`${timestamp} ${emoji} ${message}`);
};

// ============================================================================
// ISSUE 1: Model Contamination - Technical Code Removal
// ============================================================================

const TECHNICAL_CODES = {
  // Quality indicators to remove
  quality_codes: [
    /\b(QV\d+|V\d+|Version\s*\d+)\b/gi,
    /\b(Incell|OLED|LCD|TFT|IPS)\b/gi,
    /\b(Aftermarket|OEM|Original|Premium|Standard|Economy)\b/gi,
    /\b(Assembled|Assembly|Replacement|Compatible)\b/gi,
    /\b(IC\s*Transfer\s*Eligible)\b/gi,
    /\b(Frame\s*Included|Without\s*Frame)\b/gi
  ],
  
  // Bracketed content to remove
  bracketed_content: [
    /\([^)]*QV\d+[^)]*\)/gi,
    /\([^)]*V\d+[^)]*\)/gi,
    /\([^)]*Incell[^)]*\)/gi,
    /\([^)]*Aftermarket[^)]*\)/gi,
    /\([^)]*Premium[^)]*\)/gi,
    /\([^)]*Compatible[^)]*\)/gi,
    /\([^)]*IC\s*Transfer[^)]*\)/gi,
    /\([^)]*Frame[^)]*\)/gi,
    /\([^)]*Year[^)]*\)/gi,
    /\([^)]*\d{4}\)/gi // Remove year in brackets
  ],
  
  // Part descriptors to remove
  part_descriptors: [
    /^(LCD|OLED|Screen|Display|Battery|Charging\s*Port|Speaker|Camera|Microphone)\s*(Assembly|Replacement)?\s*(for|with)?\s*/gi,
    /\s*(Assembly|Replacement|Compatible|Version|Premium|Standard|Economy)\s*$/gi
  ]
};

function removeModelContamination(title) {
  let cleaned = title;
  
  // Remove bracketed content first
  TECHNICAL_CODES.bracketed_content.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Remove quality codes
  TECHNICAL_CODES.quality_codes.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Remove part descriptors
  TECHNICAL_CODES.part_descriptors.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Clean up extra spaces and punctuation
  cleaned = cleaned
    .replace(/\s+/g, ' ')
    .replace(/[,\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned;
}

// ============================================================================
// ISSUE 2: Samsung Abbreviation Expansion
// ============================================================================

const SAMSUNG_MAPPINGS = {
  // Direct abbreviation mappings
  abbreviations: {
    'SGN': 'Samsung Galaxy Note',
    'SGS': 'Samsung Galaxy S',
    'SGA': 'Samsung Galaxy A',
    'SGT': 'Samsung Galaxy Tab',
    'SGJ': 'Samsung Galaxy J',
    'SGM': 'Samsung Galaxy M',
    'SGF': 'Samsung Galaxy F',
    'SM-': 'Samsung Galaxy'
  },
  
  // Model code mappings (G715, J2, A42, etc.)
  model_codes: {
    'G715': 'Galaxy G715',
    'J2': 'Galaxy J2',
    'J3': 'Galaxy J3', 
    'J5': 'Galaxy J5',
    'J7': 'Galaxy J7',
    'A01': 'Galaxy A01',
    'A02': 'Galaxy A02',
    'A03': 'Galaxy A03',
    'A10': 'Galaxy A10',
    'A10e': 'Galaxy A10e',
    'A10s': 'Galaxy A10s',
    'A11': 'Galaxy A11',
    'A12': 'Galaxy A12',
    'A13': 'Galaxy A13',
    'A20': 'Galaxy A20',
    'A20s': 'Galaxy A20s',
    'A21': 'Galaxy A21',
    'A21s': 'Galaxy A21s',
    'A22': 'Galaxy A22',
    'A23': 'Galaxy A23',
    'A30': 'Galaxy A30',
    'A30s': 'Galaxy A30s',
    'A31': 'Galaxy A31',
    'A32': 'Galaxy A32',
    'A33': 'Galaxy A33',
    'A40': 'Galaxy A40',
    'A41': 'Galaxy A41',
    'A42': 'Galaxy A42',
    'A50': 'Galaxy A50',
    'A51': 'Galaxy A51',
    'A52': 'Galaxy A52',
    'A53': 'Galaxy A53',
    'A54': 'Galaxy A54',
    'A70': 'Galaxy A70',
    'A71': 'Galaxy A71',
    'A72': 'Galaxy A72',
    'A73': 'Galaxy A73',
    'A80': 'Galaxy A80',
    'A90': 'Galaxy A90'
  },
  
  // Pattern-based expansion
  patterns: [
    {
      pattern: /\b(SGN|Samsung Galaxy Note)\s*(\d+)(?:\s*(Lite|Ultra|Plus|5G))?\b/gi,
      replacement: 'Galaxy Note $2$3'
    },
    {
      pattern: /\b(SGS|Samsung Galaxy S)\s*(\d+)(?:\s*(Plus|Ultra|FE|5G|e))?\b/gi,
      replacement: 'Galaxy S$2$3'
    },
    {
      pattern: /\b(SGA|Samsung Galaxy A)\s*(\d+)(?:\s*(5G|e|s))?\b/gi,
      replacement: 'Galaxy A$2$3'
    },
    {
      pattern: /\b(SGT|Samsung Galaxy Tab)\s*([A-Z]?\d+)(?:\s*(5G|Plus|Lite))?\b/gi,
      replacement: 'Galaxy Tab $2$3'
    },
    {
      pattern: /\b(SGJ|Samsung Galaxy J)\s*(\d+)(?:\s*(Prime|Pro|Core))?\b/gi,
      replacement: 'Galaxy J$2$3'
    }
  ]
};

function expandSamsungAbbreviations(title) {
  let expanded = title;
  
  // Apply direct abbreviation mappings
  Object.entries(SAMSUNG_MAPPINGS.abbreviations).forEach(([abbrev, full]) => {
    const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
    expanded = expanded.replace(regex, full);
  });
  
  // Apply model code mappings
  Object.entries(SAMSUNG_MAPPINGS.model_codes).forEach(([code, model]) => {
    const regex = new RegExp(`\\b${code}\\b`, 'gi');
    expanded = expanded.replace(regex, model);
  });
  
  // Apply pattern-based expansion
  SAMSUNG_MAPPINGS.patterns.forEach(({pattern, replacement}) => {
    expanded = expanded.replace(pattern, replacement);
  });
  
  return expanded;
}

// ============================================================================
// ISSUE 3: Multi-Device Compatibility Parsing
// ============================================================================

const MULTI_DEVICE_PATTERNS = {
  separators: [
    /\s*\/\s*/g,
    /\s*,\s*/g,
    /\s+and\s+/gi,
    /\s*\|\s*/g,
    /\s*;\s*/g
  ],
  
  compatibility_indicators: [
    /compatible\s+with\s+(.+)/gi,
    /for\s+(.+)/gi,
    /fits\s+(.+)/gi,
    /works\s+with\s+(.+)/gi
  ],
  
  model_patterns: [
    // Samsung models
    /\b(A\d{2,3}[a-z]?)\b/gi,
    /\b(Note\s*\d+(?:\s*Lite|Ultra|Plus|5G)?)\b/gi,
    /\b(S\d+(?:\s*Plus|Ultra|FE|5G|e)?)\b/gi,
    /\b(J\d+(?:\s*Prime|Pro|Core)?)\b/gi,
    /\b(Galaxy\s+[A-Z]\d+)\b/gi,
    
    // iPhone models
    /\b(iPhone\s*\d+(?:\s*Pro\s*Max|Pro|Plus|Mini)?)\b/gi,
    /\b(iPhone\s*SE)\b/gi,
    /\b(iPhone\s*XS?\s*(?:Max)?)\b/gi,
    /\b(iPhone\s*XR)\b/gi,
    
    // iPad models
    /\b(iPad\s*(?:Air|Pro|Mini)?(?:\s*\d+)?)\b/gi,
    
    // Google Pixel
    /\b(Pixel\s*\d+(?:\s*Pro|XL|a)?)\b/gi,
    
    // Other brands
    /\b(OnePlus\s*\d+(?:\s*Pro|T)?)\b/gi,
    /\b(Huawei\s*P\d+)\b/gi,
    /\b(Mate\s*\d+)\b/gi
  ]
};

function parseMultiDeviceTitle(title) {
  const devices = [];
  
  // Check for compatibility indicators
  for (const pattern of MULTI_DEVICE_PATTERNS.compatibility_indicators) {
    const match = title.match(pattern);
    if (match) {
      const compatibilityText = match[1];
      
      // Split by separators
      let deviceList = [compatibilityText];
      MULTI_DEVICE_PATTERNS.separators.forEach(separator => {
        deviceList = deviceList.flatMap(device => {
          if (device && typeof device === 'string') {
            // Convert regex to string for splitting
            const splitPattern = separator instanceof RegExp ? separator.source : separator;
            return device.split(new RegExp(splitPattern));
          }
          return device;
        });
      });
      
      // Extract models from each device
      deviceList.forEach(device => {
        if (device && typeof device === 'string') {
          const cleanDevice = device.trim();
          if (cleanDevice.length > 2) {
            devices.push(cleanDevice);
          }
        }
      });
      
      break;
    }
  }
  
  // If no compatibility indicators found, try to extract models directly
  if (devices.length === 0) {
    MULTI_DEVICE_PATTERNS.model_patterns.forEach(pattern => {
      const matches = title.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (match && typeof match === 'string' && !devices.includes(match)) {
            devices.push(match);
          }
        });
      }
    });
  }
  
  return devices.length > 0 ? devices : [title];
}

// ============================================================================
// ISSUE 4 & 5: Enhanced Brand and Device Type Detection
// ============================================================================

const ENHANCED_BRAND_DETECTION = {
  apple: {
    keywords: ['iphone', 'ipad', 'ipod', 'macbook', 'imac', 'mac', 'apple'],
    aliases: ['ip', 'iph'],
    device_indicators: {
      mobile: ['iphone'],
      tablet: ['ipad', 'ipod'],
      laptop: ['macbook', 'imac', 'mac']
    }
  },
  samsung: {
    keywords: ['samsung', 'galaxy', 'note', 'sgn', 'sgs', 'sga', 'sgt', 'sgj', 'sgm'],
    aliases: ['sam', 'galax'],
    device_indicators: {
      mobile: ['galaxy note', 'galaxy s', 'galaxy a', 'galaxy j', 'galaxy m', 'galaxy f'],
      tablet: ['galaxy tab', 'tab'],
      laptop: ['galaxy book', 'chromebook']
    }
  },
  google: {
    keywords: ['pixel', 'nexus', 'google', 'chromebook'],
    aliases: ['pix'],
    device_indicators: {
      mobile: ['pixel', 'nexus'],
      tablet: ['pixel tablet', 'nexus tablet'],
      laptop: ['chromebook', 'pixelbook']
    }
  },
  huawei: {
    keywords: ['huawei', 'honor', 'mate', 'nova', 'p10', 'p20', 'p30', 'p40', 'p50'],
    aliases: ['hw'],
    device_indicators: {
      mobile: ['mate', 'nova', 'p10', 'p20', 'p30', 'p40', 'p50', 'honor'],
      tablet: ['matepad', 'mediapad'],
      laptop: ['matebook']
    }
  },
  xiaomi: {
    keywords: ['xiaomi', 'redmi', 'mi', 'poco', 'mix'],
    aliases: ['xm'],
    device_indicators: {
      mobile: ['redmi', 'mi', 'poco', 'mix'],
      tablet: ['mi pad', 'redmi pad'],
      laptop: ['mi book', 'redmi book']
    }
  },
  oneplus: {
    keywords: ['oneplus', 'one plus', 'op'],
    aliases: ['1+'],
    device_indicators: {
      mobile: ['oneplus', 'one plus'],
      tablet: [],
      laptop: []
    }
  },
  oppo: {
    keywords: ['oppo', 'find', 'reno', 'f11', 'f15', 'f17', 'f19'],
    aliases: [],
    device_indicators: {
      mobile: ['find', 'reno', 'f11', 'f15', 'f17', 'f19'],
      tablet: [],
      laptop: []
    }
  },
  vivo: {
    keywords: ['vivo', 'nex', 'v15', 'v17', 'v19', 'v20', 'v21'],
    aliases: [],
    device_indicators: {
      mobile: ['nex', 'v15', 'v17', 'v19', 'v20', 'v21'],
      tablet: [],
      laptop: []
    }
  },
  lg: {
    keywords: ['lg', 'v30', 'v40', 'v50', 'v60', 'g6', 'g7', 'g8', 'stylo'],
    aliases: [],
    device_indicators: {
      mobile: ['v30', 'v40', 'v50', 'v60', 'g6', 'g7', 'g8', 'stylo'],
      tablet: ['g pad'],
      laptop: ['gram']
    }
  },
  motorola: {
    keywords: ['motorola', 'moto', 'razr', 'edge'],
    aliases: ['mot'],
    device_indicators: {
      mobile: ['moto', 'razr', 'edge'],
      tablet: [],
      laptop: []
    }
  },
  nokia: {
    keywords: ['nokia', 'lumia'],
    aliases: [],
    device_indicators: {
      mobile: ['nokia', 'lumia'],
      tablet: [],
      laptop: []
    }
  },
  sony: {
    keywords: ['sony', 'xperia'],
    aliases: [],
    device_indicators: {
      mobile: ['xperia'],
      tablet: ['xperia tablet'],
      laptop: ['vaio']
    }
  }
};

function detectBrandWithFallback(product) {
  const title = (product.title || '').toLowerCase();
  const tags = (product.tags || []).map(tag => tag.toLowerCase());
  const vendor = (product.vendor || '').toLowerCase();
  const collection = (product.__meta?.collection_title || '').toLowerCase();
  
  // Combine all text sources
  const allText = [title, ...tags, vendor, collection].filter(Boolean);
  
  // Check each brand
  for (const [brand, config] of Object.entries(ENHANCED_BRAND_DETECTION)) {
    let score = 0;
    
    // Check keywords in all text sources
    allText.forEach(text => {
      config.keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          score += 2; // Primary keywords get higher score
        }
      });
      
      config.aliases.forEach(alias => {
        if (text.includes(alias)) {
          score += 1; // Aliases get lower score
        }
      });
    });
    
    // Brand detected if score is high enough
    if (score >= 2) {
      return { brand, confidence: Math.min(score / 4, 1) };
    }
  }
  
  return { brand: 'unknown', confidence: 0 };
}

function detectDeviceTypeWithFallback(product, detectedBrand) {
  const title = (product.title || '').toLowerCase();
  const tags = (product.tags || []).map(tag => tag.toLowerCase());
  const collection = (product.__meta?.collection_title || '').toLowerCase();
  
  // Combine all text sources
  const allText = [title, ...tags, collection].filter(Boolean);
  
  // Use brand-specific indicators first
  if (detectedBrand !== 'unknown' && ENHANCED_BRAND_DETECTION[detectedBrand]) {
    const brandConfig = ENHANCED_BRAND_DETECTION[detectedBrand];
    
    for (const [deviceType, indicators] of Object.entries(brandConfig.device_indicators)) {
      for (const text of allText) {
        for (const indicator of indicators) {
          if (text.includes(indicator)) {
            return { device_type: deviceType, confidence: 0.9 };
          }
        }
      }
    }
  }
  
  // Generic device type detection
  for (const text of allText) {
    // Mobile indicators
    if (text.includes('phone') || text.includes('mobile') || 
        text.includes('smartphone') || text.includes('cellular')) {
      return { device_type: 'mobile', confidence: 0.8 };
    }
    
    // Tablet indicators
    if (text.includes('tablet') || text.includes('pad') || 
        text.includes('tab') && !text.includes('laptop')) {
      return { device_type: 'tablet', confidence: 0.8 };
    }
    
    // Laptop indicators
    if (text.includes('laptop') || text.includes('notebook') || 
        text.includes('book') || text.includes('macbook') || 
        text.includes('chromebook')) {
      return { device_type: 'laptop', confidence: 0.8 };
    }
  }
  
  return { device_type: 'unknown', confidence: 0 };
}

// ============================================================================
// ISSUE 6: Improved Variant Price Extraction
// ============================================================================

function extractBestPrice(product) {
  const variants = product.variants || [];
  
  if (variants.length === 0) {
    return { price: 0, source: 'no_variants' };
  }
  
  // Priority order: available > cheapest > first
  
  // 1. Try to find available variants
  const availableVariants = variants.filter(v => v.available);
  if (availableVariants.length > 0) {
    const prices = availableVariants.map(v => parseFloat(v.price || 0)).filter(p => p > 0);
    if (prices.length > 0) {
      return { price: Math.min(...prices), source: 'available_variant' };
    }
  }
  
  // 2. Try all variants (including unavailable)
  const allPrices = variants.map(v => parseFloat(v.price || 0)).filter(p => p > 0);
  if (allPrices.length > 0) {
    return { price: Math.min(...allPrices), source: 'any_variant' };
  }
  
  // 3. Check compare_at_price as fallback
  const compareAtPrices = variants.map(v => parseFloat(v.compare_at_price || 0)).filter(p => p > 0);
  if (compareAtPrices.length > 0) {
    return { price: Math.min(...compareAtPrices), source: 'compare_at_price' };
  }
  
  return { price: 0, source: 'no_valid_price' };
}

// ============================================================================
// ISSUE 7: Garbage Model Value Filtering
// ============================================================================

const MODEL_BLACKLIST = {
  // Technical codes
  technical: ['QV7', 'QV6', 'QV8', 'QV9', 'QV10', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'],
  
  // Generic identifiers
  generic: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'CE2', 'CE3', 'T1', 'T2', 'T3'],
  
  // Google part numbers
  google_parts: ['35G00263', '35H00261', '35G00262', '35G00264', '35G00265', '35G00266'],
  
  // Years
  years: ['2020', '2021', '2022', '2023', '2024', '2025'],
  
  // Quality indicators
  quality: ['Premium', 'Standard', 'Economy', 'Original', 'Aftermarket', 'Compatible'],
  
  // Part types
  part_types: ['LCD', 'OLED', 'Battery', 'Screen', 'Display', 'Assembly', 'Replacement'],
  
  // Colors
  colors: ['Black', 'White', 'Blue', 'Red', 'Green', 'Gold', 'Silver', 'Rose', 'Gray', 'Grey']
};

function isValidModelName(modelName) {
  if (!modelName || typeof modelName !== 'string') {
    return false;
  }
  
  const cleaned = modelName.trim();
  
  // Check minimum length
  if (cleaned.length < 2) {
    return false;
  }
  
  // Check against blacklists
  const allBlacklisted = Object.values(MODEL_BLACKLIST).flat();
  if (allBlacklisted.some(blacklisted => 
    cleaned.toLowerCase() === blacklisted.toLowerCase())) {
    return false;
  }
  
  // Check if it's just numbers
  if (/^\d+$/.test(cleaned)) {
    return false;
  }
  
  // Check if it's just letters (too generic)
  if (/^[a-zA-Z]+$/.test(cleaned) && cleaned.length < 3) {
    return false;
  }
  
  return true;
}

// ============================================================================
// ISSUE 8: Service Type Detection
// ============================================================================

const SERVICE_TYPE_PATTERNS = {
  screen_replacement: {
    keywords: ['screen', 'lcd', 'oled', 'display', 'glass', 'assembly', 'digitizer', 'touch'],
    negative: ['battery', 'camera', 'speaker', 'microphone', 'charging', 'port', 'cover'],
    priority: 1
  },
  battery_replacement: {
    keywords: ['battery', 'batteries', 'cell', 'power'],
    negative: ['screen', 'camera', 'speaker', 'microphone', 'charging', 'port', 'cover'],
    priority: 2
  },
  camera_repair: {
    keywords: ['camera', 'lens', 'back camera', 'front camera', 'bc-', 'fc-'],
    negative: ['screen', 'battery', 'speaker', 'microphone', 'charging', 'port', 'cover'],
    priority: 3
  },
  charging_port_repair: {
    keywords: ['charging port', 'charging', 'port', 'connector', 'usb', 'cp-'],
    negative: ['screen', 'battery', 'camera', 'speaker', 'microphone', 'cover'],
    priority: 4
  },
  speaker_repair: {
    keywords: ['speaker', 'loudspeaker', 'buzzer', 'earpiece', 'audio'],
    negative: ['screen', 'battery', 'camera', 'microphone', 'charging', 'port', 'cover'],
    priority: 5
  },
  microphone_repair: {
    keywords: ['microphone', 'mic', 'voice'],
    negative: ['screen', 'battery', 'camera', 'speaker', 'charging', 'port', 'cover'],
    priority: 6
  },
  back_cover_replacement: {
    keywords: ['back cover', 'back housing', 'housing', 'cover', 'case'],
    negative: ['screen', 'battery', 'camera', 'speaker', 'microphone', 'charging', 'port'],
    priority: 7
  }
};

function detectServiceType(product) {
  const title = (product.title || '').toLowerCase();
  const tags = (product.tags || []).map(tag => tag.toLowerCase());
  const sku = (product.variants?.[0]?.sku || '').toLowerCase();
  
  const allText = [title, ...tags, sku].filter(Boolean);
  
  let bestMatch = { service: 'unknown', confidence: 0, priority: 999 };
  
  for (const [service, config] of Object.entries(SERVICE_TYPE_PATTERNS)) {
    let hasKeyword = false;
    let hasNegative = false;
    
    // Check for keywords
    for (const text of allText) {
      if (config.keywords.some(keyword => text.includes(keyword))) {
        hasKeyword = true;
        break;
      }
    }
    
    // Check for negative keywords
    for (const text of allText) {
      if (config.negative.some(negative => text.includes(negative))) {
        hasNegative = true;
        break;
      }
    }
    
    // Calculate confidence
    if (hasKeyword && !hasNegative) {
      const confidence = 0.9;
      if (confidence > bestMatch.confidence || 
          (confidence === bestMatch.confidence && config.priority < bestMatch.priority)) {
        bestMatch = { service, confidence, priority: config.priority };
      }
    }
  }
  
  return bestMatch;
}

// ============================================================================
// ENHANCED MODEL EXTRACTION
// ============================================================================

function extractEnhancedModelName(product, brand) {
  let title = product.title || '';
  const tags = product.tags || [];
  const collection = product.__meta?.collection_title || '';
  
  // Step 1: Try extraction on original title first (before contamination removal)
  let modelName = extractModelFromText(title, brand);
  
  // Step 2: If Samsung, expand abbreviations and try again
  if (brand === 'samsung' && (!isValidModelName(modelName) || modelName === 'unknown')) {
    const expandedTitle = expandSamsungAbbreviations(title);
    modelName = extractModelFromText(expandedTitle, brand);
  }
  
  // Step 3: Try with contamination removed if still not found
  if (!isValidModelName(modelName) || modelName === 'unknown') {
    const cleanedTitle = removeModelContamination(title);
    modelName = extractModelFromText(cleanedTitle, brand);
  }
  
  // Step 4: Parse multi-device titles
  if (!isValidModelName(modelName) || modelName === 'unknown') {
    const devices = parseMultiDeviceTitle(title);
    for (const device of devices) {
      const deviceModel = extractModelFromText(device, brand);
      if (isValidModelName(deviceModel) && deviceModel !== 'unknown') {
        modelName = deviceModel;
        break;
      }
    }
  }
  
  // Step 5: Fallback to tags if model not found
  if (!isValidModelName(modelName) || modelName === 'unknown') {
    for (const tag of tags) {
      const tagModel = extractModelFromText(tag, brand);
      if (isValidModelName(tagModel) && tagModel !== 'unknown') {
        modelName = tagModel;
        break;
      }
    }
  }
  
  // Step 6: Fallback to collection if model still not found
  if (!isValidModelName(modelName) || modelName === 'unknown') {
    const collectionModel = extractModelFromText(collection, brand);
    if (isValidModelName(collectionModel) && collectionModel !== 'unknown') {
      modelName = collectionModel;
    }
  }
  
  // Step 7: Final cleanup and validation
  if (isValidModelName(modelName) && modelName !== 'unknown') {
    return cleanModelName(modelName, brand);
  }
  
  return 'unknown';
}

function extractModelFromText(text, brand) {
  if (!text) return 'unknown';
  
  const patterns = getModelPatternsForBrand(brand);
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let modelName = match[1] || match[0];
      
      // Clean up the extracted model name
      modelName = modelName.replace(/^(Galaxy|iPhone|iPad|MacBook|Pixel|Mi|Redmi|OnePlus|One Plus)\s+/i, '');
      return modelName.trim();
    }
  }
  
  return 'unknown';
}

function getModelPatternsForBrand(brand) {
  const patterns = {
    apple: [
      /iPhone\s+(\d+(?:\s+Pro\s+Max|\s+Pro|\s+Plus|\s+Mini)?)/i,
      /iPad\s+(Air(?:\s+\d+)?|Pro(?:\s+\d+)?|Mini(?:\s+\d+)?|\d+(?:th\s+Gen)?)/i,
      /MacBook\s+(Air|Pro)(?:\s+\d+)?/i,
      /iPhone\s+(SE(?:\s+\d+)?)/i,
      /iPhone\s+(XS?\s*(?:Max)?|XR)/i,
      /\b(\d+)(?:\s+Pro\s+Max|\s+Pro|\s+Plus|\s+Mini)?\b/i, // Just numbers for iPhones
      /\biPad\s+(\d+)/i // iPad with number
    ],
    samsung: [
      /Galaxy\s+(Note\s+\d+(?:\s+Lite|Ultra|Plus|5G)?)/i,
      /Galaxy\s+(S\d+(?:\s+Plus|Ultra|FE|5G|e)?)/i,
      /Galaxy\s+(A\d+(?:\s+5G|e|s)?)/i,
      /Galaxy\s+(J\d+(?:\s+Prime|Pro|Core)?)/i,
      /Galaxy\s+(Tab\s+[A-Z]?\d+(?:\s+5G|Plus|Lite)?)/i,
      /Galaxy\s+(Z\s+Flip\s+\d+|Z\s+Fold\s+\d+)/i,
      /\b(Note\s+\d+(?:\s+Lite|Ultra|Plus|5G)?)/i, // Note without Galaxy
      /\b(S\d+(?:\s+Plus|Ultra|FE|5G|e)?)/i, // S series without Galaxy
      /\b(A\d+(?:\s+5G|e|s)?)/i, // A series without Galaxy
      /\b(G\d+)/i // G series like G715
    ],
    google: [
      /Pixel\s+(\d+(?:\s+Pro|\s+XL|\s+a)?)/i,
      /Nexus\s+(\d+[a-zA-Z]?)/i,
      /\b(\d+(?:\s+Pro|\s+XL|\s+a)?)\b/i // Just numbers for Pixels
    ],
    huawei: [
      /Mate\s+(\d+(?:\s+Pro)?)/i,
      /P(\d+(?:\s+Pro)?)/i,
      /Nova\s+(\d+)/i,
      /Honor\s+(\d+)/i
    ],
    xiaomi: [
      /Mi\s+(\d+(?:\s+Pro)?)/i,
      /Redmi\s+(Note\s+\d+|A\d+|\d+)/i,
      /Poco\s+([A-Z]\d+)/i
    ],
    oneplus: [
      /OnePlus\s+(\d+(?:\s+Pro|\s+T)?)/i,
      /One\s+Plus\s+(\d+(?:\s+Pro|\s+T)?)/i,
      /\b(\d+(?:\s+Pro|\s+T)?)\b/i // Just numbers for OnePlus
    ]
  };
  
  return patterns[brand] || [
    // Generic fallback patterns
    /\b([A-Z]\d+[a-zA-Z]*)\b/i,
    /\b([\w\s]+\d+[\w\s]*)\b/i
  ];
}

function cleanModelName(modelName, brand) {
  let cleaned = modelName.trim();
  
  // Remove common prefixes
  cleaned = cleaned.replace(/^(Galaxy|iPhone|iPad|MacBook|Pixel|Mi|Redmi|OnePlus|One Plus)\s+/i, '');
  
  // Clean up spacing
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // Add brand prefix back for consistency
  const brandPrefixes = {
    apple: (model) => {
      if (model.match(/^\d+/)) return `iPhone ${model}`;
      if (model.match(/^(Air|Pro|Mini)/)) return `iPad ${model}`;
      return model;
    },
    samsung: (model) => `Galaxy ${model}`,
    google: (model) => `Pixel ${model}`,
    huawei: (model) => model,
    xiaomi: (model) => model,
    oneplus: (model) => `OnePlus ${model}`
  };
  
  if (brandPrefixes[brand]) {
    cleaned = brandPrefixes[brand](cleaned);
  }
  
  return cleaned;
}

// ============================================================================
// MAIN CLEANING FUNCTION
// ============================================================================

function cleanProduct(product) {
  // Extract brand with fallback
  const brandResult = detectBrandWithFallback(product);
  
  // Extract device type with fallback
  const deviceResult = detectDeviceTypeWithFallback(product, brandResult.brand);
  
  // Extract service type
  const serviceResult = detectServiceType(product);
  
  // Extract price with improved logic
  const priceResult = extractBestPrice(product);
  
  // Extract enhanced model name
  const modelName = extractEnhancedModelName(product, brandResult.brand);
  
  // Validation
  const validationIssues = [];
  
  if (brandResult.brand === 'unknown') {
    validationIssues.push('Could not detect brand');
  }
  
  if (deviceResult.device_type === 'unknown') {
    validationIssues.push('Could not detect device type');
  }
  
  if (serviceResult.service === 'unknown') {
    validationIssues.push('Could not detect service type');
  }
  
  if (!isValidModelName(modelName)) {
    validationIssues.push('Invalid or garbage model name');
  }
  
  if (priceResult.price <= 0) {
    validationIssues.push('Invalid or missing price');
  }
  
  return {
    // Original data
    product_id: product.id,
    product_title: product.title,
    product_handle: product.handle,
    sku: product.variants?.[0]?.sku || '',
    raw_title: product.title,
    source_collection: product.__meta?.collection_title || '',
    tags: product.tags || [],
    
    // Cleaned data
    clean_brand: brandResult.brand,
    clean_model: modelName,
    clean_type: deviceResult.device_type,
    service_type: serviceResult.service,
    price: priceResult.price,
    
    // Metadata
    brand_confidence: brandResult.confidence,
    device_confidence: deviceResult.confidence,
    service_confidence: serviceResult.confidence,
    price_source: priceResult.source,
    
    // Validation
    is_valid: validationIssues.length === 0,
    validation_issues: validationIssues,
    
    // Enhanced metadata
    processing_version: '3.0',
    enhanced_features: {
      contamination_removed: true,
      samsung_expanded: brandResult.brand === 'samsung',
      multi_device_parsed: true,
      fallback_used: brandResult.confidence < 0.8 || deviceResult.confidence < 0.8,
      garbage_filtered: true
    }
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function runAdvancedCleaning() {
  log('🚀 Starting Advanced MobileActive Data Cleaning v3.0...');
  
  try {
    // Load raw data
    log('📥 Loading raw data...');
    const rawData = JSON.parse(await fs.promises.readFile(RAW_DATA_PATH, 'utf8'));
    log(`✅ Loaded ${rawData.length} raw products`);
    
    // Clean products
    log('🧹 Cleaning products...');
    const cleanedProducts = rawData.map(product => cleanProduct(product));
    
    // Generate statistics
    const stats = generateStatistics(cleanedProducts);
    log('📊 Cleaning statistics:', 'info');
    console.log(JSON.stringify(stats, null, 2));
    
    // Filter valid products
    const validProducts = cleanedProducts.filter(p => p.is_valid);
    
    // Save cleaned data
    log('💾 Saving cleaned data...');
    await fs.promises.writeFile(ENHANCED_OUTPUT_PATH, JSON.stringify(cleanedProducts, null, 2));
    
    // Generate CSV
    log('📄 Generating CSV...');
    await generateEnhancedCSV(validProducts);
    
    // Generate validation report
    log('📋 Generating validation report...');
    await generateValidationReport(cleanedProducts, stats);
    
    log('🎉 Advanced cleaning completed successfully!', 'success');
    log(`📁 Enhanced JSON: ${ENHANCED_OUTPUT_PATH}`);
    log(`📁 Enhanced CSV: ${ENHANCED_CSV_PATH}`);
    log(`📁 Validation Report: ${VALIDATION_REPORT_PATH}`);
    
  } catch (error) {
    log(`❌ Cleaning failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

function generateStatistics(products) {
  const total = products.length;
  const valid = products.filter(p => p.is_valid).length;
  const invalid = total - valid;
  
  const brandStats = {};
  const deviceStats = {};
  const serviceStats = {};
  const validationIssues = {};
  
  products.forEach(product => {
    // Brand statistics
    brandStats[product.clean_brand] = (brandStats[product.clean_brand] || 0) + 1;
    
    // Device statistics  
    deviceStats[product.clean_type] = (deviceStats[product.clean_type] || 0) + 1;
    
    // Service statistics
    serviceStats[product.service_type] = (serviceStats[product.service_type] || 0) + 1;
    
    // Validation issues
    product.validation_issues.forEach(issue => {
      validationIssues[issue] = (validationIssues[issue] || 0) + 1;
    });
  });
  
  return {
    summary: {
      total_products: total,
      valid_products: valid,
      invalid_products: invalid,
      validation_rate: `${((valid / total) * 100).toFixed(2)}%`
    },
    brand_distribution: brandStats,
    device_distribution: deviceStats,
    service_distribution: serviceStats,
    validation_issues: validationIssues,
    improvements: {
      samsung_expanded: products.filter(p => p.enhanced_features.samsung_expanded).length,
      contamination_removed: products.filter(p => p.enhanced_features.contamination_removed).length,
      multi_device_parsed: products.filter(p => p.enhanced_features.multi_device_parsed).length,
      fallback_used: products.filter(p => p.enhanced_features.fallback_used).length,
      garbage_filtered: products.filter(p => p.enhanced_features.garbage_filtered).length
    }
  };
}

async function generateEnhancedCSV(products) {
  const headers = [
    'Product ID',
    'Clean Brand',
    'Clean Model', 
    'Clean Type',
    'Service Type',
    'Price',
    'Brand Confidence',
    'Device Confidence',
    'Service Confidence',
    'Price Source',
    'Raw Title',
    'Source Collection',
    'Tags',
    'SKU',
    'Validation Issues'
  ];
  
  const rows = products.map(product => [
    product.product_id,
    product.clean_brand,
    product.clean_model,
    product.clean_type,
    product.service_type,
    product.price,
    product.brand_confidence,
    product.device_confidence,
    product.service_confidence,
    product.price_source,
    `"${product.raw_title}"`,
    `"${product.source_collection}"`,
    `"${product.tags.join(', ')}"`,
    product.sku,
    `"${product.validation_issues.join(', ')}"`
  ]);
  
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  await fs.promises.writeFile(ENHANCED_CSV_PATH, csvContent);
}

async function generateValidationReport(products, stats) {
  const report = {
    generation_time: new Date().toISOString(),
    version: '3.0',
    summary: stats.summary,
    detailed_analysis: {
      brand_analysis: stats.brand_distribution,
      device_analysis: stats.device_distribution,
      service_analysis: stats.service_distribution,
      validation_issues: stats.validation_issues,
      improvements_applied: stats.improvements
    },
    quality_metrics: {
      model_extraction_success: `${(((stats.summary.total_products - (stats.validation_issues['Invalid or garbage model name'] || 0)) / stats.summary.total_products) * 100).toFixed(1)}%`,
      brand_detection_success: `${(((stats.summary.total_products - (stats.validation_issues['Could not detect brand'] || 0)) / stats.summary.total_products) * 100).toFixed(1)}%`,
      device_classification_success: `${(((stats.summary.total_products - (stats.validation_issues['Could not detect device type'] || 0)) / stats.summary.total_products) * 100).toFixed(1)}%`,
      service_detection_success: `${(((stats.summary.total_products - (stats.validation_issues['Could not detect service type'] || 0)) / stats.summary.total_products) * 100).toFixed(1)}%`,
      price_extraction_success: `${(((stats.summary.total_products - (stats.validation_issues['Invalid or missing price'] || 0)) / stats.summary.total_products) * 100).toFixed(1)}%`
    },
    recommendations: [
      'Review products with unknown brands for potential pattern improvements',
      'Verify device type classifications for accuracy',
      'Check service type detection for edge cases',
      'Validate model names against known device lists',
      'Consider expanding abbreviation mappings based on remaining unknown models'
    ]
  };
  
  await fs.promises.writeFile(VALIDATION_REPORT_PATH, JSON.stringify(report, null, 2));
}

// Run the cleaning process
if (require.main === module) {
  runAdvancedCleaning();
}

module.exports = {
  cleanProduct,
  removeModelContamination,
  expandSamsungAbbreviations,
  parseMultiDeviceTitle,
  detectBrandWithFallback,
  detectDeviceTypeWithFallback,
  extractBestPrice,
  isValidModelName,
  extractEnhancedModelName
}; 