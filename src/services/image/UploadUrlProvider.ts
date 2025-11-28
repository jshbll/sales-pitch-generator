// Handles upload URL logic
import { UploadUrlProvider, UploadUrlResponse } from './ImageServiceTypes';
import { IMAGE_SERVICE_CONFIG } from './ImageServiceConfig';
import { UploadUrlError } from './ImageServiceErrors';

export class DefaultUploadUrlProvider implements UploadUrlProvider {
  async getUploadUrl(businessId: string): Promise<UploadUrlResponse> {
    try {
      const response = await fetch(`${IMAGE_SERVICE_CONFIG.apiBaseUrl}/business/${businessId}/logo/upload-url`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new UploadUrlError('Failed to get upload URL');
      }
      const data = await response.json();
      return {
        uploadUrl: data.uploadUrl,
        assetId: data.assetId,
      };
    } catch (error: any) {
      throw new UploadUrlError(error.message || 'Unknown error getting upload URL');
    }
  }
}
