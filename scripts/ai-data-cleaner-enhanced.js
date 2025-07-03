#!/usr/bin/env node

/**
 * Enhanced AI-Powered Data Cleaning System v2.0
 * Strategic focus on Samsung normalization and advanced model extraction
 * 
 * Key Improvements:
 * - Samsung abbreviation expansion (SGN → Samsung Galaxy Note, etc.)
 * - Brand-specific model normalization
 * - Complex multi-device title parsing
 * - Enhanced pattern matching with confidence scoring
 * - Strategic data extraction from messy product titles
 */

const fs = require('fs');
const path = require('path');

// Enhanced Samsung-specific patterns and abbreviations
const SAMSUNG_PATTERNS = {
  abbreviations: {
    'SGN': 'Samsung Galaxy Note',
    'SGA': 'Samsung Galaxy A',
    'SGS': 'Samsung Galaxy S',
    'SGT': 'Samsung Galaxy Tab',
    'SM-': 'Samsung Galaxy'
  },
  series: {
    note: {
      patterns: [
        /(?:SGN|Samsung Galaxy Note?)\s*(\d+)(?:\s*(Lite|Ultra|Plus|5G))?/gi,
        /Note\s*(\d+)(?:\s*(Lite|Ultra|Plus|5G))?/gi
      ],
      normalize: (match) => `Galaxy Note ${match[1]}${match[2] ? ' ' + match[2] : ''}`
    },
    s_series: {
      patterns: [
        /(?:SGS|Samsung Galaxy S)\s*(\d+)(?:\s*(Plus|Ultra|FE|5G))?/gi,
        /Galaxy S\s*(\d+)(?:\s*(Plus|Ultra|FE|5G))?/gi,
        /S(\d+)(?:\s*(Plus|Ultra|FE|5G|e))?(?!\d)/gi
      ],
      normalize: (match) => `Galaxy S${match[1]}${match[2] ? ' ' + match[2] : ''}`
    },
    a_series: {
      patterns: [
        /(?:SGA|Samsung Galaxy A)\s*(\d+)(?:\s*(5G|e))?/gi,
        /Galaxy A\s*(\d+)(?:\s*(5G|e))?/gi,
        /A(\d+)(?:\s*(5G|e))?(?!\d)/gi
      ],
      normalize: (match) => `Galaxy A${match[1]}${match[2] ? ' ' + match[2] : ''}`
    },
    tab: {
      patterns: [
        /(?:SGT|Samsung Galaxy Tab)\s*([A-Z]\d+|S\d+|\d+)/gi,
        /Galaxy Tab\s*([A-Z]\d+|S\d+|\d+)/gi,
        /Tab\s*([A-Z]\d+|S\d+|\d+)/gi
      ],
      normalize: (match) => `Galaxy Tab ${match[1]}`
    }
  }
};

// Enhanced brand patterns with strategic aliases
const ENHANCED_BRAND_PATTERNS = {
  apple: {
    keywords: ['iphone', 'ipad', 'ipod', 'macbook', 'mac', 'apple', 'imac'],
    aliases: ['ip', 'iph'],
    confidence: 0.95,
    deviceIndicators: {
      mobile: ['iphone'],
      tablet: ['ipad'],
      laptop: ['macbook', 'mac', 'imac']
    }
  },
  samsung: {
    keywords: ['samsung', 'galaxy', 'note', 'tab', 'sgn', 'sgs', 'sga', 'sgt', 'sm-'],
    aliases: ['sam', 'galax'],
    confidence: 0.9,
    deviceIndicators: {
      mobile: ['galaxy note', 'galaxy s', 'galaxy a', 'sgn', 'sgs', 'sga'],
      tablet: ['galaxy tab', 'sgt', 'tab'],
      laptop: []
    }
  },
  google: {
    keywords: ['pixel', 'nexus', 'google'],
    aliases: ['pix'],
    confidence: 0.85,
    deviceIndicators: {
      mobile: ['pixel', 'nexus'],
      tablet: ['pixel tablet'],
      laptop: ['chromebook']
    }
  },
  huawei: {
    keywords: ['huawei', 'honor', 'mate', 'nova', 'p30', 'p40'],
    aliases: ['hw'],
    confidence: 0.8,
    deviceIndicators: {
      mobile: ['mate', 'nova', 'p30', 'p40', 'honor'],
      tablet: ['matepad'],
      laptop: ['matebook']
    }
  },
  xiaomi: {
    keywords: ['xiaomi', 'redmi', 'mi', 'poco'],
    aliases: ['xm'],
    confidence: 0.8,
    deviceIndicators: {
      mobile: ['redmi', 'mi', 'poco'],
      tablet: ['mi pad'],
      laptop: ['mi book']
    }
  },
  oneplus: {
    keywords: ['oneplus', 'one plus', 'op'],
    aliases: ['1+'],
    confidence: 0.85,
    deviceIndicators: {
      mobile: ['oneplus', 'one plus'],
      tablet: [],
      laptop: []
    }
  },
  lg: {
    keywords: ['lg', 'v30', 'v40', 'v50', 'g6', 'g7', 'g8'],
    aliases: [],
    confidence: 0.8,
    deviceIndicators: {
      mobile: ['v30', 'v40', 'v50', 'g6', 'g7', 'g8'],
      tablet: [],
      laptop: []
    }
  },
  sony: {
    keywords: ['sony', 'xperia'],
    aliases: [],
    confidence: 0.8,
    deviceIndicators: {
      mobile: ['xperia'],
      tablet: [],
      laptop: []
    }
  },
  oppo: {
    keywords: ['oppo', 'find', 'reno'],
    aliases: [],
    confidence: 0.8,
    deviceIndicators: {
      mobile: ['find', 'reno'],
      tablet: [],
      laptop: []
    }
  },
  vivo: {
    keywords: ['vivo', 'nex'],
    aliases: [],
    confidence: 0.8,
    deviceIndicators: {
      mobile: ['nex'],
      tablet: [],
      laptop: []
    }
  },
  motorola: {
    keywords: ['motorola', 'moto'],
    aliases: ['mot'],
    confidence: 0.8,
    deviceIndicators: {
      mobile: ['moto'],
      tablet: [],
      laptop: []
    }
  },
  nokia: {
    keywords: ['nokia'],
    aliases: [],
    confidence: 0.8,
    deviceIndicators: {
      mobile: ['nokia'],
      tablet: [],
      laptop: []
    }
  }
};

// Enhanced device type patterns with better negative keyword handling
const ENHANCED_DEVICE_TYPE_PATTERNS = {
  mobile: {
    keywords: [
      'iphone', 'phone', 'galaxy note', 'galaxy s', 'galaxy a', 
      'pixel', 'nexus', 'redmi', 'mi', 'mate', 'nova', 'honor', 
      'p30', 'p40', 'oneplus', 'xperia', 'moto', 'g6', 'g7', 'g8', 
      'v30', 'v40', 'v50', 'sgn', 'sgs', 'sga'
    ],
    negative: ['ipad', 'tab', 'tablet', 'macbook', 'laptop', 'book', 'pad'],
    confidence: 0.9
  },
  tablet: {
    keywords: [
      'ipad', 'tab', 'tablet', 'surface', 'galaxy tab', 'sgt', 
      'matepad', 'mi pad'
    ],
    negative: ['iphone', 'phone', 'macbook', 'laptop'],
    confidence: 0.85
  },
  laptop: {
    keywords: [
      'macbook', 'laptop', 'book', 'pro', 'air', 'surface book', 
      'matebook', 'mi book', 'chromebook'
    ],
    negative: ['iphone', 'ipad', 'phone', 'tablet'],
    confidence: 0.8
  }
};

// Enhanced service patterns with more comprehensive coverage
const ENHANCED_SERVICE_PATTERNS = {
  screen_replacement: {
    keywords: [
      'screen', 'display', 'lcd', 'touch', 'digitizer', 'glass', 
      'front', 'oled', 'amoled', 'assembly', 'panel'
    ],
    confidence: 0.9
  },
  battery_replacement: {
    keywords: ['battery', 'batt', 'power', 'cell'],
    confidence: 0.95
  },
  charging_port_repair: {
    keywords: [
      'charging', 'charge', 'port', 'connector', 'dock', 'usb', 
      'lightning', 'type-c', 'cp', 'charger'
    ],
    confidence: 0.9
  },
  camera_repair: {
    keywords: [
      'camera', 'cam', 'lens', 'photo', 'rear', 'front', 'selfie', 
      'back camera', 'front camera'
    ],
    confidence: 0.85
  },
  speaker_repair: {
    keywords: [
      'speaker', 'audio', 'sound', 'earpiece', 'loud', 'loudspeaker', 
      'buzzer'
    ],
    confidence: 0.8
  },
  back_cover_replacement: {
    keywords: [
      'back', 'cover', 'rear', 'housing', 'case', 'shell', 
      'back cover', 'rear cover'
    ],
    confidence: 0.75
  },
  microphone_repair: {
    keywords: ['mic', 'microphone', 'voice'],
    confidence: 0.8
  },
  button_repair: {
    keywords: ['button', 'power', 'volume', 'home', 'key'],
    confidence: 0.7
  }
};

// Advanced text processing utilities
class EnhancedTextProcessor {
  static normalize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static expandSamsungAbbreviations(text) {
    let expanded = text;
    
    // Expand Samsung abbreviations
    Object.entries(SAMSUNG_PATTERNS.abbreviations).forEach(([abbrev, expansion]) => {
      const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
      expanded = expanded.replace(regex, expansion);
    });

    return expanded;
  }

  static extractSamsungModels(text) {
    const expanded = this.expandSamsungAbbreviations(text);
    const models = [];

    Object.entries(SAMSUNG_PATTERNS.series).forEach(([seriesName, seriesConfig]) => {
      seriesConfig.patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(expanded)) !== null) {
          const normalizedModel = seriesConfig.normalize(match);
          if (normalizedModel && !models.includes(normalizedModel)) {
            models.push(normalizedModel);
          }
        }
      });
    });

    return models;
  }

  static extractMultipleDevices(text) {
    // Handle complex titles with multiple devices separated by / or ,
    const deviceSeparators = /[\/,]|\s+or\s+|\s+and\s+/gi;
    const segments = text.split(deviceSeparators);
    
    const devices = [];
    segments.forEach(segment => {
      const trimmed = segment.trim();
      if (trimmed.length > 3) {
        devices.push(trimmed);
      }
    });

    return devices;
  }

  static extractNumbers(text) {
    return text.match(/\d+/g) || [];
  }

  static calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    return (longer.length - this.levenshteinDistance(longer, shorter)) / longer.length;
  }

  static levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

// Enhanced AI Classifier with strategic processing
class EnhancedAIClassifier {
  constructor() {
    this.trainingData = null;
    this.brandPatterns = ENHANCED_BRAND_PATTERNS;
    this.devicePatterns = ENHANCED_DEVICE_TYPE_PATTERNS;
    this.servicePatterns = ENHANCED_SERVICE_PATTERNS;
  }

  trainFromData(validData) {
    console.log(`🧠 Training AI classifier from ${validData.length} valid records...`);
    this.trainingData = validData;
    
    // Build pattern frequency maps
    this.brandFrequency = {};
    this.serviceFrequency = {};
    
    validData.forEach(item => {
      const normalized = EnhancedTextProcessor.normalize(item.product_title);
      
      if (item.brand !== 'unknown') {
        this.brandFrequency[item.brand] = (this.brandFrequency[item.brand] || 0) + 1;
      }
      
      if (item.service_type !== 'unknown') {
        this.serviceFrequency[item.service_type] = (this.serviceFrequency[item.service_type] || 0) + 1;
      }
    });
    
    console.log(`✅ Training complete. Brand patterns: ${Object.keys(this.brandFrequency).length}, Service patterns: ${Object.keys(this.serviceFrequency).length}`);
  }

  detectBrand(title) {
    const normalized = EnhancedTextProcessor.normalize(title);
    const expanded = EnhancedTextProcessor.expandSamsungAbbreviations(title);
    const normalizedExpanded = EnhancedTextProcessor.normalize(expanded);
    
    let bestMatch = null;
    let bestScore = 0;

    Object.entries(this.brandPatterns).forEach(([brand, pattern]) => {
      let score = 0;
      let matches = 0;

      // Check keywords in both original and expanded text
      pattern.keywords.forEach(keyword => {
        if (normalized.includes(keyword) || normalizedExpanded.includes(keyword)) {
          score += pattern.confidence;
          matches++;
        }
      });

      // Check aliases
      pattern.aliases.forEach(alias => {
        if (normalized.includes(alias) || normalizedExpanded.includes(alias)) {
          score += pattern.confidence * 0.8;
          matches++;
        }
      });

      // Bonus for Samsung abbreviations
      if (brand === 'samsung') {
        Object.keys(SAMSUNG_PATTERNS.abbreviations).forEach(abbrev => {
          if (title.toUpperCase().includes(abbrev)) {
            score += 0.9;
            matches++;
          }
        });
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          brand,
          confidence: Math.min(score, 1.0),
          matches,
          expanded: expanded !== title
        };
      }
    });

    return bestMatch || { brand: 'unknown', confidence: 0, matches: 0, expanded: false };
  }

  detectDeviceType(title, brand) {
    const normalized = EnhancedTextProcessor.normalize(title);
    const expanded = EnhancedTextProcessor.expandSamsungAbbreviations(title);
    const normalizedExpanded = EnhancedTextProcessor.normalize(expanded);
    
    let bestMatch = null;
    let bestScore = 0;

    // Use brand-specific device indicators if available
    if (brand && this.brandPatterns[brand] && this.brandPatterns[brand].deviceIndicators) {
      const brandIndicators = this.brandPatterns[brand].deviceIndicators;
      
      Object.entries(brandIndicators).forEach(([deviceType, indicators]) => {
        let score = 0;
        
        indicators.forEach(indicator => {
          if (normalized.includes(indicator) || normalizedExpanded.includes(indicator)) {
            score += 0.9;
          }
        });
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = {
            deviceType,
            confidence: Math.min(score, 1.0),
            source: 'brand_specific'
          };
        }
      });
    }

    // Fallback to general device type patterns
    Object.entries(this.devicePatterns).forEach(([deviceType, pattern]) => {
      let score = 0;
      let negativeScore = 0;

      pattern.keywords.forEach(keyword => {
        if (normalized.includes(keyword) || normalizedExpanded.includes(keyword)) {
          score += pattern.confidence;
        }
      });

      pattern.negative.forEach(negKeyword => {
        if (normalized.includes(negKeyword) || normalizedExpanded.includes(negKeyword)) {
          negativeScore += 0.5;
        }
      });

      const finalScore = Math.max(0, score - negativeScore);

      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestMatch = {
          deviceType,
          confidence: Math.min(finalScore, 1.0),
          source: 'general_patterns'
        };
      }
    });

    return bestMatch || { deviceType: 'unknown', confidence: 0, source: 'none' };
  }

  detectServiceType(title) {
    const normalized = EnhancedTextProcessor.normalize(title);
    
    let bestMatch = null;
    let bestScore = 0;

    Object.entries(this.servicePatterns).forEach(([serviceType, pattern]) => {
      let score = 0;
      let matches = 0;

      pattern.keywords.forEach(keyword => {
        if (normalized.includes(keyword)) {
          score += pattern.confidence;
          matches++;
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          serviceType,
          confidence: Math.min(score, 1.0),
          matches
        };
      }
    });

    return bestMatch || { serviceType: 'screen_replacement', confidence: 0.3, matches: 0 };
  }

  extractModelName(title, brand) {
    const expanded = EnhancedTextProcessor.expandSamsungAbbreviations(title);
    
    // Special handling for Samsung models
    if (brand === 'samsung') {
      const samsungModels = EnhancedTextProcessor.extractSamsungModels(title);
      if (samsungModels.length > 0) {
        return {
          modelName: samsungModels[0], // Take the first/primary model
          confidence: 0.9,
          type: 'samsung_specific',
          allModels: samsungModels
        };
      }
    }

    // Handle multiple device titles
    const deviceSegments = EnhancedTextProcessor.extractMultipleDevices(expanded);
    if (deviceSegments.length > 1) {
      const models = [];
      deviceSegments.forEach(segment => {
        const model = this.extractSingleModel(segment, brand);
        if (model && model !== 'unknown') {
          models.push(model);
        }
      });
      
      if (models.length > 0) {
        return {
          modelName: models[0], // Primary model
          confidence: 0.8,
          type: 'multi_device',
          allModels: models
        };
      }
    }

    // Single model extraction
    const singleModel = this.extractSingleModel(expanded, brand);
    if (singleModel && singleModel !== 'unknown') {
      return {
        modelName: singleModel,
        confidence: 0.7,
        type: 'single_extraction'
      };
    }

    return { modelName: 'unknown', confidence: 0, type: 'none' };
  }

  extractSingleModel(text, brand) {
    const normalized = EnhancedTextProcessor.normalize(text);
    
    // Brand-specific extraction patterns
    const brandPatterns = {
      apple: [
        /iphone\s*(\d{1,2}(?:\s*(?:pro|plus|max|mini))*)/i,
        /ipad\s*(?:(pro|air|mini)\s*)?(\d{1,2}(?:\.\d+)?)/i,
        /macbook\s*(pro|air)?(?:\s*(\d{1,2}))?/i
      ],
      samsung: [
        /galaxy\s*(note|s|a|tab)\s*(\d+)(?:\s*(plus|ultra|fe|lite|5g))?/i,
        /(note|s|a)\s*(\d+)(?:\s*(plus|ultra|fe|lite|5g))?/i
      ],
      google: [
        /pixel\s*(\d+(?:[a-z]+)?)(?:\s*(xl|pro))?/i,
        /nexus\s*(\d+[a-z]?)/i
      ]
    };

    if (brandPatterns[brand]) {
      for (const pattern of brandPatterns[brand]) {
        const match = normalized.match(pattern);
        if (match) {
          return this.normalizeModelName(match[0], brand);
        }
      }
    }

    // Generic number-based extraction
    const numbers = EnhancedTextProcessor.extractNumbers(normalized);
    if (numbers.length > 0) {
      const words = normalized.split(' ');
      const numberWord = words.find(word => /\d/.test(word));
      if (numberWord) {
        return this.normalizeModelName(numberWord, brand);
      }
    }

    return 'unknown';
  }

  normalizeModelName(modelName, brand) {
    let normalized = modelName.toLowerCase().trim();
    
    // Brand-specific normalization
    switch (brand) {
      case 'apple':
        normalized = normalized
          .replace(/iphone\s*/, 'iPhone ')
          .replace(/ipad\s*/, 'iPad ')
          .replace(/macbook\s*/, 'MacBook ');
        break;
      case 'samsung':
        // Ensure "Galaxy" prefix for Samsung models
        if (!normalized.includes('galaxy')) {
          if (normalized.match(/(note|s|a|tab)\s*\d+/)) {
            normalized = 'Galaxy ' + normalized;
          }
        }
        normalized = normalized
          .replace(/samsung\s*/gi, '')
          .replace(/galaxy\s*/gi, 'Galaxy ');
        break;
      case 'google':
        normalized = normalized
          .replace(/google\s*/gi, '')
          .replace(/pixel/gi, 'Pixel');
        break;
    }

    // General normalization
    normalized = normalized
      .replace(/\s+/g, ' ')
      .trim();

    return normalized || 'unknown';
  }
}

// Main enhanced data cleaning function
async function enhancedCleanMobileActiveData() {
  console.log('🚀 Starting Enhanced AI-Powered Data Cleaning v2.0');
  console.log('📋 Strategic Focus: Samsung normalization & advanced model extraction');
  console.log('=' .repeat(70));

  try {
    // Load the data
    console.log('📂 Loading MobileActive data...');
    const inputPath = path.join(__dirname, 'mobileactive/tmp/mobileactive-improved-cleaned.json');
    const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    
    console.log(`📊 Loaded ${rawData.length} products`);

    // Initialize enhanced AI classifier
    const classifier = new EnhancedAIClassifier();
    
    // Train on existing valid data
    const validData = rawData.filter(item => 
      item.is_valid && 
      item.brand !== 'unknown' && 
      item.service_type !== 'unknown'
    );
    
    if (validData.length > 0) {
      classifier.trainFromData(validData);
      console.log(`🎯 Training completed on ${validData.length} valid records`);
    }

    // Enhanced cleaning statistics
    let stats = {
      total: rawData.length,
      improved: 0,
      brandFixed: 0,
      deviceTypeFixed: 0,
      modelFixed: 0,
      samsungExpanded: 0,
      multiDeviceHandled: 0,
      confidence: []
    };

    console.log('\n🔄 Processing products with enhanced AI...');
    console.log('⚡ Focus Areas: Samsung expansion, model extraction, device classification');
    
    // Process each product with enhanced logic
    rawData.forEach((product, index) => {
      if (index % 1000 === 0) {
        console.log(`📈 Progress: ${index}/${rawData.length} (${Math.round(index/rawData.length*100)}%)`);
      }

      const originalBrand = product.brand;
      const originalDeviceType = product.device_type;
      const originalModel = product.model_name;
      let wasImproved = false;

      // Enhanced brand detection
      const brandResult = classifier.detectBrand(product.product_title);
      if (brandResult.brand !== 'unknown' && 
          (product.brand === 'unknown' || brandResult.confidence > 0.8)) {
        product.brand = brandResult.brand;
        if (originalBrand !== product.brand) {
          stats.brandFixed++;
          wasImproved = true;
        }
        if (brandResult.expanded) {
          stats.samsungExpanded++;
        }
      }

      // Enhanced device type detection
      const deviceResult = classifier.detectDeviceType(product.product_title, product.brand);
      if (deviceResult.deviceType !== 'unknown' && 
          (product.device_type === 'unknown' || deviceResult.confidence > 0.7)) {
        product.device_type = deviceResult.deviceType;
        if (originalDeviceType !== product.device_type) {
          stats.deviceTypeFixed++;
          wasImproved = true;
        }
      }

      // Enhanced model extraction
      const modelResult = classifier.extractModelName(product.product_title, product.brand);
      if (modelResult.modelName !== 'unknown' && 
          (product.model_name === 'unknown' || modelResult.confidence > 0.6)) {
        product.model_name = modelResult.modelName;
        if (originalModel !== product.model_name) {
          stats.modelFixed++;
          wasImproved = true;
        }
        if (modelResult.allModels && modelResult.allModels.length > 1) {
          stats.multiDeviceHandled++;
          // Store additional models for reference
          product.additional_models = modelResult.allModels.slice(1);
        }
      }

      // Update enhanced metadata
      product.enhanced_metadata = {
        brand_confidence: brandResult.confidence,
        device_confidence: deviceResult.confidence,
        model_confidence: modelResult.confidence,
        processing_version: '2.0',
        improvements_made: wasImproved
      };

      if (wasImproved) {
        stats.improved++;
        stats.confidence.push({
          brand: brandResult.confidence,
          device: deviceResult.confidence,
          model: modelResult.confidence
        });
      }
    });

    // Calculate average confidence
    const avgConfidence = stats.confidence.length > 0 ? 
      stats.confidence.reduce((sum, conf) => sum + (conf.brand + conf.device + conf.model) / 3, 0) / stats.confidence.length : 0;

    // Save enhanced cleaned data
    const outputPath = path.join(__dirname, 'mobileactive/tmp/mobileactive-enhanced-cleaned.json');
    fs.writeFileSync(outputPath, JSON.stringify(rawData, null, 2));

    // Display comprehensive results
    console.log('\n' + '=' .repeat(70));
    console.log('🎉 ENHANCED CLEANING COMPLETE!');
    console.log('=' .repeat(70));
    
    console.log(`📊 PROCESSING STATISTICS:`);
    console.log(`   Total Products:           ${stats.total.toLocaleString()}`);
    console.log(`   Products Improved:        ${stats.improved.toLocaleString()} (${(stats.improved/stats.total*100).toFixed(1)}%)`);
    console.log(`   Brands Fixed:            ${stats.brandFixed.toLocaleString()}`);
    console.log(`   Device Types Fixed:      ${stats.deviceTypeFixed.toLocaleString()}`);
    console.log(`   Models Fixed:            ${stats.modelFixed.toLocaleString()}`);
    console.log(`   Samsung Expansions:      ${stats.samsungExpanded.toLocaleString()}`);
    console.log(`   Multi-Device Handled:    ${stats.multiDeviceHandled.toLocaleString()}`);
    console.log(`   Average Confidence:      ${(avgConfidence * 100).toFixed(1)}%`);

    // Final data quality analysis
    const finalStats = {
      unknownBrands: rawData.filter(p => p.brand === 'unknown').length,
      unknownDevices: rawData.filter(p => p.device_type === 'unknown').length,
      unknownModels: rawData.filter(p => p.model_name === 'unknown').length,
      samsungProducts: rawData.filter(p => p.brand === 'samsung').length
    };

    console.log(`\n📈 FINAL DATA QUALITY:`);
    console.log(`   Unknown Brands:          ${finalStats.unknownBrands.toLocaleString()} (${(finalStats.unknownBrands/stats.total*100).toFixed(1)}%)`);
    console.log(`   Unknown Device Types:    ${finalStats.unknownDevices.toLocaleString()} (${(finalStats.unknownDevices/stats.total*100).toFixed(1)}%)`);
    console.log(`   Unknown Models:          ${finalStats.unknownModels.toLocaleString()} (${(finalStats.unknownModels/stats.total*100).toFixed(1)}%)`);
    console.log(`   Samsung Products:        ${finalStats.samsungProducts.toLocaleString()}`);

    console.log(`\n✅ Enhanced cleaned data saved to: ${outputPath}`);
    console.log('🚀 Ready for database rebuild with improved data quality!');

  } catch (error) {
    console.error('❌ Enhanced cleaning failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  enhancedCleanMobileActiveData();
}

module.exports = {
  enhancedCleanMobileActiveData,
  EnhancedAIClassifier,
  EnhancedTextProcessor,
  SAMSUNG_PATTERNS,
  ENHANCED_BRAND_PATTERNS
};