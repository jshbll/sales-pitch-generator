/**
 * Error Categorization Utility
 * 
 * Provides consistent error categorization for all error types.
 * Includes specialized handling for database errors with specific
 * PostgreSQL error pattern recognition.
 */
import { BusinessProfileErrorType, BusinessProfileErrorCode } from './errorTypes';

/**
 * Database error patterns for common PostgreSQL errors
 */
export const DATABASE_ERROR_PATTERNS = {
  // Connection errors
  CONNECTION: {
    patterns: ['connection', 'connect', 'timeout', 'terminated', 'closed'],
    type: BusinessProfileErrorType.DATABASE_CONNECTION_ERROR,
    code: BusinessProfileErrorCode.DATABASE_CONNECTION_FAILED
  },
  
  // Constraint violations
  UNIQUE_VIOLATION: {
    patterns: ['unique', 'duplicate', 'already exists', '23505'],
    type: BusinessProfileErrorType.DATABASE_CONSTRAINT_ERROR,
    code: BusinessProfileErrorCode.DUPLICATE_KEY
  },
  
  FOREIGN_KEY: {
    patterns: ['foreign key', 'referenced', 'references', '23503'],
    type: BusinessProfileErrorType.DATABASE_CONSTRAINT_ERROR,
    code: BusinessProfileErrorCode.FOREIGN_KEY_VIOLATION
  },
  
  // Query errors
  SYNTAX: {
    patterns: ['syntax', 'parse', 'invalid', '42601'],
    type: BusinessProfileErrorType.DATABASE_QUERY_ERROR,
    code: BusinessProfileErrorCode.DATABASE_QUERY_FAILED
  },
  
  // Not found errors
  NOT_FOUND: {
    patterns: ['not found', 'does not exist', 'no rows', 'P0002'],
    type: BusinessProfileErrorType.NOT_FOUND_ERROR,
    code: BusinessProfileErrorCode.RESOURCE_NOT_FOUND
  }
};

/**
 * Categorize an error
 * 
 * @param error - Error to categorize
 * @returns Business profile error type
 */
/**
 * Categorize database error based on error message and PostgreSQL error code
 * 
 * @param error - The database error to categorize
 * @param operation - The database operation being performed
 * @param table - The database table involved
 * @returns Categorized error information
 */
export function categorizeDatabaseError(error: unknown, operation?: string, table?: string): {
  type: BusinessProfileErrorType;
  code: string;
  message: string;
} {
  // Default to generic database error
  let errorType = BusinessProfileErrorType.DATABASE_ERROR;
  let errorCode = BusinessProfileErrorCode.DATABASE_QUERY_FAILED;
  let errorMessage = 'A database error occurred';
  
  if (!(error instanceof Error)) {
    return {
      type: errorType,
      code: errorCode,
      message: errorMessage
    };
  }
  
  // Extract PostgreSQL error code if available
  const pgError = error as Error & { code?: string; constraint?: string; };
  const message = pgError.message.toLowerCase();
  
  // Try to match error against known patterns
  for (const [category, pattern] of Object.entries(DATABASE_ERROR_PATTERNS)) {
    if (pattern.patterns.some(p => message.includes(p)) || 
        (pgError.code && pattern.patterns.some(p => pgError.code?.includes(p)))) {
      errorType = pattern.type;
      errorCode = pattern.code;
      
      // Generate a more specific error message based on the error type
      if (pattern.type === BusinessProfileErrorType.NOT_FOUND_ERROR) {
        errorMessage = `The requested ${table || 'record'} could not be found`;
      } else if (pattern.type === BusinessProfileErrorType.DATABASE_CONSTRAINT_ERROR) {
        if (category === 'UNIQUE_VIOLATION') {
          errorMessage = `A ${table || 'record'} with these details already exists`;
        } else if (category === 'FOREIGN_KEY') {
          errorMessage = `The referenced ${table || 'record'} does not exist`;
        }
      } else if (pattern.type === BusinessProfileErrorType.DATABASE_CONNECTION_ERROR) {
        errorMessage = 'Could not connect to the database';
      } else {
        errorMessage = `Error ${operation || 'processing'} ${table || 'data'} in database`;
      }
      
      break;
    }
  }
  
  return {
    type: errorType,
    code: errorCode,
    message: errorMessage
  };
}

/**
 * Categorize an error
 * 
 * @param error - Error to categorize
 * @returns Business profile error type
 */
export function categorizeError(error: unknown): BusinessProfileErrorType {
  // If not an Error object, default to server error
  if (!(error instanceof Error)) {
    return BusinessProfileErrorType.SERVER_ERROR;
  }
  
  // Check for specific error types
  const errorMessage = error.message.toLowerCase();
  const errorObj = error as Error & { code?: string; status?: number; statusCode?: number };
  
  // Check for HTTP status codes
  const statusCode = errorObj.status || errorObj.statusCode;
  if (statusCode) {
    if (statusCode === 401 || statusCode === 403) {
      return BusinessProfileErrorType.AUTHENTICATION;
    }
    if (statusCode === 404) {
      return BusinessProfileErrorType.NOT_FOUND;
    }
    if (statusCode === 400 || statusCode === 422) {
      return BusinessProfileErrorType.VALIDATION;
    }
    if (statusCode === 429) {
      return BusinessProfileErrorType.RATE_LIMIT_EXCEEDED;
    }
    if (statusCode >= 500) {
      return BusinessProfileErrorType.SERVER_ERROR;
    }
  }
  
  // Check for PostgreSQL error codes
  if (errorObj.code) {
    const pgCode = errorObj.code;
    if (pgCode.startsWith('23')) {
      return pgCode === '23505' 
        ? BusinessProfileErrorType.DUPLICATE_ENTRY 
        : BusinessProfileErrorType.VALIDATION;
    }
    if (pgCode.startsWith('28') || pgCode.startsWith('42501')) {
      return BusinessProfileErrorType.PERMISSION_DENIED;
    }
    if (pgCode.startsWith('08') || pgCode.startsWith('57')) {
      return BusinessProfileErrorType.DATABASE_ERROR;
    }
  }
  
  // Check for specific error messages
  if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
    return BusinessProfileErrorType.NOT_FOUND;
  }
  
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return BusinessProfileErrorType.VALIDATION;
  }
  
  if (errorMessage.includes('permission') || errorMessage.includes('unauthorized') || 
      errorMessage.includes('not authorized') || errorMessage.includes('forbidden')) {
    return BusinessProfileErrorType.AUTHENTICATION;
  }
  
  if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
    return BusinessProfileErrorType.DUPLICATE_ENTRY;
  }
  
  if (errorMessage.includes('database') || errorMessage.includes('sql') || 
      errorMessage.includes('query') || errorMessage.includes('db')) {
    return BusinessProfileErrorType.DATABASE_ERROR;
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return BusinessProfileErrorType.TIMEOUT;
  }
  
  // Default to server error
  return BusinessProfileErrorType.SERVER_ERROR;
}
