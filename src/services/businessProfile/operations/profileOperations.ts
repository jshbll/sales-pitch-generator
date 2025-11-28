/**
 * Business Profile Operations
 * 
 * Shared operation patterns for business profile service methods.
 * These functions encapsulate common patterns used across different
 * business profile operations to reduce duplication and improve maintainability.
 * 
 * @version 2.0.0
 * @author JaxSaver Team
 */
import { ApiResponse, BusinessProfile } from '../../../types';
import { User } from '../../../types/user';
import logger from '../../../utils/logger';
import cacheManager from '../managers/cacheManager';
import validationManager from '../managers/validationManager';
import { BusinessProfileRepository } from '../repositories/businessProfileRepository';

// Create an instance of the repository  
const businessProfileRepository = new BusinessProfileRepository();
import { 
  createBusinessProfileContext,
  tryStandardBusinessOperation,
  BusinessProfileErrorType
} from '../utils/errorHandlingIndex';

/**
 * Options for cached profile operations
 */
export interface ProfileOperationOptions {
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
}

/**
 * Fetch a business profile by ID with caching and standardized error handling
 * 
 * This function encapsulates the common pattern of:
 * 1. Checking cache
 * 2. Fetching from repository if not cached
 * 3. Validating the data
 * 4. Caching the result
 * 
 * @param businessId - Business profile ID
 * @param options - Operation options
 * @returns API response with business profile data
 */
export async function fetchBusinessProfileById(
  businessId: string,
  options: ProfileOperationOptions
): Promise<ApiResponse<BusinessProfile>> {
  // Create standardized error context
  const context = createBusinessProfileContext(
    options.functionName || 'fetchBusinessProfileById',
    businessId,
    options.user,
    'read'
  );
  
  return tryStandardBusinessOperation(async () => {
    // Validate business ID
    if (!validationManager.isValidBusinessId(businessId)) {
      logger.warn('Invalid business ID format', {
        businessId,
        functionName: options.functionName || 'fetchBusinessProfileById'
      });
      
      return validationManager.createInvalidBusinessIdError(
        businessId, 
        options.functionName || 'fetchBusinessProfileById'
      );
    }
    
    // Check cache first
    try {
      const cachedProfile = cacheManager.getCachedBusinessProfile(businessId);
      if (cachedProfile) {
        logger.debug('Using cached business profile', {
          businessId,
          cacheHit: true,
          functionName: options.functionName
        });
        return cachedProfile;
      }
    } catch (cacheError) {
      // Log cache error but continue with repository request
      logger.warn('Cache retrieval error', {
        functionName: options.functionName,
        component: 'BusinessProfileService',
        info: { businessId }
      });
    }
    
    // Fetch profile from repository
    logger.debug('Fetching business profile from repository', {
      businessId,
      functionName: options.functionName
    });
    
    const response = await businessProfileRepository.getProfileById(businessId);
    
    // If successful, validate and cache the data
    if (response.success && response.data) {
      const validationResult = validationManager.validateBusinessProfile(
        response.data,
        options.strictValidation
      );
      
      // Cache the validated data
      if (validationResult.success && validationResult.data) {
        try {
          cacheManager.cacheBusinessProfile(validationResult.data);
          logger.debug('Cached business profile', {
            businessId,
            functionName: options.functionName
          });
        } catch (cacheError) {
          logger.warn('Failed to cache business profile', {
            businessId,
            error: cacheError,
            functionName: options.functionName
          });
        }
      } else if (!validationResult.success) {
        logger.warn('Business profile validation failed', {
          businessId,
          errors: validationResult.error,
          functionName: options.functionName
        });
      }
      
      return validationResult;
    }
    
    // Log failure to fetch profile
    logger.error('Failed to fetch business profile from repository', {
      businessId,
      error: response.error,
      functionName: options.functionName
    });
    
    // Return the repository response with standardized error type
    return {
      ...response,
      errorType: response.errorType || BusinessProfileErrorType.DATABASE_ERROR
    };
  }, context);
}

/**
 * Fetch current user's business profile with caching and standardized error handling
 * 
 * @param userId - User ID
 * @param options - Operation options
 * @returns API response with business profile data
 */
export async function fetchCurrentUserProfile(
  userId: string | undefined,
  options: ProfileOperationOptions
): Promise<ApiResponse<BusinessProfile>> {
  // Create standardized error context
  const context = createBusinessProfileContext(
    options.functionName || 'fetchCurrentUserProfile',
    options.businessId || '',
    options.user,
    'read'
  );
  
  return tryStandardBusinessOperation(async () => {
    // If no user ID, return authentication error
    if (!userId && !options.user?.id) {
      logger.warn('No user ID provided for current user profile', {
        functionName: options.functionName
      });
      
      return {
        success: false,
        error: 'Authentication required',
        errorType: BusinessProfileErrorType.AUTHENTICATION_ERROR,
        requiresLogin: true
      };
    }
    
    // Use user ID from options if available, otherwise use the one provided
    const currentUserId = options.user?.id || userId;
    
    // Try to get business ID from options
    let businessId = options.businessId;
    
    // If business ID not provided but user has one, use it
    if (!businessId && options.user?.businessId) {
      businessId = options.user.businessId;
    }
    
    // If we have a business ID, fetch by ID
    if (businessId) {
      logger.debug('Fetching business profile by ID for current user', {
        userId: currentUserId,
        businessId,
        functionName: options.functionName
      });
      
      return fetchBusinessProfileById(businessId, options);
    }
    
    // If no business ID, try repository's getUserBusiness method
    logger.debug('Fetching business profile for current user without business ID', {
      userId: currentUserId,
      functionName: options.functionName
    });
    
    const response = await businessProfileRepository.getUserBusiness(currentUserId as string);
    
    // Handle repository response
    if (response.success && response.data) {
      const validationResult = validationManager.validateBusinessProfile(
        response.data,
        options.strictValidation
      );
      
      // Cache the validated data
      if (validationResult.success && validationResult.data) {
        try {
          cacheManager.cacheBusinessProfile(validationResult.data);
          logger.debug('Cached user business profile', {
            userId: currentUserId,
            businessId: validationResult.data.id,
            functionName: options.functionName
          });
        } catch (cacheError) {
          logger.warn('Failed to cache user business profile', {
            userId: currentUserId,
            error: cacheError,
            functionName: options.functionName
          });
        }
      }
      
      return validationResult;
    }
    
    // Log failure to fetch profile
    logger.warn('Failed to fetch business profile for current user', {
      userId: currentUserId,
      error: response.error,
      functionName: options.functionName
    });
    
    // Return the repository response with standardized error type
    return {
      ...response,
      errorType: response.errorType || BusinessProfileErrorType.NOT_FOUND_ERROR
    };
  }, context);
}

/**
 * Update business profile data with enhanced validation and standardized error handling
 * 
 * @param businessId - Business ID
 * @param data - Business profile update data
 * @param options - Operation options
 * @returns API response with updated business profile
 */
export async function updateBusinessProfileData(
  businessId: string,
  data: Partial<BusinessProfile>,
  options: ProfileOperationOptions = {}
): Promise<ApiResponse<BusinessProfile>> {
  // Create standardized error context
  const context = createBusinessProfileContext(
    options.functionName || 'updateBusinessProfileData',
    businessId,
    options.user,
    'update'
  );
  
  return tryStandardBusinessOperation(async () => {
    // Validate business ID
    if (!validationManager.isValidBusinessId(businessId)) {
      logger.warn('Invalid business ID format for update', {
        businessId,
        functionName: options.functionName || 'updateBusinessProfileData'
      });
      
      return validationManager.createInvalidBusinessIdError(
        businessId, 
        options.functionName || 'updateBusinessProfileData'
      );
    }
    
    // Pre-validate update data
    const validationResult = validationManager.validatePartialBusinessProfile(data);
    if (!validationResult.success) {
      logger.warn('Business profile update data validation failed', {
        businessId,
        errors: validationResult.error,
        functionName: options.functionName
      });
      
      return validationResult;
    }
    
    // Update profile in repository
    logger.debug('Updating business profile in repository', {
      businessId,
      updateFields: Object.keys(data),
      functionName: options.functionName
    });
    
    const response = await businessProfileRepository.updateProfile(businessId, data);
    
    // If update was successful, invalidate/update cache
    if (response.success && response.data) {
      try {
        // Removed cached version
        cacheManager.invalidateBusinessProfile(businessId);
        
        // Cache the updated version
        cacheManager.cacheBusinessProfile(response.data);
        
        logger.debug('Updated cached business profile', {
          businessId,
          functionName: options.functionName
        });
      } catch (cacheError) {
        logger.warn('Failed to update business profile cache', {
          businessId,
          error: cacheError,
          functionName: options.functionName
        });
      }
      
      // Validate the returned data
      const finalValidationResult = validationManager.validateBusinessProfile(
        response.data,
        options.strictValidation
      );
      
      return finalValidationResult;
    }
    
    // Log failure to update profile
    logger.error('Failed to update business profile in repository', {
      businessId,
      error: response.error,
      functionName: options.functionName
    });
    
    // Return the repository response with standardized error type
    return {
      ...response,
      errorType: response.errorType || BusinessProfileErrorType.DATABASE_ERROR
    };
  }, context);
}
