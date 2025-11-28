import { createContext } from 'react';
import { User, AuthResponse, UserRole } from '../shared/types';

// Define the shape of the context state
export interface AuthContextState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;  // Alias for backward compatibility
  error: string | null;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<User | null>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

// Create the context with a default value
// Ensure this context is the one used by AuthProvider and consumed by hooks/useAuth.ts
export const AuthContext = createContext<AuthContextState | undefined>(undefined);
