export interface BaseModalProps {
  visible: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export interface EditModalProps<T> extends BaseModalProps {
  item?: T;
  onDelete?: (id: string) => void;
}

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export interface AsyncModalState {
  saving: boolean;
  deleting: boolean;
  error: string | null;
}