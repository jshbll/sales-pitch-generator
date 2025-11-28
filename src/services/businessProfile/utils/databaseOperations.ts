/**
 * Database Operations Utility
 * 
 * Provides utilities for handling database operations with proper error handling,
 * retry mechanisms, and logging for the Business Profile Service.
 */
import logger from './loggerService';
import errorMonitoring from './errorMonitoring';
import { BusinessProfileErrorContext, createErrorContext } from './errorContext';
import { BusinessProfileErrorType, BusinessProfileErrorCode } from './errorTypes';
import { categorizeDatabaseError, getDatabaseErrorMessage } from './databaseErrorUtils';
import { handleDatabaseError, createDatabaseErrorResponse } from './errorHandlers';
import { ApiResponse } from '../../../types/api';

/**
 * Database operation options
 */
export interface DatabaseOperationOptions {
  /** Operation name */
  operation: string;
  /** Table name */
  table: string;
  /** Query ID or description */
  queryId?: string;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Delay between retry attempts in milliseconds */
  retryDelay?: number;
  /** Whether to use exponential backoff for retries */
  useExponentialBackoff?: boolean;
  /** Error context */
  context?: Partial<BusinessProfileErrorContext>;
  /** Resource name for error messages */
  resourceName?: string;
}

/**
 * Default database operation options
 */
const DEFAULT_OPTIONS: Partial<DatabaseOperationOptions> = {
  maxRetries: 3,
  retryDelay: 500,
  useExponentialBackoff: true
};

/**
 * Execute a database operation with error handling and retry mechanism
 * 
 * @param operation - Database operation function
 * @param options - Database operation options
 * @returns Operation result or error response
 */
export async function executeDbOperation<T, R = any>(
  operation: () => Promise<R>,
  options: DatabaseOperationOptions
): Promise<ApiResponse<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { maxRetries, retryDelay, useExponentialBackoff } = opts;
  
  // Create error context
  const context = createErrorContext({
    operationId: `db-${opts.operation}-${Date.now()}`,
    component: 'DatabaseOperations',
    functionName: 'executeDbOperation',
    database: {
      operation: opts.operation,
      table: opts.table,
      queryId: opts.queryId
    },
    ...opts.context
  });
  
  // Log database operation
  logger.logDatabaseOperation(
    opts.operation,
    opts.table,
    opts.queryId,
    {
      operationId: context.operationId,
      component: context.component,
      functionName: context.functionName
    }
  );
  
  // Execute operation with retry mechanism
  let lastError: Error | null = null;
  let attempt = 0;
  
  while (attempt <= maxRetries!) {
    try {
      // Execute operation
      const result = await operation();
      
      // Log success
      logger.debug(`Database operation successful: ${opts.operation} on ${opts.table}`, {
        operationId: context.operationId,
        component: context.component,
        functionName: context.functionName
      });
      
      // Return success response
      return {
        success: true,
        data: result as unknown as T
      };
    } catch (error) {
      // Increment attempt counter
      attempt++;
      
      // Cast error to Error object
      const err = error instanceof Error ? error : new Error(String(error));
      
      // Categorize database error
      const dbError = categorizeDatabaseError(err, opts.operation, opts.table);
      
      // Log error
      logger.error(
        `Database operation failed (attempt ${attempt}/${maxRetries! + 1}): ${err.message}`,
        {
          operationId: context.operationId,
          component: context.component,
          functionName: context.functionName,
          database: context.database,
          errorType: dbError.type,
          errorCode: dbError.code as BusinessProfileErrorCode
        },
        err
      );
      
      // Check if error is retriable
      const isRetriable = isRetriableError(err);
      
      // Check if we should retry
      if (isRetriable && attempt <= maxRetries!) {
        // Calculate retry delay
        const delay = useExponentialBackoff
          ? retryDelay! * Math.pow(2, attempt - 1)
          : retryDelay!;
        
        // Log retry attempt
        logger.info(
          `Retrying database operation in ${delay}ms (attempt ${attempt}/${maxRetries!})`,
          {
            operationId: context.operationId,
            component: context.component,
            functionName: context.functionName,
            database: context.database
          }
        );
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Store error for later use
        lastError = err;
        
        // Continue to next attempt
        continue;
      }
      
      // Track database error
      errorMonitoring.trackDatabaseError(err, context, dbError.code as BusinessProfileErrorCode);
      
      // Get user-friendly error message
      const userMessage = getDatabaseErrorMessage(
        dbError.type,
        opts.resourceName || opts.table,
        opts.operation
      );
      
      // Return error response
      return createDatabaseErrorResponse<T>(err, context);
    }
  }
  
  // If we get here, all retry attempts failed
  if (lastError) {
    // Track database error
    errorMonitoring.trackDatabaseError(lastError, context);
    
    // Return error response
    return createDatabaseErrorResponse<T>(lastError, context);
  }
  
  // This should never happen, but just in case
  return {
    success: false,
    error: 'Unknown database error occurred',
    errorCategory: 'server'
  };
}

/**
 * Check if an error is retriable
 * 
 * @param error - Error to check
 * @returns Whether the error is retriable
 */
function isRetriableError(error: Error): boolean {
  // Get error message
  const errorMessage = error.message.toLowerCase();
  
  // Check for connection errors
  if (
    errorMessage.includes('connection') ||
    errorMessage.includes('connect') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('timed out') ||
    errorMessage.includes('deadlock') ||
    errorMessage.includes('too many connections') ||
    errorMessage.includes('connection pool')
  ) {
    return true;
  }
  
  // Check for PostgreSQL error codes
  const pgError = error as Error & { code?: string };
  if (pgError.code) {
    // Class 08 — Connection Exception
    if (pgError.code.startsWith('08')) {
      return true;
    }
    
    // Class 40 — Transaction Rollback
    if (pgError.code.startsWith('40')) {
      return true;
    }
    
    // Class 53 — Insufficient Resources
    if (pgError.code.startsWith('53')) {
      return true;
    }
    
    // Class 57 — Operator Intervention
    if (pgError.code.startsWith('57')) {
      return true;
    }
  }
  
  // Not a retriable error
  return false;
}

/**
 * Execute a database query with error handling
 * 
 * @param query - Database query function
 * @param options - Database operation options
 * @returns Query result or error response
 */
export async function executeDbQuery<T, R = any>(
  query: () => Promise<R>,
  options: DatabaseOperationOptions
): Promise<ApiResponse<T>> {
  return executeDbOperation<T, R>(query, {
    ...options,
    operation: options.operation || 'query'
  });
}

/**
 * Execute a database transaction with error handling
 * 
 * @param transaction - Database transaction function
 * @param options - Database operation options
 * @returns Transaction result or error response
 */
export async function executeDbTransaction<T, R = any>(
  transaction: () => Promise<R>,
  options: DatabaseOperationOptions
): Promise<ApiResponse<T>> {
  return executeDbOperation<T, R>(transaction, {
    ...options,
    operation: options.operation || 'transaction'
  });
}

/**
 * Execute a database insert operation with error handling
 * 
 * @param insert - Database insert function
 * @param options - Database operation options
 * @returns Insert result or error response
 */
export async function executeDbInsert<T, R = any>(
  insert: () => Promise<R>,
  options: DatabaseOperationOptions
): Promise<ApiResponse<T>> {
  return executeDbOperation<T, R>(insert, {
    ...options,
    operation: options.operation || 'insert'
  });
}

/**
 * Execute a database update operation with error handling
 * 
 * @param update - Database update function
 * @param options - Database operation options
 * @returns Update result or error response
 */
export async function executeDbUpdate<T, R = any>(
  update: () => Promise<R>,
  options: DatabaseOperationOptions
): Promise<ApiResponse<T>> {
  return executeDbOperation<T, R>(update, {
    ...options,
    operation: options.operation || 'update'
  });
}

/**
 * Execute a database delete operation with error handling
 * 
 * @param deleteOperation - Database delete function
 * @param options - Database operation options
 * @returns Delete result or error response
 */
export async function executeDbDelete<T, R = any>(
  deleteOperation: () => Promise<R>,
  options: DatabaseOperationOptions
): Promise<ApiResponse<T>> {
  return executeDbOperation<T, R>(deleteOperation, {
    ...options,
    operation: options.operation || 'delete'
  });
}
