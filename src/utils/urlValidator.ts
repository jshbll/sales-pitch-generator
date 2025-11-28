/**
 * Client-side URL validation utilities
 * Mirrors the server-side validation functions for consistency
 */

/**
 * Check if a URL is a Cloudflare URL
 * @param url The URL to check
 * @returns boolean True if the URL is a Cloudflare URL
 */
export function isCloudflareUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  // Check if the URL is from Cloudflare Images
  return url.includes('imagedelivery.net') || 
         url.includes('cloudflareimages.com') || 
         url.includes('cdn.cloudflare.co');
}

/**
 * Check if a URL is a data URL
 * @param url The URL to check
 * @returns boolean True if the URL is a data URL
 */
export function isDataUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  // Data URLs start with data: and typically contain a MIME type
  return url.startsWith('data:');
}

/**
 * Validate an image URL
 * @param url The URL to validate
 * @param context Additional context for logging
 * @returns boolean True if the URL is valid
 */
export function validateImageUrl(url: string | null | undefined, context = 'client'): boolean {
  if (!url) {
    console.warn(`[validateImageUrl:${context}] Empty URL provided`);
    return false;
  }
  
  // Check for valid URLs
  if (isCloudflareUrl(url)) {
    console.log(`[validateImageUrl:${context}] Valid Cloudflare URL: ${url.substring(0, 30)}...`);
    return true;
  }
  
  // Check for data URLs
  if (isDataUrl(url)) {
    console.warn(`[validateImageUrl:${context}] Data URL detected (should be migrated): ${url.substring(0, 30)}...`);
    return false;
  }
  
  // Check for valid HTTP/HTTPS URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.warn(`[validateImageUrl:${context}] Non-Cloudflare URL detected: ${url}`);
    return false;
  }
  
  console.warn(`[validateImageUrl:${context}] Invalid URL format: ${url}`);
  return false;
}

export default {
  isCloudflareUrl,
  isDataUrl,
  validateImageUrl
};
