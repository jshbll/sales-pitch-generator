/**
 * Enhanced Business Profile Cache Manager
 * 
 * Provides a higher-level interface for caching business profile data
 * using the enhanced cache service.
 */
import { ApiResponse, BusinessProfile } from '../../../types';
import enhancedCacheService from '../cache/enhancedCacheService';
import { CACHE_KEY_PREFIXES, CacheEventType } from '../cache/cacheConfig';
import logger from '../utils/loggerService';

/**
 * Enhanced Business Profile Cache Manager class
 */
export class EnhancedBusinessProfileCacheManager {
  /**
   * Get a cached business profile
   * 
   * @param businessId - Business ID
   * @param userId - Optional user ID for user-specific caching
   * @returns Cached business profile or undefined
   */
  async getCachedBusinessProfile(
    businessId: string,
    userId?: string
  ): Promise<{ data: ApiResponse<BusinessProfile> | undefined; isStale: boolean }> {
    try {
      const cacheResult = await enhancedCacheService.get<ApiResponse<BusinessProfile>>(
        'BUSINESS_PROFILE',
        userId,
        businessId
      );
      
      // Handle case where cache returns undefined
      if (!cacheResult) {
        return { data: undefined, isStale: false };
      }
      
      const { data, isStale } = cacheResult;
      
      if (data) {
        // Add metadata to indicate if the data is stale
        const enhancedData = {
          ...data,
          metadata: {
            ...data.metadata,
            fromCache: true,
            isStale
          }
        };
        return { data: enhancedData, isStale };
      }
      
      return { data: undefined, isStale: false };
    } catch (error) {
      logger.warn('[EnhancedCacheManager] Error getting cached business profile', {
        businessId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { data: undefined, isStale: false };
    }
  }
  
  /**
   * Cache a business profile
   * 
   * @param businessId - Business ID
   * @param profile - Business profile response
   * @param userId - Optional user ID for user-specific caching
   * @returns True if the profile was cached
   */
  cacheBusinessProfile(
    businessId: string,
    profile: ApiResponse<BusinessProfile>,
    userId?: string
  ): boolean {
    try {
      // Don't cache failed responses
      if (!profile.success || !profile.data) {
        return false;
      }
      
      return enhancedCacheService.set(
        profile,
        'BUSINESS_PROFILE',
        userId,
        businessId
      );
    } catch (error) {
      logger.warn('[EnhancedCacheManager] Error caching business profile', {
        businessId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
  
  /**
   * Invalidate cached business profile
   * 
   * @param businessId - Business ID
   * @param userId - Optional user ID for user-specific invalidation
   * @returns True if the cache was invalidated
   */
  invalidateBusinessProfile(businessId: string, userId?: string): boolean {
    try {
      const result = enhancedCacheService.invalidate(
        'BUSINESS_PROFILE',
        userId,
        businessId
      );
      
      // Emit cache event
      enhancedCacheService.emit(CacheEventType.PROFILE_UPDATED, {
        businessId,
        userId
      });
      
      return result;
    } catch (error) {
      logger.warn('[EnhancedCacheManager] Error invalidating business profile cache', {
        businessId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
  
  /**
   * Invalidate all cached data for a business
   * 
   * @param businessId - Business ID
   * @returns Number of cache entries invalidated
   */
  invalidateBusinessData(businessId: string): number {
    try {
      const count = enhancedCacheService.invalidateForBusiness(businessId);
      
      // Emit cache event
      enhancedCacheService.emit(CacheEventType.PROFILE_UPDATED, {
        businessId
      });
      
      return count;
    } catch (error) {
      logger.warn('[EnhancedCacheManager] Error invalidating business data cache', {
        businessId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }
  
  /**
   * Invalidate all cached data for a user
   * 
   * @param userId - User ID
   * @returns Number of cache entries invalidated
   */
  invalidateUserData(userId: string): number {
    try {
      const count = enhancedCacheService.invalidateForUser(userId);
      
      return count;
    } catch (error) {
      logger.warn('[EnhancedCacheManager] Error invalidating user data cache', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }
  
  /**
   * Get cache statistics
   * 
   * @returns Cache statistics
   */
  getCacheStats(): Record<string, unknown> {
    return enhancedCacheService.getStats();
  }

  /**
   * Get total cache size
   * 
   * @returns Total number of cached items
   */
  async getCacheSize(): Promise<number> {
    try {
      const stats = enhancedCacheService.getStats();
      return (stats.totalItems as number) || 0;
    } catch (error) {
      logger.warn('[EnhancedCacheManager] Error getting cache size', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }

  /**
   * Clear all caches
   * 
   * @returns Number of items cleared
   */
  async clearAllCaches(): Promise<number> {
    try {
      const stats = enhancedCacheService.getStats();
      const totalItems = (stats.totalItems as number) || 0;
      
      // Clear the cache
      enhancedCacheService.clear();
      
      // Emit cache event
      enhancedCacheService.emit(CacheEventType.CLEAR_ALL, {});
      
      return totalItems;
    } catch (error) {
      logger.warn('[EnhancedCacheManager] Error clearing all caches', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }
}

// Create and export a default instance
const enhancedCacheManager = new EnhancedBusinessProfileCacheManager();
export default enhancedCacheManager;
