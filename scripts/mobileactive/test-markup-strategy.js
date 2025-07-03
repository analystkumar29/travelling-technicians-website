// Test Markup Strategy with MobileActive Data
const fs = require('fs');
const path = require('path');

// Your revised markup strategy
function calculatePrice(partCost) {
    let markup;
    if (partCost < 20) {
        markup = 99 - partCost;  // Max $99 total
    } else if (partCost < 30) {
        markup = 111 - partCost;  // Max $111 total
    } else if (partCost < 50) {
        markup = 100;  // Flat $100 margin
    } else if (partCost < 70) {
        markup = 120;  // Flat $120 margin
    } else if (partCost < 150) {
        markup = 130;  // Flat $130 margin
    } else {
        markup = 150;  // Flat $150 margin
    }
    return Math.round(partCost + markup);
}

// Alternative strategies for comparison
function simplePercentageMarkup(partCost, percentage = 30) {
    return Math.round(partCost + (partCost * percentage / 100));
}

function tieredPercentageMarkup(partCost) {
    if (partCost < 30) return Math.round(partCost + (partCost * 0.8));  // 80%
    if (partCost < 60) return Math.round(partCost + (partCost * 0.6));  // 60%
    if (partCost < 100) return Math.round(partCost + (partCost * 0.5)); // 50%
    if (partCost < 150) return Math.round(partCost + (partCost * 0.4)); // 40%
    return Math.round(partCost + (partCost * 0.3)); // 30%
}

// Load MobileActive data
const dataPath = path.join(__dirname, 'tmp/mobileactive-improved-cleaned.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Filter for mobile devices with valid costs
const mobileData = data.filter(product => 
    product.device_type === 'mobile' && 
    product.part_cost > 0 && 
    product.part_cost < 1000  // Filter out extreme outliers
);

console.log('📊 Markup Strategy Analysis');
console.log('=' .repeat(50));

// Test different cost ranges
const testRanges = [
    { min: 0, max: 30, label: '$0-30' },
    { min: 30, max: 60, label: '$30-60' },
    { min: 60, max: 100, label: '$60-100' },
    { min: 100, max: 150, label: '$100-150' },
    { min: 150, max: 300, label: '$150-300' },
    { min: 300, max: 1000, label: '$300-1000' }
];

testRanges.forEach(range => {
    const productsInRange = mobileData.filter(p => p.part_cost >= range.min && p.part_cost < range.max);
    
    if (productsInRange.length === 0) return;
    
    console.log(`\n💰 ${range.label} (${productsInRange.length} products):`);
    
    // Sample products
    const samples = productsInRange.slice(0, 3);
    samples.forEach(product => {
        const yourPrice = calculatePrice(product.part_cost);
        const simple30Price = simplePercentageMarkup(product.part_cost, 30);
        const tieredPrice = tieredPercentageMarkup(product.part_cost);
        
        console.log(`  ${product.brand} ${product.model_name} - ${product.service_type}`);
        console.log(`    Cost: $${product.part_cost.toFixed(2)}`);
        console.log(`    Your Strategy: $${yourPrice} (${((yourPrice - product.part_cost) / product.part_cost * 100).toFixed(0)}% markup)`);
        console.log(`    Simple 30%: $${simple30Price} (30% markup)`);
        console.log(`    Tiered %: $${tieredPrice} (${((tieredPrice - product.part_cost) / product.part_cost * 100).toFixed(0)}% markup)`);
    });
});

// Overall statistics
console.log('\n📈 Overall Statistics:');
console.log('=' .repeat(50));

const totalProducts = mobileData.length;
const avgCost = mobileData.reduce((sum, p) => sum + p.part_cost, 0) / totalProducts;
const avgYourPrice = mobileData.reduce((sum, p) => sum + calculatePrice(p.part_cost), 0) / totalProducts;
const avgSimplePrice = mobileData.reduce((sum, p) => sum + simplePercentageMarkup(p.part_cost, 30), 0) / totalProducts;

console.log(`Total Products: ${totalProducts}`);
console.log(`Average Part Cost: $${avgCost.toFixed(2)}`);
console.log(`Average Your Price: $${avgYourPrice.toFixed(2)}`);
console.log(`Average Simple 30% Price: $${avgSimplePrice.toFixed(2)}`);
console.log(`Price Difference: $${(avgYourPrice - avgSimplePrice).toFixed(2)} (${((avgYourPrice - avgSimplePrice) / avgSimplePrice * 100).toFixed(1)}% higher)`);

// Profit margin analysis
const yourProfitMargin = ((avgYourPrice - avgCost) / avgYourPrice * 100);
const simpleProfitMargin = ((avgSimplePrice - avgCost) / avgSimplePrice * 100);

console.log(`\n💵 Profit Margin Analysis:`);
console.log(`Your Strategy: ${yourProfitMargin.toFixed(1)}% margin`);
console.log(`Simple 30%: ${simpleProfitMargin.toFixed(1)}% margin`);

// Test specific examples
console.log('\n🎯 Specific Examples:');
console.log('=' .repeat(50));

const examples = [
    { cost: 15, name: 'Cheap Screen Protector' },
    { cost: 45, name: 'Mid-range Battery' },
    { cost: 85, name: 'Quality Screen' },
    { cost: 125, name: 'Premium Screen' },
    { cost: 200, name: 'OEM Display' },
    { cost: 350, name: 'High-end OLED Screen' }
];

examples.forEach(example => {
    const yourPrice = calculatePrice(example.cost);
    const simplePrice = simplePercentageMarkup(example.cost, 30);
    const markup = yourPrice - example.cost;
    const markupPercent = (markup / example.cost * 100);
    
    console.log(`${example.name}:`);
    console.log(`  Cost: $${example.cost} → Your Price: $${yourPrice} ($${markup} markup, ${markupPercent.toFixed(0)}%)`);
    console.log(`  Simple 30%: $${simplePrice} ($${simplePrice - example.cost} markup)`);
}); 