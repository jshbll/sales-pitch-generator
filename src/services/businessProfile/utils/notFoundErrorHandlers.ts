/**
 * Not Found Error Handlers
 * 
 * Provides specialized error handling functions for not found errors
 * in the Business Profile Service.
 */

import { ApiResponse } from '../../../types';
import { User } from '../../../types/user';
import { BusinessProfileErrorType, BusinessProfileErrorCode } from './errorTypes';
import { BusinessProfileErrorContext, createErrorContext } from './errorContext';
import errorMonitoring from './errorMonitoring';
import logger from './loggerService';

/**
 * Error handling options
 */
export interface NotFoundErrorOptions {
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
 * Create a not found error response
 * 
 * @param resourceType - The type of resource that was not found
 * @param resourceId - The ID of the resource that was not found
 * @param options - Error handling options
 * @returns Formatted error response
 */
export function createNotFoundError<T>(
  resourceType: string,
  resourceId?: string,
  options: NotFoundErrorOptions = {}
): ApiResponse<T> {
  const { 
    context: baseContext, 
    user, 
    businessId, 
    businessName, 
    additionalInfo 
  } = options;
  
  // Create error context
  const context = baseContext || createErrorContext({
    functionName: 'createNotFoundError',
    component: 'BusinessProfileService',
    user,
    businessId,
    businessName,
    info: {
      resourceType,
      resourceId,
      ...additionalInfo
    }
  });
  
  // Format resource ID message part
  const idPart = resourceId ? ` with ID '${resourceId}'` : '';
  
  // Create error message
  const errorMessage = `The requested ${resourceType}${idPart} could not be found`;
  
  // Determine specific error code based on resource type
  let errorCode = BusinessProfileErrorCode.RESOURCE_NOT_FOUND;
  if (resourceType.toLowerCase().includes('business')) {
    errorCode = BusinessProfileErrorCode.BUSINESS_NOT_FOUND;
  } else if (resourceType.toLowerCase().includes('user')) {
    errorCode = BusinessProfileErrorCode.USER_NOT_FOUND;
  } else if (resourceType.toLowerCase().includes('category')) {
    errorCode = BusinessProfileErrorCode.CATEGORY_NOT_FOUND;
  }
  
  // Log the error
  logger.warn('Resource not found', {
    ...context,
    errorType: BusinessProfileErrorType.NOT_FOUND_ERROR,
    errorCode,
    errorMessage,
    resourceType,
    resourceId
  });
  
  // Track the not found event
  errorMonitoring.trackEvent('resource_not_found', {
    context,
    resourceType,
    resourceId,
    errorCode
  });
  
  // Return a standardized error response
  return {
    success: false,
    error: errorMessage,
    errorType: BusinessProfileErrorType.NOT_FOUND_ERROR,
    errorCode,
    errorContext: {
      requestId: context.operationId,
      timestamp: context.timestamp,
      component: context.component,
      function: context.functionName,
      resourceType,
      resourceId
    },
    status: 404
  };
}

/**
 * Create a business not found error response
 * 
 * @param businessId - The ID of the business that was not found
 * @param options - Error handling options
 * @returns Formatted error response
 */
export function createBusinessNotFoundError<T>(
  businessId: string,
  options: NotFoundErrorOptions = {}
): ApiResponse<T> {
  return createNotFoundError<T>('business profile', businessId, {
    ...options,
    businessId
  });
}

/**
 * Create a user not found error response
 * 
 * @param userId - The ID of the user that was not found
 * @param options - Error handling options
 * @returns Formatted error response
 */
export function createUserNotFoundError<T>(
  userId: string,
  options: NotFoundErrorOptions = {}
): ApiResponse<T> {
  return createNotFoundError<T>('user', userId, {
    ...options,
    user: {
      id: userId,
      role: undefined
    } as User
  });
}
