import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeContextProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // State to hold the current theme mode
  const [mode, setModeState] = useState<ThemeMode>(() => {
    // Get the initial mode from localStorage or default to 'dark'
    const storedMode = localStorage.getItem('themeMode') as ThemeMode | null;
    return storedMode || 'dark';
  });

  // Persist mode changes to localStorage and update CSS custom properties
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    
    // Remove all theme classes
    document.body.classList.remove('light-theme', 'dark-theme');
    
    // Add current theme class
    document.body.classList.add(`${mode}-theme`);
    
    // Set CSS custom properties based on theme
    const root = document.documentElement;
    
    if (mode === 'dark') {
      // Dark mode Florida theme CSS variables
      root.style.setProperty('--primary-color', '#48A999'); // Brighter teal
      root.style.setProperty('--secondary-color', '#FF7043'); // Coral orange
      root.style.setProperty('--background-color', '#0D1B2A'); // Deep navy
      root.style.setProperty('--surface-color', '#1B263B'); // Lighter navy
      root.style.setProperty('--text-primary', '#F5F5F5'); // Light text
      root.style.setProperty('--text-secondary', '#BDBDBD'); // Grey text
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.12)'); // Translucent white
      root.style.setProperty('--sidebar-background', '#1B263B');
      root.style.setProperty('--nav-item-default', 'rgba(72, 169, 153, 0.08)');
      root.style.setProperty('--nav-item-selected', 'rgba(72, 169, 153, 0.12)');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
    } else {
      // Light mode Florida theme CSS variables
      root.style.setProperty('--primary-color', '#00796B'); // Teal
      root.style.setProperty('--secondary-color', '#FF7043'); // Coral orange
      root.style.setProperty('--background-color', '#FDFCF7'); // Sandy off-white
      root.style.setProperty('--surface-color', '#FFFFFF'); // Pure white
      root.style.setProperty('--text-primary', '#212121'); // Charcoal
      root.style.setProperty('--text-secondary', '#616161'); // Grey
      root.style.setProperty('--border-color', '#E0E0E0'); // Light grey
      root.style.setProperty('--sidebar-background', '#FFFFFF');
      root.style.setProperty('--nav-item-default', 'rgba(0, 121, 107, 0.04)');
      root.style.setProperty('--nav-item-selected', 'rgba(0, 121, 107, 0.08)');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.05)');
    }
    
    // Update meta theme-color for mobile browsers (iOS Safari address bar/chrome)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const themeColor = mode === 'dark' ? '#000000' : '#F2F2F7';
      metaThemeColor.setAttribute('content', themeColor);
      console.log(`[ThemeContext] Updated theme-color meta tag to: ${themeColor}`);
    }
  }, [mode]);

  // Function to toggle between light and dark modes
  const toggleTheme = () => {
    setModeState((prevMode) => prevMode === 'light' ? 'dark' : 'light');
  };

  // Function to set a specific theme mode
  const setTheme = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  // Context value (React Compiler will automatically optimize this)
  const value = {
    mode,
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook to use the ThemeContext
export const useThemeMode = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeContextProvider');
  }
  return context;
};