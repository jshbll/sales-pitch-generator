/**
 * Business Profile Repository
 * 
 * Implements the Repository Pattern to abstract data access for business profiles.
 * This follows the Dependency Inversion Principle by defining a high-level interface
 * that doesn't depend on low-level implementation details.
 */
import { ApiResponse, BusinessProfile } from '../../../types';
import { getFromApi, postToApi } from '../utils/apiUtils';
import configService from '../config/configService';
import logger from '../utils/loggerService';

/**
 * Business profile repository interface
 * Defines the contract for accessing business profile data
 */
export interface IBusinessProfileRepository {
  /**
   * Get business profile for current user
   * 
   * @returns Promise with business profile data
   */
  getCurrentUserProfile(): Promise<ApiResponse<BusinessProfile>>;
  
  /**
   * Get business profile by ID
   * 
   * @param businessId - The business ID
   * @returns Promise with business profile data
   */
  getProfileById(businessId: string): Promise<ApiResponse<BusinessProfile>>;
  
  /**
   * Update business profile
   * 
   * @param businessId - The business ID
   * @param data - The business profile update data
   * @returns Promise with updated business profile data
   */
  updateProfile(businessId: string, data: Record<string, unknown>): Promise<ApiResponse<BusinessProfile>>;
}

/**
 * API implementation of the business profile repository
 */
export class ApiBusinessProfileRepository implements IBusinessProfileRepository {
  /**
   * Get business profile for current user
   * 
   * @returns Promise with business profile data
   */
  async getCurrentUserProfile(): Promise<ApiResponse<BusinessProfile>> {
    const endpoint = configService.getApiEndpoint();
    
    logger.logApiRequest(endpoint, 'GET', {
      functionName: 'getCurrentUserProfile',
      component: 'ApiBusinessProfileRepository'
    });
    
    return getFromApi<BusinessProfile>(endpoint, {
      context: {
        functionName: 'getCurrentUserProfile',
        component: 'ApiBusinessProfileRepository'
      }
    });
  }
  
  /**
   * Get business profile by ID
   * 
   * @param businessId - The business ID
   * @returns Promise with business profile data
   */
  async getProfileById(businessId: string): Promise<ApiResponse<BusinessProfile>> {
    const endpoint = configService.getApiEndpoint(businessId);
    
    logger.logApiRequest(endpoint, 'GET', {
      functionName: 'getProfileById',
      component: 'ApiBusinessProfileRepository',
      info: { businessId }
    });
    
    return getFromApi<BusinessProfile>(endpoint, {
      context: {
        functionName: 'getProfileById',
        component: 'ApiBusinessProfileRepository',
        info: { businessId }
      }
    });
  }
  
  /**
   * Update business profile
   * 
   * @param businessId - The business ID
   * @param data - The business profile update data
   * @returns Promise with updated business profile data
   */
  async updateProfile(
    businessId: string, 
    data: Record<string, unknown>
  ): Promise<ApiResponse<BusinessProfile>> {
    const endpoint = configService.getApiEndpoint(businessId);
    
    logger.logApiRequest(endpoint, 'POST', {
      functionName: 'updateProfile',
      component: 'ApiBusinessProfileRepository',
      info: { businessId }
    });
    
    return postToApi<BusinessProfile>(endpoint, data, {
      context: {
        functionName: 'updateProfile',
        component: 'ApiBusinessProfileRepository',
        info: { businessId }
      }
    });
  }
}

/**
 * Factory for creating business profile repositories
 */
export class BusinessProfileRepositoryFactory {
  /**
   * Create a business profile repository
   * 
   * @returns Business profile repository
   */
  static createRepository(): IBusinessProfileRepository {
    return new ApiBusinessProfileRepository();
  }
}

// Create and export a default instance
const businessProfileRepository = BusinessProfileRepositoryFactory.createRepository();
export default businessProfileRepository;
