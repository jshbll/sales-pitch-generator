/**
 * Convex Auth Configuration for Clerk JWT Authentication
 *
 * This configures Convex to accept and validate JWT tokens from Clerk.
 * The JWT tokens are passed from the ConvexProviderWithClerk component.
 *
 * IMPORTANT: ConvexProviderWithClerk requires JWT template name to be "convex"
 * - The template name CANNOT be customized (hardcoded in convex/react-clerk)
 * - The domain field differentiates between mobile and business users
 * - Both mobile and business Clerk instances must have JWT template named "convex"
 *
 * Environment-aware configuration:
 * - DEV: Accepts dev Clerk instances
 * - PROD: Accepts production Clerk instances
 */

// Check if we're in production by looking at CONVEX_CLOUD_URL env var
// Dev: https://agreeable-meerkat-419.convex.cloud
// Prod: https://disciplined-sandpiper-478.convex.cloud
const isProduction = process.env.CONVEX_CLOUD_URL?.includes('disciplined-sandpiper-478');

export default {
  providers: isProduction
    ? [
        // Production - Mobile app (users)
        {
          domain: "https://clerk.jaxsaver.app",
          applicationID: "convex",
        },
        // Production - Business web app
        {
          domain: "https://clerk.business.jaxsaver.com",
          applicationID: "convex",
        },
      ]
    : [
        // Development - Mobile app (users)
        {
          domain: "https://uncommon-wombat-29.clerk.accounts.dev",
          applicationID: "convex",
        },
        // Development - Business web app
        {
          domain: "https://up-kit-64.clerk.accounts.dev",
          applicationID: "convex",
        },
      ],
};