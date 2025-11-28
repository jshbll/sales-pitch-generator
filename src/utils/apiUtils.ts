/**
 * API utilities for handling retries, optimistic updates, and error management
 */

import { AxiosError } from 'axios';

/**
 * Configuration for API retry behavior
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // in milliseconds
  shouldRetry: (error: any) => boolean;
}

/**
 * Default retry configuration
 */
export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  shouldRetry: (error: any) => {
    // Only retry on network errors or 5xx server errors
    if (error && error.isAxiosError) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      
      // Retry on network errors (no response) or server errors (5xx)
      return !axiosError.response || (status !== undefined && status >= 500 && status < 600);
    }
    
    // For other errors, don't retry
    return false;
  }
};

/**
 * Executes an API call with retry logic
 * 
 * @param apiCall Function that performs the API call and returns a promise
 * @param config Retry configuration (optional)
 * @returns Promise that resolves with the API result or rejects with the final error
 */
export async function withRetry<T>(
  apiCall: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  // Merge provided config with default config
  const retryConfig: RetryConfig = {
    ...defaultRetryConfig,
    ...config
  };
  
  let lastError: any;
  
  // Try the initial call plus retries
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      // Execute the API call
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (
        attempt < retryConfig.maxRetries && 
        retryConfig.shouldRetry(error)
      ) {
        // Wait for the retry delay
        await new Promise(resolve => setTimeout(resolve, retryConfig.retryDelay));
        
        // Exponential backoff - increase delay for each retry
        retryConfig.retryDelay *= 1.5;
        
        // Continue to the next retry attempt
        continue;
      }
      
      // Either we've used all retries or shouldRetry returned false
      break;
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
}

/**
 * Parses API errors into a standard format
 * 
 * @param error Error object from API call
 * @returns Standardized error object with consistent properties
 */
export function parseApiError(error: any): {
  message: string;
  code: string;
  status?: number;
  details?: any;
} {
  // Handle Axios errors
  if (error && error.isAxiosError) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data as any;
    
    // Network error (no response)
    if (!axiosError.response) {
      return {
        message: 'Network error. Please check your connection and try again.',
        code: 'NETWORK_ERROR',
      };
    }
    
    // Server returned an error with data
    if (data) {
      return {
        message: data.message || data.error || 'An error occurred',
        code: data.code || `HTTP_${status}`,
        status,
        details: data
      };
    }
    
    // Server returned an error with no specific data
    return {
      message: axiosError.message || 'An error occurred',
      code: `HTTP_${status}`,
      status
    };
  }
  
  // Handle generic errors
  return {
    message: error?.message || 'An unknown error occurred',
    code: error?.code || 'UNKNOWN_ERROR',
    details: error
  };
}

/**
 * Type for optimistic update handlers
 */
export interface OptimisticUpdateHandlers<T> {
  // Function to apply optimistic update to local state
  onOptimistic: (data: T) => void;
  
  // Function to roll back optimistic update if API fails
  onRollback: () => void;
  
  // Function to finalize update with actual server data
  onSuccess?: (serverData: any) => void;
}

/**
 * Performs an API call with optimistic updates
 * 
 * @param apiCall Function that performs the API call and returns a promise
 * @param handlers Object containing optimistic update handlers
 * @param data Data for the optimistic update
 * @returns Promise that resolves with the API result
 */
export async function withOptimisticUpdate<T, R>(
  apiCall: () => Promise<R>,
  handlers: OptimisticUpdateHandlers<T>,
  data: T
): Promise<R> {
  // Apply optimistic update
  handlers.onOptimistic(data);
  
  try {
    // Execute the API call
    const result = await apiCall();
    
    // Call success handler if provided
    if (handlers.onSuccess) {
      handlers.onSuccess(result);
    }
    
    return result;
  } catch (error) {
    // Roll back optimistic update on error
    handlers.onRollback();
    
    // Re-throw the error to be handled by the caller
    throw error;
  }
}
