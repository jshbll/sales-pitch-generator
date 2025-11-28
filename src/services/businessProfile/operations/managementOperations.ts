/**
 * Business Profile Management Operations
 * 
 * This module contains operations related to creating and updating
 * business profiles.
 */
import apiService from '../../api';
import { ApiResponse, BusinessProfile } from '../../../types';
import { keysToCamel } from '../../../utils/camelCaseUtils';
import businessCircuitBreaker from '../../businessCircuitBreaker';
import { getDevelopmentBusinessProfile, logDevelopmentFallbackUsage } from '../utils/devMockData';
import enhancedCacheService from '../cache/enhancedCacheService';
import businessServiceDB from '../../businessServiceDB';

/**
 * Update an existing business profile
 * 
 * @param businessId Business profile ID
 * @param updateData Partial business profile data for update
 * @returns ApiResponse with updated business profile
 */
export async function updateBusinessProfile(
  businessId: string,
  updateData: Partial<BusinessProfile>
): Promise<ApiResponse<BusinessProfile>> {
  console.log('[BusinessProfileService] Updating business profile:', businessId);
  console.log('[BusinessProfileService] Update fields:', Object.keys(updateData).join(', '));
  
  // Validate business ID
  if (!businessId || typeof businessId !== 'string') {
    return {
      success: false,
      error: 'Invalid business ID',
      message: 'A valid business ID is required to update a business profile'
    };
  }
  
  try {
    // Ensure we have at least one field to update
    const dataToUpdate = { ...updateData };
    delete dataToUpdate.id; // Don't allow updating ID
    delete dataToUpdate.owner_id; // Don't allow updating owner
    delete dataToUpdate.createdAt; // Don't allow updating creation date
    delete dataToUpdate.viewLoadTimestamp; // This is only for client-side tracking
    
    // Keep banner_data_url and logo_data_url for backend processing
    // The backend will handle image upload and URL conversion
    // delete dataToUpdate.banner_data_url;
    // delete dataToUpdate.logo_data_url;
    
    // Remove frontend-only fields that don't belong in the database
    delete dataToUpdate.isFollowing;
    delete dataToUpdate.followerCount;
    delete dataToUpdate.timestamp;
    delete dataToUpdate.lastUpdated; // We'll add our own
    
    // Remove frontend-only fields that don't belong in the database
    // The backend API will handle field name mapping (phone->phone_number, zip->zip_code, etc.)
    
    // Remove fields that should be handled by the backend mapping logic
    // Don't map here - let the backend handle it to avoid conflicts
    
    // Only remove fields that truly don't belong in the API call
    if (dataToUpdate.coverPhotoUrl) {
      // This is a special case - backend expects banner_url
      dataToUpdate.banner_url = dataToUpdate.coverPhotoUrl;
      delete dataToUpdate.coverPhotoUrl;
    }
    
    console.log('[BusinessProfileService] Filtered update data keys:', Object.keys(dataToUpdate));
    console.log('[BusinessProfileService] 🔍 BEFORE API CALL - dataToUpdate:', dataToUpdate);
    console.log('[BusinessProfileService] 🔍 BEFORE API CALL - stringified:', JSON.stringify(dataToUpdate, null, 2));
    
    if (Object.keys(dataToUpdate).length === 0) {
      return {
        success: false,
        error: 'No fields to update',
        message: 'Please provide at least one field to update'
      };
    }
    
    // Add current timestamp for update tracking
    const updatedData = {
      ...dataToUpdate,
      lastUpdated: new Date().toISOString()
    };
    
    // Attempt to update with circuit breaker pattern
    const response = await businessCircuitBreaker.execute(async () => {
      // Remove duplicate /api/ prefix since API_BASE_URL already includes it
      return await apiService.put<BusinessProfile>(`businesses/${businessId}`, updatedData);
    });
    
    // Handle API response
    if (!response.success) {
      console.error('[BusinessProfileService] Error updating business profile:', response.error);
      return {
        success: false,
        error: 'Failed to update business profile',
        message: response.message || 'An unexpected error occurred'
      };
    }
    
    // Transform keys to camelCase
    const updatedBusinessData = keysToCamel(response.data) as BusinessProfile;
    
    // Update cache with new data instead of invalidating
    if (updatedBusinessData.id && updatedBusinessData.owner_id) {
      enhancedCacheService.set<BusinessProfile>(
        updatedBusinessData,
        updatedBusinessData.owner_id,
        updatedBusinessData.id,
        'profile'
      );
      console.log('[BusinessProfileService] Updated cache with new data for business:', businessId);
    }
    
    // Update the BusinessServiceDB cache as well
    businessServiceDB.updateBusinessProfileCache(updatedBusinessData);
    
    console.log('[BusinessProfileService] Cache updated with fresh data instead of invalidation');
    
    console.log('[BusinessProfileService] Successfully updated business profile');
    
    return {
      success: true,
      data: {
        ...updatedBusinessData,
        viewLoadTimestamp: Date.now()
      },
      message: 'Business profile updated successfully'
    };
  } catch (error) {
    console.error('[BusinessProfileService] Exception updating business profile:', error);
    
    return {
      success: false,
      error: 'Failed to update business profile',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}

/**
 * Create a new business profile
 * 
 * @param profileData Business profile data
 * @returns ApiResponse with created business profile
 */
export async function createBusinessProfile(
  profileData: Partial<BusinessProfile>
): Promise<ApiResponse<BusinessProfile>> {
  console.log('[BusinessProfileService] Creating new business profile');
  
  try {
    // Use profile data as-is - timestamps will be handled by database triggers
    const dataToCreate = {
      ...profileData
    };
    
    // Attempt to create with circuit breaker pattern
    const response = await businessCircuitBreaker.execute(async () => {
      // Remove duplicate /api/ prefix since API_BASE_URL already includes it
      return await apiService.post<BusinessProfile>('businesses', dataToCreate);
    });
    
    // Handle API response
    if (!response.success) {
      console.error('[BusinessProfileService] Error creating business profile:', response.error);
      return {
        success: false,
        error: 'Failed to create business profile',
        message: response.message || 'An unexpected error occurred'
      };
    }
    
    // Transform keys to camelCase
    const newBusinessData = keysToCamel(response.data) as BusinessProfile;
    
    // Invalidate cache since we've created a new business profile
    if (newBusinessData.id) {
      enhancedCacheService.invalidateForBusiness(newBusinessData.id);
      businessServiceDB.clearBusinessProfileCache();
      console.log('[BusinessProfileService] Invalidated cache for new business:', newBusinessData.id);
    }
    
    console.log('[BusinessProfileService] Successfully created business profile');
    console.log('[BusinessProfileService] New business ID:', newBusinessData.id);
    
    return {
      success: true,
      data: {
        ...newBusinessData,
        viewLoadTimestamp: Date.now()
      },
      message: 'Business profile created successfully'
    };
  } catch (error) {
    console.error('[BusinessProfileService] Exception creating business profile:', error);
    
    if (process.env.NODE_ENV === 'development') {
      logDevelopmentFallbackUsage('createBusinessProfile exception');
      
      return {
        success: true,
        data: {
          ...getDevelopmentBusinessProfile(),
          ...profileData,
          viewLoadTimestamp: Date.now()
        },
        warning: 'Using development fallback business profile due to error'
      };
    }
    
    return {
      success: false,
      error: 'Failed to create business profile',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}
