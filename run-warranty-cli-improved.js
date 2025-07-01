// Improved CLI wrapper script
require('dotenv').config({ path: '.env.local' });

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

// Log configuration
console.log('Warranty CLI starting with the following configuration:');
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured (hidden)' : 'Not configured');
console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configured (hidden)' : 'Not configured');

// Run the CLI tool
try {
  require('./scripts/manage-warranties.js');
} catch (error) {
  console.error('Error running warranty CLI:', error.message);
  process.exit(1);
} 