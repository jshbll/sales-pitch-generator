/**
 * Business Profile Service Module
 * 
 * Exports all components of the refactored business profile service.
 * This module follows the Facade Pattern by providing a simplified interface
 * to the complex subsystem of business profile components.
 */

// Export service interfaces
export * from './interfaces/businessProfileService.interface';

// Export the main service
export { default as businessProfileService } from './businessProfileService';
export { BusinessProfileService } from './businessProfileService';

// Export repository
export { BusinessProfileRepository } from './repositories/businessProfileRepository';
export {
  ApiBusinessProfileRepository,
  BusinessProfileRepositoryFactory
} from './repository/businessProfileRepository';
export type { IBusinessProfileRepository } from './repository/businessProfileRepository';

// Export configuration
export { default as configService } from './config/configService';
export { BusinessProfileConfigService } from './config/configService';
export type { BusinessProfileConfig } from './config/configService';

// Export decorators
export * from './decorators/authDecorator';

// Export utilities
export * from './utils/apiUtils';
export * from './utils/validationUtils';
export * from './utils/errorUtils';
export { default as logger } from './utils/loggerService';
export { BusinessProfileLoggerService, LogLevel } from './utils/loggerService';
export type { LogContext } from './utils/loggerService';

// Export cache service
export { default as businessProfileCacheService } from './cache/cacheService';
export type { BusinessProfileCacheService, CacheConfig } from './cache/cacheService';
