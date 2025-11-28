import { ConvexClientManager } from '../shared/convex-client';
import { ApiResponse } from '../types';
import { AUTH_USER_KEY, AUTH_TOKEN_KEY } from '../utils/config';
import type { User, AuthResponse, LoginCredentials } from '../contexts/ConvexAuthContext';
import { UserRole } from '../types';
import { api } from '../../convex/_generated/api';

/**
 * Pure Convex authentication service
 * This service uses only Convex for authentication, no legacy API
 */
class PureConvexAuthService {
  private convexClient: any = null;

  constructor() {
    // Don't initialize here - do it lazily in getClient()
  }

  private getClient() {
    if (!this.convexClient) {
      this.convexClient = ConvexClientManager.getInstance();
    }
    return this.convexClient;
  }

  /**
   * Login a user with email and password using pure Convex
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    console.log('[PureConvexAuthService] Login credentials:', credentials);
    
    try {
      // Use Convex auth.login action
      const response = await this.getClient().action(api.auth.login, {
        email: credentials.email,
        password: credentials.password,
      });

      console.log('[PureConvexAuthService] Convex auth response:', response);

      if (!response.success) {
        return {
          success: false,
          error: response.error || 'Login failed'
        };
      }

      const { token, user } = response.data;

      // Transform Convex user to local User format
      const transformedUser: User = {
        id: user._id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role as UserRole,
        emailVerified: user.email_verified || false,
        isActive: user.is_active || true,
        phoneNumber: user.phone,
        createdAt: user._creationTime ? new Date(user._creationTime) : undefined,
        updatedAt: user.updated_at ? new Date(user.updated_at) : undefined,
      };

      // If user is business, try to get business data
      if (transformedUser.role === UserRole.BUSINESS) {
        try {
          const business = await this.getClient().query(api.businesses.getBusinessByOwner, { 
            ownerId: user._id 
          });
          if (business) {
            transformedUser.businessId = business._id;
            console.log('[PureConvexAuthService] Found business ID for user:', business._id);
          }
        } catch (businessError) {
          console.warn('[PureConvexAuthService] Could not fetch business data:', businessError);
        }
      }

      const authResponse: AuthResponse = {
        token,
        user: transformedUser
      };
      
      // Persist authentication data
      sessionStorage.setItem(AUTH_TOKEN_KEY, authResponse.token);
      localStorage.setItem(AUTH_TOKEN_KEY, authResponse.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(transformedUser));
      
      console.log('[PureConvexAuthService] Login successful:', transformedUser.email);
      return {
        success: true,
        data: authResponse
      };
    } catch (error) {
      console.error('[PureConvexAuthService] Unexpected error during login:', error);
      return {
        success: false,
        error: 'Unexpected error during login: ' + 
          (error instanceof Error ? error.message : String(error))
      };
    }
  }

  /**
   * Register a new user using pure Convex
   */
  async registerUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse<AuthResponse>> {
    console.log('[PureConvexAuthService] Registering user:', {
      ...userData,
      password: '[REDACTED]'
    });
    
    try {
      const response = await this.getClient().action(api.auth.register, {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'user',
      });

      if (!response.success) {
        return {
          success: false,
          error: response.error || 'Registration failed'
        };
      }

      const { token, user } = response.data;

      // Transform the user to local format
      const transformedUser: User = {
        id: user._id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role as UserRole,
        emailVerified: user.email_verified || false,
        isActive: user.is_active || true,
        phoneNumber: user.phone,
        createdAt: user._creationTime ? new Date(user._creationTime) : undefined,
        updatedAt: user.updated_at ? new Date(user.updated_at) : undefined,
      };
      
      return {
        success: true,
        data: {
          token,
          user: transformedUser
        }
      };
    } catch (error) {
      console.error('[PureConvexAuthService] Registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * Register a new business advertiser using pure Convex
   */
  async registerAdvertiser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    businessName: string,
  }): Promise<ApiResponse<AuthResponse>> {
    console.log('[PureConvexAuthService] Registering business user:', {
      ...userData,
      password: '[REDACTED]'
    });

    try {
      const response = await this.getClient().action(api.auth.register, {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'business',
      });

      if (!response.success) {
        return {
          success: false,
          error: response.error || 'Registration failed'
        };
      }

      const { token, user } = response.data;

      // Transform the user to local format
      const transformedUser: User = {
        id: user._id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role as UserRole,
        emailVerified: user.email_verified || false,
        isActive: user.is_active || true,
        phoneNumber: user.phone,
        createdAt: user._creationTime ? new Date(user._creationTime) : undefined,
        updatedAt: user.updated_at ? new Date(user.updated_at) : undefined,
      };
      
      return {
        success: true,
        data: {
          token,
          user: transformedUser
        }
      };
    } catch (error) {
      console.error('[PureConvexAuthService] Business registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * Get current user profile synchronously from localStorage
   */
  getCurrentUserSync(): User | null {
    const userDataString = localStorage.getItem(AUTH_USER_KEY);
    if (!userDataString) return null;

    try {
      const parsedData = JSON.parse(userDataString);

      if (parsedData && typeof parsedData === 'object' && parsedData.id && typeof parsedData.id === 'string') {
        const user: User = parsedData as User;

        if (!user.role) {
          console.warn('[PureConvexAuthService] User data in localStorage missing role:', user);
          return null;
        }

        console.log('[PureConvexAuthService] User found in localStorage:', user.id, user.role);
        return user;
      } else {
        console.warn('[PureConvexAuthService] Invalid user data structure in localStorage:', parsedData);
        return null;
      }
    } catch (parseError) {
      console.error('[PureConvexAuthService] Error parsing user data from localStorage:', parseError);
      return null;
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<ApiResponse<{ success: boolean }>> {
    // Clear local storage
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    
    return {
      success: true,
      data: { success: true }
    };
  }

  // Placeholder methods for compatibility (not implemented with pure Convex yet)
  async changePassword(_currentPassword: string, _newPassword: string): Promise<ApiResponse<{ success: boolean }>> {
    return {
      success: false,
      error: 'Change password not implemented with pure Convex yet'
    };
  }

  async requestPasswordReset(_email: string): Promise<ApiResponse<{ success: boolean }>> {
    return {
      success: false,
      error: 'Password reset not implemented with pure Convex yet'
    };
  }

  async resetPassword(_token: string, _newPassword: string): Promise<ApiResponse<{ success: boolean }>> {
    return {
      success: false,
      error: 'Password reset not implemented with pure Convex yet'
    };
  }
  
  async verifyEmail(_token: string): Promise<ApiResponse<{ success: boolean }>> {
    return {
      success: false,
      error: 'Email verification not implemented with pure Convex yet'
    };
  }
  
  // Removed resendVerificationEmail - now handled by Clerk
  
  async requestVerificationEmail(_email: string): Promise<ApiResponse<{ success: boolean }>> {
    return {
      success: false,
      error: 'Email verification not implemented with pure Convex yet'
    };
  }
}

// Create and export a singleton instance
export const pureConvexAuthService = new PureConvexAuthService();

export default pureConvexAuthService;