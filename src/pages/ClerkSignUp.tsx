import React, { useEffect } from 'react';
import { SignUp } from '@clerk/clerk-react';
import { Box, Container, useTheme, Typography, CircularProgress } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { usePageTitle } from '../hooks/usePageTitle';

const ClerkSignUp: React.FC = () => {
  usePageTitle('Sign Up');
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Fetch plan IDs to get the default Starter/Bronze plan
  const planDetails = useQuery(api.clerkPlans.getPlans);

  // Business creation is now handled automatically by Clerk webhook on user.created event

  // Check if user arrived here from pricing (has plan in sessionStorage)
  // OR if plan is in URL params (from pricing modal)
  const planFromSession = sessionStorage.getItem('selected_plan');
  const periodFromSession = sessionStorage.getItem('selected_period');
  const planFromUrl = searchParams.get('plan');
  const periodFromUrl = searchParams.get('period');

  // If user came here directly (no plan selected), redirect to pricing
  useEffect(() => {
    if (!planFromSession && !planFromUrl && planDetails) {
      console.log('[ClerkSignUp] No plan selected - redirecting to pricing page');
      // Redirect to home page pricing section
      navigate('/pricing');
    }
  }, [planFromSession, planFromUrl, planDetails, navigate]);

  // Build the checkout URL for after signup
  const getCheckoutUrl = (): string => {
    // Priority 1: URL params (from pricing modal's openSignUp)
    if (planFromUrl && periodFromUrl) {
      return `/checkout?plan=${planFromUrl}&period=${periodFromUrl}`;
    }

    // Priority 2: SessionStorage (from "Get Started" buttons)
    if (planFromSession && periodFromSession) {
      return `/checkout?plan=${planFromSession}&period=${periodFromSession}`;
    }

    // Priority 3: Default to Essential plan if planDetails loaded
    if (planDetails?.essential?.id) {
      console.log('[ClerkSignUp] Using default Essential plan:', planDetails.essential.id);
      return `/checkout?plan=${planDetails.essential.id}&period=annual`;
    }

    // Fallback: redirect to pricing (shouldn't reach here due to useEffect above)
    return '/pricing';
  };

  // Show loading while fetching plans
  if (!planDetails) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            py: 4,
          }}
        >
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Loading signup...
          </Typography>
        </Box>
      </Container>
    );
  }

  const checkoutUrl = getCheckoutUrl();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4,
        }}
      >
        {/* Show selected plan info if available */}
        {(planFromSession || planFromUrl) && (
          <Typography
            variant="subtitle1"
            sx={{
              mb: 3,
              color: theme.palette.primary.main,
              fontWeight: 600,
              textAlign: 'center'
            }}
          >
            Selected: {(planFromSession || planFromUrl)?.toUpperCase()} Plan
          </Typography>
        )}

        <SignUp
          redirectUrl={checkoutUrl}
          signInUrl="/login"
          forceRedirectUrl={checkoutUrl}
        />
      </Box>
    </Container>
  );
};

export default ClerkSignUp;