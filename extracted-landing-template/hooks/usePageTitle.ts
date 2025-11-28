import { useEffect } from 'react';

/**
 * Custom hook to dynamically set page titles
 * @param title - The page title (without "| Jax Saver" suffix)
 * @param defaultTitle - Optional default title to use if no title provided
 */
export const usePageTitle = (title?: string, defaultTitle: string = 'Jax Saver') => {
  useEffect(() => {
    const fullTitle = title ? `${title} | Jax Saver` : defaultTitle;
    document.title = fullTitle;
    
    // Cleanup: reset to default title when component unmounts
    return () => {
      document.title = defaultTitle;
    };
  }, [title, defaultTitle]);
};

export default usePageTitle;