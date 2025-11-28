import React, { ReactNode, useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useLocation } from 'react-router-dom';

// Initialize PostHog if key is available
const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    capture_pageview: false, // We'll handle this manually
  });
}

interface PostHogProviderProps {
  children: ReactNode;
}

export const PostHogProvider: React.FC<PostHogProviderProps> = ({ children }) => {
  if (!posthogKey) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  );
};

export const PostHogPageviewTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (posthogKey) {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
      });
    }
  }, [location.pathname]);

  return null;
};
