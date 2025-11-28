// Local shared types - replaces @jaxsaver/shared/types

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
