#!/usr/bin/env node

/**
 * Admin Password Hash Generator
 * Generates a secure PBKDF2 hash for admin credentials
 * Usage: node generate-admin-hash.js "password"
 */

const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function generateJWTSecret() {
  return crypto.randomBytes(32).toString('hex');
}

const password = process.argv[2] || 'TravellingTech2024!';
const passwordHash = hashPassword(password);
const jwtSecret = generateJWTSecret();

console.log('\n' + '='.repeat(60));
console.log('✅ ADMIN CREDENTIALS GENERATED');
console.log('='.repeat(60));
console.log('\n📝 Add these to your .env.local file:\n');
console.log('# Admin Authentication');
console.log('ADMIN_USERNAME="admin"');
console.log(`ADMIN_PASSWORD_HASH="${passwordHash}"`);
console.log(`ADMIN_JWT_SECRET="${jwtSecret}"`);
console.log('\n🔐 Login Credentials:');
console.log('Username: admin');
console.log(`Password: ${password}`);
console.log('\n' + '='.repeat(60) + '\n');
