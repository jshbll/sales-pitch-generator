import { createTheme } from '@mui/material/styles';

const floridaTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00796B',
      light: '#48A999',
      dark: '#004D40',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF7043',
      light: '#FFA270',
      dark: '#C63F17',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#D32F2F',
      light: '#EF5350',
      dark: '#C62828',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FFA000',
      light: '#FFB74D',
      dark: '#F57C00',
      contrastText: '#000000',
    },
    info: {
      main: '#1976D2',
      light: '#42A5F5',
      dark: '#1565C0',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FDFCF7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#616161',
      disabled: '#BDBDBD',
    },
    divider: '#E0E0E0',
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
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
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        sizeSmall: {
          padding: '6px 12px',
        },
        sizeLarge: {
          padding: '12px 24px',
        },
        containedPrimary: {
          backgroundColor: '#00796B',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#48A999',
          },
        },
        containedSecondary: {
          backgroundColor: '#FF7043',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#FFA270',
          },
        },
        outlinedPrimary: {
          borderColor: '#00796B',
          color: '#00796B',
          '&:hover': {
            borderColor: '#48A999',
            backgroundColor: 'rgba(0, 121, 107, 0.04)',
          },
        },
        outlinedSecondary: {
          borderColor: '#FF7043',
          color: '#FF7043',
          '&:hover': {
            borderColor: '#FFA270',
            backgroundColor: 'rgba(255, 112, 67, 0.04)',
          },
        },
        textPrimary: {
          color: '#00796B',
          '&:hover': {
            backgroundColor: 'rgba(0, 121, 107, 0.04)',
          },
        },
        textSecondary: {
          color: '#FF7043',
          '&:hover': {
            backgroundColor: 'rgba(255, 112, 67, 0.04)',
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
          borderRadius: 12,
          transition: 'box-shadow 0.3s ease-in-out',
          '&.MuiPaper-elevation0': {
            backgroundColor: '#FFFFFF',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          },
          '&.MuiPaper-elevation1': {
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          },
          '&.MuiPaper-elevation2': {
            boxShadow: '0px 6px 30px rgba(0, 0, 0, 0.08)',
          },
          '&.MuiPaper-elevation3': {
            boxShadow: '0px 8px 40px rgba(0, 0, 0, 0.10)',
          },
          '&:hover': {
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.08)',
          },
        },
        outlined: {
          borderColor: '#E0E0E0',
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
          // Apply shadows to ALL Paper components used in dropdowns
          '&[role="listbox"], &[role="menu"], &.MuiMenu-paper, &.MuiAutocomplete-paper, &.MuiPopover-paper': {
            borderRadius: 8,
            marginTop: 4,
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12), 0px 4px 12px rgba(0, 0, 0, 0.08) !important',
            border: '1px solid rgba(0, 0, 0, 0.08)',
          },
          '&.MuiPaper-elevation0': {
            boxShadow: 'none',
          },
          '&.MuiPaper-elevation1': {
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          },
          '&.MuiPaper-elevation2': {
            boxShadow: '0px 6px 30px rgba(0, 0, 0, 0.08)',
          },
          '&.MuiPaper-elevation3': {
            boxShadow: '0px 8px 40px rgba(0, 0, 0, 0.10)',
          },
          '&.MuiPaper-elevation4': {
            boxShadow: '0px 10px 50px rgba(0, 0, 0, 0.12)',
          },
        },
        outlined: {
          borderColor: '#E0E0E0',
        },
        rounded: {
          borderRadius: 8,
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
          borderBottom: '1px solid #E0E0E0',
          '&.MuiAppBar-colorDefault': {
            backgroundColor: '#FFFFFF',
            color: '#212121',
          },
          '&.MuiAppBar-colorPrimary': {
            backgroundColor: '#00796B',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#212121',
          color: '#FFFFFF',
          fontSize: '0.75rem',
          padding: '8px 12px',
          borderRadius: 4,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15), 0px 2px 6px rgba(0, 0, 0, 0.1)',
        },
        arrow: {
          color: '#212121',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          height: 32,
          '&.MuiChip-colorPrimary': {
            backgroundColor: 'rgba(0, 121, 107, 0.1)',
            color: '#004D40',
            '&:hover': {
              backgroundColor: 'rgba(0, 121, 107, 0.2)',
            },
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: 'rgba(255, 112, 67, 0.1)',
            color: '#C63F17',
            '&:hover': {
              backgroundColor: 'rgba(255, 112, 67, 0.2)',
            },
          },
          '&.MuiChip-colorSuccess': {
            backgroundColor: 'rgba(46, 125, 50, 0.1)',
            color: '#1B5E20',
            '&:hover': {
              backgroundColor: 'rgba(46, 125, 50, 0.2)',
            },
          },
          '&.MuiChip-colorError': {
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            color: '#C62828',
            '&:hover': {
              backgroundColor: 'rgba(211, 47, 47, 0.2)',
            },
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: 'rgba(255, 160, 0, 0.1)',
            color: '#F57C00',
            '&:hover': {
              backgroundColor: 'rgba(255, 160, 0, 0.2)',
            },
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            color: '#1565C0',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.2)',
            },
          },
        },
        outlined: {
          borderColor: '#E0E0E0',
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
              borderColor: '#E0E0E0',
              borderRadius: 8,
            },
            '&:hover fieldset': {
              borderColor: '#BDBDBD',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00796B',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardSuccess: {
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          color: '#1B5E20',
        },
        standardError: {
          backgroundColor: 'rgba(211, 47, 47, 0.1)',
          color: '#C62828',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 160, 0, 0.1)',
          color: '#F57C00',
        },
        standardInfo: {
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          color: '#1565C0',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#00796B',
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
          borderBottom: '1px solid #E0E0E0',
        },
        head: {
          backgroundColor: '#FDFCF7',
          fontWeight: 600,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#E0E0E0',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': {
            backgroundColor: 'rgba(0, 121, 107, 0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 121, 107, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(0, 121, 107, 0.12)',
            },
          },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E0E0E0',
            borderRadius: 8,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#BDBDBD',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#00796B',
            borderWidth: 2,
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          marginTop: 4,
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12), 0px 4px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          '& .MuiMenuItem-root': {
            padding: '12px 16px',
            borderRadius: 4,
            margin: '4px 8px',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(0, 121, 107, 0.08)',
              color: '#00796B',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(0, 121, 107, 0.12)',
              color: '#00796B',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(0, 121, 107, 0.16)',
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
          borderRadius: 8,
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12), 0px 4px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          marginTop: 4,
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12), 0px 4px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
        },
        option: {
          padding: '12px 16px',
          borderRadius: 4,
          margin: '4px 8px',
          fontSize: '0.875rem',
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          '&[aria-selected="true"]': {
            backgroundColor: 'rgba(0, 121, 107, 0.12)',
            color: '#00796B',
            fontWeight: 600,
          },
          '&.Mui-focused': {
            backgroundColor: 'rgba(0, 121, 107, 0.08)',
            color: '#00796B',
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
            color: '#616161',
            fontWeight: 500,
            '&.Mui-focused': {
              color: '#00796B',
              fontWeight: 600,
            },
          },
          '& .MuiFormHelperText-root': {
            marginTop: 8,
            fontSize: '0.75rem',
            color: '#757575',
          },
        },
      },
    },
    // Force shadows on ALL dropdown containers  
    MuiList: {
      styleOverrides: {
        root: {
          // Apply to any List component inside dropdowns
          '&[role="listbox"], &[role="menu"]': {
            borderRadius: 8,
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12), 0px 4px 12px rgba(0, 0, 0, 0.08) !important',
            border: '1px solid rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          marginRight: 12, // Add spacing between switch and label
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
    // Ensure DatePicker dropdowns also have shadows
    MuiPickersPopper: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12), 0px 4px 12px rgba(0, 0, 0, 0.08) !important',
          border: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

export default floridaTheme;