import apiService from './apiService';
import { ApiResponse } from '../types';

/**
 * Business follow service for managing business follow relationships
 */
class BusinessFollowService {
  /**
   * Follow a business
   * @param businessId - ID of the business to follow
   * @returns Response with follow status and follower count
   */
  async followBusiness(businessId: string): Promise<ApiResponse<{
    isFollowing: boolean;
    followerCount: number;
  }>> {
    return apiService.post(`/businesses/${businessId}/follow`);
  }

  /**
   * Unfollow a business
   * @param businessId - ID of the business to unfollow
   * @returns Response with follow status and follower count
   */
  async unfollowBusiness(businessId: string): Promise<ApiResponse<{
    isFollowing: boolean;
    followerCount: number;
  }>> {
    return apiService.delete(`/businesses/${businessId}/follow`);
  }

  /**
   * Get follow status for a business
   * @param businessId - ID of the business
   * @returns Response with follow status and follower count
   */
  async getFollowStatus(businessId: string): Promise<ApiResponse<{
    isFollowing: boolean;
    followerCount: number;
  }>> {
    return apiService.get(`/businesses/${businessId}/follow-status`);
  }
}

// Create and export a singleton instance
export const businessFollowService = new BusinessFollowService();

export default businessFollowService;