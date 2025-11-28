/**
 * Business Profile Service Interface
 * 
 * Defines the contract for the business profile service.
 * This follows the Interface Segregation Principle by providing
 * focused interfaces for different aspects of the service.
 */
import { ApiResponse, BusinessProfile } from '../../../types';
import { User } from '../../../types/user';

/**
 * Business profile read operations interface
 */
export interface IBusinessProfileReadOperations {
  /**
   * Get business profile for current user
   * 
   * @param user - The authenticated user object
   * @returns ApiResponse with validated business profile data
   */
  getCurrentUserBusiness(user: User | null): Promise<ApiResponse<BusinessProfile>>;
  
  /**
   * Get business profile by ID
   * 
   * @param businessId - The business ID
   * @returns ApiResponse with the business profile
   */
  getBusinessProfileById(businessId: string): Promise<ApiResponse<BusinessProfile>>;
  
  /**
   * Get a development fallback business profile
   * 
   * @returns A mock business profile for development
   */
  getDevelopmentBusinessProfile(): BusinessProfile;
}

/**
 * Business profile write operations interface
 */
export interface IBusinessProfileWriteOperations {
  /**
   * Update business profile
   * 
   * @param businessId - The business ID
   * @param data - The business profile update data
   * @returns ApiResponse with the updated business profile
   */
  updateBusinessProfile(
    businessId: string, 
    data: Partial<BusinessProfile>
  ): Promise<ApiResponse<BusinessProfile>>;
}

/**
 * Business profile cache operations interface
 */
export interface IBusinessProfileCacheOperations {
  /**
   * Clear the business profile cache
   * 
   * @param userId - Optional user ID to clear cache for specific user
   * @param businessId - Optional business ID to clear cache for specific business
   * @returns Number of cache entries cleared or error response
   */
  clearCache(userId?: string, businessId?: string): number | ApiResponse<number>;
  
  /**
   * Get cache statistics
   * 
   * @returns Cache statistics or error response
   */
  getCacheStats(): Record<string, unknown> | ApiResponse<Record<string, unknown>>;
}

/**
 * Complete business profile service interface
 * Combines all business profile service operations
 */
export interface IBusinessProfileService extends 
  IBusinessProfileReadOperations,
  IBusinessProfileWriteOperations,
  IBusinessProfileCacheOperations {
}
