// Run Phase 1 with environment variables loaded
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '../../.env.local');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (value && !key.startsWith('#')) {
          envVars[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
      }
    });
    
    // Set environment variables
    Object.entries(envVars).forEach(([key, value]) => {
      process.env[key] = value;
    });
    
    console.log('✅ Loaded environment variables from .env.local');
    return true;
  } else {
    console.log('⚠️ .env.local not found, trying .env');
    
    const envPath2 = path.join(__dirname, '../../.env');
    if (fs.existsSync(envPath2)) {
      const envContent = fs.readFileSync(envPath2, 'utf8');
      const envVars = {};
      
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          if (value && !key.startsWith('#')) {
            envVars[key.trim()] = value.replace(/^["']|["']$/g, '');
          }
        }
      });
      
      // Set environment variables
      Object.entries(envVars).forEach(([key, value]) => {
        process.env[key] = value;
      });
      
      console.log('✅ Loaded environment variables from .env');
      return true;
    }
    
    console.log('❌ No environment file found');
    return false;
  }
}

// Run the setup or import
async function main() {
  console.log('🔧 Loading environment variables...');
  
  const envLoaded = loadEnvFile();
  
  if (!envLoaded) {
    console.log('❌ Failed to load environment variables');
    process.exit(1);
  }
  
  // Check if required variables are present
  const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
  
  console.log('✅ Environment variables loaded successfully');
  console.log(`📡 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...`);
  console.log(`🔑 Service Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`);
  
  // If an argument is provided, require and run that script as main
  const scriptArg = process.argv[2];
  if (scriptArg) {
    const scriptPath = path.isAbsolute(scriptArg)
      ? scriptArg
      : path.join(__dirname, scriptArg);
    console.log(`\n🚀 Running script: ${scriptPath}`);
    try {
      require(scriptPath);
    } catch (error) {
      console.log(`❌ Failed to run script: ${error.message}`);
      process.exit(1);
    }
    return;
  }

  // Otherwise, just run the setup
  console.log('\n🚀 Running Phase 1 setup...');
  try {
    const { checkPrerequisites, prepareEnvironment } = require('./setup-phase1');
    const prerequisitesOk = await checkPrerequisites();
    if (!prerequisitesOk) {
      console.log('❌ Prerequisites check failed');
      process.exit(1);
    }
    const environmentOk = await prepareEnvironment();
    if (!environmentOk) {
      console.log('❌ Environment preparation failed');
      process.exit(1);
    }
    console.log('\n🎉 Phase 1 setup completed successfully!');
    console.log('🚀 Ready to run: node phase1-data-import.js');
  } catch (error) {
    console.log(`❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main();
} 