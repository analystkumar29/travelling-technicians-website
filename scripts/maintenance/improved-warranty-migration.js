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

console.log('Initializing Supabase client with service role key...');
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigrations() {
  try {
    console.log('Starting technician and warranty system migrations...');
    
    // Read migration files
    const structureSql = fs.readFileSync('./sql/004-technician-warranty-system.sql', 'utf8');
    const triggersSql = fs.readFileSync('./sql/005-warranty-triggers.sql', 'utf8');
    
    // Run structure migrations first using RPC
    console.log('Creating tables and relationships...');
    
    try {
      const { data: structureData, error: structureError } = await supabase.rpc('execute_sql', {
        sql: structureSql
      });
      
      if (structureError) {
        throw new Error(`RPC error: ${structureError.message}`);
      }
      
      console.log('Tables created successfully via RPC.');
    } catch (rpcError) {
      console.log('Warning: RPC method failed, trying with direct PostgreSQL query...');
      console.log('RPC Error:', rpcError.message);
      
      // We'll use the Supabase REST API as an alternative
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ sql: structureSql })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`REST API error: ${JSON.stringify(errorData)}`);
        }
        
        console.log('Tables created successfully via REST API.');
      } catch (restError) {
        console.error('Error with REST API approach:', restError.message);
        throw new Error('Failed to create tables. Please check Supabase permissions and connection.');
      }
    }
    
    // Run triggers with similar approach
    console.log('Creating triggers and functions...');
    try {
      const { data: triggerData, error: triggerError } = await supabase.rpc('execute_sql', {
        sql: triggersSql
      });
      
      if (triggerError) {
        throw new Error(`RPC error: ${triggerError.message}`);
      }
      
      console.log('Triggers created successfully via RPC.');
    } catch (rpcError) {
      console.log('Warning: RPC method failed, trying with direct PostgreSQL query...');
      console.log('RPC Error:', rpcError.message);
      
      // We'll use the Supabase REST API as an alternative
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ sql: triggersSql })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`REST API error: ${JSON.stringify(errorData)}`);
        }
        
        console.log('Triggers created successfully via REST API.');
      } catch (restError) {
        console.error('Error with REST API approach:', restError.message);
        throw new Error('Failed to create triggers. Please check Supabase permissions and connection.');
      }
    }
    
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
      if (tables && tables.length > 0) {
        console.log('Verified tables:', tables.map(t => t.table_name).join(', '));
      } else {
        console.warn('Warning: Could not find any of the expected tables!');
      }
    }
    
    // Run test insert with sample data
    console.log('\nRunning test data insert...');
    const sampleData = fs.readFileSync('./sample-data.sql', 'utf8');
    
    try {
      const { error: sampleError } = await supabase.rpc('execute_sql', {
        sql: sampleData
      });
      
      if (sampleError) {
        console.log('Warning: RPC method failed for sample data, trying REST API...');
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ sql: sampleData })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.warn('Warning: Could not insert sample data:', JSON.stringify(errorData));
        } else {
          console.log('Sample data inserted successfully via REST API.');
        }
      } else {
        console.log('Sample data inserted successfully via RPC.');
      }
    } catch (sampleExecError) {
      console.warn('Warning: Could not insert sample data:', sampleExecError.message);
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