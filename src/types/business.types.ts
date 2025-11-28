/**
 * Business category type definition
 */
export interface BusinessCategory {
  id: string | number;
  name: string;
  parent_id?: string | null;
  description?: string;
  subcategories?: BusinessCategory[];
}

// Removed unused imports - Address and BusinessHours are now referenced through index.ts

/**
 * Social Media links structure
 */
export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  snapchat?: string;
}

/**
 * Re-exporting BusinessProfile from index.ts for consistency
 * This ensures we only have one definition of BusinessProfile in the codebase
 */
import type { BusinessProfile } from './index';
export type { BusinessProfile };
