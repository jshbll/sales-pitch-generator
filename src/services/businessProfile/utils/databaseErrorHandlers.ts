/**
 * Database Error Handlers
 * 
 * Provides specialized error handling functions for database operations
 * in the Business Profile Service.
 */

import { ApiResponse } from '../../../types';
import { User } from '../../../types/user';
import { BusinessProfileErrorType, BusinessProfileErrorCode } from './errorTypes';
import { BusinessProfileErrorContext, createErrorContext, createDatabaseErrorContext, DatabaseOperationType } from './errorContext';
import { categorizeDatabaseError } from './errorCategorization';
import { DatabaseErrorDetails } from './databaseErrorUtils';
import { isPostgresErrorRetriable } from './postgresErrorHandler';
import errorMonitoring from './errorMonitoring';
import logger from './loggerService';

/**
 * Error handling options
 */
export interface DatabaseErrorOptions {
  /** Error context */
  context?: Partial<BusinessProfileErrorContext>;
  /** User information */
  user?: User | null;
  /** Business ID */
  businessId?: string;
  /** Business name */
  businessName?: string;
  /** Additional information */
  additionalInfo?: Record<string, unknown>;
}

/**
 * Create a standardized database error response
 * 
 * @param error - Error object
 * @param context - Error context
 * @returns Standardized database error response
 */
export function createDatabaseErrorResponse<T>(
  error: Error,
  context: BusinessProfileErrorContext
): ApiResponse<T> {
  // Process the database error
  const errorDetails = processDatabaseError(error, context);
  
  // Log the error
  logger.error('Database error', {
    ...context,
    errorType: errorDetails.type,
    errorCode: errorDetails.code,
    errorMessage: errorDetails.message,
    stack: error.stack,
    retriable: errorDetails.retriable
  });
  
  // Track the error in monitoring
  errorMonitoring.trackError(error, {
    context,
    category: 'database',
    type: errorDetails.type,
    code: errorDetails.code,
    retriable: errorDetails.retriable
  });
  
  // Return a standardized error response
  return {
    success: false,
    error: errorDetails.message,
    errorType: errorDetails.type,
    errorCode: errorDetails.code,
    errorContext: {
      requestId: context.operationId,
      timestamp: context.timestamp,
      component: context.component,
      function: context.functionName
    },
    retriable: errorDetails.retriable
  };
}

/**
 * Process a database error and return detailed error information
 * 
 * @param error - Error object
 * @param context - Error context
 * @returns Error details
 */
export function processDatabaseError(
  error: Error,
  context: BusinessProfileErrorContext
): {
  message: string;
  code?: string;
  type: BusinessProfileErrorType;
  retriable: boolean;
} {
  // Get database error details
  const dbContext = context.database || { 
    operation: 'unknown', 
    table: 'unknown' 
  };
  
  // Categorize the database error
  const errorDetails = categorizeDatabaseError(
    error, 
    dbContext.operation, 
    dbContext.table
  );
  
  // Check if error is retriable
  const retriable = isPostgresErrorRetriable(error);
  
  return {
    message: errorDetails.message,
    code: errorDetails.code,
    type: errorDetails.type,
    retriable
  };
}

/**
 * Handle database errors for business profile operations
 * 
 * @param error - Error to handle
 * @param operation - Database operation type
 * @param table - Database table
 * @param options - Error handling options
 * @returns Formatted error response
 */
export function handleDatabaseError<T>(
  error: unknown,
  operation: DatabaseOperationType,
  table: string,
  options: DatabaseErrorOptions = {}
): ApiResponse<T> {
  const { context: baseContext, user, businessId, businessName, additionalInfo } = options;
  
  // Create error context
  const contextOptions = {
    functionName: baseContext?.functionName,
    component: baseContext?.component || 'BusinessProfileRepository',
    user,
    businessId,
    businessName,
    dbOperation: operation,
    dbTable: table,
    info: additionalInfo
  };
  
  // Create error context with database operation details
  const context = baseContext ? 
    createDatabaseErrorContext(operation, table, undefined, baseContext) : 
    createErrorContext(contextOptions);
  
  // If error is an Error object, create database error response
  if (error instanceof Error) {
    return createDatabaseErrorResponse<T>(error, context);
  }
  
  // For non-Error objects, create a generic error
  const genericError = new Error(typeof error === 'string' ? error : 'Unknown database error');
  return createDatabaseErrorResponse<T>(genericError, context);
}
