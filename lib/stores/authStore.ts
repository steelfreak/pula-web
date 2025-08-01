import { create } from 'zustand';

export const TOKEN_KEY = 'auth_token';

export interface AuthState {
  token: string | null;
  username: string;
  setToken: (token: string) => void;
  clearToken: () => void;
  hydrate: () => void;
  setUsername: (username: string) => void;
  hydrateUsername: () => void;
  clearUsername: () => void;
}

export const useAuthStore = create<AuthState>((set: any) => ({
  token: null,
  username: '', // Assuming you might want to store username as well
  setToken: (token: string) => {
    set({ token });
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  clearToken: () => {
    set({ token: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
  hydrate: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored) set({ token: stored });
    }
  },

  setUsername: (username: string) => set({ username }),

  hydrateUsername: () => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) set({ username: storedUsername });
    }
  },

  clearUsername: () => {
    set({ username: '' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('username');
    }
  },
})); 