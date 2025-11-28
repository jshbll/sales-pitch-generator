/**
 * COMPATIBILITY SHIM
 * 
 * This file exists solely to provide backward compatibility for legacy code
 * that imports from the old imageService.ts file. All functionality has been
 * migrated to the modular implementation in src/services/image/
 */

// Import from the modular implementation
import { uploadBusinessLogo } from './image/index';
import { ApiResponse, ImageUploadResponse as ModularImageUploadResponse } from './image/ImageServiceTypes';

// Re-export the BusinessProfile interface for backward compatibility
export interface BusinessProfile {
  id?: string;
  business_name?: string;
  logo_url?: string;
  logoUrl?: string;
  logo_id?: string;
  [key: string]: string | number | boolean | Date | object | undefined;
}

// Re-export the types with proper type annotations
export { uploadBusinessLogo };
export type { ApiResponse, ModularImageUploadResponse as ImageUploadResponse };

// Define interfaces for backward compatibility
interface ImageUploadResult {
  success: boolean;
  data?: {
    url?: string;
    id?: string;
    [key: string]: any;
  };
  error?: string;
}

interface DirectUploadUrlResponse {
  success: boolean;
  data?: {
    id: string;
    uploadURL: string;
  };
  error?: string;
  useFallback?: boolean;
}

// Create a compatibility imageService object
const imageService = {
  // Include the uploadBusinessLogo function for direct usage
  uploadBusinessLogo,
  
  // Stub for uploadImage method
  uploadImage: async (_imageData: string, _filename?: string, _metadata?: Record<string, any>): Promise<ImageUploadResult> => {
    console.warn('[ImageService] Legacy uploadImage method called. Please migrate to the new modular implementation.');
    return {
      success: false,
      error: 'This method is deprecated. Please use the new modular implementation.'
    };
  },
  
  // Stub for deleteImage method
  deleteImage: async (_imageId: string): Promise<ImageUploadResult> => {
    console.warn('[ImageService] Legacy deleteImage method called. Please migrate to the new modular implementation.');
    return {
      success: false,
      error: 'This method is deprecated. Please use the new modular implementation.'
    };
  },
  
  // Stub for generateDirectUploadUrl method
  generateDirectUploadUrl: async (): Promise<DirectUploadUrlResponse> => {
    console.warn('[ImageService] Legacy generateDirectUploadUrl method called. Please migrate to the new modular implementation.');
    return {
      success: false,
      error: 'This method is deprecated. Please use the new modular implementation.'
    };
  },
  
  // Stub for uploadDirectToCloudflare method
  uploadDirectToCloudflare: async (_file: File, _uploadURL: string): Promise<ImageUploadResult> => {
    console.warn('[ImageService] Legacy uploadDirectToCloudflare method called. Please migrate to the new modular implementation.');
    return {
      success: false,
      error: 'This method is deprecated. Please use the new modular implementation.'
    };
  }
};

export default imageService;
