import { createTheme, ThemeOptions, Theme } from '@mui/material/styles';

const getTheme = (mode: 'light' | 'dark'): Theme => {
  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#9c27b0',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: mode === 'light' ? '#bfbfbf #f5f5f5' : '#6b6b6b #2b2b2b',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              backgroundColor: mode === 'light' ? '#f5f5f5' : '#2b2b2b',
              width: 8,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: mode === 'light' ? '#bfbfbf' : '#6b6b6b',
            },
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};

export default getTheme;
