/**
 * Authentication Error Handlers
 * 
 * Provides specialized error handling functions for authentication
 * and authorization operations in the Business Profile Service.
 */

import { ApiResponse } from '../../../types';
import { User, UserRole } from '../../../types/user';
import { BusinessProfileErrorType, BusinessProfileErrorCode } from './errorTypes';
import { BusinessProfileErrorContext, createErrorContext } from './errorContext';
import errorMonitoring from './errorMonitoring';
import logger from './loggerService';

/**
 * Error handling options
 */
export interface AuthErrorOptions {
  /** Error context */
  context?: Partial<BusinessProfileErrorContext>;
  /** Function name */
  functionName?: string;
  /** Component name */
  component?: string;
  /** Additional information */
  additionalInfo?: Record<string, unknown>;
}

/**
 * Handle authentication errors for business profile operations
 * 
 * @param user - The user object (or null if not authenticated)
 * @param requiresBusinessRole - Whether business role is required
 * @param options - Error handling options
 * @returns Error response if authentication fails, null if successful
 */
export function handleAuthenticationError<T>(
  user: User | null | undefined,
  requiresBusinessRole = true,
  options: AuthErrorOptions = {}
): ApiResponse<T> | null {
  const { context: baseContext, functionName, component, additionalInfo } = options;
  
  // Create error context
  const context = baseContext || createErrorContext({
    functionName: functionName || 'handleAuthenticationError',
    component: component || 'AuthService',
    user: user || undefined,
    info: additionalInfo
  });
  
  // Check if user is authenticated
  if (!user) {
    // Log authentication error
    logger.warn('Authentication required', {
      ...context,
      errorType: BusinessProfileErrorType.AUTHENTICATION_ERROR,
      errorCode: BusinessProfileErrorCode.AUTHENTICATION_REQUIRED
    });
    
    // Return authentication error response
    return {
      success: false,
      error: 'Authentication required to access this resource',
      errorType: BusinessProfileErrorType.AUTHENTICATION_ERROR,
      errorCode: BusinessProfileErrorCode.AUTHENTICATION_REQUIRED,
      errorContext: {
        requestId: context.operationId,
        timestamp: context.timestamp,
        component: context.component,
        function: context.functionName
      },
      requiresLogin: true
    };
  }
  
  // Check if user has required role (if applicable)
  if (requiresBusinessRole && 
      user.role !== UserRole.BUSINESS && 
      user.role !== UserRole.ADMIN) {
    // Log authorization error
    logger.warn('Business role required', {
      ...context,
      errorType: BusinessProfileErrorType.AUTHORIZATION_ERROR,
      errorCode: BusinessProfileErrorCode.BUSINESS_ROLE_REQUIRED,
      userRole: user.role
    });
    
    // Track authorization error
    errorMonitoring.trackEvent('authorization_error', {
      context,
      userRole: user.role,
      requiredRole: 'business'
    });
    
    // Return authorization error response
    return {
      success: false,
      error: 'Business role required to access this resource',
      errorType: BusinessProfileErrorType.AUTHORIZATION_ERROR,
      errorCode: BusinessProfileErrorCode.BUSINESS_ROLE_REQUIRED,
      errorContext: {
        requestId: context.operationId,
        timestamp: context.timestamp,
        component: context.component,
        function: context.functionName
      },
      requiresBusinessRole: true
    };
  }
  
  // Authentication successful
  return null;
}

/**
 * Handle admin role authentication for business profile operations
 * 
 * @param user - The user object (or null if not authenticated)
 * @param options - Error handling options
 * @returns Error response if authentication fails, null if successful
 */
export function handleAdminAuthenticationError<T>(
  user: User | null | undefined,
  options: AuthErrorOptions = {}
): ApiResponse<T> | null {
  const { context: baseContext, functionName, component, additionalInfo } = options;
  
  // First, check if user is authenticated
  const authError = handleAuthenticationError<T>(user, false, options);
  if (authError) {
    return authError;
  }
  
  // Now check for admin role
  if (user && user.role !== UserRole.ADMIN) {
    // Create error context if not provided
    const context = baseContext || createErrorContext({
      functionName: functionName || 'handleAdminAuthenticationError',
      component: component || 'AuthService',
      user,
      info: additionalInfo
    });
    
    // Log admin role required error
    logger.warn('Admin role required', {
      ...context,
      errorType: BusinessProfileErrorType.AUTHORIZATION_ERROR,
      errorCode: BusinessProfileErrorCode.INSUFFICIENT_PERMISSIONS,
      userRole: user.role
    });
    
    // Track authorization error
    errorMonitoring.trackEvent('authorization_error', {
      context,
      userRole: user.role,
      requiredRole: 'admin'
    });
    
    // Return authorization error response
    return {
      success: false,
      error: 'Admin role required to access this resource',
      errorType: BusinessProfileErrorType.AUTHORIZATION_ERROR,
      errorCode: BusinessProfileErrorCode.INSUFFICIENT_PERMISSIONS,
      errorContext: {
        requestId: context.operationId,
        timestamp: context.timestamp,
        component: context.component,
        function: context.functionName
      },
      requiresAdminRole: true
    };
  }
  
  // Admin authentication successful
  return null;
}
