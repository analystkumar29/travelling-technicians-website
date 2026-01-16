const { getPopularServices } = require('../src/lib/data-service');

async function test() {
  console.log('Testing getPopularServices...');
  const services = await getPopularServices();
  console.log('Result:', JSON.stringify(services, null, 2));
  console.log('Number of services:', services.length);
  console.log('Services names:', services.map(s => s.name));
  console.log('Cache timestamp:', global.globalCache?.services?.timestamp || 'none');
}

