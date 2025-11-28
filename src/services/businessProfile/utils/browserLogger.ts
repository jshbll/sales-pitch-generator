/**
 * Browser-compatible Logger Service
 * 
 * A simplified logger implementation that works in browser environments
 * without dependencies on Node.js-specific features like the process object.
 */

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

// Current log level (can be changed at runtime)
let currentLogLevel = LogLevel.INFO;

// Enable/disable logging to console
let loggingEnabled = true;

/**
 * Set the current log level
 * @param level The log level to set
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

/**
 * Enable or disable logging
 * @param enabled Whether logging should be enabled
 */
export function setLoggingEnabled(enabled: boolean): void {
  loggingEnabled = enabled;
}

/**
 * Format log context as a string
 * @param context The context object to format
 * @returns Formatted context string
 */
function formatContext(context?: Record<string, unknown>): string {
  if (!context) return '';
  try {
    return JSON.stringify(context);
  } catch (error) {
    return '[Context serialization error]';
  }
}

/**
 * Browser-compatible logger
 */
const browserLogger = {
  /**
   * Log an error message
   * @param message The message to log
   * @param context Optional context object
   */
  error(message: string, context?: Record<string, unknown>): void {
    if (loggingEnabled && currentLogLevel >= LogLevel.ERROR) {
      console.error(`ERROR: ${message}`, context ? formatContext(context) : '');
    }
  },

  /**
   * Log a warning message
   * @param message The message to log
   * @param context Optional context object
   */
  warn(message: string, context?: Record<string, unknown>): void {
    if (loggingEnabled && currentLogLevel >= LogLevel.WARN) {
      console.warn(`WARN: ${message}`, context ? formatContext(context) : '');
    }
  },

  /**
   * Log an info message
   * @param message The message to log
   * @param context Optional context object
   */
  info(message: string, context?: Record<string, unknown>): void {
    if (loggingEnabled && currentLogLevel >= LogLevel.INFO) {
      console.info(`INFO: ${message}`, context ? formatContext(context) : '');
    }
  },

  /**
   * Log a debug message
   * @param message The message to log
   * @param context Optional context object
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (loggingEnabled && currentLogLevel >= LogLevel.DEBUG) {
      console.debug(`DEBUG: ${message}`, context ? formatContext(context) : '');
    }
  },

  /**
   * Log a trace message
   * @param message The message to log
   * @param context Optional context object
   */
  trace(message: string, context?: Record<string, unknown>): void {
    if (loggingEnabled && currentLogLevel >= LogLevel.TRACE) {
      console.debug(`TRACE: ${message}`, context ? formatContext(context) : '');
    }
  }
};

export default browserLogger;
