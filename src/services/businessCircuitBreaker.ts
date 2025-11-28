/**
 * Browser-compatible Business Circuit Breaker
 * 
 * This module provides circuit breaker functionality for business service API calls
 * to prevent overwhelming the API with requests during failures or rate limiting.
 * Implements a simplified circuit breaker pattern that works in browser environments.
 */
import { BusinessProfile } from '../types';

// Custom EventEmitter for browser environments
class EventEmitter {
  private events: Record<string, Array<(...args: unknown[]) => void>> = {};

  on(event: string, listener: (...args: unknown[]) => void): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  emit(event: string, ...args: unknown[]): void {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(...args));
    }
  }

  removeListener(event: string, listener: (...args: unknown[]) => void): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
  }
}

// Browser-compatible CircuitBreaker implementation
class CircuitBreaker<T> extends EventEmitter {
  private action: (fn: () => Promise<T>) => Promise<T>;
  private options: CircuitBreakerOptions;
  private state: 'closed' | 'open' | 'halfOpen' = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private totalCount = 0;
  private lastFailureTime = 0;
  private resetTimer: number | null = null;

  constructor(action: (fn: () => Promise<T>) => Promise<T>, options: CircuitBreakerOptions) {
    super();
    this.action = action;
    this.options = options;
  }

  async fire(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      // Check if it's time to try again
      if (Date.now() - this.lastFailureTime >= this.options.resetTimeout) {
        this.halfOpen();
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await Promise.race([
        this.action(fn),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Operation timed out')), this.options.timeout);
        })
      ]);

      this.success();
      return result;
    } catch (error) {
      this.failure();
      throw error;
    }
  }

  private success(): void {
    this.successCount++;
    this.totalCount++;

    if (this.state === 'halfOpen') {
      this.close();
    }
  }

  private failure(): void {
    this.failureCount++;
    this.totalCount++;
    this.lastFailureTime = Date.now();

    const failureRate = this.failureCount / this.totalCount * 100;
    if ((this.state === 'closed' && failureRate >= this.options.errorThresholdPercentage) ||
        this.state === 'halfOpen') {
      this.open();
    }
  }

  public open(): void {
    if (this.state !== 'open') {
      this.state = 'open';
      this.emit('open');

      // Schedule half-open after reset timeout
      if (this.resetTimer !== null) {
        window.clearTimeout(this.resetTimer);
      }
      this.resetTimer = window.setTimeout(() => this.halfOpen(), this.options.resetTimeout);
    }
  }

  public halfOpen(): void {
    if (this.state !== 'halfOpen') {
      this.state = 'halfOpen';
      this.emit('halfOpen');
    }
  }

  public close(): void {
    if (this.state !== 'closed') {
      this.state = 'closed';
      this.failureCount = 0;
      this.successCount = 0;
      this.totalCount = 0;
      this.emit('close');
    }
  }

  // Status methods to match Opossum API
  isOpen(): boolean {
    return this.state === 'open';
  }

  isClosed(): boolean {
    return this.state === 'closed';
  }

  isHalfOpen(): boolean {
    return this.state === 'halfOpen';
  }
  
  // Status property to match Opossum API
  get status() {
    return {
      state: this.state,
      stats: {
        failures: this.failureCount,
        fallbacks: 0,
        successes: this.successCount,
        rejects: 0,
        fires: this.totalCount
      }
    };
  }
}

// Circuit breaker options interface
interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  timeout: number;
  errorThresholdPercentage: number;
  rollingCountTimeout: number;
  rollingCountBuckets: number;
  name: string;
}

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
  requestTracker: Map<string, number>; // Track requests per endpoint/user combination
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
  lastLogTime: 0,             // Track when we last logged to reduce console noise
  requestTracker: new Map()   // Track requests per endpoint/user combination
};

// Opossum circuit breaker options
const DEFAULT_OPOSSUM_OPTIONS = {
  failureThreshold: 50,       // 50% failure rate triggers circuit opening
  resetTimeout: 60000,        // 60 seconds before trying to close circuit
  timeout: 10000,             // 10 second timeout for function execution
  errorThresholdPercentage: 50, // Same as failureThreshold but in percentage
  rollingCountTimeout: 60000, // 60 second window for failure rate calculation
  rollingCountBuckets: 10,    // Number of buckets for tracking failures
  name: 'businessCircuitBreaker' // Name for the circuit breaker
};

/**
 * Business Circuit Breaker class
 * Provides methods for managing the circuit breaker state
 * Uses Opossum for robust circuit breaker implementation
 */
export class BusinessCircuitBreaker {
  private config: CircuitBreakerConfig;
  private circuitBreaker: CircuitBreaker<unknown>;
  private circuitBreakerMap: Map<string, CircuitBreaker<unknown>> = new Map();
  private requestTracker: Map<string, number> = new Map(); // Track requests per endpoint/user combination
  
  // Memory limits
  private readonly MAX_CIRCUIT_BREAKERS = 100;
  private readonly MAX_REQUEST_TRACKERS = 1000;
  
  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CIRCUIT_BREAKER, ...config };
    
    // Create default circuit breaker
    this.circuitBreaker = new CircuitBreaker<unknown>(async (fn: () => Promise<unknown>) => {
      return await fn();
    }, DEFAULT_OPOSSUM_OPTIONS);
    
    // Set up event listeners for the circuit breaker
    this.setupCircuitBreakerEvents(this.circuitBreaker);
    
    // Set up periodic cleanup of stale request trackers
    setInterval(() => {
      this.cleanupStaleRequestTrackers();
    }, 60000); // Run cleanup every minute
  }
  
  /**
   * Clean up stale request trackers
   */
  private cleanupStaleRequestTrackers(): void {
    const now = Date.now();
    const staleThreshold = 30000; // 30 seconds
    let cleaned = 0;
    
    for (const [key, timestamp] of this.requestTracker.entries()) {
      if (now - timestamp > staleThreshold) {
        this.requestTracker.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[BusinessCircuitBreaker] Cleaned up ${cleaned} stale request trackers. Current size: ${this.requestTracker.size}`);
    }
  }
  
  /**
   * Set up event listeners for a circuit breaker instance
   * @param breaker The circuit breaker to set up
   */
  private setupCircuitBreakerEvents(breaker: CircuitBreaker<unknown>): void {
    breaker.on('open', () => {
      console.warn('[BusinessCircuitBreaker] Circuit opened due to failures');
      this.config.isOpen = true;
      this.config.lastFailureTime = Date.now();
    });
    
    breaker.on('close', () => {
      console.log('[BusinessCircuitBreaker] Circuit closed, service recovered');
      this.config.isOpen = false;
      this.config.failureCount = 0;
    });
    
    breaker.on('halfOpen', () => {
      console.log('[BusinessCircuitBreaker] Circuit half-open, testing service');
    });
    
    breaker.on('fallback', (result: unknown) => {
      console.warn('[BusinessCircuitBreaker] Fallback called', result);
    });
    
    breaker.on('timeout', () => {
      console.warn('[BusinessCircuitBreaker] Request timed out');
      this.config.failureCount++;
    });
    
    breaker.on('reject', () => {
      console.warn('[BusinessCircuitBreaker] Request rejected (circuit open)');
    });
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
    
    // Clear request tracker
    this.requestTracker.clear();
    
    // Reset the Opossum circuit breaker
    this.circuitBreaker.close();
    
    // Reset all circuit breakers in the map
    this.circuitBreakerMap.forEach(breaker => {
      breaker.close();
    });
  }

  /**
   * Check if the circuit breaker is open
   * @returns boolean indicating if the circuit is open
   */
  isCircuitOpen(): boolean {
    return this.circuitBreaker.status.state === 'open' || this.config.isOpen;
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
      this.circuitBreaker.open();
    } else if (this.config.failureCount >= this.config.failureThreshold) {
      console.warn(`[BusinessCircuitBreaker] Failure threshold reached (${this.config.failureCount}/${this.config.failureThreshold}), opening circuit`);
      this.config.isOpen = true;
      this.circuitBreaker.open();
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
    
    // If the circuit is manually opened, try to close it on success
    if (this.config.isOpen) {
      this.config.isOpen = false;
      this.circuitBreaker.close();
    }
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
   * Check if a request is in progress for a specific user and endpoint
   * @param userId The user ID to check
   * @param endpoint The endpoint to check
   * @returns boolean indicating if a request is in progress
   */
  isRequestInProgressForUser(userId: string, endpoint: string = ''): boolean {
    const now = Date.now();
    const key = `${endpoint}:${userId}`;
    const lastRequestTime = this.requestTracker.get(key);
    
    // If no request is tracked for this endpoint/user combination
    if (!lastRequestTime) {
      return false;
    }
    
    // If the request has been in progress for too long, consider it stale
    if (now - lastRequestTime > 10000) { // 10 seconds timeout
      console.log('[BusinessCircuitBreaker] Request timeout exceeded for', key);
      this.requestTracker.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Set the request in progress flag for a user and endpoint
   * @param userId The user ID making the request
   * @param endpoint The endpoint being requested
   */
  setRequestInProgress(userId: string, endpoint: string = ''): void {
    const key = `${endpoint}:${userId}`;
    
    // Check if we're at the limit
    if (this.requestTracker.size >= this.MAX_REQUEST_TRACKERS) {
      // Remove oldest entries (those with earliest timestamps)
      const sortedEntries = Array.from(this.requestTracker.entries())
        .sort((a, b) => a[1] - b[1]);
      
      // Remove the oldest 10% to make room
      const toRemove = Math.max(1, Math.floor(this.MAX_REQUEST_TRACKERS * 0.1));
      for (let i = 0; i < toRemove; i++) {
        this.requestTracker.delete(sortedEntries[i][0]);
      }
      
      console.log(`[BusinessCircuitBreaker] Cleaned up ${toRemove} old request trackers. Current size: ${this.requestTracker.size}`);
    }
    
    this.requestTracker.set(key, Date.now());
  }

  /**
   * Reset the request in progress flag for a user and endpoint
   * @param userId The user ID
   * @param endpoint The endpoint
   */
  resetRequestInProgress(userId: string, endpoint: string = ''): void {
    const key = `${endpoint}:${userId}`;
    this.requestTracker.delete(key);
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
   * Get or create a circuit breaker for a specific endpoint
   * @param endpoint The endpoint to get a circuit breaker for
   * @returns A circuit breaker instance
   */
  private getCircuitBreaker(endpoint: string): CircuitBreaker<unknown> {
    // If no endpoint provided, use the default circuit breaker
    if (!endpoint) {
      return this.circuitBreaker;
    }
    
    // Check if we already have a circuit breaker for this endpoint
    if (this.circuitBreakerMap.has(endpoint)) {
      return this.circuitBreakerMap.get(endpoint)!;
    }
    
    // Check if we're at the circuit breaker limit
    if (this.circuitBreakerMap.size >= this.MAX_CIRCUIT_BREAKERS) {
      // Remove the least recently used circuit breaker
      // Since we don't track usage, we'll just remove the first one
      const firstKey = this.circuitBreakerMap.keys().next().value;
      if (firstKey) {
        this.circuitBreakerMap.delete(firstKey);
        console.log(`[BusinessCircuitBreaker] Removed circuit breaker for ${firstKey} to make room. Current size: ${this.circuitBreakerMap.size}`);
      }
    }
    
    // Create a new circuit breaker for this endpoint
    const newBreaker = new CircuitBreaker<unknown>(async (fn: () => Promise<unknown>) => {
      return await fn();
    }, {
      ...DEFAULT_OPOSSUM_OPTIONS,
      name: `businessCircuitBreaker-${endpoint}`
    });
    
    // Set up event listeners
    this.setupCircuitBreakerEvents(newBreaker);
    
    // Store the circuit breaker
    this.circuitBreakerMap.set(endpoint, newBreaker);
    
    return newBreaker;
  }
  
  /**
   * Execute a function with circuit breaker protection
   * 
   * @param fn - The async function to execute
   * @param userId - Optional user ID for request tracking
   * @param endpoint - Optional endpoint for per-endpoint circuit breaking
   * @returns The result of the function execution
   * @throws Will throw an error if the circuit is open or the function fails
   */
  async execute<T>(fn: () => Promise<T>, userId: string = 'unknown', endpoint?: string): Promise<T> {
    const effectiveEndpoint = endpoint || '';
    
    // Check if the circuit is open (using the global state)
    if (this.isCircuitOpen()) {
      console.warn('[BusinessCircuitBreaker] Circuit is open, rejecting request');
      throw new Error('Service temporarily unavailable due to too many failures');
    }
    
    // Check if a request is already in progress for this user and endpoint
    if (this.isRequestInProgressForUser(userId, effectiveEndpoint)) {
      console.warn('[BusinessCircuitBreaker] Request already in progress for', `${effectiveEndpoint}:${userId}`);
      throw new Error('Request already in progress');
    }
    
    try {
      // Mark request as in progress
      this.setRequestInProgress(userId, effectiveEndpoint);
      
      // Get the appropriate circuit breaker
      const breaker = this.getCircuitBreaker(effectiveEndpoint);
      
      // Execute the function through the circuit breaker
      const result = await breaker.fire(() => fn());
      
      // Record success
      this.recordSuccess();
      
      return result as T;
    } catch (error) {
      // Check if it's a rate limit error
      const isRateLimit = this.isRateLimitError(error);
      
      // Record failure
      this.recordFailure(isRateLimit);
      
      // Rethrow the error
      throw error;
    } finally {
      // Reset request in progress flag
      this.resetRequestInProgress(userId, effectiveEndpoint);
    }
  }
}

// Create and export a default instance
const businessCircuitBreaker = new BusinessCircuitBreaker();
export default businessCircuitBreaker;
