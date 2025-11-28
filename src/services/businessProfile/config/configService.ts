/**
 * Business Profile Configuration Service
 * 
 * Provides centralized configuration for the business profile service.
 * This follows the Dependency Inversion Principle by allowing configuration
 * to be injected and easily changed without modifying business logic.
 */

/**
 * Business profile service configuration
 */
export interface BusinessProfileConfig {
  /** API endpoint for business profiles */
  apiEndpoint: string;
  /** Cache configuration */
  cache: {
    /** Whether caching is enabled */
    enabled: boolean;
    /** Default TTL in milliseconds */
    defaultTtl: number;
    /** Maximum number of cached items */
    maxItems: number;
    /** Enable debug logging for cache operations */
    debug: boolean;
  };
  /** Logging configuration */
  logging: {
    /** Whether to log cache operations */
    cacheOperations: boolean;
    /** Whether to log API requests */
    apiRequests: boolean;
    /** Whether to log validation errors */
    validationErrors: boolean;
  };
  /** Development mode configuration */
  development: {
    /** Whether to use development fallbacks */
    useFallbacks: boolean;
    /** Whether to include detailed error information */
    detailedErrors: boolean;
  };
}

/**
 * Default configuration for the business profile service
 */
const defaultConfig: BusinessProfileConfig = {
  apiEndpoint: '/businesses',
  cache: {
    enabled: true,
    defaultTtl: 5 * 60 * 1000, // 5 minutes
    maxItems: 100,
    debug: false
  },
  logging: {
    cacheOperations: true,
    apiRequests: true,
    validationErrors: true
  },
  development: {
    useFallbacks: process.env.NODE_ENV === 'development',
    detailedErrors: process.env.NODE_ENV === 'development'
  }
};

/**
 * Business Profile Configuration Service
 * 
 * Manages configuration for the business profile service
 * with support for overriding default values.
 */
export class BusinessProfileConfigService {
  private config: BusinessProfileConfig;
  
  /**
   * Create a new configuration service
   * 
   * @param overrides - Configuration overrides
   */
  constructor(overrides: Partial<BusinessProfileConfig> = {}) {
    this.config = this.mergeConfig(defaultConfig, overrides);
  }
  
  /**
   * Get the current configuration
   * 
   * @returns The current configuration
   */
  getConfig(): BusinessProfileConfig {
    return { ...this.config };
  }
  
  /**
   * Update the configuration
   * 
   * @param overrides - Configuration overrides
   */
  updateConfig(overrides: Partial<BusinessProfileConfig>): void {
    this.config = this.mergeConfig(this.config, overrides);
  }
  
  /**
   * Reset the configuration to defaults
   * 
   * @param overrides - Optional overrides to apply after reset
   */
  resetConfig(overrides: Partial<BusinessProfileConfig> = {}): void {
    this.config = this.mergeConfig(defaultConfig, overrides);
  }
  
  /**
   * Get the API endpoint for a specific business ID
   * 
   * @param businessId - Optional business ID
   * @returns The API endpoint
   */
  getApiEndpoint(businessId?: string): string {
    if (businessId) {
      return `${this.config.apiEndpoint}/${businessId}`;
    }
    return `${this.config.apiEndpoint}/me`;
  }
  
  /**
   * Check if detailed errors are enabled
   * 
   * @returns Whether detailed errors are enabled
   */
  isDetailedErrorsEnabled(): boolean {
    return this.config.development.detailedErrors;
  }
  
  /**
   * Check if development fallbacks are enabled
   * 
   * @returns Whether development fallbacks are enabled
   */
  isFallbacksEnabled(): boolean {
    return this.config.development.useFallbacks;
  }
  
  /**
   * Get cache configuration
   * 
   * @returns Cache configuration
   */
  getCacheConfig(): BusinessProfileConfig['cache'] {
    return { ...this.config.cache };
  }
  
  /**
   * Check if cache is enabled
   * 
   * @returns Whether cache is enabled
   */
  isCacheEnabled(): boolean {
    return this.config.cache.enabled;
  }
  
  /**
   * Get logging configuration
   * 
   * @returns Logging configuration
   */
  getLoggingConfig(): BusinessProfileConfig['logging'] {
    return { ...this.config.logging };
  }
  
  /**
   * Check if a specific logging type is enabled
   * 
   * @param type - The logging type
   * @returns Whether the logging type is enabled
   */
  isLoggingEnabled(type: keyof BusinessProfileConfig['logging']): boolean {
    return this.config.logging[type];
  }
  
  /**
   * Merge configurations
   * 
   * @param base - Base configuration
   * @param overrides - Configuration overrides
   * @returns Merged configuration
   */
  private mergeConfig(
    base: BusinessProfileConfig, 
    overrides: Partial<BusinessProfileConfig>
  ): BusinessProfileConfig {
    return {
      apiEndpoint: overrides.apiEndpoint ?? base.apiEndpoint,
      cache: {
        enabled: overrides.cache?.enabled ?? base.cache.enabled,
        defaultTtl: overrides.cache?.defaultTtl ?? base.cache.defaultTtl,
        maxItems: overrides.cache?.maxItems ?? base.cache.maxItems,
        debug: overrides.cache?.debug ?? base.cache.debug
      },
      logging: {
        cacheOperations: overrides.logging?.cacheOperations ?? base.logging.cacheOperations,
        apiRequests: overrides.logging?.apiRequests ?? base.logging.apiRequests,
        validationErrors: overrides.logging?.validationErrors ?? base.logging.validationErrors
      },
      development: {
        useFallbacks: overrides.development?.useFallbacks ?? base.development.useFallbacks,
        detailedErrors: overrides.development?.detailedErrors ?? base.development.detailedErrors
      }
    };
  }
}

// Create and export a default instance
const configService = new BusinessProfileConfigService();
export default configService;
