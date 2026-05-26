import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface NotificationItem {
  id: string;
  type: "booking" | "message" | "general";
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  link: string;
  jobId?: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  activeChatRoomId: string | null; // currently open ChatBox roomId for silencing notifications
  isChatDrawerOpen: boolean;
  activeChatJobId: string | null; // targeted ChatBox roomId from notification click
  addNotification: (item: Omit<NotificationItem, "id" | "createdAt" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  setActiveChatRoomId: (id: string | null) => void;
  setChatDrawerOpen: (open: boolean) => void;
  setActiveChatJobId: (id: string | null) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      activeChatRoomId: null,
      isChatDrawerOpen: false,
      activeChatJobId: null,
      addNotification: (item) => set((state) => {
        const newItem: NotificationItem = {
          ...item,
          id: `${item.type}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          createdAt: new Date().toISOString(),
          read: false,
        };
        return {
          notifications: [newItem, ...state.notifications].slice(0, 30),
        };
      }),
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
      })),
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      })),
      clearNotifications: () => set({ notifications: [] }),
      setActiveChatRoomId: (id) => set({ activeChatRoomId: id }),
      setChatDrawerOpen: (open) => set({ isChatDrawerOpen: open }),
      setActiveChatJobId: (id) => set({ activeChatJobId: id }),
    }),
    {
      name: "fework-notifications",
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    }
  )
);
