import { useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

/**
 * Check if we're running in production
 * Returns false for localhost, 127.0.0.1, and local network IPs
 */
function isProduction(): boolean {
  const hostname = window.location.hostname;
  return !(
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('100.') // Tailscale IPs
  );
}

/**
 * Initialize PostHog analytics
 * - Feature flags work in ALL environments (for A/B testing locally)
 * - Event capturing ONLY happens in production (no local data pollution)
 */
export function initPostHog() {
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
  const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!posthogKey) {
    console.warn('[PostHog] Not initialized - VITE_POSTHOG_KEY not found');
    return;
  }

  const isProd = isProduction();

  // Only initialize if not already initialized
  if (!posthog.__loaded) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      capture_pageview: false, // We handle this manually for SPA routing
      capture_pageleave: isProd, // Only in production
      persistence: 'localStorage',
      // Disable event capturing in non-production, but keep feature flags working
      autocapture: isProd,
      disable_session_recording: !isProd,
    });

    // Opt out of capturing in non-production (feature flags still work!)
    if (!isProd) {
      posthog.opt_out_capturing();
      console.log('[PostHog] Initialized (dev mode - feature flags only, no event tracking)');
    } else {
      console.log('[PostHog] Initialized (production mode - full tracking enabled)');
    }
  }
}

/**
 * PostHog Provider wrapper for React hooks (useFeatureFlagPayload, etc.)
 * Must wrap the app for feature flag hooks to work
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog();
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

/**
 * Component that handles pageview tracking and user identification
 * Place this inside BrowserRouter and after auth provider is available
 * Only tracks events in production - feature flags work everywhere
 */
export function PostHogPageviewTracker() {
  const location = useLocation();
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();

  // Track pageviews on route change (production only)
  useEffect(() => {
    if (import.meta.env.VITE_POSTHOG_KEY && isProduction()) {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
      });
    }
  }, [location.pathname, location.search]);

  // Identify user when signed in (production only)
  useEffect(() => {
    if (!isLoaded || !import.meta.env.VITE_POSTHOG_KEY) return;

    if (isSignedIn && clerkUser && isProduction()) {
      posthog.identify(clerkUser.id, {
        email: clerkUser.primaryEmailAddress?.emailAddress,
        name: clerkUser.fullName,
      });
      console.log('[PostHog] User identified:', clerkUser.id);
    } else if (!isSignedIn) {
      posthog.reset();
    }
  }, [isLoaded, isSignedIn, clerkUser?.id]);

  return null;
}
