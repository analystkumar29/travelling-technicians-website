// Test script for getNearbyLocations function

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

async function testNearbyLocations() {
  console.log('Testing getNearbyLocations function...');
  console.log('Environment variables set:', {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
  });
  
  try {
    // Dynamically import the module AFTER environment variables are set
    const { getNearbyLocations } = await import('../src/lib/data-service');
    
    // Test with Vancouver
    console.log('\n1. Testing with city: vancouver');
    const vancouverResults = await getNearbyLocations('vancouver');
    console.log('Vancouver nearby locations:', JSON.stringify(vancouverResults, null, 2));
    
    // Test with Burnaby
    console.log('\n2. Testing with city: burnaby');
    const burnabyResults = await getNearbyLocations('burnaby');
    console.log('Burnaby nearby locations:', JSON.stringify(burnabyResults, null, 2));
    
    // Test with a city that doesn't exist
    console.log('\n3. Testing with non-existent city: nonexistent');
    const nonExistentResults = await getNearbyLocations('nonexistent');
    console.log('Non-existent city results:', JSON.stringify(nonExistentResults, null, 2));
    
  } catch (error) {
    console.error('Error testing getNearbyLocations:', error);
  }
}

// Run the test
testNearbyLocations();