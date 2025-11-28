/**
 * User Business Operations
 * 
 * This module contains operations related to fetching and managing 
 * the current user's business profile.
 * 
 * @version 2.1.0
 * @author JaxSaver Team
 */
import { ApiResponse, BusinessProfile } from '../../../types';
import { User } from '../../../types/user';
import logger from '../utils/browserLogger';

// Import error handling and business profile utilities
import { BusinessProfileErrorType, BusinessProfileErrorCode } from '../utils/errorTypes';
import { tryStandardBusinessOperation, createStandardBusinessError } from '../utils/standardErrorHandler';
import { createUserBusinessContext } from '../utils/errorContextFactory';
import { logDevelopmentFallbackUsage, getDevelopmentBusinessProfile } from '../utils/devMockData';

// Enhanced profile operations
import enhancedProfileOperations from './enhancedProfileOperations';

// Core operation module with enhanced error handling and standardized logging

/**
 * Get business profile for current user with enhanced caching and error handling
 * 
 * @param user The authenticated user object
 * @returns ApiResponse with business profile data
 */
export async function getCurrentUserBusiness(user: User | null): Promise<ApiResponse<BusinessProfile>> {
  // Generate unique operation ID for tracking
  const operationId = `user-business-${Date.now()}`;
  
  // Create standardized error context
  const context = createUserBusinessContext('getCurrentUserBusiness', user);
  
  // Log operation start with context
  logger.info('Business profile service operation started', {
    functionName: 'getCurrentUserBusiness',
    userId: user?.id,
    businessId: user?.businessId,
    operationId
  });

  // Use standardized business operation with error handling
  return tryStandardBusinessOperation(async () => {
    // If no user is provided, check for auth token or use fallback
    if (!user) {
      logger.warn('No user provided, checking for localStorage token', {
        ...context,
        operationId
      });
      
      // Check if auth token exists in localStorage as a fallback
      const hasAuthToken = typeof window !== 'undefined' && localStorage.getItem('auth_token');
      
      if (hasAuthToken) {
        logger.info('Auth token found, proceeding with minimal user info', {
          ...context,
          operationId
        });
        
        // Try proceeding with minimal user info if we have auth token
        user = { id: 'current-user' } as User;
      } else if (process.env.NODE_ENV === 'development') {
        logger.warn('No auth token found, using development fallback', {
          ...context,
          operationId
        });
        
        logDevelopmentFallbackUsage('getCurrentUserBusiness');
        
        // Return development profile directly
        return {
          success: true,
          data: getDevelopmentBusinessProfile(),
          message: 'Development business profile',
          metadata: {
            fromCache: false,
            isDevelopment: true
          }
        };
      } else {
        // Throw authentication error to be handled by the standardized error handler
        throw createStandardBusinessError(
          BusinessProfileErrorType.AUTHENTICATION_ERROR,
          'Authentication required to access business profile',
          BusinessProfileErrorCode.AUTHENTICATION_REQUIRED
        );
      }
    }
    
    logger.debug('Processing user business profile request', {
      userId: user.id,
      businessId: user.businessId,
      operationId
    });
    
    // Check for business ID first - direct approach
    if (user.businessId) {
      logger.info('User has businessId - fetching business profile', {
        userId: user.id,
        businessId: user.businessId,
        operationId,
        functionName: 'getCurrentUserBusiness'
      });
      
      // Use enhanced profile operations with caching
      const response = await enhancedProfileOperations.fetchBusinessProfileById(
        user.businessId,
        {
          user,
          businessId: user.businessId,
          functionName: 'getCurrentUserBusiness',
          operationId
        }
      );
      
      // Unwrap the nested ApiResponse if needed
      if (response.success && response.data && typeof response.data === 'object' && 'success' in response.data) {
        // We have a nested ApiResponse, unwrap it
        const nestedResponse = response.data as unknown as ApiResponse<BusinessProfile>;
        return nestedResponse;
      }
      
      return response;
    }
    
    // For users without a business ID, use enhanced profile operations
    const response = await enhancedProfileOperations.fetchCurrentUserProfile(
      user.id,
      {
        user,
        functionName: 'getCurrentUserBusiness',
        operationId
      }
    );
    
    // Unwrap the nested ApiResponse if needed
    if (response.success && response.data && typeof response.data === 'object' && 'success' in response.data) {
      // We have a nested ApiResponse, unwrap it
      const nestedResponse = response.data as unknown as ApiResponse<BusinessProfile>;
      return nestedResponse;
    }
    
    return response;
  }, context);
}

/**
 * Core BusinessProfile Operations Module
 * 
 * This module exports optimized and standardized operations for working with
 * business profiles in the context of user operations.
 * 
 * Enhanced with advanced caching strategies:
 * - Time-based cache expiration
 * - Stale-while-revalidate pattern
 * - Granular cache invalidation
 * - Cache analytics
 */
export default {
  getCurrentUserBusiness
};
