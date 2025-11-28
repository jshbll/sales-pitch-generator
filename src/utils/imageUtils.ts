/**
 * Utility functions for handling image URLs
 */

import { debugLog } from './debugLogger';

// API base URL for the backend server
const API_BASE_URL = 'http://localhost:8080';

// Cloudflare account configuration
export const CLOUDFLARE_ACCOUNT_ID = 'O5xSC37lvKr01NMd5n69gQ';
export const CLOUDFLARE_BASE_URL = 'https://imagedelivery.net';

/**
 * Validates and cleans an image URL to prevent duplication issues
 * Especially useful for Cloudflare URLs that might get nested
 * 
 * @param url The image URL to validate
 * @returns A cleaned and validated image URL
 */
export const validateImageUrl = (url: string | null | undefined): string => {
  if (!url) {
    return '';
  }
  
  debugLog.images(`Validating URL: ${url.substring(0, 50)}${url.length > 50 ? '...' : ''}`);
  
  // If it's not a Cloudflare URL, return as is
  if (!url.includes('imagedelivery.net')) {
    return url;
  }
  
  // Check for duplicate Cloudflare URLs (URL contains multiple occurrences of imagedelivery.net)
  const occurrences = (url.match(/imagedelivery\.net/g) || []).length;
  
  if (occurrences > 1) {
    debugLog.images('Detected duplicated URL with multiple occurrences of imagedelivery.net');
    
    // Extract the image ID using a regex pattern for UUIDs
    const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
    const match = url.match(uuidPattern);
    
    if (match && match[1]) {
      const extractedId = match[1];
      debugLog.images(`Extracted image ID: ${extractedId}`);
      
      // Construct a clean Cloudflare URL
      const cleanUrl = `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${extractedId}/public`;
      debugLog.images(`Cleaned URL: ${cleanUrl}`);
      return cleanUrl;
    }
  }
  
  // Fix double slash issue in Cloudflare URLs
  if (url.includes('imagedelivery.net//')) {
    const fixedUrl = url.replace('imagedelivery.net//', 'imagedelivery.net/');
    debugLog.images(`Fixed double slash URL: ${fixedUrl}`);
    return fixedUrl;
  }
  
  // Check if URL is missing account hash
  if (url.includes('imagedelivery.net/') && 
      !url.includes(`imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}`)) {
    // Only try to fix if we have an image ID after the double slash
    const parts = url.split('/');
    // Look for a UUID-like part that would be the image ID
    const potentialImageId = parts.find(part => 
      part.length > 10 && part.includes('-') && part !== 'imagedelivery.net'
    );
    
    if (potentialImageId) {
      const properUrl = `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${potentialImageId}/public`;
      debugLog.images(`Reconstructed proper URL: ${properUrl}`);
      return properUrl;
    }
  }
  
  return url;
};

/**
 * Generate a Cloudflare image URL from just an image ID (Primary function - use this for new code)
 * 
 * @param imageId The Cloudflare image ID
 * @param variant The image variant (default: 'public')
 * @returns The full Cloudflare image URL
 */
export function getCloudflareImageUrl(imageId: string | null | undefined, variant: string = 'public'): string {
  // Define a reliable fallback image
  const FALLBACK_URL = 'https://imagedelivery.net/O5xSC37lvKr01NMd5n69gQ/f1db3e74-ca9b-415e-b70a-5a08ff74f000/public';
  
  // Log attempt to get a Cloudflare URL
  debugLog.images(`Attempting to get image URL for ID: ${imageId || 'undefined'}`);
  
  if (!imageId) {
    debugLog.images('No image ID provided, using fallback');
    return FALLBACK_URL;
  }
  
  // All image IDs are real Cloudflare image IDs - no placeholders
  
  // CRITICAL FIX: If the imageId is the account ID, this is a common mistake in the database
  // Check if the imageId matches the Cloudflare account ID
  if (imageId === CLOUDFLARE_ACCOUNT_ID) {
    debugLog.images('Image ID is actually the account ID, using fallback');
    return FALLBACK_URL;
  }
  
  // Special log for valid UUIDs
  if (imageId.length > 30 && imageId.includes('-')) {
    debugLog.images(`Valid-looking UUID detected: ${imageId}`);
  }
  
  // If the imageId already contains the full URL, extract just the ID part
  if (imageId.includes('imagedelivery.net')) {
    debugLog.images('Received full URL instead of just ID, extracting ID part');
    const parts = imageId.split('/');
    if (parts.length >= 5) {
      const extractedId = parts[parts.length - 2]; // Extract the ID from URL
      
      // Check if the extracted ID still looks valid
      if (extractedId.length >= 10 && extractedId !== CLOUDFLARE_ACCOUNT_ID) {
        imageId = extractedId;
        variant = parts[parts.length - 1];
        debugLog.images(`Successfully extracted valid ID: ${imageId}`);
      } else {
        debugLog.images(`Extracted invalid ID from URL: ${extractedId}`);
        return FALLBACK_URL;
      }
    } else {
      debugLog.images(`Could not parse Cloudflare URL: ${imageId}`);
      return FALLBACK_URL;
    }
  }
  
  // Validate that the imageId looks like a reasonable image ID
  // Most Cloudflare image IDs are UUIDs or at least long alphanumeric strings
  if (imageId.length < 10) {
    debugLog.images('Image ID appears to be invalid (too short):', imageId);
    return FALLBACK_URL;
  }
  
  // Final safety check for numeric IDs, which are unlikely to be valid
  if (/^\d+$/.test(imageId)) {
    debugLog.images('Image ID appears to be numeric only:', imageId);
    return FALLBACK_URL;
  }
  
  // IMPORTANT: Special handling for UUIDs - ensure they're properly formatted
  let finalImageId = imageId;
  
  // For UUIDs (containing hyphens and of the right length), we want to use them directly
  if (imageId.includes('-') && imageId.length > 30) {
    debugLog.images(`Using UUID directly: ${imageId}`);
    finalImageId = imageId.trim(); // Ensure no extra whitespace
  }
  
  // Build the final URL with cache-busting
  // Add timestamp to bust cache for browsers
  const cacheBuster = Date.now();
  const finalUrl = `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${finalImageId}/${variant}?t=${cacheBuster}`;
  debugLog.images(`Generated final URL with cache busting: ${finalUrl}`);
  
  return finalUrl;
}

/**
 * PREFERRED: Simple ID-to-URL conversion for new code
 * Use this instead of getCloudflareImageUrl for cleaner code
 */
export function getImageUrl(imageId: string | null | undefined, variant: string = 'public'): string | null {
  if (!imageId) return null;

  // Generate Cloudflare URL for all image IDs
  return `${CLOUDFLARE_BASE_URL}/${CLOUDFLARE_ACCOUNT_ID}/${imageId}/${variant}`;
}

/**
 * Get mobile-optimized image URLs from image ID
 */
export function getMobileImageUrl(
  imageId: string | null | undefined, 
  size: 'thumbnail' | 'detail' | 'large' = 'detail'
): string | null {
  if (!imageId) return null;
  
  const sizeMap = {
    thumbnail: '200x200',
    detail: '400x400', 
    large: '800x800'
  };
  
  return getImageUrl(imageId, sizeMap[size]);
}

/**
 * Extract image ID from Cloudflare URL (for migration/compatibility)
 */
export function extractImageIdFromUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl || !imageUrl.includes('imagedelivery.net')) {
    return null;
  }
  
  try {
    const parts = imageUrl.split('/');
    if (parts.length >= 5) {
      const imageId = parts[parts.length - 2];
      return (imageId && imageId.length > 10 && imageId.includes('-')) ? imageId : null;
    }
  } catch (error) {
    console.warn('Failed to extract image ID from URL:', imageUrl, error);
  }
  
  return null;
}

// Default images as data URLs to avoid missing file issues
export const DEFAULT_LOGO = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI5MCIgZmlsbD0iI2YwZjBmMCIvPgogIDxwYXRoIGQ9Ik03MCAxNTBsLTIwIDBoMTAwbC0yMCAwTTkwIDE1MFY4MGwyMCAwdi0yMGwyMCAwdjIwTTkwIDgwSDcwTTExMCA4MGgxMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjYyIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICA8cmVjdCB4PSI5MCIgeT0iOTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2NjYyIvPgogIDxyZWN0IHg9IjkwIiB5PSIxMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2NjYyIvPgo8L3N2Zz4K';

// Reliable external logo URL that can be used as a fallback
// Using a reliable data URI instead of an external URL to prevent 404 errors
export const RELIABLE_LOGO_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgZmlsbD0ibm9uZSI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI5MCIgZmlsbD0iIzAwMCIvPgogIDxwYXRoIGQ9Ik0xMDAgMjBDNTUuODIgMjAgMjAgNTUuODIgMjAgMTAwYzAgNDQuMTggMzUuODIgODAgODAgODBzODAtMzUuODIgODAtODBjMC00NC4xOC0zNS44Mi04MC04MC04MHptMCAxNDZjLTM2LjQ1IDAtNjYtMjkuNTUtNjYtNjZzMjkuNTUtNjYgNjYtNjYgNjYgMjkuNTUgNjYgNjYtMjkuNTUgNjYtNjYgNjZ6IiBmaWxsPSIjZmZmIi8+CiAgPHBhdGggZD0iTTEwMCA1MGM4LjI4IDAgMTUgNi43MiAxNSAxNXY0MGMwIDguMjgtNi43MiAxNS0xNSAxNXMtMTUtNi43Mi0xNS0xNVY2NWMwLTguMjgtNi43Mi0xNSAxNS0xNXoiIGZpbGw9IiNmZmYiLz4KICA8cGF0aCBkPSJNODUgNTBsMzAgMjBNODUgOTBsMzAtMjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMzAiIHI9IjEwIiBmaWxsPSIjZmZmIi8+CiAgPHBhdGggZD0iTTcwIDQwbDYwIDIwTTcwIDYwbDYwLTIwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPg==';

// Alternative reliable logo URL (rocket logo as data URI)
export const ROCKET_LOGO_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgZmlsbD0ibm9uZSI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI5MCIgZmlsbD0iIzAwMCIvPgogIDxwYXRoIGQ9Ik0xMDAgMzBjLTUuNTIgMC0xMCA0LjQ4LTEwIDEwdjYwYzAgNS41MiA0LjQ4IDEwIDEwIDEwczEwLTQuNDggMTAtMTBWNDBjMC01LjUyLTQuNDgtMTAtMTAtMTB6IiBmaWxsPSIjZmZmIi8+CiAgPHBhdGggZD0iTTkwIDUwbDIwLTIwTTkwIDcwbDIwLTIwTTkwIDkwbDIwLTIwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgPHBhdGggZD0iTTcwIDEyMGg2MHYyMEg3MHoiIGZpbGw9IiNmZmYiLz4KICA8cGF0aCBkPSJNODAgMTQwdjIwTTEyMCAxNDB2MjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';

export const DEFAULT_BANNER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iMjUwIiB2aWV3Qm94PSIwIDAgODAwIDI1MCI+CiAgPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIyNTAiIGZpbGw9IiNmMmYyZjIiLz4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJwYXR0IiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlclJUcmFuc2Zvcm09InJvdGF0ZSg0NSkiPgogICAgICA8bGluZSB4MT0iMCIgeTE9IjIwIiB4Mj0iNDAiIHkyPSIyMCIgc3Ryb2tlPSIjZTBlMGUwIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIyNTAiIGZpbGw9InVybCgjcGF0dCkiLz4KPC9zdmc+Cg==';

/**
 * Checks if a URL is a Cloudflare-hosted image URL
 * 
 * @param url The URL to check
 * @returns True if the URL is a Cloudflare-hosted image URL
 */
export const isCloudflareUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  // Cloudflare Images URLs typically have this format: https://imagedelivery.net/ACCOUNT_HASH/IMAGE_ID/variant
  return url.includes('imagedelivery.net') || 
         url.includes('cloudflareimages.com') || 
         url.includes('cdn.cloudflare.co');
};

/**
 * Formats an image URL to ensure it points to the correct server
 * This function implements our image URL priority rules:
 * 1. Cloudflare-hosted URLs
 * 2. Other CDN or HTTP/HTTPS URLs
 * 3. Relative paths to our API
 * 4. Data URLs (only for temporary previews)
 * 
 * @param imageUrl The image URL to format
 * @returns The formatted image URL
 */
export const formatImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    return '';
  }
  
  // Log for debugging - only show first part to avoid console spam
  // console.log(`[imageUtils] Formatting image URL: ${imageUrl.substring(0, 50)}${imageUrl.length > 50 ? '...' : ''}`);
  // console.log(`[imageUtils] Image URL length: ${imageUrl.length}`);
  
  // 1. HIGHEST PRIORITY: Always preserve data:image/jpeg URLs from cropper (These must always be returned as-is)
  if (imageUrl.startsWith('data:image/jpeg')) {
    // console.log('[imageUtils] Found cropped JPEG data URL - preserving it exactly');
    return imageUrl; // Never modify these URLs
  }
  
  // 2. SECOND PRIORITY: If it's a Cloudflare URL, ensure it's properly formatted
  if (isCloudflareUrl(imageUrl)) {
    // console.log('[imageUtils] Using Cloudflare-hosted image URL');
    
    // Fix double slash issue in Cloudflare URLs
    if (imageUrl.includes('imagedelivery.net//')) {
      // console.log('[imageUtils] Fixing malformed Cloudflare URL with double slashes');
      const fixedUrl = imageUrl.replace('imagedelivery.net//', 'imagedelivery.net/');
      // console.log(`[imageUtils] Fixed URL: ${fixedUrl}`);
      return fixedUrl;
    }
    
    // Check if URL is missing account hash
    if (imageUrl.includes('imagedelivery.net/') && 
        !imageUrl.includes(`imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}`)) {
      // Only try to fix if we have an image ID after the double slash
      const parts = imageUrl.split('/');
      // Look for a UUID-like part that would be the image ID
      const potentialImageId = parts.find(part => 
        part.length > 10 && part.includes('-') && part !== 'imagedelivery.net'
      );
      
      if (potentialImageId) {
        // console.log(`[imageUtils] Found potential image ID in malformed URL: ${potentialImageId}`);
        const properUrl = `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${potentialImageId}/public`;
        // console.log(`[imageUtils] Reconstructed proper URL: ${properUrl}`);
        return properUrl;
      }
    }
    
    return imageUrl;
  }
  
  // 3. Handle other data URLs
  if (imageUrl.startsWith('data:')) {
    // Flag for possible future migration
    localStorage.setItem('needs_cloudflare_migration', 'true');
    
    // Only replace extremely long data URLs that would cause browser performance issues
    // Increased threshold significantly to accommodate large images
    if (imageUrl.length > 5000000) { // 5MB threshold
      debugLog.images('Image URL is extremely large (>5MB) - using fallback');
      localStorage.setItem('using_base64_fallback', 'true');
      return DEFAULT_BANNER;
    }
    
    // For all other data URLs, we'll display them as is
    // console.log('[imageUtils] Using data URL');
    return imageUrl;
  }
  
  // 3. Other HTTP/HTTPS URLs are medium priority
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // console.log('[imageUtils] Using external image URL');
    return imageUrl;
  }
  
  // 4. Handle relative paths to our API
  if (imageUrl.startsWith('/')) {
    // console.log('[imageUtils] Converting relative path to API URL');
    return `${API_BASE_URL}${imageUrl}`;
  } else if (!imageUrl.startsWith('data:')) {
    // console.log('[imageUtils] Adding leading slash to relative path');
    return `${API_BASE_URL}/${imageUrl}`;
  }
  
  // 5. LOWEST PRIORITY: Data URLs (but still valid for temporary use)
  // console.log('[imageUtils] Using data URL as fallback (consider migrating to Cloudflare)');
  // localStorage.setItem('needs_cloudflare_migration', 'true'); // Commented out: Avoid side effects in formatter
  return imageUrl;
};

/**
 * Gets a valid business logo URL from a business profile object
 * Handles different field naming conventions and validates the URL
 * 
 * @param profile The business profile object
 * @returns A valid logo URL or null
 */
// Make this interface compatible with the BusinessProfile type
export interface BusinessProfileLike {
  id?: string;
  name?: string;
  logo?: string;
  logo_url?: string;
  logoUrl?: string;
  description?: string;
  email?: string;
  contactEmail?: string;
  contact_email?: string;
  phone?: string;
  address?: string;
  website?: string;
  banner?: string;
  banner_url?: string;
  bannerUrl?: string;
  categories?: string[] | string;
  industry?: string;
  [key: string]: unknown;
}

/**
 * Gets a valid business logo URL from a business profile object with improved caching and validation
 * This function now includes timestamp-based cache busting to ensure fresh logos
 */
export const getBusinessLogoUrl = (profile: BusinessProfileLike | null | undefined): string | null => {
  // CRITICAL FIX: Always try to use the logos stored in localStorage first
  // This is the most reliable way to ensure we're always using the latest logo
  
  // Always broadcast when we're getting a logo - this helps notify components that might be listening
  const logoRetrievalEvent = new CustomEvent('business-logo-get', {
    detail: { timestamp: Date.now() }
  });
  window.dispatchEvent(logoRetrievalEvent);
  
  // Force using stored logo for the current session
  localStorage.setItem('override_default_logo', 'true');
  debugLog.images('Forcing use of stored logo data if available');
  
  // NEW: Create a consistency key that ensures all components see the same logo
  // This key will be checked by all components requesting a logo
  const syncKey = `logo_sync_${Date.now()}`;
  localStorage.setItem('current_logo_sync_key', syncKey);
  
  // Try multiple localStorage keys where logo might be stored - ordered by priority
  
  // HIGHEST PRIORITY: Cloudflare URLs
  const cloudflareLogoUrl = localStorage.getItem('cloudflare_logo_url');
  const businessLogoUrl = localStorage.getItem('business_logo_url');
  
  // LOWER PRIORITY: Legacy data URLs
  const permanentLogoData = localStorage.getItem('permanent_logo_data_url');
  const latestLogoData = localStorage.getItem('latest_logo_data_url');
  const tempLogoData = localStorage.getItem('temp_logo_data_url');
  const businessLogoData = localStorage.getItem('business_logo_data_url');
  
  // Create a variable to store the found logo
  let foundLogo = null;
  
  // PRIORITY 1: Use Cloudflare URLs if available
  if (cloudflareLogoUrl && isCloudflareUrl(cloudflareLogoUrl)) {
    debugLog.images('Using Cloudflare logo URL from localStorage');
    foundLogo = cloudflareLogoUrl;
  } 
  // PRIORITY 2: Check if business_logo_url is a Cloudflare URL
  else if (businessLogoUrl && isCloudflareUrl(businessLogoUrl)) {
    debugLog.images('Using business logo URL (Cloudflare) from localStorage');
    // Store it in the standardized key for future use
    localStorage.setItem('cloudflare_logo_url', businessLogoUrl);
    foundLogo = businessLogoUrl;
  }
  // PRIORITY 3: Fall back to data URLs if no Cloudflare URLs are available
  else if (permanentLogoData && permanentLogoData.startsWith('data:')) {
    debugLog.images('Using permanent logo data from localStorage');
    foundLogo = permanentLogoData;
  } else if (latestLogoData && latestLogoData.startsWith('data:')) {
    debugLog.images('Using latest logo data from localStorage');
    foundLogo = latestLogoData;
  } else if (tempLogoData && tempLogoData.startsWith('data:')) {
    debugLog.images('Using temporary logo data from localStorage');
    foundLogo = tempLogoData;
  } else if (businessLogoData && businessLogoData.startsWith('data:')) {
    debugLog.images('Using business logo data from localStorage');
    foundLogo = businessLogoData;
  }
  
  // If we found a logo in local storage, store it appropriately based on type
  if (foundLogo) {
    const timestamp = Date.now().toString();
    localStorage.setItem('logo_last_updated', timestamp);
    
    // If it's a Cloudflare URL, store it in the Cloudflare-specific keys
    if (isCloudflareUrl(foundLogo)) {
      debugLog.images('Storing Cloudflare URL in standardized keys');
      localStorage.setItem('cloudflare_logo_url', foundLogo);
      localStorage.setItem('business_logo_url', foundLogo);
    } 
    // If it's a data URL, store it in the legacy data URL keys
    else if (foundLogo.startsWith('data:')) {
      debugLog.images('Storing data URL in legacy keys');
      localStorage.setItem('permanent_logo_data_url', foundLogo);
      localStorage.setItem('latest_logo_data_url', foundLogo);
      localStorage.setItem('temp_logo_data_url', foundLogo);
      localStorage.setItem('business_logo_data_url', foundLogo);
    }
    
    // Also broadcast that we found a logo
    const logoFoundEvent = new CustomEvent('business-logo-found', {
      detail: { source: 'localStorage', timestamp: Date.now() }
    });
    window.dispatchEvent(logoFoundEvent);
    
    return foundLogo;
  }
  
  if (!profile) {
    debugLog.images('No profile provided, checking for permanent logo data');
    // Last desperate check of all possible storage locations
    const allPossibleKeys = [
      'permanent_logo_data_url', 
      'latest_logo_data_url', 
      'temp_logo_data_url',
      'business_logo_data_url',
      'uploaded_logo_data_url',
      'profile_logo_data'
    ];
    
    for (const key of allPossibleKeys) {
      const logoData = localStorage.getItem(key);
      if (logoData && logoData.startsWith('data:')) {
        debugLog.images(`Found logo in ${key}`);
        // Store it everywhere for consistency
        localStorage.setItem('permanent_logo_data_url', logoData);
        return logoData;
      }
    }
    
    // Use null as a last resort
    debugLog.images('Falling back to default rocket logo');
    return null;
  }
  
  // Check for force refresh flag
  const forceRefresh = localStorage.getItem('force_logo_refresh') === 'true';
  if (forceRefresh) {
    debugLog.images('Force refresh flag detected, bypassing cache');
    // Clear the flag after using it
    localStorage.setItem('force_logo_refresh', 'false');
  }
  
  // DEBUG: Log the essential profile data for debugging
  debugLog.images('Profile ID:', profile.id);
  debugLog.images('Profile name:', profile.name);
  
  // Try different possible field names for the logo with extended variations
  const logoUrl = profile.logo || 
                  profile.logo_url || 
                  profile.logoUrl || 
                  profile.logoURL || 
                  profile.logo_URL || 
                  profile.businessLogo || 
                  // Use type assertion for potential additional properties
                  (profile as Record<string, unknown>).business_logo as string | undefined;
                  
  debugLog.images('Found logo URL in profile:', logoUrl);
  
  // If we still don't have a logo, try looking for it in nested properties
  if (!logoUrl && typeof profile === 'object') {
    // Common nested patterns used in this codebase
    const possibleNestedProps = ['business', 'profile', 'data', 'businessProfile'];
    
    for (const prop of possibleNestedProps) {
      const nestedObj = (profile as Record<string, unknown>)[prop];
      if (nestedObj && typeof nestedObj === 'object') {
        // Cast to Record to access dynamic properties
        const typedObj = nestedObj as Record<string, unknown>;
        const nestedLogo = typedObj['logo'] as string || 
                          typedObj['logo_url'] as string || 
                          typedObj['logoUrl'] as string || 
                          typedObj['logoURL'] as string;
        if (nestedLogo) {
          debugLog.images(`Found logo in nested property ${prop}:`, nestedLogo);
          // Allow formatImageUrl to return null
          return formatImageUrl(nestedLogo) || null;
        }
      }
    }
  }
  
  if (!logoUrl) {
    debugLog.images('No logo found in profile');
    
    // FINAL CHECK: Try ALL localStorage keys one more time before falling back
    // This is our last defense against using the default logo
    const backupLogoData = localStorage.getItem('permanent_logo_data_url') || 
                          localStorage.getItem('latest_logo_data_url') || 
                          localStorage.getItem('temp_logo_data_url') ||
                          localStorage.getItem('business_logo_data_url');
                          
    if (backupLogoData && backupLogoData.startsWith('data:')) {
      debugLog.images('Using backup logo data from final check');
      localStorage.setItem('permanent_logo_data_url', backupLogoData); // Make it permanent
      return backupLogoData;
    }
    
    // Only use default if we absolutely can't find a logo anywhere
    debugLog.images('Falling back: No logo found');
    // Return null instead of ROCKET_LOGO_URL
    return null;
  }
  
  // Validate the URL
  try {
    // If it's a data URL, return it as is
    if (typeof logoUrl === 'string' && logoUrl.startsWith('data:')) {
      return logoUrl;
    }
    
    // If the URL is the problematic cosmic-web-studios URL, return the reliable data URI instead
    if (typeof logoUrl === 'string' && logoUrl.includes('cosmic-web-studios.netlify.app')) {
      debugLog.images('Replacing problematic cosmic-web-studios URL with reliable data URI');
      // Keep ROCKET_LOGO_URL here if it's a specific replacement string, otherwise null
      // Assuming ROCKET_LOGO_URL is a valid string replacement here.
      return ROCKET_LOGO_URL; 
    }
    
    // If it's a URL, validate it (but don't add cache busting to avoid 404 errors)
    if (typeof logoUrl === 'string' && 
        (logoUrl.startsWith('http://') || logoUrl.startsWith('https://'))) {
      // Test if the URL is valid
      new URL(logoUrl);
      return logoUrl;
    }
    
    // If it's a relative path, format it (but don't add cache busting)
    // Ensure logoUrl is treated as string before passing to formatImageUrl
    const logoUrlString = (typeof logoUrl === 'string') ? logoUrl : '';
    const formattedUrl = formatImageUrl(logoUrlString);
    if (formattedUrl) {
      return formattedUrl;
    }
    
    // ABSOLUTE FINAL CHECK for ANY logo data before returning the URL
    // This is our last chance to avoid using the default logo
    const lastChanceLogoData = localStorage.getItem('permanent_logo_data_url') || 
                             localStorage.getItem('latest_logo_data_url') || 
                             localStorage.getItem('temp_logo_data_url') ||
                             localStorage.getItem('business_logo_data_url');
                             
    if (lastChanceLogoData && lastChanceLogoData.startsWith('data:')) {
      debugLog.images('Using local logo data as absolute final option');
      localStorage.setItem('permanent_logo_data_url', lastChanceLogoData); // Make sure it's permanent
      return lastChanceLogoData;
    }

    // If even the logoUrl found earlier is invalid/unformattable, and no localStorage backup found, return null.
    debugLog.images('Invalid or unformattable logoUrl and no backup found, returning null');
    return null;
    
  } catch (e) {
    debugLog.images('Invalid logo URL:', logoUrl, e);
    
    // Try with permanent storage as last resort
    const backupLogoData = localStorage.getItem('permanent_logo_data_url');
    if (backupLogoData && backupLogoData.startsWith('data:')) {
      debugLog.images('Using backup logo data after error');
      return backupLogoData;
    }
    
    return null;
  }
};

/**
 * Process an image file and convert it to a data URL with error handling
 * Uses magic bytes detection for accurate format identification
 * @param file The image file to process
 * @returns A promise that resolves to the data URL or rejects with an error
 */
/**
 * Resize image if it exceeds maximum dimensions or file size
 */
const resizeImageIfNeeded = async (dataUrl: string, mimeType: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1920;
      const MAX_FILE_SIZE = 800 * 1024; // 800KB target size
      
      // Check if resize is needed
      const needsResize = img.width > MAX_WIDTH || img.height > MAX_HEIGHT || dataUrl.length > MAX_FILE_SIZE * 1.37; // 1.37 is base64 overhead
      
      if (!needsResize) {
        debugLog.images('Image does not need resizing');
        resolve(dataUrl);
        return;
      }
      
      debugLog.images(`Resizing image from ${img.width}x${img.height}`);
      
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }
      }
      
      // Create canvas and resize
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG for smaller file size (unless it's a PNG with transparency)
      const outputType = mimeType === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = outputType === 'image/jpeg' ? 0.85 : undefined;
      
      const resizedDataUrl = canvas.toDataURL(outputType, quality);
      debugLog.images(`Image resized to ${width}x${height}, size reduction: ${Math.round((1 - resizedDataUrl.length / dataUrl.length) * 100)}%`);
      
      resolve(resizedDataUrl);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for resizing'));
    };
    
    img.src = dataUrl;
  });
};

export const processImageFile = async (file: File): Promise<string> => {
  if (!file) {
    debugLog.images('No file provided to processImageFile');
    throw new Error('No file provided');
  }
  
  debugLog.images(`Processing image file: ${file.name}, browser type: ${file.type}, size: ${(file.size / 1024).toFixed(2)}KB`);
  
  // Import validation functions dynamically to avoid circular dependencies
  const { fileToDataUrlWithValidation } = await import('./imageValidation');
  
  try {
    // Use the new validation-based conversion
    const result = await fileToDataUrlWithValidation(file);
    
    if (!result.isValid) {
      debugLog.images('File validation failed:', result.error);
      throw new Error(result.error || 'Invalid image file');
    }
    
    debugLog.images('Successfully processed image file with validation', {
      detectedMimeType: result.mimeType,
      originalType: file.type,
      corrected: result.mimeType !== file.type
    });
    
    // Resize image if needed to reduce upload size
    const finalDataUrl = await resizeImageIfNeeded(result.dataUrl, result.mimeType);
    
    return finalDataUrl;
  } catch (error) {
    debugLog.images('Error processing image file:', error);
    
    // Fallback to legacy processing for compatibility
    // This should rarely be reached but provides a safety net
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          const dataUrl = e.target.result as string;
          
          // Check for AVIF in the data URL
          if (dataUrl.includes('image/avif')) {
            reject(new Error('AVIF format is not supported. Please use PNG, JPEG, GIF, or WebP.'));
            return;
          }
          
          resolve(dataUrl);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsDataURL(file);
    });
  }
};

/**
 * Process an advertisement image with validation and error handling
 * @param file The image file to process
 * @param adIndex The index of the advertisement (for logging)
 * @returns A promise that resolves to the processed image data URL
 */
export const processAdImage = async (file: File, adIndex: number): Promise<string> => {
  debugLog.images(`Processing ad image for ad ${adIndex}:`, {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size
  });
  
  try {
    const dataUrl = await processImageFile(file);
    debugLog.images(`Successfully processed ad image for ad ${adIndex}`);
    return dataUrl;
  } catch (error) {
    debugLog.images(`Failed to process ad image for ad ${adIndex}:`, error);
    throw error;
  }
};

// Utility function to synchronize logo data across the application
export const syncLogoData = (logoDataUrl: string): void => {
  if (!logoDataUrl || !logoDataUrl.startsWith('data:')) {
    debugLog.images('Cannot sync invalid logo data:', logoDataUrl);
    return;
  }
  
  debugLog.images('Syncing logo data across all storage mechanisms');
  
  // Store in all possible locations for maximum compatibility
  localStorage.setItem('permanent_logo_data_url', logoDataUrl);
  localStorage.setItem('latest_logo_data_url', logoDataUrl);
  localStorage.setItem('temp_logo_data_url', logoDataUrl);
  localStorage.setItem('business_logo_data_url', logoDataUrl);
  localStorage.setItem('logo_last_updated', Date.now().toString());
  
  // Set a flag to force refresh on next load
  localStorage.setItem('force_logo_refresh', 'true');
  
  // Broadcast the logo update to all components
  const logoUpdateEvent = new CustomEvent('business-logo-updated', {
    detail: { 
      logoUrl: logoDataUrl,
      timestamp: Date.now(),
      source: 'syncLogoData'
    }
  });
  window.dispatchEvent(logoUpdateEvent);
  
  // Also dispatch the more general profile update event
  const profileUpdateEvent = new CustomEvent('business-profile-updated');
  window.dispatchEvent(profileUpdateEvent);
};

export default {
  formatImageUrl,
  getBusinessLogoUrl,
  processImageFile,
  processAdImage,
  syncLogoData,
  DEFAULT_LOGO,
  DEFAULT_BANNER
};
