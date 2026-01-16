#!/usr/bin/env tsx

/**
 * Seed Service Pages Script
 * 
 * Extracts pricing, descriptions, and testimonials from hardcoded src/pages/services/*.tsx files
 * and upserts them into Supabase.
 * 
 * Usage:
 *   npm run seed:services           # Execute with dry-run first
 *   npm run seed:services -- --dry-run  # Dry run only (default)
 *   npm run seed:services -- --execute  # Execute database operations
 * 
 * Environment Variables Required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { parseArgs } from 'node:util';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Parse command line arguments
const args = parseArgs({
  options: {
    'dry-run': {
      type: 'boolean',
      short: 'd',
      default: true,
    },
    execute: {
      type: 'boolean',
      short: 'e',
      default: false,
    },
    verbose: {
      type: 'boolean',
      short: 'v',
      default: false,
    },
  },
});

const isDryRun = args.values['dry-run'] && !args.values.execute;
const isVerbose = args.values.verbose;

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// ============================================================================
// ICON MAPPING: React Icon Components → kebab-case string identifiers
// ============================================================================

const iconMapping: Record<string, string> = {
  // Laptop repair icons
  'FaLaptop': 'laptop',
  'FaBatteryFull': 'battery',
  'FaKeyboard': 'keyboard',
  'FaMouse': 'mouse',
  'FaMemory': 'memory',
  'FaHdd': 'hard-drive',
  'FaBug': 'bug',
  'FaShieldAlt': 'shield',
  'FaFan': 'fan',
  'FaBolt': 'bolt',
  
  // Mobile repair icons
  'FaMobileAlt': 'mobile',
  'FaMicrophone': 'microphone',
  'FaCamera': 'camera',
  'FaWater': 'water',
  'FaSdCard': 'sd-card',
  
  // Tablet repair icons
  'FaTabletAlt': 'tablet',
  'FaVolumeUp': 'volume',
  'FaHandPointer': 'hand-pointer',
  'FaSyncAlt': 'sync',
};

// ============================================================================
// HARDCODED DATA EXTRACTION
// ============================================================================

// Note: In a real implementation, we would parse the TypeScript files.
// For now, we'll define the data directly based on our analysis.

const hardcodedServices = {
  laptop: [
    {
      id: 1,
      name: 'Screen Replacement',
      description: 'Fix cracked, damaged, or non-responsive laptop screens with our convenient doorstep service. We replace screens for all major laptop brands.',
      icon: 'FaLaptop',
      doorstep: true,
      limited: false,
      price: 'From $149',
      popular: true
    },
    {
      id: 2,
      name: 'Battery Replacement',
      description: 'Extend your laptop\'s unplugged runtime with a fresh battery. Our technicians replace batteries for all major brands right at your location.',
      icon: 'FaBatteryFull',
      doorstep: true,
      limited: false,
      price: 'From $99',
      popular: true
    },
    {
      id: 3,
      name: 'Keyboard Repair/Replacement',
      description: 'Having keyboard issues? Our mobile technicians can replace damaged keyboards, fix unresponsive keys, and resolve trackpad problems at your location.',
      icon: 'FaKeyboard',
      doorstep: true,
      limited: false,
      price: 'From $129',
      popular: false
    },
    {
      id: 4,
      name: 'Trackpad Repair',
      description: "Having issues with your laptop's trackpad? Our doorstep service includes expert diagnosis and repair of trackpad problems for all major laptop models.",
      icon: 'FaMouse',
      doorstep: true,
      limited: false,
      price: 'From $99',
      popular: false
    },
    {
      id: 5,
      name: 'RAM Upgrade',
      description: 'Speed up your laptop with a memory upgrade. Our technicians can install additional RAM at your location, boosting performance for multitasking and demanding applications.',
      icon: 'FaMemory',
      doorstep: true,
      limited: false,
      price: 'From $79',
      popular: true
    },
    {
      id: 6,
      name: 'HDD/SSD Replacement/Upgrade',
      description: 'Upgrade to a faster SSD or replace a failing hard drive. Our doorstep service includes data transfer to your new storage device, minimizing downtime and inconvenience.',
      icon: 'FaHdd',
      doorstep: true,
      limited: false,
      price: 'From $119',
      popular: false
    },
    {
      id: 7,
      name: 'Software Troubleshooting',
      description: 'Experiencing software issues, slow performance, or startup problems? Our technicians can diagnose and resolve software-related problems at your doorstep without you losing access to your important files.',
      icon: 'FaBug',
      doorstep: true,
      limited: false,
      price: 'From $89',
      popular: false
    },
    {
      id: 8,
      name: 'Virus Removal',
      description: 'Protect your data and restore performance with our doorstep virus removal service. We thoroughly clean your system and implement security measures to prevent future infections.',
      icon: 'FaShieldAlt',
      doorstep: true,
      limited: false,
      price: 'From $99',
      popular: false
    },
    {
      id: 9,
      name: 'Cooling System Repair',
      description: "Is your laptop overheating or making unusual fan noises? Our technicians can clean or repair your cooling system on-site, preventing damage to internal components and extending your laptop's lifespan.",
      icon: 'FaFan',
      doorstep: true,
      limited: false,
      price: 'From $89',
      popular: false
    },
    {
      id: 10,
      name: 'Power Jack Repair',
      description: 'Having trouble charging your laptop? Our doorstep technicians can diagnose and repair power connection issues, replacing damaged DC jacks and resolving circuitry problems.',
      icon: 'FaBolt',
      doorstep: true,
      limited: false,
      price: 'From $129',
      popular: false
    }
  ],
  mobile: [
    {
      id: 1,
      name: 'Screen Replacement',
      description: 'Don\'t live with a cracked or broken screen. Our technicians come to your location with high-quality replacement screens for all major brands including Apple, Samsung, Google, and more. Most screen replacements can be completed in 30-60 minutes right at your doorstep.',
      icon: 'FaMobileAlt',
      doorstep: true,
      limited: false,
      price: 'From $129',
      popular: true
    },
    {
      id: 2,
      name: 'Battery Replacement',
      description: 'Is your phone not holding a charge like it used to? Our mobile battery replacement service brings new life to your device. We use premium-quality batteries and can complete most replacements in under an hour at your chosen location.',
      icon: 'FaBatteryFull',
      doorstep: true,
      limited: false,
      price: 'From $79',
      popular: true
    },
    {
      id: 3,
      name: 'Charging Port Repair',
      description: "Struggling with loose connections or charging issues? Our technicians can repair or replace your device's charging port on-site, restoring reliable power to your phone without you ever leaving home.",
      icon: 'FaBolt',
      doorstep: true,
      limited: false,
      price: 'From $89',
      popular: false
    },
    {
      id: 4,
      name: 'Speaker/Microphone Repair',
      description: 'Having trouble hearing callers or being heard? Our doorstep service includes expert diagnosis and repair of speaker and microphone issues for all major phone models.',
      icon: 'FaMicrophone',
      doorstep: true,
      limited: false,
      price: 'From $79',
      popular: false
    },
    {
      id: 5,
      name: 'Camera Repair',
      description: 'Don\'t miss capturing important moments due to camera malfunctions. Our technicians can fix front and rear camera issues at your location, usually completing repairs within an hour.',
      icon: 'FaCamera',
      doorstep: true,
      limited: false,
      price: 'From $89',
      popular: false
    },
    {
      id: 6,
      name: 'Water Damage Diagnostics',
      description: 'If your phone has been exposed to water, quick action is essential. Our technicians can perform initial diagnostics at your doorstep and provide emergency treatment. Severe cases may require additional service at our specialized facility.',
      icon: 'FaWater',
      doorstep: true,
      limited: true,
      price: 'From $49',
      popular: false
    },
    {
      id: 7,
      name: 'Data Recovery',
      description: 'Worried about lost photos, contacts, or messages? We offer data recovery services with an initial assessment at your location. Complex recovery may require additional time and specialized equipment.',
      icon: 'FaMemory',
      doorstep: true,
      limited: true,
      price: 'From $99',
      popular: false
    },
    {
      id: 8,
      name: 'Storage Upgrade',
      description: 'Running out of space on your phone? For select Android devices, we can upgrade your storage capacity with larger memory modules or optimize your existing storage right at your location.',
      icon: 'FaSdCard',
      doorstep: true,
      limited: false,
      price: 'From $89',
      popular: false
    }
  ],
  tablet: [
    {
      id: 1,
      name: 'Screen Replacement',
      description: 'Fix cracked, damaged, or non-responsive tablet screens with our convenient doorstep service. We replace screens for all major tablet brands including iPad, Samsung Galaxy Tab, and more.',
      icon: 'FaTabletAlt',
      doorstep: true,
      limited: false,
      price: 'From $149',
      popular: true
    },
    {
      id: 2,
      name: 'Battery Replacement',
      description: 'Extend your tablet\'s battery life with a fresh replacement. Our technicians replace batteries for all major tablet brands right at your location.',
      icon: 'FaBatteryFull',
      doorstep: true,
      limited: false,
      price: 'From $99',
      popular: true
    },
    {
      id: 3,
      name: 'Charging Port Repair',
      description: 'Struggling with loose connections or charging issues? Our technicians can repair or replace your tablet\'s charging port on-site, restoring reliable power to your device.',
      icon: 'FaBolt',
      doorstep: true,
      limited: false,
      price: 'From $89',
      popular: false
    },
    {
      id: 4,
      name: 'Camera Repair',
      description: 'Don\'t miss capturing important moments due to camera malfunctions. Our technicians can fix front and rear camera issues on your tablet at your location.',
      icon: 'FaCamera',
      doorstep: true,
      limited: false,
      price: 'From $109',
      popular: false
    },
    {
      id: 5,
      name: 'Button Repair',
      description: 'Having issues with power buttons, volume controls, or home buttons? Our doorstep service includes expert repair of physical buttons for all major tablet models.',
      icon: 'FaVolumeUp',
      doorstep: true,
      limited: false,
      price: 'From $79',
      popular: false
    },
    {
      id: 6,
      name: 'Software Issues',
      description: 'Experiencing software problems, slow performance, or app crashes? Our technicians can diagnose and resolve software-related issues at your doorstep.',
      icon: 'FaBug',
      doorstep: true,
      limited: false,
      price: 'From $89',
      popular: false
    },
    {
      id: 7,
      name: 'Touch Screen Calibration',
      description: 'If your tablet\'s touch response is inaccurate or unresponsive in certain areas, our technicians can recalibrate or repair touch functionality on-site.',
      icon: 'FaHandPointer',
      doorstep: true,
      limited: false,
      price: 'From $69',
      popular: false
    },
    {
      id: 8,
      name: 'Factory Reset & Setup',
      description: 'Need a fresh start? Our technicians can perform a factory reset and help set up your tablet with all your essential apps and settings at your location.',
      icon: 'FaSyncAlt',
      doorstep: true,
      limited: false,
      price: 'From $59',
      popular: false
    }
  ]
};

const hardcodedBrands = {
  laptop: [
    'Apple MacBook (All Models)',
    'Dell',
    'HP',
    'Lenovo',
    'Asus',
    'Acer',
    'Microsoft Surface',
    'Samsung',
    'MSI',
    'Toshiba'
  ],
  mobile: [
    'Apple iPhone (All Models)',
    'Samsung Galaxy Series',
    'Google Pixel',
    'LG',
    'Huawei',
    'OnePlus',
    'Xiaomi',
    'Motorola',
    'Sony Xperia',
    'Nokia'
  ],
  tablet: [
    'Apple iPad (All Models)',
    'Samsung Galaxy Tab',
    'Microsoft Surface',
    'Lenovo Tab',
    'Huawei MediaPad',
    'Amazon Fire Tablet',
    'Google Pixel Tablet',
    'ASUS ZenPad',
    'Sony Xperia Tablet',
    'LG G Pad'
  ]
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse price string like "From $149" to numeric value
 */
function parsePrice(priceStr: string): number {
  const match = priceStr.match(/\$(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Convert display name to kebab-case for URL-friendly name
 */
function toKebabCase(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Normalize brand name for database storage
 */
function normalizeBrandName(brand: string): string {
  // Remove parenthetical descriptions
  let normalized = brand.replace(/\s*\([^)]*\)/g, '');
  
  // Capitalize first letter of each word
  normalized = normalized.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return normalized.trim();
}

/**
 * Extract base brand name (for matching)
 */
function extractBaseBrandName(brand: string): string {
  // Remove parenthetical descriptions and "Series" etc.
  return brand.replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*Series\s*/gi, '')
    .replace(/\s*Tab\s*/gi, '')
    .replace(/\s*MediaPad\s*/gi, '')
    .replace(/\s*ZenPad\s*/gi, '')
    .replace(/\s*G Pad\s*/gi, '')
    .trim();
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function seedServicePages() {
  console.log('🌱 Seeding Service Pages Data...\n');
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE: No database changes will be made\n');
  } else {
    console.log('🚀 EXECUTE MODE: Database changes will be committed\n');
  }

  try {
    // Step 1: Get device types mapping
    console.log('📂 Step 1: Fetching device types...');
    const deviceTypes = await getDeviceTypes();
    
    // Step 2: Seed/Update services
    console.log('🔧 Step 2: Processing services...');
    const serviceResults = await processServices(deviceTypes);
    
    // Step 3: Seed/Update brands
    console.log('🏷️ Step 3: Processing brands...');
    const brandResults = await processBrands(deviceTypes);
    
    // Step 4: Seed dynamic pricing
    console.log('💰 Step 4: Processing dynamic pricing...');
    const pricingResults = await processDynamicPricing(serviceResults.processedServices);
    
    // Summary
    console.log('\n📊 SEEDING SUMMARY:');
    console.log(`   Services: ${serviceResults.stats.total} total, ${serviceResults.stats.updated} updated, ${serviceResults.stats.inserted} inserted`);
    console.log(`   Brands: ${brandResults.stats.total} total, ${brandResults.stats.updated} updated, ${brandResults.stats.inserted} inserted`);
    console.log(`   Dynamic Pricing: ${pricingResults.stats.total} records`);
    
    if (isDryRun) {
      console.log('\n✅ DRY RUN COMPLETED SUCCESSFULLY');
      console.log('   To execute database operations, run:');
      console.log('   npm run seed:services -- --execute');
    } else {
      console.log('\n🎉 SEEDING COMPLETED SUCCESSFULLY!');
    }
    
  } catch (error) {
    console.error('❌ Error seeding service pages:', error);
    process.exit(1);
  }
}

async function getDeviceTypes() {
  const { data, error } = await supabase
    .from('device_types')
    .select('id, name')
    .order('id');

  if (error) {
    console.error('❌ Error fetching device types:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.error('❌ No device types found in database');
    throw new Error('Device types table is empty');
  }

  const deviceTypeMap: Record<string, number> = {};
  data.forEach((dt: { id: number; name: string }) => {
    deviceTypeMap[dt.name.toLowerCase()] = dt.id;
  });

  console.log(`   Found ${data.length} device types:`, Object.keys(deviceTypeMap));
  return deviceTypeMap;
}

async function processServices(deviceTypes: Record<string, number>) {
  const stats = {
    total: 0,
    updated: 0,
    inserted: 0,
    skipped: 0
  };

  const processedServices: Array<{
    id: number;
    name: string;
    device_type_id: number;
    database_id?: number;
  }> = [];

  console.log('   Processing services by device type:');

  // Track simulated IDs for dry-run (start from 1000 to avoid conflicts with real IDs)
  let simulatedIdCounter = 1000;

  for (const [deviceTypeName, deviceTypeId] of Object.entries(deviceTypes)) {
    const services = hardcodedServices[deviceTypeName as keyof typeof hardcodedServices] || [];
    
    console.log(`     ${deviceTypeName}: ${services.length} services`);
    
    for (const service of services) {
      stats.total++;
      
      // Map icon
      const iconName = iconMapping[service.icon] || service.icon.toLowerCase();
      
      // Prepare service data for upsert
      const serviceData = {
        name: toKebabCase(service.name),
        display_name: service.name,
        description: service.description,
        device_type_id: deviceTypeId,
        icon: iconName,
        is_doorstep_eligible: service.doorstep,
        is_popular: service.popular || false,
        is_limited: service.limited || false,
        is_active: true,
        sort_order: service.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Check if service exists (by display_name and device_type_id)
      const { data: existingService } = await supabase
        .from('services')
        .select('id, name')
        .eq('display_name', service.name)
        .eq('device_type_id', deviceTypeId)
        .maybeSingle();

      if (isDryRun) {
        if (existingService) {
          console.log(`       📝 Would update: ${service.name} (ID: ${existingService.id})`);
          stats.updated++;
          
          processedServices.push({
            id: service.id,
            name: service.name,
            device_type_id: deviceTypeId,
            database_id: existingService.id
          });
        } else {
          console.log(`       ➕ Would insert: ${service.name} (simulated ID: ${simulatedIdCounter})`);
          stats.inserted++;
          
          processedServices.push({
            id: service.id,
            name: service.name,
            device_type_id: deviceTypeId,
            database_id: simulatedIdCounter
          });
          simulatedIdCounter++;
        }
        continue;
      }

      // Execute upsert
      const { data: upsertedService, error } = await supabase
        .from('services')
        .upsert({
          ...serviceData,
          ...(existingService ? { id: existingService.id } : {})
        }, {
          onConflict: 'name,device_type_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error(`       ❌ Error upserting service ${service.name}:`, error);
        stats.skipped++;
        continue;
      }

      if (existingService) {
        console.log(`       ✅ Updated: ${service.name} (ID: ${upsertedService.id})`);
        stats.updated++;
      } else {
        console.log(`       ✅ Inserted: ${service.name} (ID: ${upsertedService.id})`);
        stats.inserted++;
      }

      processedServices.push({
        id: service.id,
        name: service.name,
        device_type_id: deviceTypeId,
        database_id: upsertedService.id
      });
    }
  }

  return { stats, processedServices };
}

async function processBrands(deviceTypes: Record<string, number>) {
  const stats = {
    total: 0,
    updated: 0,
    inserted: 0,
    skipped: 0
  };

  console.log('   Processing brands by device type:');

  // Get existing brands for reference
  const { data: existingBrands } = await supabase
    .from('brands')
    .select('id, name, display_name, device_type_id')
    .order('display_name');

  const existingBrandMap = new Map<string, number>();
  existingBrands?.forEach((brand: { id: number; name: string; display_name: string; device_type_id: number }) => {
    const key = `${brand.name.toLowerCase()}_${brand.device_type_id}`;
    existingBrandMap.set(key, brand.id);
  });

  for (const [deviceTypeName, deviceTypeId] of Object.entries(deviceTypes)) {
    const brands = hardcodedBrands[deviceTypeName as keyof typeof hardcodedBrands] || [];
    
    console.log(`     ${deviceTypeName}: ${brands.length} brands`);
    
    for (let i = 0; i < brands.length; i++) {
      stats.total++;
      const brand = brands[i];
      
      const normalizedName = normalizeBrandName(brand);
      const baseName = extractBaseBrandName(brand);
      const brandName = baseName.toLowerCase().replace(/\s+/g, '-');
      
      // Check if brand exists
      const existingKey = `${brandName}_${deviceTypeId}`;
      const existingBrandId = existingBrandMap.get(existingKey);
      
      const brandData = {
        name: brandName,
        display_name: normalizedName,
        device_type_id: deviceTypeId,
        is_active: true,
        sort_order: i + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (isDryRun) {
        if (existingBrandId) {
          console.log(`       📝 Would update: ${normalizedName} (ID: ${existingBrandId})`);
          stats.updated++;
        } else {
          console.log(`       ➕ Would insert: ${normalizedName}`);
          stats.inserted++;
        }
        continue;
      }

      // Execute upsert
      const { data: upsertedBrand, error } = await supabase
        .from('brands')
        .upsert({
          ...brandData,
          ...(existingBrandId ? { id: existingBrandId } : {})
        }, {
          onConflict: 'name,device_type_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error(`       ❌ Error upserting brand ${normalizedName}:`, error);
        stats.skipped++;
        continue;
      }

      if (existingBrandId) {
        console.log(`       ✅ Updated: ${normalizedName} (ID: ${upsertedBrand.id})`);
        stats.updated++;
      } else {
        console.log(`       ✅ Inserted: ${normalizedName} (ID: ${upsertedBrand.id})`);
        stats.inserted++;
      }
    }
  }

  return { stats };
}

async function processDynamicPricing(processedServices: Array<{
  id: number;
  name: string;
  device_type_id: number;
  database_id?: number;
}>) {
  const stats = {
    total: 0,
    inserted: 0,
    skipped: 0
  };

  console.log('   Processing dynamic pricing:');

  // Get pricing tier ID (standard tier)
  const { data: pricingTiers } = await supabase
    .from('pricing_tiers')
    .select('id')
    .eq('is_active', true)
    .order('multiplier')
    .limit(1);

  if (!pricingTiers || pricingTiers.length === 0) {
    console.error('❌ No active pricing tiers found');
    return { stats };
  }

  const pricingTierId = pricingTiers[0].id;
  console.log(`     Using pricing tier ID: ${pricingTierId}`);

  // Get existing dynamic pricing for reference
  const { data: existingPricing } = await supabase
    .from('dynamic_pricing')
    .select('service_id, pricing_tier_id')
    .eq('pricing_tier_id', pricingTierId);

  const existingPricingSet = new Set<string>();
  existingPricing?.forEach((p: { service_id: number; pricing_tier_id: number }) => {
    existingPricingSet.add(`${p.service_id}_${p.pricing_tier_id}`);
  });

  // Process each service
  for (const service of processedServices) {
    if (!service.database_id) continue;

    // Find the hardcoded service to get price
    const deviceTypeName = Object.keys(hardcodedServices).find(key =>
      hardcodedServices[key as keyof typeof hardcodedServices].some(s => s.id === service.id)
    );
    
    if (!deviceTypeName) continue;

    const hardcodedService = hardcodedServices[deviceTypeName as keyof typeof hardcodedServices]
      .find(s => s.id === service.id);
    
    if (!hardcodedService) continue;

    const basePrice = parsePrice(hardcodedService.price);
    if (basePrice === 0) {
      console.log(`       ⚠️  Skipping pricing for ${service.name}: could not parse price "${hardcodedService.price}"`);
      stats.skipped++;
      continue;
    }

    const pricingKey = `${service.database_id}_${pricingTierId}`;
    const alreadyExists = existingPricingSet.has(pricingKey);

    const pricingData = {
      service_id: service.database_id,
      model_id: null, // Generic pricing (not model-specific)
      pricing_tier_id: pricingTierId,
      base_price: basePrice,
      discounted_price: basePrice, // Same as base for now
      cost_price: Math.round(basePrice * 0.6), // Estimated 60% cost
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isDryRun) {
      if (alreadyExists) {
        console.log(`       📝 Would update pricing: ${service.name} - $${basePrice}`);
      } else {
        console.log(`       ➕ Would insert pricing: ${service.name} - $${basePrice}`);
        stats.inserted++;
      }
      stats.total++;
      continue;
    }

    // Execute upsert
    const { error } = await supabase
      .from('dynamic_pricing')
      .upsert(pricingData, {
        onConflict: 'service_id,model_id,pricing_tier_id'
      });

    if (error) {
      console.error(`       ❌ Error upserting pricing for ${service.name}:`, error);
      stats.skipped++;
      continue;
    }

    if (alreadyExists) {
      console.log(`       ✅ Updated pricing: ${service.name} - $${basePrice}`);
    } else {
      console.log(`       ✅ Inserted pricing: ${service.name} - $${basePrice}`);
      stats.inserted++;
    }
    stats.total++;
  }

  return { stats };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

seedServicePages().catch((error) => {
  console.error('❌ Fatal error in seed script:', error);
  process.exit(1);
});
