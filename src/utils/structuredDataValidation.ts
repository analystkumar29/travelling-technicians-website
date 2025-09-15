import { logger } from './logger';

// Create a module logger
const validationLogger = logger.createModuleLogger('structuredDataValidation');

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SchemaValidationRule {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  allowedValues?: any[];
  customValidator?: (value: any) => boolean;
}

/**
 * Schema.org validation rules for different schema types
 */
const SCHEMA_VALIDATION_RULES: Record<string, SchemaValidationRule[]> = {
  LocalBusiness: [
    { field: '@context', required: true, type: 'string', allowedValues: ['https://schema.org'] },
    { field: '@type', required: true, type: 'string', allowedValues: ['LocalBusiness'] },
    { field: 'name', required: true, type: 'string', minLength: 1, maxLength: 100 },
    { field: 'description', required: true, type: 'string', minLength: 50, maxLength: 500 },
    { field: 'url', required: true, type: 'string', pattern: /^https?:\/\/.+/ },
    { field: 'telephone', required: true, type: 'string', pattern: /^\+?[\d\s\-\(\)]+$/ },
    { field: 'address', required: true, type: 'object' },
    { field: 'address.addressLocality', required: true, type: 'string' },
    { field: 'address.addressRegion', required: true, type: 'string' },
    { field: 'address.addressCountry', required: true, type: 'string' }
  ],
  Service: [
    { field: '@context', required: true, type: 'string', allowedValues: ['https://schema.org'] },
    { field: '@type', required: true, type: 'string', allowedValues: ['Service'] },
    { field: 'name', required: true, type: 'string', minLength: 1, maxLength: 100 },
    { field: 'description', required: true, type: 'string', minLength: 50, maxLength: 500 },
    { field: 'provider', required: true, type: 'object' },
    { field: 'serviceType', required: true, type: 'string' },
    { field: 'areaServed', required: false, type: 'array' }
  ],
  FAQPage: [
    { field: '@context', required: true, type: 'string', allowedValues: ['https://schema.org'] },
    { field: '@type', required: true, type: 'string', allowedValues: ['FAQPage'] },
    { field: 'mainEntity', required: true, type: 'array' }
  ],
  Article: [
    { field: '@context', required: true, type: 'string', allowedValues: ['https://schema.org'] },
    { field: '@type', required: true, type: 'string', allowedValues: ['Article'] },
    { field: 'headline', required: true, type: 'string', minLength: 10, maxLength: 110 },
    { field: 'description', required: true, type: 'string', minLength: 50, maxLength: 300 },
    { field: 'author', required: true, type: 'object' },
    { field: 'publisher', required: true, type: 'object' },
    { field: 'datePublished', required: true, type: 'string', pattern: /^\d{4}-\d{2}-\d{2}/ },
    { field: 'url', required: true, type: 'string', pattern: /^https?:\/\/.+/ }
  ],
  Organization: [
    { field: '@context', required: true, type: 'string', allowedValues: ['https://schema.org'] },
    { field: '@type', required: true, type: 'string', allowedValues: ['Organization'] },
    { field: 'name', required: true, type: 'string', minLength: 1, maxLength: 100 },
    { field: 'url', required: true, type: 'string', pattern: /^https?:\/\/.+/ },
    { field: 'logo', required: true, type: 'object' },
    { field: 'contactPoint', required: false, type: 'object' }
  ]
};

/**
 * Validate structured data against schema.org standards
 */
export function validateStructuredData(data: any): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    if (!data || typeof data !== 'object') {
      result.isValid = false;
      result.errors.push('Invalid structured data: must be an object');
      return result;
    }

    const schemaType = data['@type'];
    if (!schemaType) {
      result.isValid = false;
      result.errors.push('Missing @type field');
      return result;
    }

    const rules = SCHEMA_VALIDATION_RULES[schemaType];
    if (!rules) {
      result.warnings.push(`No validation rules found for schema type: ${schemaType}`);
      return result;
    }

    // Validate each rule
    for (const rule of rules) {
      const fieldValue = getNestedValue(data, rule.field);
      const fieldExists = fieldValue !== undefined && fieldValue !== null;

      // Check required fields
      if (rule.required && !fieldExists) {
        result.isValid = false;
        result.errors.push(`Required field missing: ${rule.field}`);
        continue;
      }

      // Skip validation if field doesn't exist and is not required
      if (!fieldExists) {
        continue;
      }

      // Type validation
      if (!validateFieldType(fieldValue, rule.type)) {
        result.isValid = false;
        result.errors.push(`Invalid type for field ${rule.field}: expected ${rule.type}, got ${typeof fieldValue}`);
        continue;
      }

      // Pattern validation
      if (rule.pattern && typeof fieldValue === 'string' && !rule.pattern.test(fieldValue)) {
        result.isValid = false;
        result.errors.push(`Field ${rule.field} does not match required pattern`);
      }

      // Length validation
      if (rule.minLength && typeof fieldValue === 'string' && fieldValue.length < rule.minLength) {
        result.warnings.push(`Field ${rule.field} is shorter than recommended minimum length (${rule.minLength})`);
      }

      if (rule.maxLength && typeof fieldValue === 'string' && fieldValue.length > rule.maxLength) {
        result.warnings.push(`Field ${rule.field} exceeds recommended maximum length (${rule.maxLength})`);
      }

      // Allowed values validation
      if (rule.allowedValues && !rule.allowedValues.includes(fieldValue)) {
        result.isValid = false;
        result.errors.push(`Field ${rule.field} has invalid value: ${fieldValue}. Allowed values: ${rule.allowedValues.join(', ')}`);
      }

      // Custom validation
      if (rule.customValidator && !rule.customValidator(fieldValue)) {
        result.isValid = false;
        result.errors.push(`Field ${rule.field} failed custom validation`);
      }
    }

    // Additional validation for specific schema types
    switch (schemaType) {
      case 'LocalBusiness':
        validateLocalBusinessSpecific(data, result);
        break;
      case 'FAQPage':
        validateFAQPageSpecific(data, result);
        break;
      case 'Article':
        validateArticleSpecific(data, result);
        break;
    }

  } catch (error) {
    validationLogger.error('Error during structured data validation:', error);
    result.isValid = false;
    result.errors.push('Validation error: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }

  // Log validation results
  if (!result.isValid) {
    validationLogger.warn(`Structured data validation failed for ${data['@type']}:`, result.errors);
  }
  
  if (result.warnings.length > 0) {
    validationLogger.info(`Structured data validation warnings for ${data['@type']}:`, result.warnings);
  }

  return result;
}

/**
 * Get nested object value using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Validate field type
 */
function validateFieldType(value: any, expectedType: string): boolean {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    default:
      return false;
  }
}

/**
 * Specific validation for LocalBusiness schema
 */
function validateLocalBusinessSpecific(data: any, result: ValidationResult): void {
  // Validate opening hours format
  if (data.openingHoursSpecification) {
    if (!Array.isArray(data.openingHoursSpecification)) {
      result.errors.push('openingHoursSpecification must be an array');
    } else {
      data.openingHoursSpecification.forEach((hours: any, index: number) => {
        if (!hours['@type'] || hours['@type'] !== 'OpeningHoursSpecification') {
          result.errors.push(`openingHoursSpecification[${index}] missing @type`);
        }
        if (!hours.dayOfWeek) {
          result.errors.push(`openingHoursSpecification[${index}] missing dayOfWeek`);
        }
        if (!hours.opens || !hours.closes) {
          result.errors.push(`openingHoursSpecification[${index}] missing opens/closes times`);
        }
      });
    }
  }

  // Validate geo coordinates
  if (data.geo) {
    if (typeof data.geo.latitude !== 'number' || typeof data.geo.longitude !== 'number') {
      result.errors.push('geo coordinates must be numbers');
    }
    if (data.geo.latitude < -90 || data.geo.latitude > 90) {
      result.errors.push('latitude must be between -90 and 90');
    }
    if (data.geo.longitude < -180 || data.geo.longitude > 180) {
      result.errors.push('longitude must be between -180 and 180');
    }
  }

  // Validate area served format
  if (data.areaServed && Array.isArray(data.areaServed)) {
    data.areaServed.forEach((area: any, index: number) => {
      if (!area['@type'] || !area.name) {
        result.warnings.push(`areaServed[${index}] should have @type and name`);
      }
    });
  }
}

/**
 * Specific validation for FAQPage schema
 */
function validateFAQPageSpecific(data: any, result: ValidationResult): void {
  if (!Array.isArray(data.mainEntity)) {
    result.errors.push('mainEntity must be an array');
    return;
  }

  data.mainEntity.forEach((question: any, index: number) => {
    if (!question['@type'] || question['@type'] !== 'Question') {
      result.errors.push(`mainEntity[${index}] must have @type: Question`);
    }
    if (!question.name || typeof question.name !== 'string') {
      result.errors.push(`mainEntity[${index}] must have a name (question text)`);
    }
    if (!question.acceptedAnswer || !question.acceptedAnswer.text) {
      result.errors.push(`mainEntity[${index}] must have acceptedAnswer with text`);
    }
    if (question.acceptedAnswer && (!question.acceptedAnswer['@type'] || question.acceptedAnswer['@type'] !== 'Answer')) {
      result.errors.push(`mainEntity[${index}].acceptedAnswer must have @type: Answer`);
    }
  });
}

/**
 * Specific validation for Article schema
 */
function validateArticleSpecific(data: any, result: ValidationResult): void {
  // Validate headline length (Google recommendation)
  if (data.headline && data.headline.length > 110) {
    result.warnings.push('Article headline should be under 110 characters for optimal display');
  }

  // Validate publisher structure
  if (data.publisher) {
    if (!data.publisher['@type'] || data.publisher['@type'] !== 'Organization') {
      result.errors.push('publisher must have @type: Organization');
    }
    if (!data.publisher.name) {
      result.errors.push('publisher must have a name');
    }
    if (!data.publisher.logo) {
      result.warnings.push('publisher should have a logo for rich results');
    }
  }

  // Validate author structure
  if (data.author) {
    if (!data.author['@type'] || (data.author['@type'] !== 'Person' && data.author['@type'] !== 'Organization')) {
      result.errors.push('author must have @type: Person or Organization');
    }
    if (!data.author.name) {
      result.errors.push('author must have a name');
    }
  }

  // Validate image if present
  if (data.image) {
    if (typeof data.image === 'object') {
      if (!data.image.url || !data.image.url.match(/^https?:\/\/.+/)) {
        result.errors.push('image.url must be a valid URL');
      }
      if (!data.image.width || !data.image.height) {
        result.warnings.push('image should include width and height');
      }
    } else if (typeof data.image === 'string') {
      if (!data.image.match(/^https?:\/\/.+/)) {
        result.errors.push('image URL must be valid');
      }
    }
  }
}

/**
 * Test structured data against Google's Rich Results Test
 */
export async function testWithGoogleRichResults(url: string): Promise<any> {
  try {
    // Note: This would require a proxy or server-side implementation
    // as Google's Rich Results Test API requires authentication
    const testUrl = `https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`;
    
    validationLogger.info(`Test structured data at: ${testUrl}`);
    
    return {
      testUrl,
      message: 'Manual testing required - visit the URL to test with Google Rich Results'
    };
  } catch (error) {
    validationLogger.error('Error testing with Google Rich Results:', error);
    throw error;
  }
}

/**
 * Validate multiple structured data schemas
 */
export function validateMultipleSchemas(schemas: any[]): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  schemas.forEach((schema, index) => {
    const schemaResult = validateStructuredData(schema);
    
    if (!schemaResult.isValid) {
      result.isValid = false;
      result.errors.push(...schemaResult.errors.map(error => `Schema ${index + 1}: ${error}`));
    }
    
    result.warnings.push(...schemaResult.warnings.map(warning => `Schema ${index + 1}: ${warning}`));
  });

  return result;
}

/**
 * Generate structured data test report
 */
export function generateTestReport(schemas: any[]): {
  summary: {
    total: number;
    valid: number;
    invalid: number;
    withWarnings: number;
  };
  details: Array<{
    type: string;
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>;
} {
  const details = schemas.map(schema => {
    const validation = validateStructuredData(schema);
    return {
      type: schema['@type'] || 'Unknown',
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings
    };
  });

  const summary = {
    total: schemas.length,
    valid: details.filter(d => d.isValid).length,
    invalid: details.filter(d => !d.isValid).length,
    withWarnings: details.filter(d => d.warnings.length > 0).length
  };

  return { summary, details };
}

/**
 * Export for programmatic testing
 */
export { SCHEMA_VALIDATION_RULES };

/**
 * Quick validation function for use in components
 */
export function isValidStructuredData(data: any): boolean {
  return validateStructuredData(data).isValid;
}
