import { api } from './api';
import { API_ENDPOINTS } from '@constants/index';
import type {
  ApiResponse,
  Message,
  CreateMessageData,
  UpdateMessageData,
  PaginatedResponse,
  PaginationParams
} from '@/types';

export const messageService = {
  /**
   * Get all messages for a switch
   */
  async getMessages(
    switchId: string,
    params?: PaginationParams & { includeDeleted?: boolean }
  ): Promise<PaginatedResponse<Message>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Message>>>(
      API_ENDPOINTS.SWITCH_MESSAGES(switchId),
      { params }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to fetch messages');
  },

  /**
   * Get single message by ID
   */
  async getMessage(id: string): Promise<Message> {
    const response = await api.get<ApiResponse<Message>>(API_ENDPOINTS.MESSAGE_DETAIL(id));

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to fetch message');
  },

  /**
   * Create new message for a switch
   */
  async createMessage(switchId: string, data: CreateMessageData): Promise<Message> {
    const response = await api.post<ApiResponse<Message>>(
      API_ENDPOINTS.SWITCH_MESSAGES(switchId),
      data
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to create message');
  },

  /**
   * Update message (only if not sent)
   */
  async updateMessage(id: string, data: UpdateMessageData): Promise<Message> {
    const response = await api.put<ApiResponse<Message>>(API_ENDPOINTS.MESSAGE_DETAIL(id), data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.error?.message || 'Failed to update message');
  },

  /**
   * Delete message (soft delete, only if not sent)
   */
  async deleteMessage(id: string): Promise<void> {
    const response = await api.delete<ApiResponse>(API_ENDPOINTS.MESSAGE_DETAIL(id));

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to delete message');
    }
  }
};
