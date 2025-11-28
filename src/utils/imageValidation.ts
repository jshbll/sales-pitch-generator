/**
 * Image validation utility using magic bytes detection
 * Provides robust file type detection and validation for image uploads
 */

import { debugLog } from './debugLogger';

// Magic bytes for common image formats
export const IMAGE_MAGIC_BYTES = {
  PNG: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  JPEG: [0xFF, 0xD8, 0xFF],
  GIF: [0x47, 0x49, 0x46],
  WEBP_RIFF: [0x52, 0x49, 0x46, 0x46], // "RIFF" header
  WEBP_SIGNATURE: [0x57, 0x45, 0x42, 0x50], // "WEBP" at byte 8-11
  AVIF_FTYP: [0x66, 0x74, 0x79, 0x70], // "ftyp" at byte 4-7
  AVIF_BRAND: [0x61, 0x76, 0x69, 0x66], // "avif" brand
} as const;

// Supported image formats for Cloudflare Images
export const CLOUDFLARE_SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
export const CLOUDFLARE_SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'] as const;

export type SupportedImageFormat = typeof CLOUDFLARE_SUPPORTED_FORMATS[number];
export type SupportedImageExtension = typeof CLOUDFLARE_SUPPORTED_EXTENSIONS[number];

export interface ImageValidationResult {
  isValid: boolean;
  detectedFormat?: {
    mimeType: string;
    extension: string;
  };
  error?: string;
  shouldConvert?: boolean;
  suggestedMimeType?: string;
}

/**
 * Check if array starts with specific bytes
 */
function arrayStartsWith(array: Uint8Array, prefix: number[]): boolean {
  if (array.length < prefix.length) return false;
  for (let i = 0; i < prefix.length; i++) {
    if (array[i] !== prefix[i]) return false;
  }
  return true;
}

/**
 * Check if bytes at specific position match
 */
function bytesMatch(array: Uint8Array, position: number, bytes: number[]): boolean {
  if (array.length < position + bytes.length) return false;
  for (let i = 0; i < bytes.length; i++) {
    if (array[position + i] !== bytes[i]) return false;
  }
  return true;
}

/**
 * Manually detect image format from magic bytes
 * This is a fallback when file-type library fails
 */
export function detectImageFormatFromBytes(buffer: Uint8Array): ImageValidationResult {
  debugLog.images('Detecting image format from magic bytes', {
    bufferLength: buffer.length,
    first16Bytes: Array.from(buffer.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' ')
  });

  // Check PNG
  if (arrayStartsWith(buffer, IMAGE_MAGIC_BYTES.PNG)) {
    debugLog.images('Detected PNG format from magic bytes');
    return {
      isValid: true,
      detectedFormat: {
        mimeType: 'image/png',
        extension: 'png'
      }
    };
  }

  // Check JPEG
  if (arrayStartsWith(buffer, IMAGE_MAGIC_BYTES.JPEG)) {
    debugLog.images('Detected JPEG format from magic bytes');
    return {
      isValid: true,
      detectedFormat: {
        mimeType: 'image/jpeg',
        extension: 'jpg'
      }
    };
  }

  // Check GIF
  if (arrayStartsWith(buffer, IMAGE_MAGIC_BYTES.GIF)) {
    debugLog.images('Detected GIF format from magic bytes');
    return {
      isValid: true,
      detectedFormat: {
        mimeType: 'image/gif',
        extension: 'gif'
      }
    };
  }

  // Check WebP (RIFF header + WEBP signature)
  if (arrayStartsWith(buffer, IMAGE_MAGIC_BYTES.WEBP_RIFF) && 
      bytesMatch(buffer, 8, IMAGE_MAGIC_BYTES.WEBP_SIGNATURE)) {
    debugLog.images('Detected WebP format from magic bytes');
    return {
      isValid: true,
      detectedFormat: {
        mimeType: 'image/webp',
        extension: 'webp'
      }
    };
  }

  // Check AVIF (look for ftyp box and avif brand)
  if (buffer.length >= 12) {
    // AVIF files have "ftyp" at bytes 4-7 and may have "avif" brand
    if (bytesMatch(buffer, 4, IMAGE_MAGIC_BYTES.AVIF_FTYP)) {
      // Look for "avif" brand in the ftyp box
      const ftypBoxEnd = Math.min(buffer.length, 100); // Check first 100 bytes
      for (let i = 8; i < ftypBoxEnd - 4; i++) {
        if (bytesMatch(buffer, i, IMAGE_MAGIC_BYTES.AVIF_BRAND)) {
          debugLog.images('Detected AVIF format from magic bytes - NOT SUPPORTED');
          return {
            isValid: false,
            detectedFormat: {
              mimeType: 'image/avif',
              extension: 'avif'
            },
            error: 'AVIF format is not supported by Cloudflare Images. Please use PNG, JPEG, GIF, or WebP.'
          };
        }
      }
    }
  }

  debugLog.images('Could not detect image format from magic bytes');
  return {
    isValid: false,
    error: 'Unknown or unsupported image format'
  };
}

/**
 * Validate image file using magic bytes detection
 * Browser-compatible implementation that doesn't rely on external libraries
 */
export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  debugLog.images('Validating image file', {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size
  });

  try {
    // Read file as ArrayBuffer for magic bytes detection
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Use manual detection (browser-compatible)
    const manualResult = detectImageFormatFromBytes(buffer);
    
    if (manualResult.isValid && manualResult.detectedFormat) {
      debugLog.images('Magic bytes detection result:', manualResult);
      
      // Check if it's a supported format
      const isSupported = CLOUDFLARE_SUPPORTED_FORMATS.includes(manualResult.detectedFormat.mimeType as SupportedImageFormat);
      
      // Check if browser's file.type is wrong and needs correction
      const needsCorrection = file.type !== manualResult.detectedFormat.mimeType;
      
      if (needsCorrection) {
        debugLog.images('Browser MIME type needs correction', {
          browserType: file.type,
          actualType: manualResult.detectedFormat.mimeType
        });
      }
      
      return {
        isValid: isSupported,
        detectedFormat: manualResult.detectedFormat,
        error: isSupported ? undefined : `${manualResult.detectedFormat.mimeType} is not supported by Cloudflare Images`,
        suggestedMimeType: manualResult.detectedFormat.mimeType
      };
    } else {
      // If it's AVIF, return specific error
      if (manualResult.detectedFormat && manualResult.detectedFormat.mimeType === 'image/avif') {
        return {
          isValid: false,
          detectedFormat: manualResult.detectedFormat,
          error: 'AVIF format is not supported by Cloudflare Images. Please use PNG, JPEG, GIF, or WebP.'
        };
      }
      
      return manualResult; // Return the error result
    }

  } catch (error) {
    debugLog.images('Error validating image file:', error);
    
    // Fallback: Check file extension and browser MIME type
    const extension = file.name.split('.').pop()?.toLowerCase();
    const browserMimeType = file.type;
    
    // If we have a valid extension and MIME type, trust them
    if (extension && CLOUDFLARE_SUPPORTED_EXTENSIONS.includes(extension as SupportedImageExtension)) {
      const mimeTypeMap: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
      };
      
      const suggestedMimeType = mimeTypeMap[extension] || browserMimeType;
      
      return {
        isValid: true,
        detectedFormat: {
          mimeType: suggestedMimeType,
          extension: extension
        },
        suggestedMimeType: suggestedMimeType
      };
    }
    
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to validate image file'
    };
  }
}

/**
 * Convert file to base64 data URL with correct MIME type
 */
export async function fileToDataUrlWithValidation(file: File): Promise<{
  dataUrl: string;
  mimeType: string;
  isValid: boolean;
  error?: string;
}> {
  // Validate file first
  const validation = await validateImageFile(file);
  
  if (!validation.isValid) {
    return {
      dataUrl: '',
      mimeType: '',
      isValid: false,
      error: validation.error
    };
  }

  // Get the correct MIME type
  const correctMimeType = validation.suggestedMimeType || validation.detectedFormat?.mimeType || file.type;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        let dataUrl = e.target.result as string;
        
        // If the MIME type needs correction, update it in the data URL
        if (validation.suggestedMimeType && validation.suggestedMimeType !== file.type) {
          const base64Index = dataUrl.indexOf('base64,');
          if (base64Index !== -1) {
            const base64Data = dataUrl.substring(base64Index + 7);
            dataUrl = `data:${correctMimeType};base64,${base64Data}`;
            debugLog.images('Corrected data URL MIME type to:', correctMimeType);
          }
        }
        
        resolve({
          dataUrl,
          mimeType: correctMimeType,
          isValid: true
        });
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = (error) => {
      debugLog.images('FileReader error:', error);
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Batch validate multiple files
 */
export async function validateImageFiles(files: File[]): Promise<{
  validFiles: File[];
  invalidFiles: { file: File; error: string }[];
  needsCorrection: { file: File; correctMimeType: string }[];
}> {
  const validFiles: File[] = [];
  const invalidFiles: { file: File; error: string }[] = [];
  const needsCorrection: { file: File; correctMimeType: string }[] = [];

  for (const file of files) {
    const validation = await validateImageFile(file);
    
    if (validation.isValid) {
      validFiles.push(file);
      
      if (validation.suggestedMimeType && validation.suggestedMimeType !== file.type) {
        needsCorrection.push({
          file,
          correctMimeType: validation.suggestedMimeType
        });
      }
    } else {
      invalidFiles.push({
        file,
        error: validation.error || 'Invalid image format'
      });
    }
  }

  debugLog.images('Batch validation complete', {
    total: files.length,
    valid: validFiles.length,
    invalid: invalidFiles.length,
    needsCorrection: needsCorrection.length
  });

  return {
    validFiles,
    invalidFiles,
    needsCorrection
  };
}