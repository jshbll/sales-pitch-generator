/**
 * Standard Error Handler
 * 
 * Provides standardized error handling for the Business Profile Service.
 * This module ensures that all error handling across the service follows the same
 * patterns, includes consistent context information, and provides user-friendly
 * error messages.
 * 
 * @version 2.0.0
 * @author JaxSaver Team
 */

import { ApiResponse } from '../../../types';
import { User } from '../../../types/user';
import { 
  BusinessProfileErrorType, 
  BusinessProfileErrorCode
} from './errorTypes';

/**
 * Interface for Business Profile Error structure
 */
export interface BusinessProfileError {
  type: BusinessProfileErrorType;
  code?: BusinessProfileErrorCode;
  message: string;
  context?: Record<string, unknown>;
  details?: Record<string, unknown>;
  timestamp?: string;
  stack?: string;
}
import { 
  StandardErrorContext,
  createStandardErrorContext, 
  getUserFacingErrorContext,
  determineErrorType
} from './standardErrorContext';
import { getBusinessErrorMessage } from './errorMessageProvider';
import businessProfileLogger from './businessProfileLogger';
import logCorrelationService from './logCorrelationService';
import { isDevelopmentEnv } from '../../../utils/environmentUtils';

/**
 * Options for the standardized business operation try/catch wrapper
 */
interface StandardBusinessOperationOptions {
  /** The function or method name where the operation occurs */
  functionName: string;
  /** The component or service where the operation occurs (defaults to 'BusinessProfileService') */
  component?: string;
  /** The user who triggered the operation (if available) */
  user?: Partial<User> | null;
  /** The business being operated on (if available) */
  businessId?: string;
  /** The API endpoint being called (if applicable) */
  endpoint?: string;
  /** The HTTP method used (if applicable) */
  method?: string;
  /** The operation being performed */
  operation?: 'create' | 'read' | 'update' | 'delete' | 'validate' | 'process';
  /** The resource being operated on */
  resource?: string;
  /** Whether to include technical details (for development) */
  includeTechnicalDetails?: boolean;
  /** Additional context information */
  additionalInfo?: Record<string, unknown>;
}

/**
 * Try a business operation with standardized error handling
 * 
 * @param operation - The business operation to try
 * @param options - The operation options for context
 * @returns An API response with the operation result or error details
 */
async function tryStandardBusinessOperation<T>(
  operation: () => Promise<T> | Promise<ApiResponse<T>>,
  options: StandardBusinessOperationOptions
): Promise<ApiResponse<T>> {
  // Create standardized error context
  const context = createStandardErrorContext({
    functionName: options.functionName,
    component: options.component,
    user: options.user,
    businessId: options.businessId,
    endpoint: options.endpoint,
    method: options.method,
    operation: options.operation,
    resource: options.resource,
    includeTechnicalDetails: options.includeTechnicalDetails,
    additionalInfo: options.additionalInfo
  });
  
  // Create correlation ID for tracking related logs
  const correlationId = logCorrelationService.startCorrelation(options.functionName, {
    businessId: options.businessId,
    userId: options.user?.id,
    userRole: options.user?.role,
    operation: options.operation,
    resource: options.resource,
    endpoint: options.endpoint
  });
  
  // Track operation start time for performance logging
  const startTime = Date.now();
  
  // Log operation start with context
  businessProfileLogger.logOperationStart(options.functionName, {
    correlationId,
    businessId: options.businessId,
    userId: options.user?.id,
    component: options.component || 'BusinessProfileService'
  });
  
  try {
    // Execute the operation
    const result = await operation();
    
    // Calculate operation duration
    const durationMs = Date.now() - startTime;
    
    // Log success with correlation ID
    businessProfileLogger.logOperationSuccess(
      options.functionName,
      correlationId,
      startTime,
      { businessId: options.businessId, userId: options.user?.id }
    );
    
    // Add correlation info to log service
    logCorrelationService.logSuccess(options.functionName, correlationId, {
      durationMs,
      businessId: options.businessId,
      userId: options.user?.id
    });
    
    // Check if the result is already an ApiResponse
    if (isApiResponse(result)) {
      return result;
    }
    
    // Wrap the result in a success response
    return {
      success: true,
      data: result
    };
  } catch (error) {
    // Calculate operation duration even for errors
    const durationMs = Date.now() - startTime;
    
    // Add correlation info to log service for error case
    logCorrelationService.logError(options.functionName, correlationId, {
      durationMs,
      errorType: determineErrorType(error, context),
      errorMessage: error instanceof Error ? error.message : String(error),
      businessId: options.businessId,
      userId: options.user?.id
    });
    
    // Handle the error and return a standardized error response
    return handleStandardBusinessError(error, context, correlationId);
  }
}

/**
 * Handle business errors in a standardized way
 * 
 * @param error - The error to handle
 * @param context - The error context
 * @param correlationId - Optional correlation ID for linking related logs
 * @returns A standardized API response with error details
 */
function handleStandardBusinessError<T>(
  error: unknown,
  context: StandardErrorContext,
  correlationId?: string
): ApiResponse<T> {
  // Determine the error type
  const errorType = determineErrorType(error, context);
  
  // Update context with error type
  const updatedContext = {
    ...context,
    errorType
  };
  
  // Convert to a BusinessProfileError
  const businessError = convertToBusinessProfileError(error, updatedContext);
  
  // Extract error message for logging
  const errorMessage = businessError.message || 
    (error instanceof Error ? error.message : String(error));
  
  // Log the error with enhanced context using businessProfileLogger
  businessProfileLogger.logOperationError(
    context.functionName || 'handleStandardBusinessError',
    errorMessage,
    businessError.type,
    correlationId,
    {
      errorCode: businessError.code,
      userId: context.user?.id,  // Get userId from user object
      businessId: context.businessId,
      component: context.component,
      operation: context.operation,
      stack: isDevelopmentEnv() ? (error instanceof Error ? error.stack : undefined) : undefined
    }
  );
  
  // Get user-friendly error message
  const userFriendlyMessage = getBusinessErrorMessage(businessError);
  
  // Get user-facing context (sanitized)
  const userFacingContext = getUserFacingErrorContext(updatedContext);
  
  // Create standardized API response
  const errorResponse: ApiResponse<T> = {
    success: false,
    error: userFriendlyMessage.message,
    errorType: businessError.type,
    errorCode: businessError.code,
    suggestion: userFriendlyMessage.suggestion,
    userResolvable: userFriendlyMessage.userResolvable,
    details: {
      ...userFacingContext,
      ...(userFriendlyMessage.helpLinks ? { helpLinks: userFriendlyMessage.helpLinks } : {})
    }
  };
  
  // In development mode, include correlation ID for debugging
  if (isDevelopmentEnv() && correlationId) {
    errorResponse.correlationId = correlationId;
    
    // Add correlation trail in development for easier debugging
    const correlationTrail = logCorrelationService.getCorrelationTrail(correlationId);
    if (correlationTrail) {
      errorResponse.details = errorResponse.details || {};
      errorResponse.details.correlationTrail = correlationTrail;
    }
  }
  
  return errorResponse;
}

/**
 * Convert an unknown error to a BusinessProfileError
 * 
 * @param error - The error to convert
 * @param context - The error context
 * @returns A BusinessProfileError
 */
function convertToBusinessProfileError(
  error: unknown,
  context: StandardErrorContext
): BusinessProfileError {
  // If it's already a BusinessProfileError, return it
  if (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    // Create a more specific type for the check
    Object.values(BusinessProfileErrorType).includes((error as { type: BusinessProfileErrorType }).type)
  ) {
    return error as BusinessProfileError;
  }
  
  // Extract message from error
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Determine appropriate error code
  let errorCode: BusinessProfileErrorCode | undefined;
  
  // Map error type to default error code
  switch (context.errorType) {
    case BusinessProfileErrorType.NOT_FOUND_ERROR:
      errorCode = context.resource === 'business' 
        ? BusinessProfileErrorCode.BUSINESS_NOT_FOUND 
        : BusinessProfileErrorCode.RESOURCE_NOT_FOUND;
      break;
    case BusinessProfileErrorType.VALIDATION_ERROR:
      errorCode = BusinessProfileErrorCode.INVALID_INPUT;
      break;
    case BusinessProfileErrorType.AUTHENTICATION_ERROR:
      errorCode = BusinessProfileErrorCode.AUTHENTICATION_REQUIRED;
      break;
    case BusinessProfileErrorType.AUTHORIZATION_ERROR:
      errorCode = BusinessProfileErrorCode.UNAUTHORIZED_ACCESS;
      break;
    case BusinessProfileErrorType.API_ERROR:
      errorCode = BusinessProfileErrorCode.API_REQUEST_FAILED;
      break;
    case BusinessProfileErrorType.TIMEOUT_ERROR:
      errorCode = BusinessProfileErrorCode.TIMEOUT;
      break;
    case BusinessProfileErrorType.DATABASE_ERROR:
      errorCode = BusinessProfileErrorCode.DATABASE_QUERY_FAILED;
      break;
    default:
      errorCode = BusinessProfileErrorCode.INTERNAL_SERVER_ERROR;
  }
  
  // Create business profile error
  return {
    message: errorMessage,
    type: context.errorType || BusinessProfileErrorType.INTERNAL_ERROR,
    code: errorCode,
    context: {
      functionName: context.functionName,
      component: context.component,
      businessId: context.businessId,
      resource: context.resource,
      operation: context.operation,
      ...(context.additionalInfo || {})
    },
    stack: error instanceof Error ? error.stack : new Error().stack
  };
}

/**
 * Type guard to check if a result is already an ApiResponse
 * 
 * @param result - The result to check
 * @returns Whether the result is an ApiResponse
 */
function isApiResponse<T>(result: unknown): result is ApiResponse<T> {
  return (
    typeof result === 'object' &&
    result !== null &&
    'success' in result &&
    typeof (result as ApiResponse<T>).success === 'boolean'
  );
}

/**
 * Create a standardized business profile error
 * 
 * @param type - The error type
 * @param message - The error message
 * @param code - Optional error code
 * @param context - Optional context information
 * @returns A BusinessProfileError
 */
function createStandardBusinessError(
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

export type { StandardBusinessOperationOptions };

export {
  tryStandardBusinessOperation,
  handleStandardBusinessError,
  createStandardBusinessError
};
