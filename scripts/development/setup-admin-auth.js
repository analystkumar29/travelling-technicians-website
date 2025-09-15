#!/usr/bin/env node

/**
 * ADMIN AUTHENTICATION SETUP SCRIPT
 * 
 * This script sets up a dedicated admin authentication system with:
 * - Separate ADMIN_JWT_SECRET (different from booking verification)
 * - Secure environment variable setup
 * - Admin password hash generation
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate secure secrets
const ADMIN_JWT_SECRET = crypto.randomBytes(32).toString('hex');
const BOOKING_VERIFICATION_SECRET = crypto.randomBytes(32).toString('hex');

console.log('🔐 SETTING UP ADMIN AUTHENTICATION');
console.log('==================================\n');

// Environment file template
const envTemplate = (isProduction = false) => `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Admin Authentication (SEPARATE from booking verification)
ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET}
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=

# Booking Verification (SEPARATE from admin auth)
BOOKING_VERIFICATION_SECRET=${BOOKING_VERIFICATION_SECRET}

# SendGrid Configuration
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=bookings@travelling-technicians.ca
SENDGRID_FROM_NAME=The Travelling Technicians
SENDGRID_TEMPLATE_ID=d-c9dbac568573432bb15f79c92c4fd4b5
SENDGRID_RESCHEDULE_TEMPLATE_ID=d-c9dbac568573432bb15f79c92c4fd4b5

# Website Configuration
NEXT_PUBLIC_WEBSITE_URL=${isProduction ? 'https://travelling-technicians.ca' : 'http://localhost:3000'}
NEXT_PUBLIC_BASE_URL=${isProduction ? 'https://travelling-technicians.ca' : 'http://localhost:3000'}
NEXT_PUBLIC_API_BASE_URL=${isProduction ? 'https://travelling-technicians.ca' : 'http://localhost:3000'}

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Database (for Docker development)
POSTGRES_PASSWORD=your_secure_postgres_password_here
POSTGRES_USER=postgres
POSTGRES_DB=travelling_technicians

# Environment
NODE_ENV=${isProduction ? 'production' : 'development'}
`;

try {
  // Create .env.local for development
  fs.writeFileSync('.env.local', envTemplate(false));
  console.log('✅ Created .env.local for development');

  // Create .env.production for production
  fs.writeFileSync('.env.production', envTemplate(true));
  console.log('✅ Created .env.production for production');

  console.log('\n🔑 Admin JWT Secret Generated:');
  console.log(`ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET}`);
  
  console.log('\n📋 Next Steps:');
  console.log('1. Run: node generate-admin-password.js');
  console.log('2. Add the generated ADMIN_PASSWORD_HASH to both .env files');
  console.log('3. Update your Vercel/production environment with these variables');
  
  console.log('\n🛡️  Security Notes:');
  console.log('   - Admin auth now uses separate secret from booking verification');
  console.log('   - ADMIN_JWT_SECRET is different from BOOKING_VERIFICATION_SECRET');
  console.log('   - Never commit .env files to version control');
  console.log('   - Admin tokens are separate from booking tokens');
  
  console.log('\n✅ Environment files created successfully!');

} catch (error) {
  console.error('❌ Error creating environment files:', error.message);
  process.exit(1);
} 