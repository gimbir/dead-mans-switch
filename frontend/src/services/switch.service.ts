import { api } from './api';
import { API_ENDPOINTS } from '@constants/index';
import type {
  ApiResponse,
  Switch,
  CreateSwitchData,
  UpdateSwitchData,
  PaginatedResponse,
  PaginationParams,
  CheckIn,
  PerformCheckInData
} from '@/types';

export const switchService = {
  /**
   * Get all switches
   */
  async getSwitches(params?: PaginationParams & { isActive?: boolean; includeDeleted?: boolean }) {
    const response = await api.get<ApiResponse<PaginatedResponse<Switch>>>(API_ENDPOINTS.SWITCHES, {
      params
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to fetch switches');
  },

  /**
   * Get single switch by ID
   */
  async getSwitch(id: string): Promise<Switch> {
    const response = await api.get<ApiResponse<Switch>>(API_ENDPOINTS.SWITCH_DETAIL(id));

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to fetch switch');
  },

  /**
   * Create new switch
   */
  async createSwitch(data: CreateSwitchData): Promise<Switch> {
    const response = await api.post<ApiResponse<Switch>>(API_ENDPOINTS.SWITCHES, data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to create switch');
  },

  /**
   * Update switch
   */
  async updateSwitch(id: string, data: UpdateSwitchData): Promise<Switch> {
    const response = await api.put<ApiResponse<Switch>>(API_ENDPOINTS.SWITCH_DETAIL(id), data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to update switch');
  },

  /**
   * Delete switch
   */
  async deleteSwitch(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(API_ENDPOINTS.SWITCH_DETAIL(id));

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete switch');
    }
  },

  /**
   * Perform check-in
   */
  async performCheckIn(id: string, data?: PerformCheckInData): Promise<CheckIn> {
    // Always send at least an empty object to satisfy backend validation
    const response = await api.post<ApiResponse<CheckIn>>(
      API_ENDPOINTS.SWITCH_CHECKIN(id),
      data || {}
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to perform check-in');
  },

  /**
   * Get check-in history
   */
  async getCheckInHistory(
    id: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<CheckIn>> {
    const response = await api.get<ApiResponse<PaginatedResponse<CheckIn>>>(
      API_ENDPOINTS.SWITCH_CHECKINS(id),
      { params }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to fetch check-in history');
  }
};
