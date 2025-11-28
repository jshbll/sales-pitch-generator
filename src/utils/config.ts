/**
 * Application configuration
 * Centralizes access to environment variables
 */

// API URLs - Legacy (Pure Convex architecture doesn't use this)
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Feature flags
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

// Authentication
export const AUTH_TOKEN_KEY = 'jaxsaver_auth_token';
export const AUTH_USER_KEY = 'jaxsaver_user';

// Stripe
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

// Newsletter
export const MAKE_WEBHOOK_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL || '';

// Application settings
export const APP_NAME = 'JaxSaver';
export const APP_VERSION = '2.0.0';
