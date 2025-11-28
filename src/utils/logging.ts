/**
 * logging.ts
 * Utility for consistent and configurable logging throughout the application
 */

// Log levels for filtering
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4 // Used to disable all logging
}

// Log categories for grouping and filtering
export enum LogCategory {
  API = 'API',
  AUTH = 'AUTH',
  ONBOARDING = 'ONBOARDING',
  BUSINESS = 'BUSINESS',
  NAVIGATION = 'NAVIGATION',
  PERFORMANCE = 'PERFORMANCE',
  STATE = 'STATE',
  USER = 'USER'
}

// Configurable logger settings
interface LoggerConfig {
  minLevel: LogLevel;
  enabledCategories: LogCategory[] | 'all';
  enableStackTrace: boolean;
  customFormat?: (level: LogLevel, category: LogCategory, message: string, data?: any) => string;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  enabledCategories: 'all',
  enableStackTrace: process.env.NODE_ENV !== 'production',
};

// Current configuration (can be modified at runtime)
let config: LoggerConfig = { ...defaultConfig };

/**
 * Formats a log message with timestamp, level, and category
 */
const formatLogMessage = (level: LogLevel, category: LogCategory, message: string, data?: any): string => {
  if (config.customFormat) {
    return config.customFormat(level, category, message, data);
  }
  
  const timestamp = new Date().toISOString();
  const levelString = LogLevel[level].padEnd(5, ' ');
  const categoryString = category.padEnd(11, ' ');
  
  return `[${timestamp}] [${levelString}] [${categoryString}] ${message}`;
};

/**
 * Determines if a log message should be shown based on current config
 */
const shouldLog = (level: LogLevel, category: LogCategory): boolean => {
  // Check if logging is disabled
  if (config.minLevel === LogLevel.NONE) {
    return false;
  }
  
  // Check if level is below minimum
  if (level < config.minLevel) {
    return false;
  }
  
  // Check if category is enabled
  if (config.enabledCategories !== 'all' && !config.enabledCategories.includes(category)) {
    return false;
  }
  
  return true;
};

/**
 * Log a message at DEBUG level
 */
export const debug = (category: LogCategory, message: string, data?: any): void => {
  logMessage(LogLevel.DEBUG, category, message, data);
};

/**
 * Log a message at INFO level
 */
export const info = (category: LogCategory, message: string, data?: any): void => {
  logMessage(LogLevel.INFO, category, message, data);
};

/**
 * Log a message at WARN level
 */
export const warn = (category: LogCategory, message: string, data?: any): void => {
  logMessage(LogLevel.WARN, category, message, data);
};

/**
 * Log a message at ERROR level
 */
export const error = (category: LogCategory, message: string, data?: any): void => {
  logMessage(LogLevel.ERROR, category, message, data);
};

/**
 * Core logging function
 */
const logMessage = (level: LogLevel, category: LogCategory, message: string, data?: any): void => {
  if (!shouldLog(level, category)) {
    return;
  }
  
  const formattedMessage = formatLogMessage(level, category, message, data);
  
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(formattedMessage, data || '');
      break;
    case LogLevel.INFO:
      console.info(formattedMessage, data || '');
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage, data || '');
      break;
    case LogLevel.ERROR:
      console.error(formattedMessage, data || '');
      if (config.enableStackTrace && data instanceof Error) {
        console.error(data.stack);
      }
      break;
  }
};

/**
 * Configure logger settings
 */
export const configureLogger = (newConfig: Partial<LoggerConfig>): void => {
  config = { ...config, ...newConfig };
  
  // Log the new configuration
  if (shouldLog(LogLevel.DEBUG, LogCategory.STATE)) {
    debug(LogCategory.STATE, 'Logger configuration updated', config);
  }
};

/**
 * Reset logger to default settings
 */
export const resetLogger = (): void => {
  config = { ...defaultConfig };
  debug(LogCategory.STATE, 'Logger configuration reset to defaults', config);
};

/**
 * Create a logger scoped to a specific category
 */
export const createCategoryLogger = (category: LogCategory) => {
  return {
    debug: (message: string, data?: any) => debug(category, message, data),
    info: (message: string, data?: any) => info(category, message, data),
    warn: (message: string, data?: any) => warn(category, message, data),
    error: (message: string, data?: any) => error(category, message, data),
  };
};

// Create and export pre-configured loggers for common categories
export const apiLogger = createCategoryLogger(LogCategory.API);
export const authLogger = createCategoryLogger(LogCategory.AUTH);
export const onboardingLogger = createCategoryLogger(LogCategory.ONBOARDING);
export const businessLogger = createCategoryLogger(LogCategory.BUSINESS);
export const navigationLogger = createCategoryLogger(LogCategory.NAVIGATION);
export const performanceLogger = createCategoryLogger(LogCategory.PERFORMANCE);
export const stateLogger = createCategoryLogger(LogCategory.STATE);
export const userLogger = createCategoryLogger(LogCategory.USER);

// Default logger export
export default {
  debug,
  info,
  warn,
  error,
  configureLogger,
  resetLogger,
  createCategoryLogger,
  LogLevel,
  LogCategory,
};
