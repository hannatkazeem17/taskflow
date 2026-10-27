import { create } from 'zustand';
import type { User } from '../api/types';
import { clearTokens, setTokens } from '../api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, tokens: { access_token: string; refresh_token: string; token_type: string }) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: (user, tokens) => {
    setTokens(tokens);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  setLoading: (loading) => set({ isLoading: loading }),
}));