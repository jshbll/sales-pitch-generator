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

// BusinessProfile is defined in index.ts to avoid circular imports
