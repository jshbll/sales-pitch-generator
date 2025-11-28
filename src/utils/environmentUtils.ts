/**
 * Environment Utilities
 * 
 * Utility functions for checking the current application environment
 * and handling environment-specific behavior.
 * 
 * @version 2.0.0
 * @author JaxSaver Team
 */

/**
 * Get the current Node environment
 * @returns The current environment as a string ('development', 'production', 'test')
 */
export function getEnvironment(): string {
  return process.env.NODE_ENV || 'development';
}

/**
 * Check if the application is running in a development environment
 * @returns True if in development mode
 */
export function isDevelopmentEnv(): boolean {
  return getEnvironment() === 'development';
}

/**
 * Check if the application is running in a production environment
 * @returns True if in production mode
 */
export function isProductionEnv(): boolean {
  return getEnvironment() === 'production';
}

/**
 * Check if the application is running in a test environment
 * @returns True if in test mode
 */
export function isTestEnv(): boolean {
  return getEnvironment() === 'test';
}

/**
 * Get environment-specific value based on current environment
 * 
 * @param devValue Value to use in development environment
 * @param prodValue Value to use in production environment
 * @param testValue Value to use in test environment (defaults to dev value)
 * @returns The appropriate value for the current environment
 */
export function getEnvValue<T>(devValue: T, prodValue: T, testValue: T = devValue): T {
  const env = getEnvironment();
  
  if (env === 'production') return prodValue;
  if (env === 'test') return testValue;
  return devValue;
}

/**
 * Check if we should include debug information in responses
 * based on environment and debug flag
 * 
 * @returns True if debug info should be included
 */
export function shouldIncludeDebugInfo(): boolean {
  // Always include debug info in development
  if (isDevelopmentEnv()) return true;
  
  // Never include in production unless explicitly enabled
  if (isProductionEnv()) {
    return process.env.ENABLE_PROD_DEBUG === 'true';
  }
  
  // In test, follow the test debug flag
  return process.env.TEST_DEBUG === 'true';
}

/**
 * Get the appropriate error stack trace depth based on environment
 * 
 * @returns Number of stack frames to include
 */
export function getStackTraceDepth(): number {
  return getEnvValue(10, 3, 5);
}

/**
 * Get appropriate timeout value based on environment
 * 
 * @param operationType Type of operation for context (default is 'default')
 * @returns Timeout in milliseconds
 */
export function getTimeoutValue(operationType: 'api' | 'database' | 'cache' | 'default' = 'default'): number {
  // Base timeouts by operation type
  const baseTimeouts: Record<string, number> = {
    api: 30000,      // 30 seconds
    database: 15000, // 15 seconds
    cache: 5000,     // 5 seconds
    default: 10000   // 10 seconds
  };
  
  // Environment multipliers
  const multiplier = getEnvValue(1.5, 1.0, 2.0);
  
  // Get base timeout for operation type
  const baseTimeout = baseTimeouts[operationType] || baseTimeouts.default;
  
  // Apply environment-specific multiplier
  return Math.floor(baseTimeout * multiplier);
}
