/**
 * Marketing Analytics - Landing Page Event Tracking
 *
 * This is separate from product analytics (analytics.ts).
 * Used for tracking visitor behavior on marketing/landing pages.
 */

// Helper to safely call gtag
const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag(...args);
  }
};

// Track CTA button clicks
export const trackGetStartedClick = (
  location: 'hero' | 'nav' | 'final_cta' | 'pricing',
  userState: 'signed_out' | 'signed_in_no_sub' | 'signed_in_with_sub'
) => {
  gtag('event', 'cta_click', {
    button_name: 'get_started',
    button_location: location,
    user_state: userState,
  });
};

export const trackPricingClick = (location: 'hero' | 'nav') => {
  gtag('event', 'cta_click', {
    button_name: 'pricing',
    button_location: location,
  });
};

// Track navigation clicks
export const trackNavClick = (navItem: string) => {
  gtag('event', 'nav_click', {
    nav_item: navItem,
  });
};

// Track section scrolls/views
export const trackSectionView = (sectionName: string) => {
  gtag('event', 'section_view', {
    section_name: sectionName,
  });
};

// Track contact form
export const trackContactFormSubmit = (success: boolean) => {
  gtag('event', 'contact_form_submit', {
    success: success,
  });
};

// Track sign up modal opens
export const trackSignUpModalOpen = (source: string) => {
  gtag('event', 'signup_modal_open', {
    source: source,
  });
};

// Track pricing plan selection
export const trackPricingPlanClick = (planName: string) => {
  gtag('event', 'pricing_plan_click', {
    plan_name: planName,
  });
};

// Track external link clicks
export const trackExternalLinkClick = (linkName: string, url: string) => {
  gtag('event', 'external_link_click', {
    link_name: linkName,
    link_url: url,
  });
};
