import { useState, useCallback } from 'react';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void | Promise<void>;
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<ConfirmDialogConfig>({
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const openDialog = useCallback((dialogConfig: ConfirmDialogConfig) => {
    setConfig(dialogConfig);
    setIsOpen(true);
    setIsLoading(false);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setIsLoading(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    try {
      await config.onConfirm();
      closeDialog();
    } catch (error) {
      // Error handling is done in the onConfirm callback
      setIsLoading(false);
    }
  }, [config, closeDialog]);

  return {
    isOpen,
    isLoading,
    config,
    openDialog,
    closeDialog,
    handleConfirm,
  };
}
