import { useState, useCallback } from 'react';

interface UseModalResult<T = any> {
  visible: boolean;
  data: T | null;
  open: (data?: T) => void;
  close: () => void;
  toggle: () => void;
  setData: (data: T | null) => void;
}

export const useModal = <T = any>(initialVisible = false): UseModalResult<T> => {
  const [visible, setVisible] = useState(initialVisible);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((modalData?: T) => {
    if (modalData !== undefined) {
      setData(modalData);
    }
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    // Optionally clear data when closing
    // setData(null);
  }, []);

  const toggle = useCallback(() => {
    setVisible(prev => !prev);
  }, []);

  return {
    visible,
    data,
    open,
    close,
    toggle,
    setData,
  };
};

// Specialized hook for edit modals that commonly need an editing item
export const useEditModal = <T = any>() => {
  const modal = useModal<T>();
  
  const openCreate = useCallback(() => {
    modal.setData(null);
    modal.open();
  }, [modal]);

  const openEdit = useCallback((item: T) => {
    modal.open(item);
  }, [modal]);

  return {
    ...modal,
    openCreate,
    openEdit,
    isEditing: modal.data !== null,
  };
};