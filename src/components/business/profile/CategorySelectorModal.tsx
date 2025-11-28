import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Stack,
  Typography,
  Checkbox,
  InputAdornment,
  IconButton,
  Collapse,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
} from '@mui/icons-material';

interface CategorySelectorModalProps {
  open: boolean;
  onClose: () => void;
  selectedCategories: string[];
  onSelectionChange: (categories: string[], primary?: string) => void;
  allCategories: string[];
  primaryCategory?: string;
  mode?: 'primary' | 'additional';
  singleSelection?: boolean;
}

const CategorySelectorModal: React.FC<CategorySelectorModalProps> = ({
  open,
  onClose,
  selectedCategories,
  onSelectionChange,
  allCategories,
  primaryCategory,
  mode = 'additional',
  singleSelection = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelected, setLocalSelected] = useState<string[]>(selectedCategories);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Update local state when prop changes
  useEffect(() => {
    setLocalSelected(selectedCategories);
  }, [selectedCategories]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      // Store current scroll position
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // Save original styles
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;

      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = `-${scrollX}px`;
      document.body.style.width = '100%';
      document.body.style.right = '0';

      return () => {
        // Restore original styles
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.left = '';
        document.body.style.width = originalWidth;
        document.body.style.right = '';

        // Restore scroll position without causing re-render
        window.scrollTo({
          top: scrollY,
          left: scrollX,
          behavior: 'instant' as ScrollBehavior,
        });
      };
    }
  }, [open]);

  // Group categories by first word (main category)
  const groupedCategories = useMemo(() => {
    const groups: Record<string, string[]> = {};

    allCategories.forEach(category => {
      // Extract the first word as the group name
      const firstWord = category.split(' ')[0];
      const groupName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);

      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(category);
    });

    // Sort groups alphabetically and sort categories within each group
    const sortedGroups: Record<string, string[]> = {};
    Object.keys(groups)
      .sort()
      .forEach(key => {
        sortedGroups[key] = groups[key].sort();
      });

    return sortedGroups;
  }, [allCategories]);

  // Filter categories based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedCategories;

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, string[]> = {};

    Object.entries(groupedCategories).forEach(([group, categories]) => {
      const matchingCategories = categories.filter(cat =>
        cat.toLowerCase().includes(query)
      );
      if (matchingCategories.length > 0) {
        filtered[group] = matchingCategories;
      }
    });

    return filtered;
  }, [groupedCategories, searchQuery]);

  // Auto-expand groups when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      // Expand all groups that have matches
      setExpandedGroups(new Set(Object.keys(filteredGroups)));
    }
  }, [searchQuery, filteredGroups]);

  const handleToggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const handleToggleCategory = (category: string) => {
    setLocalSelected(prev => {
      if (singleSelection) {
        // For single selection (primary category), replace with new selection
        return prev.includes(category) ? [] : [category];
      } else {
        // For multiple selection (additional categories)
        if (prev.includes(category)) {
          return prev.filter(c => c !== category);
        } else {
          return [...prev, category];
        }
      }
    });
  };

  const handleRemoveCategory = (category: string) => {
    setLocalSelected(prev => prev.filter(c => c !== category));
  };

  const handleDone = () => {
    const primaryValue = singleSelection && localSelected.length > 0 ? localSelected[0] : undefined;
    onSelectionChange(localSelected, primaryValue);
    onClose();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth
      disableScrollLock={true}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }
      }}
      sx={{
        zIndex: 10000, // Above bottom tab bar (9999)
        '& .MuiDialog-container': {
          ...(isMobile && {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }),
          overflow: 'hidden', // Prevent container scroll
        },
        '& .MuiDialog-paper': {
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden', // Only content area should scroll
          ...(isMobile ? {
            // Mobile: Full screen
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 0,
            maxHeight: '100%',
            maxWidth: '100%',
            width: '100%',
            height: '100%',
            borderRadius: 0,
          } : {
            // Desktop: Centered modal with max width
            maxWidth: '800px',
            maxHeight: '90vh',
            height: 'auto',
            borderRadius: 2,
          }),
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            {singleSelection ? 'Select Primary Category' : 'Manage Additional Categories'}
          </Typography>
          <IconButton edge="end" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden', // Prevent DialogContent from scrolling
          position: 'relative',
        }}
      >
        {/* Search Box - Sticky */}
        <Box sx={{ p: 2, pb: 1, backgroundColor: theme.palette.background.default, position: 'sticky', top: 0, zIndex: 1 }}>
          <TextField
            fullWidth
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Selected Categories - Sticky with Horizontal Scroll */}
        {localSelected.length > 0 && (
          <Box
            sx={{
              p: 2,
              pt: 1,
              backgroundColor: theme.palette.background.default,
              position: 'sticky',
              top: 72,
              zIndex: 1,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Selected ({localSelected.length})
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                overflowY: 'hidden',
                // Smooth iOS scrolling
                WebkitOverflowScrolling: 'touch',
                // Hide scrollbar but keep functionality
                scrollbarWidth: 'thin',
                '&::-webkit-scrollbar': {
                  height: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.3),
                  borderRadius: '3px',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.5),
                  },
                },
                // Prevent layout shift
                minHeight: '32px',
                pb: 0.5,
              }}
            >
              {localSelected.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onDelete={() => handleRemoveCategory(category)}
                  size="small"
                  color="primary"
                  variant={category === primaryCategory ? 'filled' : 'outlined'}
                  sx={{
                    flexShrink: 0, // Prevent chips from shrinking
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Category Groups - Scrollable */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
            position: 'relative',
          }}
        >
          {Object.keys(filteredGroups).length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No categories found for "{searchQuery}"
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {Object.entries(filteredGroups).map(([groupName, categories], groupIndex) => (
                <Box key={groupName}>
                  {/* Group Header */}
                  <ListItemButton
                    onClick={() => handleToggleGroup(groupName)}
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 1.5,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={600}>
                          {groupName}
                        </Typography>
                      }
                      secondary={`${categories.length} categories`}
                    />
                    {expandedGroups.has(groupName) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemButton>

                  {/* Group Categories */}
                  <Collapse in={expandedGroups.has(groupName)} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {categories.map((category) => {
                        const isSelected = localSelected.includes(category);
                        const isPrimary = category === primaryCategory;

                        return (
                          <ListItem
                            key={category}
                            disablePadding
                            secondaryAction={
                              <Checkbox
                                edge="end"
                                checked={isSelected}
                                onChange={() => handleToggleCategory(category)}
                                icon={<CheckBoxOutlineBlankIcon />}
                                checkedIcon={<CheckBoxIcon />}
                              />
                            }
                          >
                            <ListItemButton
                              onClick={() => handleToggleCategory(category)}
                              sx={{
                                pl: 4,
                                backgroundColor: isSelected
                                  ? alpha(theme.palette.primary.main, 0.08)
                                  : 'transparent',
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                                },
                              }}
                            >
                              <ListItemText
                                primary={category}
                                primaryTypographyProps={{
                                  fontWeight: isSelected ? 600 : 400,
                                }}
                                secondary={
                                  isPrimary ? (
                                    <Chip label="Primary" size="small" color="primary" sx={{ height: 18, fontSize: '0.7rem' }} />
                                  ) : null
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Collapse>
                </Box>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          position: 'sticky',
          bottom: 0,
          zIndex: 2,
          flexShrink: 0, // Prevent from shrinking
        }}
      >
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleDone} variant="contained" color="primary">
          {singleSelection
            ? (localSelected.length > 0 ? 'Select' : 'Clear selection')
            : `Done (${localSelected.length} selected)`
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategorySelectorModal;
