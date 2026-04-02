import { create } from "zustand";

export type NotificationType = "success" | "error" | "info" | "achievement";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  icon?: string;
}

interface NotificationsStore {
  notifications: Notification[];
  add: (notification: Omit<Notification, "id">) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useNotificationsStore = create<NotificationsStore>()((set) => ({
  notifications: [],

  add: (notification) => {
    const id = crypto.randomUUID();
    const newNotification = { ...notification, id };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove after duration (default 4 seconds)
    const duration = notification.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }
  },

  remove: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clear: () => {
    set({ notifications: [] });
  },
}));

// Helper functions for common notification types
export const notify = {
  success: (title: string, message?: string) => {
    useNotificationsStore.getState().add({ type: "success", title, message });
  },
  error: (title: string, message?: string) => {
    useNotificationsStore.getState().add({ type: "error", title, message });
  },
  info: (title: string, message?: string) => {
    useNotificationsStore.getState().add({ type: "info", title, message });
  },
  achievement: (title: string, message?: string) => {
    useNotificationsStore
      .getState()
      .add({ type: "achievement", title, message, duration: 6000 });
  },
};
