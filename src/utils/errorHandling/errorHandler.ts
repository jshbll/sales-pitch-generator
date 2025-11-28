/**
 * Error Handler Utility
 * 
 * A centralized utility for handling errors consistently across the application.
 * This includes error categorization, formatting, and user-friendly messages.
 * 
 * @version 2.0.0
 * @author JaxSaver Team
 */

import { ApiResponse } from '../../types';
import { ErrorCategory, StandardError } from './errorTypes';
import { getErrorConfig } from './errorConfig';

// Re-export types and functions for convenience
export * from './errorTypes';
export * from './errorConfig';
export * from './retryUtils';

/**
 * Detect the error category based on the error message
 * 
 * @param message - The error message to analyze
 * @returns The detected error category
 */
function detectErrorCategory(message: string): ErrorCategory {
  const config = getErrorConfig();
  const lowerMessage = message.toLowerCase();
  
  // Check each category's patterns
  for (const [category, patterns] of Object.entries(config.patterns)) {
    if (patterns) {
      for (const pattern of patterns) {
        if (pattern.test(lowerMessage)) {
          return category as ErrorCategory;
        }
      }
    }
  }
  
  // Default to unknown if no patterns match
  return ErrorCategory.UNKNOWN;
}

/**
 * Get the error category from an HTTP status code
 * 
 * @param statusCode - The HTTP status code
 * @returns The corresponding error category
 */
function getErrorCategoryFromStatusCode(statusCode: number): ErrorCategory {
  const config = getErrorConfig();
  return config.statusCodeMapping[statusCode] || ErrorCategory.UNKNOWN;
}

/**
 * Categorize an error based on its characteristics
 * 
 * @param error - The error to categorize
 * @param context - Optional context information about where the error occurred
 * @returns A standardized error object
 */
export function categorizeError(error: unknown, context?: {
  functionName?: string;
  component?: string;
  info?: Record<string, unknown>;
}): StandardError {
  const config = getErrorConfig();
  const timestamp = Date.now();
  
  // Handle string errors
  if (typeof error === 'string') {
    const category = detectErrorCategory(error);
    return {
      message: error,
      category,
      context: context ? { ...context, timestamp } : { timestamp },
      processed: true
    };
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    const category = detectErrorCategory(error.message);
    return {
      message: error.message,
      category,
      originalError: error,
      stack: config.includeStackTraces ? error.stack : undefined,
      context: context ? { ...context, timestamp } : { timestamp },
      processed: true
    };
  }
  
  // Handle API response errors
  if (typeof error === 'object' && error !== null) {
    // Check if it's an API response with error
    if ('success' in error && !error.success && 'error' in error) {
      const apiError = error as { success: false; error: unknown; statusCode?: number };
      const errorMessage = typeof apiError.error === 'string' 
        ? apiError.error 
        : 'API request failed';
      
      const category = apiError.statusCode 
        ? getErrorCategoryFromStatusCode(apiError.statusCode) 
        : detectErrorCategory(errorMessage);
      
      return {
        message: errorMessage,
        category,
        originalError: error,
        statusCode: apiError.statusCode,
        context: context ? { ...context, timestamp } : { timestamp },
        processed: true
      };
    }
    
    // Handle axios or fetch error objects
    if ('status' in error || 'statusCode' in error || 'response' in error) {
      const statusCode = 
        'status' in error ? (error as { status: number }).status :
        'statusCode' in error ? (error as { statusCode: number }).statusCode :
        'response' in error && typeof error.response === 'object' && error.response !== null && 'status' in error.response ? 
          (error.response as { status: number }).status : undefined;
      
      const errorMessage = 
        'message' in error ? (error as { message: string }).message :
        'response' in error && typeof error.response === 'object' && error.response !== null && 
        'data' in error.response && typeof error.response.data === 'object' && 
        error.response.data !== null && 'message' in error.response.data ?
          String((error.response.data as { message: string }).message) : 'Request failed';
      
      const category = statusCode 
        ? getErrorCategoryFromStatusCode(statusCode) 
        : detectErrorCategory(errorMessage);
      
      return {
        message: errorMessage,
        category,
        originalError: error,
        statusCode,
        context: context ? { ...context, timestamp } : { timestamp },
        processed: true
      };
    }
  }
  
  // Handle unknown errors
  return {
    message: 'An unknown error occurred',
    category: ErrorCategory.UNKNOWN,
    originalError: error,
    context: context ? { ...context, timestamp } : { timestamp },
    processed: true
  };
}

/**
 * Format an API error response
 * 
 * @param error - The error to format
 * @param context - Optional context information
 * @returns A formatted API response with error details
 */
export function formatApiError<T>(error: unknown, context?: {
  functionName?: string;
  component?: string;
  info?: Record<string, unknown>;
}): ApiResponse<T> {
  const standardError = categorizeError(error, context);
  const config = getErrorConfig();
  
  // Use default message if available for this category
  const userMessage = config.defaultMessages[standardError.category] || standardError.message;
  
  return {
    success: false,
    error: userMessage,
    errorDetails: {
      category: standardError.category,
      originalMessage: standardError.message,
      ...(standardError.code && { code: standardError.code }),
      ...(standardError.statusCode && { statusCode: standardError.statusCode }),
      ...(config.includeStackTraces && standardError.stack && { stack: standardError.stack }),
      context: standardError.context
    }
  };
}

/**
 * Handle errors in try/catch blocks
 * 
 * @param error - The caught error
 * @param options - Options for error handling
 * @returns A formatted error response
 */
export function handleCatchError<T>(error: unknown, options?: {
  context?: {
    functionName?: string;
    component?: string;
    info?: Record<string, unknown>;
  };
  logError?: boolean;
  rethrow?: boolean;
}): ApiResponse<T> {
  const context = options?.context;
  const logError = options?.logError ?? true;
  
  // Format the error as an API response
  const errorResponse = formatApiError<T>(error, context);
  
  // Log the error if requested
  if (logError) {
    console.error(
      `Error in ${context?.functionName || 'unknown function'}:`, 
      errorResponse.errorDetails
    );
  }
  
  // Rethrow if requested
  if (options?.rethrow) {
    throw error;
  }
  
  return errorResponse;
}
