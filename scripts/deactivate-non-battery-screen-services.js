#!/usr/bin/env node

/**
 * Node.js script to deactivate all services except battery and screen replacements
 * This script connects to Supabase and updates the is_active status
 * 
 * Usage:
 * 1. Make sure you have the Supabase URL and anon key in your environment
 * 2. Run: node scripts/deactivate-non-battery-screen-services.js
 * 
 * Environment variables needed:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
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

async function deactivateNonBatteryScreenServices() {
  console.log('🚀 Starting service deactivation process...');
  console.log('📊 This will deactivate all services except battery and screen replacements');
  
  try {
    // Step 1: Get all services
    console.log('\n📋 Step 1: Fetching all services...');
    const { data: services, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .order('name');
    
    if (fetchError) {
      throw new Error(`Failed to fetch services: ${fetchError.message}`);
    }
    
    console.log(`✅ Found ${services.length} services`);
    
    // Step 2: Identify services to deactivate
    console.log('\n🔍 Step 2: Identifying services to deactivate...');
    const servicesToDeactivate = services.filter(service => {
      const name = service.name.toLowerCase();
      const displayName = (service.display_name || '').toLowerCase();
      const slug = service.slug.toLowerCase();
      
      // Keep services that contain "battery" or "screen" in name, display_name, or slug
      const isBatteryOrScreen = 
        name.includes('battery') || name.includes('screen') ||
        displayName.includes('battery') || displayName.includes('screen') ||
        slug.includes('battery') || slug.includes('screen');
      
      return !isBatteryOrScreen;
    });
    
    const servicesToKeep = services.filter(service => {
      const name = service.name.toLowerCase();
      const displayName = (service.display_name || '').toLowerCase();
      const slug = service.slug.toLowerCase();
      
      return name.includes('battery') || name.includes('screen') ||
             displayName.includes('battery') || displayName.includes('screen') ||
             slug.includes('battery') || slug.includes('screen');
    });
    
    console.log(`📊 Services to keep active (battery/screen): ${servicesToKeep.length}`);
    console.log(`📊 Services to deactivate: ${servicesToDeactivate.length}`);
    
    // Show services to keep
    console.log('\n✅ Services that will remain ACTIVE:');
    servicesToKeep.forEach(service => {
      console.log(`  • ${service.name} (${service.slug}) - ${service.is_active ? 'Active' : 'Inactive'}`);
    });
    
    // Show services to deactivate
    console.log('\n❌ Services that will be DEACTIVATED:');
    servicesToDeactivate.forEach(service => {
      console.log(`  • ${service.name} (${service.slug}) - Currently: ${service.is_active ? 'Active' : 'Inactive'}`);
    });
    
    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will deactivate the services listed above.');
    console.log('   Only battery and screen services will remain active.');
    
    // For safety, we'll require manual confirmation
    // In a real script, you might want to add a prompt here
    console.log('\n🔒 Safety check: To proceed, uncomment the update code below.');
    console.log('   Then run the script again.');
    
    // Step 3: Deactivate services (commented out for safety)
    /*
    console.log('\n🔄 Step 3: Updating services...');
    
    const serviceIdsToDeactivate = servicesToDeactivate.map(s => s.id);
    
    if (serviceIdsToDeactivate.length > 0) {
      const { error: updateError } = await supabase
        .from('services')
        .update({ is_active: false })
        .in('id', serviceIdsToDeactivate);
      
      if (updateError) {
        throw new Error(`Failed to update services: ${updateError.message}`);
      }
      
      console.log(`✅ Successfully deactivated ${serviceIdsToDeactivate.length} services`);
    } else {
      console.log('✅ No services to deactivate');
    }
    
    // Step 4: Verify the changes
    console.log('\n📋 Step 4: Verifying changes...');
    const { data: updatedServices, error: verifyError } = await supabase
      .from('services')
      .select('id, name, slug, is_active')
      .order('name');
    
    if (verifyError) {
      throw new Error(`Failed to verify changes: ${verifyError.message}`);
    }
    
    const activeCount = updatedServices.filter(s => s.is_active).length;
    const inactiveCount = updatedServices.filter(s => !s.is_active).length;
    
    console.log(`📊 Final status: ${activeCount} active, ${inactiveCount} inactive services`);
    console.log('\n🎉 Process completed successfully!');
    */
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the function
deactivateNonBatteryScreenServices();