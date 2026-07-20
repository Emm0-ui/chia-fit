import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  INITIAL_ONBOARDING_DATA,
  type OnboardingData,
} from '@/types/onboarding';

type OnboardingContextValue = {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
  reset: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(INITIAL_ONBOARDING_DATA);

  const value = useMemo(
    () => ({
      data,
      updateData: (partial: Partial<OnboardingData>) => {
        setData((current) => ({ ...current, ...partial }));
      },
      reset: () => setData(INITIAL_ONBOARDING_DATA),
    }),
    [data]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding debe usarse dentro de OnboardingProvider');
  }
  return context;
}
