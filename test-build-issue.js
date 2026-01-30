// Test to see what's happening during build
const { execSync } = require('child_process');

console.log('Testing build process...\n');

try {
  // Run a simple test of the data-service functions
  const testCode = `
    const { getAllActiveCities, getAllActiveServices } = require('./src/lib/data-service');
    
    async function test() {
      console.log('Testing getAllActiveCities...');
      const cities = await getAllActiveCities();
      console.log('Cities found:', cities.length);
      console.log('First 3 cities:', cities.slice(0, 3));
      
      console.log('\\nTesting getAllActiveServices...');
      const services = await getAllActiveServices();
      console.log('Services found:', services.length);
      console.log('Services:', services.map(s => ({ name: s.name, slug: s.slug })));
      
      // Calculate expected paths
      const expectedPaths = cities.length * services.length;
      console.log('\\nExpected static paths:', expectedPaths);
      console.log('(13 cities × 4 services = 52 paths)');
    }
    
    test().catch(err => {
      console.error('Error:', err.message);
      console.error('Stack:', err.stack);
    });
  `;
  
  // Write test file
  require('fs').writeFileSync('/tmp/test-build.js', testCode);
  
  // Run test
  console.log('Running test...');
  const result = execSync('cd /Users/manojkumar/WEBSITE && node /tmp/test-build.js', { encoding: 'utf8' });
  console.log(result);
  
} catch (error) {
  console.error('Test failed:', error.message);
  console.error('Error output:', error.stderr?.toString());
}