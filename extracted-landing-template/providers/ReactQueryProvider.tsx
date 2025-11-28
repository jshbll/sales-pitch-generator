/**
 * ReactQueryProvider.tsx
 * Provider for React Query with application-wide configuration
 */
import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface ReactQueryProviderProps {
  children: ReactNode;
}

/**
 * Default query configuration options for our app
 */
const defaultQueryOptions = {
  queries: {
    refetchOnWindowFocus: false, // Don't refetch on window focus by default
    retry: 1, // Only retry failed queries once by default
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
  },
};

/**
 * Creates a React Query client with app-specific configuration
 * @returns A configured QueryClient instance
 */
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
  });
};

/**
 * Provider component that configures React Query for the application
 */
const ReactQueryProvider: React.FC<ReactQueryProviderProps> = ({ children }) => {
  // Create a client for React Query
  const [queryClient] = React.useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;
