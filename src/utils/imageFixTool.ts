/**
 * Special utility to fix image display issues for promotions
 */

// Cloudflare account ID - used for image URL generation
const CLOUDFLARE_ACCOUNT_ID = 'O5xSC37lvKr01NMd5n69gQ';

/**
 * Get promotion image ID and fix common issues
 * 
 * This is a special utility that ensures promotion images are correctly displayed
 * even if there are issues with the image_id format or caching
 */
export function getFixedPromotionImageUrl(image_id: string | null | undefined): string {
  // If image_id is provided (and not empty), construct the URL using it.
  // Trust that Cloudflare can handle different ID formats.
  if (image_id) { 
    // console.log(`[ImageFixTool] Using provided image_id: ${image_id}`);
    return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}/${image_id}/public`;
  }

  // If image_id is missing or empty, return an empty string.
  // Let the calling component handle the error/fallback display.
  // console.log('[ImageFixTool] No valid image_id provided, returning empty string.');
  return ''; 
}
