/**
 * Business Profile Service
 * 
 * Refactored service for managing business profiles with improved
 * modularity, error handling, and testability.
 * 
 * This implementation follows SOLID principles:
 * - Single Responsibility: Each class has a single responsibility
 * - Open/Closed: The service is open for extension but closed for modification
 * - Liskov Substitution: Implementations can be substituted for their interfaces
 * - Interface Segregation: Interfaces are focused on specific operations
 * - Dependency Inversion: High-level modules depend on abstractions
 * 
 * Further refactored to use manager classes for specific responsibilities:
 * - CacheManager: Handles all caching operations
 * - ValidationManager: Handles all validation operations
 * - DevelopmentManager: Handles all development and mock data operations
 */
import { User } from '../../types/user';
import { ApiResponse, BusinessProfile } from '../../types';
import { requireAuth } from './decorators/authDecorator';
import configService from './config/configService';
import { IBusinessProfileService } from './interfaces/businessProfileService.interface';

// Import manager classes
import cacheManager from './managers/cacheManager';
import developmentManager from './managers/developmentManager';

// Import extracted operation utilities
import {
  fetchBusinessProfileById,
  fetchCurrentUserProfile,
  updateBusinessProfileData
} from './operations/profileOperations';

/**
 * Business Profile Service class
 * Provides methods for managing business profiles with improved modularity
 * 
 * Implements the IBusinessProfileService interface to ensure it adheres to
 * the contract and can be easily substituted with other implementations.
 * 
 * This class has been refactored to use manager classes for specific responsibilities,
 * reducing its size and improving separation of concerns.
 */
export class BusinessProfileService implements IBusinessProfileService {
  /**
   * Get business profile for current user
   * 
   * This method has been refactored to use decorators for authentication
   * and extracted operation utilities for caching, validation, and API calls.
   * 
   * @param user - The authenticated user object
   * @returns ApiResponse with validated business profile data
   */
  @requireAuth<BusinessProfile>({
    requireBusinessRole: true,
    allowAdmin: true,
    developmentFallback: true
  })
  async getCurrentUserBusiness(user: User | null): Promise<ApiResponse<BusinessProfile>> {
    // Use the extracted operation utility with proper options
    return fetchCurrentUserProfile(
      user?.id,
      {
        functionName: 'getCurrentUserBusiness',
        user,
        includeTechnicalDetails: configService.isDetailedErrorsEnabled()
      }
    );
  }
  
  /**
   * Get a development fallback business profile
   * 
   * @returns A mock business profile for development
   */
  getDevelopmentBusinessProfile(): BusinessProfile {
    return developmentManager.getDevelopmentBusinessProfile();
  }
  
  /**
   * Update business profile
   * 
   * Refactored to use extracted operation utility for validation,
   * updating the profile, and managing cache.
   * 
   * @param businessId - The business ID
   * @param data - The business profile update data
   * @returns ApiResponse with the updated business profile
   */
  async updateBusinessProfile(
    businessId: string, 
    data: Partial<BusinessProfile>
  ): Promise<ApiResponse<BusinessProfile>> {
    return updateBusinessProfileData(
      businessId,
      data,
      {
        functionName: 'updateBusinessProfile',
        businessId,
        includeTechnicalDetails: configService.isDetailedErrorsEnabled()
      }
    );
  }
  
  /**
   * Clear the business profile cache
   * 
   * @param userId - Optional user ID to clear cache for specific user
   * @param businessId - Optional business ID to clear cache for specific business
   * @returns Number of cache entries cleared or error response
   */
  clearCache(userId?: string, businessId?: string): number | ApiResponse<number> {
    return cacheManager.clearCache(userId, businessId);
  }
  
  /**
   * Get cache statistics
   * 
   * @returns Cache statistics or error response
   */
  getCacheStats(): Record<string, unknown> | ApiResponse<Record<string, unknown>> {
    return cacheManager.getCacheStats();
  }
  
  /**
   * Get business profile by ID
   * 
   * Refactored to use extracted operation utility for caching,
   * validation, and API calls.
   * 
   * @param businessId - The business ID
   * @returns ApiResponse with the business profile
   */
  async getBusinessProfileById(businessId: string): Promise<ApiResponse<BusinessProfile>> {
    return fetchBusinessProfileById(
      businessId,
      {
        functionName: 'getBusinessProfileById',
        businessId,
        includeTechnicalDetails: configService.isDetailedErrorsEnabled()
      }
    );
  }
  
  // No private helper methods needed anymore as they've been moved to manager classes
}

// Create and export a default instance
const businessProfileService = new BusinessProfileService();
export default businessProfileService;
