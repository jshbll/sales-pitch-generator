import { createTheme } from '@mui/material/styles';

const jaxsaverLightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',      // Black
      light: '#333333',     // Lighter black (dark gray)
      dark: '#000000',      // Pure black
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF6B35',      // Orange for saved/bookmarks
      light: '#FF8C00',     // Darker orange
      dark: '#E55100',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#FF3B30',      // iOS red
      light: '#FF6961',
      dark: '#D70015',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FF9500',      // iOS orange
      light: '#FFB143',
      dark: '#E68900',
      contrastText: '#000000',
    },
    info: {
      main: '#5AC8FA',      // iOS blue
      light: '#70CEFA',
      dark: '#47B3E5',
      contrastText: '#000000',
    },
    success: {
      main: '#34C759',      // iOS green
      light: '#4DD964',
      dark: '#2DA14E',
      contrastText: '#000000',
    },
    background: {
      default: '#F2F2F7',   // Light gray background
      paper: '#FFFFFF',     // Pure white cards
    },
    text: {
      primary: '#000000',   // Pure black
      secondary: '#8E8E93', // System gray
      disabled: '#C6C6C8',
    },
    divider: '#C6C6C8',    // iOS-style borders
    grey: {
      50: '#F2F2F7',
      100: '#E5E5E7',
      200: '#C6C6C8',
      300: '#AEAEB2',
      400: '#8E8E93',       // System gray
      500: '#636366',       // System gray 2
      600: '#48484A',       // System gray 3
      700: '#3A3A3C',       // System gray 4
      800: '#2C2C2E',       // System gray 5
      900: '#1C1C1E',       // System gray 6
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Roboto', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
      letterSpacing: '0em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.75,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
      letterSpacing: '0.00714em',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '0.01071em',
    },
    button: {
      fontSize: '0.875rem',
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02857em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
      letterSpacing: '0.03333em',
    },
    overline: {
      fontSize: '0.75rem',
      lineHeight: 2.66,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 20px',
          transition: 'all 0.2s ease-in-out',
          fontWeight: 600,
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        sizeSmall: {
          padding: '8px 16px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '14px 28px',
          fontSize: '0.9375rem',
        },
        containedPrimary: {
          backgroundColor: '#000000',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#333333',
          },
        },
        containedSecondary: {
          backgroundColor: '#FF6B35',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#FF8C00',
          },
        },
        outlinedPrimary: {
          borderColor: '#000000',
          color: '#000000',
          borderWidth: 1.5,
          '&:hover': {
            borderColor: '#333333',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            borderWidth: 1.5,
          },
        },
        outlinedSecondary: {
          borderColor: '#FF6B35',
          color: '#FF6B35',
          borderWidth: 1.5,
          '&:hover': {
            borderColor: '#FF8C00',
            backgroundColor: 'rgba(255, 107, 53, 0.04)',
            borderWidth: 1.5,
          },
        },
        textPrimary: {
          color: '#000000',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
        textSecondary: {
          color: '#FF6B35',
          '&:hover': {
            backgroundColor: 'rgba(255, 107, 53, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#FFFFFF',
          transition: 'box-shadow 0.3s ease-in-out',
          '&.MuiPaper-elevation0': {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
          },
          '&.MuiPaper-elevation1': {
            boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.08)',
          },
          '&.MuiPaper-elevation2': {
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.10)',
          },
          '&.MuiPaper-elevation3': {
            boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.12)',
          },
          '&:hover': {
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.10)',
          },
        },
        outlined: {
          borderColor: '#C6C6C8',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          '&[role="listbox"], &[role="menu"], &.MuiMenu-paper, &.MuiAutocomplete-paper, &.MuiPopover-paper': {
            borderRadius: 12,
            marginTop: 4,
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
          },
          '&.MuiPaper-elevation0': {
            boxShadow: 'none',
          },
          '&.MuiPaper-elevation1': {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
          },
          '&.MuiPaper-elevation2': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
          },
          '&.MuiPaper-elevation3': {
            boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.10)',
          },
          '&.MuiPaper-elevation4': {
            boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.12)',
          },
        },
        outlined: {
          borderColor: '#C6C6C8',
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          '&.MuiAppBar-colorDefault': {
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            color: '#000000',
          },
          '&.MuiAppBar-colorPrimary': {
            backgroundColor: '#007AFF',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(60, 60, 67, 0.95)',
          color: '#FFFFFF',
          fontSize: '0.75rem',
          padding: '8px 12px',
          borderRadius: 8,
          backdropFilter: 'blur(10px)',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
        },
        arrow: {
          color: 'rgba(60, 60, 67, 0.95)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          height: 32,
          fontWeight: 500,
          '&.MuiChip-colorPrimary': {
            backgroundColor: 'rgba(0, 122, 255, 0.1)',
            color: '#007AFF',
            '&:hover': {
              backgroundColor: 'rgba(0, 122, 255, 0.2)',
            },
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
            color: '#FF6B35',
            '&:hover': {
              backgroundColor: 'rgba(255, 107, 53, 0.2)',
            },
          },
          '&.MuiChip-colorSuccess': {
            backgroundColor: 'rgba(52, 199, 89, 0.1)',
            color: '#34C759',
            '&:hover': {
              backgroundColor: 'rgba(52, 199, 89, 0.2)',
            },
          },
          '&.MuiChip-colorError': {
            backgroundColor: 'rgba(255, 59, 48, 0.1)',
            color: '#FF3B30',
            '&:hover': {
              backgroundColor: 'rgba(255, 59, 48, 0.2)',
            },
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: 'rgba(255, 149, 0, 0.1)',
            color: '#FF9500',
            '&:hover': {
              backgroundColor: 'rgba(255, 149, 0, 0.2)',
            },
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: 'rgba(90, 200, 250, 0.1)',
            color: '#5AC8FA',
            '&:hover': {
              backgroundColor: 'rgba(90, 200, 250, 0.2)',
            },
          },
        },
        outlined: {
          borderColor: '#C6C6C8',
        },
        deleteIcon: {
          fontSize: 18,
          '&:hover': {
            opacity: 0.8,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#C6C6C8',
              borderRadius: 12,
              borderWidth: 1,
            },
            '&:hover fieldset': {
              borderColor: '#8E8E93',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#007AFF',
              borderWidth: 2,
            },
            '&.Mui-error fieldset': {
              borderColor: '#FF3B30',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#8E8E93',
            '&.Mui-focused': {
              color: '#007AFF',
            },
            '&.Mui-error': {
              color: '#FF3B30',
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontSize: '0.875rem',
        },
        standardSuccess: {
          backgroundColor: 'rgba(52, 199, 89, 0.1)',
          color: '#2DA14E',
          '& .MuiAlert-icon': {
            color: '#34C759',
          },
        },
        standardError: {
          backgroundColor: 'rgba(255, 59, 48, 0.1)',
          color: '#D70015',
          '& .MuiAlert-icon': {
            color: '#FF3B30',
          },
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 149, 0, 0.1)',
          color: '#E68900',
          '& .MuiAlert-icon': {
            color: '#FF9500',
          },
        },
        standardInfo: {
          backgroundColor: 'rgba(90, 200, 250, 0.1)',
          color: '#47B3E5',
          '& .MuiAlert-icon': {
            color: '#5AC8FA',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#007AFF',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #C6C6C8',
        },
        head: {
          backgroundColor: '#F2F2F7',
          fontWeight: 600,
          color: '#000000',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#C6C6C8',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&:hover': {
            backgroundColor: 'rgba(0, 122, 255, 0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 122, 255, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(0, 122, 255, 0.12)',
            },
          },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(142, 142, 147, 0.12)',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#C6C6C8',
            borderRadius: 12,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#8E8E93',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#007AFF',
            borderWidth: 2,
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          marginTop: 4,
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          '& .MuiMenuItem-root': {
            padding: '12px 16px',
            borderRadius: 8,
            margin: '2px 8px',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(0, 122, 255, 0.08)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(0, 122, 255, 0.12)',
              color: '#007AFF',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(0, 122, 255, 0.16)',
              },
            },
            '&.Mui-disabled': {
              opacity: 0.5,
            },
          },
        },
        list: {
          padding: '8px',
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          marginTop: 4,
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        },
        option: {
          padding: '12px 16px',
          borderRadius: 8,
          margin: '2px 8px',
          fontSize: '0.875rem',
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          '&[aria-selected="true"]': {
            backgroundColor: 'rgba(0, 122, 255, 0.12)',
            color: '#007AFF',
            fontWeight: 600,
          },
          '&.Mui-focused': {
            backgroundColor: 'rgba(0, 122, 255, 0.08)',
          },
        },
        listbox: {
          padding: '8px',
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: '#8E8E93',
            fontWeight: 500,
            '&.Mui-focused': {
              color: '#007AFF',
              fontWeight: 600,
            },
          },
          '& .MuiFormHelperText-root': {
            marginTop: 8,
            fontSize: '0.75rem',
            color: '#8E8E93',
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 51,
          height: 31,
          padding: 0,
          marginRight: 12, // Add spacing between switch and label
          '& .MuiSwitch-switchBase': {
            padding: 2,
            '&.Mui-checked': {
              transform: 'translateX(20px)',
              color: '#FFFFFF',
              '& + .MuiSwitch-track': {
                backgroundColor: '#34C759',
                opacity: 1,
              },
            },
          },
          '& .MuiSwitch-thumb': {
            width: 27,
            height: 27,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          },
          '& .MuiSwitch-track': {
            borderRadius: 31 / 2,
            backgroundColor: '#C6C6C8',
            opacity: 1,
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          marginLeft: 0,
          marginRight: 0,
          '& .MuiSwitch-root': {
            marginRight: 12, // Ensure consistent spacing for switches
          },
          '& .MuiCheckbox-root': {
            marginRight: 8, // Also add spacing for checkboxes
          },
          '& .MuiRadio-root': {
            marginRight: 8, // And radio buttons
          },
        },
        label: {
          userSelect: 'none', // Prevent text selection on labels
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minHeight: 48,
          fontWeight: 500,
          fontSize: '0.9375rem',
          '&.Mui-selected': {
            fontWeight: 600,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0px 16px 48px rgba(0, 0, 0, 0.2)',
        },
      },
    },
  },
});

export default jaxsaverLightTheme;