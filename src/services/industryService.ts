import apiService from './api';

export interface Industry {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Service for handling industry data
 */
const industryService = {
  /**
   * Get all industries
   */
  async getAllIndustries(): Promise<ApiResponse<Industry[]>> {
    try {
      return await apiService.get<Industry[]>('/industries');
    } catch (error) {
      console.error('Error fetching industries:', error);
      return {
        success: false,
        error: 'Failed to fetch industries'
      };
    }
  },

  /**
   * Get industry by ID
   * @param id - Industry ID
   */
  async getIndustryById(id: string): Promise<ApiResponse<Industry>> {
    try {
      return await apiService.get<Industry>(`/industries/${id}`);
    } catch (error) {
      console.error(`Error fetching industry ${id}:`, error);
      return {
        success: false,
        error: 'Failed to fetch industry'
      };
    }
  },

  /**
   * Get industries by business ID
   * @param businessId - Business ID
   */
  async getBusinessIndustry(businessId: string): Promise<ApiResponse<Industry>> {
    try {
      return await apiService.get<Industry>(`/businesses/${businessId}/industry`);
    } catch (error) {
      console.error(`Error fetching industry for business ${businessId}:`, error);
      return {
        success: false,
        error: 'Failed to fetch business industry'
      };
    }
  }
};

export default industryService;
