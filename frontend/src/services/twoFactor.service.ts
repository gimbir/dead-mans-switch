import { api } from './api';
import { API_ENDPOINTS } from '@constants/index';
import type {
  ApiResponse,
  TwoFactorSetupData,
  Verify2FASetupRequest,
  Disable2FARequest,
  Verify2FALoginRequest,
  AuthTokens,
  User,
} from '@/types';

export const twoFactorService = {
  /**
   * Enable 2FA - Get QR code and backup codes
   * Requires authentication
   */
  async enable(): Promise<TwoFactorSetupData> {
    const response = await api.post<ApiResponse<TwoFactorSetupData>>(
      API_ENDPOINTS.TWO_FACTOR_ENABLE
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to enable 2FA');
  },

  /**
   * Verify and complete 2FA setup
   * Requires authentication
   */
  async verifySetup(data: Verify2FASetupRequest): Promise<{ success: boolean; message: string }> {
    const response = await api.post<ApiResponse<{ success: boolean; message: string }>>(
      API_ENDPOINTS.TWO_FACTOR_VERIFY,
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to verify 2FA');
  },

  /**
   * Disable 2FA
   * Requires authentication and password
   */
  async disable(data: Disable2FARequest): Promise<{ success: boolean; message: string }> {
    const response = await api.post<ApiResponse<{ success: boolean; message: string }>>(
      API_ENDPOINTS.TWO_FACTOR_DISABLE,
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to disable 2FA');
  },

  /**
   * Verify 2FA token during login
   * Public endpoint (no auth required)
   */
  async verifyLogin(data: Verify2FALoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await api.post<
      ApiResponse<{ accessToken: string; refreshToken: string; user: User }>
    >(API_ENDPOINTS.TWO_FACTOR_VERIFY_LOGIN, data);

    if (response.data.success && response.data.data) {
      // Map backend response to expected format
      const { accessToken, refreshToken, user } = response.data.data;
      return {
        user,
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    }

    throw new Error(response.data.error?.message || 'Invalid 2FA code');
  },
};
