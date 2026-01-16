#!/usr/bin/env node

/**
 * Cache Performance Testing Script
 * Tests cache hit rates, response times, and overall cache performance
 */

const fetch = require('node-fetch');
const chalk = require('chalk');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TEST_ENDPOINTS = [
  {
    name: 'Device Brands - Mobile',
    url: '/api/devices/brands?deviceType=mobile',
    expectedCacheTime: 3600 // 1 hour
  },
  {
    name: 'Device Models - Apple Mobile',
    url: '/api/devices/models?deviceType=mobile&brand=Apple',
    expectedCacheTime: 3600 // 1 hour
  },
  {
    name: 'Pricing Calculation - iPhone Screen',
    url: '/api/pricing/calculate-fixed?deviceType=mobile&brand=Apple&model=iPhone%2015&service=screen_replacement&tier=standard',
    expectedCacheTime: 1800 // 30 minutes
  },
  {
    name: 'Cache Health Check',
    url: '/api/cache/health',
    expectedCacheTime: 60 // 1 minute
  }
];

class CachePerformanceTester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async runTests() {
    console.log(chalk.blue.bold('\n🚀 Cache Performance Testing Started\n'));
    console.log(chalk.gray(`Testing against: ${BASE_URL}\n`));

    // Test 1: Cache Headers Validation
    await this.testCacheHeaders();

    // Test 2: Cache Performance (multiple requests)
    await this.testCachePerformance();

    // Test 3: Cache Health Check
    await this.testCacheHealth();

    // Test 4: Cache Warming
    await this.testCacheWarming();

    // Display summary
    this.displaySummary();
  }

  async testCacheHeaders() {
    console.log(chalk.yellow.bold('📋 Testing Cache Headers\n'));

    for (const endpoint of TEST_ENDPOINTS) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint.url}`, {
          method: 'HEAD'
        });

        const cacheControl = response.headers.get('cache-control');
        const etag = response.headers.get('etag');
        const lastModified = response.headers.get('last-modified');
        const vary = response.headers.get('vary');

        console.log(chalk.cyan(`${endpoint.name}:`));
        console.log(`  Cache-Control: ${cacheControl || chalk.red('Missing')}`);
        console.log(`  ETag: ${etag || chalk.yellow('Not set')}`);
        console.log(`  Last-Modified: ${lastModified || chalk.yellow('Not set')}`);
        console.log(`  Vary: ${vary || chalk.yellow('Not set')}`);

        // Validate cache headers
        const hasProperCaching = cacheControl && (
          cacheControl.includes('max-age') || 
          cacheControl.includes('s-maxage')
        );

        if (hasProperCaching) {
          console.log(chalk.green('  ✅ Cache headers configured correctly\n'));
        } else {
          console.log(chalk.red('  ❌ Missing or improper cache headers\n'));
        }

      } catch (error) {
        console.log(chalk.red(`  ❌ Error testing ${endpoint.name}: ${error.message}\n`));
      }
    }
  }

  async testCachePerformance() {
    console.log(chalk.yellow.bold('⚡ Testing Cache Performance\n'));

    for (const endpoint of TEST_ENDPOINTS) {
      if (endpoint.url === '/api/cache/health') continue; // Skip health endpoint for performance test

      console.log(chalk.cyan(`Testing: ${endpoint.name}`));

      const results = {
        endpoint: endpoint.name,
        coldRequest: null,
        warmRequests: [],
        averageWarmTime: 0,
        improvement: 0
      };

      try {
        // Cold request (first request - likely cache miss)
        const coldStart = Date.now();
        const coldResponse = await fetch(`${BASE_URL}${endpoint.url}`);
        const coldTime = Date.now() - coldStart;
        results.coldRequest = coldTime;

        if (!coldResponse.ok) {
          throw new Error(`HTTP ${coldResponse.status}: ${coldResponse.statusText}`);
        }

        console.log(`  Cold request: ${coldTime}ms`);

        // Wait a moment then test warm requests (cache hits)
        await new Promise(resolve => setTimeout(resolve, 100));

        // Multiple warm requests
        const warmTimes = [];
        for (let i = 0; i < 5; i++) {
          const warmStart = Date.now();
          const warmResponse = await fetch(`${BASE_URL}${endpoint.url}`);
          const warmTime = Date.now() - warmStart;
          warmTimes.push(warmTime);

          if (!warmResponse.ok) {
            throw new Error(`HTTP ${warmResponse.status}: ${warmResponse.statusText}`);
          }
        }

        results.warmRequests = warmTimes;
        results.averageWarmTime = warmTimes.reduce((a, b) => a + b, 0) / warmTimes.length;
        results.improvement = ((coldTime - results.averageWarmTime) / coldTime * 100).toFixed(1);

        console.log(`  Warm requests: ${warmTimes.map(t => `${t}ms`).join(', ')}`);
        console.log(`  Average warm: ${results.averageWarmTime.toFixed(1)}ms`);
        console.log(chalk.green(`  Performance improvement: ${results.improvement}%\n`));

        this.results.push(results);

      } catch (error) {
        console.log(chalk.red(`  ❌ Error: ${error.message}\n`));
      }
    }
  }

  async testCacheHealth() {
    console.log(chalk.yellow.bold('🏥 Testing Cache Health\n'));

    try {
      const response = await fetch(`${BASE_URL}/api/cache/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const health = await response.json();

      if (health.success) {
        console.log(chalk.green('✅ Cache health check passed'));
        console.log('\nCache Statistics:');
        
        if (health.system.overall) {
          console.log(`  Total Hits: ${health.system.overall.totalHits}`);
          console.log(`  Total Misses: ${health.system.overall.totalMisses}`);
          console.log(`  Overall Hit Rate: ${health.system.overall.overallHitRate}%`);
          console.log(`  Average Response Time: ${health.system.overall.averageResponseTime}ms`);
        }

        if (health.recommendations && health.recommendations.length > 0) {
          console.log('\nRecommendations:');
          health.recommendations.forEach(rec => {
            console.log(chalk.yellow(`  • ${rec}`));
          });
        }

        console.log('\nMemory Cache Status:');
        Object.entries(health.system.memory).forEach(([cacheType, cache]) => {
          if (cache && typeof cache === 'object') {
            console.log(`  ${cacheType}: ${cache.hits || 0} hits, ${cache.hitRate || 0}% hit rate`);
            if (cache.health) {
              const healthStatus = cache.health.isHealthy ? chalk.green('Healthy') : chalk.red('Unhealthy');
              console.log(`    Health: ${healthStatus}`);
            }
          }
        });

      } else {
        console.log(chalk.red(`❌ Cache health check failed: ${health.error}`));
      }

    } catch (error) {
      console.log(chalk.red(`❌ Error checking cache health: ${error.message}`));
    }

    console.log('\n');
  }

  async testCacheWarming() {
    console.log(chalk.yellow.bold('🔥 Testing Cache Warming\n'));

    try {
      const response = await fetch(`${BASE_URL}/api/cache/warm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        console.log(chalk.green('✅ Cache warming completed'));
        console.log(`  Warmed ${result.warmed.count} endpoint(s)`);
        console.log(`  Duration: ${result.duration}ms`);
        console.log(`  Endpoints: ${result.warmed.endpoints.join(', ')}`);
      } else {
        console.log(chalk.red(`❌ Cache warming failed: ${result.error}`));
      }

    } catch (error) {
      console.log(chalk.red(`❌ Error warming cache: ${error.message}`));
    }

    console.log('\n');
  }

  displaySummary() {
    const totalTime = Date.now() - this.startTime;
    
    console.log(chalk.blue.bold('📊 Cache Performance Summary\n'));
    console.log(chalk.gray(`Total test duration: ${totalTime}ms\n`));

    if (this.results.length > 0) {
      console.log('Performance Improvements:');
      this.results.forEach(result => {
        const improvement = parseFloat(result.improvement);
        const color = improvement > 50 ? chalk.green : improvement > 25 ? chalk.yellow : chalk.red;
        console.log(`  ${result.endpoint}: ${color(result.improvement + '%')} (${result.coldRequest}ms → ${result.averageWarmTime.toFixed(1)}ms)`);
      });

      const avgImprovement = this.results.reduce((sum, r) => sum + parseFloat(r.improvement), 0) / this.results.length;
      console.log(`\nAverage Performance Improvement: ${chalk.bold(avgImprovement.toFixed(1) + '%')}`);

      // Performance benchmarks
      console.log('\nPerformance Benchmarks:');
      console.log(chalk.green('✅ Excellent: >70% improvement'));
      console.log(chalk.yellow('⚠️  Good: 25-70% improvement'));
      console.log(chalk.red('❌ Needs work: <25% improvement'));
    }

    console.log('\n' + chalk.blue.bold('Cache testing completed! 🎉'));
  }
}

// Run the tests
async function main() {
  const tester = new CachePerformanceTester();
  await tester.runTests();
}

if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('\n❌ Test failed:'), error.message);
    process.exit(1);
  });
}

module.exports = CachePerformanceTester;
