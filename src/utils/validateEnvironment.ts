import { logger } from './logger';

// Create a module logger
const envLogger = logger.createModuleLogger('environment');

// Required environment variables
export const REQUIRED_ENV_VARS = {
  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: 'Public Supabase URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Public Supabase anonymous key',
  SUPABASE_SERVICE_ROLE_KEY: 'Supabase service role key (server-side)',
  
  // Authentication
  ADMIN_JWT_SECRET: 'JWT secret for admin authentication',
  
  // Email service
  SENDGRID_API_KEY: 'SendGrid API key for email notifications'
} as const;

export type RequiredEnvVar = keyof typeof REQUIRED_ENV_VARS;

// Environment validation errors
export class EnvironmentValidationError extends Error {
  constructor(
    public missingVars: RequiredEnvVar[],
    public devFallbacksInProduction: RequiredEnvVar[] = []
  ) {
    const missingMessage = missingVars.length > 0 
      ? `Missing required environment variables: ${missingVars.join(', ')}`
      : '';
    
    const fallbackMessage = devFallbacksInProduction.length > 0
      ? `Development fallbacks detected in production: ${devFallbacksInProduction.join(', ')}`
      : '';
    
    const message = [missingMessage, fallbackMessage].filter(Boolean).join('. ');
    
    super(message || 'Environment validation failed');
    this.name = 'EnvironmentValidationError';
  }
}

/**
 * Validates that all required environment variables are present
 * @throws {EnvironmentValidationError} If any required variables are missing
 */
export function validateRequiredEnvVars(): void {
  const missingVars: RequiredEnvVar[] = [];
  
  for (const [varName, description] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[varName];
    
    if (!value || value.trim() === '') {
      missingVars.push(varName as RequiredEnvVar);
      envLogger.error(`Missing required environment variable: ${varName} (${description})`);
    }
  }
  
  if (missingVars.length > 0) {
    throw new EnvironmentValidationError(missingVars);
  }
  
  envLogger.info('All required environment variables are present');
}

/**
 * Validates that no development fallbacks are used in production
 * @throws {EnvironmentValidationError} If development fallbacks are detected in production
 */
export function validateEnvInProduction(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    envLogger.debug('Skipping production validation in non-production environment');
    return;
  }
  
  const devFallbacksInProduction: RequiredEnvVar[] = [];
  
  // Check for known development fallback patterns
  const devPatterns = [
    'test-',
    'localhost',
    'development-only',
    'dev-',
    'dummy-'
  ];
  
  for (const [varName] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[varName];
    
    if (value) {
      const hasDevPattern = devPatterns.some(pattern => 
        value.toLowerCase().includes(pattern)
      );
      
      if (hasDevPattern) {
        devFallbacksInProduction.push(varName as RequiredEnvVar);
        envLogger.error(`Development fallback detected in production for ${varName}: ${value.substring(0, 20)}...`);
      }
    }
  }
  
  if (devFallbacksInProduction.length > 0) {
    throw new EnvironmentValidationError([], devFallbacksInProduction);
  }
  
  envLogger.info('No development fallbacks detected in production');
}

/**
 * Safely logs environment status without exposing secrets
 */
export function logEnvStatus(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  envLogger.info(`Environment: ${process.env.NODE_ENV || 'unknown'}`);
  
  for (const [varName, description] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[varName];
    
    if (!value) {
      envLogger.warn(`❌ ${varName}: Not set (${description})`);
    } else {
      // For sensitive variables, only show length and first few characters
      const isSensitive = varName.includes('KEY') || varName.includes('SECRET');
      
      if (isSensitive) {
        const maskedValue = value.length > 6 
          ? `${value.substring(0, 6)}${'*'.repeat(Math.min(value.length - 6, 20))}...`
          : `${'*'.repeat(value.length)}`;
        envLogger.info(`✅ ${varName}: Set (length: ${value.length}, value: ${maskedValue})`);
      } else {
        // For URLs, show domain but mask protocol and path
        if (varName.includes('URL')) {
          try {
            const url = new URL(value);
            envLogger.info(`✅ ${varName}: Set (${url.hostname})`);
          } catch {
            envLogger.info(`✅ ${varName}: Set (${value.substring(0, 20)}...)`);
          }
        } else {
          envLogger.info(`✅ ${varName}: Set (${value.substring(0, 20)}...)`);
        }
      }
    }
  }
  
  // Additional environment info
  if (process.env.VERCEL) {
    envLogger.info(`🚀 Running on Vercel (${process.env.VERCEL_ENV || 'unknown'})`);
  }
  
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    envLogger.info(`🌐 Vercel URL: ${process.env.NEXT_PUBLIC_VERCEL_URL}`);
  }
}

/**
 * Comprehensive environment validation
 * Checks required variables and production configuration
 */
export function validateEnvironment(): void {
  try {
    envLogger.info('Starting environment validation...');
    
    // Log current environment status
    logEnvStatus();
    
    // Validate required variables
    validateRequiredEnvVars();
    
    // Validate production configuration
    validateEnvInProduction();
    
    envLogger.info('✅ Environment validation successful');
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      envLogger.error(`❌ Environment validation failed: ${error.message}`);
      throw error;
    } else {
      envLogger.error('❌ Unexpected error during environment validation:', error);
      throw new Error('Environment validation failed due to unexpected error');
    }
  }
}

/**
 * Safe environment validation that doesn't throw
 * Returns validation result instead
 */
export function validateEnvironmentSafe(): { isValid: boolean; error?: EnvironmentValidationError } {
  try {
    validateEnvironment();
    return { isValid: true };
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      return { isValid: false, error };
    } else {
      // For unexpected errors, create a generic validation error
      const genericError = new EnvironmentValidationError([], []);
      genericError.message = 'Environment validation failed due to unexpected error';
      return { 
        isValid: false, 
        error: genericError
      };
    }
  }
}
