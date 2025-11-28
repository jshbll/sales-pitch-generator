import { useAuthClerk } from './useAuthClerk';

/**
 * Custom hook to access the authentication context
 * Now uses Clerk for authentication state
 */
export const useAuth = () => {
  // Delegate to Clerk implementation
  return useAuthClerk();
};