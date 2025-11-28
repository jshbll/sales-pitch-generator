/**
 * Business Image Service
 * 
 * This service handles business image operations, including uploading
 * images to Cloudflare and managing image URLs.
 */
import apiService from './api';
import { ApiResponse, BusinessProfile } from '../types';
import { User } from '../types/user';
import businessCircuitBreaker from './businessCircuitBreaker';

/**
 * Business Image Service class
 * Provides methods for managing business images
 */
export class BusinessImageService {
  /**
   * Update business image in storage (for frontend caching purposes)
   * @param imageType The type of image ('logo' or 'banner')
   * @param businessId The ID of the business
   * @returns void
   */
  async updateBusinessImageInStorage(imageType: 'logo' | 'banner', businessId: string = ''): Promise<void> {
    // This method is called after an image upload completes successfully
    if (!businessId) {
      console.warn('[BusinessImageService] No business ID provided for image storage update');
      return;
    }

    try {
      // Get the current business profile from localStorage if available
      const storedBusinessData = localStorage.getItem(`business_${businessId}`);
      if (!storedBusinessData) {
        console.log('[BusinessImageService] No stored business data found for image update');
        return;
      }

      const businessData = JSON.parse(storedBusinessData);
      
      // Fetch the latest business profile from the API to get the updated image URL
      const response = await apiService.get(`/businesses/${businessId}`);
      
      if (response.success && response.data) {
        const updatedBusiness = response.data as BusinessProfile;
        
        // Update the image URL in the stored business data
        if (imageType === 'logo' && updatedBusiness.logo_url) {
          businessData.logo_url = updatedBusiness.logo_url;
          console.log('[BusinessImageService] Updated logo URL in storage:', updatedBusiness.logo_url);
        } else if (imageType === 'banner' && updatedBusiness.banner_url) {
          businessData.banner_url = updatedBusiness.banner_url;
          console.log('[BusinessImageService] Updated banner URL in storage:', updatedBusiness.banner_url);
        }
        
        // Save the updated business data back to localStorage
        localStorage.setItem(`business_${businessId}`, JSON.stringify(businessData));
      } else {
        console.warn('[BusinessImageService] Failed to fetch updated business profile for image update');
      }
    } catch (error) {
      console.error('[BusinessImageService] Error updating business image in storage:', error);
    }
  }

  /**
   * Upload a logo image for a business using Cloudflare Images Direct Upload
   * @param businessId The ID of the business
   * @param file The file to upload
   * @param user The authenticated user object
   * @returns ApiResponse with the updated business profile data
   */
  async uploadLogo(businessId: string, file: File, user: User | null): Promise<ApiResponse<BusinessProfile>> {
    console.log('[BusinessImageService] Uploading logo for business:', businessId);
    
    if (!user) {
      console.error('[BusinessImageService] No authenticated user for logo upload');
      return {
        success: false,
        error: 'Authentication required'
      };
    }
    
    if (!businessId) {
      console.error('[BusinessImageService] No business ID provided for logo upload');
      return {
        success: false,
        error: 'Business ID is required'
      };
    }
    
    if (!file) {
      console.error('[BusinessImageService] No file provided for logo upload');
      return {
        success: false,
        error: 'File is required'
      };
    }
    
    try {
      // First, get a one-time upload URL from our backend
      console.log('[BusinessImageService] Requesting Cloudflare upload URL');
      const uploadUrlResponse = await apiService.get('/images/upload-url');
      
      if (!uploadUrlResponse.success || !uploadUrlResponse.data) {
        console.error('[BusinessImageService] Failed to get Cloudflare upload URL:', uploadUrlResponse.error);
        return {
          success: false,
          error: 'Failed to get upload URL'
        };
      }
      
      const { uploadURL, id } = uploadUrlResponse.data as { uploadURL: string; id: string };
      
      if (!uploadURL) {
        console.error('[BusinessImageService] No upload URL received');
        return {
          success: false,
          error: 'Invalid upload URL'
        };
      }
      
      // Create a FormData object to send the file to Cloudflare
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload the file directly to Cloudflare
      console.log('[BusinessImageService] Uploading file to Cloudflare');
      const uploadResponse = await fetch(uploadURL, {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        console.error('[BusinessImageService] Cloudflare upload failed:', await uploadResponse.text());
        return {
          success: false,
          error: 'Image upload failed'
        };
      }
      
      const uploadResult = await uploadResponse.json();
      console.log('[BusinessImageService] Cloudflare upload successful:', uploadResult);
      
      // Now update the business profile with the new logo ID
      console.log('[BusinessImageService] Updating business profile with new logo ID:', id);
      const updateResponse = await apiService.patch(`/businesses/${businessId}`, {
        logo: id
      });
      
      if (!updateResponse.success) {
        console.error('[BusinessImageService] Failed to update business profile with logo:', updateResponse.error);
        return {
          success: false,
          error: 'Failed to update business profile with logo'
        };
      }
      
      // Update the image in local storage
      this.updateBusinessImageInStorage('logo', businessId);
      
      // Clear the business profile cache to ensure we get the updated profile next time
      businessCircuitBreaker.clearBusinessProfileCache();
      
      // Record success in the circuit breaker
      businessCircuitBreaker.recordSuccess();
      
      return {
        success: true,
        data: updateResponse.data as BusinessProfile
      };
    } catch (error) {
      console.error('[BusinessImageService] Error uploading logo:', error);
      
      // Record failure in the circuit breaker
      businessCircuitBreaker.recordFailure();
      
      return {
        success: false,
        error: 'Failed to upload logo'
      };
    }
  }

  /**
   * Get a reliable logo URL for a business
   * @param businessProfile The business profile
   * @returns A reliable logo URL or a default placeholder
   */
  getReliableLogo(businessProfile: BusinessProfile | null): string {
    if (!businessProfile) {
      return this.getDefaultLogoPlaceholder();
    }
    
    // Try to get the logo URL from the business profile
    const logoUrl = businessProfile.logo_url || '';
    
    if (logoUrl && logoUrl.trim() !== '') {
      return logoUrl;
    }
    
    return this.getDefaultLogoPlaceholder();
  }

  /**
   * Get a default logo placeholder
   * @returns A default logo placeholder URL
   */
  getDefaultLogoPlaceholder(): string {
    // Using a data URI instead of an external service for reliability
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2U2ZTZlNiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9nbzwvdGV4dD48L3N2Zz4=';
  }
}

// Create and export a default instance
const businessImageService = new BusinessImageService();
export default businessImageService;
