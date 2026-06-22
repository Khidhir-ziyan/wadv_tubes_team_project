import { useState } from 'react';

export const useDeleteWithFeedback = () => {
  const [deleteState, setDeleteState] = useState<{
    isDeleting: boolean;
    error: string | null;
    showConfirmation: boolean;
    itemToDelete: { id: number; name: string } | null;
  }>({
    isDeleting: false,
    error: null,
    showConfirmation: false,
    itemToDelete: null
  });

  const initiateDelete = (id: number, name: string) => {
    setDeleteState({
      isDeleting: false,
      error: null,
      showConfirmation: true,
      itemToDelete: { id, name }
    });
  };

  const confirmDelete = () => {
    setDeleteState(prev => ({
      ...prev,
      showConfirmation: false,
      itemToDelete: null,
      error: null
    }));
  };

  const cancelDelete = () => {
    setDeleteState({
      isDeleting: false,
      error: null,
      showConfirmation: false,
      itemToDelete: null
    });
  };

  const setDeleting = (isDeleting: boolean) => {
    setDeleteState(prev => ({ ...prev, isDeleting }));
  };

  const setError = (error: string) => {
    setDeleteState(prev => ({ ...prev, error, isDeleting: false }));
  };

  return {
    deleteState,
    initiateDelete,
    confirmDelete,
    cancelDelete,
    setDeleting,
    setError
  };
};