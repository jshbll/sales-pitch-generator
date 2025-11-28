import { useEffect } from 'react';

/**
 * Hook to set the page title
 */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | Sales Pitch Generator` : 'Sales Pitch Generator';

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

export default usePageTitle;
