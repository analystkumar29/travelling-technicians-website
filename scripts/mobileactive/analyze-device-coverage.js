// Device Coverage Analysis for MobileActive Data
const fs = require('fs');

// Load the cleaned data
const data = JSON.parse(fs.readFileSync('tmp/mobileactive-improved-cleaned.json', 'utf8'));

console.log('📊 MOBILEACTIVE DEVICE COVERAGE ANALYSIS');
console.log('=========================================');
console.log(`Total Products: ${data.length}\n`);

// Analyze device types
const deviceTypes = {};
const brands = {};
const services = {};
const modelsByType = {};

data.forEach(product => {
  // Device type analysis
  deviceTypes[product.device_type] = (deviceTypes[product.device_type] || 0) + 1;
  
  // Brand analysis
  brands[product.brand] = (brands[product.brand] || 0) + 1;
  
  // Service analysis
  services[product.service_type] = (services[product.service_type] || 0) + 1;
  
  // Model analysis by device type
  if (!modelsByType[product.device_type]) {
    modelsByType[product.device_type] = {};
  }
  const modelKey = `${product.brand} ${product.model_name}`;
  modelsByType[product.device_type][modelKey] = (modelsByType[product.device_type][modelKey] || 0) + 1;
});

// Display device type coverage
console.log('📱 DEVICE TYPE COVERAGE');
console.log('=======================');
Object.entries(deviceTypes).forEach(([type, count]) => {
  const percentage = ((count / data.length) * 100).toFixed(1);
  console.log(`${type.toUpperCase()}: ${count} products (${percentage}%)`);
});

// Display brand coverage
console.log('\n🏷️ BRAND COVERAGE');
console.log('=================');
Object.entries(brands)
  .sort(([,a], [,b]) => b - a)
  .forEach(([brand, count]) => {
    const percentage = ((count / data.length) * 100).toFixed(1);
    console.log(`${brand}: ${count} products (${percentage}%)`);
  });

// Display service coverage
console.log('\n🔧 SERVICE COVERAGE');
console.log('===================');
Object.entries(services)
  .sort(([,a], [,b]) => b - a)
  .forEach(([service, count]) => {
    const percentage = ((count / data.length) * 100).toFixed(1);
    console.log(`${service}: ${count} products (${percentage}%)`);
  });

// Display top models for each device type
console.log('\n📋 TOP MODELS BY DEVICE TYPE');
console.log('============================');
Object.entries(modelsByType).forEach(([deviceType, models]) => {
  console.log(`\n${deviceType.toUpperCase()}:`);
  Object.entries(models)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .forEach(([model, count]) => {
      console.log(`  ${model}: ${count} products`);
    });
});

// Show integration recommendations
console.log('\n💡 INTEGRATION RECOMMENDATIONS');
console.log('=============================');

const mobileCount = deviceTypes.mobile || 0;
const laptopCount = deviceTypes.laptop || 0;
const tabletCount = deviceTypes.tablet || 0;

console.log(`\nBased on your current system focus:`);
console.log(`- Mobile devices: ${mobileCount} products available`);
console.log(`- Laptop devices: ${laptopCount} products available`);
console.log(`- Tablet devices: ${tabletCount} products available`);

if (mobileCount > laptopCount && mobileCount > tabletCount) {
  console.log(`\n🎯 RECOMMENDATION: Start with MOBILE devices`);
  console.log(`   - Largest product selection (${mobileCount} products)`);
  console.log(`   - Covers all major brands (Apple, Samsung, Google, etc.)`);
  console.log(`   - Most comprehensive service coverage`);
} else if (laptopCount > mobileCount && laptopCount > tabletCount) {
  console.log(`\n🎯 RECOMMENDATION: Start with LAPTOP devices`);
  console.log(`   - Strong laptop selection (${laptopCount} products)`);
  console.log(`   - Good for business customers`);
} else {
  console.log(`\n🎯 RECOMMENDATION: Start with TABLET devices`);
  console.log(`   - Focused tablet selection (${tabletCount} products)`);
}

console.log(`\n📈 INTEGRATION STRATEGY:`);
console.log(`1. Start with your primary device type (mobile/laptop/tablet)`);
console.log(`2. Focus on top 5-10 brands for that device type`);
console.log(`3. Implement core services (screen, battery, charging)`);
console.log(`4. Expand to additional brands and services over time`); 