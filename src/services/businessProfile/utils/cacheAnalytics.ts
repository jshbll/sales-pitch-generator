/**
 * Business Profile Cache Analytics
 * 
 * Provides utilities for monitoring and analyzing cache performance
 * to optimize caching strategies.
 */
import logger from './browserLogger';

/**
 * Cache operation types
 */
export enum CacheOperationType {
  GET = 'get',
  SET = 'set',
  INVALIDATE = 'invalidate',
  CLEAR = 'clear',
  MISS = 'miss',
  HIT = 'hit',
  STALE_HIT = 'stale_hit'
}

/**
 * Cache analytics data
 */
interface CacheAnalyticsData {
  /** Total cache hits */
  hits: number;
  /** Total cache misses */
  misses: number;
  /** Total stale cache hits */
  staleHits: number;
  /** Total cache operations */
  operations: number;
  /** Cache hit rate (hits / operations) */
  hitRate: number;
  /** Cache operations by type */
  operationsByType: Record<CacheOperationType, number>;
  /** Cache operations by data type */
  operationsByDataType: Record<string, number>;
  /** Average operation time in milliseconds */
  averageOperationTimeMs: number;
  /** Total operation time in milliseconds */
  totalOperationTimeMs: number;
  /** Sample size for average operation time */
  operationTimeSamples: number;
  /** Last reset timestamp */
  lastResetTime: number;
}

/**
 * Cache Analytics class
 */
export class CacheAnalytics {
  private data: CacheAnalyticsData;
  private readonly maxSampleSize = 1000;
  private operationTimes: number[] = [];
  
  /**
   * Create a new cache analytics instance
   */
  constructor() {
    this.data = this.createInitialData();
  }
  
  /**
   * Create initial analytics data
   * 
   * @returns Initial analytics data
   */
  private createInitialData(): CacheAnalyticsData {
    return {
      hits: 0,
      misses: 0,
      staleHits: 0,
      operations: 0,
      hitRate: 0,
      operationsByType: {
        [CacheOperationType.GET]: 0,
        [CacheOperationType.SET]: 0,
        [CacheOperationType.INVALIDATE]: 0,
        [CacheOperationType.CLEAR]: 0,
        [CacheOperationType.MISS]: 0,
        [CacheOperationType.HIT]: 0,
        [CacheOperationType.STALE_HIT]: 0
      },
      operationsByDataType: {},
      averageOperationTimeMs: 0,
      totalOperationTimeMs: 0,
      operationTimeSamples: 0,
      lastResetTime: Date.now()
    };
  }
  
  /**
   * Record a cache operation
   * 
   * @param type - Operation type
   * @param dataType - Data type
   * @param durationMs - Operation duration in milliseconds
   */
  recordOperation(type: CacheOperationType, dataType: string, durationMs?: number): void {
    // Increment total operations
    this.data.operations++;
    
    // Increment operation by type
    this.data.operationsByType[type] = (this.data.operationsByType[type] || 0) + 1;
    
    // Increment operation by data type
    this.data.operationsByDataType[dataType] = (this.data.operationsByDataType[dataType] || 0) + 1;
    
    // Record specific operation types
    if (type === CacheOperationType.HIT) {
      this.data.hits++;
    } else if (type === CacheOperationType.MISS) {
      this.data.misses++;
    } else if (type === CacheOperationType.STALE_HIT) {
      this.data.staleHits++;
      this.data.hits++; // Stale hits are still hits
    }
    
    // Update hit rate
    this.data.hitRate = this.data.operations > 0 
      ? this.data.hits / this.data.operations 
      : 0;
    
    // Record operation time if provided
    if (durationMs !== undefined) {
      // Add to operation times array, limited to max sample size
      if (this.operationTimes.length >= this.maxSampleSize) {
        this.operationTimes.shift(); // Remove oldest
      }
      this.operationTimes.push(durationMs);
      
      // Update operation time metrics
      this.data.totalOperationTimeMs += durationMs;
      this.data.operationTimeSamples++;
      this.data.averageOperationTimeMs = this.data.totalOperationTimeMs / this.data.operationTimeSamples;
    }
  }
  
  /**
   * Reset analytics data
   */
  reset(): void {
    this.data = this.createInitialData();
    this.operationTimes = [];
    
    logger.debug('[CacheAnalytics] Analytics data reset');
  }
  
  /**
   * Get analytics data
   * 
   * @returns Current analytics data
   */
  getAnalytics(): CacheAnalyticsData {
    return { ...this.data };
  }
  
  /**
   * Get hit rate for a specific data type
   * 
   * @param dataType - Data type
   * @returns Hit rate for the data type
   */
  getHitRateForDataType(dataType: string): number {
    const hits = this.data.operationsByDataType[`${dataType}_hit`] || 0;
    const misses = this.data.operationsByDataType[`${dataType}_miss`] || 0;
    const total = hits + misses;
    
    return total > 0 ? hits / total : 0;
  }
  
  /**
   * Log analytics summary
   */
  logSummary(): void {
    const summary = {
      hitRate: `${(this.data.hitRate * 100).toFixed(2)}%`,
      hits: this.data.hits,
      misses: this.data.misses,
      staleHits: this.data.staleHits,
      operations: this.data.operations,
      avgOperationTimeMs: this.data.averageOperationTimeMs.toFixed(2),
      topDataTypes: this.getTopDataTypes(5)
    };
    
    logger.info('[CacheAnalytics] Cache performance summary', { 
      component: 'CacheAnalytics',
      context: summary 
    });
  }
  
  /**
   * Get top data types by operation count
   * 
   * @param limit - Maximum number of data types to return
   * @returns Top data types with operation counts
   */
  private getTopDataTypes(limit: number): Record<string, number> {
    const entries = Object.entries(this.data.operationsByDataType);
    
    // Sort by operation count (descending)
    entries.sort((a, b) => b[1] - a[1]);
    
    // Take top N entries
    const topEntries = entries.slice(0, limit);
    
    // Convert back to object
    return Object.fromEntries(topEntries);
  }
}

// Create and export a default instance
const cacheAnalytics = new CacheAnalytics();
export default cacheAnalytics;
