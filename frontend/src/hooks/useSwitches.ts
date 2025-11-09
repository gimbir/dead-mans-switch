import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { switchService } from '@/services/switch.service';
import type {
  Switch,
  CreateSwitchData,
  UpdateSwitchData,
  PaginatedResponse,
  PaginationParams
} from '@/types';
import toast from 'react-hot-toast';

/**
 * Query keys for switch-related queries
 */
export const switchKeys = {
  all: ['switches'] as const,
  lists: () => [...switchKeys.all, 'list'] as const,
  list: (params?: PaginationParams & { isActive?: boolean; includeDeleted?: boolean }) =>
    [...switchKeys.lists(), params] as const,
  details: () => [...switchKeys.all, 'detail'] as const,
  detail: (id: string) => [...switchKeys.details(), id] as const
};

/**
 * Hook to fetch all switches with pagination
 */
export const useSwitches = (
  params?: PaginationParams & { isActive?: boolean; includeDeleted?: boolean }
) => {
  return useQuery<PaginatedResponse<Switch>, Error>({
    queryKey: switchKeys.list(params),
    queryFn: () => switchService.getSwitches(params),
    staleTime: 30000, // 30 seconds
    retry: 2
  });
};

/**
 * Hook to fetch a single switch by ID
 */
export const useSwitch = (id: string) => {
  return useQuery<Switch, Error>({
    queryKey: switchKeys.detail(id),
    queryFn: () => switchService.getSwitch(id),
    enabled: !!id, // Only run query if id is provided
    staleTime: 30000,
    retry: 2
  });
};

/**
 * Hook to create a new switch
 */
export const useCreateSwitch = () => {
  const queryClient = useQueryClient();

  return useMutation<Switch, Error, CreateSwitchData>({
    mutationFn: (data) => switchService.createSwitch(data),
    onSuccess: (newSwitch) => {
      // Invalidate and refetch switches list
      queryClient.invalidateQueries({ queryKey: switchKeys.lists() });
      toast.success('Switch created successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create switch');
    }
  });
};

/**
 * Hook to update an existing switch
 */
export const useUpdateSwitch = () => {
  const queryClient = useQueryClient();

  return useMutation<Switch, Error, { id: string; data: UpdateSwitchData }>({
    mutationFn: ({ id, data }) => switchService.updateSwitch(id, data),
    onSuccess: (updatedSwitch) => {
      // Invalidate lists and update the specific switch detail
      queryClient.invalidateQueries({ queryKey: switchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: switchKeys.detail(updatedSwitch.id) });
      toast.success('Switch updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update switch');
    }
  });
};

/**
 * Hook to delete a switch
 */
export const useDeleteSwitch = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => switchService.deleteSwitch(id),
    onSuccess: (_, deletedId) => {
      // Invalidate lists and remove the specific switch from cache
      queryClient.invalidateQueries({ queryKey: switchKeys.lists() });
      queryClient.removeQueries({ queryKey: switchKeys.detail(deletedId) });
      toast.success('Switch deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete switch');
    }
  });
};
