#!/usr/bin/env node

/**
 * ADMIN PASSWORD HASH GENERATOR
 * 
 * This script generates a secure password hash for admin accounts.
 * Use this to create a password hash for the ADMIN_PASSWORD_HASH environment variable.
 * 
 * Usage:
 *   node generate-admin-password.js [password]
 *   
 * If no password is provided, you'll be prompted to enter one securely.
 */

const crypto = require('crypto');
const readline = require('readline');

/**
 * Hash password with salt for secure storage
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Get password input securely (hidden)
 */
function getPasswordSecurely() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Hide the input
    rl.stdoutMuted = true;
    rl._writeToOutput = function _writeToOutput(stringToWrite) {
      if (rl.stdoutMuted) {
        rl.output.write('*');
      } else {
        rl.output.write(stringToWrite);
      }
    };

    rl.question('Enter admin password: ', (password) => {
      console.log(''); // New line after hidden input
      rl.close();
      resolve(password);
    });
  });
}

async function main() {
  console.log('🔐 ADMIN PASSWORD HASH GENERATOR');
  console.log('================================\n');

  let password;

  // Check if password provided as argument
  if (process.argv[2]) {
    password = process.argv[2];
    console.log('⚠️  Warning: Password provided as command line argument (visible in history)');
  } else {
    password = await getPasswordSecurely();
  }

  if (!password || password.length < 8) {
    console.error('❌ Password must be at least 8 characters long');
    process.exit(1);
  }

  // Generate hash
  const passwordHash = hashPassword(password);

  console.log('✅ Password hash generated successfully!\n');
  console.log('🔑 Add this to your environment variables:\n');
  console.log('ADMIN_PASSWORD_HASH=' + passwordHash);
  console.log('\n📋 For .env.local file:');
  console.log(`echo "ADMIN_PASSWORD_HASH=${passwordHash}" >> .env.local`);
  console.log('\n📋 For .env.production file:');
  console.log(`echo "ADMIN_PASSWORD_HASH=${passwordHash}" >> .env.production`);
  
  console.log('\n🛡️  Security Notes:');
  console.log('   - Store this hash in your environment variables');
  console.log('   - Never commit the hash to version control');
  console.log('   - The original password cannot be recovered from this hash');
  console.log('   - Use a strong password with mixed characters');
  
  console.log('\n🔐 Optional: Set custom admin username:');
  console.log('ADMIN_USERNAME=your_custom_username');
  console.log('\n✅ Setup complete! Your admin login will be secured with this hash.');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = { hashPassword }; 