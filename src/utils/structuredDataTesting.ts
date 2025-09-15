import { validateStructuredData, generateTestReport, testWithGoogleRichResults } from './structuredDataValidation';
import { logger } from './logger';

// Create a module logger
const testLogger = logger.createModuleLogger('structuredDataTesting');

export interface StructuredDataTestResult {
  page: string;
  url: string;
  schemas: Array<{
    type: string;
    isValid: boolean;
    errors: string[];
    warnings: string[];
    data: any;
  }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    withWarnings: number;
  };
  richResultsTestUrl?: string;
}

/**
 * Extract structured data from page HTML
 */
export function extractStructuredDataFromHTML(html: string): any[] {
  const schemas: any[] = [];
  
  try {
    // Find all JSON-LD script tags
    const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gis;
    let match;
    
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const jsonData = JSON.parse(match[1]);
        schemas.push(jsonData);
      } catch (parseError) {
        testLogger.warn('Failed to parse JSON-LD script:', parseError);
      }
    }
  } catch (error) {
    testLogger.error('Error extracting structured data from HTML:', error);
  }
  
  return schemas;
}

/**
 * Test structured data on a single page
 */
export async function testPageStructuredData(
  url: string,
  pageTitle: string = 'Unknown Page'
): Promise<StructuredDataTestResult> {
  testLogger.info(`Testing structured data for ${pageTitle} at ${url}`);
  
  try {
    // In a real implementation, you would fetch the page HTML
    // For now, we'll create a placeholder test result
    const mockSchemas: Record<string, any>[] = []; // This would be populated from extractStructuredDataFromHTML(html)
    
    const schemaResults = mockSchemas.map(schema => {
      const validation = validateStructuredData(schema);
      return {
        type: schema['@type'] || 'Unknown',
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
        data: schema
      };
    });
    
    const summary = {
      total: schemaResults.length,
      valid: schemaResults.filter(s => s.isValid).length,
      invalid: schemaResults.filter(s => !s.isValid).length,
      withWarnings: schemaResults.filter(s => s.warnings.length > 0).length
    };
    
    // Generate Google Rich Results test URL
    const richResultsTest = await testWithGoogleRichResults(url);
    
    return {
      page: pageTitle,
      url,
      schemas: schemaResults,
      summary,
      richResultsTestUrl: richResultsTest.testUrl
    };
  } catch (error) {
    testLogger.error(`Error testing structured data for ${pageTitle}:`, error);
    throw error;
  }
}

/**
 * Test structured data across multiple pages
 */
export async function testMultiplePages(pages: Array<{ url: string; title: string }>): Promise<StructuredDataTestResult[]> {
  const results: StructuredDataTestResult[] = [];
  
  for (const page of pages) {
    try {
      const result = await testPageStructuredData(page.url, page.title);
      results.push(result);
    } catch (error) {
      testLogger.error(`Failed to test page ${page.title}:`, error);
      // Continue with other pages
    }
  }
  
  return results;
}

/**
 * Generate comprehensive test report
 */
export function generateStructuredDataReport(results: StructuredDataTestResult[]): {
  overview: {
    totalPages: number;
    totalSchemas: number;
    validSchemas: number;
    invalidSchemas: number;
    schemasWithWarnings: number;
    mostCommonErrors: Array<{ error: string; count: number }>;
    schemaTypeBreakdown: Array<{ type: string; count: number; validCount: number }>;
  };
  pageResults: StructuredDataTestResult[];
  recommendations: string[];
} {
  const overview = {
    totalPages: results.length,
    totalSchemas: results.reduce((sum, r) => sum + r.summary.total, 0),
    validSchemas: results.reduce((sum, r) => sum + r.summary.valid, 0),
    invalidSchemas: results.reduce((sum, r) => sum + r.summary.invalid, 0),
    schemasWithWarnings: results.reduce((sum, r) => sum + r.summary.withWarnings, 0),
    mostCommonErrors: [] as Array<{ error: string; count: number }>,
    schemaTypeBreakdown: [] as Array<{ type: string; count: number; validCount: number }>
  };
  
  // Count errors
  const errorCounts = new Map<string, number>();
  const typeCounts = new Map<string, { total: number; valid: number }>();
  
  results.forEach(result => {
    result.schemas.forEach(schema => {
      // Count schema types
      const type = schema.type;
      const current = typeCounts.get(type) || { total: 0, valid: 0 };
      current.total++;
      if (schema.isValid) current.valid++;
      typeCounts.set(type, current);
      
      // Count errors
      schema.errors.forEach(error => {
        errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
      });
    });
  });
  
  // Convert to arrays and sort
  overview.mostCommonErrors = Array.from(errorCounts.entries())
    .map(([error, count]) => ({ error, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
    
  overview.schemaTypeBreakdown = Array.from(typeCounts.entries())
    .map(([type, counts]) => ({ type, count: counts.total, validCount: counts.valid }))
    .sort((a, b) => b.count - a.count);
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (overview.invalidSchemas > 0) {
    recommendations.push(`Fix ${overview.invalidSchemas} invalid schemas to improve search visibility`);
  }
  
  if (overview.schemasWithWarnings > 0) {
    recommendations.push(`Address ${overview.schemasWithWarnings} schema warnings for optimal performance`);
  }
  
  const missingSchemaTypes = ['LocalBusiness', 'Organization', 'Service', 'FAQPage']
    .filter(type => !overview.schemaTypeBreakdown.some(s => s.type === type));
    
  if (missingSchemaTypes.length > 0) {
    recommendations.push(`Consider adding missing schema types: ${missingSchemaTypes.join(', ')}`);
  }
  
  if (overview.mostCommonErrors.length > 0) {
    recommendations.push(`Most common error: "${overview.mostCommonErrors[0].error}" (${overview.mostCommonErrors[0].count} occurrences)`);
  }
  
  return {
    overview,
    pageResults: results,
    recommendations
  };
}

/**
 * Automated test suite for all key pages
 */
export async function runFullStructuredDataTest(): Promise<{
  report: ReturnType<typeof generateStructuredDataReport>;
  timestamp: string;
}> {
  testLogger.info('Starting comprehensive structured data test');
  
  const testPages = [
    { url: 'https://travellingtechnicians.ca/', title: 'Homepage' },
    { url: 'https://travellingtechnicians.ca/services/mobile-repair', title: 'Mobile Repair Service' },
    { url: 'https://travellingtechnicians.ca/services/laptop-repair', title: 'Laptop Repair Service' },
    { url: 'https://travellingtechnicians.ca/faq', title: 'FAQ Page' },
    { url: 'https://travellingtechnicians.ca/about', title: 'About Page' },
    { url: 'https://travellingtechnicians.ca/contact', title: 'Contact Page' },
    { url: 'https://travellingtechnicians.ca/blog/signs-your-phone-needs-repair', title: 'Blog Post - Phone Repair Signs' },
    { url: 'https://travellingtechnicians.ca/repair/vancouver', title: 'Vancouver Repair Location' }
  ];
  
  try {
    const results = await testMultiplePages(testPages);
    const report = generateStructuredDataReport(results);
    
    testLogger.info('Structured data test completed', {
      totalPages: report.overview.totalPages,
      totalSchemas: report.overview.totalSchemas,
      validSchemas: report.overview.validSchemas,
      invalidSchemas: report.overview.invalidSchemas
    });
    
    return {
      report,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    testLogger.error('Error running full structured data test:', error);
    throw error;
  }
}

/**
 * Quick validation test for development
 */
export function quickStructuredDataTest(schemas: any[]): void {
  testLogger.info('Running quick structured data validation');
  
  const report = generateTestReport(schemas);
  
  console.group('🔍 Structured Data Quick Test Results');
  console.log(`📊 Summary: ${report.summary.valid}/${report.summary.total} valid schemas`);
  
  if (report.summary.invalid > 0) {
    console.group('❌ Invalid Schemas:');
    report.details.filter(d => !d.isValid).forEach(detail => {
      console.log(`🚫 ${detail.type}:`, detail.errors);
    });
    console.groupEnd();
  }
  
  if (report.summary.withWarnings > 0) {
    console.group('⚠️ Warnings:');
    report.details.filter(d => d.warnings.length > 0).forEach(detail => {
      console.log(`⚠️ ${detail.type}:`, detail.warnings);
    });
    console.groupEnd();
  }
  
  if (report.summary.valid === report.summary.total && report.summary.withWarnings === 0) {
    console.log('✅ All schemas are valid!');
  }
  
  console.groupEnd();
}

/**
 * Performance-focused structured data testing
 */
export async function testStructuredDataPerformance(): Promise<{
  validationTime: number;
  schemaCount: number;
  averageValidationTime: number;
  recommendations: string[];
}> {
  testLogger.info('Testing structured data performance');
  
  // Create test schemas
  const testSchemas = [
    { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'Test Business' },
    { '@context': 'https://schema.org', '@type': 'Service', name: 'Test Service' },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [] },
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'Test Org' }
  ];
  
  const startTime = performance.now();
  
  // Validate all schemas
  const results = testSchemas.map(schema => validateStructuredData(schema));
  
  const endTime = performance.now();
  const validationTime = endTime - startTime;
  const averageValidationTime = validationTime / testSchemas.length;
  
  const recommendations: string[] = [];
  
  if (averageValidationTime > 10) {
    recommendations.push('Validation time is high - consider optimizing schema complexity');
  }
  
  if (testSchemas.length > 20) {
    recommendations.push('Consider reducing the number of schemas per page for better performance');
  }
  
  testLogger.info('Performance test completed', {
    validationTime,
    schemaCount: testSchemas.length,
    averageValidationTime
  });
  
  return {
    validationTime,
    schemaCount: testSchemas.length,
    averageValidationTime,
    recommendations
  };
}

/**
 * Integration with Google Search Console (placeholder)
 */
export async function checkSearchConsoleStructuredData(): Promise<{
  message: string;
  urls: {
    richResults: string;
    urlInspection: string;
    coverage: string;
  };
}> {
  // This would integrate with Google Search Console API in a real implementation
  return {
    message: 'Manual verification required - check Google Search Console for structured data status',
    urls: {
      richResults: 'https://search.google.com/search-console/rich-results',
      urlInspection: 'https://search.google.com/search-console/inspect',
      coverage: 'https://search.google.com/search-console/coverage'
    }
  };
}

/**
 * Export testing utilities for CLI usage
 */
export const testingUtils = {
  runFullTest: runFullStructuredDataTest,
  testPage: testPageStructuredData,
  quickTest: quickStructuredDataTest,
  performanceTest: testStructuredDataPerformance,
  generateReport: generateStructuredDataReport,
  extractFromHTML: extractStructuredDataFromHTML
};
