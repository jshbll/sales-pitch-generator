/**
 * Utility functions for geocoding and address verification
 * 
 * Supports multiple providers:
 * 1. Geocodio (primary - better accuracy, address validation)
 * 2. OpenStreetMap Nominatim (fallback - free, no API key required)
 */

import { validateAddress as geocodioValidate, getAddressSuggestions as geocodioSuggestions } from '../services/geocodioService';

/**
 * Geocodes an address to latitude and longitude coordinates
 * Tries Geocodio first for better accuracy, falls back to OpenStreetMap
 * 
 * @param address Full address string to geocode
 * @param options Optional configuration
 * @returns Promise with coordinates or null if geocoding failed
 */
export const geocodeAddress = async (
  address: string,
  options?: {
    preferOpenStreetMap?: boolean;
    validateOnly?: boolean;
  }
): Promise<{latitude: number, longitude: number} | null> => {
  if (!address) {
    console.error('[geocodeUtils] No address provided');
    return null;
  }

  // Try Geocodio first unless explicitly preferring OpenStreetMap
  if (!options?.preferOpenStreetMap) {
    try {
      const geocodioResult = await geocodioValidate(address);
      
      if (geocodioResult.valid && geocodioResult.coordinates) {
        console.log('[geocodeUtils] Successfully geocoded with Geocodio:', address, '→', geocodioResult.coordinates);
        return {
          latitude: geocodioResult.coordinates.latitude,
          longitude: geocodioResult.coordinates.longitude
        };
      } else if (options?.validateOnly) {
        // If we only want validated addresses, don't fall back
        console.warn('[geocodeUtils] Address validation failed with Geocodio:', address);
        return null;
      }
    } catch (geocodioError) {
      console.warn('[geocodeUtils] Geocodio failed, falling back to OpenStreetMap:', geocodioError);
    }
  }

  // Fall back to OpenStreetMap Nominatim
  try {
    // Format the address for URL
    const encodedAddress = encodeURIComponent(address);
    
    // Use OpenStreetMap Nominatim API (free, no API key required)
    // Filter to US addresses only by adding countrycodes parameter
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1&countrycodes=us`,
      {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Geocoding failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if we got results
    if (data && data.length > 0) {
      const result = data[0];
      const coords = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };
      console.log('[geocodeUtils] Successfully geocoded address:', address, '→', coords);
      return coords;
    } else {
      console.warn('[geocodeUtils] No results found for address:', address);
      return null;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[geocodeUtils] Geocoding request timed out for address:', address);
    } else {
      console.error('[geocodeUtils] Error geocoding address:', error);
    }
    return null;
  }
};

/**
 * Verifies an address and returns suggestions
 * Tries Geocodio first for better accuracy, falls back to OpenStreetMap
 * 
 * @param addressQuery Partial address to look up
 * @param options Optional configuration
 * @returns Promise with array of address suggestions
 */
export const getSuggestions = async (
  addressQuery: string,
  options?: {
    preferOpenStreetMap?: boolean;
    limit?: number;
  }
): Promise<Array<{
  display_name: string;
  place_id: string;
  lat: string;
  lon: string;
}>> => {
  if (!addressQuery || addressQuery.length < 3) {
    return [];
  }

  // Try Geocodio first unless explicitly preferring OpenStreetMap
  if (!options?.preferOpenStreetMap) {
    try {
      const geocodioSuggestionResults = await geocodioSuggestions(addressQuery, {
        limit: options?.limit || 5
      });
      
      if (geocodioSuggestionResults && geocodioSuggestionResults.length > 0) {
        // Convert Geocodio format to our standard format
        return geocodioSuggestionResults.map((suggestion, index) => ({
          display_name: suggestion.formatted_address,
          place_id: `geocodio_${index}`,
          lat: suggestion.coordinates.lat.toString(),
          lon: suggestion.coordinates.lng.toString()
        }));
      }
    } catch (geocodioError) {
      console.warn('[geocodeUtils] Geocodio suggestions failed, falling back to OpenStreetMap:', geocodioError);
    }
  }

  // Fall back to OpenStreetMap Nominatim
  try {
    const encodedQuery = encodeURIComponent(addressQuery);
    
    // Use OpenStreetMap Nominatim API for address suggestions
    // Filter to US addresses only by adding countrycodes parameter
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=${options?.limit || 5}&addressdetails=1&countrycodes=us`,
      {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Address lookup failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Additional filter to ensure only US addresses are returned
    const filteredData = (data || []).filter((item: any) => {
      const displayName = item.display_name || '';
      const address = item.address || {};
      
      // Check if the address contains United States or USA in the display name
      // or has 'United States' as the country in address details
      return displayName.includes('United States') || 
             displayName.includes('USA') ||
             address.country === 'United States' ||
             address.country_code === 'us';
    });
    
    return filteredData;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[geocodeUtils] Address suggestions request timed out for query:', addressQuery);
    } else {
      console.error('[geocodeUtils] Error fetching address suggestions:', error);
    }
    return [];
  }
};

/**
 * Reverse geocodes coordinates to address components
 * Uses the free Nominatim OpenStreetMap API
 * 
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Promise with address components or null if reverse geocoding failed
 */
export const reverseGeocode = async (latitude: number, longitude: number): Promise<{
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  formattedAddress: string;
} | null> => {
  if (!latitude || !longitude) {
    console.error('[geocodeUtils] No coordinates provided for reverse geocoding');
    return null;
  }

  try {
    // Use OpenStreetMap Nominatim API for reverse geocoding
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.address) {
      const addressComponents = data.address;
      
      // Extract address components from the Nominatim response
      const houseNumber = addressComponents.house_number || '';
      const street = addressComponents.road || addressComponents.street || '';
      const city = addressComponents.city || 
                   addressComponents.town || 
                   addressComponents.village || 
                   addressComponents.municipality || '';
      const state = addressComponents.state || 
                    addressComponents.province || 
                    addressComponents.region || '';
      const zipCode = addressComponents.postcode || '';
      const country = addressComponents.country || '';
      
      // Construct street address
      const streetAddress = [houseNumber, street].filter(Boolean).join(' ').trim();
      
      const result = {
        address: streetAddress,
        city: city,
        state: state,
        zipCode: zipCode,
        country: country,
        formattedAddress: data.display_name || ''
      };
      
      console.log('[geocodeUtils] Successfully reverse geocoded coordinates:', { latitude, longitude }, '→', result);
      return result;
    } else {
      console.warn('[geocodeUtils] No address found for coordinates:', { latitude, longitude });
      return null;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[geocodeUtils] Reverse geocoding request timed out for coordinates:', { latitude, longitude });
    } else {
      console.error('[geocodeUtils] Error reverse geocoding coordinates:', error);
    }
    return null;
  }
};

/**
 * Validate an address and get standardized format
 * Uses Geocodio for USPS-compliant validation
 * 
 * @param address Address to validate
 * @returns Promise with validation result
 */
export const validateAndStandardizeAddress = async (
  address: string | {
    street: string;
    city: string;
    state: string;
    zip?: string;
  }
): Promise<{
  valid: boolean;
  standardized: string;
  confidence: number;
  coordinates?: { latitude: number; longitude: number };
  components?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}> => {
  try {
    const result = await geocodioValidate(address);
    return {
      valid: result.valid,
      standardized: result.standardized,
      confidence: result.confidence,
      coordinates: result.coordinates || undefined,
      components: result.components
    };
  } catch (error) {
    console.error('[geocodeUtils] Address validation error:', error);
    
    // Return a basic result indicating validation failed
    const addressString = typeof address === 'string' 
      ? address 
      : `${address.street}, ${address.city}, ${address.state} ${address.zip || ''}`.trim();
    
    return {
      valid: false,
      standardized: addressString,
      confidence: 0,
      components: typeof address === 'object' ? address : undefined
    };
  }
};

export default {
  geocodeAddress,
  getSuggestions,
  reverseGeocode,
  validateAndStandardizeAddress
};
