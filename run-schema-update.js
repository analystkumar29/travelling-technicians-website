// Script to execute SQL updates on the database
require('dotenv').config();
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Verify required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  if (!supabaseUrl) console.error('- NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSchemaUpdate() {
  console.log('=== DATABASE SCHEMA UPDATE ===');
  
  try {
    // Read SQL file
    const sqlFilePath = './update-bookings-triggers.sql';
    console.log(`Reading SQL file: ${sqlFilePath}`);
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error(`Error: SQL file not found at ${sqlFilePath}`);
      process.exit(1);
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('SQL file loaded successfully');
    
    // Split the SQL content into individual statements
    // This simplistic approach assumes statements end with semicolons not in comments
    // For a more robust solution, consider using a proper SQL parser
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      // For debugging
      // console.log(`Statement: ${statement.substring(0, 100)}...`);
      
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: statement
      });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        
        // Continue with the next statement rather than exiting
        // This allows partial application of the schema updates
        console.log('Continuing with next statement...');
        continue;
      }
      
      console.log(`Statement ${i + 1} executed successfully`);
      
      // If the statement returns data (like SELECT), log the result
      if (data && data.rows && data.rows.length > 0) {
        console.log('Statement result:', data.rows);
      }
    }
    
    // Verify the schema after updates
    console.log('\nVerifying current schema...');
    const { data: schemaData, error: schemaError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'bookings'
        ORDER BY ordinal_position;
      `
    });
    
    if (schemaError) {
      console.error('Error verifying schema:', schemaError);
    } else {
      console.log('Current bookings table schema:');
      if (schemaData && schemaData.rows) {
        schemaData.rows.forEach(column => {
          console.log(`- ${column.column_name} (${column.data_type})`);
        });
      } else {
        console.log('No schema data returned');
      }
    }
    
    console.log('\n✅ Schema update completed successfully');
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
runSchemaUpdate(); 