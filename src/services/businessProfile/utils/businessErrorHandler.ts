/**
 * Business Error Handler
 * 
 * A specialized error handler for the Business Profile Service that integrates
 * with the centralized error handling system and provides user-friendly messages.
 * 
 * Features:
 * - Wraps business operations with standardized error handling
 * - Categorizes and formats business-specific errors
 * - Provides user-friendly error messages with recovery instructions
 * - Supports logging and monitoring for business errors
 * 
 * @version 1.0.0
 * @author JaxSaver Team
 */

import { ApiResponse } from '../../../types';
import { 
  BusinessProfileError, 
  BusinessProfileErrorType, 
  BusinessProfileErrorCode 
} from './errorTypes';
import { getBusinessErrorMessage } from './errorMessageProvider';
import { categorizeError, formatApiError } from '../../../utils/errorHandling/errorHandler';
import logger from '../../../utils/logger';

/**
 * Context information for business operations
 */
export interface BusinessOperationContext {
  /** The function or method name */
  functionName?: string;
  /** The component or module name */
  component?: string;
  /** Additional context information */
  info?: Record<string, unknown>;
  /** The business ID being operated on */
  businessId?: string;
  /** The user ID performing the operation */
  userId?: string;
  /** The specific resource being accessed */
  resource?: string;
  /** The operation being performed (create, read, update, delete) */
  operation?: 'create' | 'read' | 'update' | 'delete';
}

/**
 * Try a business operation with standardized error handling
 * 
 * @param operation - The business operation to try
 * @param context - Context information for error handling
 * @returns ApiResponse with the operation result or error
 */
export async function tryBusinessOperation<T>(
  operation: () => Promise<T>,
  context: BusinessOperationContext
): Promise<ApiResponse<T>> {
  try {
    const result = await operation();
    
    // Log successful operation
    logger.info(`Business operation successful: ${context.functionName || 'unknown'}`, {
      component: context.component || 'BusinessProfileService',
      businessId: context.businessId,
      userId: context.userId,
      operation: context.operation
    });
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    // Get standardized error with category
    const standardError = categorizeError(error, {
      functionName: context.functionName,
      component: context.component || 'BusinessProfileService',
      info: context.info
    });
    
    // Convert to business profile error
    const businessError = convertToBusinessError(standardError, context);
    
    // Get user-friendly error message
    const userFriendlyMessage = getBusinessErrorMessage(businessError);
    
    // Log error with context
    logger.error(`Business operation failed: ${context.functionName || 'unknown'}`, {
      error: businessError,
      message: businessError.message,
      errorType: businessError.type,
      errorCode: businessError.code,
      businessId: context.businessId,
      userId: context.userId,
      operation: context.operation,
      stack: businessError.stack
    });
    
    // Return formatted API response
    return {
      success: false,
      error: userFriendlyMessage.message,
      errorCode: businessError.code,
      errorType: businessError.type,
      suggestion: userFriendlyMessage.suggestion,
      userResolvable: userFriendlyMessage.userResolvable,
      details: {
        ...businessError.context,
        helpLinks: userFriendlyMessage.helpLinks
      }
    };
  }
}

/**
 * Convert a standard error to a business profile error
 * 
 * @param error - The standard error to convert
 * @param context - Business operation context
 * @returns A business profile error
 */
function convertToBusinessError(
  error: unknown,
  context: BusinessOperationContext
): BusinessProfileError {
  // If already a BusinessProfileError, use it directly
  if (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    Object.values(BusinessProfileErrorType).includes((error as any).type)
  ) {
    return error as BusinessProfileError;
  }
  
  // Convert standard error to business error
  const standardError = error as {
    message: string;
    category: string;
    code?: string;
    statusCode?: number;
    context?: Record<string, unknown>;
    stack?: string;
  };
  
  // Map standard error category to business error type
  let errorType: BusinessProfileErrorType;
  switch (standardError.category) {
    case 'VALIDATION':
      errorType = BusinessProfileErrorType.VALIDATION_ERROR;
      break;
    case 'AUTHENTICATION':
      errorType = BusinessProfileErrorType.AUTHENTICATION_ERROR;
      break;
    case 'AUTHORIZATION':
      errorType = BusinessProfileErrorType.AUTHORIZATION_ERROR;
      break;
    case 'NOT_FOUND':
      errorType = BusinessProfileErrorType.NOT_FOUND_ERROR;
      break;
    case 'NETWORK':
      errorType = BusinessProfileErrorType.API_ERROR;
      break;
    case 'TIMEOUT':
      errorType = BusinessProfileErrorType.TIMEOUT_ERROR;
      break;
    case 'SERVER':
      errorType = BusinessProfileErrorType.DATABASE_ERROR; // Most server errors are DB-related
      break;
    default:
      errorType = BusinessProfileErrorType.INTERNAL_ERROR;
  }
  
  // Determine error code based on context
  let errorCode: BusinessProfileErrorCode | undefined;
  
  // Map standard error code to business error code if present
  if (standardError.code) {
    // Generic mapping strategy:
    if (standardError.code.includes('NOT_FOUND')) {
      errorCode = BusinessProfileErrorCode.RESOURCE_NOT_FOUND;
    } else if (standardError.code.includes('AUTH')) {
      errorCode = BusinessProfileErrorCode.NOT_AUTHENTICATED;
    } else if (standardError.code.includes('PERMISSION')) {
      errorCode = BusinessProfileErrorCode.NOT_AUTHORIZED;
    } else if (standardError.code.includes('VALIDATION')) {
      errorCode = BusinessProfileErrorCode.INVALID_INPUT;
    } else if (standardError.code.includes('SERVER')) {
      errorCode = BusinessProfileErrorCode.SERVER_ERROR;
    }
  }
  
  // If no code mapped, use context to determine a more specific code
  if (!errorCode) {
    if (errorType === BusinessProfileErrorType.NOT_FOUND_ERROR) {
      if (context.resource === 'business') {
        errorCode = BusinessProfileErrorCode.BUSINESS_NOT_FOUND;
      } else if (context.resource === 'user') {
        errorCode = BusinessProfileErrorCode.USER_NOT_FOUND;
      } else if (context.resource === 'category') {
        errorCode = BusinessProfileErrorCode.CATEGORY_NOT_FOUND;
      } else {
        errorCode = BusinessProfileErrorCode.RESOURCE_NOT_FOUND;
      }
    } else if (errorType === BusinessProfileErrorType.AUTHENTICATION_ERROR) {
      errorCode = BusinessProfileErrorCode.NOT_AUTHENTICATED;
    } else if (errorType === BusinessProfileErrorType.AUTHORIZATION_ERROR) {
      errorCode = BusinessProfileErrorCode.NOT_AUTHORIZED;
    } else if (errorType === BusinessProfileErrorType.DATABASE_ERROR) {
      errorCode = BusinessProfileErrorCode.DATABASE_ERROR;
    } else {
      // Default code for the error type
      errorCode = BusinessProfileErrorCode.SERVER_ERROR;
    }
  }
  
  // Combine context from standard error and business context
  const combinedContext = {
    ...standardError.context,
    businessId: context.businessId,
    userId: context.userId,
    operation: context.operation,
    resource: context.resource,
    functionName: context.functionName,
    component: context.component
  };
  
  // Create business profile error
  return {
    message: standardError.message,
    type: errorType,
    code: errorCode,
    context: combinedContext,
    stack: standardError.stack
  };
}

/**
 * Create a standardized business error
 * 
 * @param type - The error type
 * @param message - The error message
 * @param code - Optional error code
 * @param context - Optional context information
 * @returns A business profile error
 */
export function createBusinessError(
  type: BusinessProfileErrorType,
  message: string,
  code?: BusinessProfileErrorCode,
  context?: Record<string, unknown>
): BusinessProfileError {
  return {
    type,
    message,
    code,
    context,
    stack: new Error().stack
  };
}

/**
 * Handle a business error and return an API response
 * 
 * @param error - The error to handle
 * @param context - Business operation context
 * @returns An API response with error details
 */
export function handleBusinessError<T>(
  error: unknown,
  context: BusinessOperationContext
): ApiResponse<T> {
  // Convert to business error
  const businessError = convertToBusinessError(error, context);
  
  // Get user-friendly message
  const userFriendlyMessage = getBusinessErrorMessage(businessError);
  
  // Log error
  logger.error(`Business error handled: ${context.functionName || 'unknown'}`, {
    error: businessError,
    message: businessError.message,
    errorType: businessError.type,
    errorCode: businessError.code,
    businessId: context.businessId,
    userId: context.userId,
    operation: context.operation
  });
  
  // Return API response
  return {
    success: false,
    error: userFriendlyMessage.message,
    errorCode: businessError.code,
    errorType: businessError.type,
    suggestion: userFriendlyMessage.suggestion,
    userResolvable: userFriendlyMessage.userResolvable,
    details: {
      ...businessError.context,
      helpLinks: userFriendlyMessage.helpLinks
    }
  };
}
