// Types and interfaces for image service

export interface ImageUploadResponse {
  url: string;
  id: string;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  assetId: string;
}

export interface UploadUrlProvider {
  getUploadUrl(businessId: string): Promise<UploadUrlResponse>;
}

export interface CloudflareUploader {
  uploadToCloudflare(file: File, uploadUrl: string): Promise<ImageUploadResponse>;
}
