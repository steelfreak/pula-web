import { create } from 'zustand';

const ONBOARDING_KEY = 'onboarding_completed';

interface OnboardingState {
  isOnboardingCompleted: boolean;
  isOnboardingVisible: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  setOnboardingVisible: (visible: boolean) => void;
  hydrate: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  isOnboardingCompleted: false,
  isOnboardingVisible: false,
  setOnboardingCompleted: (completed) => {
    set({ isOnboardingCompleted: completed });
    if (typeof window !== 'undefined') {
      if (completed) {
        localStorage.setItem(ONBOARDING_KEY, 'true');
      } else {
        localStorage.removeItem(ONBOARDING_KEY);
      }
    }
  },
  setOnboardingVisible: (visible) => {
    set({ isOnboardingVisible: visible });
  },
  hydrate: () => {
    if (typeof window !== 'undefined') {
      const onboardingCompleted = localStorage.getItem(ONBOARDING_KEY) === 'true';
      set({ isOnboardingCompleted: onboardingCompleted });
      if (!onboardingCompleted) {
        set({ isOnboardingVisible: true });
      }
    }
  },
}));
