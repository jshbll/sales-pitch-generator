/**
 * PostgreSQL Error Handler
 * 
 * Provides utilities for handling PostgreSQL-specific database errors in the Business Profile Service.
 * Reference: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
import { BusinessProfileErrorType, BusinessProfileErrorCode } from './errorTypes';
import { DatabaseErrorDetails } from './databaseErrorUtils';

/**
 * PostgreSQL error code mapping
 */
interface PostgresErrorMapping {
  type: BusinessProfileErrorType;
  code: BusinessProfileErrorCode;
  message: string;
  retriable: boolean;
}

/**
 * Maps PostgreSQL error codes to business error types and codes
 */
const POSTGRES_ERROR_MAPPING: Record<string, PostgresErrorMapping> = {
  // Class 00 — Successful Completion
  '00000': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.DATABASE_QUERY_FAILED,
    message: 'The operation completed successfully but an error was reported.',
    retriable: false
  },

  // Class 01 — Warning
  // These aren't really errors, so we don't map them
  
  // Class 02 — No Data
  // These aren't really errors, so we don't map them
  
  // Class 03 — SQL Statement Not Yet Complete
  // These aren't really errors, so we don't map them
  
  // Class 08 — Connection Exception
  '08000': {
    type: BusinessProfileErrorType.DATABASE_CONNECTION_ERROR,
    code: BusinessProfileErrorCode.DATABASE_CONNECTION_FAILED,
    message: 'Database connection failed.',
    retriable: true
  },
  '08003': {
    type: BusinessProfileErrorType.DATABASE_CONNECTION_ERROR,
    code: BusinessProfileErrorCode.DATABASE_CONNECTION_FAILED,
    message: 'Database connection does not exist.',
    retriable: true
  },
  '08006': {
    type: BusinessProfileErrorType.DATABASE_CONNECTION_ERROR,
    code: BusinessProfileErrorCode.DATABASE_CONNECTION_FAILED,
    message: 'Database connection failure.',
    retriable: true
  },
  '08007': {
    type: BusinessProfileErrorType.DATABASE_CONNECTION_ERROR,
    code: BusinessProfileErrorCode.DATABASE_CONNECTION_FAILED,
    message: 'Transaction resolution unknown.',
    retriable: false
  },

  // Class 22 — Data Exception
  '22000': {
    type: BusinessProfileErrorType.VALIDATION_ERROR,
    code: BusinessProfileErrorCode.INVALID_INPUT,
    message: 'Invalid data format.',
    retriable: false
  },
  '22001': {
    type: BusinessProfileErrorType.VALIDATION_ERROR,
    code: BusinessProfileErrorCode.INVALID_FORMAT,
    message: 'String data right truncation.',
    retriable: false
  },
  '22003': {
    type: BusinessProfileErrorType.VALIDATION_ERROR,
    code: BusinessProfileErrorCode.INVALID_INPUT,
    message: 'Numeric value out of range.',
    retriable: false
  },
  '22007': {
    type: BusinessProfileErrorType.VALIDATION_ERROR,
    code: BusinessProfileErrorCode.INVALID_FORMAT,
    message: 'Invalid date/time format.',
    retriable: false
  },
  '22008': {
    type: BusinessProfileErrorType.VALIDATION_ERROR,
    code: BusinessProfileErrorCode.INVALID_FORMAT,
    message: 'Date/time field overflow.',
    retriable: false
  },
  '22023': {
    type: BusinessProfileErrorType.VALIDATION_ERROR,
    code: BusinessProfileErrorCode.INVALID_INPUT,
    message: 'Invalid parameter value.',
    retriable: false
  },

  // Class 23 — Integrity Constraint Violation
  '23000': {
    type: BusinessProfileErrorType.DATABASE_CONSTRAINT_ERROR,
    code: BusinessProfileErrorCode.DATABASE_QUERY_FAILED,
    message: 'Integrity constraint violation.',
    retriable: false
  },
  '23001': {
    type: BusinessProfileErrorType.DATABASE_CONSTRAINT_ERROR,
    code: BusinessProfileErrorCode.DATABASE_QUERY_FAILED,
    message: 'Restrict violation.',
    retriable: false
  },
  '23502': {
    type: BusinessProfileErrorType.VALIDATION_ERROR,
    code: BusinessProfileErrorCode.MISSING_REQUIRED_FIELD,
    message: 'Not null violation.',
    retriable: false
  },
  '23503': {
    type: BusinessProfileErrorType.DATABASE_CONSTRAINT_ERROR,
    code: BusinessProfileErrorCode.FOREIGN_KEY_VIOLATION,
    message: 'Foreign key violation.',
    retriable: false
  },
  '23505': {
    type: BusinessProfileErrorType.DATABASE_CONSTRAINT_ERROR,
    code: BusinessProfileErrorCode.DUPLICATE_KEY,
    message: 'Unique violation.',
    retriable: false
  },
  '23514': {
    type: BusinessProfileErrorType.VALIDATION_ERROR,
    code: BusinessProfileErrorCode.INVALID_INPUT,
    message: 'Check violation.',
    retriable: false
  },

  // Class 25 — Invalid Transaction State
  '25000': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.DATABASE_QUERY_FAILED,
    message: 'Invalid transaction state.',
    retriable: false
  },
  '25001': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.DATABASE_QUERY_FAILED,
    message: 'Active SQL transaction.',
    retriable: false
  },
  '25002': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.DATABASE_QUERY_FAILED,
    message: 'Branch transaction already active.',
    retriable: false
  },
  '25008': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.DATABASE_QUERY_FAILED,
    message: 'Held cursor requires same isolation level.',
    retriable: false
  },
  '25P01': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.DATABASE_QUERY_FAILED,
    message: 'No active SQL transaction.',
    retriable: false
  },
  '25P02': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.DATABASE_QUERY_FAILED,
    message: 'In failed SQL transaction.',
    retriable: true // May be retriable after rollback
  },

  // Class 28 — Invalid Authorization Specification
  '28000': {
    type: BusinessProfileErrorType.AUTHENTICATION_ERROR,
    code: BusinessProfileErrorCode.INVALID_CREDENTIALS,
    message: 'Invalid authorization specification.',
    retriable: false
  },
  '28P01': {
    type: BusinessProfileErrorType.AUTHENTICATION_ERROR,
    code: BusinessProfileErrorCode.INVALID_CREDENTIALS,
    message: 'Invalid password.',
    retriable: false
  },

  // Class 42 — Syntax Error or Access Rule Violation
  '42501': {
    type: BusinessProfileErrorType.AUTHORIZATION_ERROR,
    code: BusinessProfileErrorCode.INSUFFICIENT_PERMISSIONS,
    message: 'Insufficient privilege.',
    retriable: false
  },
  '42601': {
    type: BusinessProfileErrorType.DATABASE_QUERY_ERROR,
    code: BusinessProfileErrorCode.DATABASE_QUERY_FAILED,
    message: 'Syntax error.',
    retriable: false
  },
  '42P01': {
    type: BusinessProfileErrorType.DATABASE_QUERY_ERROR,
    code: BusinessProfileErrorCode.DATABASE_QUERY_FAILED,
    message: 'Undefined table.',
    retriable: false
  },
  '42P02': {
    type: BusinessProfileErrorType.DATABASE_QUERY_ERROR,
    code: BusinessProfileErrorCode.DATABASE_QUERY_FAILED,
    message: 'Undefined parameter.',
    retriable: false
  },
  '42P03': {
    type: BusinessProfileErrorType.DATABASE_QUERY_ERROR,
    code: BusinessProfileErrorCode.DATABASE_QUERY_FAILED,
    message: 'Duplicate cursor.',
    retriable: false
  },

  // Class 53 — Insufficient Resources
  '53000': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.SERVICE_UNAVAILABLE,
    message: 'Insufficient resources.',
    retriable: true
  },
  '53100': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.SERVICE_UNAVAILABLE,
    message: 'Disk full.',
    retriable: false
  },
  '53200': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.SERVICE_UNAVAILABLE,
    message: 'Out of memory.',
    retriable: true
  },
  '53300': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.SERVICE_UNAVAILABLE,
    message: 'Too many connections.',
    retriable: true
  },

  // Class 57 — Operator Intervention
  '57000': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.SERVICE_UNAVAILABLE,
    message: 'Operator intervention.',
    retriable: true
  },
  '57014': {
    type: BusinessProfileErrorType.TIMEOUT_ERROR,
    code: BusinessProfileErrorCode.TIMEOUT,
    message: 'Query canceled.',
    retriable: true
  },
  '57P01': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.SERVICE_UNAVAILABLE,
    message: 'Admin shutdown.',
    retriable: true
  },
  '57P02': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.SERVICE_UNAVAILABLE,
    message: 'Crash shutdown.',
    retriable: true
  },
  '57P03': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.SERVICE_UNAVAILABLE,
    message: 'Cannot connect now.',
    retriable: true
  },
  '57P04': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.SERVICE_UNAVAILABLE,
    message: 'Database dropped.',
    retriable: false
  },

  // Class 58 — System Error
  '58000': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.INTERNAL_SERVER_ERROR,
    message: 'System error.',
    retriable: false
  },
  '58030': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.INTERNAL_SERVER_ERROR,
    message: 'I/O error.',
    retriable: true
  },
  '58P01': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.INTERNAL_SERVER_ERROR,
    message: 'Undefined file.',
    retriable: false
  },
  '58P02': {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    code: BusinessProfileErrorCode.INTERNAL_SERVER_ERROR,
    message: 'Duplicate file.',
    retriable: false
  }
};

/**
 * Categorizes a PostgreSQL error based on its error code
 * 
 * @param error - The error object
 * @param defaultType - Default error type if not found
 * @param defaultMessage - Default error message if not found
 * @returns Database error details
 */
export function categorizePostgresError(
  error: Error & { code?: string },
  defaultType: BusinessProfileErrorType = BusinessProfileErrorType.DATABASE_ERROR,
  defaultMessage: string = 'A database error occurred'
): DatabaseErrorDetails {
  const pgCode = error.code || '';
  
  // Check for exact PostgreSQL error code match
  if (pgCode && POSTGRES_ERROR_MAPPING[pgCode]) {
    const mapping = POSTGRES_ERROR_MAPPING[pgCode];
    return {
      type: mapping.type,
      code: pgCode,
      message: mapping.message
    };
  }
  
  // Check for PostgreSQL error class match (first 2 characters)
  if (pgCode && pgCode.length >= 2) {
    const errorClass = pgCode.substring(0, 2) + '000';
    if (POSTGRES_ERROR_MAPPING[errorClass]) {
      const mapping = POSTGRES_ERROR_MAPPING[errorClass];
      return {
        type: mapping.type,
        code: pgCode,
        message: mapping.message
      };
    }
  }
  
  // Return default error details if no match
  return {
    type: defaultType,
    code: pgCode || undefined,
    message: defaultMessage
  };
}

/**
 * Check if a PostgreSQL error is retriable based on its error code
 * 
 * @param error - The error object
 * @returns Whether the error is retriable
 */
export function isPostgresErrorRetriable(error: Error & { code?: string }): boolean {
  const pgCode = error.code || '';
  
  // Check for exact PostgreSQL error code match
  if (pgCode && POSTGRES_ERROR_MAPPING[pgCode]) {
    return POSTGRES_ERROR_MAPPING[pgCode].retriable;
  }
  
  // Check for PostgreSQL error class match (first 2 characters)
  if (pgCode && pgCode.length >= 2) {
    const errorClass = pgCode.substring(0, 2) + '000';
    if (POSTGRES_ERROR_MAPPING[errorClass]) {
      return POSTGRES_ERROR_MAPPING[errorClass].retriable;
    }
  }
  
  // Default to non-retriable
  return false;
}

/**
 * Gets a human-readable error message for a PostgreSQL error
 * 
 * @param error - The error object
 * @param resourceName - The name of the resource (e.g., "business profile")
 * @param operation - The database operation (e.g., "create", "update")
 * @returns A human-readable error message
 */
export function getPostgresErrorMessage(
  error: Error & { code?: string },
  resourceName: string = 'record',
  operation: string = 'performing operation on'
): string {
  const pgCode = error.code || '';
  
  // Get error details
  const errorDetails = categorizePostgresError(error);
  
  // Return user-friendly message based on error type
  switch (errorDetails.type) {
    case BusinessProfileErrorType.VALIDATION_ERROR:
      if (pgCode === '23502') { // Not null violation
        return `A required field is missing when ${operation} the ${resourceName}.`;
      } else if (pgCode === '22001') { // String data right truncation
        return `One of the text fields is too long for ${operation} the ${resourceName}.`;
      } else if (pgCode === '22003') { // Numeric value out of range
        return `A numeric value is out of range for ${operation} the ${resourceName}.`;
      } else if (pgCode === '22007' || pgCode === '22008') { // Date/time errors
        return `Invalid date or time format for ${operation} the ${resourceName}.`;
      }
      return `The data provided for ${operation} the ${resourceName} is invalid.`;
      
    case BusinessProfileErrorType.DATABASE_CONSTRAINT_ERROR:
      if (pgCode === '23505') { // Unique violation
        return `A ${resourceName} with this information already exists.`;
      } else if (pgCode === '23503') { // Foreign key violation
        return `The referenced ${resourceName} does not exist.`;
      }
      return `The ${operation} operation on ${resourceName} violates database constraints.`;
      
    case BusinessProfileErrorType.AUTHENTICATION_ERROR:
      return `Authentication failed when ${operation} the ${resourceName}.`;
      
    case BusinessProfileErrorType.AUTHORIZATION_ERROR:
      return `You don't have permission to ${operation} the ${resourceName}.`;
      
    case BusinessProfileErrorType.DATABASE_CONNECTION_ERROR:
      return `Failed to connect to the database when ${operation} the ${resourceName}.`;
      
    case BusinessProfileErrorType.DATABASE_QUERY_ERROR:
      return `A database query error occurred when ${operation} the ${resourceName}.`;
      
    case BusinessProfileErrorType.TIMEOUT_ERROR:
      return `The operation timed out when ${operation} the ${resourceName}.`;
      
    default:
      // Use the mapped message if available
      if (pgCode && POSTGRES_ERROR_MAPPING[pgCode]) {
        return `${POSTGRES_ERROR_MAPPING[pgCode].message} (when ${operation} the ${resourceName})`;
      }
      
      // Default message
      return `A database error occurred when ${operation} the ${resourceName}.`;
  }
}
