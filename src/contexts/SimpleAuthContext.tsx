import React, { useState, useEffect, createContext, useContext } from 'react';
import { UserRole } from '../types';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/config';

// Interface for our local user representation (compatible with existing code)
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified?: boolean;
  isActive?: boolean;
  phoneNumber?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  businessId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthContextState {
  user: User | null;
  isLoading: boolean;
  loading: boolean; // Alias for backward compatibility
  token: string | null;
  error: string | null;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<User | null>;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

// Create the context
const SimpleAuthContext = createContext<AuthContextState | undefined>(undefined);

// Hook to use the auth context - DEPRECATED: Use ../hooks/useAuth instead
// This export is kept for backward compatibility but should not be used directly
export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};

// Legacy export for backward compatibility - DO NOT USE DIRECTLY
export const useAuth = useSimpleAuth;

// Simplified Provider component without Convex calls
export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Try sessionStorage first (for session persistence during development/hot reloads)
        let storedToken = sessionStorage.getItem(AUTH_TOKEN_KEY);
        let storedUser = sessionStorage.getItem(AUTH_USER_KEY);
        
        console.log('[SimpleAuthProvider] Checking for stored auth data in sessionStorage');
        
        // Fall back to localStorage if not found in sessionStorage
        if (!storedToken || !storedUser) {
          console.log('[SimpleAuthProvider] Falling back to localStorage');
          storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
          storedUser = localStorage.getItem(AUTH_USER_KEY);
          
          // If found in localStorage, also set in sessionStorage for hot reload persistence
          if (storedToken && storedUser) {
            console.log('[SimpleAuthProvider] Copying auth data from localStorage to sessionStorage');
            sessionStorage.setItem(AUTH_TOKEN_KEY, storedToken);
            sessionStorage.setItem(AUTH_USER_KEY, storedUser);
          }
        }
        
        if (storedToken && storedUser) {
          try {
            const storedData = JSON.parse(storedUser);
            console.log('[SimpleAuthProvider] Initializing user from storage:', storedData);
            
            // Handle both direct user data and nested profile structure
            let parsedUser;
            if (storedData.profile) {
              console.log('[SimpleAuthProvider] Found nested profile structure');
              parsedUser = storedData.profile;
            } else {
              console.log('[SimpleAuthProvider] Found direct user structure');
              parsedUser = storedData;
            }
            
            // Check if this is a @jaxsaver.com email - automatically make them SUPER_ADMIN
            const ADMIN_DOMAIN = 'jaxsaver.com';
            const isJaxSaverEmail = parsedUser.email?.endsWith(`@${ADMIN_DOMAIN}`);
            
            if (isJaxSaverEmail) {
              console.log('[SimpleAuthProvider] JaxSaver domain email detected on init, setting SUPER_ADMIN role:', parsedUser.email);
              parsedUser.role = UserRole.SUPER_ADMIN;
            } else {
              // Verify the role is a valid UserRole enum value
              const isValidRole = Object.values(UserRole).includes(parsedUser.role);
              if (!isValidRole) {
                console.warn('[SimpleAuthProvider] Invalid role detected:', parsedUser.role);
                
                // Try to normalize the role string to a valid enum value
                const roleLower = parsedUser.role?.toString().toLowerCase();
                if (roleLower === 'user') {
                  parsedUser.role = UserRole.USER;
                } else if (roleLower === 'business') {
                  parsedUser.role = UserRole.BUSINESS;
                } else if (roleLower === 'admin') {
                  parsedUser.role = UserRole.ADMIN;
                } else if (roleLower === 'super_admin') {
                  parsedUser.role = UserRole.SUPER_ADMIN;
                } else {
                  console.error('[SimpleAuthProvider] Invalid role for business application:', parsedUser.role);
                  // Clear invalid auth data since this is a business-only app
                  localStorage.removeItem(AUTH_TOKEN_KEY);
                  localStorage.removeItem(AUTH_USER_KEY);
                  sessionStorage.removeItem(AUTH_TOKEN_KEY);
                  sessionStorage.removeItem(AUTH_USER_KEY);
                  setUser(null);
                  setIsLoading(false);
                  return;
                }
              }
            }
            
            // Business-only validation: Only allow BUSINESS, ADMIN, and SUPER_ADMIN roles
            if (parsedUser.role !== UserRole.BUSINESS && 
                parsedUser.role !== UserRole.ADMIN && 
                parsedUser.role !== UserRole.SUPER_ADMIN) {
              console.error('[SimpleAuthProvider] Access denied: Web-business is for business users only. User role:', parsedUser.role);
              // Clear non-business user auth data
              localStorage.removeItem(AUTH_TOKEN_KEY);
              localStorage.removeItem(AUTH_USER_KEY);
              sessionStorage.removeItem(AUTH_TOKEN_KEY);
              sessionStorage.removeItem(AUTH_USER_KEY);
              setUser(null);
              setToken(null);
              setError('Access denied: This application is for business users only.');
              setIsLoading(false);
              return;
            }
            
            // Convert date strings to Date objects for User type compatibility
            const validUser = {
              ...parsedUser,
              businessId: parsedUser?.businessId || parsedUser?.business_id || parsedUser?._id, // Check _id as fallback
              isActive: parsedUser.isActive ?? true,
              createdAt: parsedUser.createdAt ? new Date(parsedUser.createdAt) : new Date(),
              updatedAt: parsedUser.updatedAt ? new Date(parsedUser.updatedAt) : new Date()
            };
            
            console.log('[SimpleAuthProvider] Final businessId:', validUser.businessId);
            
            setUser(validUser as User);
            setToken(storedToken);
            
            console.log('[SimpleAuthProvider] Business user authenticated from storage.');
          } catch (parseError) {
            console.error('[SimpleAuthProvider] Error parsing stored user data:', parseError);
            // Clear invalid stored data
            localStorage.removeItem(AUTH_USER_KEY);
            sessionStorage.removeItem(AUTH_USER_KEY);
            setUser(null);
          }
        } else {
          console.log('[SimpleAuthProvider] No stored authentication data found.');
          setUser(null);
        }
      } catch (err) {
        console.error('Error during auth initialization:', err);
        if (err instanceof SyntaxError) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_USER_KEY);
          sessionStorage.removeItem(AUTH_TOKEN_KEY);
          sessionStorage.removeItem(AUTH_USER_KEY);
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Login function - store token and user data
  const login = async (authData: AuthResponse) => {
    // Normalize the role to match enum values
    const normalizedUser = { 
      ...authData.user,
      // Ensure businessId is set (from businessId, business_id, or id fields)
      businessId: authData.user.businessId || (authData.user as any).business_id || authData.user.id
    };
    const roleLower = normalizedUser.role?.toString().toLowerCase();
    
    // Check if this is a @jaxsaver.com email - automatically make them SUPER_ADMIN
    const ADMIN_DOMAIN = 'jaxsaver.com';
    const isJaxSaverEmail = normalizedUser.email?.endsWith(`@${ADMIN_DOMAIN}`);
    
    if (isJaxSaverEmail) {
      console.log('[SimpleAuthProvider] JaxSaver domain email detected, setting SUPER_ADMIN role:', normalizedUser.email);
      normalizedUser.role = UserRole.SUPER_ADMIN;
    } else {
      // Normal role normalization for non-JaxSaver emails
      if (roleLower === 'business') {
        normalizedUser.role = UserRole.BUSINESS;
      } else if (roleLower === 'admin') {
        normalizedUser.role = UserRole.ADMIN;
      } else if (roleLower === 'user') {
        normalizedUser.role = UserRole.USER;
      } else if (roleLower === 'super_admin') {
        normalizedUser.role = UserRole.SUPER_ADMIN;
      }
    }
    
    // Business-only validation: Only allow BUSINESS, ADMIN, and SUPER_ADMIN roles
    if (normalizedUser.role !== UserRole.BUSINESS && 
        normalizedUser.role !== UserRole.ADMIN && 
        normalizedUser.role !== UserRole.SUPER_ADMIN) {
      console.error('[SimpleAuthProvider] Login denied: Web-business is for business users only. User role:', authData.user.role);
      setError('Access denied: This application is for business users only.');
      return;
    }
    
    // Update authData with normalized user
    const normalizedAuthData = { ...authData, user: normalizedUser };

    // Store in both localStorage (for persistence) and sessionStorage (for hot reload persistence)
    localStorage.setItem(AUTH_TOKEN_KEY, normalizedAuthData.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalizedAuthData.user));
    sessionStorage.setItem(AUTH_TOKEN_KEY, normalizedAuthData.token);
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalizedAuthData.user));

    // Set the user state with the normalized user object
    setUser(normalizedAuthData.user);
    setToken(normalizedAuthData.token);
    console.log('[SimpleAuthProvider] Business user logged in successfully:', normalizedAuthData.user);
    
    // Auto-sync subscription from Stripe after login (skip for SUPER_ADMIN)
    if (normalizedAuthData.user.role !== UserRole.SUPER_ADMIN && 
        (normalizedAuthData.user.businessId || normalizedAuthData.user.id)) {
      try {
        const businessId = normalizedAuthData.user.businessId || normalizedAuthData.user.id;
        // Dynamic import to avoid circular dependencies
        const { api } = await import('../../convex/_generated/api');
        const { BusinessService } = await import('../services/business/BusinessService');
        const convexClient = BusinessService.getInstance().getConvexClient();
        
        if (convexClient) {
          await convexClient.action(api.subscriptions.syncBusinessSubscriptionFromStripe, { businessId });
          console.log('[SimpleAuthProvider] Auto-synced subscription for business:', businessId);
        }
      } catch (error) {
        console.log('[SimpleAuthProvider] Auto-sync failed (non-critical):', error);
      }
    } else if (normalizedAuthData.user.role === UserRole.SUPER_ADMIN) {
      console.log('[SimpleAuthProvider] Skipping subscription sync for SUPER_ADMIN user');
    }
  };

  // Logout function - clear stored data
  const logout = () => {
    try {
      console.log('[SimpleAuthProvider] Logging out user');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear storage and state
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(AUTH_USER_KEY);
      setUser(null);
      setToken(null);
    }
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      // Update in both storage locations
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
    }
  };

  // Refresh user data (simplified version without Convex calls)
  const refreshUser = async (): Promise<User | null> => {
    console.log('[SimpleAuthProvider] refreshUser called - simplified version without Convex');
    return user;
  };

  // Check if user has specified role(s)
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  };

  // Context value
  const contextValue: AuthContextState = {
    user,
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    token,
    error,
    login,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: !!user,
    hasRole,
  };

  return (
    <SimpleAuthContext.Provider value={contextValue}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

export default SimpleAuthProvider;