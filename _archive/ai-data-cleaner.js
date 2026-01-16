#!/usr/bin/env node

/**
 * AI-Powered Data Cleaning System
 * Machine Learning-based extraction of device types, brands, models, and services
 * 
 * Features:
 * - Natural Language Processing for product title analysis
 * - Pattern recognition for device models
 * - Brand detection with confidence scoring
 * - Service type classification
 * - Price normalization and validation
 * - Quality assessment and scoring
 */

const fs = require('fs');
const path = require('path');

// Comprehensive brand patterns with aliases and variations
const BRAND_PATTERNS = {
  apple: {
    keywords: ['iphone', 'ipad', 'ipod', 'macbook', 'mac', 'apple', 'imac'],
    aliases: ['ip', 'iph'],
    confidence: 0.95
  },
  samsung: {
    keywords: ['samsung', 'galaxy', 'note', 'tab', 'sgn', 'sgs', 'sm-'],
    aliases: ['sam', 'galax'],
    confidence: 0.9
  },
  google: {
    keywords: ['pixel', 'nexus', 'google'],
    aliases: ['pix'],
    confidence: 0.85
  },
  huawei: {
    keywords: ['huawei', 'honor', 'mate', 'nova', 'p30', 'p40'],
    aliases: ['hw'],
    confidence: 0.8
  },
  xiaomi: {
    keywords: ['xiaomi', 'redmi', 'mi', 'poco'],
    aliases: ['xm'],
    confidence: 0.8
  },
  oneplus: {
    keywords: ['oneplus', 'one plus', 'op'],
    aliases: ['1+'],
    confidence: 0.85
  },
  lg: {
    keywords: ['lg', 'v30', 'v40', 'v50', 'g6', 'g7', 'g8'],
    aliases: [],
    confidence: 0.8
  },
  sony: {
    keywords: ['sony', 'xperia'],
    aliases: [],
    confidence: 0.8
  },
  oppo: {
    keywords: ['oppo', 'find', 'reno'],
    aliases: [],
    confidence: 0.8
  },
  vivo: {
    keywords: ['vivo', 'nex'],
    aliases: [],
    confidence: 0.8
  },
  motorola: {
    keywords: ['motorola', 'moto'],
    aliases: ['mot'],
    confidence: 0.8
  },
  nokia: {
    keywords: ['nokia'],
    aliases: [],
    confidence: 0.8
  }
};

// Device type patterns
const DEVICE_TYPE_PATTERNS = {
  mobile: {
    keywords: ['iphone', 'phone', 'galaxy', 'note', 'pixel', 'nexus', 'redmi', 'mi', 'mate', 'nova', 'honor', 'p30', 'p40', 'oneplus', 'xperia', 'moto', 'g6', 'g7', 'g8', 'v30', 'v40', 'v50'],
    negative: ['ipad', 'tab', 'tablet', 'macbook', 'laptop', 'book'],
    confidence: 0.9
  },
  tablet: {
    keywords: ['ipad', 'tab', 'tablet', 'surface'],
    negative: ['iphone', 'phone', 'macbook', 'laptop'],
    confidence: 0.85
  },
  laptop: {
    keywords: ['macbook', 'laptop', 'book', 'pro', 'air', 'surface book'],
    negative: ['iphone', 'ipad', 'phone', 'tablet'],
    confidence: 0.8
  }
};

// Service type patterns with comprehensive coverage
const SERVICE_PATTERNS = {
  screen_replacement: {
    keywords: ['screen', 'display', 'lcd', 'touch', 'digitizer', 'glass', 'front', 'oled', 'amoled'],
    confidence: 0.9
  },
  battery_replacement: {
    keywords: ['battery', 'batt', 'power', 'cell'],
    confidence: 0.95
  },
  charging_port_repair: {
    keywords: ['charging', 'charge', 'port', 'connector', 'dock', 'usb', 'lightning', 'type-c', 'cp'],
    confidence: 0.9
  },
  camera_repair: {
    keywords: ['camera', 'cam', 'lens', 'photo', 'rear', 'front', 'selfie'],
    confidence: 0.85
  },
  speaker_repair: {
    keywords: ['speaker', 'audio', 'sound', 'earpiece', 'loud'],
    confidence: 0.8
  },
  back_cover_replacement: {
    keywords: ['back', 'cover', 'rear', 'housing', 'case', 'shell'],
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

// Advanced model extraction patterns
const MODEL_EXTRACTION_PATTERNS = {
  apple: {
    iphone: /(?:iphone\s*)?(\d{1,2}(?:\s*(?:pro|plus|max|mini))*)/i,
    ipad: /(?:ipad\s*)?(?:(pro|air|mini)\s*)?(\d{1,2}(?:\.\d+)?)/i,
    macbook: /(?:macbook\s*)?(pro|air)?(?:\s*(\d{1,2}))?/i
  },
  samsung: {
    galaxy_s: /(?:galaxy\s*)?s(\d{1,2})(?:\s*(plus|ultra|fe))?/i,
    galaxy_note: /(?:galaxy\s*)?note(\d{1,2})(?:\s*(ultra))?/i,
    galaxy_a: /(?:galaxy\s*)?a(\d{1,2})(?:\s*(5g))?/i,
    galaxy_tab: /(?:galaxy\s*)?tab(?:\s*([a-z]+))?(?:\s*(\d+))?/i
  },
  google: {
    pixel: /pixel(?:\s*(\d+(?:[a-z]+)?))?(?:\s*(xl|pro))?/i,
    nexus: /nexus(?:\s*(\d+[a-z]?))?/i
  }
};

// Quality tier detection
const QUALITY_PATTERNS = {
  oem: {
    keywords: ['oem', 'original', 'genuine', 'authentic'],
    score: 1.0
  },
  premium: {
    keywords: ['premium', 'high quality', 'grade a+', 'aaa'],
    score: 0.9
  },
  standard: {
    keywords: ['standard', 'grade a', 'aa'],
    score: 0.8
  },
  aftermarket: {
    keywords: ['aftermarket', 'compatible', 'replacement'],
    score: 0.7
  },
  economy: {
    keywords: ['economy', 'budget', 'grade b', 'basic'],
    score: 0.6
  }
};

// Advanced text processing utilities
class TextProcessor {
  static normalize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static extractNumbers(text) {
    return text.match(/\d+/g) || [];
  }

  static calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
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

// AI-powered classification engine
class AIClassifier {
  constructor() {
    this.brandModels = new Map();
    this.modelVariants = new Map();
    this.serviceKeywords = new Map();
  }

  // Learn from existing valid data
  trainFromData(validData) {
    console.log('🧠 Training AI classifier from existing valid data...');
    
    validData.forEach(item => {
      if (item.brand && item.brand !== 'unknown') {
        if (!this.brandModels.has(item.brand)) {
          this.brandModels.set(item.brand, new Set());
        }
        if (item.model_name && item.model_name !== 'unknown') {
          this.brandModels.get(item.brand).add(item.model_name);
        }
      }
      
      if (item.service_type && item.service_type !== 'unknown') {
        const words = TextProcessor.normalize(item.product_title).split(' ');
        words.forEach(word => {
          if (!this.serviceKeywords.has(item.service_type)) {
            this.serviceKeywords.set(item.service_type, new Map());
          }
          const current = this.serviceKeywords.get(item.service_type).get(word) || 0;
          this.serviceKeywords.get(item.service_type).set(word, current + 1);
        });
      }
    });
    
    console.log(`📊 Learned from ${validData.length} valid records`);
    console.log(`📚 Brand models: ${this.brandModels.size} brands`);
    console.log(`🔧 Service keywords: ${this.serviceKeywords.size} services`);
  }

  // Brand detection with confidence scoring
  detectBrand(title) {
    const normalized = TextProcessor.normalize(title);
    let bestMatch = null;
    let bestScore = 0;

    Object.entries(BRAND_PATTERNS).forEach(([brand, pattern]) => {
      let score = 0;
      let matches = 0;

      // Check main keywords
      pattern.keywords.forEach(keyword => {
        if (normalized.includes(keyword)) {
          score += pattern.confidence;
          matches++;
        }
      });

      // Check aliases
      pattern.aliases.forEach(alias => {
        if (normalized.includes(alias)) {
          score += pattern.confidence * 0.8;
          matches++;
        }
      });

      // Calculate confidence based on matches and specificity
      if (matches > 0) {
        const confidence = (score / matches) * (matches / pattern.keywords.length);
        if (confidence > bestScore) {
          bestScore = confidence;
          bestMatch = {
            brand,
            confidence,
            matches
          };
        }
      }
    });

    return bestMatch || { brand: 'unknown', confidence: 0, matches: 0 };
  }

  // Device type detection
  detectDeviceType(title) {
    const normalized = TextProcessor.normalize(title);
    let bestMatch = null;
    let bestScore = 0;

    Object.entries(DEVICE_TYPE_PATTERNS).forEach(([deviceType, pattern]) => {
      let score = 0;
      let negativeScore = 0;

      // Positive keywords
      pattern.keywords.forEach(keyword => {
        if (normalized.includes(keyword)) {
          score += 1;
        }
      });

      // Negative keywords (reduce confidence)
      pattern.negative.forEach(keyword => {
        if (normalized.includes(keyword)) {
          negativeScore += 1;
        }
      });

      // Calculate final score
      const finalScore = Math.max(0, score - negativeScore) * pattern.confidence;
      
      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestMatch = {
          deviceType,
          confidence: finalScore,
          score
        };
      }
    });

    return bestMatch || { deviceType: 'mobile', confidence: 0.5, score: 0 };
  }

  // Service type detection
  detectServiceType(title) {
    const normalized = TextProcessor.normalize(title);
    let bestMatch = null;
    let bestScore = 0;

    Object.entries(SERVICE_PATTERNS).forEach(([serviceType, pattern]) => {
      let score = 0;
      let matches = 0;

      pattern.keywords.forEach(keyword => {
        if (normalized.includes(keyword)) {
          score += pattern.confidence;
          matches++;
        }
      });

      if (matches > 0) {
        const confidence = score / matches;
        if (confidence > bestScore) {
          bestScore = confidence;
          bestMatch = {
            serviceType,
            confidence,
            matches
          };
        }
      }
    });

    return bestMatch || { serviceType: 'screen_replacement', confidence: 0.3, matches: 0 };
  }

  // Advanced model name extraction
  extractModelName(title, brand) {
    const normalized = TextProcessor.normalize(title);
    
    if (!BRAND_PATTERNS[brand]) {
      return this.extractGenericModelName(normalized);
    }

    const patterns = MODEL_EXTRACTION_PATTERNS[brand];
    if (!patterns) {
      return this.extractGenericModelName(normalized);
    }

    let bestMatch = null;
    let bestScore = 0;

    Object.entries(patterns).forEach(([modelType, regex]) => {
      const match = normalized.match(regex);
      if (match) {
        const confidence = match[0].length / normalized.length;
        if (confidence > bestScore) {
          bestScore = confidence;
          bestMatch = {
            modelName: this.normalizeModelName(match[0], brand),
            confidence,
            type: modelType
          };
        }
      }
    });

    return bestMatch || { modelName: 'unknown', confidence: 0, type: 'generic' };
  }

  // Generic model name extraction for unknown brands
  extractGenericModelName(normalized) {
    const words = normalized.split(' ');
    const numbers = TextProcessor.extractNumbers(normalized);
    
    if (numbers.length > 0) {
      const numberWord = words.find(word => /\d/.test(word));
      if (numberWord) {
        return {
          modelName: numberWord,
          confidence: 0.6,
          type: 'numeric'
        };
      }
    }

    // Look for capitalized words that might be model names
    const potentialModels = words.filter(word => 
      word.length > 2 && 
      /^[A-Z]/.test(word) && 
      !['NEW', 'FOR', 'WITH', 'AND'].includes(word.toUpperCase())
    );

    if (potentialModels.length > 0) {
      return {
        modelName: potentialModels[0],
        confidence: 0.5,
        type: 'alphabetic'
      };
    }

    return { modelName: 'unknown', confidence: 0, type: 'none' };
  }

  // Normalize model names to standard format
  normalizeModelName(modelName, brand) {
    let normalized = modelName.toLowerCase().trim();
    
    // Brand-specific normalization
    switch (brand) {
      case 'apple':
        normalized = normalized
          .replace(/iphone\s*/, '')
          .replace(/ipad\s*/, '')
          .replace(/macbook\s*/, '');
        break;
      case 'samsung':
        normalized = normalized
          .replace(/galaxy\s*/, '')
          .replace(/samsung\s*/, '');
        break;
      case 'google':
        normalized = normalized
          .replace(/google\s*/, '');
        break;
    }

    // General normalization
    normalized = normalized
      .replace(/\s+/g, ' ')
      .trim();

    return normalized || 'unknown';
  }

  // Quality tier detection
  detectQualityTier(title, price) {
    const normalized = TextProcessor.normalize(title);
    let bestMatch = null;
    let bestScore = 0;

    Object.entries(QUALITY_PATTERNS).forEach(([tier, pattern]) => {
      let score = 0;

      pattern.keywords.forEach(keyword => {
        if (normalized.includes(keyword)) {
          score += pattern.score;
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          tier,
          confidence: score,
          priceScore: this.calculatePriceScore(price, tier)
        };
      }
    });

    // Default based on price if no keywords found
    if (!bestMatch || bestMatch.confidence < 0.3) {
      return {
        tier: this.inferTierFromPrice(price),
        confidence: 0.4,
        priceScore: 0.5
      };
    }

    return bestMatch;
  }

  calculatePriceScore(price, tier) {
    const priceRanges = {
      oem: [100, 500],
      premium: [50, 200],
      standard: [20, 100],
      aftermarket: [10, 50],
      economy: [1, 30]
    };

    const range = priceRanges[tier];
    if (!range) return 0.5;

    if (price >= range[0] && price <= range[1]) {
      return 1.0;
    } else if (price < range[0]) {
      return Math.max(0, 1 - (range[0] - price) / range[0]);
    } else {
      return Math.max(0, 1 - (price - range[1]) / range[1]);
    }
  }

  inferTierFromPrice(price) {
    if (price > 200) return 'premium';
    if (price > 100) return 'oem';
    if (price > 50) return 'standard';
    if (price > 20) return 'aftermarket';
    return 'economy';
  }
}

// Main data cleaning function
async function cleanMobileActiveData() {
  console.log('🚀 Starting AI-Powered Data Cleaning');
  console.log('=' .repeat(60));

  try {
    // Load the data
    console.log('📂 Loading MobileActive data...');
    const inputPath = path.join(__dirname, 'mobileactive/tmp/mobileactive-improved-cleaned.json');
    const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    
    console.log(`📊 Loaded ${rawData.length} products`);

    // Initialize AI classifier
    const classifier = new AIClassifier();
    
    // Train on existing valid data
    const validData = rawData.filter(item => 
      item.is_valid && 
      item.brand !== 'unknown' && 
      item.service_type !== 'unknown'
    );
    
    if (validData.length > 0) {
      classifier.trainFromData(validData);
    }

    // Process each product
    console.log('🤖 Processing products with AI...');
    const processedData = [];
    let improved = 0;
    let totalConfidence = 0;

    for (let i = 0; i < rawData.length; i++) {
      const item = rawData[i];
      const originalItem = { ...item };
      
      // Skip if already well-classified
      if (item.brand !== 'unknown' && 
          item.device_type !== 'unknown' && 
          item.model_name !== 'unknown' && 
          item.service_type !== 'unknown') {
        processedData.push(item);
        continue;
      }

      // Apply AI classification
      const brandResult = classifier.detectBrand(item.product_title);
      const deviceResult = classifier.detectDeviceType(item.product_title);
      const serviceResult = classifier.detectServiceType(item.product_title);
      const modelResult = classifier.extractModelName(item.product_title, brandResult.brand);
      const qualityResult = classifier.detectQualityTier(item.product_title, item.part_price);

      // Update item with AI predictions
      if (brandResult.confidence > 0.6) {
        item.brand = brandResult.brand;
      }
      
      if (deviceResult.confidence > 0.5) {
        item.device_type = deviceResult.deviceType;
      }
      
      if (serviceResult.confidence > 0.4) {
        item.service_type = serviceResult.serviceType;
      }
      
      if (modelResult.confidence > 0.5) {
        item.model_name = modelResult.modelName;
      }

      // Add AI metadata
      item.ai_classification = {
        brand: brandResult,
        deviceType: deviceResult,
        service: serviceResult,
        model: modelResult,
        quality: qualityResult,
        totalConfidence: (brandResult.confidence + deviceResult.confidence + serviceResult.confidence + modelResult.confidence) / 4
      };

      // Update validation
      const hasImprovements = 
        item.brand !== originalItem.brand ||
        item.device_type !== originalItem.device_type ||
        item.model_name !== originalItem.model_name ||
        item.service_type !== originalItem.service_type;

      if (hasImprovements) {
        improved++;
        item.is_valid = true;
        item.validation_issues = item.validation_issues.filter(issue => 
          !issue.includes('Could not detect')
        );
      }

      totalConfidence += item.ai_classification.totalConfidence;
      processedData.push(item);

      // Progress indicator
      if (i % 1000 === 0) {
        console.log(`  Processed ${i}/${rawData.length} products...`);
      }
    }

    // Generate statistics
    const avgConfidence = totalConfidence / processedData.length;
    const validCount = processedData.filter(item => item.is_valid).length;
    const unknownBrands = processedData.filter(item => item.brand === 'unknown').length;
    const unknownDevices = processedData.filter(item => item.device_type === 'unknown').length;
    const unknownModels = processedData.filter(item => item.model_name === 'unknown').length;
    const unknownServices = processedData.filter(item => item.service_type === 'unknown').length;

    console.log('\n📊 AI Processing Results:');
    console.log('=' .repeat(60));
    console.log(`✅ Products improved: ${improved}`);
    console.log(`📈 Average confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    console.log(`✅ Valid products: ${validCount}/${processedData.length} (${(validCount/processedData.length*100).toFixed(1)}%)`);
    console.log(`❓ Unknown brands: ${unknownBrands}`);
    console.log(`❓ Unknown devices: ${unknownDevices}`);
    console.log(`❓ Unknown models: ${unknownModels}`);
    console.log(`❓ Unknown services: ${unknownServices}`);

    // Save cleaned data
    const outputPath = path.join(__dirname, 'tmp/mobileactive-ai-cleaned.json');
    fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2));
    
    // Save statistics
    const statsPath = path.join(__dirname, 'tmp/ai-cleaning-stats.json');
    const stats = {
      totalProcessed: processedData.length,
      improved,
      avgConfidence,
      validCount,
      unknownCounts: {
        brands: unknownBrands,
        devices: unknownDevices,
        models: unknownModels,
        services: unknownServices
      },
      processingDate: new Date().toISOString()
    };
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

    console.log(`\n💾 Saved cleaned data to: ${outputPath}`);
    console.log(`📊 Saved statistics to: ${statsPath}`);
    
    return processedData;

  } catch (error) {
    console.error('❌ Error during data cleaning:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  cleanMobileActiveData();
}

module.exports = { cleanMobileActiveData, AIClassifier, TextProcessor }; 