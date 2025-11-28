import React, { useState, useEffect } from 'react';
import { AuthResponse, User, UserRole } from '../types';
import { authService } from '../services/serviceSelector';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/config';
import { AuthContext, AuthContextState } from './AuthContextDefinition'; // Only import Context and State type
import { getDefaultRoute } from '../utils/routeUtils'; // Import helper function
import { ConvexClientManager } from '../shared/convex-client';
import { api } from '../../convex/_generated/api';

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Renamed state
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Function to handle errors
  const setAuthError = (err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    setError(errorMessage);
    console.error('Auth error:', err);
  };

  // Validate business session with Convex
  const validateBusinessSession = async (token: string) => {
    try {
      const convexClient = ConvexClientManager.getInstance();
      const validation = await convexClient.action(api.businessAuth.validateSession, { token });
      
      if (!validation.valid || !validation.business) {
        throw new Error('Invalid business session');
      }
      
      // Update user data with validated business data if needed
      const validatedUser: User = {
        id: validation.business._id,
        email: validation.business.email,
        firstName: validation.business.first_name || '',
        lastName: validation.business.last_name || '',
        role: UserRole.BUSINESS,
        emailVerified: validation.business.email_verified || false,
        isActive: validation.business.is_active !== false,
        businessId: validation.business._id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setUser(validatedUser);
      // Update storage with validated data
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(validatedUser));
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(validatedUser));
      
      console.log('[AuthContext] Business session validated successfully');
    } catch (error) {
      console.error('[AuthContext] Business session validation failed:', error);
      throw error;
    }
  };

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = () => {
      setIsLoading(true); // Use renamed setter
      try {
        // Try sessionStorage first (for session persistence during development/hot reloads)
        let storedToken = sessionStorage.getItem(AUTH_TOKEN_KEY);
        let storedUser = sessionStorage.getItem(AUTH_USER_KEY);
        
        console.log('[AuthContext] Checking for stored auth data in sessionStorage');
        console.log('[AuthContext] sessionStorage token exists:', !!storedToken);
        console.log('[AuthContext] sessionStorage user exists:', !!storedUser);
        
        // Fall back to localStorage if not found in sessionStorage
        if (!storedToken || !storedUser) {
          console.log('[AuthContext] Falling back to localStorage');
          storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
          storedUser = localStorage.getItem(AUTH_USER_KEY);
          
          console.log('[AuthContext] localStorage token exists:', !!storedToken);
          console.log('[AuthContext] localStorage user exists:', !!storedUser);
          
          // If found in localStorage, also set in sessionStorage for hot reload persistence
          if (storedToken && storedUser) {
            console.log('[AuthContext] Copying auth data from localStorage to sessionStorage');
            sessionStorage.setItem(AUTH_TOKEN_KEY, storedToken);
            sessionStorage.setItem(AUTH_USER_KEY, storedUser);
          }
        }
        
        if (storedToken && storedUser) {
          try {
            const storedData = JSON.parse(storedUser);
            console.log('[AuthContext] Initializing user from storage:', storedData);
            
            // Handle both direct user data and nested profile structure
            let parsedUser;
            if (storedData.profile) {
              // Registration response format: { profile: { role, email, etc. } }
              console.log('[AuthContext] Found nested profile structure');
              parsedUser = storedData.profile;
            } else {
              // Login response format: { role, email, etc. }
              console.log('[AuthContext] Found direct user structure');
              parsedUser = storedData;
            }
            
            console.log('[AuthContext] User role from storage:', parsedUser.role);
            console.log('[AuthContext] User businessId from storage:', parsedUser.businessId || parsedUser.business_id);
            
            // Verify the role is a valid UserRole enum value
            const isValidRole = Object.values(UserRole).includes(parsedUser.role);
            console.log('[AuthContext] Is valid UserRole enum value:', isValidRole);
            
            if (!isValidRole) {
              console.warn('[AuthContext] Invalid role detected:', parsedUser.role);
              console.warn('[AuthContext] Valid roles are:', Object.values(UserRole));
              
              // Try to normalize the role string to a valid enum value
              const roleLower = parsedUser.role?.toString().toLowerCase();
              if (roleLower === 'user') {
                parsedUser.role = UserRole.USER;
              } else if (roleLower === 'business') {
                parsedUser.role = UserRole.BUSINESS;
              } else if (roleLower === 'admin') {
                parsedUser.role = UserRole.ADMIN;
              } else {
                // For web-business, invalid roles should not default to USER
                console.error('[AuthContext] Invalid role for business application:', parsedUser.role);
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
            
            // Convert date strings to Date objects for User type compatibility
            const validUser = {
              businessId: parsedUser?.businessId || parsedUser?.business_id,
              ...parsedUser,
              // Add any missing required fields with defaults
              isActive: parsedUser.isActive ?? true,
              // Convert string dates to Date objects if they exist as strings
              createdAt: parsedUser.createdAt ? new Date(parsedUser.createdAt) : new Date(),
              updatedAt: parsedUser.updatedAt ? new Date(parsedUser.updatedAt) : new Date()
            };
            
            console.log('[AuthContext] Constructed validUser:', validUser);
            console.log('[AuthContext] Final user role:', validUser.role);
            
            // Since this is business-only app, force BUSINESS role
            validUser.role = UserRole.BUSINESS;
            
            setUser(validUser as User);
            setToken(storedToken);
            console.log('[AuthContext] Business user authenticated from storage.');
            
            // Validate business session with Convex if token looks like a business token
            if (storedToken.startsWith('business_')) {
              console.log('[AuthContext] Validating business session with Convex...');
              validateBusinessSession(storedToken).catch(err => {
                console.error('[AuthContext] Business session validation failed:', err);
                // Clear invalid session
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem(AUTH_USER_KEY);
                sessionStorage.removeItem(AUTH_TOKEN_KEY);
                sessionStorage.removeItem(AUTH_USER_KEY);
                setUser(null);
                setToken(null);
              });
            }
          } catch (parseError) {
            console.error('[AuthContext] Error parsing stored user data:', parseError);
            // Clear invalid stored data
            localStorage.removeItem(AUTH_USER_KEY);
            sessionStorage.removeItem(AUTH_USER_KEY);
            setUser(null); // Ensure user is null if parsing fails
          }
        } else {
          console.log('[AuthContext] No stored authentication data found.');
          setUser(null); // Ensure user is null if nothing is stored
        }
      } catch (err) {
        console.error('Error during auth initialization:', err);
        // Only clear auth data if there's a critical error parsing the stored data
        if (err instanceof SyntaxError) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_USER_KEY);
          sessionStorage.removeItem(AUTH_TOKEN_KEY);
          sessionStorage.removeItem(AUTH_USER_KEY);
          setUser(null);
        }
      } finally {
        // Always set loading to false to prevent UI from being stuck
        setIsLoading(false); // Use renamed setter
      }
    };
    
    initializeAuth();
  }, []);

  // Login function - store token and user data
  const login = (authData: AuthResponse) => {
    // Since this is business-only app, all logins should be BUSINESS role
    const normalizedUser = { ...authData.user };
    normalizedUser.role = UserRole.BUSINESS; // Force business role since this is business-only app
    
    // Update authData with normalized user
    const normalizedAuthData = { ...authData, user: normalizedUser };

    // Store in both localStorage (for persistence) and sessionStorage (for hot reload persistence)
    localStorage.setItem(AUTH_TOKEN_KEY, normalizedAuthData.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalizedAuthData.user)); // Save normalized user data
    sessionStorage.setItem(AUTH_TOKEN_KEY, normalizedAuthData.token);
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalizedAuthData.user)); // Save normalized user data

    // Set the user state with the normalized user object
    // Assuming authData.user conforms to the User type (with string dates)
    setUser(normalizedAuthData.user);
    setToken(normalizedAuthData.token);
    console.log('[AuthContext] Business user logged in successfully:', normalizedAuthData.user);
    
    // Note: Navigation should be handled by the component that calls login(),
    // not in the AuthContext itself, to avoid conflicts with React Router
  };

  // Logout function - clear stored data
  const logout = async () => {
    try {
      // Call logout endpoint if user is logged in
      if (user) {
        await authService.logout();
      }
    } catch (err) {
      setAuthError(err);
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

  // Refresh user data from server
  const refreshUser = async () => {
    try {
      const authService = (await import('../services/authService')).default;
      const response = await authService.getCurrentUser();
      
      if (response.success && response.data) {
        console.log('[AuthContext] Raw refreshed response from server:', response);
        console.log('[AuthContext] Response.data structure:', response.data);
        
        // Handle nested profile structure from /users/me endpoint
        let userData;
        if (response.data.profile) {
          // API returns {profile: {user data}}
          console.log('[AuthContext] Extracting user from nested profile structure');
          userData = response.data.profile;
        } else {
          // API returns user data directly
          console.log('[AuthContext] Using direct user data structure');
          userData = response.data;
        }
        
        console.log('[AuthContext] Final extracted user data:', userData);
        console.log('[AuthContext] User role:', userData.role);
        console.log('[AuthContext] User businessId:', userData.businessId);
        
        // Since this is business-only app, force BUSINESS role
        userData.role = UserRole.BUSINESS;
        
        // If user is business role but no businessId, try to fetch it manually
        if (userData.role === UserRole.BUSINESS && !userData.businessId) {
          console.log('[AuthContext] Business user missing businessId, attempting manual fetch...');
          try {
            const businessResponse = await fetch('/api/businesses/me', {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (businessResponse.ok) {
              const businessData = await businessResponse.json();
              if (businessData.success && businessData.data) {
                console.log('[AuthContext] Manual business fetch successful:', businessData.data.id);
                userData.businessId = businessData.data.id;
              }
            } else {
              console.log('[AuthContext] Manual business fetch failed:', businessResponse.status);
            }
          } catch (error) {
            console.log('[AuthContext] Error in manual business fetch:', error);
          }
        }
        
        setUser(userData);
        // Update in both storage locations
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        return userData;
      } else {
        console.error('[AuthContext] Failed to refresh user data:', response.error);
        return null;
      }
    } catch (error) {
      console.error('[AuthContext] Error refreshing user data:', error);
      return null;
    }
  };

  // Check if user has specified role(s) - simplified for business-only app
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    // Since this is business-only app, always check for BUSINESS role
    if (Array.isArray(roles)) {
      return roles.includes(UserRole.BUSINESS);
    }
    
    return roles === UserRole.BUSINESS;
  };

  // Context value
  const contextValue: AuthContextState = {
    user,
    isLoading, // Use renamed state variable
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
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
