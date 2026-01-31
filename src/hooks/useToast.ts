'use client';

import { create } from 'zustand';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  toast: (options: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  toast: (options) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      duration: 5000, // default 5 seconds
      ...options,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto dismiss
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().dismiss(id);
      }, newToast.duration);
    }

    return id;
  },

  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  dismissAll: () => {
    set({ toasts: [] });
  },
}));

export interface UseToastReturn {
  toasts: Toast[];
  toast: (options: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export function useToast(): UseToastReturn {
  const toasts = useToastStore((state) => state.toasts);
  const toast = useToastStore((state) => state.toast);
  const dismiss = useToastStore((state) => state.dismiss);
  const dismissAll = useToastStore((state) => state.dismissAll);

  return {
    toasts,
    toast,
    dismiss,
    dismissAll,
  };
}
