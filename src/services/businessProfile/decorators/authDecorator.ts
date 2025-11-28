/**
 * Authentication Decorator
 * 
 * Provides decorators for handling authentication and authorization
 * in business profile service methods.
 */
import { User, UserRole } from '../../../types/user';
import { ApiResponse } from '../../../types';
import { ErrorCategory } from '../../../utils/errorHandling/errorTypes';

/**
 * Authentication decorator options
 */
export interface AuthOptions {
  requireBusinessRole?: boolean;
  allowAdmin?: boolean;
  developmentFallback?: boolean;
}

/**
 * Type for method with user authentication
 */
export type AuthenticatedMethod<T> = (user: User | null, ...args: unknown[]) => Promise<ApiResponse<T>>;

/**
 * Helper function to create a typed error response
 */
function createAuthErrorResponse<T>(message: string, category: ErrorCategory, extraProps: Record<string, boolean> = {}): ApiResponse<T> {
  return {
    success: false,
    error: message,
    errorCategory: category,
    ...extraProps
  } as ApiResponse<T>;
}

/**
 * Decorator for requiring authentication
 * 
 * @param options - Authentication options
 * @returns A properly typed method decorator
 */
export function requireAuth<T>(options: AuthOptions = {}): MethodDecorator {
  const {
    requireBusinessRole = false,
    allowAdmin = true,
    developmentFallback = false
  } = options;
  
  // Use a type assertion to make TypeScript happy with our implementation
  return function(
    _target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> {
    const originalMethod = descriptor.value as AuthenticatedMethod<T>;
    if (!originalMethod) {
      console.error(`[AuthDecorator] Method ${String(propertyKey)} is undefined`);
      return descriptor;
    }
    
    descriptor.value = async function(user: User | null, ...args: unknown[]): Promise<ApiResponse<T>> {
      // If no user is provided, return an error
      if (!user) {
        console.log('[AuthDecorator] No authenticated user found');
        
        if (developmentFallback && process.env.NODE_ENV === 'development') {
          console.log('[AuthDecorator] Using DEVELOPMENT fallback');
          return originalMethod.apply(this, [user, ...args]);
        }
        
        return createAuthErrorResponse<T>('Authentication required', ErrorCategory.AUTHENTICATION, { requiresLogin: true });
      }
      
      // Check if user has required role
      if (requireBusinessRole && user.role !== UserRole.BUSINESS && (!allowAdmin || user.role !== UserRole.ADMIN)) {
        return createAuthErrorResponse<T>('Business role required', ErrorCategory.AUTHORIZATION, { requiresBusinessRole: true });
      }
      
      // Call the original method
      return originalMethod.apply(this, [user, ...args]);
    };
    
    return descriptor;
  } as MethodDecorator;
}

/**
 * Decorator for requiring admin role
 * 
 * @returns A properly typed method decorator
 */
export function requireAdmin<T>(): MethodDecorator {
  // Use a type assertion to make TypeScript happy with our implementation
  return function(
    _target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> {
    const originalMethod = descriptor.value as AuthenticatedMethod<T>;
    if (!originalMethod) {
      console.error(`[AdminDecorator] Method ${String(propertyKey)} is undefined`);
      return descriptor;
    }
    
    descriptor.value = async function(user: User | null, ...args: unknown[]): Promise<ApiResponse<T>> {
      // If no user is provided, return an error
      if (!user) {
        return createAuthErrorResponse<T>('Authentication required', ErrorCategory.AUTHENTICATION, { requiresLogin: true });
      }
      
      // Check if user has admin role
      if (user.role !== UserRole.ADMIN) {
        return createAuthErrorResponse<T>('Admin role required', ErrorCategory.AUTHORIZATION, { requiresAdminRole: true });
      }
      
      // Call the original method
      return originalMethod.apply(this, [user, ...args]);
    };
    
    return descriptor;
  } as MethodDecorator;
}
