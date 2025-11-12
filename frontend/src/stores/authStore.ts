import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '@services/auth.service';
import type { User, LoginCredentials, RegisterData } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;

  // Actions
  login: (credentials: LoginCredentials, rememberMe?: boolean) => Promise<{ requiresTwoFactor: boolean; userId?: string }>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setAuthenticatedUser: (user: User) => void;
  update2FAStatus: (enabled: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      rememberMe: false,

      login: async (credentials, rememberMe = false) => {
        set({ isLoading: true, error: null, rememberMe });
        try {
          const result = await authService.login(credentials);

          // Check if 2FA is required
          if (result.requiresTwoFactor && result.userId) {
            set({ isLoading: false });
            return { requiresTwoFactor: true, userId: result.userId };
          }

          // Normal login (no 2FA)
          if (result.user && result.tokens) {
            set({ user: result.user, isAuthenticated: true, isLoading: false });
            return { requiresTwoFactor: false };
          }

          throw new Error('Invalid login response');
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = await authService.register(data);
          set({ user, isAuthenticated: true, isLoading: false, rememberMe: true });
        } catch (error: any) {
          set({
            error: error.message || 'Registration failed',
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({ user: null, isAuthenticated: false, error: null, rememberMe: false });
      },

      clearError: () => set({ error: null }),

      setAuthenticatedUser: (user) => {
        set({ user, isAuthenticated: true, error: null });
      },

      update2FAStatus: (enabled) => {
        set((state) => ({
          user: state.user ? { ...state.user, twoFactorEnabled: enabled } : null,
        }));
      },
    }),
    {
      name: 'dms-auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
    }
  )
);
