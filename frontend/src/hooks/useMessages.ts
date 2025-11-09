import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messageService } from '@/services/message.service';
import type {
  Message,
  CreateMessageRequest,
  UpdateMessageRequest,
  PaginatedResponse,
} from '@/types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Query keys
export const messageKeys = {
  all: ['messages'] as const,
  lists: () => [...messageKeys.all, 'list'] as const,
  list: (switchId: string, page?: number) =>
    [...messageKeys.lists(), switchId, page] as const,
  details: () => [...messageKeys.all, 'detail'] as const,
  detail: (id: string) => [...messageKeys.details(), id] as const,
};

/**
 * Fetch messages for a specific switch with pagination
 */
export function useMessages(switchId: string, page: number = 1, limit: number = 10) {
  const { t } = useTranslation();

  return useQuery<PaginatedResponse<Message>>({
    queryKey: messageKeys.list(switchId, page),
    queryFn: () => messageService.getMessages(switchId, page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!switchId,
    meta: {
      errorMessage: t('messages.errors.fetchFailed'),
    },
  });
}

/**
 * Fetch a single message by ID
 */
export function useMessage(messageId: string) {
  const { t } = useTranslation();

  return useQuery<Message>({
    queryKey: messageKeys.detail(messageId),
    queryFn: () => messageService.getMessage(messageId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!messageId,
    meta: {
      errorMessage: t('messages.errors.fetchFailed'),
    },
  });
}

/**
 * Create a new message
 */
export function useCreateMessage(switchId: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMessageRequest) =>
      messageService.createMessage(switchId, data),
    onSuccess: (newMessage) => {
      // Invalidate ALL messages lists for this switch (all pages)
      queryClient.invalidateQueries({
        queryKey: messageKeys.lists(),
        predicate: (query) => {
          // Invalidate if query key contains this switchId
          return query.queryKey[2] === switchId;
        }
      });

      // Optionally add to cache
      queryClient.setQueryData(messageKeys.detail(newMessage.id), newMessage);

      toast.success(t('messages.success.created'));
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || t('messages.errors.createFailed');
      toast.error(errorMessage);
    },
  });
}

/**
 * Update an existing message
 */
export function useUpdateMessage(messageId: string, switchId: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMessageRequest) =>
      messageService.updateMessage(messageId, data),
    onSuccess: (updatedMessage) => {
      // Invalidate ALL messages lists for this switch (all pages)
      queryClient.invalidateQueries({
        queryKey: messageKeys.lists(),
        predicate: (query) => {
          return query.queryKey[2] === switchId;
        }
      });

      // Update the specific message in cache
      queryClient.setQueryData(messageKeys.detail(messageId), updatedMessage);

      toast.success(t('messages.success.updated'));
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || t('messages.errors.updateFailed');
      toast.error(errorMessage);
    },
  });
}

/**
 * Delete a message (soft delete)
 */
export function useDeleteMessage(switchId: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => messageService.deleteMessage(messageId),
    onSuccess: (_, messageId) => {
      // Invalidate ALL messages lists for this switch (all pages)
      queryClient.invalidateQueries({
        queryKey: messageKeys.lists(),
        predicate: (query) => {
          return query.queryKey[2] === switchId;
        }
      });

      // Remove from detail cache
      queryClient.removeQueries({ queryKey: messageKeys.detail(messageId) });

      toast.success(t('messages.success.deleted'));
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || t('messages.errors.deleteFailed');
      toast.error(errorMessage);
    },
  });
}
