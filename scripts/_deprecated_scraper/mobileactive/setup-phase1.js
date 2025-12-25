// Setup script for Phase 1: Data Import
// Checks prerequisites and prepares the environment

const fs = require('fs');
const path = require('path');

const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }[level];
  console.log(`${timestamp} ${emoji} ${message}`);
};

async function checkPrerequisites() {
  log('🔍 Checking Phase 1 prerequisites...');
  
  const checks = [];
  
  // Check 1: Environment variables
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  checks.push({
    name: 'Supabase Environment Variables',
    status: hasSupabaseUrl && hasSupabaseKey,
    details: {
      'NEXT_PUBLIC_SUPABASE_URL': hasSupabaseUrl ? '✅ Set' : '❌ Missing',
      'SUPABASE_SERVICE_ROLE_KEY': hasSupabaseKey ? '✅ Set' : '❌ Missing'
    }
  });
  
  // Check 2: Required data files
  const requiredFiles = [
    'tmp/mobileactive-improved-cleaned.json',
    'tmp/integration-schema.sql',
    'tmp/data-mapping.json'
  ];
  
  const fileChecks = {};
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    const exists = fs.existsSync(filePath);
    fileChecks[file] = exists ? '✅ Found' : '❌ Missing';
  });
  
  checks.push({
    name: 'Required Data Files',
    status: requiredFiles.every(file => fs.existsSync(path.join(__dirname, file))),
    details: fileChecks
  });
  
  // Check 3: Node modules
  const hasSupabase = fs.existsSync(path.join(__dirname, '../../node_modules/@supabase/supabase-js'));
  
  checks.push({
    name: 'Required Node Modules',
    status: hasSupabase,
    details: {
      '@supabase/supabase-js': hasSupabase ? '✅ Installed' : '❌ Missing'
    }
  });
  
  // Display results
  console.log('\n📋 Prerequisites Check Results:');
  console.log('=' .repeat(50));
  
  let allPassed = true;
  
  checks.forEach(check => {
    const status = check.status ? '✅ PASS' : '❌ FAIL';
    console.log(`\n${status} ${check.name}`);
    
    Object.entries(check.details).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    if (!check.status) allPassed = false;
  });
  
  return allPassed;
}

async function prepareEnvironment() {
  log('🔧 Preparing environment for Phase 1...');
  
  try {
    // Create tmp directory if it doesn't exist
    const tmpDir = path.join(__dirname, 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
      log('📁 Created tmp directory');
    }
    
    // Check if we need to run the integration schema generator
    const schemaPath = path.join(__dirname, 'tmp/integration-schema.sql');
    if (!fs.existsSync(schemaPath)) {
      log('⚠️ Integration schema not found. Running schema generator...');
      
      // Import and run the schema generator
      const { generateIntegrationFiles } = require('./create-integration-schema');
      await generateIntegrationFiles();
      
      log('✅ Integration schema generated');
    }
    
    // Check if we need to run the data mapping generator
    const mappingPath = path.join(__dirname, 'tmp/data-mapping.json');
    if (!fs.existsSync(mappingPath)) {
      log('⚠️ Data mapping not found. Running mapping generator...');
      
      // Import and run the mapping generator
      const { generateIntegrationFiles } = require('./create-integration-schema');
      await generateIntegrationFiles();
      
      log('✅ Data mapping generated');
    }
    
    log('✅ Environment prepared successfully');
    return true;
  } catch (error) {
    log(`❌ Environment preparation failed: ${error.message}`, 'error');
    return false;
  }
}

async function displayNextSteps() {
  console.log('\n🚀 Ready to run Phase 1: Data Import');
  console.log('=' .repeat(50));
  console.log('📊 What will happen:');
  console.log('  1. 🔧 Run integration schema (creates new tables)');
  console.log('  2. 📦 Import MobileActive data (5,705+ products)');
  console.log('  3. 🔗 Map to existing device models');
  console.log('  4. 💰 Create pricing entries with your markup strategy');
  console.log('');
  console.log('⏱️  Estimated time: 5-10 minutes');
  console.log('💾 Database impact: ~5,705 new products + pricing entries');
  console.log('');
  console.log('🔧 To run Phase 1:');
  console.log('  node phase1-data-import.js');
  console.log('');
  console.log('⚠️  Make sure to backup your database before proceeding!');
}

async function main() {
  log('🚀 Phase 1 Setup - MobileActive Integration');
  console.log('=' .repeat(50));
  
  try {
    // Check prerequisites
    const prerequisitesOk = await checkPrerequisites();
    
    if (!prerequisitesOk) {
      log('❌ Prerequisites check failed. Please fix the issues above.', 'error');
      console.log('\n🔧 To fix:');
      console.log('  1. Set environment variables in your .env file');
      console.log('  2. Run: npm install @supabase/supabase-js');
      console.log('  3. Ensure MobileActive data files are present');
      process.exit(1);
    }
    
    // Prepare environment
    const environmentOk = await prepareEnvironment();
    
    if (!environmentOk) {
      log('❌ Environment preparation failed.', 'error');
      process.exit(1);
    }
    
    // Display next steps
    await displayNextSteps();
    
    log('✅ Setup completed successfully!', 'success');
    
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { checkPrerequisites, prepareEnvironment }; 