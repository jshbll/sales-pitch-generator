// Service Selector - Convex-only services
// All legacy PostgreSQL services have been removed

// Convex services (now the only option)
import convexPromotionService from './convexPromotionService';
import convexBusinessService from './convexBusinessService';
import pureConvexAuthService from './pureConvexAuthService';
import convexEventService from './convexEventService';
import convexBusinessPhotosService from './convexBusinessPhotosService';

// Direct export of Convex services
export const promotionService = convexPromotionService;
export const businessService = convexBusinessService;
export const authService = pureConvexAuthService;
export const eventService = convexEventService;
export const businessPhotosService = convexBusinessPhotosService;

// Export individual services for specific use cases
export {
  convexPromotionService,
  convexBusinessService,
  pureConvexAuthService,
  convexEventService,
  convexBusinessPhotosService,
};