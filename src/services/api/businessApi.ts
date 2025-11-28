/**
 * Business API Service
 * 
 * Clean, direct API integration for business operations.
 * This service focuses on API calls without complex caching or mock data.
 * 
 * @module businessApi
 * @version 2.0.0
 */

import apiService from '../api';
import { BusinessProfile, ApiResponse, BusinessCategory } from '../../types';
import { AUTH_TOKEN_KEY } from '../../utils/config';

/**
 * Business API endpoints
 */
const ENDPOINTS = {
  ME: '/businesses/me',
  BY_ID: (id: string) => `/businesses/${id}`,
  CREATE: '/businesses',
  UPDATE: (id: string) => `/businesses/${id}`,
  DELETE: (id: string) => `/businesses/${id}`,
  CATEGORIES: '/business-categories',
  SEARCH: '/businesses/search',
  FOLLOW: (id: string) => `/businesses/${id}/follow`,
  UNFOLLOW: (id: string) => `/businesses/${id}/unfollow`,
  UPLOAD_LOGO: (id: string) => `/businesses/${id}/logo`,
  UPLOAD_BANNER: (id: string) => `/businesses/${id}/banner`,
} as const;

/**
 * Business API Service Class
 * Provides direct API access for business operations
 */
class BusinessApi {
  /**
   * Get the current user's business profile
   * @returns Business profile data from the API
   */
  async getCurrentUserBusiness(): Promise<ApiResponse<BusinessProfile>> {
    try {
      const response = await apiService.get<{ success: boolean; business: BusinessProfile }>(ENDPOINTS.ME);
      
      if (response.success && response.data?.business) {
        // Transform the response to match our expected structure
        return {
          success: true,
          data: response.data.business,
          message: 'Business profile retrieved successfully'
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to retrieve business profile'
      };
    } catch (error) {
      console.error('[BusinessApi] Error fetching current user business:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch business profile'
      };
    }
  }

  /**
   * Get a business profile by ID
   * @param businessId The business ID to fetch
   * @returns Business profile data
   */
  async getBusinessById(businessId: string): Promise<ApiResponse<BusinessProfile>> {
    try {
      const response = await apiService.get<{ success: boolean; business: BusinessProfile }>(
        ENDPOINTS.BY_ID(businessId)
      );
      
      if (response.success && response.data?.business) {
        return {
          success: true,
          data: response.data.business,
          message: 'Business profile retrieved successfully'
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to retrieve business profile'
      };
    } catch (error) {
      console.error('[BusinessApi] Error fetching business by ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch business profile'
      };
    }
  }

  /**
   * Create a new business profile
   * @param profileData Business profile data to create
   * @returns Created business profile
   */
  async createBusiness(profileData: Partial<BusinessProfile>): Promise<ApiResponse<BusinessProfile>> {
    try {
      const response = await apiService.post<{ success: boolean; business: BusinessProfile }>(
        ENDPOINTS.CREATE,
        profileData
      );
      
      if (response.success && response.data?.business) {
        return {
          success: true,
          data: response.data.business,
          message: 'Business profile created successfully'
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to create business profile'
      };
    } catch (error) {
      console.error('[BusinessApi] Error creating business:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create business profile'
      };
    }
  }

  /**
   * Update an existing business profile
   * @param businessId Business ID to update
   * @param updateData Data to update
   * @returns Updated business profile
   */
  async updateBusiness(
    businessId: string, 
    updateData: Partial<BusinessProfile>
  ): Promise<ApiResponse<BusinessProfile>> {
    try {
      const response = await apiService.put<{ success: boolean; business: BusinessProfile }>(
        ENDPOINTS.UPDATE(businessId),
        updateData
      );
      
      if (response.success && response.data?.business) {
        return {
          success: true,
          data: response.data.business,
          message: 'Business profile updated successfully'
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to update business profile'
      };
    } catch (error) {
      console.error('[BusinessApi] Error updating business:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update business profile'
      };
    }
  }

  /**
   * Delete a business profile
   * @param businessId Business ID to delete
   * @returns Success response
   */
  async deleteBusiness(businessId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiService.delete<{ success: boolean }>(
        ENDPOINTS.DELETE(businessId)
      );
      
      if (response.success) {
        return {
          success: true,
          message: 'Business profile deleted successfully'
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to delete business profile'
      };
    } catch (error) {
      console.error('[BusinessApi] Error deleting business:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete business profile'
      };
    }
  }

  /**
   * Get all business categories
   * @returns List of business categories
   */
  async getBusinessCategories(): Promise<ApiResponse<BusinessCategory[]>> {
    try {
      const response = await apiService.get<BusinessCategory[]>(ENDPOINTS.CATEGORIES);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: 'Business categories retrieved successfully'
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to retrieve business categories'
      };
    } catch (error) {
      console.error('[BusinessApi] Error fetching business categories:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch business categories'
      };
    }
  }

  /**
   * Search businesses
   * @param query Search query
   * @param filters Optional filters
   * @returns Search results
   */
  async searchBusinesses(
    query: string, 
    filters?: {
      category?: string;
      city?: string;
      state?: string;
    }
  ): Promise<ApiResponse<BusinessProfile[]>> {
    try {
      const params = new URLSearchParams({ q: query });
      if (filters?.category) params.append('category', filters.category);
      if (filters?.city) params.append('city', filters.city);
      if (filters?.state) params.append('state', filters.state);
      
      const response = await apiService.get<{ success: boolean; businesses: BusinessProfile[] }>(
        `${ENDPOINTS.SEARCH}?${params.toString()}`
      );
      
      if (response.success && response.data?.businesses) {
        return {
          success: true,
          data: response.data.businesses,
          message: 'Search completed successfully'
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to search businesses'
      };
    } catch (error) {
      console.error('[BusinessApi] Error searching businesses:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search businesses'
      };
    }
  }

  /**
   * Follow a business
   * @param businessId Business ID to follow
   * @returns Success response
   */
  async followBusiness(businessId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiService.post<{ success: boolean }>(
        ENDPOINTS.FOLLOW(businessId),
        {}
      );
      
      if (response.success) {
        return {
          success: true,
          message: 'Business followed successfully'
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to follow business'
      };
    } catch (error) {
      console.error('[BusinessApi] Error following business:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to follow business'
      };
    }
  }

  /**
   * Unfollow a business
   * @param businessId Business ID to unfollow
   * @returns Success response
   */
  async unfollowBusiness(businessId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiService.delete<{ success: boolean }>(
        ENDPOINTS.UNFOLLOW(businessId)
      );
      
      if (response.success) {
        return {
          success: true,
          message: 'Business unfollowed successfully'
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to unfollow business'
      };
    } catch (error) {
      console.error('[BusinessApi] Error unfollowing business:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unfollow business'
      };
    }
  }

  /**
   * Check if the current user has a valid auth token
   * @returns true if authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  }
}

// Create and export singleton instance
const businessApi = new BusinessApi();
export default businessApi;