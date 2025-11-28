/**
 * Business Profile Cache Service
 * 
 * Provides caching functionality for business profile data
 * with configurable TTL and cache invalidation.
 */

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Whether the cache is enabled */
  enabled: boolean;
  /** Default Time To Live in milliseconds */
  defaultTtl: number;
  /** Maximum number of items in cache */
  maxItems: number;
  /** Enable debug logging */
  debug: boolean;
}

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  /** The cached data */
  data: T;
  /** Timestamp when the entry was created */
  timestamp: number;
  /** Time To Live in milliseconds */
  ttl: number;
  /** Key components used to generate this cache entry */
  keyComponents: {
    userId?: string;
    businessId?: string;
    type?: string;
  };
}

/**
 * Business Profile Cache Service class
 */
export class BusinessProfileCacheService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private config: CacheConfig;
  
  /** Default configuration */
  private static readonly DEFAULT_CONFIG: CacheConfig = {
    enabled: true,
    maxItems: 100,
    defaultTtl: 5 * 60 * 1000, // 5 minutes
    debug: false
  };

  /**
   * Create a new cache service
   * 
   * @param config - Cache configuration
   */
  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      ...BusinessProfileCacheService.DEFAULT_CONFIG,
      ...config
    };
  }
  
  /**
   * Generate a cache key from components
   * 
   * @param userId - User ID
   * @param businessId - Business ID
   * @param type - Cache entry type
   * @returns Cache key
   */
  generateKey(userId?: string, businessId?: string, type?: string): string {
    return `business:${userId || 'anonymous'}:${businessId || 'all'}:${type || 'data'}`;
  }
  
  /**
   * Set a value in the cache
   * 
   * @param data - Data to cache
   * @param userId - User ID
   * @param businessId - Business ID
   * @param type - Cache entry type
   * @param ttl - Time To Live in milliseconds
   * @returns True if the value was set
   */
  set<T>(data: T, userId?: string, businessId?: string, type?: string, ttl?: number): boolean {
    const key = this.generateKey(userId, businessId, type);
    
    // Check if we need to evict items
    if (this.cache.size >= this.config.maxItems) {
      this.evictOldest();
    }
    
    // Store the data with metadata
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTtl,
      keyComponents: { userId, businessId, type }
    });
    
    if (this.config.debug) {
      console.log(`[CacheService] Set: ${key}`);
    }
    
    return true;
  }
  
  /**
   * Get a value from the cache
   * 
   * @param userId - User ID
   * @param businessId - Business ID
   * @param type - Cache entry type
   * @returns Cached data or undefined if not found or expired
   */
  get<T>(userId?: string, businessId?: string, type?: string): T | undefined {
    const key = this.generateKey(userId, businessId, type);
    const entry = this.cache.get(key);
    
    // If no entry found, return undefined
    if (!entry) {
      if (this.config.debug) {
        console.log(`[CacheService] Miss: ${key}`);
      }
      return undefined;
    }
    
    // Check if the entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      if (this.config.debug) {
        console.log(`[CacheService] Expired: ${key}`);
      }
      this.cache.delete(key);
      return undefined;
    }
    
    if (this.config.debug) {
      console.log(`[CacheService] Hit: ${key}`);
    }
    
    return entry.data as T;
  }
  
  /**
   * Get a cached item by business ID
   * 
   * @param businessId - The business ID
   * @param key - Optional key to get a specific item
   * @returns The cached item or undefined if not found
   */
  getByBusinessId<T>(businessId: string, key?: string): T | undefined {
    if (!businessId) {
      return undefined;
    }
    
    // Check if the cache is enabled
    if (!this.config.enabled) {
      return undefined;
    }
    
    // Look through all cache entries to find one with the matching business ID
    for (const [cacheKey, entry] of this.cache.entries()) {
      // Parse the cache key to extract user ID, business ID, and item key
      const [, entryBusinessId, entryKey] = cacheKey.split(':');
      
      // Check if the business ID matches and the key matches if provided
      if (entryBusinessId === businessId && (!key || entryKey === key)) {
        // Check if the entry is expired
        if (this.isExpired(entry)) {
          // Remove expired entry
          this.cache.delete(cacheKey);
          return undefined;
        }
        
        // Return the cached value
        return entry.data as T;
      }
    }
    
    return undefined;
  }
  
  /**
   * Invalidate a specific cache entry
   * 
   * @param userId - User ID
   * @param businessId - Business ID
   * @param type - Cache entry type
   * @returns True if an entry was invalidated
   */
  invalidate(userId?: string, businessId?: string, type?: string): boolean {
    const key = this.generateKey(userId, businessId, type);
    const result = this.cache.delete(key);
    
    if (this.config.debug && result) {
      console.log(`[CacheService] Invalidated: ${key}`);
    }
    
    return result;
  }
  
  /**
   * Invalidate all cache entries for a user
   * 
   * @param userId - User ID
   * @returns Number of entries invalidated
   */
  invalidateForUser(userId: string): number {
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.keyComponents.userId === userId) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (this.config.debug && count > 0) {
      console.log(`[CacheService] Invalidated ${count} entries for user: ${userId}`);
    }
    
    return count;
  }
  
  /**
   * Invalidate all cache entries for a business
   * 
   * @param businessId - Business ID
   * @returns Number of entries invalidated
   */
  invalidateForBusiness(businessId: string): number {
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.keyComponents.businessId === businessId) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (this.config.debug && count > 0) {
      console.log(`[CacheService] Invalidated ${count} entries for business: ${businessId}`);
    }
    
    return count;
  }
  
  /**
   * Clear all cache entries
   * 
   * @returns Number of entries cleared
   */
  clear(): number {
    const count = this.cache.size;
    this.cache.clear();
    
    if (this.config.debug && count > 0) {
      console.log(`[CacheService] Cleared ${count} entries`);
    }
    
    return count;
  }
  
  /**
   * Evict the oldest cache entry
   * 
   * @returns True if an entry was evicted
   */
  private evictOldest(): boolean {
    let oldestKey: string | undefined;
    let oldestTimestamp = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      const result = this.cache.delete(oldestKey);
      
      if (this.config.debug && result) {
        console.log(`[CacheService] Evicted oldest: ${oldestKey}`);
      }
      
      return result;
    }
    
    return false;
  }
  
  /**
   * Check if a cache entry is expired
   * 
   * @param entry - Cache entry
   * @returns True if the entry is expired
   */
  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }
  
  /**
   * Get cache statistics
   * 
   * @returns Cache statistics
   */
  getStats(): Record<string, unknown> {
    return {
      size: this.cache.size,
      maxItems: this.config.maxItems,
      defaultTtl: this.config.defaultTtl,
      utilization: this.cache.size / this.config.maxItems
    };
  }
}

// Create and export a default instance
const businessProfileCacheService = new BusinessProfileCacheService();
export default businessProfileCacheService;
