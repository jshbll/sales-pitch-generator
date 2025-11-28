/**
 * Request Deduplication Service
 * 
 * Prevents multiple identical API requests from being made concurrently.
 * This is crucial for avoiding race conditions and excessive network traffic.
 */

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class RequestDeduplicationService {
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private readonly requestTimeout = 30000; // 30 seconds

  /**
   * Deduplicate requests by key
   * @param key - Unique identifier for the request
   * @param requestFunction - Function that returns a promise
   * @returns The deduplicated promise
   */
  async deduplicate<T>(key: string, requestFunction: () => Promise<T>): Promise<T> {
    // Check if request is already in progress
    const existing = this.pendingRequests.get(key);
    
    if (existing) {
      const age = Date.now() - existing.timestamp;
      
      // If request is still fresh, return the existing promise
      if (age < this.requestTimeout) {
        console.log(`[RequestDeduplication] Returning existing request for key: ${key}`);
        return existing.promise;
      } else {
        // Request is too old, remove it
        console.log(`[RequestDeduplication] Removing stale request for key: ${key}`);
        this.pendingRequests.delete(key);
      }
    }

    // Create new request
    console.log(`[RequestDeduplication] Creating new request for key: ${key}`);
    const promise = this.createRequest(key, requestFunction);
    
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    });

    return promise;
  }

  private async createRequest<T>(key: string, requestFunction: () => Promise<T>): Promise<T> {
    try {
      const result = await requestFunction();
      
      // Remove from pending requests on success
      this.pendingRequests.delete(key);
      console.log(`[RequestDeduplication] Request completed successfully for key: ${key}`);
      
      return result;
    } catch (error) {
      // Remove from pending requests on error
      this.pendingRequests.delete(key);
      console.error(`[RequestDeduplication] Request failed for key: ${key}`, error);
      
      throw error;
    }
  }

  /**
   * Clear all pending requests (useful for cleanup)
   */
  clearAll(): void {
    console.log(`[RequestDeduplication] Clearing ${this.pendingRequests.size} pending requests`);
    this.pendingRequests.clear();
  }

  /**
   * Clear a specific pending request
   */
  clear(key: string): boolean {
    const deleted = this.pendingRequests.delete(key);
    if (deleted) {
      console.log(`[RequestDeduplication] Cleared pending request for key: ${key}`);
    }
    return deleted;
  }

  /**
   * Get statistics about pending requests
   */
  getStats(): { pendingCount: number; keys: string[] } {
    return {
      pendingCount: this.pendingRequests.size,
      keys: Array.from(this.pendingRequests.keys())
    };
  }

  /**
   * Clean up stale requests
   */
  cleanup(): void {
    const now = Date.now();
    const staleKeys: string[] = [];

    this.pendingRequests.forEach((request, key) => {
      if (now - request.timestamp > this.requestTimeout) {
        staleKeys.push(key);
      }
    });

    staleKeys.forEach(key => {
      this.pendingRequests.delete(key);
      console.log(`[RequestDeduplication] Cleaned up stale request: ${key}`);
    });

    if (staleKeys.length > 0) {
      console.log(`[RequestDeduplication] Cleaned up ${staleKeys.length} stale requests`);
    }
  }
}

// Create singleton instance
const requestDeduplication = new RequestDeduplicationService();

// Cleanup stale requests every 5 minutes
setInterval(() => {
  requestDeduplication.cleanup();
}, 5 * 60 * 1000);

export default requestDeduplication;