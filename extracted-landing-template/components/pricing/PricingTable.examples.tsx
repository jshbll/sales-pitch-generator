/**
 * PricingTable Component - Usage Examples
 *
 * This file demonstrates how to use the reusable PricingTable component
 * in different contexts (marketing site, checkout page, settings page, etc.)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useClerk } from '@clerk/clerk-react';
import { PricingTable, PlanCardData } from './PricingTable';

/**
 * Example 1: Marketing Site Landing Page
 * - Shows all plans with "Start Free Trial" CTAs
 * - Redirects to signup for unauthenticated users
 * - Redirects to checkout for authenticated users
 */
export const MarketingSitePricing: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { openSignUp } = useClerk();

  const handlePlanClick = (plan: PlanCardData) => {
    // Enterprise plan - redirect to contact
    if (plan.isCustom) {
      navigate('/contact');
      return;
    }

    // Not signed in - open signup modal
    if (!isSignedIn) {
      openSignUp({
        forceRedirectUrl: `/checkout?plan=${plan.clerkPlanId}&period=annual&trial=7`,
        redirectUrl: `/checkout?plan=${plan.clerkPlanId}&period=annual&trial=7`,
        appearance: {
          baseTheme: undefined,
          variables: {
            colorBackground: '#000000',
            colorPrimary: '#FCD34D',
            colorText: '#FFFFFF',
            colorTextSecondary: '#9CA3AF',
            colorInputBackground: '#1F1F1F',
            colorInputText: '#FFFFFF',
            borderRadius: '8px',
          },
        },
      });
      return;
    }

    // Signed in - go to checkout
    navigate(`/checkout?plan=${plan.clerkPlanId}&period=annual&trial=7`);
  };

  return (
    <PricingTable
      onPlanClick={handlePlanClick}
      showHeader={true}
      headerTitle="Choose Your Plan"
      headerSubtitle="Start your 7-day free trial. Complete sign-up and payment in one simple flow."
      showBillingToggle={true}
      showTrialBadge={true}
      showTrustBadges={true}
    />
  );
};

/**
 * Example 2: Checkout Page (Post-Signup)
 * - User already signed in
 * - Shows Clerk CheckoutButton integration
 * - Handles subscription completion
 */
export const CheckoutPagePricing: React.FC = () => {
  const navigate = useNavigate();

  const handlePlanClick = (plan: PlanCardData) => {
    // Enterprise plan - redirect to contact
    if (plan.isCustom) {
      navigate('/contact');
      return;
    }

    // For Starter/Pro plans, the CheckoutButton component
    // will handle the Clerk checkout flow
    // (Implementation would use CheckoutButton from @clerk/clerk-react/experimental)
  };

  const getButtonText = (plan: PlanCardData): string => {
    if (plan.isCustom) return 'Contact Sales';
    return 'Start Free Trial';
  };

  return (
    <PricingTable
      onPlanClick={handlePlanClick}
      getButtonText={getButtonText}
      showHeader={true}
      headerTitle="Choose Your Plan"
      headerSubtitle="Start your 7-day free trial. Cancel anytime."
      showBillingToggle={true}
      showTrialBadge={true}
      showTrustBadges={true}
      trustBadgeText="🔒 Secure payment processing • Cancel anytime • Full access during 7-day trial"
    />
  );
};

/**
 * Example 3: Settings/Upgrade Page
 * - User viewing from within the app
 * - Shows current plan status
 * - Different CTAs based on subscription state
 */
export const SettingsPagePricing: React.FC<{
  currentPlanId?: string;
  isTrialing?: boolean;
}> = ({ currentPlanId, isTrialing = false }) => {
  const navigate = useNavigate();

  const handlePlanClick = (plan: PlanCardData) => {
    // Enterprise plan - redirect to contact
    if (plan.isCustom) {
      navigate('/contact');
      return;
    }

    // Navigate to change subscription flow
    navigate(`/business/subscription/change?plan=${plan.clerkPlanId}`);
  };

  const getButtonText = (plan: PlanCardData): string => {
    // Current plan
    if (currentPlanId === plan.clerkPlanId) {
      return isTrialing ? 'Current Plan (Trial)' : 'Current Plan';
    }

    // Enterprise
    if (plan.isCustom) {
      return 'Contact Sales';
    }

    // Other plans
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

  return (
    <PricingTable
      onPlanClick={handlePlanClick}
      getButtonText={getButtonText}
      getButtonDisabled={getButtonDisabled}
      getButtonVariant={getButtonVariant}
      showHeader={true}
      headerTitle="Subscription Plans"
      headerSubtitle="Upgrade or downgrade your plan at any time. Changes take effect immediately."
      showBillingToggle={true}
      showTrialBadge={false} // Don't show trial badges in settings
      showTrustBadges={false} // Don't show trust badges in settings
    />
  );
};

/**
 * Example 4: Compact Pricing Preview
 * - Minimal version for sidebars or modals
 * - No header, no trust badges
 * - Monthly billing only
 */
export const CompactPricingPreview: React.FC = () => {
  const navigate = useNavigate();

  const handlePlanClick = (plan: PlanCardData) => {
    if (plan.isCustom) {
      navigate('/contact');
    } else {
      navigate(`/checkout?plan=${plan.clerkPlanId}`);
    }
  };

  return (
    <PricingTable
      onPlanClick={handlePlanClick}
      showHeader={false}
      showBillingToggle={false}
      defaultBillingPeriod="month"
      showTrialBadge={false}
      showTrustBadges={false}
      maxWidth="lg"
    />
  );
};

/**
 * Example 5: Custom Plan Descriptions
 * - Override default descriptions for specific use cases
 */
export const CustomDescriptionsPricing: React.FC = () => {
  const navigate = useNavigate();

  const handlePlanClick = (plan: PlanCardData) => {
    if (plan.isCustom) {
      navigate('/contact');
    } else {
      navigate(`/checkout?plan=${plan.clerkPlanId}`);
    }
  };

  return (
    <PricingTable
      onPlanClick={handlePlanClick}
      planDescriptions={{
        starter: 'Ideal for local shops and restaurants just getting started',
        pro: 'Perfect for multi-location businesses looking to grow',
        enterprise: 'Custom solutions for large organizations and franchises'
      }}
      showHeader={true}
      showBillingToggle={true}
    />
  );
};

/**
 * Example 6: Comparison Table Mode
 * - Side-by-side plan comparison
 * - Emphasizes feature differences
 */
export const ComparisonTablePricing: React.FC = () => {
  const navigate = useNavigate();

  const handlePlanClick = (plan: PlanCardData) => {
    if (plan.isCustom) {
      navigate('/contact');
    } else {
      navigate(`/checkout?plan=${plan.clerkPlanId}`);
    }
  };

  return (
    <PricingTable
      onPlanClick={handlePlanClick}
      showHeader={true}
      headerTitle="Compare Plans"
      headerSubtitle="Find the perfect plan for your business needs"
      showBillingToggle={true}
      showTrialBadge={true}
      showTrustBadges={true}
      maxWidth="xl"
    />
  );
};
