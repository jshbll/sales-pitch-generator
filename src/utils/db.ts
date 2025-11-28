/**
 * Database configuration and connection utility for JaxSaver 2.0
 * This utility is designed to work in both browser and Node.js environments
 * In the browser, it provides mock implementations that use the API
 * In Node.js, it uses pg (node-postgres) for direct PostgreSQL connections
 */

// Import types for pg
type PostgresPool = {
  query: (text: string, params?: unknown[]) => Promise<QueryResult>;
  connect: () => Promise<{ query: (text: string, params?: unknown[]) => Promise<QueryResult>; release: () => void }>;
  on(event: string, listener: (...args: unknown[]) => void): PostgresPool;
};

// We'll define Pool at runtime to avoid require() in browser environments
let PostgresPoolConstructor: new (config: Record<string, unknown>) => PostgresPool;

// Only try to load pg in Node.js environment
let pg: typeof import('pg') | undefined;
if (typeof window === 'undefined') {
  try {
    // Using dynamic import pattern for Node.js
    import('pg').then((module) => {
      pg = module;
      PostgresPoolConstructor = pg.Pool;
    }).catch((e) => {
      console.error('Failed to import pg module:', e);
    });
  } catch (e) {
    console.error('Failed to import pg module:', e);
  }
}

// Extend Window interface to include our mock data cache
declare global {
  interface Window {
    __mockDataCache: Record<string, unknown>;
    __rateLimitStatus: {
      isRateLimited: boolean;
      lastRateLimitTime: number;
      retryAfter: number;
    };
  }
}

// Detect environment
const isBrowser = typeof window !== 'undefined';
const isDevelopment = process.env.NODE_ENV === 'development' || (isBrowser && window.location.hostname === 'localhost');

// Import constants from config
// Removed unused import

/**
 * Create a type for query results that works in both environments
 */
export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
}

/**
 * Interface for our database client
 */
interface DbClient {
  query: (text: string, params?: unknown[]) => Promise<QueryResult>;
  getClient: () => Promise<unknown>;
  release?: () => void;
}

/**
 * Mock implementation for browser environment
 */
class BrowserDbClient implements DbClient {
  /**
   * Execute a query in the browser environment
   * @param text SQL query text
   * @param params Query parameters
   * @returns Promise with query result
   */
  async query(text: string, params?: unknown[]): Promise<QueryResult> {
    console.log('[BrowserDbClient] Executing query:', text, params);
    
    // Handle specific known queries first (like getBusinessCategories)
    // This logic can be expanded or moved depending on requirements
    if (text.toLowerCase().includes('select distinct category from businesses')) {
      // Try to get categories from API first
      try {
        // Define apiBaseUrl here so it's accessible throughout the method
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'; 
        console.log(`[BrowserDbClient] Making categories API request to: ${apiBaseUrl}/api/business-categories`);
        
        const response = await fetch(`${apiBaseUrl}/api/business-categories`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const categories = await response.json();
        return { rows: categories, rowCount: categories.length };
      } catch (error) {
        console.warn('[BrowserDbClient] Error fetching categories, using fallback:', error);
        
        // Fallback to predefined categories if API fails
        if (isDevelopment) {
          console.log('[BrowserDbClient] Using default categories in development mode');
          const defaultCategories = [
            'Restaurant',
            'Retail',
            'Service',
            'Entertainment',
            'Health & Wellness',
            'Professional Services',
            'Home Services',
            'Automotive',
            'Technology',
            'Education',
            'Financial Services',
            'Travel & Hospitality',
            'Beauty & Personal Care',
            'Sports & Recreation',
            'Other'
          ];
          
          return { 
            rows: defaultCategories.map(category => ({ category })), 
            rowCount: defaultCategories.length 
          };
        }
        
        // Re-throw the error if not in development
        throw error;
      }
    }

    // Standard API request for other queries
    // Remove unused outer retryCount declaration
    const maxRetries = 3; // Define maxRetries (used inside executeQuery)
    
    // Store a cache of mock data for development mode to avoid repeated requests
    // This is a simple in-memory cache that persists during the session
    if (!window.__mockDataCache) {
      window.__mockDataCache = {};
    }
    
    // Initialize rate limit tracking if not already done
    if (!window.__rateLimitStatus) {
      window.__rateLimitStatus = {
        isRateLimited: false,
        lastRateLimitTime: 0,
        retryAfter: 0
      };
    }
    
    // Enhanced query execution with dynamic HTTP method and conditional body
    // Inner function for retries
    const executeQuery = async (retryCount = 0): Promise<QueryResult> => {
      const now = Date.now();
      // Define apiBaseUrl *inside* executeQuery as well, or pass it as argument
      // Let's define it here for simplicity since it doesn't change per retry
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'; 

      // Check rate limiting status
      if (window.__rateLimitStatus && window.__rateLimitStatus.isRateLimited) {
        if (now < window.__rateLimitStatus.lastRateLimitTime + window.__rateLimitStatus.retryAfter) {
          console.warn(`[BrowserDbClient] Still rate limited. Request blocked for ${((window.__rateLimitStatus.lastRateLimitTime + window.__rateLimitStatus.retryAfter) - now) / 1000} more seconds.`);
          if (isDevelopment) {
            const endpointForMock = this.getEndpointFromQuery(text); 
            return this.getMockDataForQuery(text, endpointForMock);
          }
          throw new Error('Rate Limited');
        } else {
          // Reset rate limit status if the period has passed
          // Assign a valid object indicating 'not rate limited'
          window.__rateLimitStatus = { isRateLimited: false, lastRateLimitTime: 0, retryAfter: 0 };
        }
      }
      
      try {
        const endpoint = this.getEndpointFromQuery(text);
        const normalizedQuery = text.trim().toLowerCase();
        let method = 'POST'; // Default to POST

        // Determine HTTP method based on SQL verb
        if (normalizedQuery.startsWith('select')) {
          method = 'GET';
        } else if (normalizedQuery.startsWith('insert')) {
          method = 'POST';
        } else if (normalizedQuery.startsWith('update')) {
          method = 'PUT'; // Or potentially PATCH depending on API design
        } else if (normalizedQuery.startsWith('delete')) {
          method = 'DELETE';
        }

        let finalEndpoint = endpoint; // Use a new variable for the potentially modified endpoint

        if (endpoint === '/businesses' && params) {
          if (method === 'PUT' && params.length >= 2) { // Assumes ID is the second param for UPDATE
            const id = params[1]; 
            if (id) {
              finalEndpoint = `/businesses/${id}`;
              console.log(`[BrowserDbClient] Modified endpoint for PUT: ${finalEndpoint}`);
            }
          } else if (method === 'DELETE' && params.length >= 1) { // Assumes ID is the first param for DELETE
            const id = params[0]; 
            if (id) {
              finalEndpoint = `/businesses/${id}`;
              console.log(`[BrowserDbClient] Modified endpoint for DELETE: ${finalEndpoint}`);
            }
          }
        }

        const token = localStorage.getItem('jaxsaver_auth_token'); // Or however you store the token
        console.log('[BrowserDbClient] Retrieved Auth Token:', token ? `Token found (length: ${token.length})` : 'Token not found');
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Construct fetch options
        const fetchOptions: RequestInit = {
          method: method,
          headers: headers,
        };

        // Only include body for POST and PUT requests
        // IMPORTANT: Send only params for PUT, not the whole query string
        if (method === 'POST') {
          fetchOptions.body = JSON.stringify({ query: text, params });
        } else if (method === 'PUT' && endpoint === '/businesses') { // Refined condition: only for business PUTs
           // For PUT to /businesses/:id, the API likely expects the updated fields in the body.
           // Extract relevant field based on query
           let bodyData = {};
           if (normalizedQuery.includes('set logo_url =') && params && params.length > 0) {
              bodyData = { logo_url: params[0] }; 
           } else if (normalizedQuery.includes('set banner_url =') && params && params.length > 0) {
              bodyData = { banner_url: params[0] };
           } else {
              // General PUT - might need more robust parsing based on API needs
              // For now, send params, but warn
              console.warn('[BrowserDbClient] Sending generic params object for PUT. API might expect specific fields.');
              bodyData = { params };
           }
           fetchOptions.body = JSON.stringify(bodyData); 
           console.log(`[BrowserDbClient] PUT body: ${fetchOptions.body}`);
        } else if (method === 'PUT') { // Handle PUT for other endpoints if necessary
            fetchOptions.body = JSON.stringify({ query: text, params }); // Fallback for other PUTs
        }

        // Log the request details for debugging (using finalEndpoint)
        console.log('[BrowserDbClient] Request details:', {
          url: `${apiBaseUrl}/api${finalEndpoint}`, // Use finalEndpoint
          method: fetchOptions.method,
          headers: fetchOptions.headers,
          body: fetchOptions.body, // Body will be undefined for GET/DELETE
        });

        // Note: The URL might need adjustment for GET/DELETE if params aren't in body
        const response = await fetch(`${apiBaseUrl}/api${finalEndpoint}`, fetchOptions); // Use finalEndpoint

        // Log the response status and headers for debugging
        console.log('[BrowserDbClient] Response status:', response.status);
        console.log('[BrowserDbClient] Response headers:', Object.fromEntries([...response.headers]));

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '0', 10);
          window.__rateLimitStatus = {
            isRateLimited: true,
            lastRateLimitTime: now,
            retryAfter: retryAfter
          };
          
          // Check if we have cached mock data for this endpoint
          const cacheKey = `${endpoint}:${JSON.stringify(text)}`;
          if (isDevelopment && window.__mockDataCache[cacheKey]) {
            console.log(`[BrowserDbClient] Using cached mock data for rate-limited request: ${endpoint}`);
            return window.__mockDataCache[cacheKey] as QueryResult;
          }
          
          if (retryCount < maxRetries) { // Use maxRetries here
            // Increment retryCount correctly for the log message
            console.log(`[BrowserDbClient] Rate limited (429). Retrying in ${retryAfter}ms... (Attempt ${retryCount + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, retryAfter));
            // Pass incremented retryCount to the recursive call
            return executeQuery(retryCount + 1); 
          } else {
            console.warn(`[BrowserDbClient] Rate limited (429). Max retries (${maxRetries}) reached.`);
            
            if (isDevelopment) {
              console.log('[BrowserDbClient] Using mock data for rate-limited request in development mode');
              return this.getMockDataForQuery(text, endpoint);
            }
          }
        }
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();

        console.log('[BrowserDbClient] Raw API response data:', JSON.stringify(data));

        if (response.ok) {
          // Adjust the return to match NodeDbClient structure based on observed API response
          if (data && data.data && data.data.business) {
             // Handle case where API returns a single updated object
            return { rows: [data.data.business], rowCount: 1 };
          } else if (data && Array.isArray(data.data)) {
            // Handle case where API might return an array (e.g., for SELECT)
             return { rows: data.data, rowCount: data.data.length };
          } else {
            // Fallback or handle other response structures if needed
            console.warn('[BrowserDbClient] Unexpected API response structure:', data);
            return { rows: [], rowCount: 0 }; 
          }
        } else {
           // Throw error if response was not ok (already handled above, but defensive)
          throw new Error(`API error: ${response.status} - ${data.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('[BrowserDbClient] Query error:', error);
        // Only fallback for rate-limited (429) errors in development
        if (isDevelopment && error instanceof Error && error.message.includes('API error: 429')) {
          console.log('[BrowserDbClient] Using empty result fallback for rate-limited request in development');
          return { rows: [], rowCount: 0 };
        }
        throw error;
      }
    };
    
    return executeQuery();
  }
  
  /**
   * Get a database client
   * In browser environment, this just returns the current instance
   * @returns Promise with database client
   */
  async getClient(): Promise<DbClient> {
    // In browser, just return this same instance
    return this;
  }
  
  /**
   * Generate mock data for a query when rate limited
   * @param text SQL query text
   * @param endpoint The API endpoint
   * @returns Mock query result
   */
  private getMockDataForQuery(text: string, endpoint: string): QueryResult {
    console.log(`[BrowserDbClient] Generating mock data for endpoint: ${endpoint}`);
    
    // Generate mock data based on the query/endpoint type
    if (endpoint.includes('/businesses')) {
      return { 
        rows: [{ 
          id: 'mock-business-id-' + Date.now(), 
          name: 'Mock Business (Rate Limited)', 
          description: 'This is mock data due to rate limiting',
          categories: ['Service'],
          logo_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNTU1Ij5Mb2dvPC90ZXh0Pjwvc3ZnPg==',
          banner_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSIzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNjAwIiB5PSIxNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzU1NSI+QmFubmVyPC90ZXh0Pjwvc3ZnPg==',
          address: '123 Mock Street',
          city: 'Jacksonville',
          state: 'FL',
          zip: '32256',
          phone: '555-123-4567',
          email: 'mock@example.com',
          website: 'https://example.com',
          businessHours: {
            monday: { open: '9:00 AM', close: '5:00 PM', closed: false },
            tuesday: { open: '9:00 AM', close: '5:00 PM', closed: false },
            wednesday: { open: '9:00 AM', close: '5:00 PM', closed: false },
            thursday: { open: '9:00 AM', close: '5:00 PM', closed: false },
            friday: { open: '9:00 AM', close: '5:00 PM', closed: false },
            saturday: { open: '10:00 AM', close: '3:00 PM', closed: false },
            sunday: { open: 'Closed', close: 'Closed', closed: true }
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          owner_id: 'mock-user-id',
          industry: 'Technology',
          founded: '2020',
          employees: '1-10'
        }], 
        rowCount: 1 
      };
    } else if (endpoint.includes('/categories') || text.toLowerCase().includes('category')) {
      const categories = [
        'Restaurant',
        'Retail',
        'Service',
        'Entertainment',
        'Health & Wellness',
        'Professional Services',
        'Home Services',
        'Automotive',
        'Technology',
        'Education',
        'Financial Services',
        'Travel & Hospitality',
        'Beauty & Personal Care',
        'Sports & Recreation',
        'Other'
      ];
      return { 
        rows: categories.map(category => ({ category })), 
        rowCount: categories.length 
      };
    } else if (endpoint.includes('/users')) {
      return {
        rows: [{
          id: 'mock-user-id-' + Date.now(),
          email: 'mock@example.com',
          firstName: 'Mock',
          lastName: 'User',
          role: 'business',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }],
        rowCount: 1
      };
    }
    
    // Default mock data for unknown endpoints
    return {
      rows: [{ message: 'Mock data for rate limited request' }],
      rowCount: 1
    };
  }

  /**
   * Get the API endpoint from the SQL query
   * @param query SQL query text
   * @returns API endpoint string
   */
  private getEndpointFromQuery(query: string): string {
    // Enhanced logic to determine API endpoint from SQL query
    // This maps SQL operations to RESTful API endpoints
    const normalizedQuery = query.trim().toLowerCase();
    
    // --- Business-related queries --- 
    if (normalizedQuery.includes('businesses')) {
        // Basic mapping (adjust based on actual API routes)
        if (normalizedQuery.startsWith('select')) {
            // Example: Check if selecting by ID or owner_id
            if (normalizedQuery.includes('where id =') || normalizedQuery.includes('where owner_id =')) {
                 // Basic assumption: /businesses/{id} or similar. 
                 // Needs logic to extract the ID if the API uses path params.
                 // For now, return generic endpoint, assuming ID might be query param or handled by backend based on body/query string.
                 return '/businesses'; 
            }
            return '/businesses'; // General select
        }
        if (normalizedQuery.startsWith('insert')) {
            return '/businesses'; // POST to /businesses
        }
        if (normalizedQuery.startsWith('update')) {
             // Needs logic to extract ID if API uses /businesses/{id} for PUT/PATCH
            return '/businesses'; // PUT/PATCH to /businesses or /businesses/{id}
        }
        if (normalizedQuery.startsWith('delete')) {
             // Needs logic to extract ID if API uses /businesses/{id} for DELETE
            return '/businesses'; // DELETE to /businesses/{id}
        }
    }

    // --- Category queries --- 
    if (normalizedQuery.includes('categories') || (normalizedQuery.includes('category') && normalizedQuery.includes('distinct'))) {
      return '/categories'; // Assume a /categories endpoint exists
    }

    // --- User queries --- 
    if (normalizedQuery.includes('users')) {
        // Similar logic as businesses needed based on API design
        if (normalizedQuery.startsWith('select')) {
            return '/users'; // e.g., GET /users or GET /users/{id}
        }
        if (normalizedQuery.startsWith('insert')) {
            return '/users'; // e.g., POST /users
        }
         if (normalizedQuery.startsWith('update')) {
            return '/users'; // e.g., PUT /users/{id}
        }
        // Add delete if applicable
    }

    // Fallback/Default endpoint (or throw error)
    console.warn(`[BrowserDbClient] Could not determine specific endpoint for query: ${query}. Defaulting to /query`);
    return '/query'; // A generic endpoint if specific mapping fails
  }
}

// Variables to hold our implementation
let dbClient: DbClient;
let pool: PostgresPool | null = null;

// Initialize the appropriate implementation based on environment
if (isBrowser) {
  console.log('Initializing browser database client');
  dbClient = new BrowserDbClient();
} else {
  // Use an async IIFE to handle dynamic import in Node.js environment
  (async () => {
    let nodeDbClient: DbClient | null = null;
    try {
      // Try to load Node.js specific modules and initialize the pool
      const { Pool } = await import('pg');
      PostgresPoolConstructor = Pool;
      
      // Ensure constructor is assigned before using it
      if (!PostgresPoolConstructor) {
        throw new Error('Failed to load pg Pool constructor.');
      }
      
      pool = new PostgresPoolConstructor({
        user: process.env.PGUSER || 'postgres',
        host: process.env.PGHOST || 'localhost',
        database: process.env.PGDATABASE || 'jaxsaver',
        password: process.env.PGPASSWORD || 'postgres',
        port: parseInt(process.env.PGPORT || '5432', 10),
      });
      
      pool.on('error', (...args: unknown[]) => {
        const err = args[0];
        if (err instanceof Error) {
          console.error('Unexpected error on idle client', err);
        } else {
          console.error('Unexpected non-Error object received on pool error event:', err);
        }
      });
      
      // Create Node.js implementation
      nodeDbClient = {
        query: async (text: string, params?: unknown[]) => {
          if (!pool) throw new Error('Database pool not initialized');
          return pool.query(text, params);
        },
        getClient: async () => {
          if (!pool) throw new Error('Database pool not initialized');
          return pool.connect();
        },
      };
      dbClient = nodeDbClient;
    } catch (error) {
      console.error('Error initializing Node.js database client:', error);
      // Fallback to browser implementation if pg module fails to load
      console.log('[DB] Falling back to BrowserDbClient due to Node.js initialization error.');
      dbClient = new BrowserDbClient(); // Ensure dbClient is assigned in catch block too
    }
  })();
}

/**
 * Execute a database query
 * @param text SQL query text
 * @param params Query parameters
 * @returns Promise with query result
 */
export const query = async (text: string, params?: unknown[]) => {
  try {
    const start = Date.now();
    const res = await dbClient.query(text, params);
    const duration = Date.now() - start;
    
    // Log query information for debugging
    console.log({
      text,
      params: params ? '[params]' : 'none',
      duration: `${duration}ms`,
      rows: res.rowCount
    });
    
    return res;
  } catch (error) {
    console.error('Error executing query', {
      error,
      text,
      params
    });
    throw error;
  }
};

/**
 * Get a client from the pool
 * @returns Promise with database client
 */
export const getClient = async () => {
  return dbClient.getClient();
};

// Export the database interface
export default {
  query,
  getClient,
  pool
};
