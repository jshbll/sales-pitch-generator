/**
 * Business Profile Error Utilities
 * 
 * Central entry point for all error handling related to business profile operations.
 * This file consolidates and exports all error handling utilities, providing a
 * unified interface for error management throughout the business profile service.
 * 
 * Key features:
 * - Standardized error context for improved traceability and debugging
 * - Consistent error categorization with support for various error types
 * - Type-safe error creation and handling utilities
 * - Operation wrapping for try-catch standardization
 * - Specialized error handlers for different error scenarios
 */
import { ApiResponse } from '../../../types';
import { User } from '../../../types/user';
import { 
  categorizeError
} from '../../../utils/errorHandling/errorHandler';
import { ZodError } from 'zod';
import { 
  BusinessProfileErrorContext,
  createErrorContext, 
  ErrorContextOptions 
} from './errorContext';
import {
  BusinessProfileErrorType,
  businessErrorMessages,
  ERROR_CATEGORY_MAPPING
} from './errorTypes';
import {
  DATABASE_ERROR_PATTERNS,
  categorizeDatabaseError
} from './errorCategorization';
import {
  createNotFoundError
} from './errorHandlers';

// Export types from errorTypes.ts
export { BusinessProfileErrorType } from './errorTypes';

/**
 * Map error categories to business profile error types
 */
const errorCategoryToBusinessType = ERROR_CATEGORY_MAPPING;

// Using businessErrorMessages from errorTypes.ts

/**
 * Options for business profile error handling
 */
export interface BusinessProfileErrorOptions {
  /** Whether to log the error */
  logError?: boolean;
  /** Whether to include technical details in the response */
  includeTechnicalDetails?: boolean;
  /** User object for context */
  user?: User | null;
  /** Business ID for context */
  businessId?: string;
  /** Business name for context */
  businessName?: string;
  /** Context information for error tracking */
  context?: Partial<BusinessProfileErrorContext>;
  /** Additional contextual information */
  additionalInfo?: Record<string, unknown>;
  /** Override the detected error type (for specialized error handlers) */
  overrideErrorType?: BusinessProfileErrorType;
}

/**
 * Format a validation error for consistent output
 * 
 * @param error - The validation error to format
 * @returns Formatted error details
 */
export function formatValidationError(error: unknown): Record<string, unknown> | undefined {
  if (!error) return undefined;
  
  if (error instanceof ZodError) {
    return error.format();
  }
  
  if (typeof error === 'object' && error !== null && 'format' in error && typeof error.format === 'function') {
    try {
      return error.format();
    } catch {
      return { error: String(error) };
    }
  }
  
  if (typeof error === 'object' && error !== null) {
    return error as Record<string, unknown>;
  }
  
  return { error: String(error) };
}

/**
 * Detect business profile error type and code from error message
 * 
 * @param error - The error to analyze
 * @param context - Error context with database information
 * @returns The detected business profile error details
 */
function detectBusinessProfileError(error: unknown, context?: BusinessProfileErrorContext): {
  type: BusinessProfileErrorType;
  code?: string;
  message?: string;
} {
  // Check for database errors if context includes database information
  if (context?.database) {
    const { database } = context;
    const dbError = categorizeDatabaseError(error, database.operation, database.table);
    
    return {
      type: dbError.type,
      code: dbError.code,
      message: dbError.message
    };
  }
  
  // If it's a string, check against database error patterns
  if (typeof error === 'string') {
    for (const { pattern, type, code } of DATABASE_ERROR_PATTERNS) {
      if (pattern.test(error)) {
        return { type, code };
      }
    }
  }
  
  // If it's an Error object, check the message
  if (error instanceof Error) {
    for (const { pattern, type, code } of DATABASE_ERROR_PATTERNS) {
      if (pattern.test(error.message)) {
        return { type, code };
      }
    }
  }
  
  // Default to unknown error
  return { type: BusinessProfileErrorType.UNKNOWN };
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
  options: BusinessProfileErrorOptions = {}
): ApiResponse<T> {
  const {
    logError = true,
    includeTechnicalDetails = false,
    user,
    businessId,
    businessName,
    additionalInfo
  } = options;
  
  // Create standardized error context
  const errorContextOptions: ErrorContextOptions = {
    functionName: options.context?.functionName || 'createBusinessProfileError',
    component: options.context?.component || 'BusinessProfileErrorUtils',
    user,
    businessId,
    businessName,
    info: {
      ...options.context?.info,
      ...additionalInfo
    }
  };
  
  const context = options.context ? 
    { ...createErrorContext(errorContextOptions), ...options.context } : 
    createErrorContext(errorContextOptions);
  
  // Categorize the error
  const standardError = categorizeError(error, context);
  
  // Detect business profile error details
  const errorDetails = detectBusinessProfileError(error, context);
  
  // Allow overriding the error type for specialized handlers
  let businessErrorType: BusinessProfileErrorType;
  
  if (options.overrideErrorType) {
    // Use the explicitly specified error type
    businessErrorType = options.overrideErrorType;
  } else if (errorDetails.type !== BusinessProfileErrorType.UNKNOWN) {
    // Use the detected error type from patterns
    businessErrorType = errorDetails.type;
  } else {
    // Fall back to standard category mapping
    businessErrorType = errorCategoryToBusinessType[standardError.category] || BusinessProfileErrorType.UNKNOWN;
  }
  
  // Get user-friendly message
  const userMessage = errorDetails.message || businessErrorMessages[businessErrorType];
  
  // Log the error if requested
  if (logError) {
    console.error(
      `[${context.component}] ${context.functionName} - ${businessErrorType} [${context.operationId}]:`, 
      standardError.message,
      includeTechnicalDetails ? standardError : undefined
    );
  }
  
  // Create the error response
  const response: ApiResponse<T> & { 
    businessErrorType?: BusinessProfileErrorType; 
    operationId?: string;
    errorCode?: string; 
  } = {
    success: false,
    error: userMessage,
    errorCategory: standardError.category,
    businessErrorType: businessErrorType,
    operationId: context.operationId, // Include operation ID for tracing
    ...(errorDetails.code && { errorCode: errorDetails.code }) // Include error code if available
  };
  
  // Include technical details if requested
  if (includeTechnicalDetails) {
    response.errorDetails = {
      originalMessage: standardError.message,
      ...(standardError.code && { code: standardError.code }),
      ...(standardError.statusCode && { statusCode: standardError.statusCode }),
      context: standardError.context
    };
  }
  
  // Add validation details for validation errors
  if (businessErrorType === BusinessProfileErrorType.VALIDATION) {
    response.errorDetails = {
      ...response.errorDetails,
      validation: formatValidationError(error)
    };
  }
  
  // Add database error details
  if (businessErrorType === BusinessProfileErrorType.DATABASE_ERROR || 
      businessErrorType === BusinessProfileErrorType.DATA_INTEGRITY_ERROR ||
      businessErrorType === BusinessProfileErrorType.CONFLICT) {
    response.errorDetails = {
      ...response.errorDetails,
      database: context.database
    };
  }
  
  return response;
}

// Export error handling functions from errorHandlers.ts
export * from './errorHandlers';

/**
 * Specialized error handlers for common business profile operations
 */

/**
 * Handle resource not found errors for business profile resources
 * 
 * @param resourceType - Type of resource that was not found (e.g., 'Business profile', 'User')
 * @param resourceId - ID of the resource that wasn't found
 * @param options - Error handling options
 * @returns Standardized not found error response
 */
export function handleResourceNotFound<T>(
  resourceType: string,
  resourceId?: string,
  options: BusinessProfileErrorOptions = {}
): ApiResponse<T> {
  const context = createOperationContext(options);
  
  return createNotFoundError<T>(resourceType, resourceId, {
    ...options,
    context
  });
}

/**
 * Handle validation errors for business profile operations
 * 
 * @param validationError - The validation error
 * @param options - Error handling options
 * @returns Standardized validation error response
 */
export function handleValidationError<T>(
  validationError: unknown,
  options: BusinessProfileErrorOptions = {}
): ApiResponse<T> {
  const context = createOperationContext(options);
  
  // Set error type to VALIDATION_ERROR explicitly
  return createBusinessProfileError<T>(validationError, {
    ...options,
    context,
    // Override any detected error type to ensure it's treated as validation error
    overrideErrorType: BusinessProfileErrorType.VALIDATION_ERROR
  });
}

/**
 * Handle permission errors for business profile operations
 * 
 * @param message - Custom permission denied message
 * @param options - Error handling options
 * @returns Standardized permission error response
 */
export function handlePermissionError<T>(
  message: string = 'You do not have permission to perform this operation',
  options: BusinessProfileErrorOptions = {}
): ApiResponse<T> {
  const context = createOperationContext(options);
  
  // Create a permission error
  const error = new Error(message);
  
  return createBusinessProfileError<T>(error, {
    ...options,
    context,
    overrideErrorType: BusinessProfileErrorType.AUTHORIZATION_ERROR
  });
}

/**
 * Create a consistent operation context for both success and error scenarios
 * 
 * @param options - Options for creating the operation context
 * @returns Standardized business profile operation context
 */
export function createOperationContext(options: BusinessProfileErrorOptions = {}): BusinessProfileErrorContext {
  const contextOptions: ErrorContextOptions = {
    functionName: options.context?.functionName,
    component: options.context?.component || 'BusinessProfileService',
    user: options.user,
    businessId: options.businessId,
    businessName: options.businessName,
    info: options.additionalInfo
  };
  
  return options.context ? 
    { ...createErrorContext(contextOptions), ...options.context } : 
    createErrorContext(contextOptions);
}

/**
 * Try-catch wrapper for business profile operations
 * 
 * Enhanced version with support for different operation types and better
 * error handling customization.
 * 
 * @param operation - The operation to execute
 * @param options - Error handling options
 * @returns The result of the operation or an error response
 */
export async function tryBusinessOperation<T>(
  operation: () => Promise<ApiResponse<T>> | Promise<T>,
  options: BusinessProfileErrorOptions = {}
): Promise<ApiResponse<T>> {
  // Create standard context for the operation
  const context = createOperationContext(options);
  
  try {
    // Execute the operation
    const result = await operation();
    
    // Check if result is already an ApiResponse or needs to be wrapped
    const apiResponse = isApiResponse(result) ? 
      result : 
      { success: true, data: result };
    
    // Add operation ID to successful responses for tracing
    if (apiResponse.success) {
      (apiResponse as ApiResponse<T> & { operationId?: string }).operationId = context.operationId;
    }
    
    return apiResponse;
  } catch (error) {
    // Create error response
    return createBusinessProfileError<T>(error, {
      ...options,
      context
    });
  }
}

/**
 * Type guard to check if a result is already an ApiResponse
 */
function isApiResponse<T>(result: unknown): result is ApiResponse<T> {
  return (
    typeof result === 'object' &&
    result !== null &&
    'success' in result &&
    typeof (result as ApiResponse<T>).success === 'boolean'
  );
}
