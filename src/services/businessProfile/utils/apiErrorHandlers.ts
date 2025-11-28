/**
 * API Error Handlers
 * 
 * Provides specialized error handling functions for API operations
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
export interface ApiErrorOptions {
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
 * Handle API errors for business profile operations
 * 
 * @param error - Error to handle
 * @param options - Error handling options
 * @returns Formatted error response
 */
export function handleBusinessProfileApiError<T>(
  error: unknown,
  options: ApiErrorOptions = {}
): ApiResponse<T> {
  const { context: baseContext, user, businessId, businessName, additionalInfo } = options;
  
  // Create error context
  const context = baseContext || createErrorContext({
    functionName: 'handleBusinessProfileApiError',
    component: 'ApiService',
    user,
    businessId,
    businessName,
    info: additionalInfo
  });
  
  // Create API error
  if (error instanceof Error) {
    // Categorize the error
    const errorType = categorizeError(error);
    const errorCode = getApiErrorCode(errorType);
    
    // Log the error
    logger.error('API error', {
      ...context,
      errorType,
      errorCode,
      errorMessage: error.message,
      stack: error.stack,
    });
    
    // Track the error in monitoring
    errorMonitoring.trackError(error, {
      context,
      category: 'api',
      type: errorType,
      code: errorCode
    });
    
    // Return a standardized error response
    return {
      success: false,
      error: getUserFriendlyMessage(errorType, error.message),
      errorType,
      errorCode,
      errorContext: {
        requestId: context.operationId,
        timestamp: context.timestamp,
        component: context.component,
        function: context.functionName
      }
    };
  }
  
  // For non-Error objects, create a generic error
  const genericError = new Error(typeof error === 'string' ? error : 'Unknown API error');
  return handleBusinessProfileApiError<T>(genericError, options);
}

/**
 * Get an appropriate error code for the given error type
 * 
 * @param errorType - Business profile error type
 * @returns Business profile error code
 */
function getApiErrorCode(errorType: BusinessProfileErrorType): BusinessProfileErrorCode {
  switch (errorType) {
    case BusinessProfileErrorType.VALIDATION_ERROR:
      return BusinessProfileErrorCode.INVALID_INPUT;
    case BusinessProfileErrorType.AUTHENTICATION_ERROR:
      return BusinessProfileErrorCode.AUTHENTICATION_REQUIRED;
    case BusinessProfileErrorType.AUTHORIZATION_ERROR:
      return BusinessProfileErrorCode.UNAUTHORIZED_ACCESS;
    case BusinessProfileErrorType.NOT_FOUND_ERROR:
      return BusinessProfileErrorCode.RESOURCE_NOT_FOUND;
    case BusinessProfileErrorType.API_ERROR:
      return BusinessProfileErrorCode.API_REQUEST_FAILED;
    default:
      return BusinessProfileErrorCode.API_RESPONSE_ERROR;
  }
}

/**
 * Get a user-friendly error message
 * 
 * @param errorType - Business profile error type
 * @param fallbackMessage - Fallback message if no user-friendly message is found
 * @returns User-friendly error message
 */
function getUserFriendlyMessage(errorType: BusinessProfileErrorType, fallbackMessage: string): string {
  return businessErrorMessages[errorType] || fallbackMessage;
}
