import React, { createContext, useState, useContext } from 'react';

// Onboarding status enum
export enum OnboardingStatus {
  PENDING = 'pending',
  PARTIALLY_COMPLETE = 'partially_complete',
  BASELINE_COMPLETE = 'baseline_complete',
  FULLY_COMPLETE = 'fully_complete',
  COMPLETED = 'completed',
}

// Define the context shape
interface OnboardingContextType {
  onboardingStatus: OnboardingStatus | null;
  setOnboardingStatus: (status: OnboardingStatus | null) => void;
  isOnboardingComplete: boolean;
  checkOnboardingStatus: () => Promise<void>;
  markOnboardingCompleted: (profile?: any) => void;
  businessProfile: any | null;
  createBusinessProfile?: (args: any) => Promise<any>;
}

// Create the context with a default value
const OnboardingContext = createContext<OnboardingContextType>({
  onboardingStatus: null,
  setOnboardingStatus: () => {},
  isOnboardingComplete: false,
  checkOnboardingStatus: async () => {},
  markOnboardingCompleted: () => {},
  businessProfile: null,
});

// Create a hook to use the onboarding context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

// Provider component - simplified stub version
// This is only used when Clerk is available, otherwise it's bypassed in App.tsx
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(false);
  const [businessProfile, setBusinessProfile] = useState<any | null>(null);

  const checkOnboardingStatus = async () => {
    // Stub - no-op without Clerk
    console.log('[OnboardingContext] Stub - checkOnboardingStatus called');
  };

  const markOnboardingCompleted = (profile?: any) => {
    console.log('[OnboardingContext] Stub - markOnboardingCompleted called', profile);
    setOnboardingStatus(OnboardingStatus.COMPLETED);
    setIsOnboardingComplete(true);
    if (profile) {
      setBusinessProfile(profile);
    }
  };

  const value = {
    onboardingStatus,
    setOnboardingStatus,
    isOnboardingComplete,
    checkOnboardingStatus,
    markOnboardingCompleted,
    businessProfile,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingContext;
