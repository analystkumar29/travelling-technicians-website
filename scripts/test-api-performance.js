#!/usr/bin/env node

/**
 * API Performance Testing Script
 * Comprehensive testing of all API endpoints with detailed performance metrics
 * 
 * Features:
 * - Response time monitoring
 * - Error rate tracking
 * - Load testing simulation
 * - Performance regression detection
 * - Detailed analytics and reporting
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
const TEST_ITERATIONS = 5;
const LOAD_TEST_CONCURRENT = 10;
const PERFORMANCE_THRESHOLDS = {
  brands: 200,      // ms
  models: 300,      // ms
  pricing: 500,     // ms
  services: 150,    // ms
  coverage: 1000    // ms
};

// Logging utility
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const symbols = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    step: '🚀',
    metric: '📊'
  };
  
  console.log(`${timestamp} ${symbols[type]} ${message}`);
}

// Performance metrics collector
class PerformanceMetrics {
  constructor() {
    this.metrics = new Map();
  }
  
  addMetric(endpoint, responseTime, success, statusCode) {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, {
        responseTimes: [],
        successes: 0,
        failures: 0,
        statusCodes: new Map()
      });
    }
    
    const metric = this.metrics.get(endpoint);
    metric.responseTimes.push(responseTime);
    
    if (success) {
      metric.successes++;
    } else {
      metric.failures++;
    }
    
    const count = metric.statusCodes.get(statusCode) || 0;
    metric.statusCodes.set(statusCode, count + 1);
  }
  
  getStatistics(endpoint) {
    const metric = this.metrics.get(endpoint);
    if (!metric) return null;
    
    const responseTimes = metric.responseTimes.sort((a, b) => a - b);
    const total = responseTimes.length;
    
    return {
      endpoint,
      totalRequests: total,
      successRate: ((metric.successes / total) * 100).toFixed(2),
      averageResponseTime: (responseTimes.reduce((a, b) => a + b, 0) / total).toFixed(2),
      medianResponseTime: responseTimes[Math.floor(total / 2)].toFixed(2),
      p95ResponseTime: responseTimes[Math.floor(total * 0.95)].toFixed(2),
      minResponseTime: responseTimes[0].toFixed(2),
      maxResponseTime: responseTimes[total - 1].toFixed(2),
      statusCodeDistribution: Object.fromEntries(metric.statusCodes),
      thresholdViolations: responseTimes.filter(rt => rt > (PERFORMANCE_THRESHOLDS[endpoint.split('/').pop()] || 1000)).length
    };
  }
  
  getAllStatistics() {
    const stats = [];
    for (const endpoint of this.metrics.keys()) {
      stats.push(this.getStatistics(endpoint));
    }
    return stats;
  }
}

// HTTP request wrapper with timing
async function timedRequest(url, options = {}) {
  const startTime = Date.now();
  let success = false;
  let statusCode = 0;
  let data = null;
  let error = null;
  
  try {
    const response = await fetch(url, {
      timeout: 10000,
      ...options
    });
    
    statusCode = response.status;
    success = response.ok;
    
    if (response.ok) {
      data = await response.json();
    } else {
      error = `HTTP ${response.status}: ${response.statusText}`;
    }
  } catch (err) {
    error = err.message;
    success = false;
  }
  
  const responseTime = Date.now() - startTime;
  
  return {
    responseTime,
    success,
    statusCode,
    data,
    error
  };
}

// Test individual API endpoint
async function testEndpoint(url, description, metrics) {
  log(`Testing: ${description}`, 'step');
  
  for (let i = 0; i < TEST_ITERATIONS; i++) {
    const result = await timedRequest(url);
    metrics.addMetric(description, result.responseTime, result.success, result.statusCode);
    
    if (!result.success) {
      log(`  Iteration ${i + 1}: FAIL (${result.responseTime}ms) - ${result.error}`, 'error');
    } else {
      log(`  Iteration ${i + 1}: OK (${result.responseTime}ms)`, 'success');
    }
  }
}

// Load testing simulation
async function loadTest(url, description, metrics) {
  log(`Load testing: ${description} (${LOAD_TEST_CONCURRENT} concurrent requests)`, 'step');
  
  const promises = [];
  const startTime = Date.now();
  
  for (let i = 0; i < LOAD_TEST_CONCURRENT; i++) {
    promises.push(timedRequest(url));
  }
  
  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  
  results.forEach(result => {
    metrics.addMetric(`${description}_load`, result.responseTime, result.success, result.statusCode);
  });
  
  const successCount = results.filter(r => r.success).length;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  
  log(`  Load test completed in ${totalTime}ms`, 'success');
  log(`  Success rate: ${((successCount / LOAD_TEST_CONCURRENT) * 100).toFixed(2)}%`, 'metric');
  log(`  Average response time: ${avgResponseTime.toFixed(2)}ms`, 'metric');
}

// Test suite for API endpoints
async function runApiTests(metrics) {
  log('🚀 Starting API Performance Tests', 'info');
  log('================================', 'info');
  
  const endpoints = [
    {
      url: `${BASE_URL}/api/devices/brands?deviceType=mobile`,
      description: 'brands',
      loadTest: true
    },
    {
      url: `${BASE_URL}/api/devices/models?deviceType=mobile&brand=Apple`,
      description: 'models',
      loadTest: true
    },
    {
      url: `${BASE_URL}/api/pricing/calculate-fixed?deviceType=mobile&brand=Apple&model=iPhone%2015&service=screen_replacement&tier=standard`,
      description: 'pricing',
      loadTest: true
    },
    {
      url: `${BASE_URL}/api/pricing/services?deviceType=mobile`,
      description: 'services',
      loadTest: false
    },
    {
      url: `${BASE_URL}/api/management/pricing-coverage`,
      description: 'coverage',
      loadTest: false
    },
    {
      url: `${BASE_URL}/api/ping`,
      description: 'health_check',
      loadTest: false
    }
  ];
  
  // Individual endpoint tests
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint.url, endpoint.description, metrics);
  }
  
  log('', 'info');
  log('🔥 Running Load Tests', 'info');
  log('====================', 'info');
  
  // Load tests for critical endpoints
  for (const endpoint of endpoints.filter(e => e.loadTest)) {
    await loadTest(endpoint.url, endpoint.description, metrics);
  }
}

// Performance analysis and reporting
function analyzePerformance(metrics) {
  log('📊 Performance Analysis Report', 'info');
  log('=============================', 'info');
  
  const stats = metrics.getAllStatistics();
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalEndpoints: stats.length,
      overallSuccessRate: 0,
      averageResponseTime: 0,
      thresholdViolations: 0
    },
    endpoints: stats,
    recommendations: []
  };
  
  // Calculate overall metrics
  let totalRequests = 0;
  let totalSuccesses = 0;
  let totalResponseTime = 0;
  let totalViolations = 0;
  
  stats.forEach(stat => {
    totalRequests += stat.totalRequests;
    totalSuccesses += Math.round((stat.successRate / 100) * stat.totalRequests);
    totalResponseTime += parseFloat(stat.averageResponseTime) * stat.totalRequests;
    totalViolations += stat.thresholdViolations;
  });
  
  report.summary.overallSuccessRate = ((totalSuccesses / totalRequests) * 100).toFixed(2);
  report.summary.averageResponseTime = (totalResponseTime / totalRequests).toFixed(2);
  report.summary.thresholdViolations = totalViolations;
  
  // Generate recommendations
  stats.forEach(stat => {
    const threshold = PERFORMANCE_THRESHOLDS[stat.endpoint.split('_')[0]] || 1000;
    
    if (parseFloat(stat.averageResponseTime) > threshold) {
      report.recommendations.push({
        type: 'performance',
        endpoint: stat.endpoint,
        issue: `Average response time (${stat.averageResponseTime}ms) exceeds threshold (${threshold}ms)`,
        suggestion: 'Consider implementing caching or database optimization'
      });
    }
    
    if (parseFloat(stat.successRate) < 95) {
      report.recommendations.push({
        type: 'reliability',
        endpoint: stat.endpoint,
        issue: `Success rate (${stat.successRate}%) is below 95%`,
        suggestion: 'Investigate error causes and improve error handling'
      });
    }
    
    if (stat.thresholdViolations > 0) {
      report.recommendations.push({
        type: 'consistency',
        endpoint: stat.endpoint,
        issue: `${stat.thresholdViolations} requests exceeded performance threshold`,
        suggestion: 'Investigate performance spikes and optimize slow queries'
      });
    }
  });
  
  // Display report
  log('', 'info');
  log(`📈 Overall Success Rate: ${report.summary.overallSuccessRate}%`, 'metric');
  log(`⏱️  Average Response Time: ${report.summary.averageResponseTime}ms`, 'metric');
  log(`⚠️  Threshold Violations: ${report.summary.thresholdViolations}`, 'metric');
  log('', 'info');
  
  stats.forEach(stat => {
    log(`${stat.endpoint}:`, 'info');
    log(`  Success Rate: ${stat.successRate}%`, 'metric');
    log(`  Avg Response: ${stat.averageResponseTime}ms`, 'metric');
    log(`  P95 Response: ${stat.p95ResponseTime}ms`, 'metric');
    log(`  Threshold Violations: ${stat.thresholdViolations}`, 'metric');
    log('', 'info');
  });
  
  if (report.recommendations.length > 0) {
    log('🔧 Recommendations:', 'warning');
    report.recommendations.forEach((rec, index) => {
      log(`  ${index + 1}. [${rec.type.toUpperCase()}] ${rec.endpoint}`, 'warning');
      log(`     Issue: ${rec.issue}`, 'warning');
      log(`     Suggestion: ${rec.suggestion}`, 'warning');
      log('', 'info');
    });
  } else {
    log('🎉 All endpoints performing within acceptable parameters!', 'success');
  }
  
  // Save report to file
  const reportPath = path.join(__dirname, '..', 'reports', `api-performance-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`📄 Detailed report saved to: ${reportPath}`, 'info');
  
  return report;
}

// Health check before tests
async function healthCheck() {
  log('🔍 Performing health check...', 'step');
  
  try {
    const result = await timedRequest(`${BASE_URL}/api/ping`);
    
    if (result.success) {
      log(`✅ Health check passed (${result.responseTime}ms)`, 'success');
      return true;
    } else {
      log(`❌ Health check failed: ${result.error}`, 'error');
      return false;
    }
  } catch (error) {
    log(`❌ Health check exception: ${error.message}`, 'error');
    return false;
  }
}

// Main function
async function main() {
  try {
    log('🚀 API Performance Testing Suite', 'info');
    log('Testing against: ' + BASE_URL, 'info');
    log('===============================', 'info');
    
    // Health check
    const isHealthy = await healthCheck();
    if (!isHealthy) {
      log('❌ Server health check failed. Please ensure the server is running.', 'error');
      process.exit(1);
    }
    
    // Initialize metrics collector
    const metrics = new PerformanceMetrics();
    
    // Run API tests
    await runApiTests(metrics);
    
    // Analyze and report
    const report = analyzePerformance(metrics);
    
    log('🎯 Performance testing completed successfully!', 'success');
    
    // Exit with appropriate code
    const hasIssues = report.recommendations.length > 0;
    process.exit(hasIssues ? 1 : 0);
    
  } catch (error) {
    log(`❌ Performance testing failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { main, PerformanceMetrics, timedRequest, log }; 