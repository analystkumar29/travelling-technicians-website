#!/usr/bin/env node

/**
 * Verification script to check current service status
 * This helps verify which services are active/inactive before and after changes
 */

const { createClient } = require('@supabase/supabase-js');

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing required environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyServiceStatus() {
  console.log('🔍 Verifying current service status...\n');
  
  try {
    // Get all services with their categories and device types
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        *,
        category:service_categories(name),
        device_type:device_types(name)
      `)
      .order('name');
    
    if (error) {
      throw new Error(`Failed to fetch services: ${error.message}`);
    }
    
    console.log(`📊 Total services: ${services.length}\n`);
    
    // Count active vs inactive
    const activeServices = services.filter(s => s.is_active);
    const inactiveServices = services.filter(s => !s.is_active);
    
    console.log(`✅ Active services: ${activeServices.length}`);
    console.log(`❌ Inactive services: ${inactiveServices.length}\n`);
    
    // Identify battery and screen services
    const batteryScreenServices = services.filter(service => {
      const name = service.name.toLowerCase();
      const displayName = (service.display_name || '').toLowerCase();
      const slug = service.slug.toLowerCase();
      
      return name.includes('battery') || name.includes('screen') ||
             displayName.includes('battery') || displayName.includes('screen') ||
             slug.includes('battery') || slug.includes('screen');
    });
    
    console.log(`🔋 Battery/Screen services: ${batteryScreenServices.length}`);
    
    // Show battery/screen services status
    console.log('\n🔋 Battery/Screen Services:');
    batteryScreenServices.forEach(service => {
      const status = service.is_active ? '✅ ACTIVE' : '❌ INACTIVE';
      const category = service.category?.name || 'No category';
      const deviceType = service.device_type?.name || 'No device type';
      console.log(`  • ${service.name} (${service.slug})`);
      console.log(`    Status: ${status} | Category: ${category} | Device: ${deviceType}`);
    });
    
    // Show all services in a table format
    console.log('\n📋 All Services Summary:');
    console.log('=' .repeat(80));
    console.log('| Name'.padEnd(40) + '| Slug'.padEnd(20) + '| Status'.padEnd(12) + '| Battery/Screen |');
    console.log('=' .repeat(80));
    
    services.forEach(service => {
      const isBatteryScreen = batteryScreenServices.includes(service);
      const name = service.name.length > 38 ? service.name.substring(0, 35) + '...' : service.name;
      const slug = service.slug.length > 18 ? service.slug.substring(0, 15) + '...' : service.slug;
      const status = service.is_active ? 'Active' : 'Inactive';
      const batteryScreen = isBatteryScreen ? 'Yes' : 'No';
      
      console.log(`| ${name.padEnd(38)} | ${slug.padEnd(18)} | ${status.padEnd(10)} | ${batteryScreen.padEnd(13)} |`);
    });
    
    console.log('=' .repeat(80));
    
    // Summary statistics
    console.log('\n📈 Summary Statistics:');
    console.log(`• Total services: ${services.length}`);
    console.log(`• Active services: ${activeServices.length} (${Math.round(activeServices.length / services.length * 100)}%)`);
    console.log(`• Inactive services: ${inactiveServices.length} (${Math.round(inactiveServices.length / services.length * 100)}%)`);
    console.log(`• Battery/Screen services: ${batteryScreenServices.length}`);
    console.log(`• Active Battery/Screen: ${batteryScreenServices.filter(s => s.is_active).length}`);
    console.log(`• Inactive Battery/Screen: ${batteryScreenServices.filter(s => !s.is_active).length}`);
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (batteryScreenServices.some(s => !s.is_active)) {
      console.log('⚠️  Some battery/screen services are inactive. Consider activating them.');
    }
    
    const nonBatteryScreenActive = services.filter(s => 
      s.is_active && !batteryScreenServices.includes(s)
    ).length;
    
    if (nonBatteryScreenActive > 0) {
      console.log(`⚠️  ${nonBatteryScreenActive} non-battery/screen services are active.`);
      console.log('   Consider deactivating them if you only want battery/screen services active.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the function
verifyServiceStatus();