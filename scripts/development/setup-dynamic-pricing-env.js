#!/usr/bin/env node

/**
 * Dynamic Pricing Environment Setup Script
 * Creates .env.local and tests database connection
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Dynamic Pricing Environment Setup\n');

// Create .env.local file
const envContent = `# Environment variables for The Travelling Technicians website
# Required for dynamic pricing system and database connections

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lzgrpcgfcevmnrxbvpfw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Add your actual Supabase service role key above
# You can find this in: Supabase Dashboard > Project Settings > API > service_role (secret)

# SendGrid Configuration (optional - for email notifications)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=repairs@travellingtechnicians.ca

# Admin Panel Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your_bcrypt_password_hash_here
`;

const envPath = path.join(process.cwd(), '.env.local');

try {
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Creating backup...');
    fs.copyFileSync(envPath, envPath + '.backup');
    console.log('✅ Backup created: .env.local.backup');
  }

  // Write the environment file
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Open .env.local in your editor');
  console.log('2. Replace "your_supabase_service_role_key_here" with your actual Supabase service role key');
  console.log('3. Get your service role key from: https://supabase.com/dashboard/project/lzgrpcgfcevmnrxbvpfw/settings/api');
  console.log('4. Look for the "service_role" key (marked as secret)');
  console.log('5. Run: node scripts/test-dynamic-apis.js');
  
  console.log('\n🔗 Useful Links:');
  console.log('- Supabase Dashboard: https://supabase.com/dashboard/project/lzgrpcgfcevmnrxbvpfw');
  console.log('- API Settings: https://supabase.com/dashboard/project/lzgrpcgfcevmnrxbvpfw/settings/api');
  
  console.log('\n⚠️  Security Note:');
  console.log('The service role key is very powerful - keep it secret and never commit it to git!');
  
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  console.log('\n🔧 Manual Setup Instructions:');
  console.log('1. Create a file called ".env.local" in the project root');
  console.log('2. Copy the following content into it:');
  console.log('\n' + envContent);
}

// Test if we can load dotenv
try {
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('\n🧪 Environment Test:');
  console.log(`- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Not set'}`);
  console.log(`- SUPABASE_SERVICE_ROLE_KEY: ${serviceKey && serviceKey !== 'your_supabase_service_role_key_here' ? '✅ Set' : '❌ Not set (please update)'}`);
  
  if (supabaseUrl && serviceKey && serviceKey !== 'your_supabase_service_role_key_here') {
    console.log('\n🎉 Environment setup complete! Ready to test database connection.');
    console.log('Run: node scripts/test-dynamic-apis.js');
  }
  
} catch (error) {
  console.log('\n⚠️  Could not load environment variables. Make sure dotenv is installed.');
} 