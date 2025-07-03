#!/usr/bin/env node

/**
 * System Health Check Script
 * Comprehensive monitoring of all system components with actionable recommendations
 * 
 * Features:
 * - Database connectivity and performance
 * - API endpoint health and response times
 * - Cache performance monitoring  
 * - Error rate tracking
 * - Resource utilization analysis
 * - Automated issue detection
 * - Performance regression alerts
 * - Detailed health report generation
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Health check thresholds
const THRESHOLDS = {
  database: {
    maxResponseTime: 1000,    // ms
    maxConnections: 80,       // % of max
    minCacheHitRate: 80       // %
  },
  api: {
    maxResponseTime: 500,     // ms
    minSuccessRate: 95,       // %
    maxErrorRate: 5           // %
  },
  memory: {
    maxUsage: 85,             // %
    maxHeapUsage: 75          // %
  },
  disk: {
    maxUsage: 80              // %
  }
};

// Health status levels
const HealthStatus = {
  HEALTHY: 'healthy',
  WARNING: 'warning',
  CRITICAL: 'critical',
  DOWN: 'down'
};

// Logging utility
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const symbols = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    critical: '🚨',
    step: '🔍'
  };
  
  console.log(`${timestamp} ${symbols[type]} ${message}`);
}

// Health report structure
class HealthReport {
  constructor() {
    this.timestamp = new Date().toISOString();
    this.overallStatus = HealthStatus.HEALTHY;
    this.components = {};
    this.recommendations = [];
    this.metrics = {};
    this.alerts = [];
  }

  addComponent(name, status, metrics = {}, details = '') {
    this.components[name] = {
      status,
      metrics,
      details,
      timestamp: new Date().toISOString()
    };

    // Update overall status (worst component status becomes overall status)
    const statusPriority = {
      [HealthStatus.HEALTHY]: 0,
      [HealthStatus.WARNING]: 1,
      [HealthStatus.CRITICAL]: 2,
      [HealthStatus.DOWN]: 3
    };

    if (statusPriority[status] > statusPriority[this.overallStatus]) {
      this.overallStatus = status;
    }
  }

  addRecommendation(type, priority, description, action) {
    this.recommendations.push({
      type,
      priority,
      description,
      action,
      timestamp: new Date().toISOString()
    });
  }

  addAlert(severity, component, message, metric = null) {
    this.alerts.push({
      severity,
      component,
      message,
      metric,
      timestamp: new Date().toISOString()
    });
  }

  getStatusSymbol() {
    const symbols = {
      [HealthStatus.HEALTHY]: '🟢',
      [HealthStatus.WARNING]: '🟡',
      [HealthStatus.CRITICAL]: '🔴',
      [HealthStatus.DOWN]: '⚫'
    };
    return symbols[this.overallStatus];
  }
}

// Database health check
async function checkDatabaseHealth() {
  log('Checking database health...', 'step');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      status: HealthStatus.DOWN,
      metrics: {},
      details: 'Missing Supabase configuration'
    };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const startTime = Date.now();

    // Test basic connectivity
    const { data: testData, error: testError } = await supabase
      .from('device_types')
      .select('count')
      .limit(1);

    if (testError) {
      return {
        status: HealthStatus.DOWN,
        metrics: { responseTime: Date.now() - startTime },
        details: `Database connection failed: ${testError.message}`
      };
    }

    const responseTime = Date.now() - startTime;

    // Check database statistics
    const { data: statsData, error: statsError } = await supabase.rpc('get_database_stats');
    
    const metrics = {
      responseTime,
      connectionTest: 'passed',
      dataIntegrity: testData ? 'verified' : 'unknown'
    };

    if (statsData) {
      metrics.activeConnections = statsData.active_connections || 0;
      metrics.cacheHitRate = statsData.cache_hit_rate || 0;
      metrics.queryCount = statsData.query_count || 0;
    }

    // Determine status based on metrics
    let status = HealthStatus.HEALTHY;
    if (responseTime > THRESHOLDS.database.maxResponseTime) {
      status = HealthStatus.WARNING;
    }
    if (responseTime > THRESHOLDS.database.maxResponseTime * 2) {
      status = HealthStatus.CRITICAL;
    }

    return {
      status,
      metrics,
      details: `Database responding in ${responseTime}ms`
    };

  } catch (error) {
    return {
      status: HealthStatus.DOWN,
      metrics: {},
      details: `Database check failed: ${error.message}`
    };
  }
}

// API health check
async function checkApiHealth() {
  log('Checking API health...', 'step');

  const endpoints = [
    { path: '/api/ping', name: 'health_check', critical: true },
    { path: '/api/devices/brands?deviceType=mobile', name: 'brands_api', critical: true },
    { path: '/api/devices/models?deviceType=mobile&brand=Apple', name: 'models_api', critical: true },
    { path: '/api/pricing/calculate-fixed?deviceType=mobile&brand=Apple&model=iPhone%2015&service=screen_replacement&tier=standard', name: 'pricing_api', critical: true },
    { path: '/api/management/pricing-coverage', name: 'management_api', critical: false }
  ];

  const results = [];
  let totalResponseTime = 0;
  let successCount = 0;
  let totalRequests = endpoints.length;

  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${BASE_URL}${endpoint.path}`, {
        timeout: 10000,
        headers: { 'User-Agent': 'HealthCheck/1.0' }
      });
      
      const responseTime = Date.now() - startTime;
      totalResponseTime += responseTime;

      let status = HealthStatus.HEALTHY;
      if (!response.ok) {
        status = endpoint.critical ? HealthStatus.CRITICAL : HealthStatus.WARNING;
      } else if (responseTime > THRESHOLDS.api.maxResponseTime) {
        status = HealthStatus.WARNING;
      } else {
        successCount++;
      }

      results.push({
        name: endpoint.name,
        status,
        responseTime,
        statusCode: response.status,
        critical: endpoint.critical
      });

    } catch (error) {
      results.push({
        name: endpoint.name,
        status: endpoint.critical ? HealthStatus.DOWN : HealthStatus.CRITICAL,
        responseTime: null,
        error: error.message,
        critical: endpoint.critical
      });
    }
  }

  const averageResponseTime = totalResponseTime / totalRequests;
  const successRate = (successCount / totalRequests) * 100;

  // Determine overall API status
  let overallStatus = HealthStatus.HEALTHY;
  const criticalFailures = results.filter(r => r.critical && r.status === HealthStatus.DOWN).length;
  const criticalWarnings = results.filter(r => r.critical && r.status === HealthStatus.CRITICAL).length;

  if (criticalFailures > 0) {
    overallStatus = HealthStatus.DOWN;
  } else if (criticalWarnings > 0 || successRate < THRESHOLDS.api.minSuccessRate) {
    overallStatus = HealthStatus.CRITICAL;
  } else if (averageResponseTime > THRESHOLDS.api.maxResponseTime) {
    overallStatus = HealthStatus.WARNING;
  }

  return {
    status: overallStatus,
    metrics: {
      averageResponseTime: Math.round(averageResponseTime),
      successRate: Math.round(successRate * 100) / 100,
      totalEndpoints: totalRequests,
      successfulEndpoints: successCount,
      failedEndpoints: totalRequests - successCount
    },
    details: `${successCount}/${totalRequests} endpoints healthy, avg response: ${Math.round(averageResponseTime)}ms`,
    endpoints: results
  };
}

// Cache performance check
async function checkCacheHealth() {
  log('Checking cache performance...', 'step');

  try {
    // Test cache functionality by making a request
    const testUrl = `${BASE_URL}/api/pricing/calculate-fixed?deviceType=mobile&brand=Apple&model=iPhone%2015&service=screen_replacement&tier=standard`;
    
    const startTime1 = Date.now();
    const response1 = await fetch(testUrl);
    const responseTime1 = Date.now() - startTime1;
    
    // Second request should be faster if caching works
    const startTime2 = Date.now();
    const response2 = await fetch(testUrl);
    const responseTime2 = Date.now() - startTime2;

    const cacheEfficiency = responseTime1 > 0 ? ((responseTime1 - responseTime2) / responseTime1) * 100 : 0;
    
    let status = HealthStatus.HEALTHY;
    if (cacheEfficiency < 20) {
      status = HealthStatus.WARNING;
    }
    if (cacheEfficiency < 0) {
      status = HealthStatus.CRITICAL;
    }

    const metrics = {
      firstRequestTime: responseTime1,
      secondRequestTime: responseTime2,
      cacheEfficiency: Math.round(cacheEfficiency),
      avgResponseTime: Math.round((responseTime1 + responseTime2) / 2)
    };

    return {
      status,
      metrics,
      details: `Cache efficiency: ${Math.round(cacheEfficiency)}%, avg response: ${metrics.avgResponseTime}ms`
    };

  } catch (error) {
    return {
      status: HealthStatus.WARNING,
      metrics: {},
      details: `Cache test failed: ${error.message}`
    };
  }
}

// Memory usage check (if available)
async function checkMemoryHealth() {
  log('Checking memory usage...', 'step');

  try {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const heapUtilization = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      
      let status = HealthStatus.HEALTHY;
      if (heapUtilization > THRESHOLDS.memory.maxHeapUsage) {
        status = HealthStatus.WARNING;
      }
      if (heapUtilization > THRESHOLDS.memory.maxHeapUsage * 1.2) {
        status = HealthStatus.CRITICAL;
      }

      return {
        status,
        metrics: {
          heapUsedMB,
          heapTotalMB,
          heapUtilization: Math.round(heapUtilization),
          rss: Math.round(memUsage.rss / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024)
        },
        details: `Heap: ${heapUsedMB}MB/${heapTotalMB}MB (${Math.round(heapUtilization)}%)`
      };
    } else {
      return {
        status: HealthStatus.HEALTHY,
        metrics: {},
        details: 'Memory monitoring not available in this environment'
      };
    }
  } catch (error) {
    return {
      status: HealthStatus.WARNING,
      metrics: {},
      details: `Memory check failed: ${error.message}`
    };
  }
}

// Generate recommendations based on health check results
function generateRecommendations(report) {
  log('Generating recommendations...', 'step');

  // Database recommendations
  const dbComponent = report.components.database;
  if (dbComponent) {
    if (dbComponent.status === HealthStatus.WARNING && dbComponent.metrics.responseTime > THRESHOLDS.database.maxResponseTime) {
      report.addRecommendation(
        'performance',
        'high',
        'Database response time is slow',
        'Run database optimization script: npm run db:optimize'
      );
    }

    if (dbComponent.status === HealthStatus.DOWN) {
      report.addRecommendation(
        'critical',
        'urgent',
        'Database is not accessible',
        'Check database connection and Supabase configuration'
      );
    }
  }

  // API recommendations  
  const apiComponent = report.components.api;
  if (apiComponent) {
    if (apiComponent.metrics.successRate < THRESHOLDS.api.minSuccessRate) {
      report.addRecommendation(
        'reliability',
        'high',
        'API success rate is below threshold',
        'Investigate failing endpoints and improve error handling'
      );
    }

    if (apiComponent.metrics.averageResponseTime > THRESHOLDS.api.maxResponseTime) {
      report.addRecommendation(
        'performance',
        'medium',
        'API response times are slow',
        'Implement caching and optimize slow endpoints'
      );
    }
  }

  // Cache recommendations
  const cacheComponent = report.components.cache;
  if (cacheComponent && cacheComponent.metrics.cacheEfficiency < 20) {
    report.addRecommendation(
      'performance',
      'medium',
      'Cache efficiency is low',
      'Review cache configuration and warming strategies'
    );
  }

  // Memory recommendations
  const memoryComponent = report.components.memory;
  if (memoryComponent && memoryComponent.metrics.heapUtilization > THRESHOLDS.memory.maxHeapUsage) {
    report.addRecommendation(
      'resource',
      'medium',
      'Memory usage is high',
      'Monitor for memory leaks and optimize data structures'
    );
  }

  // Generate alerts
  Object.keys(report.components).forEach(componentName => {
    const component = report.components[componentName];
    
    if (component.status === HealthStatus.DOWN) {
      report.addAlert('critical', componentName, `${componentName} is down`, component.metrics);
    } else if (component.status === HealthStatus.CRITICAL) {
      report.addAlert('high', componentName, `${componentName} has critical issues`, component.metrics);
    } else if (component.status === HealthStatus.WARNING) {
      report.addAlert('medium', componentName, `${componentName} has warnings`, component.metrics);
    }
  });
}

// Display health report
function displayReport(report) {
  log('📊 System Health Check Report', 'info');
  log('============================', 'info');
  log(`${report.getStatusSymbol()} Overall Status: ${report.overallStatus.toUpperCase()}`, 'info');
  log(`🕐 Check Time: ${report.timestamp}`, 'info');
  log('', 'info');

  // Component status
  log('🔧 Component Status:', 'info');
  Object.keys(report.components).forEach(name => {
    const component = report.components[name];
    const symbol = {
      [HealthStatus.HEALTHY]: '🟢',
      [HealthStatus.WARNING]: '🟡',
      [HealthStatus.CRITICAL]: '🔴',
      [HealthStatus.DOWN]: '⚫'
    }[component.status];
    
    log(`  ${symbol} ${name}: ${component.status} - ${component.details}`, 'info');
    
    // Show key metrics
    if (Object.keys(component.metrics).length > 0) {
      Object.keys(component.metrics).forEach(metric => {
        const value = component.metrics[metric];
        log(`      ${metric}: ${value}${typeof value === 'number' && metric.includes('Time') ? 'ms' : ''}`, 'info');
      });
    }
    log('', 'info');
  });

  // Alerts
  if (report.alerts.length > 0) {
    log('🚨 Active Alerts:', 'critical');
    report.alerts.forEach(alert => {
      const severity = alert.severity === 'critical' ? '🚨' : alert.severity === 'high' ? '⚠️' : '📝';
      log(`  ${severity} [${alert.severity.toUpperCase()}] ${alert.component}: ${alert.message}`, 'warning');
    });
    log('', 'info');
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    log('💡 Recommendations:', 'warning');
    report.recommendations.forEach((rec, index) => {
      log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.description}`, 'warning');
      log(`     Action: ${rec.action}`, 'warning');
    });
    log('', 'info');
  } else {
    log('🎉 No issues detected - system is healthy!', 'success');
  }
}

// Save report to file
function saveReport(report) {
  try {
    const reportsDir = path.join(__dirname, '..', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });
    
    const filename = `health-check-${Date.now()}.json`;
    const filepath = path.join(reportsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    log(`📄 Report saved to: ${filepath}`, 'info');
    
    // Also save latest report
    const latestPath = path.join(reportsDir, 'latest-health-check.json');
    fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));
    
  } catch (error) {
    log(`Failed to save report: ${error.message}`, 'error');
  }
}

// Main health check function
async function main() {
  try {
    log('🏥 Starting System Health Check', 'info');
    log('==============================', 'info');

    const report = new HealthReport();

    // Run all health checks in parallel for efficiency
    const [databaseHealth, apiHealth, cacheHealth, memoryHealth] = await Promise.all([
      checkDatabaseHealth(),
      checkApiHealth(),
      checkCacheHealth(),
      checkMemoryHealth()
    ]);

    // Add results to report
    report.addComponent('database', databaseHealth.status, databaseHealth.metrics, databaseHealth.details);
    report.addComponent('api', apiHealth.status, apiHealth.metrics, apiHealth.details);
    report.addComponent('cache', cacheHealth.status, cacheHealth.metrics, cacheHealth.details);
    report.addComponent('memory', memoryHealth.status, memoryHealth.metrics, memoryHealth.details);

    // Generate recommendations and alerts
    generateRecommendations(report);

    // Display and save report
    displayReport(report);
    saveReport(report);

    log('🎯 Health check completed!', 'success');

    // Exit with appropriate code
    const exitCode = report.overallStatus === HealthStatus.DOWN ? 2 :
                     report.overallStatus === HealthStatus.CRITICAL ? 1 : 0;
    
    process.exit(exitCode);

  } catch (error) {
    log(`❌ Health check failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { main, checkDatabaseHealth, checkApiHealth, HealthStatus }; 