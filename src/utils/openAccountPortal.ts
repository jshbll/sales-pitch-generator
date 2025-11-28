/**
 * Opens Clerk's hosted Account Portal in a new tab
 *
 * This provides access to billing, profile, and security settings.
 * Opens in a new tab for better UX and more space.
 */

// Clerk Account Portal URL - user profile page (billing is a tab within)
const CLERK_ACCOUNT_PORTAL = 'https://up-kit-64.accounts.dev/user';

export const openAccountPortal = () => {
  // Open in new tab
  window.open(CLERK_ACCOUNT_PORTAL, '_blank');
};
