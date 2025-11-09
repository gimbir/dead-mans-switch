import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { switchService } from '@/services/switch.service';
import type {
  CheckIn,
  PerformCheckInData,
  PaginatedResponse,
  PaginationParams,
  Switch
} from '@/types';
import toast from 'react-hot-toast';
import { switchKeys } from './useSwitches';

/**
 * Query keys for check-in related queries
 */
export const checkInKeys = {
  all: ['checkIns'] as const,
  histories: () => [...checkInKeys.all, 'history'] as const,
  history: (switchId: string, params?: PaginationParams) =>
    [...checkInKeys.histories(), switchId, params] as const
};

/**
 * Hook to fetch check-in history for a switch
 */
export const useCheckInHistory = (switchId: string, params?: PaginationParams) => {
  return useQuery<PaginatedResponse<CheckIn>, Error>({
    queryKey: checkInKeys.history(switchId, params),
    queryFn: () => switchService.getCheckInHistory(switchId, params),
    enabled: !!switchId,
    staleTime: 30000,
    retry: 2
  });
};

/**
 * Hook to perform a check-in with optimistic updates
 */
export const useCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CheckIn,
    Error,
    { switchId: string; data?: PerformCheckInData },
    { previousSwitch?: Switch }
  >({
    mutationFn: ({ switchId, data }) => switchService.performCheckIn(switchId, data),

    // Optimistic update - immediately update UI before server responds
    onMutate: async ({ switchId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: switchKeys.detail(switchId) });

      // Snapshot the previous value
      const previousSwitch = queryClient.getQueryData<Switch>(switchKeys.detail(switchId));

      // Optimistically update the switch's lastCheckInAt
      if (previousSwitch) {
        queryClient.setQueryData<Switch>(switchKeys.detail(switchId), {
          ...previousSwitch,
          lastCheckInAt: new Date().toISOString()
        });
      }

      // Return context with the previous value
      return { previousSwitch };
    },

    // If mutation fails, rollback to previous value
    onError: (error, { switchId }, context) => {
      if (context?.previousSwitch) {
        queryClient.setQueryData(switchKeys.detail(switchId), context.previousSwitch);
      }
      toast.error(error.message || 'Failed to perform check-in');
    },

    // Always refetch after error or success
    onSettled: (data, error, { switchId }) => {
      // Invalidate and refetch the switch detail
      queryClient.invalidateQueries({ queryKey: switchKeys.detail(switchId) });
      // Invalidate check-in history to show the new check-in
      queryClient.invalidateQueries({ queryKey: checkInKeys.histories() });
      // Invalidate switches list to update the lastCheckInAt in the list
      queryClient.invalidateQueries({ queryKey: switchKeys.lists() });
    },

    onSuccess: () => {
      toast.success('Check-in successful!');
    }
  });
};
