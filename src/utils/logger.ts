/**
 * Professional logging utility for consistent log formatting and control
 * across the application. Supports environment-specific behavior.
 */

/**
 * Supported log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Interface for logger options
 */
interface LoggerOptions {
  level: LogLevel;
  enableDebug: boolean;
  includeTimestamp: boolean;
  includeModule: boolean;
}

/**
 * Default options for the logger
 */
const defaultOptions: LoggerOptions = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  enableDebug: process.env.NODE_ENV !== 'production',
  includeTimestamp: true,
  includeModule: true,
};

/**
 * Format the current timestamp for logging
 */
function formatTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Map of log levels to their priority
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Module logger class
 */
class ModuleLogger {
  private name: string;
  private parentLogger: Logger;

  constructor(name: string, parentLogger: Logger) {
    this.name = name;
    this.parentLogger = parentLogger;
  }

  /**
   * Log a debug message
   */
  debug(message: string, ...args: any[]): void {
    this.parentLogger.logWithModule('debug', this.name, message, ...args);
  }

  /**
   * Log an info message
   */
  info(message: string, ...args: any[]): void {
    this.parentLogger.logWithModule('info', this.name, message, ...args);
  }

  /**
   * Log a warning message
   */
  warn(message: string, ...args: any[]): void {
    this.parentLogger.logWithModule('warn', this.name, message, ...args);
  }

  /**
   * Log an error message
   */
  error(message: string, ...args: any[]): void {
    this.parentLogger.logWithModule('error', this.name, message, ...args);
  }
}

/**
 * Main logger class
 */
class Logger {
  private options: LoggerOptions;

  constructor(options: Partial<LoggerOptions> = {}) {
    this.options = { ...defaultOptions, ...options };
  }

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.options.level = level;
  }

  /**
   * Enable or disable debug logging
   */
  setEnableDebug(enableDebug: boolean): void {
    this.options.enableDebug = enableDebug;
  }

  /**
   * Format a log message with optional timestamp and module name
   */
  private formatLogMessage(level: LogLevel, module: string | null, message: string): string {
    const parts: string[] = [];

    if (this.options.includeTimestamp) {
      parts.push(`[${formatTimestamp()}]`);
    }

    parts.push(`[${level.toUpperCase()}]`);

    if (module && this.options.includeModule) {
      parts.push(`[${module}]`);
    }

    parts.push(message);

    return parts.join(' ');
  }

  /**
   * Check if a log level should be displayed based on the current settings
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.options.level];
  }

  /**
   * Log a message with the specified level
   */
  log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatLogMessage(level, null, message);

    switch (level) {
      case 'debug':
        if (this.options.enableDebug) {
          console.debug(formattedMessage, ...args);
        }
        break;
      case 'info':
        console.info(formattedMessage, ...args);
        break;
      case 'warn':
        console.warn(formattedMessage, ...args);
        break;
      case 'error':
        console.error(formattedMessage, ...args);
        break;
    }
  }

  /**
   * Log a message with the specified level and module name
   */
  logWithModule(level: LogLevel, module: string, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatLogMessage(level, module, message);

    switch (level) {
      case 'debug':
        if (this.options.enableDebug) {
          console.debug(formattedMessage, ...args);
        }
        break;
      case 'info':
        console.info(formattedMessage, ...args);
        break;
      case 'warn':
        console.warn(formattedMessage, ...args);
        break;
      case 'error':
        console.error(formattedMessage, ...args);
        break;
    }
  }

  /**
   * Create a logger for a specific module
   */
  createModuleLogger(moduleName: string): ModuleLogger {
    return new ModuleLogger(moduleName, this);
  }

  /**
   * Log a debug message
   */
  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  /**
   * Log an info message
   */
  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  /**
   * Log a warning message
   */
  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  /**
   * Log an error message
   */
  error(message: string, ...args: any[]): void {
    this.log('error', message, ...args);
  }
}

/**
 * Singleton instance of the logger
 */
export const logger = new Logger(); 