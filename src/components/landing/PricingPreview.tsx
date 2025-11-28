import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useClerk, SignedOut } from '@clerk/clerk-react';
import { PricingTable, PlanCardData } from '../pricing/PricingTable';
import { Box } from '@mui/material';
import { ArrowRight } from 'lucide-react';

/**
 * PricingPreview - Marketing site pricing with checkout redirect
 *
 * Simple UX:
 * 1. Unauthenticated: Click plan → Signup modal → Redirect to /checkout
 * 2. Authenticated: Click plan → Redirect to /checkout
 * 3. /checkout page handles auto-trigger and subscription completion
 */
export const PricingPreview: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { openSignUp } = useClerk();

  const handlePlanClick = (plan: PlanCardData, billingPeriod: 'annual' | 'month') => {
    // Enterprise plan - redirect to contact
    if (plan.isCustom) {
      navigate('/contact');
      return;
    }

    // Not signed in - open signup modal with redirect to checkout
    if (!isSignedIn) {
      openSignUp({
        forceRedirectUrl: `/checkout?plan=${plan.clerkPlanId}&period=${billingPeriod}`,
        redirectUrl: `/checkout?plan=${plan.clerkPlanId}&period=${billingPeriod}`,
      });
      return;
    }

    // Signed in - redirect directly to checkout page
    navigate(`/checkout?plan=${plan.clerkPlanId}&period=${billingPeriod}`);
  };

  const getButtonText = (plan: PlanCardData): string => {
    if (plan.isCustom) return 'Contact Sales';
    if (!isSignedIn) return 'Create Free Account';
    return 'Start Free Trial';
  };

  return (
    <PricingTable
      onPlanClick={handlePlanClick}
      getButtonText={getButtonText}
      showHeader={true}
      headerTitle="Choose Your Plan"
      headerSubtitle="Start your 7-day free trial. Complete sign-up and payment in one simple flow."
      showBillingToggle={true}
      showTrialBadge={true}
      showTrustBadges={true}
      trustBadgeText="Free 7 Day Trial • Cancel Anytime • No Contract"
    />
  );
};

export default PricingPreview;
