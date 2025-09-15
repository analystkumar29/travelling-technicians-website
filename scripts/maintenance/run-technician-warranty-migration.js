require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  try {
    console.log('Starting technician and warranty system migrations...');
    
    // Read migration files
    const structureSql = fs.readFileSync('./sql/004-technician-warranty-system.sql', 'utf8');
    const triggersSql = fs.readFileSync('./sql/005-warranty-triggers.sql', 'utf8');
    
    // Run structure migrations first
    console.log('Creating tables and relationships...');
    
    // Instead of using exec_sql RPC, we'll use the REST API to run the SQL
    const structureResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        query: structureSql
      })
    });

    if (!structureResponse.ok) {
      const errorData = await structureResponse.json();
      throw new Error(`Error running structure migrations: ${JSON.stringify(errorData)}`);
    }
    
    console.log('Tables created successfully.');
    
    // Then run triggers
    console.log('Creating triggers and functions...');
    const triggersResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({
        query: triggersSql
      })
    });

    if (!triggersResponse.ok) {
      const errorData = await triggersResponse.json();
      throw new Error(`Error running trigger migrations: ${JSON.stringify(errorData)}`);
    }
    
    console.log('Triggers created successfully.');
    
    // Check if tables were created
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', [
        'technicians', 
        'user_profiles', 
        'repair_completions', 
        'warranties', 
        'warranty_claims',
        'technician_schedules'
      ]);
    
    if (tablesError) {
      console.warn('Warning: Could not verify tables:', tablesError.message);
    } else {
      console.log('Verified tables:', tables.map(t => t.table_name).join(', '));
    }
    
    console.log('\nMigration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Create a technician account in the Supabase Auth service');
    console.log('2. Add the technician to the technicians table');
    console.log('3. Test the warranty creation flow with a completed repair');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migrations
runMigrations(); 