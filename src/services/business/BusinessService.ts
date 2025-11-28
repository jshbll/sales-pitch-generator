import { BusinessProfile, ApiResponse, User } from '../../types';
import apiService from '../apiService';

/**
 * Unified Business Service
 * Consolidates all business-related operations into a single, clear interface
 */
class BusinessService {
  constructor() {
    // Simple service without complex managers for now
  }

  /**
   * Get business profile by ID
   */
  async getBusinessProfile(businessId: string): Promise<ApiResponse<BusinessProfile>> {
    try {
      const response = await apiService.get<BusinessProfile>(`/businesses/${businessId}`);
      return response;
    } catch (error) {
      console.error('[BusinessService] Error fetching profile:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch business profile'
      };
    }
  }

  /**
   * Get current user's business profile
   */
  async getCurrentUserBusiness(user: User | null = null): Promise<ApiResponse<BusinessProfile>> {
    try {
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      const response = await apiService.get<BusinessProfile>('/businesses/me');
      return response;
    } catch (error) {
      console.error('[BusinessService] Error fetching current user business:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch business profile'
      };
    }
  }

  /**
   * Update business profile
   */
  async updateBusinessProfile(
    businessId: string, 
    updates: Partial<BusinessProfile>
  ): Promise<ApiResponse<BusinessProfile>> {
    try {
      const response = await apiService.put<BusinessProfile>(`/businesses/${businessId}`, updates);
      return response;
    } catch (error) {
      console.error('[BusinessService] Error updating profile:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update business profile'
      };
    }
  }

  /**
   * Create new business profile
   */
  async createBusinessProfile(profile: Partial<BusinessProfile>): Promise<ApiResponse<BusinessProfile>> {
    try {
      const response = await apiService.post<BusinessProfile>('/businesses', profile);
      return response;
    } catch (error) {
      console.error('[BusinessService] Error creating profile:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create business profile'
      };
    }
  }

  /**
   * Delete business profile
   */
  async deleteBusinessProfile(businessId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiService.delete<void>(`/businesses/${businessId}`);
      return response;
    } catch (error) {
      console.error('[BusinessService] Error deleting profile:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete business profile'
      };
    }
  }
}

// Export singleton instance
export default new BusinessService();