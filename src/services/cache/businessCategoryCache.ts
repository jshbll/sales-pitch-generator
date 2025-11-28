import { BusinessCategory } from '../../types';
import businessCategoryService from '../businessCategoryService';

interface CategoryCache {
  data: BusinessCategory[] | null;
  timestamp: number;
  promise: Promise<BusinessCategory[]> | null;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class BusinessCategoryCache {
  private cache: CategoryCache = {
    data: null,
    timestamp: 0,
    promise: null
  };

  /**
   * Get business categories with caching and deduplication
   * Multiple concurrent calls will share the same promise
   */
  async getCategories(): Promise<BusinessCategory[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache.data && (now - this.cache.timestamp) < CACHE_DURATION) {
      console.log('[BusinessCategoryCache] Returning cached categories');
      return this.cache.data;
    }
    
    // If a request is already in progress, return the existing promise
    if (this.cache.promise) {
      console.log('[BusinessCategoryCache] Returning existing promise');
      return this.cache.promise;
    }
    
    // Create new request
    console.log('[BusinessCategoryCache] Fetching fresh categories');
    this.cache.promise = this.fetchCategories();
    
    try {
      const categories = await this.cache.promise;
      this.cache.data = categories;
      this.cache.timestamp = now;
      return categories;
    } finally {
      this.cache.promise = null;
    }
  }
  
  private async fetchCategories(): Promise<BusinessCategory[]> {
    const response = await businessCategoryService.getBusinessCategories();
    
    if (response.success && response.data) {
      // Handle different response formats
      if ('categories' in response.data && Array.isArray(response.data.categories)) {
        return response.data.categories;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
    }
    
    // Return empty array as fallback
    console.warn('[BusinessCategoryCache] Failed to fetch categories, using empty array');
    return [];
  }
  
  /**
   * Clear the cache (useful after updates)
   */
  clearCache(): void {
    this.cache.data = null;
    this.cache.timestamp = 0;
    this.cache.promise = null;
  }
}

// Export singleton instance
export const businessCategoryCache = new BusinessCategoryCache();
export default businessCategoryCache;