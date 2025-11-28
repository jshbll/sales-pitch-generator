/**
 * Business Location Schema
 * 
 * Zod schema for validating business location information.
 * 
 * @version 1.0.0
 * @author JaxSaver Team
 */

import { z } from 'zod';
import { 
  optionalStringSchema, 
  coordinateSchema 
} from './businessCommon.schema';

/**
 * Schema for business location
 */
export const businessLocationSchema = z.object({
  address: optionalStringSchema,
  city: optionalStringSchema,
  state: optionalStringSchema,
  zip: optionalStringSchema,
  zip_code: optionalStringSchema,
  latitude: coordinateSchema,
  longitude: coordinateSchema
});

/**
 * Type definition for BusinessLocation
 */
export type BusinessLocation = z.infer<typeof businessLocationSchema>;

/**
 * Get the formatted address for a business
 * 
 * @param location - The business location information
 * @returns The formatted address
 */
export function getFormattedAddress(location: BusinessLocation): string {
  const parts: string[] = [];
  
  if (location.address) {
    parts.push(location.address);
  }
  
  const cityStateZip: string[] = [];
  if (location.city) {
    cityStateZip.push(location.city);
  }
  
  if (location.state) {
    cityStateZip.push(location.state);
  }
  
  if (location.zip || location.zip_code) {
    cityStateZip.push(location.zip || location.zip_code || '');
  }
  
  if (cityStateZip.length > 0) {
    parts.push(cityStateZip.join(', '));
  }
  
  return parts.join('\n');
}

/**
 * Check if a business has a complete address
 * 
 * @param location - The business location information
 * @returns True if the business has a complete address
 */
export function hasCompleteAddress(location: BusinessLocation): boolean {
  return !!(
    location.address &&
    location.city &&
    location.state &&
    (location.zip || location.zip_code)
  );
}

/**
 * Get the zip code for a business
 * 
 * @param location - The business location information
 * @returns The zip code
 */
export function getZipCode(location: BusinessLocation): string | undefined {
  return location.zip || location.zip_code;
}

/**
 * Check if a business has coordinates
 * 
 * @param location - The business location information
 * @returns True if the business has coordinates
 */
export function hasCoordinates(location: BusinessLocation): boolean {
  return typeof location.latitude === 'number' && typeof location.longitude === 'number';
}

/**
 * Get the coordinates for a business
 * 
 * @param location - The business location information
 * @returns The coordinates as [latitude, longitude] or undefined
 */
export function getCoordinates(location: BusinessLocation): [number, number] | undefined {
  if (hasCoordinates(location)) {
    return [location.latitude as number, location.longitude as number];
  }
  
  return undefined;
}

/**
 * Create a location object with default values
 * 
 * @returns A new business location object
 */
export function createDefaultLocation(): BusinessLocation {
  return {
    address: undefined,
    city: undefined,
    state: undefined,
    zip: undefined,
    zip_code: undefined,
    latitude: undefined,
    longitude: undefined
  };
}
