import { BusinessProfile, ApiResponse, BusinessCategory, User } from '../types';
import { uploadBusinessLogo } from './image';
import businessServiceDB from './businessServiceDB';
import { businessService } from './serviceSelector';
import { withRetry, withOptimisticUpdate, parseApiError, OptimisticUpdateHandlers } from '../utils/apiUtils';

/**
 * Enhanced Business Service
 * Extends the standard business service with advanced features:
 * - Retry logic for network failures
 * - Optimistic updates for better UX
 * - Better error handling and standardized errors
 */
class EnhancedBusinessService {
  /**
   * Get business categories with retry logic
   * @returns ApiResponse with business categories array
   */
  async getBusinessCategories(): Promise<ApiResponse<BusinessCategory[]>> {
    try {
      // businessServiceDB doesn't have getBusinessCategories, use businessService instead
      return await withRetry(() => businessService.getBusinessCategories(), {
        maxRetries: 2,
        retryDelay: 800
      });
    } catch (error) {
      console.error('[EnhancedBusinessService] Error fetching business categories:', error);
      const parsedError = parseApiError(error);
      return {
        success: false,
        message: 'Failed to fetch business categories',
        error: parsedError.message
      };
    }
  }

  /**
   * Get business profile for current user with retry logic
   * @param user User object
   * @returns ApiResponse with business profile data
   */
  async getCurrentUserBusiness(user: User | null): Promise<ApiResponse<BusinessProfile>> {
    try {
      return await withRetry(() => businessServiceDB.getCurrentUserBusiness(user), {
        // Only retry on network errors, not on 404 (user has no business)
        shouldRetry: (err) => {
          // Don't retry if error is 404 (no business profile)
          if (err?.response?.status === 404) {
            return false;
          }
          // Use default retry logic for other errors
          return !err.response || (err.response.status >= 500 && err.response.status < 600);
        }
      });
    } catch (error) {
      console.error('[EnhancedBusinessService] Error retrieving current user business profile:', error);
      const parsedError = parseApiError(error);
      
      // Special handling for 404 to make it more user-friendly
      if ((error as any)?.response?.status === 404) {
        return {
          success: false,
          message: 'No business profile found for this user',
          error: 'No business profile found'
        };
      }
      
      return {
        success: false,
        message: 'Failed to retrieve business profile',
        error: parsedError.message
      };
    }
  }

  /**
   * Create a new business profile with retry and optimistic updates
   * @param user User object
   * @param profileData The business profile data to create
   * @param optimisticHandlers Optional handlers for optimistic updates
   * @returns ApiResponse with the created business profile
   */
  async createBusinessProfile(
    _user: User | null,
    profileData: Record<string, any>,
    optimisticHandlers?: OptimisticUpdateHandlers<Record<string, any>>
  ): Promise<ApiResponse<BusinessProfile>> {
    try {
      if (optimisticHandlers) {
        // Execute with optimistic update
        return await withOptimisticUpdate(
          () => businessService.createBusinessProfile(profileData),
          optimisticHandlers,
          profileData
        );
      } else {
        // Regular execution with retry
        return await withRetry(() => businessService.createBusinessProfile(profileData));
      }
    } catch (error) {
      console.error('[EnhancedBusinessService] Error creating business profile:', error);
      const parsedError = parseApiError(error);
      return {
        success: false,
        message: 'Failed to create business profile',
        error: parsedError.message
      };
    }
  }

  /**
   * Update an existing business profile with retry and optimistic updates
   * @param _user User object 
   * @param businessId The ID of the business to update
   * @param profileData The partial profile data with updates
   * @param optimisticHandlers Optional handlers for optimistic updates
   * @returns ApiResponse with the updated business profile
   */
  async updateBusinessProfile(
    _user: User | null, // user parameter is kept for the signature, but not passed down
    businessId: string,
    profileData: Record<string, any>,
    optimisticHandlers?: OptimisticUpdateHandlers<Record<string, any>>
  ): Promise<ApiResponse<BusinessProfile>> {
    try {
      if (optimisticHandlers) {
        // Execute with optimistic update
        return await withOptimisticUpdate(
          () => businessService.updateBusinessProfile(businessId, profileData),
          optimisticHandlers,
          profileData
        );
      } else {
        // Regular execution with retry
        return await withRetry(() => businessService.updateBusinessProfile(businessId, profileData));
      }
    } catch (error) {
      console.error('[EnhancedBusinessService] Error updating business profile:', error);
      const parsedError = parseApiError(error);
      return {
        success: false,
        message: 'Failed to update business profile',
        error: parsedError.message
      };
    }
  }
  
  /**
   * Upload business logo with optimistic update and retry
   * @param businessId Business ID
   * @param logoData FormData containing the logo image
   * @param optimisticHandlers Optional handlers for optimistic updates
   * @returns ApiResponse with upload result
   */
  async uploadBusinessLogo(
    businessId: string, 
    logoData: FormData,
    optimisticHandlers?: OptimisticUpdateHandlers<string>
  ): Promise<ApiResponse<any>> {
    try {
      // Extract the file from FormData
      const file = logoData.get('file') as File;
      if (!file || !(file instanceof File)) {
        throw new Error('No valid file found in FormData');
      }

      if (optimisticHandlers) {
        // Execute with optimistic update - logoUrl could be a temporary blob URL
        return await withOptimisticUpdate(
          () => uploadBusinessLogo(businessId, file),
          optimisticHandlers,
          URL.createObjectURL(file)
        );
      } else {
        // Regular execution with retry
        return await withRetry(() => uploadBusinessLogo(businessId, file));
      }
    } catch (error) {
      console.error('[EnhancedBusinessService] Error uploading business logo:', error);
      const parsedError = parseApiError(error);
      return {
        success: false,
        message: 'Failed to upload business logo',
        error: parsedError.message
      };
    }
  }
  
  /**
   * Upload business banner with optimistic update and retry
   * @param businessId Business ID
   * @param bannerData FormData containing the banner image
   * @param optimisticHandlers Optional handlers for optimistic updates
   * @returns ApiResponse with upload result
   */
  async uploadBusinessBanner(
    businessId: string, 
    bannerData: FormData,
    optimisticHandlers?: OptimisticUpdateHandlers<string>
  ): Promise<ApiResponse<any>> {
    try {
      // Extract the file from FormData
      const file = bannerData.get('file') as File;
      if (!file || !(file instanceof File)) {
        throw new Error('No valid file found in FormData');
      }

      if (optimisticHandlers) {
        // Execute with optimistic update - bannerUrl could be a temporary blob URL
        return await withOptimisticUpdate(
          () => uploadBusinessLogo(businessId, file), // Using logo upload as banner upload
          optimisticHandlers,
          URL.createObjectURL(file)
        );
      } else {
        // Regular execution with retry
        return await withRetry(() => uploadBusinessLogo(businessId, file)); // Using logo upload as banner upload
      }
    } catch (error) {
      console.error('[EnhancedBusinessService] Error uploading business banner:', error);
      const parsedError = parseApiError(error);
      return {
        success: false,
        message: 'Failed to upload business banner',
        error: parsedError.message
      };
    }
  }
}

// Create and export a singleton instance
export default new EnhancedBusinessService();
