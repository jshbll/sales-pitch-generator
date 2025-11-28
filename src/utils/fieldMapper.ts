/**
 * Field mapping utilities for converting between frontend (camelCase) and backend (snake_case) conventions
 */

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Recursively convert all object keys from camelCase to snake_case
 */
export function convertKeysToSnakeCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToSnakeCase(item)) as any;
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Special handling for _id and _creationTime (Convex system fields)
      if (key.startsWith('_')) {
        converted[key] = value;
      } else {
        const snakeKey = camelToSnake(key);
        converted[snakeKey] = convertKeysToSnakeCase(value);
      }
    }
    return converted;
  }
  
  return obj;
}

/**
 * Recursively convert all object keys from snake_case to camelCase
 */
export function convertKeysToCamelCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamelCase(item)) as any;
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Special handling for _id and _creationTime (Convex system fields)
      if (key.startsWith('_')) {
        converted[key] = value;
      } else {
        const camelKey = snakeToCamel(key);
        converted[camelKey] = convertKeysToCamelCase(value);
      }
    }
    return converted;
  }
  
  return obj;
}

/**
 * Field mapping configuration for special cases that don't follow naming conventions
 */
export const SPECIAL_FIELD_MAPPINGS = {
  // Frontend (camelCase) -> Backend (snake_case)
  toBackend: {
    businessName: 'name', // Special case: businessName maps to name in business table
    internalName: 'internal_name', // Will be mapped to 'name' in location table by backend
    profileName: 'profile_name',
    customersDoNotVisit: 'customersDoNotVisit', // Keep as is - this is an exception
  },
  // Backend (snake_case) -> Frontend (camelCase)
  toFrontend: {
    name: 'businessName', // When coming from business table
    internal_name: 'internalName',
    profile_name: 'profileName',
    customersDoNotVisit: 'customersDoNotVisit', // Keep as is - this is an exception
  }
};

/**
 * Convert frontend data to backend format with special field handling
 */
export function toBackendFormat<T = any>(data: any): T {
  // First apply special mappings
  const mapped: any = { ...data };
  
  for (const [frontendKey, backendKey] of Object.entries(SPECIAL_FIELD_MAPPINGS.toBackend)) {
    if (frontendKey in mapped) {
      mapped[backendKey] = mapped[frontendKey];
      if (frontendKey !== backendKey) {
        delete mapped[frontendKey];
      }
    }
  }
  
  // Then convert remaining fields to snake_case
  return convertKeysToSnakeCase<T>(mapped);
}

/**
 * Convert backend data to frontend format with special field handling
 */
export function toFrontendFormat<T = any>(data: any): T {
  // First convert to camelCase
  const camelCased = convertKeysToCamelCase(data);
  
  // Then apply special mappings
  const mapped: any = { ...camelCased };
  
  for (const [backendKey, frontendKey] of Object.entries(SPECIAL_FIELD_MAPPINGS.toFrontend)) {
    const camelBackendKey = snakeToCamel(backendKey);
    if (camelBackendKey in mapped) {
      mapped[frontendKey] = mapped[camelBackendKey];
      if (camelBackendKey !== frontendKey) {
        delete mapped[camelBackendKey];
      }
    }
  }
  
  return mapped as T;
}