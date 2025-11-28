/**
 * Enhanced Business Profile Cache Service
 * 
 * Provides advanced caching functionality for business profile data
 * with stale-while-revalidate pattern, granular invalidation,
 * and event-based cache management.
 */
import { BusinessProfile } from '../../../types';
import logger from '../utils/loggerService';
import { CacheConfig, DEFAULT_CACHE_CONFIG, CACHE_KEY_PREFIXES, CacheEventType } from './cacheConfig';

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
  /** Whether this entry is being revalidated */
  isRevalidating?: boolean;
  /** Last revalidation timestamp */
  lastRevalidation?: number;
}

/**
 * Cache event listener
 */
type CacheEventListener = (event: CacheEventType, data?: unknown) => void;

/**
 * Enhanced Business Profile Cache Service class
 */
export class EnhancedCacheService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private config: CacheConfig;
  private eventListeners: Map<CacheEventType, Set<CacheEventListener>> = new Map();
  
  /**
   * Create a new cache service
   * 
   * @param config - Cache configuration
   */
  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      ...DEFAULT_CACHE_CONFIG,
      ...config
    };
    
    // Initialize event listeners for each event type
    Object.values(CacheEventType).forEach(eventType => {
      this.eventListeners.set(eventType, new Set());
    });
  }
  
  /**
   * Generate a cache key from components
   * 
   * @param type - Cache entry type
   * @param userId - User ID
   * @param businessId - Business ID
   * @returns Cache key
   */
  generateKey(type: string, userId?: string, businessId?: string): string {
    const prefix = CACHE_KEY_PREFIXES[type as keyof typeof CACHE_KEY_PREFIXES] || 'custom:';
    return `${prefix}${userId || 'anonymous'}:${businessId || 'all'}`;
  }
  
  /**
   * Set a value in the cache
   * 
   * @param data - Data to cache
   * @param type - Cache entry type
   * @param userId - User ID
   * @param businessId - Business ID
   * @param ttl - Time To Live in milliseconds
   * @returns True if the value was set
   */
  set<T>(data: T, type: string, userId?: string, businessId?: string, ttl?: number): boolean {
    if (!this.config.enabled) {
      return false;
    }
    
    const key = this.generateKey(type, userId, businessId);
    
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
      logger.debug(`[EnhancedCacheService] Set: ${key}`, {
        cacheKey: key,
        operation: 'set',
        dataType: type,
        userId,
        businessId
      });
    }
    
    return true;
  }
  
  /**
   * Get a value from the cache with stale-while-revalidate support
   * 
   * @param type - Cache entry type
   * @param userId - User ID
   * @param businessId - Business ID
   * @param revalidateFn - Optional function to call for revalidation
   * @returns Cached data or undefined if not found or expired
   */
  async get<T>(
    type: string, 
    userId?: string, 
    businessId?: string,
    revalidateFn?: () => Promise<T>
  ): Promise<{ data: T | undefined, isStale: boolean }> {
    if (!this.config.enabled) {
      return { data: undefined, isStale: false };
    }
    
    const key = this.generateKey(type, userId, businessId);
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    // If no entry found, return undefined
    if (!entry) {
      if (this.config.debug) {
        logger.debug(`[EnhancedCacheService] Miss: ${key}`, {
          cacheKey: key,
          operation: 'get',
          result: 'miss',
          dataType: type,
          userId,
          businessId
        });
      }
      return { data: undefined, isStale: false };
    }
    
    const now = Date.now();
    const age = now - entry.timestamp;
    
    // Check if the entry is fresh
    if (age < entry.ttl) {
      if (this.config.debug) {
        logger.debug(`[EnhancedCacheService] Hit (fresh): ${key}`, {
          cacheKey: key,
          operation: 'get',
          result: 'hit_fresh',
          age: age / 1000,
          ttl: entry.ttl / 1000,
          dataType: type,
          userId,
          businessId
        });
      }
      return { data: entry.data as T, isStale: false };
    }
    
    // Check if the entry is stale but within the stale-while-revalidate window
    if (age < entry.ttl + this.config.staleWhileRevalidateMs) {
      // If a revalidation function is provided and the entry is not already being revalidated
      if (revalidateFn && !entry.isRevalidating) {
        // Mark as being revalidated
        entry.isRevalidating = true;
        entry.lastRevalidation = now;
        
        // Revalidate in the background
        this.revalidateInBackground(key, entry, revalidateFn);
      }
      
      if (this.config.debug) {
        logger.debug(`[EnhancedCacheService] Hit (stale): ${key}`, {
          cacheKey: key,
          operation: 'get',
          result: 'hit_stale',
          age: age / 1000,
          ttl: entry.ttl / 1000,
          dataType: type,
          userId,
          businessId,
          isRevalidating: entry.isRevalidating
        });
      }
      
      return { data: entry.data as T, isStale: true };
    }
    
    // Entry is expired beyond the stale window
    if (this.config.debug) {
      logger.debug(`[EnhancedCacheService] Expired: ${key}`, {
        cacheKey: key,
        operation: 'get',
        result: 'expired',
        age: age / 1000,
        ttl: entry.ttl / 1000,
        dataType: type,
        userId,
        businessId
      });
    }
    
    this.cache.delete(key);
    return { data: undefined, isStale: false };
  }
  
  /**
   * Revalidate a cache entry in the background
   * 
   * @param key - Cache key
   * @param entry - Cache entry
   * @param revalidateFn - Function to call for revalidation
   */
  private async revalidateInBackground<T>(
    key: string, 
    entry: CacheEntry<T>, 
    revalidateFn: () => Promise<T>
  ): Promise<void> {
    try {
      const freshData = await revalidateFn();
      
      // Update the cache with fresh data
      this.cache.set(key, {
        ...entry,
        data: freshData,
        timestamp: Date.now(),
        isRevalidating: false
      });
      
      if (this.config.debug) {
        logger.debug(`[EnhancedCacheService] Revalidated: ${key}`, {
          cacheKey: key,
          operation: 'revalidate',
          result: 'success'
        });
      }
    } catch (error) {
      // If revalidation fails, mark the entry as not being revalidated
      entry.isRevalidating = false;
      
      logger.warn(`[EnhancedCacheService] Revalidation failed: ${key}`, {
        cacheKey: key,
        operation: 'revalidate',
        result: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  /**
   * Invalidate a specific cache entry
   * 
   * @param type - Cache entry type
   * @param userId - User ID
   * @param businessId - Business ID
   * @returns True if an entry was invalidated
   */
  invalidate(type: string, userId?: string, businessId?: string): boolean {
    if (!this.config.enabled) {
      return false;
    }
    
    const key = this.generateKey(type, userId, businessId);
    const result = this.cache.delete(key);
    
    if (this.config.debug && result) {
      logger.debug(`[EnhancedCacheService] Invalidated: ${key}`, {
        cacheKey: key,
        operation: 'invalidate',
        dataType: type,
        userId,
        businessId
      });
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
    if (!this.config.enabled || !userId) {
      return 0;
    }
    
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.keyComponents.userId === userId) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (this.config.debug && count > 0) {
      logger.debug(`[EnhancedCacheService] Invalidated ${count} entries for user: ${userId}`, {
        operation: 'invalidateForUser',
        userId,
        count
      });
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
    if (!this.config.enabled || !businessId) {
      return 0;
    }
    
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.keyComponents.businessId === businessId) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (this.config.debug && count > 0) {
      logger.debug(`[EnhancedCacheService] Invalidated ${count} entries for business: ${businessId}`, {
        operation: 'invalidateForBusiness',
        businessId,
        count
      });
    }
    
    return count;
  }
  
  /**
   * Invalidate all cache entries of a specific type
   * 
   * @param type - Cache entry type
   * @returns Number of entries invalidated
   */
  invalidateByType(type: string): number {
    if (!this.config.enabled || !type) {
      return 0;
    }
    
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.keyComponents.type === type) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (this.config.debug && count > 0) {
      logger.debug(`[EnhancedCacheService] Invalidated ${count} entries of type: ${type}`, {
        operation: 'invalidateByType',
        type,
        count
      });
    }
    
    return count;
  }
  
  /**
   * Clear all cache entries
   * 
   * @returns Number of entries cleared
   */
  clear(): number {
    if (!this.config.enabled) {
      return 0;
    }
    
    const count = this.cache.size;
    this.cache.clear();
    
    if (this.config.debug && count > 0) {
      logger.debug(`[EnhancedCacheService] Cleared ${count} entries`, {
        operation: 'clear',
        count
      });
    }
    
    return count;
  }
  
  /**
   * Subscribe to cache events
   * 
   * @param eventType - Event type to subscribe to
   * @param listener - Event listener function
   * @returns Unsubscribe function
   */
  subscribe(eventType: CacheEventType, listener: CacheEventListener): () => void {
    const listeners = this.eventListeners.get(eventType);
    
    if (listeners) {
      listeners.add(listener);
      
      // Return unsubscribe function
      return () => {
        listeners.delete(listener);
      };
    }
    
    // Return no-op function if event type is not valid
    return () => {};
  }
  
  /**
   * Emit a cache event
   * 
   * @param eventType - Event type to emit
   * @param data - Optional event data
   */
  emit(eventType: CacheEventType, data?: unknown): void {
    const listeners = this.eventListeners.get(eventType);
    
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(eventType, data);
        } catch (error) {
          logger.error(`[EnhancedCacheService] Error in event listener for ${eventType}`, {
            eventType,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });
    }
  }
  
  /**
   * Evict the oldest cache entry
   * 
   * @returns True if an entry was evicted
   */
  private evictOldest(): boolean {
    if (this.cache.size === 0) {
      return false;
    }
    
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
        logger.debug(`[EnhancedCacheService] Evicted oldest: ${oldestKey}`, {
          cacheKey: oldestKey,
          operation: 'evict',
          timestamp: oldestTimestamp
        });
      }
      
      return result;
    }
    
    return false;
  }
  
  /**
   * Get cache statistics
   * 
   * @returns Cache statistics
   */
  getStats(): Record<string, unknown> {
    const now = Date.now();
    
    // Count fresh and stale entries
    let freshCount = 0;
    let staleCount = 0;
    let revalidatingCount = 0;
    
    for (const entry of this.cache.values()) {
      const age = now - entry.timestamp;
      
      if (age < entry.ttl) {
        freshCount++;
      } else {
        staleCount++;
      }
      
      if (entry.isRevalidating) {
        revalidatingCount++;
      }
    }
    
    return {
      size: this.cache.size,
      maxItems: this.config.maxItems,
      utilization: this.cache.size / this.config.maxItems,
      freshCount,
      staleCount,
      revalidatingCount,
      enabled: this.config.enabled,
      defaultTtl: this.config.defaultTtl,
      staleWhileRevalidateMs: this.config.staleWhileRevalidateMs,
      invalidationStrategy: this.config.invalidationStrategy
    };
  }
}

// Create and export a default instance
const enhancedCacheService = new EnhancedCacheService();
export default enhancedCacheService;
