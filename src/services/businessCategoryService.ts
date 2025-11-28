/**
 * Business Category Service
 * 
 * This service handles business category operations, including fetching
 * categories from the API and providing fallback options.
 */
import apiService from './api';
import { ApiResponse, BusinessCategory } from '../types';
import { keysToCamel } from '../utils/camelCaseUtils';
import businessCircuitBreaker from './businessCircuitBreaker';

/**
 * Business Category Service class
 * Provides methods for managing business categories
 */
export class BusinessCategoryService {
  private categories: BusinessCategory[] = [];

  /**
   * Get all business categories
   * @returns ApiResponse with business categories data
   */
  async getBusinessCategories(): Promise<ApiResponse<BusinessCategory[]>> {
    console.log('[BusinessCategoryService] Getting business categories');

    // Check if we're in a browser environment
    const isBrowser = typeof window !== 'undefined';
    
    if (isBrowser) {
      console.log('[BusinessCategoryService] Browser env: Fetching categories via REST API');
      
      try {
        console.log('[BusinessCategoryService] Attempting to fetch categories from API');
        const response = await apiService.get('/business-categories');
        
        if (response.success) {
          // Handle different API response structures
          let categories: BusinessCategory[] = [];
          
          if (response.data && Array.isArray(response.data)) {
            // Direct array response
            categories = response.data as BusinessCategory[];
          } else if (response.data && typeof response.data === 'object') {
            const data = response.data as Record<string, unknown>;
            
            // Check for nested categories array
            if (data.categories && Array.isArray(data.categories)) {
              categories = data.categories as BusinessCategory[];
            } else if (data.data && typeof data.data === 'object') {
              const nestedData = data.data as Record<string, unknown>;
              
              if (nestedData.categories && Array.isArray(nestedData.categories)) {
                categories = nestedData.categories as BusinessCategory[];
              }
            }
          }
          
          // Ensure we have the expected structure
          categories = categories.map(category => {
            // Convert snake_case to camelCase if needed
            const processedCategory = keysToCamel(category) as BusinessCategory;
            
            // Ensure id and name properties exist
            return {
              id: processedCategory.id || 0,
              name: processedCategory.name || 'Unknown'
            };
          });
          
          console.log(`[BusinessCategoryService] Successfully fetched ${categories.length} categories from API`);
          this.categories = categories;
          
          // Record success in circuit breaker
          businessCircuitBreaker.recordSuccess();
          
          return {
            success: true,
            data: categories
          };
        } else {
          console.error('[BusinessCategoryService] API returned error:', response.error);
          throw new Error(response.error || 'Failed to fetch categories');
        }
      } catch (error) {
        console.error('[BusinessCategoryService] Error fetching categories:', error);
        
        // Check if this is a rate limit error
        const isRateLimit = businessCircuitBreaker.isRateLimitError(error);
        businessCircuitBreaker.recordFailure(isRateLimit);
        
        // Fall back to development categories in development mode
        if (process.env.NODE_ENV === 'development') {
          console.warn('[BusinessCategoryService] Using development fallback categories');
          return {
            success: true,
            data: this.getDevelopmentCategories(),
            warning: 'Using development fallback categories'
          };
        }
        
        return {
          success: false,
          error: 'Failed to fetch business categories',
          data: []
        };
      }
    } else {
      // Server-side rendering or Node.js environment
      console.log('[BusinessCategoryService] Server env: Using development categories');
      return {
        success: true,
        data: this.getDevelopmentCategories(),
        warning: 'Using server-side development categories'
      };
    }
  }

  /**
   * Get development fallback categories
   * @returns Array of business categories for development use
   */
  private getDevelopmentCategories(): BusinessCategory[] {
    return [
      { id: 1, name: 'Restaurant' },
      { id: 2, name: 'Retail' },
      { id: 3, name: 'Service' },
      { id: 4, name: 'Entertainment' },
      { id: 5, name: 'Health & Wellness' },
      { id: 6, name: 'Professional Services' },
      { id: 7, name: 'Technology' },
      { id: 8, name: 'Education' },
      { id: 9, name: 'Food & Beverage' },
      { id: 10, name: 'Hospitality' },
      { id: 11, name: 'Automotive' },
      { id: 12, name: 'Home Services' },
      { id: 13, name: 'Financial Services' },
      { id: 14, name: 'Fitness' },
      { id: 15, name: 'Beauty & Spa' },
      { id: 16, name: 'Other' }
    ];
  }
}

// Create and export a default instance
const businessCategoryService = new BusinessCategoryService();
export default businessCategoryService;
