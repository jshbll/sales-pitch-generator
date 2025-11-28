/**
 * Business Profile Cache Configuration
 * 
 * Centralized configuration for business profile caching.
 * This allows for consistent cache settings across the application.
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
  /** Cache invalidation strategy */
  invalidationStrategy: 'time-based' | 'event-based' | 'hybrid';
  /** Stale-while-revalidate time in milliseconds */
  staleWhileRevalidateMs: number;
}

/**
 * Default cache configuration
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  defaultTtl: 5 * 60 * 1000, // 5 minutes
  maxItems: 100,
  debug: process.env.NODE_ENV === 'development',
  invalidationStrategy: 'hybrid',
  staleWhileRevalidateMs: 30 * 1000 // 30 seconds
};

/**
 * Cache key prefixes for different types of data
 */
export const CACHE_KEY_PREFIXES = {
  BUSINESS_PROFILE: 'business:profile:',
  USER_PROFILE: 'user:profile:',
  BUSINESS_CATEGORY: 'business:category:',
  BUSINESS_HOURS: 'business:hours:'
};

/**
 * Cache event types for event-based invalidation
 */
export enum CacheEventType {
  PROFILE_UPDATED = 'profile_updated',
  PROFILE_CREATED = 'profile_created',
  PROFILE_DELETED = 'profile_deleted',
  CATEGORY_UPDATED = 'category_updated',
  HOURS_UPDATED = 'hours_updated',
  CLEAR_ALL = 'clear_all'
}

export default {
  DEFAULT_CACHE_CONFIG,
  CACHE_KEY_PREFIXES,
  CacheEventType
};
