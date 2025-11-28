/**
 * Enhanced Business Profile Logger
 * 
 * Specialized logging module for the Business Profile Service with:
 * - Consistent error context formatting
 * - Sensitive data redaction
 * - Correlation ID tracking
 * - Stack trace management based on environment
 * - Log level selection based on error severity
 * 
 * @version 2.0.0
 * @author JaxSaver Team
 */
import logger, { generateRequestId } from '../../../utils/logger';
import { User } from '../../../types/user';
import { BusinessProfile } from '../../../types';
import { isProductionEnv, isDevelopmentEnv } from '../../../utils/environmentUtils';
import { BusinessProfileErrorType } from './errorHandlingIndex';

/**
 * Fields that should be redacted when logging to prevent sensitive data exposure
 */
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'creditCard',
  'socialSecurity',
  'auth_token',
  'authorization',
  'accountNumber',
  'taxId',
  'phoneNumber',
  'email',
  'address',
  'billingInfo',
  'paymentDetails',
];

/**
 * Map of error types to log levels
 */
const ERROR_TYPE_TO_LOG_LEVEL: Record<string, 'error' | 'warn' | 'info' | 'debug'> = {
  [BusinessProfileErrorType.CRITICAL_ERROR]: 'error',
  [BusinessProfileErrorType.SYSTEM_ERROR]: 'error',
  [BusinessProfileErrorType.DATABASE_ERROR]: 'error',
  [BusinessProfileErrorType.API_ERROR]: 'error',
  [BusinessProfileErrorType.AUTHENTICATION_ERROR]: 'warn',
  [BusinessProfileErrorType.AUTHORIZATION_ERROR]: 'warn',
  [BusinessProfileErrorType.VALIDATION_ERROR]: 'warn',
  [BusinessProfileErrorType.NOT_FOUND_ERROR]: 'info',
  [BusinessProfileErrorType.BUSINESS_LOGIC_ERROR]: 'warn',
  [BusinessProfileErrorType.RATE_LIMIT_ERROR]: 'warn',
  [BusinessProfileErrorType.CACHE_ERROR]: 'info',
  [BusinessProfileErrorType.UNKNOWN_ERROR]: 'error',
};

/**
 * Business Profile Logger Context
 */
export interface BusinessProfileLogContext {
  /** Operation name (e.g., 'getCurrentUserBusiness') */
  operation?: string;
  /** Error type if applicable */
  errorType?: string;
  /** Error code if applicable */
  errorCode?: string;
  /** Error message if applicable */
  errorMessage?: string;
  /** User ID if available */
  userId?: string;
  /** User role if available */
  userRole?: string;
  /** Business ID if available */
  businessId?: string;
  /** Business name if available */
  businessName?: string;
  /** Request ID for correlation */
  requestId?: string;
  /** Parent correlation ID for tracing across service calls */
  correlationId?: string;
  /** Stack trace for development environments */
  stack?: string;
  /** Duration of operation in milliseconds */
  durationMs?: number;
  /** HTTP status code if applicable */
  statusCode?: number;
  /** Additional context-specific information */
  [key: string]: any;
}

/**
 * Redacts sensitive information from log context
 * 
 * @param context Log context to redact
 * @returns Redacted context
 */
export function redactSensitiveData<T extends Record<string, any>>(context: T): T {
  if (!context) return context;
  
  const redactedContext = { ...context };
  
  const redactObject = (obj: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Check if key should be redacted
      const shouldRedact = SENSITIVE_FIELDS.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      );
      
      if (shouldRedact) {
        // Redact the value
        result[key] = typeof value === 'string' ? '***REDACTED***' : '[REDACTED]';
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively redact nested objects
        result[key] = redactObject(value);
      } else {
        // Keep non-sensitive value
        result[key] = value;
      }
    }
    
    return result;
  };
  
  return redactObject(redactedContext) as T;
}

/**
 * Determines the appropriate log level based on error type
 * 
 * @param errorType Error type from BusinessProfileErrorType
 * @returns Appropriate log level
 */
export function getLogLevelForErrorType(errorType?: string): 'error' | 'warn' | 'info' | 'debug' {
  if (!errorType) return 'error';
  return ERROR_TYPE_TO_LOG_LEVEL[errorType] || 'error';
}

/**
 * Determines if stack trace should be included in logs
 * 
 * @param errorType Error type to check
 * @returns Whether to include stack trace
 */
export function shouldIncludeStackTrace(errorType?: string): boolean {
  // Always include stack trace in development
  if (isDevelopmentEnv()) return true;
  
  // In production, only include for critical/system/unknown errors
  if (isProductionEnv()) {
    return errorType === BusinessProfileErrorType.CRITICAL_ERROR || 
           errorType === BusinessProfileErrorType.SYSTEM_ERROR ||
           errorType === BusinessProfileErrorType.UNKNOWN_ERROR;
  }
  
  return true;
}

/**
 * Creates log context object from user, business profile, and additional context
 * 
 * @param operation Operation name for context
 * @param user User object if available
 * @param businessProfile Business profile if available
 * @param additionalContext Additional context information
 * @returns Formatted log context
 */
export function createLogContext(
  operation: string,
  user?: User | null,
  businessProfile?: BusinessProfile | null,
  additionalContext: Record<string, any> = {}
): BusinessProfileLogContext {
  const context: BusinessProfileLogContext = {
    operation,
    requestId: additionalContext.requestId || generateRequestId(),
    correlationId: additionalContext.correlationId || additionalContext.requestId || generateRequestId(),
    timestamp: new Date().toISOString(),
    ...additionalContext,
  };
  
  // Add user context if available
  if (user) {
    context.userId = user.id;
    context.userRole = user.role;
    context.businessId = user.businessId;
  }
  
  // Add business profile context if available
  if (businessProfile) {
    context.businessId = businessProfile.id;
    context.businessName = businessProfile.businessName;
  }
  
  return redactSensitiveData(context);
}

/**
 * Log start of business operation
 * 
 * @param operation Operation name
 * @param context Additional context
 * @returns Correlation ID for linking related logs
 */
export function logOperationStart(
  operation: string,
  context: Record<string, any> = {}
): string {
  const correlationId = context.correlationId || generateRequestId();
  const logContext = redactSensitiveData({
    operation,
    status: 'started',
    correlationId,
    ...context,
  });
  
  logger.info(`Business profile operation started: ${operation}`, logContext);
  return correlationId;
}

/**
 * Log successful completion of business operation
 * 
 * @param operation Operation name
 * @param correlationId Correlation ID from start log
 * @param startTime Start time in milliseconds
 * @param context Additional context
 */
export function logOperationSuccess(
  operation: string,
  correlationId: string,
  startTime: number,
  context: Record<string, any> = {}
): void {
  const durationMs = Date.now() - startTime;
  const logContext = redactSensitiveData({
    operation,
    status: 'success',
    correlationId,
    durationMs,
    ...context,
  });
  
  logger.info(`Business profile operation successful: ${operation}`, logContext);
}

/**
 * Log error during business operation with appropriate level and context
 * 
 * @param operation Operation name
 * @param error Error object or message
 * @param errorType Error type from BusinessProfileErrorType
 * @param correlationId Correlation ID from start log
 * @param context Additional context
 */
export function logOperationError(
  operation: string,
  error: Error | string,
  errorType: string = BusinessProfileErrorType.UNKNOWN_ERROR,
  correlationId?: string,
  context: Record<string, any> = {}
): void {
  // Determine appropriate log level
  const logLevel = getLogLevelForErrorType(errorType);
  
  // Extract error details
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  const errorMessage = errorObj.message || 'Unknown error';
  
  // Create log context
  const logContext: BusinessProfileLogContext = redactSensitiveData({
    operation,
    status: 'error',
    errorType,
    errorMessage,
    correlationId: correlationId || context.correlationId || generateRequestId(),
    ...context,
  });
  
  // Add stack trace if appropriate
  if (shouldIncludeStackTrace(errorType)) {
    logContext.stack = errorObj.stack;
  }
  
  // Log at appropriate level
  switch (logLevel) {
    case 'error':
      logger.error(`Business profile operation error: ${operation} - ${errorMessage}`, logContext);
      break;
    case 'warn':
      logger.warn(`Business profile operation warning: ${operation} - ${errorMessage}`, logContext);
      break;
    case 'info':
      logger.info(`Business profile operation issue: ${operation} - ${errorMessage}`, logContext);
      break;
    case 'debug':
      logger.debug(`Business profile operation debug: ${operation} - ${errorMessage}`, logContext);
      break;
  }
}

/**
 * Log debug information for business operations
 * 
 * @param operation Operation name
 * @param message Debug message
 * @param context Additional context
 */
export function logDebug(
  operation: string,
  message: string,
  context: Record<string, any> = {}
): void {
  const logContext = redactSensitiveData({
    operation,
    ...context,
  });
  
  logger.debug(`[${operation}] ${message}`, logContext);
}

/**
 * Business Profile Logger with enhanced error logging capabilities
 */
const businessProfileLogger = {
  createLogContext,
  logOperationStart,
  logOperationSuccess,
  logOperationError,
  logDebug,
  redactSensitiveData,
  
  // Basic logging methods that redact sensitive data
  error: (message: string, context: Record<string, any> = {}) => {
    logger.error(message, redactSensitiveData(context));
  },
  warn: (message: string, context: Record<string, any> = {}) => {
    logger.warn(message, redactSensitiveData(context));
  },
  info: (message: string, context: Record<string, any> = {}) => {
    logger.info(message, redactSensitiveData(context));
  },
  debug: (message: string, context: Record<string, any> = {}) => {
    logger.debug(message, redactSensitiveData(context));
  },
};

export default businessProfileLogger;
