import React, { ReactNode, createContext, useContext } from 'react';

// Mock Clerk context for development without Clerk key
const MockClerkContext = createContext({
  isSignedIn: false,
  isLoaded: true,
  userId: null as string | null,
  user: null,
});

export const useMockAuth = () => useContext(MockClerkContext);

interface MockClerkProviderProps {
  children: ReactNode;
}

/**
 * MockClerkProvider - Provides mock auth context when Clerk key is not available
 * Used for local development without Clerk authentication
 */
export const MockClerkProvider: React.FC<MockClerkProviderProps> = ({ children }) => {
  console.log('[MockClerkProvider] Running in development mode without Clerk');

  return (
    <MockClerkContext.Provider value={{ isSignedIn: false, isLoaded: true, userId: null, user: null }}>
      {children}
    </MockClerkContext.Provider>
  );
};

export default MockClerkProvider;
