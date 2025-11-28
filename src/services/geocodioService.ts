/**
 * Geocodio Address Validation and Geocoding Service
 * Provides address validation, standardization, and geocoding using Geocodio API
 * 
 * Free tier: 2,500 lookups per day
 * After free tier: $0.50 per 1,000 lookups
 * 
 * @see https://www.geocod.io/docs/
 */

interface GeocodioAddress {
  formatted_address: string;
  accuracy: number;
  accuracy_type: string;
  source: string;
  address_components: {
    number?: string;
    predirectional?: string;
    street?: string;
    suffix?: string;
    postdirectional?: string;
    secondaryunit?: string;
    secondarynumber?: string;
    city?: string;
    county?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  location: {
    lat: number;
    lng: number;
  };
}

interface GeocodioResponse {
  input: {
    address_components: any;
    formatted_address: string;
  };
  results: GeocodioAddress[];
}

interface ValidationResult {
  valid: boolean;
  standardized: string;
  confidence: number;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  components: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  accuracy_type?: string;
  raw_response?: GeocodioAddress;
}

interface AddressSuggestion {
  display_name: string;
  formatted_address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  confidence: number;
}

// Cache for validated addresses (24 hour TTL)
const addressCache = new Map<string, { result: ValidationResult; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get Geocodio API key from environment or localStorage (for development)
 */
const getApiKey = (): string | null => {
  // Try environment variable first (Vite)
  const envKey = import.meta.env.VITE_GEOCODIO_API_KEY;
  if (envKey) {
    return envKey;
  }

  // Fallback to localStorage for backwards compatibility
  if (typeof window !== 'undefined') {
    return localStorage.getItem('GEOCODIO_API_KEY');
  }

  return null;
};

/**
 * Normalize address string for caching
 */
const normalizeAddress = (address: string): string => {
  return address.toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Check if cached result is still valid
 */
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_TTL;
};

/**
 * Validate and geocode an address using Geocodio
 * 
 * @param address Full address string or components
 * @param options Optional configuration
 * @returns ValidationResult with standardized address and coordinates
 */
export const validateAddress = async (
  address: string | {
    street: string;
    city: string;
    state: string;
    zip?: string;
  },
  options?: {
    useCache?: boolean;
    fields?: string[]; // Additional Geocodio fields like 'census', 'timezone', etc.
  }
): Promise<ValidationResult> => {
  const useCache = options?.useCache !== false;
  
  // Format address string
  const addressString = typeof address === 'string' 
    ? address 
    : `${address.street}, ${address.city}, ${address.state} ${address.zip || ''}`.trim();
  
  // Check cache first
  if (useCache) {
    const cacheKey = normalizeAddress(addressString);
    const cached = addressCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
      console.log('[Geocodio] Using cached result for:', addressString);
      return cached.result;
    }
  }
  
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[Geocodio] No API key found. Please set GEOCODIO_API_KEY.');
    // Fall back to indicating the address needs validation
    return {
      valid: false,
      standardized: addressString,
      confidence: 0,
      coordinates: null,
      components: typeof address === 'object' ? {
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip
      } : {},
      accuracy_type: 'no_api_key'
    };
  }
  
  try {
    // Build URL with optional fields
    const params = new URLSearchParams({
      api_key: apiKey,
      q: addressString,
      limit: '1'
    });
    
    if (options?.fields && options.fields.length > 0) {
      params.append('fields', options.fields.join(','));
    }
    
    const response = await fetch(
      `https://api.geocod.io/v1.7/geocode?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Geocodio API error: ${response.status} ${response.statusText}`);
    }
    
    const data: GeocodioResponse = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      
      // Determine validation confidence based on accuracy
      const confidence = result.accuracy || 0;
      const isValid = confidence >= 0.8; // 80% confidence threshold
      
      const validationResult: ValidationResult = {
        valid: isValid,
        standardized: result.formatted_address,
        confidence: confidence,
        coordinates: result.location ? {
          latitude: result.location.lat,
          longitude: result.location.lng
        } : null,
        components: {
          street: [
            result.address_components.number,
            result.address_components.predirectional,
            result.address_components.street,
            result.address_components.suffix,
            result.address_components.postdirectional
          ].filter(Boolean).join(' '),
          city: result.address_components.city,
          state: result.address_components.state,
          zip: result.address_components.zip
        },
        accuracy_type: result.accuracy_type,
        raw_response: result
      };
      
      // Cache the result
      if (useCache) {
        const cacheKey = normalizeAddress(addressString);
        addressCache.set(cacheKey, {
          result: validationResult,
          timestamp: Date.now()
        });
      }
      
      console.log('[Geocodio] Successfully validated address:', addressString, '→', validationResult.standardized);
      return validationResult;
      
    } else {
      // No results found - address could not be validated
      return {
        valid: false,
        standardized: addressString,
        confidence: 0,
        coordinates: null,
        components: typeof address === 'object' ? {
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip
        } : {},
        accuracy_type: 'no_results'
      };
    }
    
  } catch (error) {
    console.error('[Geocodio] Error validating address:', error);
    return {
      valid: false,
      standardized: addressString,
      confidence: 0,
      coordinates: null,
      components: typeof address === 'object' ? {
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip
      } : {},
      accuracy_type: 'error'
    };
  }
};

/**
 * Get address suggestions/autocomplete using Geocodio
 * 
 * @param query Partial address to search
 * @param options Optional configuration
 * @returns Array of address suggestions
 */
export const getAddressSuggestions = async (
  query: string,
  options?: {
    limit?: number;
    includeComponents?: boolean;
    prioritizeState?: string; // Add option to prioritize a specific state
    prioritizeCity?: string; // Add option to prioritize a specific city
  }
): Promise<AddressSuggestion[]> => {
  if (!query || query.length < 3) {
    return [];
  }
  
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[Geocodio] No API key found for suggestions.');
    return [];
  }
  
  try {
    // Default to Jacksonville, Florida for local businesses
    const prioritizeState = options?.prioritizeState || 'Florida';
    const prioritizeCity = options?.prioritizeCity || 'Jacksonville';
    let searchQuery = query;
    
    // Check if query already contains location info
    const hasStateInfo = /\b(florida|fl|alabama|al|georgia|ga)\b/i.test(query);
    const hasCityInfo = /\b(jacksonville|jax|orlando|miami|tampa)\b/i.test(query);
    
    // Determine what location context to add based on query completeness
    const queryParts = query.trim().split(/\s+/);
    const hasStreetNumber = /^\d+/.test(query);
    const hasEnoughInfo = queryParts.length >= 2 && query.length >= 8;
    
    // Build search queries with progressive location context
    const queries: string[] = [];
    
    // If it starts with a street number, likely searching for a street address
    if (hasStreetNumber && !hasCityInfo && !hasStateInfo) {
      // Try with full location context for Jacksonville businesses
      if (hasEnoughInfo) {
        queries.push(`${query}, ${prioritizeCity}, ${prioritizeState}`);
      }
      // Also try with just state
      if (hasEnoughInfo) {
        queries.push(`${query}, ${prioritizeState}`);
      }
    } else if (!hasStateInfo && hasEnoughInfo) {
      // For non-street number queries, just add state
      queries.push(`${query}, ${prioritizeState}`);
    }
    
    // Always include the original query as fallback
    queries.push(query);
    
    // Collect all results
    let allResults: AddressSuggestion[] = [];
    const seenAddresses = new Set<string>();
    
    for (const searchQuery of queries) {
      const params = new URLSearchParams({
        api_key: apiKey,
        q: searchQuery,
        limit: (options?.limit || 8).toString() // Increase limit to get more results
      });
      
      const response = await fetch(
        `https://api.geocod.io/v1.7/geocode?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        // Only log non-422 errors. 422 is expected for incomplete addresses
        if (response.status !== 422) {
          console.error(`Geocodio API error for query "${searchQuery}": ${response.status}`);
        }
        continue;
      }
      
      const data: GeocodioResponse = await response.json();
      
      if (data.results && data.results.length > 0) {
        const suggestions = data.results.map(result => ({
          display_name: result.formatted_address,
          formatted_address: result.formatted_address,
          coordinates: {
            lat: result.location.lat,
            lng: result.location.lng
          },
          confidence: result.accuracy || 0,
          state: result.address_components.state // Add state for sorting
        }));
        
        // Add unique results only
        for (const suggestion of suggestions) {
          const key = suggestion.formatted_address.toLowerCase();
          if (!seenAddresses.has(key)) {
            seenAddresses.add(key);
            allResults.push(suggestion);
          }
        }
      }
    }
    
    // Sort results: Jacksonville FL first, then Florida, then by confidence
    allResults.sort((a, b) => {
      const aIsFlorida = (a as any).state === 'FL';
      const bIsFlorida = (b as any).state === 'FL';
      const aIsJacksonville = a.display_name.toLowerCase().includes('jacksonville');
      const bIsJacksonville = b.display_name.toLowerCase().includes('jacksonville');
      
      // Jacksonville, FL results come first
      if (aIsJacksonville && aIsFlorida && !(bIsJacksonville && bIsFlorida)) return -1;
      if (!(aIsJacksonville && aIsFlorida) && (bIsJacksonville && bIsFlorida)) return 1;
      
      // Then other Florida results
      if (aIsFlorida && !bIsFlorida) return -1;
      if (!aIsFlorida && bIsFlorida) return 1;
      
      // Within same category, sort by confidence
      return b.confidence - a.confidence;
    });
    
    // Remove state property before returning and limit results
    const finalResults = allResults.slice(0, options?.limit || 5).map(({ state, ...rest }: any) => rest);
    
    // Only log in development or if we found results
    if (finalResults.length > 0) {
      console.log(`[Geocodio] Found ${finalResults.length} suggestions for "${query}"${prioritizeState ? ` (prioritizing ${prioritizeState})` : ''}`);
    }
    
    return finalResults;
    
  } catch (error) {
    console.error('[Geocodio] Error fetching suggestions:', error);
    return [];
  }
};

/**
 * Reverse geocode coordinates to address
 * 
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Address information or null
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<ValidationResult | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[Geocodio] No API key found for reverse geocoding.');
    return null;
  }
  
  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      q: `${latitude},${longitude}`,
      limit: '1'
    });
    
    const response = await fetch(
      `https://api.geocod.io/v1.7/reverse?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Geocodio API error: ${response.status}`);
    }
    
    const data: GeocodioResponse = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      
      return {
        valid: true,
        standardized: result.formatted_address,
        confidence: result.accuracy || 0,
        coordinates: {
          latitude: result.location.lat,
          longitude: result.location.lng
        },
        components: {
          street: [
            result.address_components.number,
            result.address_components.predirectional,
            result.address_components.street,
            result.address_components.suffix,
            result.address_components.postdirectional
          ].filter(Boolean).join(' '),
          city: result.address_components.city,
          state: result.address_components.state,
          zip: result.address_components.zip
        },
        accuracy_type: result.accuracy_type,
        raw_response: result
      };
    }
    
    return null;
    
  } catch (error) {
    console.error('[Geocodio] Error reverse geocoding:', error);
    return null;
  }
};

/**
 * Batch validate multiple addresses (more efficient for bulk operations)
 * 
 * @param addresses Array of addresses to validate
 * @returns Array of validation results
 */
export const batchValidateAddresses = async (
  addresses: string[]
): Promise<ValidationResult[]> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[Geocodio] No API key found for batch validation.');
    return addresses.map(addr => ({
      valid: false,
      standardized: addr,
      confidence: 0,
      coordinates: null,
      components: {},
      accuracy_type: 'no_api_key'
    }));
  }
  
  try {
    // Geocodio batch endpoint accepts POST with JSON array
    const response = await fetch(
      `https://api.geocod.io/v1.7/geocode?api_key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addresses)
      }
    );
    
    if (!response.ok) {
      throw new Error(`Geocodio batch API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process batch results
    return data.results.map((item: any) => {
      if (item.response.results && item.response.results.length > 0) {
        const result = item.response.results[0];
        return {
          valid: result.accuracy >= 0.8,
          standardized: result.formatted_address,
          confidence: result.accuracy || 0,
          coordinates: result.location ? {
            latitude: result.location.lat,
            longitude: result.location.lng
          } : null,
          components: {
            street: [
              result.address_components.number,
              result.address_components.street,
              result.address_components.suffix
            ].filter(Boolean).join(' '),
            city: result.address_components.city,
            state: result.address_components.state,
            zip: result.address_components.zip
          },
          accuracy_type: result.accuracy_type
        };
      } else {
        return {
          valid: false,
          standardized: item.query,
          confidence: 0,
          coordinates: null,
          components: {},
          accuracy_type: 'no_results'
        };
      }
    });
    
  } catch (error) {
    console.error('[Geocodio] Error batch validating addresses:', error);
    return addresses.map(addr => ({
      valid: false,
      standardized: addr,
      confidence: 0,
      coordinates: null,
      components: {},
      accuracy_type: 'error'
    }));
  }
};

/**
 * Clear the address validation cache
 */
export const clearCache = (): void => {
  addressCache.clear();
  console.log('[Geocodio] Cache cleared');
};

/**
 * Set the Geocodio API key (for development/testing)
 */
export const setApiKey = (key: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('GEOCODIO_API_KEY', key);
    console.log('[Geocodio] API key set');
  }
};

export default {
  validateAddress,
  getAddressSuggestions,
  reverseGeocode,
  batchValidateAddresses,
  clearCache,
  setApiKey
};