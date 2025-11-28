/**
 * error-handling.ts
 * Utilities for handling API errors and implementing retry logic
 */

/**
 * Custom API error class with additional context
 */
export class ApiError extends Error {
  status: number;
  data: unknown;
  isNetworkError: boolean;
  isServerError: boolean;
  isAuthError: boolean;

  constructor(message: string, status: number = 0, data: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isNetworkError = status === 0;
    this.isServerError = status >= 500;
    this.isAuthError = status === 401 || status === 403;
  }
}

/**
 * Determines if an API request should be retried based on the error
 * @param failureCount Number of times the request has already failed
 * @param error The error that caused the failure
 * @returns Boolean indicating whether to retry
 */
export const shouldRetryRequest = (failureCount: number, error: unknown): boolean => {
  // Don't retry more than 3 times
  if (failureCount >= 3) {
    return false;
  }

  // Only retry network errors and 5xx server errors
  if (error instanceof ApiError) {
    // Don't retry client errors (4xx) except for 408 (timeout) and 429 (too many requests)
    if (error.status >= 400 && error.status < 500 && error.status !== 408 && error.status !== 429) {
      return false;
    }
    
    // Always retry network errors and server errors
    return error.isNetworkError || error.isServerError;
  }
  
  // For unknown errors, retry only once
  return failureCount < 1;
};

/**
 * Calculates the delay for exponential backoff retry strategy
 * @param attempt The current retry attempt number (starts at 1)
 * @param baseDelay Base delay in milliseconds
 * @returns Delay in milliseconds with jitter
 */
export const calculateRetryDelay = (attempt: number, baseDelay: number = 1000): number => {
  // Exponential backoff: 2^attempt * baseDelay + random jitter
  const delay = Math.min(Math.pow(2, attempt) * baseDelay, 30000); // Cap at 30 seconds
  
  // Add jitter (±30%) to prevent synchronized retries
  const jitter = delay * 0.3;
  return delay + Math.random() * jitter * 2 - jitter;
};

/**
 * Handles API errors for React Query to ensure consistent error responses
 * @param error The error to process
 * @throws ApiError with normalized error information
 */
export const handleApiError = (error: unknown): never => {
  // Check if the error is already an ApiError
  if (error instanceof ApiError) {
    throw error;
  }

  // If it's an Axios error with response property
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { 
      response: { 
        data?: { message?: string }, 
        status: number, 
        statusText: string 
      } 
    };
    
    // The server responded with a status code outside of 2xx
    throw new ApiError(
      axiosError.response.data?.message || `Error ${axiosError.response.status}: ${axiosError.response.statusText}`,
      axiosError.response.status,
      axiosError.response.data
    );
  } else if (error && typeof error === 'object' && 'request' in error) {
    // The request was made but no response was received
    throw new ApiError('Network error: No response received from server', 0, null);
  } else if (error instanceof Error) {
    // It's a standard Error object
    throw new ApiError(error.message, 0, null);
  } else {
    // Something else caused the error
    throw new ApiError('An unknown error occurred', 0, null);
  }
};
