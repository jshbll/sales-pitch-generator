// Legacy convex-api stub - these methods are no longer used in the main app flow
// (App uses Clerk auth and direct Convex mutations instead)

import { ConvexReactClient } from 'convex/react';

// Stub types for backward compatibility
export interface User {
  _id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'business' | 'user';
  phone?: string;
  profile_image_url?: string;
  profile_image_id?: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  is_active: boolean;
  email_verified: boolean;
  created_at?: number;
  updated_at?: number;
}

export interface BaseBusiness {
  _id: string;
  name: string;
  owner_id?: string;
  email?: string;
}

export interface ConvexAPI {
  getUserByEmail: (email: string) => Promise<User | null>;
  createUser: (user: Omit<User, '_id' | 'created_at' | 'updated_at'>) => Promise<string | null>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  getBusinessByOwner: (ownerId: string) => Promise<BaseBusiness | null>;
}

/**
 * Stub implementation of createConvexAPI
 * This is a legacy function that is no longer used in the main app flow.
 * The app now uses Clerk auth and direct Convex mutations.
 */
export function createConvexAPI(_client: ConvexReactClient): ConvexAPI {
  console.warn('[convex-api] Using stub createConvexAPI - this is legacy code');

  return {
    getUserByEmail: async () => {
      console.warn('[convex-api] getUserByEmail is a legacy stub');
      return null;
    },
    createUser: async () => {
      console.warn('[convex-api] createUser is a legacy stub');
      return null;
    },
    updateUser: async () => {
      console.warn('[convex-api] updateUser is a legacy stub');
    },
    getBusinessByOwner: async () => {
      console.warn('[convex-api] getBusinessByOwner is a legacy stub');
      return null;
    },
  };
}
