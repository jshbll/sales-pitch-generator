import { UserRole } from '../types';

/**
 * Helper function to determine default route based on user role
 */
export const getDefaultRoute = (role?: UserRole | string): string => {
  if (!role) return '/login'; // Default to login if role is undefined
  
  // Handle both UserRole enum and string values
  const normalizedRole = typeof role === 'string' ? role.toLowerCase() : role;
  
  switch (normalizedRole) {
    case UserRole.ADMIN:
    case 'admin':
      return '/admin/dashboard';
    case UserRole.BUSINESS:
    case 'business':
      return '/business/dashboard';
    case UserRole.USER:
    case 'user':
      return '/dashboard'; // Regular users go to their dashboard
    default:
      return '/dashboard'; // Default to user dashboard
  }
};
