/**
 * Custom hooks barrel export
 */

// Switch management hooks
export {
  useSwitches,
  useSwitch,
  useCreateSwitch,
  useUpdateSwitch,
  useDeleteSwitch,
  switchKeys
} from './useSwitches';

// Check-in hooks
export { useCheckIn, useCheckInHistory, checkInKeys } from './useCheckIn';

// Message management hooks
export {
  useMessages,
  useMessage,
  useCreateMessage,
  useUpdateMessage,
  useDeleteMessage,
  messageKeys
} from './useMessages';

// UI hooks
export { useConfirmDialog } from './useConfirmDialog';
export type { ConfirmDialogConfig } from './useConfirmDialog';
