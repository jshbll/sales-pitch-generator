// Handles direct Cloudflare uploads
import { CloudflareUploader, ImageUploadResponse } from './ImageServiceTypes';
import { ImageUploadError } from './ImageServiceErrors';

export class DefaultCloudflareUploader implements CloudflareUploader {
  async uploadToCloudflare(file: File, uploadUrl: string): Promise<ImageUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new ImageUploadError('Failed to upload image to Cloudflare');
      }
      return await response.json();
    } catch (error: any) {
      throw new ImageUploadError(error.message || 'Unknown error uploading to Cloudflare');
    }
  }
}
