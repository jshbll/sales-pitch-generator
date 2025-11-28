import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ExitConfirmationContextType {
  shouldConfirmExit: boolean;
  setShouldConfirmExit: (value: boolean) => void;
}

const ExitConfirmationContext = createContext<ExitConfirmationContextType | undefined>(undefined);

export const ExitConfirmationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [shouldConfirmExit, setShouldConfirmExit] = useState(false);

  return (
    <ExitConfirmationContext.Provider value={{ shouldConfirmExit, setShouldConfirmExit }}>
      {children}
    </ExitConfirmationContext.Provider>
  );
};

export const useExitConfirmation = (): ExitConfirmationContextType => {
  const context = useContext(ExitConfirmationContext);
  if (!context) {
    throw new Error('useExitConfirmation must be used within ExitConfirmationProvider');
  }
  return context;
};
