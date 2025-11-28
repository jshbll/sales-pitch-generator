/**
 * Business Profile Cache Manager
 * 
 * Manages caching of business profile data with TTL and invalidation.
 * Uses localStorage for persistence across sessions.
 * 
 * @module businessProfileCache
 * @version 2.0.0
 */

import { BusinessProfile } from '../../types/business/businessProfile.types';

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  PREFIX: 'jaxsaver_business_cache_',
  TTL: 10 * 60 * 1000, // 10 minutes
  MAX_ENTRIES: 50
} as const;

/**
 * Cache entry structure
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expires: number;
}

/**
 * Business Profile Cache Manager
 * Provides caching functionality for business profiles
 */
class BusinessProfileCache {
  /**
   * Get a cached business profile
   * @param businessId Business ID
   * @returns Cached profile or null if not found/expired
   */
  get(businessId: string): BusinessProfile | null {
    try {
      const key = this.getCacheKey(businessId);
      const cached = localStorage.getItem(key);
      
      if (!cached) return null;
      
      const entry: CacheEntry<BusinessProfile> = JSON.parse(cached);
      
      // Check if expired
      if (Date.now() > entry.expires) {
        this.remove(businessId);
        return null;
      }
      
      return entry.data;
    } catch (error) {
      console.warn('[BusinessProfileCache] Error reading cache:', error);
      return null;
    }
  }

  /**
   * Set a business profile in cache
   * @param businessId Business ID
   * @param profile Business profile data
   * @param ttl Optional TTL in milliseconds
   */
  set(businessId: string, profile: BusinessProfile, ttl?: number): void {
    try {
      const key = this.getCacheKey(businessId);
      const now = Date.now();
      
      const entry: CacheEntry<BusinessProfile> = {
        data: profile,
        timestamp: now,
        expires: now + (ttl || CACHE_CONFIG.TTL)
      };
      
      localStorage.setItem(key, JSON.stringify(entry));
      
      // Clean up old entries if needed
      this.cleanup();
    } catch (error) {
      console.warn('[BusinessProfileCache] Error setting cache:', error);
    }
  }

  /**
   * Remove a business profile from cache
   * @param businessId Business ID
   */
  remove(businessId: string): void {
    try {
      const key = this.getCacheKey(businessId);
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('[BusinessProfileCache] Error removing cache:', error);
    }
  }

  /**
   * Clear all business profile caches
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_CONFIG.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('[BusinessProfileCache] Error clearing cache:', error);
    }
  }

  /**
   * Invalidate cache for a specific user's business
   * @param userId User ID
   */
  invalidateUserBusiness(userId: string): void {
    try {
      // Find and remove cache entries owned by this user
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_CONFIG.PREFIX)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const entry: CacheEntry<BusinessProfile> = JSON.parse(cached);
              if (entry.data.owner_id === userId) {
                localStorage.removeItem(key);
              }
            }
          } catch (e) {
            // Skip invalid entries
          }
        }
      });
    } catch (error) {
      console.warn('[BusinessProfileCache] Error invalidating user business:', error);
    }
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getStats(): {
    totalEntries: number;
    validEntries: number;
    expiredEntries: number;
    totalSize: number;
  } {
    let totalEntries = 0;
    let validEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;
    
    try {
      const now = Date.now();
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(CACHE_CONFIG.PREFIX)) {
          totalEntries++;
          const cached = localStorage.getItem(key);
          if (cached) {
            totalSize += cached.length;
            try {
              const entry: CacheEntry<BusinessProfile> = JSON.parse(cached);
              if (now > entry.expires) {
                expiredEntries++;
              } else {
                validEntries++;
              }
            } catch (e) {
              // Count as expired if we can't parse
              expiredEntries++;
            }
          }
        }
      });
    } catch (error) {
      console.warn('[BusinessProfileCache] Error getting stats:', error);
    }
    
    return { totalEntries, validEntries, expiredEntries, totalSize };
  }

  /**
   * Clean up old cache entries
   * Removes expired entries and enforces max entry limit
   */
  private cleanup(): void {
    try {
      const now = Date.now();
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_CONFIG.PREFIX));
      
      // Remove expired entries
      cacheKeys.forEach(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry: CacheEntry<BusinessProfile> = JSON.parse(cached);
            if (now > entry.expires) {
              localStorage.removeItem(key);
            }
          }
        } catch (e) {
          // Remove invalid entries
          localStorage.removeItem(key);
        }
      });
      
      // Enforce max entries limit
      const remainingKeys = Object.keys(localStorage)
        .filter(key => key.startsWith(CACHE_CONFIG.PREFIX))
        .sort((a, b) => {
          try {
            const aData = localStorage.getItem(a);
            const bData = localStorage.getItem(b);
            if (!aData || !bData) return 0;
            
            const aEntry: CacheEntry<BusinessProfile> = JSON.parse(aData);
            const bEntry: CacheEntry<BusinessProfile> = JSON.parse(bData);
            
            return aEntry.timestamp - bEntry.timestamp;
          } catch (e) {
            return 0;
          }
        });
      
      // Remove oldest entries if over limit
      while (remainingKeys.length > CACHE_CONFIG.MAX_ENTRIES) {
        const oldestKey = remainingKeys.shift();
        if (oldestKey) {
          localStorage.removeItem(oldestKey);
        }
      }
    } catch (error) {
      console.warn('[BusinessProfileCache] Error during cleanup:', error);
    }
  }

  /**
   * Get cache key for a business ID
   * @param businessId Business ID
   * @returns Cache key
   */
  private getCacheKey(businessId: string): string {
    return `${CACHE_CONFIG.PREFIX}${businessId}`;
  }
}

// Export singleton instance
const businessProfileCache = new BusinessProfileCache();
export default businessProfileCache;