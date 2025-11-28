import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Stack,
  Switch,
  InputAdornment,
  Tooltip,
  Avatar,
  Badge,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
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
  Add as AddIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';
import { useSnackbar } from 'notistack';
import { api } from '../../../../convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import ContentImageGallery, { GalleryImage } from "../../shared/ContentImageGallery";

interface BusinessMenuSectionMinimalProps {
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
  badges?: string[];
  display_order: number;
  category_id?: string;
  images?: string[];
}

const BusinessMenuSectionMinimal: React.FC<BusinessMenuSectionMinimalProps> = ({
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
  
  // Convex queries
  const menuData = useQuery(api.businessMenu.getCompleteMenu, 
    businessId ? { business_id: businessId as any, include_inactive: true } : 'skip'
  );
  
  // State
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingItemData, setEditingItemData] = useState<Partial<MenuItem>>({});
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  
  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemImages, setItemImages] = useState<GalleryImage[]>([]);

  const priceTypes = [
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'starting_at', label: 'Starting At' },
    { value: 'per_hour', label: 'Per Hour' },
    { value: 'per_item', label: 'Per Item' },
    { value: 'call_for_quote', label: 'Call for Quote' },
  ];

  const badgeOptions = ['Popular', 'New', 'Featured', 'Best Seller', 'Seasonal'];

  useEffect(() => {
    if (menuData) {
      const hasMenuItems = menuData.categories.some(cat => cat.items && cat.items.length > 0) || 
                          menuData.uncategorized_items.length > 0;
      onProfileItemUpdate('menu', hasMenuItems);
    }
  }, [menuData]);

  const handleCreateCategory = async () => {
    if (!businessId || !categoryForm.name.trim()) return;

    try {
      await createCategory({
        business_id: businessId as any,
        name: categoryForm.name,
        description: categoryForm.description || undefined,
      });
      
      enqueueSnackbar('Category created!', { variant: 'success' });
      setCategoryForm({ name: '', description: '' });
      setCategoryDialogOpen(false);
    } catch (error) {
      enqueueSnackbar('Error creating category', { variant: 'error' });
    }
  };

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

      enqueueSnackbar('Item added!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error creating item', { variant: 'error' });
    }
  };

  const saveItem = async (itemId: string) => {
    if (!editingItemData.name?.trim()) {
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
        badges: editingItemData.badges,
      });

      enqueueSnackbar('Item updated!', { variant: 'success' });
      setEditingItem(null);
      setEditingItemData({});
    } catch (error) {
      enqueueSnackbar('Error updating item', { variant: 'error' });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return;

    try {
      await deleteItem({ item_id: itemId as any });
      enqueueSnackbar('Item deleted', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error deleting item', { variant: 'error' });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Delete this category? Items will become uncategorized.')) return;

    try {
      await deleteCategory({ category_id: categoryId as any });
      enqueueSnackbar('Category deleted', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error deleting category', { variant: 'error' });
    }
  };

  const openImageDialog = (item: MenuItem) => {
    setSelectedItem(item);
    const galleryImages: GalleryImage[] = (item.images || []).map((url, index) => ({
      id: `item-${item._id}-${index}`,
      image_id: `item-${item._id}-${index}`,
      image_url: url,
      display_order: index,
      is_primary: index === 0
    }));
    setItemImages(galleryImages);
    setImageDialogOpen(true);
  };

  const handleImagesChange = async (newImages: GalleryImage[]) => {
    if (!selectedItem) return;
    
    const imageUrls = newImages.map(img => img.image_url);
    
    try {
      await updateItem({
        item_id: selectedItem._id as any,
        images: imageUrls,
      });
      
      setItemImages(newImages);
      enqueueSnackbar('Images updated!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error updating images', { variant: 'error' });
    }
  };

  const formatPrice = (item: MenuItem) => {
    if (item.price_display) return item.price_display;
    
    switch (item.price_type) {
      case 'none':
        return '';
      case 'fixed':
        return item.price_value ? `$${item.price_value}` : '';
      case 'starting_at':
        return item.price_value ? `From $${item.price_value}` : '';
      case 'per_hour':
        return item.price_value ? `$${item.price_value}/hr` : '';
      case 'per_item':
        return item.price_value ? `$${item.price_value} ea` : '';
      case 'call_for_quote':
        return 'Call for Quote';
      default:
        return '';
    }
  };

  // Sortable Item Component
  const SortableItem: React.FC<{ item: MenuItem; isLast: boolean; categoryId?: string }> = ({ item, isLast, categoryId }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: item._id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div ref={setNodeRef} style={style}>
        {renderItem(item, isLast, { ...attributes, ...listeners })}
      </div>
    );
  };

  const renderItem = (item: MenuItem, isLast: boolean = false, dragHandleProps: any = {}) => {
    const isEditing = editingItem === item._id;
    
    return (
      <Card
        key={item._id}
        sx={{
          boxShadow: 'none',
          borderRadius: 0,
          borderBottom: !isLast ? '1px solid' : 'none',
          borderColor: 'divider',
          bgcolor: 'transparent',
          '&:hover': { bgcolor: 'action.hover' },
          opacity: item.is_available ? 1 : 0.6,
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {isEditing ? (
          // Editing Mode
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                value={editingItemData.name || ''}
                onChange={(e) => setEditingItemData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Item name"
                size="small"
                fullWidth
                autoFocus
              />
              <IconButton 
                onClick={() => saveItem(item._id)} 
                color="primary"
                disabled={!editingItemData.name?.trim()}
              >
                <CheckIcon />
              </IconButton>
              <IconButton onClick={() => {
                setEditingItem(null);
                setEditingItemData({});
              }}>
                <CloseIcon />
              </IconButton>
            </Stack>
            
            <TextField
              value={editingItemData.description || ''}
              onChange={(e) => setEditingItemData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description (optional)"
              size="small"
              multiline
              fullWidth
            />
            
            <Stack direction="row" spacing={2}>
              <TextField
                type="number"
                value={editingItemData.price_value || ''}
                onChange={(e) => setEditingItemData(prev => ({
                  ...prev,
                  price_value: parseFloat(e.target.value) || undefined
                }))}
                size="small"
                placeholder="0.00"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{ width: 120 }}
              />

              {/* Only show dropdown when there's a price value */}
              {editingItemData.price_value && editingItemData.price_value > 0 && (
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={editingItemData.price_type || 'fixed'}
                    onChange={(e) => setEditingItemData(prev => ({
                      ...prev,
                      price_type: e.target.value as any
                    }))}
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
          </Stack>
        ) : (
          // Display Mode
          <Stack direction="row" spacing={2} alignItems="flex-start">
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
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {item.name}
                </Typography>
                {item.badges?.map(badge => (
                  <Chip 
                    key={badge} 
                    label={badge} 
                    size="small" 
                    sx={{ height: 20, fontSize: '0.75rem' }}
                  />
                ))}
                {formatPrice(item) && (
                  <Typography variant="body2" color="primary" sx={{ ml: 'auto', fontWeight: 500 }}>
                    {formatPrice(item)}
                  </Typography>
                )}
              </Stack>
              
              {item.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {item.description}
                </Typography>
              )}
            </Box>
            
            <Stack direction="row" spacing={0.5} alignItems="center">
              {/* Image Button */}
              {item.images && item.images.length > 0 ? (
                <Badge badgeContent={item.images.length} color="primary">
                  <IconButton size="small" onClick={() => openImageDialog(item)}>
                    <Avatar
                      src={item.images[0]}
                      sx={{ width: 28, height: 28 }}
                    >
                      <ImageIcon fontSize="small" />
                    </Avatar>
                  </IconButton>
                </Badge>
              ) : (
                <IconButton size="small" onClick={() => openImageDialog(item)}>
                  <ImageIcon fontSize="small" />
                </IconButton>
              )}
              
              <IconButton 
                size="small" 
                onClick={() => {
                  setEditingItem(item._id);
                  setEditingItemData({
                    name: item.name,
                    description: item.description,
                    price_type: item.price_type,
                    price_value: item.price_value,
                    badges: item.badges || [],
                  });
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              
              <Switch
                checked={item.is_available}
                onChange={() => toggleItemAvailability({ item_id: item._id as any })}
                size="small"
              />
              
              <IconButton 
                size="small" 
                onClick={() => handleDeleteItem(item._id)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        )}
        </CardContent>
      </Card>
    );
  };

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

  const renderCategory = (category: MenuCategory) => {
    const items = category.items || [];
    const sortableIds = items.map(item => item._id);
    
    return (
      <Card
        key={category._id}
        sx={{
          mb: 2,
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              p: 2,
              borderBottom: items.length > 0 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {category.name}
                </Typography>
                {category.description && (
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                )}
              </Box>
              
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => addNewItem(category._id)}
                >
                  Add Item
                </Button>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteCategory(category._id)}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </Box>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event, category._id)}
          >
            <SortableContext
              items={sortableIds}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item, index) => (
                <SortableItem 
                  key={item._id} 
                  item={item} 
                  isLast={index === items.length - 1}
                  categoryId={category._id}
                />
              ))}
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>
    );
  };

  if (!menuData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Menu & Services
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add your products and services to showcase what you offer
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setCategoryDialogOpen(true)}
        >
          Add Category
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => addNewItem()}
        >
          Add Item
        </Button>
      </Stack>

      {/* Categories */}
      {menuData.categories.filter(cat => cat.is_active).map(renderCategory)}

      {/* Uncategorized Items */}
      {menuData.uncategorized_items.filter(item => item.is_available).length > 0 && (
        <Card
          sx={{
            mb: 2,
            boxShadow: 'none',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                p: 2,
                borderBottom: menuData.uncategorized_items.length > 0 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Uncategorized Items
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => addNewItem()}
                >
                  Add Item
                </Button>
              </Stack>
            </Box>
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => handleDragEnd(event)}
            >
              <SortableContext
                items={menuData.uncategorized_items.filter(item => item.is_available).map(item => item._id)}
                strategy={verticalListSortingStrategy}
              >
                {menuData.uncategorized_items.filter(item => item.is_available).map((item, index, arr) => (
                  <SortableItem 
                    key={item._id} 
                    item={item} 
                    isLast={index === arr.length - 1}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      )}

      {/* Unavailable Items (Optional - Hidden by Default) */}
      {menuData.uncategorized_items.filter(item => !item.is_available).length > 0 && (
        <Box sx={{ mt: 4, opacity: 0.6 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Unavailable Items
          </Typography>
          <Card
            sx={{
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEnd(event)}
              >
                <SortableContext
                  items={menuData.uncategorized_items.filter(item => !item.is_available).map(item => item._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {menuData.uncategorized_items.filter(item => !item.is_available).map((item, index, arr) => (
                    <SortableItem 
                      key={item._id} 
                      item={item} 
                      isLast={index === arr.length - 1}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>
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
      >
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Category Name"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Description (Optional)"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCategoryDialogOpen(false);
            setCategoryForm({ name: '', description: '' });
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateCategory}
            variant="contained"
            disabled={!categoryForm.name.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => {
          setImageDialogOpen(false);
          setSelectedItem(null);
          setItemImages([]);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Manage Images - {selectedItem?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <ContentImageGallery
              contentType="promotion"
              initialImages={itemImages}
              maxImages={10}
              onImagesChange={handleImagesChange}
              businessId={businessId}
              disabled={false}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setImageDialogOpen(false);
              setSelectedItem(null);
              setItemImages([]);
            }}
            variant="contained"
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BusinessMenuSectionMinimal;