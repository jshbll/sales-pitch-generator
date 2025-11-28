# API Integration with React Query

## Overview

This directory contains utilities for API integration using React Query. The implementation follows a standardized pattern for error handling, data caching, and optimistic updates.

## Key Components

### ReactQueryProvider

The `ReactQueryProvider` component wraps the entire application, providing React Query functionality to all components. It's configured with sensible defaults for our application's needs:

- **Refetch on Window Focus**: Disabled by default to prevent unnecessary refetches
- **Retry Logic**: Default retry limit of 1, with custom retry logic based on error type
- **Stale Time**: Data is considered fresh for 5 minutes by default
- **Cache Time**: Unused data is kept in cache for 10 minutes

### ApiClient

The `ApiClient` class provides methods for making HTTP requests to our API. It:

- Automatically handles authentication headers
- Processes responses to extract data from our standard API response format
- Implements consistent error handling
- Provides typed methods for all HTTP verbs (GET, POST, PUT, PATCH, DELETE)

### Error Handling

The `error-handling.ts` module provides utilities for:

- Custom `ApiError` class with contextual information about the error
- Smart retry logic based on error type (network errors, server errors, etc.)
- Exponential backoff with jitter for retry attempts
- Consistent error transformation for all API requests

## Usage Patterns

### Data Fetching with useQuery

```tsx
import { useBusinessCategories } from '../hooks/api/useBusinessApi';

function BusinessCategorySelector() {
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch
  } = useBusinessCategories();
  
  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorMessage message={error.message} onRetry={refetch} />;
  
  return (
    <CategoryList categories={categories} />
  );
}
```

### Data Mutation with useMutation

```tsx
import { useUpdateBusinessProfile } from '../hooks/api/useBusinessApi';

function BusinessProfileForm({ profile }) {
  const {
    mutate: updateProfile,
    isLoading,
    isError,
    error
  } = useUpdateBusinessProfile({
    // When successful, invalidate the profile query to refetch
    onSuccess: () => {
      queryClient.invalidateQueries(['business', 'profile']);
      showSuccessToast('Profile updated successfully');
    },
    // Optimistic update
    onMutate: async (newProfile) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(['business', 'profile']);
      
      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData(['business', 'profile']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['business', 'profile'], old => ({
        ...old,
        ...newProfile
      }));
      
      // Return context with the previous value
      return { previousProfile };
    },
    // If mutation fails, use the context returned from onMutate to roll back
    onError: (err, newProfile, context) => {
      queryClient.setQueryData(
        ['business', 'profile'],
        context?.previousProfile
      );
      showErrorToast('Failed to update profile');
    }
  });
  
  const handleSubmit = (formData) => {
    updateProfile(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {isLoading && <LoadingIndicator />}
      {isError && <ErrorMessage error={error} />}
      <button type="submit" disabled={isLoading}>Save</button>
    </form>
  );
}
```

## Best Practices

1. **Use QueryKeys Consistently**: Always use the predefined query keys exported from the API hooks.
2. **Provide Default Values**: Always provide default values for data (e.g., `data: categories = []`).
3. **Handle Loading and Error States**: Always handle loading and error states in your components.
4. **Prefer Optimistic Updates**: For mutations, implement optimistic updates when possible.
5. **Leverage Prefetching**: Use prefetch functions for data that will be needed soon.
