import React, { createContext, useContext, ReactNode } from 'react';

interface ImageMigrationContextType {
  isMigrating: boolean;
}

const ImageMigrationContext = createContext<ImageMigrationContextType | undefined>(undefined);

export const ImageMigrationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ImageMigrationContext.Provider value={{ isMigrating: false }}>
      {children}
    </ImageMigrationContext.Provider>
  );
};

export const useImageMigration = (): ImageMigrationContextType => {
  const context = useContext(ImageMigrationContext);
  if (!context) {
    throw new Error('useImageMigration must be used within ImageMigrationProvider');
  }
  return context;
};
