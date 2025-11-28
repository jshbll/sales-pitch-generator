import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

/**
 * Hook to check if a business has any locations created
 * Used to determine if onboarding needs to be shown before allowing
 * promotion or event creation
 */
export function useBusinessLocations(businessId: string | null) {
  // Fetch all locations for the business
  const locations = useQuery(
    api.businessLocations.getBusinessLocations,
    businessId ? { 
      businessId: businessId as Id<"businesses">,
      activeOnly: false // Get all locations, not just active ones
    } : "skip"
  );

  // Loading state - locations will be undefined while loading
  const isLoading = locations === undefined && businessId !== null;
  
  // Check if business has any locations
  const hasLocations = locations && locations.length > 0;
  
  // Get the primary location if it exists
  const primaryLocation = locations?.find(loc => loc.is_primary) || locations?.[0];
  
  return {
    locations: locations || [],
    hasLocations: !!hasLocations,
    isLoading,
    primaryLocation,
    locationsCount: locations?.length || 0
  };
}