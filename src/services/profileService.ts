import apiService from './api';
import { ApiResponse, User } from '../types';

/**
 * Profile service for user profile management
 */
class ProfileService {
  /**
   * Get user profile
   */
  async getProfile(): Promise<ApiResponse<{ profile: User }>> {
    return apiService.get<{ profile: User }>('/users/me');
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }): Promise<ApiResponse<{ profile: User }>> {
    // Convert frontend camelCase to backend snake_case
    const requestData: Record<string, string | undefined> = {
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      phone_number: profileData.phoneNumber
    };

    // Remove undefined properties
    Object.keys(requestData).forEach(key => {
      if (requestData[key] === undefined) {
        delete requestData[key];
      }
    });

    return apiService.put<{ profile: User }>('/users/me', requestData);
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(file: File): Promise<ApiResponse<{ profile_image_url: string; profile_image_id: string }>> {
    try {
      // Convert file to data URL for unified image service
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Use unified image service for Cloudflare upload
      const { unifiedImageService } = await import('./unifiedImageService');
      const result = await unifiedImageService.uploadImage(
        dataUrl,
        `profile_${Date.now()}.jpg`,
        { type: 'profile', userId: 'current' }
      );

      if (result.success) {
        return {
          success: true,
          data: {
            profile_image_url: result.url,
            profile_image_id: result.imageId || ''
          }
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to upload profile image'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload profile image'
      };
    }
  }

  /**
   * Get user settings
   */
  async getSettings(): Promise<ApiResponse<{ settings: Record<string, boolean> }>> {
    return apiService.get<{ settings: Record<string, boolean> }>('/users/me/settings');
  }

  /**
   * Update user settings
   */
  async updateSettings(settings: Record<string, boolean>): Promise<ApiResponse<{ settings: Record<string, boolean> }>> {
    return apiService.put<{ settings: Record<string, boolean> }>('/users/me/settings', settings);
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<ApiResponse<{ success: boolean }>> {
    return apiService.delete<{ success: boolean }>('/users/me');
  }
}

// Create and export a singleton instance
export const profileService = new ProfileService();

export default profileService;
