/**
 * Role utility functions for handling case-insensitive role validation
 */
import { UserRole } from '../types';

/**
 * Normalize a role string to match the UserRole enum format
 * @param role The role string to normalize
 * @returns The normalized role string
 */
export const normalizeRole = (role: string | UserRole): string => {
  if (typeof role !== 'string') {
    return String(role);
  }
  return role.toLowerCase();
};

/**
 * Check if a user role matches a target role, ignoring case
 * @param userRole The user's role (can be any case)
 * @param targetRole The target role to compare against
 * @returns True if the roles match (case-insensitive), false otherwise
 */
export const roleMatches = (userRole: string | UserRole, targetRole: UserRole): boolean => {
  const normalizedUserRole = normalizeRole(userRole);
  const normalizedTargetRole = normalizeRole(targetRole);
  return normalizedUserRole === normalizedTargetRole;
};

/**
 * Check if a user has any of the specified roles
 * @param userRole The user's role (can be any case)
 * @param targetRoles Array of target roles to check against
 * @returns True if the user has any of the specified roles, false otherwise
 */
export const hasAnyRole = (userRole: string | UserRole, targetRoles: UserRole[]): boolean => {
  return targetRoles.some(role => roleMatches(userRole, role));
};

/**
 * Convert a string role to the corresponding UserRole enum value
 * @param role The role string to convert
 * @returns The corresponding UserRole enum value, or undefined if not found
 */
export const toUserRole = (role: string | UserRole): UserRole | undefined => {
  const normalizedRole = normalizeRole(role);
  
  // Find the matching enum value
  const matchingRole = Object.values(UserRole).find(
    enumValue => normalizeRole(enumValue) === normalizedRole
  );
  
  return matchingRole;
};
