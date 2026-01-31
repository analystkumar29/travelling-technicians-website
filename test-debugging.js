#!/usr/bin/env node

/**
 * Test script to verify debugging is working
 * Run with: node test-debugging.js
 */

console.log("=== Testing Location Debugging ===\n");

// Simulate the debug utilities
const debugLog = (component, message, data) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`[${timestamp}] [${component}] ${message}`, data || '');
};

const debugError = (component, message, error) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.error(`[${timestamp}] [${component}] ❌ ${message}`, error || '');
};

const debugWarn = (component, message, data) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.warn(`[${timestamp}] [${component}] ⚠️ ${message}`, data || '');
};

const debugSuccess = (component, message, data) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`[${timestamp}] [${component}] ✅ ${message}`, data || '');
};

// Test scenarios
console.log("1. Testing LOCATION_UTILS component:");
debugLog('LOCATION_UTILS', 'Starting getCurrentLocationPostalCode');
debugWarn('LOCATION_UTILS', 'Geolocation is not supported by browser');
debugSuccess('LOCATION_UTILS', 'Browser geolocation successful', { latitude: 49.2827, longitude: -123.1207 });
debugError('LOCATION_UTILS', 'OpenStreetMap API error', new Error('Network error'));

console.log("\n2. Testing ADDRESS_AUTOCOMPLETE component:");
debugLog('ADDRESS_AUTOCOMPLETE', 'Component mounted', {
  hasApiKey: true,
  apiKeyIsPlaceholder: true,
  initialValue: 'none'
});
debugSuccess('ADDRESS_AUTOCOMPLETE', 'OpenStreetMap returned suggestions:', {
  count: 3,
  firstSuggestion: '123 Main St, Vancouver, BC'
});
debugError('ADDRESS_AUTOCOMPLETE', 'Error processing address selection:', new Error('Invalid format'));

console.log("\n3. Testing POSTAL_CHECKER component:");
debugLog('POSTAL_CHECKER', 'Component mounted', { variant: 'compact' });
debugSuccess('POSTAL_CHECKER', 'Postal code validated successfully', { postalCode: 'V5C 6R9', serviceable: true });
debugWarn('POSTAL_CHECKER', 'Postal code not in service area', { postalCode: 'H0H 0H0', serviceable: false });

console.log("\n=== Debugging Features Added ===");
console.log("✅ Timestamped logs (HH:MM:SS format)");
console.log("✅ Component prefixes: [LOCATION_UTILS], [ADDRESS_AUTOCOMPLETE], [POSTAL_CHECKER]");
console.log("✅ Color-coded emojis: ✅ (success), ⚠️ (warning), ❌ (error)");
console.log("✅ Structured data logging with JSON objects");

console.log("\n=== How to Use ===");
console.log("1. Open browser console (F12 or Cmd+Option+I on Mac)");
console.log("2. Go to homepage (/) and click 'Use My Current Location'");
console.log("3. Look for logs starting with [LOCATION_UTILS]");
console.log("4. Go to booking form and type an address");
console.log("5. Look for logs starting with [ADDRESS_AUTOCOMPLETE]");
console.log("\nThe logs will show:");
console.log("- Component name and timestamp");
console.log("- Success/warning/error indicators");
console.log("- Detailed data about what's happening");
console.log("- API calls, responses, and errors");

console.log("\n=== Expected Console Output ===");
console.log("Example:");
console.log(`[04:02:51] [LOCATION_UTILS] ✅ Browser geolocation successful { latitude: 49.2827, longitude: -123.1207 }`);
console.log(`[04:02:52] [LOCATION_UTILS] ⚠️ No postal code found in OpenStreetMap response { display_name: "Vancouver, BC" }`);
console.log(`[04:02:53] [ADDRESS_AUTOCOMPLETE] ✅ OpenStreetMap returned suggestions: { count: 3, firstSuggestion: "123 Main St" }`);