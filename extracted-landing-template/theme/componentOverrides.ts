import { Theme, alpha } from '@mui/material/styles';
import { CustomShadows } from './shadows';

export default function createComponentOverrides(theme: Theme, customShadows: CustomShadows) {
  const { palette } = theme;

  return {
    // Button overrides - Professional business app styling
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
          textTransform: 'none',
          fontSize: '0.875rem',
          padding: '8px 22px',
          minHeight: '36px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          color: '#fff',
          boxShadow: customShadows.z1,
          '&:hover': {
            boxShadow: customShadows.z8,
          },
          '&:active': {
            boxShadow: customShadows.z1,
          },
        },
        containedPrimary: {
          backgroundColor: palette.primary.main,
          '&:hover': {
            backgroundColor: palette.primary.dark,
            boxShadow: customShadows.primary,
          },
        },
        containedSecondary: {
          backgroundColor: palette.secondary.main,
          '&:hover': {
            backgroundColor: palette.secondary.dark,
            boxShadow: customShadows.secondary,
          },
        },
        outlined: {
          borderColor: palette.grey[300],
          color: palette.text.primary,
          '&:hover': {
            borderColor: palette.primary.main,
            backgroundColor: alpha(palette.primary.main, 0.04),
          },
        },
        text: {
          '&:hover': {
            backgroundColor: alpha(palette.primary.main, 0.04),
          },
        },
        sizeLarge: {
          padding: '12px 28px',
          fontSize: '1rem',
          minHeight: '44px',
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.8125rem',
          minHeight: '32px',
        },
      },
    },

    // Card overrides - Clean, modern cards
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: customShadows.card,
          border: `1px solid ${alpha(palette.divider, 0.08)}`,
          '&:hover': {
            boxShadow: customShadows.z8,
          },
          transition: 'all 0.2s ease-in-out',
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },

    // Input field overrides
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: palette.background.paper,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.grey[300],
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.grey[400],
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.primary.main,
            borderWidth: 2,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.error.main,
          },
        },
        input: {
          padding: '12px 14px',
          fontSize: '0.875rem',
        },
        inputMultiline: {
          padding: '12px 14px',
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 500,
          color: palette.text.secondary,
          '&.Mui-focused': {
            color: palette.primary.main,
          },
          '&.Mui-error': {
            color: palette.error.main,
          },
        },
        shrink: {
          fontSize: '0.75rem',
          fontWeight: 500,
        },
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          marginTop: '6px',
          marginLeft: 0,
        },
      },
    },

    // Paper overrides
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: customShadows.z1,
        },
        elevation2: {
          boxShadow: customShadows.z8,
        },
        elevation3: {
          boxShadow: customShadows.z12,
        },
        elevation4: {
          boxShadow: customShadows.z16,
        },
        elevation8: {
          boxShadow: customShadows.z20,
        },
        elevation12: {
          boxShadow: customShadows.z24,
        },
      },
    },

    // Dialog overrides
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: customShadows.dialog,
        },
      },
    },

    // Menu/Popover overrides
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          boxShadow: customShadows.dropdown,
          border: `1px solid ${alpha(palette.divider, 0.08)}`,
        },
      },
    },

    // Chip overrides
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          height: 28,
          fontSize: '0.75rem',
          fontWeight: 500,
        },
        filled: {
          backgroundColor: alpha(palette.primary.main, 0.08),
          color: palette.primary.main,
          '&:hover': {
            backgroundColor: alpha(palette.primary.main, 0.12),
          },
        },
        outlined: {
          borderColor: palette.grey[300],
          '&:hover': {
            borderColor: palette.primary.main,
            backgroundColor: alpha(palette.primary.main, 0.04),
          },
        },
      },
    },

    // Avatar overrides
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        colorDefault: {
          backgroundColor: palette.grey[100],
          color: palette.text.primary,
        },
      },
    },

    // Divider overrides
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: alpha(palette.divider, 0.08),
        },
      },
    },

    // Switch overrides
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 46,
          height: 24,
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 2,
            '&.Mui-checked': {
              transform: 'translateX(22px)',
              '& + .MuiSwitch-track': {
                backgroundColor: palette.primary.main,
                opacity: 1,
              },
            },
          },
          '& .MuiSwitch-thumb': {
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#fff',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.2)',
          },
          '& .MuiSwitch-track': {
            borderRadius: 12,
            backgroundColor: palette.grey[300],
            opacity: 1,
          },
        },
      },
    },

    // Tabs overrides
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTabs-indicator': {
            backgroundColor: palette.primary.main,
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          minHeight: 44,
          color: palette.text.secondary,
          '&.Mui-selected': {
            color: palette.primary.main,
          },
          '&:hover': {
            color: palette.primary.main,
            backgroundColor: alpha(palette.primary.main, 0.04),
          },
        },
      },
    },

    // Tooltip overrides
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: palette.grey[900],
          color: '#fff',
          fontSize: '0.75rem',
          borderRadius: 6,
          padding: '8px 12px',
          boxShadow: customShadows.z8,
        },
        arrow: {
          color: palette.grey[900],
        },
      },
    },

    // Table overrides
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: alpha(palette.divider, 0.08),
          fontSize: '0.875rem',
        },
        head: {
          fontWeight: 600,
          color: palette.text.primary,
          backgroundColor: alpha(palette.grey[50], 0.5),
        },
      },
    },

    // AppBar overrides for dashboard
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: customShadows.navigation,
          borderBottom: `1px solid ${alpha(palette.divider, 0.08)}`,
        },
      },
    },
  };
}