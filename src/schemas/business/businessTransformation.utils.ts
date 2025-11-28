/**
 * Business Transformation Utilities
 * 
 * Utility functions for transforming business profile data.
 * 
 * @version 1.0.0
 * @author JaxSaver Team
 */

/**
 * Transform raw business profile data to match the expected schema
 * 
 * @param data - The raw business profile data
 * @returns Transformed data that matches the schema format
 */
export function transformBusinessProfileData(data: Record<string, unknown>): Record<string, unknown> {
  const transformed = { ...data };
  
  // Handle common field name inconsistencies
  if ('zip_code' in data && typeof data.zip_code === 'string' && !('zip' in data)) {
    transformed.zip = data.zip_code;
  }
  
  if ('phone_number' in data && typeof data.phone_number === 'string' && !('phone' in data)) {
    transformed.phone = data.phone_number;
  }
  
  if ('contactEmail' in data && typeof data.contactEmail === 'string' && !('email' in data)) {
    transformed.email = data.contactEmail;
  }
  
  // Map logo fields - preserve logo_id and transform to logoId for camelCase compatibility
  if ('logo_id' in data && typeof data.logo_id === 'string') {
    transformed.logoId = data.logo_id; // Add camelCase version
    // Keep the original logo_id for components that expect snake_case
  }
  
  if ('logo_url' in data && typeof data.logo_url === 'string' && !('logoUrl' in data)) {
    transformed.logoUrl = data.logo_url; // Add camelCase version
  }

  // Map banner fields to cover photo fields for frontend compatibility
  if ('banner_url' in data && typeof data.banner_url === 'string' && !('coverPhotoUrl' in data)) {
    transformed.coverPhotoUrl = data.banner_url;
  }
  
  if ('banner_data_url' in data && typeof data.banner_data_url === 'string' && !('coverPhotoUrl' in data)) {
    transformed.coverPhotoUrl = data.banner_data_url;
  }
  
  // Also map bannerUrl (camelCase) to coverPhotoUrl for consistency
  if ('bannerUrl' in data && typeof data.bannerUrl === 'string' && !('coverPhotoUrl' in data)) {
    transformed.coverPhotoUrl = data.bannerUrl;
  }
  
  // Map banner_id for camelCase compatibility
  if ('banner_id' in data && typeof data.banner_id === 'string') {
    transformed.bannerId = data.banner_id; // Add camelCase version
  }
  
  // Transform business_hours to businessHours for frontend compatibility
  if ('business_hours' in data && !('businessHours' in data)) {
    transformed.businessHours = data.business_hours;
  }
  
  // Transform URLs to ensure they have proper protocol
  transformed.website = normalizeUrl(transformed.website);
  transformed.instagramUrl = normalizeUrl(transformed.instagramUrl);
  transformed.linkedinUrl = normalizeUrl(transformed.linkedinUrl);
  transformed.twitterUrl = normalizeUrl(transformed.twitterUrl);
  transformed.facebookUrl = normalizeUrl(transformed.facebookUrl);
  transformed.snapchatUrl = normalizeUrl(transformed.snapchatUrl);
  
  return transformed;
}

/**
 * Normalize a URL by ensuring it has a proper protocol
 * 
 * @param url - The URL to normalize
 * @returns The normalized URL
 */
export function normalizeUrl(url: unknown): string | undefined {
  if (typeof url !== 'string' || !url.trim()) {
    return url as string | undefined;
  }
  
  const trimmedUrl = url.trim();
  if (trimmedUrl && !trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return `https://${trimmedUrl}`;
  }
  
  return trimmedUrl;
}

/**
 * Normalize image URLs to ensure consistency
 * 
 * @param imageUrl - The image URL to normalize
 * @returns The normalized image URL
 */
export function normalizeImageUrl(imageUrl: unknown): string | undefined {
  if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
    return imageUrl as string | undefined;
  }
  
  // Handle Cloudflare URLs
  if (imageUrl.includes('cloudflare')) {
    return imageUrl;
  }
  
  // Handle data URLs
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Add https:// if missing
  return normalizeUrl(imageUrl);
}

/**
 * Convert camelCase to snake_case
 * 
 * @param str - The string to convert
 * @returns The snake_case string
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 * 
 * @param str - The string to convert
 * @returns The camelCase string
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Transform object keys from snake_case to camelCase
 * 
 * @param obj - The object to transform
 * @returns The transformed object with camelCase keys
 */
export function keysToCamel(obj: Record<string, unknown>): Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) {
    return obj as Record<string, unknown>;
  }
  
  const camelCaseObj: Record<string, unknown> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = snakeToCamel(key);
      const value = obj[key];
      
      // Recursively transform nested objects
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        camelCaseObj[camelKey] = keysToCamel(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        // Transform arrays of objects
        camelCaseObj[camelKey] = value.map(item => 
          typeof item === 'object' && item !== null 
            ? keysToCamel(item as Record<string, unknown>) 
            : item
        );
      } else {
        camelCaseObj[camelKey] = value;
      }
    }
  }
  
  return camelCaseObj;
}

/**
 * Transform object keys from camelCase to snake_case
 * 
 * @param obj - The object to transform
 * @returns The transformed object with snake_case keys
 */
export function keysToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) {
    return obj as Record<string, unknown>;
  }
  
  const snakeCaseObj: Record<string, unknown> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = camelToSnake(key);
      const value = obj[key];
      
      // Recursively transform nested objects
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        snakeCaseObj[snakeKey] = keysToSnake(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        // Transform arrays of objects
        snakeCaseObj[snakeKey] = value.map(item => 
          typeof item === 'object' && item !== null 
            ? keysToSnake(item as Record<string, unknown>) 
            : item
        );
      } else {
        snakeCaseObj[snakeKey] = value;
      }
    }
  }
  
  return snakeCaseObj;
}
