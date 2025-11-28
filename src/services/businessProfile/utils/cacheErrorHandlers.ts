/**
 * Cache Error Handlers
 * 
 * Provides specialized error handling functions for cache operations
 * in the Business Profile Service.
 */

import { ApiResponse } from '../../../types';
import { User } from '../../../types/user';
import { BusinessProfileErrorType, BusinessProfileErrorCode, businessErrorMessages } from './errorTypes';
import { BusinessProfileErrorContext, createErrorContext } from './errorContext';
import { categorizeError } from './errorCategorization';
import errorMonitoring from './errorMonitoring';
import logger from './loggerService';

/**
 * Error handling options
 */
export interface CacheErrorOptions {
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
 * Handle cache errors for business profile operations
 * 
 * @param error - Error to handle
 * @param options - Error handling options
 * @returns Formatted error response
 */
export function handleCacheError<T>(
  error: unknown,
  options: CacheErrorOptions = {}
): ApiResponse<T> {
  const { context: baseContext, user, businessId, businessName, additionalInfo } = options;
  
  // Create error context
  const context = baseContext || createErrorContext({
    functionName: 'handleCacheError',
    component: 'CacheService',
    user,
    businessId,
    businessName,
    info: additionalInfo
  });
  
  // Create cache error
  if (error instanceof Error) {
    // Determine error type and code
    const errorType = BusinessProfileErrorType.CACHE_ERROR;
    const errorCode = determineCacheErrorCode(error);
    
    // Log the error (but only as a warning since cache errors are typically recoverable)
    logger.warn('Cache error', {
      ...context,
      errorType,
      errorCode,
      errorMessage: error.message,
      stack: error.stack,
    });
    
    // Track the error in monitoring
    errorMonitoring.trackError(error, {
      context,
      category: 'cache',
      type: errorType,
      code: errorCode,
      severity: 'warning' // Cache errors are typically non-critical
    });
    
    // Return a standardized error response
    return {
      success: false,
      error: getCacheErrorMessage(errorCode, error.message),
      errorType,
      errorCode,
      errorContext: {
        requestId: context.operationId,
        timestamp: context.timestamp,
        component: context.component,
        function: context.functionName
      },
      // Cache errors are typically retriable
      retriable: true
    };
  }
  
  // For non-Error objects, create a generic error
  const genericError = new Error(
    typeof error === 'string' ? error : 'An error occurred while accessing the cache'
  );
  return handleCacheError<T>(genericError, options);
}

/**
 * Determine the appropriate error code for a cache error
 * 
 * @param error - The cache error
 * @returns The appropriate error code
 */
function determineCacheErrorCode(error: Error): BusinessProfileErrorCode {
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('not found') || errorMessage.includes('miss')) {
    return BusinessProfileErrorCode.CACHE_RETRIEVAL_ERROR;
  } else if (errorMessage.includes('set') || errorMessage.includes('write') || 
             errorMessage.includes('save') || errorMessage.includes('store')) {
    return BusinessProfileErrorCode.CACHE_STORAGE_ERROR;
  } else {
    return BusinessProfileErrorCode.CACHE_RETRIEVAL_ERROR;
  }
}

/**
 * Get a user-friendly cache error message
 * 
 * @param errorCode - Business profile error code
 * @param fallbackMessage - Fallback message if no user-friendly message is found
 * @returns User-friendly error message
 */
function getCacheErrorMessage(
  errorCode: BusinessProfileErrorCode, 
  fallbackMessage: string
): string {
  switch (errorCode) {
    case BusinessProfileErrorCode.CACHE_RETRIEVAL_ERROR:
      return 'Unable to retrieve data from cache. Trying alternative source.';
    case BusinessProfileErrorCode.CACHE_STORAGE_ERROR:
      return 'Unable to store data in cache. This won\'t affect your current operation.';
    default:
      return fallbackMessage;
  }
}
