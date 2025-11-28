/**
 * Utility functions for converting object keys between snake_case and camelCase
 */

/**
 * Converts a string from snake_case to camelCase
 * @param s The string to convert
 * @returns The camelCase version of the string
 */
export const toCamel = (s: string): string => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

/**
 * Checks if a value is an object (not an array or function)
 * @param o The value to check
 * @returns Boolean indicating if the value is an object
 */
export const isObject = (o: unknown): o is Record<string, unknown> => {
  return o !== null && o === Object(o) && !Array.isArray(o) && typeof o !== 'function';
};

/**
 * Recursively converts all keys in an object from snake_case to camelCase
 * @param o The object to convert
 * @returns The object with camelCase keys
 */
export const keysToCamel = (o: unknown): unknown => {
  // Handle null and undefined explicitly
  if (o === null || o === undefined) {
    return o;
  }
  
  if (isObject(o)) {
    const n: { [key: string]: unknown } = {};

    Object.keys(o)
      .forEach((k) => {
        n[toCamel(k)] = keysToCamel(o[k]);
      });

    return n;
  } else if (Array.isArray(o)) {
    return o.map((i) => {
      return keysToCamel(i);
    });
  }

  return o;
};
