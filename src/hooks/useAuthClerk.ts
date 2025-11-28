import { useUser, useClerk } from '@clerk/clerk-react';
import { useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { AuthContextState } from '../contexts/AuthContextDefinition';
import { UserRole } from '../types';
import { useEffect, useRef, useMemo, useCallback } from 'react';

/**
 * Custom hook to access authentication using Clerk
 * Provides compatibility with existing AuthContextState interface
 */
export const useAuthClerk = (): AuthContextState & { businessProfile: any } => {
  // Get Clerk user and clerk instance
  const { user: clerkUser, isLoaded: clerkIsLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const syncSubscription = useAction(api.authClerk.syncSubscriptionOnLogin);
  const syncedRef = useRef(false);
  
  // Query for the existing business profile (webhook creates it automatically)
  // Only query if user is signed in AND Clerk is fully loaded
  const businessProfile = useQuery(
    api.authClerk.getCurrentBusinessQuery,
    (isSignedIn && clerkIsLoaded) ? undefined : "skip"
  );
  
  // Debug logging for business profile query
  useEffect(() => {
    if (isSignedIn && clerkIsLoaded && businessProfile !== undefined) {
      console.log('[useAuthClerk] Business profile query result:', {
        hasProfile: !!businessProfile,
        profileId: businessProfile?._id,
        profileName: businessProfile?.name,
        clerkUserId: businessProfile?.clerk_user_id
      });
    }
  }, [isSignedIn, clerkIsLoaded, businessProfile?._id]);
  
  // Sync subscription data on login (once per session)
  useEffect(() => {
    const syncData = async () => {
      if (businessProfile && !syncedRef.current) {
        syncedRef.current = true;
        console.log('[useAuthClerk] Syncing subscription data on login...');
        try {
          const result = await syncSubscription();
          console.log('[useAuthClerk] Subscription sync result:', result);
        } catch (error) {
          console.error('[useAuthClerk] Failed to sync subscription:', error);
        }
      }
    };
    
    if (businessProfile?._id) {
      console.log('[useAuthClerk] Business profile loaded:', businessProfile._id);
      syncData();
    }
  }, [businessProfile?._id, syncSubscription]);
  
  // Only log state changes, not every render
  // Commented out to reduce console noise
  // console.log('[useAuthClerk] State:', {
  //   isSignedIn,
  //   clerkIsLoaded,
  //   clerkUser: clerkUser ? { id: clerkUser.id, email: clerkUser.primaryEmailAddress?.emailAddress } : null,
  //   businessProfile: businessProfile ? { id: businessProfile._id, email: businessProfile.email, name: businessProfile.name } : null,
  //   businessProfileLoading: businessProfile === undefined
  // });

  // Build user object compatible with AuthContextState (memoized to prevent re-renders)
  // Create user object if we have both Clerk user and business profile
  const user = useMemo(() => {
    if (!clerkUser || !businessProfile) return null;

    return {
      id: businessProfile._id,
      email: businessProfile.email || clerkUser.primaryEmailAddress?.emailAddress || '',
      firstName: businessProfile.first_name || clerkUser.firstName || '',
      lastName: businessProfile.last_name || clerkUser.lastName || '',
      role: UserRole.BUSINESS, // Default to business role
      emailVerified: businessProfile.email_verified || clerkUser.primaryEmailAddress?.verification?.status === 'verified' || false,
      isActive: businessProfile.is_active !== false,
      businessId: businessProfile._id,
      phoneNumber: businessProfile.phone || undefined,
      createdAt: new Date(businessProfile.created_at || Date.now()),
      updatedAt: new Date(businessProfile.updated_at || Date.now())
    };
  }, [
    clerkUser?.id,
    businessProfile?._id,
    businessProfile?.email,
    businessProfile?.first_name,
    businessProfile?.last_name,
    businessProfile?.phone,
    businessProfile?.is_active,
    businessProfile?.created_at,
    businessProfile?.updated_at,
    clerkUser?.primaryEmailAddress?.emailAddress,
    clerkUser?.firstName,
    clerkUser?.lastName,
    clerkUser?.primaryEmailAddress?.verification?.status
  ]);

  // Determine if we're still loading
  // We're loading if Clerk isn't loaded yet, or if we're signed in but business profile is still undefined
  const isStillLoading = !clerkIsLoaded || (isSignedIn && businessProfile === undefined);

  // Memoize callbacks to prevent re-renders (Jordan Walke pattern)
  const login = useCallback(async () => {
    console.warn('[useAuthClerk] Login should be handled by Clerk SignIn component');
  }, []);

  const logout = useCallback(async () => {
    console.log('[useAuthClerk] LOGOUT INITIATED - Starting sign out process');
    console.log('[useAuthClerk] Current user:', {
      clerkUserId: clerkUser?.id,
      businessId: businessProfile?._id,
      email: clerkUser?.primaryEmailAddress?.emailAddress
    });

    // Clear any local storage data
    const clerkKeys = Object.keys(localStorage).filter(key => key.includes('clerk'));
    console.log('[useAuthClerk] Clearing localStorage clerk keys:', clerkKeys);

    // Sign out with Clerk
    console.log('[useAuthClerk] Calling Clerk signOut...');
    await signOut({ redirectUrl: '/' });
    console.log('[useAuthClerk] LOGOUT COMPLETE - Redirecting to /');
  }, [signOut, clerkUser?.id, businessProfile?._id, clerkUser?.primaryEmailAddress?.emailAddress]);

  const updateUser = useCallback(() => {
    console.warn('[useAuthClerk] User updates should be handled through Convex mutations');
  }, []);

  const refreshUser = useCallback(async () => {
    console.warn('[useAuthClerk] User refresh is automatic with Convex queries');
    return user;
  }, [user]);

  const hasRole = useCallback((roles: UserRole | UserRole[]) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  }, [user]);

  // Memoize the entire return object to stabilize references
  return useMemo(() => ({
    user,
    isLoading: isStillLoading,
    loading: isStillLoading, // Alias for backward compatibility
    token: null, // Clerk handles tokens internally
    error: null,
    login,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: isSignedIn || false,
    hasRole,
    businessProfile,
    clerkUser,
    isSignedIn: isSignedIn || false,
    isLoaded: clerkIsLoaded
  }), [
    user,
    isStillLoading,
    login,
    logout,
    updateUser,
    refreshUser,
    isSignedIn,
    hasRole,
    businessProfile?._id,
    clerkUser?.id,
    clerkIsLoaded
  ]);
};