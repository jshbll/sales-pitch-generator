/**
 * Standard Error Context
 * 
 * Provides standardized error context information for the Business Profile Service.
 * This module ensures that all error handling across the service follows the same
 * patterns and includes consistent context information for better debugging,
 * logging, and user feedback.
 * 
 * @version 1.0.0
 * @author JaxSaver Team
 */

import { User } from '../../../types/user';
import { BusinessProfile } from '../../../types';
import {
  BusinessProfileErrorType,
  BusinessProfileErrorCode
} from './errorTypes';
import logger from '../../../utils/logger';
import { isDevelopmentEnv, isProductionEnv } from '../../../utils/environmentUtils';

// Export interfaces directly at the top level
export interface StandardErrorContext {
  /** The error type */
  errorType?: BusinessProfileErrorType;
  /** The error code */
  errorCode?: BusinessProfileErrorCode;
  /** The function or method name where the error occurred */
  functionName: string;
  /** The component or service where the error occurred */
  component: string;
  /** The user who triggered the operation (if available) */
  user?: Partial<User> | null;
  /** The business being operated on (if available) */
  businessId?: string;
  /** The business name (if available) */
  businessName?: string;
  /** The API endpoint being called (if applicable) */
  endpoint?: string;
  /** The HTTP method used (if applicable) */
  method?: string;
  /** The operation being performed */
  operation?: 'create' | 'read' | 'update' | 'delete' | 'validate' | 'process';
  /** The resource being operated on */
  resource?: string;
  /** The action being performed */
  action?: string;
  /** The timestamp when the error occurred */
  timestamp: string;
  /** The environment where the error occurred */
  environment?: string;
  /** Whether to include technical details in user-facing messages */
  includeTechnicalDetails?: boolean;
  /** Additional context information */
  additionalInfo?: Record<string, unknown>;
  /** Request ID for correlation */
  requestId?: string;
  /** Service version */
  version?: string;
}

export interface StandardErrorContextOptions {
  /** The function or method name where the error occurred */
  functionName: string;
  /** The component or service where the error occurred (defaults to 'BusinessProfileService') */
  component?: string;
  /** The user who triggered the operation (if available) */
  user?: Partial<User> | null;
  /** The business being operated on (if available) */
  businessId?: string;
  /** The business profile (if available) */
  businessProfile?: Partial<BusinessProfile> | null;
  /** The API endpoint being called (if applicable) */
  endpoint?: string;
  /** The HTTP method used (if applicable) */
  method?: string;
  /** The operation being performed */
  operation?: 'create' | 'read' | 'update' | 'delete' | 'validate' | 'process';
  /** The resource being operated on */
  resource?: string;
  /** The action being performed */
  action?: string;
  /** Whether to include technical details in user-facing messages */
  includeTechnicalDetails?: boolean;
  /** Additional context information */
  additionalInfo?: Record<string, unknown>;
  /** Request ID for correlation */
  requestId?: string;
  /** Service version */
  version?: string;
}

/**
 * Create standardized error context for business profile operations
 * 
 * @param options - Options for creating the error context
 * @returns A standard error context object
 */
function createStandardErrorContext(
  options: StandardErrorContextOptions
): StandardErrorContext {
  // Get business name from business profile if available
  const businessName = options.businessProfile?.businessName 
    || options.businessProfile?.name
    || undefined;
    
  // Determine current environment
  const environment = isDevelopmentEnv() ? 'development' : isProductionEnv() ? 'production' : 'test';
  
  // Setup common defaults
  const context: StandardErrorContext = {
    functionName: options.functionName,
    component: options.component || 'BusinessProfileService',
    timestamp: new Date().toISOString(),
    environment,
    includeTechnicalDetails: options.includeTechnicalDetails ?? isDevelopmentEnv(),
    requestId: options.requestId || crypto.randomUUID(), // Use crypto module for UUID instead of custom function
    version: options.version || 'current' // Default to 'current' if APP_VERSION isn't available
  };
  
  // Add optional properties if they exist
  if (options.user) {
    context.user = sanitizeUserForErrorContext(options.user);
  }
  
  if (options.businessId) {
    context.businessId = options.businessId;
  }
  
  if (typeof businessName === 'string') {
    context.businessName = businessName;
  }
  
  if (options.endpoint) {
    context.endpoint = options.endpoint;
  }
  
  if (options.method) {
    context.method = options.method;
  }
  
  if (options.operation) {
    context.operation = options.operation;
  }
  
  if (options.resource) {
    context.resource = options.resource;
  }
  
  if (options.action) {
    context.action = options.action;
  }
  
  if (options.additionalInfo) {
    context.additionalInfo = options.additionalInfo;
  }
  
  return context;
}

/**
 * Sanitize user object for error context to avoid including sensitive information
 * 
 * @param user - The user object to sanitize
 * @returns A sanitized user object safe for error context
 */
function sanitizeUserForErrorContext(user: Partial<User>): Partial<User> {
  if (!user) return {};
  
  // Only include specific fields that are safe for logging
  const sanitizedUser: Partial<User> = {
    id: user.id,
    role: user.role,
    businessId: user.businessId,
  };
  
  // Include authentication status if present (using safer Object.prototype method)
  if (Object.prototype.hasOwnProperty.call(user, 'isAuthenticated')) {
    // Create a type for runtime properties not in the type definition
    interface RuntimeUser extends Partial<User> {
      isAuthenticated?: boolean;
    }
    (sanitizedUser as RuntimeUser).isAuthenticated = (user as RuntimeUser).isAuthenticated;
  }
  
  return sanitizedUser;
}

/**
 * Enhance existing error context with additional information
 * 
 * @param existingContext - The existing error context
 * @param additionalContext - Additional context to add
 * @returns Enhanced error context
 */
function enhanceErrorContext(
  existingContext: StandardErrorContext,
  additionalContext: Partial<StandardErrorContext>
): StandardErrorContext {
  return {
    ...existingContext,
    ...additionalContext,
    // Merge additionalInfo if both objects have it
    additionalInfo: {
      ...(existingContext.additionalInfo || {}),
      ...(additionalContext.additionalInfo || {})
    }
  };
}

/**
 * Log error with standardized context
 * 
 * @param error - The error to log
 * @param context - The error context
 */
function logErrorWithContext(
  error: unknown,
  context: StandardErrorContext
): void {
  // Log based on the determined error type
  const errorType = context.errorType || BusinessProfileErrorType.UNKNOWN_ERROR;
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Include stack trace in development mode
  const errorDetails = {
    ...context,
    stack: isDevelopmentEnv() && error instanceof Error ? error.stack : undefined
  };
  
  // Log at appropriate level based on error type
  switch (errorType) {
    case BusinessProfileErrorType.AUTHENTICATION_ERROR:
    case BusinessProfileErrorType.AUTHORIZATION_ERROR:
    case BusinessProfileErrorType.VALIDATION_ERROR:
    case BusinessProfileErrorType.NOT_FOUND_ERROR:
      logger.warn(`${context.functionName}: ${errorMessage}`, errorDetails);
      break;
    case BusinessProfileErrorType.CRITICAL_ERROR:
    case BusinessProfileErrorType.SYSTEM_ERROR:
      logger.error(`[CRITICAL] ${context.functionName}: ${errorMessage}`, errorDetails);
      break;
    default:
      logger.error(`${context.functionName}: ${errorMessage}`, errorDetails);
      break;
  }
}

/**
 * Generate a cleaned error context safe for user-facing error messages
 * Removes sensitive and internal information
 * 
 * @param context - The full error context
 * @returns A sanitized version of the context for user consumption
 */
function getUserFacingErrorContext(
  context: StandardErrorContext
): Record<string, unknown> {
  // If we shouldn't include technical details, return minimal context
  if (!context.includeTechnicalDetails) {
    return {
      timestamp: context.timestamp,
      resource: context.resource,
      ...(context.requestId && { requestId: context.requestId }),
    };
  }
  
  // For development/testing, include more details but still sanitize
  return {
    timestamp: context.timestamp,
    resource: context.resource,
    operation: context.operation,
    action: context.action,
    component: context.component,
    functionName: context.functionName,
    endpoint: context.endpoint,
    method: context.method,
    ...(context.requestId && { requestId: context.requestId }),
    ...(context.businessId && { businessId: context.businessId }),
    environment: context.environment,
  };
}

/**
 * Determine the appropriate error type based on the error and context
 * 
 * @param error - The error that occurred
 * @param context - The error context
 * @returns The appropriate business profile error type
 */
function determineErrorType(
  error: unknown,
  context: Partial<StandardErrorContext>
): BusinessProfileErrorType {
  // If the error type is already set in the context, use it
  if (context.errorType) {
    return context.errorType;
  }
  
  // Check for standard error types
  if (error instanceof Error) {
    // Check error message for common patterns
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return BusinessProfileErrorType.NOT_FOUND_ERROR;
    }
    
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return BusinessProfileErrorType.VALIDATION_ERROR;
    }
    
    if (errorMessage.includes('permission') || errorMessage.includes('forbidden') || errorMessage.includes('403')) {
      return BusinessProfileErrorType.AUTHORIZATION_ERROR;
    }
    
    if (errorMessage.includes('authentication') || errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      return BusinessProfileErrorType.AUTHENTICATION_ERROR;
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return BusinessProfileErrorType.TIMEOUT_ERROR;
    }
    
    if (errorMessage.includes('database') || errorMessage.includes('sql') || errorMessage.includes('query')) {
      return BusinessProfileErrorType.DATABASE_ERROR;
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return BusinessProfileErrorType.API_ERROR;
    }
  }
  
  // Handle errors that don't match specific patterns
  if (context.operation === 'validate') {
    return BusinessProfileErrorType.VALIDATION_ERROR;
  }
  
  // Default to internal error
  return BusinessProfileErrorType.INTERNAL_ERROR;
}

/**
 * Create a standard error context for business profile operations
 * 
 * @param functionName - Name of the function where the context is being created
 * @param businessId - ID of the business
 * @param user - User performing the operation
 * @param operation - Type of operation being performed
 * @param resource - Optional resource being operated on
 * @param additionalInfo - Any additional context information
 * @returns Standard error context object
 */
function createBusinessProfileContext(
  functionName: string,
  businessId: string,
  user: Partial<User> | null,
  operation: 'create' | 'read' | 'update' | 'delete' | 'validate' | 'process',
  resource?: string,
  additionalInfo?: Record<string, unknown>
): StandardErrorContext {
  return createStandardErrorContext({
    functionName,
    component: 'BusinessProfileService',
    user,
    businessId,
    operation,
    resource: resource || 'business-profile',
    additionalInfo
  });
}

/**
 * Create a standard error context for user business operations
 * 
 * @param functionName - Name of the function where the context is being created
 * @param user - User performing the operation
 * @param operation - Type of operation being performed
 * @param additionalInfo - Any additional context information
 * @returns Standard error context object
 */
function createUserBusinessContext(
  functionName: string,
  user: Partial<User> | null,
  operation?: 'create' | 'read' | 'update' | 'delete' | 'validate' | 'process',
  additionalInfo?: Record<string, unknown>
): StandardErrorContext {
  return createStandardErrorContext({
    functionName,
    component: 'BusinessProfileService',
    user,
    operation: operation || 'read',
    resource: 'user-business-association',
    additionalInfo
  });
}

/**
 * Module exports
 */
export {
  createStandardErrorContext,
  createBusinessProfileContext,
  createUserBusinessContext,
  sanitizeUserForErrorContext,
  enhanceErrorContext,
  logErrorWithContext,
  getUserFacingErrorContext,
  determineErrorType
};
