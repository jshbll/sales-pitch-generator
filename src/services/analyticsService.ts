import { ApiResponse } from '../types';
import apiService from './apiService';

/**
 * Analytics data interface
 */
export interface AnalyticsData {
  id: string;
  promotion_id: string;
  views: number;
  clicks: number;
  claims: number;
  redemptions: number;
  conversion_rate: number;
  redemption_rate: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

/**
 * Time-based analytics data interface
 */
export interface TimeBasedAnalytics {
  time_period: string;
  interaction_type: string;
  count: number;
}

/**
 * Demographic data interface
 */
export interface DemographicData {
  age_range: string;
  gender: string;
  location: string;
  user_count: number;
}

/**
 * Analytics service for interacting with the analytics API
 */
class AnalyticsService {
  /**
   * Record a user interaction with a promotion
   * @param promotionId - Promotion ID
   * @param interactionType - Type of interaction
   * @param metadata - Additional metadata
   */
  async recordInteraction(
    promotionId: string,
    interactionType: string,
    metadata: any = {}
  ): Promise<ApiResponse<any>> {
    return apiService.post('/analytics/interactions', {
      promotionId,
      interactionType,
      metadata
    });
  }

  /**
   * Get analytics data for a specific promotion
   * @param promotionId - Promotion ID
   */
  async getPromotionAnalytics(promotionId: string): Promise<ApiResponse<AnalyticsData>> {
    return apiService.get<AnalyticsData>(`/analytics/promotions/${promotionId}`);
  }

  /**
   * Get analytics data for all promotions of the current business
   */
  async getBusinessAnalytics(): Promise<ApiResponse<AnalyticsData[]>> {
    return apiService.get<AnalyticsData[]>('/analytics/business');
  }

  /**
   * Get demographic data for users who interacted with a promotion
   * @param promotionId - Promotion ID
   * @param interactionType - Optional filter by interaction type
   */
  async getPromotionDemographics(
    promotionId: string,
    interactionType?: string
  ): Promise<ApiResponse<DemographicData[]>> {
    const params = interactionType ? { interactionType } : {};
    return apiService.get<DemographicData[]>(
      `/analytics/promotions/${promotionId}/demographics`,
      { params }
    );
  }

  /**
   * Get time-based analytics for a promotion
   * @param promotionId - Promotion ID
   * @param startDate - Start date for the time range
   * @param endDate - End date for the time range
   * @param groupBy - Time grouping (day, week, month)
   */
  async getTimeBasedAnalytics(
    promotionId: string,
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<ApiResponse<TimeBasedAnalytics[]>> {
    return apiService.get<TimeBasedAnalytics[]>(
      `/analytics/promotions/${promotionId}/time-based`,
      {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          groupBy
        }
      }
    );
  }
}

export default new AnalyticsService();
