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
  login: (credentials: LoginCredentials, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
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
          const { user } = await authService.login(credentials);
          set({ user, isAuthenticated: true, isLoading: false });
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
