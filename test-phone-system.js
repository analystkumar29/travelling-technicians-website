#!/usr/bin/env node

/**
 * Test script for phone number system
 * This script tests the phone formatter and business settings integration
 */

const { parsePhoneNumber, formatPhoneNumberForDisplay, formatPhoneNumberForHref, DEFAULT_PHONE_NUMBER } = require('./src/utils/phone-formatter');

console.log('🔧 Testing Phone Number System');
console.log('='.repeat(50));

// Test phone number formatting
console.log('\n📱 Testing Phone Number Formatter:');
const testNumbers = [
  '+16048495329',
  '604-849-5329',
  '(604) 849-5329',
  '6048495329',
  '+1-604-849-5329',
  '1-604-849-5329'
];

testNumbers.forEach(num => {
  try {
    const parsed = parsePhoneNumber(num);
    console.log(`✅ Input: "${num}" -> Display: "${parsed.display}", Href: "${parsed.href}", E.164: "${parsed.e164}"`);
  } catch (error) {
    console.log(`❌ Input: "${num}" -> Error: ${error.message}`);
  }
});

// Test default phone number
console.log('\n🎯 Default Phone Number:');
const defaultPhone = parsePhoneNumber(DEFAULT_PHONE_NUMBER);
console.log(`Default: "${DEFAULT_PHONE_NUMBER}"`);
console.log(`Display: "${defaultPhone.display}"`);
console.log(`Href: "${defaultPhone.href}"`);
console.log(`E.164: "${defaultPhone.e164}"`);

// Test formatting functions
console.log('\n🔧 Testing Formatting Functions:');
console.log(`formatPhoneNumberForDisplay("+16048495329"): "${formatPhoneNumberForDisplay('+16048495329')}"`);
console.log(`formatPhoneNumberForDisplay("604-849-5329"): "${formatPhoneNumberForDisplay('604-849-5329')}"`);
console.log(`formatPhoneNumberForHref("+16048495329"): "${formatPhoneNumberForHref('+16048495329')}"`);
console.log(`formatPhoneNumberForHref("604-849-5329"): "${formatPhoneNumberForHref('604-849-5329')}"`);

// Test equality checking
console.log('\n🔍 Testing Phone Number Equality:');
console.log(`+16048495329 === 604-849-5329: ${require('./src/utils/phone-formatter').arePhoneNumbersEqual('+16048495329', '604-849-5329')}`);
console.log(`+16048495329 === (604) 849-5329: ${require('./src/utils/phone-formatter').arePhoneNumbersEqual('+16048495329', '(604) 849-5329')}`);
console.log(`+16048495329 === +17783899251: ${require('./src/utils/phone-formatter').arePhoneNumbersEqual('+16048495329', '+17783899251')}`);

// Test area code extraction
console.log('\n📍 Testing Area Code Extraction:');
console.log(`extractAreaCode("+16048495329"): "${require('./src/utils/phone-formatter').extractAreaCode('+16048495329')}"`);
console.log(`extractAreaCode("604-849-5329"): "${require('./src/utils/phone-formatter').extractAreaCode('604-849-5329')}"`);
console.log(`extractAreaCode("(604) 849-5329"): "${require('./src/utils/phone-formatter').extractAreaCode('(604) 849-5329')}"`);

console.log('\n🎉 Phone number system tests completed!');
console.log('\n📋 Summary:');
console.log(`- Default business phone: ${defaultPhone.display}`);
console.log(`- Database phone (site_settings): +16048495329`);
console.log(`- Database city phone (service_locations): +1-778-389-9251`);
console.log('\n⚠️  NOTE: The database phone numbers need to be updated:');
console.log('  1. Update site_settings.business_phone to: +16048495329 (already correct)');
console.log('  2. Update service_locations.local_phone for all cities to: +16048495329');
console.log('\n🎯 Next steps:');
console.log('  1. Run database update script to fix phone numbers');
console.log('  2. Test the website to ensure phone numbers display correctly');
console.log('  3. Verify Schema.org structured data includes correct phone numbers');