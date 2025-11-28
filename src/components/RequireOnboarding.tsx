import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';

/**
 * RequireOnboarding - Route guard component
 *
 * Following Jordan Walke's React philosophy:
 * - Suspense-like boundary pattern
 * - Component tree shape drives rendering
 * - Declarative control flow
 *
 * This component prevents access to protected routes until onboarding is complete.
 * It uses the lightweight useOnboardingStatus hook to check status without
 * fetching full business data unnecessarily.
 *
 * Usage:
 * ```tsx
 * <Route element={<RequireOnboarding />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 *   <Route path="/promotions" element={<Promotions />} />
 * </Route>
 * ```
 *
 * @example
 * ```tsx
 * // In routes configuration:
 * <Route path="/business" element={<RequireAuth />}>
 *   <Route element={<RequireOnboarding />}>
 *     <Route path="dashboard" element={<Dashboard />} />
 *     <Route path="promotions" element={<Promotions />} />
 *   </Route>
 *   <Route path="onboarding" element={<Onboarding />} />
 * </Route>
 * ```
 */
export const RequireOnboarding: React.FC = () => {
  const { isOnboardingComplete, isLoading, isAuthenticated } = useOnboardingStatus();

  // Show loading spinner while checking onboarding status
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#000',
        }}
      >
        <CircularProgress sx={{ color: '#FCD34D' }} />
      </Box>
    );
  }

  // If not authenticated, redirect to login (shouldn't happen if RequireAuth is parent)
  if (!isAuthenticated) {
    console.log('[RequireOnboarding] User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If onboarding not complete, redirect to onboarding
  if (!isOnboardingComplete) {
    console.log('[RequireOnboarding] Onboarding incomplete, redirecting to onboarding');
    return <Navigate to="/business/onboarding" replace />;
  }

  // Onboarding complete - render children
  console.log('[RequireOnboarding] Onboarding complete, rendering protected content');
  return <Outlet />;
};

export default RequireOnboarding;
