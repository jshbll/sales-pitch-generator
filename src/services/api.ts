import { AUTH_TOKEN_KEY, AUTH_USER_KEY, API_BASE_URL } from '../utils/config';
import { ApiResponse } from '../types';
import { debugLog, debugWarn, debugError } from '../utils/debugLogger';

// NOTE: This file exceeds the recommended line limit due to the comprehensive error handling
// and retry mechanisms needed for robust API communication. Future refactoring could split this
// into smaller modules while maintaining the retry and circuit breaker functionality.

// Configuration for retry mechanism
const RETRY_CONFIG = {
  maxRetries: 3,            // Maximum number of retry attempts
  initialDelayMs: 1000,     // Initial delay before first retry (increased from 300ms)
  maxDelayMs: 10000,        // Maximum delay between retries (increased from 3000ms)
  backoffFactor: 2.5,       // Exponential backoff factor (increased from 2)
  retryableStatusCodes: [408, 429, 500, 502, 503, 504], // HTTP status codes to retry
  retryableErrorMessages: ['Failed to fetch', 'NetworkError', 'network timeout'], // Error messages to retry
  rateLimitDelayMs: 15000   // Special longer delay for rate limit errors (429)
};

/**
 * Base API service for making HTTP requests
 */
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }
  
  /**
   * Safely join base URL and endpoint ensuring proper slash handling
   * Also handles Docker service names in browser environment
   */
  private joinUrls(baseUrl: string, endpoint: string): string {
    // Handle Docker service names in browser environment
    let processedBaseUrl = baseUrl;
    
    // When running in a browser, convert Docker service names to localhost
    if (typeof window !== 'undefined') {
      // Convert http://api:8080 to http://localhost:8080
      processedBaseUrl = baseUrl.replace(/http:\/\/api:([0-9]+)/i, 'http://localhost:$1');
    }
    
    // Remove trailing slash from base URL if present
    const base = processedBaseUrl.endsWith('/') ? processedBaseUrl.slice(0, -1) : processedBaseUrl;
    // Remove leading slash from endpoint if present
    const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    const result = `${base}/${path}`;
    debugLog.api(`Resolved URL: ${result}`);
    return result;
  }

  /**
   * Get the authentication token from storage
   * Checks sessionStorage first (for hot reload persistence), then falls back to localStorage
   * Maintains backward compatibility with both AUTH_TOKEN_KEY and legacy 'auth_token'
   */
  private getAuthToken(): string | null {
    // Only log token retrieval in development when explicitly enabled
    debugLog.api('Getting auth token, AUTH_TOKEN_KEY:', AUTH_TOKEN_KEY);
    
    // Try sessionStorage first with the official key
    let token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      debugLog.api('Found token in sessionStorage');
      // Ensure it's also in localStorage for consistency
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      return token;
    }
    
    // Try localStorage with the official key
    token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      debugLog.api('Found token in localStorage');
      // Ensure it's also in sessionStorage for consistency
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      return token;
    }
    
    // Backward compatibility: check for legacy token key in sessionStorage
    token = sessionStorage.getItem('auth_token');
    if (token) {
      // Migrate the token to the official key for future requests
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      debugLog.api('Migrated auth token from legacy key to official key');
      return token;
    }
    
    // Backward compatibility: check for legacy token key in localStorage
    token = localStorage.getItem('auth_token');
    if (token) {
      // Migrate the token to the official key for future requests
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      debugLog.api('Migrated auth token from legacy key to official key');
      return token;
    }
    
    // DEVELOPMENT FALLBACK: If we're in development mode and have a user but no token,
    // generate a token based on the user's email
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      const storedUser = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user && user.email) {
            const fallbackToken = 'dev-token-' + btoa(user.email);
            debugLog.api('No token found, creating fallback token for:', user.email);
            localStorage.setItem(AUTH_TOKEN_KEY, fallbackToken);
            sessionStorage.setItem(AUTH_TOKEN_KEY, fallbackToken);
            return fallbackToken;
          }
        } catch (e) {
          debugError.api('Error creating fallback token:', e);
        }
      }
    }
    
    debugLog.api('No authentication token found');
    return null;
  }

  /**
   * Build request headers including authentication if available
   */
  private getHeaders(includeAuth: boolean = true, isFormData: boolean = false): HeadersInit {
    const headers: HeadersInit = {};
    
    // Only set Content-Type for JSON requests, not for FormData
    // FormData sets its own Content-Type with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (includeAuth) {
      // Always use the stored auth token
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Handle API response and error parsing
   */
  async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    // Define a type with common response fields
    type ApiResponseData = {
      status?: string;
      success?: boolean;
      data?: unknown;
      message?: string;
      error?: string;
      business?: unknown; // Add business property for business endpoints
      [key: string]: unknown; // Add index signature for other properties
    };
    
    let responseData: ApiResponseData;
    try {
      responseData = await response.json();
    } catch (error) {
      debugError.api('JSON parsing error:', error);
      // Handle non-JSON responses or JSON parsing errors
      if (!response.ok) {
        // If the original status was bad AND we couldn't parse JSON, return status text
        return {
          success: false,
          error: `HTTP error ${response.status}: ${response.statusText || 'Failed to parse error response'} `,
          statusCode: response.status
        };
      }
      // If status was OK but couldn't parse JSON (unexpected)
      return {
        success: false,
        error: 'Failed to parse successful response data',
        statusCode: response.status
      };
    }

    // Handle structured JSON responses from various server formats
    // Case 1: { status: 'success', data: ... } format
    // Case 2: { success: true, data: ... } format
    // Case 3: { success: true, message: '...', data: ... } format
    
    if (response.ok && (
        // Case 1: Traditional format
        (responseData.status === 'success' && typeof responseData.data !== 'undefined') ||
        // Case 2 & 3: New format with 'success' boolean flag
        (responseData.success === true && (
          typeof responseData.data !== 'undefined' || 
          typeof responseData.message !== 'undefined' ||
          typeof responseData.business !== 'undefined' || // Handle business property
          Object.keys(responseData).some(key => key !== 'success' && key !== 'status') // Handle any property besides success/status
        ))
      )) {
      // Success: Extract the nested data
      // Handle various response formats
      let data: T;
      
      // First, check for standard data property
      if (responseData.data) {
        data = responseData.data as T;
      }
      // Check for business property (used by business endpoints)
      else if (responseData.business) {
        data = responseData.business as T;
      }
      // For endpoints that might return other properties
      else {
        // If no 'data' or 'business' key is found, assume the relevant data
        // constitutes the other properties of the response object.
        // Create a new object containing all keys except the common status/flag keys.
        const dataToReturn: Record<string, unknown> = {};
        for (const key in responseData) {
          if (!['success', 'status', 'message', 'error', 'data', 'business'].includes(key)) {
            dataToReturn[key] = responseData[key];
          }
        }
        
        // Check if we actually extracted any keys
        if (Object.keys(dataToReturn).length > 0) {
           data = dataToReturn as T;
        } else {
          // If no specific data keys were found besides the common ones, 
          // fall back to the original behavior or handle as needed.
          // For now, let's assign the whole object, but log a warning.
          debugWarn.api('Successful response did not contain expected data keys (data, business) or other specific keys. Returning full response body as data.', responseData);
          data = responseData as unknown as T;
        }
      }
      
      // Get message if available (might be undefined which is fine)
      const message = responseData.message as string | undefined;
      
      return {
        success: true,
        data: data,
        statusCode: response.status,
        message: message // Include success message if present
      };
    } else {
      // Handle API-level errors reported in the JSON body OR unexpected structure
      const errorMessage = responseData.message || responseData.error || `API Error: Status ${response.status}`;
      return {
        success: false,
        error: errorMessage,
        statusCode: response.status,
        details: responseData // Include the full response body for context
      };
    }
  }

  /**
   * Helper function to determine if an error is retryable
   * @param error The error to check
   * @param statusCode HTTP status code if available
   * @returns Object with isRetryable flag and isRateLimit flag
   */
  private isRetryableError(error: unknown, statusCode?: number): { isRetryable: boolean; isRateLimit: boolean } {
    let isRetryable = false;
    let isRateLimit = false;
    
    // Check for rate limit status code (429)
    if (statusCode === 429) {
      isRetryable = true;
      isRateLimit = true;
      debugWarn.api('Rate limit detected (429 status code)');
      return { isRetryable, isRateLimit };
    }
    
    // Check if the status code is in the list of other retryable status codes
    if (statusCode && RETRY_CONFIG.retryableStatusCodes.includes(statusCode)) {
      isRetryable = true;
    }
    
    // Check for rate limit error messages
    const rateLimitMessages = ['too many requests', 'rate limit', 'rate exceeded', 'too many attempts'];
    
    // Check if the error message contains any rate limit indicators
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      
      // Check for rate limit messages
      if (rateLimitMessages.some(msg => errorMsg.includes(msg))) {
        isRetryable = true;
        isRateLimit = true;
        debugWarn.api('Rate limit detected in error message:', error.message);
      }
      // Check for other retryable messages
      else if (RETRY_CONFIG.retryableErrorMessages.some(msg => errorMsg.includes(msg.toLowerCase()))) {
        isRetryable = true;
      }
    }
    
    // If it's a string error, check against rate limit and retryable messages
    if (typeof error === 'string') {
      const errorMsg = error.toLowerCase();
      
      // Check for rate limit messages
      if (rateLimitMessages.some(msg => errorMsg.includes(msg))) {
        isRetryable = true;
        isRateLimit = true;
        debugWarn.api('Rate limit detected in error message:', error);
      }
      // Check for other retryable messages
      else if (RETRY_CONFIG.retryableErrorMessages.some(msg => errorMsg.includes(msg.toLowerCase()))) {
        isRetryable = true;
      }
    }
    
    return { isRetryable, isRateLimit };
  }

  /**
   * Calculate delay for retry with exponential backoff
   * @param attempt Current attempt number (0-based)
   * @returns Delay in milliseconds
   */
  private getRetryDelay(attempt: number): number {
    const delay = Math.min(
      RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffFactor, attempt),
      RETRY_CONFIG.maxDelayMs
    );
    
    // Add some jitter (±20%) to prevent synchronized retries
    const jitter = delay * 0.2 * (Math.random() * 2 - 1);
    return delay + jitter;
  }

  /**
   * Make a GET request with retry mechanism
   */
  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    const url = this.joinUrls(this.baseUrl, endpoint);
    debugLog.api(`GET to ${url}`);
    
    let lastError: unknown = null;
    let lastStatusCode: number | undefined = undefined;
    let rateLimitDetected = false;
    
    // Special handling for critical endpoints that need more reliable retry
    const isCriticalEndpoint = endpoint.includes('/businesses/me');
    const maxRetries = isCriticalEndpoint ? RETRY_CONFIG.maxRetries + 1 : RETRY_CONFIG.maxRetries;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // If this is a retry, log it with more details if rate limited
        if (attempt > 0) {
          if (rateLimitDetected) {
            debugLog.api(`Retry attempt ${attempt}/${maxRetries} for GET ${url} after rate limit cooldown`);
          } else {
            debugLog.api(`Retry attempt ${attempt}/${maxRetries} for GET ${url}`);
          }
          
          // Reset rate limit flag for this attempt
          rateLimitDetected = false;
        }
        
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(includeAuth),
        });
        
        lastStatusCode = response.status;
        
        // Check if this is a rate limit response (429)
        if (response.status === 429) {
          debugWarn.api(`Rate limit response (429) received for ${url}`);
          rateLimitDetected = true;
          
          // If we haven't exceeded max retries, apply special rate limit delay
          if (attempt < maxRetries) {
            const rateDelay = RETRY_CONFIG.rateLimitDelayMs;
            debugLog.api(`Rate limit detected, waiting ${rateDelay}ms before retry`);
            await new Promise(resolve => setTimeout(resolve, rateDelay));
            continue;
          }
        }
        
        // --- Added detailed response body handling with try/catch ---
        let responseText = '';
        try {
          // Clone the response to allow reading the body multiple times if needed
          const clonedResponse = response.clone();
          responseText = await clonedResponse.text();
          
          // Check if response text indicates rate limiting
          if (responseText.toLowerCase().includes('too many requests')) {
            debugWarn.api(`Rate limit detected in response text for ${url}`);
            rateLimitDetected = true;
            
            // If we haven't exceeded max retries, apply special rate limit delay
            if (attempt < maxRetries) {
              const rateDelay = RETRY_CONFIG.rateLimitDelayMs;
              debugLog.api(`Rate limit detected in response, waiting ${rateDelay}ms before retry`);
              await new Promise(resolve => setTimeout(resolve, rateDelay));
              continue;
            }
          }
          
          // For critical endpoints, always log the response
          if (isCriticalEndpoint || attempt > 0) {
            debugLog.api(`GET response text for ${endpoint} (attempt ${attempt+1}):`, responseText);
          } else {
            debugLog.api(`GET response text for ${endpoint}:`, responseText);
          }
        } catch (textError) {
          debugError.api(`Error reading response text for ${endpoint}:`, textError);
          
          // If this is a retryable error and we haven't exceeded max retries
          const { isRetryable, isRateLimit } = this.isRetryableError(textError, response.status);
          if (attempt < maxRetries && isRetryable) {
            lastError = textError;
            
            // Apply different delay based on whether it's a rate limit
            let delay;
            if (isRateLimit) {
              rateLimitDetected = true;
              delay = RETRY_CONFIG.rateLimitDelayMs;
              debugLog.api(`Rate limit detected, waiting ${delay}ms before retry`);
            } else {
              delay = this.getRetryDelay(attempt);
              debugLog.api(`Will retry after ${delay}ms due to error reading response body`);
            }
            
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // If we can't retry, return the error
          return {
            success: false,
            error: `Failed to read response body: ${textError instanceof Error ? textError.message : String(textError)}`,
            statusCode: response.status,
            retryAttempts: attempt
          };
        }
        
        // If we got here, we successfully read the response
        return this.handleResponse<T>(response);
      } catch (error) {
        lastError = error;
        debugError.api(`Network/fetch error during GET ${url} (attempt ${attempt+1}/${maxRetries+1}):`, error);
        
        // Check if we should retry
        const { isRetryable, isRateLimit } = this.isRetryableError(error, lastStatusCode);
        if (attempt < maxRetries && isRetryable) {
          // Apply different delay based on whether it's a rate limit
          let delay;
          if (isRateLimit) {
            rateLimitDetected = true;
            delay = RETRY_CONFIG.rateLimitDelayMs;
            debugLog.api(`Rate limit detected, waiting ${delay}ms before retry`);
          } else {
            delay = this.getRetryDelay(attempt);
            debugLog.api(`Will retry after ${delay}ms`);
          }
          
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If we've exhausted retries or it's not a retryable error, return the error
        break;
      }
    }
    
    // If we get here, all retries failed
    return {
      success: false,
      error: lastError instanceof Error ? lastError.message : 
             (rateLimitDetected ? 'Rate limit exceeded after multiple retry attempts' : 'Network error after multiple retry attempts'),
      statusCode: lastStatusCode,
      retryAttempts: maxRetries
    };
  }

  /**
   * Make a POST request with retry mechanism
   */
  async post<T>(
    endpoint: string,
    data: Record<string, unknown>,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = this.joinUrls(this.baseUrl, endpoint);
    
    // Create a safe copy of the data for logging (truncating large strings)
    const logSafeData = { ...data };
    
    // Special handling for newsletter booking endpoint which might contain large image data
    if (endpoint.includes('payments/newsletter-booking') && data.content) {
      // Check if we have image data that needs special handling
      const content = data.content as Record<string, unknown>;
      
      if (content.imageUrl && typeof content.imageUrl === 'string') {
        const imageUrl = content.imageUrl;
        debugLog.api(`POST contains image data of length: ${imageUrl.length}`);
        debugLog.api(`Image data type: ${typeof imageUrl}`);
        debugLog.api(`Image data starts with: ${imageUrl.substring(0, 50)}...`);
        debugLog.api(`Is base64 image: ${imageUrl.startsWith('data:image')}`);
        
        // For logging purposes, truncate the image data
        if (logSafeData.content && typeof logSafeData.content === 'object') {
          const logSafeContent = logSafeData.content as Record<string, unknown>;
          if (logSafeContent.imageUrl && typeof logSafeContent.imageUrl === 'string') {
            logSafeContent.imageUrl = `${logSafeContent.imageUrl.substring(0, 50)}... (${logSafeContent.imageUrl.length} chars)`;
          }
        }
      }
    }
    
    debugLog.api(`POST to ${url} with payload:`, logSafeData);
    // For development mode, intercept specific API calls and return mock responses
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      // Mock response for newsletter slot reservation
      if (endpoint === '/newsletter/slots/reserve') {
        debugLog.api('Intercepting /newsletter/slots/reserve request in development mode', data);
        
        // Generate a mock reservation ID
        const mockReservationId = 'mock-reservation-' + Date.now();
        
        // Return a successful mock response
        return {
          success: true,
          data: {
            id: mockReservationId,
            slots: [],
            business_id: data.businessId as string,
            is_top_spot: data.isTopSpot as boolean,
            expires_at: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes from now
            created_at: new Date().toISOString()
          } as unknown as T
        };
      }
      
      // Mock response for payment checkout creation
      // Commenting out to allow real Stripe checkout testing
      /*
      if (endpoint === '/api/payments/newsletter-booking') {
        debugLog.api('Intercepting /payments/newsletter-booking request in development mode', data);
        
        // Generate mock session data
        const mockSessionId = 'mock-session-' + Date.now();
        const mockReservationId = 'mock-reservation-' + Date.now();
        
        // In development, instead of redirecting to Stripe, we'll simulate a successful payment
        // by returning a URL that points back to our app with success parameters
        // Use our new dedicated payment success page
        const successUrl = `/business/payments/success?session_id=${mockSessionId}`;
        
        debugLog.api('Generated mock success URL:', successUrl);
        
        return {
          success: true,
          data: {
            sessionId: mockSessionId,
            url: successUrl,
            reservationId: mockReservationId
          } as unknown as T
        };
      }
      */
      
      // Mock response for payment confirmation
      if (endpoint === '/payments/confirm') {
        debugLog.api('Intercepting /payments/confirm request in development mode', data);
        
        const timestamp = new Date();
        const mockPaymentId = 'mock-payment-' + Date.now();
        
        return {
          success: true,
          data: {
            success: true,
            paymentId: mockPaymentId,
            status: 'succeeded',
            message: 'Payment completed successfully (mock)',
            amount: 99,
            currency: 'usd',
            createdAt: timestamp.toISOString(),
            receiptUrl: `https://dashboard.stripe.com/test/payments/${mockPaymentId}`,
            promotionId: 'mock-promotion-' + Date.now(),
            promotionTitle: 'Newsletter Ad for April 30, 2025'
          } as unknown as T
        };
      }
    }
    
    let lastError: unknown = null;
    let lastStatusCode: number | undefined = undefined;
    
    // Special handling for critical endpoints
    const isCriticalEndpoint = endpoint.includes('/businesses') || endpoint.includes('/auth');
    const maxRetries = isCriticalEndpoint ? RETRY_CONFIG.maxRetries + 1 : RETRY_CONFIG.maxRetries;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // If this is a retry, log it
        if (attempt > 0) {
          debugLog.api(`Retry attempt ${attempt}/${maxRetries} for POST ${url}`);
        }
        
        // Check if we need to handle large data URLs specially
        const requestBody = JSON.stringify(data);
        
        // Log the request body size for debugging
        debugLog.api(`Request body size: ${requestBody.length} bytes`);
        
        // If the request is too large, we might need to handle it differently
        // For now, we'll just log a warning but proceed with the request
        if (requestBody.length > 5000000) { // 5MB
          debugWarn.api(`Very large request body (${requestBody.length} bytes) may cause issues`);
        }
        
        const response = await fetch(url, {
          method: 'POST',
          headers: this.getHeaders(includeAuth),
          body: requestBody,
        });
        
        lastStatusCode = response.status;
        
        // Log raw response for debugging
        try {
          const respClone = response.clone();
          const respText = await respClone.text();
          // Truncate very large responses for logging
          const truncatedResponse = respText.length > 1000 ? 
            `${respText.substring(0, 1000)}... (total length: ${respText.length})` : 
            respText;
          
          // For critical endpoints or retries, add more detailed logging
          if (isCriticalEndpoint || attempt > 0) {
            debugLog.api(`POST response text (attempt ${attempt+1}):`, truncatedResponse);
          } else {
            debugLog.api(`POST response text:`, truncatedResponse);
          }
        } catch (textError) {
          debugError.api(`Error reading response text: ${textError instanceof Error ? textError.message : 'Unknown error'}`);
          
          // If this is a retryable error and we haven't exceeded max retries
          if (attempt < maxRetries && this.isRetryableError(textError, response.status)) {
            lastError = textError;
            const delay = this.getRetryDelay(attempt);
            debugLog.api(`Will retry after ${delay}ms due to error reading response body`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // If we can't retry, return the error
          return {
            success: false,
            error: `Failed to read response body: ${textError instanceof Error ? textError.message : String(textError)}`,
            statusCode: response.status,
            retryAttempts: attempt
          };
        }
        
        // If we got here, we successfully read the response
        return this.handleResponse<T>(response);
      } catch (error) {
        lastError = error;
        debugError.api(`POST error (attempt ${attempt+1}/${maxRetries+1}):`, error);
        
        // Check if we should retry
        if (attempt < maxRetries && this.isRetryableError(error, lastStatusCode)) {
          const delay = this.getRetryDelay(attempt);
          debugLog.api(`Will retry after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If we've exhausted retries or it's not a retryable error, break the loop
        break;
      }
    }
    
    // If we get here, all retries failed
    return {
      success: false,
      error: lastError instanceof Error ? lastError.message : 'Network error after multiple retry attempts',
      statusCode: lastStatusCode,
      retryAttempts: maxRetries
    };
  }
  
  /**
   * Make a POST request with FormData
   */
  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = this.joinUrls(this.baseUrl, endpoint);
    debugLog.api(`POST FormData to ${url}`);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(includeAuth, true),
        body: formData,
      });

      // Log raw response for debugging
      const respText = await response.clone().text();
      debugLog.api(`POST FormData response text:`, respText);

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Make a PUT request
   */
  async put<T>(
    endpoint: string,
    data: Record<string, unknown>,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = this.joinUrls(this.baseUrl, endpoint);
    debugLog.api(`PUT to ${url} with payload:`, data);
    console.log('[API] 🔍 PUT endpoint:', endpoint);
    console.log('[API] 🔍 PUT data received:', data);
    console.log('[API] 🔍 PUT data keys:', Object.keys(data || {}));
    console.log('[API] 🔍 PUT data stringified:', JSON.stringify(data, null, 2));
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(includeAuth),
        body: JSON.stringify(data),
      });

      // Log raw response for debugging
      try {
        const respText = await response.clone().text();
        debugLog.api(`PUT response text:`, respText.substring(0, 500) + 
          (respText.length > 500 ? '... [truncated]' : ''));
      } catch (textError) {
        debugError.api(`Error reading PUT response text:`, textError);
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      debugError.api(`PUT error for ${url}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(includeAuth),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
  
  /**
   * Make a PATCH request
   */
  async patch<T>(
    endpoint: string,
    data: Record<string, unknown>,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = this.joinUrls(this.baseUrl, endpoint);
    debugLog.api(`PATCH to ${url} with payload:`, data);
    
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(includeAuth),
        body: JSON.stringify(data),
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
  
  /**
   * Upload a file using FormData (POST request)
   * @param endpoint API endpoint for the upload
   * @param formData FormData containing the file to upload
   * @param includeAuth Whether to include authentication headers
   * @returns ApiResponse with the response data
   */
  async upload<T>(
    endpoint: string,
    formData: FormData,
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    debugLog.api(`Uploading file to ${this.baseUrl}${endpoint}`);
    try {
      // Log formData keys for debugging (can't log entire formData)
      const formDataKeys: string[] = [];
      formData.forEach((value, key) => {
        formDataKeys.push(key);
        // Log file details if it's a File object
        if (value instanceof File) {
          debugLog.api(`FormData contains file: ${key}, type: ${value.type}, size: ${value.size} bytes`);
        }
      });
      debugLog.api(`FormData keys: ${formDataKeys.join(', ')}`);
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(includeAuth, true), // true for isFormData
        body: formData,
      });

      // Log raw response for debugging
      try {
        const respText = await response.clone().text();
        debugLog.api(`Upload response text:`, respText.substring(0, 500) + 
          (respText.length > 500 ? '... [truncated]' : ''));
      } catch (textError) {
        debugError.api(`Error reading upload response text:`, textError);
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      debugError.api(`Error uploading file:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error during upload',
      };
    }
  }
}

// DEPRECATED: ApiService is no longer used - replaced by Convex
// Commenting out instantiation to prevent deprecation warning on load
// export const apiService = new ApiService();
// export default apiService;

// Create a dummy object that throws helpful errors if used
const deprecatedApiService = new Proxy({}, {
  get: () => {
    throw new Error('ApiService is deprecated. Use Convex services instead.');
  }
});

export const apiService = deprecatedApiService as any;
export default deprecatedApiService as any;
