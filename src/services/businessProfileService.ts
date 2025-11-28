/**
 * Business Profile Service
 * 
 * This service handles business profile operations, including fetching,
 * creating, and updating business profiles.
 * 
 * REFACTORED: This service has been refactored to use a modular approach
 * with operations split into separate files for better maintainability.
 */
import { ApiResponse, BusinessProfile } from '../types';
import { User } from '../types/user';
import businessProfileManager from './businessProfile/businessProfileManager';
// Removed unused import: getDevelopmentBusinessProfile

/**
 * Business Profile Service class
 * Provides methods for managing business profiles
 * 
 * This is now a facade that delegates to the more modular implementations
 * in the businessProfile directory.
 */
export class BusinessProfileService {
  /**
   * Get business profile for current user with enhanced error handling and circuit breaker
   * @param user The authenticated user object
   * @returns ApiResponse with business profile data
   */
  async getCurrentUserBusiness(user: User | null): Promise<ApiResponse<BusinessProfile>> {
    // Delegate to the business profile manager
    return await businessProfileManager.getCurrentUserBusiness(user);
  }

  /**
   * Fetch a business profile by ID
   * @param businessId Business ID
   * @returns API response with business profile data
   */
  async fetchBusinessProfile(businessId: string): Promise<ApiResponse<BusinessProfile>> {
    // This method exists for backward compatibility
    return await businessProfileManager.getCurrentUserBusiness({ id: businessId, businessId } as User);
  }

  /**
   * Update an existing business profile
   * @param businessId Business ID
   * @param updateData Profile data to update
   * @returns API response with updated profile
   */
  async updateBusinessProfile(
    businessId: string, 
    updateData: Partial<BusinessProfile>
  ): Promise<ApiResponse<BusinessProfile>> {
    // Delegate to the business profile manager
    return await businessProfileManager.updateBusinessProfile(businessId, updateData);
  }

  /**
   * Create a new business profile
   * @param profileData Business profile data
   * @returns ApiResponse with created business profile
   */
  async createBusinessProfile(profileData: Partial<BusinessProfile>): Promise<ApiResponse<BusinessProfile>> {
    // Delegate to the business profile manager
    return await businessProfileManager.createBusinessProfile(profileData);
  }
  
  /**
   * Get development business profile for fallback
   * @returns A mock business profile for development
   * @deprecated Use getDevelopmentBusinessProfile from devMockData.ts instead
   */
  // Removed unused deprecated method getDevelopmentBusinessProfile
}

// Create and export a default instance
const businessProfileService = new BusinessProfileService();
export default businessProfileService;
