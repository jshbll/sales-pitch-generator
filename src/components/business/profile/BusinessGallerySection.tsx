import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import { businessPhotosService } from '../../../services/serviceSelector';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import BusinessPhotoGallery from '../BusinessPhotoGallery';

interface BusinessGallerySectionProps {
  businessData: any;
  onProfileItemUpdate: (itemId: string, completed: boolean) => void;
  locationId?: string | null;
}

const BusinessGallerySection: React.FC<BusinessGallerySectionProps> = ({
  businessData,
  onProfileItemUpdate,
  locationId,
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Get location-specific data
  const locationData = useQuery(
    api.businessLocations.getLocationById,
    locationId ? { locationId: locationId as Id<"business_locations"> } : "skip"
  );

  // Get all business photos (for both display and the shared library)
  const businessId = (businessData?._id || businessData?.id) as Id<"businesses"> | undefined;
  const allBusinessPhotos = useQuery(
    api.businesses.getBusinessPhotos,
    businessId ? { businessId } : "skip"
  );

  // Get location-specific photos to check if they exist
  const locationSpecificPhotos = useQuery(
    api.galleryPhotos.getLocationGalleryPhotos,
    locationId ? { locationId: locationId as Id<"business_locations"> } : "skip"
  );

  // Use location-specific photos if they exist, otherwise show all business photos
  // This provides a hybrid approach during the transition period
  const photosToDisplay = React.useMemo(() => {
    if (locationSpecificPhotos && locationSpecificPhotos.length > 0) {
      // Convert location-specific photos to BusinessPhoto format
      return locationSpecificPhotos.map(photo => ({
        id: photo._id,
        business_id: photo.business_id,
        image_url: photo.image_url,
        image_id: photo.image_id,
        caption: photo.caption || '',
        alt_text: photo.alt_text || '',
        photo_type: photo.photo_type,
        is_featured: photo.is_featured || false,
        display_order: photo.display_order,
        created_at: new Date(photo._creationTime).toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }
    // Fallback to all business photos if no location-specific photos exist
    return allBusinessPhotos || [];
  }, [locationSpecificPhotos, allBusinessPhotos]);

  // Convex mutation for updating location content
  const updateLocationContent = useMutation(api.businessLocations.updateLocationContent);

  // Update profile completion when gallery changes
  React.useEffect(() => {
    if (photosToDisplay && locationData) {
      const hasPhotos = photosToDisplay.length > 0;
      onProfileItemUpdate('photos', hasPhotos);
    }
  }, [photosToDisplay, locationData, onProfileItemUpdate]);

  // Show loading state if no location is selected or data is loading
  if (!locationId || locationData === undefined) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          {!locationId ? 'Select a location to manage its photo gallery' : 'Loading photo gallery...'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Main Gallery wrapped in consistent card style */}
      <Card
        sx={{
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header inside card */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                mb: 1,
              }}
            >
              Photo Gallery
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
            >
              Manage your business photos and showcase your products, services, and location
            </Typography>
          </Box>
          
          <BusinessPhotoGallery
          businessId={businessId || ''}
          photos={photosToDisplay}
          allBusinessPhotos={allBusinessPhotos || []}
          isEditing={true}
          maxHeight={isMobile ? 400 : 600}
          isLocationSpecific={true}
          locationName={locationData?.name}
          locationId={locationId}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default BusinessGallerySection;