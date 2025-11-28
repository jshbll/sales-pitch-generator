import React from 'react';
import { Box, Alert } from '@mui/material';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { PricingTable as OurPricingTable, PlanCardData } from '../pricing/PricingTable';

/**
 * Clerk Billing Pricing Table Component
 * - Uses the reusable PricingTable component
 * - Handles plan selection by opening Clerk billing portal
 * - Shows current plan status
 */
const ClerkPricingTable: React.FC<{ currentPlanId?: string }> = ({ currentPlanId }) => {
  const { userId } = useAuth();
  const { openUserProfile } = useClerk();

  const openBilling = async () => {
    try {
      await openUserProfile({ path: 'billing' });
    } catch {
      try {
        const pub = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
        const isTest = pub && pub.includes('test_');
        const clerkDomain = isTest ? 'https://accounts.test.clerk.dev' : 'https://accounts.clerk.dev';
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `${clerkDomain}/user/billing?return_url=${returnUrl}`;
      } catch (e) {
        console.error('Failed to open billing portal', e);
      }
    }
  };

  const handlePlanClick = async (plan: PlanCardData) => {
    // Enterprise - navigate to contact
    if (plan.isCustom) {
      window.location.href = '/contact';
      return;
    }

    // Open Clerk billing portal for plan changes
    await openBilling();
  };

  const getButtonText = (plan: PlanCardData): string => {
    if (currentPlanId === plan.clerkPlanId) {
      return 'Current Plan';
    }
    if (plan.isCustom) {
      return 'Contact Sales';
    }
    return currentPlanId ? 'Switch Plan' : 'Subscribe';
  };

  const getButtonDisabled = (plan: PlanCardData): boolean => {
    // Disable current plan button
    return currentPlanId === plan.clerkPlanId;
  };

  const getButtonVariant = (plan: PlanCardData): 'contained' | 'outlined' => {
    // Highlight current plan
    if (currentPlanId === plan.clerkPlanId) {
      return 'contained';
    }
    return plan.highlighted ? 'contained' : 'outlined';
  };

  if (!userId) {
    return (
      <Alert severity="info">
        Please sign in to view pricing plans.
      </Alert>
    );
  }

  return (
    <Box>
      <OurPricingTable
        onPlanClick={handlePlanClick}
        getButtonText={getButtonText}
        getButtonDisabled={getButtonDisabled}
        getButtonVariant={getButtonVariant}
        showHeader={true}
        headerTitle="Subscription Plans"
        headerSubtitle="Upgrade or downgrade your plan at any time. Changes take effect immediately."
        showBillingToggle={true}
        showTrialBadge={false}
        showTrustBadges={false}
        planDescriptions={{
          starter: 'Perfect for small businesses just getting started',
          pro: 'For growing businesses ready to scale',
          enterprise: 'For established businesses with custom needs'
        }}
      />

      {currentPlanId && (
        <Alert severity="info" sx={{ mt: 2, maxWidth: '1200px', mx: 'auto' }}>
          After selecting a plan, you'll be taken to the billing portal to confirm your change.
        </Alert>
      )}
    </Box>
  );
};

export default ClerkPricingTable;
