import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PricingTable, PlanCardData } from '../pricing/PricingTable';

// Check if Clerk is available
const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

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

  // Without Clerk, assume not signed in
  const isSignedIn = false;

  const handlePlanClick = (plan: PlanCardData, billingPeriod: 'annual' | 'month') => {
    // Enterprise plan - redirect to contact
    if (plan.isCustom) {
      navigate('/contact');
      return;
    }

    // Without Clerk, redirect to sign-up page
    if (HAS_CLERK) {
      navigate(`/sign-up?redirect=/checkout?plan=${plan.clerkPlanId}&period=${billingPeriod}`);
    } else {
      // For dev without Clerk, go to audio generator
      navigate('/create');
    }
  };

  const getButtonText = (plan: PlanCardData): string => {
    if (plan.isCustom) return 'Contact Sales';
    return 'Create Free Account';
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
