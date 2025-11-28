import apiService from './api';
import { CouponClaim, SavedPromotion, ApiResponse } from '../types';
import savedPromotionService from './savedPromotionService';

/**
 * Service for managing subscriber coupon claims
 * @deprecated Use savedPromotionService instead for new code
 */
class CouponService {
  /**
   * Get all coupons claimed by a user
   */
  async getUserCoupons(options: { 
    status?: string; 
    folder?: string; 
    favorite?: boolean; 
    sortBy?: string; 
    sortOrder?: string; 
    limit?: number; 
    offset?: number; 
  } = {}): Promise<ApiResponse<CouponClaim[]>> {
    const params = new URLSearchParams();
    
    // Add query parameters
    if (options.status) params.append('status', options.status);
    if (options.folder) params.append('folder', options.folder);
    if (options.favorite !== undefined) params.append('favorite', options.favorite.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    
    const queryString = params.toString();
    return apiService.get<CouponClaim[]>(`/coupons${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Claim a coupon for the current user
   */
  async claimCoupon(promotionId: string): Promise<ApiResponse<CouponClaim>> {
    return apiService.post<CouponClaim>(`/coupons/claim`, { promotionId });
  }

  /**
   * Mark a coupon as redeemed
   */
  async redeemCoupon(claimId: string): Promise<ApiResponse<CouponClaim>> {
    return apiService.post<CouponClaim>(`/coupons/${claimId}/redeem`, {});
  }

  /**
   * Get a specific coupon claim by ID
   */
  async getCouponClaim(claimId: string): Promise<ApiResponse<CouponClaim>> {
    return apiService.get<CouponClaim>(`/coupons/${claimId}`);
  }

  /**
   * Delete a coupon claim
   */
  async deleteCouponClaim(claimId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiService.delete<{ success: boolean }>(`/coupons/${claimId}`);
  }

  /**
   * Get user folders
   */
  async getUserFolders(): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>(`/coupons/folders`);
  }

  /**
   * Get user tags  
   */
  async getUserTags(): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>(`/coupons/tags`);
  }

  /**
   * Toggle favorite status for a coupon
   */
  async toggleFavorite(claimId: string): Promise<ApiResponse<CouponClaim>> {
    return apiService.post<CouponClaim>(`/coupons/${claimId}/favorite`, {});
  }

  /**
   * Move coupon to folder
   */
  async moveToFolder(claimId: string, folder: string): Promise<ApiResponse<CouponClaim>> {
    return apiService.post<CouponClaim>(`/coupons/${claimId}/folder`, { folder });
  }

  /**
   * Add tag to coupon
   */
  async addTag(claimId: string, tag: string): Promise<ApiResponse<CouponClaim>> {
    return apiService.post<CouponClaim>(`/coupons/${claimId}/tag`, { tag });
  }

  /**
   * Remove tag from coupon
   */
  async removeTag(claimId: string, tag: string): Promise<ApiResponse<CouponClaim>> {
    return apiService.delete<CouponClaim>(`/coupons/${claimId}/tag/${tag}`);
  }

  // Forward methods to savedPromotionService for gradual migration
  async savePromotion(promotionId: string): Promise<ApiResponse<SavedPromotion>> {
    return savedPromotionService.savePromotion(promotionId);
  }

  async getUserSavedPromotions(options: Parameters<typeof savedPromotionService.getUserSavedPromotions>[0] = {}) {
    return savedPromotionService.getUserSavedPromotions(options);
  }
}

// Create and export a singleton instance
export const couponService = new CouponService();

export default couponService;
