import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Stack,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Divider,
  InputAdornment,
  Tooltip,
  Avatar,
  Badge,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as MenuIcon,
  Category as CategoryIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  Image as ImageIcon,
  CloudUpload as CloudUploadIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';
import { useSnackbar } from 'notistack';
import { api } from '../../../../convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import unifiedImageService from '../../../services/unifiedImageService';
import MenuItemImageUploadDialog from '../MenuItemImageUploadDialog';

interface BusinessMenuSectionProps {
  businessData: any;
  onProfileItemUpdate: (itemId: string, completed: boolean) => void;
  locationId?: string | null;
}

interface MenuCategory {
  _id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  items?: MenuItem[];
}

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price_type: 'none' | 'fixed' | 'starting_at' | 'per_hour' | 'per_item' | 'call_for_quote';
  price_value?: number;
  price_display?: string;
  is_available: boolean;
  badge?: string;  // Changed from badges?: string[] to single badge
  display_order: number;
  category_id?: string;
  images?: string[];  // Array of image URLs (legacy)
  image_metadata?: Array<{  // Image metadata with captions
    url: string;
    caption?: string;
  }>;
}

const BusinessMenuSectionFixed: React.FC<BusinessMenuSectionProps> = ({
  businessData,
  onProfileItemUpdate,
  locationId,
}) => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const businessId = user?.id || user?.businessId;
  
  // Convex mutations
  const createCategory = useMutation(api.businessMenu.createMenuCategory);
  const updateCategory = useMutation(api.businessMenu.updateMenuCategory);
  const deleteCategory = useMutation(api.businessMenu.deleteMenuCategory);
  const createItem = useMutation(api.businessMenu.createMenuItem);
  const updateItem = useMutation(api.businessMenu.updateMenuItem);
  const deleteItem = useMutation(api.businessMenu.deleteMenuItem);
  const toggleItemAvailability = useMutation(api.businessMenu.toggleMenuItemAvailability);
  const reorderItems = useMutation(api.businessMenu.reorderMenuItems);
  
  // Convex queries - include inactive items so users can re-enable them
  const menuData = useQuery(api.businessMenu.getCompleteMenu, 
    businessId ? { business_id: businessId as any, include_inactive: true } : 'skip'
  );
  
  // State for inline editing
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  
  // Temp editing states
  const [editingItemData, setEditingItemData] = useState<Partial<MenuItem>>({});
  const [editingCategoryData, setEditingCategoryData] = useState<Partial<MenuCategory>>({});
  
  // Image upload states - using simplified image upload dialog
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageManagementOpen, setImageManagementOpen] = useState(false);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [editingCaption, setEditingCaption] = useState<string>('');
  const [isSavingCaption, setIsSavingCaption] = useState(false);
  
  // DnD Kit sensors - disable when editing
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const priceTypes = [
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'starting_at', label: 'Starting At' },
    { value: 'per_hour', label: 'Per Hour' },
    { value: 'per_item', label: 'Per Item' },
    { value: 'call_for_quote', label: 'Call for Quote' },
  ];

  const badgeOptions = ['Popular', 'New', 'Featured', 'Best Seller', 'Seasonal'];
  
  // Handle drag end for reordering items
  const handleDragEnd = async (event: DragEndEvent, categoryId?: string) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const items = categoryId 
        ? menuData?.categories.find(c => c._id === categoryId)?.items || []
        : menuData?.uncategorized_items || [];
      
      const oldIndex = items.findIndex(item => item._id === active.id);
      const newIndex = items.findIndex(item => item._id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update display orders
        const itemOrders = newItems.map((item, index) => ({
          item_id: item._id as any,
          display_order: index,
          category_id: categoryId as any,
        }));
        
        try {
          await reorderItems({
            business_id: businessId as any,
            item_orders: itemOrders,
          });
          enqueueSnackbar('Items reordered successfully', { variant: 'success' });
        } catch (error) {
          console.error('Error reordering items:', error);
          enqueueSnackbar('Failed to reorder items', { variant: 'error' });
        }
      }
    }
  };

  // Helper functions to separate available and unavailable items
  const getAvailableItems = (items: MenuItem[]) => items.filter(item => item.is_available);
  const getUnavailableItems = (items: MenuItem[]) => items.filter(item => !item.is_available);
  
  // Helper function to get categories with available items
  const getCategoriesWithAvailableItems = () => {
    if (!menuData) return [];
    return menuData.categories.map(category => ({
      ...category,
      items: getAvailableItems(category.items || [])
    })).filter(category => category.items.length > 0 || category.is_active);
  };

  // Helper function to get categories with unavailable items
  const getCategoriesWithUnavailableItems = () => {
    if (!menuData) return [];
    return menuData.categories.map(category => ({
      ...category,
      items: getUnavailableItems(category.items || [])
    })).filter(category => category.items.length > 0);
  };

  // Track profile completion without causing infinite loops
  useEffect(() => {
    if (menuData) {
      console.log('Menu data updated:', menuData);
      const hasMenuItems = menuData.categories.some(cat => cat.items && cat.items.length > 0) || 
                          menuData.uncategorized_items.length > 0;
      onProfileItemUpdate('menu', hasMenuItems);
    }
  }, [menuData]); // Only depend on menuData, not onProfileItemUpdate to prevent infinite loop
  
  // Auto-save when component unmounts or when navigating away
  useEffect(() => {
    return () => {
      // Save any pending changes when component unmounts
      if (editingItem && editingItemData.name && editingItemData.name.trim()) {
        // Note: Can't use async in cleanup, but the mutation will still complete
        updateItem({
          item_id: editingItem as any,
          name: editingItemData.name,
          description: editingItemData.description,
          price_type: editingItemData.price_type,
          price_value: editingItemData.price_value,
          badge: editingItemData.badge,
        });
      }
    };
  }, [editingItem, editingItemData]);

  // Initialize caption when carousel opens or index changes
  useEffect(() => {
    if (carouselOpen && selectedItem) {
      const imageData = getImageData(selectedItem);
      const currentCaption = imageData[carouselIndex]?.caption || '';
      setEditingCaption(currentCaption);
    }
  }, [carouselOpen, carouselIndex, selectedItem]);

  // Image management functions
  const openImageManagement = (item: MenuItem) => {
    console.log('Opening image management for menu item:', item);
    setSelectedItem(item);
    setImageManagementOpen(true);
  };

  const openImagePicker = (item: MenuItem) => {
    console.log('Opening image picker for menu item:', item);
    setSelectedItem(item);
    setImageUploadOpen(true);
  };

  const handleDeleteImage = async (item: MenuItem, imageUrl: string) => {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    try {
      // Get current image data (handles both legacy and new format)
      const imageData = getImageData(item);

      // Filter out the image from both arrays
      const updatedImages = (item.images || []).filter(url => url !== imageUrl);
      const updatedImageMetadata = imageData.filter(img => img.url !== imageUrl);

      await updateItem({
        item_id: item._id as any,
        images: updatedImages,  // Update legacy format
        image_metadata: updatedImageMetadata,  // Update new format
      });

      enqueueSnackbar('Image deleted successfully!', { variant: 'success' });

      // Update selectedItem to reflect the change
      if (selectedItem && selectedItem._id === item._id) {
        setSelectedItem({
          ...selectedItem,
          images: updatedImages,
          image_metadata: updatedImageMetadata
        });
      }
    } catch (error) {
      console.error('Error removing image:', error);
      enqueueSnackbar('Error deleting image', { variant: 'error' });
    }
  };

  // Helper function to get all images with captions (migrate from old format if needed)
  const getImageData = (item: MenuItem) => {
    // If image_metadata exists, use it
    if (item.image_metadata && item.image_metadata.length > 0) {
      return item.image_metadata;
    }
    // Otherwise, migrate from images array (legacy format)
    if (item.images && item.images.length > 0) {
      return item.images.map(url => ({ url, caption: '' }));
    }
    return [];
  };

  // Handle caption update
  const handleUpdateCaption = async (newCaption: string) => {
    if (!selectedItem) return;

    setIsSavingCaption(true);
    try {
      const imageData = getImageData(selectedItem);
      const updatedImageData = imageData.map((img, idx) =>
        idx === carouselIndex
          ? { ...img, caption: newCaption }
          : img
      );

      await updateItem({
        item_id: selectedItem._id as any,
        image_metadata: updatedImageData,
      });

      // Update local state
      setSelectedItem({
        ...selectedItem,
        image_metadata: updatedImageData,
      });

      enqueueSnackbar('Caption updated successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error updating caption:', error);
      enqueueSnackbar('Error updating caption', { variant: 'error' });
    } finally {
      setIsSavingCaption(false);
    }
  };

  // Handle image upload from simplified dialog
  const handleImageUpload = async (uploadData: any[]) => {
    if (!selectedItem) {
      console.log('handleImageUpload called but no selectedItem');
      return;
    }

    console.log('🎯 [Menu Item Images] Upload started for item:', selectedItem.name);
    console.log('📸 [Menu Item Images] Upload data:', uploadData.length);

    setIsUploading(true);

    try {
      // Get existing image_metadata or migrate from images
      const existingImageData = getImageData(selectedItem);

      // Upload each file individually using unifiedImageService.uploadImage
      const uploadPromises = uploadData.map(async (data, index) => {
        try {
          // Convert file to base64 data URL
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(data.file);
          });

          // Generate filename
          const timestamp = Date.now();
          const filename = `menu_item_${businessId}_${timestamp}_${index}.${data.file.name.split('.').pop()}`;

          // Upload using unifiedImageService
          const uploadResult = await unifiedImageService.uploadImage(
            dataUrl,
            filename,
            {
              businessId: businessId!,
              type: 'product',
              caption: data.caption || ''
            }
          );

          if (!uploadResult.success) {
            throw new Error(uploadResult.error || 'Upload failed');
          }

          return {
            url: uploadResult.url,
            caption: data.caption || ''
          };
        } catch (error) {
          console.error('❌ [Menu Item Images] Upload failed for file:', data.file.name, error);
          throw error;
        }
      });

      const uploadedImageData = await Promise.all(uploadPromises);
      console.log('✅ [Menu Item Images] Upload successful, adding images to menu item');

      // Combine existing and new image data
      const allImageData = [...existingImageData, ...uploadedImageData];

      // Update the menu item with new images using image_metadata
      console.log('📝 [Menu Item Images] Updating item with', allImageData.length, 'total images');

      await updateItem({
        item_id: selectedItem._id as any,
        image_metadata: allImageData,
        // Keep images array for backward compatibility
        images: allImageData.map(img => img.url),
      });

      console.log('✅ [Menu Item Images] Images updated successfully for item:', selectedItem.name);
      enqueueSnackbar('Images uploaded successfully!', { variant: 'success' });

      setImageUploadOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('❌ [Menu Item Images] Error uploading images:', error);
      enqueueSnackbar('Error uploading images', { variant: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  // Category management
  const handleCreateCategory = async () => {
    if (!businessId || !categoryForm.name.trim()) return;

    try {
      await createCategory({
        business_id: businessId as any,
        name: categoryForm.name,
        description: categoryForm.description || undefined,
      });
      
      enqueueSnackbar('Category created successfully!', { variant: 'success' });
      setCategoryForm({ name: '', description: '' });
      setCategoryDialogOpen(false);
    } catch (error) {
      console.error('Error creating category:', error);
      enqueueSnackbar('Error creating category', { variant: 'error' });
    }
  };

  const startEditingCategory = (category: MenuCategory) => {
    setEditingCategory(category._id);
    setEditingCategoryData({ name: category.name, description: category.description });
  };

  const saveCategory = async (categoryId: string) => {
    try {
      await updateCategory({
        category_id: categoryId as any,
        name: editingCategoryData.name!,
        description: editingCategoryData.description,
      });
      
      enqueueSnackbar('Category updated successfully!', { variant: 'success' });
      setEditingCategory(null);
      setEditingCategoryData({});
    } catch (error) {
      console.error('Error updating category:', error);
      enqueueSnackbar('Error updating category', { variant: 'error' });
    }
  };

  const cancelEditingCategory = () => {
    setEditingCategory(null);
    setEditingCategoryData({});
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? All items in this category will be moved to uncategorized.')) return;

    try {
      await deleteCategory({ category_id: categoryId as any });
      enqueueSnackbar('Category deleted successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting category:', error);
      enqueueSnackbar('Error deleting category', { variant: 'error' });
    }
  };

  // Helper function to create "Uncategorized" category and move items
  const handleCreateUncategorizedCategory = async () => {
    if (!businessId || !menuData?.uncategorized_items.length) return;

    try {
      // Create the "Uncategorized" category
      const newCategoryId = await createCategory({
        business_id: businessId as any,
        name: 'Uncategorized',
        description: '',
      });

      // Move all uncategorized items to the new category
      const updatePromises = menuData.uncategorized_items.map(item =>
        updateItem({
          item_id: item._id as any,
          category_id: newCategoryId as any,
        })
      );

      await Promise.all(updatePromises);

      enqueueSnackbar('Uncategorized category created successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error creating uncategorized category:', error);
      enqueueSnackbar('Error creating uncategorized category', { variant: 'error' });
    }
  };

  // Edit handler for uncategorized section
  const handleEditUncategorized = async () => {
    // First, create the "Uncategorized" category and move items
    await handleCreateUncategorizedCategory();
  };

  // Delete handler for uncategorized items
  const handleDeleteAllUncategorized = async () => {
    if (!confirm('Are you sure you want to delete ALL uncategorized items? This cannot be undone.')) return;

    try {
      const deletePromises = menuData.uncategorized_items.map(item =>
        deleteItem({ item_id: item._id as any })
      );

      await Promise.all(deletePromises);

      enqueueSnackbar('All uncategorized items deleted successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting uncategorized items:', error);
      enqueueSnackbar('Error deleting uncategorized items', { variant: 'error' });
    }
  };

  // Item management
  const addNewItem = async (categoryId?: string) => {
    if (!businessId) return;

    try {
      await createItem({
        business_id: businessId as any,
        name: 'New Item',
        description: '',
        price_type: 'fixed',
        category_id: categoryId as any || undefined,
      });

      enqueueSnackbar('Item added successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error creating item:', error);
      enqueueSnackbar('Error creating item', { variant: 'error' });
    }
  };

  const startEditingItem = async (item: MenuItem, clearDefaults = false) => {
    // If we're currently editing a different item, save it first
    if (editingItem && editingItem !== item._id && editingItemData.name && editingItemData.name.trim()) {
      await saveItem(editingItem);
    }

    setEditingItem(item._id);
    setEditingItemData({
      name: clearDefaults && item.name === 'New Item' ? '' : item.name,
      description: item.description,
      price_type: item.price_type,
      price_value: item.price_value,
      badge: item.badge || '',
    });

    // Use setTimeout to ensure the field is rendered before focusing
    setTimeout(() => {
      // Try both mobile and desktop field IDs
      const desktopFieldId = `menu-item-name-${item._id}`;
      const mobileFieldId = `menu-item-name-mobile-${item._id}`;

      const field = document.getElementById(desktopFieldId) || document.getElementById(mobileFieldId);
      if (field) {
        (field as HTMLInputElement).focus();
      }
    }, 0);
  };

  const saveItem = async (itemId: string) => {
    // Validation: Item name is required
    if (!editingItemData.name || !editingItemData.name.trim()) {
      enqueueSnackbar('Item name is required', { variant: 'error' });
      return;
    }

    // Determine price_type: if no price value, set to 'none', otherwise keep user's selection or default to 'fixed'
    let priceType = editingItemData.price_type || 'fixed';
    if (!editingItemData.price_value || editingItemData.price_value <= 0) {
      priceType = 'none';
    }

    try {
      await updateItem({
        item_id: itemId as any,
        name: editingItemData.name.trim(),
        description: editingItemData.description,
        price_type: priceType,
        price_value: editingItemData.price_value,
        badge: editingItemData.badge,
      });

      enqueueSnackbar('Item updated successfully!', { variant: 'success' });
      setEditingItem(null);
      setEditingItemData({});
    } catch (error) {
      console.error('Error updating item:', error);
      enqueueSnackbar('Error updating item', { variant: 'error' });
    }
  };

  const cancelEditingItem = () => {
    setEditingItem(null);
    setEditingItemData({});
  };
  
  // Auto-save when clicking outside or pressing escape
  const handleStopEditingItem = async () => {
    if (editingItem && editingItemData.name && editingItemData.name.trim()) {
      await saveItem(editingItem);
    } else {
      cancelEditingItem();
    }
  };
  
  // Handle keyboard events for better UX
  const handleKeyDown = async (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Save on Enter (unless shift is held for multiline)
      e.preventDefault();
      if (editingItemData.name && editingItemData.name.trim()) {
        await saveItem(itemId);
      }
    } else if (e.key === 'Escape') {
      // Cancel on Escape
      e.preventDefault();
      cancelEditingItem();
    }
    // Tab key: Allow natural tabbing through fields without saving
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteItem({ item_id: itemId as any });
      enqueueSnackbar('Item deleted successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting item:', error);
      enqueueSnackbar('Error deleting item', { variant: 'error' });
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    try {
      await toggleItemAvailability({ item_id: itemId as any });
    } catch (error) {
      console.error('Error toggling availability:', error);
      enqueueSnackbar('Error updating availability', { variant: 'error' });
    }
  };

  const formatPrice = (item: MenuItem) => {
    if (item.price_display) return item.price_display;

    switch (item.price_type) {
      case 'none':
        return '-';
      case 'fixed':
        return item.price_value ? `$${item.price_value}` : '-';
      case 'starting_at':
        return item.price_value ? `Starting at $${item.price_value}` : '-';
      case 'per_hour':
        return item.price_value ? `$${item.price_value}/hr` : '-';
      case 'per_item':
        return item.price_value ? `$${item.price_value} each` : '-';
      case 'call_for_quote':
        return 'Call for Quote';
      default:
        return '-';
    }
  };

  // Mobile Card Component for Menu Items
  const renderMobileItemCard = (item: MenuItem, dragHandleProps?: any) => {
    const isEditing = editingItem === item._id;

    return (
      <Card
        key={item._id}
        sx={{
          mb: 2,
          boxShadow: 'none',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {/* Header with drag handle and availability */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              {!isEditing && !editingItem && dragHandleProps && (
                <Box
                  {...dragHandleProps}
                  sx={{
                    cursor: 'move',
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: 44,
                    minHeight: 44,
                    justifyContent: 'center',
                    '&:active': {
                      cursor: 'grabbing',
                    },
                  }}
                >
                  <DragIndicatorIcon sx={{ color: 'action.active' }} />
                </Box>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {item.is_available ? 'Available' : 'Unavailable'}
              </Typography>
            </Box>
            <Switch
              checked={item.is_available}
              onChange={() => handleToggleAvailability(item._id)}
              size="small"
            />
          </Box>

          {/* Item Name */}
          <Box
            onClick={() => {
              if (!isEditing) {
                startEditingItem(item, true);
              }
            }}
            sx={{ mb: 2, cursor: isEditing ? 'default' : 'pointer' }}
          >
            <TextField
              id={`menu-item-name-mobile-${item._id}`}
              value={isEditing ? (editingItemData.name || '') : item.name}
              onChange={isEditing ? (e) => setEditingItemData(prev => ({ ...prev, name: e.target.value })) : undefined}
              variant="standard"
              fullWidth
              required={isEditing}
              error={isEditing && (!editingItemData.name || !editingItemData.name.trim())}
              placeholder={isEditing && item.name === 'New Item' ? 'Enter item name (required)' : ''}
              label="Item Name"
              InputProps={{
                disableUnderline: !isEditing,
                readOnly: !isEditing,
                sx: {
                  fontSize: isEditing ? '1.125rem' : '1rem',
                  fontWeight: isEditing ? 400 : 600,
                  cursor: isEditing ? 'text' : 'pointer',
                  py: isEditing ? 1.5 : 0.5
                }
              }}
              InputLabelProps={{
                shrink: true,
                sx: { fontSize: isEditing ? '1rem' : '0.875rem' }
              }}
              onFocus={(e) => {
                if (e.target.value === 'New Item') {
                  e.target.select();
                }
              }}
              onKeyDown={isEditing ? (e) => handleKeyDown(e, item._id) : undefined}
              onClick={(e) => {
                if (isEditing) {
                  e.stopPropagation();
                }
              }}
            />
          </Box>

          {/* Description */}
          <Box
            onClick={() => {
              if (!isEditing) {
                startEditingItem(item);
              }
            }}
            sx={{ mb: 2, cursor: isEditing ? 'default' : 'pointer' }}
          >
            <TextField
              value={isEditing ? (editingItemData.description || '') : (item.description || '')}
              onChange={isEditing ? (e) => setEditingItemData(prev => ({ ...prev, description: e.target.value })) : undefined}
              variant="standard"
              fullWidth
              multiline
              rows={isEditing ? 3 : undefined}
              maxRows={isEditing ? undefined : 3}
              placeholder={!isEditing ? (item.description ? '' : 'Tap to add description') : 'Add description'}
              label="Description"
              InputProps={{
                disableUnderline: !isEditing,
                readOnly: !isEditing,
                sx: {
                  fontSize: isEditing ? '1rem' : '0.875rem',
                  cursor: isEditing ? 'text' : 'pointer',
                  py: isEditing ? 1 : 0.5
                }
              }}
              InputLabelProps={{
                shrink: true,
                sx: { fontSize: isEditing ? '1rem' : '0.875rem' }
              }}
              onKeyDown={isEditing ? (e) => handleKeyDown(e, item._id) : undefined}
              onClick={(e) => {
                if (isEditing) {
                  e.stopPropagation();
                }
              }}
            />
          </Box>

          {/* Price */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontSize: isEditing ? '0.875rem' : '0.75rem' }}>
              Price
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                onClick={() => !isEditing && startEditingItem(item)}
                sx={{ cursor: isEditing ? 'default' : 'pointer' }}
              >
                <TextField
                  type="number"
                  value={isEditing ? (editingItemData.price_value || '') : (item.price_value || '')}
                  onChange={isEditing ? (e) => setEditingItemData(prev => ({ ...prev, price_value: parseFloat(e.target.value) || undefined })) : undefined}
                  variant="standard"
                  sx={{ width: isEditing ? 120 : 100 }}
                  placeholder="0.00"
                  InputProps={{
                    disableUnderline: !isEditing,
                    readOnly: !isEditing,
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    sx: {
                      fontSize: isEditing ? '1.125rem' : '0.875rem',
                      cursor: isEditing ? 'text' : 'pointer',
                      py: isEditing ? 1 : 0
                    }
                  }}
                  onClick={(e) => {
                    if (isEditing) {
                      e.stopPropagation();
                    }
                  }}
                />
              </Box>

              {/* Only show dropdown when there's a price value */}
              {((isEditing && editingItemData.price_value && editingItemData.price_value > 0) ||
                (!isEditing && item.price_value && item.price_value > 0)) && (
                <FormControl variant="standard" sx={{ flex: 1 }}>
                  <Select
                    value={isEditing ? (editingItemData.price_type || 'fixed') : (item.price_type === 'none' ? 'fixed' : item.price_type)}
                    onChange={isEditing ? (e) => setEditingItemData(prev => ({ ...prev, price_type: e.target.value as any })) : () => {}}
                    disableUnderline={!isEditing}
                    disabled={!isEditing}
                    sx={{
                      fontSize: isEditing ? '1rem' : '0.875rem',
                      cursor: isEditing ? 'pointer' : 'pointer',
                      minHeight: isEditing ? 48 : undefined,
                      '&.Mui-disabled': {
                        color: 'text.primary'
                      }
                    }}
                  >
                    {priceTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value} sx={{ fontSize: '1rem', minHeight: 48 }}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Stack>
          </Box>

          {/* Badges */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontSize: isEditing ? '0.875rem' : '0.75rem' }}>
              Badge
            </Typography>
            {isEditing ? (
              <FormControl variant="standard" fullWidth>
                <Select
                  value={editingItemData.badge || ''}
                  onChange={(e) => setEditingItemData(prev => ({
                    ...prev,
                    badge: e.target.value as string
                  }))}
                  displayEmpty
                  sx={{
                    fontSize: '1rem',
                    minHeight: 48
                  }}
                >
                  <MenuItem value="" sx={{ fontSize: '1rem', minHeight: 48 }}>
                    <em>No badge</em>
                  </MenuItem>
                  {badgeOptions.map((badge) => (
                    <MenuItem key={badge} value={badge} sx={{ fontSize: '1rem', minHeight: 48 }}>
                      {badge}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Box
                onClick={() => startEditingItem(item)}
                sx={{
                  cursor: 'pointer',
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                  px: 0,
                  py: 0.5
                }}
              >
                {item.badge ? (
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {item.badge}
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary', fontStyle: 'italic' }}>
                    No badge
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {/* Images */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Images
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {item.images && item.images.length > 0 ? (
                <Badge
                  badgeContent={item.images.length}
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.75rem',
                      height: 20,
                      minWidth: 20
                    }
                  }}
                >
                  <Avatar
                    src={item.images[0]}
                    sx={{
                      width: 56,
                      height: 56,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                    onClick={() => {
                      if (isEditing) {
                        // In edit mode: open image management dialog
                        openImageManagement(item);
                      } else {
                        // In view mode: open carousel viewer
                        setSelectedItem(item);
                        setCarouselIndex(0);
                        setCarouselOpen(true);
                      }
                    }}
                  >
                    <ImageIcon />
                  </Avatar>
                </Badge>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<ImageIcon />}
                  onClick={() => openImagePicker(item)}
                  fullWidth
                  size="large"
                  sx={{ minHeight: 48 }}
                >
                  Add Images
                </Button>
              )}
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            {isEditing ? (
              <>
                <Button
                  variant="contained"
                  startIcon={<CheckIcon />}
                  onClick={() => saveItem(item._id)}
                  disabled={!editingItemData.name || !editingItemData.name.trim()}
                  fullWidth
                  size="large"
                  sx={{ minHeight: 48 }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CloseIcon />}
                  onClick={cancelEditingItem}
                  fullWidth
                  size="large"
                  sx={{ minHeight: 48 }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => startEditingItem(item)}
                  fullWidth
                  size="large"
                  sx={{ minHeight: 48 }}
                >
                  Edit
                </Button>
                <IconButton
                  onClick={() => handleDeleteItem(item._id)}
                  color="error"
                  sx={{
                    minWidth: 48,
                    minHeight: 48,
                    border: '1px solid',
                    borderColor: 'error.main',
                    borderRadius: 1
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Sortable Mobile Card Component
  const SortableMobileCard: React.FC<{ item: MenuItem; categoryId?: string }> = ({ item, categoryId }) => {
    const isEditing = editingItem === item._id;
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: item._id,
      disabled: isEditing || editingItem !== null,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const dragProps = isEditing || editingItem !== null ? undefined : { ...attributes, ...listeners };

    return (
      <Box ref={setNodeRef} style={style}>
        {renderMobileItemCard(item, dragProps)}
      </Box>
    );
  };

  // Sortable Table Row Component
  const SortableTableRow: React.FC<{ item: MenuItem; categoryId?: string }> = ({ item, categoryId }) => {
    const isEditing = editingItem === item._id;
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: item._id,
      disabled: isEditing || editingItem !== null, // Disable dragging when any item is being edited
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    // Don't apply drag props when editing
    const dragProps = isEditing || editingItem !== null ? {} : { ...attributes, ...listeners };

    return (
      <TableRow
        ref={setNodeRef}
        style={style}
        sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
        key={item._id}
      >
        {renderItemCells(item, dragProps)}
      </TableRow>
    );
  };

  const renderItemRow = (item: MenuItem) => {
    // This function is kept for backward compatibility but shouldn't be used with sortable tables
    return (
      <TableRow key={item._id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
        {renderItemCells(item, {})}
      </TableRow>
    );
  };

  const renderItemCells = (item: MenuItem, dragHandleProps: any) => {
    const isEditing = editingItem === item._id;
    
    // Debug logging
    if (item.images) {
      console.log(`Item ${item.name} has images:`, item.images);
    }
    
    return (
      <>
        <TableCell
          sx={{ width: 48, padding: '6px' }}
        >
          {!isEditing && !editingItem && (
            <IconButton
              {...dragHandleProps}
              size="small"
              sx={{
                cursor: 'move',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <DragIndicatorIcon fontSize="small" />
            </IconButton>
          )}
        </TableCell>
        <TableCell
          sx={{
            cursor: isEditing ? 'default' : 'pointer',
            px: 2,
            py: 1.5
          }}
          onClick={() => {
            if (!isEditing) {
              startEditingItem(item, true);
            }
          }}
        >
          <TextField
            id={`menu-item-name-${item._id}`}
            value={isEditing ? (editingItemData.name || '') : item.name}
            onChange={isEditing ? (e) => setEditingItemData(prev => ({ ...prev, name: e.target.value })) : undefined}
            variant="standard"
            fullWidth
            required={isEditing}
            error={isEditing && (!editingItemData.name || !editingItemData.name.trim())}
            placeholder={isEditing && item.name === 'New Item' ? 'Enter item name (required)' : ''}
            InputProps={{
              disableUnderline: !isEditing,
              readOnly: !isEditing,
              sx: {
                fontSize: '0.875rem',
                cursor: isEditing ? 'text' : 'pointer'
              }
            }}
            onFocus={(e) => {
              // Select all text if it's the default "New Item"
              if (e.target.value === 'New Item') {
                e.target.select();
              }
            }}
            onKeyDown={isEditing ? (e) => handleKeyDown(e, item._id) : undefined}
            onClick={(e) => {
              if (isEditing) {
                e.stopPropagation();
              }
            }}
          />
        </TableCell>
        
        <TableCell
          sx={{
            cursor: isEditing ? 'default' : 'pointer',
            px: 2,
            py: 1.5
          }}
          onClick={() => {
            if (!isEditing) {
              startEditingItem(item);
            }
          }}
        >
          <TextField
            value={isEditing ? (editingItemData.description || '') : (item.description || '')}
            onChange={isEditing ? (e) => setEditingItemData(prev => ({ ...prev, description: e.target.value })) : undefined}
            variant="standard"
            fullWidth
            multiline
            maxRows={3}
            placeholder={!isEditing ? (item.description ? '' : 'Click to add description') : 'Add description'}
            InputProps={{
              disableUnderline: !isEditing,
              readOnly: !isEditing,
              sx: {
                fontSize: '0.875rem',
                cursor: isEditing ? 'text' : 'pointer'
              }
            }}
            onKeyDown={isEditing ? (e) => handleKeyDown(e, item._id) : undefined}
            onClick={(e) => {
              if (isEditing) {
                e.stopPropagation();
              }
            }}
          />
        </TableCell>
        
        <TableCell
          sx={{ p: 1, cursor: isEditing ? 'default' : 'pointer' }}
          onClick={() => !isEditing && startEditingItem(item)}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              type="number"
              value={isEditing ? (editingItemData.price_value || '') : (item.price_value || '')}
              onChange={isEditing ? (e) => setEditingItemData(prev => ({ ...prev, price_value: parseFloat(e.target.value) || undefined })) : undefined}
              variant="standard"
              size="small"
              sx={{ width: 80 }}
              placeholder="0.00"
              InputProps={{
                disableUnderline: !isEditing,
                readOnly: !isEditing,
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                sx: {
                  fontSize: '0.875rem',
                  cursor: isEditing ? 'text' : 'pointer'
                }
              }}
              onClick={(e) => {
                if (isEditing) {
                  e.stopPropagation();
                }
              }}
            />

            {/* Only show dropdown when there's a price value */}
            {((isEditing && editingItemData.price_value && editingItemData.price_value > 0) ||
              (!isEditing && item.price_value && item.price_value > 0)) && (
              <FormControl variant="standard" size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={isEditing ? (editingItemData.price_type || 'fixed') : (item.price_type === 'none' ? 'fixed' : item.price_type)}
                  onChange={isEditing ? (e) => setEditingItemData(prev => ({ ...prev, price_type: e.target.value as any })) : () => {}}
                  disableUnderline={!isEditing}
                  disabled={!isEditing}
                  sx={{
                    fontSize: '0.875rem',
                    cursor: isEditing ? 'pointer' : 'pointer',
                    '&.Mui-disabled': {
                      color: 'text.primary'
                    }
                  }}
                >
                  {priceTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </TableCell>
        
        <TableCell sx={{ p: 1, minWidth: 160 }}>
          {isEditing ? (
            <FormControl variant="standard" size="small" fullWidth>
              <Select
                value={editingItemData.badge || ''}
                onChange={(e) => setEditingItemData(prev => ({
                  ...prev,
                  badge: e.target.value as string
                }))}
                displayEmpty
                sx={{ fontSize: '0.875rem' }}
              >
                <MenuItem value="">
                  <em>No badge</em>
                </MenuItem>
                {badgeOptions.map((badge) => (
                  <MenuItem key={badge} value={badge}>
                    {badge}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Box
              onClick={() => startEditingItem(item)}
              sx={{
                cursor: 'pointer',
                minHeight: 24,
                display: 'flex',
                alignItems: 'center',
                px: 1,
                py: 0.5
              }}
            >
              {item.badge ? (
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  {item.badge}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary', fontStyle: 'italic' }}>
                  No badge
                </Typography>
              )}
            </Box>
          )}
        </TableCell>
        
        {/* Images Column */}
        <TableCell sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {item.images && item.images.length > 0 ? (
              <>
                <Badge 
                  badgeContent={item.images.length} 
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.75rem',
                      height: 16,
                      minWidth: 16
                    }
                  }}
                >
                  <Avatar
                    src={item.images[0]}
                    sx={{
                      width: 32,
                      height: 32,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                    onClick={() => {
                      if (isEditing) {
                        // In edit mode: open image management dialog
                        openImageManagement(item);
                      } else {
                        // In view mode: open carousel viewer
                        setSelectedItem(item);
                        setCarouselIndex(0);
                        setCarouselOpen(true);
                      }
                    }}
                  >
                    <ImageIcon fontSize="small" />
                  </Avatar>
                </Badge>
              </>
            ) : (
              <Tooltip title={`Manage images (${item.images ? item.images.length : 'no'} images)`}>
                <IconButton
                  size="small"
                  onClick={() => openImagePicker(item)}
                  sx={{
                    width: 32,
                    height: 32,
                    border: '1px dashed',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.light',
                      '& .MuiSvgIcon-root': {
                        color: 'primary.main'
                      }
                    }
                  }}
                >
                  <ImageIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {/* Debug info */}
            <span style={{ fontSize: '10px', color: '#666' }}>
              {item.images ? `${item.images.length}` : 'no images'}
            </span>
          </Box>
        </TableCell>
        
        <TableCell>
          <Switch
            checked={item.is_available}
            onChange={() => handleToggleAvailability(item._id)}
            size="small"
          />
        </TableCell>
        
        <TableCell>
          <Stack direction="row" spacing={0.5}>
            {isEditing ? (
              <>
                <Tooltip title={(!editingItemData.name || !editingItemData.name.trim()) ? "Item name is required" : "Save"}>
                  <span>
                    <IconButton 
                      size="small" 
                      onClick={() => saveItem(item._id)} 
                      color="primary"
                      disabled={!editingItemData.name || !editingItemData.name.trim()}
                    >
                      <CheckIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Cancel">
                  <IconButton size="small" onClick={cancelEditingItem}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => handleDeleteItem(item._id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </TableCell>
      </>
    );
  };

  const renderCategorySection = (category: MenuCategory) => {
    const isEditingCat = editingCategory === category._id;
    const items = category.items || [];
    
    return (
      <Card key={category._id} elevation={2} sx={{ mb: 3, borderRadius: 2,  borderColor: 'divider', backgroundColor: 'background.paper' }}>
        <CardContent>
          {/* Category Header */}
          <Box sx={{ mb: 2 }}>
            {isEditingCat ? (
              // Editing mode - mobile-friendly vertical layout
              <Box>
                <Stack spacing={2}>
                  <TextField
                    value={editingCategoryData.name || ''}
                    onChange={(e) => setEditingCategoryData(prev => ({ ...prev, name: e.target.value }))}
                    size={isMobile ? "medium" : "small"}
                    placeholder="Category name"
                    label="Category Name"
                    fullWidth
                    required
                    InputProps={{
                      sx: { fontSize: isMobile ? '1rem' : undefined }
                    }}
                    InputLabelProps={{
                      shrink: true,
                      sx: { fontSize: isMobile ? '1rem' : undefined }
                    }}
                  />
                  <TextField
                    value={editingCategoryData.description || ''}
                    onChange={(e) => setEditingCategoryData(prev => ({ ...prev, description: e.target.value }))}
                    size={isMobile ? "medium" : "small"}
                    placeholder="Description (optional)"
                    label="Description"
                    fullWidth
                    multiline
                    rows={isMobile ? 2 : 1}
                    InputProps={{
                      sx: { fontSize: isMobile ? '1rem' : undefined }
                    }}
                    InputLabelProps={{
                      shrink: true,
                      sx: { fontSize: isMobile ? '1rem' : undefined }
                    }}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      onClick={() => saveCategory(category._id)}
                      color="primary"
                      variant="contained"
                      startIcon={<CheckIcon />}
                      fullWidth
                      size={isMobile ? "large" : "medium"}
                      sx={{ minHeight: isMobile ? 48 : undefined }}
                    >
                      Save
                    </Button>
                    <Button
                      onClick={cancelEditingCategory}
                      variant="outlined"
                      startIcon={<CloseIcon />}
                      fullWidth
                      size={isMobile ? "large" : "medium"}
                      sx={{ minHeight: isMobile ? 48 : undefined }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ) : (
              // View mode
              <Box>
                {/* Category name and description with Edit/Delete icons in top right */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: isMobile ? 2 : 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {category.name}
                    </Typography>
                    {category.description && (
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                    )}
                  </Box>

                  {/* Edit/Delete icons in top right corner */}
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => startEditingCategory(category)}
                      sx={{ minWidth: isMobile ? 44 : 32, minHeight: isMobile ? 44 : 32 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteCategory(category._id)}
                      color="error"
                      sx={{ minWidth: isMobile ? 44 : 32, minHeight: isMobile ? 44 : 32 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>

                {/* Add Item button */}
                <Button
                  size={isMobile ? "medium" : "small"}
                  startIcon={<AddIcon />}
                  onClick={() => addNewItem(category._id)}
                  fullWidth={isMobile}
                  sx={{ minHeight: isMobile ? 44 : undefined, mb: 2 }}
                >
                  Add Item
                </Button>
              </Box>
            )}
          </Box>

          {/* Items - Mobile Cards or Desktop Table */}
          {items.length > 0 && (
            <>
              {isMobile ? (
                // Mobile: Render cards
                editingItem ? (
                  // Render regular cards when editing (no drag and drop)
                  <Box>
                    {items.map((item) => renderMobileItemCard(item))}
                  </Box>
                ) : (
                  // Render sortable cards when not editing
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, category._id)}
                  >
                    <SortableContext
                      items={items.map(item => item._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <Box>
                        {items.map((item) => (
                          <SortableMobileCard
                            key={item._id}
                            item={item}
                            categoryId={category._id}
                          />
                        ))}
                      </Box>
                    </SortableContext>
                  </DndContext>
                )
              ) : (
                // Desktop: Render table
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 48 }}></TableCell>
                        <TableCell>Item Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Badges</TableCell>
                        <TableCell>Images</TableCell>
                        <TableCell>Available</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {editingItem ? (
                        // Render regular rows when editing (no drag and drop)
                        items.map((item) => (
                          <TableRow key={item._id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                            {renderItemCells(item, {})}
                          </TableRow>
                        ))
                      ) : (
                        // Render sortable rows when not editing
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleDragEnd(event, category._id)}
                        >
                          <SortableContext
                            items={items.map(item => item._id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {items.map((item) => (
                              <SortableTableRow
                                key={item._id}
                                item={item}
                                categoryId={category._id}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!menuData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        mb: 3,
        gap: isMobile ? 2 : 0
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: isMobile ? 0 : 0 }}>
          Menu & Services Management
        </Typography>

        <Button
          variant="contained"
          startIcon={<CategoryIcon />}
          onClick={() => setCategoryDialogOpen(true)}
          fullWidth={isMobile}
          size={isMobile ? "large" : "medium"}
          sx={{
            minHeight: isMobile ? 48 : undefined,
          }}
        >
          Add Category
        </Button>
      </Box>

      {/* Available Categories */}
      {getCategoriesWithAvailableItems().map(renderCategorySection)}

      {/* Available Uncategorized Items */}
      {getAvailableItems(menuData.uncategorized_items).length > 0 && (
        <Card elevation={2} sx={{ mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
          <CardContent>
            {/* Category name with Edit/Delete icons in top right */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: isMobile ? 2 : 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Uncategorized Items
                </Typography>
              </Box>

              {/* Edit/Delete icons in top right corner */}
              <Stack direction="row" spacing={0.5}>
                <IconButton
                  size="small"
                  onClick={handleEditUncategorized}
                  sx={{ minWidth: isMobile ? 44 : 32, minHeight: isMobile ? 44 : 32 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleDeleteAllUncategorized}
                  color="error"
                  sx={{ minWidth: isMobile ? 44 : 32, minHeight: isMobile ? 44 : 32 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>

            {/* Add Item button */}
            <Button
              size={isMobile ? "medium" : "small"}
              startIcon={<AddIcon />}
              onClick={() => addNewItem()}
              fullWidth={isMobile}
              sx={{ minHeight: isMobile ? 44 : undefined, mb: 2 }}
            >
              Add Item
            </Button>

            {isMobile ? (
              // Mobile: Render cards
              editingItem ? (
                <Box>
                  {getAvailableItems(menuData.uncategorized_items).map((item) => renderMobileItemCard(item))}
                </Box>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(event)}
                >
                  <SortableContext
                    items={getAvailableItems(menuData.uncategorized_items).map(item => item._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Box>
                      {getAvailableItems(menuData.uncategorized_items).map((item) => (
                        <SortableMobileCard key={item._id} item={item} />
                      ))}
                    </Box>
                  </SortableContext>
                </DndContext>
              )
            ) : (
              // Desktop: Render table
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 48 }}></TableCell>
                      <TableCell>Item Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Badges</TableCell>
                      <TableCell>Images</TableCell>
                      <TableCell>Available</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {editingItem ? (
                      // Render regular rows when editing (no drag and drop)
                      getAvailableItems(menuData.uncategorized_items).map((item) => (
                        <TableRow key={item._id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                          {renderItemCells(item, {})}
                        </TableRow>
                      ))
                    ) : (
                      // Render sortable rows when not editing
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event)}
                      >
                        <SortableContext
                          items={getAvailableItems(menuData.uncategorized_items).map(item => item._id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {getAvailableItems(menuData.uncategorized_items).map((item) => (
                            <SortableTableRow
                              key={item._id}
                              item={item}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Unavailable Items Section */}
      {(getCategoriesWithUnavailableItems().length > 0 || getUnavailableItems(menuData.uncategorized_items).length > 0) && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
            Currently Unavailable Items
          </Typography>
          <Alert severity="warning" sx={{ mb: 3 }}>
            These items are currently marked as unavailable and won't appear to customers. 
            Toggle the switch to make them available again.
          </Alert>

          {/* Unavailable Categories */}
          {getCategoriesWithUnavailableItems().map(category => (
            <Card key={category._id} elevation={2} sx={{ mb: 3, opacity: 0.7, borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {category.name} (Unavailable Items)
                  </Typography>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Badges</TableCell>
                        <TableCell>Images</TableCell>
                        <TableCell>Available</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {editingItem ? (
                        // Render regular rows when editing (no drag and drop)
                        getUnavailableItems(category.items || []).map((item) => (
                          <TableRow key={item._id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                            {renderItemCells(item, {})}
                          </TableRow>
                        ))
                      ) : (
                        // Render sortable rows when not editing
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleDragEnd(event, category._id)}
                        >
                          <SortableContext
                            items={getUnavailableItems(category.items || []).map(item => item._id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {getUnavailableItems(category.items || []).map((item) => (
                              <SortableTableRow 
                                key={item._id} 
                                item={item} 
                                categoryId={category._id}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ))}

          {/* Unavailable Uncategorized Items */}
          {getUnavailableItems(menuData.uncategorized_items).length > 0 && (
            <Card elevation={2} sx={{ mb: 3, opacity: 0.7, borderRadius: 2, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Uncategorized Items (Unavailable)
                  </Typography>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Badges</TableCell>
                        <TableCell>Images</TableCell>
                        <TableCell>Available</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {editingItem ? (
                        // Render regular rows when editing (no drag and drop)
                        getUnavailableItems(menuData.uncategorized_items).map((item) => (
                          <TableRow key={item._id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                            {renderItemCells(item, {})}
                          </TableRow>
                        ))
                      ) : (
                        // Render sortable rows when not editing
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleDragEnd(event)}
                        >
                          <SortableContext
                            items={getUnavailableItems(menuData.uncategorized_items).map(item => item._id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {getUnavailableItems(menuData.uncategorized_items).map((item) => (
                              <SortableTableRow 
                                key={item._id} 
                                item={item}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Category Dialog */}
      <Dialog
        open={categoryDialogOpen}
        onClose={() => {
          setCategoryDialogOpen(false);
          setCategoryForm({ name: '', description: '' });
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }
        }}
        PaperProps={{
          sx: {
            minHeight: isMobile ? '100vh' : 'auto',
            margin: isMobile ? 0 : undefined,
            borderRadius: isMobile ? 0 : undefined,
          }
        }}
      >
        <DialogTitle sx={{
          pb: isMobile ? 1 : 2,
          px: isMobile ? 2 : 3
        }}>
          <Typography variant={isMobile ? "h6" : "h5"}>
            Add Category
          </Typography>
        </DialogTitle>
        <DialogContent sx={{
          px: isMobile ? 2 : 3,
          py: isMobile ? 1 : 2
        }}>
          <Stack spacing={isMobile ? 3 : 3} sx={{ mt: 1 }}>
            <TextField
              label="Category Name"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
              size={isMobile ? "medium" : "medium"}
              InputProps={{
                sx: { fontSize: isMobile ? '1rem' : undefined }
              }}
              InputLabelProps={{
                sx: { fontSize: isMobile ? '1rem' : undefined }
              }}
            />
            <TextField
              label="Description (Optional)"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={isMobile ? 4 : 3}
              size={isMobile ? "medium" : "medium"}
              InputProps={{
                sx: { fontSize: isMobile ? '1rem' : undefined }
              }}
              InputLabelProps={{
                sx: { fontSize: isMobile ? '1rem' : undefined }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 1,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0,
          alignItems: isMobile ? 'stretch' : 'center'
        }}>
          <Button
            onClick={() => {
              setCategoryDialogOpen(false);
              setCategoryForm({ name: '', description: '' });
            }}
            variant={isMobile ? "outlined" : "text"}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            sx={{ minHeight: isMobile ? 48 : undefined }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateCategory}
            variant="contained"
            disabled={!categoryForm.name.trim()}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            sx={{ minHeight: isMobile ? 48 : undefined }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Simplified Image Upload Dialog for Menu Items */}
      <MenuItemImageUploadDialog
        open={imageUploadOpen}
        onClose={() => {
          setImageUploadOpen(false);
          setSelectedItem(null);
          setIsUploading(false);
        }}
        onImagesSelected={handleImageUpload}
        itemName={selectedItem?.name || 'Menu Item'}
      />

      {/* Image Management Dialog */}
      <Dialog
        open={imageManagementOpen}
        onClose={() => {
          setImageManagementOpen(false);
          setSelectedItem(null);
        }}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }
        }}
        PaperProps={{
          sx: {
            minHeight: isMobile ? '100vh' : 'auto',
            margin: isMobile ? 0 : undefined,
            borderRadius: isMobile ? 0 : undefined,
          }
        }}
      >
        <DialogTitle sx={{
          pb: isMobile ? 1 : 2,
          px: isMobile ? 2 : 3
        }}>
          <Typography variant={isMobile ? "h6" : "h5"}>
            Manage Images - {selectedItem?.name || 'Menu Item'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 2
        }}>
          {selectedItem && selectedItem.images && selectedItem.images.length > 0 ? (
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: 2
            }}>
              {selectedItem.images.map((imageUrl, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    component="img"
                    src={imageUrl}
                    alt={`Image ${index + 1}`}
                    onClick={() => {
                      setCarouselIndex(index);
                      setCarouselOpen(true);
                    }}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      cursor: 'pointer'
                    }}
                  />
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(selectedItem, imageUrl);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'error.main',
                      color: 'white',
                      minWidth: isMobile ? 44 : 36,
                      minHeight: isMobile ? 44 : 36,
                      '&:hover': {
                        backgroundColor: 'error.dark',
                      },
                    }}
                    size={isMobile ? "medium" : "small"}
                  >
                    <DeleteIcon fontSize={isMobile ? "medium" : "small"} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          ) : (
            <Alert severity="info">
              No images yet. Click "Add More Images" to get started.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 1,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 1 : 0,
          alignItems: isMobile ? 'stretch' : 'center'
        }}>
          <Button
            onClick={() => {
              setImageManagementOpen(false);
              setSelectedItem(null);
            }}
            variant={isMobile ? "outlined" : "text"}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            sx={{ minHeight: isMobile ? 48 : undefined }}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              setImageManagementOpen(false);
              if (selectedItem) {
                openImagePicker(selectedItem);
              }
            }}
            variant="contained"
            startIcon={<AddIcon />}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            sx={{ minHeight: isMobile ? 48 : undefined }}
          >
            Add More Images
          </Button>
        </DialogActions>
      </Dialog>

      {/* Carousel Viewer Dialog */}
      <Dialog
        open={carouselOpen}
        onClose={() => setCarouselOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }
        }}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            margin: 0,
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          flexDirection: 'column',
          color: 'white',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {selectedItem?.name || 'Menu Item'} - Image {carouselIndex + 1} of {selectedItem ? getImageData(selectedItem).length : 0}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={() => {
                  setCarouselOpen(false);
                  if (selectedItem) {
                    openImageManagement(selectedItem);
                  }
                }}
                sx={{
                  color: 'white',
                  minWidth: isMobile ? 44 : 40,
                  minHeight: isMobile ? 44 : 40,
                }}
                size={isMobile ? "medium" : "small"}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => setCarouselOpen(false)}
                sx={{
                  color: 'white',
                  minWidth: isMobile ? 44 : 40,
                  minHeight: isMobile ? 44 : 40,
                }}
                size={isMobile ? "medium" : "small"}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          p: 0,
          overflow: 'hidden'
        }}>
          {selectedItem && getImageData(selectedItem).length > 0 && (
            <>
              <Box
                component="img"
                src={getImageData(selectedItem)[carouselIndex]?.url}
                alt={getImageData(selectedItem)[carouselIndex]?.caption || `Image ${carouselIndex + 1}`}
                sx={{
                  maxWidth: '100%',
                  maxHeight: 'calc(100% - 120px)',
                  objectFit: 'contain',
                  width: '100%',
                  flex: 1
                }}
              />

              {/* Previous Button */}
              {getImageData(selectedItem).length > 1 && carouselIndex > 0 && (
                <IconButton
                  onClick={() => setCarouselIndex(prev => Math.max(0, prev - 1))}
                  sx={{
                    position: 'absolute',
                    left: isMobile ? 8 : 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(100, 100, 100, 0.7)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    minWidth: isMobile ? 48 : 56,
                    minHeight: isMobile ? 48 : 56,
                    '&:hover': {
                      backgroundColor: 'rgba(80, 80, 80, 0.8)',
                      backdropFilter: 'blur(12px)',
                    },
                  }}
                  size="large"
                >
                  <NavigateBeforeIcon fontSize="large" />
                </IconButton>
              )}

              {/* Next Button */}
              {getImageData(selectedItem).length > 1 && carouselIndex < getImageData(selectedItem).length - 1 && (
                <IconButton
                  onClick={() => setCarouselIndex(prev => Math.min(getImageData(selectedItem!).length - 1, prev + 1))}
                  sx={{
                    position: 'absolute',
                    right: isMobile ? 8 : 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(100, 100, 100, 0.7)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    minWidth: isMobile ? 48 : 56,
                    minHeight: isMobile ? 48 : 56,
                    '&:hover': {
                      backgroundColor: 'rgba(80, 80, 80, 0.8)',
                      backdropFilter: 'blur(12px)',
                    },
                  }}
                  size="large"
                >
                  <NavigateNextIcon fontSize="large" />
                </IconButton>
              )}

              {/* Caption TextField below image */}
              <Box
                sx={{
                  width: '100%',
                  px: isMobile ? 2 : 4,
                  pb: 2,
                  pt: 2
                }}
              >
                <TextField
                  value={editingCaption}
                  onChange={(e) => setEditingCaption(e.target.value)}
                  onBlur={() => {
                    if (selectedItem) {
                      const imageData = getImageData(selectedItem);
                      const currentCaption = imageData[carouselIndex]?.caption || '';
                      if (editingCaption !== currentCaption) {
                        handleUpdateCaption(editingCaption);
                      }
                    }
                  }}
                  placeholder="Add a caption"
                  fullWidth
                  multiline
                  maxRows={3}
                  disabled={isSavingCaption}
                  sx={{
                    '& .MuiInputBase-root': {
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      }
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'white',
                    }
                  }}
                />
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BusinessMenuSectionFixed;