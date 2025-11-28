import { isCloudflareUrl } from '../utils/imageUtils';
import { ConvexClientManager } from './convexClientManager';
import { api } from '../../convex/_generated/api';

// Helper function to safely access environment variables in both Node.js and browser environments
const getEnv = (key: string): string => {
  // For Vite/browser environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env[key] as string) || '';
  }
  // Fallback for Node.js environment (SSR)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  return '';
};

// Default image placeholders
export const DEFAULT_BANNER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIj48L3JlY3Q+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0iIzg4OCIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2UgTG9hZGluZzwvdGV4dD48L3N2Zz4=';
export const DEFAULT_LOGO = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2YwZjBmMCI+PC9jaXJjbGU+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0iIzg4OCIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+TDwvdGV4dD48L3N2Zz4=';

// Interface for metadata that can be attached to images
export interface ImageMetadata {
  businessId?: string;
  promotionId?: string;
  promotionType?: string;
  userId?: string;
  type?: string;
  [key: string]: string | number | boolean | null | undefined;
}

// Fallback upload via Convex (old method)
const uploadViaConvex = async (
  imageData: string,
  filename?: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; url: string; imageId?: string; error?: string; errorType?: string }> => {
  console.log('[UnifiedImageService] Using fallback Convex upload');
  
  const convexClient = ConvexClientManager.getInstance();
  
  try {
    const result = await convexClient.action(api.images.uploadImageFromBase64, {
      dataUrl: imageData,
      filename: filename,
      metadata: metadata
    });
    
    if (result && result.url) {
      return { success: true, url: result.url, imageId: result.id };
    } else {
      return { 
        success: false, 
        url: '', 
        error: 'Invalid response from Convex action',
        errorType: 'api_error'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      url: '',
      error: error.message || 'Convex upload failed',
      errorType: 'api_error'
    };
  }
};

/**
 * Unified Image Service for handling all image-related operations
 * This service centralizes image upload, validation, and formatting
 */
export const unifiedImageService = {
  /**
   * Upload an image to Cloudflare and return the URL
   * 
   * @param imageData Base64 image data or existing URL
   * @param filename Desired filename (will be made unique)
   * @param metadata Optional metadata for the image
   * @returns Promise with the Cloudflare URL or error
   */
  async uploadImage(
    imageData: string,
    filename: string,
    metadata: Record<string, string | number | boolean | null> = {}
  ): Promise<{ success: boolean; url: string; imageId?: string; error?: string; errorType?: string }> {
    // Skip upload if it's already a Cloudflare URL
    if (isCloudflareUrl(imageData)) {
      console.log('[UnifiedImageService] Image is already a Cloudflare URL, skipping upload');
      return { success: true, url: imageData };
    }
    
    console.log(`[UnifiedImageService] Uploading image ${filename}`);
    
    try {
      // NEW: Use direct upload to Cloudflare via signed URL
      // This is more efficient and secure than uploading through Convex
      
      // Ensure imageData is a data URL string
      if (!imageData.startsWith('data:')) {
        console.error('[UnifiedImageService] Image data must be a data URL string');
        return { 
          success: false, 
          url: '', 
          error: 'Image data must be a data URL string',
          errorType: 'format_error'
        };
      }
      
      // Convert data URL to File object for direct upload
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Check for AVIF format which is not supported by Cloudflare for upload
      if (blob.type === 'image/avif' || filename.toLowerCase().endsWith('.avif')) {
        console.error('[UnifiedImageService] AVIF format is not supported for upload');
        return {
          success: false,
          url: '',
          error: 'AVIF format is not supported. If you\'re unable to upload image you can use https://picflow.com/image-converter to convert the image to JPG format',
          errorType: 'format_error'
        };
      }
      
      const file = new File([blob], filename, { type: blob.type });
      
      try {
        // Step 1: Get signed upload URL from Convex
        console.log('[UnifiedImageService] Requesting direct upload URL from Convex');
        const convexClient = ConvexClientManager.getInstance();
        
        const uploadUrlResult = await convexClient.action(api.images.getDirectUploadUrl, {
          filename: filename,
          metadata: metadata
        });
        
        console.log('[UnifiedImageService] Got direct upload URL, uploading to Cloudflare...');
        
        // Step 2: Upload directly to Cloudflare using the signed URL
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await fetch(uploadUrlResult.uploadURL, {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('[UnifiedImageService] Direct upload failed:', errorText);
          throw new Error(`Direct upload failed: ${uploadResponse.status} - ${errorText}`);
        }
        
        const uploadResult = await uploadResponse.json();
        console.log('[UnifiedImageService] Direct upload successful:', uploadResult);
        
        // Step 3: Generate the public URL using the image ID
        const accountHash = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_HASH;
        const imageUrl = `https://imagedelivery.net/${accountHash}/${uploadUrlResult.id}/public`;
        
        console.log('[UnifiedImageService] Upload successful via direct upload:', imageUrl);
        return {
          success: true,
          url: imageUrl,
          imageId: uploadUrlResult.id
        };
        
      } catch (directUploadError: any) {
        console.log('[UnifiedImageService] Direct upload failed, falling back to Convex upload:', directUploadError);
        
        // FALLBACK: Use the old Convex upload method if direct upload fails
        return await uploadViaConvex(imageData, filename, metadata);
      }
    } catch (error) {
      console.error('[UnifiedImageService] Exception during Convex image upload:', error);
      
      // Handle Convex/network errors
      let errorMessage = 'Exception during image upload via Convex';
      let errorType = 'convex_error';
      
      if (error instanceof Error) {
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
          errorType = 'network_error';
        } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
          errorMessage = 'Upload timed out. Please try again with a smaller image or check your connection.';
          errorType = 'timeout';
        } else if (error.message.includes('file size') || error.message.includes('too large')) {
          errorMessage = 'Image file size is too large. Maximum size is 5MB.';
          errorType = 'file_size';
        } else if (error.message.includes('Unsupported image type')) {
          errorMessage = 'Invalid image format. Please use JPEG, PNG, GIF, or WebP images. If you\'re unable to upload image you can use https://picflow.com/image-converter to convert the image to JPG format';
          errorType = 'format_error';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { 
        success: false, 
        url: '', 
        error: errorMessage,
        errorType: errorType
      };
    }
  },
  
  /**
   * A specialized version for promotion images
   * 
   * @param imageData Base64 image data or existing URL
   * @param businessId Business ID for the promotion
   * @param promotionId Optional promotion ID if known
   * @returns Promise with the Cloudflare URL or error
   */
  async uploadPromotionImage(
    imageData: string,
    businessId: string,
    promotionId?: string
  ): Promise<{ success: boolean; url: string; error?: string; errorType?: string }> {
    console.log(`[UnifiedImageService] Starting promotion image upload for business ${businessId}, promotion ${promotionId || 'new'}`);
    
    // First check if already a Cloudflare URL to avoid redundant uploads
    if (imageData && isCloudflareUrl(imageData)) {
      console.log('[UnifiedImageService] Promotion image is already a Cloudflare URL, skipping upload');
      return { success: true, url: imageData };
    }

    // Validate the image data format
    if (!imageData) {
      console.error('[UnifiedImageService] No image data provided for promotion image');
      return { 
        success: false, 
        url: '', 
        error: 'No image data provided for promotion',
        errorType: 'missing_data'
      };
    }

    // Additional validation for data URLs
    if (imageData.startsWith('data:')) {
      // Check for valid data URL format
      if (!imageData.includes(';base64,')) {
        console.error('[UnifiedImageService] Invalid data URL format for promotion image (missing base64 encoding)');
        return { 
          success: false, 
          url: '', 
          error: 'Invalid data URL format (missing base64 encoding)',
          errorType: 'format_error'
        };
      }
      
      // Check for valid image MIME type
      const validMimeTypes = ['data:image/jpeg', 'data:image/png', 'data:image/gif', 'data:image/webp'];
      const isValidMimeType = validMimeTypes.some(type => imageData.startsWith(type));
      
      if (!isValidMimeType) {
        console.error('[UnifiedImageService] Invalid image MIME type for promotion image');
        return { 
          success: false, 
          url: '', 
          error: 'Invalid image format. Use JPEG, PNG, GIF, or WebP images.',
          errorType: 'format_error'
        };
      }
    }
    
    // Generate a standardized filename with appropriate extension based on MIME type
    const timestamp = Date.now();
    const uniqueId = promotionId || `new_${timestamp}`;
    let extension = 'jpg'; // Default extension
    
    // Extract the correct extension based on MIME type
    if (imageData.startsWith('data:image/')) {
      const mimeType = imageData.substring(5, imageData.indexOf(';'));
      
      // Map MIME types to extensions
      const extensionMap: {[key: string]: string} = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp'
      };
      
      extension = extensionMap[mimeType] || 'jpg';
    }
    
    const filename = `promotion_${businessId}_${uniqueId}_${timestamp}.${extension}`;
    console.log(`[UnifiedImageService] Generated promotion image filename: ${filename}`);
    
    // Add promotion-specific metadata as Record<string, string | number | boolean | null>
    // to ensure type compatibility with uploadImage
    const metadata: Record<string, string | number | boolean | null> = {
      businessId,
      promotionId: promotionId || null, // Convert undefined to null for type compatibility
      type: 'promotion'
    };
    
    // Attempt to upload the image with enhanced error handling
    try {
      const result = await this.uploadImage(imageData, filename, metadata);
      
      if (result.success) {
        console.log(`[UnifiedImageService] Successfully uploaded promotion image: ${result.url.substring(0, 50)}...`);
      } else {
        console.error(`[UnifiedImageService] Failed to upload promotion image: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      console.error('[UnifiedImageService] Exception during promotion image upload:', error);
      return { 
        success: false, 
        url: '', 
        error: error instanceof Error ? `Promotion image upload failed: ${error.message}` : 'Unknown error during promotion image upload' 
      };
    }
  },
  
  /**
   * Format any image URL for display
   * Handles Cloudflare URLs, data URLs, and fallbacks
   * 
   * @param url The image URL to format
   * @returns A valid display URL or empty string
   */
  formatImageUrl(url: string | null | undefined): string {
    if (!url) {
      return '';
    }
    
    // 1. Cloudflare URLs are highest priority - use directly
    if (isCloudflareUrl(url)) {
      // Add cache busting parameter if not already present
      if (!url.includes('?')) {
        return `${url}?t=${Date.now()}`;
      }
      return url;
    }
    
    // 2. Data URLs - use directly but check for excessive length
    if (url.startsWith('data:')) {
      // Check for very long data URLs which might cause performance issues
      if (url.length > 100000) {
        console.warn('[UnifiedImageService] Very long data URL detected, using fallback');
        return DEFAULT_LOGO;
      }
      return url;
    }
    
    // 3. HTTP/HTTPS URLs - use directly
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 4. Relative URLs - assume they are from our API
    if (url.startsWith('/')) {
      const baseUrl = getEnv('VITE_API_BASE_URL');
      return `${baseUrl}${url}`;
    }
    
    // 5. Unknown format - log warning and return empty string
    console.warn('[UnifiedImageService] Invalid image URL format:', url.substring(0, 30));
    return '';
  },
  
  /**
   * Check if an image needs migration to Cloudflare
   * 
   * @param url The image URL to check
   * @returns Boolean indicating if migration is needed
   */
  needsMigration(url: string | null | undefined): boolean {
    if (!url) {
      return false;
    }
    
    // Already on Cloudflare
    if (isCloudflareUrl(url)) {
      return false;
    }
    
    // Data URLs need migration
    if (url.startsWith('data:')) {
      return true;
    }
    
    // Old S3 URLs need migration
    if (url.includes('amazonaws.com') || url.includes('s3.')) {
      return true;
    }
    
    // Old relative URLs need migration
    if (url.startsWith('/uploads/')) {
      return true;
    }
    
    // Default to not needing migration
    return false;
  },
  
  /**
   * Convert a data URL to a Blob
   * Helper method for image uploads
   * 
   * @param dataURL The data URL to convert
   * @returns A Blob object
   */
  dataURLtoBlob(dataURL: string): Blob {
    // Split the data URL to get the data part
    const parts = dataURL.split(';base64,');
    if (parts.length !== 2) {
      throw new Error('Invalid data URL format');
    }
    
    // Get the content type from the data URL
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    
    // Convert to Uint8Array
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    
    return new Blob([uInt8Array], { type: contentType });
  }
};

export default unifiedImageService;
