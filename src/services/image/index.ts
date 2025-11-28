// Main image service (backward compatible)
import { ApiResponse, ImageUploadResponse } from './ImageServiceTypes';
import { DefaultUploadUrlProvider } from './UploadUrlProvider';
import { DefaultCloudflareUploader } from './CloudflareUploader';

const uploadUrlProvider = new DefaultUploadUrlProvider();
const cloudflareUploader = new DefaultCloudflareUploader();

export async function uploadBusinessLogo(businessId: string, file: File): Promise<ApiResponse<ImageUploadResponse>> {
  try {
    const { uploadUrl } = await uploadUrlProvider.getUploadUrl(businessId);
    const uploadResponse = await cloudflareUploader.uploadToCloudflare(file, uploadUrl);
    return {
      success: true,
      data: uploadResponse,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
