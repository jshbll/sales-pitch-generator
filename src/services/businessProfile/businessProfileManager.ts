/**
 * Business Profile Manager
 * 
 * This module serves as a centralized interface for business profile operations.
 * 
 * Enhanced with improved caching strategies:
 * - Time-based cache expiration
 * - Stale-while-revalidate pattern
 * - Granular cache invalidation
 * - Cache analytics
 */
import { ApiResponse, BusinessProfile } from '../../types';
import { User } from '../../types/user';
import { getCurrentUserBusiness } from './operations/userBusinessOperations';
import { 
  updateBusinessProfile, 
  createBusinessProfile 
} from './operations/managementOperations';
import enhancedCacheManager from './managers/enhancedCacheManager';
import cacheAnalytics from './utils/cacheAnalytics';
import logger from './utils/loggerService';

/**
 * Business Profile Manager class
 * Provides a unified interface for all business profile operations
 * with enhanced caching capabilities
 */
export class BusinessProfileManager {
  /**
   * Get business profile for current user
   * @param user The authenticated user
   * @returns Business profile data
   */
  async getCurrentUserBusiness(user: User | null): Promise<ApiResponse<BusinessProfile>> {
    return await getCurrentUserBusiness(user);
  }
  
  /**
   * Update an existing business profile
   * @param businessId Business ID
   * @param updateData Business profile update data
   * @returns Updated business profile
   */
  async updateBusinessProfile(
    businessId: string,
    updateData: Partial<BusinessProfile>
  ): Promise<ApiResponse<BusinessProfile>> {
    return await updateBusinessProfile(businessId, updateData);
  }
  
  /**
   * Create a new business profile
   * @param profileData Business profile data
   * @returns Created business profile
   */
  async createBusinessProfile(
    profileData: Partial<BusinessProfile>
  ): Promise<ApiResponse<BusinessProfile>> {
    return await createBusinessProfile(profileData);
  }
  
  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getCacheStats(): Record<string, unknown> {
    return enhancedCacheManager.getCacheStats();
  }
  
  /**
   * Invalidate all cache entries for a business
   * @param businessId Business ID
   * @returns Number of cache entries invalidated
   */
  invalidateBusinessCache(businessId: string): number {
    logger.info('Invalidating all cache entries for business', {
      businessId,
      functionName: 'invalidateBusinessCache'
    });
    
    return enhancedCacheManager.invalidateBusinessData(businessId);
  }
  
  /**
   * Log cache analytics
   */
  logCacheAnalytics(): void {
    cacheAnalytics.logSummary();
  }
}

// Create and export a default instance
const businessProfileManager = new BusinessProfileManager();
export default businessProfileManager;
