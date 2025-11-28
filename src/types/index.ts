// Core auth types (moved from shared/types.ts)
export enum UserRole {
  USER = 'user',
  BUSINESS = 'business',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified?: boolean;
  isActive?: boolean;
  phoneNumber?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  businessId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// API Response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Address type
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

// Business Hours type
export interface BusinessHours {
  monday?: { open: string; close: string; closed?: boolean };
  tuesday?: { open: string; close: string; closed?: boolean };
  wednesday?: { open: string; close: string; closed?: boolean };
  thursday?: { open: string; close: string; closed?: boolean };
  friday?: { open: string; close: string; closed?: boolean };
  saturday?: { open: string; close: string; closed?: boolean };
  sunday?: { open: string; close: string; closed?: boolean };
}

// Business Profile type
export interface BusinessProfile {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: Address;
  hours?: BusinessHours;
  category?: string;
  subcategory?: string;
  logo_url?: string;
  cover_image_url?: string;
  social_media?: Record<string, string>;
  is_verified?: boolean;
  is_active?: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
  owner_id?: string;
  clerk_user_id?: string;
  subscription_tier?: string;
  first_name?: string;
  last_name?: string;
}

// Business Category type
export interface BusinessCategory {
  id: string | number;
  name: string;
  parent_id?: string | null;
  description?: string;
  subcategories?: BusinessCategory[];
}

// Promotion type
export interface Promotion {
  id: string;
  title: string;
  description?: string;
  discount_type?: 'percentage' | 'fixed' | 'bogo';
  discount_value?: number;
  start_date?: string | Date;
  end_date?: string | Date;
  terms?: string;
  is_active?: boolean;
  business_id?: string;
  location_id?: string;
  image_url?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
}

// Saved Promotion type
export interface SavedPromotion {
  id: string;
  promotion_id: string;
  user_id: string;
  saved_at: string | Date;
  promotion?: Promotion;
}

// Coupon Claim type
export interface CouponClaim {
  id: string;
  promotion_id: string;
  user_id: string;
  claimed_at: string | Date;
  redeemed_at?: string | Date;
  status: 'claimed' | 'redeemed' | 'expired';
}

// Event type
export interface Event {
  id: string;
  title: string;
  description?: string;
  start_datetime: string | Date;
  end_datetime?: string | Date;
  location?: string;
  business_id?: string;
  image_url?: string;
  is_active?: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
}

// Re-export from other type files
export * from './onboarding';
export * from './business.types';
