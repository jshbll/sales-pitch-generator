import { createTheme, alpha } from '@mui/material/styles';

const floridaDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#48A999',
      light: '#76D9C9',
      dark: '#00796B',
      contrastText: '#000000',
    },
    secondary: {
      main: '#FF7043',
      light: '#FFA270',
      dark: '#C63F17',
      contrastText: '#000000',
    },
    error: {
      main: '#EF5350',
      light: '#FF867C',
      dark: '#E53935',
      contrastText: '#000000',
    },
    warning: {
      main: '#FFB74D',
      light: '#FFD54F',
      dark: '#FF8A65',
      contrastText: '#000000',
    },
    info: {
      main: '#42A5F5',
      light: '#64B5F6',
      dark: '#2196F3',
      contrastText: '#000000',
    },
    success: {
      main: '#66BB6A',
      light: '#81C784',
      dark: '#4CAF50',
      contrastText: '#000000',
    },
    background: {
      default: '#0D1B2A',
      paper: '#1B263B',
    },
    text: {
      primary: '#F5F5F5',
      secondary: '#BDBDBD',
      disabled: '#757575',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
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
          backgroundColor: '#48A999',
          color: '#000000',
          '&:hover': {
            backgroundColor: alpha('#48A999', 0.9),
            boxShadow: '0 0 20px rgba(72, 169, 153, 0.4)',
          },
        },
        containedSecondary: {
          backgroundColor: '#FF7043',
          color: '#000000',
          '&:hover': {
            backgroundColor: alpha('#FF7043', 0.9),
            boxShadow: '0 0 20px rgba(255, 112, 67, 0.4)',
          },
        },
        outlinedPrimary: {
          borderColor: '#48A999',
          color: '#48A999',
          '&:hover': {
            borderColor: '#76D9C9',
            backgroundColor: 'rgba(72, 169, 153, 0.08)',
          },
        },
        outlinedSecondary: {
          borderColor: '#FF7043',
          color: '#FF7043',
          '&:hover': {
            borderColor: '#FFA270',
            backgroundColor: 'rgba(255, 112, 67, 0.08)',
          },
        },
        textPrimary: {
          color: '#48A999',
          '&:hover': {
            backgroundColor: 'rgba(72, 169, 153, 0.08)',
          },
        },
        textSecondary: {
          color: '#FF7043',
          '&:hover': {
            backgroundColor: 'rgba(255, 112, 67, 0.08)',
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
          backgroundColor: '#1B263B',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(72, 169, 153, 0.15)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.12)',
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
          backgroundColor: '#1B263B',
          // Apply shadows to ALL Paper components used in dropdowns
          '&[role="listbox"], &[role="menu"], &.MuiMenu-paper, &.MuiAutocomplete-paper, &.MuiPopover-paper': {
            borderRadius: 8,
            marginTop: 4,
            backgroundColor: '#2D2D2D',
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.4), 0px 4px 12px rgba(0, 0, 0, 0.3) !important',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.12)',
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          backgroundColor: '#1B263B',
          color: '#F5F5F5',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#E0E0E0',
          color: '#212121',
          fontSize: '0.75rem',
          padding: '8px 12px',
          borderRadius: 4,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.25), 0px 2px 6px rgba(0, 0, 0, 0.15)',
        },
        arrow: {
          color: '#E0E0E0',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          height: 32,
          '&.MuiChip-colorPrimary': {
            backgroundColor: 'rgba(72, 169, 153, 0.15)',
            color: '#48A999',
            '&:hover': {
              backgroundColor: 'rgba(72, 169, 153, 0.25)',
            },
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: 'rgba(255, 112, 67, 0.15)',
            color: '#FF7043',
            '&:hover': {
              backgroundColor: 'rgba(255, 112, 67, 0.25)',
            },
          },
          '&.MuiChip-colorSuccess': {
            backgroundColor: 'rgba(102, 187, 106, 0.15)',
            color: '#66BB6A',
            '&:hover': {
              backgroundColor: 'rgba(102, 187, 106, 0.25)',
            },
          },
          '&.MuiChip-colorError': {
            backgroundColor: 'rgba(239, 83, 80, 0.15)',
            color: '#EF5350',
            '&:hover': {
              backgroundColor: 'rgba(239, 83, 80, 0.25)',
            },
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: 'rgba(255, 183, 77, 0.15)',
            color: '#FFB74D',
            '&:hover': {
              backgroundColor: 'rgba(255, 183, 77, 0.25)',
            },
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: 'rgba(66, 165, 245, 0.15)',
            color: '#42A5F5',
            '&:hover': {
              backgroundColor: 'rgba(66, 165, 245, 0.25)',
            },
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.23)',
        },
        deleteIcon: {
          fontSize: 18,
          color: 'rgba(255, 255, 255, 0.7)',
          '&:hover': {
            color: 'rgba(255, 255, 255, 0.9)',
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
              borderColor: 'rgba(255, 255, 255, 0.23)',
              borderRadius: 8,
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#48A999',
              borderWidth: 2,
            },
          },
          '& .MuiInputBase-input': {
            color: '#F5F5F5',
          },
          '& .MuiInputLabel-root': {
            color: '#BDBDBD',
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
          backgroundColor: 'rgba(102, 187, 106, 0.15)',
          color: '#66BB6A',
        },
        standardError: {
          backgroundColor: 'rgba(239, 83, 80, 0.15)',
          color: '#EF5350',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 183, 77, 0.15)',
          color: '#FFB74D',
        },
        standardInfo: {
          backgroundColor: 'rgba(66, 165, 245, 0.15)',
          color: '#42A5F5',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#48A999',
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
        head: {
          backgroundColor: '#0D1B2A',
          fontWeight: 600,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': {
            backgroundColor: 'rgba(72, 169, 153, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(72, 169, 153, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(72, 169, 153, 0.16)',
            },
          },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.11)',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0D1B2A',
          color: '#F5F5F5',
          scrollbarColor: 'rgba(255, 255, 255, 0.3) #1B263B',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#1B263B',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.4)',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.23)',
            borderRadius: 8,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.4)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#48A999',
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
          backgroundColor: '#2D2D2D',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.4), 0px 4px 12px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          '& .MuiMenuItem-root': {
            padding: '12px 16px',
            borderRadius: 4,
            margin: '4px 8px',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#E0E0E0',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(72, 169, 153, 0.15)',
              color: '#48A999',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(72, 169, 153, 0.25)',
              color: '#48A999',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(72, 169, 153, 0.35)',
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
          backgroundColor: '#2D2D2D',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.4), 0px 4px 12px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          marginTop: 4,
          backgroundColor: '#2D2D2D',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.4), 0px 4px 12px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
        option: {
          padding: '12px 16px',
          borderRadius: 4,
          margin: '4px 8px',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#E0E0E0',
          transition: 'all 0.2s ease-in-out',
          '&[aria-selected="true"]': {
            backgroundColor: 'rgba(72, 169, 153, 0.25)',
            color: '#48A999',
            fontWeight: 600,
          },
          '&.Mui-focused': {
            backgroundColor: 'rgba(72, 169, 153, 0.15)',
            color: '#48A999',
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
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 500,
            '&.Mui-focused': {
              color: '#48A999',
              fontWeight: 600,
            },
          },
          '& .MuiFormHelperText-root': {
            marginTop: 8,
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.6)',
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
            backgroundColor: '#2D2D2D',
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.4), 0px 4px 12px rgba(0, 0, 0, 0.3) !important',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          },
        },
      },
    },
    // Ensure DatePicker dropdowns also have shadows
    MuiPickersPopper: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          backgroundColor: '#2D2D2D',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.4), 0px 4px 12px rgba(0, 0, 0, 0.3) !important',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
  },
});

export default floridaDarkTheme;