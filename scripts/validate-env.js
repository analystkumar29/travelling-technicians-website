#!/usr/bin/env node

/**
 * Environment Validation Script
 * 
 * This script validates environment variables before build/deployment.
 * It ensures all required variables are present and properly configured.
 * 
 * Usage:
 *   node scripts/validate-env.js
 *   npm run validate-env
 */

const path = require('path');
const fs = require('fs');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Required environment variables
const REQUIRED_ENV_VARS = {
  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: 'Public Supabase URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Public Supabase anonymous key',
  SUPABASE_SERVICE_ROLE_KEY: 'Supabase service role key (server-side)',
  
  // Authentication
  ADMIN_JWT_SECRET: 'JWT secret for admin authentication',
  
  // Email service
  SENDGRID_API_KEY: 'SendGrid API key for email notifications'
};

// Development fallback patterns to detect
const DEV_PATTERNS = [
  'test-',
  'localhost',
  'development-only',
  'dev-',
  'dummy-',
  'example',
  'sample'
];

// Load environment variables from .env files
function loadEnvironmentFiles() {
  const envFiles = [
    '.env.local',
    '.env.production',
    '.env.development',
    '.env'
  ];
  
  const projectRoot = path.resolve(__dirname, '..');
  
  for (const envFile of envFiles) {
    const envPath = path.join(projectRoot, envFile);
    
    if (fs.existsSync(envPath)) {
      console.log(`${colors.blue}ℹ${colors.reset} Loading environment file: ${envFile}`);
      
      try {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const lines = envContent.split('\n');
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          // Skip comments and empty lines
          if (!trimmedLine || trimmedLine.startsWith('#')) {
            continue;
          }
          
          // Parse key=value pairs
          const match = trimmedLine.match(/^([^=]+)=(.*)$/);
          if (match) {
            const [, key, value] = match;
            const trimmedKey = key.trim();
            const trimmedValue = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes
            
            // Only set if not already defined (precedence order)
            if (!process.env[trimmedKey]) {
              process.env[trimmedKey] = trimmedValue;
            }
          }
        }
      } catch (error) {
        console.log(`${colors.yellow}⚠${colors.reset} Warning: Could not read ${envFile}: ${error.message}`);
      }
    }
  }
}

// Validate that all required environment variables are present
function validateRequiredVars() {
  console.log(`\n${colors.bold}${colors.cyan}🔍 Validating Required Environment Variables${colors.reset}\n`);
  
  const missingVars = [];
  const presentVars = [];
  
  for (const [varName, description] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[varName];
    
    if (!value || value.trim() === '') {
      missingVars.push({ name: varName, description });
      console.log(`${colors.red}❌ ${varName}${colors.reset} - ${description}`);
    } else {
      presentVars.push({ name: varName, description, value });
      console.log(`${colors.green}✅ ${varName}${colors.reset} - ${description}`);
    }
  }
  
  return { missingVars, presentVars };
}

// Validate production configuration
function validateProductionConfig(presentVars) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    console.log(`\n${colors.yellow}ℹ${colors.reset} Skipping production validation (NODE_ENV: ${process.env.NODE_ENV || 'not set'})`);
    return { devFallbacks: [] };
  }
  
  console.log(`\n${colors.bold}${colors.cyan}🏭 Validating Production Configuration${colors.reset}\n`);
  
  const devFallbacks = [];
  
  for (const { name, value } of presentVars) {
    const hasDevPattern = DEV_PATTERNS.some(pattern => 
      value.toLowerCase().includes(pattern)
    );
    
    if (hasDevPattern) {
      devFallbacks.push({ name, value });
      console.log(`${colors.red}❌ ${name}${colors.reset} - Contains development fallback pattern`);
      console.log(`   ${colors.yellow}Value:${colors.reset} ${value.substring(0, 50)}...`);
    } else {
      console.log(`${colors.green}✅ ${name}${colors.reset} - Production-ready`);
    }
  }
  
  return { devFallbacks };
}

// Display environment summary
function displayEnvironmentSummary(presentVars) {
  console.log(`\n${colors.bold}${colors.cyan}📊 Environment Summary${colors.reset}\n`);
  
  console.log(`${colors.bold}Environment:${colors.reset} ${process.env.NODE_ENV || 'not set'}`);
  console.log(`${colors.bold}Platform:${colors.reset} ${process.env.VERCEL ? `Vercel (${process.env.VERCEL_ENV || 'unknown'})` : 'Local/Other'}`);
  
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    console.log(`${colors.bold}Vercel URL:${colors.reset} ${process.env.NEXT_PUBLIC_VERCEL_URL}`);
  }
  
  console.log(`${colors.bold}Variables Set:${colors.reset} ${presentVars.length}/${Object.keys(REQUIRED_ENV_VARS).length}`);
}

// Display detailed variable information
function displayVariableDetails(presentVars) {
  console.log(`\n${colors.bold}${colors.cyan}🔐 Variable Details${colors.reset}\n`);
  
  for (const { name, value } of presentVars) {
    const isSensitive = name.includes('KEY') || name.includes('SECRET');
    
    if (isSensitive) {
      const maskedValue = value.length > 6 
        ? `${value.substring(0, 6)}${'*'.repeat(Math.min(value.length - 6, 20))}...`
        : `${'*'.repeat(value.length)}`;
      console.log(`${colors.bold}${name}:${colors.reset} ${maskedValue} (length: ${value.length})`);
    } else {
      // For URLs, show domain but mask protocol and path
      if (name.includes('URL')) {
        try {
          const url = new URL(value);
          console.log(`${colors.bold}${name}:${colors.reset} ${url.hostname}`);
        } catch {
          console.log(`${colors.bold}${name}:${colors.reset} ${value.substring(0, 30)}...`);
        }
      } else {
        console.log(`${colors.bold}${name}:${colors.reset} ${value.substring(0, 30)}...`);
      }
    }
  }
}

// Generate recommendations
function generateRecommendations(missingVars, devFallbacks) {
  if (missingVars.length === 0 && devFallbacks.length === 0) {
    return;
  }
  
  console.log(`\n${colors.bold}${colors.magenta}💡 Recommendations${colors.reset}\n`);
  
  if (missingVars.length > 0) {
    console.log(`${colors.red}Missing Variables:${colors.reset}`);
    for (const { name, description } of missingVars) {
      console.log(`  • Set ${colors.bold}${name}${colors.reset} - ${description}`);
    }
    console.log(`\n${colors.cyan}For local development:${colors.reset}`);
    console.log(`  1. Create/update ${colors.bold}.env.local${colors.reset} file`);
    console.log(`  2. Add the missing variables with appropriate values`);
    console.log(`  3. Restart your development server`);
    console.log(`\n${colors.cyan}For production deployment:${colors.reset}`);
    console.log(`  1. Set environment variables in your hosting platform`);
    console.log(`  2. Ensure variables are available during build time`);
    console.log(`  3. Verify deployment environment configuration`);
  }
  
  if (devFallbacks.length > 0) {
    console.log(`\n${colors.red}Development Fallbacks in Production:${colors.reset}`);
    for (const { name } of devFallbacks) {
      console.log(`  • Update ${colors.bold}${name}${colors.reset} with production values`);
    }
    console.log(`\n${colors.cyan}Action required:${colors.reset}`);
    console.log(`  1. Replace test/development values with production credentials`);
    console.log(`  2. Verify all services are properly configured`);
    console.log(`  3. Test functionality in production environment`);
  }
}

// Main validation function
function main() {
  console.log(`${colors.bold}${colors.green}🔍 Environment Validation Script${colors.reset}`);
  console.log(`${colors.cyan}Travelling Technicians Website${colors.reset}\n`);
  
  // Load environment files
  loadEnvironmentFiles();
  
  // Validate required variables
  const { missingVars, presentVars } = validateRequiredVars();
  
  // Validate production configuration
  const { devFallbacks } = validateProductionConfig(presentVars);
  
  // Display summaries
  displayEnvironmentSummary(presentVars);
  displayVariableDetails(presentVars);
  
  // Generate recommendations
  generateRecommendations(missingVars, devFallbacks);
  
  // Final result
  const hasErrors = missingVars.length > 0 || devFallbacks.length > 0;
  
  console.log(`\n${colors.bold}${colors.cyan}📋 Validation Result${colors.reset}\n`);
  
  if (hasErrors) {
    console.log(`${colors.red}❌ Environment validation FAILED${colors.reset}`);
    console.log(`${colors.red}   Missing variables: ${missingVars.length}${colors.reset}`);
    console.log(`${colors.red}   Development fallbacks: ${devFallbacks.length}${colors.reset}`);
    
    console.log(`\n${colors.yellow}⚠${colors.reset}  The application may not function correctly.`);
    console.log(`${colors.yellow}⚠${colors.reset}  Please fix the issues above before proceeding.`);
    
    process.exit(1);
  } else {
    console.log(`${colors.green}✅ Environment validation PASSED${colors.reset}`);
    console.log(`${colors.green}   All required variables are properly configured${colors.reset}`);
    
    console.log(`\n${colors.cyan}🚀 Ready for deployment!${colors.reset}`);
    
    process.exit(0);
  }
}

// Handle script execution
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`\n${colors.red}💥 Validation script failed:${colors.reset}`);
    console.error(`${colors.red}   ${error.message}${colors.reset}`);
    
    if (error.stack) {
      console.error(`\n${colors.yellow}Stack trace:${colors.reset}`);
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}
