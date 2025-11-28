/**
 * Enhanced Business Profile Operations
 * 
 * Improved operation patterns for business profile service methods
 * with advanced caching strategies, including:
 * - Time-based cache expiration
 * - Stale-while-revalidate pattern
 * - Granular cache invalidation
 * - Cache analytics
 * 
 * @version 2.1.0
 * @author JaxSaver Team
 */
import { ApiResponse, BusinessProfile } from '../../../types';
import { User } from '../../../types/user';
import logger from '../utils/browserLogger';
import enhancedCacheManager from '../managers/enhancedCacheManager';
import validationManager from '../managers/validationManager';
import { BusinessProfileRepository } from '../repositories/businessProfileRepository';

// Create an instance of the repository
const businessProfileRepository = new BusinessProfileRepository();
import { 
  createBusinessProfileContext,
  tryStandardBusinessOperation,
  BusinessProfileErrorType
} from '../utils/errorHandlingIndex';
import cacheAnalytics from '../utils/cacheAnalytics';
import { CacheOperationType } from '../utils/cacheAnalytics';

/**
 * Options for enhanced profile operations
 */
export interface EnhancedProfileOperationOptions {
  /** Function name for context and logging */
  functionName?: string;
  /** User object if available */
  user?: User | null;
  /** Business ID if available */
  businessId?: string;
  /** Whether to include technical details in error responses */
  includeTechnicalDetails?: boolean;
  /** Whether to use strict validation rules */
  strictValidation?: boolean;
  /** Whether to bypass cache for this operation */
  bypassCache?: boolean;
  /** Whether to refresh cache even if a valid entry exists */
  forceRefresh?: boolean;
  /** Custom TTL for this operation in milliseconds */
  cacheTtl?: number;
  /** Operation ID for request tracing */
  operationId?: string;
}

/**
 * Fetch a business profile by ID with enhanced caching
 * 
 * This function implements the stale-while-revalidate pattern:
 * 1. Check cache for fresh data
 * 2. If fresh data exists, return it
 * 3. If stale data exists, return it and refresh in background
 * 4. If no data exists, fetch from repository and cache
 * 
 * @param businessId - Business profile ID
 * @param options - Operation options
 * @returns API response with business profile data
 */
export async function fetchBusinessProfileById(
  businessId: string,
  options: EnhancedProfileOperationOptions
): Promise<ApiResponse<BusinessProfile>> {
  const startTime = Date.now();
  const functionName = options.functionName || 'fetchBusinessProfileById';
  
  // Create standardized error context
  const context = createBusinessProfileContext(
    functionName,
    businessId,
    options.user,
    'read'
  );
  
  return tryStandardBusinessOperation(async () => {
    // Validate business ID
    if (!validationManager.isValidBusinessId(businessId)) {
      logger.warn('Invalid business ID format', {
        businessId,
        functionName
      });
      
      return validationManager.createInvalidBusinessIdError(
        businessId, 
        functionName
      );
    }
    
    // Check if we should bypass cache
    if (options.bypassCache) {
      logger.debug('Bypassing cache as requested', {
        businessId,
        functionName,
        operationId: options.operationId
      });
      
      return await fetchFromRepository();
    }
    
    // Check cache first
    try {
      const userId = options.user?.id;
      const { data: cachedProfile, isStale } = await enhancedCacheManager.getCachedBusinessProfile(
        businessId,
        userId
      );
      
      if (cachedProfile) {
        // Record cache hit in analytics
        const operationType = isStale 
          ? CacheOperationType.STALE_HIT 
          : CacheOperationType.HIT;
        
        cacheAnalytics.recordOperation(
          operationType,
          'BUSINESS_PROFILE',
          Date.now() - startTime
        );
        
        logger.debug(`Using ${isStale ? 'stale ' : ''}cached business profile`, {
          businessId,
          userId,
          cacheHit: true,
          isStale,
          functionName,
          operationId: options.operationId
        });
        
        // If data is stale or force refresh is requested, refresh in background
        if (isStale || options.forceRefresh) {
          // Don't await - let it refresh in background
          refreshProfileInBackground(businessId, userId, options);
        }
        
        return cachedProfile;
      }
      
      // Record cache miss in analytics
      cacheAnalytics.recordOperation(
        CacheOperationType.MISS,
        'BUSINESS_PROFILE',
        Date.now() - startTime
      );
      
      logger.debug('Cache miss for business profile', {
        businessId,
        userId,
        cacheMiss: true,
        functionName,
        operationId: options.operationId
      });
    } catch (cacheError) {
      // Log cache error but continue with repository request
      logger.warn('Cache retrieval error', {
        functionName,
        component: 'EnhancedBusinessProfileService',
        error: cacheError instanceof Error ? cacheError.message : 'Unknown error',
        info: { businessId, operationId: options.operationId }
      });
    }
    
    // Fetch from repository if not in cache or cache error
    return await fetchFromRepository();
    
    /**
     * Fetch profile from repository and cache it
     */
    async function fetchFromRepository(): Promise<ApiResponse<BusinessProfile>> {
      logger.debug('Fetching business profile from repository', {
        businessId,
        functionName,
        operationId: options.operationId
      });
      
      try {
        // Fetch profile from repository
        const response = await businessProfileRepository.getById(businessId);
        
        // If successful, cache the result
        if (response.success && response.data) {
          try {
            const userId = options.user?.id;
            const cached = enhancedCacheManager.cacheBusinessProfile(
              businessId,
              response,
              userId
            );
            
            if (cached) {
              // Record cache set in analytics
              cacheAnalytics.recordOperation(
                CacheOperationType.SET,
                'BUSINESS_PROFILE',
                Date.now() - startTime
              );
              
              logger.debug('Cached business profile', {
                businessId,
                userId,
                functionName,
                operationId: options.operationId
              });
            }
          } catch (cacheError) {
            // Log cache error but continue with response
            logger.warn('Cache storage error', {
              functionName,
              component: 'EnhancedBusinessProfileService',
              error: cacheError instanceof Error ? cacheError.message : 'Unknown error',
              info: { businessId, operationId: options.operationId }
            });
          }
        }
        
        return response;
      } catch (repoError) {
        // Log repository error
        logger.error('Repository error fetching business profile', {
          functionName,
          component: 'EnhancedBusinessProfileService',
          error: repoError instanceof Error ? repoError.message : 'Unknown error',
          info: { businessId, operationId: options.operationId }
        });
        
        // Return error response
        return {
          success: false,
          error: 'Failed to fetch business profile',
          errorType: BusinessProfileErrorType.REPOSITORY_ERROR
        };
      }
    }
  }, context);
}

/**
 * Refresh a business profile in the background
 * 
 * @param businessId - Business ID
 * @param userId - User ID
 * @param options - Operation options
 */
async function refreshProfileInBackground(
  businessId: string,
  userId?: string,
  options?: EnhancedProfileOperationOptions
): Promise<void> {
  const functionName = 'refreshProfileInBackground';
  
  try {
    logger.debug('Refreshing business profile in background', {
      businessId,
      userId,
      functionName,
      operationId: options?.operationId
    });
    
    // Fetch fresh data from repository
    const response = await businessProfileRepository.getProfileById(businessId);
    
    // If successful, update cache
    if (response.success && response.data) {
      const cached = enhancedCacheManager.cacheBusinessProfile(
        businessId,
        response,
        userId
      );
      
      if (cached) {
        logger.debug('Updated cache with fresh business profile data', {
          businessId,
          userId,
          functionName,
          operationId: options?.operationId
        });
      }
    } else {
      logger.warn('Failed to refresh business profile in background', {
        businessId,
        userId,
        functionName,
        operationId: options?.operationId,
        error: response.error
      });
    }
  } catch (error) {
    logger.error('Error refreshing business profile in background', {
      businessId,
      userId,
      functionName,
      operationId: options?.operationId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Fetch current user's business profile with enhanced caching
 * 
 * @param userId - User ID
 * @param options - Operation options
 * @returns API response with business profile data
 */
export async function fetchCurrentUserProfile(
  userId: string | undefined,
  options: EnhancedProfileOperationOptions
): Promise<ApiResponse<BusinessProfile>> {
  const startTime = Date.now();
  const functionName = options.functionName || 'fetchCurrentUserProfile';
  
  // Create standardized error context
  const context = createBusinessProfileContext(
    functionName,
    options.businessId,
    options.user,
    'read'
  );
  
  return tryStandardBusinessOperation(async () => {
    // Validate user ID
    if (!userId) {
      logger.warn('Missing user ID', {
        functionName,
        operationId: options.operationId
      });
      
      return {
        success: false,
        error: 'User ID is required',
        errorType: BusinessProfileErrorType.VALIDATION_ERROR
      };
    }
    
    // If we have a business ID, use fetchBusinessProfileById
    if (options.businessId) {
      return await fetchBusinessProfileById(options.businessId, {
        ...options,
        functionName
      });
    }
    
    // Otherwise, we need to look up the business ID for this user
    try {
      // Fetch user's business ID from user service
      // This is a simplified example - in a real implementation,
      // you would call a user service to get the business ID
      const businessId = options.user?.businessId;
      
      if (!businessId) {
        logger.warn('User has no associated business', {
          userId,
          functionName,
          operationId: options.operationId
        });
        
        return {
          success: false,
          error: 'User has no associated business',
          errorType: BusinessProfileErrorType.NOT_FOUND
        };
      }
      
      // Now fetch the business profile using the business ID
      return await fetchBusinessProfileById(businessId, {
        ...options,
        businessId,
        functionName
      });
    } catch (error) {
      logger.error('Error fetching user business ID', {
        userId,
        functionName,
        operationId: options.operationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        success: false,
        error: 'Failed to fetch user business ID',
        errorType: BusinessProfileErrorType.USER_SERVICE_ERROR
      };
    }
  }, context);
}

/**
 * Update business profile data with enhanced cache invalidation
 * 
 * @param businessId - Business ID
 * @param data - Business profile update data
 * @param options - Operation options
 * @returns API response with updated business profile
 */
export async function updateBusinessProfileData(
  businessId: string,
  data: Partial<BusinessProfile>,
  options: EnhancedProfileOperationOptions = {}
): Promise<ApiResponse<BusinessProfile>> {
  const startTime = Date.now();
  const functionName = options.functionName || 'updateBusinessProfileData';
  
  // Create standardized error context
  const context = createBusinessProfileContext(
    functionName,
    businessId,
    options.user,
    'update'
  );
  
  return tryStandardBusinessOperation(async () => {
    // Validate business ID
    if (!validationManager.isValidBusinessId(businessId)) {
      logger.warn('Invalid business ID format', {
        businessId,
        functionName,
        operationId: options.operationId
      });
      
      return validationManager.createInvalidBusinessIdError(
        businessId, 
        functionName
      );
    }
    
    // Validate update data
    const validationResult = validationManager.validateBusinessProfileUpdate(
      data,
      options.strictValidation
    );
    
    if (!validationResult.valid) {
      logger.warn('Invalid business profile update data', {
        businessId,
        functionName,
        operationId: options.operationId,
        validationErrors: validationResult.errors
      });
      
      return {
        success: false,
        error: 'Invalid business profile data',
        validationErrors: validationResult.errors,
        errorType: BusinessProfileErrorType.VALIDATION_ERROR
      };
    }
    
    try {
      // Update profile in repository
      const response = await businessProfileRepository.updateBusinessProfile(
        businessId,
        data
      );
      
      // If update was successful, invalidate cache
      if (response.success) {
        try {
          const userId = options.user?.id;
          const invalidated = enhancedCacheManager.invalidateBusinessProfile(
            businessId,
            userId
          );
          
          if (invalidated) {
            // Record cache invalidation in analytics
            cacheAnalytics.recordOperation(
              CacheOperationType.INVALIDATE,
              'BUSINESS_PROFILE',
              Date.now() - startTime
            );
            
            logger.debug('Invalidated business profile cache after update', {
              businessId,
              userId,
              functionName,
              operationId: options.operationId
            });
          }
        } catch (cacheError) {
          // Log cache error but continue with response
          logger.warn('Cache invalidation error', {
            functionName,
            component: 'EnhancedBusinessProfileService',
            error: cacheError instanceof Error ? cacheError.message : 'Unknown error',
            info: { businessId, operationId: options.operationId }
          });
        }
      }
      
      return response;
    } catch (repoError) {
      // Log repository error
      logger.error('Repository error updating business profile', {
        functionName,
        component: 'EnhancedBusinessProfileService',
        error: repoError instanceof Error ? repoError.message : 'Unknown error',
        info: { businessId, operationId: options.operationId }
      });
      
      // Return error response
      return {
        success: false,
        error: 'Failed to update business profile',
        errorType: BusinessProfileErrorType.REPOSITORY_ERROR
      };
    }
  }, context);
}

export default {
  fetchBusinessProfileById,
  fetchCurrentUserProfile,
  updateBusinessProfileData
};
