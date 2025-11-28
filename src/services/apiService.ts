import { ApiResponse } from '../types';
import { ErrorResponse } from '../types/api-responses';
import { AUTH_TOKEN_KEY } from '../utils/config';

/**
 * Base API service for making HTTP requests to the backend
 */
class ApiService {
  private baseUrl: string;

  constructor() {
    // DEPRECATED: This API service is legacy and should not be used
    // All services should use Convex directly instead
    console.warn(`[ApiService] DEPRECATED: This service is legacy and should not be used. Use Convex services instead.`);
    
    // Set a dummy URL to prevent errors, but log warnings when used
    this.baseUrl = 'http://deprecated-api-service';
  }

  /**
   * Private helper to get authorization headers
   */
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Make a GET request to the API
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns Promise with API response
   */
  async get<T>(endpoint: string, params: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
    console.error(`[ApiService] DEPRECATED GET call to ${endpoint} - This should use Convex instead!`, new Error().stack);
    return { success: false, error: 'API service is deprecated - use Convex', data: undefined };
  }

  /**
   * Make a POST request to the API
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @param requireAuth - Whether to include authentication headers (default: true)
   * @returns Promise with API response
   */
  async post<T>(endpoint: string, data: unknown = {}, requireAuth: boolean = true): Promise<ApiResponse<T>> {
    console.error(`[ApiService] DEPRECATED POST call to ${endpoint} - This should use Convex instead!`, new Error().stack);
    return { success: false, error: 'API service is deprecated - use Convex', data: undefined };
  }

  /**
   * Make a PUT request to the API
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @returns Promise with API response
   */
  async put<T>(endpoint: string, data: unknown = {}): Promise<ApiResponse<T>> {
    console.error(`[ApiService] DEPRECATED PUT call to ${endpoint} - This should use Convex instead!`, new Error().stack);
    return { success: false, error: 'API service is deprecated - use Convex', data: undefined };
  }

  /**
   * Make a DELETE request to the API
   * @param endpoint - API endpoint
   * @returns Promise with API response
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    console.error(`[ApiService] DEPRECATED DELETE call to ${endpoint} - This should use Convex instead!`, new Error().stack);
    return { success: false, error: 'API service is deprecated - use Convex', data: undefined };
  }

  /**
   * Handle API response
   * @param response - Fetch response
   * @returns Processed API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    let data: unknown;

    // Store the raw text response for debugging
    const responseText = await response.text();
    
    // Save the raw text in localStorage for debugging
    if (responseText.includes('business_name') || responseText.includes('phone_number')) {
      localStorage.setItem('_debug_last_api_response', responseText);
    }
    
    // Parse JSON or use text data
    if (contentType && contentType.includes('application/json')) {
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('[ApiService] Error parsing JSON response:', e);
        data = responseText;
      }
    } else {
      data = responseText;
    }

    if (!response.ok) {
      // Try to extract error message more safely
      let errorMessage = 'An error occurred';
      let errorDetails = {};
      
      // Log the full response for debugging
      console.warn('[ApiService] HTTP error response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        data: data,
        responseText: responseText
      });
      
      // Extract error message from response data
      if (typeof data === 'object' && data !== null) {
        if ('message' in data && typeof data.message === 'string') {
          errorMessage = data.message;
        }
        if ('error' in data) {
          errorDetails = { apiError: data.error };
        }
      }
      
      return {
        success: false,
        error: errorMessage,
        statusCode: response.status,
        statusText: response.statusText,
        details: {
          ...errorDetails,
          url: response.url,
          rawResponse: responseText.substring(0, 500) // Limit the size of the raw response
        }
      };
    }

    // Try to extract data more safely
    let responseData: T | undefined = undefined; // Initialize to undefined
    if (typeof data === 'object' && data !== null) {
      if ('data' in data) {
        responseData = data.data as T; // Use type assertion carefully
      } else {
        responseData = data as T; // Assume the whole response is the data
      }
    } else if (typeof data === 'string') {
      // Handle plain text responses if necessary, maybe cast to T if T is string
      // For now, let's assume T is not just string if content type wasn't json
      // Or perhaps should return an error here? 
      // Depending on API design, might need specific handling.
      // For now, we return it as part of a successful response, but it might not match T
      responseData = data as T; 
    }

    return {
      success: true,
      data: responseData,
      statusCode: response.status,
    };
  }
}

// DEPRECATED: Do not instantiate to avoid console warning on load
// export default new ApiService();

// Create a dummy object that throws helpful errors if used
const deprecatedApiService = new Proxy({}, {
  get: () => {
    throw new Error('ApiService is deprecated. Use Convex services instead.');
  }
});

export default deprecatedApiService as any;
