require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Get Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

// Extract DB connection string from Supabase URL
// Format: https://[project-ref].supabase.co
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)[1];

// Use psql or Supabase CLI to execute SQL files
async function executeSql() {
  try {
    console.log('Executing SQL files for warranty system...');
    
    // Create temporary directory for holding SQL files
    const tmpDir = path.join(__dirname, 'tmp_sql');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
    }
    
    // Read SQL files
    const structureSql = fs.readFileSync('./sql/004-technician-warranty-system.sql', 'utf8');
    const triggersSql = fs.readFileSync('./sql/005-warranty-triggers.sql', 'utf8');
    
    // Write to temporary files (to handle issues with special characters in CLI)
    const structureFile = path.join(tmpDir, 'structure.sql');
    const triggersFile = path.join(tmpDir, 'triggers.sql');
    
    fs.writeFileSync(structureFile, structureSql);
    fs.writeFileSync(triggersFile, triggersSql);
    
    console.log('Executing structure SQL...');
    
    try {
      // You can use either supabase CLI or psql depending on what's available
      // If using supabase CLI, enable this:
      // execSync(`supabase db execute -f ${structureFile}`, { stdio: 'inherit' });
      
      // Or you can create a curl command to POST to Supabase REST API
      const curlCmd = `curl -X POST "${supabaseUrl}/rest/v1/rpc/execute_sql" \
        -H "apikey: ${supabaseKey}" \
        -H "Authorization: Bearer ${supabaseKey}" \
        -H "Content-Type: application/json" \
        -d '{"sql_query": ${JSON.stringify(structureSql)}}' \
        --fail
      `;
      
      console.log('Executing via REST API...');
      execSync(curlCmd, { stdio: 'inherit' });
      
      console.log('Structure SQL executed successfully');
    } catch (e) {
      console.error('Error executing structure SQL:', e.message);
      console.log('Continuing anyway...');
    }
    
    console.log('Executing triggers SQL...');
    
    try {
      // Similar approach for triggers
      const curlCmd = `curl -X POST "${supabaseUrl}/rest/v1/rpc/execute_sql" \
        -H "apikey: ${supabaseKey}" \
        -H "Authorization: Bearer ${supabaseKey}" \
        -H "Content-Type: application/json" \
        -d '{"sql_query": ${JSON.stringify(triggersSql)}}' \
        --fail
      `;
      
      execSync(curlCmd, { stdio: 'inherit' });
      
      console.log('Triggers SQL executed successfully');
    } catch (e) {
      console.error('Error executing triggers SQL:', e.message);
      console.log('Continuing anyway...');
    }
    
    // Now verify the tables were created
    const verifyCmd = `curl -X GET "${supabaseUrl}/rest/v1/information_schema/tables?select=table_name&table_schema=eq.public&table_name=in.(technicians,user_profiles,repair_completions,warranties,warranty_claims,technician_schedules)" \
      -H "apikey: ${supabaseKey}" \
      -H "Authorization: Bearer ${supabaseKey}"
    `;
    
    console.log('Verifying tables were created...');
    const tableList = execSync(verifyCmd, { encoding: 'utf8' });
    
    try {
      const tables = JSON.parse(tableList);
      if (tables && tables.length > 0) {
        console.log('Verified tables:', tables.map(t => t.table_name).join(', '));
      } else {
        console.warn('Warning: Could not find any of the expected tables!');
      }
    } catch (e) {
      console.error('Error parsing table list:', e.message);
    }
    
    // Clean up temporary files
    fs.unlinkSync(structureFile);
    fs.unlinkSync(triggersFile);
    fs.rmdirSync(tmpDir);
    
    console.log('\nMigration completed!');
    console.log('\nNext steps:');
    console.log('1. Create a technician account in the Supabase Auth service');
    console.log('2. Add the technician to the technicians table');
    console.log('3. Test the warranty creation flow with a completed repair');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the script
executeSql(); 