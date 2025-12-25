// Integration Planning for MobileActive Data
const fs = require('fs');

// Load the cleaned data
const data = JSON.parse(fs.readFileSync('tmp/mobileactive-improved-cleaned.json', 'utf8'));

console.log('🎯 MOBILEACTIVE INTEGRATION PLANNING');
console.log('=====================================');

// Filter out UNKNOWN device types for better analysis
const validData = data.filter(product => product.device_type !== 'UNKNOWN');
console.log(`Valid Products (excluding unknown): ${validData.length}\n`);

// Analyze by device type
const deviceTypes = {};
const brandsByType = {};
const servicesByType = {};

validData.forEach(product => {
  const deviceType = product.device_type;
  
  // Device type count
  deviceTypes[deviceType] = (deviceTypes[deviceType] || 0) + 1;
  
  // Brands by device type
  if (!brandsByType[deviceType]) {
    brandsByType[deviceType] = {};
  }
  brandsByType[deviceType][product.brand] = (brandsByType[deviceType][product.brand] || 0) + 1;
  
  // Services by device type
  if (!servicesByType[deviceType]) {
    servicesByType[deviceType] = {};
  }
  servicesByType[deviceType][product.service_type] = (servicesByType[deviceType][product.service_type] || 0) + 1;
});

// Display detailed analysis for each device type
Object.entries(deviceTypes).forEach(([deviceType, count]) => {
  console.log(`📱 ${deviceType.toUpperCase()} DEVICES`);
  console.log('='.repeat(deviceType.length + 10));
  console.log(`Total Products: ${count}\n`);
  
  // Top brands for this device type
  console.log('🏷️ Top Brands:');
  Object.entries(brandsByType[deviceType])
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([brand, brandCount]) => {
      const percentage = ((brandCount / count) * 100).toFixed(1);
      console.log(`  ${brand}: ${brandCount} products (${percentage}%)`);
    });
  
  // Top services for this device type
  console.log('\n🔧 Top Services:');
  Object.entries(servicesByType[deviceType])
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([service, serviceCount]) => {
      const percentage = ((serviceCount / count) * 100).toFixed(1);
      console.log(`  ${service}: ${serviceCount} products (${percentage}%)`);
    });
  
  console.log('\n' + '-'.repeat(50) + '\n');
});

// Integration recommendations
console.log('💡 INTEGRATION RECOMMENDATIONS');
console.log('=============================');

const mobileCount = deviceTypes.mobile || 0;
const laptopCount = deviceTypes.laptop || 0;
const tabletCount = deviceTypes.tablet || 0;

console.log(`\n📊 DEVICE TYPE PRIORITY:`);
console.log(`1. MOBILE: ${mobileCount} products (${((mobileCount/validData.length)*100).toFixed(1)}%)`);
console.log(`2. TABLET: ${tabletCount} products (${((tabletCount/validData.length)*100).toFixed(1)}%)`);
console.log(`3. LAPTOP: ${laptopCount} products (${((laptopCount/validData.length)*100).toFixed(1)}%)`);

console.log(`\n🎯 PHASED INTEGRATION PLAN:`);

// Phase 1: Mobile Devices
console.log(`\n📱 PHASE 1: MOBILE DEVICES (${mobileCount} products)`);
console.log('Focus on top brands and services:');
const mobileBrands = Object.entries(brandsByType.mobile || {})
  .sort(([,a], [,b]) => b - a)
  .slice(0, 3);
mobileBrands.forEach(([brand, count]) => {
  console.log(`  - ${brand}: ${count} products`);
});

const mobileServices = Object.entries(servicesByType.mobile || {})
  .sort(([,a], [,b]) => b - a)
  .slice(0, 4);
console.log('Core services to implement:');
mobileServices.forEach(([service, count]) => {
  console.log(`  - ${service}: ${count} products`);
});

// Phase 2: Tablet Devices
if (tabletCount > 0) {
  console.log(`\n📱 PHASE 2: TABLET DEVICES (${tabletCount} products)`);
  const tabletBrands = Object.entries(brandsByType.tablet || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2);
  tabletBrands.forEach(([brand, count]) => {
    console.log(`  - ${brand}: ${count} products`);
  });
}

// Phase 3: Laptop Devices
if (laptopCount > 0) {
  console.log(`\n💻 PHASE 3: LAPTOP DEVICES (${laptopCount} products)`);
  const laptopBrands = Object.entries(brandsByType.laptop || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2);
  laptopBrands.forEach(([brand, count]) => {
    console.log(`  - ${brand}: ${count} products`);
  });
}

console.log(`\n📈 IMPLEMENTATION STRATEGY:`);
console.log(`1. Start with MOBILE devices (largest selection)`);
console.log(`2. Focus on Apple and Samsung (top brands)`);
console.log(`3. Implement core services: screen, battery, charging, camera`);
console.log(`4. Add tablet and laptop support in later phases`);
console.log(`5. Expand to additional brands and services over time`);

console.log(`\n⚡ QUICK START OPTION:`);
console.log(`- Import only MOBILE devices (${mobileCount} products)`);
console.log(`- Focus on Apple and Samsung brands`);
console.log(`- Implement screen_replacement and battery_replacement services`);
console.log(`- This gives you ${mobileCount} products to start with immediately`); 