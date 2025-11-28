import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

/**
 * Lightweight hook to check onboarding status
 *
 * This hook only fetches minimal data to determine if onboarding is complete,
 * avoiding unnecessary queries for business data, subscriptions, etc. until needed.
 *
 * Following Jordan Walke's React philosophy:
 * - Declarative data fetching
 * - Component tree shape drives what data gets fetched
 * - Avoid over-fetching before it's needed
 *
 * @returns {Object} Onboarding status information
 * @property {boolean} isOnboardingComplete - True if user has completed onboarding
 * @property {'login' | 'business_info' | 'complete' | 'error'} currentStep - Current onboarding step
 * @property {boolean} isLoading - True while query is loading
 * @property {boolean} isAuthenticated - True if user is authenticated with Clerk
 * @property {string | undefined} businessId - Business ID if it exists
 * @property {boolean | undefined} hasName - Whether business has a name set
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { isOnboardingComplete, isLoading } = useOnboardingStatus();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (!isOnboardingComplete) return <Navigate to="/onboarding" />;
 *
 *   // Now it's safe to fetch business data
 *   return <DashboardContent />;
 * }
 * ```
 */
export function useOnboardingStatus() {
  // Single lightweight query - only fetches onboarding status, not full business data
  const status = useQuery(api.authClerk.getOnboardingStatus);

  return {
    isOnboardingComplete: status?.isComplete ?? false,
    currentStep: status?.currentStep,
    isLoading: status === undefined,
    isAuthenticated: status?.isAuthenticated ?? false,
    businessId: status?.businessId,
    hasName: status?.hasName,
  };
}
