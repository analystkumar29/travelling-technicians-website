#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

/**
 * COMPREHENSIVE DATA CLEANING & VALIDATION PIPELINE
 * 
 * This pipeline addresses:
 * 1. Brand name normalization
 * 2. Model name categorization and unknown reduction
 * 3. Service type validation
 * 4. SKU pattern analysis
 * 5. Variant handling cleanup
 * 6. Comprehensive validation and reporting
 */

class DataCleaningPipeline {
    constructor() {
        this.validBrands = [
            'Apple', 'Samsung', 'Google', 'Xiaomi', 'OnePlus', 'Huawei', 
            'Motorola', 'LG', 'Sony', 'Asus', 'Microsoft', 'Oppo', 'BlackBerry'
        ];
        
        this.validServiceTypes = [
            'screen_replacement', 'battery_replacement', 'charging_port_repair',
            'back_cover_replacement', 'camera_repair', 'speaker_repair',
            'sim_tray_repair', 'microphone_repair', 'power_button_repair',
            'volume_button_repair', 'home_button_repair', 'earpiece_repair',
            'vibrator_repair', 'flex_cable_repair', 'water_damage_repair'
        ];
        
        this.validDeviceTypes = ['mobile', 'tablet', 'laptop', 'smartwatch'];
        
        this.skuPatterns = new Map();
        this.modelMappings = new Map();
        this.serviceTypeKeywords = new Map([
            ['screen_replacement', ['screen', 'display', 'lcd', 'oled', 'digitizer', 'touch']],
            ['battery_replacement', ['battery', 'power', 'charge', 'mah', 'cell']],
            ['charging_port_repair', ['charging', 'port', 'connector', 'dock', 'usb']],
            ['back_cover_replacement', ['back', 'cover', 'housing', 'rear', 'panel']],
            ['camera_repair', ['camera', 'lens', 'flash', 'sensor']],
            ['speaker_repair', ['speaker', 'audio', 'sound', 'buzzer']],
            ['sim_tray_repair', ['sim', 'tray', 'slot', 'card']],
            ['microphone_repair', ['microphone', 'mic', 'voice']],
            ['earpiece_repair', ['earpiece', 'receiver', 'ear']],
            ['vibrator_repair', ['vibrator', 'motor', 'vibration']],
            ['flex_cable_repair', ['flex', 'cable', 'ribbon', 'connector']],
            ['power_button_repair', ['power', 'button', 'switch', 'on/off']],
            ['volume_button_repair', ['volume', 'button', 'key']],
            ['home_button_repair', ['home', 'button', 'fingerprint', 'touch id']]
        ]);
        
        this.brandKeywords = new Map([
            ['Apple', ['iphone', 'ipad', 'macbook', 'apple', 'ios']],
            ['Samsung', ['galaxy', 'samsung', 'note', 'tab']],
            ['Google', ['pixel', 'google', 'nexus']],
            ['Huawei', ['huawei', 'honor', 'mate', 'p30', 'p40']],
            ['Motorola', ['moto', 'motorola', 'droid']],
            ['LG', ['lg', 'optimus', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8']],
            ['Sony', ['sony', 'xperia', 'z1', 'z2', 'z3', 'z4', 'z5']],
            ['Xiaomi', ['xiaomi', 'redmi', 'mi', 'poco']],
            ['OnePlus', ['oneplus', 'one plus', '1+']],
            ['Oppo', ['oppo', 'find', 'reno']],
            ['Asus', ['asus', 'zenfone', 'rog']],
            ['Microsoft', ['microsoft', 'surface', 'lumia']]
        ]);
        
        this.stats = {
            totalRecords: 0,
            brandNormalized: 0,
            modelsMapped: 0,
            serviceTypesFixed: 0,
            skuPatternsMapped: 0,
            variantHandlingFixed: 0,
            validationErrors: []
        };
    }
    
    /**
     * 1. NORMALIZE BRAND NAMES
     */
    normalizeBrand(brand, productTitle = '', tags = '') {
        if (!brand || brand.trim() === '' || brand.toLowerCase() === 'unknown') {
            // Try to detect brand from product title and tags
            const text = `${productTitle} ${tags}`.toLowerCase();
            
            for (const [brandName, keywords] of this.brandKeywords) {
                if (keywords.some(keyword => text.includes(keyword))) {
                    this.stats.brandNormalized++;
                    return brandName;
                }
            }
            
            return 'Unknown';
        }
        
        // Normalize to proper case
        const normalizedBrand = brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
        
        // Check if it's in our valid brands list
        const validBrand = this.validBrands.find(b => 
            b.toLowerCase() === normalizedBrand.toLowerCase()
        );
        
        if (validBrand) {
            this.stats.brandNormalized++;
            return validBrand;
        }
        
        return normalizedBrand;
    }
    
    /**
     * 2. CATEGORIZE & REDUCE UNKNOWN MODEL NAMES
     */
    categorizeModel(modelName, sku, productTitle, brand) {
        if (!modelName || modelName.toLowerCase() === 'unknown') {
            // Try SKU-to-model mapping
            if (sku && this.modelMappings.has(sku)) {
                this.stats.modelsMapped++;
                return this.modelMappings.get(sku);
            }
            
            // Try to extract from product title
            const extractedModel = this.extractModelFromTitle(productTitle, brand);
            if (extractedModel && extractedModel !== 'unknown') {
                this.stats.modelsMapped++;
                return extractedModel;
            }
            
            return 'Unknown';
        }
        
        // Clean up model name
        return this.cleanModelName(modelName);
    }
    
    extractModelFromTitle(title, brand) {
        if (!title) return 'Unknown';
        
        const titleLower = title.toLowerCase();
        
        // Brand-specific model extraction patterns
        switch (brand) {
            case 'Apple':
                return this.extractAppleModel(titleLower);
            case 'Samsung':
                return this.extractSamsungModel(titleLower);
            case 'Google':
                return this.extractGoogleModel(titleLower);
            case 'Huawei':
                return this.extractHuaweiModel(titleLower);
            case 'Motorola':
                return this.extractMotorolaModel(titleLower);
            default:
                return this.extractGenericModel(titleLower, brand);
        }
    }
    
    extractAppleModel(title) {
        // iPhone patterns
        const iphoneMatch = title.match(/iphone\s*(\d+(?:\s*pro(?:\s*max)?|\s*plus|\s*mini)?)/i);
        if (iphoneMatch) {
            return `iPhone ${iphoneMatch[1].replace(/\s+/g, ' ').trim()}`;
        }
        
        // iPad patterns
        const ipadMatch = title.match(/ipad(?:\s*(pro|air|mini))?\s*(\d+(?:\.\d+)?)?/i);
        if (ipadMatch) {
            let model = 'iPad';
            if (ipadMatch[1]) model += ` ${ipadMatch[1]}`;
            if (ipadMatch[2]) model += ` ${ipadMatch[2]}`;
            return model;
        }
        
        // MacBook patterns
        const macbookMatch = title.match(/macbook\s*(pro|air)?\s*(\d+(?:\.\d+)?)?/i);
        if (macbookMatch) {
            let model = 'MacBook';
            if (macbookMatch[1]) model += ` ${macbookMatch[1]}`;
            if (macbookMatch[2]) model += ` ${macbookMatch[2]}"`;
            return model;
        }
        
        return 'Unknown';
    }
    
    extractSamsungModel(title) {
        // Galaxy patterns
        const galaxyMatch = title.match(/galaxy\s*([a-z]+\s*\d+(?:\s*[a-z]+)?(?:\s*\d+)?)/i);
        if (galaxyMatch) {
            return `Galaxy ${galaxyMatch[1].replace(/\s+/g, ' ').trim()}`;
        }
        
        return 'Unknown';
    }
    
    extractGoogleModel(title) {
        const pixelMatch = title.match(/pixel\s*(\d+(?:\s*[a-z]+)?)/i);
        if (pixelMatch) {
            return `Pixel ${pixelMatch[1].replace(/\s+/g, ' ').trim()}`;
        }
        
        return 'Unknown';
    }
    
    extractHuaweiModel(title) {
        const huaweiMatch = title.match(/(?:huawei\s*)?([a-z]+\s*\d+(?:\s*[a-z]+)?)/i);
        if (huaweiMatch) {
            return huaweiMatch[1].replace(/\s+/g, ' ').trim();
        }
        
        return 'Unknown';
    }
    
    extractMotorolaModel(title) {
        const motoMatch = title.match(/moto\s*([a-z]+(?:\s*\d+)?(?:\s*[a-z]+)?)/i);
        if (motoMatch) {
            return `Moto ${motoMatch[1].replace(/\s+/g, ' ').trim()}`;
        }
        
        return 'Unknown';
    }
    
    extractGenericModel(title, brand) {
        // Generic model extraction for other brands
        const words = title.split(/\s+/);
        const brandIndex = words.findIndex(word => 
            word.toLowerCase().includes(brand.toLowerCase())
        );
        
        if (brandIndex >= 0 && brandIndex < words.length - 1) {
            return words[brandIndex + 1];
        }
        
        return 'Unknown';
    }
    
    cleanModelName(modelName) {
        // Remove technical terms and qualifiers
        const cleanName = modelName
            .replace(/\b(premium|aftermarket|service pack|oem|original|replacement|assembly|with frame|ic transfer eligible|grade [a-z]|used|pull|version \d+|v\d+|qv\d+|soft|hard|incell|plus extended capacity|mc\d+)\b/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
        
        return cleanName || modelName;
    }
    
    /**
     * 3. VALIDATE SERVICE TYPES
     */
    validateServiceType(serviceType, productTitle) {
        if (!serviceType || serviceType.toLowerCase() === 'unknown') {
            // Try to detect from product title
            const detectedService = this.detectServiceFromTitle(productTitle);
            if (detectedService) {
                this.stats.serviceTypesFixed++;
                return detectedService;
            }
            return 'unknown';
        }
        
        // Normalize service type
        const normalizedService = serviceType.toLowerCase().replace(/\s+/g, '_');
        
        // Check if it's valid
        if (this.validServiceTypes.includes(normalizedService)) {
            return normalizedService;
        }
        
        // Try to map common variations
        const mappedService = this.mapServiceType(normalizedService);
        if (mappedService) {
            this.stats.serviceTypesFixed++;
            return mappedService;
        }
        
        return serviceType;
    }
    
    detectServiceFromTitle(title) {
        if (!title) return null;
        
        const titleLower = title.toLowerCase();
        
        for (const [serviceType, keywords] of this.serviceTypeKeywords) {
            if (keywords.some(keyword => titleLower.includes(keyword))) {
                return serviceType;
            }
        }
        
        return null;
    }
    
    mapServiceType(serviceType) {
        const mappings = {
            'camera': 'camera_repair',
            'speaker': 'speaker_repair',
            'charging_port': 'charging_port_repair',
            'sim_tray': 'sim_tray_repair',
            'microphone': 'microphone_repair',
            'earpiece': 'earpiece_repair',
            'vibrator': 'vibrator_repair',
            'power_button': 'power_button_repair',
            'volume_button': 'volume_button_repair',
            'home_button': 'home_button_repair'
        };
        
        return mappings[serviceType] || null;
    }
    
    /**
     * 4. SKU PATTERN ANALYSIS
     */
    analyzeSKUPatterns(records) {
        console.log('🔍 Analyzing SKU patterns...');
        
        const skuModelMap = new Map();
        const skuBrandMap = new Map();
        
        records.forEach(record => {
            if (record.sku && record.model_name && record.model_name !== 'unknown') {
                const key = `${record.brand}_${record.sku}`;
                if (!skuModelMap.has(key)) {
                    skuModelMap.set(key, new Set());
                }
                skuModelMap.get(key).add(record.model_name);
            }
        });
        
        // Build SKU patterns
        skuModelMap.forEach((models, key) => {
            if (models.size === 1) {
                const [brand, sku] = key.split('_');
                this.modelMappings.set(sku, Array.from(models)[0]);
                this.stats.skuPatternsMapped++;
            }
        });
        
        console.log(`📊 Mapped ${this.stats.skuPatternsMapped} SKU patterns`);
    }
    
    /**
     * 5. VARIANT HANDLING CLEANUP
     */
    validateVariantHandling(variantHandling, productTitle, sku) {
        if (!variantHandling) return 'any_variant';
        
        // Check for color mentions in title
        const colors = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'purple', 'pink', 'gold', 'silver', 'gray', 'grey'];
        const titleLower = productTitle.toLowerCase();
        
        const hasColorInTitle = colors.some(color => titleLower.includes(color));
        
        if (hasColorInTitle && variantHandling === 'any_variant') {
            this.stats.variantHandlingFixed++;
            return 'color_specific';
        }
        
        if (!hasColorInTitle && variantHandling === 'color_specific') {
            this.stats.variantHandlingFixed++;
            return 'any_variant';
        }
        
        return variantHandling;
    }
    
    /**
     * 6. COMPREHENSIVE VALIDATION
     */
    validateRecord(record) {
        const errors = [];
        
        // Brand validation
        if (!record.brand || record.brand === 'Unknown') {
            errors.push('Missing or unknown brand');
        }
        
        // Model validation
        if (!record.model_name || record.model_name === 'Unknown') {
            errors.push('Missing or unknown model');
        }
        
        // Service type validation
        if (!record.service_type || record.service_type === 'unknown') {
            errors.push('Missing or unknown service type');
        }
        
        // Price validation
        if (!record.part_price || isNaN(parseFloat(record.part_price)) || parseFloat(record.part_price) <= 0) {
            errors.push('Invalid or missing price');
        }
        
        // Device type validation
        if (!record.device_type || !this.validDeviceTypes.includes(record.device_type)) {
            errors.push('Invalid device type');
        }
        
        return errors;
    }
    
    /**
     * MAIN PROCESSING PIPELINE
     */
    async processData(inputFile, outputFile) {
        console.log('🚀 Starting Data Cleaning & Validation Pipeline...');
        console.log(`📁 Input: ${inputFile}`);
        console.log(`📁 Output: ${outputFile}`);
        
        const records = [];
        
        // Read input data
        return new Promise((resolve, reject) => {
            fs.createReadStream(inputFile)
                .pipe(csv())
                .on('data', (data) => {
                    records.push(data);
                })
                .on('end', async () => {
                    try {
                        this.stats.totalRecords = records.length;
                        console.log(`📊 Processing ${this.stats.totalRecords} records...`);
                        
                        // Step 1: Analyze SKU patterns first
                        this.analyzeSKUPatterns(records);
                        
                        // Step 2: Process each record
                        const cleanedRecords = records.map((record, index) => {
                            if (index % 500 === 0) {
                                console.log(`⏳ Processing record ${index + 1}/${records.length}...`);
                            }
                            
                            const cleaned = {
                                product_id: record.product_id,
                                original_brand: record.brand,
                                brand: this.normalizeBrand(record.brand, record.product_title, record.tags || ''),
                                brand_name: record.brand_name || '',
                                device_type: record.device_type || 'mobile',
                                original_model: record.model_name,
                                model_name: this.categorizeModel(record.model_name, record.sku, record.product_title, record.brand),
                                original_service: record.service_type,
                                service_type: this.validateServiceType(record.service_type, record.product_title),
                                part_price: parseFloat(record.part_price) || 0,
                                confidence: record.confidence || 'medium',
                                priority: record.priority || 2,
                                product_title: record.product_title || '',
                                sku: record.sku || '',
                                tags: record.tags || '',
                                variant_handling: this.validateVariantHandling(record.variant_handling, record.product_title, record.sku),
                                validation_errors: this.validateRecord({
                                    brand: this.normalizeBrand(record.brand, record.product_title, record.tags || ''),
                                    model_name: this.categorizeModel(record.model_name, record.sku, record.product_title, record.brand),
                                    service_type: this.validateServiceType(record.service_type, record.product_title),
                                    part_price: parseFloat(record.part_price) || 0,
                                    device_type: record.device_type || 'mobile'
                                }).join('; '),
                                cleaning_applied: []
                            };
                            
                            // Track what cleaning was applied
                            if (cleaned.brand !== cleaned.original_brand) {
                                cleaned.cleaning_applied.push('brand_normalized');
                            }
                            if (cleaned.model_name !== cleaned.original_model) {
                                cleaned.cleaning_applied.push('model_mapped');
                            }
                            if (cleaned.service_type !== cleaned.original_service) {
                                cleaned.cleaning_applied.push('service_type_fixed');
                            }
                            
                            cleaned.cleaning_applied = cleaned.cleaning_applied.join(', ');
                            
                            return cleaned;
                        });
                        
                        // Step 3: Generate cleaning report
                        await this.generateCleaningReport(cleanedRecords);
                        
                        // Step 4: Write cleaned data
                        await this.writeCleanedData(cleanedRecords, outputFile);
                        
                        console.log('✅ Data cleaning pipeline completed successfully!');
                        resolve(cleanedRecords);
                        
                    } catch (error) {
                        reject(error);
                    }
                });
        });
    }
    
    async generateCleaningReport(records) {
        const report = {
            summary: {
                total_records: this.stats.totalRecords,
                brands_normalized: this.stats.brandNormalized,
                models_mapped: this.stats.modelsMapped,
                service_types_fixed: this.stats.serviceTypesFixed,
                sku_patterns_mapped: this.stats.skuPatternsMapped,
                variant_handling_fixed: this.stats.variantHandlingFixed
            },
            brand_distribution: {},
            service_type_distribution: {},
            device_type_distribution: {},
            validation_summary: {
                valid_records: 0,
                invalid_records: 0,
                common_errors: {}
            },
            unknown_analysis: {
                unknown_brands: 0,
                unknown_models: 0,
                unknown_services: 0
            }
        };
        
        // Analyze distributions
        records.forEach(record => {
            // Brand distribution
            report.brand_distribution[record.brand] = (report.brand_distribution[record.brand] || 0) + 1;
            
            // Service type distribution
            report.service_type_distribution[record.service_type] = (report.service_type_distribution[record.service_type] || 0) + 1;
            
            // Device type distribution
            report.device_type_distribution[record.device_type] = (report.device_type_distribution[record.device_type] || 0) + 1;
            
            // Validation analysis
            if (record.validation_errors) {
                report.validation_summary.invalid_records++;
                const errors = record.validation_errors.split('; ');
                errors.forEach(error => {
                    if (error.trim()) {
                        report.validation_summary.common_errors[error] = (report.validation_summary.common_errors[error] || 0) + 1;
                    }
                });
            } else {
                report.validation_summary.valid_records++;
            }
            
            // Unknown analysis
            if (record.brand === 'Unknown') report.unknown_analysis.unknown_brands++;
            if (record.model_name === 'Unknown') report.unknown_analysis.unknown_models++;
            if (record.service_type === 'unknown') report.unknown_analysis.unknown_services++;
        });
        
        // Write report
        const reportPath = path.join(__dirname, 'tmp', 'cleaning-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log('📊 Cleaning Report Generated:');
        console.log(`   • Total Records: ${report.summary.total_records}`);
        console.log(`   • Brands Normalized: ${report.summary.brands_normalized}`);
        console.log(`   • Models Mapped: ${report.summary.models_mapped}`);
        console.log(`   • Service Types Fixed: ${report.summary.service_types_fixed}`);
        console.log(`   • SKU Patterns Mapped: ${report.summary.sku_patterns_mapped}`);
        console.log(`   • Valid Records: ${report.validation_summary.valid_records}`);
        console.log(`   • Invalid Records: ${report.validation_summary.invalid_records}`);
        console.log(`   • Unknown Brands: ${report.unknown_analysis.unknown_brands}`);
        console.log(`   • Unknown Models: ${report.unknown_analysis.unknown_models}`);
        console.log(`   • Unknown Services: ${report.unknown_analysis.unknown_services}`);
        console.log(`📄 Full report saved to: ${reportPath}`);
    }
    
    async writeCleanedData(records, outputFile) {
        const csvWriter = createObjectCsvWriter({
            path: outputFile,
            header: [
                { id: 'product_id', title: 'Product ID' },
                { id: 'brand', title: 'Clean Brand' },
                { id: 'brand_name', title: 'Brand Name' },
                { id: 'device_type', title: 'Device Type' },
                { id: 'model_name', title: 'Clean Model' },
                { id: 'service_type', title: 'Clean Service Type' },
                { id: 'part_price', title: 'Price' },
                { id: 'confidence', title: 'Confidence' },
                { id: 'priority', title: 'Priority' },
                { id: 'product_title', title: 'Product Title' },
                { id: 'sku', title: 'SKU' },
                { id: 'tags', title: 'Tags' },
                { id: 'variant_handling', title: 'Variant Handling' },
                { id: 'validation_errors', title: 'Validation Errors' },
                { id: 'cleaning_applied', title: 'Cleaning Applied' },
                { id: 'original_brand', title: 'Original Brand' },
                { id: 'original_model', title: 'Original Model' },
                { id: 'original_service', title: 'Original Service' }
            ]
        });
        
        await csvWriter.writeRecords(records);
        console.log(`💾 Cleaned data saved to: ${outputFile}`);
    }
}

// Main execution
if (require.main === module) {
    const pipeline = new DataCleaningPipeline();
    const inputFile = path.join(__dirname, 'tmp', 'manual-review.csv');
    const outputFile = path.join(__dirname, 'tmp', 'cleaned-data.csv');
    
    pipeline.processData(inputFile, outputFile)
        .then(() => {
            console.log('🎉 Data cleaning pipeline completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Error in data cleaning pipeline:', error);
            process.exit(1);
        });
}

module.exports = DataCleaningPipeline; 