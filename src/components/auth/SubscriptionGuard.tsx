import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';

interface SubscriptionGuardProps {
  children?: React.ReactNode;
  requireActiveSubscription?: boolean;
}

/**
 * Component that protects routes requiring an active subscription
 * Redirects to subscription selection if no active subscription is found
 */
const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  requireActiveSubscription = true,
}) => {
  const location = useLocation();
  
  const { hasActiveSubscription, loading, error } = useSubscriptionStatus();

  // Show loading state while checking subscription
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="400px"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Checking subscription status...
        </Typography>
      </Box>
    );
  }

  // If there's an error, allow access but log the error
  if (error) {
    console.error('Subscription check error:', error);
    // Allow access on error to prevent blocking legitimate users
    return <>{children}</>;
  }

  // The subscription page is now outside this guard, so this check is no longer needed
  // but we keep it as a safety net

  // If subscription is required but user doesn't have one, redirect to homepage to select a plan
  if (requireActiveSubscription && !hasActiveSubscription) {
    return (
      <Navigate
        to="/"
        state={{
          from: location.pathname,
          message: 'Please select a subscription plan to continue accessing your business dashboard.'
        }}
        replace
      />
    );
  }

  // User has active subscription or subscription not required
  console.log('[SubscriptionGuard] Rendering children - subscription check passed');
  return children ? <>{children}</> : <Outlet />;
};

export default SubscriptionGuard;