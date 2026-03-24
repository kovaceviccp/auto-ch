import { create } from "zustand";

export type NotifType = "offer" | "like" | "price_drop" | "accepted" | "declined" | "message";

export interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  listing_id?: number;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  add: (n: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  markAllRead: () => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  add: (n) => {
    const notification: AppNotification = {
      ...n,
      id: Math.random().toString(36).slice(2),
      timestamp: new Date(),
      read: false,
    };
    set((s) => ({
      notifications: [notification, ...s.notifications].slice(0, 30),
      unreadCount: s.unreadCount + 1,
    }));
  },
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  clear: () => set({ notifications: [], unreadCount: 0 }),
}));
