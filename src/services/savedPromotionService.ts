import apiService from './api';
import { SavedPromotion, ApiResponse } from '../types';

/**
 * Service for managing saved promotions (new terminology)
 */
class SavedPromotionService {
  /**
   * Get all saved promotions for a user
   */
  async getUserSavedPromotions(options: { 
    status?: string; 
    folder?: string; 
    favorite?: boolean; 
    sortBy?: string; 
    sortOrder?: string; 
    limit?: number; 
    offset?: number; 
  } = {}): Promise<ApiResponse<SavedPromotion[]>> {
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
    return apiService.get<SavedPromotion[]>(`/saved-promotions${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Save a promotion for the current user
   */
  async savePromotion(promotionId: string): Promise<ApiResponse<SavedPromotion>> {
    return apiService.post<SavedPromotion>(`/saved-promotions/save`, { promotionId });
  }

  /**
   * Mark a saved promotion as redeemed
   */
  async redeemSavedPromotion(savedPromotionId: string): Promise<ApiResponse<SavedPromotion>> {
    return apiService.post<SavedPromotion>(`/saved-promotions/${savedPromotionId}/redeem`, {});
  }

  /**
   * Get a specific saved promotion by ID
   */
  async getSavedPromotion(savedPromotionId: string): Promise<ApiResponse<SavedPromotion>> {
    return apiService.get<SavedPromotion>(`/saved-promotions/${savedPromotionId}`);
  }

  /**
   * Delete a saved promotion
   */
  async deleteSavedPromotion(savedPromotionId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiService.delete<{ success: boolean }>(`/saved-promotions/${savedPromotionId}`);
  }

  /**
   * Get user folders
   */
  async getUserFolders(): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>(`/saved-promotions/folders`);
  }

  /**
   * Get user tags  
   */
  async getUserTags(): Promise<ApiResponse<string[]>> {
    return apiService.get<string[]>(`/saved-promotions/tags`);
  }

  /**
   * Toggle favorite status for a saved promotion
   */
  async toggleFavorite(savedPromotionId: string): Promise<ApiResponse<SavedPromotion>> {
    return apiService.post<SavedPromotion>(`/saved-promotions/${savedPromotionId}/favorite`, {});
  }

  /**
   * Move saved promotion to folder
   */
  async moveToFolder(savedPromotionId: string, folder: string): Promise<ApiResponse<SavedPromotion>> {
    return apiService.post<SavedPromotion>(`/saved-promotions/${savedPromotionId}/folder`, { folder });
  }

  /**
   * Add tag to saved promotion
   */
  async addTag(savedPromotionId: string, tag: string): Promise<ApiResponse<SavedPromotion>> {
    return apiService.post<SavedPromotion>(`/saved-promotions/${savedPromotionId}/tag`, { tag });
  }

  /**
   * Remove tag from saved promotion
   */
  async removeTag(savedPromotionId: string, tag: string): Promise<ApiResponse<SavedPromotion>> {
    return apiService.delete<SavedPromotion>(`/saved-promotions/${savedPromotionId}/tag/${tag}`);
  }

  // Legacy method aliases for backward compatibility
  async getUserCoupons(options: Parameters<typeof this.getUserSavedPromotions>[0] = {}) {
    return this.getUserSavedPromotions(options);
  }

  async claimCoupon(promotionId: string) {
    return this.savePromotion(promotionId);
  }

  async redeemCoupon(savedPromotionId: string) {
    return this.redeemSavedPromotion(savedPromotionId);
  }

  async getCouponClaim(savedPromotionId: string) {
    return this.getSavedPromotion(savedPromotionId);
  }

  async deleteCouponClaim(savedPromotionId: string) {
    return this.deleteSavedPromotion(savedPromotionId);
  }
}

// Create and export a singleton instance
export const savedPromotionService = new SavedPromotionService();

export default savedPromotionService;