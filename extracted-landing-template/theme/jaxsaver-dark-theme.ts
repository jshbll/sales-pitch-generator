import { createTheme } from '@mui/material/styles';

const jaxsaverDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFFFFF',      // White
      light: '#FFFFFF',     // White
      dark: '#E5E5E5',      // Slightly off-white
      contrastText: '#000000',
    },
    secondary: {
      main: '#FF6B35',      // Orange for saved/bookmarks
      light: '#FF8C00',     // Darker orange hover
      dark: '#E55100',
      contrastText: '#000000',
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
      dark: '#1DB584',      // Notification green
      contrastText: '#000000',
    },
    background: {
      default: '#1b1b1f',   // Dark background for pages
      paper: '#25252d',     // Sidebar and cards - lighter than page background
    },
    text: {
      primary: '#FFFFFF',   // Pure white
      secondary: '#8E8E93', // System gray (muted)
      disabled: '#636366',
    },
    divider: '#38383A',    // Dark mode borders
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
    action: {
      active: '#FFFFFF',
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.12)',
      disabled: 'rgba(255, 255, 255, 0.26)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
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
          backgroundColor: '#FFFFFF',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#E5E5E5',
          },
          '&:disabled': {
            backgroundColor: '#3A3A3C',
            color: '#636366',
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
          borderColor: '#FFFFFF',
          color: '#FFFFFF',
          borderWidth: 1.5,
          '&:hover': {
            borderColor: '#E5E5E5',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1.5,
          },
        },
        outlinedSecondary: {
          borderColor: '#FF6B35',
          color: '#FF6B35',
          borderWidth: 1.5,
          '&:hover': {
            borderColor: '#FF8C00',
            backgroundColor: 'rgba(255, 107, 53, 0.08)',
            borderWidth: 1.5,
          },
        },
        textPrimary: {
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
        textSecondary: {
          color: '#FF6B35',
          '&:hover': {
            backgroundColor: 'rgba(255, 107, 53, 0.08)',
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
          backgroundColor: '#1C1C1E',
          transition: 'all 0.3s ease-in-out',
          border: '1px solid #38383A',
          '&.MuiPaper-elevation0': {
            boxShadow: 'none',
          },
          '&.MuiPaper-elevation1': {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.4)',
          },
          '&.MuiPaper-elevation2': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)',
          },
          '&.MuiPaper-elevation3': {
            boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.6)',
          },
          '&:hover': {
            backgroundColor: '#2C2C2E',
            borderColor: '#48484A',
          },
        },
        outlined: {
          borderColor: '#38383A',
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
          backgroundColor: '#1C1C1E',
          '&[role="listbox"], &[role="menu"], &.MuiMenu-paper, &.MuiAutocomplete-paper, &.MuiPopover-paper': {
            backgroundColor: '#2C2C2E',
            borderRadius: 12,
            marginTop: 4,
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.8)',
            border: '1px solid #38383A',
          },
          '&.MuiPaper-elevation0': {
            boxShadow: 'none',
          },
          '&.MuiPaper-elevation1': {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.4)',
          },
          '&.MuiPaper-elevation2': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)',
          },
          '&.MuiPaper-elevation3': {
            boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.6)',
          },
          '&.MuiPaper-elevation4': {
            boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.7)',
          },
        },
        outlined: {
          borderColor: '#38383A',
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(28, 28, 30, 0.85)',
          '&.MuiAppBar-colorDefault': {
            backgroundColor: 'rgba(28, 28, 30, 0.85)',
            color: '#FFFFFF',
          },
          '&.MuiAppBar-colorPrimary': {
            backgroundColor: '#F6D05E',
            color: '#000000',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          color: '#000000',
          fontSize: '0.75rem',
          padding: '8px 12px',
          borderRadius: 8,
          backdropFilter: 'blur(10px)',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.4)',
        },
        arrow: {
          color: 'rgba(255, 255, 255, 0.95)',
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
            backgroundColor: 'rgba(246, 208, 94, 0.2)',
            color: '#F6D05E',
            '&:hover': {
              backgroundColor: 'rgba(246, 208, 94, 0.3)',
            },
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: 'rgba(255, 107, 53, 0.2)',
            color: '#FF6B35',
            '&:hover': {
              backgroundColor: 'rgba(255, 107, 53, 0.3)',
            },
          },
          '&.MuiChip-colorSuccess': {
            backgroundColor: 'rgba(52, 199, 89, 0.2)',
            color: '#34C759',
            '&:hover': {
              backgroundColor: 'rgba(52, 199, 89, 0.3)',
            },
          },
          '&.MuiChip-colorError': {
            backgroundColor: 'rgba(255, 59, 48, 0.2)',
            color: '#FF3B30',
            '&:hover': {
              backgroundColor: 'rgba(255, 59, 48, 0.3)',
            },
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: 'rgba(255, 149, 0, 0.2)',
            color: '#FF9500',
            '&:hover': {
              backgroundColor: 'rgba(255, 149, 0, 0.3)',
            },
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: 'rgba(90, 200, 250, 0.2)',
            color: '#5AC8FA',
            '&:hover': {
              backgroundColor: 'rgba(90, 200, 250, 0.3)',
            },
          },
        },
        outlined: {
          borderColor: '#38383A',
        },
        deleteIcon: {
          fontSize: 18,
          color: '#8E8E93',
          '&:hover': {
            color: '#FFFFFF',
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
            backgroundColor: '#1C1C1E',
            '& fieldset': {
              borderColor: '#38383A',
              borderRadius: 12,
              borderWidth: 1,
            },
            '&:hover fieldset': {
              borderColor: '#48484A',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#F6D05E',
              borderWidth: 2,
            },
            '&.Mui-error fieldset': {
              borderColor: '#FF3B30',
            },
            '& input': {
              color: '#FFFFFF',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#8E8E93',
            '&.Mui-focused': {
              color: '#F6D05E',
            },
            '&.Mui-error': {
              color: '#FF3B30',
            },
          },
          '& .MuiFormHelperText-root': {
            color: '#8E8E93',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontSize: '0.875rem',
          backgroundColor: '#1C1C1E',
          border: '1px solid',
        },
        standardSuccess: {
          borderColor: 'rgba(52, 199, 89, 0.3)',
          color: '#34C759',
          '& .MuiAlert-icon': {
            color: '#34C759',
          },
        },
        standardError: {
          borderColor: 'rgba(255, 59, 48, 0.3)',
          color: '#FF3B30',
          '& .MuiAlert-icon': {
            color: '#FF3B30',
          },
        },
        standardWarning: {
          borderColor: 'rgba(255, 149, 0, 0.3)',
          color: '#FF9500',
          '& .MuiAlert-icon': {
            color: '#FF9500',
          },
        },
        standardInfo: {
          borderColor: 'rgba(90, 200, 250, 0.3)',
          color: '#5AC8FA',
          '& .MuiAlert-icon': {
            color: '#5AC8FA',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#F6D05E',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
            color: '#F6DC8F',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #38383A',
          color: '#FFFFFF',
        },
        head: {
          backgroundColor: '#2C2C2E',
          fontWeight: 600,
          color: '#FFFFFF',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#38383A',
          '&.MuiDivider-light': {
            borderColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&:hover': {
            backgroundColor: 'rgba(246, 208, 94, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(246, 208, 94, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(246, 208, 94, 0.16)',
            },
          },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          '&::after': {
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#38383A',
            borderRadius: 12,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#48484A',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#F6D05E',
            borderWidth: 2,
          },
          '& .MuiSelect-icon': {
            color: '#8E8E93',
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2C2C2E',
          borderRadius: 12,
          marginTop: 4,
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.8)',
          border: '1px solid #38383A',
          '& .MuiMenuItem-root': {
            padding: '12px 16px',
            borderRadius: 8,
            margin: '2px 8px',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all 0.2s ease-in-out',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: 'rgba(246, 208, 94, 0.12)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(246, 208, 94, 0.16)',
              color: '#F6D05E',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(246, 208, 94, 0.20)',
              },
            },
            '&.Mui-disabled': {
              opacity: 0.5,
              color: '#636366',
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
          backgroundColor: '#2C2C2E',
          borderRadius: 12,
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.8)',
          border: '1px solid #38383A',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2C2C2E',
          borderRadius: 12,
          marginTop: 4,
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.8)',
          border: '1px solid #38383A',
        },
        option: {
          padding: '12px 16px',
          borderRadius: 8,
          margin: '2px 8px',
          fontSize: '0.875rem',
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          color: '#FFFFFF',
          '&[aria-selected="true"]': {
            backgroundColor: 'rgba(246, 208, 94, 0.16)',
            color: '#F6D05E',
            fontWeight: 600,
          },
          '&.Mui-focused': {
            backgroundColor: 'rgba(246, 208, 94, 0.12)',
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
              color: '#F6D05E',
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
                border: 0,
              },
            },
          },
          '& .MuiSwitch-thumb': {
            width: 27,
            height: 27,
            boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
          },
          '& .MuiSwitch-track': {
            borderRadius: 31 / 2,
            backgroundColor: '#48484A',
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
          color: '#8E8E93',
          '&.Mui-selected': {
            fontWeight: 600,
            color: '#F6D05E',
          },
          '&:hover': {
            color: '#FFFFFF',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #38383A',
        },
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          backgroundColor: '#F6D05E',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1C1C1E',
          borderRadius: 16,
          boxShadow: '0px 16px 48px rgba(0, 0, 0, 0.8)',
          border: '1px solid #38383A',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
        },
      },
    },
    MuiDialogContentText: {
      styleOverrides: {
        root: {
          color: '#8E8E93',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#48484A',
          '&.Mui-checked': {
            color: '#F6D05E',
          },
          '&:hover': {
            backgroundColor: 'rgba(246, 208, 94, 0.08)',
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#48484A',
          '&.Mui-checked': {
            color: '#F6D05E',
          },
          '&:hover': {
            backgroundColor: 'rgba(246, 208, 94, 0.08)',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
          '&.Mui-disabled': {
            color: '#636366',
          },
        },
        input: {
          '&::placeholder': {
            color: '#8E8E93',
            opacity: 1,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#38383A',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#48484A',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#F6D05E',
          },
        },
      },
    },
  },
});

export default jaxsaverDarkTheme;