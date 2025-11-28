/**
 * Enhanced Business Profile Service
 * 
 * This service handles business profile operations with improved error handling,
 * validation, and type safety using our new utilities.
 * 
 * NOTE: This file is being maintained for backward compatibility.
 * New code should use the modular implementation in src/services/businessProfile/
 */
import { ApiResponse, BusinessProfile } from '../types';
import { User } from '../types/user';

// Import the refactored business profile service
import { businessProfileService } from './businessProfile';

/**
 * Enhanced Business Profile Service class
 * Provides methods for managing business profiles with improved error handling and validation
 */
export class EnhancedBusinessProfileService {
  /**
   * Get business profile for current user with enhanced error handling and validation
   * 
   * @param user - The authenticated user object
   * @returns ApiResponse with validated business profile data
   */
  async getCurrentUserBusiness(user: User | null): Promise<ApiResponse<BusinessProfile>> {
    // Delegate to the refactored implementation
    return businessProfileService.getCurrentUserBusiness(user);
  }
  
  /**
   * Update business profile with enhanced error handling and validation
   * 
   * @param businessId - The business ID
   * @param data - The business profile update data
   * @returns ApiResponse with the updated business profile
   */
  async updateBusinessProfile(
    businessId: string, 
    data: Partial<BusinessProfile>
  ): Promise<ApiResponse<BusinessProfile>> {
    // Delegate to the refactored implementation
    return businessProfileService.updateBusinessProfile(businessId, data);
  }
  
  // Removed unused deprecated method getDevelopmentBusinessProfile
  
  /**
   * Clear the business profile cache
   * 
   * @param userId - Optional user ID to clear cache for specific user
   * @param businessId - Optional business ID to clear cache for specific business
   * @returns Number of cache entries cleared
   */
  clearCache(userId?: string, businessId?: string): number {
    // Delegate to the refactored implementation
    const result = businessProfileService.clearCache(userId, businessId);
    return typeof result === 'number' ? result : 0;
  }
  
  /**
   * Get cache statistics
   * 
   * @returns Cache statistics
   */
  getCacheStats() {
    // Delegate to the refactored implementation
    return businessProfileService.getCacheStats();
  }
}

// Create and export a default instance
const enhancedBusinessProfileService = new EnhancedBusinessProfileService();
export default enhancedBusinessProfileService;
