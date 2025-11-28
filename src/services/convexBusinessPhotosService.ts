import { ConvexClientManager } from '../shared/convex-client';
import { createConvexAPI } from '../shared/convex-api';
import { Id } from '../../convex/_generated/dataModel';
import { api } from '../../convex/_generated/api';
import { processImageFile } from '../utils/imageUtils';

export interface BusinessPhoto {
  id: string;
  business_id: string;
  image_url?: string; // Computed from image_id
  image_id: string;
  caption?: string;
  alt_text?: string;
  photo_type: string; // Allow any string for custom folder names
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PhotoUploadData {
  data_url: string;
  caption?: string;
  alt_text?: string;
  photo_type?: string; // Allow any string for custom folder names
}

// Convert Convex business photo to local BusinessPhoto interface
function convertFromConvexBusinessPhoto(convexPhoto: any): BusinessPhoto {
  // Handle both old format (_id, _creationTime) and new format (id, etc.)
  return {
    id: convexPhoto.id || convexPhoto._id,
    business_id: convexPhoto.business_id,
    image_url: convexPhoto.image_url,
    image_id: convexPhoto.image_id,
    caption: convexPhoto.caption || '',
    alt_text: convexPhoto.alt_text || '',
    photo_type: convexPhoto.photo_type,
    is_featured: convexPhoto.is_featured || false,
    display_order: convexPhoto.display_order || 0,
    created_at: convexPhoto._creationTime ? new Date(convexPhoto._creationTime).toISOString() : new Date().toISOString(),
    updated_at: new Date().toISOString(), // Convex doesn't track update time automatically
  };
}

/**
 * Convex-based service for managing business photos
 */
class ConvexBusinessPhotosService {
  private api: ReturnType<typeof createConvexAPI> | null;

  constructor() {
    // Initialize the API lazily to avoid initialization order issues
    this.api = null;
  }

  private getAPI() {
    if (!this.api) {
      const convexClient = ConvexClientManager.getInstance();
      this.api = createConvexAPI(convexClient);
    }
    return this.api;
  }

  /**
   * Get all photos for a business
   */
  async getBusinessPhotos(businessId: string, photoType?: string): Promise<{
    success: boolean;
    data?: BusinessPhoto[];
    error?: string;
  }> {
    console.log(`[ConvexBusinessPhotosService] Getting photos for business: ${businessId}, type: ${photoType}`);
    
    try {
      // Use the updated businesses.getBusinessPhotos which queries gallery_photos
      const convexPhotos = await this.getAPI().query(api.businesses.getBusinessPhotos, {
        businessId: businessId as Id<"businesses">
      });

      console.log(`[ConvexBusinessPhotosService] Raw response from Convex:`, convexPhotos);

      if (!convexPhotos || convexPhotos.length === 0) {
        console.log(`[ConvexBusinessPhotosService] No photos found - returning empty array`);
        return {
          success: true,
          data: []
        };
      }

      // Filter by photo type if specified
      const filteredPhotos = photoType 
        ? convexPhotos.filter(photo => photo.photo_type === photoType)
        : convexPhotos;

      console.log(`[ConvexBusinessPhotosService] After filtering by type '${photoType}': ${filteredPhotos.length} photos`);

      const photos = filteredPhotos.map(convertFromConvexBusinessPhoto);
      console.log(`[ConvexBusinessPhotosService] Converted photos:`, photos);

      return {
        success: true,
        data: photos
      };
    } catch (error) {
      console.error('[ConvexBusinessPhotosService] Error fetching photos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Helper function to get gallery name from photo type
   */
  private getGalleryNameFromPhotoType(photoType: string): string {
    switch (photoType) {
      case "gallery":
        return "Gallery";
      case "product":
        return "Products";
      case "service":
        return "Services";
      case "location":
        return "Location";
      case "team":
        return "Team";
      default:
        // For custom types, capitalize first letter
        return photoType ? 
          photoType.charAt(0).toUpperCase() + photoType.slice(1) : 
          "Gallery";
    }
  }

  /**
   * Upload multiple photos for a business with metadata
   */
  async uploadBusinessPhotos(businessId: string, files: File[], photoData?: Array<{
    file: File;
    caption?: string;
    photoType?: string;
    isFeatured?: boolean;
  }>, locationId?: string): Promise<{
    success: boolean;
    data?: BusinessPhoto[];
    error?: string;
  }> {
    console.log(`[ConvexBusinessPhotosService] Uploading ${files.length} photos for business: ${businessId}`);
    console.trace('📍 Upload call stack - where is this being called from?');
    
    try {
      // Process and upload files sequentially to avoid timeout issues
      const uploadedPhotos = [];
      const totalFiles = files.length;
      
      for (let index = 0; index < totalFiles; index++) {
        const file = files[index];
        console.log(`[ConvexBusinessPhotosService] Processing file ${index + 1}/${totalFiles}: ${file.name}`);
        
        // Get metadata for this specific file
        const fileMetadata = photoData?.find(data => data.file === file) || {};
        const photoType = fileMetadata.photoType || 'gallery';
        const caption = fileMetadata.caption || '';
        const isFeatured = fileMetadata.isFeatured || false;
        
        // Process the image file
        let dataUrl;
        try {
          dataUrl = await processImageFile(file);
        } catch (processError) {
          console.error(`[ConvexBusinessPhotosService] Error processing file ${file.name}:`, processError);
          throw processError;
        }
        
        // Upload with retry logic for timeout errors
        let retryCount = 0;
        const maxRetries = 2;
        let lastError = null;
        
        while (retryCount <= maxRetries) {
          try {
            console.log(`[ConvexBusinessPhotosService] Uploading ${file.name} (attempt ${retryCount + 1}/${maxRetries + 1})`);
            
            const uploadResult = await this.getAPI().action(api.images.uploadImageFromBase64, {
              dataUrl,
              filename: file.name,
              metadata: {
                businessId,
                photoType,
                originalName: file.name
              }
            });
            
            console.log(`[ConvexBusinessPhotosService] Successfully uploaded ${file.name}`);
            
            uploadedPhotos.push({
              imageUrl: uploadResult.url,
              imageId: uploadResult.id,
              caption,
              altText: file.name.replace(/\.[^/.]+$/, ''), // Filename without extension as alt text
              photoType,
              isFeatured
            });
            
            break; // Success, exit retry loop
            
          } catch (uploadError: any) {
            lastError = uploadError;
            console.error(`[ConvexBusinessPhotosService] Upload error for ${file.name}:`, uploadError);
            
            // Check if it's a timeout/slow connection error
            const errorMessage = uploadError.message || '';
            if (errorMessage.includes('slow connection') || 
                errorMessage.includes('408') || 
                errorMessage.includes('timeout') ||
                errorMessage.includes('5408')) {
              
              retryCount++;
              if (retryCount <= maxRetries) {
                console.log(`[ConvexBusinessPhotosService] Timeout detected, retrying in 3 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                continue;
              }
            }
            
            // For non-timeout errors or max retries reached, throw the error
            throw lastError;
          }
        }
        
        // Small delay between uploads to avoid overwhelming the connection
        if (index < totalFiles - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log(`[ConvexBusinessPhotosService] Successfully processed ${uploadedPhotos.length} photos`);

      // Create photo records in the new gallery_photos system
      // We'll need to get the business's primary location for the upload
      const business = await this.getAPI().query(api.businesses.getBusiness, {
        businessId: businessId as Id<"businesses">
      });

      if (!business) {
        throw new Error('Business not found');
      }

      // Get the target location for upload
      let targetLocation;
      if (locationId) {
        // Use provided locationId
        targetLocation = await this.getAPI().query(api.businessLocations.getLocationById, {
          locationId: locationId as Id<"business_locations">
        });
        if (!targetLocation) {
          throw new Error(`Location with ID ${locationId} not found`);
        }
      } else {
        // Fallback to primary location for backward compatibility
        const locations = await this.getAPI().query(api.businessLocations.getBusinessLocations, {
          businessId: businessId as Id<"businesses">
        });
        targetLocation = locations?.find(loc => loc.is_primary) || locations?.[0];
        if (!targetLocation) {
          throw new Error('No location found for business');
        }
      }

      // Upload photos to the new gallery_photos system using individual uploads 
      // This allows each photo to have its own photo_type, caption, etc.
      console.log(`[ConvexBusinessPhotosService] Uploading ${uploadedPhotos.length} photos to gallery_photos system`);
      console.log(`[ConvexBusinessPhotosService] Target location:`, targetLocation._id);
      console.log(`[ConvexBusinessPhotosService] Upload data:`, uploadedPhotos);
      
      const photoIds = [];
      for (const uploadedPhoto of uploadedPhotos) {
        console.log(`[ConvexBusinessPhotosService] Creating gallery photo:`, {
          photoType: uploadedPhoto.photoType,
          caption: uploadedPhoto.caption,
          altText: uploadedPhoto.altText,
          isFeatured: uploadedPhoto.isFeatured
        });
        
        // Derive gallery name from photo type
        const galleryName = this.getGalleryNameFromPhotoType(uploadedPhoto.photoType);
        
        const photoId = await this.getAPI().mutation(api.galleryPhotos.createGalleryPhoto, {
          businessId: businessId as Id<"businesses">,
          locationId: targetLocation._id,
          galleryName: galleryName,
          photoType: uploadedPhoto.photoType,
          imageId: uploadedPhoto.imageId,
          imageUrl: uploadedPhoto.imageUrl,
          caption: uploadedPhoto.caption,
          altText: uploadedPhoto.altText,
          isFeatured: uploadedPhoto.isFeatured
        });
        photoIds.push(photoId);
        console.log(`[ConvexBusinessPhotosService] Created gallery photo with ID:`, photoId);
      }

      // Fetch ALL photos for the business to return the complete updated list
      const allPhotos = await this.getAPI().query(api.businesses.getBusinessPhotos, {
        businessId: businessId as Id<"businesses">
      });

      const photos = allPhotos ? allPhotos.map(convertFromConvexBusinessPhoto) : [];

      console.log(`[ConvexBusinessPhotosService] Successfully uploaded ${photos.length} photos`);

      return {
        success: true,
        data: photos
      };
    } catch (error) {
      console.error('[ConvexBusinessPhotosService] Error uploading photos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update photo details
   */
  async updateBusinessPhoto(
    businessId: string, 
    photoId: string, 
    updateData: Partial<BusinessPhoto>
  ): Promise<{
    success: boolean;
    data?: BusinessPhoto;
    error?: string;
  }> {
    console.log(`[ConvexBusinessPhotosService] Updating photo ${photoId} for business ${businessId}`);
    
    try {
      const updates: any = {};
      
      if (updateData.caption !== undefined) updates.caption = updateData.caption;
      if (updateData.alt_text !== undefined) updates.alt_text = updateData.alt_text;
      if (updateData.photo_type !== undefined) updates.photo_type = updateData.photo_type;
      if (updateData.is_featured !== undefined) updates.is_featured = updateData.is_featured;
      if (updateData.display_order !== undefined) updates.display_order = updateData.display_order;

      const updatedPhoto = await this.getAPI().mutation(api.galleryPhotos.updateGalleryPhoto, {
        photoId: photoId as Id<"gallery_photos">,
        updates
      });

      if (!updatedPhoto) {
        return {
          success: false,
          error: 'Failed to update photo'
        };
      }

      return {
        success: true,
        data: convertFromConvexBusinessPhoto(updatedPhoto)
      };
    } catch (error) {
      console.error('[ConvexBusinessPhotosService] Error updating photo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete a business photo
   */
  async deleteBusinessPhoto(businessId: string, photoId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    console.log(`[ConvexBusinessPhotosService] Deleting photo ${photoId} for business ${businessId}`);
    
    try {
      await this.getAPI().mutation(api.galleryPhotos.deleteGalleryPhoto, {
        photoId: photoId as Id<"gallery_photos">
      });

      return { success: true };
    } catch (error) {
      console.error('[ConvexBusinessPhotosService] Error deleting photo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update photo display order
   */
  async updatePhotoOrder(
    businessId: string, 
    photoUpdates: { id: string; display_order: number }[]
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    console.log(`[ConvexBusinessPhotosService] Updating photo order for business ${businessId}`);
    
    try {
      await this.getAPI().mutation(api.galleryPhotos.updatePhotoOrder, {
        photoUpdates: photoUpdates.map(update => ({
          photoId: update.id as Id<"gallery_photos">,
          display_order: update.display_order
        }))
      });

      return { success: true };
    } catch (error) {
      console.error('[ConvexBusinessPhotosService] Error updating photo order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export factory function to match the legacy service pattern
let _instance: ConvexBusinessPhotosService | null = null;

export function getConvexBusinessPhotosService(): ConvexBusinessPhotosService {
  if (!_instance) {
    _instance = new ConvexBusinessPhotosService();
  }
  return _instance;
}

// Export singleton instance to match legacy service pattern
export const convexBusinessPhotosService = getConvexBusinessPhotosService();
export default convexBusinessPhotosService;