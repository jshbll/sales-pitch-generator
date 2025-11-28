/**
 * Business Circuit Breaker
 * 
 * This module provides circuit breaker functionality for business service API calls
 * to prevent overwhelming the API with requests during failures or rate limiting.
 */
import { BusinessProfile } from '../types';

// Circuit breaker configuration
export interface CircuitBreakerConfig {
  failureThreshold: number;    // Number of failures before opening the circuit
  resetTimeoutMs: number;      // Time before attempting to close the circuit
  lastFailureTime: number;     // Last time a failure occurred
  failureCount: number;        // Current count of consecutive failures
  isOpen: boolean;             // Whether the circuit is currently open (preventing calls)
  businessProfileCache: BusinessProfile | null; // Cache for business profile data
  cacheTimestamp: number;      // When the cache was last updated
  cacheMaxAgeMs: number;       // Cache expiration time
  rateLimitDetected: boolean;  // Flag to indicate if rate limiting was detected
  isRequestInProgress: boolean; // Flag to track if a request is currently in progress
  lastRequestTime: number;     // Timestamp of the last request
  lastRequestUserId: string;   // User ID associated with the last request
  minRequestInterval: number;  // Minimum time between requests
  lastLogTime: number;         // Track when we last logged to reduce console noise
}

// Default circuit breaker configuration
export const DEFAULT_CIRCUIT_BREAKER: CircuitBreakerConfig = {
  failureThreshold: 2,        // Number of failures before opening the circuit
  resetTimeoutMs: 60000,      // Time before attempting to close the circuit (60 seconds)
  lastFailureTime: 0,         // Last time a failure occurred
  failureCount: 0,            // Current count of consecutive failures
  isOpen: false,              // Whether the circuit is currently open
  businessProfileCache: null, // Cache for business profile data
  cacheTimestamp: 0,          // When the cache was last updated
  cacheMaxAgeMs: 10 * 60 * 1000, // Cache expiration time (10 minutes)
  rateLimitDetected: false,   // Flag to indicate if rate limiting was detected
  isRequestInProgress: false, // Flag to track if a request is currently in progress
  lastRequestTime: 0,         // Timestamp of the last request
  lastRequestUserId: '',      // User ID associated with the last request
  minRequestInterval: 1000,   // Minimum time between requests (1 second)
  lastLogTime: 0              // Track when we last logged to reduce console noise
};

/**
 * Business Circuit Breaker class
 * Provides methods for managing the circuit breaker state
 */
export class BusinessCircuitBreaker {
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CIRCUIT_BREAKER, ...config };
  }

  /**
   * Reset the circuit breaker state
   * This should be called when experiencing issues with requests being blocked
   */
  resetCircuitBreaker(): void {
    console.log('[BusinessCircuitBreaker] Resetting circuit breaker state');
    this.config.failureCount = 0;
    this.config.isOpen = false;
    this.config.lastFailureTime = 0;
    this.config.rateLimitDetected = false;
    this.config.isRequestInProgress = false;
    this.config.lastRequestTime = 0;
  }

  /**
   * Check if the circuit breaker is open
   * @returns boolean indicating if the circuit is open
   */
  isCircuitOpen(): boolean {
    // If the circuit is open but enough time has passed, we can try to close it
    if (this.config.isOpen && Date.now() - this.config.lastFailureTime > this.config.resetTimeoutMs) {
      console.log('[BusinessCircuitBreaker] Circuit reset timeout reached, closing circuit');
      this.config.isOpen = false;
      this.config.failureCount = 0;
    }
    return this.config.isOpen;
  }

  /**
   * Record a failure in the circuit breaker
   * @param isRateLimit Optional flag indicating if the failure was due to rate limiting
   */
  recordFailure(isRateLimit: boolean = false): void {
    this.config.failureCount++;
    this.config.lastFailureTime = Date.now();
    
    if (isRateLimit) {
      this.config.rateLimitDetected = true;
      console.warn('[BusinessCircuitBreaker] Rate limit detected, opening circuit');
      this.config.isOpen = true;
    } else if (this.config.failureCount >= this.config.failureThreshold) {
      console.warn(`[BusinessCircuitBreaker] Failure threshold reached (${this.config.failureCount}/${this.config.failureThreshold}), opening circuit`);
      this.config.isOpen = true;
    } else {
      console.warn(`[BusinessCircuitBreaker] Failure recorded (${this.config.failureCount}/${this.config.failureThreshold})`);
    }
  }

  /**
   * Record a success in the circuit breaker
   */
  recordSuccess(): void {
    if (this.config.failureCount > 0) {
      console.log('[BusinessCircuitBreaker] Success recorded, resetting failure count');
    }
    this.config.failureCount = 0;
    this.config.rateLimitDetected = false;
  }

  /**
   * Check if an error is related to rate limiting
   * @param error The error to check
   * @returns boolean indicating if the error is rate limit related
   */
  isRateLimitError(error: unknown): boolean {
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>;
      
      // Check for common rate limit status codes
      if (errorObj.status === 429 || errorObj.statusCode === 429) {
        return true;
      }
      
      // Check for rate limit messages
      if (typeof errorObj.message === 'string') {
        const message = errorObj.message.toLowerCase();
        return message.includes('rate limit') || 
               message.includes('too many requests') || 
               message.includes('throttled');
      }
    }
    return false;
  }

  /**
   * Check if a request is in progress for a specific user
   * @param userId The user ID to check
   * @returns boolean indicating if a request is in progress
   */
  isRequestInProgressForUser(userId: string): boolean {
    const now = Date.now();
    
    // If no request is in progress or it's for a different user, it's not in progress
    if (!this.config.isRequestInProgress || this.config.lastRequestUserId !== userId) {
      return false;
    }
    
    // If the request has been in progress for too long, consider it stale
    if (now - this.config.lastRequestTime > 10000) { // 10 seconds timeout
      console.log('[BusinessCircuitBreaker] Request timeout exceeded, resetting in-progress flag');
      this.config.isRequestInProgress = false;
      return false;
    }
    
    return true;
  }

  /**
   * Set the request in progress flag for a user
   * @param userId The user ID making the request
   */
  setRequestInProgress(userId: string): void {
    this.config.isRequestInProgress = true;
    this.config.lastRequestTime = Date.now();
    this.config.lastRequestUserId = userId;
  }

  /**
   * Reset the request in progress flag
   */
  resetRequestInProgress(): void {
    this.config.isRequestInProgress = false;
  }

  /**
   * Get the business profile cache
   * @returns The cached business profile or null if no cache or cache is expired
   */
  getBusinessProfileCache(): BusinessProfile | null {
    const now = Date.now();
    
    // Check if cache exists and is still valid
    if (this.config.businessProfileCache && 
        now - this.config.cacheTimestamp < this.config.cacheMaxAgeMs) {
      const cacheAge = (now - this.config.cacheTimestamp) / 1000;
      console.log(`[BusinessCircuitBreaker] Using cached business profile, age: ${cacheAge.toFixed(3)} seconds`);
      return this.config.businessProfileCache;
    }
    
    return null;
  }

  /**
   * Set the business profile cache
   * @param profile The business profile to cache
   */
  setBusinessProfileCache(profile: BusinessProfile): void {
    this.config.businessProfileCache = profile;
    this.config.cacheTimestamp = Date.now();
  }

  /**
   * Clear the business profile cache
   */
  clearBusinessProfileCache(): void {
    console.log('[BusinessCircuitBreaker] Clearing business profile cache');
    this.config.businessProfileCache = null;
    this.config.cacheTimestamp = 0;
  }

  /**
   * Get the circuit breaker configuration
   * @returns The current circuit breaker configuration
   */
  getConfig(): CircuitBreakerConfig {
    return { ...this.config };
  }
  
  /**
   * Execute a function with circuit breaker protection
   * 
   * @param fn - The async function to execute
   * @param userId - Optional user ID for request tracking
   * @returns The result of the function execution
   * @throws Will throw an error if the circuit is open or the function fails
   */
  async execute<T>(fn: () => Promise<T>, userId: string = 'unknown'): Promise<T> {
    // Check if the circuit is open
    if (this.isCircuitOpen()) {
      console.warn('[BusinessCircuitBreaker] Circuit is open, rejecting request');
      throw new Error('Service temporarily unavailable due to too many failures');
    }
    
    // Check if a request is already in progress for this user
    if (this.isRequestInProgressForUser(userId)) {
      console.warn('[BusinessCircuitBreaker] Request already in progress for user', userId);
      throw new Error('Request already in progress');
    }
    
    try {
      // Mark request as in progress
      this.setRequestInProgress(userId);
      
      // Execute the function
      const result = await fn();
      
      // Record success
      this.recordSuccess();
      
      return result;
    } catch (error) {
      // Check if it's a rate limit error
      const isRateLimit = this.isRateLimitError(error);
      
      // Record failure
      this.recordFailure(isRateLimit);
      
      // Rethrow the error
      throw error;
    } finally {
      // Reset request in progress flag
      this.resetRequestInProgress();
    }
  }
}

// Create and export a default instance
const businessCircuitBreaker = new BusinessCircuitBreaker();
export default businessCircuitBreaker;
