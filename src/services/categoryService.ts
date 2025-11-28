import apiService from './api';

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  parent_id: string | null;
  subcategories?: Category[];
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
 * Service for handling business category data
 */
const categoryService = {
  /**
   * Get all categories
   */
  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    try {
      return await apiService.get<Category[]>('/categories');
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        error: 'Failed to fetch categories'
      };
    }
  },

  /**
   * Get category by ID
   * @param id - Category ID
   */
  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    try {
      return await apiService.get<Category>(`/categories/${id}`);
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      return {
        success: false,
        error: 'Failed to fetch category'
      };
    }
  },

  /**
   * Get subcategories for a parent category
   * @param parentId - Parent category ID
   */
  async getSubcategories(parentId: string): Promise<ApiResponse<Category[]>> {
    try {
      return await apiService.get<Category[]>(`/categories/${parentId}/subcategories`);
    } catch (error) {
      console.error(`Error fetching subcategories for ${parentId}:`, error);
      return {
        success: false,
        error: 'Failed to fetch subcategories'
      };
    }
  },

  /**
   * Get business category and subcategory
   * @param businessId - Business ID
   */
  async getBusinessCategory(businessId: string): Promise<ApiResponse<{category: Category, subcategory: Category | null}>> {
    try {
      return await apiService.get<{category: Category, subcategory: Category | null}>(`/businesses/${businessId}/category`);
    } catch (error) {
      console.error(`Error fetching business category for ${businessId}:`, error);
      return {
        success: false,
        error: 'Failed to fetch business category'
      };
    }
  }
};

export default categoryService;
