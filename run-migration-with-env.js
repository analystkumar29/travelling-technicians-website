// Load environment variables from .env file
require('dotenv').config();

// Ensure required environment variables are set
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

// Now run the migration script
require('./run-technician-warranty-migration.js'); 