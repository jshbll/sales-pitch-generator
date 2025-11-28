/**
 * cacheUtils.ts
 * Utility functions for browser localStorage caching with TypeScript support
 */

// Cache durations in milliseconds
export const CACHE_DURATIONS = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  DAY: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Result type for cached value retrieval
 */
export interface CacheResult<T> {
  value: T;
  isValid: boolean;
  age: number;
}

/**
 * Get a value from cache with type safety
 * @param key The cache key
 * @param defaultValue Default value to return if cache miss
 * @returns The cached value or default with metadata
 */
export function getCachedValue<T>(key: string, defaultValue: T): CacheResult<T> {
  try {
    const cachedData = localStorage.getItem(key);
    const cachedTimestamp = localStorage.getItem(`${key}_timestamp`);
    
    if (cachedData && cachedTimestamp) {
      const cacheAge = Date.now() - parseInt(cachedTimestamp, 10);
      return {
        value: JSON.parse(cachedData) as T,
        isValid: true,
        age: cacheAge
      };
    }
  } catch (e) {
    console.warn(`[CacheUtils] Error reading cache for ${key}:`, e);
  }
  
  return { value: defaultValue, isValid: false, age: Infinity };
}

/**
 * Set a value in cache with type safety
 * @param key The cache key
 * @param value Value to cache
 */
export function setCachedValue<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem(`${key}_timestamp`, Date.now().toString());
  } catch (e) {
    console.warn(`[CacheUtils] Error setting cache for ${key}:`, e);
  }
}

/**
 * Clear a cached value and its timestamp
 * @param key The cache key
 */
export function clearCache(key: string): void {
  localStorage.removeItem(key);
  localStorage.removeItem(`${key}_timestamp`);
}

/**
 * Clear a user-specific cache entry
 * @param key Base cache key
 * @param userId User ID
 */
export function clearUserCache(key: string, userId: string): void {
  clearCache(`${key}_${userId}`);
}

/**
 * Check if a cached value is fresh (within duration)
 * @param key The cache key
 * @param maxAge Maximum age in milliseconds
 * @returns True if cache exists and is within maxAge
 */
export function isCacheFresh(key: string, maxAge: number): boolean {
  try {
    const timestampStr = localStorage.getItem(`${key}_timestamp`);
    if (!timestampStr) return false;
    
    const timestamp = parseInt(timestampStr, 10);
    const age = Date.now() - timestamp;
    return age < maxAge;
  } catch {
    return false;
  }
}
