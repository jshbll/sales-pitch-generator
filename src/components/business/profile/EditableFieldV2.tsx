import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fade,
  Grow,
  ClickAwayListener,
  alpha,
  useTheme,
  Tooltip,
  Paper,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  AutoAwesome as SparkleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface EditableFieldV2Props {
  label: string;
  value: any;
  onSave: (value: any) => Promise<boolean> | boolean;
  validation?: (value: any) => string | null;
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'select';
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  formatDisplay?: (value: any) => string;
  formatInput?: (value: string) => string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  autoSave?: boolean;
  sx?: any;
}

const EditableFieldV2: React.FC<EditableFieldV2Props> = ({
  label,
  value,
  onSave,
  validation,
  type = 'text',
  multiline = false,
  rows = 1,
  placeholder,
  helperText,
  disabled = false,
  required = false,
  options = [],
  formatDisplay,
  formatInput,
  startAdornment,
  endAdornment,
  autoSave = true,
  sx = {},
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Only call select() for text inputs (not select dropdowns)
      if (type !== 'select' && inputRef.current.select) {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const handleEdit = () => {
    if (!disabled) {
      setIsEditing(true);
      setError(null);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  };

  const handleClickAway = () => {
    // Don't close on click away for select fields - let them handle their own closing
    if (type === 'select') {
      return;
    }
    if (autoSave) {
      handleSave();
    } else {
      handleCancel();
    }
  };

  const handleSave = async () => {
    if (validation) {
      const validationError = validation(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await onSave(editValue);
      if (result) {
        setIsEditing(false);
        setShowSavedIndicator(true);
        setTimeout(() => setShowSavedIndicator(false), 2000);
      } else {
        setError('Failed to save');
      }
    } catch (err) {
      setError('Error saving changes');
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = formatInput ? formatInput(e.target.value) : e.target.value;
    setEditValue(newValue);
    
    if (autoSave && !validation) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayValue = formatDisplay ? formatDisplay(value) : value;

  // Enhanced non-editing view with better visual design
  if (!isEditing) {
    return (
      <Paper
        elevation={isHovered ? 2 : 0}
        onClick={handleEdit}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          position: 'relative',
          cursor: disabled ? 'default' : 'pointer',
          p: 2,
          borderRadius: 2,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: isHovered 
            ? alpha(theme.palette.primary.main, 0.04)
            : 'background.paper',
          border: `1px solid ${
            isHovered 
              ? alpha(theme.palette.primary.main, 0.2)
              : 'transparent'
          }`,
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.9)} 0%, 
            ${alpha(theme.palette.background.paper, 1)} 100%)`,
          '&:hover': disabled ? {} : {
            transform: 'translateY(-1px)',
            '& .edit-indicator': {
              opacity: 1,
              transform: 'scale(1)',
            },
            '& .field-label': {
              color: theme.palette.primary.main,
            },
          },
          ...sx,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            {/* Enhanced Label */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography
                className="field-label"
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'color 0.2s',
                }}
              >
                {label}
              </Typography>
              {required && (
                <Chip
                  label="Required"
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: '0.65rem',
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                    '& .MuiChip-label': {
                      px: 0.5,
                    },
                  }}
                />
              )}
            </Box>

            {/* Enhanced Value Display */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {startAdornment && (
                <Box sx={{ 
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {startAdornment}
                </Box>
              )}
              <Typography
                variant="body1"
                sx={{
                  color: value ? 'text.primary' : 'text.secondary',
                  fontStyle: !value ? 'italic' : 'normal',
                  fontWeight: value ? 500 : 400,
                  wordBreak: 'break-word',
                  lineHeight: 1.6,
                }}
              >
                {displayValue || placeholder || 'Click to add'}
              </Typography>
              {endAdornment}
            </Box>

            {/* Helper Text */}
            {helperText && !value && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  display: 'block',
                  mt: 0.5,
                  opacity: 0.7,
                }}
              >
                {helperText}
              </Typography>
            )}
          </Box>
          
          {/* Enhanced Edit Indicator */}
          {!disabled && (
            <Box
              className="edit-indicator"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                opacity: showSavedIndicator ? 1 : 0,
                transform: showSavedIndicator ? 'scale(1)' : 'scale(0.8)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {showSavedIndicator ? (
                <Grow in={showSavedIndicator}>
                  <CheckIcon
                    sx={{
                      fontSize: 18,
                      color: 'success.main',
                    }}
                  />
                </Grow>
              ) : (
                <EditIcon
                  sx={{
                    fontSize: 16,
                    color: theme.palette.primary.main,
                  }}
                />
              )}
            </Box>
          )}
        </Box>

        {/* Visual Indicator Bar */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            backgroundColor: required && !value
              ? theme.palette.warning.main
              : theme.palette.primary.main,
            borderRadius: '3px 0 0 3px',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />
      </Paper>
    );
  }

  // Enhanced editing view
  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Paper
        elevation={4}
        sx={{
          position: 'relative',
          p: 2,
          borderRadius: 2,
          border: `2px solid ${theme.palette.primary.main}`,
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': {
              boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.4)}`,
            },
            '70%': {
              boxShadow: `0 0 0 6px ${alpha(theme.palette.primary.main, 0)}`,
            },
            '100%': {
              boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}`,
            },
          },
          ...sx,
        }}
      >
        {type === 'select' ? (
          <FormControl fullWidth size="small" error={!!error}>
            <InputLabel>{label}</InputLabel>
            <Select
              ref={inputRef as any}
              value={editValue}
              onChange={async (e) => {
                const newValue = e.target.value;
                setEditValue(newValue);
                // Save immediately when selection is made
                if (validation) {
                  const validationError = validation(newValue);
                  if (validationError) {
                    setError(validationError);
                    return;
                  }
                }
                
                setIsSaving(true);
                setError(null);

                try {
                  const result = await onSave(newValue);
                  if (result) {
                    setIsEditing(false);
                    setShowSavedIndicator(true);
                    setTimeout(() => setShowSavedIndicator(false), 2000);
                  } else {
                    setError('Failed to save');
                  }
                } catch (err) {
                  setError('Error saving changes');
                  console.error('Save error:', err);
                } finally {
                  setIsSaving(false);
                }
              }}
              onClose={() => {
                // Close edit mode when dropdown is closed without selection
                if (editValue === value) {
                  setIsEditing(false);
                }
              }}
              onKeyDown={handleKeyDown}
              label={label}
              disabled={isSaving}
              MenuProps={{
                // Keep menu within viewport
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'left',
                },
              }}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            ref={inputRef}
            label={label}
            value={editValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            fullWidth
            multiline={multiline}
            rows={rows}
            type={type}
            error={!!error}
            helperText={error || helperText}
            disabled={isSaving}
            size="small"
            InputProps={{
              startAdornment,
              endAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {isSaving ? (
                    <CircularProgress size={16} />
                  ) : (
                    <>
                      <Tooltip title="Save (Enter)">
                        <IconButton
                          size="small"
                          onClick={handleSave}
                          sx={{
                            color: 'success.main',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.success.main, 0.1),
                            },
                          }}
                        >
                          <SaveIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel (Esc)">
                        <IconButton
                          size="small"
                          onClick={handleCancel}
                          sx={{
                            color: 'error.main',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.1),
                            },
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  {endAdornment}
                </Box>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
              },
            }}
          />
        )}

        {/* Sparkle Animation for Active Editing */}
        <SparkleIcon
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            fontSize: 20,
            color: theme.palette.warning.main,
            animation: 'sparkle 1s ease-in-out infinite',
            '@keyframes sparkle': {
              '0%, 100%': {
                opacity: 0.5,
                transform: 'rotate(0deg) scale(1)',
              },
              '50%': {
                opacity: 1,
                transform: 'rotate(180deg) scale(1.2)',
              },
            },
          }}
        />
      </Paper>
    </ClickAwayListener>
  );
};

export default EditableFieldV2;