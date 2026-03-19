import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ThemeMode } from '../constants/theme';
import type { User } from '../types/api';

type AuthStore = {
  token: string | null;
  user: User | null;
  themeMode: ThemeMode;
  hasHydrated: boolean;
  setAuth: (payload: { token: string; user: User }) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setHasHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      themeMode: 'light',
      hasHydrated: false,
      setAuth: ({ token, user }) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'spendwise-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ token, user, themeMode }) => ({ token, user, themeMode }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

