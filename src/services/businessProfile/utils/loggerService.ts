/**
 * Enhanced Business Profile Logger Service
 * 
 * Provides centralized logging for the business profile service with improved
 * error tracking, structured logging, and monitoring capabilities.
 * 
 * This follows the Single Responsibility Principle by separating
 * logging concerns from business logic and provides consistent
 * logging patterns across the service.
 */
import configService from '../config/configService';
import { BusinessProfileErrorType, BusinessProfileErrorCode } from './errorTypes';
import { BusinessProfileErrorContext } from './errorContext';

/**
 * Log levels with corresponding numeric severity
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Log level severity mapping (higher number = more severe)
 */
export const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
  [LogLevel.CRITICAL]: 4
};

/**
 * Log context information
 */
export interface LogContext {
  /** Unique operation ID for request tracing */
  operationId?: string;
  /** Function name */
  functionName?: string;
  /** Component name */
  component?: string;
  /** User ID if available */
  userId?: string;
  /** User role if available */
  userRole?: string;
  /** Business ID if available */
  businessId?: string;
  /** Error type if logging an error */
  errorType?: BusinessProfileErrorType;
  /** Error code if available */
  errorCode?: BusinessProfileErrorCode;
  /** Database information if available */
  database?: {
    /** Operation type */
    operation?: string;
    /** Table name */
    table?: string;
    /** Query ID or description */
    queryId?: string;
  };
  /** Additional information */
  info?: Record<string, unknown>;
  /** Timestamp when the log was created */
  timestamp?: number;
}

/**
 * Log entry format for structured logging
 */
interface LogEntry {
  /** Log timestamp */
  timestamp: number;
  /** Log level */
  level: LogLevel;
  /** Log severity (numeric) */
  severity: number;
  /** Log message */
  message: string;
  /** Service name */
  service: string;
  /** Component name */
  component?: string;
  /** Function name */
  functionName?: string;
  /** Operation ID for request tracing */
  operationId?: string;
  /** User ID if available */
  userId?: string;
  /** User role if available */
  userRole?: string;
  /** Business ID if available */
  businessId?: string;
  /** Error type if logging an error */
  errorType?: BusinessProfileErrorType;
  /** Error code if available */
  errorCode?: BusinessProfileErrorCode;
  /** Database information if available */
  database?: {
    operation?: string;
    table?: string;
    queryId?: string;
  };
  /** Additional context information */
  context?: Record<string, unknown>;
  /** Additional data */
  data?: unknown[];
}

/**
 * Enhanced Business Profile Logger Service
 * 
 * Provides centralized logging for the business profile service
 * with structured logging, error tracking, and monitoring capabilities.
 */
export class BusinessProfileLoggerService {
  private readonly serviceName = 'BusinessProfileService';
  private readonly environment = process.env.NODE_ENV || 'development';
  private readonly minLogLevel: LogLevel;
  
  constructor() {
    // Set minimum log level based on environment
    this.minLogLevel = this.environment === 'production' 
      ? LogLevel.INFO 
      : LogLevel.DEBUG;
  }
  
  /**
   * Create a structured log entry
   * 
   * @param level - Log level
   * @param message - Log message
   * @param context - Log context
   * @param data - Additional data to log
   * @returns Structured log entry
   */
  private createLogEntry(level: LogLevel, message: string, context?: LogContext, ...data: unknown[]): LogEntry {
    const timestamp = context?.timestamp || Date.now();
    
    return {
      timestamp,
      level,
      severity: LOG_LEVEL_SEVERITY[level],
      message,
      service: this.serviceName,
      component: context?.component,
      functionName: context?.functionName,
      operationId: context?.operationId,
      userId: context?.userId,
      userRole: context?.userRole,
      businessId: context?.businessId,
      errorType: context?.errorType,
      errorCode: context?.errorCode,
      database: context?.database,
      context: context?.info,
      data: data.length > 0 ? data : undefined
    };
  }
  
  /**
   * Format a log entry for console output
   * 
   * @param entry - Log entry to format
   * @returns Formatted log prefix
   */
  private formatLogPrefix(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const component = entry.component || this.serviceName;
    const functionName = entry.functionName ? `.${entry.functionName}` : '';
    const operationId = entry.operationId ? ` [${entry.operationId.substring(0, 8)}]` : '';
    const businessId = entry.businessId ? ` [Business: ${entry.businessId.substring(0, 8)}]` : '';
    
    return `[${timestamp}] [${entry.level.toUpperCase()}] [${component}${functionName}]${operationId}${businessId}`;
  }
  
  /**
   * Log a message at the specified level
   * 
   * @param level - Log level
   * @param message - Log message
   * @param context - Log context
   * @param data - Additional data to log
   */
  log(level: LogLevel, message: string, context?: LogContext, ...data: unknown[]): void {
    const config = configService.getLoggingConfig();
    
    // Skip logging if below minimum level or disabled for this type
    if (
      LOG_LEVEL_SEVERITY[level] < LOG_LEVEL_SEVERITY[this.minLogLevel] ||
      (level === LogLevel.DEBUG && !config.cacheOperations) ||
      (level === LogLevel.INFO && !config.apiRequests) ||
      (level === LogLevel.WARN && !config.validationErrors)
    ) {
      return;
    }
    
    // Create structured log entry
    const entry = this.createLogEntry(level, message, context, ...data);
    
    // Format the log prefix
    const prefix = this.formatLogPrefix(entry);
    
    // Log the message with the appropriate level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, ...data);
        break;
      case LogLevel.INFO:
        console.info(prefix, message, ...data);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, ...data);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(prefix, message, ...data);
        break;
    }
    
    // In a production environment, we would send critical logs to a monitoring service
    if (level === LogLevel.CRITICAL && this.environment === 'production') {
      this.sendToMonitoringService(entry);
    }
  }
  
  /**
   * Send a log entry to a monitoring service
   * 
   * @param entry - Log entry to send
   */
  private sendToMonitoringService(entry: LogEntry): void {
    // In a real implementation, this would send the log to a monitoring service
    // For now, we'll just log it to the console with a special prefix
    console.error('[MONITORING]', JSON.stringify(entry));
    
    // Example implementation for sending to a monitoring service:
    // try {
    //   fetch('https://monitoring-service.example.com/api/logs', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(entry)
    //   });
    // } catch (error) {
    //   console.error('Failed to send log to monitoring service', error);
    // }
  }
  
  /**
   * Log a debug message
   * 
   * @param message - Log message
   * @param context - Log context
   * @param data - Additional data to log
   */
  debug(message: string, context?: LogContext, ...data: unknown[]): void {
    this.log(LogLevel.DEBUG, message, context, ...data);
  }
  
  /**
   * Log an info message
   * 
   * @param message - Log message
   * @param context - Log context
   * @param data - Additional data to log
   */
  info(message: string, context?: LogContext, ...data: unknown[]): void {
    this.log(LogLevel.INFO, message, context, ...data);
  }
  
  /**
   * Log a warning message
   * 
   * @param message - Log message
   * @param context - Log context
   * @param data - Additional data to log
   */
  warn(message: string, context?: LogContext, ...data: unknown[]): void {
    this.log(LogLevel.WARN, message, context, ...data);
  }
  
  /**
   * Log an error message
   * 
   * @param message - Log message
   * @param context - Log context
   * @param data - Additional data to log
   */
  error(message: string, context?: LogContext, ...data: unknown[]): void {
    this.log(LogLevel.ERROR, message, context, ...data);
  }
  
  /**
   * Log a critical error message
   * 
   * @param message - Log message
   * @param context - Log context
   * @param data - Additional data to log
   */
  critical(message: string, context?: LogContext, ...data: unknown[]): void {
    this.log(LogLevel.CRITICAL, message, context, ...data);
  }
  
  /**
   * Log an error from an error context
   * 
   * @param errorContext - Error context
   * @param message - Error message
   * @param errorType - Error type
   * @param errorCode - Error code
   * @param data - Additional data to log
   */
  logError(errorContext: BusinessProfileErrorContext, message: string, errorType?: BusinessProfileErrorType, errorCode?: BusinessProfileErrorCode, ...data: unknown[]): void {
    const logContext: LogContext = {
      operationId: errorContext.operationId,
      functionName: errorContext.functionName,
      component: errorContext.component,
      userId: errorContext.user?.id,
      userRole: errorContext.user?.role,
      businessId: errorContext.business?.id,
      errorType,
      errorCode,
      database: errorContext.database,
      info: errorContext.info,
      timestamp: errorContext.timestamp
    };
    
    // Determine log level based on error type
    if (errorType === BusinessProfileErrorType.SERVER_ERROR || 
        errorType === BusinessProfileErrorType.DATABASE_ERROR) {
      this.critical(message, logContext, ...data);
    } else {
      this.error(message, logContext, ...data);
    }
  }
  
  /**
   * Log a database operation
   * 
   * @param operation - Database operation type
   * @param table - Database table name
   * @param queryId - Query identifier
   * @param context - Log context
   * @param data - Additional data to log
   */
  logDatabaseOperation(operation: string, table: string, queryId?: string, context?: LogContext, ...data: unknown[]): void {
    const logContext: LogContext = {
      ...context,
      database: {
        operation,
        table,
        queryId
      }
    };
    
    this.debug(`Database ${operation} on ${table}`, logContext, ...data);
  }
  
  /**
   * Log a cache operation
   * 
   * @param operation - Cache operation name
   * @param context - Log context
   * @param data - Additional data to log
   */
  logCacheOperation(operation: string, context?: LogContext, ...data: unknown[]): void {
    if (configService.isLoggingEnabled('cacheOperations')) {
      this.debug(`Cache ${operation}`, context, ...data);
    }
  }
  
  /**
   * Log an API request
   * 
   * @param endpoint - API endpoint
   * @param method - HTTP method
   * @param context - Log context
   * @param data - Additional data to log
   */
  logApiRequest(endpoint: string, method: string, context?: LogContext, ...data: unknown[]): void {
    if (configService.isLoggingEnabled('apiRequests')) {
      this.info(`API ${method} ${endpoint}`, context, ...data);
    }
  }
  
  /**
   * Log a validation error
   * 
   * @param message - Error message
   * @param context - Log context
   * @param data - Additional data to log
   */
  logValidationError(message: string, context?: LogContext, ...data: unknown[]): void {
    if (configService.isLoggingEnabled('validationErrors')) {
      const logContext: LogContext = {
        ...context,
        errorType: BusinessProfileErrorType.VALIDATION
      };
      
      this.warn(`Validation error: ${message}`, logContext, ...data);
    }
  }
}

// Create and export a default instance
const logger = new BusinessProfileLoggerService();
export default logger;
