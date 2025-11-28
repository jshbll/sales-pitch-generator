import { ConvexClientManager } from '@jaxsaver/shared/convex-client';
import { createConvexAPI } from '@jaxsaver/shared/convex-client/convex-api';
import { UserRole } from '@jaxsaver/shared/types';
import { ApiResponse } from '../types';
import { AUTH_USER_KEY, AUTH_TOKEN_KEY } from '../utils/config';
import type { User, AuthResponse, LoginCredentials } from '../contexts/ConvexAuthContext';
import type { User as ConvexUser } from '@jaxsaver/shared/convex-client/convex-api';
import { Id } from '../../../../convex/_generated/dataModel';

// We'll still use the legacy API for authentication for now
// but will store/sync data with Convex afterward
import apiService from './api';

/**
 * Helper function to create a properly typed error response
 */
function createErrorResponse<T>(error?: string): ApiResponse<T> {
  return {
    success: false,
    error: error || 'An error occurred'
  };
}

/**
 * Convert legacy API user to Convex user format
 */
function convertToConvexUser(legacyUser: any): Omit<ConvexUser, '_id' | 'created_at' | 'updated_at'> {
  return {
    email: legacyUser.email,
    first_name: legacyUser.firstName || legacyUser.first_name,
    last_name: legacyUser.lastName || legacyUser.last_name,
    role: legacyUser.role as 'admin' | 'business' | 'user',
    phone: legacyUser.phoneNumber || legacyUser.phone_number,
    profile_image_url: legacyUser.profileImageUrl,
    profile_image_id: legacyUser.profileImageId,
    tier: legacyUser.tier as 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | undefined,
    is_active: legacyUser.isActive ?? true,
    email_verified: legacyUser.emailVerified ?? false,
  };
}

/**
 * Convert Convex user to local User interface
 */
function convertFromConvexUser(convexUser: ConvexUser): User {
  return {
    id: convexUser._id,
    email: convexUser.email,
    firstName: convexUser.first_name,
    lastName: convexUser.last_name,
    role: convexUser.role as UserRole,
    emailVerified: convexUser.email_verified,
    isActive: convexUser.is_active,
    phoneNumber: convexUser.phone,
    createdAt: convexUser.created_at ? new Date(convexUser.created_at) : undefined,
    updatedAt: convexUser.updated_at ? new Date(convexUser.updated_at) : undefined,
  };
}

/**
 * Convex-enhanced authentication service
 * This service uses the legacy API for authentication but syncs data with Convex
 */
class ConvexAuthService {
  private api: ReturnType<typeof createConvexAPI>;

  constructor() {
    const convexClient = ConvexClientManager.getInstance();
    this.api = createConvexAPI(convexClient);
  }

  /**
   * Login a user with email and password
   * Uses legacy API for authentication, then syncs with Convex
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    console.log('[ConvexAuthService] Login credentials:', credentials);
    
    try {
      // First, authenticate with the legacy API
      const legacyResponse = await this.authenticateWithLegacyAPI(credentials);
      
      if (!legacyResponse.success || !legacyResponse.data) {
        return legacyResponse;
      }

      const { token, user: legacyUser } = legacyResponse.data;

      // Check if user exists in Convex
      let convexUser = await this.api.getUserByEmail(legacyUser.email);
      
      if (!convexUser) {
        // Create user in Convex if they don't exist
        console.log('[ConvexAuthService] User not found in Convex, creating...');
        try {
          const newConvexUser = convertToConvexUser(legacyUser);
          const createdUserId = await this.api.createUser(newConvexUser);
          
          // Fetch the created user to get full data
          if (createdUserId) {
            // Note: We'd need to implement a getUser method that takes ID
            // For now, we'll fetch by email again
            convexUser = await this.api.getUserByEmail(legacyUser.email);
          }
        } catch (createError) {
          console.error('[ConvexAuthService] Error creating user in Convex:', createError);
          // Continue with legacy user data if Convex creation fails
        }
      } else {
        // Update user in Convex with any new data from legacy API
        console.log('[ConvexAuthService] Updating existing Convex user...');
        try {
          const updates = convertToConvexUser(legacyUser);
          await this.api.updateUser(convexUser._id as Id<"users">, updates);
          
          // Fetch updated user
          convexUser = await this.api.getUserByEmail(legacyUser.email);
        } catch (updateError) {
          console.error('[ConvexAuthService] Error updating user in Convex:', updateError);
          // Continue with existing Convex user data
        }
      }

      // Convert Convex user back to local format (preferred over legacy)
      const finalUser = convexUser ? convertFromConvexUser(convexUser) : legacyUser;
      
      // If user is business, try to get business data and set businessId
      if (finalUser.role === UserRole.BUSINESS && convexUser) {
        try {
          const business = await this.api.getBusinessByOwner(convexUser._id as Id<"users">);
          if (business) {
            finalUser.businessId = business._id;
            console.log('[ConvexAuthService] Found business ID for user:', business._id);
          }
        } catch (businessError) {
          console.warn('[ConvexAuthService] Could not fetch business data:', businessError);
        }
      }

      const authResponse: AuthResponse = {
        token,
        user: finalUser
      };
      
      // Persist authentication data
      sessionStorage.setItem(AUTH_TOKEN_KEY, authResponse.token);
      localStorage.setItem(AUTH_TOKEN_KEY, authResponse.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(finalUser));
      
      console.log('[ConvexAuthService] Login successful:', finalUser.email);
      return {
        success: true,
        data: authResponse
      };
    } catch (error) {
      console.error('[ConvexAuthService] Unexpected error during login:', error);
      return createErrorResponse<AuthResponse>('Unexpected error during login: ' + 
        (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Authenticate with the legacy API (unchanged from original authService)
   */
  private async authenticateWithLegacyAPI(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    // Define the expected response type based on actual API response
    type ApiLoginResponse = {
      status: string;
      message: string;
      data: {
        user: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: string;
          email_verified: boolean;
          phone_number?: string;
          created_at: string;
          updated_at: string;
          businessId?: string;
          is_active: boolean;
        };
        token: string;
        emailVerified: boolean;
      };
    }
    
    const response = await apiService.post<ApiLoginResponse>('/auth/login', credentials, false);
    console.log('[ConvexAuthService] Raw legacy API response:', response);
    
    // Define the expected user data type
    type UserDataType = {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      role: string;
      email_verified: boolean;
      is_active?: boolean;
      phone_number?: string | null;
      created_at: string;
      updated_at: string;
      businessId?: string;
    };
    
    let userData: UserDataType | null = null;
    let token: string | null = null;
    
    console.log('[ConvexAuthService] Raw response data:', JSON.stringify(response.data));
    
    // Check if data is in direct format (response.data.user)
    if (response.data && typeof response.data === 'object' && 'user' in response.data && 'token' in response.data) {
      console.log('[ConvexAuthService] Found user data in direct response structure');
      userData = response.data.user as UserDataType;
      token = response.data.token as string;
    }
    // Check if data is in nested format (response.data.data.user)
    else if (response.data?.data?.user) {
      console.log('[ConvexAuthService] Found user data in nested response structure');
      userData = response.data.data.user as UserDataType;
      token = response.data.data.token as string;
    }
    // No user data found in either format
    else {
      console.error('[ConvexAuthService] Login response missing user data in both structures');
      return {
        success: false,
        error: 'Invalid response format from server'
      };
    }
    
    // Transform user data to match our User interface
    const transformedUser: User = {
      id: userData.id,
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name,
      role: userData.role as UserRole,
      emailVerified: userData.email_verified || false,
      isActive: userData.is_active !== false, // Default to true if not specified
      phoneNumber: userData.phone_number || undefined,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
      businessId: userData.businessId || undefined,
    };
    
    const authResponse: AuthResponse = {
      token: token,
      user: transformedUser
    };
    
    return {
      success: true,
      data: authResponse
    };
  }

  /**
   * Register a new user
   * Uses legacy API for registration, then creates user in Convex
   */
  async registerUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse<AuthResponse>> {
    // Use legacy API for registration first
    const backendData = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: UserRole.USER
    };
    
    console.log('[ConvexAuthService] Registering user with legacy API:', {
      ...backendData,
      password: '[REDACTED]'
    });
    
    interface ApiRegisterResponse {
      status: string;
      message: string;
      user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        phone_number: string | null;
        role: string;
        created_at: string;
        updated_at: string;
        is_active: boolean;
        email_verified: boolean;
        email_verified_at: string | null;
        failed_login_attempts: number;
        account_locked_until: string | null;
        password_reset_required: boolean;
        last_password_change: string | null;
      };
      token: string;
      verificationToken?: string;
    }
    
    const response = await apiService.post<ApiRegisterResponse>('/auth/register', backendData, false);
    
    if (response.success && response.data) {
      // Transform the backend response to match frontend expected structure
      const transformedUser: User = {
        id: response.data.user.id,
        email: response.data.user.email,
        firstName: response.data.user.first_name,
        lastName: response.data.user.last_name,
        role: response.data.user.role as UserRole,
        emailVerified: response.data.user.email_verified || false,
        isActive: response.data.user.is_active !== false,
        phoneNumber: response.data.user.phone_number || undefined,
        createdAt: response.data.user.created_at,
        updatedAt: response.data.user.updated_at,
      };

      // Create user in Convex
      try {
        const convexUserData = convertToConvexUser(transformedUser);
        await this.api.createUser(convexUserData);
        console.log('[ConvexAuthService] User created in Convex successfully');
      } catch (convexError) {
        console.warn('[ConvexAuthService] Could not create user in Convex:', convexError);
        // Continue with registration success even if Convex fails
      }
      
      return {
        success: true,
        data: {
          token: response.data.token,
          user: transformedUser
        }
      };
    }
    
    return createErrorResponse<AuthResponse>(response.error);
  }

  /**
   * Register a new business advertiser
   */
  async registerAdvertiser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    businessName: string,
  }): Promise<ApiResponse<AuthResponse>> {
    // Map frontend names to backend expected names
    const backendData = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      business_name: userData.businessName,
      role: UserRole.BUSINESS,
    };

    interface ApiUser { 
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone_number: string | null;
      role: string;
      created_at: string;
      updated_at: string;
      is_active: boolean;
      email_verified: boolean;
      email_verified_at: string | null;
    }

    interface RegisterApiResponseData {
      user: ApiUser;
      token: string;
    }

    const response = await apiService.post<RegisterApiResponseData>('/auth/register', backendData, false);
    
    if (response.success && response.data) {
      // Transform the backend response to match frontend expected structure
      const transformedUser: User = {
        id: response.data.user.id,
        email: response.data.user.email,
        firstName: response.data.user.first_name,
        lastName: response.data.user.last_name,
        role: response.data.user.role as UserRole,
        emailVerified: response.data.user.email_verified || false,
        isActive: response.data.user.is_active !== false,
        phoneNumber: response.data.user.phone_number || undefined, 
        createdAt: response.data.user.created_at,
        updatedAt: response.data.user.updated_at,
      };

      // Create user in Convex
      try {
        const convexUserData = convertToConvexUser(transformedUser);
        await this.api.createUser(convexUserData);
        console.log('[ConvexAuthService] Business user created in Convex successfully');
      } catch (convexError) {
        console.warn('[ConvexAuthService] Could not create business user in Convex:', convexError);
        // Continue with registration success even if Convex fails
      }
      
      return {
        success: true,
        data: {
          token: response.data.token,
          user: transformedUser
        }
      };
    }
    
    return createErrorResponse<AuthResponse>(response.error);
  }

  /**
   * Update user profile (uses Convex)
   */
  async updateProfile(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const convexUserData = convertToConvexUser(userData);
      await this.api.updateUser(userId as Id<"users">, convexUserData);
      
      // Fetch updated user from Convex
      const updatedUser = await this.api.getUserByEmail(userData.email || '');
      if (updatedUser) {
        return {
          success: true,
          data: convertFromConvexUser(updatedUser)
        };
      } else {
        return createErrorResponse<User>('Failed to fetch updated user');
      }
    } catch (error) {
      console.error('[ConvexAuthService] Error updating profile:', error);
      return createErrorResponse<User>(error instanceof Error ? error.message : 'Update failed');
    }
  }

  /**
   * Get current user profile (uses Convex)
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const userDataString = localStorage.getItem(AUTH_USER_KEY);
      if (!userDataString) {
        return createErrorResponse<User>('No user data found');
      }

      const storedUser = JSON.parse(userDataString) as User;
      const convexUser = await this.api.getUserByEmail(storedUser.email);
      
      if (convexUser) {
        const userData = convertFromConvexUser(convexUser);
        
        // If user is business, get business data
        if (userData.role === UserRole.BUSINESS) {
          try {
            const business = await this.api.getBusinessByOwner(convexUser._id as Id<"users">);
            if (business) {
              userData.businessId = business._id;
            }
          } catch (businessError) {
            console.warn('[ConvexAuthService] Could not fetch business data:', businessError);
          }
        }

        return {
          success: true,
          data: userData
        };
      } else {
        return createErrorResponse<User>('User not found');
      }
    } catch (error) {
      console.error('[ConvexAuthService] Error getting current user:', error);
      return createErrorResponse<User>(error instanceof Error ? error.message : 'Get user failed');
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
          console.warn('[ConvexAuthService] User data in localStorage missing role:', user);
          return null;
        }

        console.log('[ConvexAuthService] User found in localStorage:', user.id, user.role);
        return user;
      } else {
        console.warn('[ConvexAuthService] Invalid user data structure in localStorage:', parsedData);
        return null;
      }
    } catch (parseError) {
      console.error('[ConvexAuthService] Error parsing user data from localStorage:', parseError);
      return null;
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<ApiResponse<{ success: boolean }>> {
    // For Convex, logout is handled client-side by clearing local storage
    // We might still want to call the legacy API logout for session cleanup
    try {
      await apiService.post<{ success: boolean }>('/auth/logout', {});
    } catch (error) {
      console.warn('[ConvexAuthService] Legacy logout failed:', error);
    }
    
    return {
      success: true,
      data: { success: true }
    };
  }

  /**
   * Legacy API methods (proxied to original apiService for now)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiService.post<{ success: boolean }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async requestPasswordReset(email: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiService.post<{ success: boolean }>(
      '/auth/reset-password-request',
      { email },
      false
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiService.post<{ success: boolean }>(
      '/auth/reset-password',
      { token, newPassword },
      false
    );
  }
  
  async verifyEmail(token: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiService.post<{ success: boolean }>(
      '/auth/verify-email',
      { token },
      false
    );
  }
  
  // Removed resendVerificationEmail - now handled by Clerk
  
  async requestVerificationEmail(email: string): Promise<ApiResponse<{ success: boolean }>> {
    // Legacy method - email verification now handled by Clerk
    return { success: false, data: { success: false }, error: 'Email verification is now handled by Clerk' };
  }
}

// Create and export a singleton instance
export const convexAuthService = new ConvexAuthService();

export default convexAuthService;