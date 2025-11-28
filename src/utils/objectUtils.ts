// Utility function to convert object keys from snake_case to camelCase

// Simple camelCase conversion: hello_world -> helloWorld
const toCamel = (s: string): string => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

// Define a generic type for objects with string keys
type AnyObject = { [key: string]: unknown };

// Function to recursively convert keys in an object using generics
export const keysToCamel = <T extends AnyObject | AnyObject[] | unknown>(o: T): T => {
  if (o === null || typeof o !== 'object') {
    return o; // Return primitives as is
  }

  if (Array.isArray(o)) {
    // If it's an array, map over its elements and apply keysToCamel recursively
    return o.map(item => keysToCamel(item)) as T;
  }

  // If it's an object, process its keys
  const newO: AnyObject = {};
  Object.keys(o as AnyObject).forEach((k) => {
    const newK = toCamel(k);
    // Assert the type of o[k] to allow recursive call
    newO[newK] = keysToCamel((o as AnyObject)[k]); 
  });

  return newO as T;
};
