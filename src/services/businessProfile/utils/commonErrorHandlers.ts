/**
 * Common Error Handlers
 * 
 * Provides common error handling functions for the Business Profile Service.
 * These handlers are used across different error types.
 */

import { ApiResponse } from '../../../types';
import { User } from '../../../types/user';
import { BusinessProfileErrorType, BusinessProfileErrorCode, businessErrorMessages } from './errorTypes';
import { BusinessProfileErrorContext, createErrorContext } from './errorContext';
import { categorizeError, categorizeDatabaseError } from './errorCategorization';
import { ZodError } from 'zod';
import errorMonitoring from './errorMonitoring';
import logger from './loggerService';

/**
 * Error handling options
 */
export interface CommonErrorOptions {
  /** Whether to log the error */
  logError?: boolean;
  /** Whether to include technical details in the error response */
  includeTechnicalDetails?: boolean;
  /** User information */
  user?: User | null;
  /** Business ID */
  businessId?: string;
  /** Business name */
  businessName?: string;
  /** Error context */
  context?: Partial<BusinessProfileErrorContext>;
  /** Additional information */
  additionalInfo?: Record<string, unknown>;
}

/**
 * Format a validation error for consistent output
 * 
 * @param error - The validation error to format
 * @returns Formatted error details
 */
export function formatValidationError(error: unknown): Record<string, unknown> | undefined {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    
    // Extract field errors from Zod error
    error.errors.forEach(err => {
      const field = err.path.join('.');
      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      formattedErrors[field].push(err.message);
    });
    
    return {
      validationErrors: formattedErrors,
      message: 'Validation failed. Please check your input and try again.'
    };
  }
  
  // Handle string errors or unknown errors
  if (typeof error === 'string') {
    return {
      message: error,
      validationErrors: { general: [error] }
    };
  }
  
  // Handle other error objects
  if (error instanceof Error) {
    return {
      message: error.message,
      validationErrors: { general: [error.message] }
    };
  }
  
  return undefined;
}

/**
 * Detect business profile error type and code from error message
 * 
 * @param error - The error to analyze
 * @param context - Error context with database information
 * @returns The detected business profile error details
 */
export function detectBusinessProfileError(
  error: unknown,
  context?: BusinessProfileErrorContext
): {
  type: BusinessProfileErrorType;
  code?: string;
  message?: string;
} {
  // Handle validation errors
  if (error instanceof ZodError) {
    return {
      type: BusinessProfileErrorType.VALIDATION_ERROR,
      code: BusinessProfileErrorCode.INVALID_INPUT,
      message: 'Validation failed. Please check your input and try again.'
    };
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    // Check if this is a database error
    if (context?.database) {
      // Use database context to categorize error
      const dbOperation = context.database.operation;
      const dbTable = context.database.table;
      
      // Use imported database error categorization function
      return categorizeDatabaseError(error, dbOperation, dbTable);
    }
    
    // Use general error categorization for non-database errors
    const errorType = categorizeError(error);
    
    // Determine specific error code based on error type
    let errorCode: string | undefined;
    switch (errorType) {
      case BusinessProfileErrorType.VALIDATION_ERROR:
        errorCode = BusinessProfileErrorCode.INVALID_INPUT;
        break;
      case BusinessProfileErrorType.AUTHENTICATION_ERROR:
        errorCode = BusinessProfileErrorCode.AUTHENTICATION_REQUIRED;
        break;
      case BusinessProfileErrorType.AUTHORIZATION_ERROR:
        errorCode = BusinessProfileErrorCode.UNAUTHORIZED_ACCESS;
        break;
      case BusinessProfileErrorType.NOT_FOUND_ERROR:
        errorCode = BusinessProfileErrorCode.RESOURCE_NOT_FOUND;
        break;
      default:
        errorCode = BusinessProfileErrorCode.INTERNAL_SERVER_ERROR;
    }
    
    return {
      type: errorType,
      code: errorCode,
      message: error.message
    };
  }
  
  // Default to internal error for unknown error types
  return {
    type: BusinessProfileErrorType.INTERNAL_ERROR,
    code: BusinessProfileErrorCode.INTERNAL_SERVER_ERROR,
    message: typeof error === 'string' ? error : 'An unexpected error occurred'
  };
}

/**
 * Create a standardized business profile error response
 * 
 * @param error - The error to format
 * @param options - Error handling options
 * @returns Formatted API response with error details
 */
export function createBusinessProfileError<T>(
  error: unknown,
  options: CommonErrorOptions = {}
): ApiResponse<T> {
  const { 
    logError = true, 
    includeTechnicalDetails = false, 
    user, 
    businessId, 
    businessName, 
    context: baseContext, 
    additionalInfo 
  } = options;
  
  // Create error context
  const context = baseContext || createErrorContext({
    functionName: 'createBusinessProfileError',
    component: 'BusinessProfileService',
    user,
    businessId,
    businessName,
    info: additionalInfo
  });
  
  // Detect error type and code
  const errorInfo = detectBusinessProfileError(error, context);
  
  // Get user-friendly error message
  const userMessage = businessErrorMessages[errorInfo.type] || 
    (typeof error === 'string' ? error : 
     error instanceof Error ? error.message : 
     'An unexpected error occurred');
  
  // Log the error if needed
  if (logError) {
    const logMethod = errorInfo.type === BusinessProfileErrorType.INTERNAL_ERROR ? 
      logger.error : logger.warn;
    
    logMethod('Business profile error', {
      ...context,
      errorType: errorInfo.type,
      errorCode: errorInfo.code,
      errorMessage: errorInfo.message,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Track error in monitoring
    errorMonitoring.trackError(error instanceof Error ? error : new Error(userMessage), {
      context,
      type: errorInfo.type,
      code: errorInfo.code
    });
  }
  
  // Build error response
  const errorResponse: ApiResponse<T> = {
    success: false,
    error: userMessage,
    errorType: errorInfo.type,
    errorCode: errorInfo.code,
    errorContext: {
      requestId: context.operationId,
      timestamp: context.timestamp,
      component: context.component,
      function: context.functionName
    }
  };
  
  // Add validation details if applicable
  if (errorInfo.type === BusinessProfileErrorType.VALIDATION_ERROR) {
    const validationDetails = formatValidationError(error);
    if (validationDetails) {
      errorResponse.validationErrors = validationDetails.validationErrors;
    }
  }
  
  // Add technical details if requested (for development/debugging)
  if (includeTechnicalDetails && error instanceof Error) {
    errorResponse.technicalDetails = {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  }
  
  return errorResponse;
}

/**
 * Try-catch wrapper for business profile operations
 * 
 * @param operation - The operation to execute
 * @param options - Error handling options
 * @returns The result of the operation or an error response
 */
export async function tryBusinessOperation<T>(
  operation: () => Promise<ApiResponse<T>>,
  options: CommonErrorOptions = {}
): Promise<ApiResponse<T>> {
  try {
    // Execute the operation
    return await operation();
  } catch (error) {
    // Handle any errors
    return createBusinessProfileError<T>(error, options);
  }
}
