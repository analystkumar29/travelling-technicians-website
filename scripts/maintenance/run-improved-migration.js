// This script sets the environment variables and runs the improved migration script
require('dotenv').config({ path: '.env.local' });

// Log the current configuration before running
console.log('Starting migration with the following configuration:');
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured (hidden)' : 'Not configured');
console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configured (hidden)' : 'Not configured');

// Run the improved migration script
require('./improved-warranty-migration.js'); 