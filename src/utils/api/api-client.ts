/**
 * api-client.ts
 * Base API client with axios configuration and common functionality
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError, handleApiError } from './error-handling';

/**
 * Response wrapper for API calls with standard structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Base API client class that provides wrapper methods for HTTP requests
 */
export class ApiClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    // Add request interceptor to handle auth tokens
    this.client.interceptors.request.use(
      (config) => {
        // Get auth token from localStorage or other store
        const token = localStorage.getItem('auth_token');
        
        // Add auth token to headers if available
        if (token) {
          config.headers = config.headers || {} as any;
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to standardize responses
    this.client.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error)
    );
  }

  /**
   * Performs a GET request
   * @param url The URL endpoint to request
   * @param config Optional axios request config
   * @returns Promise with the response data
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, config);
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      // The above line always throws, but TypeScript doesn't know that
      throw new ApiError('Unknown error', 0);
    }
  }

  /**
   * Performs a POST request
   * @param url The URL endpoint to request
   * @param data The data to send in the request body
   * @param config Optional axios request config
   * @returns Promise with the response data
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data, config);
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw new ApiError('Unknown error', 0);
    }
  }

  /**
   * Performs a PUT request
   * @param url The URL endpoint to request
   * @param data The data to send in the request body
   * @param config Optional axios request config
   * @returns Promise with the response data
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data, config);
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw new ApiError('Unknown error', 0);
    }
  }

  /**
   * Performs a PATCH request
   * @param url The URL endpoint to request
   * @param data The data to send in the request body
   * @param config Optional axios request config
   * @returns Promise with the response data
   */
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.patch(url, data, config);
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw new ApiError('Unknown error', 0);
    }
  }

  /**
   * Performs a DELETE request
   * @param url The URL endpoint to request
   * @param config Optional axios request config
   * @returns Promise with the response data
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url, config);
      return response.data.data;
    } catch (error) {
      handleApiError(error);
      throw new ApiError('Unknown error', 0);
    }
  }
}

// Create a singleton instance of the API client
export const apiClient = new ApiClient();

// Export default instance for convenience
export default apiClient;
