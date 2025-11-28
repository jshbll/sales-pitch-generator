/**
 * Business Profile Error Types
 * 
 * Defines error types and codes for the Business Profile Service.
 */
import { ErrorCategory } from '../../../utils/errorHandling/errorTypes';

/**
 * Business profile error types
 */
export enum BusinessProfileErrorType {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Authentication and authorization errors
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  
  // Resource errors
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR = 'DATABASE_QUERY_ERROR',
  DATABASE_CONSTRAINT_ERROR = 'DATABASE_CONSTRAINT_ERROR',
  
  // API errors
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // Cache errors
  CACHE_ERROR = 'CACHE_ERROR',
  
  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CRITICAL_ERROR = 'CRITICAL_ERROR',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  
  // Business logic errors
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  
  // Rate limit errors
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  
  // Fallback for uncategorized errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Error codes for the Business Profile Service
 */
export enum BusinessProfileErrorCode {
  // Not found errors
  USER_NOT_FOUND = 'BP-1001',
  BUSINESS_NOT_FOUND = 'BP-1002',
  CATEGORY_NOT_FOUND = 'BP-1003',
  RESOURCE_NOT_FOUND = 'BP-1004',
  
  // Validation errors
  INVALID_INPUT = 'BP-2001',
  MISSING_REQUIRED_FIELD = 'BP-2002',
  INVALID_FORMAT = 'BP-2003',
  
  // Authentication errors
  INVALID_CREDENTIALS = 'BP-3001',
  TOKEN_EXPIRED = 'BP-3002',
  INVALID_TOKEN = 'BP-3003',
  AUTHENTICATION_REQUIRED = 'BP-3004',
  
  // Authorization errors
  INSUFFICIENT_PERMISSIONS = 'BP-4001',
  UNAUTHORIZED_ACCESS = 'BP-4002',
  BUSINESS_ROLE_REQUIRED = 'BP-4003',
  
  // Database errors
  DATABASE_CONNECTION_FAILED = 'BP-5001',
  DATABASE_QUERY_FAILED = 'BP-5002',
  DUPLICATE_KEY = 'BP-5003',
  FOREIGN_KEY_VIOLATION = 'BP-5004',
  
  // API errors
  API_REQUEST_FAILED = 'BP-6001',
  API_RESPONSE_ERROR = 'BP-6002',
  
  // Cache errors
  CACHE_RETRIEVAL_ERROR = 'BP-7001',
  CACHE_STORAGE_ERROR = 'BP-7002',
  
  // Server errors
  INTERNAL_SERVER_ERROR = 'BP-8001',
  SERVICE_UNAVAILABLE = 'BP-8002',
  TIMEOUT = 'BP-8003'
}

/**
 * Business Profile Error class
 * 
 * Custom error class for business profile service errors
 */
export class BusinessProfileError extends Error {
  /** Error type */
  type: BusinessProfileErrorType;
  /** Error code */
  code?: BusinessProfileErrorCode;
  /** Additional error details */
  details?: Record<string, unknown>;
  /** Error category */
  category: ErrorCategory;
  /** Whether the error is user-resolvable */
  userResolvable: boolean;
  /** Correlation ID for tracking */
  correlationId?: string;
  /** Original error if this wraps another error */
  originalError?: Error;
  
  /**
   * Create a new BusinessProfileError
   * 
   * @param message - Error message
   * @param type - Error type
   * @param code - Error code
   * @param details - Additional error details
   */
  constructor(
    message: string,
    type: BusinessProfileErrorType = BusinessProfileErrorType.UNKNOWN_ERROR,
    code?: BusinessProfileErrorCode,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'BusinessProfileError';
    this.type = type;
    this.code = code;
    this.details = details;
    this.category = ERROR_CATEGORY_MAPPING[type] || ErrorCategory.SERVER;
    this.userResolvable = this.determineUserResolvability();
    
    // Ensure stack trace captures the point of error creation
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BusinessProfileError);
    }
  }
  
  /**
   * Set the correlation ID for tracking
   * 
   * @param id - Correlation ID
   * @returns This error instance for chaining
   */
  setCorrelationId(id: string): this {
    this.correlationId = id;
    return this;
  }
  
  /**
   * Set the original error that caused this error
   * 
   * @param error - Original error
   * @returns This error instance for chaining
   */
  setOriginalError(error: Error): this {
    this.originalError = error;
    return this;
  }
  
  /**
   * Determine if the error is user-resolvable
   * 
   * @returns True if the error is user-resolvable
   */
  private determineUserResolvability(): boolean {
    // Validation errors are generally user-resolvable
    if (this.type === BusinessProfileErrorType.VALIDATION_ERROR) {
      return true;
    }
    
    // Authentication errors may be user-resolvable
    if (this.type === BusinessProfileErrorType.AUTHENTICATION_ERROR) {
      return true;
    }
    
    // Most other errors are not user-resolvable
    return false;
  }
}

/**
 * Maps business profile error types to standard error categories
 */
export const ERROR_CATEGORY_MAPPING: Record<BusinessProfileErrorType, ErrorCategory> = {
  // Validation errors
  [BusinessProfileErrorType.VALIDATION_ERROR]: ErrorCategory.VALIDATION,
  
  // Authentication and authorization errors
  [BusinessProfileErrorType.AUTHENTICATION_ERROR]: ErrorCategory.AUTHENTICATION,
  [BusinessProfileErrorType.AUTHORIZATION_ERROR]: ErrorCategory.AUTHENTICATION,
  
  // Resource errors
  [BusinessProfileErrorType.NOT_FOUND_ERROR]: ErrorCategory.NOT_FOUND,
  [BusinessProfileErrorType.CONFLICT_ERROR]: ErrorCategory.VALIDATION,
  
  // Database errors
  [BusinessProfileErrorType.DATABASE_ERROR]: ErrorCategory.SERVER,
  [BusinessProfileErrorType.DATABASE_CONNECTION_ERROR]: ErrorCategory.SERVER,
  [BusinessProfileErrorType.DATABASE_QUERY_ERROR]: ErrorCategory.SERVER,
  [BusinessProfileErrorType.DATABASE_CONSTRAINT_ERROR]: ErrorCategory.VALIDATION,
  
  // API errors
  [BusinessProfileErrorType.API_ERROR]: ErrorCategory.SERVER,
  
  // Cache errors
  [BusinessProfileErrorType.CACHE_ERROR]: ErrorCategory.SERVER,
  
  // System errors
  [BusinessProfileErrorType.INTERNAL_ERROR]: ErrorCategory.SERVER,
  [BusinessProfileErrorType.TIMEOUT_ERROR]: ErrorCategory.SERVER,
  [BusinessProfileErrorType.CRITICAL_ERROR]: ErrorCategory.SERVER,
  [BusinessProfileErrorType.SYSTEM_ERROR]: ErrorCategory.SERVER,
  
  // Business logic errors
  [BusinessProfileErrorType.BUSINESS_LOGIC_ERROR]: ErrorCategory.VALIDATION,
  
  // Rate limit errors
  [BusinessProfileErrorType.RATE_LIMIT_ERROR]: ErrorCategory.AUTHENTICATION,
  
  // Unknown errors
  [BusinessProfileErrorType.UNKNOWN_ERROR]: ErrorCategory.SERVER
};

/**
 * Legacy export name for backward compatibility
 */
export const errorTypeToCategory: Record<BusinessProfileErrorType, ErrorCategory> = {
  // Validation errors
  [BusinessProfileErrorType.VALIDATION_ERROR]: ErrorCategory.VALIDATION,
  
  // Authentication and authorization errors
  [BusinessProfileErrorType.AUTHENTICATION_ERROR]: ErrorCategory.AUTHENTICATION,
  [BusinessProfileErrorType.AUTHORIZATION_ERROR]: ErrorCategory.AUTHENTICATION,
  
  // Resource errors
  [BusinessProfileErrorType.NOT_FOUND_ERROR]: ErrorCategory.NOT_FOUND,
  [BusinessProfileErrorType.CONFLICT_ERROR]: ErrorCategory.VALIDATION,
  
  // Database errors
  [BusinessProfileErrorType.DATABASE_ERROR]: ErrorCategory.SERVER,
  [BusinessProfileErrorType.DATABASE_CONNECTION_ERROR]: ErrorCategory.SERVER,
  [BusinessProfileErrorType.DATABASE_QUERY_ERROR]: ErrorCategory.SERVER,
  [BusinessProfileErrorType.DATABASE_CONSTRAINT_ERROR]: ErrorCategory.VALIDATION,
  
  // API errors
  [BusinessProfileErrorType.API_ERROR]: ErrorCategory.NETWORK,
  
  // Cache errors
  [BusinessProfileErrorType.CACHE_ERROR]: ErrorCategory.SERVER,
  
  // System errors
  [BusinessProfileErrorType.INTERNAL_ERROR]: ErrorCategory.SERVER,
  [BusinessProfileErrorType.TIMEOUT_ERROR]: ErrorCategory.NETWORK,
  [BusinessProfileErrorType.CRITICAL_ERROR]: ErrorCategory.SERVER,
  [BusinessProfileErrorType.SYSTEM_ERROR]: ErrorCategory.SERVER,
  
  // Business logic errors
  [BusinessProfileErrorType.BUSINESS_LOGIC_ERROR]: ErrorCategory.VALIDATION,
  
  // Rate limit errors
  [BusinessProfileErrorType.RATE_LIMIT_ERROR]: ErrorCategory.AUTHENTICATION,
  
  // Unknown errors
  [BusinessProfileErrorType.UNKNOWN_ERROR]: ErrorCategory.SERVER
};

/**
 * User-friendly error messages for business profile error types
 */
export const businessErrorMessages: Record<BusinessProfileErrorType, string> = {
  // Validation errors
  [BusinessProfileErrorType.VALIDATION_ERROR]: 'The provided data is invalid.',
  
  // Authentication and authorization errors
  [BusinessProfileErrorType.AUTHENTICATION_ERROR]: 'Authentication is required.',
  [BusinessProfileErrorType.AUTHORIZATION_ERROR]: 'You do not have permission to perform this action.',
  
  // Resource errors
  [BusinessProfileErrorType.NOT_FOUND_ERROR]: 'The requested resource was not found.',
  [BusinessProfileErrorType.CONFLICT_ERROR]: 'A conflict occurred with the requested operation.',
  
  // Database errors
  [BusinessProfileErrorType.DATABASE_ERROR]: 'A database error occurred.',
  [BusinessProfileErrorType.DATABASE_CONNECTION_ERROR]: 'Could not connect to the database.',
  [BusinessProfileErrorType.DATABASE_QUERY_ERROR]: 'An error occurred while executing the database query.',
  [BusinessProfileErrorType.DATABASE_CONSTRAINT_ERROR]: 'The operation violated a database constraint.',
  
  // API errors
  [BusinessProfileErrorType.API_ERROR]: 'An error occurred while making an API request.',
  
  // Cache errors
  [BusinessProfileErrorType.CACHE_ERROR]: 'An error occurred with the cache.',
  
  // System errors
  [BusinessProfileErrorType.INTERNAL_ERROR]: 'An internal server error occurred.',
  [BusinessProfileErrorType.TIMEOUT_ERROR]: 'The operation timed out.',
  [BusinessProfileErrorType.CRITICAL_ERROR]: 'A critical system error occurred. Please contact support.',
  [BusinessProfileErrorType.SYSTEM_ERROR]: 'A system error occurred. Please try again later.',
  
  // Business logic errors
  [BusinessProfileErrorType.BUSINESS_LOGIC_ERROR]: 'The request could not be processed due to business rules.',
  
  // Rate limit errors
  [BusinessProfileErrorType.RATE_LIMIT_ERROR]: 'Too many requests. Please try again later.',
  
  // Unknown errors
  [BusinessProfileErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
};
