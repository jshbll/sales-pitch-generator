import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Chip,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon 
} from '@mui/icons-material';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';

/**
 * Clerk Billing Portal Component (B2C SaaS)
 * Provides access to subscription management via Clerk's billing portal
 */
const ClerkBillingPortal: React.FC = () => {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Get current subscription from Convex
  const subscription = useQuery(api.clerkBilling.getCurrentSubscription);

  const handleOpenBillingPortal = async () => {
    if (!user) {
      setError('Not signed in');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preferred: open Clerk's user profile at the billing tab via Clerk SDK
      await openUserProfile({ path: 'billing' });
      setLoading(false);
      return;
    } catch (err) {
      console.warn('openUserProfile billing path failed, attempting URL fallback:', err);
      try {
        const pub = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
        const isTest = pub && pub.includes('test_');
        const clerkDomain = isTest ? 'https://accounts.test.clerk.dev' : 'https://accounts.clerk.dev';
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `${clerkDomain}/user/billing?return_url=${returnUrl}`;
        return;
      } catch (fallbackErr) {
        console.error('Error opening billing portal:', fallbackErr);
        setError('Failed to open billing portal');
        setLoading(false);
      }
    }
  };

  const handleUpgrade = () => {
    // Redirect to pricing page
    window.location.href = '/business/subscription/select';
  };

  if (!user) {
    return (
      <Alert severity="info">
        Please sign in to manage billing.
      </Alert>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trialing':
        return 'info';
      case 'past_due':
        return 'warning';
      case 'cancelled':
      case 'expired':
        return 'error';
      case 'no_access':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return '#CD7F32';
      case 'gold':
        return '#FFD700';
      case 'diamond':
        return '#B9F2FF';
      default:
        return 'inherit';
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Billing & Subscription
      </Typography>

      <Stack spacing={3}>
        {/* Current Subscription Card */}
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Current Subscription</Typography>
              {subscription && (
                <Chip 
                  label={subscription.status}
                  color={getStatusColor(subscription.status) as any}
                  size="small"
                />
              )}
            </Stack>

            {subscription?.hasSubscription ? (
              <Box>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Chip 
                    label={subscription.tier.toUpperCase()}
                    sx={{ 
                      backgroundColor: getTierColor(subscription.tier),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                  <Typography variant="body1">
                    {subscription.plan || 'Custom Plan'}
                  </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {subscription.currentPeriodEnd && 
                    `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                  }
                </Typography>

                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Locations:</strong> {subscription.limits.maxLocations === -1 ? 'Unlimited' : subscription.limits.maxLocations}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Promotions:</strong> {subscription.limits.maxPromotions}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Events:</strong> {subscription.limits.maxEvents}
                  </Typography>
                </Stack>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  No active subscription
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpgrade}
                  startIcon={<CreditCardIcon />}
                >
                  Choose a Plan
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Billing Portal Actions */}
        {subscription?.hasSubscription && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Manage Billing
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Update payment methods, download invoices, and manage your subscription
              </Typography>
              
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={handleOpenBillingPortal}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SettingsIcon />}
                >
                  Open Billing Portal
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => (window.location.href = '/business/subscription/select?mode=change')}
                  startIcon={<CreditCardIcon />}
                >
                  Change Plan
                </Button>
              </Stack>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

      </Stack>
    </Box>
  );
};

export default ClerkBillingPortal;