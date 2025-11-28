import ReactGA from 'react-ga4';

// Initialize Google Analytics
export const initGA = (measurementId: string) => {
  ReactGA.initialize(measurementId, {
    gaOptions: {
      siteSpeedSampleRate: 100,
    },
  });
};

// Track page views
export const logPageView = (path: string, title?: string) => {
  ReactGA.send({ hitType: 'pageview', page: path, title });
};

// Track events
export const logEvent = (category: string, action: string, label?: string, value?: number) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

// Track custom events with additional data
export const logCustomEvent = (eventName: string, eventParams?: Record<string, any>) => {
  ReactGA.event(eventName, eventParams);
};

// Track business actions
export const trackBusinessAction = (action: string, data?: Record<string, any>) => {
  logCustomEvent('business_action', {
    action,
    ...data,
  });
};

// Track promotion actions
export const trackPromotionAction = (action: string, promotionId?: string, data?: Record<string, any>) => {
  logCustomEvent('promotion_action', {
    action,
    promotion_id: promotionId,
    ...data,
  });
};

// Track event actions
export const trackEventAction = (action: string, eventId?: string, data?: Record<string, any>) => {
  logCustomEvent('event_action', {
    action,
    event_id: eventId,
    ...data,
  });
};

// Track payment actions
export const trackPaymentAction = (action: string, amount?: number, data?: Record<string, any>) => {
  logCustomEvent('payment_action', {
    action,
    amount,
    currency: 'USD',
    ...data,
  });
};

// Track onboarding steps
export const trackOnboardingStep = (step: number, stepName: string) => {
  logCustomEvent('onboarding_step', {
    step,
    step_name: stepName,
  });
};

// Track errors
export const trackError = (errorMessage: string, errorLocation: string, errorData?: Record<string, any>) => {
  logCustomEvent('error', {
    error_message: errorMessage,
    error_location: errorLocation,
    ...errorData,
  });
};

// Track newsletter actions
export const trackNewsletterAction = (action: string, newsletterId?: string, data?: Record<string, any>) => {
  logCustomEvent('newsletter_action', {
    action,
    newsletter_id: newsletterId,
    ...data,
  });
};
