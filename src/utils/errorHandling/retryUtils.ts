/**
 * Retry Utilities
 * 
 * Utilities for retrying failed operations
 */

import { ErrorCategory, StandardError } from './errorTypes';
import { getErrorConfig } from './errorConfig';
import { categorizeError } from './errorHandler';

/**
 * Create a retry function for handling retryable errors
 * 
 * @param fn - The async function to retry
 * @param options - Configuration options for retry behavior
 * @returns A function that will retry on failure
 */
export function createRetryFunction<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    baseDelay?: number;
    retryableCategories?: ErrorCategory[];
    useExponentialBackoff?: boolean;
    context?: {
      functionName?: string;
      component?: string;
      info?: Record<string, unknown>;
    };
    onRetry?: (error: StandardError, attempt: number, nextRetryMs: number) => void;
  }
): () => Promise<T> {
  // Use provided options or defaults from config
  const errorConfig = getErrorConfig();
  const maxRetries = options?.maxRetries ?? errorConfig.retry.maxRetries;
  const baseDelay = options?.baseDelay ?? errorConfig.retry.baseDelay;
  const retryableCategories = options?.retryableCategories ?? errorConfig.retry.retryableCategories;
  const useExponentialBackoff = options?.useExponentialBackoff ?? errorConfig.retry.useExponentialBackoff;
  const context = options?.context;
  
  return async function retryWrapper(): Promise<T> {
    let lastError: unknown;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Get detailed error information
        const categorized = categorizeError(error, {
          ...context,
          info: {
            ...context?.info,
            retryAttempt: attempt + 1,
            maxRetries
          }
        });
        
        // Check if this error type is retryable
        if (!retryableCategories.includes(categorized.category)) {
          throw categorized;
        }
        
        // Calculate delay for next retry
        let nextRetryMs = baseDelay;
        if (useExponentialBackoff) {
          // Exponential backoff with jitter
          const exponentialDelay = baseDelay * Math.pow(2, attempt);
          // Add jitter (±20%)
          const jitter = exponentialDelay * 0.2 * (Math.random() * 2 - 1);
          nextRetryMs = exponentialDelay + jitter;
        } else {
          // Linear backoff
          nextRetryMs = baseDelay * (attempt + 1);
        }
        
        // Call onRetry callback if provided
        if (options?.onRetry) {
          options.onRetry(categorized, attempt + 1, nextRetryMs);
        } else {
          // Default logging
          console.warn(
            `Retry attempt ${attempt + 1}/${maxRetries} for ${categorized.category} error. ` +
            `Next retry in ${Math.round(nextRetryMs / 100) / 10}s`
          );
        }
        
        // Wait before retrying if not the last attempt
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, nextRetryMs));
        }
      }
    }
    
    // If we've exhausted all retries, throw the last error with context
    const finalError = categorizeError(lastError, {
      ...context,
      info: {
        ...context?.info,
        retriesExhausted: true,
        maxRetries
      }
    });
    
    throw finalError;
  };
}
