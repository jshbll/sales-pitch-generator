/**
 * Business Profile Cache Manager
 * 
 * Handles all caching operations for business profiles.
 * Extracted from BusinessProfileService to reduce file length
 * and improve separation of concerns.
 */
import { ApiResponse, BusinessProfile } from '../../../types';
import businessProfileCacheService from '../cache/cacheService';
import logger from '../utils/loggerService';
import { handleCacheError } from '../utils/errorUtils';

/**
 * Cache Manager for Business Profiles
 * 
 * Centralizes all cache-related operations to reduce duplication
 * and improve maintainability.
 */
export class BusinessProfileCacheManager {
  /**
   * Get a cached user profile
   * 
   * @param userId - The user ID
   * @returns Cached profile response or undefined
   */
  getCachedUserProfile(userId: string): ApiResponse<BusinessProfile> | undefined {
    const cachedProfile = businessProfileCacheService.get<BusinessProfile>(
      userId,
      undefined,
      'profile'
    );
    
    if (cachedProfile) {
      logger.logCacheOperation('hit', {
        functionName: 'getCachedUserProfile',
        component: 'BusinessProfileCacheManager',
        info: { userId }
      });
      
      return {
        success: true,
        data: cachedProfile,
        message: 'Business profile retrieved from cache'
      };
    }
    
    logger.logCacheOperation('miss', {
      functionName: 'getCachedUserProfile',
      component: 'BusinessProfileCacheManager',
      info: { userId }
    });
    
    return undefined;
  }
  
  /**
   * Get a cached business profile
   * 
   * @param businessId - The business ID
   * @returns Cached profile response or undefined
   */
  getCachedBusinessProfile(businessId: string): ApiResponse<BusinessProfile> | undefined {
    const cachedProfile = businessProfileCacheService.getByBusinessId<BusinessProfile>(
      businessId,
      'profile'
    );
    
    if (cachedProfile) {
      logger.logCacheOperation('hit', {
        functionName: 'getCachedBusinessProfile',
        component: 'BusinessProfileCacheManager',
        info: { businessId }
      });
      
      return {
        success: true,
        data: cachedProfile,
        message: 'Business profile retrieved from cache'
      };
    }
    
    logger.logCacheOperation('miss', {
      functionName: 'getCachedBusinessProfile',
      component: 'BusinessProfileCacheManager',
      info: { businessId }
    });
    
    return undefined;
  }
  
  /**
   * Cache a user profile
   * 
   * @param userId - The user ID
   * @param profile - The profile to cache
   */
  cacheUserProfile(userId: string, profile: BusinessProfile): void {
    try {
      if (profile.id) {
        businessProfileCacheService.set<BusinessProfile>(
          profile,
          userId,
          profile.id,
          'profile'
        );
        
        logger.logCacheOperation('set', {
          functionName: 'cacheUserProfile',
          component: 'BusinessProfileCacheManager',
          info: { userId, businessId: profile.id }
        });
      }
    } catch (cacheError) {
      logger.warn('Cache storage error', {
        functionName: 'cacheUserProfile',
        component: 'BusinessProfileCacheManager',
        info: { userId, businessId: profile.id }
      }, cacheError);
    }
  }
  
  /**
   * Cache a business profile
   * 
   * @param profile - The profile to cache
   */
  cacheBusinessProfile(profile: BusinessProfile): void {
    try {
      if (profile.id && profile.owner_id) {
        businessProfileCacheService.set<BusinessProfile>(
          profile,
          profile.owner_id,
          profile.id,
          'profile'
        );
        
        logger.logCacheOperation('set', {
          functionName: 'cacheBusinessProfile',
          component: 'BusinessProfileCacheManager',
          info: { userId: profile.owner_id, businessId: profile.id }
        });
      }
    } catch (cacheError) {
      logger.warn('Cache storage error', {
        functionName: 'cacheBusinessProfile',
        component: 'BusinessProfileCacheManager',
        info: { userId: profile.owner_id, businessId: profile.id }
      }, cacheError);
    }
  }
  
  /**
   * Invalidate business cache
   * 
   * @param businessId - The business ID
   */
  invalidateBusinessCache(businessId: string): void {
    try {
      businessProfileCacheService.invalidateForBusiness(businessId);
      
      logger.logCacheOperation('invalidate', {
        functionName: 'invalidateBusinessCache',
        component: 'BusinessProfileCacheManager',
        info: { businessId }
      });
    } catch (cacheError) {
      logger.warn('Cache invalidation error', {
        functionName: 'invalidateBusinessCache',
        component: 'BusinessProfileCacheManager',
        info: { businessId }
      }, cacheError);
    }
  }
  
  /**
   * Clear the business profile cache
   * 
   * @param userId - Optional user ID to clear cache for specific user
   * @param businessId - Optional business ID to clear cache for specific business
   * @returns Number of cache entries cleared or error response
   */
  clearCache(userId?: string, businessId?: string): number | ApiResponse<number> {
    try {
      logger.logCacheOperation('clear', {
        functionName: 'clearCache',
        component: 'BusinessProfileCacheManager',
        info: { userId, businessId }
      });
      
      if (userId && businessId) {
        // Clear cache for specific user and business
        return businessProfileCacheService.invalidate(userId, businessId, 'profile') ? 1 : 0;
      } else if (userId) {
        // Clear cache for specific user
        return businessProfileCacheService.invalidateForUser(userId);
      } else if (businessId) {
        // Clear cache for specific business
        return businessProfileCacheService.invalidateForBusiness(businessId);
      } else {
        // Clear all cache
        return businessProfileCacheService.clear();
      }
    } catch (error) {
      return handleCacheError<number>(error, {
        context: {
          functionName: 'clearCache',
          component: 'BusinessProfileCacheManager',
          info: { userId, businessId }
        }
      });
    }
  }
  
  /**
   * Get cache statistics
   * 
   * @returns Cache statistics or error response
   */
  getCacheStats(): Record<string, unknown> | ApiResponse<Record<string, unknown>> {
    try {
      logger.logCacheOperation('stats', {
        functionName: 'getCacheStats',
        component: 'BusinessProfileCacheManager'
      });
      
      return businessProfileCacheService.getStats();
    } catch (error) {
      return handleCacheError<Record<string, unknown>>(error, {
        context: {
          functionName: 'getCacheStats',
          component: 'BusinessProfileCacheManager'
        }
      });
    }
  }
}

// Create and export a default instance
const cacheManager = new BusinessProfileCacheManager();
export default cacheManager;
