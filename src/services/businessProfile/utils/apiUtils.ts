/**
 * Business Profile API Utilities
 * 
 * Provides utilities for making API requests with circuit breaker
 * and retry functionality.
 */
import apiService from '../../api';
import businessCircuitBreaker from '../../businessCircuitBreaker';
import { ApiResponse } from '../../../types';
import { formatApiError, handleCatchError } from '../../../utils/errorHandling/errorHandler';
import { createRetryFunction } from '../../../utils/errorHandling/retryUtils';
import { keysToCamel } from '../../../utils/camelCaseUtils';

/**
 * API request options
 */
export interface ApiRequestOptions {
  /** Number of retries */
  retries?: number;
  /** Delay between retries in milliseconds */
  retryDelayMs?: number;
  /** Whether to transform response keys from snake_case to camelCase */
  transformResponse?: boolean;
  /** Context for error handling */
  context?: {
    functionName?: string;
    component?: string;
    /** Additional contextual information */
    info?: Record<string, unknown>;
    /** User ID if available */
    userId?: string;
    /** User role if available */
    userRole?: string;
    /** Business ID if available */
    businessId?: string;
  };
}

/**
 * Make a GET request to the API with circuit breaker and retry
 * 
 * @param endpoint - API endpoint
 * @param options - Request options
 * @returns API response
 */
export async function getFromApi<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    retries = 3,
    transformResponse = true,
    context = {
      functionName: 'getFromApi',
      component: 'ApiUtils'
    }
  } = options;
  
  try {
    // Create a retry-enabled function for the API call
    const fetchWithRetry = createRetryFunction(async () => {
      // Execute the API call through the circuit breaker
      return await businessCircuitBreaker.execute(async () => {
        const response = await apiService.get<T>(endpoint);
        return response;
      }, context?.userId || 'unknown', endpoint);
    }, { maxRetries: retries });
    
    // Execute the API call with retry capability
    const response = await fetchWithRetry();
    
    if (response && response.data !== undefined) {
      // Transform response if requested
      if (transformResponse && response.data !== null) {
        const transformedData = keysToCamel(response.data) as T;
        
        return {
          success: true,
          data: transformedData,
          message: 'Data retrieved successfully'
        };
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Data retrieved successfully'
      };
    } else {
      return formatApiError<T>('No data received from API');
    }
  } catch (error) {
    return handleCatchError<T>(error, {
      context,
      logError: true
    });
  }
}

/**
 * Make a POST request to the API with circuit breaker and retry
 * 
 * @param endpoint - API endpoint
 * @param data - Data to send
 * @param options - Request options
 * @returns API response
 */
export async function postToApi<T>(
  endpoint: string,
  data: Record<string, unknown>,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    retries = 3,
    transformResponse = true,
    context = {
      functionName: 'postToApi',
      component: 'ApiUtils'
    }
  } = options;
  
  try {
    // Create a retry-enabled function for the API call
    const postWithRetry = createRetryFunction(async () => {
      // Execute the API call through the circuit breaker
      return await businessCircuitBreaker.execute(async () => {
        const response = await apiService.post<T>(endpoint, data);
        return response;
      }, context?.userId || 'unknown', endpoint);
    }, { maxRetries: retries });
    
    // Execute the API call with retry capability
    const response = await postWithRetry();
    
    if (response && response.data !== undefined) {
      // Transform response if requested
      if (transformResponse && response.data !== null) {
        const transformedData = keysToCamel(response.data) as T;
        
        return {
          success: true,
          data: transformedData,
          message: 'Data updated successfully'
        };
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Data updated successfully'
      };
    } else {
      return formatApiError<T>('No data received from API');
    }
  } catch (error) {
    return handleCatchError<T>(error, {
      context,
      logError: true
    });
  }
}

/**
 * Make a PUT request to the API with circuit breaker and retry
 * 
 * @param endpoint - API endpoint
 * @param data - Data to send
 * @param options - Request options
 * @returns API response
 */
export async function putToApi<T>(
  endpoint: string,
  data: Record<string, unknown>,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    retries = 3,
    transformResponse = true,
    context = {
      functionName: 'putToApi',
      component: 'ApiUtils'
    }
  } = options;
  
  try {
    // Create a retry-enabled function for the API call
    const putWithRetry = createRetryFunction(async () => {
      // Execute the API call through the circuit breaker
      return await businessCircuitBreaker.execute(async () => {
        const response = await apiService.put<T>(endpoint, data);
        return response;
      }, context?.userId || 'unknown', endpoint);
    }, { maxRetries: retries });
    
    // Execute the API call with retry capability
    const response = await putWithRetry();
    
    if (response && response.data !== undefined) {
      // Transform response if requested
      if (transformResponse && response.data !== null) {
        const transformedData = keysToCamel(response.data) as T;
        
        return {
          success: true,
          data: transformedData,
          message: 'Data updated successfully'
        };
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Data updated successfully'
      };
    } else {
      return formatApiError<T>('No data received from API');
    }
  } catch (error) {
    return handleCatchError<T>(error, {
      context,
      logError: true
    });
  }
}

/**
 * Make a DELETE request to the API with circuit breaker and retry
 * 
 * @param endpoint - API endpoint
 * @param options - Request options
 * @returns API response
 */
export async function deleteFromApi<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    retries = 3,
    transformResponse = true,
    context = {
      functionName: 'deleteFromApi',
      component: 'ApiUtils'
    }
  } = options;
  
  try {
    // Create a retry-enabled function for the API call
    const deleteWithRetry = createRetryFunction(async () => {
      // Execute the API call through the circuit breaker
      return await businessCircuitBreaker.execute(async () => {
        const response = await apiService.delete<T>(endpoint);
        return response;
      }, context?.userId || 'unknown', endpoint);
    }, { maxRetries: retries });
    
    // Execute the API call with retry capability
    const response = await deleteWithRetry();
    
    if (response && response.success) {
      // Transform response if requested and data exists
      if (transformResponse && response.data) {
        const transformedData = keysToCamel(response.data) as T;
        
        return {
          success: true,
          data: transformedData,
          message: 'Data deleted successfully'
        };
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Data deleted successfully'
      };
    } else {
      return formatApiError<T>('Failed to delete data');
    }
  } catch (error) {
    return handleCatchError<T>(error, {
      context,
      logError: true
    });
  }
}
