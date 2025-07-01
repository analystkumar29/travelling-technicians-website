// Script to remove authentication from the database
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run SQL file against Supabase
const runSqlFile = (filePath) => {
  console.log(`Running SQL file: ${filePath}`);
  
  try {
    // Read the SQL file
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log('SQL file content:');
    console.log(sql);
    
    // Write SQL to a temporary file
    const tempFile = path.join(__dirname, 'temp-sql.sql');
    fs.writeFileSync(tempFile, sql);
    
    // Use Supabase CLI or direct connection to run the SQL
    // This example assumes direct connection using environment variables
    console.log('Executing SQL file...');
    
    // Using psql (if available)
    try {
      // Replace with your actual connection string or use environment variables
      const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
      
      if (!SUPABASE_DB_URL) {
        throw new Error('Database URL not found in environment variables. Please set SUPABASE_DB_URL or DATABASE_URL.');
      }
      
      // Execute the SQL file
      const command = `psql "${SUPABASE_DB_URL}" -f "${tempFile}"`;
      console.log(`Running command: ${command.replace(SUPABASE_DB_URL, '***DATABASE_URL***')}`);
      execSync(command, { stdio: 'inherit' });
      console.log('SQL executed successfully');
    } catch (psqlError) {
      console.error('Error executing SQL with psql:', psqlError.message);
      console.log('Trying alternative methods...');
      
      // Try Supabase CLI if available
      try {
        execSync(`supabase db execute --file "${tempFile}"`, { stdio: 'inherit' });
        console.log('SQL executed successfully with Supabase CLI');
      } catch (supabaseCliError) {
        console.error('Error executing SQL with Supabase CLI:', supabaseCliError.message);
        console.error('Failed to execute SQL. Please run the SQL file manually.');
      }
    }
    
    // Clean up temporary file
    fs.unlinkSync(tempFile);
  } catch (error) {
    console.error('Error running SQL file:', error.message);
    process.exit(1);
  }
};

console.log('Starting authentication removal process...');
const sqlFile = path.join(__dirname, 'sql', 'remove-authentication.sql');
runSqlFile(sqlFile);
console.log('Authentication removal process completed.'); 