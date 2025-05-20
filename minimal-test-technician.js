require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTechnician() {
  console.log('Creating minimal test technician...');
  
  try {
    // Get table info first
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('execute_sql', {
        sql_query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'technicians';"
      });
      
    if (tableError) {
      console.error('Error getting table info:', tableError.message);
    } else {
      console.log('Technicians table columns:', tableInfo);
    }
      
    // First, check for existing technicians 
    const { data: existing, error: existingError } = await supabase
      .from('technicians')
      .select('*');
      
    if (existingError) {
      console.error('Error querying technicians:', existingError.message);
      return;
    }
    
    console.log('Existing technicians:', existing ? existing.length : 0);
    
    if (existing && existing.length > 0) {
      console.log('First technician properties:', Object.keys(existing[0]));
    }
    
    // Create a technician that matches the SQL schema
    const techData = {
      full_name: 'Test Technician',
      email: 'tech@thetravellingtechnicians.com',
      phone: '604-123-4567',
      specializations: ['mobile', 'laptop'],
      active_service_areas: ['V5K', 'V5L', 'V5M'],
      is_active: true,
      hourly_rate: 85.00,
      max_daily_bookings: 8
    };
    
    const { data, error } = await supabase
      .from('technicians')
      .insert(techData)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating technician:', error.message);
      
      // Try a minimal insert instead
      console.log('Trying minimal insert...');
      const minimalData = {
        full_name: 'Test Technician',
        email: 'tech@thetravellingtechnicians.com',
        phone: '604-123-4567'
      };
      
      const { data: minData, error: minError } = await supabase
        .from('technicians')
        .insert(minimalData)
        .select()
        .single();
        
      if (minError) {
        console.error('Error with minimal insert:', minError.message);
      } else {
        console.log('✅ Created technician with minimal data:', minData);
      }
    } else {
      console.log('✅ Created technician:', data);
    }
  } catch (err) {
    console.error('Exception:', err.message);
  }
}

createTechnician(); 