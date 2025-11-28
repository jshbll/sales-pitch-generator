import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Button,
  Fade,
  Slide,
  Typography,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  Preview as PreviewIcon,
  Undo as UndoIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface FloatingActionBarProps {
  hasUnsavedChanges: boolean;
  unsavedCount?: number;
  onSaveAll?: () => Promise<void>;
  onDiscardAll?: () => void;
  onPreview?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  isSaving?: boolean;
  position?: 'bottom' | 'top';
  showPreview?: boolean;
}

const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  hasUnsavedChanges,
  unsavedCount = 0,
  onSaveAll,
  onDiscardAll,
  onPreview,
  onUndo,
  canUndo = false,
  isSaving = false,
  position = 'bottom',
  showPreview = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show bar when there are unsaved changes or we want to show preview
    setIsVisible(hasUnsavedChanges || showPreview);
  }, [hasUnsavedChanges, showPreview]);

  const handleSaveAll = async () => {
    if (onSaveAll) {
      await onSaveAll();
      setShowSavedMessage(true);
      setTimeout(() => {
        setShowSavedMessage(false);
      }, 3000);
    }
  };

  const barPosition = position === 'bottom' 
    ? { bottom: 0, left: 0, right: 0 }
    : { top: 64, left: 0, right: 0 }; // 64px for app bar height

  if (!isVisible && !showSavedMessage) {
    return null;
  }

  return (
    <Slide direction={position === 'bottom' ? 'up' : 'down'} in={isVisible || showSavedMessage}>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          ...barPosition,
          zIndex: theme.zIndex.speedDial,
          borderRadius: position === 'bottom' ? '12px 12px 0 0' : '0 0 12px 12px',
          overflow: 'hidden',
          backgroundColor: theme.palette.background.paper,
          borderTop: position === 'bottom' ? `1px solid ${theme.palette.divider}` : 'none',
          borderBottom: position === 'top' ? `1px solid ${theme.palette.divider}` : 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: isMobile ? 2 : 3,
            py: isMobile ? 1.5 : 2,
            gap: 2,
          }}
        >
          {/* Left Section - Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {showSavedMessage ? (
              <Fade in={showSavedMessage}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ color: 'success.main' }} />
                  <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
                    All changes saved
                  </Typography>
                </Box>
              </Fade>
            ) : hasUnsavedChanges ? (
              <>
                <Badge badgeContent={unsavedCount} color="warning" invisible={unsavedCount === 0}>
                  <WarningIcon sx={{ color: 'warning.main' }} />
                </Badge>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {unsavedCount > 0 ? `${unsavedCount} unsaved changes` : 'Unsaved changes'}
                  </Typography>
                  {!isMobile && (
                    <Typography variant="caption" color="text.secondary">
                      Your changes will be lost if you leave this page
                    </Typography>
                  )}
                </Box>
              </>
            ) : null}
          </Box>

          {/* Center Section - Undo (optional) */}
          {canUndo && onUndo && !isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Divider orientation="vertical" sx={{ height: 24, mx: 1 }} />
              <Tooltip title="Undo last change">
                <IconButton onClick={onUndo} size="small">
                  <UndoIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* Right Section - Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {hasUnsavedChanges && (
              <>
                {onDiscardAll && (
                  <Button
                    variant="outlined"
                    size={isMobile ? 'small' : 'medium'}
                    onClick={onDiscardAll}
                    disabled={isSaving}
                    startIcon={!isMobile && <CloseIcon />}
                  >
                    {isMobile ? 'Discard' : 'Discard All'}
                  </Button>
                )}
                {onSaveAll && (
                  <Button
                    variant="contained"
                    size={isMobile ? 'small' : 'medium'}
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    startIcon={!isMobile && <SaveIcon />}
                    sx={{
                      minWidth: isMobile ? 80 : 120,
                    }}
                  >
                    {isSaving ? 'Saving...' : isMobile ? 'Save' : 'Save All'}
                  </Button>
                )}
              </>
            )}
            
            {showPreview && onPreview && (
              <>
                {hasUnsavedChanges && (
                  <Divider orientation="vertical" sx={{ height: 24, mx: 0.5 }} />
                )}
                <Button
                  variant={hasUnsavedChanges ? 'text' : 'outlined'}
                  size={isMobile ? 'small' : 'medium'}
                  onClick={onPreview}
                  startIcon={<PreviewIcon />}
                  sx={{
                    color: hasUnsavedChanges ? 'text.secondary' : 'primary.main',
                  }}
                >
                  {isMobile ? 'Preview' : 'Customer View'}
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Progress Bar for Auto-save (optional) */}
        {hasUnsavedChanges && !isSaving && (
          <Box
            sx={{
              height: 2,
              backgroundColor: theme.palette.warning.main,
              opacity: 0.3,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 0.3 },
                '50%': { opacity: 0.6 },
                '100%': { opacity: 0.3 },
              },
            }}
          />
        )}
      </Paper>
    </Slide>
  );
};

export default FloatingActionBar;