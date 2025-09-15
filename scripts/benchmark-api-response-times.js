#!/usr/bin/env node

/**
 * API Response Times Benchmark
 * Comprehensive performance testing for all API endpoints
 */

const fetch = require('node-fetch');
const chalk = require('chalk');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

const BENCHMARK_ENDPOINTS = [
  // Device APIs
  {
    name: 'Device Brands - Mobile',
    url: '/api/devices/brands?deviceType=mobile',
    category: 'devices',
    expectedTime: 100 // Expected cached response time in ms
  },
  {
    name: 'Device Brands - Laptop',
    url: '/api/devices/brands?deviceType=laptop',
    category: 'devices',
    expectedTime: 100
  },
  {
    name: 'Device Models - Apple Mobile',
    url: '/api/devices/models?deviceType=mobile&brand=Apple',
    category: 'devices',
    expectedTime: 150
  },
  {
    name: 'Device Models - Samsung Mobile',
    url: '/api/devices/models?deviceType=mobile&brand=Samsung',
    category: 'devices',
    expectedTime: 150
  },
  {
    name: 'Device Models - Apple Laptop',
    url: '/api/devices/models?deviceType=laptop&brand=Apple',
    category: 'devices',
    expectedTime: 150
  },

  // Pricing APIs (most expensive)
  {
    name: 'Pricing - iPhone 15 Screen',
    url: '/api/pricing/calculate-fixed?deviceType=mobile&brand=Apple&model=iPhone%2015&service=screen_replacement&tier=standard',
    category: 'pricing',
    expectedTime: 300
  },
  {
    name: 'Pricing - iPhone 14 Battery',
    url: '/api/pricing/calculate-fixed?deviceType=mobile&brand=Apple&model=iPhone%2014&service=battery_replacement&tier=standard',
    category: 'pricing',
    expectedTime: 300
  },
  {
    name: 'Pricing - MacBook Screen',
    url: '/api/pricing/calculate-fixed?deviceType=laptop&brand=Apple&model=MacBook%20Pro&service=screen_replacement&tier=premium',
    category: 'pricing',
    expectedTime: 300
  },
  {
    name: 'Pricing - Samsung Galaxy',
    url: '/api/pricing/calculate-fixed?deviceType=mobile&brand=Samsung&model=Galaxy%20S24&service=screen_replacement&tier=standard',
    category: 'pricing',
    expectedTime: 300
  },

  // Cache Management APIs
  {
    name: 'Cache Health',
    url: '/api/cache/health',
    category: 'cache',
    expectedTime: 50
  }
];

class APIBenchmark {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.iterations = 10; // Number of requests per endpoint
  }

  async runBenchmarks() {
    console.log(chalk.blue.bold('\n⚡ API Response Times Benchmark\n'));
    console.log(chalk.gray(`Testing against: ${BASE_URL}`));
    console.log(chalk.gray(`Iterations per endpoint: ${this.iterations}\n`));

    // Warm up the server first
    await this.warmupServer();

    // Run benchmarks for each endpoint
    for (const endpoint of BENCHMARK_ENDPOINTS) {
      await this.benchmarkEndpoint(endpoint);
    }

    // Display comprehensive results
    this.displayResults();
  }

  async warmupServer() {
    console.log(chalk.yellow('🔥 Warming up server...\n'));

    try {
      // Warm cache first
      await fetch(`${BASE_URL}/api/cache/warm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      // Make a few sample requests
      for (let i = 0; i < 3; i++) {
        await fetch(`${BASE_URL}/api/devices/brands?deviceType=mobile`);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(chalk.green('✅ Server warmed up\n'));
    } catch (error) {
      console.log(chalk.yellow(`⚠️  Warmup failed: ${error.message}\n`));
    }
  }

  async benchmarkEndpoint(endpoint) {
    console.log(chalk.cyan(`Testing: ${endpoint.name}`));

    const times = [];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < this.iterations; i++) {
      try {
        const startTime = Date.now();
        const response = await fetch(`${BASE_URL}${endpoint.url}`);
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        if (response.ok) {
          times.push(responseTime);
          successCount++;
        } else {
          errorCount++;
          console.log(chalk.red(`  Request ${i + 1} failed: ${response.status}`));
        }

        // Small delay between requests
        if (i < this.iterations - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }

      } catch (error) {
        errorCount++;
        console.log(chalk.red(`  Request ${i + 1} error: ${error.message}`));
      }
    }

    if (times.length > 0) {
      const stats = this.calculateStats(times);
      const result = {
        ...endpoint,
        ...stats,
        successCount,
        errorCount,
        successRate: (successCount / this.iterations) * 100
      };

      this.results.push(result);

      // Display immediate results
      console.log(`  Avg: ${stats.average.toFixed(1)}ms | Min: ${stats.min}ms | Max: ${stats.max}ms | P95: ${stats.p95.toFixed(1)}ms`);
      
      // Performance assessment
      const performance = this.assessPerformance(stats.average, endpoint.expectedTime);
      console.log(`  Performance: ${performance.color(performance.text)}`);
      console.log(`  Success Rate: ${successCount}/${this.iterations} (${result.successRate.toFixed(1)}%)\n`);

    } else {
      console.log(chalk.red(`  ❌ All requests failed\n`));
    }
  }

  calculateStats(times) {
    const sorted = times.slice().sort((a, b) => a - b);
    const sum = times.reduce((a, b) => a + b, 0);

    return {
      average: sum / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      stdDev: this.calculateStdDev(times, sum / times.length)
    };
  }

  calculateStdDev(times, average) {
    const squaredDiffs = times.map(time => Math.pow(time - average, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / times.length;
    return Math.sqrt(avgSquaredDiff);
  }

  assessPerformance(actualTime, expectedTime) {
    const ratio = actualTime / expectedTime;

    if (ratio <= 0.5) {
      return { text: 'Excellent (much faster than expected)', color: chalk.green.bold };
    } else if (ratio <= 1.0) {
      return { text: 'Good (meets expectations)', color: chalk.green };
    } else if (ratio <= 1.5) {
      return { text: 'Acceptable (slightly slower)', color: chalk.yellow };
    } else if (ratio <= 2.0) {
      return { text: 'Needs improvement', color: chalk.red };
    } else {
      return { text: 'Poor performance', color: chalk.red.bold };
    }
  }

  displayResults() {
    const totalTime = Date.now() - this.startTime;
    
    console.log(chalk.blue.bold('📊 Benchmark Results Summary\n'));
    console.log(chalk.gray(`Total benchmark duration: ${(totalTime / 1000).toFixed(1)}s\n`));

    // Group results by category
    const categories = this.groupByCategory();

    Object.entries(categories).forEach(([category, endpoints]) => {
      console.log(chalk.yellow.bold(`${category.toUpperCase()} APIs:`));
      
      endpoints.forEach(result => {
        const perfColor = result.average <= result.expectedTime ? chalk.green : chalk.red;
        console.log(`  ${result.name}:`);
        console.log(`    Average: ${perfColor(result.average.toFixed(1) + 'ms')} (expected: ${result.expectedTime}ms)`);
        console.log(`    Range: ${result.min}ms - ${result.max}ms`);
        console.log(`    Success Rate: ${result.successRate.toFixed(1)}%`);
      });
      
      console.log('');
    });

    // Overall statistics
    this.displayOverallStats(categories);

    // Recommendations
    this.displayRecommendations();
  }

  groupByCategory() {
    const categories = {};
    
    this.results.forEach(result => {
      if (!categories[result.category]) {
        categories[result.category] = [];
      }
      categories[result.category].push(result);
    });

    return categories;
  }

  displayOverallStats(categories) {
    console.log(chalk.blue.bold('Overall Performance:'));

    Object.entries(categories).forEach(([category, endpoints]) => {
      const avgResponseTime = endpoints.reduce((sum, ep) => sum + ep.average, 0) / endpoints.length;
      const avgSuccessRate = endpoints.reduce((sum, ep) => sum + ep.successRate, 0) / endpoints.length;
      
      const performanceColor = avgResponseTime < 200 ? chalk.green : avgResponseTime < 500 ? chalk.yellow : chalk.red;
      
      console.log(`  ${category}: ${performanceColor(avgResponseTime.toFixed(1) + 'ms avg')} | ${avgSuccessRate.toFixed(1)}% success`);
    });

    console.log('');
  }

  displayRecommendations() {
    console.log(chalk.blue.bold('🎯 Performance Recommendations:\n'));

    const slowEndpoints = this.results.filter(r => r.average > r.expectedTime * 1.5);
    const failingEndpoints = this.results.filter(r => r.successRate < 95);

    if (slowEndpoints.length > 0) {
      console.log(chalk.red('Slow Endpoints (>150% expected time):'));
      slowEndpoints.forEach(ep => {
        console.log(`  • ${ep.name}: ${ep.average.toFixed(1)}ms (expected: ${ep.expectedTime}ms)`);
      });
      console.log('  Recommendations: Check cache configuration, database queries, or server resources\n');
    }

    if (failingEndpoints.length > 0) {
      console.log(chalk.red('Unreliable Endpoints (<95% success rate):'));
      failingEndpoints.forEach(ep => {
        console.log(`  • ${ep.name}: ${ep.successRate.toFixed(1)}% success rate`);
      });
      console.log('  Recommendations: Check error handling, database connections, or server stability\n');
    }

    if (slowEndpoints.length === 0 && failingEndpoints.length === 0) {
      console.log(chalk.green('🎉 All endpoints performing within acceptable limits!'));
    }

    // Cache-specific recommendations
    const pricingEndpoints = this.results.filter(r => r.category === 'pricing');
    if (pricingEndpoints.length > 0) {
      const avgPricingTime = pricingEndpoints.reduce((sum, ep) => sum + ep.average, 0) / pricingEndpoints.length;
      
      if (avgPricingTime > 100) {
        console.log(chalk.yellow('Cache Optimization Suggestion:'));
        console.log(`  Pricing APIs averaging ${avgPricingTime.toFixed(1)}ms - consider cache warming for popular queries\n`);
      } else {
        console.log(chalk.green('✅ Caching is working effectively for pricing APIs\n'));
      }
    }

    console.log(chalk.blue.bold('Benchmark completed! 🚀'));
  }
}

// Run the benchmark
async function main() {
  const benchmark = new APIBenchmark();
  await benchmark.runBenchmarks();
}

if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('\n❌ Benchmark failed:'), error.message);
    process.exit(1);
  });
}

module.exports = APIBenchmark;
