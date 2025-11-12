import { api, apiService } from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '@constants/index';
import type { ApiResponse, AuthTokens, User, LoginCredentials, RegisterData, TwoFactorLoginResponse } from '@/types';

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      API_ENDPOINTS.AUTH_REGISTER,
      data
    );

    if (response.data.success && response.data.data) {
      const { user, tokens } = response.data.data;
      apiService.setTokens(tokens.accessToken, tokens.refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { user, tokens };
    }

    throw new Error(response.data.error?.message || 'Registration failed');
  },

  /**
   * Login user
   * Returns either user+tokens or requiresTwoFactor flag
   */
  async login(credentials: LoginCredentials): Promise<TwoFactorLoginResponse> {
    const response = await api.post<ApiResponse<TwoFactorLoginResponse>>(
      API_ENDPOINTS.AUTH_LOGIN,
      credentials
    );

    if (response.data.success && response.data.data) {
      const data = response.data.data;

      // Check if 2FA is required
      if (data.requiresTwoFactor && data.userId) {
        return { requiresTwoFactor: true, userId: data.userId };
      }

      // Normal login (no 2FA)
      if (data.user && data.tokens) {
        apiService.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
        return { user: data.user, tokens: data.tokens };
      }
    }

    throw new Error(response.data.error?.message || 'Login failed');
  },

  /**
   * Logout user
   */
  logout(): void {
    apiService.clearAuth();
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }
};
