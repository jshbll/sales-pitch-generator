/**
 * Error Context Factory
 * 
 * Provides factory functions to create standardized error context
 * for different types of business profile operations.
 * 
 * @version 1.0.0
 * @author JaxSaver Team
 */

import { User } from '../../../types/user';
import { StandardErrorContextOptions } from './standardErrorContext';
import configService from '../config/configService';

/**
 * Create error context for a user business operation
 * 
 * @param functionName - The function name
 * @param user - The user performing the operation
 * @param businessId - Optional business ID
 * @param additionalInfo - Optional additional context information
 * @returns Standardized error context options
 */
function createUserBusinessContext(
  functionName: string,
  user: User | null,
  businessId?: string,
  additionalInfo?: Record<string, unknown>
): StandardErrorContextOptions {
  return {
    functionName,
    component: 'BusinessProfileService',
    user,
    businessId,
    operation: 'read',
    resource: 'business',
    includeTechnicalDetails: configService.isDetailedErrorsEnabled(),
    additionalInfo: {
      userProvided: !!user,
      hasBusiness: !!businessId,
      ...additionalInfo
    }
  };
}

/**
 * Create error context for a business profile operation
 * 
 * @param functionName - The function name
 * @param businessId - The business ID
 * @param user - Optional user performing the operation
 * @param operation - The operation type
 * @param additionalInfo - Optional additional context information
 * @returns Standardized error context options
 */
function createBusinessProfileContext(
  functionName: string,
  businessId: string,
  user?: User | null,
  operation: 'create' | 'read' | 'update' | 'delete' = 'read',
  additionalInfo?: Record<string, unknown>
): StandardErrorContextOptions {
  return {
    functionName,
    component: 'BusinessProfileService',
    businessId,
    user,
    operation,
    resource: 'business',
    includeTechnicalDetails: configService.isDetailedErrorsEnabled(),
    additionalInfo
  };
}

/**
 * Create error context for a validation operation
 * 
 * @param functionName - The function name
 * @param resource - The resource being validated
 * @param additionalInfo - Optional additional context information
 * @returns Standardized error context options
 */
function createValidationContext(
  functionName: string,
  resource: string,
  additionalInfo?: Record<string, unknown>
): StandardErrorContextOptions {
  return {
    functionName,
    component: 'ValidationManager',
    operation: 'validate',
    resource,
    includeTechnicalDetails: configService.isDetailedErrorsEnabled(),
    additionalInfo
  };
}

/**
 * Create error context for a cache operation
 * 
 * @param functionName - The function name
 * @param operation - The operation type
 * @param businessId - Optional business ID
 * @param userId - Optional user ID
 * @param additionalInfo - Optional additional context information
 * @returns Standardized error context options
 */
function createCacheContext(
  functionName: string,
  operation: 'create' | 'read' | 'update' | 'delete',
  businessId?: string,
  userId?: string,
  additionalInfo?: Record<string, unknown>
): StandardErrorContextOptions {
  return {
    functionName,
    component: 'CacheManager',
    businessId,
    operation,
    resource: 'cache',
    includeTechnicalDetails: configService.isDetailedErrorsEnabled(),
    additionalInfo: {
      userId,
      ...additionalInfo
    }
  };
}

/**
 * Create error context for a database operation
 * 
 * @param functionName - The function name
 * @param operation - The operation type
 * @param resource - The resource being operated on
 * @param businessId - Optional business ID
 * @param additionalInfo - Optional additional context information
 * @returns Standardized error context options
 */
function createDatabaseContext(
  functionName: string,
  operation: 'create' | 'read' | 'update' | 'delete',
  resource: string,
  businessId?: string,
  additionalInfo?: Record<string, unknown>
): StandardErrorContextOptions {
  return {
    functionName,
    component: 'DatabaseRepository',
    businessId,
    operation,
    resource,
    includeTechnicalDetails: configService.isDetailedErrorsEnabled(),
    additionalInfo
  };
}

/**
 * Create error context for an API operation
 * 
 * @param functionName - The function name
 * @param endpoint - The API endpoint
 * @param method - The HTTP method
 * @param businessId - Optional business ID
 * @param additionalInfo - Optional additional context information
 * @returns Standardized error context options
 */
function createApiContext(
  functionName: string,
  endpoint: string,
  method: string,
  businessId?: string,
  additionalInfo?: Record<string, unknown>
): StandardErrorContextOptions {
  return {
    functionName,
    component: 'ApiService',
    businessId,
    endpoint,
    method,
    operation: method.toLowerCase() === 'get' ? 'read' : 'update',
    resource: 'api',
    includeTechnicalDetails: configService.isDetailedErrorsEnabled(),
    additionalInfo
  };
}

export {
  createUserBusinessContext,
  createBusinessProfileContext,
  createValidationContext,
  createCacheContext,
  createDatabaseContext,
  createApiContext
};
