/**
 * Database Error Utilities
 * 
 * Provides utilities for handling database errors in the Business Profile Service.
 */
import { BusinessProfileErrorType } from './errorTypes';
import { categorizePostgresError, isPostgresErrorRetriable, getPostgresErrorMessage } from './postgresErrorHandler';

/**
 * Database error details
 */
export interface DatabaseErrorDetails {
  /** Error type */
  type: BusinessProfileErrorType;
  /** Error code */
  code?: string;
  /** User-friendly message */
  message: string;
  /** Whether the error is retriable */
  retriable?: boolean;
}

/**
 * Categorize a database error
 * 
 * @param error - Error to categorize
 * @param operation - Database operation
 * @param table - Database table
 * @returns Database error details
 */
export function categorizeDatabaseError(
  error: unknown,
  operation?: string,
  table?: string
): DatabaseErrorDetails {
  // Default error details
  const defaultDetails: DatabaseErrorDetails = {
    type: BusinessProfileErrorType.DATABASE_ERROR,
    message: `Database error during ${operation || 'operation'} on ${table || 'table'}`,
    retriable: false
  };
  
  // If not an Error object, return default details
  if (!(error instanceof Error)) {
    return defaultDetails;
  }
  
  // Cast to Error with possible code property
  const dbError = error as Error & { code?: string };
  
  // Check for PostgreSQL error codes
  if (dbError.code) {
    // Use our comprehensive PostgreSQL error handler
    const pgErrorDetails = categorizePostgresError(
      dbError, 
      BusinessProfileErrorType.DATABASE_ERROR,
      `Database error during ${operation || 'operation'} on ${table || 'table'}`
    );
    
    // Get whether error is retriable
    const retriable = isPostgresErrorRetriable(dbError);
    
    // Return PostgreSQL error details with retriable flag
    return {
      ...pgErrorDetails,
      retriable
    };
  }
  
  // If no code is available, check for specific error messages
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
    return {
      type: BusinessProfileErrorType.DUPLICATE_ENTRY,
      message: 'A record with this information already exists.',
      retriable: false
    };
  }
  
  if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
    return {
      type: BusinessProfileErrorType.NOT_FOUND,
      message: 'The requested record could not be found.',
      retriable: false
    };
  }
  
  if (errorMessage.includes('permission') || errorMessage.includes('access denied')) {
    return {
      type: BusinessProfileErrorType.PERMISSION_DENIED,
      message: 'Database permission denied.',
      retriable: false
    };
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return {
      type: BusinessProfileErrorType.TIMEOUT,
      message: 'Database operation timed out.',
      retriable: true
    };
  }
  
  if (errorMessage.includes('connection') || errorMessage.includes('connect')) {
    return {
      type: BusinessProfileErrorType.CONNECTION_ERROR,
      message: 'Database connection error.',
      retriable: true
    };
  }
  
  // Default to database error
  return defaultDetails;
}

/**
 * Get a user-friendly error message for a database operation
 * 
 * @param errorType - Error type or error object
 * @param resourceName - Resource name (e.g., 'business profile')
 * @param operation - Database operation (e.g., 'create', 'update', 'delete', 'retrieve')
 * @returns User-friendly error message
 */
export function getDatabaseErrorMessage(
  errorTypeOrError: BusinessProfileErrorType | Error,
  resourceName: string = 'record',
  operation: string = 'accessing'
): string {
  const operationDesc = getOperationDescription(operation);
  
  // If the first parameter is an Error object, use our PostgreSQL error handler
  if (errorTypeOrError instanceof Error) {
    return getPostgresErrorMessage(
      errorTypeOrError as Error & { code?: string },
      resourceName,
      operation
    );
  }
  
  // Otherwise, handle by error type
  const errorType = errorTypeOrError as BusinessProfileErrorType;
  
  switch (errorType) {
    case BusinessProfileErrorType.NOT_FOUND:
      return `The ${resourceName} could not be found.`;
    case BusinessProfileErrorType.DUPLICATE_ENTRY:
      return `A ${resourceName} with this information already exists.`;
    case BusinessProfileErrorType.INVALID_REFERENCE:
      return `The referenced ${resourceName} does not exist.`;
    case BusinessProfileErrorType.PERMISSION_DENIED:
      return `You do not have permission to ${operation} this ${resourceName}.`;
    case BusinessProfileErrorType.AUTHENTICATION_ERROR:
      return `Authentication is required to ${operation} this ${resourceName}.`;
    case BusinessProfileErrorType.VALIDATION_ERROR:
      return `The ${resourceName} data is invalid.`;
    case BusinessProfileErrorType.TIMEOUT_ERROR:
      return `The operation timed out while ${operationDesc} the ${resourceName}.`;
    case BusinessProfileErrorType.DATABASE_CONNECTION_ERROR:
      return `A connection error occurred while ${operationDesc} the ${resourceName}.`;
    case BusinessProfileErrorType.RATE_LIMIT_EXCEEDED:
      return `Rate limit exceeded. Please try again later.`;
    case BusinessProfileErrorType.DATABASE_ERROR:
    case BusinessProfileErrorType.SERVER_ERROR:
    default:
      return `A database error occurred while ${operationDesc} the ${resourceName}.`;
  }
}

/**
 * Get a description of a database operation
 * 
 * @param operation - Database operation
 * @returns Operation description
 */
function getOperationDescription(operation: string): string {
  switch (operation.toLowerCase()) {
    case 'create':
      return 'creating';
    case 'update':
      return 'updating';
    case 'delete':
      return 'deleting';
    case 'retrieve':
    case 'get':
      return 'retrieving';
    case 'query':
    case 'search':
      return 'searching for';
    default:
      return operation;
  }
}
